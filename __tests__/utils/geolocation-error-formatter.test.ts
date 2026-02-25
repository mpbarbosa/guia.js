/**
 * @file geolocation-error-formatter.test.js
 * @description Tests for geolocation error formatting utilities.
 * Covers formatGeolocationError, getGeolocationErrorMessage,
 * and generateErrorDisplayHTML with all W3C error codes.
 * @since 0.11.0-alpha
 */

import {
  formatGeolocationError,
  getGeolocationErrorMessage,
  generateErrorDisplayHTML,
} from '../../src/utils/geolocation-error-formatter.js';

describe('geolocation-error-formatter', () => {

  // ─── formatGeolocationError ───────────────────────────────────────────────

  describe('formatGeolocationError()', () => {
    test('returns an Error instance', () => {
      const result = formatGeolocationError({ code: 1, message: 'denied' });
      expect(result).toBeInstanceOf(Error);
    });

    test('code 1 → PermissionDeniedError', () => {
      const err = formatGeolocationError({ code: 1, message: 'denied' });
      expect(err.name).toBe('PermissionDeniedError');
      expect(err.message).toBe('User denied geolocation permission');
    });

    test('code 2 → PositionUnavailableError', () => {
      const err = formatGeolocationError({ code: 2, message: 'unavail' });
      expect(err.name).toBe('PositionUnavailableError');
      expect(err.message).toBe('Position information is unavailable');
    });

    test('code 3 → TimeoutError', () => {
      const err = formatGeolocationError({ code: 3, message: 'timeout' });
      expect(err.name).toBe('TimeoutError');
      expect(err.message).toBe('Geolocation request timed out');
    });

    test('unknown code → UnknownGeolocationError', () => {
      const err = formatGeolocationError({ code: 99, message: 'wat' });
      expect(err.name).toBe('UnknownGeolocationError');
    });

    test('preserves original error code on result', () => {
      const err = formatGeolocationError({ code: 2, message: 'x' });
      expect(err.code).toBe(2);
    });

    test('attaches originalError to result', () => {
      const raw = { code: 1, message: 'denied' };
      const err = formatGeolocationError(raw);
      expect(err.originalError).toBe(raw);
    });
  });

  // ─── getGeolocationErrorMessage ───────────────────────────────────────────

  describe('getGeolocationErrorMessage()', () => {
    test('code 1 → Portuguese permission denied message', () => {
      expect(getGeolocationErrorMessage(1)).toBe('Permissão negada pelo usuário');
    });

    test('code 2 → Portuguese position unavailable message', () => {
      expect(getGeolocationErrorMessage(2)).toBe('Posição indisponível');
    });

    test('code 3 → Portuguese timeout message', () => {
      expect(getGeolocationErrorMessage(3)).toBe('Timeout na obtenção da posição');
    });

    test('unknown code → "Erro desconhecido"', () => {
      expect(getGeolocationErrorMessage(99)).toBe('Erro desconhecido');
    });

    test('returns string for all known codes', () => {
      [1, 2, 3].forEach(code => {
        expect(typeof getGeolocationErrorMessage(code)).toBe('string');
      });
    });
  });

  // ─── generateErrorDisplayHTML ─────────────────────────────────────────────

  describe('generateErrorDisplayHTML()', () => {
    test('returns a string', () => {
      const html = generateErrorDisplayHTML({ code: 1, message: 'denied' });
      expect(typeof html).toBe('string');
    });

    test('contains error code', () => {
      const html = generateErrorDisplayHTML({ code: 2, message: 'x' });
      expect(html).toContain('2');
    });

    test('contains Portuguese message for code 1', () => {
      const html = generateErrorDisplayHTML({ code: 1, message: 'x' });
      expect(html).toContain('Permissão negada pelo usuário');
    });

    test('contains Portuguese message for code 2', () => {
      const html = generateErrorDisplayHTML({ code: 2, message: 'x' });
      expect(html).toContain('Posição indisponível');
    });

    test('contains Portuguese message for code 3', () => {
      const html = generateErrorDisplayHTML({ code: 3, message: 'x' });
      expect(html).toContain('Timeout na obtenção da posição');
    });

    test('escapes HTML in error message to prevent XSS', () => {
      const html = generateErrorDisplayHTML({ code: 1, message: '<script>alert(1)</script>' });
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    test('wraps output in location-error div', () => {
      const html = generateErrorDisplayHTML({ code: 1, message: 'x' });
      expect(html).toContain('class="location-error"');
    });

    test('includes heading in Portuguese', () => {
      const html = generateErrorDisplayHTML({ code: 1, message: 'x' });
      expect(html).toContain('Erro na Obtenção da Localização');
    });
  });
});
