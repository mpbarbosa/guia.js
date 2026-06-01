/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { nextTick } from 'vue';
import AddressCache from '../../src/data/AddressCache';
import { useSidraDisplayer } from '../../src/composables/useSidraDisplayer';

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

describe('useSidraDisplayer', () => {
  beforeEach(() => {
    _currentAddress = null;
    _observer = null;
    jest.spyOn(AddressCache, 'getInstance').mockReturnValue(_mockInstance as ReturnType<typeof AddressCache.getInstance>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns default label when no address is present', () => {
    const { sidraLabel } = useSidraDisplayer();
    expect(sidraLabel.value).toBe('Aguardando localização...');
  });

  it('sets sidraLabel to "municipio — siglaUF" when both are present', async () => {
    const { sidraLabel } = useSidraDisplayer();
    _mockInstance.setCurrentAddress({
      municipio: 'São Paulo',
      siglaUF: 'SP',
    });
    await nextTick();
    expect(sidraLabel.value).toBe('São Paulo — SP');
  });

  it('sets sidraLabel to "municipio" when only municipio is present', async () => {
    const { sidraLabel } = useSidraDisplayer();
    _mockInstance.setCurrentAddress({
      municipio: 'Rio de Janeiro',
      siglaUF: '',
    });
    await nextTick();
    expect(sidraLabel.value).toBe('Rio de Janeiro');
  });

  it('does not update sidraLabel if municipio is missing', async () => {
    const { sidraLabel } = useSidraDisplayer();
    _mockInstance.setCurrentAddress({
      municipio: '',
      siglaUF: 'RJ',
    });
    await nextTick();
    expect(sidraLabel.value).toBe('Aguardando localização...');
  });

  it('updates sidraLabel when address changes', async () => {
    const { sidraLabel } = useSidraDisplayer();
    _mockInstance.setCurrentAddress({
      municipio: 'Curitiba',
      siglaUF: 'PR',
    });
    await nextTick();
    expect(sidraLabel.value).toBe('Curitiba — PR');
    _mockInstance.setCurrentAddress({
      municipio: 'Florianópolis',
      siglaUF: 'SC',
    });
    await nextTick();
    expect(sidraLabel.value).toBe('Florianópolis — SC');
  });

  it('unsubscribes observer on unmount', () => {
    const unsubscribeSpy = jest.spyOn(_mockInstance, 'unsubscribe');
    useSidraDisplayer();
    _mockInstance.unsubscribe(_observer);
    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(() => _mockInstance.unsubscribe(_observer)).not.toThrow();
  });

  it('does not update sidraLabel if address is null or undefined', async () => {
    const { sidraLabel } = useSidraDisplayer();
    _mockInstance.setCurrentAddress(null);
    await nextTick();
    expect(sidraLabel.value).toBe('Aguardando localização...');
    _mockInstance.setCurrentAddress(undefined);
    await nextTick();
    expect(sidraLabel.value).toBe('Aguardando localização...');
  });
});
