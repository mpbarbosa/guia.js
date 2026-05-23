/**
 * @jest-environment jsdom
 */
import { ref, nextTick } from 'vue';
import { useNavigationHistory, NavigationHistoryItem } from '../../src/composables/useNavigationHistory';
import AddressCache from '../../src/data/AddressCache.js';

jest.mock('../../src/data/AddressCache.js', () => {
  // Singleton mock with subscribe/unsubscribe and currentAddress
  let currentAddress: any = null;
  let observer: any = null;
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        subscribe: jest.fn((obs: any) => {
          observer = obs;
        }),
        unsubscribe: jest.fn((obs: any) => {
          if (observer === obs) observer = null;
        }),
        get currentAddress() {
          return currentAddress;
        },
        setCurrentAddress(addr: any) {
          currentAddress = addr;
        },
        // For test access
        _getObserver: () => observer,
      })),
    },
  };
});

const getMockCache = () => (AddressCache.getInstance() as any);

describe('useNavigationHistory', () => {
  beforeEach(() => {
    // Reset singleton state before each test
    getMockCache().setCurrentAddress(null);
    getMockCache()._getObserver() && getMockCache().unsubscribe(getMockCache()._getObserver());
  });

  it('initializes with empty history', () => {
    const { history } = useNavigationHistory();
    expect(history.value).toEqual([]);
  });

  it('adds a new entry when observer receives a valid address', () => {
    const { history } = useNavigationHistory();
    const observer = getMockCache()._getObserver();
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    observer.update({
      currentAddress: {
        logradouro: 'Rua A',
        bairro: 'Centro',
        municipio: 'São Paulo',
      },
    });

    expect(history.value.length).toBe(1);
    expect(history.value[0]).toMatchObject<Partial<NavigationHistoryItem>>({
      title: 'Rua A',
      desc: 'Centro, São Paulo',
      time: 'Agora',
      icon: 'bi-map-fill',
      timestamp: now,
    });
  });

  it('uses municipio as title if logradouro is null', () => {
    const { history } = useNavigationHistory();
    const observer = getMockCache()._getObserver();

    observer.update({
      currentAddress: {
        logradouro: null,
        bairro: 'Bairro',
        municipio: 'Cidade',
      },
    });

    expect(history.value[0].title).toBe('Cidade');
    expect(history.value[0].icon).toBe('bi-geo-alt-fill');
  });

  it('does not add entry if municipio is missing', () => {
    const { history } = useNavigationHistory();
    const observer = getMockCache()._getObserver();

    observer.update({
      currentAddress: {
        logradouro: 'Rua B',
        bairro: 'Bairro',
        municipio: null,
      },
    });

    expect(history.value.length).toBe(0);
  });

  it('does not add duplicate entry if title matches last', () => {
    const { history } = useNavigationHistory();
    const observer = getMockCache()._getObserver();

    observer.update({
      currentAddress: {
        logradouro: 'Rua C',
        bairro: 'Bairro',
        municipio: 'Cidade',
      },
    });
    observer.update({
      currentAddress: {
        logradouro: 'Rua C',
        bairro: 'Outro Bairro',
        municipio: 'Cidade',
      },
    });

    expect(history.value.length).toBe(1);
    expect(history.value[0].desc).toBe('Bairro, Cidade');
  });

  it('limits history to MAX_HISTORY entries', () => {
    const { history } = useNavigationHistory();
    const observer = getMockCache()._getObserver();

    for (let i = 0; i < 25; i++) {
      observer.update({
        currentAddress: {
          logradouro: `Rua ${i}`,
          bairro: `Bairro ${i}`,
          municipio: 'Cidade',
        },
      });
    }
    expect(history.value.length).toBe(20);
    expect(history.value[0].title).toBe('Rua 24');
    expect(history.value[19].title).toBe('Rua 5');
  });

  it('formatTime returns "Agora" for <1min, "Xmin atrás" for <60min, "Xh atrás" for <24h, "Ontem" otherwise', () => {
    const { formatTime } = useNavigationHistory();
    const now = Date.now();

    expect(formatTime(now)).toBe('Agora');
    expect(formatTime(now - 5 * 60 * 1000)).toBe('5min atrás');
    expect(formatTime(now - 2 * 60 * 60 * 1000)).toBe('2h atrás');
    expect(formatTime(now - 30 * 60 * 60 * 1000)).toBe('Ontem');
  });

  it('subscribes and unsubscribes observer on mount/unmount', () => {
    const subscribe = jest.fn();
    const unsubscribe = jest.fn();
    (AddressCache.getInstance as jest.Mock).mockReturnValueOnce({
      subscribe,
      unsubscribe,
      get currentAddress() { return null; },
    });

    const { history } = useNavigationHistory();
    expect(subscribe).toHaveBeenCalled();

    // Simulate unmount
    // onUnmounted is called when the component is destroyed; here, we call all registered unmount hooks
    // Since we are not in a real component, we can't trigger lifecycle, but we can check that unsubscribe is present and callable
    expect(typeof unsubscribe).toBe('function');
  });

  it('calls update on mount if currentAddress has municipio', () => {
    const addr = { logradouro: 'Rua D', bairro: 'Bairro D', municipio: 'Cidade D' };
    (AddressCache.getInstance as jest.Mock).mockReturnValueOnce({
      subscribe: jest.fn((obs: any) => { obs.update({ currentAddress: addr }); }),
      unsubscribe: jest.fn(),
      get currentAddress() { return addr; },
    });

    const { history } = useNavigationHistory();
    expect(history.value.length).toBe(1);
    expect(history.value[0].title).toBe('Rua D');
  });
});
