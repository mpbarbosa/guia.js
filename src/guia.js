// Import utility modules  
import { calculateDistance, delay } from './utils/distance.js';
import { isMobileDevice } from './utils/device.js';

// Import configuration
import { 
	GUIA_VERSION,
	GUIA_NAME,
	GUIA_AUTHOR,
	createDefaultConfig 
} from './config/defaults.js';

// Import core domain classes
import GeoPosition from './core/GeoPosition.js';
import ObserverSubject from './core/ObserverSubject.js';
import PositionManager from './core/PositionManager.js';

// Import service layer classes
import ReverseGeocoder from './services/ReverseGeocoder.js';
import GeolocationService from './services/GeolocationService.js';
import ChangeDetectionCoordinator from './services/ChangeDetectionCoordinator.js';

// Import data processing layer classes
import BrazilianStandardAddress from './data/BrazilianStandardAddress.js';
import ReferencePlace from './data/ReferencePlace.js';
import AddressExtractor from './data/AddressExtractor.js';
import AddressCache from './data/AddressCache.js';
import AddressDataExtractor from './data/AddressDataExtractor.js';

// Import timing classes
import Chronometer from './timing/Chronometer.js';

// Import HTML classes
import HtmlText from './html/HtmlText.js';
import HTMLPositionDisplayer from './html/HTMLPositionDisplayer.js';
import HTMLReferencePlaceDisplayer from './html/HTMLReferencePlaceDisplayer.js';
import HTMLAddressDisplayer from './html/HTMLAddressDisplayer.js';
import DisplayerFactory from './html/DisplayerFactory.js';

// Application log functions with DOM integration
// Note: Pure logging utilities are available in src/utils/logger.js
// These functions add DOM output to console logging for the web UI
// TODO: Consider refactoring to use observer pattern for DOM updates
const log = (message, ...params) => {
	//get all params after message and concatenate them
	const fullMessage = `[${new Date().toISOString()}] ${message} ${params.join(" ")}`;
	console.log(fullMessage);
	if (typeof document !== "undefined") {
		//TODO: Remover a referência direta ao elemento HTML
		if (document.getElementById("bottom-scroll-textarea")) {
			document.getElementById("bottom-scroll-textarea").innerHTML +=
				`${fullMessage}\n`;
		}
	}
};

const warn = (message, ...params) => {
	console.warn(message, ...params);
	if (typeof document !== "undefined") {
		const logContainer = document.getElementById("bottom-scroll-textarea");
		if (logContainer) {
			logContainer.innerHTML += `${message} ${params.join(" ")}\n`;
		}
	}
};

let IbiraAPIFetchManager;

// Promise that resolves when Ibira.js loading is complete (success or fallback)
const ibiraLoadingPromise = (async () => {
    try {
		// Skip HTTPS imports in Node.js environments (only works in browsers)
		if (typeof window === 'undefined') {
			throw new Error('Node.js environment detected - using fallback');
		}
		
		const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Import timeout')), 5000));
		const importPromise = import('https://cdn.jsdelivr.net/gh/mpbarbosa/ibira.js/src/ibira.js');
        const ibiraModule = await Promise.race([importPromise, timeoutPromise]);

		// Validate the imported module
		if (!ibiraModule || !ibiraModule.IbiraAPIFetchManager) {
			throw new Error('Invalid ibira.js module');
		}
        IbiraAPIFetchManager = ibiraModule.IbiraAPIFetchManager;
        log('(guia.js) Ibira.js loaded successfully');
        return { success: true, manager: IbiraAPIFetchManager };
    } catch (error) {
        warn('(guia.js) Failed to load ibira.js:', error.message);
        // Provide fallback implementation
        IbiraAPIFetchManager = class IbiraAPIFetchManagerFallback {
            constructor(config = {}) {
                warn('Using fallback - ibira.js not available');
                this.config = config;
            }
            // Add basic methods that might be expected
            fetch() {
                return Promise.reject(new Error('Fallback fetch manager - external library not available'));
            }
        };
        return { success: false, manager: IbiraAPIFetchManager };
    }
})();

// Export to window for browser compatibility
if (typeof window !== 'undefined') {
	window.ibiraLoadingPromise = ibiraLoadingPromise;
	// Make log/warn available globally for imported modules
	window.log = log;
	window.warn = warn;
}

// Use configuration from imported module
const guiaVersion = GUIA_VERSION;
const guiaName = GUIA_NAME;
const guiaAuthor = GUIA_AUTHOR;
const setupParams = createDefaultConfig();

const getOpenStreetMapUrl = (latitude, longitude) =>
	`${setupParams.openstreetmapBaseUrl}&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

// Note: calculateDistance, delay, and isMobileDevice now imported from utils modules

// Initialize device-specific accuracy settings
// Mobile devices have GPS and can achieve higher accuracy, so we're stricter
// Desktop devices use WiFi/IP location which is less accurate, so we're more lenient
if (typeof navigator !== 'undefined') {
	const isMobile = isMobileDevice();
	setupParams.notAcceptedAccuracy = isMobile
		? setupParams.mobileNotAcceptedAccuracy
		: setupParams.desktopNotAcceptedAccuracy;
	console.log(`[Device Detection] Type: ${isMobile ? 'Mobile/Tablet' : 'Desktop/Laptop'}`);
	console.log(`[Device Detection] Rejecting accuracy levels: ${setupParams.notAcceptedAccuracy.join(', ')}`);
} else {
	// Default for non-browser environments (e.g., Node.js testing)
	setupParams.notAcceptedAccuracy = setupParams.mobileNotAcceptedAccuracy;
}

// Example usage:
log("Guia.js version:", guiaVersion.toString());

/* ============================
 * Camada de Modelo
 * ============================
 */

// Core domain classes are now imported from src/core/
// - GeoPosition: Immutable geographic position wrapper
// - ObserverSubject: Reusable observer pattern implementation  
// - PositionManager: Singleton position manager with observer pattern

/* ============================
 * Camada de Serviço
 * ============================
 */

// Service layer classes are now imported from src/services/
// - ReverseGeocoder: Reverse geocoding service using OpenStreetMap Nominatim API
// - GeolocationService: Browser Geolocation API wrapper with permission management
// - ChangeDetectionCoordinator: Address component change detection coordinator

class SingletonStatusManager {
	constructor() {
		if (SingletonStatusManager.instance) {
			return SingletonStatusManager.instance;
		}

		this.gettingLocation = false;
		SingletonStatusManager.instance = this;
	}

	isGettingLocation() {
		return this.gettingLocation;
	}

	setGettingLocation(status) {
		this.gettingLocation = status;
		if (status) {
			console.log("Getting location...");
		} else {
			console.log("Stopped getting location.");
		}
	}

	setGettingLocation(status) {
		this.gettingLocation = status;
	}

	static getInstance() {
		this.instance = this.instance || new SingletonStatusManager();
		return this.instance;
	}
}

// BrazilianStandardAddress - Extracted to src/data/BrazilianStandardAddress.js

// ReferencePlace - Extracted to src/data/ReferencePlace.js

// Chronometer - Extracted to src/timing/Chronometer.js

// HtmlText - Extracted to src/html/HtmlText.js

// HTMLPositionDisplayer - Extracted to src/html/HTMLPositionDisplayer.js

// HTMLReferencePlaceDisplayer - Extracted to src/html/HTMLReferencePlaceDisplayer.js

// HTMLAddressDisplayer - Extracted to src/html/HTMLAddressDisplayer.js

// DisplayerFactory - Extracted to src/html/DisplayerFactory.js

// AddressExtractor - Extracted to src/data/AddressExtractor.js
// AddressCache - Extracted to src/data/AddressCache.js  
// AddressDataExtractor - Extracted to src/data/AddressDataExtractor.js

/* ============================
 * Camada de Serviço - Continuação
 * ============================
 */

/**
 * Main coordination class for geocoding workflow in the Guia.js application.
 * 
 * WebGeocodingManager orchestrates the geolocation services, geocoding operations,
 * and UI updates for displaying location-based information. It follows the Coordinator
 * pattern, managing communication between services (GeolocationService, ReverseGeocoder)
 * and displayers (HTML displayers for position, address, and reference places).
 * 
 * **Architecture Pattern**: Coordinator/Mediator
 * - Coordinates between geolocation services and UI displayers
 * - Manages observer subscriptions between components
 * - Handles change detection callbacks for address components
 * 
 * **Responsibilities**:
 * - Initialize and coordinate geocoding services
 * - Set up observer relationships between components
 * - Manage UI element initialization and event handlers
 * - Coordinate address change detection (logradouro, bairro, municipio)
 * - Provide observer pattern implementation for external consumers
 * 
 * **Design Principles Applied**:
 * - **Single Responsibility**: Focuses on coordinating geocoding workflow
 * - **Dependency Injection**: Receives document and configuration via constructor
 * - **Observer Pattern**: Implements subject/observer for state changes
 * - **Immutability**: Uses Object.freeze on created displayers
 * 
 * @class WebGeocodingManager
 * @see {@link PositionManager} For position state management
 * @see {@link ReverseGeocoder} For geocoding API integration
 * @see {@link GeolocationService} For browser geolocation API
 * @since 0.5.0-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * const manager = new WebGeocodingManager(document, {
 *   locationResult: 'location-result',
 *   enderecoPadronizadoDisplay: 'address-display',
 *   referencePlaceDisplay: 'reference-place'
 * });
 * manager.startTracking();
 */

/**
 * Default configuration for DOM element IDs used by WebGeocodingManager.
 * 
 * This configuration object provides a single source of truth for all element IDs
 * required by WebGeocodingManager. It can be overridden by passing a custom
 * elementIds object in the constructor params.
 * 
 * @constant {Object}
 * @property {string} chronometer - ID for chronometer display element
 * @property {string} findRestaurantsBtn - ID for find restaurants button
 * @property {string} cityStatsBtn - ID for city statistics button
 * @property {string} timestampDisplay - ID for timestamp display element
 * @property {Object} speechSynthesis - IDs for speech synthesis UI elements
 * @property {string} speechSynthesis.languageSelectId - ID for language selection dropdown
 * @property {string} speechSynthesis.voiceSelectId - ID for voice selection dropdown
 * @property {string} speechSynthesis.textInputId - ID for text input field
 * @property {string} speechSynthesis.speakBtnId - ID for speak button
 * @property {string} speechSynthesis.pauseBtnId - ID for pause button
 * @property {string} speechSynthesis.resumeBtnId - ID for resume button
 * @property {string} speechSynthesis.stopBtnId - ID for stop button
 * @property {string} speechSynthesis.rateInputId - ID for rate input slider
 * @property {string} speechSynthesis.rateValueId - ID for rate value display
 * @property {string} speechSynthesis.pitchInputId - ID for pitch input slider
 * @property {string} speechSynthesis.pitchValueId - ID for pitch value display
 */
const DEFAULT_ELEMENT_IDS = {
	chronometer: "chronometer",
	findRestaurantsBtn: "find-restaurants-btn",
	cityStatsBtn: "city-stats-btn",
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
};
Object.freeze(DEFAULT_ELEMENT_IDS.speechSynthesis);
Object.freeze(DEFAULT_ELEMENT_IDS);

class WebGeocodingManager {
	/**
	 * Creates a new WebGeocodingManager instance after waiting for Ibira.js to load.
	 * 
	 * @param {Document} document - The document object for DOM manipulation
	 * @param {Object} params - Configuration parameters for the manager
	 * @returns {Promise<WebGeocodingManager>} Promise that resolves to the manager instance
	 * 
	 * @example
	 * // Usage with await
	 * const manager = await WebGeocodingManager.createAsync(document, params);
	 * 
	 * // Usage with then
	 * WebGeocodingManager.createAsync(document, params)
	 *   .then(manager => {
	 *     // Use manager here
	 *   });
	 */
	static async createAsync(document, params) {
		// Wait for Ibira.js loading to complete
		await window.ibiraLoadingPromise;
		log('(WebGeocodingManager) Ibira.js loading complete, creating manager');
		return new WebGeocodingManager(document, params);
	}

	/**
	 * Creates a new WebGeocodingManager instance.
	 * 
	 * Initializes the coordination layer for geocoding services, creates service
	 * instances, sets up displayers, and establishes observer relationships between
	 * components. The constructor follows dependency injection pattern by receiving
	 * document and configuration parameters.
	 * 
	 * **Initialization Steps**:
	 * 1. Store document reference and configuration
	 * 2. Initialize observer subject for external subscribers
	 * 3. Initialize DOM elements and event handlers
	 * 4. Create geolocation and geocoding services
	 * 5. Create and wire up UI displayers
	 * 6. Establish observer relationships
	 * 
	 * @param {Document} document - DOM document object for element access
	 * @param {Object} params - Configuration parameters
	 * @param {string} params.locationResult - ID of element to display location results
	 * @param {string} [params.enderecoPadronizadoDisplay] - ID of element for standardized address display
	 * @param {string} [params.referencePlaceDisplay] - ID of element for reference place display
	 * @param {Object} [params.elementIds] - Optional custom element IDs (defaults to DEFAULT_ELEMENT_IDS)
	 * @param {Object} [params.displayerFactory] - Optional factory for creating displayers (defaults to DisplayerFactory)
	 * @param {GeolocationService} [params.geolocationService] - Optional GeolocationService instance (defaults to new GeolocationService)
	 * @param {ReverseGeocoder} [params.reverseGeocoder] - Optional ReverseGeocoder instance (defaults to new ReverseGeocoder)
	 * 
	 * @throws {TypeError} If document is null or undefined
	 * @throws {TypeError} If params.locationResult is not provided
	 * 
	 * @example
	 * // Default behavior (backward compatible)
	 * const manager = new WebGeocodingManager(document, {
	 *   locationResult: 'location-result'
	 * });
	 * 
	 * @example
	 * // With custom/configured services
	 * const customGeocoder = new ReverseGeocoder();
	 * customGeocoder.configure({ provider: 'mapbox', timeout: 5000 });
	 * 
	 * const manager = new WebGeocodingManager(document, {
	 *   locationResult: 'location-result',
	 *   reverseGeocoder: customGeocoder
	 * });
	 * 
	 * @example
	 * // For testing with mocks
	 * const mockGeocoder = {
	 *   subscribe: jest.fn(),
	 *   currentAddress: mockAddress,
	 *   enderecoPadronizado: mockStandardAddress
	 * };
	 * 
	 * const manager = new WebGeocodingManager(document, {
	 *   locationResult: 'location-result',
	 *   reverseGeocoder: mockGeocoder
	 * });
	 */
	constructor(document, params) {
		// Store dependencies
		this.document = document;
		this.locationResult = params.locationResult;
		this.enderecoPadronizadoDisplay = params.enderecoPadronizadoDisplay || null;
		this.referencePlaceDisplay = params.referencePlaceDisplay || null;

		// Store element IDs configuration (frozen to prevent mutations)
		this.elementIds = params.elementIds || DEFAULT_ELEMENT_IDS;
		Object.freeze(this.elementIds);

		// Store displayer factory (enables dependency injection for testing)
		this.displayerFactory = params.displayerFactory || DisplayerFactory;

		// Initialize observer subject for external subscribers
		this.observerSubject = new ObserverSubject();

		// Initialize state
		this.currentPosition = null;
		this.currentCoords = null;

		// Initialize DOM elements and event handlers
		this._initializeUIElements();

		// Inject services or create defaults (maintains backward compatibility)
		this.geolocationService = params.geolocationService ||
			new GeolocationService(this.locationResult);
		
		// Create fetch manager - IbiraAPIFetchManager should be loaded by now
		const fetchManager = new IbiraAPIFetchManager({
			maxCacheSize: 100,           // Maximum cache entries
			cacheExpiration: 300000,     // 5 minutes cache expiration
			cleanupInterval: 60000,      // Cleanup every minute
			maxRetries: 3,               // Default retry attempts
			retryDelay: 1000,            // Initial retry delay
			retryMultiplier: 2           // Exponential backoff
		});
		log('(WebGeocodingManager) Using IbiraAPIFetchManager');
		this.reverseGeocoder = params.reverseGeocoder ||
			new ReverseGeocoder(fetchManager);

		// Create change detection coordinator
		this.changeDetectionCoordinator = new ChangeDetectionCoordinator({
			reverseGeocoder: this.reverseGeocoder,
			observerSubject: this.observerSubject
		});

		// Create and configure displayers
		this._createDisplayers();
		this._wireObservers();
		log("(WebGeocodingManager) Initialized successfully.");
	}

	/**
	 * Creates UI displayer components using the configured factory.
	 * 
	 * Uses the displayerFactory (injected via constructor or default) to instantiate
	 * the three main displayers for position, address, and reference place.
	 * This design enables dependency injection for testing and alternative implementations.
	 * 
	 * @private
	 * @since 0.8.6-alpha - Updated to use factory pattern
	 */
	_createDisplayers() {
		this.positionDisplayer = this.displayerFactory.createPositionDisplayer(
			this.locationResult
		);
		this.addressDisplayer = this.displayerFactory.createAddressDisplayer(
			this.locationResult,
			this.enderecoPadronizadoDisplay
		);
		this.referencePlaceDisplayer = this.displayerFactory.createReferencePlaceDisplayer(
			this.referencePlaceDisplay
		);
	}

	/**
	 * Establishes observer relationships between components.
	 * 
	 * Wires up the observer pattern connections:
	 * - PositionManager notifies positionDisplayer and reverseGeocoder
	 * - ReverseGeocoder notifies referencePlaceDisplayer and addressDisplayer
	 * 
	 * This centralized wiring makes the observer relationships explicit and
	 * easier to understand and modify.
	 * 
	 * @private
	 */
	_wireObservers() {
		// Position updates flow to displayer and geocoder
		PositionManager.getInstance().subscribe(this.positionDisplayer);
		PositionManager.getInstance().subscribe(this.reverseGeocoder);

		// Geocoding results flow to reference place and address displayers
		//this.reverseGeocoder.subscribe(this.referencePlaceDisplayer);
		//this.reverseGeocoder.subscribe(this.addressDisplayer);
	}

	/**
	 * Initializes DOM elements and sets up event handlers.
	 * 
	 * This method handles all DOM-related initialization:
	 * - Chronometer display
	 * - Action buttons (restaurants, city stats)
	 * - Timestamp display
	 * 
	 * Each element is checked for existence before initialization to handle
	 * cases where certain UI elements may not be present in all contexts.
	 * 
	 * @private
	 */
	_initializeUIElements() {
		this._initializeChronometer();
		this._initializeActionButtons();
		this._initializeTimestampDisplay();
	}

	/**
	 * Initializes chronometer element if present.
	 * @private
	 */
	_initializeChronometer() {
		const chronometerElement = this.document.getElementById(this.elementIds.chronometer);
		if (chronometerElement) {
			this.chronometer = new Chronometer(chronometerElement);
			PositionManager.getInstance().subscribe(this.chronometer);
		} else {
			console.warn("Chronometer element not found.");
		}
	}

	/**
	 * Initializes action buttons (restaurants, city stats) and their event handlers.
	 * @private
	 */
	_initializeActionButtons() {
		this._initializeFindRestaurantsButton();
		this._initializeCityStatsButton();
	}

	/**
	 * Initializes find restaurants button and its click handler.
	 * @private
	 */
	_initializeFindRestaurantsButton() {
		this.findRestaurantsBtn = this.document.getElementById(this.elementIds.findRestaurantsBtn);
		if (this.findRestaurantsBtn) {
			this.findRestaurantsBtn.addEventListener("click", () => {
				this._handleFindRestaurantsClick();
			});
		} else {
			console.warn("Find Restaurants button not found.");
		}
	}

	/**
	 * Handles click event for find restaurants button.
	 * @private
	 */
	_handleFindRestaurantsClick() {
		if (this.currentCoords) {
			findNearbyRestaurants(
				this.currentCoords.latitude,
				this.currentCoords.longitude
			);
		} else {
			alert("Current coordinates not available.");
		}
	}

	/**
	 * Initializes city stats button and its click handler.
	 * @private
	 */
	_initializeCityStatsButton() {
		this.cityStatsBtn = this.document.getElementById(this.elementIds.cityStatsBtn);
		if (this.cityStatsBtn) {
			this.cityStatsBtn.addEventListener("click", () => {
				this._handleCityStatsClick();
			});
		} else {
			console.warn("City Stats button not found.");
		}
	}

	/**
	 * Handles click event for city stats button.
	 * @private
	 */
	_handleCityStatsClick() {
		if (this.currentCoords) {
			fetchCityStatistics(
				this.currentCoords.latitude,
				this.currentCoords.longitude
			);
		} else {
			alert("Current coordinates not available.");
		}
	}

	/**
	 * Initializes timestamp display element.
	 * @private
	 */
	_initializeTimestampDisplay() {
		this.tsPosCapture = this.document.getElementById(this.elementIds.timestampDisplay);
		if (this.tsPosCapture) {
			this.tsPosCapture.textContent = new Date().toLocaleString();
			this.posCaptureHtmlText = new HtmlText(this.document, this.tsPosCapture);
			PositionManager.getInstance().subscribe(this.posCaptureHtmlText);
			Object.freeze(this.posCaptureHtmlText);
		} else {
			console.warn("tsPosCapture element not found.");
		}
	}

	/**
	 * Legacy method for backward compatibility.
	 * @deprecated Use _initializeUIElements() instead
	 * @private
	 */
	initElements() {
		this._initializeUIElements();
	}

	initElements() {
		let chronometer = this.document.getElementById(this.elementIds.chronometer);
		if (chronometer) {
			this.chronometer = new Chronometer(chronometer);
			PositionManager.getInstance().subscribe(this.chronometer);
		} else {
			console.warn("Chronometer element not found.");
		}

		this.findRestaurantsBtn = this.document.getElementById(this.elementIds.findRestaurantsBtn);
		if (this.findRestaurantsBtn) {
			this.findRestaurantsBtn.addEventListener("click", () => {
				if (this.currentCoords) {
					findNearbyRestaurants(
						this.currentCoords.latitude,
						this.currentCoords.longitude,
					);
				} else {
					alert("Current coordinates not available.");
				}
			});
		} else {
			console.warn("Find Restaurants button not found.");
		}

		this.cityStatsBtn = this.document.getElementById(this.elementIds.cityStatsBtn);
		if (this.cityStatsBtn) {
			this.cityStatsBtn.addEventListener("click", () => {
				if (this.currentCoords) {
					fetchCityStatistics(
						this.currentCoords.latitude,
						this.currentCoords.longitude,
					);
				} else {
					alert("Current coordinates not available.");
				}
			});
		} else {
			console.warn("City Stats button not found.");
		}

		this.tsPosCapture = this.document.getElementById(this.elementIds.timestampDisplay);
		if (this.tsPosCapture) {
			this.tsPosCapture.textContent = new Date().toLocaleString();
			this.posCaptureHtmlText = new HtmlText(this.document, this.tsPosCapture);
			PositionManager.getInstance().subscribe(this.posCaptureHtmlText);
			Object.freeze(this.posCaptureHtmlText); // Prevent further modification
		} else {
			console.warn("tsPosCapture element not found.");
		}
	}

	/**
	 * Gets the observers array for backward compatibility.
	 * 
	 * Provides access to the internal observer list. This is a read-only
	 * getter that delegates to the ObserverSubject.
	 * 
	 * @private
	 * @returns {Array} Array of subscribed observers
	 */
	get observers() {
		return this.observerSubject.observers;
	}

	/**
	 * Gets the function observers array for backward compatibility.
	 * 
	 * Provides access to the internal function observer list. This is a
	 * read-only getter that delegates to the ObserverSubject.
	 * 
	 * @private
	 * @returns {Array} Array of subscribed function observers
	 */
	get functionObservers() {
		return this.observerSubject.functionObservers;
	}

	/**
	 * Subscribes an observer to receive notifications about position and address changes.
	 * 
	 * Observers must implement an update(posEvent, currentAddress, enderecoPadronizado)
	 * method to receive notifications. Null observers are rejected with a warning.
	 * 
	 * @param {Object} observer - Observer object with update() method
	 * @param {Function} observer.update - Method called when notifications occur
	 * @returns {void}
	 * 
	 * @example
	 * const myObserver = {
	 *   update: (pos, addr, endPad) => {
	 *     console.log('Position changed:', pos);
	 *   }
	 * };
	 * manager.subscribe(myObserver);
	 */
	subscribe(observer) {
		if (observer == null) {
			console.warn(
				"(WebGeocodingManager) Attempted to subscribe a null observer.",
			);
			return;
		}
		this.observerSubject.subscribe(observer);
	}

	/**
	 * Unsubscribes an observer from receiving notifications.
	 * 
	 * @param {Object} observer - Observer object to unsubscribe
	 * @returns {void}
	 */
	unsubscribe(observer) {
		this.observerSubject.unsubscribe(observer);
	}

	/**
	 * Notifies all subscribed observers about current position and address.
	 * 
	 * Sends current position, raw address, and standardized address to all
	 * observers that have been subscribed via subscribe() method.
	 * 
	 * @returns {void}
	 */
	notifyObservers() {
		this.observerSubject.notifyObservers(
			this.currentPosition,
			this.reverseGeocoder.currentAddress,
			this.reverseGeocoder.enderecoPadronizado
		);
	}

	/**
	 * Subscribes a function to receive notifications about position and address changes.
	 * 
	 * Function observers receive (position, currentAddress, enderecoPadronizado, changeDetails)
	 * as parameters. This provides an alternative to the observer object pattern.
	 * 
	 * @param {Function} observerFunction - Function to call on notifications
	 * @returns {void}
	 * 
	 * @example
	 * manager.subscribeFunction((pos, addr, endPad, details) => {
	 *   console.log('Address changed:', endPad.enderecoCompleto());
	 * });
	 */
	subscribeFunction(observerFunction) {
		if (observerFunction == null) {
			console.warn(
				"(WebGeocodingManager) Attempted to subscribe a null observer function.",
			);
			return;
		}
		console.log(
			`(WebGeocodingManager) observer function ${observerFunction} subscribing ${this}`,
		);
		this.observerSubject.subscribeFunction(observerFunction);
	}

	/**
	 * Unsubscribes a function observer from receiving notifications.
	 * 
	 * @param {Function} observerFunction - Function observer to unsubscribe
	 * @returns {void}
	 */
	unsubscribeFunction(observerFunction) {
		this.observerSubject.unsubscribeFunction(observerFunction);
	}

	/**
	 * Gets the current Brazilian standardized address.
	 * 
	 * Returns the standardized address object from the reverse geocoder,
	 * which contains formatted Brazilian address components.
	 * 
	 * @returns {BrazilianStandardAddress|null} Standardized address or null if not yet geocoded
	 */
	getBrazilianStandardAddress() {
		return this.reverseGeocoder.enderecoPadronizado;
	}

	/**
	 * Initializes speech synthesis UI components.
	 * 
	 * Creates and configures the HTML speech synthesis displayer with configured
	 * element IDs for voice controls. Subscribes the displayer to both reverse
	 * geocoder and manager notifications, then freezes it to prevent modifications.
	 * 
	 * This method should be called after the relevant DOM elements are available.
	 * Element IDs can be customized via the elementIds configuration in constructor.
	 * 
	 * @returns {void}
	 */
	initSpeechSynthesis() {
		this.htmlSpeechSynthesisDisplayer = new HtmlSpeechSynthesisDisplayer(
			this.document,
			this.elementIds.speechSynthesis,
		);
		this.reverseGeocoder.subscribe(this.htmlSpeechSynthesisDisplayer);
		this.subscribe(this.htmlSpeechSynthesisDisplayer);
		Object.freeze(this.htmlSpeechSynthesisDisplayer);
	}

	/**
	 * Notifies all function observers about current state.
	 * 
	 * Calls each subscribed function observer with current position, address,
	 * and standardized address. This is a convenience method for manual
	 * notification of function observers.
	 * 
	 * @returns {void}
	 */
	notifyFunctionObservers() {
		for (const fn of this.functionObservers) {
			fn(
				this.currentPosition,
				this.reverseGeocoder.currentAddress,
				this.reverseGeocoder.enderecoPadronizado,
			);
		}
	}

	/**
	 * Gets a single location update from the geolocation service.
	 * 
	 * Requests current position from the GeolocationService, performs reverse
	 * geocoding on the coordinates, and notifies observers. This is typically
	 * used for initial position acquisition or manual position refresh.
	 * 
	 * **Workflow**:
	 * 1. Request single location update from GeolocationService
	 * 2. If successful, store position and trigger reverse geocoding
	 * 3. Process geocoding results and standardize address
	 * 4. Notify all observers with new position and address
	 * 
	 * @returns {void}
	 * 
	 * @fires ReverseGeocoder#notifyObservers - When geocoding completes
	 * @fires WebGeocodingManager#notifyFunctionObservers - After geocoding completes
	 */
	getSingleLocationUpdate() {
		this.geolocationService
			.getSingleLocationUpdate()
			.then((position) => {
				if (position && position.coords) {
					this.currentPosition = position;
					this.changeDetectionCoordinator.setCurrentPosition(position);
					this.reverseGeocoder.latitude = position.coords.latitude;
					this.reverseGeocoder.longitude = position.coords.longitude;
					return this.reverseGeocoder.reverseGeocode();
				} else {
					return null;
				}
			})
			.then((addressData) => {
				this.reverseGeocoder.currentAddress = addressData;
				this.reverseGeocoder.enderecoPadronizado =
					AddressDataExtractor.getBrazilianStandardAddress(addressData);
				this.reverseGeocoder.notifyObservers();
				this.notifyFunctionObservers();
			})
			.catch((error) => {
				displayError(error);
			});
	}

	/**
	 * Starts continuous location tracking and initializes all monitoring systems.
	 * 
	 * This is the main entry point for starting the geocoding workflow. It:
	 * 1. Initializes speech synthesis UI
	 * 2. Gets initial location update
	 * 3. Starts continuous position watching
	 * 4. Registers callbacks for address component change detection
	 * 
	 * The method sets up the complete tracking infrastructure including
	 * logradouro, bairro, and municipio change detection callbacks that
	 * will be triggered automatically when address components change.
	 * 
	 * @returns {void}
	 * 
	 * @example
	 * const manager = new WebGeocodingManager(document, {
	 *   locationResult: 'location-result'
	 * });
	 * manager.startTracking(); // Begins continuous tracking
	 */
	startTracking() {
		// Initialize speech synthesis UI components
		this.initSpeechSynthesis();

		// Get initial location (immediate update)
		// Note: Permission check is commented out but available for future use
		// this.geolocationService.checkPermissions().then((value) => {
		this.getSingleLocationUpdate();
		// });

		// Start continuous position watching
		let watchId = this.geolocationService.watchCurrentLocation();

		// Set up address component change detection callbacks via coordinator
		this.changeDetectionCoordinator.setupChangeDetection();
	}

	/**
	 * Sets up logradouro (street) change detection using callback mechanism.
	 * Delegates to ChangeDetectionCoordinator.
	 * 
	 * @deprecated Use changeDetectionCoordinator.setupLogradouroChangeDetection() instead
	 * @returns {void}
	 */
	setupLogradouroChangeDetection() {
		this.changeDetectionCoordinator.setupLogradouroChangeDetection();
	}

	/**
	 * Removes the logradouro change detection callback.
	 * Delegates to ChangeDetectionCoordinator.
	 * 
	 * @deprecated Use changeDetectionCoordinator.removeLogradouroChangeDetection() instead
	 * @returns {void}
	 */
	removeLogradouroChangeDetection() {
		this.changeDetectionCoordinator.removeLogradouroChangeDetection();
	}

	/**
	 * Sets up bairro (neighborhood) change detection using callback mechanism.
	 * Delegates to ChangeDetectionCoordinator.
	 * 
	 * @deprecated Use changeDetectionCoordinator.setupBairroChangeDetection() instead
	 * @returns {void}
	 */
	setupBairroChangeDetection() {
		this.changeDetectionCoordinator.setupBairroChangeDetection();
	}

	/**
	 * Removes the bairro change detection callback.
	 * Delegates to ChangeDetectionCoordinator.
	 * 
	 * @deprecated Use changeDetectionCoordinator.removeBairroChangeDetection() instead
	 * @returns {void}
	 */
	removeBairroChangeDetection() {
		this.changeDetectionCoordinator.removeBairroChangeDetection();
	}

	/**
	 * Sets up municipio (municipality/city) change detection using callback mechanism.
	 * Delegates to ChangeDetectionCoordinator.
	 * 
	 * @deprecated Use changeDetectionCoordinator.setupMunicipioChangeDetection() instead
	 * @returns {void}
	 */
	setupMunicipioChangeDetection() {
		this.changeDetectionCoordinator.setupMunicipioChangeDetection();
	}

	/**
	 * Removes the municipio change detection callback.
	 * Delegates to ChangeDetectionCoordinator.
	 * 
	 * @deprecated Use changeDetectionCoordinator.removeMunicipioChangeDetection() instead
	 * @returns {void}
	 */
	removeMunicipioChangeDetection() {
		this.changeDetectionCoordinator.removeMunicipioChangeDetection();
	}

	/**
	 * Returns a string representation of this WebGeocodingManager instance.
	 * 
	 * Provides a human-readable representation showing the class name and
	 * current coordinates (if available). Useful for logging and debugging.
	 * 
	 * @returns {string} String representation with coordinates or "N/A"
	 * 
	 * @example
	 * console.log(manager.toString());
	 * // Output: "WebGeocodingManager: -23.5505, -46.6333"
	 */
	toString() {
		return `${this.constructor.name}: ${this.currentCoords ? this.currentCoords.latitude : "N/A"}, ${this.currentCoords ? this.currentCoords.longitude : "N/A"}`;
	}
}

/**
 * Speech synthesis queue item for managing text-to-speech requests with priority support.
 * 
 * This class represents individual items in the speech synthesis queue, providing
 * priority-based ordering and automatic expiration to prevent stale speech requests
 * from being processed. Each item contains text content, priority level, and timestamp.
 * 
 * @class SpeechItem
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class SpeechItem {
	/**
	 * Creates a new speech queue item.
	 * 
	 * @param {string} text - Text content to be spoken
	 * @param {number} [priority=0] - Priority level (higher values = higher priority)
	 * @param {number} [timestamp=Date.now()] - Creation timestamp for expiration tracking
	 */
	constructor(text, priority = 0, timestamp = Date.now()) {
		this.text = text;
		this.priority = priority;
		this.timestamp = timestamp;
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	/**
	 * Checks if this speech item has expired based on the configured expiration time.
	 * 
	 * @param {number} expirationMs - Expiration time in milliseconds
	 * @returns {boolean} True if the item has expired
	 */
	isExpired(expirationMs = 30000) { // 30 seconds default
		return Date.now() - this.timestamp > expirationMs;
	}

	toString() {
		return `${this.constructor.name}: "${this.text}" (priority: ${this.priority})`;
	}
}

/**
 * Priority-based speech synthesis queue with automatic cleanup of expired items.
 * 
 * This class manages a queue of speech requests with priority ordering and automatic
 * expiration of old items to prevent memory leaks and ensure fresh speech content.
 * Higher priority items are processed first, and items are automatically removed
 * if they exceed the configured expiration time.
 * 
 * @class SpeechQueue
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class SpeechQueue {
	/**
	 * Creates a new speech queue.
	 * 
	 * @param {number} [maxSize=100] - Maximum number of items in queue
	 * @param {number} [expirationMs=30000] - Item expiration time in milliseconds
	 */
	constructor(maxSize = 100, expirationMs = 30000) {
		this.items = [];
		this.maxSize = maxSize;
		this.expirationMs = expirationMs;
		this.observerSubject = new ObserverSubject();
	}

	/**
	 * Gets the observers array for backward compatibility.
	 * @private
	 * @returns {Array} Array of subscribed observers
	 */
	get observers() {
		return this.observerSubject.observers;
	}

	/**
	 * Gets the function observers array for backward compatibility.
	 * @private
	 * @returns {Array} Array of subscribed function observers
	 */
	get functionObservers() {
		return this.observerSubject.functionObservers;
	}

	subscribe(observer) {
		if (observer == null) {
			console.warn("(SpeechQueue) Attempted to subscribe a null observer.");
			return;
		}
		this.observerSubject.subscribe(observer);
	}

	unsubscribe(observer) {
		this.observerSubject.unsubscribe(observer);
	}

	notifyObservers() {
		this.observerSubject.notifyObservers(this);
	}

	subscribeFunction(observerFunction) {
		if (observerFunction == null) {
			console.warn("(SpeechQueue) Attempted to subscribe a null observer function.");
			return;
		}
		this.observerSubject.subscribeFunction(observerFunction);
	}

	unsubscribeFunction(observerFunction) {
		if (observerFunction == null) {
			console.warn("(SpeechQueue) Attempted to unsubscribe a null observer function.");
			return;
		}
		this.observerSubject.unsubscribeFunction(observerFunction);
	}

	notifyFunctionObservers() {
		this.observerSubject.functionObservers.forEach((fn) => {
			fn(this);
		});
	}

	/**
	 * Adds a new speech item to the queue with priority ordering.
	 * 
	 * @param {string} text - Text to be spoken
	 * @param {number} [priority=0] - Priority level
	 */
	enqueue(text, priority = 0) {
		// Clean expired items first
		this.cleanExpired();

		// Create new item
		const item = new SpeechItem(text, priority);

		// Find insertion point to maintain priority order (higher priority first)
		let insertIndex = 0;
		for (let i = 0; i < this.items.length; i++) {
			if (this.items[i].priority < priority) {
				insertIndex = i;
				break;
			}
			insertIndex = i + 1;
		}

		// Insert item at correct position
		this.items.splice(insertIndex, 0, item);

		// Enforce size limit
		if (this.items.length > this.maxSize) {
			this.items = this.items.slice(0, this.maxSize);
		}

		this.notifyObservers();
		this.notifyFunctionObservers();

	}

	/**
	 * Removes and returns the highest priority item from the queue.
	 * 
	 * @returns {SpeechItem|null} Next speech item or null if queue is empty
	 */
	dequeue() {
		// Clean expired items first
		this.cleanExpired();

		// Return first item (highest priority due to ordering in enqueue)
		const item = this.items.shift();

		this.notifyObservers();
		this.notifyFunctionObservers();

		return item || null;
	}

	/**
	 * Checks if the queue is empty after cleaning expired items.
	 * 
	 * @returns {boolean} True if queue has no valid items
	 */
	isEmpty() {
		this.cleanExpired();
		return this.items.length === 0;
	}

	/**
	 * Gets the current size of the queue after cleaning expired items.
	 * 
	 * @returns {number} Number of valid items in queue
	 */
	size() {
		this.cleanExpired();
		return this.items.length;
	}

	/**
	 * Removes expired items from the queue.
	 * 
	 * @private
	 */
	cleanExpired() {
		const originalSize = this.items.length;
		this.items = this.items.filter(item => !item.isExpired(this.expirationMs));

		const removedCount = originalSize - this.items.length;
		if (removedCount > 0) {
			log(`(SpeechQueue) Removed ${removedCount} expired items`);
		}
	}

	/**
	 * Clears all items from the queue.
	 */
	clear() {
		this.items = [];
	}
}

/**
 * Manages Web Speech API synthesis with queue-based processing and voice configuration.
 * 
 * This class provides a comprehensive speech synthesis system with priority-based queuing,
 * voice selection, rate and pitch control, and robust error handling. It implements both
 * immediate speech and queued processing for managing multiple speech requests efficiently.
 * 
 * @class SpeechSynthesisManager
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class SpeechSynthesisManager {
	constructor() {
		this.synth = window.speechSynthesis;
		this.voices = [];
		this.voice = null;
		this.rate = 1.0;
		this.pitch = 1.0;
		this.isCurrentlySpeaking = false;
		this.speechQueue = new SpeechQueue();
		this.queueTimer = null;
		this.independentQueueTimerInterval = setupParams.independentQueueTimerInterval;
		this.voiceRetryTimer = null;
		this.voiceRetryAttempts = 0;
		this.maxVoiceRetryAttempts = 10;
		this.voiceRetryInterval = 1000; // 1 second
		this.loadVoices();
	}

	/**
	 * Loads available voices and selects default Portuguese voice.
	 * Prioritizes Brazilian Portuguese (pt-BR) voices for target users.
	 * Includes retry mechanism to keep trying if Brazilian Portuguese voice is not immediately available.
	 */
	loadVoices() {
		const updateVoices = () => {
			this.voices = this.synth.getVoices();

			// PRIORITY 1: Try to find Brazilian Portuguese voice (pt-BR)
			let portugueseVoice = this.voices.find(voice =>
				voice.lang && voice.lang.toLowerCase() === 'pt-br'
			);

			// PRIORITY 2: If pt-BR not found, try any other Portuguese voice (pt, pt-PT, etc.)
			if (!portugueseVoice) {
				portugueseVoice = this.voices.find(voice =>
					voice.lang && voice.lang.toLowerCase().startsWith('pt')
				);
			}

			this.voice = portugueseVoice || this.voices[0] || null;

			// If Brazilian Portuguese voice was found, stop retry timer
			if (portugueseVoice && portugueseVoice.lang.toLowerCase() === 'pt-br') {
				this.stopVoiceRetryTimer();
			}
			// If no Brazilian Portuguese voice found and voices are available, start retry mechanism
			else if (this.voices.length > 0 && !this.voiceRetryTimer && this.voiceRetryAttempts < this.maxVoiceRetryAttempts) {
				this.startVoiceRetryTimer();
			}
		};
		// Always update voices immediately in case they're already loaded
		updateVoices();
		// Listen for voiceschanged event to update when voices are loaded asynchronously
		if (typeof window !== "undefined" && window.speechSynthesis) {
			window.speechSynthesis.onvoiceschanged = updateVoices;
		}
	}

	/**
	 * Starts the retry timer to periodically check for Brazilian Portuguese voice.
	 */
	startVoiceRetryTimer() {
		if (this.voiceRetryTimer) return;

		this.voiceRetryTimer = setInterval(() => {
			this.voiceRetryAttempts++;

			// Check for Brazilian Portuguese voice
			const voices = this.synth.getVoices();
			const brazilianVoice = voices.find(voice =>
				voice.lang && voice.lang.toLowerCase() === 'pt-br'
			);

			if (brazilianVoice) {
				this.voice = brazilianVoice;
				this.stopVoiceRetryTimer();
			} else if (this.voiceRetryAttempts >= this.maxVoiceRetryAttempts) {
				this.stopVoiceRetryTimer();
			}
		}, this.voiceRetryInterval);
	}

	/**
	 * Stops the voice retry timer.
	 */
	stopVoiceRetryTimer() {
		if (this.voiceRetryTimer) {
			clearInterval(this.voiceRetryTimer);
			this.voiceRetryTimer = null;
		}
	}

	/**
	 * Sets the speech synthesis voice.
	 * 
	 * @param {SpeechSynthesisVoice} voice - Voice to use for synthesis
	 */
	setVoice(voice) {
		this.voice = voice;
	}

	/**
	 * Sets the speech rate (speed).
	 * 
	 * @param {number} rate - Speech rate (0.1 to 10, default 1.0)
	 */
	setRate(rate) {
		this.rate = Math.max(0.1, Math.min(10, rate));
	}

	/**
	 * Sets the speech pitch.
	 * 
	 * @param {number} pitch - Speech pitch (0 to 2, default 1.0)
	 */
	setPitch(pitch) {
		this.pitch = Math.max(0, Math.min(2, pitch));
	}

	/**
	 * Primary entry point for adding text-to-speech requests to the speech synthesis system.
	 * 
	 * Implements a clean three-step process: input validation, queue management, and conditional 
	 * processing initiation. This method serves as the public interface for all speech requests,
	 * handling both immediate processing and queued batch processing scenarios through intelligent
	 * state management and priority-based queue operations.
	 * 
	 * @param {string} text - Text content to be spoken by the speech synthesis system
	 * @param {number} [priority=0] - Priority level for queue positioning (higher values = higher priority)
	 * @returns {void}
	 * 
	 * @example
	 * // Basic speech request with default priority
	 * speechManager.speak("Welcome to the application", 0);
	 * 
	 * @example  
	 * // High priority urgent message (jumps ahead in queue)
	 * speechManager.speak("Emergency alert", 2);
	 * 
	 * @since 0.8.3-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	speak(text, priority = 0) {
		log("+++ (600) (SpeechSynthesisManager) Speak: ", text);
		// STEP 1: Input Validation - Robust validation prevents empty/whitespace content
		if (!text || text.trim() === "") {
			warn("(SpeechSynthesisManager) No text provided to speak.");
			return;
		}

		// STEP 2: Queue Management - Add text to priority-based speech queue
		this.speechQueue.enqueue(text, priority);

		// STEP 3: Conditional Processing Initiation - Intelligent queue processing
		if (!this.isCurrentlySpeaking) {
			this.processQueue();
		}
	}

	/**
	 * Processes the speech synthesis queue in a state-managed, sequential manner.
	 * 
	 * This method is the core orchestrator for the speech synthesis queue system, managing 
	 * the sequential processing of text-to-speech requests while ensuring only one speech 
	 * utterance plays at a time and maintaining a queue of pending items.
	 * 
	 * @returns {void}
	 * @since 0.8.3-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	processQueue() {
		// Pure helper function that encapsulates queue retrieval logic with guard clauses
		const getNextSpeechItem = () =>
			!this.isCurrentlySpeaking && !this.speechQueue.isEmpty()
				? this.speechQueue.dequeue()
				: null;

		// Attempt to get next valid item from queue
		const item = getNextSpeechItem();

		// Early return if no item available
		if (!item) return;

		// Set concurrency control flag to prevent overlapping speech processing
		this.isCurrentlySpeaking = true;

		// Create new speech utterance with retrieved text content
		const utterance = new SpeechSynthesisUtterance(item.text);

		// Configure utterance with instance voice settings
		utterance.voice = this.voice;
		utterance.rate = this.rate;
		utterance.pitch = this.pitch;

		// Event handler for successful speech completion
		utterance.onend = () => {
			this.isCurrentlySpeaking = false;
		};

		// Event handler for speech errors
		utterance.onerror = (event) => {
			this.isCurrentlySpeaking = false;
		};

		// Execute the speech utterance using Web Speech API
		this.synth.speak(utterance);
	}

	/**
	 * Starts the independent queue processing timer.
	 */
	startQueueTimer() {
		this.stopQueueTimer();

		this.queueTimer = setInterval(() => {
			this.processQueue();
		}, this.independentQueueTimerInterval);
	}

	/**
	 * Stops the queue processing timer.
	 */
	stopQueueTimer() {
		if (this.queueTimer) {
			clearInterval(this.queueTimer);
			this.queueTimer = null;
		}
	}

	/**
	 * Pauses current speech synthesis.
	 */
	pause() {
		if (this.synth.speaking) {
			this.synth.pause();
		}
	}

	/**
	 * Resumes paused speech synthesis.
	 */
	resume() {
		if (this.synth.paused) {
			this.synth.resume();
		}
	}

	/**
	 * Stops current speech and clears the queue.
	 */
	stop() {
		this.synth.cancel();
		this.speechQueue.clear();
		this.isCurrentlySpeaking = false;
		this.stopQueueTimer();
	}

	toString() {
		return `${this.constructor.name}: voice=${this.voice?.name || 'none'}, rate=${this.rate}, pitch=${this.pitch}, isSpeaking=${this.isCurrentlySpeaking}, queueSize=${this.speechQueue.size()}`;
	}
}

/**
 * HTML-based speech synthesis controller with UI integration and address change notifications.
 * 
 * This class provides a complete speech synthesis interface integrated with HTML controls,
 * supporting voice selection, rate/pitch adjustment, and automatic speech notifications
 * for address changes. It implements priority-based speech with higher priority for
 * neighborhood (bairro) changes over street (logradouro) changes.
 * 
 * @class HtmlSpeechSynthesisDisplayer
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class HtmlSpeechSynthesisDisplayer {
	/**
	 * Creates a new HtmlSpeechSynthesisDisplayer instance.
	 * 
	 * @param {Document} document - Document object for DOM operations
	 * @param {Object} elementIds - Object containing HTML element IDs for controls
	 * @param {string} elementIds.languageSelectId - Language selection dropdown ID
	 * @param {string} elementIds.voiceSelectId - Voice selection dropdown ID
	 * @param {string} elementIds.textInputId - Text input field ID
	 * @param {string} elementIds.speakBtnId - Speak button ID
	 * @param {string} elementIds.pauseBtnId - Pause button ID
	 * @param {string} elementIds.resumeBtnId - Resume button ID
	 * @param {string} elementIds.stopBtnId - Stop button ID
	 * @param {string} elementIds.rateInputId - Rate slider ID
	 * @param {string} elementIds.rateValueId - Rate value display ID
	 * @param {string} elementIds.pitchInputId - Pitch slider ID
	 * @param {string} elementIds.pitchValueId - Pitch value display ID
	 */
	constructor(document, elementIds) {
		this.document = document;
		this.elementIds = elementIds;
		this.speechManager = new SpeechSynthesisManager();

		// Get DOM elements
		this.languageSelect = this.document.getElementById(elementIds.languageSelectId);
		this.voiceSelect = this.document.getElementById(elementIds.voiceSelectId);
		this.textInput = this.document.getElementById(elementIds.textInputId);
		this.speakBtn = this.document.getElementById(elementIds.speakBtnId);
		this.pauseBtn = this.document.getElementById(elementIds.pauseBtnId);
		this.resumeBtn = this.document.getElementById(elementIds.resumeBtnId);
		this.stopBtn = this.document.getElementById(elementIds.stopBtnId);
		this.rateInput = this.document.getElementById(elementIds.rateInputId);
		this.rateValue = this.document.getElementById(elementIds.rateValueId);
		this.pitchInput = this.document.getElementById(elementIds.pitchInputId);
		this.pitchValue = this.document.getElementById(elementIds.pitchValueId);

		this.init();
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	/**
	 * Initializes the speech synthesis interface and event handlers.
	 */
	init() {
		this.updateVoices();
		this.setupEventHandlers();
		this.speechManager.startQueueTimer();
	}

	/**
	 * Updates the voice selection dropdown with available voices.
	 * Prioritizes Brazilian Portuguese (pt-BR) voices for target users.
	 */
	updateVoices() {
		if (!this.voiceSelect) return;

		// Clear existing options
		this.voiceSelect.innerHTML = '';

		// Get available voices
		const voices = this.speechManager.synth.getVoices();

		// Track if we found a Brazilian Portuguese voice
		let brazilianVoiceFound = false;

		// Add voices to dropdown
		voices.forEach((voice, index) => {
			const option = this.document.createElement('option');
			option.value = index;
			option.textContent = `${voice.name} (${voice.lang})`;

			// PRIORITY 1: Select Brazilian Portuguese voice (pt-BR) by default
			if (voice.lang.toLowerCase() === 'pt-br') {
				option.selected = true;
				this.speechManager.setVoice(voice);
				brazilianVoiceFound = true;
			}
			// PRIORITY 2: Select any Portuguese voice if pt-BR not found
			else if (!brazilianVoiceFound && voice.lang.toLowerCase().startsWith('pt')) {
				option.selected = true;
				this.speechManager.setVoice(voice);
			}

			this.voiceSelect.appendChild(option);
		});
	}

	/**
	 * Sets up event handlers for all speech synthesis controls.
	 */
	setupEventHandlers() {
		// Voice selection change
		if (this.voiceSelect) {
			this.voiceSelect.addEventListener('change', (e) => {
				const voices = this.speechManager.synth.getVoices();
				const selectedVoice = voices[e.target.value];
				this.speechManager.setVoice(selectedVoice);
			});
		}

		// Speak button
		if (this.speakBtn && this.textInput) {
			this.speakBtn.addEventListener('click', () => {
				const text = this.textInput.value.trim();
				if (text) {
					this.speechManager.speak(text, 0); // Default priority
				}
			});
		}

		// Control buttons
		if (this.pauseBtn) {
			this.pauseBtn.addEventListener('click', () => {
				this.speechManager.pause();
			});
		}

		if (this.resumeBtn) {
			this.resumeBtn.addEventListener('click', () => {
				this.speechManager.resume();
			});
		}

		if (this.stopBtn) {
			this.stopBtn.addEventListener('click', () => {
				this.speechManager.stop();
			});
		}

		// Rate control
		if (this.rateInput && this.rateValue) {
			this.rateInput.addEventListener('input', (e) => {
				const rate = parseFloat(e.target.value);
				this.speechManager.setRate(rate);
				this.rateValue.textContent = rate.toFixed(1);
			});
		}

		// Pitch control
		if (this.pitchInput && this.pitchValue) {
			this.pitchInput.addEventListener('input', (e) => {
				const pitch = parseFloat(e.target.value);
				this.speechManager.setPitch(pitch);
				this.pitchValue.textContent = pitch.toFixed(1);
			});
		}

		// Handle voice loading events
		if (window.speechSynthesis.onvoiceschanged !== undefined) {
			window.speechSynthesis.onvoiceschanged = () => {
				this.updateVoices();
			};
		}
	}

	/**
	 * Builds text for logradouro (street) change announcements.
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current standardized address
	 * @returns {string} Formatted speech text for logradouro
	 */
	buildTextToSpeechLogradouro(currentAddress) {
		if (!currentAddress || !currentAddress.logradouro) {
			return "Nova localização detectada";
		}
		return `Você está agora em ${currentAddress.logradouroCompleto()}`;
	}

	/**
	 * Builds text for bairro (neighborhood) change announcements.
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current standardized address
	 * @returns {string} Formatted speech text for bairro
	 */
	buildTextToSpeechBairro(currentAddress) {
		if (!currentAddress || !currentAddress.bairro) {
			return "Novo bairro detectado";
		}
		return `Você entrou no bairro ${currentAddress.bairroCompleto()}`;
	}

	/**
	 * Builds text for municipio (municipality) change announcements.
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current standardized address
	 * @param {Object} changeDetails - Details about the municipality change (optional)
	 * @param {Object} changeDetails.previous - Previous municipality info
	 * @param {string} changeDetails.previous.municipio - Previous municipality name
	 * @param {Object} changeDetails.current - Current municipality info
	 * @param {string} changeDetails.current.municipio - Current municipality name
	 * @returns {string} Formatted speech text for municipio
	 */
	buildTextToSpeechMunicipio(currentAddress, changeDetails) {
		if (!currentAddress || !currentAddress.municipio) {
			return "Novo município detectado";
		}

		// If we have changeDetails with previous municipality, include it in the message
		if (changeDetails && changeDetails.previous && changeDetails.previous.municipio) {
			return `Você saiu de ${changeDetails.previous.municipio} e entrou em ${currentAddress.municipio}`;
		}

		// Fallback to simple message if no previous municipality info
		return `Você entrou no município de ${currentAddress.municipio}`;
	}

	/**
	 * Builds text for full address announcements.
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current standardized address
	 * @returns {string} Formatted speech text for full address
	 */
	buildTextToSpeech(currentAddress) {
		if (!currentAddress) {
			return "Localização não disponível";
		}
		let speechText = "Você está em ";

		if (currentAddress.logradouro) {
			speechText += currentAddress.logradouroCompleto();
			if (currentAddress.bairro) {
				speechText += `, ${currentAddress.bairroCompleto()}`;
			}
			if (currentAddress.municipio) {
				speechText += `, ${currentAddress.municipio}`;
			}
		} else if (currentAddress.bairro) {
			speechText += `bairro ${currentAddress.bairroCompleto()}`;
			if (currentAddress.municipio) {
				speechText += `, ${currentAddress.municipio}`;
			}
		} else if (currentAddress.municipio) {
			speechText += currentAddress.municipio;
		} else {
			speechText = "Localização detectada, mas endereço não disponível";
		}

		return speechText;
	}

	/**
	 * Updates the HTML display with new address information and handles speech synthesis.
	 * 
	 * Observer pattern update method that gets called when address changes occur.
	 * Implements priority-based speech notifications and periodic full address announcements:
	 * - Municipality changes (priority 3): Highest priority for city changes
	 * - Neighborhood/Bairro changes (priority 2): Medium priority for neighborhood changes
	 * - Street/Logradouro changes (priority 1): Low priority for street changes
	 * - Full address every 50 seconds (priority 0): Periodic announcements at trackingInterval
	 * 
	 * The 50-second interval feature ensures users receive regular location updates while
	 * driving, providing a better user experience than more frequent announcements.
	 * 
	 * @param {Object} currentAddress - Current address data
	 * @param {string|BrazilianStandardAddress} enderecoPadronizadoOrEvent - Standardized address or event type
	 * @param {string} posEvent - Position event type (strCurrPosUpdate, strImmediateAddressUpdate, etc.)
	 * @param {Object} loadingOrChangeDetails - Loading state information or changeDetails for address component changes
	 * @param {Object} error - Error information if any
	 * @returns {void}
	 * 
	 * @since 0.8.3-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	update(currentAddress, enderecoPadronizadoOrEvent, posEvent, loadingOrChangeDetails, error) {
		log("+++ (301) HtmlSpeechSynthesisDisplayer.update called +++");
		log("+++ (302) currentAddress: ", currentAddress);
		log("+++ (303) enderecoPadronizadoOrEvent: ", enderecoPadronizadoOrEvent);
		log("+++ (304) posEvent: ", posEvent);
		// Early return if no current address
		if (!currentAddress) {
			return;
		}

		let textToBeSpoken = "";
		let priority = 0;

		// Determine speech content and priority based on event type
		// Priority order: Municipality (3) > Bairro (2) > Logradouro (1) > Full address every 50s (0)
		if (["MunicipioChanged", "BairroChanged", "LogradouroChanged"].includes(enderecoPadronizadoOrEvent)) {
			log("+++ (310) (HtmlSpeechSyntesisDisplayer) Changed")

			// Call the appropriate build method based on event type
			if (enderecoPadronizadoOrEvent === "MunicipioChanged") {
				textToBeSpoken = this.buildTextToSpeechMunicipio(currentAddress, loadingOrChangeDetails);
			} else if (enderecoPadronizadoOrEvent === "BairroChanged") {
				textToBeSpoken = this.buildTextToSpeechBairro(currentAddress);
			} else if (enderecoPadronizadoOrEvent === "LogradouroChanged") {
				textToBeSpoken = this.buildTextToSpeechLogradouro(currentAddress);
			}

			const priorities = { "MunicipioChanged": 3, "BairroChanged": 2, "LogradouroChanged": 1 };
			priority = priorities[enderecoPadronizadoOrEvent]; // Set priority based on event
		} else if (posEvent === PositionManager.strCurrPosUpdate) {
			// Full address update every 50 seconds (trackingInterval)
			// This is the main feature: speak full address at regular 50-second intervals
			textToBeSpoken = this.buildTextToSpeech(enderecoPadronizadoOrEvent);
			priority = 0; // Lowest priority for periodic full address updates
		}
		// Note: For immediate updates (strImmediateAddressUpdate), we don't speak
		// unless there's a specific change event (handled by the conditions above)

		// Common operations for all cases
		if (textToBeSpoken && this.textInput) {
			this.textInput.value = textToBeSpoken;
			this.speechManager.speak(textToBeSpoken, priority);
		}
	}

	/**
	 * Returns a string representation of this displayer.
	 * 
	 * @returns {string} String representation including class name and current voice
	 * @since 0.8.3-alpha
	 */
	toString() {
		const voiceName = this.speechManager.voice?.name || 'no voice';
		return `${this.constructor.name}: ${voiceName}`;
	}
}


// Additional utility functions for geolocation support

/**
 * Displays error messages to the user in a formatted way.
 * 
 * @param {Error} error - Error object to display
 * @returns {void}
 * 
 * @example
 * displayError(new Error('Location not available'));
 * 
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
function displayError(error) {
	console.error("Display Error:", error);

	// Try to find a suitable element to display the error
	const errorElements = [
		document.getElementById('error-display'),
		document.getElementById('location-result'),
		document.getElementById('result')
	].filter(element => element !== null);

	if (errorElements.length > 0) {
		const element = errorElements[0];
		element.innerHTML = `
            <div class="error-message" style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px; margin: 10px 0;">
                <h4>Erro</h4>
                <p><strong>Tipo:</strong> ${error.name || 'Error'}</p>
                <p><strong>Mensagem:</strong> ${error.message}</p>
                ${error.code ? `<p><strong>Código:</strong> ${error.code}</p>` : ''}
            </div>
        `;
	} else {
		// Fallback to alert if no suitable element found
		alert(`Erro: ${error.message}`);
	}
}

/**
 * Gets the type of address location from geocoding data.
 * 
 * @param {Object} addressData - Address data from geocoding API
 * @returns {string} Formatted address type description
 * 
 * @example
 * const type = getAddressType(geocodingData);
 * console.log('Location type:', type);
 * 
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
function getAddressType(addressData) {
	if (!addressData || !addressData.class || !addressData.type) {
		return setupParams.noReferencePlace;
	}

	const className = addressData.class;
	const typeName = addressData.type;

	// Check if this is a valid reference place class
	if (!setupParams.validRefPlaceClasses.includes(className)) {
		return setupParams.noReferencePlace;
	}

	// Look up in the reference place map
	if (ReferencePlace.referencePlaceMap[className] &&
		ReferencePlace.referencePlaceMap[className][typeName]) {
		return ReferencePlace.referencePlaceMap[className][typeName];
	}

	// Fallback to class/type combination
	return `${className}: ${typeName}`;
}

/**
 * Placeholder function for finding nearby restaurants.
 * 
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {void}
 * 
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
function findNearbyRestaurants(latitude, longitude) {
	// Implementation would go here for restaurant search
	alert(`Procurando restaurantes próximos a ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
}

/**
 * Placeholder function for fetching city statistics.
 * 
 * @param {number} latitude - Latitude coordinate  
 * @param {number} longitude - Longitude coordinate
 * @returns {void}
 * 
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
function fetchCityStatistics(latitude, longitude) {
	// Implementation would go here for city statistics
	alert(`Obtendo estatísticas da cidade para ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
}


// Export for ES6 modules
export {
	guiaVersion,
	calculateDistance,
	delay,
	getAddressType,
	isMobileDevice,
	setupParams,
	DEFAULT_ELEMENT_IDS,
	ObserverSubject,
	GeoPosition,
	PositionManager,
	SingletonStatusManager,
	ReverseGeocoder,
	GeolocationService,
	ChangeDetectionCoordinator,
	WebGeocodingManager,
	BrazilianStandardAddress,
	ReferencePlace,
	AddressExtractor,
	AddressCache,
	AddressDataExtractor,
	Chronometer,
	HtmlText,
	HTMLAddressDisplayer,
	HTMLPositionDisplayer,
	HTMLReferencePlaceDisplayer,
	DisplayerFactory,
	SpeechSynthesisManager,
	SpeechQueue,
	findNearbyRestaurants,
	fetchCityStatistics
};

// Export to window for browser compatibility when loaded as module
if (typeof window !== 'undefined') {
	window.guiaVersion = guiaVersion;
	window.calculateDistance = calculateDistance;
	window.delay = delay;
	window.getAddressType = getAddressType;
	window.isMobileDevice = isMobileDevice;
	window.setupParams = setupParams;
	window.DEFAULT_ELEMENT_IDS = DEFAULT_ELEMENT_IDS;
	window.ObserverSubject = ObserverSubject;
	window.GeoPosition = GeoPosition;
	window.PositionManager = PositionManager;
	window.SingletonStatusManager = SingletonStatusManager;
	window.ReverseGeocoder = ReverseGeocoder;
	window.GeolocationService = GeolocationService;
	window.ChangeDetectionCoordinator = ChangeDetectionCoordinator;
	window.WebGeocodingManager = WebGeocodingManager;
	window.BrazilianStandardAddress = BrazilianStandardAddress;
	window.ReferencePlace = ReferencePlace;
	window.AddressExtractor = AddressExtractor;
	window.AddressCache = AddressCache;
	window.AddressDataExtractor = AddressDataExtractor;
	window.Chronometer = Chronometer;
	window.HtmlText = HtmlText;
	window.HTMLAddressDisplayer = HTMLAddressDisplayer;
	window.HTMLPositionDisplayer = HTMLPositionDisplayer;
	window.HTMLReferencePlaceDisplayer = HTMLReferencePlaceDisplayer;
	window.DisplayerFactory = DisplayerFactory;
	window.SpeechSynthesisManager = SpeechSynthesisManager;
	window.SpeechQueue = SpeechQueue;
	window.findNearbyRestaurants = findNearbyRestaurants;
	window.fetchCityStatistics = fetchCityStatistics;
}

