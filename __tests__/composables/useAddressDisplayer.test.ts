/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { nextTick } from 'vue';
import AddressCache from '../../src/data/AddressCache';
import { useAddressDisplayer } from '../../src/composables/useAddressDisplayer';

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

describe('useAddressDisplayer', () => {
  beforeEach(() => {
    _currentAddress = null;
    _observer = null;
    jest.spyOn(AddressCache, 'getInstance').mockReturnValue(_mockInstance as ReturnType<typeof AddressCache.getInstance>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns default message when no address is present', () => {
    const { enderecoPadronizado } = useAddressDisplayer();
    expect(enderecoPadronizado.value).toBe('Aguardando localização...');
  });

  it('formats address when all fields are present', async () => {
    const { enderecoPadronizado } = useAddressDisplayer();
    _mockInstance.setCurrentAddress({
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      municipio: 'São Paulo',
      siglaUF: 'SP',
      cep: '01000-000',
    });
    await nextTick();
    expect(enderecoPadronizado.value).toBe('Rua das Flores, 123, Centro, São Paulo, SP, 01000-000');
  });

  it('formats address omitting empty fields', async () => {
    const { enderecoPadronizado } = useAddressDisplayer();
    _mockInstance.setCurrentAddress({
      logradouro: 'Av. Brasil',
      numero: '',
      bairro: null,
      municipio: 'Rio de Janeiro',
      siglaUF: 'RJ',
      cep: '',
    });
    await nextTick();
    expect(enderecoPadronizado.value).toBe('Av. Brasil, Rio de Janeiro, RJ');
  });

  it('updates when address changes', async () => {
    const { enderecoPadronizado } = useAddressDisplayer();
    _mockInstance.setCurrentAddress({
      logradouro: 'Rua A',
      numero: '1',
      bairro: 'Bairro A',
      municipio: 'Cidade A',
      siglaUF: 'AA',
      cep: '11111-111',
    });
    await nextTick();
    expect(enderecoPadronizado.value).toBe('Rua A, 1, Bairro A, Cidade A, AA, 11111-111');

    _mockInstance.setCurrentAddress({
      logradouro: 'Rua B',
      numero: '2',
      bairro: 'Bairro B',
      municipio: 'Cidade B',
      siglaUF: 'BB',
      cep: '22222-222',
    });
    await nextTick();
    expect(enderecoPadronizado.value).toBe('Rua B, 2, Bairro B, Cidade B, BB, 22222-222');
  });

  it('does not update if address is null or undefined', async () => {
    const { enderecoPadronizado } = useAddressDisplayer();
    _mockInstance.setCurrentAddress(null);
    await nextTick();
    expect(enderecoPadronizado.value).toBe('Aguardando localização...');
    _mockInstance.setCurrentAddress(undefined);
    await nextTick();
    expect(enderecoPadronizado.value).toBe('Aguardando localização...');
  });

  it('unsubscribes observer on unmount', () => {
    const unsubscribeSpy = jest.spyOn(_mockInstance, 'unsubscribe');
    useAddressDisplayer();
    _mockInstance.unsubscribe(_observer);
    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(() => _mockInstance.unsubscribe(_observer)).not.toThrow();
  });

  it('handles missing municipio or siglaUF gracefully', async () => {
    const { enderecoPadronizado } = useAddressDisplayer();
    _mockInstance.setCurrentAddress({
      logradouro: 'Rua X',
      numero: '10',
      bairro: 'Bairro X',
      municipio: '',
      siglaUF: '',
      cep: '99999-999',
    });
    await nextTick();
    expect(enderecoPadronizado.value).toBe('Rua X, 10, Bairro X, 99999-999');
  });

  it('handles only municipio or only siglaUF present', async () => {
    const { enderecoPadronizado } = useAddressDisplayer();
    _mockInstance.setCurrentAddress({
      logradouro: 'Rua Y',
      numero: '20',
      bairro: 'Bairro Y',
      municipio: 'Cidade Y',
      siglaUF: '',
      cep: '',
    });
    await nextTick();
    expect(enderecoPadronizado.value).toBe('Rua Y, 20, Bairro Y, Cidade Y');

    _mockInstance.setCurrentAddress({
      logradouro: 'Rua Z',
      numero: '30',
      bairro: 'Bairro Z',
      municipio: '',
      siglaUF: 'ZZ',
      cep: '',
    });
    await nextTick();
    expect(enderecoPadronizado.value).toBe('Rua Z, 30, Bairro Z, ZZ');
  });
});
