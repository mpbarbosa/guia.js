/**
 * @jest-environment jsdom
 */

// Mock maplibre-gl (package name - required by MapLibreDisplayer internals)
const mockMapInstance = {
  setCenter: jest.fn(),
  resize: jest.fn(),
  addControl: jest.fn(),
  on: jest.fn((event, cb) => { if (event === 'load') cb(); }),
};
const mockMarkerInstance = { setLngLat: jest.fn().mockReturnThis(), addTo: jest.fn() };
const setCoordinatesMock = jest.fn();
const fetchAddressMock = jest.fn();

jest.unstable_mockModule('maplibre-gl', () => ({
  __esModule: true,
  default: {
    Map: jest.fn(() => mockMapInstance),
    Marker: jest.fn(() => mockMarkerInstance),
    NavigationControl: jest.fn(),
  },
}));

// Mock vue lifecycle hooks (package name)
let mountedCb = null;
let unmountedCb = null;
const refImpl = (initial) => {
  let _v = initial;
  return Object.defineProperty({}, 'value', { get: () => _v, set: (v) => { _v = v; }, enumerable: true });
};
jest.unstable_mockModule('vue', () => ({
  __esModule: true,
  ref: jest.fn(refImpl),
  computed: jest.fn((getter) =>
    Object.defineProperty({}, 'value', { get: getter, enumerable: true })
  ),
  onMounted: jest.fn((cb) => { mountedCb = cb; }),
  onUnmounted: jest.fn((cb) => { unmountedCb = cb; }),
}));

// Import modules after mocks are registered
const PositionManagerMod = await import('../../src/core/PositionManager');
const AddressCacheMod = await import('../../src/data/AddressCache');
const { useMapDisplayer } = await import('../../src/composables/useMapDisplayer');

const PositionManager = PositionManagerMod.default;
const AddressCache = AddressCacheMod.default;

describe('useMapDisplayer', () => {
  let result;
  let mockPosSubscribe, mockPosUnsubscribe;
  let mockAddrSubscribe, mockAddrUnsubscribe;
  let capturedPosObserver, capturedAddrObserver;

  beforeEach(() => {
    mountedCb = null;
    unmountedCb = null;
    capturedPosObserver = null;
    capturedAddrObserver = null;

    mockPosSubscribe = jest.fn((obs) => { capturedPosObserver = obs; });
    mockPosUnsubscribe = jest.fn();
    mockAddrSubscribe = jest.fn((obs) => { capturedAddrObserver = obs; });
    mockAddrUnsubscribe = jest.fn();

    jest.spyOn(PositionManager, 'getInstance').mockReturnValue({
      subscribe: mockPosSubscribe,
      unsubscribe: mockPosUnsubscribe,
    });

    jest.spyOn(AddressCache, 'getInstance').mockReturnValue({
      subscribe: mockAddrSubscribe,
      unsubscribe: mockAddrUnsubscribe,
    });

    mockMapInstance.resize.mockClear();
    mockMapInstance.setCenter.mockClear();
    mockMapInstance.on.mockClear();
    mockMapInstance.on.mockImplementation((event, cb) => { if (event === 'load') cb(); });
    mockMarkerInstance.setLngLat.mockClear();
    setCoordinatesMock.mockClear();
    fetchAddressMock.mockReset();

    result = useMapDisplayer({
      createReverseGeocoder: () => ({
        setCoordinates: setCoordinatesMock,
        fetchAddress: fetchAddressMock,
      }),
    });
  });

  afterEach(() => jest.restoreAllMocks());

  // ---------------------------------------------------------------------------
  describe('initial state', () => {
    it('returns street ref defaulting to "Aguardando..."', () => {
      expect(result.street.value).toBe('Aguardando...');
    });

    it('returns neighborhood ref defaulting to "—"', () => {
      expect(result.neighborhood.value).toBe('—');
    });

    it('returns city ref defaulting to "—"', () => {
      expect(result.city.value).toBe('—');
    });

    it('returns live mode metadata by default', () => {
      expect(result.locationTitle.value).toBe('Localização Atual');
      expect(result.isManualMode.value).toBe(false);
      expect(result.manualLocationError.value).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  describe('onMounted callback', () => {
    beforeEach(() => mountedCb());

    it('subscribes to PositionManager', () => {
      expect(mockPosSubscribe).toHaveBeenCalledTimes(1);
    });

    it('subscribes to AddressCache', () => {
      expect(mockAddrSubscribe).toHaveBeenCalledTimes(1);
    });

    it('registers a map click listener through the displayer', () => {
      expect(mockMapInstance.on).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  // ---------------------------------------------------------------------------
  describe('position observer', () => {
    beforeEach(() => mountedCb());

    it('forwards coordinates to updatePosition', () => {
      capturedPosObserver.update({ latitude: -22.9068, longitude: -43.1729 });
      expect(mockMapInstance.setCenter).toHaveBeenCalledWith([-43.1729, -22.9068]);
    });

    it('skips update when coordinates are null', () => {
      capturedPosObserver.update({ latitude: null, longitude: null });
      expect(mockMapInstance.setCenter).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  describe('address observer', () => {
    beforeEach(() => mountedCb());

    it('updates street, neighborhood, city refs', () => {
      capturedAddrObserver.update({
        currentAddress: { logradouro: 'Rua das Flores', bairro: 'Centro', municipio: 'Paraty' },
      });
      expect(result.street.value).toBe('Rua das Flores');
      expect(result.neighborhood.value).toBe('Centro');
      expect(result.city.value).toBe('Paraty');
    });

    it('keeps placeholders when address fields are null', () => {
      capturedAddrObserver.update({
        currentAddress: { logradouro: null, bairro: null, municipio: null },
      });
      expect(result.street.value).toBe('Aguardando...');
      expect(result.neighborhood.value).toBe('—');
      expect(result.city.value).toBe('—');
    });

    it('does nothing when currentAddress is null', () => {
      capturedAddrObserver.update({ currentAddress: null });
      expect(result.street.value).toBe('Aguardando...');
    });

    it('falls back to distrito when bairro is unavailable', () => {
      capturedAddrObserver.update({
        currentAddress: {
          logradouro: 'Rua da Matriz',
          bairro: null,
          distrito: 'Distrito Sede',
          municipio: 'Paraty',
        },
      });

      expect(result.neighborhood.value).toBe('Distrito Sede');
    });
  });

  // ---------------------------------------------------------------------------
  describe('manual map selection', () => {
    beforeEach(() => mountedCb());

    function triggerMapClick(lat, lon) {
      const clickHandler = mockMapInstance.on.mock.calls.find(([event]) => event === 'click')?.[1];
      clickHandler({ lngLat: { lat, lng: lon } });
    }

    it('switches to manual mode and reverse geocodes the clicked point', async () => {
      fetchAddressMock.mockResolvedValue({
        street: 'Praça da Sé',
        neighborhood: 'Centro Histórico',
        city: 'São Paulo',
        state: 'São Paulo',
        stateCode: 'SP',
        country: 'Brasil',
      });

      triggerMapClick(-23.55052, -46.63331);
      await Promise.resolve();

      expect(result.isManualMode.value).toBe(true);
      expect(result.locationTitle.value).toBe('Localização Selecionada');
      expect(setCoordinatesMock).toHaveBeenCalledWith(-23.55052, -46.63331);
      expect(fetchAddressMock).toHaveBeenCalledTimes(1);
      expect(mockMapInstance.setCenter).toHaveBeenCalledWith([-46.63331, -23.55052]);
      expect(result.street.value).toBe('Praça da Sé');
      expect(result.neighborhood.value).toBe('Centro Histórico');
      expect(result.city.value).toBe('São Paulo');
    });

    it('keeps the latest live position in memory and restores it when returning to GPS', async () => {
      capturedPosObserver.update({ latitude: -22.9068, longitude: -43.1729 });
      fetchAddressMock.mockResolvedValue({
        street: 'Av. Atlântica',
        neighborhood: 'Copacabana',
        city: 'Rio de Janeiro',
        state: 'Rio de Janeiro',
        stateCode: 'RJ',
        country: 'Brasil',
      });

      triggerMapClick(-22.97196, -43.18254);
      await Promise.resolve();

      mockMapInstance.setCenter.mockClear();
      capturedPosObserver.update({ latitude: -22.9035, longitude: -43.2096 });

      expect(mockMapInstance.setCenter).not.toHaveBeenCalled();

      result.returnToLivePosition();

      expect(result.isManualMode.value).toBe(false);
      expect(mockMapInstance.setCenter).toHaveBeenCalledWith([-43.2096, -22.9035]);
    });

    it('keeps the selected coordinates and exposes an error when reverse geocoding fails', async () => {
      fetchAddressMock.mockRejectedValue(new Error('network error'));

      triggerMapClick(-12.9714, -38.5014);
      await Promise.resolve();

      expect(result.isManualMode.value).toBe(true);
      expect(result.street.value).toBe('Lat -12.97140, Lon -38.50140');
      expect(result.manualLocationError.value).toBe(
        'Não foi possível buscar o endereço desta localização.'
      );
    });
  });

  // ---------------------------------------------------------------------------
  describe('onUnmounted callback', () => {
    beforeEach(() => { mountedCb(); unmountedCb(); });

    it('unsubscribes from PositionManager', () => {
      expect(mockPosUnsubscribe).toHaveBeenCalledTimes(1);
    });

    it('unsubscribes from AddressCache', () => {
      expect(mockAddrUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
