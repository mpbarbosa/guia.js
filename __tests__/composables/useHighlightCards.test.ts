/**
 * @jest-environment jsdom
 */

import { defineComponent, nextTick } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { useHighlightCards } from '../../src/composables/useHighlightCards';
import locationSnapshotRepository from '../../src/services/LocationSnapshotRepository';
import type { CachedLocationSnapshot } from '../../src/services/OfflineCacheService.js';

function createSnapshot(
  addressOverrides: Partial<NonNullable<CachedLocationSnapshot['address']>> = {}
): CachedLocationSnapshot {
  return {
    latitude: -23.55052,
    longitude: -46.633308,
    timestamp: 1717196400000,
    address: {
      displayText: 'Rua das Flores, Centro, São Paulo, SP',
      municipio: 'São Paulo',
      bairro: 'Centro',
      logradouro: 'Rua das Flores',
      siglaUF: 'SP',
      ...addressOverrides,
    },
  };
}

const Harness = defineComponent({
  setup() {
    return useHighlightCards();
  },
  template: `
    <div>
      <span data-testid="municipio">{{ municipio }}</span>
      <span data-testid="bairro-label">{{ bairroLabel }}</span>
      <span data-testid="bairro">{{ bairro }}</span>
      <span data-testid="logradouro">{{ logradouro }}</span>
      <span data-testid="rm">{{ regiaoMetropolitana ?? '' }}</span>
    </div>
  `,
});

async function flushComposableEffects(): Promise<void> {
  await Promise.resolve();
  await nextTick();
}

describe('useHighlightCards', () => {
  let listener: ((snapshot: CachedLocationSnapshot | null) => void) | null;
  let unsubscribeMock: jest.Mock;

  async function mountHarness(): Promise<VueWrapper> {
    const wrapper = mount(Harness);
    await flushComposableEffects();
    return wrapper;
  }

  beforeEach(() => {
    listener = null;
    unsubscribeMock = jest.fn();

    jest.spyOn(locationSnapshotRepository, 'getLatestLocationSnapshot').mockResolvedValue(null);
    jest.spyOn(locationSnapshotRepository, 'subscribe').mockImplementation((callback) => {
      listener = callback;
      return unsubscribeMock;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns placeholder values when no snapshot is available', async () => {
    const wrapper = await mountHarness();

    expect(wrapper.get('[data-testid="municipio"]').text()).toBe('—');
    expect(wrapper.get('[data-testid="bairro-label"]').text()).toBe('Bairro');
    expect(wrapper.get('[data-testid="bairro"]').text()).toBe('—');
    expect(wrapper.get('[data-testid="logradouro"]').text()).toBe('—');
    expect(wrapper.get('[data-testid="rm"]').text()).toBe('');
  });

  it('uppercases fields and passes regiaoMetropolitana through from the snapshot', async () => {
    jest
      .spyOn(locationSnapshotRepository, 'getLatestLocationSnapshot')
      .mockResolvedValueOnce(createSnapshot({ regiaoMetropolitana: 'RM São Paulo' }));

    const wrapper = await mountHarness();

    expect(wrapper.get('[data-testid="municipio"]').text()).toBe('SÃO PAULO');
    expect(wrapper.get('[data-testid="bairro-label"]').text()).toBe('Bairro');
    expect(wrapper.get('[data-testid="bairro"]').text()).toBe('CENTRO');
    expect(wrapper.get('[data-testid="logradouro"]').text()).toBe('RUA DAS FLORES');
    expect(wrapper.get('[data-testid="rm"]').text()).toBe('RM São Paulo');
  });

  it('uses the Distrito label when only distrito is present', async () => {
    jest
      .spyOn(locationSnapshotRepository, 'getLatestLocationSnapshot')
      .mockResolvedValueOnce(createSnapshot({ bairro: null, distrito: 'Perus' }));

    const wrapper = await mountHarness();

    expect(wrapper.get('[data-testid="bairro-label"]').text()).toBe('Distrito');
    expect(wrapper.get('[data-testid="bairro"]').text()).toBe('PERUS');
  });

  it('updates the cards when the repository emits a new snapshot', async () => {
    const wrapper = await mountHarness();

    expect(wrapper.get('[data-testid="municipio"]').text()).toBe('—');

    listener?.(createSnapshot({ municipio: 'Suzano', bairro: 'Monte Cristo', logradouro: 'Rodoanel Mário Covas' }));
    await nextTick();

    expect(wrapper.get('[data-testid="municipio"]').text()).toBe('SUZANO');
    expect(wrapper.get('[data-testid="bairro"]').text()).toBe('MONTE CRISTO');
    expect(wrapper.get('[data-testid="logradouro"]').text()).toBe('RODOANEL MÁRIO COVAS');
  });

  it('calls unsubscribe on unmount', async () => {
    const wrapper = await mountHarness();

    wrapper.unmount();

    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});
