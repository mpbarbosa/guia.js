/**
 * @jest-environment jsdom
 */

import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  __resetOfflineCacheForTests,
  findNearestLocationSnapshot,
  getCityStatsFromOfflineCache,
  getLatestLocationSnapshot,
  saveCityStatsToOfflineCache,
  saveLocationSnapshot,
} from '../../src/services/OfflineCacheService.js';

describe('OfflineCacheService', () => {
  beforeEach(async () => {
    await __resetOfflineCacheForTests();
  });

  test('stores and retrieves the latest location snapshot', async () => {
    await saveLocationSnapshot({
      latitude: -8.063149,
      longitude: -34.871139,
      timestamp: 123,
      address: {
        municipio: 'Recife',
        siglaUF: 'PE',
        displayText: 'Recife, PE',
      },
    });

    const snapshot = await getLatestLocationSnapshot();

    expect(snapshot).not.toBeNull();
    expect(snapshot?.latitude).toBeCloseTo(-8.063149);
    expect(snapshot?.address?.displayText).toBe('Recife, PE');
  });

  test('returns the nearest recent location snapshot within range', async () => {
    await saveLocationSnapshot({
      latitude: -8.063149,
      longitude: -34.871139,
      timestamp: 100,
      address: {
        municipio: 'Recife',
        siglaUF: 'PE',
        displayText: 'Recife, PE',
      },
    });

    const nearest = await findNearestLocationSnapshot(-8.0632, -34.8712, 100);
    expect(nearest?.address?.displayText).toBe('Recife, PE');

    const tooFar = await findNearestLocationSnapshot(-8.2, -35.1, 100);
    expect(tooFar).toBeNull();
  });

  test('stores and retrieves cached city statistics', async () => {
    await saveCityStatsToOfflineCache('Recife', 'PE', {
      ibgeCode: '2611606',
      name: 'Recife',
      uf: 'PE',
      areaKm2: 218.84,
      population: 1488920,
      populationYear: '2024',
    });

    const cachedStats = await getCityStatsFromOfflineCache('Recife', 'PE');

    expect(cachedStats).not.toBeNull();
    expect(cachedStats?.ibgeCode).toBe('2611606');
    expect(cachedStats?.population).toBe(1488920);
    expect(typeof cachedStats?.cachedAt).toBe('number');
  });
});
