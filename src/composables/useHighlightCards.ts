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
  const bairroLabel         = ref<string>('Bairro');
  const logradouro          = ref<string>('—');
  const regiaoMetropolitana = ref<string | null>(null);
  const addressCache = AddressCache.getInstance();

  function normalizeDisplayField(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed.toUpperCase() : null;
  }

  function syncFromAddress(addr: CurrentAddress): void {
    if (!addr) return;

    const normalizedBairro = normalizeDisplayField(addr.bairro);
    const normalizedDistrito = normalizeDisplayField(addr.distrito);

    if (normalizedBairro !== null && normalizedDistrito !== null) {
      throw new Error('BrazilianStandardAddress cannot have both bairro and distrito');
    }

    municipio.value = normalizeDisplayField(addr.municipio) ?? '—';
    bairroLabel.value = normalizedDistrito !== null ? 'Distrito' : 'Bairro';
    bairro.value = normalizedBairro ?? normalizedDistrito ?? '—';
    logradouro.value = normalizeDisplayField(addr.logradouro) ?? '—';
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

  return { municipio, bairro, bairroLabel, logradouro, regiaoMetropolitana };
}
