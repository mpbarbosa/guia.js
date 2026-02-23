/**
 * @jest-environment node
 */

/**
 * @file AddressCache.test.js
 * @description Tests for src/data/AddressCache.js — singleton, caching,
 * change detection, and callback registration.
 */

import { jest, beforeEach, afterEach, describe, test, expect } from '@jest/globals';

jest.mock('../../src/utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock TimerManager so the internal setInterval doesn't leak into tests
jest.mock('../../src/utils/TimerManager.js', () => ({
  default: { setInterval: jest.fn(), clearTimer: jest.fn() },
}));

let AddressCache;

const makeRawData = (overrides = {}) => ({
  display_name: 'Rua das Flores, 123, Centro, Recife, PE',
  address: {
    road: overrides.road ?? 'Rua das Flores',
    house_number: '123',
    neighbourhood: overrides.bairro ?? 'Centro',
    city: overrides.municipio ?? 'Recife',
    state: 'Pernambuco',
    postcode: '50000-000',
    country: 'Brasil',
    country_code: 'br',
  },
  ...overrides._root,
});

beforeEach(async () => {
  // Reset module registry so singleton is recreated for each test
  jest.resetModules();
  ({ default: AddressCache } = await import('../../src/data/AddressCache.js'));
  AddressCache.instance = null; // force fresh singleton
});

afterEach(() => {
  AddressCache.instance = null;
});

describe('AddressCache', () => {

  // ── Singleton ────────────────────────────────────────────────────────────────

  describe('getInstance()', () => {
    test('returns an AddressCache instance', () => {
      const cache = AddressCache.getInstance();
      expect(cache).toBeInstanceOf(AddressCache);
    });

    test('always returns the same instance (singleton)', () => {
      const a = AddressCache.getInstance();
      const b = AddressCache.getInstance();
      expect(a).toBe(b);
    });
  });

  // ── generateCacheKey ─────────────────────────────────────────────────────────

  describe('generateCacheKey()', () => {
    test('returns a string for valid raw data', () => {
      const cache = AddressCache.getInstance();
      const key = cache.generateCacheKey(makeRawData());
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    test('returns null for null/undefined data', () => {
      const cache = AddressCache.getInstance();
      expect(cache.generateCacheKey(null)).toBeNull();
      expect(cache.generateCacheKey(undefined)).toBeNull();
    });

    test('static and instance methods return same key', () => {
      const raw = makeRawData();
      const cache = AddressCache.getInstance();
      expect(cache.generateCacheKey(raw)).toBe(AddressCache.generateCacheKey(raw));
    });
  });

  // ── getBrazilianStandardAddress ──────────────────────────────────────────────

  describe('getBrazilianStandardAddress()', () => {
    test('returns a BrazilianStandardAddress object', () => {
      const cache = AddressCache.getInstance();
      const result = cache.getBrazilianStandardAddress(makeRawData());
      expect(result).not.toBeNull();
      expect(typeof result).toBe('object');
    });

    test('returns the same object on second call (cache hit)', () => {
      const cache = AddressCache.getInstance();
      const raw = makeRawData();
      const first = cache.getBrazilianStandardAddress(raw);
      const second = cache.getBrazilianStandardAddress(raw);
      expect(first).toBe(second);
    });

    test('returns different objects for different raw data', () => {
      const cache = AddressCache.getInstance();
      const a = cache.getBrazilianStandardAddress(makeRawData({ road: 'Rua A', _root: { place_id: 1 } }));
      const b = cache.getBrazilianStandardAddress(makeRawData({ road: 'Rua B', _root: { place_id: 2 } }));
      expect(a).not.toBe(b);
    });
  });

  // ── clearCache ───────────────────────────────────────────────────────────────

  describe('clearCache()', () => {
    test('clears the cache so next call returns a new object', () => {
      const cache = AddressCache.getInstance();
      const raw = makeRawData();
      const first = cache.getBrazilianStandardAddress(raw);
      cache.clearCache();
      const second = cache.getBrazilianStandardAddress(raw);
      expect(first).not.toBe(second);
    });

    test('static clearCache() delegates to singleton', () => {
      const raw = makeRawData();
      const cache = AddressCache.getInstance();
      const first = cache.getBrazilianStandardAddress(raw);
      AddressCache.clearCache();
      const second = cache.getBrazilianStandardAddress(raw);
      expect(first).not.toBe(second);
    });
  });

  // ── Callbacks ────────────────────────────────────────────────────────────────

  describe('setLogradouroChangeCallback()', () => {
    test('stores callback retrievable via getLogradouroChangeCallback()', () => {
      const cache = AddressCache.getInstance();
      const cb = jest.fn();
      cache.setLogradouroChangeCallback(cb);
      expect(cache.getLogradouroChangeCallback()).toBe(cb);
    });

    test('static setter/getter delegates to singleton', () => {
      const cb = jest.fn();
      AddressCache.setLogradouroChangeCallback(cb);
      expect(AddressCache.getLogradouroChangeCallback()).toBe(cb);
    });
  });

  describe('setBairroChangeCallback()', () => {
    test('stores and retrieves bairro callback', () => {
      const cache = AddressCache.getInstance();
      const cb = jest.fn();
      cache.setBairroChangeCallback(cb);
      expect(cache.getBairroChangeCallback()).toBe(cb);
    });
  });

  describe('setMunicipioChangeCallback()', () => {
    test('stores and retrieves municipio callback', () => {
      const cache = AddressCache.getInstance();
      const cb = jest.fn();
      cache.setMunicipioChangeCallback(cb);
      expect(cache.getMunicipioChangeCallback()).toBe(cb);
    });
  });

  // ── Change detection ─────────────────────────────────────────────────────────

  describe('hasLogradouroChanged() / hasBairroChanged() / hasMunicipioChanged()', () => {
    test('hasBairroChanged() returns false when no address is cached', () => {
      const cache = AddressCache.getInstance();
      expect(cache.hasBairroChanged()).toBe(false);
    });

    test('hasMunicipioChanged() returns false when no address is cached', () => {
      const cache = AddressCache.getInstance();
      expect(cache.hasMunicipioChanged()).toBe(false);
    });

    test('hasBairroChanged() returns true after bairro changes', () => {
      const cache = AddressCache.getInstance();
      cache.getBrazilianStandardAddress(makeRawData({ bairro: 'Centro', _root: { place_id: 10 } }));
      cache.getBrazilianStandardAddress(makeRawData({ bairro: 'Boa Vista', _root: { place_id: 11 } }));
      expect(cache.hasBairroChanged()).toBe(true);
    });

    test('hasMunicipioChanged() returns true after municipio changes', () => {
      const cache = AddressCache.getInstance();
      cache.getBrazilianStandardAddress(makeRawData({ municipio: 'Recife', _root: { place_id: 20 } }));
      cache.getBrazilianStandardAddress(makeRawData({ municipio: 'Olinda', _root: { place_id: 21 } }));
      expect(cache.hasMunicipioChanged()).toBe(true);
    });
  });

  // ── Change detail objects ─────────────────────────────────────────────────────

  describe('getBairroChangeDetails()', () => {
    test('returns object with hasChanged, current, previous, timestamp', () => {
      const cache = AddressCache.getInstance();
      const details = cache.getBairroChangeDetails();
      expect(details).toHaveProperty('hasChanged');
      expect(details).toHaveProperty('current');
      expect(details).toHaveProperty('previous');
      expect(details).toHaveProperty('timestamp');
      expect(typeof details.timestamp).toBe('number');
    });
  });

  describe('getMunicipioChangeDetails()', () => {
    test('returns object with hasChanged, current.municipio, previous.municipio', () => {
      const cache = AddressCache.getInstance();
      const details = cache.getMunicipioChangeDetails();
      expect(details).toHaveProperty('hasChanged');
      expect(details.current).toHaveProperty('municipio');
      expect(details.previous).toHaveProperty('municipio');
    });

    test('hasChanged is true when municipio changed', () => {
      const cache = AddressCache.getInstance();
      cache.getBrazilianStandardAddress(makeRawData({ municipio: 'Recife', _root: { place_id: 30 } }));
      cache.getBrazilianStandardAddress(makeRawData({ municipio: 'Olinda', _root: { place_id: 31 } }));
      const details = cache.getMunicipioChangeDetails();
      expect(details.hasChanged).toBe(true);
    });

    test('hasChanged is false when municipio is the same', () => {
      const cache = AddressCache.getInstance();
      // Use different road to force different cache keys, same municipio
      cache.getBrazilianStandardAddress(makeRawData({ road: 'Rua Alpha', municipio: 'Recife', _root: { place_id: 40 } }));
      cache.getBrazilianStandardAddress(makeRawData({ road: 'Rua Beta',  municipio: 'Recife', _root: { place_id: 41 } }));
      const details = cache.getMunicipioChangeDetails();
      expect(details.hasChanged).toBe(false);
    });
  });

  // ── cleanExpiredEntries ───────────────────────────────────────────────────────

  describe('cleanExpiredEntries()', () => {
    test('does not throw on empty cache', () => {
      const cache = AddressCache.getInstance();
      expect(() => cache.cleanExpiredEntries()).not.toThrow();
    });

    test('static cleanExpiredEntries() delegates to singleton', () => {
      expect(() => AddressCache.cleanExpiredEntries()).not.toThrow();
    });
  });
});
