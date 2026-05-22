import { ref, onMounted, onUnmounted } from 'vue';
import AddressCache from '../data/AddressCache.js';
import { fetchStats } from '../services/IBGECityStatsService.js';
import type { CityStats } from '../services/IBGECityStatsService.js';

/**
 * Subscribes to AddressCache and fetches live IBGE city statistics whenever
 * the resolved municipio/uf changes. Exposes reactive stats, loading, and error.
 */
export function useIBGECityStats() {
  const stats = ref<CityStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  let lastKey = '';

  async function load(municipio: string, uf: string): Promise<void> {
    const key = `${municipio}::${uf}`;
    if (key === lastKey) return;
    lastKey = key;

    loading.value = true;
    error.value = null;

    try {
      stats.value = await fetchStats(municipio, uf);
    } catch (err) {
      error.value = (err as Error).message ?? 'Erro ao carregar dados';
      stats.value = null;
    } finally {
      loading.value = false;
    }
  }

  const addressObserver = {
    update(cache: { currentAddress: { municipio: string | null; uf: string | null } | null }) {
      const addr = cache.currentAddress;
      if (!addr?.municipio || !addr.uf) return;
      void load(addr.municipio, addr.uf);
    },
  };

  onMounted(() => {
    const cache = AddressCache.getInstance();
    cache.subscribe(addressObserver as Parameters<ReturnType<typeof AddressCache.getInstance>['subscribe']>[0]);

    // Seed from current state if already resolved
    const addr = cache.currentAddress;
    if (addr?.municipio && addr.uf) {
      void load(addr.municipio, addr.uf);
    }
  });

  onUnmounted(() => {
    AddressCache.getInstance().unsubscribe(
      addressObserver as Parameters<ReturnType<typeof AddressCache.getInstance>['unsubscribe']>[0]
    );
  });

  return { stats, loading, error };
}
