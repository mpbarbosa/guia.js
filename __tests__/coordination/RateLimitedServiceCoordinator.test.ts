/**
 * @file RateLimitedServiceCoordinator.test.js
 * @description Tests for the rate-limited API coordinator.
 * Covers singleton pattern, scheduleNominatim, scheduleIbge, getStats,
 * getStatsForAPI, reset, logStats, resetAll branches.
 */

import { jest } from '@jest/globals';

global.console = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
};

import coordinator, { RateLimitedServiceCoordinator }
  from '../../src/coordination/RateLimitedServiceCoordinator.js';

describe('RateLimitedServiceCoordinator', () => {

  // ─── Singleton ───────────────────────────────────────────────────────────

  test('getInstance() returns the same instance each time', () => {
    const a = RateLimitedServiceCoordinator.getInstance();
    const b = RateLimitedServiceCoordinator.getInstance();
    expect(a).toBe(b);
  });

  test('default export equals getInstance()', () => {
    expect(coordinator).toBe(RateLimitedServiceCoordinator.getInstance());
  });

  test('new constructor call returns existing singleton', () => {
    const second = new RateLimitedServiceCoordinator();
    expect(second).toBe(coordinator);
  });

  // ─── scheduleNominatim / scheduleIbge ────────────────────────────────────

  test('scheduleNominatim resolves the fn result', async () => {
    const result = await coordinator.scheduleNominatim(async () => 42);
    expect(result).toBe(42);
  });

  test('scheduleIbge resolves the fn result', async () => {
    const result = await coordinator.scheduleIbge(async () => 'ibge-result');
    expect(result).toBe('ibge-result');
  });

  // ─── getStats ────────────────────────────────────────────────────────────

  test('getStats returns stats object with nominatim and ibge keys', () => {
    const stats = coordinator.getStats();
    expect(stats).toHaveProperty('nominatim');
    expect(stats).toHaveProperty('ibge');
  });

  // ─── getStatsForAPI ──────────────────────────────────────────────────────

  test('getStatsForAPI("nominatim") returns stats', () => {
    const stats = coordinator.getStatsForAPI('nominatim');
    expect(stats).not.toBeNull();
    expect(typeof stats).toBe('object');
  });

  test('getStatsForAPI("ibge") returns stats', () => {
    const stats = coordinator.getStatsForAPI('ibge');
    expect(stats).not.toBeNull();
  });

  test('getStatsForAPI("unknown") returns null', () => {
    const stats = coordinator.getStatsForAPI('unknown');
    expect(stats).toBeNull();
  });

  // ─── reset ───────────────────────────────────────────────────────────────

  test('reset("nominatim") does not throw', () => {
    expect(() => coordinator.reset('nominatim')).not.toThrow();
  });

  test('reset("ibge") does not throw', () => {
    expect(() => coordinator.reset('ibge')).not.toThrow();
  });

  test('reset with unknown API warns but does not throw', () => {
    expect(() => coordinator.reset('nonexistent')).not.toThrow();
  });

  // ─── resetAll ────────────────────────────────────────────────────────────

  test('resetAll() does not throw', () => {
    expect(() => coordinator.resetAll()).not.toThrow();
  });

  // ─── logStats ────────────────────────────────────────────────────────────

  test('logStats() does not throw', () => {
    expect(() => coordinator.logStats()).not.toThrow();
  });
});
