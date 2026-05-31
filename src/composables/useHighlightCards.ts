import { ref, onMounted, onUnmounted } from 'vue';
import AddressCache from '../data/AddressCache.js';

type AddressCacheInstance = ReturnType<typeof AddressCache.getInstance>;
type SubscribeParam = Parameters<AddressCacheInstance['subscribe']>[0];

/**
 * Reactive highlight-cards data sourced directly from AddressCache.
 *
 * Replaces HTMLHighlightCardsDisplayer: subscribes to AddressCache on mount,
 * updates municipio / bairro / logradouro / regiaoMetropolitana refs on every
 * confirmed address change, and unsubscribes on unmount.
 */
export function useHighlightCards() {
  const municipio           = ref<string>('—');
  const bairro              = ref<string>('—');
  const logradouro          = ref<string>('—');
  const regiaoMetropolitana = ref<string | null>(null);

  const observer = {
    update(cache: { currentAddress: {
      municipio?: string | null;
      bairro?: string | null;
      logradouro?: string | null;
      regiaoMetropolitana?: string | null;
    } | null }) {
      const addr = cache.currentAddress;
      if (!addr) return;
      if (addr.municipio   != null) municipio.value           = addr.municipio.toUpperCase();
      if (addr.bairro      != null) bairro.value              = addr.bairro.toUpperCase();
      if (addr.logradouro  != null) logradouro.value          = addr.logradouro.toUpperCase();
      regiaoMetropolitana.value = addr.regiaoMetropolitana ?? null;
    },
  };

  onMounted(() => {
    AddressCache.getInstance().subscribe(observer as SubscribeParam);
  });

  onUnmounted(() => {
    AddressCache.getInstance().unsubscribe(observer as SubscribeParam);
  });

  return { municipio, bairro, logradouro, regiaoMetropolitana };
}
