/**
 * @fileoverview Home View Controller - Location Tracking and Geocoding
 * Manages the home view of Guia Turístico application with real-time location tracking
 * 
 * This view controller handles:
 * - Continuous and single-shot location tracking
 * - Geocoding and address display coordination
 * - Speech synthesis for accessibility
 * - Chronometer for elapsed time tracking
 * - Observer subscriptions for real-time updates
 * 
 * @module views/home
 * @since 0.10.0-alpha (refactored from app.js)
 * @author Marcelo Pereira Barbosa
 */

import WebGeocodingManager from '../coordination/WebGeocodingManager.js';
import Chronometer from '../timing/Chronometer.js';
import PositionManager from '../core/PositionManager.js';
import { GeoPosition } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.12.5-alpha/dist/esm/index.js';
import { log, warn, error } from '../utils/logger.js';
import MapLibreDisplayer from '../html/MapLibreDisplayer.js';

/** Speech synthesis element IDs configuration. */
interface SpeechSynthesisIds {
  languageSelectId?: string;
  voiceSelectId?: string;
  textInputId?: string;
  speakBtnId?: string;
  pauseBtnId?: string;
  resumeBtnId?: string;
  stopBtnId?: string;
  rateInputId?: string;
  rateValueId?: string;
  pitchInputId?: string;
  pitchValueId?: string;
}

/** Element IDs for all display components. */
interface ElementIds {
  positionDisplay?: string;
  referencePlaceDisplay?: string;
  enderecoPadronizadoDisplay?: string;
  speechSynthesis?: SpeechSynthesisIds;
  sidraDisplay?: string;
}

/** Constructor parameters for HomeViewController. */
interface HomeViewControllerParams {
  locationResult: string | HTMLElement;
  elementIds?: ElementIds;
  manager?: WebGeocodingManager;
  chronometer?: Chronometer;
  autoStartTracking?: boolean;
}

/** Inline observer forwarding PositionManager state to the map displayer. */
interface MapPositionObserver {
  update: (positionManager: PositionManager) => void;
}

/**
 * Home View Controller for location tracking and geocoding display.
 * 
 * Manages the home view (/), handling:
 * - Continuous and single-shot location tracking
 * - Geocoding and address display
 * - Speech synthesis for accessibility
 * - Chronometer for elapsed time tracking
 * - Observer subscriptions for real-time updates
 * 
 * @class HomeViewController
 * @since 0.10.0-alpha (refactored from app.js)
 * 
 * @example
 * // Basic usage
 * const controller = new HomeViewController(document, {
 *   locationResult: 'locationResult',
 *   elementIds: {
 *     positionDisplay: 'lat-long-display',
 *     referencePlaceDisplay: 'reference-place-display',
 *     enderecoPadronizadoDisplay: 'endereco-padronizado-display',
 *     speechSynthesis: {...},
 *     sidraDisplay: 'dadosSidra'
 *   }
 * });
 * await controller.init();
 * 
 * @example
 * // With dependency injection (for testing)
 * const controller = new HomeViewController(document, {
 *   locationResult: 'locationResult',
 *   manager: mockManager,
 *   chronometer: mockChronometer
 * });
 * await controller.init();
 */
class HomeViewController {
  document: Document;
  params: HomeViewControllerParams;
  autoStartTracking: boolean;
  initialized: boolean;
  tracking: boolean;
  manager: WebGeocodingManager | null;
  chronometer: Chronometer | null;

  private _boundHandlers: Record<string, EventListener>;
  private _mapDisplayer: MapLibreDisplayer | null;
  private _mapPositionObserver: MapPositionObserver | null;

  /**
   * Creates a HomeViewController instance.
   * 
   * @param {Document} document - Browser document object for DOM manipulation
   * @param {HomeViewControllerParams} params - Configuration parameters
   * 
   * @throws {TypeError} If document is not provided
   * @throws {TypeError} If params.locationResult is not specified
   */
  constructor(document: Document, params: HomeViewControllerParams) {
    // Validation
    if (!document) {
      throw new TypeError('HomeViewController requires a document object');
    }
    if (!params.locationResult) {
      throw new TypeError('HomeViewController requires params.locationResult');
    }
    
    // Store configuration
    this.document = document;
    this.params = params;
    this.autoStartTracking = params.autoStartTracking !== false; // Default true
    
    // State management
    this.initialized = false;
    this.tracking = false;
    
    // Components (initialized in init())
    this.manager = params.manager || null;
    this.chronometer = params.chronometer || null;
    
    // Event listener handlers (bound methods stored for cleanup)
    this._boundHandlers = {};

    // Map components (initialized in _initializeMapDisplayer)
    this._mapDisplayer = null;
    this._mapPositionObserver = null;
    
    log('HomeViewController created (not yet initialized)');
  }
  
  /**
   * Initializes the home view controller and all dependencies.
   * 
   * **Initialization Steps**:
   * 1. Create WebGeocodingManager instance
   * 2. Initialize Chronometer for elapsed time
   * 3. Subscribe chronometer to PositionManager
   * 4. Set up button event listeners
   * 5. Auto-start tracking if enabled
   * 
   * @async
   * @returns {Promise<void>} Resolves when initialization complete
   * @throws {Error} If WebGeocodingManager creation fails
   * @throws {Error} If chronometer element not found
   * 
   * @fires HomeViewController#homeview:initialized - When initialization completes
   * 
   * @example
   * const controller = new HomeViewController(document, {...});
   * await controller.init();
   * console.log('Home view ready');
   */
  async init(): Promise<void> {
    console.log('[GT] HomeViewController.init() called, initialized:', this.initialized); // DEBUG
    if (this.initialized) {
      warn('HomeViewController already initialized');
      return;
    }
    
    try {
      // 1. Create WebGeocodingManager
      console.log('[GT] calling _initializeManager()...'); // DEBUG
      await this._initializeManager();
      console.log('[GT] _initializeManager() done'); // DEBUG
      
      // 2. Initialize Chronometer
      console.log('[GT] calling _initializeChronometer()...'); // DEBUG
      await this._initializeChronometer();
      console.log('[GT] _initializeChronometer() done'); // DEBUG
      
      // 3. Set up event listeners (stub for Step 4)
      this._setupEventListeners();
      
      // 4. Initialize MapLibre map displayer
      this._initializeMapDisplayer();
      
      // Mark as initialized BEFORE auto-start to avoid check error
      this.initialized = true;
      
      // 4. Auto-start tracking if enabled
      if (this.autoStartTracking) {
        console.log('[GT] calling startTracking()...'); // DEBUG
        this.startTracking();
        console.log('[GT] startTracking() done'); // DEBUG
      }
      
      log('HomeViewController initialized successfully');
      console.log('[GT] HomeViewController fully initialized'); // DEBUG
      
      // Emit initialized event
      this.document.dispatchEvent(new CustomEvent('homeview:initialized', {
        detail: { controller: this }
      }));
      
    } catch (err) {
      error('HomeViewController initialization failed:', err);
      throw err;
    }
  }
  
  /**
   * Checks if controller is currently tracking location.
   * 
   * @returns {boolean} True if tracking is active
   * 
   * @example
   * if (controller.isTracking()) {
   *   console.log('Location tracking is active');
   * }
   */
  isTracking(): boolean {
    return this.tracking;
  }
  
  /**
   * Cleans up all resources and event listeners.
   * 
   * **Cleanup Actions**:
   * 1. Stop tracking if active
   * 2. Remove all event listeners
   * 3. Destroy chronometer
   * 4. Destroy manager
   * 5. Reset state
   * 
   * @returns {void}
   * 
   * @example
   * controller.destroy();
   * console.log('HomeViewController cleaned up');
   */
  destroy(): void {
    log('Destroying HomeViewController...');
    
    // Stop tracking if active
    if (this.tracking) {
      this.stopTracking();
    }
    
    // Remove event listeners
    this._removeEventListeners();
    
    // Destroy chronometer
    if (this.chronometer && typeof this.chronometer.destroy === 'function') {
      this.chronometer.destroy();
    }
    
    // Destroy manager
    if (this.manager && typeof this.manager.destroy === 'function') {
      this.manager.destroy();
    }

    // Unsubscribe map position observer
    if (this._mapPositionObserver) {
      try {
        PositionManager.getInstance().unsubscribe(this._mapPositionObserver as { update?: (...args: unknown[]) => void });
      } catch (_) { /* ignore */ }
      this._mapPositionObserver = null;
      this._mapDisplayer = null;
    }
    
    // Reset state
    this.initialized = false;
    this.manager = null;
    this.chronometer = null;
    this._boundHandlers = {};
    
    log('HomeViewController destroyed');
  }
  
  /**
   * String representation of the controller.
   * 
   * @returns {string} String representation
   * 
   * @example
   * console.log(controller.toString());
   * // Output: "HomeViewController {initialized: true, tracking: false}"
   */
  toString(): string {
    return `HomeViewController {initialized: ${this.initialized}, tracking: ${this.tracking}}`;
  }
  
  // ===== Private Methods (Stubs for future implementation) =====
  
  /**
   * Initializes the WebGeocodingManager instance.
   * 
   * Extracted from app.js initializeHomeView() (lines 409-434).
   * 
   * @private
   * @async
   * @returns {Promise<void>}
   * @throws {Error} If manager creation fails
   */
  private async _initializeManager(): Promise<void> {
    // Skip if manager already provided via dependency injection
    if (this.manager) {
      log('HomeViewController: Using provided manager (dependency injection)');
      return;
    }
    
    try {
      console.log('[GT] _initializeManager: creating WebGeocodingManager...'); // DEBUG
      // WebGeocodingManager expects params object with locationResult property
      this.manager = new WebGeocodingManager(this.document, {
        locationResult: this.params.locationResult,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        elementIds: (this.params.elementIds as any) || {
          positionDisplay: 'lat-long-display',
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
      console.log('[GT] _initializeManager: WebGeocodingManager created OK'); // DEBUG
      
      log('HomeViewController: WebGeocodingManager initialized');
    } catch (err) {
      console.error('[GT] _initializeManager FAILED:', err); // DEBUG
      error('HomeViewController: Failed to initialize WebGeocodingManager:', err);
      throw err;
    }
  }
  
  /**
   * Initializes the Chronometer instance.
   * 
   * Extracted from app.js initializeHomeView() (lines 438-452).
   * 
   * @private
   * @async
   * @returns {Promise<void>}
   * @throws {Error} If chronometer element not found or initialization fails
   */
  private async _initializeChronometer(): Promise<void> {
    // Skip if chronometer already provided via dependency injection
    if (this.chronometer) {
      log('HomeViewController: Using provided chronometer (dependency injection)');
      return;
    }
    
    try {
      const chronometerElement = this.document.getElementById('chronometer');
      
      if (!chronometerElement) {
        warn('HomeViewController: chronometer element not found - chronometer not initialized');
        return; // Non-critical, allow initialization to continue
      }
      
      // Create chronometer instance
      this.chronometer = new Chronometer(chronometerElement);
      
      // Subscribe chronometer to PositionManager for automatic updates
      const positionManager = PositionManager.getInstance();
      positionManager.subscribe(this.chronometer as unknown as { update?: (...args: unknown[]) => void });
      
      // Start the chronometer immediately
      this.chronometer.start();
      
      log('HomeViewController: Chronometer initialized and started');
    } catch (err) {
      error('HomeViewController: Failed to initialize chronometer:', err);
      // Non-critical - don't throw, allow app to continue without chronometer
      warn('HomeViewController: Continuing without chronometer');
    }
  }

  /**
   * Initializes the MapLibre map displayer and subscribes to position updates.
   * @private
   */
  private _initializeMapDisplayer(): void {
    try {
      this._mapDisplayer = new MapLibreDisplayer('maplibre-map', 'map-toggle-btn');
      this._mapDisplayer.bindToggleButton();

      // Observer that forwards position changes to the map displayer
      this._mapPositionObserver = {
        update: (positionManager) => {
          const lat = positionManager.latitude;
          const lon = positionManager.longitude;
          if (lat != null && lon != null) {
            this._mapDisplayer?.updatePosition(lat, lon);
          }
        }
      };

      PositionManager.getInstance().subscribe(this._mapPositionObserver as { update?: (...args: unknown[]) => void });
      log('HomeViewController: MapLibreDisplayer initialized');
    } catch (err) {
      error('HomeViewController: Failed to initialize MapLibreDisplayer:', err);
      // Non-critical — app works without the map
    }
  }

  /**
   * Sets up event listeners for UI buttons.
   * @private
   * @returns {void}
   */
  private _setupEventListeners(): void {
    // Get Location button (primary action)
    const locationBtn = this.document.getElementById('enable-location-btn');
    if (locationBtn) {
      this._boundHandlers.locationClick = async () => {
        try {
          await this.toggleTracking();
        } catch (err) {
          error('Error toggling tracking:', err);
        }
      };
      locationBtn.addEventListener('click', this._boundHandlers.locationClick);
      log('HomeViewController: Location button listener added');
    } else {
      warn('HomeViewController: enable-location-btn not found');
    }
    
    // Test Position button (advanced controls)
    const testBtn = this.document.getElementById('insertPositionButton');
    if (testBtn) {
      this._boundHandlers.testPositionClick = async () => {
        try {
          await this.getSingleLocationUpdate();
        } catch (err) {
          error('Error getting test position:', err);
        }
      };
      testBtn.addEventListener('click', this._boundHandlers.testPositionClick);
      log('HomeViewController: Test position button listener added');
    }
  }
  
  /**
   * Removes all event listeners set up by _setupEventListeners().
   * 
   * Called during destroy() to prevent memory leaks.
   * 
   * @private
   * @returns {void}
   * @since 0.10.0-alpha
   */
  private _removeEventListeners(): void {
    // Remove location button listener
    const locationBtn = this.document.getElementById('enable-location-btn');
    if (locationBtn && this._boundHandlers.locationClick) {
      locationBtn.removeEventListener('click', this._boundHandlers.locationClick);
      log('HomeViewController: Location button listener removed');
    }
    
    // Remove test button listener
    const testBtn = this.document.getElementById('insertPositionButton');
    if (testBtn && this._boundHandlers.testPositionClick) {
      testBtn.removeEventListener('click', this._boundHandlers.testPositionClick);
      log('HomeViewController: Test position button listener removed');
    }
    
    // Clear bound handlers
    this._boundHandlers = {};
  }
  
  /**
   * Updates the tracking UI button states.
   * 
   * Changes button text and state based on tracking status:
   * - Not tracking: "Ativar Localização" (enabled)
   * - Tracking: "Parar Rastreamento" (enabled)
   * 
   * @private
   * @param {boolean} isTracking - Whether tracking is active
   * @returns {void}
   * @since 0.10.0-alpha
   */
  private _updateTrackingUI(isTracking: boolean): void {
    const locationBtn = this.document.getElementById('enable-location-btn');
    if (!locationBtn) {
      warn('HomeViewController: Cannot update UI - enable-location-btn not found');
      return;
    }
    
    // Update button text
    const textSpan = locationBtn.querySelector('.button-text');
    if (textSpan) {
      textSpan.textContent = isTracking ? 'Parar Rastreamento' : 'Ativar Localização';
    } else {
      locationBtn.textContent = isTracking ? 'Parar Rastreamento' : 'Ativar Localização';
    }
    
    // Update button icon
    const iconSpan = locationBtn.querySelector('.button-icon');
    if (iconSpan) {
      iconSpan.textContent = isTracking ? '⏹️' : '📍';
    }
    
    // Update ARIA label for accessibility
    locationBtn.setAttribute('aria-label', 
      isTracking ? 'Parar rastreamento de localização' : 'Ativar localização');
    
    log(`HomeViewController: UI updated (tracking: ${isTracking})`);
  }
  
  // ===== Public Methods (Tracking) =====
  
  /**
   * Gets a single location update without starting continuous tracking.
   * 
   * Extracted from WebGeocodingManager (lines 729-752).
   * 
   * **Workflow**:
   * 1. Delegate to ServiceCoordinator for position retrieval
   * 2. Wrap position in GeoPosition instance
   * 3. Update change detection coordinator
   * 4. Notify function observers
   * 5. Handle errors gracefully
   * 
   * @async
   * @returns {Promise<GeolocationPosition>} Resolves with position object
   * @throws {Error} If not initialized
   * @throws {GeolocationError} If geolocation fails
   * 
   * @example
   * await controller.getSingleLocationUpdate();
   */
  async getSingleLocationUpdate(options?: { silent?: boolean }): Promise<GeolocationPosition> {
    if (!this.initialized) {
      throw new Error('HomeViewController not initialized. Call init() first.');
    }

    const silent = options?.silent ?? false;
    
    if (!this.manager || !this.manager.serviceCoordinator) {
      throw new Error('ServiceCoordinator not available');
    }
    
    try {
      const position = await this.manager.serviceCoordinator.getSingleLocationUpdate();
      
      if (position && position.coords) {
        // Wrap raw browser position in GeoPosition instance
        const geoPosition = new GeoPosition(position);
        
        // Update GeocodingState for backward compatibility
        this.manager.currentPosition = geoPosition;
        this.manager.currentCoords = position.coords;
        
        // Update change detection coordinator
        if (this.manager.changeDetectionCoordinator) {
          this.manager.changeDetectionCoordinator.setCurrentPosition(position);
        }
        
        // Notify function observers
        if (typeof this.manager.notifyFunctionObservers === 'function') {
          this.manager.notifyFunctionObservers();
        }
        
        log('HomeViewController: Single location update successful');
      }
      
      return position;
    } catch (err) {
      error('HomeViewController: Single location update failed:', err);
      
      // Display error via manager unless called silently (e.g. from startTracking
      // where the watch is already active and will recover on its own).
      if (!silent && this.manager && typeof this.manager._displayError === 'function') {
        this.manager._displayError(err instanceof Error ? err : new Error(String(err)));
      }
      
      throw err;
    }
  }
  
  /**
   * Starts continuous location tracking.
   * 
   * Extracted from WebGeocodingManager (lines 772-782).
   * 
   * **Initialization Steps**:
   * 1. Initialize speech synthesis UI components
   * 2. Get initial location update
   * 3. Start continuous position watching via ServiceCoordinator
   * 4. Set up address component change detection callbacks
   * 
   * @returns {void}
   * @throws {Error} If not initialized
   * 
   * @fires HomeViewController#homeview:tracking:started
   * 
   * @example
   * controller.startTracking();
   */
  startTracking(): void {
    if (!this.initialized) {
      throw new Error('HomeViewController not initialized. Call init() first.');
    }
    
    if (this.tracking) {
      warn('HomeViewController: Tracking already started');
      return;
    }
    
    try {
      // Initialize speech synthesis UI components (extracted from WebGeocodingManager)
      if (this.manager && this.manager.speechCoordinator) {
        this.manager.speechCoordinator.initializeSpeechSynthesis();
      }
      
      // Get initial location without surfacing errors — the continuous watch
      // is started immediately below and will deliver a position once the
      // device acquires one, so a timeout here is not user-actionable.
      this.getSingleLocationUpdate({ silent: true }).catch(err => {
        warn('HomeViewController: Initial location update failed:', err.message);
        // Continue with tracking even if initial update fails
      });
      
      // Start continuous tracking via ServiceCoordinator
      if (this.manager && this.manager.serviceCoordinator) {
        this.manager.serviceCoordinator.startTracking();
      }
      
      // Set up address component change detection callbacks
      if (this.manager && this.manager.changeDetectionCoordinator) {
        this.manager.changeDetectionCoordinator.setupChangeDetection();
      }
      
      this.tracking = true;
      log('HomeViewController: Tracking started');
      
      // Update UI to reflect tracking state
      this._updateTrackingUI(true);
      
      // Emit tracking started event
      this.document.dispatchEvent(new CustomEvent('homeview:tracking:started', {
        detail: { controller: this }
      }));
    } catch (err) {
      error('HomeViewController: Failed to start tracking:', err);
      throw err;
    }
  }
  
  /**
   * Stops continuous location tracking.
   * 
   * Extracted from WebGeocodingManager (lines 801-806).
   * 
   * Delegates to ServiceCoordinator to stop the GeolocationService tracking.
   * This method can be called to stop tracking when the user toggles off
   * the tracking feature or when cleaning up resources.
   * 
   * @returns {void}
   * 
   * @fires HomeViewController#homeview:tracking:stopped
   * 
   * @example
   * controller.stopTracking();
   */
  stopTracking(): void {
    if (!this.initialized) {
      warn('HomeViewController not initialized');
      return;
    }
    
    if (!this.tracking) {
      warn('HomeViewController: Tracking not started');
      return;
    }
    
    // Always set tracking to false first for fault tolerance
    const wasTracking = this.tracking;
    this.tracking = false;
    
    try {
      // Stop tracking via ServiceCoordinator
      if (this.manager && this.manager.serviceCoordinator && typeof this.manager.serviceCoordinator.stopTracking === 'function') {
        this.manager.serviceCoordinator.stopTracking();
      }
      
      log('HomeViewController: Tracking stopped');
      
      // Update UI to reflect stopped state
      this._updateTrackingUI(false);
      
      // Emit tracking stopped event
      if (wasTracking) {
        this.document.dispatchEvent(new CustomEvent('homeview:tracking:stopped', {
          detail: { controller: this }
        }));
      }
    } catch (err) {
      error('HomeViewController: Failed to stop tracking:', err);
      // Don't throw - stopping tracking should be fault-tolerant
      // tracking flag already set to false above
    }
  }
  
  /**
   * Toggles location tracking on/off.
   * 
   * @returns {void}
   * @throws {Error} If not initialized
   * 
   * @example
   * controller.toggleTracking(); // Start if stopped, stop if started
   */
  toggleTracking(): void {
    if (!this.initialized) {
      throw new Error('HomeViewController not initialized. Call init() first.');
    }
    
    if (this.tracking) {
      this.stopTracking();
    } else {
      this.startTracking();
    }
  }
  
  /**
   * Static factory method for one-step creation and initialization.
   * 
   * @static
   * @async
   * @param {Document} document - Browser document object
   * @param {Object} params - Configuration parameters (see constructor)
   * @returns {Promise<HomeViewController>} Initialized controller instance
   * 
   * @example
   * // Convenient one-step initialization
   * const controller = await HomeViewController.create(document, {...});
   * // Controller is ready to use
   */
  static async create(document: Document, params: HomeViewControllerParams): Promise<HomeViewController> {
    const controller = new HomeViewController(document, params);
    await controller.init();
    return controller;
  }
}

export default HomeViewController;
