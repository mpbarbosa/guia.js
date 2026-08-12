import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { CachedLocationSnapshot } from '../services/OfflineCacheService.js';
import locationSnapshotRepository from '../services/LocationSnapshotRepository.js';

const WAITING_LABEL = 'Aguardando localização...';

/**
 * Reactive IBGE/SIDRA label sourced from the location snapshot repository —
 * the same live source as useLocationSnapshot / useHighlightCards.
 *
 * Exposes a simple reactive label showing the município and UF. Full SIDRA stat
 * fetching belongs in the Stats screen composable (useIBGECityStats); this
 * composable keeps the secondary info panel lightweight and consistent with the
 * other address displays (single source of truth).
 */
export function useSidraDisplayer() {
  const snapshot = ref<CachedLocationSnapshot | null>(null);
  let unsubscribe: (() => void) | null = null;

  const sidraLabel = computed(() => {
    const address = snapshot.value?.address;
    const municipio = address?.municipio?.trim();
    if (!municipio) {
      return WAITING_LABEL;
    }
    const siglaUF = address?.siglaUF?.trim();
    return siglaUF ? `${municipio} — ${siglaUF}` : municipio;
  });

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

  return { sidraLabel };
}
