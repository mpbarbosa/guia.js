import { nextTick } from 'vue';
import { useReferencePlaceDisplayer } from '../../src/composables/useReferencePlaceDisplayer';
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

type ReferencePlace = { name?: string | null };
type Address = { referencePlace?: ReferencePlace | null };

describe('useReferencePlaceDisplayer', () => {
  let addressCacheInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    addressCacheInstance = AddressCache.getInstance();
  });

  it('initializes referencePlaceName as null', () => {
    const { referencePlaceName } = useReferencePlaceDisplayer();
    expect(referencePlaceName.value).toBeNull();
  });

  it('sets referencePlaceName to the provided name', async () => {
    const { referencePlaceName } = useReferencePlaceDisplayer();
    const address: Address = { referencePlace: { name: 'Praça Central' } };
    addressCacheInstance.__triggerUpdate({ currentAddress: address });
    await nextTick();
    expect(referencePlaceName.value).toBe('Praça Central');
  });

  it('sets referencePlaceName to null if referencePlace is missing', async () => {
    const { referencePlaceName } = useReferencePlaceDisplayer();
    referencePlaceName.value = 'Should be cleared';
    addressCacheInstance.__triggerUpdate({ currentAddress: {} });
    await nextTick();
    expect(referencePlaceName.value).toBeNull();
  });

  it('sets referencePlaceName to null if referencePlace is null', async () => {
    const { referencePlaceName } = useReferencePlaceDisplayer();
    referencePlaceName.value = 'Should be cleared';
    addressCacheInstance.__triggerUpdate({ currentAddress: { referencePlace: null } });
    await nextTick();
    expect(referencePlaceName.value).toBeNull();
  });

  it('sets referencePlaceName to null if referencePlace.name is null', async () => {
    const { referencePlaceName } = useReferencePlaceDisplayer();
    referencePlaceName.value = 'Should be cleared';
    addressCacheInstance.__triggerUpdate({ currentAddress: { referencePlace: { name: null } } });
    await nextTick();
    expect(referencePlaceName.value).toBeNull();
  });

  it('sets referencePlaceName to null if currentAddress is null', async () => {
    const { referencePlaceName } = useReferencePlaceDisplayer();
    referencePlaceName.value = 'Should be cleared';
    addressCacheInstance.__triggerUpdate({ currentAddress: null });
    await nextTick();
    expect(referencePlaceName.value).toBeNull();
  });

  it('subscribes and unsubscribes observer on mount/unmount', () => {
    const subscribeSpy = jest.spyOn(addressCacheInstance, 'subscribe');
    const unsubscribeSpy = jest.spyOn(addressCacheInstance, 'unsubscribe');
    useReferencePlaceDisplayer();
    expect(subscribeSpy).toHaveBeenCalledTimes(1);
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });
});
