/**
 * @jest-environment jsdom
 */
import { ref, nextTick } from 'vue';
import { useMapDisplayer } from '../../src/composables/useMapDisplayer';
import MapLibreDisplayer from '../../src/html/MapLibreDisplayer';
import PositionManager from '../../src/core/PositionManager';
import AddressCache from '../../src/data/AddressCache';

// Mocks for MapLibreDisplayer, PositionManager, and AddressCache
jest.mock('../../src/html/MapLibreDisplayer', () => {
  return jest.fn().mockImplementation(() => ({
    mount: jest.fn(),
    updatePosition: jest.fn(),
    onMapClick: jest.fn(),
    offMapClick: jest.fn(),
  }));
});

const subscribeMock = jest.fn();
const unsubscribeMock = jest.fn();
const getInstanceMock = jest.fn();

jest.mock('../../src/core/PositionManager', () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(),
    },
  };
});

jest.mock('../../src/data/AddressCache', () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(),
    },
  };
});

describe('useMapDisplayer', () => {
  let positionSubscribers: Array<any>;
  let addressSubscribers: Array<any>;
  let mapDisplayerInstance: {
    mount: jest.Mock;
    updatePosition: jest.Mock;
    onMapClick: jest.Mock;
    offMapClick: jest.Mock;
  };

  beforeEach(() => {
    // Reset mocks and subscriber arrays
    positionSubscribers = [];
    addressSubscribers = [];
    mapDisplayerInstance = {
      mount: jest.fn(),
      updatePosition: jest.fn(),
      onMapClick: jest.fn(),
      offMapClick: jest.fn(),
    };

    // MapLibreDisplayer mock
    (MapLibreDisplayer as unknown as jest.Mock).mockImplementation(() => mapDisplayerInstance);

    // PositionManager mock
    (PositionManager.getInstance as jest.Mock).mockReturnValue({
      subscribe: (observer: any) => positionSubscribers.push(observer),
      unsubscribe: (observer: any) => {
        const idx = positionSubscribers.indexOf(observer);
        if (idx !== -1) positionSubscribers.splice(idx, 1);
      },
    });

    // AddressCache mock
    (AddressCache.getInstance as jest.Mock).mockReturnValue({
      subscribe: (observer: any) => addressSubscribers.push(observer),
      unsubscribe: (observer: any) => {
        const idx = addressSubscribers.indexOf(observer);
        if (idx !== -1) addressSubscribers.splice(idx, 1);
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function triggerVueLifecycle(hook: () => void) {
    // Simulate Vue's onMounted/onUnmounted
    hook();
    return nextTick();
  }

  it('initializes refs with default values', () => {
    const { street, neighborhood, city } = useMapDisplayer();
    expect(street.value).toBe('Aguardando...');
    expect(neighborhood.value).toBe('—');
    expect(city.value).toBe('—');
  });

  it('mounts MapLibreDisplayer and subscribes observers on mount', async () => {
    useMapDisplayer();
    // Simulate onMounted
    await triggerVueLifecycle(() => {
      // onMounted is called inside useMapDisplayer, so nothing to do here
    });

    expect(MapLibreDisplayer).toHaveBeenCalledWith('maplibre-map', '');
    expect(mapDisplayerInstance.mount).toHaveBeenCalled();
    expect(positionSubscribers.length).toBe(1);
    expect(addressSubscribers.length).toBe(1);
  });

  it('unsubscribes observers and clears displayer on unmount', async () => {
    useMapDisplayer();
    // Simulate onMounted
    await triggerVueLifecycle(() => {});
    // Simulate onUnmounted
    await triggerVueLifecycle(() => {});

    expect(positionSubscribers.length).toBe(0);
    expect(addressSubscribers.length).toBe(0);
  });

  it('updates map position when positionObserver receives valid coordinates', async () => {
    useMapDisplayer();
    await triggerVueLifecycle(() => {});

    const observer = positionSubscribers[0];
    observer.update({ latitude: 10, longitude: 20 });
    expect(mapDisplayerInstance.updatePosition).toHaveBeenCalledWith(10, 20);
  });

  it('does not update map position when positionObserver receives null coordinates', async () => {
    useMapDisplayer();
    await triggerVueLifecycle(() => {});

    const observer = positionSubscribers[0];
    observer.update({ latitude: null, longitude: 20 });
    observer.update({ latitude: 10, longitude: null });
    observer.update({ latitude: null, longitude: null });
    expect(mapDisplayerInstance.updatePosition).not.toHaveBeenCalled();
  });

  it('updates refs when addressObserver receives a valid address', async () => {
    const { street, neighborhood, city } = useMapDisplayer();
    await triggerVueLifecycle(() => {});

    const observer = addressSubscribers[0];
    observer.update({
      currentAddress: {
        logradouro: 'Rua Teste',
        bairro: 'Centro',
        municipio: 'Cidade',
      },
    });

    expect(street.value).toBe('Rua Teste');
    expect(neighborhood.value).toBe('Centro');
    expect(city.value).toBe('Cidade');
  });

  it('sets fallback values when addressObserver receives null fields', async () => {
    const { street, neighborhood, city } = useMapDisplayer();
    await triggerVueLifecycle(() => {});

    const observer = addressSubscribers[0];
    observer.update({
      currentAddress: {
        logradouro: null,
        bairro: null,
        municipio: null,
      },
    });

    expect(street.value).toBe('Aguardando...');
    expect(neighborhood.value).toBe('—');
    expect(city.value).toBe('—');
  });

  it('does not update refs when addressObserver receives null currentAddress', async () => {
    const { street, neighborhood, city } = useMapDisplayer();
    await triggerVueLifecycle(() => {});

    const observer = addressSubscribers[0];
    observer.update({ currentAddress: null });

    expect(street.value).toBe('Aguardando...');
    expect(neighborhood.value).toBe('—');
    expect(city.value).toBe('—');
  });

  it('handles multiple mount/unmount cycles without leaking observers', async () => {
    useMapDisplayer();
    await triggerVueLifecycle(() => {});
    expect(positionSubscribers.length).toBe(1);
    expect(addressSubscribers.length).toBe(1);

    await triggerVueLifecycle(() => {});
    expect(positionSubscribers.length).toBe(0);
    expect(addressSubscribers.length).toBe(0);

    useMapDisplayer();
    await triggerVueLifecycle(() => {});
    expect(positionSubscribers.length).toBe(1);
    expect(addressSubscribers.length).toBe(1);
  });
});
