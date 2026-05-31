import locationSnapshotRepository from '../../src/services/LocationSnapshotRepository';
import type { CachedLocationSnapshot } from '../../src/services/OfflineCacheService.js';
import type { LocationSnapshotListener } from '../../src/services/LocationSnapshotEvents.js';

jest.mock('../../src/services/OfflineCacheService.js', () => ({
  __esModule: true,
  getLatestLocationSnapshot: jest.fn(),
}));

jest.mock('../../src/services/LocationSnapshotEvents.js', () => ({
  __esModule: true,
  subscribeToLocationSnapshotUpdates: jest.fn(),
}));

import { getLatestLocationSnapshot } from '../../src/services/OfflineCacheService.js';
import { subscribeToLocationSnapshotUpdates } from '../../src/services/LocationSnapshotEvents.js';

describe('locationSnapshotRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLatestLocationSnapshot', () => {
    it('returns the latest snapshot when available', async () => {
      const snapshot: CachedLocationSnapshot = {
        latitude: 1,
        longitude: 2,
        address: { displayText: 'Rua Teste', municipio: 'Cidade', siglaUF: 'UF' },
      } as CachedLocationSnapshot;

      (getLatestLocationSnapshot as jest.Mock).mockResolvedValueOnce(snapshot);

      const result = await locationSnapshotRepository.getLatestLocationSnapshot();
      expect(getLatestLocationSnapshot).toHaveBeenCalled();
      expect(result).toBe(snapshot);
    });

    it('returns null when no snapshot is available', async () => {
      (getLatestLocationSnapshot as jest.Mock).mockResolvedValueOnce(null);

      const result = await locationSnapshotRepository.getLatestLocationSnapshot();
      expect(getLatestLocationSnapshot).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('propagates errors from getLatestLocationSnapshot', async () => {
      const error = new Error('Failed to load');
      (getLatestLocationSnapshot as jest.Mock).mockRejectedValueOnce(error);

      await expect(locationSnapshotRepository.getLatestLocationSnapshot()).rejects.toThrow('Failed to load');
      expect(getLatestLocationSnapshot).toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    it('subscribes to location snapshot updates and returns the unsubscribe function', () => {
      const listener: LocationSnapshotListener = jest.fn();
      const unsubscribeMock = jest.fn();

      (subscribeToLocationSnapshotUpdates as jest.Mock).mockReturnValueOnce(unsubscribeMock);

      const unsubscribe = locationSnapshotRepository.subscribe(listener);

      expect(subscribeToLocationSnapshotUpdates).toHaveBeenCalledWith(listener);
      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('handles multiple subscriptions independently', () => {
      const listener1: LocationSnapshotListener = jest.fn();
      const listener2: LocationSnapshotListener = jest.fn();
      const unsubscribeMock1 = jest.fn();
      const unsubscribeMock2 = jest.fn();

      (subscribeToLocationSnapshotUpdates as jest.Mock)
        .mockReturnValueOnce(unsubscribeMock1)
        .mockReturnValueOnce(unsubscribeMock2);

      const unsubscribe1 = locationSnapshotRepository.subscribe(listener1);
      const unsubscribe2 = locationSnapshotRepository.subscribe(listener2);

      expect(subscribeToLocationSnapshotUpdates).toHaveBeenCalledWith(listener1);
      expect(subscribeToLocationSnapshotUpdates).toHaveBeenCalledWith(listener2);

      unsubscribe1();
      unsubscribe2();

      expect(unsubscribeMock1).toHaveBeenCalled();
      expect(unsubscribeMock2).toHaveBeenCalled();
    });
  });
});
