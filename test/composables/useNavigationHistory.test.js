/**
 * @jest-environment jsdom
 */

// Mock vue lifecycle hooks (package name — works with jest.unstable_mockModule in .js files)
let mountedCb = null;
let unmountedCb = null;

const refImpl = (initial) => {
  let _v = initial;
  return Object.defineProperty({}, 'value', {
    get: () => _v,
    set: (v) => { _v = v; },
    enumerable: true,
  });
};

jest.unstable_mockModule('vue', () => ({
  __esModule: true,
  ref: jest.fn(refImpl),
  onMounted: jest.fn((cb) => { mountedCb = cb; }),
  onUnmounted: jest.fn((cb) => { unmountedCb = cb; }),
}));

const AddressCacheMod = await import('../../src/data/AddressCache');
const { useNavigationHistory } = await import('../../src/composables/useNavigationHistory');

const AddressCache = AddressCacheMod.default;

function makeAddress({ logradouro = null, bairro = null, municipio = 'São Paulo' } = {}) {
  return { logradouro, bairro, municipio };
}

describe('useNavigationHistory', () => {
  let result;
  let mockSubscribe;
  let mockUnsubscribe;
  let capturedObserver;

  beforeEach(() => {
    mountedCb = null;
    unmountedCb = null;
    capturedObserver = null;

    mockSubscribe = jest.fn((obs) => { capturedObserver = obs; });
    mockUnsubscribe = jest.fn();

    jest.spyOn(AddressCache, 'getInstance').mockReturnValue({
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      currentAddress: null,
    });

    result = useNavigationHistory();
  });

  afterEach(() => jest.restoreAllMocks());

  it('starts with empty history', () => {
    expect(result.history.value).toEqual([]);
  });

  it('subscribes to AddressCache on mount', () => {
    mountedCb();
    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(capturedObserver).toBeDefined();
  });

  it('unsubscribes from AddressCache on unmount', () => {
    mountedCb();
    unmountedCb();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('adds an entry when address changes with municipio', () => {
    mountedCb();
    capturedObserver.update({ currentAddress: makeAddress({ municipio: 'Campinas' }) });
    expect(result.history.value).toHaveLength(1);
    expect(result.history.value[0].title).toBe('Campinas');
  });

  it('uses logradouro as title when present', () => {
    mountedCb();
    capturedObserver.update({ currentAddress: makeAddress({ logradouro: 'Av. Paulista', municipio: 'São Paulo' }) });
    expect(result.history.value[0].title).toBe('Av. Paulista');
    expect(result.history.value[0].icon).toBe('bi-map-fill');
  });

  it('uses geo icon when only municipio is available', () => {
    mountedCb();
    capturedObserver.update({ currentAddress: makeAddress({ municipio: 'Recife' }) });
    expect(result.history.value[0].icon).toBe('bi-geo-alt-fill');
  });

  it('includes bairro in desc when present', () => {
    mountedCb();
    capturedObserver.update({ currentAddress: makeAddress({ bairro: 'Moema', municipio: 'São Paulo' }) });
    expect(result.history.value[0].desc).toContain('Moema');
    expect(result.history.value[0].desc).toContain('São Paulo');
  });

  it('skips duplicate consecutive entries', () => {
    mountedCb();
    const addr = makeAddress({ logradouro: 'Rua das Flores', municipio: 'Curitiba' });
    capturedObserver.update({ currentAddress: addr });
    capturedObserver.update({ currentAddress: addr });
    expect(result.history.value).toHaveLength(1);
  });

  it('adds distinct addresses as separate entries', () => {
    mountedCb();
    capturedObserver.update({ currentAddress: makeAddress({ municipio: 'São Paulo' }) });
    capturedObserver.update({ currentAddress: makeAddress({ municipio: 'Campinas' }) });
    expect(result.history.value).toHaveLength(2);
    expect(result.history.value[0].title).toBe('Campinas');
    expect(result.history.value[1].title).toBe('São Paulo');
  });

  it('ignores update when currentAddress has no municipio', () => {
    mountedCb();
    capturedObserver.update({ currentAddress: null });
    capturedObserver.update({ currentAddress: { logradouro: 'Rua X', bairro: null, municipio: null } });
    expect(result.history.value).toHaveLength(0);
  });

  it('seeds from currentAddress if already resolved on mount', () => {
    const current = makeAddress({ municipio: 'Manaus' });
    jest.spyOn(AddressCache, 'getInstance').mockReturnValue({
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      currentAddress: current,
    });
    result = useNavigationHistory();
    mountedCb();
    expect(result.history.value).toHaveLength(1);
    expect(result.history.value[0].title).toBe('Manaus');
  });

  it('caps history at 20 entries', () => {
    mountedCb();
    for (let i = 0; i < 25; i++) {
      capturedObserver.update({ currentAddress: makeAddress({ municipio: `Cidade ${i}` }) });
    }
    expect(result.history.value).toHaveLength(20);
  });

  it('formatTime returns "Agora" for very recent timestamps', () => {
    expect(result.formatTime(Date.now())).toBe('Agora');
  });

  it('formatTime returns minute label for timestamps 1-59 minutes ago', () => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    expect(result.formatTime(fiveMinAgo)).toBe('5min atrás');
  });

  it('formatTime returns hour label for timestamps 1-23 hours ago', () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    expect(result.formatTime(twoHoursAgo)).toBe('2h atrás');
  });

  it('formatTime returns "Ontem" for timestamps 24+ hours ago', () => {
    const yesterday = Date.now() - 25 * 60 * 60 * 1000;
    expect(result.formatTime(yesterday)).toBe('Ontem');
  });
});
