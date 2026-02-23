/**
 * @file Toast.test.js
 * @description Tests for the ToastManager singleton component.
 * @since 0.11.0-alpha
 */

import { jest } from '@jest/globals';

import toastManager from '../../src/components/Toast.js';

describe('ToastManager', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '';
    // Reset internal state between tests
    toastManager.container = null;
    toastManager.toasts = new Map();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.useRealTimers();
  });

  // ─── show() ───────────────────────────────────────────────────────────────

  describe('show()', () => {
    test('returns a toast ID string', () => {
      const id = toastManager.show({ message: 'Hello' });
      expect(typeof id).toBe('string');
    });

    test('appends toast container to body', () => {
      toastManager.show({ message: 'Test' });
      expect(document.querySelector('.toast-container')).not.toBeNull();
    });

    test('appends toast element inside container', () => {
      toastManager.show({ message: 'Test' });
      expect(document.querySelector('.toast')).not.toBeNull();
    });

    test('uses provided id', () => {
      const id = toastManager.show({ message: 'Test', id: 'my-toast' });
      expect(id).toBe('my-toast');
    });

    test('prevents duplicate toasts with same id', () => {
      toastManager.show({ message: 'First', id: 'dup' });
      toastManager.show({ message: 'Second', id: 'dup' });
      expect(document.querySelectorAll('.toast').length).toBe(1);
    });

    test('default type is info', () => {
      toastManager.show({ message: 'Msg' });
      expect(document.querySelector('.toast-info')).not.toBeNull();
    });

    test('error type gets role=alert', () => {
      toastManager.show({ message: 'Oops', type: 'error' });
      expect(document.querySelector('[role="alert"]')).not.toBeNull();
    });

    test('success type gets role=status', () => {
      toastManager.show({ message: 'Done', type: 'success' });
      expect(document.querySelector('[role="status"]')).not.toBeNull();
    });

    test('warning type renders', () => {
      toastManager.show({ message: 'Careful', type: 'warning' });
      expect(document.querySelector('.toast-warning')).not.toBeNull();
    });

    test('unknown type falls back to info', () => {
      toastManager.show({ message: 'Msg', type: 'nonexistent' });
      expect(document.querySelector('.toast-info')).not.toBeNull();
    });

    test('auto-dismisses after duration', () => {
      const id = toastManager.show({ message: 'Bye', duration: 500 });
      jest.advanceTimersByTime(900); // 500ms timeout + 300ms removal
      expect(toastManager.toasts.has(id)).toBe(false);
    });

    test('duration=0 does not auto-dismiss', () => {
      const id = toastManager.show({ message: 'Persistent', duration: 0 });
      jest.advanceTimersByTime(10000);
      expect(toastManager.toasts.has(id)).toBe(true);
    });

    test('creates close button', () => {
      toastManager.show({ message: 'Test' });
      expect(document.querySelector('.toast-close')).not.toBeNull();
    });
  });

  // ─── dismiss() ────────────────────────────────────────────────────────────

  describe('dismiss()', () => {
    test('removes toast from toasts map', () => {
      const id = toastManager.show({ message: 'Test', duration: 0 });
      toastManager.dismiss(id);
      jest.advanceTimersByTime(400); // Allow removal timeout
      expect(toastManager.toasts.has(id)).toBe(false);
    });

    test('does nothing for unknown toast id', () => {
      expect(() => toastManager.dismiss('nonexistent')).not.toThrow();
    });

    test('close button dismisses toast', () => {
      const id = toastManager.show({ message: 'Click me', duration: 0 });
      document.querySelector('.toast-close').click();
      jest.advanceTimersByTime(400);
      expect(toastManager.toasts.has(id)).toBe(false);
    });
  });

  // ─── dismissAll() ─────────────────────────────────────────────────────────

  describe('dismissAll()', () => {
    test('dismisses all active toasts', () => {
      toastManager.show({ message: 'T1', duration: 0, id: 'a' });
      toastManager.show({ message: 'T2', duration: 0, id: 'b' });
      toastManager.dismissAll();
      jest.advanceTimersByTime(400);
      expect(toastManager.toasts.size).toBe(0);
    });

    test('does not throw when no toasts are shown', () => {
      expect(() => toastManager.dismissAll()).not.toThrow();
    });
  });

  // ─── convenience methods ──────────────────────────────────────────────────

  describe('success()', () => {
    test('shows success toast', () => {
      toastManager.success('All good');
      expect(document.querySelector('.toast-success')).not.toBeNull();
    });
  });

  describe('error()', () => {
    test('shows error toast that persists (duration=0)', () => {
      const id = toastManager.error('Failed');
      jest.advanceTimersByTime(10000);
      expect(toastManager.toasts.has(id)).toBe(true);
    });
  });

  describe('info()', () => {
    test('shows info toast', () => {
      toastManager.info('FYI');
      expect(document.querySelector('.toast-info')).not.toBeNull();
    });
  });

  describe('warning()', () => {
    test('shows warning toast', () => {
      toastManager.warning('Be careful');
      expect(document.querySelector('.toast-warning')).not.toBeNull();
    });
  });
});
