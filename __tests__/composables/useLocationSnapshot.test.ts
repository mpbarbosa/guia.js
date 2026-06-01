import { defineComponent, nextTick } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { useLocationSnapshot } from '../../src/composables/useLocationSnapshot';
import locationSnapshotRepository from '../../src/services/LocationSnapshotRepository';
import type { CachedLocationSnapshot } from '../../src/services/OfflineCacheService.js';

const WAITING_LABEL = 'Aguardando localização...';
const SNAPSHOT_SUFFIX = ' (último registro salvo)';

function createSnapshot(
  overrides: Partial<CachedLocationSnapshot> = {},
  addressOverrides: Partial<NonNullable<CachedLocationSnapshot['address']>> = {}
): CachedLocationSnapshot {
  return {
    latitude: -23.55052,
    longitude: -46.633308,
    timestamp: 1717196400000,
    address: {
      displayText: 'Av. Paulista, 1000',
      municipio: 'São Paulo',
      siglaUF: 'SP',
      ...addressOverrides,
    },
    ...overrides,
  };
}

const Harness = defineComponent({
  setup() {
    return useLocationSnapshot();
  },
  template: `
    <div>
      <span data-testid="address">{{ enderecoPadronizado }}</span>
      <span data-testid="coordinates">{{ coordinates }}</span>
      <span data-testid="sidra">{{ sidraLabel }}</span>
    </div>
  `,
});

async function flushComposableEffects(): Promise<void> {
  await Promise.resolve();
  await nextTick();
}

describe('useLocationSnapshot', () => {
  let listener: ((snapshot: CachedLocationSnapshot) => void) | null;
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

  it('returns waiting labels when no snapshot is available', async () => {
    const wrapper = await mountHarness();

    expect(wrapper.get('[data-testid="address"]').text()).toBe(WAITING_LABEL);
    expect(wrapper.get('[data-testid="coordinates"]').text()).toBe(WAITING_LABEL);
    expect(wrapper.get('[data-testid="sidra"]').text()).toBe(WAITING_LABEL);
  });

  it('formats snapshot data correctly', async () => {
    jest.spyOn(locationSnapshotRepository, 'getLatestLocationSnapshot').mockResolvedValueOnce(createSnapshot());

    const wrapper = await mountHarness();

    expect(wrapper.get('[data-testid="address"]').text()).toBe(`Av. Paulista, 1000${SNAPSHOT_SUFFIX}`);
    expect(wrapper.get('[data-testid="coordinates"]').text()).toBe(
      `-23.550520, -46.633308${SNAPSHOT_SUFFIX}`
    );
    expect(wrapper.get('[data-testid="sidra"]').text()).toBe('São Paulo — SP');
  });

  it('handles missing address fields gracefully', async () => {
    jest.spyOn(locationSnapshotRepository, 'getLatestLocationSnapshot').mockResolvedValueOnce(
      createSnapshot(
        {},
        {
          displayText: '',
          municipio: '',
          siglaUF: '',
        }
      )
    );

    const wrapper = await mountHarness();

    expect(wrapper.get('[data-testid="address"]').text()).toBe(WAITING_LABEL);
    expect(wrapper.get('[data-testid="coordinates"]').text()).toBe(
      `-23.550520, -46.633308${SNAPSHOT_SUFFIX}`
    );
    expect(wrapper.get('[data-testid="sidra"]').text()).toBe(WAITING_LABEL);
  });

  it('updates snapshot when the repository emits a new value', async () => {
    const wrapper = await mountHarness();

    expect(wrapper.get('[data-testid="address"]').text()).toBe(WAITING_LABEL);

    listener?.(createSnapshot());
    await nextTick();

    expect(wrapper.get('[data-testid="address"]').text()).toBe(`Av. Paulista, 1000${SNAPSHOT_SUFFIX}`);
    expect(wrapper.get('[data-testid="coordinates"]').text()).toBe(
      `-23.550520, -46.633308${SNAPSHOT_SUFFIX}`
    );
    expect(wrapper.get('[data-testid="sidra"]').text()).toBe('São Paulo — SP');
  });

  it('calls unsubscribe on unmount', async () => {
    const wrapper = await mountHarness();

    wrapper.unmount();

    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});
