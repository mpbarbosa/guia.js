/**
 * @jest-environment node
 *
 * Phase 2 — Composition root discipline
 *
 * Verifies that WebGeocodingManager exposes the three delegation methods
 * introduced in Phase 2 (planRoute, getLatestLocationSnapshot,
 * saveLocationSnapshot) so that home.ts no longer imports those services
 * directly.
 *
 * Strategy:
 *  - Method-presence tests use Object.create to avoid the heavy constructor.
 *  - Offline-cache tests call the real OfflineCacheService via the delegation
 *    path; in a Node (non-browser) environment the service uses its in-memory
 *    fallback store, so no IndexedDB setup is needed.
 *  - planRoute is tested with a global.fetch mock to avoid real HTTP calls.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import WebGeocodingManager from '../../src/coordination/WebGeocodingManager.js';
import type { CachedAddressSummary, CachedLocationSnapshot } from '../../src/coordination/WebGeocodingManager.js';

// Fake instance that skips the real constructor (only prototype methods needed).
function fakeInstance(): InstanceType<typeof WebGeocodingManager> {
  return Object.create(WebGeocodingManager.prototype) as InstanceType<typeof WebGeocodingManager>;
}

describe('WebGeocodingManager — Phase 2 delegation methods', () => {
  describe('method presence on prototype', () => {
    it('exposes planRoute', () => {
      expect(typeof WebGeocodingManager.prototype.planRoute).toBe('function');
    });

    it('exposes getLatestLocationSnapshot', () => {
      expect(typeof WebGeocodingManager.prototype.getLatestLocationSnapshot).toBe('function');
    });

    it('exposes saveLocationSnapshot', () => {
      expect(typeof WebGeocodingManager.prototype.saveLocationSnapshot).toBe('function');
    });

    it('each method returns a Promise', () => {
      const wgm = fakeInstance();
      // getLatestLocationSnapshot — no network needed; in-memory fallback returns null
      const p = wgm.getLatestLocationSnapshot();
      expect(p).toBeInstanceOf(Promise);
      return p; // let Jest await it so the promise doesn't leak
    });
  });

  // ── offline cache delegation ──────────────────────────────────────────────

  describe('offline-cache delegation (in-memory fallback)', () => {
    // The OfflineCacheService module keeps a module-level fallback Map.
    // Reset it between tests by using its own reset helper.
    beforeEach(async () => {
      const { __resetOfflineCacheForTests } = await import(
        '../../src/services/OfflineCacheService.js'
      );
      await __resetOfflineCacheForTests();
    });

    it('getLatestLocationSnapshot returns null when no snapshot saved', async () => {
      const wgm = fakeInstance();
      const result = await wgm.getLatestLocationSnapshot();
      expect(result).toBeNull();
    });

    it('saveLocationSnapshot persists a snapshot that getLatestLocationSnapshot retrieves', async () => {
      const wgm = fakeInstance();
      const address: CachedAddressSummary = {
        logradouro: 'Rua Teste',
        bairro: 'Bairro X',
        municipio: 'São Paulo',
        siglaUF: 'SP',
        displayText: 'Rua Teste, Bairro X, São Paulo, SP',
      };
      const snapshot: CachedLocationSnapshot = {
        latitude: -23.5505,
        longitude: -46.6333,
        timestamp: Date.now(),
        address,
      };

      const saved = await wgm.saveLocationSnapshot(snapshot);
      expect(saved.latitude).toBe(snapshot.latitude);
      expect(saved.longitude).toBe(snapshot.longitude);
      expect(saved.address?.displayText).toBe(address.displayText);

      const retrieved = await wgm.getLatestLocationSnapshot();
      expect(retrieved).not.toBeNull();
      expect(retrieved!.latitude).toBe(snapshot.latitude);
    });

    it('saveLocationSnapshot round-trips address with null fields', async () => {
      const wgm = fakeInstance();
      const snapshot: CachedLocationSnapshot = {
        latitude: -3.1,
        longitude: -60.0,
        timestamp: 1000,
        address: null,
      };

      await wgm.saveLocationSnapshot(snapshot);
      const retrieved = await wgm.getLatestLocationSnapshot();
      expect(retrieved!.address).toBeNull();
    });
  });

  // ── planRoute delegation ──────────────────────────────────────────────────

  describe('planRoute delegation', () => {
    let fetchSpy: jest.SpiedFunction<typeof global.fetch>;

    beforeEach(() => {
      fetchSpy = jest.spyOn(global, 'fetch' as keyof typeof global) as jest.SpiedFunction<typeof global.fetch>;
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    it('calls global.fetch (Nominatim + OSRM) when planning by query', async () => {
      // 1st fetch: Nominatim geocode for origin
      // 2nd fetch: Nominatim geocode for destination
      // 3rd fetch: OSRM route
      const nominatimResult = [{ display_name: 'Rua A, SP', lat: '-23.5', lon: '-46.6' }];
      const osrmResult = {
        code: 'Ok',
        routes: [{
          distance: 1000,
          duration: 120,
          legs: [{ steps: [{ distance: 1000, duration: 120, name: 'Rua A', maneuver: { type: 'depart' } }] }],
        }],
        waypoints: [
          { location: [-46.6, -23.5], name: 'Rua A' },
          { location: [-46.61, -23.51], name: 'Rua B' },
        ],
      };

      fetchSpy
        .mockResolvedValueOnce({ ok: true, json: async () => nominatimResult } as Response)
        .mockResolvedValueOnce({ ok: true, json: async () => nominatimResult } as Response)
        .mockResolvedValueOnce({ ok: true, json: async () => osrmResult } as Response);

      const wgm = fakeInstance();
      const route = await wgm.planRoute({
        origin: { query: 'Rua A, São Paulo' },
        destination: { query: 'Rua B, São Paulo' },
      });

      expect(fetchSpy).toHaveBeenCalled();
      expect(route).toBeDefined();
      expect(typeof route.distanceMeters).toBe('number');
      expect(typeof route.durationSeconds).toBe('number');
    });

    it('propagates errors from the route service', async () => {
      fetchSpy.mockRejectedValue(new Error('network failure'));

      const wgm = fakeInstance();
      await expect(
        wgm.planRoute({
          origin: { query: 'A' },
          destination: { query: 'B' },
        }),
      ).rejects.toThrow();
    });
  });
});
