import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { CachedLocationSnapshot } from '../services/OfflineCacheService.js';
import locationSnapshotRepository from '../services/LocationSnapshotRepository.js';

const WAITING_LABEL = 'Aguardando localização...';
const SNAPSHOT_SUFFIX = ' (último registro salvo)';

function formatCoordinates(snapshot: CachedLocationSnapshot | null): string {
  if (!snapshot) {
    return WAITING_LABEL;
  }

  return `${snapshot.latitude.toFixed(6)}, ${snapshot.longitude.toFixed(6)}${SNAPSHOT_SUFFIX}`;
}

function formatAddress(snapshot: CachedLocationSnapshot | null): string {
  const address = snapshot?.address?.displayText?.trim();
  if (!address) {
    return WAITING_LABEL;
  }

  return `${address}${SNAPSHOT_SUFFIX}`;
}

function formatSidraLabel(snapshot: CachedLocationSnapshot | null): string {
  const municipio = snapshot?.address?.municipio?.trim();
  if (!municipio) {
    return WAITING_LABEL;
  }

  const siglaUF = snapshot?.address?.siglaUF?.trim();
  return siglaUF ? `${municipio} — ${siglaUF}` : municipio;
}

export function useLocationSnapshot() {
  const snapshot = ref<CachedLocationSnapshot | null>(null);
  let unsubscribe: (() => void) | null = null;

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

  const enderecoPadronizado = computed(() => formatAddress(snapshot.value));
  const coordinates = computed(() => formatCoordinates(snapshot.value));
  const sidraLabel = computed(() => formatSidraLabel(snapshot.value));

  return {
    enderecoPadronizado,
    coordinates,
    sidraLabel,
  };
}

