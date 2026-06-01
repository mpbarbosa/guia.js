import { ref, onUnmounted } from 'vue';
import AddressCache from '../data/AddressCache.js';

type AddressCacheInstance = ReturnType<typeof AddressCache.getInstance>;
type SubscribeParam = Parameters<AddressCacheInstance['subscribe']>[0];
type CurrentAddress = AddressCacheInstance['currentAddress'];

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
  const addressCache = AddressCache.getInstance();

  function syncFromAddress(addr: CurrentAddress): void {
    if (!addr?.municipio) return;
    sidraLabel.value = addr.siglaUF
      ? `${addr.municipio} — ${addr.siglaUF}`
      : addr.municipio;
  }

  const observer = {
    update() {
      syncFromAddress(addressCache.currentAddress);
    },
  };

  syncFromAddress(addressCache.currentAddress);
  addressCache.subscribe(observer as SubscribeParam);

  onUnmounted(() => {
    addressCache.unsubscribe(observer as SubscribeParam);
  });

  return { sidraLabel };
}
