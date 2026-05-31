import { ref, onMounted, onUnmounted } from 'vue';
import AddressCache from '../data/AddressCache.js';

type AddressCacheInstance = ReturnType<typeof AddressCache.getInstance>;
type SubscribeParam = Parameters<AddressCacheInstance['subscribe']>[0];

/**
 * Reactive endereço padronizado string sourced from AddressCache.
 *
 * Replaces HTMLAddressDisplayer: builds a one-line formatted address from
 * the confirmed BrazilianStandardAddress fields and exposes it as a ref.
 */
export function useAddressDisplayer() {
  const enderecoPadronizado = ref<string>('Aguardando localização...');

  const observer = {
    update(cache: { currentAddress: {
      logradouro?: string | null;
      numero?: string | null;
      bairro?: string | null;
      municipio?: string | null;
      siglaUF?: string | null;
      cep?: string | null;
    } | null }) {
      const addr = cache.currentAddress;
      if (!addr) return;

      const parts = [
        addr.logradouro,
        addr.numero,
        addr.bairro,
        addr.municipio && addr.siglaUF
          ? `${addr.municipio}, ${addr.siglaUF}`
          : (addr.municipio ?? addr.siglaUF),
        addr.cep,
      ].filter((v): v is string => Boolean(v?.trim()));

      if (parts.length > 0) {
        enderecoPadronizado.value = parts.join(', ');
      }
    },
  };

  onMounted(() => {
    AddressCache.getInstance().subscribe(observer as SubscribeParam);
  });

  onUnmounted(() => {
    AddressCache.getInstance().unsubscribe(observer as SubscribeParam);
  });

  return { enderecoPadronizado };
}
