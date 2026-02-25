/**
 * @file logger.test.js
 * @description Tests for logger utility: setLogLevel, getLogLevel, debug,
 * and branch coverage for uncovered paths.
 * @since 0.11.0-alpha
 */

import { jest } from '@jest/globals';

import {
  log,
  warn,
  error,
  debug,
  setLogLevel,
  getLogLevel,
  formatTimestamp,
} from '../../src/utils/logger.js';

describe('logger utility', () => {
  // ─── formatTimestamp ───────────────────────────────────────────────────────

  describe('formatTimestamp()', () => {
    test('returns an ISO 8601 string', () => {
      expect(formatTimestamp()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  // ─── setLogLevel / getLogLevel ─────────────────────────────────────────────

  describe('setLogLevel() / getLogLevel()', () => {
    afterEach(() => {
      // Reset to default
      setLogLevel({ level: 'log', enabled: true, timestamp: true });
    });

    test('getLogLevel returns an object with levelName and enabled', () => {
      const config = getLogLevel();
      expect(typeof config.levelName).toBe('string');
      expect(typeof config.enabled).toBe('boolean');
    });

    test('setLogLevel changes the level', () => {
      setLogLevel({ level: 'error' });
      expect(getLogLevel().levelName).toBe('error');
    });

    test('setLogLevel can disable logging', () => {
      setLogLevel({ enabled: false });
      expect(getLogLevel().enabled).toBe(false);
    });

    test('setLogLevel can toggle timestamp', () => {
      setLogLevel({ timestamp: false });
      expect(getLogLevel().timestamp).toBe(false);
    });

    test('setLogLevel ignores unknown level', () => {
      const before = getLogLevel().levelName;
      setLogLevel({ level: 'nonexistent-level' });
      expect(getLogLevel().levelName).toBe(before);
    });

    test('setLogLevel with no args does not throw', () => {
      expect(() => setLogLevel()).not.toThrow();
    });

    test('setLogLevel ignores non-boolean enabled', () => {
      const before = getLogLevel().enabled;
      setLogLevel({ enabled: 'yes' }); // string, not boolean
      expect(getLogLevel().enabled).toBe(before);
    });
  });

  // ─── log / warn / error / debug ───────────────────────────────────────────

  describe('log()', () => {
    test('does not throw when called', () => {
      expect(() => log('test message')).not.toThrow();
    });

    test('accepts extra params', () => {
      expect(() => log('msg', { key: 'value' }, 42)).not.toThrow();
    });
  });

  describe('warn()', () => {
    test('does not throw when called', () => {
      expect(() => warn('warning')).not.toThrow();
    });
  });

  describe('error()', () => {
    test('does not throw when called', () => {
      expect(() => error('error occurred')).not.toThrow();
    });
  });

  describe('debug()', () => {
    test('does not throw when called', () => {
      expect(() => debug('debug info')).not.toThrow();
    });

    test('outputs when level is set to debug', () => {
      setLogLevel({ level: 'debug' });
      const spy = jest.spyOn(console, 'debug').mockImplementation(() => {});
      debug('debug test');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
      setLogLevel({ level: 'log' });
    });
  });

  // ─── disabled logging ──────────────────────────────────────────────────────

  describe('disabled logging', () => {
    afterEach(() => {
      setLogLevel({ enabled: true });
    });

    test('does not call console.log when disabled', () => {
      setLogLevel({ enabled: false });
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
      log('should not appear');
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    test('does not call console.warn when disabled', () => {
      setLogLevel({ enabled: false });
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      warn('should not appear');
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
