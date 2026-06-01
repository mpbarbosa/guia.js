import { ref, onUnmounted } from 'vue';
import AddressCache from '../data/AddressCache.js';

type AddressCacheInstance = ReturnType<typeof AddressCache.getInstance>;
type SubscribeParam = Parameters<AddressCacheInstance['subscribe']>[0];
type CurrentAddress = AddressCacheInstance['currentAddress'];

/**
 * Reactive endereço padronizado string sourced from AddressCache.
 *
 * Replaces HTMLAddressDisplayer: builds a one-line formatted address from
 * the confirmed BrazilianStandardAddress fields and exposes it as a ref.
 */
export function useAddressDisplayer() {
  const enderecoPadronizado = ref<string>('Aguardando localização...');
  const addressCache = AddressCache.getInstance();

  function syncFromAddress(addr: CurrentAddress): void {
    if (!addr) return;

    const municipio = addr.municipio?.trim();
    const siglaUF = addr.siglaUF?.trim();
    const parts = [
      addr.logradouro,
      addr.numero,
      addr.bairro,
      municipio && siglaUF
        ? `${municipio}, ${siglaUF}`
        : (municipio || siglaUF),
      addr.cep,
    ].filter((v): v is string => Boolean(v?.trim()));

    if (parts.length > 0) {
      enderecoPadronizado.value = parts.join(', ');
    }
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

  return { enderecoPadronizado };
}
