/**
 * @fileoverview Home View - Main landing page for Guia Turístico
 * @version 0.7.1-alpha
 * 
 * Displays user's current location with toggle between single-position and continuous tracking
 * 
 * This view is loaded by the SPA router and uses the WebGeocodingManager from guia_js library
 * to obtain and display location information.
 * 
 * Features:
 * - Single location capture (one-time)
 * - Continuous location tracking (loop mode)
 * - Toggle between modes with checkbox
 * 
 * @module views/home
 * @requires https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.6.0-alpha/src/guia.js
 */

import { WebGeocodingManager, PositionManager, AddressCache } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.6.0-alpha/src/guia.js';
import HTMLSidraDisplayer from '../html/HTMLSidraDisplayer.js';
import { ADDRESS_FETCHED_EVENT } from '../config/defaults.js';

/**
 * Home view configuration object
 * @type {Object}
 * @property {string} title - Page title for document.title
 * @property {Array<string>} styles - CSS files to load for this view
 * @property {Function} render - Returns HTML string for view content
 * @property {Function} mount - Called after view is mounted to DOM
 * @property {Function} cleanup - Called before view is unmounted
 */
export default {
  title: 'Guia Turístico - Localização',
  
  styles: [],
  
  /**
   * Render home view HTML
   * @returns {string} HTML string for home view
   */
  render() {
    return `
      <header>
        <h1>Guia Turístico</h1>
        <p>Descubra sua localização e encontre restaurantes e estatísticas da cidade próximos.</p>
        <p>
          <span id="tracking-timer-container" style="display: none;">
            Tempo decorrido: <span id="chronometer" aria-live="polite">00:00</span> | 
            Fila fala: <span id="tam-fila-fala" aria-live="polite">0</span> | 
          </span>
          <abbr title="Dados salvos localmente para acesso rápido" aria-label="Cache: dados salvos localmente">Cache</abbr>: 
          <span id="tam-cache" aria-live="polite">0</span> itens
        </p>
      </header>

      <!-- Tracking Mode Toggle -->
      <section class="tracking-mode-section" aria-label="Modo de rastreamento">
        <div class="tracking-mode-toggle">
          <input 
            type="checkbox" 
            id="continuous-tracking-toggle" 
            aria-describedby="tracking-mode-description"
            role="switch"
            aria-checked="false"
          />
          <label for="continuous-tracking-toggle">
            <strong>Rastreamento Contínuo</strong>
            <span id="tracking-mode-description" class="toggle-description">
              Ative para atualizar sua localização automaticamente enquanto você se move
            </span>
          </label>
        </div>
        
        <!-- Get Location Button (visible only in single-position mode) -->
        <div id="get-location-button-container" style="margin-top: 16px;">
          <button 
            id="getLocationBtn" 
            class="md3-button-filled"
            aria-label="Obter localização atual"
          >
            📍 Obter Localização Atual
          </button>
        </div>
      </section>

      <nav aria-label="Ações da página">
        <div class="button-container">
          <button 
            id="findRestaurantsBtn" 
            disabled 
            aria-disabled="true"
            aria-describedby="restaurants-status"
            aria-label="Encontrar restaurantes próximos"
            class="md3-button-filled"
          >
            <span class="button-text">Encontrar Restaurantes Próximos</span>
            <span class="button-loading" aria-hidden="true" hidden>⏳</span>
          </button>
          <span id="restaurants-status" class="button-status" role="status" aria-live="polite">
            Aguardando localização...
          </span>
        </div>
        
        <div class="button-container">
          <button 
            id="cityStatsBtn" 
            disabled 
            aria-disabled="true"
            aria-describedby="stats-status"
            aria-label="Obter estatísticas da cidade"
            class="md3-button-filled"
          >
            <span class="button-text">Obter Estatísticas da Cidade</span>
            <span class="button-loading" aria-hidden="true" hidden>⏳</span>
          </button>
          <span id="stats-status" class="button-status" role="status" aria-live="polite">
            Aguardando localização...
          </span>
        </div>
      </nav>
      
      <!-- Geolocation status banner container -->
      <div id="geolocation-banner-container"></div>

      <!-- Location Highlight Cards -->
      <section class="location-highlights" aria-label="Destaques de localização">
        <div class="highlight-card" role="region" aria-labelledby="municipio-label">
          <div id="municipio-label" class="highlight-card-label">Município</div>
          <div id="municipio-value" class="highlight-card-value" aria-live="polite">—</div>
        </div>
        <div id="location-type-card" class="highlight-card" role="region" aria-labelledby="location-type-label">
          <div id="location-type-label" class="highlight-card-label">Bairro</div>
          <div id="location-type-value" class="highlight-card-value" aria-live="polite">—</div>
        </div>
      </section>

      <section id="coordinates" aria-labelledby="coordinates-heading">
        <h2 id="coordinates-heading" class="sr-only">Coordenadas</h2>
        <p><strong>Coordenadas:</strong> <span id="lat-long-display" aria-live="polite">Aguardando localização...</span></p>
      </section>

      <section id="reference-place" aria-labelledby="reference-place-heading">
        <h2 id="reference-place-heading" class="sr-only">Local de Referência</h2>
        <p><strong>Local de referência:</strong> <span id="reference-place-display" aria-live="polite">Aguardando localização...</span></p>
      </section>

      <section id="standardized-address" aria-labelledby="address-heading">
        <h2 id="address-heading" class="sr-only">Endereço Padronizado</h2>
        <p><strong>Endereço padronizado:</strong> <span id="endereco-padronizado-display" aria-live="polite">Aguardando localização...</span></p>
      </section>

      <section class="section" id="dadosSidra" aria-labelledby="location-info-heading">
        <h2 id="location-info-heading">Informações da Localização</h2>
      </section>
      
      <section id="locationResult" aria-live="polite" aria-label="Resultado da localização">
        <p>As informações da sua localização aparecerão aqui.</p>
      </section>
    `;
  },
  
  async mount(container) {
    console.log("(home-view) Mounting home view...");
    
    // Initialize state
    this.continuousMode = false;
    this.firstUpdate = true;
    
    // Initialize geolocation manager
    this.manager = await this._initializeGeocodingManager();
    
    // Initialize SIDRA displayer
    this._initializeSidraDisplayer();
    
    // Setup handlers
    this._setupLocationUpdateHandlers();
    this._setupCacheDisplayHandlers();
    this._setupButtonHandlers();
    this._setupGetLocationButton();
    this._setupTrackingModeToggle();
  },
  
  cleanup() {
    console.log("(home-view) Cleaning up home view...");
    
    // Stop any ongoing geolocation watchers
    if (this.manager && this.manager.watchId) {
      navigator.geolocation.clearWatch(this.manager.watchId);
    }
    
    // Stop speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Clear intervals
    if (this.cacheInterval) {
      clearInterval(this.cacheInterval);
    }
    if (this.speechQueueInterval) {
      clearInterval(this.speechQueueInterval);
    }
    
    // Clear state
    this.manager = null;
    this.continuousMode = false;
    this.firstUpdate = true;
  },
  
  // Helper methods (impure functions)
  async _initializeGeocodingManager() {
    const locationResult = document.getElementById("locationResult");
    const enderecoPadronizadoDisplay = document.getElementById("endereco-padronizado-display");
    const referencePlaceDisplay = document.getElementById("reference-place-display");
    
    console.log("(home-view) Creating WebGeocodingManager...");
    
    const params = {
      locationResult: locationResult,
      enderecoPadronizadoDisplay: enderecoPadronizadoDisplay,
      referencePlaceDisplay: referencePlaceDisplay,
      elementIds: {
        chronometer: "chronometer",
        findRestaurantsBtn: "findRestaurantsBtn",
        cityStatsBtn: "cityStatsBtn",
        timestampDisplay: "tsPosCapture",
        speechSynthesis: {
          languageSelectId: "language",
          voiceSelectId: "voice-select",
          textInputId: "text-input",
          speakBtnId: "speak-btn",
          pauseBtnId: "pause-btn",
          resumeBtnId: "resume-btn",
          stopBtnId: "stop-btn",
          rateInputId: "rate",
          rateValueId: "rate-value",
          pitchInputId: "pitch",
          pitchValueId: "pitch-value",
        }
      }
    };
    
    return await WebGeocodingManager.createAsync(document, params);
  },
  
  _initializeSidraDisplayer() {
    const dadosSidraElement = document.getElementById("dadosSidra");
    if (dadosSidraElement) {
      console.log("(home-view) Initializing HTMLSidraDisplayer...");
      this.sidraDisplayer = new HTMLSidraDisplayer(dadosSidraElement, { dataType: 'PopEst' });
    } else {
      console.warn("(home-view) dadosSidra element not found, SIDRA displayer not initialized");
    }
  },
  
  _setupLocationUpdateHandlers() {
    this.manager.subscribeFunction((currentPosition, newAddress, enderecoPadronizado) => {
      console.log(`(home-view) Location updated`);
      
      if (currentPosition) {
        // Show success banner on first location update
        if (this.firstUpdate) {
          window.showLocationSuccess?.('geolocation-banner-container', 3000);
          this.firstUpdate = false;
        }
        
        // Enable buttons
        const findRestaurantsBtn = document.getElementById("findRestaurantsBtn");
        const cityStatsBtn = document.getElementById("cityStatsBtn");
        
        if (findRestaurantsBtn) {
          findRestaurantsBtn.disabled = false;
          findRestaurantsBtn.setAttribute('aria-disabled', 'false');
          const status = document.getElementById("restaurants-status");
          if (status) status.textContent = "Pronto";
        }
        
        if (cityStatsBtn) {
          cityStatsBtn.disabled = false;
          cityStatsBtn.setAttribute('aria-disabled', 'false');
          const status = document.getElementById("stats-status");
          if (status) status.textContent = "Pronto";
        }
      }
      
      // Update display elements
      this._updateLocationDisplay(currentPosition, newAddress, enderecoPadronizado);
      
      // Update SIDRA data if in continuous mode using the dedicated displayer
      if (this.continuousMode && this.sidraDisplayer && enderecoPadronizado) {
        this.sidraDisplayer.update(newAddress, enderecoPadronizado, ADDRESS_FETCHED_EVENT, false, null);
      }
    });
  },
  
  _updateLocationDisplay(currentPosition, newAddress, enderecoPadronizado) {
    // Update coordinates
    if (currentPosition) {
      const coords = currentPosition.coords || currentPosition;
      const latLongDisplay = document.getElementById("lat-long-display");
      if (latLongDisplay) {
        const lat = coords.latitude || currentPosition.latitude;
        const lng = coords.longitude || currentPosition.longitude;
        latLongDisplay.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
    }
    
    // Update location type card (Distrito or Bairro) based on address
    if (newAddress) {
      this._updateLocationTypeCard(newAddress);
    }
    
    // Update standardized address
    if (enderecoPadronizado) {
      const enderecoCompleto = enderecoPadronizado.enderecoCompleto 
        ? enderecoPadronizado.enderecoCompleto() 
        : enderecoPadronizado;
      
      const enderecoPadronizadoDisplay = document.getElementById("endereco-padronizado-display");
      if (enderecoPadronizadoDisplay) {
        enderecoPadronizadoDisplay.textContent = enderecoCompleto;
      }
      
      // Update município highlight card
      const municipio = enderecoPadronizado.municipio || "Não disponível";
      const siglaUf = enderecoPadronizado.siglaUF;
      const municipioText = siglaUf ? `${municipio}, ${siglaUf}` : municipio;
      this._renderToElement("municipio-value", municipioText);
    }
  },
  
  /**
   * Update location type card (Distrito or Bairro) dynamically
   * @param {Object} address - Nominatim address object
   * @private
   * 
   * Note: The address parsing logic below is duplicated from address-parser.js
   * because that module uses CommonJS (for Jest testing) and cannot be directly
   * imported in browser ES6 modules without a bundler. The logic is kept in sync
   * through unit tests.
   * 
   * TODO: Consider adding a build step (e.g., webpack, rollup) to enable proper
   * module imports and eliminate code duplication between views and test modules.
   * This would reduce maintenance burden and ensure consistency across all usages.
   */
  _updateLocationTypeCard(address) {
    // Determine location type using address parser logic
    const locationType = this._determineLocationType(address);
    
    // Update card label
    const label = locationType.type === 'distrito' ? 'Distrito' : 'Bairro';
    this._renderToElement("location-type-label", label);
    
    // Update card value
    const value = this._formatLocationValue(locationType.value);
    this._renderToElement("location-type-value", value);
    
    // Update ARIA label for accessibility
    const card = document.getElementById("location-type-card");
    if (card) {
      card.setAttribute('aria-labelledby', 'location-type-label');
    }
  },
  
  /**
   * Determine location type from address (pure function logic)
   * @param {Object} address - Nominatim address object
   * @returns {{type: 'distrito'|'bairro', value: string|null}} Location type and value
   * @private
   * @pure
   */
  _determineLocationType(address) {
    const distrito = this._extractDistrito(address);
    const bairro = this._extractBairro(address);
    
    // If we have a district but no neighborhood, show district
    if (distrito && !bairro) {
      return { type: 'distrito', value: distrito };
    }
    
    // If we have a neighborhood, show it (more specific)
    if (bairro) {
      return { type: 'bairro', value: bairro };
    }
    
    // No subdivision available
    return { type: 'bairro', value: null };
  },
  
  /**
   * Extract district from address (pure function logic)
   * @param {Object} address - Nominatim address object
   * @returns {string|null} District name or null
   * @private
   * @pure
   */
  _extractDistrito(address) {
    if (!address) return null;
    
    // Check direct properties
    const distrito = address.village 
      || address.district 
      || address.hamlet
      || address.town;
    
    if (distrito) return distrito;
    
    // Check nested address object
    if (address.address) {
      return address.address.village 
        || address.address.district 
        || address.address.hamlet
        || address.address.town 
        || null;
    }
    
    return null;
  },
  
  /**
   * Extract neighborhood from address (pure function logic)
   * @param {Object} address - Nominatim address object
   * @returns {string|null} Neighborhood name or null
   * @private
   * @pure
   */
  _extractBairro(address) {
    if (!address) return null;
    
    // Check direct properties
    const bairro = address.suburb 
      || address.neighbourhood 
      || address.quarter 
      || address.residential;
    
    if (bairro) return bairro;
    
    // Check nested address object
    if (address.address) {
      return address.address.suburb 
        || address.address.neighbourhood 
        || address.address.quarter 
        || address.address.residential 
        || null;
    }
    
    return null;
  },
  
  /**
   * Format location value for display (pure function logic)
   * @param {string|null} value - Location value
   * @returns {string} Formatted value
   * @private
   * @pure
   */
  _formatLocationValue(value) {
    if (!value || value.trim() === '') {
      return 'Não disponível';
    }
    return value;
  },
  
  _setupCacheDisplayHandlers() {
    const updateCacheDisplay = () => {
      const tamCache = document.getElementById("tam-cache");
      if (tamCache && this.manager.cache) {
        tamCache.textContent = this.manager.cache.size || 0;
      }
    };
    
    // Try to subscribe to cache updates
    if (AddressCache && typeof AddressCache.subscribeFunction === 'function') {
      AddressCache.subscribeFunction(eventData => {
        const cacheSize = eventData?.cacheSize || eventData?.cache?.length || 0;
        this._renderToElement("tam-cache", cacheSize.toString());
      });
    }
    
    // Update initially and periodically as fallback
    updateCacheDisplay();
    this.cacheInterval = setInterval(updateCacheDisplay, 5000);
  },
  
  _setupButtonHandlers() {
    const findRestaurantsBtn = document.getElementById("findRestaurantsBtn");
    const cityStatsBtn = document.getElementById("cityStatsBtn");
    
    if (findRestaurantsBtn) {
      findRestaurantsBtn.addEventListener('click', () => {
        console.log("(home-view) Find restaurants clicked");
        alert("Funcionalidade de busca de restaurantes será implementada em breve!");
      });
    }
    
    if (cityStatsBtn) {
      cityStatsBtn.addEventListener('click', () => {
        console.log("(home-view) City stats clicked");
        alert("Funcionalidade de estatísticas da cidade será implementada em breve!");
      });
    }
  },
  
  _setupGetLocationButton() {
    const getLocationBtn = document.getElementById("getLocationBtn");
    if (!getLocationBtn) return;
    
    getLocationBtn.addEventListener("click", () => {
      console.log("(home-view) Get location button clicked");
      
      // Show permission request banner
      window.showPermissionRequest?.('geolocation-banner-container');
      
      // Get current position once
      if (navigator.geolocation) {
        getLocationBtn.disabled = true;
        getLocationBtn.textContent = "⏳ Obtendo localização...";
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("(home-view) Location obtained:", position);
            
            // Trigger location update through manager
            if (this.manager && this.manager.positionManager) {
              this.manager.positionManager.updatePosition(position);
            }
            
            getLocationBtn.disabled = false;
            getLocationBtn.textContent = "📍 Obter Localização Atual";
            
            window.showLocationSuccess?.('geolocation-banner-container', 3000);
          },
          (error) => {
            console.error("(home-view) Geolocation error:", error);
            getLocationBtn.disabled = false;
            getLocationBtn.textContent = "📍 Tentar Novamente";
            
            // Better error messages
            let errorMessage = "Erro ao obter localização";
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Permissão de localização negada. Habilite nas configurações do navegador.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Localização indisponível. Verifique se o GPS está ativado.";
                break;
              case error.TIMEOUT:
                errorMessage = "Tempo esgotado ao buscar localização. Tente novamente ou use localização aproximada.";
                break;
            }
            
            window.showLocationError?.('geolocation-banner-container', errorMessage);
            
            // Show toast with option to retry or use low accuracy
            if (window.toast) {
              window.toast.error(errorMessage, 5000);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 30000, // Increased from 10s to 30s
            maximumAge: 60000 // Accept cached positions up to 1 minute old
          }
        );
      } else {
        window.toast?.error("Geolocalização não é suportada neste navegador.", 5000);
      }
    });
  },
  
  _setupTrackingModeToggle() {
    const toggle = document.getElementById("continuous-tracking-toggle");
    if (!toggle) return;
    
    toggle.addEventListener("change", (e) => {
      this.continuousMode = e.target.checked;
      e.target.setAttribute('aria-checked', this.continuousMode.toString());
      
      console.log(`(home-view) Continuous tracking ${this.continuousMode ? 'enabled' : 'disabled'}`);
      
      // Show/hide tracking-specific UI
      const trackingTimer = document.getElementById("tracking-timer-container");
      const getLocationBtnContainer = document.getElementById("get-location-button-container");
      
      if (this.continuousMode) {
        // Start continuous tracking
        if (trackingTimer) trackingTimer.style.display = 'inline';
        if (getLocationBtnContainer) getLocationBtnContainer.style.display = 'none';
        
        // Start tracking
        this.manager.startTracking();
        
        // Setup speech queue monitoring
        this._setupSpeechQueueMonitoring();
        
        window.toast?.info('Rastreamento contínuo ativado', 2000);
      } else {
        // Stop continuous tracking
        if (trackingTimer) trackingTimer.style.display = 'none';
        if (getLocationBtnContainer) getLocationBtnContainer.style.display = 'block';
        
        // Stop tracking
        if (this.manager && this.manager.watchId) {
          navigator.geolocation.clearWatch(this.manager.watchId);
          this.manager.watchId = null;
        }
        
        // Stop speech
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        
        // Clear speech queue interval
        if (this.speechQueueInterval) {
          clearInterval(this.speechQueueInterval);
          this.speechQueueInterval = null;
        }
        
        window.toast?.info('Rastreamento contínuo desativado', 2000);
      }
    });
  },
  
  _setupSpeechQueueMonitoring() {
    if (!this.manager.htmlSpeechSynthesisDisplayer) return;
    if (!this.manager.htmlSpeechSynthesisDisplayer.speechManager) return;
    
    const speechQueue = this.manager.htmlSpeechSynthesisDisplayer.speechManager.speechQueue;
    if (!speechQueue) return;
    
    if (typeof speechQueue.subscribeFunction === 'function') {
      speechQueue.subscribeFunction(queue => {
        const size = this._calculateQueueSize(queue);
        this._renderToElement("tam-fila-fala", size.toString());
      });
    } else {
      // Fallback polling
      this.speechQueueInterval = setInterval(() => {
        const queueLength = speechQueue.length || (Array.isArray(speechQueue.queue) ? speechQueue.queue.length : 0);
        this._renderToElement("tam-fila-fala", queueLength.toString());
      }, 500);
    }
  },
  
  _renderToElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerText = content;
      // Add tooltip for potentially truncated text in highlight cards
      if (element.classList.contains('highlight-card-value')) {
        element.title = content;
      }
    }
  },
  
  _calculateQueueSize(queue) {
    if (!queue) return 0;
    if (typeof queue.size === 'function') return queue.size();
    if (Array.isArray(queue.queue)) return queue.queue.length;
    return 0;
  }
};