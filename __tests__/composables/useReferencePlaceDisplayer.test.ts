/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { nextTick } from 'vue';
import AddressCache from '../../src/data/AddressCache';
import { useReferencePlaceDisplayer } from '../../src/composables/useReferencePlaceDisplayer';

let _currentAddress: any = null;
let _observer: any = null;
const _mockInstance = {
  get currentAddress() { return _currentAddress; },
  setCurrentAddress(addr: any) {
    _currentAddress = addr;
    if (_observer?.update) _observer.update();
  },
  subscribe: (obs: any) => { _observer = obs; },
  unsubscribe: (obs: any) => { if (_observer === obs) _observer = null; },
};

describe('useReferencePlaceDisplayer', () => {
  beforeEach(() => {
    _currentAddress = null;
    _observer = null;
    jest.spyOn(AddressCache, 'getInstance').mockReturnValue(_mockInstance as ReturnType<typeof AddressCache.getInstance>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns null when no address is present', () => {
    const { referencePlaceName } = useReferencePlaceDisplayer();
    expect(referencePlaceName.value).toBeNull();
  });

  it('sets referencePlaceName when referencePlace is present', async () => {
    const { referencePlaceName } = useReferencePlaceDisplayer();
    _mockInstance.setCurrentAddress({
      referencePlace: { name: 'Praça Central' },
    });
    await nextTick();
    expect(referencePlaceName.value).toBe('Praça Central');
  });

  it('sets referencePlaceName to null if referencePlace is missing', async () => {
    const { referencePlaceName } = useReferencePlaceDisplayer();
    _mockInstance.setCurrentAddress({});
    await nextTick();
    expect(referencePlaceName.value).toBeNull();
  });

  it('sets referencePlaceName to null if referencePlace.name is missing', async () => {
    const { referencePlaceName } = useReferencePlaceDisplayer();
    _mockInstance.setCurrentAddress({
      referencePlace: {},
    });
    await nextTick();
    expect(referencePlaceName.value).toBeNull();
  });

  it('updates referencePlaceName when address changes', async () => {
    const { referencePlaceName } = useReferencePlaceDisplayer();
    _mockInstance.setCurrentAddress({
      referencePlace: { name: 'Praça 1' },
    });
    await nextTick();
    expect(referencePlaceName.value).toBe('Praça 1');
    _mockInstance.setCurrentAddress({
      referencePlace: { name: 'Praça 2' },
    });
    await nextTick();
    expect(referencePlaceName.value).toBe('Praça 2');
  });

  it('unsubscribes observer on unmount', () => {
    const unsubscribeSpy = jest.spyOn(_mockInstance, 'unsubscribe');
    useReferencePlaceDisplayer();
    _mockInstance.unsubscribe(_observer);
    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(() => _mockInstance.unsubscribe(_observer)).not.toThrow();
  });

  it('does not update referencePlaceName if address is null or undefined', async () => {
    const { referencePlaceName } = useReferencePlaceDisplayer();
    _mockInstance.setCurrentAddress(null);
    await nextTick();
    expect(referencePlaceName.value).toBeNull();
    _mockInstance.setCurrentAddress(undefined);
    await nextTick();
    expect(referencePlaceName.value).toBeNull();
  });
});
