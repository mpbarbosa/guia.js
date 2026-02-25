/**
 * @jest-environment node
 */

/**
 * @file defaults.test.js
 * @description Tests for src/config/defaults.js constants and createDefaultConfig().
 */

import {
  APP_VERSION,
  APP_NAME,
  APP_AUTHOR,
  CORS_PROXY,
  ENABLE_CORS_FALLBACK,
  NOMINATIM_API_BASE,
  TRACKING_INTERVAL,
  MINIMUM_DISTANCE_CHANGE,
  MINIMUM_TIME_CHANGE,
  QUEUE_TIMER_INTERVAL,
  NO_REFERENCE_PLACE,
  ADDRESS_FETCHED_EVENT,
  GEOCODING_ERROR_EVENT,
  IBGE_LOADING_MESSAGE,
  IBGE_ERROR_MESSAGE,
  IBGE_UNAVAILABLE_MESSAGE,
  VALID_REF_PLACE_CLASSES,
  MOBILE_ACCURACY_THRESHOLDS,
  DESKTOP_ACCURACY_THRESHOLDS,
  GEOLOCATION_OPTIONS,
  OSM_BASE_URL,
  createDefaultConfig,
} from '../../src/config/defaults.js';

describe('defaults', () => {

  // ── APP_VERSION ─────────────────────────────────────────────────────────────

  describe('APP_VERSION', () => {
    test('has major, minor, patch as numbers', () => {
      expect(typeof APP_VERSION.major).toBe('number');
      expect(typeof APP_VERSION.minor).toBe('number');
      expect(typeof APP_VERSION.patch).toBe('number');
    });

    test('has prerelease string', () => {
      expect(typeof APP_VERSION.prerelease).toBe('string');
      expect(APP_VERSION.prerelease.length).toBeGreaterThan(0);
    });

    test('toString() returns semver-like string', () => {
      const str = APP_VERSION.toString();
      expect(str).toMatch(/^\d+\.\d+\.\d+-\w+$/);
    });
  });

  // ── String constants ─────────────────────────────────────────────────────────

  test('APP_NAME is a non-empty string', () => {
    expect(typeof APP_NAME).toBe('string');
    expect(APP_NAME.length).toBeGreaterThan(0);
  });

  test('APP_AUTHOR is a non-empty string', () => {
    expect(typeof APP_AUTHOR).toBe('string');
    expect(APP_AUTHOR.length).toBeGreaterThan(0);
  });

  test('CORS_PROXY is null by default', () => {
    expect(CORS_PROXY).toBeNull();
  });

  test('ENABLE_CORS_FALLBACK is boolean', () => {
    expect(typeof ENABLE_CORS_FALLBACK).toBe('boolean');
  });

  test('NOMINATIM_API_BASE starts with https://', () => {
    expect(NOMINATIM_API_BASE).toMatch(/^https:\/\//);
  });

  test('OSM_BASE_URL includes format=json', () => {
    expect(OSM_BASE_URL).toContain('format=json');
  });

  // ── Timing constants ─────────────────────────────────────────────────────────

  test('TRACKING_INTERVAL is a positive number', () => {
    expect(typeof TRACKING_INTERVAL).toBe('number');
    expect(TRACKING_INTERVAL).toBeGreaterThan(0);
  });

  test('MINIMUM_DISTANCE_CHANGE is 20 metres', () => {
    expect(MINIMUM_DISTANCE_CHANGE).toBe(20);
  });

  test('MINIMUM_TIME_CHANGE is 30 seconds (30000 ms)', () => {
    expect(MINIMUM_TIME_CHANGE).toBe(30000);
  });

  test('QUEUE_TIMER_INTERVAL is a positive number', () => {
    expect(typeof QUEUE_TIMER_INTERVAL).toBe('number');
    expect(QUEUE_TIMER_INTERVAL).toBeGreaterThan(0);
  });

  // ── Event names ──────────────────────────────────────────────────────────────

  test('ADDRESS_FETCHED_EVENT is a non-empty string', () => {
    expect(typeof ADDRESS_FETCHED_EVENT).toBe('string');
    expect(ADDRESS_FETCHED_EVENT.length).toBeGreaterThan(0);
  });

  test('GEOCODING_ERROR_EVENT is a non-empty string', () => {
    expect(typeof GEOCODING_ERROR_EVENT).toBe('string');
    expect(GEOCODING_ERROR_EVENT.length).toBeGreaterThan(0);
  });

  // ── UI messages ──────────────────────────────────────────────────────────────

  test('IBGE messages are non-empty strings', () => {
    expect(typeof IBGE_LOADING_MESSAGE).toBe('string');
    expect(IBGE_LOADING_MESSAGE.length).toBeGreaterThan(0);
    expect(typeof IBGE_ERROR_MESSAGE).toBe('string');
    expect(IBGE_ERROR_MESSAGE.length).toBeGreaterThan(0);
    expect(typeof IBGE_UNAVAILABLE_MESSAGE).toBe('string');
    expect(IBGE_UNAVAILABLE_MESSAGE.length).toBeGreaterThan(0);
  });

  test('NO_REFERENCE_PLACE is a non-empty string', () => {
    expect(typeof NO_REFERENCE_PLACE).toBe('string');
    expect(NO_REFERENCE_PLACE.length).toBeGreaterThan(0);
  });

  // ── Frozen arrays ────────────────────────────────────────────────────────────

  describe('VALID_REF_PLACE_CLASSES', () => {
    test('is frozen', () => {
      expect(Object.isFrozen(VALID_REF_PLACE_CLASSES)).toBe(true);
    });

    test('contains expected OSM classes', () => {
      expect(VALID_REF_PLACE_CLASSES).toContain('place');
      expect(VALID_REF_PLACE_CLASSES).toContain('shop');
      expect(VALID_REF_PLACE_CLASSES).toContain('amenity');
      expect(VALID_REF_PLACE_CLASSES).toContain('railway');
      expect(VALID_REF_PLACE_CLASSES).toContain('building');
    });

    test('cannot be mutated (frozen)', () => {
      expect(() => { VALID_REF_PLACE_CLASSES.push('test'); }).toThrow();
    });
  });

  describe('MOBILE_ACCURACY_THRESHOLDS', () => {
    test('is frozen', () => {
      expect(Object.isFrozen(MOBILE_ACCURACY_THRESHOLDS)).toBe(true);
    });

    test('has at least one threshold', () => {
      expect(MOBILE_ACCURACY_THRESHOLDS.length).toBeGreaterThan(0);
    });
  });

  describe('DESKTOP_ACCURACY_THRESHOLDS', () => {
    test('is frozen', () => {
      expect(Object.isFrozen(DESKTOP_ACCURACY_THRESHOLDS)).toBe(true);
    });

    test('has at least one threshold', () => {
      expect(DESKTOP_ACCURACY_THRESHOLDS.length).toBeGreaterThan(0);
    });

    test('mobile thresholds are stricter (more entries) than desktop', () => {
      expect(MOBILE_ACCURACY_THRESHOLDS.length).toBeGreaterThanOrEqual(
        DESKTOP_ACCURACY_THRESHOLDS.length
      );
    });
  });

  // ── GEOLOCATION_OPTIONS ──────────────────────────────────────────────────────

  describe('GEOLOCATION_OPTIONS', () => {
    test('is frozen', () => {
      expect(Object.isFrozen(GEOLOCATION_OPTIONS)).toBe(true);
    });

    test('enableHighAccuracy is true', () => {
      expect(GEOLOCATION_OPTIONS.enableHighAccuracy).toBe(true);
    });

    test('timeout is a positive number', () => {
      expect(typeof GEOLOCATION_OPTIONS.timeout).toBe('number');
      expect(GEOLOCATION_OPTIONS.timeout).toBeGreaterThan(0);
    });

    test('maximumAge is 0 (no cached positions)', () => {
      expect(GEOLOCATION_OPTIONS.maximumAge).toBe(0);
    });
  });

  // ── createDefaultConfig ──────────────────────────────────────────────────────

  describe('createDefaultConfig()', () => {
    let config;

    beforeEach(() => {
      config = createDefaultConfig();
    });

    test('returns a plain object', () => {
      expect(config).not.toBeNull();
      expect(typeof config).toBe('object');
    });

    test('returns a new object each call (immutable pattern)', () => {
      const config2 = createDefaultConfig();
      expect(config).not.toBe(config2);
    });

    test('has trackingInterval matching TRACKING_INTERVAL', () => {
      expect(config.trackingInterval).toBe(TRACKING_INTERVAL);
    });

    test('has minimumDistanceChange matching MINIMUM_DISTANCE_CHANGE', () => {
      expect(config.minimumDistanceChange).toBe(MINIMUM_DISTANCE_CHANGE);
    });

    test('has minimumTimeChange matching MINIMUM_TIME_CHANGE', () => {
      expect(config.minimumTimeChange).toBe(MINIMUM_TIME_CHANGE);
    });

    test('validRefPlaceClasses is a copy (not the frozen original)', () => {
      expect(config.validRefPlaceClasses).not.toBe(VALID_REF_PLACE_CLASSES);
      expect(config.validRefPlaceClasses).toEqual([...VALID_REF_PLACE_CLASSES]);
    });

    test('geolocationOptions is a copy (not the frozen original)', () => {
      expect(config.geolocationOptions).not.toBe(GEOLOCATION_OPTIONS);
      expect(config.geolocationOptions).toEqual({ ...GEOLOCATION_OPTIONS });
    });

    test('notAcceptedAccuracy is null (set dynamically by device detection)', () => {
      expect(config.notAcceptedAccuracy).toBeNull();
    });

    test('openstreetmapBaseUrl matches OSM_BASE_URL', () => {
      expect(config.openstreetmapBaseUrl).toBe(OSM_BASE_URL);
    });

    test('mobileNotAcceptedAccuracy is a copy of MOBILE_ACCURACY_THRESHOLDS', () => {
      expect(config.mobileNotAcceptedAccuracy).toEqual([...MOBILE_ACCURACY_THRESHOLDS]);
    });

    test('desktopNotAcceptedAccuracy is a copy of DESKTOP_ACCURACY_THRESHOLDS', () => {
      expect(config.desktopNotAcceptedAccuracy).toEqual([...DESKTOP_ACCURACY_THRESHOLDS]);
    });
  });
});
