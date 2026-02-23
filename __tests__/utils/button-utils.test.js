/**
 * @file button-utils.test.js
 * @description Tests for standardized button state management utilities.
 * Covers setButtonDisabled, setButtonLoading, createButton, and withLoading.
 * @since 0.9.0-alpha
 */

import { jest } from '@jest/globals';
import {
  withLoading,
  setButtonDisabled,
  setButtonLoading,
  createButton,
} from '../../src/utils/button-utils.js';

describe('button-utils', () => {
  let button;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    button = document.createElement('button');
    button.id = 'test-btn';
    button.textContent = 'Click me';
    container.appendChild(button);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  // ─── setButtonDisabled ────────────────────────────────────────────────────

  describe('setButtonDisabled()', () => {
    test('does nothing when button is null', () => {
      expect(() => setButtonDisabled(null, true)).not.toThrow();
    });

    test('disables the button', () => {
      setButtonDisabled(button, true);
      expect(button.disabled).toBe(true);
    });

    test('sets aria-disabled=true when disabling', () => {
      setButtonDisabled(button, true);
      expect(button.getAttribute('aria-disabled')).toBe('true');
    });

    test('enables the button', () => {
      button.disabled = true;
      setButtonDisabled(button, false);
      expect(button.disabled).toBe(false);
    });

    test('sets aria-disabled=false when enabling', () => {
      setButtonDisabled(button, false);
      expect(button.getAttribute('aria-disabled')).toBe('false');
    });

    test('sets aria-label with reason when disabling', () => {
      setButtonDisabled(button, true, 'Not ready');
      expect(button.getAttribute('aria-label')).toContain('Not ready');
    });

    test('removes aria-label when enabling with reason', () => {
      button.setAttribute('aria-label', 'Click me - Not ready');
      setButtonDisabled(button, false, 'was-reason');
      expect(button.getAttribute('aria-label')).toBeNull();
    });
  });

  // ─── setButtonLoading ─────────────────────────────────────────────────────

  describe('setButtonLoading()', () => {
    test('does nothing when button is null', () => {
      expect(() => setButtonLoading(null, true)).not.toThrow();
    });

    test('adds loading class when loading=true', () => {
      setButtonLoading(button, true);
      expect(button.classList.contains('loading')).toBe(true);
    });

    test('sets aria-busy=true when loading', () => {
      setButtonLoading(button, true);
      expect(button.getAttribute('aria-busy')).toBe('true');
    });

    test('removes loading class when loading=false', () => {
      button.classList.add('loading');
      setButtonLoading(button, false);
      expect(button.classList.contains('loading')).toBe(false);
    });

    test('removes aria-busy when not loading', () => {
      button.setAttribute('aria-busy', 'true');
      setButtonLoading(button, false);
      expect(button.getAttribute('aria-busy')).toBeNull();
    });
  });

  // ─── createButton ─────────────────────────────────────────────────────────

  describe('createButton()', () => {
    test('returns a button element', () => {
      const btn = createButton({ text: 'Submit' });
      expect(btn.tagName).toBe('BUTTON');
    });

    test('has .button-text span with provided text', () => {
      const btn = createButton({ text: 'Submit' });
      expect(btn.querySelector('.button-text').textContent).toBe('Submit');
    });

    test('has .button-loading span hidden by default', () => {
      const btn = createButton({ text: 'Submit' });
      const loading = btn.querySelector('.button-loading');
      expect(loading).not.toBeNull();
      expect(loading.hasAttribute('hidden')).toBe(true);
    });

    test('applies default class md3-button-filled', () => {
      const btn = createButton({ text: 'Submit' });
      expect(btn.className).toBe('md3-button-filled');
    });

    test('applies custom class', () => {
      const btn = createButton({ text: 'Submit', className: 'my-class' });
      expect(btn.className).toBe('my-class');
    });

    test('sets aria-label when provided', () => {
      const btn = createButton({ text: 'Submit', ariaLabel: 'Submit form' });
      expect(btn.getAttribute('aria-label')).toBe('Submit form');
    });

    test('sets type=button', () => {
      const btn = createButton({ text: 'Submit' });
      expect(btn.getAttribute('type')).toBe('button');
    });

    test('sets aria-disabled=false by default', () => {
      const btn = createButton({ text: 'Submit' });
      expect(btn.getAttribute('aria-disabled')).toBe('false');
    });

    test('attaches onClick handler', () => {
      const handler = jest.fn();
      const btn = createButton({ text: 'Submit', onClick: handler });
      btn.click();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  // ─── withLoading ──────────────────────────────────────────────────────────

  describe('withLoading()', () => {
    test('calls asyncFn even when button is null', async () => {
      const fn = jest.fn().mockResolvedValue('ok');
      const result = await withLoading(null, fn);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(result).toBe('ok');
    });

    test('adds loading class during execution', async () => {
      let classPresent = false;
      await withLoading(button, async () => {
        classPresent = button.classList.contains('loading');
      });
      expect(classPresent).toBe(true);
    });

    test('removes loading class after execution', async () => {
      await withLoading(button, () => Promise.resolve());
      expect(button.classList.contains('loading')).toBe(false);
    });

    test('disables button during execution when disableOnLoad=true', async () => {
      let wasDisabled = false;
      await withLoading(button, async () => {
        wasDisabled = button.disabled;
      }, { disableOnLoad: true });
      expect(wasDisabled).toBe(true);
    });

    test('re-enables button after execution', async () => {
      await withLoading(button, () => Promise.resolve(), { disableOnLoad: true });
      expect(button.disabled).toBe(false);
    });

    test('does not re-enable button if it was already disabled', async () => {
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
      await withLoading(button, () => Promise.resolve(), { disableOnLoad: true });
      expect(button.disabled).toBe(true);
    });

    test('returns value from asyncFn', async () => {
      const result = await withLoading(button, () => Promise.resolve(42));
      expect(result).toBe(42);
    });

    test('shows loadingText while executing', async () => {
      let textDuringLoad = '';
      await withLoading(button, async () => {
        textDuringLoad = button.textContent;
      }, { loadingText: 'Loading...' });
      expect(textDuringLoad).toContain('Loading...');
    });

    test('restores original text after execution', async () => {
      button.textContent = 'Original';
      await withLoading(button, () => Promise.resolve(), { loadingText: 'Loading...' });
      expect(button.textContent).toBe('Original');
    });

    test('removes loading class even if asyncFn throws', async () => {
      try {
        await withLoading(button, () => Promise.reject(new Error('fail')));
      } catch (_) {}
      expect(button.classList.contains('loading')).toBe(false);
    });
  });
});
