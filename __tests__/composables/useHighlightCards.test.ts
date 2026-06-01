/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { nextTick } from 'vue';
import AddressCache from '../../src/data/AddressCache';
import { useHighlightCards } from '../../src/composables/useHighlightCards';

// Module-level closure state for the AddressCache mock
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

describe('useHighlightCards', () => {
  beforeEach(() => {
    _currentAddress = null;
    _observer = null;
    jest.spyOn(AddressCache, 'getInstance').mockReturnValue(_mockInstance as ReturnType<typeof AddressCache.getInstance>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns default values when no address is present', () => {
    const { municipio, bairro, logradouro, regiaoMetropolitana } = useHighlightCards();
    expect(municipio.value).toBe('—');
    expect(bairro.value).toBe('—');
    expect(logradouro.value).toBe('—');
    expect(regiaoMetropolitana.value).toBeNull();
  });

  it('sets all fields to uppercase and regiaoMetropolitana as provided', async () => {
    const { municipio, bairro, logradouro, regiaoMetropolitana } = useHighlightCards();
    _mockInstance.setCurrentAddress({
      municipio: 'São Paulo',
      bairro: 'Centro',
      logradouro: 'Rua das Flores',
      regiaoMetropolitana: 'RM SP',
    });
    await nextTick();
    expect(municipio.value).toBe('SÃO PAULO');
    expect(bairro.value).toBe('CENTRO');
    expect(logradouro.value).toBe('RUA DAS FLORES');
    expect(regiaoMetropolitana.value).toBe('RM SP');
  });

  it('handles missing fields gracefully', async () => {
    const { municipio, bairro, logradouro, regiaoMetropolitana } = useHighlightCards();
    _mockInstance.setCurrentAddress({
      municipio: null,
      bairro: undefined,
      logradouro: '',
      regiaoMetropolitana: undefined,
    });
    await nextTick();
    expect(municipio.value).toBe('—');
    expect(bairro.value).toBe('—');
    expect(logradouro.value).toBe('—');
    expect(regiaoMetropolitana.value).toBeNull();
  });

  it('updates fields when address changes', async () => {
    const { municipio, bairro, logradouro, regiaoMetropolitana } = useHighlightCards();
    _mockInstance.setCurrentAddress({
      municipio: 'A',
      bairro: 'B',
      logradouro: 'C',
      regiaoMetropolitana: 'RM1',
    });
    await nextTick();
    expect(municipio.value).toBe('A');
    expect(bairro.value).toBe('B');
    expect(logradouro.value).toBe('C');
    expect(regiaoMetropolitana.value).toBe('RM1');

    _mockInstance.setCurrentAddress({
      municipio: 'X',
      bairro: 'Y',
      logradouro: 'Z',
      regiaoMetropolitana: 'RM2',
    });
    await nextTick();
    expect(municipio.value).toBe('X');
    expect(bairro.value).toBe('Y');
    expect(logradouro.value).toBe('Z');
    expect(regiaoMetropolitana.value).toBe('RM2');
  });

  it('unsubscribes observer on unmount', () => {
    const unsubscribeSpy = jest.spyOn(_mockInstance, 'unsubscribe');
    useHighlightCards();
    // Simulate onUnmounted by calling unsubscribe with the captured observer
    _mockInstance.unsubscribe(_observer);
    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(() => _mockInstance.unsubscribe(_observer)).not.toThrow();
  });

  it('does not update fields if address is null or undefined', async () => {
    const { municipio, bairro, logradouro, regiaoMetropolitana } = useHighlightCards();
    _mockInstance.setCurrentAddress(null);
    await nextTick();
    expect(municipio.value).toBe('—');
    expect(bairro.value).toBe('—');
    expect(logradouro.value).toBe('—');
    expect(regiaoMetropolitana.value).toBeNull();

    _mockInstance.setCurrentAddress(undefined);
    await nextTick();
    expect(municipio.value).toBe('—');
    expect(bairro.value).toBe('—');
    expect(logradouro.value).toBe('—');
    expect(regiaoMetropolitana.value).toBeNull();
  });

  it('sets regiaoMetropolitana to null if not present', async () => {
    const { regiaoMetropolitana } = useHighlightCards();
    _mockInstance.setCurrentAddress({
      municipio: 'Test',
      bairro: 'Test',
      logradouro: 'Test',
      regiaoMetropolitana: undefined,
    });
    await nextTick();
    expect(regiaoMetropolitana.value).toBeNull();
  });
});
