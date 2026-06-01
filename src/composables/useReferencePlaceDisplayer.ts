import { ref, onUnmounted } from 'vue';
import AddressCache from '../data/AddressCache.js';

type AddressCacheInstance = ReturnType<typeof AddressCache.getInstance>;
type SubscribeParam = Parameters<AddressCacheInstance['subscribe']>[0];
type CurrentAddress = AddressCacheInstance['currentAddress'];

/**
 * Reactive ponto de referência name sourced from AddressCache.
 *
 * Replaces HTMLReferencePlaceDisplayer: reads referencePlace from the
 * confirmed BrazilianStandardAddress and exposes its name as a ref.
 * Returns null when no reference place is available.
 */
export function useReferencePlaceDisplayer() {
  const referencePlaceName = ref<string | null>(null);
  const addressCache = AddressCache.getInstance();

  function syncFromAddress(addr: CurrentAddress): void {
    const place = addr?.referencePlace;
    referencePlaceName.value = place?.name ?? null;
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

  return { referencePlaceName };
}
