/**
 * @jest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { __resetCityStatsCacheForTests, fetchStats } from '../../src/services/IBGECityStatsService.js';
import {
  __resetOfflineCacheForTests,
  saveCityStatsToOfflineCache,
} from '../../src/services/OfflineCacheService.js';

describe('IBGECityStatsService offline fallback', () => {
  const originalNavigator = global.navigator;

  beforeEach(async () => {
    __resetCityStatsCacheForTests();
    await __resetOfflineCacheForTests();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
    jest.resetAllMocks();
  });

  test('reuses offline stats when navigator is offline', async () => {
    await saveCityStatsToOfflineCache('Recife', 'PE', {
      ibgeCode: '2611606',
      name: 'Recife',
      uf: 'PE',
      areaKm2: 218.84,
      population: 1488920,
      populationYear: '2024',
    });

    Object.defineProperty(global, 'navigator', {
      value: { onLine: false },
      configurable: true,
      writable: true,
    });

    const stats = await fetchStats('Recife', 'PE');

    expect(stats?.ibgeCode).toBe('2611606');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('falls back to offline stats after a network failure', async () => {
    await saveCityStatsToOfflineCache('Olinda', 'PE', {
      ibgeCode: '2609600',
      name: 'Olinda',
      uf: 'PE',
      areaKm2: 41.68,
      population: 349976,
      populationYear: '2024',
    });

    (global.fetch as jest.Mock).mockRejectedValue(new Error('network down'));

    const stats = await fetchStats('Olinda', 'PE');

    expect(stats?.name).toBe('Olinda');
    expect(stats?.population).toBe(349976);
  });
});
