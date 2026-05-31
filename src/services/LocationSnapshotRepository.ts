import {
  getLatestLocationSnapshot as loadLatestLocationSnapshot,
  type CachedLocationSnapshot,
} from './OfflineCacheService.js';
import {
  subscribeToLocationSnapshotUpdates,
  type LocationSnapshotListener,
} from './LocationSnapshotEvents.js';

export interface LocationSnapshotRepository {
  getLatestLocationSnapshot(): Promise<CachedLocationSnapshot | null>;
  subscribe(listener: LocationSnapshotListener): () => void;
}

const locationSnapshotRepository: LocationSnapshotRepository = {
  getLatestLocationSnapshot() {
    return loadLatestLocationSnapshot();
  },

  subscribe(listener: LocationSnapshotListener) {
    return subscribeToLocationSnapshotUpdates(listener);
  },
};

export default locationSnapshotRepository;

