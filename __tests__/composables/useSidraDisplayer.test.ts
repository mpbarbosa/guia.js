/**
 * @jest-environment jsdom
 */

import { defineComponent, nextTick } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { useSidraDisplayer } from '../../src/composables/useSidraDisplayer';
import locationSnapshotRepository from '../../src/services/LocationSnapshotRepository';
import type { CachedLocationSnapshot } from '../../src/services/OfflineCacheService.js';

const WAITING_LABEL = 'Aguardando localização...';

function createSnapshot(
  addressOverrides: Partial<NonNullable<CachedLocationSnapshot['address']>> | null = {}
): CachedLocationSnapshot {
  return {
    latitude: 0,
    longitude: 0,
    timestamp: 0,
    address: addressOverrides === null ? null : { displayText: '', ...addressOverrides },
  };
}

const Harness = defineComponent({
  setup() {
    return useSidraDisplayer();
  },
  template: `<span data-testid="sidra">{{ sidraLabel }}</span>`,
});

async function flushComposableEffects(): Promise<void> {
  await Promise.resolve();
  await nextTick();
}

describe('useSidraDisplayer', () => {
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

  it('returns the waiting label when no snapshot is available', async () => {
    const wrapper = await mountHarness();
    expect(wrapper.get('[data-testid="sidra"]').text()).toBe(WAITING_LABEL);
  });

  it('sets the label to "municipio — siglaUF" when both are present', async () => {
    jest
      .spyOn(locationSnapshotRepository, 'getLatestLocationSnapshot')
      .mockResolvedValueOnce(createSnapshot({ municipio: 'São Paulo', siglaUF: 'SP' }));

    const wrapper = await mountHarness();
    expect(wrapper.get('[data-testid="sidra"]').text()).toBe('São Paulo — SP');
  });

  it('sets the label to just "municipio" when there is no UF', async () => {
    jest
      .spyOn(locationSnapshotRepository, 'getLatestLocationSnapshot')
      .mockResolvedValueOnce(createSnapshot({ municipio: 'Rio de Janeiro', siglaUF: '' }));

    const wrapper = await mountHarness();
    expect(wrapper.get('[data-testid="sidra"]').text()).toBe('Rio de Janeiro');
  });

  it('keeps the waiting label when município is missing', async () => {
    jest
      .spyOn(locationSnapshotRepository, 'getLatestLocationSnapshot')
      .mockResolvedValueOnce(createSnapshot({ municipio: '', siglaUF: 'RJ' }));

    const wrapper = await mountHarness();
    expect(wrapper.get('[data-testid="sidra"]').text()).toBe(WAITING_LABEL);
  });

  it('updates the label when the repository emits a new snapshot', async () => {
    const wrapper = await mountHarness();
    expect(wrapper.get('[data-testid="sidra"]').text()).toBe(WAITING_LABEL);

    listener?.(createSnapshot({ municipio: 'Curitiba', siglaUF: 'PR' }));
    await nextTick();
    expect(wrapper.get('[data-testid="sidra"]').text()).toBe('Curitiba — PR');

    listener?.(createSnapshot({ municipio: 'Florianópolis', siglaUF: 'SC' }));
    await nextTick();
    expect(wrapper.get('[data-testid="sidra"]').text()).toBe('Florianópolis — SC');
  });

  it('falls back to the waiting label when the snapshot is null', async () => {
    const wrapper = await mountHarness();
    listener?.(createSnapshot({ municipio: 'Curitiba', siglaUF: 'PR' }));
    await nextTick();
    expect(wrapper.get('[data-testid="sidra"]').text()).toBe('Curitiba — PR');

    listener?.(null);
    await nextTick();
    expect(wrapper.get('[data-testid="sidra"]').text()).toBe(WAITING_LABEL);
  });

  it('unsubscribes on unmount', async () => {
    const wrapper = await mountHarness();
    wrapper.unmount();
    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});
