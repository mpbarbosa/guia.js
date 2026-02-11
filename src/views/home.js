/**
 * @fileoverview Home View - Main landing page for Guia Turístico
 * @version 0.8.7-alpha
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
 * - Contextual button status messages (v0.8.7-alpha)
 * 
 * @module views/home
 * @requires https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.6.0-alpha/src/guia.js
 */

import { WebGeocodingManager, PositionManager, AddressCache } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.6.0-alpha/src/guia.js';
import HTMLSidraDisplayer from '../html/HTMLSidraDisplayer.js';
import { ADDRESS_FETCHED_EVENT } from '../config/defaults.js';
import { extractDistrito, extractBairro, determineLocationType, formatLocationValue } from '../address-parser.js';
import timerManager from '../utils/TimerManager.js';
import { log, warn, error } from '../utils/logger.js';
import { showInfo } from '../utils/toast.js';
import { initializeEmptyStates, clearAllEmptyStates } from '../utils/empty-state-manager.js';
import { disableWithReason, enableWithMessage, BUTTON_STATUS_MESSAGES } from '../utils/button-status.js';

/**
 * Home view implementation
 * 
 * Note: This file contains helper functions for the home view.
 * The actual HTML is embedded in src/index.html and initialization
 * is handled by src/app.js.
 * 
 * @deprecated The view configuration object structure is unused.
 * This file is kept for potential future refactoring.
 */

// State
let continuousMode = false;
let firstUpdate = true;
let manager = null;
let sidraDisplayer = null;

// Track event listeners for cleanup
const eventListeners = new Map();

async function mount(container) {
  log("(home-view) Mounting home view...");
  
  try {
    // Initialize state
    continuousMode = false;
    firstUpdate = true;
    
    // Initialize empty states for better UX
    initializeEmptyStates();
    log("(home-view) Empty states initialized");
    
    // Initialize geolocation manager
    manager = await _initializeGeocodingManager();
    
    // Expose manager to window for E2E testing
    if (typeof window !== 'undefined') {
      window.webGeocodingManager = manager;
    }
    
    // Initialize SIDRA displayer
    _initializeSidraDisplayer();
    
    // Setup handlers
    _setupLocationUpdateHandlers();
    _setupCacheDisplayHandlers();
    _setupButtonHandlers();
    _setupGetLocationButton();
    _setupTrackingModeToggle();
    
    // Initialize buttons with disabled status messages
    _initializeButtonStates();
  } catch (err) {
    error("(home-view) Error mounting home view:", err);
    // Display user-friendly error message
      if (container) {
        container.innerHTML = `
          <div class="error-message" role="alert">
            <h2>❌ Erro ao Inicializar</h2>
      <p>Não foi possível inicializar a visualização. Por favor, recarregue a página.</p>
      <p class="error-details">${err.message}</p>
    </div>
  `;
    }
    throw err; // Re-throw for app-level handling
  }
}

function cleanup() {
  log("(home-view) Cleaning up home view...");
  
  // Remove all tracked event listeners
  eventListeners.forEach(({ element, event, handler }) => {
    if (element) {
      element.removeEventListener(event, handler);
      log(`(home-view) Removed ${event} listener from`, element.id || element.tagName);
    }
  });
  eventListeners.clear();
  
  // Stop any ongoing geolocation watchers
  if (manager && manager.watchId) {
    navigator.geolocation.clearWatch(manager.watchId);
  }
  
  // Stop speech synthesis
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  
  // Clear intervals using TimerManager
  timerManager.clearTimer('home-cache-display');
  timerManager.clearTimer('home-speech-queue-display');
  
  // Clear state
  manager = null;
  continuousMode = false;
  firstUpdate = true;
}

// Helper methods (impure functions)
async function _initializeGeocodingManager() {
    const locationResult = document.getElementById("locationResult");
    const enderecoPadronizadoDisplay = document.getElementById("endereco-padronizado-display");
    const referencePlaceDisplay = document.getElementById("reference-place-display");
    
    log("(home-view) Creating WebGeocodingManager...");
    
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
    
  try {
    return await WebGeocodingManager.createAsync(document, params);
  } catch (err) {
    error("(home-view) Failed to create WebGeocodingManager:", err);
    throw new Error(`Falha ao inicializar gerenciador de geolocalização: ${err.message}`);
  }
}

function _initializeSidraDisplayer() {
  const dadosSidraElement = document.getElementById("dadosSidra");
  if (dadosSidraElement) {
    log("(home-view) Initializing HTMLSidraDisplayer...");
    sidraDisplayer = new HTMLSidraDisplayer(dadosSidraElement, { dataType: 'PopEst' });
  } else {
    warn("(home-view) dadosSidra element not found, SIDRA displayer not initialized");
  }
}

function _setupLocationUpdateHandlers() {
  manager.subscribeFunction((currentPosition, newAddress, enderecoPadronizado) => {
    log(`(home-view) Location updated`);
    
    if (currentPosition) {
      // Clear empty states when first location arrives
      if (firstUpdate) {
        clearAllEmptyStates();
        window.showLocationSuccess?.('geolocation-banner-container', 3000);
        firstUpdate = false;
      }
      
      // Enable buttons
      const findRestaurantsBtn = document.getElementById("findRestaurantsBtn");
      const cityStatsBtn = document.getElementById("cityStatsBtn");
      
      if (findRestaurantsBtn) {
        enableWithMessage(findRestaurantsBtn, BUTTON_STATUS_MESSAGES.READY);
      }
      
      if (cityStatsBtn) {
        enableWithMessage(cityStatsBtn, BUTTON_STATUS_MESSAGES.READY);
      }
    }
    
    // Update display elements
    _updateLocationDisplay(currentPosition, newAddress, enderecoPadronizado);
    
    // Update SIDRA data if in continuous mode using the dedicated displayer
    if (continuousMode && sidraDisplayer && enderecoPadronizado) {
      sidraDisplayer.update(newAddress, enderecoPadronizado, ADDRESS_FETCHED_EVENT, false, null);
    }
  });
}

function _updateLocationDisplay(currentPosition, newAddress, enderecoPadronizado) {
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
    _updateLocationTypeCard(newAddress);
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
    _renderToElement("municipio-value", municipioText);
  }
}
  
/**
 * Update location type card (Distrito or Bairro) dynamically
 * @param {Object} address - Nominatim address object
 * @private
 * 
 * Note: Uses address-parser.js module for consistent address parsing logic.
 * The module is imported as ES6 module and shared between views and tests.
 */
function _updateLocationTypeCard(address) {
  // Determine location type using address parser logic
  const locationType = _determineLocationType(address);
  
  // Update card label
  const label = locationType.type === 'distrito' ? 'Distrito' : 'Bairro';
  _renderToElement("location-type-label", label);
  
  // Update card value
  const value = _formatLocationValue(locationType.value);
  _renderToElement("location-type-value", value);
  
  // Update ARIA label for accessibility
  const card = document.getElementById("location-type-card");
  if (card) {
    card.setAttribute('aria-labelledby', 'location-type-label');
  }
}
  
/**
 * Determine location type from address
 * @param {Object} address - Nominatim address object
 * @returns {{type: 'distrito'|'bairro', value: string|null}} Location type and value
 * @private
 */
function _determineLocationType(address) {
  return determineLocationType(address);
  
  // No subdivision available
  return { type: 'bairro', value: null };
}

/**
 * Format location value for display
 * @param {string|null} value - Location value
 * @returns {string} Formatted value
 * @private
 */
function _formatLocationValue(value) {
  return formatLocationValue(value);
}

function _setupCacheDisplayHandlers() {
  const updateCacheDisplay = () => {
    const tamCache = document.getElementById("tam-cache");
    if (tamCache && manager.cache) {
      tamCache.textContent = manager.cache.size || 0;
    }
  };
    
    // Try to subscribe to cache updates
    if (AddressCache && typeof AddressCache.subscribeFunction === 'function') {
      AddressCache.subscribeFunction(eventData => {
      const cacheSize = eventData?.cacheSize || eventData?.cache?.length || 0;
      _renderToElement("tam-cache", cacheSize.toString());
    });
  }
  
  // Update initially and periodically as fallback
  updateCacheDisplay();
  timerManager.setInterval(updateCacheDisplay, 5000, 'home-cache-display');
}

function _setupButtonHandlers() {
  const findRestaurantsBtn = document.getElementById("findRestaurantsBtn");
  const cityStatsBtn = document.getElementById("cityStatsBtn");
  
  if (findRestaurantsBtn) {
    const handler = () => {
      log("(home-view) Find restaurants clicked");
      showInfo("Funcionalidade de busca de restaurantes será implementada em breve!");
    };
    findRestaurantsBtn.addEventListener('click', handler);
    eventListeners.set('findRestaurantsBtn', { element: findRestaurantsBtn, event: 'click', handler });
  }
  
  if (cityStatsBtn) {
    const handler = () => {
      log("(home-view) City stats clicked");
      showInfo("Funcionalidade de estatísticas da cidade será implementada em breve!");
    };
    cityStatsBtn.addEventListener('click', handler);
    eventListeners.set('cityStatsBtn', { element: cityStatsBtn, event: 'click', handler });
  }
}

function _setupGetLocationButton() {
    const getLocationBtn = document.getElementById("getLocationBtn");
    if (!getLocationBtn) return;
    
    const handler = () => {
      log("(home-view) Get location button clicked");
      
      // Show permission request banner
      window.showPermissionRequest?.('geolocation-banner-container');
      
      // Get current position once
      if (navigator.geolocation) {
        getLocationBtn.disabled = true;
        getLocationBtn.textContent = "⏳ Obtendo localização...";
        
        navigator.geolocation.getCurrentPosition(
        (position) => {
          log("(home-view) Location obtained:", position);
          
          // Trigger location update through manager
          if (manager && manager.positionManager) {
            manager.positionManager.updatePosition(position);
          }
          
          getLocationBtn.disabled = false;
          getLocationBtn.textContent = "📍 Obter Localização Atual";
            
            window.showLocationSuccess?.('geolocation-banner-container', 3000);
          },
          (err) => {
            error("(home-view) Geolocation error:", err);
            getLocationBtn.disabled = false;
            getLocationBtn.textContent = "📍 Tentar Novamente";
            
            // Better error messages
            let errorMessage = "Erro ao obter localização";
            switch(err.code) {
              case err.PERMISSION_DENIED:
                errorMessage = "Permissão de localização negada. Habilite nas configurações do navegador.";
                break;
              case err.POSITION_UNAVAILABLE:
                errorMessage = "Localização indisponível. Verifique se o GPS está ativado.";
                break;
              case err.TIMEOUT:
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
  };
  
  getLocationBtn.addEventListener("click", handler);
  eventListeners.set('getLocationBtn', { element: getLocationBtn, event: 'click', handler });
}

function _setupTrackingModeToggle() {
  const toggle = document.getElementById("continuous-tracking-toggle");
  if (!toggle) return;
  
  const handler = (e) => {
    continuousMode = e.target.checked;
    e.target.setAttribute('aria-checked', continuousMode.toString());
    
    log(`(home-view) Continuous tracking ${continuousMode ? 'enabled' : 'disabled'}`);
    
    // Show/hide tracking-specific UI
    const trackingTimer = document.getElementById("tracking-timer-container");
    const getLocationBtnContainer = document.getElementById("get-location-button-container");
    
    if (continuousMode) {
      // Start continuous tracking
      if (trackingTimer) trackingTimer.style.display = 'inline';
      if (getLocationBtnContainer) getLocationBtnContainer.style.display = 'none';
      
      // Start tracking
      manager.startTracking();
      
      // Setup speech queue monitoring
      _setupSpeechQueueMonitoring();
      
      window.toast?.info('Rastreamento contínuo ativado', 2000);
    } else {
      // Stop continuous tracking
      if (trackingTimer) trackingTimer.style.display = 'none';
      if (getLocationBtnContainer) getLocationBtnContainer.style.display = 'block';
      
      // Stop tracking
      if (manager && manager.watchId) {
        navigator.geolocation.clearWatch(manager.watchId);
        manager.watchId = null;
      }
      
      // Stop speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      // Clear speech queue interval
      timerManager.clearTimer('home-speech-queue-display');
      
      window.toast?.info('Rastreamento contínuo desativado', 2000);
    }
  };
  
  toggle.addEventListener("change", handler);
  eventListeners.set('continuous-tracking-toggle', { element: toggle, event: 'change', handler });
}

function _setupSpeechQueueMonitoring() {
  if (!manager.htmlSpeechSynthesisDisplayer) return;
  if (!manager.htmlSpeechSynthesisDisplayer.speechManager) return;
  
  const speechQueue = manager.htmlSpeechSynthesisDisplayer.speechManager.speechQueue;
  if (!speechQueue) return;
  
  if (typeof speechQueue.subscribeFunction === 'function') {
    speechQueue.subscribeFunction(queue => {
      const size = _calculateQueueSize(queue);
      _renderToElement("tam-fila-fala", size.toString());
    });
  } else {
    // Fallback polling
    timerManager.setInterval(() => {
      const queueLength = speechQueue.length || (Array.isArray(speechQueue.queue) ? speechQueue.queue.length : 0);
      _renderToElement("tam-fila-fala", queueLength.toString());
    }, 500, 'home-speech-queue-display');
  }
}

function _renderToElement(elementId, content) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerText = content;
    // Add tooltip for potentially truncated text in highlight cards
    if (element.classList.contains('highlight-card-value')) {
      element.title = content;
    }
  }
}

function _calculateQueueSize(queue) {
  if (!queue) return 0;
  if (typeof queue.size === 'function') return queue.size();
  if (Array.isArray(queue.queue)) return queue.queue.length;
  return 0;
}

function _initializeButtonStates() {
  const findRestaurantsBtn = document.getElementById("findRestaurantsBtn");
  const cityStatsBtn = document.getElementById("cityStatsBtn");
  
  if (findRestaurantsBtn) {
    disableWithReason(findRestaurantsBtn, BUTTON_STATUS_MESSAGES.WAITING_LOCATION);
  }
  
  if (cityStatsBtn) {
    disableWithReason(cityStatsBtn, BUTTON_STATUS_MESSAGES.WAITING_LOCATION);
  }
}