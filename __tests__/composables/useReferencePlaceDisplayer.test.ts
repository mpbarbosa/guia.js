/**
 * @jest-environment jsdom
 */

import { defineComponent, nextTick } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { useReferencePlaceDisplayer } from '../../src/composables/useReferencePlaceDisplayer';
import locationSnapshotRepository from '../../src/services/LocationSnapshotRepository';
import type { CachedLocationSnapshot } from '../../src/services/OfflineCacheService.js';

function createSnapshot(
  addressOverrides: Partial<NonNullable<CachedLocationSnapshot['address']>> = {}
): CachedLocationSnapshot {
  return {
    latitude: 0,
    longitude: 0,
    timestamp: 0,
    address: { displayText: '', ...addressOverrides },
  };
}

const Harness = defineComponent({
  setup() {
    return useReferencePlaceDisplayer();
  },
  template: `<span data-testid="rp">{{ referencePlaceName ?? '' }}</span>`,
});

async function flushComposableEffects(): Promise<void> {
  await Promise.resolve();
  await nextTick();
}

describe('useReferencePlaceDisplayer', () => {
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

  it('returns null when no snapshot is available', async () => {
    const wrapper = await mountHarness();
    expect(wrapper.get('[data-testid="rp"]').text()).toBe('');
  });

  it('exposes the reference-place name from the snapshot', async () => {
    jest
      .spyOn(locationSnapshotRepository, 'getLatestLocationSnapshot')
      .mockResolvedValueOnce(createSnapshot({ referencePlaceName: 'Praça Central' }));

    const wrapper = await mountHarness();
    expect(wrapper.get('[data-testid="rp"]').text()).toBe('Praça Central');
  });

  it('returns null when the snapshot has no reference-place name', async () => {
    jest
      .spyOn(locationSnapshotRepository, 'getLatestLocationSnapshot')
      .mockResolvedValueOnce(createSnapshot({ referencePlaceName: null }));

    const wrapper = await mountHarness();
    expect(wrapper.get('[data-testid="rp"]').text()).toBe('');
  });

  it('updates the name when the repository emits a new snapshot', async () => {
    const wrapper = await mountHarness();

    listener?.(createSnapshot({ referencePlaceName: 'Praça 1' }));
    await nextTick();
    expect(wrapper.get('[data-testid="rp"]').text()).toBe('Praça 1');

    listener?.(createSnapshot({ referencePlaceName: 'Praça 2' }));
    await nextTick();
    expect(wrapper.get('[data-testid="rp"]').text()).toBe('Praça 2');
  });

  it('clears the name when the snapshot becomes null', async () => {
    const wrapper = await mountHarness();
    listener?.(createSnapshot({ referencePlaceName: 'Praça 1' }));
    await nextTick();
    expect(wrapper.get('[data-testid="rp"]').text()).toBe('Praça 1');

    listener?.(null);
    await nextTick();
    expect(wrapper.get('[data-testid="rp"]').text()).toBe('');
  });

  it('unsubscribes on unmount', async () => {
    const wrapper = await mountHarness();
    wrapper.unmount();
    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});
