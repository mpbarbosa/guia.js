import { ref, onUnmounted } from 'vue';
import AddressCache from '../data/AddressCache.js';

type AddressCacheInstance = ReturnType<typeof AddressCache.getInstance>;
type SubscribeParam = Parameters<AddressCacheInstance['subscribe']>[0];
type CurrentAddress = AddressCacheInstance['currentAddress'];

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
  const addressCache = AddressCache.getInstance();

  function syncFromAddress(addr: CurrentAddress): void {
    if (!addr) return;
    municipio.value = addr.municipio?.trim() ? addr.municipio.toUpperCase() : '—';
    bairro.value = addr.bairro?.trim() ? addr.bairro.toUpperCase() : '—';
    logradouro.value = addr.logradouro?.trim() ? addr.logradouro.toUpperCase() : '—';
    regiaoMetropolitana.value = addr.regiaoMetropolitana?.trim() || null;
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

  return { municipio, bairro, logradouro, regiaoMetropolitana };
}
