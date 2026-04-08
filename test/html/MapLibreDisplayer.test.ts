import { jest } from '@jest/globals';

// Mock maplibre-gl and its classes
const setCenter = jest.fn();
const addTo = jest.fn();
const setLngLat = jest.fn().mockReturnValue({ addTo });
const resize = jest.fn();
const addControl = jest.fn();
const on = jest.fn((event: string, cb: () => void) => {
  if (event === 'load') cb();
});

const MarkerMock = jest.fn().mockImplementation(() => ({
  setLngLat,
  addTo,
}));

const NavigationControlMock = jest.fn();

const MapMock = jest.fn().mockImplementation(() => ({
  setCenter,
  resize,
  addControl,
  on,
}));

let MapLibreDisplayer: typeof import('../../src/html/MapLibreDisplayer').MapLibreDisplayer;

beforeAll(async () => {
  await jest.unstable_mockModule('maplibre-gl', () => ({
    __esModule: true,
    default: {
      Map: MapMock,
      Marker: MarkerMock,
      NavigationControl: NavigationControlMock,
    },
    Map: MapMock,
    Marker: MarkerMock,
    NavigationControl: NavigationControlMock,
  }));
  const mod = await import('../../src/html/MapLibreDisplayer');
  MapLibreDisplayer = mod.MapLibreDisplayer;
});

describe('MapLibreDisplayer', () => {
  let mapContainer: HTMLElement;
  let toggleBtn: HTMLElement;
  let displayer: MapLibreDisplayer;

  beforeEach(() => {
    document.body.innerHTML = '';
    mapContainer = document.createElement('div');
    mapContainer.id = 'maplibre-map';
    document.body.appendChild(mapContainer);

    toggleBtn = document.createElement('button');
    toggleBtn.id = 'map-toggle-btn';
    const textSpan = document.createElement('span');
    textSpan.className = 'button-text';
    toggleBtn.appendChild(textSpan);
    document.body.appendChild(toggleBtn);

    setCenter.mockClear();
    setLngLat.mockClear();
    addTo.mockClear();
    resize.mockClear();
    addControl.mockClear();
    on.mockClear();
    MarkerMock.mockClear();
    MapMock.mockClear();
    NavigationControlMock.mockClear();

    displayer = new MapLibreDisplayer('maplibre-map', 'map-toggle-btn');
  });

  describe('bindToggleButton', () => {
    it('binds click event to toggle button', () => {
      const spy = jest.spyOn(toggleBtn, 'addEventListener');
      displayer.bindToggleButton();
      expect(spy).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('does nothing if toggle button is missing', () => {
      document.body.removeChild(toggleBtn);
      expect(() => displayer.bindToggleButton()).not.toThrow();
    });
  });

  describe('updatePosition', () => {
    it('stores pending position if map not initialized', () => {
      displayer.updatePosition(10, 20);
      // _map is null, so setCenter/setLngLat not called
      expect(setCenter).not.toHaveBeenCalled();
      expect(setLngLat).not.toHaveBeenCalled();
    });

    it('sets center and creates marker if map is initialized and marker does not exist', () => {
      // Simulate map is initialized, marker is null
      // Force _map to be a MapMock instance
      // @ts-ignore
      displayer._map = new MapMock();
      // @ts-ignore
      displayer._marker = null;
      displayer.updatePosition(1, 2);
      expect(setCenter).toHaveBeenCalledWith([2, 1]);
      expect(MarkerMock).toHaveBeenCalledWith({ color: '#2563eb' });
      expect(setLngLat).toHaveBeenCalledWith([2, 1]);
      expect(addTo).toHaveBeenCalled();
    });

    it('sets center and updates marker if marker exists', () => {
      // @ts-ignore
      displayer._map = new MapMock();
      // @ts-ignore
      displayer._marker = { setLngLat };
      displayer.updatePosition(3, 4);
      expect(setCenter).toHaveBeenCalledWith([4, 3]);
      expect(setLngLat).toHaveBeenCalledWith([4, 3]);
      expect(MarkerMock).not.toHaveBeenCalled();
    });
  });

  describe('_toggle', () => {
    function getButtonText() {
      return toggleBtn.querySelector('.button-text')?.textContent;
    }

    it('shows map container and initializes map on first open', () => {
      mapContainer.hidden = true;
      displayer.bindToggleButton();
      // Simulate click
      toggleBtn.dispatchEvent(new Event('click'));
      expect(mapContainer.hidden).toBe(false);
      expect(MapMock).toHaveBeenCalledWith(
        expect.objectContaining({
          container: 'maplibre-map',
          style: expect.any(String),
          center: expect.any(Array),
          zoom: expect.any(Number),
        })
      );
      expect(addControl).toHaveBeenCalledWith(expect.any(NavigationControlMock), 'top-right');
      expect(on).toHaveBeenCalledWith('load', expect.any(Function));
      expect(MarkerMock).toHaveBeenCalled();
      expect(getButtonText()).toBe('Esconder mapa');
      expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');
    });

    it('hides map container and updates button label', () => {
      mapContainer.hidden = false;
      displayer.bindToggleButton();
      // Simulate click
      toggleBtn.dispatchEvent(new Event('click'));
      expect(mapContainer.hidden).toBe(true);
      expect(getButtonText()).toBe('Ver no Mapa');
      expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    });

    it('resizes map if already initialized on open', () => {
      // Open once to initialize
      mapContainer.hidden = true;
      displayer.bindToggleButton();
      toggleBtn.dispatchEvent(new Event('click'));
      // Hide again
      toggleBtn.dispatchEvent(new Event('click'));
      // Open again (should call resize)
      toggleBtn.dispatchEvent(new Event('click'));
      expect(resize).toHaveBeenCalled();
    });

    it('does nothing if map container is missing', () => {
      document.body.removeChild(mapContainer);
      displayer.bindToggleButton();
      expect(() => toggleBtn.dispatchEvent(new Event('click'))).not.toThrow();
    });

    it('does not throw if toggle button is missing', () => {
      document.body.removeChild(toggleBtn);
      // @ts-ignore
      expect(() => displayer._toggle()).not.toThrow();
    });

    it('uses pending position if set before opening', () => {
      displayer.updatePosition(11, 22);
      mapContainer.hidden = true;
      displayer.bindToggleButton();
      toggleBtn.dispatchEvent(new Event('click'));
      expect(MapMock).toHaveBeenCalledWith(
        expect.objectContaining({
          center: [22, 11],
        })
      );
    });

    it('uses fallback position if no pending position', () => {
      mapContainer.hidden = true;
      displayer.bindToggleButton();
      toggleBtn.dispatchEvent(new Event('click'));
      expect(MapMock).toHaveBeenCalledWith(
        expect.objectContaining({
          center: [-47.882778, -15.793889],
        })
      );
    });
  });

  describe('_initMap', () => {
    it('initializes map with pending position', () => {
      // @ts-ignore
      displayer._pendingLat = 5;
      // @ts-ignore
      displayer._pendingLon = 6;
      // @ts-ignore
      displayer._initMap();
      expect(MapMock).toHaveBeenCalledWith(
        expect.objectContaining({
          center: [6, 5],
        })
      );
      expect(addControl).toHaveBeenCalled();
      expect(on).toHaveBeenCalledWith('load', expect.any(Function));
      expect(MarkerMock).toHaveBeenCalled();
    });

    it('initializes map with fallback position if no pending', () => {
      // @ts-ignore
      displayer._pendingLat = null;
      // @ts-ignore
      displayer._pendingLon = null;
      // @ts-ignore
      displayer._initMap();
      expect(MapMock).toHaveBeenCalledWith(
        expect.objectContaining({
          center: [-47.882778, -15.793889],
        })
      );
    });
  });

  describe('_createMarker', () => {
    it('creates marker at given position and adds to map', () => {
      // @ts-ignore
      displayer._map = new MapMock();
      // @ts-ignore
      displayer._createMarker(7, 8);
      expect(MarkerMock).toHaveBeenCalledWith({ color: '#2563eb' });
      expect(setLngLat).toHaveBeenCalledWith([8, 7]);
      expect(addTo).toHaveBeenCalledWith(displayer._map);
    });
  });
});
