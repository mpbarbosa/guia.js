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

// Import modules after mocks are registered
const IBGEMod = await import('../../src/services/IBGECityStatsService');
const AddressCacheMod = await import('../../src/data/AddressCache');
const { useIBGECityStats } = await import('../../src/composables/useIBGECityStats');

const { __resetCityStatsCacheForTests } = IBGEMod;
const AddressCache = AddressCacheMod.default;

const RIO_CODE = 3304557;

/**
 * Sets up global.fetch to return realistic IBGE API responses for 3 sequential calls:
 * 1. localidades search, 2. population (SIDRA), 3. area (malhas)
 */
function mockIBGESuccess({ code = RIO_CODE, name = 'Rio de Janeiro', uf = 'RJ', population = 6748000, year = '2023', area = 1200.27 } = {}) {
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: code, nome: name, microrregiao: { mesorregiao: { UF: { sigla: uf } } } }],
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [{ resultados: [{ series: [{ serie: { [year]: String(population) } }] }] }],
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ features: [{ properties: { area_km2: area } }] }),
    });
}

describe('useIBGECityStats', () => {
  let result;
  let mockSubscribe;
  let mockUnsubscribe;
  let capturedObserver;

  beforeEach(() => {
    mountedCb = null;
    unmountedCb = null;
    capturedObserver = null;
    __resetCityStatsCacheForTests();
    global.fetch = jest.fn();

    mockSubscribe = jest.fn((obs) => { capturedObserver = obs; });
    mockUnsubscribe = jest.fn();

    jest.spyOn(AddressCache, 'getInstance').mockReturnValue({
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      currentAddress: null,
    });

    result = useIBGECityStats();
  });

  afterEach(() => jest.restoreAllMocks());

  // ---------------------------------------------------------------------------
  describe('initial state', () => {
    it('stats is null before mount', () => {
      expect(result.stats.value).toBeNull();
    });

    it('loading is false before mount', () => {
      expect(result.loading.value).toBe(false);
    });

    it('error is null before mount', () => {
      expect(result.error.value).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  describe('onMounted callback', () => {
    it('subscribes to AddressCache', () => {
      mountedCb();
      expect(mockSubscribe).toHaveBeenCalledTimes(1);
    });

    it('seeds from current address when already resolved', async () => {
      mockIBGESuccess();
      jest.spyOn(AddressCache, 'getInstance').mockReturnValue({
        subscribe: mockSubscribe,
        unsubscribe: mockUnsubscribe,
        currentAddress: { municipio: 'Rio de Janeiro', uf: 'Rio de Janeiro', siglaUF: 'RJ' },
      });

      result = useIBGECityStats();
      mountedCb();

      await new Promise((r) => setTimeout(r, 0));

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('localidades/municipios?nome=Rio'));
    });

    it('does not call fetch when currentAddress is null', () => {
      mountedCb();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  describe('address observer', () => {
    beforeEach(() => mountedCb());

    it('calls IBGE API when observer fires with valid address', async () => {
      mockIBGESuccess();
      capturedObserver.update({ currentAddress: { municipio: 'Rio de Janeiro', uf: 'Rio de Janeiro', siglaUF: 'RJ' } });

      await new Promise((r) => setTimeout(r, 0));

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('localidades/municipios?nome=Rio'));
    });

    it('sets stats.value with fetched data', async () => {
      mockIBGESuccess({ name: 'Rio de Janeiro', uf: 'RJ', population: 6748000, year: '2023', area: 1200.27 });
      capturedObserver.update({ currentAddress: { municipio: 'Rio de Janeiro', uf: 'Rio de Janeiro', siglaUF: 'RJ' } });

      await new Promise((r) => setTimeout(r, 0));

      expect(result.stats.value).not.toBeNull();
      expect(result.stats.value?.name).toBe('Rio de Janeiro');
      expect(result.stats.value?.population).toBe(6748000);
      expect(result.stats.value?.areaKm2).toBe(1200.27);
      expect(result.loading.value).toBe(false);
    });

    it('keeps stats null when service returns null (city not found)', async () => {
      // IBGE localidades returns empty array → service returns null (no throw)
      global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      capturedObserver.update({ currentAddress: { municipio: 'CidadeInexistente', uf: 'Estado Z', siglaUF: 'ZZ' } });

      await new Promise((r) => setTimeout(r, 0));

      expect(result.stats.value).toBeNull();
      expect(result.error.value).toBeNull();
      expect(result.loading.value).toBe(false);
    });

    it('deduplicates: does not re-fetch for same municipio/uf', async () => {
      mockIBGESuccess();
      capturedObserver.update({ currentAddress: { municipio: 'Rio de Janeiro', uf: 'Rio de Janeiro', siglaUF: 'RJ' } });
      await new Promise((r) => setTimeout(r, 0));

      const firstCallCount = global.fetch.mock.calls.length;

      capturedObserver.update({ currentAddress: { municipio: 'Rio de Janeiro', uf: 'Rio de Janeiro', siglaUF: 'RJ' } });
      await new Promise((r) => setTimeout(r, 0));

      expect(global.fetch.mock.calls.length).toBe(firstCallCount);
    });

    it('re-fetches when city changes', async () => {
      mockIBGESuccess({ name: 'Rio de Janeiro' });
      capturedObserver.update({ currentAddress: { municipio: 'Rio de Janeiro', uf: 'Rio de Janeiro', siglaUF: 'RJ' } });
      await new Promise((r) => setTimeout(r, 0));

      __resetCityStatsCacheForTests();
      mockIBGESuccess({ code: 3303807, name: 'Paraty' });
      capturedObserver.update({ currentAddress: { municipio: 'Paraty', uf: 'Rio de Janeiro', siglaUF: 'RJ' } });
      await new Promise((r) => setTimeout(r, 0));

      expect(result.stats.value?.name).toBe('Paraty');
    });

    it('prefers siglaUF over the full state name in uf', async () => {
      mockIBGESuccess({ code: 3550308, name: 'São Paulo', uf: 'SP', population: 12345678, year: '2025', area: 1521.11 });
      capturedObserver.update({ currentAddress: { municipio: 'São Paulo', uf: 'São Paulo', siglaUF: 'SP' } });

      await new Promise((r) => setTimeout(r, 0));

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('localidades/municipios?nome=S%C3%A3o%20Paulo'));
      expect(result.stats.value?.uf).toBe('SP');
    });

    it('skips update when municipio is null', () => {
      capturedObserver.update({ currentAddress: { municipio: null, uf: 'Rio de Janeiro', siglaUF: 'RJ' } });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('skips update when siglaUF is missing even if full uf is present', () => {
      capturedObserver.update({ currentAddress: { municipio: 'São Paulo', uf: 'São Paulo', siglaUF: null } });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('skips update when currentAddress is null', () => {
      capturedObserver.update({ currentAddress: null });
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  describe('onUnmounted callback', () => {
    it('unsubscribes from AddressCache', () => {
      mountedCb();
      unmountedCb();
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
