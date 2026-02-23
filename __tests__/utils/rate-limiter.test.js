/**
 * @file rate-limiter.test.js
 * @description Tests for the RateLimiter token-bucket implementation
 * and createDefaultLimiters factory.
 * @since 0.11.0-alpha
 */

import { jest } from '@jest/globals';
import RateLimiter, { createDefaultLimiters } from '../../src/utils/rate-limiter.js';

// Silence logger output during tests
jest.mock('../../src/utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('RateLimiter', () => {
  let limiter;

  beforeEach(() => {
    jest.useFakeTimers();
    limiter = new RateLimiter({ maxRequests: 3, interval: 1000, name: 'Test' });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ─── constructor ───────────────────────────────────────────────────────────

  describe('constructor', () => {
    test('initialises tokens to maxRequests', () => {
      expect(limiter.tokens).toBe(3);
    });

    test('stores name', () => {
      expect(limiter.name).toBe('Test');
    });

    test('starts with empty queue', () => {
      expect(limiter.queue.length).toBe(0);
    });

    test('starts with zeroed statistics', () => {
      expect(limiter.stats.totalRequests).toBe(0);
      expect(limiter.stats.rejectedRequests).toBe(0);
      expect(limiter.stats.queuedRequests).toBe(0);
    });

    test('defaults interval to 60000', () => {
      const l = new RateLimiter({ maxRequests: 10 });
      expect(l.interval).toBe(60000);
    });

    test('defaults maxQueueSize to 100', () => {
      const l = new RateLimiter({ maxRequests: 10 });
      expect(l.maxQueueSize).toBe(100);
    });
  });

  // ─── schedule — immediate execution ───────────────────────────────────────

  describe('schedule() — immediate execution', () => {
    test('executes function immediately when tokens available', async () => {
      const fn = jest.fn().mockResolvedValue('result');
      const result = await limiter.schedule(fn);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(result).toBe('result');
    });

    test('decrements token count on each call', async () => {
      await limiter.schedule(() => Promise.resolve());
      expect(limiter.tokens).toBe(2);
      await limiter.schedule(() => Promise.resolve());
      expect(limiter.tokens).toBe(1);
    });

    test('increments totalRequests stat', async () => {
      await limiter.schedule(() => Promise.resolve());
      await limiter.schedule(() => Promise.resolve());
      expect(limiter.stats.totalRequests).toBe(2);
    });
  });

  // ─── schedule — queue full rejection ──────────────────────────────────────

  describe('schedule() — queue full', () => {
    test('throws when queue is full', async () => {
      const tiny = new RateLimiter({ maxRequests: 0, interval: 60000, maxQueueSize: 0, name: 'Tiny' });
      // Override tokens to be 0 so every call must queue
      tiny.tokens = 0;
      await expect(tiny.schedule(() => Promise.resolve())).rejects.toThrow(/queue full/i);
    });

    test('increments rejectedRequests stat on full queue', async () => {
      const tiny = new RateLimiter({ maxRequests: 1, interval: 60000, maxQueueSize: 0, name: 'Tiny' });
      tiny.tokens = 0;
      try { await tiny.schedule(() => Promise.resolve()); } catch (_) {}
      expect(tiny.stats.rejectedRequests).toBe(1);
    });
  });

  // ─── schedule — queue path ────────────────────────────────────────────────

  describe('schedule() — queueing path', () => {
    test('queues request when tokens are 0 and resolves when token available', async () => {
      // Use fake timers (set by beforeEach) — no real-timer switching needed
      const queued = new RateLimiter({ maxRequests: 1, interval: 200, maxQueueSize: 5, name: 'QueueTest' });
      queued.tokens = 0;

      const resultPromise = queued.schedule(() => Promise.resolve('done'));
      // Advance fake timers to trigger the refill setTimeout
      await jest.advanceTimersByTimeAsync(200);
      const result = await resultPromise;
      expect(result).toBe('done');
    });

    test('increments queuedRequests stat when queued', async () => {
      // Use fake timers (set by beforeEach) — no real-timer switching needed
      const queued = new RateLimiter({ maxRequests: 1, interval: 200, maxQueueSize: 5, name: 'QueueTest2' });
      queued.tokens = 0;

      const p = queued.schedule(() => Promise.resolve());
      // Stats are incremented synchronously before the promise resolves
      expect(queued.stats.queuedRequests).toBeGreaterThanOrEqual(1);
      await jest.advanceTimersByTimeAsync(200);
      await p;
    });
  });



  describe('reset()', () => {
    test('restores tokens to maxRequests', async () => {
      await limiter.schedule(() => Promise.resolve());
      limiter.reset();
      expect(limiter.tokens).toBe(3);
    });

    test('clears queue', () => {
      limiter.queue.push({ fn: jest.fn(), resolve: jest.fn(), reject: jest.fn(), timestamp: Date.now() });
      limiter.reset();
      expect(limiter.queue.length).toBe(0);
    });

    test('resets all stats to zero', async () => {
      await limiter.schedule(() => Promise.resolve());
      limiter.reset();
      expect(limiter.stats.totalRequests).toBe(0);
      expect(limiter.stats.rejectedRequests).toBe(0);
    });
  });

  // ─── getStats ─────────────────────────────────────────────────────────────

  describe('getStats()', () => {
    test('returns object with currentTokens', () => {
      const stats = limiter.getStats();
      expect(stats.currentTokens).toBe(3);
    });

    test('returns object with queueLength', () => {
      const stats = limiter.getStats();
      expect(stats.queueLength).toBe(0);
    });

    test('returns object with totalRequests', () => {
      const stats = limiter.getStats();
      expect(typeof stats.totalRequests).toBe('number');
    });
  });
});

// ─── createDefaultLimiters ────────────────────────────────────────────────────

describe('createDefaultLimiters()', () => {
  test('returns nominatim limiter', () => {
    const limiters = createDefaultLimiters();
    expect(limiters.nominatim).toBeInstanceOf(RateLimiter);
  });

  test('returns ibge limiter', () => {
    const limiters = createDefaultLimiters();
    expect(limiters.ibge).toBeInstanceOf(RateLimiter);
  });

  test('nominatim limiter has 60 maxRequests', () => {
    const limiters = createDefaultLimiters();
    expect(limiters.nominatim.maxRequests).toBe(60);
  });

  test('ibge limiter has 120 maxRequests', () => {
    const limiters = createDefaultLimiters();
    expect(limiters.ibge.maxRequests).toBe(120);
  });
});
