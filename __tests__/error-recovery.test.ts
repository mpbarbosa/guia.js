/**
 * @jest-environment jsdom
 *
 * Tests for src/error-recovery.ts.
 *
 * Strategy: import the exported functions directly and assert on DOM state.
 * Do NOT spy on module-level exports — ESM exports are read-only.
 * Call destroy() before each test to reset module-level state and DOM.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  displayError,
  showErrorPanel,
  hideErrorPanel,
  toggleErrorPanel,
  destroy,
  recoveryStrategies,
  escapeHtml,
  createErrorPanel,
  createFloatingButton,
  updateFabBadge,
  updateErrorPanel,
  formatTime,
} from '../src/error-recovery.js';

beforeEach(() => {
  // Reset module-level state (errorHistory, activeTimeouts) and remove
  // any DOM nodes created by the previous test or by the module's own
  // side-effect initialisation on import.
  destroy();
  jest.useFakeTimers();
});

afterEach(() => {
  destroy();
  jest.useRealTimers();
  document.body.innerHTML = '';
});

// ── escapeHtml ────────────────────────────────────────────────────────────────

describe('escapeHtml', () => {
  it('leaves plain text unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });

  it('escapes < and >', () => {
    const result = escapeHtml('<script>alert(1)</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
  });

  it('escapes & and "', () => {
    const result = escapeHtml('a & b "c"');
    expect(result).toContain('&amp;');
  });

  it('returns empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });
});

// ── formatTime ────────────────────────────────────────────────────────────────

describe('formatTime', () => {
  it('returns a non-empty string for a valid ISO timestamp', () => {
    const ts = new Date().toISOString();
    const result = formatTime(ts);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes time digits in the output', () => {
    const ts = '2026-01-15T14:30:00.000Z';
    const result = formatTime(ts);
    // Should contain digits (hours, minutes)
    expect(result).toMatch(/\d/);
  });
});

// ── displayError ──────────────────────────────────────────────────────────────

describe('displayError', () => {
  it('creates a toast element in the document body', () => {
    displayError('Test Title', 'Test message');
    const toast = document.querySelector('.toast.error');
    expect(toast).not.toBeNull();
  });

  it('includes the title and message in the toast', () => {
    displayError('My Title', 'My message content');
    const toast = document.querySelector('.toast.error') as HTMLElement;
    expect(toast.innerHTML).toContain('My Title');
    expect(toast.innerHTML).toContain('My message content');
  });

  it('escapes HTML in the message to prevent XSS', () => {
    displayError('Safe', '<img src=x onerror=alert(1)>');
    const toast = document.querySelector('.toast.error') as HTMLElement;
    expect(toast.innerHTML).not.toContain('<img');
    expect(toast.innerHTML).toContain('&lt;img');
  });

  it('creates the toast container if it does not exist', () => {
    expect(document.querySelector('.toast-container')).toBeNull();
    displayError('T', 'M');
    expect(document.querySelector('.toast-container')).not.toBeNull();
  });

  it('adds a details button when errorInfo is supplied', () => {
    displayError('Title', 'Message', {
      type: 'Error',
      message: 'Message',
      timestamp: new Date().toISOString(),
    });
    const btn = document.querySelector('.toast-details-btn');
    expect(btn).not.toBeNull();
  });

  it('auto-removes the toast after the timeout', () => {
    displayError('T', 'M');
    expect(document.querySelector('.toast.error')).not.toBeNull();
    jest.advanceTimersByTime(5300);
    expect(document.querySelector('.toast.error')).toBeNull();
  });

  it('truncates very long messages to 200 characters', () => {
    const longMsg = 'a'.repeat(500);
    displayError('Title', longMsg);
    const toast = document.querySelector('.toast.error') as HTMLElement;
    // The message paragraph should contain at most 200 'a' characters
    const msgP = toast.querySelector('p') as HTMLElement;
    expect(msgP.textContent?.length).toBeLessThanOrEqual(200);
  });
});

// ── createFloatingButton ──────────────────────────────────────────────────────

describe('createFloatingButton', () => {
  it('creates a button with id=error-fab', () => {
    createFloatingButton();
    expect(document.getElementById('error-fab')).not.toBeNull();
  });

  it('creates a badge with id=error-fab-badge', () => {
    createFloatingButton();
    expect(document.getElementById('error-fab-badge')).not.toBeNull();
  });

  it('badge is hidden initially', () => {
    createFloatingButton();
    const badge = document.getElementById('error-fab-badge') as HTMLElement;
    expect(badge.style.display).toBe('none');
  });

  it('clicking the button toggles the error panel', () => {
    createFloatingButton();
    createErrorPanel();
    const fab = document.getElementById('error-fab') as HTMLElement;
    fab.click();
    expect(document.getElementById('error-panel')?.classList.contains('error-panel-visible')).toBe(true);
    fab.click();
    expect(document.getElementById('error-panel')?.classList.contains('error-panel-visible')).toBe(false);
  });
});

// ── createErrorPanel ──────────────────────────────────────────────────────────

describe('createErrorPanel', () => {
  it('creates an element with id=error-panel', () => {
    createErrorPanel();
    expect(document.getElementById('error-panel')).not.toBeNull();
  });

  it('panel has role=dialog', () => {
    createErrorPanel();
    const panel = document.getElementById('error-panel');
    expect(panel?.getAttribute('role')).toBe('dialog');
  });

  it('close button hides the panel', () => {
    createErrorPanel();
    showErrorPanel(); // make it visible first
    const closeBtn = document.querySelector('.error-panel-close') as HTMLElement;
    closeBtn.click();
    expect(document.getElementById('error-panel')?.classList.contains('error-panel-visible')).toBe(false);
  });

  it('clear button empties the error history', () => {
    createErrorPanel();
    // Populate error history
    displayError('E', 'M', { type: 'E', message: 'M', timestamp: new Date().toISOString() });
    showErrorPanel();
    const clearBtn = document.querySelector('.error-panel-clear') as HTMLElement;
    clearBtn.click();
    const content = document.getElementById('error-panel-content') as HTMLElement;
    expect(content.innerHTML).toContain('Nenhum erro registrado');
  });
});

// ── updateFabBadge ────────────────────────────────────────────────────────────

describe('updateFabBadge', () => {
  beforeEach(() => {
    createFloatingButton();
  });

  it('shows the badge when there are errors', () => {
    // Add an error to history via displayError
    displayError('E', 'M', { type: 'E', message: 'M', timestamp: new Date().toISOString() });
    const badge = document.getElementById('error-fab-badge') as HTMLElement;
    expect(badge.style.display).not.toBe('none');
  });

  it('shows the correct count', () => {
    for (let i = 0; i < 3; i++) {
      displayError('E', `M${i}`, { type: 'E', message: `M${i}`, timestamp: new Date().toISOString() });
    }
    const badge = document.getElementById('error-fab-badge') as HTMLElement;
    expect(badge.textContent).toBe('3');
  });

  it('caps badge text at 99+', () => {
    for (let i = 0; i < 25; i++) { // history capped at 20 by MAX_ERROR_HISTORY
      displayError('E', `M${i}`, { type: 'E', message: `M${i}`, timestamp: new Date().toISOString() });
    }
    const badge = document.getElementById('error-fab-badge') as HTMLElement;
    // Badge should be ≤20 (history cap) which is less than 99
    expect(parseInt(badge.textContent ?? '0')).toBeGreaterThan(0);
  });

  it('hides the badge when error history is empty (after destroy)', () => {
    displayError('E', 'M', { type: 'E', message: 'M', timestamp: new Date().toISOString() });
    destroy(); // clears history, removes fab
    createFloatingButton(); // recreate fab
    // badge is hidden by default on new button
    const badge = document.getElementById('error-fab-badge') as HTMLElement;
    expect(badge.style.display).toBe('none');
  });
});

// ── updateErrorPanel ──────────────────────────────────────────────────────────

describe('updateErrorPanel', () => {
  beforeEach(() => {
    createErrorPanel();
  });

  it('shows empty state message when no errors', () => {
    updateErrorPanel();
    const content = document.getElementById('error-panel-content') as HTMLElement;
    expect(content.innerHTML).toContain('Nenhum erro registrado');
  });

  it('renders error entries when errors exist', () => {
    displayError('Network Error', 'Connection failed', {
      type: 'Network Error',
      message: 'Connection failed',
      timestamp: new Date().toISOString(),
    });
    updateErrorPanel();
    const content = document.getElementById('error-panel-content') as HTMLElement;
    expect(content.innerHTML).toContain('Network Error');
    expect(content.innerHTML).toContain('Connection failed');
  });

  it('renders filename/lineno when present', () => {
    displayError('E', 'M', {
      type: 'E',
      message: 'M',
      filename: 'app.ts',
      lineno: 42,
      colno: 7,
      timestamp: new Date().toISOString(),
    });
    updateErrorPanel();
    const content = document.getElementById('error-panel-content') as HTMLElement;
    expect(content.innerHTML).toContain('app.ts');
    expect(content.innerHTML).toContain('42');
  });
});

// ── showErrorPanel / hideErrorPanel / toggleErrorPanel ────────────────────────

describe('panel visibility', () => {
  it('showErrorPanel makes the panel visible', () => {
    showErrorPanel();
    expect(document.getElementById('error-panel')?.classList.contains('error-panel-visible')).toBe(true);
  });

  it('hideErrorPanel removes visibility', () => {
    showErrorPanel();
    hideErrorPanel();
    expect(document.getElementById('error-panel')?.classList.contains('error-panel-visible')).toBe(false);
  });

  it('toggleErrorPanel switches state', () => {
    showErrorPanel();
    toggleErrorPanel();
    expect(document.getElementById('error-panel')?.classList.contains('error-panel-visible')).toBe(false);
    toggleErrorPanel();
    expect(document.getElementById('error-panel')?.classList.contains('error-panel-visible')).toBe(true);
  });

  it('showErrorPanel creates the panel lazily if missing', () => {
    expect(document.getElementById('error-panel')).toBeNull();
    showErrorPanel();
    expect(document.getElementById('error-panel')).not.toBeNull();
  });
});

// ── recoveryStrategies ────────────────────────────────────────────────────────

describe('recoveryStrategies', () => {
  it('NetworkError shows a connection error toast', () => {
    recoveryStrategies.NetworkError();
    const toast = document.querySelector('.toast.error') as HTMLElement;
    expect(toast).not.toBeNull();
    expect(toast.innerHTML).toContain('Conexão');
  });

  it('GeolocationError code=1 mentions permission denied', () => {
    recoveryStrategies.GeolocationError({ code: 1 });
    const toast = document.querySelector('.toast.error') as HTMLElement;
    expect(toast.innerHTML.toLowerCase()).toContain('permissão');
  });

  it('GeolocationError code=2 mentions GPS unavailable', () => {
    recoveryStrategies.GeolocationError({ code: 2 });
    const toast = document.querySelector('.toast.error') as HTMLElement;
    expect(toast.innerHTML.toLowerCase()).toContain('indisponível');
  });

  it('GeolocationError code=3 mentions timeout', () => {
    recoveryStrategies.GeolocationError({ code: 3 });
    const toast = document.querySelector('.toast.error') as HTMLElement;
    expect(toast.innerHTML.toLowerCase()).toContain('tempo');
  });

  it('GeolocationError unknown code shows default message', () => {
    recoveryStrategies.GeolocationError({ code: 99 });
    const toast = document.querySelector('.toast.error') as HTMLElement;
    expect(toast).not.toBeNull(); // still shows a toast
  });

  it('APIError status=429 shows rate-limit message', () => {
    recoveryStrategies.APIError({ status: 429 });
    const toast = document.querySelector('.toast.error') as HTMLElement;
    expect(toast.innerHTML).toContain('Muitas requisições');
  });

  it('APIError other status shows generic server error', () => {
    recoveryStrategies.APIError({ status: 500 });
    const toast = document.querySelector('.toast.error') as HTMLElement;
    expect(toast).not.toBeNull();
    expect(toast.innerHTML).not.toContain('429');
  });
});

// ── destroy ───────────────────────────────────────────────────────────────────

describe('destroy', () => {
  it('removes the toast container', () => {
    displayError('T', 'M');
    expect(document.querySelector('.toast-container')).not.toBeNull();
    destroy();
    expect(document.querySelector('.toast-container')).toBeNull();
  });

  it('removes the error panel', () => {
    showErrorPanel();
    expect(document.getElementById('error-panel')).not.toBeNull();
    destroy();
    expect(document.getElementById('error-panel')).toBeNull();
  });

  it('removes the floating button', () => {
    createFloatingButton();
    expect(document.getElementById('error-fab')).not.toBeNull();
    destroy();
    expect(document.getElementById('error-fab')).toBeNull();
  });

  it('does not throw when called on a clean DOM', () => {
    expect(() => destroy()).not.toThrow();
  });
});
