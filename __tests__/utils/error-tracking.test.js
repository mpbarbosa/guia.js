/**
 * @file error-tracking.test.js
 * @description Tests for error tracking utility functions.
 * Covers isErrorTrackingEnabled, getErrorTrackingConfig, initErrorTracking,
 * reportError, and addBreadcrumb without external service dependencies.
 * @since 0.11.0-alpha
 */

import { jest } from '@jest/globals';

jest.mock('../../src/utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../src/config/environment.js', () => ({
  env: {
    isProduction: jest.fn(() => false),
  },
}));

import {
  initErrorTracking,
  reportError,
  addBreadcrumb,
  isErrorTrackingEnabled,
  getErrorTrackingConfig,
  setUserContext,
} from '../../src/utils/error-tracking.js';

describe('error-tracking', () => {

  // ─── initial state ────────────────────────────────────────────────────────

  describe('initial state', () => {
    test('isErrorTrackingEnabled returns false before init', () => {
      expect(isErrorTrackingEnabled()).toBe(false);
    });

    test('getErrorTrackingConfig returns object with enabled=false', () => {
      const config = getErrorTrackingConfig();
      expect(config.enabled).toBe(false);
    });

    test('getErrorTrackingConfig returns a copy (not the internal object)', () => {
      const a = getErrorTrackingConfig();
      const b = getErrorTrackingConfig();
      expect(a).not.toBe(b);
    });
  });

  // ─── initErrorTracking ────────────────────────────────────────────────────

  describe('initErrorTracking()', () => {
    afterEach(() => {
      // Reset to disabled state after each test
      initErrorTracking({ enabled: false, service: null });
      // Clear the enabled flag properly
      const cfg = getErrorTrackingConfig();
      if (cfg.enabled) initErrorTracking({ enabled: false });
    });

    test('enables tracking after init', () => {
      initErrorTracking({ service: 'custom', dsn: 'test-dsn' });
      expect(isErrorTrackingEnabled()).toBe(true);
    });

    test('stores service name in config', () => {
      initErrorTracking({ service: 'rollbar', dsn: 'test' });
      const config = getErrorTrackingConfig();
      expect(config.service).toBe('rollbar');
    });

    test('stores dsn in config', () => {
      initErrorTracking({ service: 'sentry', dsn: 'https://test@sentry.io/1' });
      const config = getErrorTrackingConfig();
      expect(config.dsn).toBe('https://test@sentry.io/1');
    });

    test('does not throw without window.Sentry', () => {
      expect(() => {
        initErrorTracking({ service: 'sentry', dsn: 'test-dsn' });
      }).not.toThrow();
    });
  });

  // ─── reportError ──────────────────────────────────────────────────────────

  describe('reportError()', () => {
    test('does not throw when tracking is disabled', () => {
      expect(() => reportError(new Error('test'))).not.toThrow();
    });

    test('does not throw when tracking is enabled without external service', () => {
      initErrorTracking({ service: 'custom', dsn: 'x' });
      expect(() => reportError(new Error('test'))).not.toThrow();
    });

    test('accepts context object', () => {
      expect(() => reportError(new Error('test'), { user: 'test-user' })).not.toThrow();
    });

    test('accepts string error', () => {
      expect(() => reportError('string error')).not.toThrow();
    });

    test('sampleRate=1 always sends (beforeSend path)', () => {
      const beforeSend = jest.fn(() => null); // filter all errors
      initErrorTracking({ service: 'custom', dsn: 'x', sampleRate: 1, beforeSend });
      reportError(new Error('filtered'));
      // beforeSend was called and returned null — error suppressed
      expect(beforeSend).toHaveBeenCalled();
    });

    test('beforeSend returning non-null passes through', () => {
      const beforeSend = jest.fn((err) => err); // pass through
      initErrorTracking({ service: 'custom', dsn: 'x', sampleRate: 1, beforeSend });
      expect(() => reportError(new Error('pass-through'))).not.toThrow();
      expect(beforeSend).toHaveBeenCalled();
    });

    test('sentry service path (no window.Sentry) does not throw', () => {
      initErrorTracking({ service: 'sentry', dsn: 'https://key@sentry.io/1', sampleRate: 1 });
      expect(() => reportError(new Error('sentry-test'))).not.toThrow();
    });

    test('rollbar service path (no window.Rollbar) does not throw', () => {
      initErrorTracking({ service: 'rollbar', dsn: 'x', sampleRate: 1 });
      expect(() => reportError(new Error('rollbar-test'))).not.toThrow();
    });
  });

  // ─── addBreadcrumb ────────────────────────────────────────────────────────

  describe('addBreadcrumb()', () => {
    test('does not throw when tracking is disabled', () => {
      expect(() => addBreadcrumb('User clicked button')).not.toThrow();
    });

    test('does not throw when tracking enabled without window.Sentry', () => {
      initErrorTracking({ service: 'sentry', dsn: 'test' });
      expect(() => addBreadcrumb('Page loaded', 'navigation')).not.toThrow();
    });
  });

  // ─── setUserContext ───────────────────────────────────────────────────────

  describe('setUserContext()', () => {
    test('does not throw when tracking is disabled', () => {
      expect(() => setUserContext({ id: '123' })).not.toThrow();
    });

    test('does not throw when tracking enabled without external service', () => {
      initErrorTracking({ service: 'sentry', dsn: 'test' });
      expect(() => setUserContext({ id: '456', email: 'test@test.com' })).not.toThrow();
    });
  });

  // ─── getErrorTrackingConfig ───────────────────────────────────────────────

  describe('getErrorTrackingConfig()', () => {
    test('returns object with sampleRate', () => {
      const config = getErrorTrackingConfig();
      expect(typeof config.sampleRate).toBe('number');
    });

    test('returns object with environment', () => {
      const config = getErrorTrackingConfig();
      expect(typeof config.environment).toBe('string');
    });
  });
});
