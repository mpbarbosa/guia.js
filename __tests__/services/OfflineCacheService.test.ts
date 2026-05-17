/**
 * @jest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import {
  __resetOfflineCacheForTests,
  findNearestLocationSnapshot,
  getCityStatsFromOfflineCache,
  getLatestLocationSnapshot,
  saveCityStatsToOfflineCache,
  saveLocationSnapshot,
} from '../../src/services/OfflineCacheService.js';

const originalIndexedDb = globalThis.indexedDB;

function createIndexedDbLifecycleMock(operation: 'put' | 'clear') {
  const request = {
    result: undefined,
    error: null as Error | null,
    onsuccess: null as null | (() => void),
    onerror: null as null | (() => void),
  };

  const objectStore = {
    put: jest.fn(() => request),
    clear: jest.fn(() => request),
  };

  const transaction = {
    error: null as Error | null,
    oncomplete: null as null | (() => void),
    onerror: null as null | (() => void),
    onabort: null as null | (() => void),
    objectStore: jest.fn(() => objectStore),
  };

  const db = {
    close: jest.fn(),
    transaction: jest.fn(() => transaction),
  };

  const openRequest = {
    result: db,
    error: null as Error | null,
    onupgradeneeded: null as null | (() => void),
    onsuccess: null as null | (() => void),
    onerror: null as null | (() => void),
  };

  globalThis.indexedDB = {
    open: jest.fn(() => {
      queueMicrotask(() => openRequest.onsuccess?.());
      return openRequest;
    }),
  } as unknown as IDBFactory;

  return {
    request,
    transaction,
    db,
    objectStore,
    fireRequestSuccess: () => request.onsuccess?.(),
    fireRequestError: (error: Error) => {
      request.error = error;
      request.onerror?.();
    },
    fireTransactionComplete: () => transaction.oncomplete?.(),
    fireTransactionAbort: (error: Error) => {
      transaction.error = error;
      transaction.onabort?.();
    },
    expectOperationCalled: () => {
      if (operation === 'put') {
        expect(objectStore.put).toHaveBeenCalledTimes(1);
      } else {
        expect(objectStore.clear).toHaveBeenCalledTimes(1);
      }
    },
  };
}

describe('OfflineCacheService', () => {
  beforeEach(async () => {
    await __resetOfflineCacheForTests();
  });

  afterEach(() => {
    globalThis.indexedDB = originalIndexedDb;
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

  test('waits for IndexedDB write transaction completion before resolving', async () => {
    const mock = createIndexedDbLifecycleMock('put');
    let settled = false;

    const savePromise = saveCityStatsToOfflineCache('Recife', 'PE', {
      ibgeCode: '2611606',
      name: 'Recife',
      uf: 'PE',
      areaKm2: 218.84,
      population: 1488920,
      populationYear: '2024',
    }).then(() => {
      settled = true;
    });

    await Promise.resolve();
    await Promise.resolve();

    mock.expectOperationCalled();
    mock.fireRequestSuccess();
    await Promise.resolve();

    expect(settled).toBe(false);

    mock.fireTransactionComplete();
    await savePromise;

    expect(settled).toBe(true);
    expect(mock.db.close).toHaveBeenCalledTimes(1);
  });

  test('rejects aborted IndexedDB write transactions', async () => {
    const mock = createIndexedDbLifecycleMock('put');

    const savePromise = saveCityStatsToOfflineCache('Recife', 'PE', {
      ibgeCode: '2611606',
      name: 'Recife',
      uf: 'PE',
      areaKm2: 218.84,
      population: 1488920,
      populationYear: '2024',
    });

    await Promise.resolve();
    await Promise.resolve();

    mock.expectOperationCalled();
    mock.fireRequestSuccess();

    const abortError = new Error('Quota exceeded');
    mock.fireTransactionAbort(abortError);

    await expect(savePromise).rejects.toThrow('Quota exceeded');
    expect(mock.db.close).toHaveBeenCalledTimes(1);
  });

  test('waits for IndexedDB clear transaction completion before resolving', async () => {
    const mock = createIndexedDbLifecycleMock('clear');
    let settled = false;

    const resetPromise = __resetOfflineCacheForTests().then(() => {
      settled = true;
    });

    await Promise.resolve();
    await Promise.resolve();

    mock.expectOperationCalled();
    mock.fireRequestSuccess();
    await Promise.resolve();

    expect(settled).toBe(false);

    mock.fireTransactionComplete();
    await resetPromise;

    expect(settled).toBe(true);
    expect(mock.db.close).toHaveBeenCalledTimes(1);
  });
});
