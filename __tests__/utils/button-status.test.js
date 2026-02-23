/**
 * @file button-status.test.js
 * @description Tests for button status helper utilities (UX Quick Win #3).
 * Covers addButtonStatus, removeButtonStatus, updateButtonStatus,
 * disableWithReason, enableWithMessage, setLoadingState, clearLoadingState,
 * and the BUTTON_STATUS_MESSAGES constant.
 * @since 0.9.0-alpha
 */

import { jest } from '@jest/globals';
import {
  addButtonStatus,
  removeButtonStatus,
  updateButtonStatus,
  disableWithReason,
  enableWithMessage,
  setLoadingState,
  clearLoadingState,
  BUTTON_STATUS_MESSAGES,
} from '../../src/utils/button-status.js';

// jsdom is available via Jest testEnvironment
describe('button-status utilities', () => {
  let container;
  let button;

  beforeEach(() => {
    container = document.createElement('div');
    button = document.createElement('button');
    button.id = 'test-btn';
    container.appendChild(button);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  // ─── addButtonStatus ───────────────────────────────────────────────────────

  describe('addButtonStatus()', () => {
    test('returns null and warns when no button provided', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const result = addButtonStatus(null, 'msg');
      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith('addButtonStatus: No button provided');
      warnSpy.mockRestore();
    });

    test('creates status element after the button', () => {
      const status = addButtonStatus(button, 'Ready');
      expect(status).not.toBeNull();
      expect(button.nextSibling).toBe(status);
    });

    test('status element has correct text', () => {
      const status = addButtonStatus(button, 'Hello');
      expect(status.textContent).toBe('Hello');
    });

    test('default type is info', () => {
      const status = addButtonStatus(button, 'msg');
      expect(status.className).toContain('button-status-info');
    });

    test('sets custom type class', () => {
      const status = addButtonStatus(button, 'msg', 'warning');
      expect(status.className).toContain('button-status-warning');
    });

    test('sets role=status and aria-live=polite', () => {
      const status = addButtonStatus(button, 'msg');
      expect(status.getAttribute('role')).toBe('status');
      expect(status.getAttribute('aria-live')).toBe('polite');
    });

    test('sets aria-describedby on button', () => {
      addButtonStatus(button, 'msg');
      expect(button.getAttribute('aria-describedby')).toBe('test-btn-status');
    });

    test('status element id uses button id', () => {
      const status = addButtonStatus(button, 'msg');
      expect(status.id).toBe('test-btn-status');
    });

    test('falls back to "btn" when button has no id', () => {
      button.removeAttribute('id');
      const status = addButtonStatus(button, 'msg');
      expect(status.id).toBe('btn-status');
    });

    test('replaces existing status element', () => {
      addButtonStatus(button, 'first');
      addButtonStatus(button, 'second');
      const statuses = container.querySelectorAll('.button-status');
      expect(statuses.length).toBe(1);
      expect(statuses[0].textContent).toBe('second');
    });
  });

  // ─── removeButtonStatus ────────────────────────────────────────────────────

  describe('removeButtonStatus()', () => {
    test('does nothing when no button provided', () => {
      expect(() => removeButtonStatus(null)).not.toThrow();
    });

    test('removes status element by id', () => {
      addButtonStatus(button, 'msg');
      removeButtonStatus(button);
      expect(document.getElementById('test-btn-status')).toBeNull();
    });

    test('removes aria-describedby from button', () => {
      addButtonStatus(button, 'msg');
      removeButtonStatus(button);
      expect(button.getAttribute('aria-describedby')).toBeNull();
    });

    test('does nothing when no status exists', () => {
      expect(() => removeButtonStatus(button)).not.toThrow();
    });
  });

  // ─── updateButtonStatus ────────────────────────────────────────────────────

  describe('updateButtonStatus()', () => {
    test('does nothing when no button provided', () => {
      expect(() => updateButtonStatus(null, 'msg')).not.toThrow();
    });

    test('updates text of existing status element', () => {
      addButtonStatus(button, 'old');
      updateButtonStatus(button, 'new');
      expect(document.getElementById('test-btn-status').textContent).toBe('new');
    });

    test('updates class of existing status element', () => {
      addButtonStatus(button, 'old', 'info');
      updateButtonStatus(button, 'new', 'error');
      expect(document.getElementById('test-btn-status').className).toContain('button-status-error');
    });

    test('creates status element if none exists', () => {
      updateButtonStatus(button, 'created');
      expect(document.getElementById('test-btn-status')).not.toBeNull();
      expect(document.getElementById('test-btn-status').textContent).toBe('created');
    });
  });

  // ─── disableWithReason ────────────────────────────────────────────────────

  describe('disableWithReason()', () => {
    test('does nothing when no button provided', () => {
      expect(() => disableWithReason(null, 'reason')).not.toThrow();
    });

    test('disables the button', () => {
      disableWithReason(button, 'Not ready');
      expect(button.disabled).toBe(true);
    });

    test('sets aria-disabled=true', () => {
      disableWithReason(button, 'Not ready');
      expect(button.getAttribute('aria-disabled')).toBe('true');
    });

    test('adds warning status with the reason', () => {
      disableWithReason(button, 'Awaiting GPS');
      const status = document.getElementById('test-btn-status');
      expect(status).not.toBeNull();
      expect(status.textContent).toBe('Awaiting GPS');
      expect(status.className).toContain('button-status-warning');
    });
  });

  // ─── enableWithMessage ────────────────────────────────────────────────────

  describe('enableWithMessage()', () => {
    test('does nothing when no button provided', () => {
      expect(() => enableWithMessage(null)).not.toThrow();
    });

    test('enables the button', () => {
      button.disabled = true;
      enableWithMessage(button);
      expect(button.disabled).toBe(false);
    });

    test('sets aria-disabled=false', () => {
      button.setAttribute('aria-disabled', 'true');
      enableWithMessage(button);
      expect(button.getAttribute('aria-disabled')).toBe('false');
    });

    test('removes status when no success message provided', () => {
      addButtonStatus(button, 'old');
      enableWithMessage(button);
      expect(document.getElementById('test-btn-status')).toBeNull();
    });

    test('shows success status when message provided', () => {
      enableWithMessage(button, 'Location acquired');
      const status = document.getElementById('test-btn-status');
      expect(status).not.toBeNull();
      expect(status.textContent).toBe('Location acquired');
      expect(status.className).toContain('button-status-success');
    });
  });

  // ─── setLoadingState ──────────────────────────────────────────────────────

  describe('setLoadingState()', () => {
    test('does nothing when no button provided', () => {
      expect(() => setLoadingState(null)).not.toThrow();
    });

    test('disables button', () => {
      setLoadingState(button);
      expect(button.disabled).toBe(true);
    });

    test('adds loading CSS class', () => {
      setLoadingState(button);
      expect(button.classList.contains('loading')).toBe(true);
    });

    test('shows default loading message', () => {
      setLoadingState(button);
      const status = document.getElementById('test-btn-status');
      expect(status.textContent).toBe(BUTTON_STATUS_MESSAGES.LOADING);
    });

    test('shows custom loading message', () => {
      setLoadingState(button, 'Buscando...');
      expect(document.getElementById('test-btn-status').textContent).toBe('Buscando...');
    });
  });

  // ─── clearLoadingState ────────────────────────────────────────────────────

  describe('clearLoadingState()', () => {
    test('does nothing when no button provided', () => {
      expect(() => clearLoadingState(null)).not.toThrow();
    });

    test('removes loading class', () => {
      setLoadingState(button);
      clearLoadingState(button);
      expect(button.classList.contains('loading')).toBe(false);
    });

    test('re-enables button', () => {
      setLoadingState(button);
      clearLoadingState(button);
      expect(button.disabled).toBe(false);
    });

    test('sets aria-disabled=false', () => {
      setLoadingState(button);
      clearLoadingState(button);
      expect(button.getAttribute('aria-disabled')).toBe('false');
    });

    test('removes status element', () => {
      setLoadingState(button);
      clearLoadingState(button);
      expect(document.getElementById('test-btn-status')).toBeNull();
    });
  });

  // ─── BUTTON_STATUS_MESSAGES ───────────────────────────────────────────────

  describe('BUTTON_STATUS_MESSAGES', () => {
    test('has WAITING_LOCATION key', () => {
      expect(typeof BUTTON_STATUS_MESSAGES.WAITING_LOCATION).toBe('string');
    });

    test('has LOADING key', () => {
      expect(typeof BUTTON_STATUS_MESSAGES.LOADING).toBe('string');
    });

    test('has READY key', () => {
      expect(typeof BUTTON_STATUS_MESSAGES.READY).toBe('string');
    });

    test('has ERROR key', () => {
      expect(typeof BUTTON_STATUS_MESSAGES.ERROR).toBe('string');
    });

    test('messages are non-empty strings', () => {
      for (const [key, val] of Object.entries(BUTTON_STATUS_MESSAGES)) {
        expect(val.length).toBeGreaterThan(0);
      }
    });
  });
});
