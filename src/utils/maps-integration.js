/**
 * Maps Integration Utility
 * Provides discoverable map viewing options for current coordinates
 * 
 * @module utils/maps-integration
 * @since 0.11.0-alpha
 */

/**
 * MapsIntegration
 * Handles generation of map URLs and deep linking for various mapping services
 */
class MapsIntegration {
  constructor() {
    if (MapsIntegration.instance) {
      return MapsIntegration.instance;
    }

    this.currentCoordinates = null;
    this.mapsActionsContainer = null;

    MapsIntegration.instance = this;
  }

  /**
   * Initialize the maps integration
   * Sets up action buttons and coordinates listeners
   */
  init() {
    this._setupMapsActionsContainer();
    this._setupCoordinatesObserver();
  }

  /**
   * Setup the maps actions container after coordinates
   * @private
   */
  _setupMapsActionsContainer() {
    const coordinatesSection = document.getElementById('coordinates');
    if (!coordinatesSection) {
      console.warn('⚠️ Coordinates section not found');
      return;
    }

    // Create maps actions container
    const container = document.createElement('div');
    container.id = 'maps-actions';
    container.className = 'maps-actions';
    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', 'Ações de mapas');
    container.style.display = 'none'; // Hidden until coordinates available

    container.innerHTML = this._generateMapsActionsHtml(null);

    // Insert after coordinates section
    coordinatesSection.parentNode.insertBefore(container, coordinatesSection.nextSibling);

    this.mapsActionsContainer = container;
  }

  /**
   * Setup mutation observer to watch for coordinate updates
   * @private
   */
  _setupCoordinatesObserver() {
    const latLongDisplay = document.getElementById('lat-long-display');
    if (!latLongDisplay) {
      console.warn('⚠️ Coordinate display not found');
      return;
    }

    // Watch for text content changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          this._handleCoordinatesUpdate();
        }
      });
    });

    observer.observe(latLongDisplay, {
      childList: true,
      characterData: true,
      subtree: true
    });

    // Initial check
    this._handleCoordinatesUpdate();
  }

  /**
   * Handle coordinate updates from display
   * @private
   */
  _handleCoordinatesUpdate() {
    const latLongDisplay = document.getElementById('lat-long-display');
    if (!latLongDisplay) return;

    const text = latLongDisplay.textContent.trim();

    // Parse coordinates from "lat, lng" format
    if (text && text !== 'Aguardando localização...' && text !== 'N/A, N/A') {
      const parts = text.split(',').map(part => part.trim());
      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);

        if (!isNaN(lat) && !isNaN(lng)) {
          this.updateCoordinates(lat, lng);
        }
      }
    } else {
      // Hide actions if no valid coordinates
      if (this.mapsActionsContainer) {
        this.mapsActionsContainer.style.display = 'none';
      }
    }
  }

  /**
   * Update current coordinates and refresh action buttons
   * @param {number} latitude - Latitude value
   * @param {number} longitude - Longitude value
   */
  updateCoordinates(latitude, longitude) {
    this.currentCoordinates = { latitude, longitude };

    if (this.mapsActionsContainer) {
      this.mapsActionsContainer.innerHTML = this._generateMapsActionsHtml(this.currentCoordinates);
      this.mapsActionsContainer.style.display = 'flex';

      // Setup event listeners for action buttons
      this._setupActionListeners();
    }
  }

  /**
   * Generate maps actions HTML
   * @param {Object} coords - Coordinates object with latitude and longitude
   * @returns {string} HTML string for actions
   * @private
   */
  _generateMapsActionsHtml(coords) {
    if (!coords) {
      return `<p class="maps-actions-placeholder">Aguardando coordenadas...</p>`;
    }

    const { latitude: _lat, longitude: _lng } = coords; // coords passed to event handlers

    return `
      <button 
        class="maps-action-btn maps-action-primary" 
        data-action="google-maps"
        aria-label="Abrir localização atual no Google Maps"
      >
        <span class="btn-icon" aria-hidden="true">🗺️</span>
        <span class="btn-text">Google Maps</span>
      </button>

      <button 
        class="maps-action-btn maps-action-secondary" 
        data-action="street-view"
        aria-label="Abrir visualização de rua no Google Street View"
      >
        <span class="btn-icon" aria-hidden="true">👁️</span>
        <span class="btn-text">Street View</span>
      </button>

      <button 
        class="maps-action-btn maps-action-secondary" 
        data-action="openstreetmap"
        aria-label="Abrir localização no OpenStreetMap"
      >
        <span class="btn-icon" aria-hidden="true">🌍</span>
        <span class="btn-text">OpenStreetMap</span>
      </button>

      <button 
        class="maps-action-btn maps-action-secondary" 
        data-action="waze"
        aria-label="Abrir localização no Waze"
      >
        <span class="btn-icon" aria-hidden="true">🚗</span>
        <span class="btn-text">Waze</span>
      </button>
    `;
  }

  /**
   * Setup event listeners for action buttons
   * @private
   */
  _setupActionListeners() {
    const buttons = this.mapsActionsContainer.querySelectorAll('[data-action]');

    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this._handleAction(action);
      });
    });
  }

  /**
   * Handle action button clicks
   * @param {string} action - Action type (google-maps, street-view, etc.)
   * @private
   */
  _handleAction(action) {
    if (!this.currentCoordinates) {
      console.warn('⚠️ No coordinates available');
      return;
    }

    const { latitude, longitude } = this.currentCoordinates;

    let url;
    switch (action) {
      case 'google-maps':
        url = this._getGoogleMapsUrl(latitude, longitude);
        break;
      case 'street-view':
        url = this._getStreetViewUrl(latitude, longitude);
        break;
      case 'openstreetmap':
        url = this._getOpenStreetMapUrl(latitude, longitude);
        break;
      case 'waze':
        url = this._getWazeUrl(latitude, longitude);
        break;
      default:
        console.warn(`Unknown action: ${action}`);
        return;
    }

    if (url) {
      this._openUrl(url, action);
    }
  }

  /**
   * Get Google Maps URL with deep linking support
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {string} Google Maps URL
   * @private
   */
  _getGoogleMapsUrl(lat, lng) {
    // Try native app first (iOS/Android), fallback to web
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Deep link for native apps
      return `geo:${lat},${lng}?q=${lat},${lng}`;
    } else {
      // Web URL for desktop
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
  }

  /**
   * Get Google Street View URL
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {string} Street View URL
   * @private
   */
  _getStreetViewUrl(lat, lng) {
    return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
  }

  /**
   * Get OpenStreetMap URL
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {string} OpenStreetMap URL
   * @private
   */
  _getOpenStreetMapUrl(lat, lng) {
    // Zoom level 16 for street-level detail
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
  }

  /**
   * Get Waze URL with deep linking support
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {string} Waze URL
   * @private
   */
  _getWazeUrl(lat, lng) {
    // Waze deep link works on mobile, opens web editor on desktop
    return `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  }

  /**
   * Open URL in new tab with appropriate handling
   * @param {string} url - URL to open
   * @param {string} action - Action type for analytics/logging
   * @private
   */
  _openUrl(url, action) {
    console.log(`🗺️ Opening ${action}: ${url}`);

    // Open in new tab/window
    const opened = window.open(url, '_blank', 'noopener,noreferrer');

    if (!opened || opened.closed || typeof opened.closed === 'undefined') {
      // Popup blocked - show fallback
      this._showPopupBlockedMessage(url, action);
    } else {
      // Show toast notification
      this._showSuccessToast(action);
    }
  }

  /**
   * Show popup blocked message
   * @param {string} url - The URL that was blocked
   * @param {string} action - Action type
   * @private
   */
  _showPopupBlockedMessage(url, action) {
    const actionNames = {
      'google-maps': 'Google Maps',
      'street-view': 'Street View',
      'openstreetmap': 'OpenStreetMap',
      'waze': 'Waze'
    };

    const message = `
      Popup bloqueado pelo navegador.
      <br><br>
      <a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #fff; text-decoration: underline;">
        Clique aqui para abrir ${actionNames[action]}
      </a>
    `;

    // Use existing toast system if available
    if (window.showToast) {
      window.showToast(message, 'info', 8000);
    } else {
      // Fallback to alert
      alert(`Por favor, permita popups e clique no botão novamente.`);
      console.log(`Blocked URL: ${url}`);
    }
  }

  /**
   * Show success toast notification
   * @param {string} action - Action type
   * @private
   */
  _showSuccessToast(action) {
    const actionNames = {
      'google-maps': 'Google Maps',
      'street-view': 'Street View',
      'openstreetmap': 'OpenStreetMap',
      'waze': 'Waze'
    };

    const message = `Abrindo ${actionNames[action]}...`;

    // Use existing toast system if available
    if (window.showToast) {
      window.showToast(message, 'success', 3000);
    }
  }
}

// Export singleton instance
export default new MapsIntegration();
