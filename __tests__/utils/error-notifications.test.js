/**
 * @file error-notifications.test.js
 * @description Tests for error notification toast utilities.
 * Covers showErrorToast, showSuccessToast, showAPIError, showNetworkError,
 * and showGeolocationError.
 * @since 0.11.0-alpha
 */

import { jest } from '@jest/globals';

jest.mock('../../src/utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

import {
  showErrorToast,
  showSuccessToast,
  showAPIError,
  showNetworkError,
  showGeolocationError,
} from '../../src/utils/error-notifications.js';

describe('error-notifications', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Clean up any leftover toasts
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.useRealTimers();
  });

  // ─── showErrorToast ───────────────────────────────────────────────────────

  describe('showErrorToast()', () => {
    test('appends toast to document.body', () => {
      showErrorToast('Oops', 'Something went wrong');
      expect(document.querySelector('.error-toast')).not.toBeNull();
    });

    test('returns the toast element', () => {
      const toast = showErrorToast('Error', 'Msg');
      expect(toast).toBeInstanceOf(HTMLElement);
      expect(toast.className).toBe('error-toast');
    });

    test('has role=alert for screen readers', () => {
      const toast = showErrorToast('Error', 'Msg');
      expect(toast.getAttribute('role')).toBe('alert');
    });

    test('displays the title', () => {
      showErrorToast('Connection Error', 'Could not connect');
      expect(document.querySelector('.error-toast-title').textContent).toBe('Connection Error');
    });

    test('displays the message', () => {
      showErrorToast('Error', 'The server is down');
      expect(document.querySelector('.error-toast-message').textContent).toBe('The server is down');
    });

    test('escapes HTML in title to prevent XSS', () => {
      showErrorToast('<script>bad</script>', 'msg');
      expect(document.querySelector('.error-toast-title').textContent).toContain('<script>');
      expect(document.body.innerHTML).not.toContain('<script>bad</script>');
    });

    test('has a close button', () => {
      showErrorToast('Error', 'Msg');
      expect(document.querySelector('.error-toast-close')).not.toBeNull();
    });

    test('auto-dismisses after duration', () => {
      showErrorToast('Error', 'Msg', 1000);
      expect(document.querySelector('.error-toast')).not.toBeNull();
      jest.advanceTimersByTime(1500);
      // After dismissing class is added, a 300ms timeout removes it
      jest.advanceTimersByTime(400);
      expect(document.querySelector('.error-toast')).toBeNull();
    });

    test('replaces existing toast when called again', () => {
      showErrorToast('First', 'msg1');
      showErrorToast('Second', 'msg2');
      // Only one toast (the second one, after first is in dismissing state)
      // The first is marked dismissing, and body may still have it briefly
      const titles = document.querySelectorAll('.error-toast-title');
      // The most recent title should be Second
      const lastTitle = [...titles].at(-1);
      expect(lastTitle.textContent).toBe('Second');
    });

    test('duration=0 does not auto-dismiss', () => {
      showErrorToast('Error', 'Msg', 0);
      jest.advanceTimersByTime(10000);
      expect(document.querySelector('.error-toast')).not.toBeNull();
    });
  });

  // ─── showSuccessToast ─────────────────────────────────────────────────────

  describe('showSuccessToast()', () => {
    test('appends success toast to document.body', () => {
      showSuccessToast('Done', 'All good');
      expect(document.querySelector('.success-toast')).not.toBeNull();
    });

    test('has role=status', () => {
      const toast = showSuccessToast('Done', 'All good');
      expect(toast.getAttribute('role')).toBe('status');
    });

    test('displays the title', () => {
      showSuccessToast('Sucesso', 'Operação concluída');
      expect(document.querySelector('.success-toast-title').textContent).toBe('Sucesso');
    });

    test('displays the message', () => {
      showSuccessToast('Done', 'Location found');
      expect(document.querySelector('.success-toast-message').textContent).toBe('Location found');
    });

    test('auto-dismisses after default duration (3000ms)', () => {
      showSuccessToast('Done', 'Msg');
      jest.advanceTimersByTime(3400);
      expect(document.querySelector('.success-toast')).toBeNull();
    });

    test('has a close button', () => {
      showSuccessToast('Done', 'Msg');
      expect(document.querySelector('.success-toast-close')).not.toBeNull();
    });
  });

  // ─── showAPIError ─────────────────────────────────────────────────────────

  describe('showAPIError()', () => {
    test('shows error toast', () => {
      showAPIError(new Error('503 Service Unavailable'));
      expect(document.querySelector('.error-toast')).not.toBeNull();
    });

    test('uses error.message in toast body', () => {
      showAPIError(new Error('Rate limit exceeded'));
      expect(document.querySelector('.error-toast-message').textContent).toBe('Rate limit exceeded');
    });

    test('handles error with no message', () => {
      showAPIError({});
      expect(document.querySelector('.error-toast-message').textContent).toBeTruthy();
    });
  });

  // ─── showNetworkError ─────────────────────────────────────────────────────

  describe('showNetworkError()', () => {
    test('shows error toast', () => {
      showNetworkError();
      expect(document.querySelector('.error-toast')).not.toBeNull();
    });

    test('does not auto-dismiss (duration=0)', () => {
      showNetworkError();
      jest.advanceTimersByTime(30000);
      expect(document.querySelector('.error-toast')).not.toBeNull();
    });
  });

  // ─── showGeolocationError ─────────────────────────────────────────────────

  describe('showGeolocationError()', () => {
    test('shows error toast for code 1 (permission denied)', () => {
      showGeolocationError(1);
      expect(document.querySelector('.error-toast-message').textContent)
        .toContain('Permissão');
    });

    test('shows error toast for code 2 (position unavailable)', () => {
      showGeolocationError(2);
      expect(document.querySelector('.error-toast-message').textContent)
        .toContain('indisponível');
    });

    test('shows error toast for code 3 (timeout)', () => {
      showGeolocationError(3);
      expect(document.querySelector('.error-toast-message').textContent)
        .toContain('Tempo limite');
    });

    test('shows fallback for unknown code', () => {
      showGeolocationError(99);
      expect(document.querySelector('.error-toast-message').textContent).toBeTruthy();
    });
  });
});
