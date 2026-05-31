import { nextTick } from 'vue';
import { useSidraDisplayer } from '../../src/composables/useSidraDisplayer';
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

type SidraAddress = { municipio?: string | null; siglaUF?: string | null };

describe('useSidraDisplayer', () => {
  let addressCacheInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    addressCacheInstance = AddressCache.getInstance();
  });

  it('initializes sidraLabel with default message', () => {
    const { sidraLabel } = useSidraDisplayer();
    expect(sidraLabel.value).toBe('Aguardando localização...');
  });

  it('sets sidraLabel to "municipio — siglaUF" when both are present', async () => {
    const { sidraLabel } = useSidraDisplayer();
    const address: SidraAddress = { municipio: 'Campinas', siglaUF: 'SP' };
    addressCacheInstance.__triggerUpdate({ currentAddress: address });
    await nextTick();
    expect(sidraLabel.value).toBe('Campinas — SP');
  });

  it('sets sidraLabel to "municipio" when only municipio is present', async () => {
    const { sidraLabel } = useSidraDisplayer();
    const address: SidraAddress = { municipio: 'Curitiba' };
    addressCacheInstance.__triggerUpdate({ currentAddress: address });
    await nextTick();
    expect(sidraLabel.value).toBe('Curitiba');
  });

  it('does not update sidraLabel if municipio is missing', async () => {
    const { sidraLabel } = useSidraDisplayer();
    sidraLabel.value = 'Should not change';
    addressCacheInstance.__triggerUpdate({ currentAddress: { siglaUF: 'RJ' } });
    await nextTick();
    expect(sidraLabel.value).toBe('Should not change');
  });

  it('does not update sidraLabel if municipio is null', async () => {
    const { sidraLabel } = useSidraDisplayer();
    sidraLabel.value = 'Should not change';
    addressCacheInstance.__triggerUpdate({ currentAddress: { municipio: null, siglaUF: 'RJ' } });
    await nextTick();
    expect(sidraLabel.value).toBe('Should not change');
  });

  it('does not update sidraLabel if currentAddress is null', async () => {
    const { sidraLabel } = useSidraDisplayer();
    sidraLabel.value = 'Should not change';
    addressCacheInstance.__triggerUpdate({ currentAddress: null });
    await nextTick();
    expect(sidraLabel.value).toBe('Should not change');
  });

  it('subscribes and unsubscribes observer on mount/unmount', () => {
    const subscribeSpy = jest.spyOn(addressCacheInstance, 'subscribe');
    const unsubscribeSpy = jest.spyOn(addressCacheInstance, 'unsubscribe');
    useSidraDisplayer();
    expect(subscribeSpy).toHaveBeenCalledTimes(1);
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });
});
