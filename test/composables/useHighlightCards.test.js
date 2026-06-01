let unmountedCb = null;

const refImpl = (initial) => {
  let value = initial;
  return Object.defineProperty({}, 'value', {
    get: () => value,
    set: (nextValue) => {
      value = nextValue;
    },
    enumerable: true,
  });
};

jest.unstable_mockModule('vue', () => ({
  __esModule: true,
  ref: jest.fn(refImpl),
  onUnmounted: jest.fn((cb) => {
    unmountedCb = cb;
  }),
}));

const addressCacheInstance = {
  currentAddress: null,
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
};

const AddressCacheMod = await import('../../src/data/AddressCache');
const { useHighlightCards } = await import('../../src/composables/useHighlightCards');
const AddressCache = AddressCacheMod.default;

describe('useHighlightCards', () => {
  let capturedObserver;
  let getInstanceSpy;

  beforeEach(() => {
    unmountedCb = null;
    capturedObserver = null;
    addressCacheInstance.currentAddress = null;
    addressCacheInstance.subscribe.mockReset();
    addressCacheInstance.unsubscribe.mockReset();
    getInstanceSpy = jest.spyOn(AddressCache, 'getInstance').mockReturnValue(addressCacheInstance);
    addressCacheInstance.subscribe.mockImplementation((observer) => {
      capturedObserver = observer;
    });
  });

  afterEach(() => {
    getInstanceSpy?.mockRestore();
  });

  it('hydrates from the latest cache address during setup', () => {
    addressCacheInstance.currentAddress = {
      municipio: 'Campinas',
      bairro: 'Taquaral',
      logradouro: 'Rua ABC',
      regiaoMetropolitana: 'RMC',
    };

    const result = useHighlightCards();

    expect(result.municipio.value).toBe('CAMPINAS');
    expect(result.bairro.value).toBe('TAQUARAL');
    expect(result.logradouro.value).toBe('RUA ABC');
    expect(result.regiaoMetropolitana.value).toBe('RMC');
    expect(addressCacheInstance.subscribe).toHaveBeenCalledTimes(1);
  });

  it('updates highlight refs from currentAddress when notified', () => {
    const result = useHighlightCards();

    addressCacheInstance.currentAddress = {
      municipio: 'São Paulo',
      bairro: 'Belém',
      logradouro: 'Rua Elói Cerqueira',
      regiaoMetropolitana: null,
    };
    capturedObserver.update({ type: 'addressUpdated' });

    expect(result.municipio.value).toBe('SÃO PAULO');
    expect(result.bairro.value).toBe('BELÉM');
    expect(result.logradouro.value).toBe('RUA ELÓI CERQUEIRA');
    expect(result.regiaoMetropolitana.value).toBeNull();
  });

  it('unsubscribes with the same observer on teardown', () => {
    useHighlightCards();

    expect(typeof unmountedCb).toBe('function');
    expect(addressCacheInstance.unsubscribe).not.toHaveBeenCalled();

    unmountedCb();

    expect(addressCacheInstance.unsubscribe).toHaveBeenCalledTimes(1);
    expect(addressCacheInstance.unsubscribe).toHaveBeenCalledWith(capturedObserver);
  });
});
