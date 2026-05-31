import { nextTick } from 'vue';
import { useHighlightCards } from '../../src/composables/useHighlightCards';
import AddressCache from '../../src/data/AddressCache.js';

jest.mock('../../src/data/AddressCache.js', () => {
  let observer: any = null;
  return {
    __esModule: true,
    default: {
      getInstance: () => ({
        subscribe: (obs: any) => { observer = obs; },
        unsubscribe: (obs: any) => { if (observer === obs) observer = null; },
        __triggerUpdate: (cache: any) => { if (observer && observer.update) observer.update(cache); },
      }),
    },
  };
});

type HighlightAddress = {
  municipio?: string | null;
  bairro?: string | null;
  logradouro?: string | null;
  regiaoMetropolitana?: string | null;
};

describe('useHighlightCards', () => {
  let addressCacheInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    addressCacheInstance = AddressCache.getInstance();
  });

  it('initializes refs with default values', () => {
    const { municipio, bairro, logradouro, regiaoMetropolitana } = useHighlightCards();
    expect(municipio.value).toBe('—');
    expect(bairro.value).toBe('—');
    expect(logradouro.value).toBe('—');
    expect(regiaoMetropolitana.value).toBeNull();
  });

  it('updates all refs with uppercase values and regiaoMetropolitana', async () => {
    const { municipio, bairro, logradouro, regiaoMetropolitana } = useHighlightCards();
    const address: HighlightAddress = {
      municipio: 'Campinas',
      bairro: 'Taquaral',
      logradouro: 'Rua ABC',
      regiaoMetropolitana: 'RMC',
    };
    addressCacheInstance.__triggerUpdate({ currentAddress: address });
    await nextTick();
    expect(municipio.value).toBe('CAMPINAS');
    expect(bairro.value).toBe('TAQUARAL');
    expect(logradouro.value).toBe('RUA ABC');
    expect(regiaoMetropolitana.value).toBe('RMC');
  });

  it('updates only provided fields and leaves others unchanged', async () => {
    const { municipio, bairro, logradouro, regiaoMetropolitana } = useHighlightCards();
    // Set initial values
    municipio.value = 'OLD';
    bairro.value = 'OLD';
    logradouro.value = 'OLD';
    regiaoMetropolitana.value = 'OLD';
    // Only bairro and regiaoMetropolitana provided
    const address: HighlightAddress = {
      bairro: 'Centro',
      regiaoMetropolitana: null,
    };
    addressCacheInstance.__triggerUpdate({ currentAddress: address });
    await nextTick();
    expect(municipio.value).toBe('OLD');
    expect(bairro.value).toBe('CENTRO');
    expect(logradouro.value).toBe('OLD');
    expect(regiaoMetropolitana.value).toBeNull();
  });

  it('handles null and undefined fields gracefully', async () => {
    const { municipio, bairro, logradouro, regiaoMetropolitana } = useHighlightCards();
    municipio.value = 'X';
    bairro.value = 'Y';
    logradouro.value = 'Z';
    regiaoMetropolitana.value = 'R';
    const address: HighlightAddress = {
      municipio: null,
      bairro: undefined,
      logradouro: null,
      regiaoMetropolitana: undefined,
    };
    addressCacheInstance.__triggerUpdate({ currentAddress: address });
    await nextTick();
    // Only municipio and logradouro are null, so no update; others remain unchanged
    expect(municipio.value).toBe('X');
    expect(bairro.value).toBe('Y');
    expect(logradouro.value).toBe('Z');
    expect(regiaoMetropolitana.value).toBe('R');
  });

  it('does not update refs if currentAddress is null', async () => {
    const { municipio, bairro, logradouro, regiaoMetropolitana } = useHighlightCards();
    municipio.value = 'A';
    bairro.value = 'B';
    logradouro.value = 'C';
    regiaoMetropolitana.value = 'D';
    addressCacheInstance.__triggerUpdate({ currentAddress: null });
    await nextTick();
    expect(municipio.value).toBe('A');
    expect(bairro.value).toBe('B');
    expect(logradouro.value).toBe('C');
    expect(regiaoMetropolitana.value).toBe('D');
  });

  it('subscribes and unsubscribes observer on mount/unmount', () => {
    const subscribeSpy = jest.spyOn(addressCacheInstance, 'subscribe');
    const unsubscribeSpy = jest.spyOn(addressCacheInstance, 'unsubscribe');
    useHighlightCards();
    expect(subscribeSpy).toHaveBeenCalledTimes(1);
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });
});
