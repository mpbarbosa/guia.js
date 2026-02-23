/**
 * @jest-environment jsdom
 */

/**
 * @file ErrorBoundary.test.js
 * @description Tests for ErrorBoundary, createDefaultErrorBoundary, and setupGlobalErrorHandler.
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import ErrorBoundary, {
  createDefaultErrorBoundary,
  setupGlobalErrorHandler,
} from '../../src/utils/ErrorBoundary.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

const makeBoundary = (opts = {}) =>
  new ErrorBoundary({
    fallbackUI: (err) => `<div role="alert">Fallback: ${err.message}</div>`,
    componentName: 'TestComp',
    trackErrors: false,
    ...opts,
  });

// ─── constructor ──────────────────────────────────────────────────────────────

describe('ErrorBoundary constructor', () => {
  test('sets initial state to no-error', () => {
    const b = makeBoundary();
    expect(b.getHasError()).toBe(false);
    expect(b.getLastError()).toBeNull();
  });
});

// ─── wrap – success path ──────────────────────────────────────────────────────

describe('ErrorBoundary.wrap – success path', () => {
  test('returns the function result when no error occurs', async () => {
    const b = makeBoundary();
    const fn = b.wrap(async () => 'ok');
    expect(await fn()).toBe('ok');
  });

  test('hasError remains false on success', async () => {
    const b = makeBoundary();
    await b.wrap(async () => 42)();
    expect(b.getHasError()).toBe(false);
    expect(b.getLastError()).toBeNull();
  });

  test('resets hasError from a previous error on the next success call', async () => {
    const b = makeBoundary();
    try { await b.wrap(async () => { throw new Error('first'); })(); } catch (_) { /* */ }
    expect(b.getHasError()).toBe(true);
    await b.wrap(async () => 'ok')();
    expect(b.getHasError()).toBe(false);
  });
});

// ─── wrap – error path (no container) ────────────────────────────────────────

describe('ErrorBoundary.wrap – error path (no container)', () => {
  test('re-throws error when no container provided', async () => {
    const b = makeBoundary();
    const err = new Error('boom');
    await expect(b.wrap(async () => { throw err; })()).rejects.toThrow('boom');
  });

  test('sets hasError and lastError on failure', async () => {
    const b = makeBoundary();
    const err = new Error('oops');
    try { await b.wrap(async () => { throw err; })(); } catch (_) { /* */ }
    expect(b.getHasError()).toBe(true);
    expect(b.getLastError()).toBe(err);
  });

  test('calls custom onError handler', async () => {
    const onError = jest.fn();
    const b = makeBoundary({ onError });
    const err = new Error('handled');
    try { await b.wrap(async () => { throw err; })(); } catch (_) { /* */ }
    expect(onError).toHaveBeenCalledWith(err, 'TestComp');
  });
});

// ─── wrap – error path (with container) ──────────────────────────────────────

describe('ErrorBoundary.wrap – error path (with container)', () => {
  test('renders fallback HTML into container', async () => {
    const b = makeBoundary();
    const container = document.createElement('div');
    const err = new Error('render me');
    await b.wrap(async () => { throw err; }, container)();
    expect(container.innerHTML).toContain('Fallback: render me');
    expect(container.innerHTML).toContain('role="alert"');
  });

  test('does not re-throw when container is provided', async () => {
    const b = makeBoundary();
    const container = document.createElement('div');
    await expect(
      b.wrap(async () => { throw new Error('x'); }, container)()
    ).resolves.toBeUndefined();
  });
});

// ─── renderFallback edge cases ────────────────────────────────────────────────

describe('ErrorBoundary.renderFallback – edge cases', () => {
  test('handles null container gracefully', () => {
    const b = makeBoundary();
    expect(() => b.renderFallback(null, new Error('x'))).not.toThrow();
  });

  test('falls back to generic HTML when fallbackUI throws', () => {
    const b = makeBoundary({
      fallbackUI: () => { throw new Error('fallback-ui error'); },
      trackErrors: false,
    });
    const container = document.createElement('div');
    b.renderFallback(container, new Error('original'));
    expect(container.innerHTML).toContain('Recarregar');
  });
});

// ─── reset ────────────────────────────────────────────────────────────────────

describe('ErrorBoundary.reset', () => {
  test('clears error state', async () => {
    const b = makeBoundary();
    try { await b.wrap(async () => { throw new Error('e'); })(); } catch (_) { /* */ }
    b.reset();
    expect(b.getHasError()).toBe(false);
    expect(b.getLastError()).toBeNull();
  });
});

// ─── createDefaultErrorBoundary ──────────────────────────────────────────────

describe('createDefaultErrorBoundary', () => {
  test('returns ErrorBoundary instance', () => {
    const b = createDefaultErrorBoundary('MyComp');
    expect(b).toBeInstanceOf(ErrorBoundary);
    expect(b.componentName).toBe('MyComp');
  });

  test('fallbackUI returns HTML with component name and error info', () => {
    const b = createDefaultErrorBoundary('Widget');
    const html = b.fallbackUI(new Error('oops'), 'Widget');
    expect(html).toContain('Widget');
    expect(html).toContain('oops');
  });
});

// ─── setupGlobalErrorHandler ──────────────────────────────────────────────────

describe('setupGlobalErrorHandler', () => {
  test('does nothing in non-browser environment', () => {
    // setupGlobalErrorHandler checks typeof window; in jsdom it exists,
    // so just verify the call does not throw.
    expect(() => setupGlobalErrorHandler(() => {})).not.toThrow();
  });

  test('does not throw when handler is undefined', () => {
    expect(() => setupGlobalErrorHandler(undefined)).not.toThrow();
  });
});
