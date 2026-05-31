import { ref, nextTick } from 'vue';
import { useAddressDisplayer } from '../../src/composables/useAddressDisplayer';
import AddressCache from '../../src/data/AddressCache.js';

jest.mock('../../src/data/AddressCache.js', () => {
  // Mock AddressCache singleton with subscribe/unsubscribe
  let observer: any = null;
  return {
    __esModule: true,
    default: {
      getInstance: () => ({
        subscribe: (obs: any) => { observer = obs; },
        unsubscribe: (obs: any) => { if (observer === obs) observer = null; },
        // Helper for tests to trigger observer
        __triggerUpdate: (cache: any) => { if (observer && observer.update) observer.update(cache); },
      }),
    },
  };
});

type Address = {
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  municipio?: string | null;
  siglaUF?: string | null;
  cep?: string | null;
};

describe('useAddressDisplayer', () => {
  let addressCacheInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    addressCacheInstance = AddressCache.getInstance();
  });

  it('initializes with default message', () => {
    const { enderecoPadronizado } = useAddressDisplayer();
    expect(enderecoPadronizado.value).toBe('Aguardando localização...');
  });

  it('updates enderecoPadronizado with full address', async () => {
    const { enderecoPadronizado } = useAddressDisplayer();
    const address: Address = {
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      municipio: 'São Paulo',
      siglaUF: 'SP',
      cep: '01000-000',
    };
    addressCacheInstance.__triggerUpdate({ currentAddress: address });
    await nextTick();
    expect(enderecoPadronizado.value).toBe('Rua das Flores, 123, Centro, São Paulo, SP, 01000-000');
  });

  it('omits empty or null fields in address', async () => {
    const { enderecoPadronizado } = useAddressDisplayer();
    const address: Address = {
      logradouro: 'Av. Brasil',
      numero: '',
      bairro: null,
      municipio: 'Rio de Janeiro',
      siglaUF: 'RJ',
      cep: undefined,
    };
    addressCacheInstance.__triggerUpdate({ currentAddress: address });
    await nextTick();
    expect(enderecoPadronizado.value).toBe('Av. Brasil, Rio de Janeiro, RJ');
  });

  it('formats municipio and siglaUF correctly when only one is present', async () => {
    const { enderecoPadronizado } = useAddressDisplayer();
    addressCacheInstance.__triggerUpdate({ currentAddress: { municipio: 'Curitiba' } });
    await nextTick();
    expect(enderecoPadronizado.value).toBe('Curitiba');

    addressCacheInstance.__triggerUpdate({ currentAddress: { siglaUF: 'PR' } });
    await nextTick();
    expect(enderecoPadronizado.value).toBe('PR');
  });

  it('does not update enderecoPadronizado if currentAddress is null', async () => {
    const { enderecoPadronizado } = useAddressDisplayer();
    enderecoPadronizado.value = 'Should not change';
    addressCacheInstance.__triggerUpdate({ currentAddress: null });
    await nextTick();
    expect(enderecoPadronizado.value).toBe('Should not change');
  });

  it('does not update enderecoPadronizado if all fields are empty', async () => {
    const { enderecoPadronizado } = useAddressDisplayer();
    enderecoPadronizado.value = 'Initial';
    addressCacheInstance.__triggerUpdate({
      currentAddress: {
        logradouro: '',
        numero: null,
        bairro: undefined,
        municipio: '',
        siglaUF: null,
        cep: '',
      },
    });
    await nextTick();
    expect(enderecoPadronizado.value).toBe('Initial');
  });

  it('subscribes and unsubscribes observer on mount/unmount', () => {
    const subscribeSpy = jest.spyOn(addressCacheInstance, 'subscribe');
    const unsubscribeSpy = jest.spyOn(addressCacheInstance, 'unsubscribe');
    // Simulate lifecycle hooks
    const { enderecoPadronizado } = useAddressDisplayer();
    expect(subscribeSpy).toHaveBeenCalledTimes(1);
    // Simulate unmount
    // onUnmounted is called immediately in this test context, so unsubscribe should be called
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });
});
