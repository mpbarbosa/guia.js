/**
 * @jest-environment jsdom
 */
import { nextTick } from 'vue';
import { useIBGECityStats } from '../../src/composables/useIBGECityStats';
import type { CityStats } from '../../src/services/IBGECityStatsService.js';

jest.mock('../../src/services/IBGECityStatsService.js', () => ({
  fetchStats: jest.fn(),
}));

const mockSubscribe = jest.fn();
const mockUnsubscribe = jest.fn();
let mockCurrentAddress: { municipio: string | null; uf: string | null } | null = null;

jest.mock('../../src/data/AddressCache.js', () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        subscribe: mockSubscribe,
        unsubscribe: mockUnsubscribe,
        get currentAddress() {
          return mockCurrentAddress;
        },
      })),
    },
  };
});

import { fetchStats } from '../../src/services/IBGECityStatsService.js';
import AddressCache from '../../src/data/AddressCache.js';

describe('useIBGECityStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentAddress = null;
  });

  it('initializes with null stats, false loading, and null error', () => {
    const { stats, loading, error } = useIBGECityStats();
    expect(stats.value).toBeNull();
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it('subscribes and unsubscribes to AddressCache on mount/unmount', () => {
    const { stats, loading, error } = useIBGECityStats();
    expect(mockSubscribe).not.toHaveBeenCalled();
    expect(mockUnsubscribe).not.toHaveBeenCalled();

    // Simulate onMounted
    (require('vue') as any).onMounted.mock.calls[0][0]();
    expect(mockSubscribe).toHaveBeenCalledTimes(1);

    // Simulate onUnmounted
    (require('vue') as any).onUnmounted.mock.calls[0][0]();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('loads stats when address changes and sets loading state', async () => {
    const fakeStats: CityStats = { id: 1, name: 'Test City' } as CityStats;
    (fetchStats as jest.Mock).mockResolvedValue(fakeStats);

    const { stats, loading, error } = useIBGECityStats();

    // Simulate observer update
    const observer = mockSubscribe.mock.calls[0][0];
    await observer.update({ currentAddress: { municipio: 'A', uf: 'B' } });

    expect(loading.value).toBe(true);

    // Wait for async
    await nextTick();
    await Promise.resolve();

    expect(fetchStats).toHaveBeenCalledWith('A', 'B');
    expect(stats.value).toEqual(fakeStats);
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it('does not reload stats for the same municipio/uf', async () => {
    const fakeStats: CityStats = { id: 2, name: 'City2' } as CityStats;
    (fetchStats as jest.Mock).mockResolvedValue(fakeStats);

    const { stats } = useIBGECityStats();
    const observer = mockSubscribe.mock.calls[0][0];

    await observer.update({ currentAddress: { municipio: 'X', uf: 'Y' } });
    await Promise.resolve();

    expect(fetchStats).toHaveBeenCalledWith('X', 'Y');
    expect(stats.value).toEqual(fakeStats);

    // Try again with same key
    await observer.update({ currentAddress: { municipio: 'X', uf: 'Y' } });
    expect(fetchStats).toHaveBeenCalledTimes(1);
  });

  it('handles missing municipio or uf gracefully', async () => {
    const { stats } = useIBGECityStats();
    const observer = mockSubscribe.mock.calls[0][0];

    await observer.update({ currentAddress: { municipio: null, uf: 'B' } });
    await observer.update({ currentAddress: { municipio: 'A', uf: null } });
    await observer.update({ currentAddress: null });

    expect(fetchStats).not.toHaveBeenCalled();
    expect(stats.value).toBeNull();
  });

  it('sets error and resets stats on fetchStats failure', async () => {
    (fetchStats as jest.Mock).mockRejectedValue(new Error('fail!'));

    const { stats, loading, error } = useIBGECityStats();
    const observer = mockSubscribe.mock.calls[0][0];

    await observer.update({ currentAddress: { municipio: 'M', uf: 'U' } });
    await Promise.resolve();

    expect(loading.value).toBe(false);
    expect(stats.value).toBeNull();
    expect(error.value).toBe('fail!');
  });

  it('sets default error message if error has no message', async () => {
    (fetchStats as jest.Mock).mockRejectedValue({});

    const { error } = useIBGECityStats();
    const observer = mockSubscribe.mock.calls[0][0];

    await observer.update({ currentAddress: { municipio: 'M', uf: 'U' } });
    await Promise.resolve();

    expect(error.value).toBe('Erro ao carregar dados');
  });

  it('loads stats immediately if currentAddress is already resolved on mount', async () => {
    const fakeStats: CityStats = { id: 3, name: 'Immediate' } as CityStats;
    (fetchStats as jest.Mock).mockResolvedValue(fakeStats);
    mockCurrentAddress = { municipio: 'Now', uf: 'Here' };

    useIBGECityStats();

    // Simulate onMounted
    (require('vue') as any).onMounted.mock.calls[0][0]();

    expect(fetchStats).toHaveBeenCalledWith('Now', 'Here');
  });
});
