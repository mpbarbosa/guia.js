// src/html/__tests__/MapLibreDisplayer.test.js

import MapLibreDisplayer from '../MapLibreDisplayer';

const TILE_STYLE = 'https://demotiles.maplibre.org/style.json';
const DEFAULT_ZOOM = 3;

jest.mock('maplibre-gl', () => {
  const mockMapInstance = {
    setCenter: jest.fn(),
    resize: jest.fn(),
    addControl: jest.fn(),
    on: jest.fn((event, cb) => {
      if (event === 'load') cb();
    }),
  };
  const mockMarkerInstance = {
    setLngLat: jest.fn(),
    addTo: jest.fn(),
  };
  return {
    Map: jest.fn(() => mockMapInstance),
    NavigationControl: jest.fn(),
    Marker: jest.fn(() => mockMarkerInstance),
  };
});

describe('MapLibreDisplayer', () => {
  let displayer;
  let mapContainer;
  let toggleButton;
  let buttonTextSpan;

  beforeEach(() => {
    // Set up DOM elements
    document.body.innerHTML = `
      <div id="maplibre-map"></div>
      <button id="map-toggle-btn"><span class="button-text">Ver no Mapa</span></button>
    `;
    mapContainer = document.getElementById('maplibre-map');
    toggleButton = document.getElementById('map-toggle-btn');
    buttonTextSpan = toggleButton.querySelector('.button-text');
    mapContainer.hidden = true;
    displayer = new MapLibreDisplayer('maplibre-map', 'map-toggle-btn');
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('initializes with correct properties', () => {
      expect(displayer._mapContainerId).toBe('maplibre-map');
      expect(displayer._toggleButtonId).toBe('map-toggle-btn');
      expect(displayer._map).toBeNull();
      expect(displayer._marker).toBeNull();
      expect(displayer._pendingLat).toBeNull();
      expect(displayer._pendingLon).toBeNull();
    });
  });

  describe('bindToggleButton', () => {
    it('binds click event to toggle button if present', () => {
      const spy = jest.spyOn(toggleButton, 'addEventListener');
      displayer.bindToggleButton();
      expect(spy).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('does nothing if toggle button is missing', () => {
      document.body.removeChild(toggleButton);
      expect(() => displayer.bindToggleButton()).not.toThrow();
    });
  });

  describe('updatePosition', () => {
    it('stores pending lat/lon if map not initialized', () => {
      displayer.updatePosition(-10, -20);
      expect(displayer._pendingLat).toBe(-10);
      expect(displayer._pendingLon).toBe(-20);
      expect(displayer._map).toBeNull();
    });

    it('sets map center and creates marker on initialized map', () => {
      displayer._map = require('maplibre-gl').Map();
      displayer._marker = null;
      displayer.updatePosition(1, 2);
      expect(displayer._map.setCenter).toHaveBeenCalledWith([2, 1]);
      expect(require('maplibre-gl').Marker).toHaveBeenCalledWith({ color: '#2563eb' });
    });

    it('updates marker position if marker exists', () => {
      displayer._map = require('maplibre-gl').Map();
      displayer._marker = require('maplibre-gl').Marker();
      displayer.updatePosition(3, 4);
      expect(displayer._marker.setLngLat).toHaveBeenCalledWith([4, 3]);
    });
  });

  describe('_toggle', () => {
    it('shows map container and initializes map on first open', () => {
      expect(mapContainer.hidden).toBe(true);
      displayer._toggle();
      expect(mapContainer.hidden).toBe(false);
      expect(toggleButton.getAttribute('aria-expanded')).toBe('true');
      expect(buttonTextSpan.textContent).toBe('Esconder mapa');
      expect(require('maplibre-gl').Map).toHaveBeenCalledWith({
        container: 'maplibre-map',
        style: TILE_STYLE,
        center: [-47.882778, -15.793889],
        zoom: DEFAULT_ZOOM,
      });
    });

    it('applies pending lat/lon on first open', () => {
      displayer._pendingLat = 5;
      displayer._pendingLon = 6;
      displayer._toggle();
      expect(require('maplibre-gl').Map).toHaveBeenCalledWith({
        container: 'maplibre-map',
        style: TILE_STYLE,
        center: [6, 5],
        zoom: DEFAULT_ZOOM,
      });
    });

    it('resizes map if already initialized', () => {
      displayer._map = require('maplibre-gl').Map();
      mapContainer.hidden = true;
      displayer._toggle(); // open
      displayer._toggle(); // close
      displayer._toggle(); // open again
      expect(displayer._map.resize).toHaveBeenCalled();
    });

    it('hides map container and updates button label on close', () => {
      mapContainer.hidden = false;
      displayer._map = require('maplibre-gl').Map();
      displayer._toggle();
      expect(mapContainer.hidden).toBe(true);
      expect(toggleButton.getAttribute('aria-expanded')).toBe('false');
      expect(buttonTextSpan.textContent).toBe('Ver no Mapa');
    });

    it('does nothing if map container is missing', () => {
      document.body.removeChild(mapContainer);
      expect(() => displayer._toggle()).not.toThrow();
    });

    it('does not fail if button is missing', () => {
      document.body.removeChild(toggleButton);
      expect(() => displayer._toggle()).not.toThrow();
    });

    it('does not fail if button text span is missing', () => {
      buttonTextSpan.remove();
      expect(() => displayer._toggle()).not.toThrow();
    });
  });

  describe('_initMap', () => {
    it('initializes map with pending lat/lon if set', () => {
      displayer._pendingLat = 7;
      displayer._pendingLon = 8;
      displayer._initMap();
      expect(require('maplibre-gl').Map).toHaveBeenCalledWith({
        container: 'maplibre-map',
        style: TILE_STYLE,
        center: [8, 7],
        zoom: DEFAULT_ZOOM,
      });
      expect(require('maplibre-gl').NavigationControl).toHaveBeenCalled();
      expect(require('maplibre-gl').Map().addControl).toHaveBeenCalled();
      expect(require('maplibre-gl').Map().on).toHaveBeenCalledWith('load', expect.any(Function));
    });

    it('initializes map with default Brasília coordinates if no pending lat/lon', () => {
      displayer._initMap();
      expect(require('maplibre-gl').Map).toHaveBeenCalledWith({
        container: 'maplibre-map',
        style: TILE_STYLE,
        center: [-47.882778, -15.793889],
        zoom: DEFAULT_ZOOM,
      });
    });
  });

  describe('_createMarker', () => {
    it('creates marker and adds to map', () => {
      displayer._map = require('maplibre-gl').Map();
      displayer._createMarker(9, 10);
      expect(require('maplibre-gl').Marker).toHaveBeenCalledWith({ color: '#2563eb' });
      expect(require('maplibre-gl').Marker().setLngLat).toHaveBeenCalledWith([10, 9]);
      expect(require('maplibre-gl').Marker().addTo).toHaveBeenCalledWith(displayer._map);
    });
  });

  describe('integration: toggle and updatePosition', () => {
    it('applies pending position when map is opened', () => {
      displayer.updatePosition(11, 12);
      displayer._toggle();
      expect(require('maplibre-gl').Map).toHaveBeenCalledWith({
        container: 'maplibre-map',
        style: TILE_STYLE,
        center: [12, 11],
        zoom: DEFAULT_ZOOM,
      });
      expect(require('maplibre-gl').Marker().setLngLat).toHaveBeenCalledWith([12, 11]);
    });

    it('updates marker after map is initialized', () => {
      displayer._toggle(); // open map
      displayer.updatePosition(13, 14);
      expect(require('maplibre-gl').Map().setCenter).toHaveBeenCalledWith([14, 13]);
      expect(require('maplibre-gl').Marker().setLngLat).toHaveBeenCalledWith([14, 13]);
    });
  });
});
