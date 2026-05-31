import { ref, onMounted, onUnmounted } from 'vue';
import AddressCache from '../data/AddressCache.js';

type AddressCacheInstance = ReturnType<typeof AddressCache.getInstance>;
type SubscribeParam = Parameters<AddressCacheInstance['subscribe']>[0];

/**
 * Reactive ponto de referência name sourced from AddressCache.
 *
 * Replaces HTMLReferencePlaceDisplayer: reads referencePlace from the
 * confirmed BrazilianStandardAddress and exposes its name as a ref.
 * Returns null when no reference place is available.
 */
export function useReferencePlaceDisplayer() {
  const referencePlaceName = ref<string | null>(null);

  const observer = {
    update(cache: { currentAddress: {
      referencePlace?: { name?: string | null } | null;
    } | null }) {
      const place = cache.currentAddress?.referencePlace;
      referencePlaceName.value = place?.name ?? null;
    },
  };

  onMounted(() => {
    AddressCache.getInstance().subscribe(observer as SubscribeParam);
  });

  onUnmounted(() => {
    AddressCache.getInstance().unsubscribe(observer as SubscribeParam);
  });

  return { referencePlaceName };
}
