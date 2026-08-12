import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { CachedAddressSummary, CachedLocationSnapshot } from '../services/OfflineCacheService.js';
import locationSnapshotRepository from '../services/LocationSnapshotRepository.js';

/**
 * Reactive highlight-cards data sourced from the location snapshot repository —
 * the SAME live source as useLocationSnapshot / LocationSnapshotCard.
 *
 * Previously sourced from AddressCache, but the live reverse-geocoding pipeline
 * no longer feeds AddressCache after the Vue migration, so the cards drifted
 * stale while the "último registro salvo" line stayed current. Sharing the
 * snapshot repository keeps the hero, the highlight cards and the snapshot line
 * consistent (single source of truth).
 */
function normalizeDisplayField(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toUpperCase() : null;
}

export function useHighlightCards() {
  const snapshot = ref<CachedLocationSnapshot | null>(null);
  let unsubscribe: (() => void) | null = null;

  const address = computed<CachedAddressSummary | null>(() => snapshot.value?.address ?? null);

  const normalizedBairro = computed(() => normalizeDisplayField(address.value?.bairro));
  const normalizedDistrito = computed(() => normalizeDisplayField(address.value?.distrito));

  const municipio = computed(() => normalizeDisplayField(address.value?.municipio) ?? '—');
  const bairroLabel = computed(() =>
    normalizedBairro.value !== null ? 'Bairro' : normalizedDistrito.value !== null ? 'Distrito' : 'Bairro'
  );
  const bairro = computed(() => normalizedBairro.value ?? normalizedDistrito.value ?? '—');
  const logradouro = computed(() => normalizeDisplayField(address.value?.logradouro) ?? '—');
  const regiaoMetropolitana = computed(() => address.value?.regiaoMetropolitana?.trim() || null);

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

  return { municipio, bairro, bairroLabel, logradouro, regiaoMetropolitana };
}
