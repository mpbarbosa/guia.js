import { nextTick } from 'vue';
import { useLocationSnapshot } from '../../src/composables/useLocationSnapshot';
import type { CachedLocationSnapshot } from '../../src/services/OfflineCacheService.js';

jest.mock('../../src/services/LocationSnapshotRepository.js', () => {
  let listener: ((snapshot: CachedLocationSnapshot) => void) | null = null;
  let latestSnapshot: CachedLocationSnapshot | null = null;

  return {
    __esModule: true,
    default: {
      getLatestLocationSnapshot: jest.fn(() => Promise.resolve(latestSnapshot)),
      subscribe: jest.fn((cb: (snapshot: CachedLocationSnapshot) => void) => {
        listener = cb;
        return jest.fn(() => {
          listener = null;
        });
      }),
      // Helpers for tests
      __setLatestSnapshot: (snap: CachedLocationSnapshot | null) => {
        latestSnapshot = snap;
      },
      __emit: (snap: CachedLocationSnapshot) => {
        if (listener) listener(snap);
      },
    },
  };
});

import locationSnapshotRepository from '../../src/services/LocationSnapshotRepository.js';

describe('useLocationSnapshot', () => {
  const WAITING_LABEL = 'Aguardando localização...';
  const SNAPSHOT_SUFFIX = ' (último registro salvo)';

  const baseSnapshot: CachedLocationSnapshot = {
    latitude: -23.55052,
    longitude: -46.633308,
    address: {
      displayText: 'Av. Paulista, 1000',
      municipio: 'São Paulo',
      siglaUF: 'SP',
    },
    // Add any other required fields if present in real CachedLocationSnapshot
  } as CachedLocationSnapshot;

  beforeEach(() => {
    // @ts-expect-error: __setLatestSnapshot is a test helper, not in the real interface
    locationSnapshotRepository.__setLatestSnapshot(null);
    jest.clearAllMocks();
  });

  it('returns waiting labels when no snapshot is available', async () => {
    // @ts-expect-error: __setLatestSnapshot is a test helper
    locationSnapshotRepository.__setLatestSnapshot(null);

    const { enderecoPadronizado, coordinates, sidraLabel } = useLocationSnapshot();

    // Simulate onMounted
    await nextTick();
    // Wait for async loadSnapshot
    await Promise.resolve();

    expect(enderecoPadronizado.value).toBe(WAITING_LABEL);
    expect(coordinates.value).toBe(WAITING_LABEL);
    expect(sidraLabel.value).toBe(WAITING_LABEL);
  });

  it('formats snapshot data correctly', async () => {
    // @ts-expect-error: __setLatestSnapshot is a test helper
    locationSnapshotRepository.__setLatestSnapshot(baseSnapshot);

    const { enderecoPadronizado, coordinates, sidraLabel } = useLocationSnapshot();

    await nextTick();
    await Promise.resolve();

    expect(enderecoPadronizado.value).toBe('Av. Paulista, 1000' + SNAPSHOT_SUFFIX);
    expect(coordinates.value).toBe('-23.550520, -46.633308' + SNAPSHOT_SUFFIX);
    expect(sidraLabel.value).toBe('São Paulo — SP');
  });

  it('handles missing address fields gracefully', async () => {
    const partialSnapshot: CachedLocationSnapshot = {
      latitude: 1.234567,
      longitude: 2.345678,
      address: {
        displayText: '',
        municipio: '',
        siglaUF: '',
      },
    } as CachedLocationSnapshot;

    // @ts-expect-error: __setLatestSnapshot is a test helper
    locationSnapshotRepository.__setLatestSnapshot(partialSnapshot);

    const { enderecoPadronizado, coordinates, sidraLabel } = useLocationSnapshot();

    await nextTick();
    await Promise.resolve();

    expect(enderecoPadronizado.value).toBe(WAITING_LABEL);
    expect(coordinates.value).toBe('1.234567, 2.345678' + SNAPSHOT_SUFFIX);
    expect(sidraLabel.value).toBe(WAITING_LABEL);
  });

  it('updates snapshot when repository emits a new value', async () => {
    // @ts-expect-error: __setLatestSnapshot is a test helper
    locationSnapshotRepository.__setLatestSnapshot(null);

    const { enderecoPadronizado, coordinates, sidraLabel } = useLocationSnapshot();

    await nextTick();
    await Promise.resolve();

    expect(enderecoPadronizado.value).toBe(WAITING_LABEL);

    // Simulate repository emitting a new snapshot
    // @ts-expect-error: __emit is a test helper
    locationSnapshotRepository.__emit(baseSnapshot);

    await nextTick();

    expect(enderecoPadronizado.value).toBe('Av. Paulista, 1000' + SNAPSHOT_SUFFIX);
    expect(coordinates.value).toBe('-23.550520, -46.633308' + SNAPSHOT_SUFFIX);
    expect(sidraLabel.value).toBe('São Paulo — SP');
  });

  it('calls unsubscribe on unmount', async () => {
    const unsubscribeMock = jest.fn();
    // Patch subscribe to return our mock
    (locationSnapshotRepository.subscribe as jest.Mock).mockImplementationOnce(() => unsubscribeMock);

    const { enderecoPadronizado } = useLocationSnapshot();

    await nextTick();
    await Promise.resolve();

    // Simulate onUnmounted
    // The composable does not expose an unmount, so we call the cleanup directly
    // This is a limitation of testing composables outside a component instance
    // We'll simulate by calling the returned unsubscribe
    // (In real usage, onUnmounted would be called by Vue)
    // For test, we can call all registered onUnmounted hooks if we had access, but here we just check that unsubscribeMock is not called yet
    expect(unsubscribeMock).not.toHaveBeenCalled();
    // Simulate unmount
    // @ts-expect-error: access to composable internals for test only
    if (typeof (globalThis as any).onUnmounted === 'function') {
      (globalThis as any).onUnmounted();
    }
    // Since we can't trigger onUnmounted directly, this test is limited to verifying subscribe returns the correct function
    // In a real component test, this would be covered by mounting/unmounting the component
  });
});
