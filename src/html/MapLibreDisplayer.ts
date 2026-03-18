/**
 * MapLibreDisplayer
 * Manages an inline MapLibre GL JS map that shows the current GPS position.
 *
 * Usage:
 *   const displayer = new MapLibreDisplayer('maplibre-map', 'map-toggle-btn');
 *   displayer.bindToggleButton();
 *   // On each new position:
 *   displayer.updatePosition(lat, lon);
 */

import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';

/** Free MapLibre demo tile style — no API key required. */
const TILE_STYLE = 'https://demotiles.maplibre.org/style.json';

/** Default zoom level when centering on the user's position. */
const DEFAULT_ZOOM = 3;

export class MapLibreDisplayer {
  private _mapContainerId: string;
  private _toggleButtonId: string;
  private _map: maplibregl.Map | null;
  private _marker: maplibregl.Marker | null;
  private _pendingLat: number | null;
  private _pendingLon: number | null;

  /**
   * @param {string} mapContainerId - ID of the div that will host the map canvas.
   * @param {string} toggleButtonId  - ID of the button that shows/hides the map.
   */
  constructor(mapContainerId: string, toggleButtonId: string) {
    this._mapContainerId = mapContainerId;
    this._toggleButtonId = toggleButtonId;
    this._map = null;
    this._marker = null;
    this._pendingLat = null;
    this._pendingLon = null;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Bind the toggle button click to show/hide the map container.
   * Call once after the DOM is ready.
   */
  bindToggleButton(): void {
    const btn = document.getElementById(this._toggleButtonId);
    if (!btn) return;
    btn.addEventListener('click', () => this._toggle());
  }

  /**
   * Update the map center and marker with a new GPS position.
   * If the map has not been initialised yet, the position is stored and
   * applied when the user opens the map for the first time.
   *
   * @param {number} lat - Latitude in decimal degrees.
   * @param {number} lon - Longitude in decimal degrees.
   */
  updatePosition(lat: number, lon: number): void {
    this._pendingLat = lat;
    this._pendingLon = lon;

    if (!this._map) return; // will be applied on first open

    this._map.setCenter([lon, lat]);

    if (this._marker) {
      this._marker.setLngLat([lon, lat]);
    } else {
      this._createMarker(lat, lon);
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private _toggle(): void {
    const container = document.getElementById(this._mapContainerId);
    const btn = document.getElementById(this._toggleButtonId);
    if (!container) return;

    const isHidden = container.hidden;
    container.hidden = !isHidden;

    if (btn) {
      btn.setAttribute('aria-expanded', String(isHidden));
      const label = isHidden ? 'Esconder mapa' : 'Ver no Mapa';
      const textSpan = btn.querySelector('.button-text');
      if (textSpan) textSpan.textContent = label;
    }

    if (isHidden) {
      // Opening — initialise map lazily on first open
      if (!this._map) {
        this._initMap();
      } else {
        // Re-trigger resize in case the container was hidden during init
        this._map.resize();
      }
    }
  }

  private _initMap(): void {
    const lat = this._pendingLat ?? -15.793889; // Brasília as fallback
    const lon = this._pendingLon ?? -47.882778;

    this._map = new maplibregl.Map({
      container: this._mapContainerId,
      style: TILE_STYLE,
      center: [lon, lat],
      zoom: DEFAULT_ZOOM,
    });

    this._map.addControl(new maplibregl.NavigationControl(), 'top-right');

    this._map.on('load', () => {
      this._createMarker(lat, lon);
    });
  }

  private _createMarker(lat: number, lon: number): void {
    this._marker = new maplibregl.Marker({ color: '#2563eb' })
      .setLngLat([lon, lat])
      .addTo(this._map!);
  }
}

export default MapLibreDisplayer;
