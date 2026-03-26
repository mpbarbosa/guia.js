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

  // ── Confirmation buffers (v0.12.10-alpha) ─────────────────────────────────────
  //
  // Each callback should fire only after the same address field has been seen
  // LOGRADOURO_CONFIRMATION_COUNT (3) consecutive times.

  describe('confirmation buffer — logradouro', () => {
    // Each call needs a unique cache key (road + house_number + neighbourhood + city + postcode)
    // We vary house_number to force unique cache entries while keeping road identical
    const makeRoad = (road, id) => ({
      display_name: `${road}, ${id}, Centro, Recife, PE`,
      address: {
        road,
        house_number: String(id),  // unique per call → unique cache key
        neighbourhood: 'Centro',
        city: 'Recife',
        state: 'Pernambuco',
        postcode: '50000-000',
        country: 'Brasil',
        country_code: 'br',
      },
    });

    test('logradouro callback NOT fired on first new-street observation', () => {
      const cache = AddressCache.getInstance();
      const cb = jest.fn();
      cache.setLogradouroChangeCallback(cb);
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 1));
      cache.getBrazilianStandardAddress(makeRoad('Rua B', 2)); // 1st occurrence
      expect(cb).not.toHaveBeenCalled();
    });

    test('logradouro callback NOT fired on second consecutive occurrence', () => {
      const cache = AddressCache.getInstance();
      const cb = jest.fn();
      cache.setLogradouroChangeCallback(cb);
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 1));
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 2)); // establish confirmed
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 3)); // confirm 'Rua A'
      cache.getBrazilianStandardAddress(makeRoad('Rua B', 4)); // 1st
      cache.getBrazilianStandardAddress(makeRoad('Rua B', 5)); // 2nd
      expect(cb).not.toHaveBeenCalled();
    });

    test('logradouro callback IS fired on third consecutive occurrence', () => {
      const cache = AddressCache.getInstance();
      const cb = jest.fn();
      cache.setLogradouroChangeCallback(cb);
      // Establish confirmed 'Rua A'
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 1));
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 2));
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 3));
      // 3 consecutive 'Rua B'
      cache.getBrazilianStandardAddress(makeRoad('Rua B', 4)); // 1st
      cache.getBrazilianStandardAddress(makeRoad('Rua B', 5)); // 2nd
      cache.getBrazilianStandardAddress(makeRoad('Rua B', 6)); // 3rd → fires
      expect(cb).toHaveBeenCalledTimes(1);
    });

    test('logradouro callback NOT fired when street alternates (jitter)', () => {
      const cache = AddressCache.getInstance();
      const cb = jest.fn();
      cache.setLogradouroChangeCallback(cb);
      // Establish confirmed 'Rua A'
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 1));
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 2));
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 3));
      // Jitter
      cache.getBrazilianStandardAddress(makeRoad('Rua B', 4)); // pending B, count=1
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 5)); // back to confirmed — clears pending
      cache.getBrazilianStandardAddress(makeRoad('Rua B', 6)); // pending B, count=1 again
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('confirmation buffer — bairro', () => {
    const makeN = (bairro, id) => ({
      display_name: `Rua X, ${id}, ${bairro}, Recife, PE`,
      address: {
        road: 'Rua X',
        house_number: String(id),
        neighbourhood: bairro,
        city: 'Recife',
        state: 'Pernambuco',
        postcode: '50000-000',
        country: 'Brasil',
        country_code: 'br',
      },
    });

    test('bairro callback NOT fired on first/second occurrence', () => {
      const cache = AddressCache.getInstance();
      const cb = jest.fn();
      cache.setBairroChangeCallback(cb);
      // Establish confirmed bairro
      cache.getBrazilianStandardAddress(makeN('Centro', 1));
      cache.getBrazilianStandardAddress(makeN('Centro', 2));
      cache.getBrazilianStandardAddress(makeN('Centro', 3));
      // Two occurrences of new bairro — should not fire
      cache.getBrazilianStandardAddress(makeN('Boa Viagem', 4));
      cache.getBrazilianStandardAddress(makeN('Boa Viagem', 5));
      expect(cb).not.toHaveBeenCalled();
    });

    test('bairro callback IS fired on third consecutive occurrence', () => {
      const cache = AddressCache.getInstance();
      const cb = jest.fn();
      cache.setBairroChangeCallback(cb);
      cache.getBrazilianStandardAddress(makeN('Centro', 1));
      cache.getBrazilianStandardAddress(makeN('Centro', 2));
      cache.getBrazilianStandardAddress(makeN('Centro', 3));
      cache.getBrazilianStandardAddress(makeN('Boa Viagem', 4));
      cache.getBrazilianStandardAddress(makeN('Boa Viagem', 5));
      cache.getBrazilianStandardAddress(makeN('Boa Viagem', 6));
      expect(cb).toHaveBeenCalledTimes(1);
    });
  });

  describe('confirmation buffer — municipio', () => {
    const makeM = (municipio, id) => ({
      display_name: `Rua X, ${id}, Centro, ${municipio}, PE`,
      address: {
        road: 'Rua X',
        house_number: String(id),
        neighbourhood: 'Centro',
        city: municipio,
        state: 'Pernambuco',
        postcode: '50000-000',
        country: 'Brasil',
        country_code: 'br',
      },
    });

    test('municipio callback NOT fired on first/second occurrence', () => {
      const cache = AddressCache.getInstance();
      const cb = jest.fn();
      cache.setMunicipioChangeCallback(cb);
      cache.getBrazilianStandardAddress(makeM('Recife', 1));
      cache.getBrazilianStandardAddress(makeM('Recife', 2));
      cache.getBrazilianStandardAddress(makeM('Recife', 3));
      cache.getBrazilianStandardAddress(makeM('Olinda', 4));
      cache.getBrazilianStandardAddress(makeM('Olinda', 5));
      expect(cb).not.toHaveBeenCalled();
    });

    test('municipio callback IS fired on third consecutive occurrence', () => {
      const cache = AddressCache.getInstance();
      const cb = jest.fn();
      cache.setMunicipioChangeCallback(cb);
      cache.getBrazilianStandardAddress(makeM('Recife', 1));
      cache.getBrazilianStandardAddress(makeM('Recife', 2));
      cache.getBrazilianStandardAddress(makeM('Recife', 3));
      cache.getBrazilianStandardAddress(makeM('Olinda', 4));
      cache.getBrazilianStandardAddress(makeM('Olinda', 5));
      cache.getBrazilianStandardAddress(makeM('Olinda', 6));
      expect(cb).toHaveBeenCalledTimes(1);
    });
  });

  describe('setPendingConfirmationCallback()', () => {
    const makeRoad = (road, id) => ({
      display_name: `${road}, ${id}, Centro, Recife, PE`,
      address: {
        road,
        house_number: String(id),
        neighbourhood: 'Centro',
        city: 'Recife',
        state: 'Pernambuco',
        postcode: '50000-000',
        country: 'Brasil',
        country_code: 'br',
      },
    });

    test('fires with true when a buffer enters pending state', () => {
      const cache = AddressCache.getInstance();
      const pendingCb = jest.fn();
      cache.setPendingConfirmationCallback(pendingCb);
      // Establish confirmed 'Rua A'
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 1));
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 2));
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 3));
      // Introduce new street (enters pending) — should fire true
      cache.getBrazilianStandardAddress(makeRoad('Rua B', 4));
      const trueCalls = pendingCb.mock.calls.filter(([v]) => v === true);
      expect(trueCalls.length).toBeGreaterThanOrEqual(1);
    });

    test('fires with false when all buffers settle after confirmation', () => {
      const cache = AddressCache.getInstance();
      const pendingCb = jest.fn();
      cache.setPendingConfirmationCallback(pendingCb);
      // Establish confirmed 'Rua A' (bairro/municipio also confirm here)
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 1));
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 2));
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 3));
      // Enter pending with 'Rua B'
      cache.getBrazilianStandardAddress(makeRoad('Rua B', 4));
      cache.getBrazilianStandardAddress(makeRoad('Rua B', 5));
      cache.getBrazilianStandardAddress(makeRoad('Rua B', 6)); // 3rd → confirms, pending clears
      // Last call should have been false (settled)
      const calls = pendingCb.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBe(false);
    });

    test('does not fire redundant identical state transitions', () => {
      const cache = AddressCache.getInstance();
      const pendingCb = jest.fn();
      cache.setPendingConfirmationCallback(pendingCb);
      // Establish confirmed 'Rua A' (burns through initial pending transitions)
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 1));
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 2));
      cache.getBrazilianStandardAddress(makeRoad('Rua A', 3)); // confirmed — fires false
      pendingCb.mockClear(); // isolate from previous transitions
      // Introduce 'Rua B' — first triggers true only once
      cache.getBrazilianStandardAddress(makeRoad('Rua B', 4)); // → true
      cache.getBrazilianStandardAddress(makeRoad('Rua B', 5)); // still pending, no re-fire
      const trueCalls = pendingCb.mock.calls.filter(([v]) => v === true);
      expect(trueCalls).toHaveLength(1);
    });
  });
});
