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

    result = useMapDisplayer();
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
