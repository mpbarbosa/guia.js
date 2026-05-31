import { ref, onMounted, onUnmounted } from 'vue';
import AddressCache from '../data/AddressCache.js';

type AddressCacheInstance = ReturnType<typeof AddressCache.getInstance>;
type SubscribeParam = Parameters<AddressCacheInstance['subscribe']>[0];

/**
 * Reactive IBGE/SIDRA label sourced from AddressCache.
 *
 * Replaces HTMLSidraDisplayer: exposes a simple reactive label showing the
 * confirmed município and UF. Full SIDRA stat fetching belongs in the Stats
 * screen composable (useIBGECityStats); this composable keeps the secondary
 * info panel lightweight.
 */
export function useSidraDisplayer() {
  const sidraLabel = ref<string>('Aguardando localização...');

  const observer = {
    update(cache: { currentAddress: {
      municipio?: string | null;
      siglaUF?: string | null;
    } | null }) {
      const addr = cache.currentAddress;
      if (!addr?.municipio) return;
      sidraLabel.value = addr.siglaUF
        ? `${addr.municipio} — ${addr.siglaUF}`
        : addr.municipio;
    },
  };

  onMounted(() => {
    AddressCache.getInstance().subscribe(observer as SubscribeParam);
  });

  onUnmounted(() => {
    AddressCache.getInstance().unsubscribe(observer as SubscribeParam);
  });

  return { sidraLabel };
}
