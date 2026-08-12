import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { CachedLocationSnapshot } from '../services/OfflineCacheService.js';
import locationSnapshotRepository from '../services/LocationSnapshotRepository.js';

/**
 * Reactive ponto de referência name sourced from the location snapshot
 * repository — the same live source as useLocationSnapshot / useHighlightCards.
 *
 * Reads the reference-place name captured on the snapshot (see home.ts
 * _getCachedAddressSummary) and exposes it as a ref. Returns null when no
 * reference place is available.
 */
export function useReferencePlaceDisplayer() {
  const snapshot = ref<CachedLocationSnapshot | null>(null);
  let unsubscribe: (() => void) | null = null;

  const referencePlaceName = computed(() => snapshot.value?.address?.referencePlaceName?.trim() || null);

  async function loadSnapshot(): Promise<void> {
    snapshot.value = await locationSnapshotRepository.getLatestLocationSnapshot();
  }

  onMounted(() => {
    void loadSnapshot();
    unsubscribe = locationSnapshotRepository.subscribe((nextSnapshot) => {
      snapshot.value = nextSnapshot;
    });
  });

  onUnmounted(() => {
    unsubscribe?.();
    unsubscribe = null;
  });

  return { referencePlaceName };
}
