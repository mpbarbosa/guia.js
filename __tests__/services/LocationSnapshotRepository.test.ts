import { jest } from '@jest/globals';
import type { CachedLocationSnapshot } from '../../src/services/OfflineCacheService.js';
import type { LocationSnapshotListener } from '../../src/services/LocationSnapshotEvents.js';

let locationSnapshotRepository: typeof import('../../src/services/LocationSnapshotRepository').default;
let getLatestLocationSnapshotMock: jest.Mock;
let subscribeToLocationSnapshotUpdatesMock: jest.Mock;

function createSnapshot(): CachedLocationSnapshot {
  return {
    latitude: 1,
    longitude: 2,
    timestamp: 1717196400000,
    address: {
      displayText: 'Rua Teste',
      municipio: 'Cidade',
      siglaUF: 'UF',
    },
  };
}

beforeAll(async () => {
  await jest.unstable_mockModule('../../src/services/OfflineCacheService.js', () => ({
    getLatestLocationSnapshot: jest.fn(),
  }));

  await jest.unstable_mockModule('../../src/services/LocationSnapshotEvents.js', () => ({
    subscribeToLocationSnapshotUpdates: jest.fn(),
  }));

  const repositoryModule = await import('../../src/services/LocationSnapshotRepository');
  locationSnapshotRepository = repositoryModule.default;

  const offlineCacheService = await import('../../src/services/OfflineCacheService.js');
  getLatestLocationSnapshotMock = offlineCacheService.getLatestLocationSnapshot as jest.Mock;

  const locationSnapshotEvents = await import('../../src/services/LocationSnapshotEvents.js');
  subscribeToLocationSnapshotUpdatesMock =
    locationSnapshotEvents.subscribeToLocationSnapshotUpdates as jest.Mock;
});

describe('locationSnapshotRepository', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getLatestLocationSnapshot', () => {
    it('returns the latest snapshot when available', async () => {
      const snapshot = createSnapshot();
      getLatestLocationSnapshotMock.mockResolvedValueOnce(snapshot);

      const result = await locationSnapshotRepository.getLatestLocationSnapshot();

      expect(getLatestLocationSnapshotMock).toHaveBeenCalledTimes(1);
      expect(result).toBe(snapshot);
    });

    it('returns null when no snapshot is available', async () => {
      getLatestLocationSnapshotMock.mockResolvedValueOnce(null);

      const result = await locationSnapshotRepository.getLatestLocationSnapshot();

      expect(getLatestLocationSnapshotMock).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });

    it('propagates errors from getLatestLocationSnapshot', async () => {
      getLatestLocationSnapshotMock.mockRejectedValueOnce(new Error('Failed to load'));

      await expect(locationSnapshotRepository.getLatestLocationSnapshot()).rejects.toThrow('Failed to load');
      expect(getLatestLocationSnapshotMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribe', () => {
    it('subscribes to location snapshot updates and returns the unsubscribe function', () => {
      const listener: LocationSnapshotListener = jest.fn();
      const unsubscribeMock = jest.fn();
      subscribeToLocationSnapshotUpdatesMock.mockReturnValueOnce(unsubscribeMock);

      const unsubscribe = locationSnapshotRepository.subscribe(listener);

      expect(subscribeToLocationSnapshotUpdatesMock).toHaveBeenCalledWith(listener);

      unsubscribe();

      expect(unsubscribeMock).toHaveBeenCalledTimes(1);
    });

    it('handles multiple subscriptions independently', () => {
      const listener1: LocationSnapshotListener = jest.fn();
      const listener2: LocationSnapshotListener = jest.fn();
      const unsubscribeMock1 = jest.fn();
      const unsubscribeMock2 = jest.fn();

      subscribeToLocationSnapshotUpdatesMock
        .mockReturnValueOnce(unsubscribeMock1)
        .mockReturnValueOnce(unsubscribeMock2);

      const unsubscribe1 = locationSnapshotRepository.subscribe(listener1);
      const unsubscribe2 = locationSnapshotRepository.subscribe(listener2);

      expect(subscribeToLocationSnapshotUpdatesMock).toHaveBeenNthCalledWith(1, listener1);
      expect(subscribeToLocationSnapshotUpdatesMock).toHaveBeenNthCalledWith(2, listener2);

      unsubscribe1();
      unsubscribe2();

      expect(unsubscribeMock1).toHaveBeenCalledTimes(1);
      expect(unsubscribeMock2).toHaveBeenCalledTimes(1);
    });
  });
});
