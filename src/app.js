'use strict';

/**
 * Main Application Entry Point
 * SPA Router and Application Initialization
 * @version 0.9.0-alpha
 */

import WebGeocodingManager from './coordination/WebGeocodingManager.js';
import Chronometer from './timing/Chronometer.js';
import PositionManager from './core/PositionManager.js';
import { log, warn, error } from './utils/logger.js';
import { VERSION, VERSION_STRING } from './config/version.js';

// Application state
const AppState = {
  currentRoute: null,
  manager: null,
  routes: {
    '/': 'home',
    '/converter': 'converter'
  }
};

/**
 * Initialize the Guia Turístico single-page application.
 * 
 * Sets up the SPA routing system, navigation handlers, and initializes the application
 * state. This is the main entry point for the application and should be called once
 * when the DOM is ready.
 * 
 * **Initialization Steps**:
 * 1. Wait for dependencies to load (ibira.js from CDN)
 * 2. Initialize client-side router
 * 3. Set up navigation UI and event handlers
 * 4. Handle initial route based on URL hash
 * 5. Register hashchange and popstate listeners
 * 
 * @async
 * @returns {Promise<void>} Resolves when initialization is complete
 * 
 * @example
 * // Initialize app on DOMContentLoaded
 * document.addEventListener('DOMContentLoaded', init);
 * 
 * @example
 * // Manual initialization
 * await init();
 * log('App ready');
 * 
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */
async function init() {
  log(`Initializing ${VERSION_STRING}...`);
  
  // Hide app loading screen
  const appLoading = document.getElementById('app-loading');
  if (appLoading) {
    // Add hidden class with fade out animation
    appLoading.classList.add('hidden');
    // Remove from DOM after animation completes
    setTimeout(() => {
      appLoading.remove();
    }, 300);
  }
  
  // Wait for external dependencies to load (max 5 seconds)
  if (window.dependenciesLoading) {
    log('⏳ Waiting for dependencies to load...');
    try {
      await Promise.race([
        new Promise(resolve => window.addEventListener('dependencies-ready', resolve, { once: true })),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Dependency timeout')), 5000))
      ]);
      log('✓ Dependencies ready');
    } catch (err) {
      warn('⚠️ Dependency loading timeout - continuing with fallback:', err.message);
    }
  }
  
  // Initialize router
  initRouter();
  
  // Initialize navigation
  initNavigation();
  
  // Handle initial route
  handleRoute();
  
  // Listen for route changes
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('popstate', handleRoute);
  
  log('✓ Application initialized successfully');
}

/**
 * Initialize the client-side router for the SPA.
 * 
 * Sets up event delegation to intercept clicks on navigation links (hash-based URLs)
 * and prevent default browser behavior. Instead of full page reloads, the router
 * triggers client-side navigation via the navigateTo function.
 * 
 * @returns {void}
 * 
 * @example
 * // Called automatically during app initialization
 * initRouter();
 * 
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */
function initRouter() {
  // Intercept navigation links
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (link) {
      event.preventDefault();
      const href = link.getAttribute('href');
      navigateTo(href);
    }
  });
}

/**
 * Initialize navigation UI and update active link states.
 * 
 * Sets up the navigation UI by updating the active navigation link based on
 * the current route. This ensures proper visual feedback for the current page.
 * 
 * **Modified in v0.9.0**: Adapted to work with footer navigation (primary nav removed).
 * 
 * @returns {void}
 * 
 * @example
 * // Called automatically during app initialization
 * initNavigation();
 * 
 * @since 0.9.0-alpha
 * @modified 0.9.0-alpha - Adapted for footer navigation
 * @author Marcelo Pereira Barbosa
 */
function initNavigation() {
  // Update active navigation link (footer links)
  updateActiveNavLink();
}

/**
 * Handle route changes and load appropriate view content.
 * 
 * Main routing function that responds to URL hash changes. Determines which view
 * to load based on the current route, manages loading states, and handles routing
 * errors gracefully.
 * 
 * **Supported Routes**:
 * - `/` or empty - Home view (geolocation features)
 * - `/converter` - Coordinate converter view
 * - All others - 404 Not Found view
 * 
 * @async
 * @returns {Promise<void>} Resolves when route handling is complete
 * @throws {Error} If view loading fails (caught and displayed via showError)
 * 
 * @example
 * // Called automatically on hashchange
 * window.addEventListener('hashchange', handleRoute);
 * 
 * @example
 * // Manual route handling
 * await handleRoute();
 * 
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */
async function handleRoute() {
  const hash = window.location.hash || '#/';
  const route = hash.substring(1); // Remove '#'
  
  log('Routing to:', route);
  
  // Update navigation
  updateActiveNavLink();
  
  try {
    // Route to appropriate view
    if (route === '/' || route === '') {
      // Home view is already in index.html - just initialize it
      await initializeHomeView();
    } else {
      // Show loading state for other routes
      showLoading();
      
      if (route === '/converter') {
        await loadConverterView();
      } else {
        await loadNotFoundView();
      }
    }
    
    AppState.currentRoute = route;
    
    // Focus management for accessibility
    manageFocusAfterRouteChange();
  } catch (err) {
    error('Route loading error:', err);
    showError(err);
  }
}

/**
 * Manage keyboard focus after route changes.
 * Moves focus to the main heading of the new view for screen reader users
 * and keyboard navigation users. Falls back to main content area if no heading exists.
 * 
 * Uses requestAnimationFrame to ensure DOM is fully updated before focusing.
 * 
 * @returns {void}
 * @since 0.9.0-alpha
 */
function manageFocusAfterRouteChange() {
  // Use requestAnimationFrame to ensure DOM is fully updated
  requestAnimationFrame(() => {
    // Find the main content area
    const mainContent = document.getElementById('app-content');
    if (!mainContent) {
      warn('Main content element not found for focus management');
      return;
    }
    
    // Find the first h1 heading in the view
    const heading = mainContent.querySelector('h1');
    if (heading) {
      // Make heading focusable
      heading.setAttribute('tabindex', '-1');
      // Move focus to heading
      heading.focus();
      // Announce route change to screen readers
      heading.setAttribute('aria-live', 'polite');
      // Remove aria-live after announcement
      setTimeout(() => {
        heading.removeAttribute('aria-live');
      }, 1000);
      log('Focus moved to h1 heading:', heading.textContent);
    } else {
      // Fallback: Focus on main content if no h1 found
      // This ensures focus always moves on route change
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      log('Focus moved to main content (no h1 heading found)');
    }
  });
}

/**
 * Navigate to a specified route path.
 * 
 * Updates the browser's URL hash to trigger a route change. This function
 * modifies window.location.hash which triggers hashchange event handlers.
 * 
 * @param {string} path - Route path (e.g., '/', '/converter')
 * @returns {void}
 * 
 * @example
 * // Navigate to home
 * navigateTo('/');
 * 
 * @example
 * // Navigate to converter
 * navigateTo('/converter');
 * 
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */
function navigateTo(path) {
  window.location.hash = path;
}

/**
 * Update active navigation link based on current route.
 * 
 * Adds ARIA attributes (aria-current="page") to navigation links matching
 * the current URL hash. Searches both legacy .app-navigation (removed) and
 * .app-footer locations. Removes the attribute from all other links to ensure
 * proper accessibility and visual feedback.
 * 
 * **Modified in v0.9.0**: Updated to search footer navigation after primary nav removal.
 * 
 * @returns {void}
 * 
 * @example
 * // Called automatically during route changes
 * updateActiveNavLink();
 * 
 * @since 0.9.0-alpha
 * @modified 0.9.0-alpha - Search footer instead of primary nav
 * @author Marcelo Pereira Barbosa
 */
function updateActiveNavLink() {
  const hash = window.location.hash || '#/';
  
  // Search both .app-navigation (legacy) and .app-footer
  document.querySelectorAll('.app-navigation a, .app-footer a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === hash) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

/**
 * Show loading state in the application content area.
 * 
 * Displays a loading spinner with appropriate ARIA attributes for accessibility.
 * Used during asynchronous view transitions to provide visual feedback.
 * 
 * @returns {void}
 * 
 * @example
 * // Show loading before async operation
 * showLoading();
 * await loadConverterView();
 * 
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */
function showLoading() {
  const content = document.getElementById('app-content');
  if (content) {
    content.innerHTML = `
      <div class="route-loading" role="status" aria-live="polite">
        <div class="loading-spinner" aria-hidden="true">⏳</div>
        <p>Carregando página...</p>
      </div>
    `;
  }
}

/**
 * Show error state in the application content area.
 * 
 * Displays a user-friendly error message with error details and recovery options.
 * Includes an expandable details section with the error stack trace for debugging.
 * 
 * @param {Error} error - Error object to display
 * @returns {void}
 * 
 * @example
 * // Display routing error
 * try {
 *   await loadView();
 * } catch (error) {
 *   showError(error);
 * }
 * 
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */
function showError(error) {
  const content = document.getElementById('app-content');
  if (content) {
    content.innerHTML = `
      <div class="route-error" role="alert">
        <h2>Erro ao Carregar Página</h2>
        <p>Ocorreu um erro ao carregar o conteúdo desta página.</p>
        <details>
          <summary>Detalhes do Erro</summary>
          <pre>${error.message}\n${error.stack || ''}</pre>
        </details>
        <div>
          <button class="md3-button-filled" onclick="location.reload()">
            Recarregar Página
          </button>
          <button class="md3-button-outlined" onclick="window.location.hash='#/'">
            Voltar ao Início
          </button>
        </div>
      </div>
    `;
  }
}

/**
 * Initialize home view and preserve existing HTML content.
 * 
 * Initializes the home view by ensuring WebGeocodingManager is set up for
 * geolocation functionality. If the home view content was replaced during
 * navigation, triggers a page reload to restore it.
 * 
 * @async
 * @returns {Promise<void>} Resolves when home view is initialized
 * @throws {Error} If WebGeocodingManager initialization fails (error is logged)
 * 
 * @example
 * // Called automatically during routing
 * await initializeHomeView();
 * 
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */
async function initializeHomeView() {
  // Home view content is already in index.html
  // Just ensure WebGeocodingManager is initialized
  const content = document.getElementById('app-content');
  
  // Initialize WebGeocodingManager if not already done
  if (!AppState.manager) {
    try {
      // WebGeocodingManager expects params object with locationResult property
      // locationResult is for address display, positionDisplay is for coordinates
      AppState.manager = new WebGeocodingManager(document, {
        locationResult: 'locationResult',
        elementIds: {
          positionDisplay: 'lat-long-display', // Use default - coordinates go here
          referencePlaceDisplay: 'reference-place-display',
          enderecoPadronizadoDisplay: 'endereco-padronizado-display',
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
            pitchValueId: "pitch-value"
          },
          sidraDisplay: 'dadosSidra'
        }
      });
      log('WebGeocodingManager initialized for home view');
      
      // Initialize Chronometer for elapsed time display
      const chronometerElement = document.getElementById('chronometer');
      if (chronometerElement) {
        const chronometer = new Chronometer(chronometerElement);
        
        // Subscribe chronometer to PositionManager for automatic updates
        const positionManager = PositionManager.getInstance();
        positionManager.subscribe(chronometer);
        
        // Start the chronometer immediately
        chronometer.start();
        
        log('Chronometer initialized and started');
      } else {
        warn('chronometer element not found');
      }
      
      // Start tracking automatically
      AppState.manager.startTracking();
      log('Tracking started automatically');
    } catch (err) {
      error('Error initializing WebGeocodingManager:', err);
    }
  }
}

/**
 * Load coordinate converter view dynamically.
 * 
 * Fetches and displays the coordinate converter interface for converting between
 * different coordinate formats (Decimal Degrees, DMS, UTM). Includes format
 * converter initialization after DOM injection.
 * 
 * @async
 * @returns {Promise<void>} Resolves when converter view is loaded
 * @throws {Error} If view loading fails (propagated to caller)
 * 
 * @example
 * // Called automatically during routing to /converter
 * await loadConverterView();
 * 
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */
async function loadConverterView() {
  const content = document.getElementById('app-content');
  
  content.innerHTML = `
    <div class="container">
      <header>
        <h1>Conversor de Endereços</h1>
        <p>Converta coordenadas em endereços e vice-versa</p>
      </header>
      
      <section class="converter-section">
        <div class="md3-card">
          <h2>Coordenadas → Endereço</h2>
          <form id="coords-to-address-form">
            <div style="margin-bottom: 1rem;">
              <label for="latitude">Latitude:</label>
              <input 
                type="number" 
                id="latitude" 
                step="any" 
                placeholder="-23.550520"
                style="width: 100%; padding: 8px; margin-top: 4px;"
                required
              />
            </div>
            <div style="margin-bottom: 1rem;">
              <label for="longitude">Longitude:</label>
              <input 
                type="number" 
                id="longitude" 
                step="any" 
                placeholder="-46.633309"
                style="width: 100%; padding: 8px; margin-top: 4px;"
                required
              />
            </div>
            <button type="submit" class="md3-button-filled">
              Converter para Endereço
            </button>
          </form>
          
          <div id="address-result" style="margin-top: 1rem;" aria-live="polite">
            <!-- Results will appear here -->
          </div>
        </div>
      </section>
    </div>
  `;
  
  // Initialize converter functionality
  initializeConverterFeatures();
}

/**
 * Initialize converter features
 */
/**
 * Initialize converter features and event handlers.
 * 
 * Sets up form submission handlers for the coordinate converter view:
 * - Coordinates to Address converter
 * - Address to Coordinates converter (geocoding)
 * 
 * Uses ReverseGeocoder for coordinate-to-address conversion. Address-to-coordinates
 * functionality is a placeholder awaiting full implementation.
 * 
 * @returns {void}
 * 
 * @example
 * // Called automatically after loadConverterView
 * initializeConverterFeatures();
 * 
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */
function initializeConverterFeatures() {
  const form = document.getElementById('coords-to-address-form');
  const resultDiv = document.getElementById('address-result');
  
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const lat = parseFloat(document.getElementById('latitude').value);
      const lon = parseFloat(document.getElementById('longitude').value);
      
      resultDiv.innerHTML = '<p class="loading">⏳ Convertendo coordenadas...</p>';
      
      try {
        // Use Nominatim API to reverse geocode
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
        );
        
        if (!response.ok) {
          throw new Error('Erro ao buscar endereço');
        }
        
        const data = await response.json();
        
        resultDiv.innerHTML = `
          <div class="md3-card-elevated">
            <h3>✅ Endereço Encontrado</h3>
            <p><strong>Endereço:</strong> ${data.display_name}</p>
            ${data.address ? `
              <hr class="section-divider" />
              <p><strong>Detalhes:</strong></p>
              <ul style="text-align: left;">
                ${data.address.road ? `<li>Rua: ${data.address.road}</li>` : ''}
                ${data.address.suburb ? `<li>Bairro: ${data.address.suburb}</li>` : ''}
                ${data.address.city || data.address.town || data.address.village ? 
                  `<li>Cidade: ${data.address.city || data.address.town || data.address.village}</li>` : ''}
                ${data.address.state ? `<li>Estado: ${data.address.state}</li>` : ''}
                ${data.address.postcode ? `<li>CEP: ${data.address.postcode}</li>` : ''}
              </ul>
            ` : ''}
          </div>
        `;
      } catch (err) {
        error('Conversion error:', err);
        resultDiv.innerHTML = `
          <div class="md3-card text-error">
            <h3>❌ Erro na Conversão</h3>
            <p>${err.message}</p>
          </div>
        `;
      }
    });
  }
}

/**
 * Load 404 not found view
 */
/**
 * Load 404 Not Found view for unknown routes.
 * 
 * Displays a user-friendly 404 error page when navigating to an unrecognized route.
 * Includes navigation options back to valid routes.
 * 
 * @async
 * @returns {Promise<void>} Resolves when 404 view is loaded
 * 
 * @example
 * // Called automatically for unrecognized routes
 * await loadNotFoundView();
 * 
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */
async function loadNotFoundView() {
  const content = document.getElementById('app-content');
  
  content.innerHTML = `
    <div class="container text-center">
      <h1 style="font-size: 4rem; margin: 2rem 0;">404</h1>
      <h2>Página Não Encontrada</h2>
      <p>A página que você está procurando não existe.</p>
      <button class="md3-button-filled" onclick="window.location.hash='#/'">
        Voltar ao Início
      </button>
    </div>
  `;
}

// Initialize app when DOM is ready (browser-only)
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
} else {
  // Node.js environment - skip browser initialization
  log('Running in Node.js - skipping browser initialization');
}

// Export for debugging
if (typeof window !== 'undefined') {
  window.GuiaApp = {
    navigateTo,
    getState: () => AppState
  };
}
