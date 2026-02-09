'use strict';

/**
 * WebGeocodingManager - Main coordination class for geocoding workflow
 * @version 0.7.1-alpha
 * 
 * @fileoverview Main coordination class for geocoding workflow in the Guia.js application.
 * WebGeocodingManager orchestrates the geolocation services, geocoding operations,
 * and UI updates for displaying location-based information. It follows the Coordinator
 * pattern, managing communication between services and displayers.
 * 
 * **Architecture Pattern**: Coordinator/Mediator
 * - Coordinates between geolocation services and UI displayers
 * - Manages observer subscriptions between components  
 * - Handles change detection callbacks for address components
 * 
 * **Design Principles Applied**:
 * - **Single Responsibility**: Focuses on coordinating geocoding workflow
 * - **Dependency Injection**: Receives document and configuration via constructor
 * - **Observer Pattern**: Implements subject/observer for state changes
 * - **Immutability**: Uses Object.freeze on created displayers
 * 
 * @module coordination/WebGeocodingManager
 * @since 0.6.0-alpha - Initial WebGeocodingManager implementation
 * @since 0.8.6-alpha - Updated to use factory pattern for displayers
 * @since 0.8.7-alpha - Extracted to dedicated coordination module (Phase 16)
 * @author Marcelo Pereira Barbosa
 * 
 * @requires core/GeoPosition
 * @requires core/ObserverSubject
 * @requires core/PositionManager
 * @requires services/ReverseGeocoder
 * @requires services/GeolocationService
 * @requires services/ChangeDetectionCoordinator
 * @requires data/AddressDataExtractor
 * @requires timing/Chronometer
 * @requires html/HtmlText
 * @requires html/DisplayerFactory
 * @requires html/HtmlSpeechSynthesisDisplayer
 * @requires utils/logger
 * 
 * @example
 * // Basic usage
 * import WebGeocodingManager from './coordination/WebGeocodingManager.js';
 * 
 * const manager = new WebGeocodingManager(document, {
 *   locationResult: 'location-result',
 *   enderecoPadronizadoDisplay: 'address-display',
 *   referencePlaceDisplay: 'reference-place'
 * });
 * manager.startTracking();
 * 
 * @example
 * // With dependency injection
 * const customGeocoder = new ReverseGeocoder();
 * const manager = new WebGeocodingManager(document, {
 *   locationResult: 'location-result',
 *   reverseGeocoder: customGeocoder
 * });
 * 
 * @example
 * // Async creation pattern (waits for Ibira.js)
 * const manager = await WebGeocodingManager.createAsync(document, params);
 */

// Import core domain classes
import GeoPosition from '../core/GeoPosition.js';
import ObserverSubject from '../core/ObserverSubject.js';
import PositionManager from '../core/PositionManager.js';

// Import Phase 1 & Phase 3 coordinator classes
import GeocodingState from '../core/GeocodingState.js';
import UICoordinator from './UICoordinator.js';
import EventCoordinator from './EventCoordinator.js';
import ServiceCoordinator from './ServiceCoordinator.js';
import SpeechCoordinator from './SpeechCoordinator.js';

// Import service layer classes
import ReverseGeocoder from '../services/ReverseGeocoder.js';
import GeolocationService from '../services/GeolocationService.js';
import ChangeDetectionCoordinator from '../services/ChangeDetectionCoordinator.js';

// Import data processing layer classes
import AddressDataExtractor from '../data/AddressDataExtractor.js';

// Import timing classes
import Chronometer from '../timing/Chronometer.js';

// Import HTML classes
import HtmlText from '../html/HtmlText.js';
import DisplayerFactory from '../html/DisplayerFactory.js';

// Import utility functions
import { log, warn, error } from '../utils/logger.js';
import { showError } from '../utils/toast.js';
import { withObserver } from '../utils/ObserverMixin.js';

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
 * 
 * @since 0.8.6-alpha
 */
const DEFAULT_ELEMENT_IDS = {
	chronometer: "chronometer",
	findRestaurantsBtn: "findRestaurantsBtn",
	cityStatsBtn: "cityStatsBtn",
	timestampDisplay: "chronometer",
	positionDisplay: "lat-long-display",
	referencePlaceDisplay: "reference-place-display",
	enderecoPadronizadoDisplay: "endereco-padronizado-display",
	sidraDisplay: "dadosSidra",
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
 * @since 0.6.0-alpha
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
class WebGeocodingManager {
	/**
	 * Creates a new WebGeocodingManager instance after waiting for Ibira.js to load.
	 * 
	 * This static factory method ensures that the Ibira.js library has finished loading
	 * before creating the WebGeocodingManager instance. This is important because
	 * WebGeocodingManager uses IbiraAPIFetchManager for enhanced API requests.
	 * 
	 * @param {Document} document - The document object for DOM manipulation
	 * @param {Object} params - Configuration parameters for the manager
	 * @returns {Promise<WebGeocodingManager>} Promise that resolves to the manager instance
	 * 
	 * @example
	 * // Usage with await
	 * const manager = await WebGeocodingManager.createAsync(document, params);
	 * 
	 * @example
	 * // Usage with then
	 * WebGeocodingManager.createAsync(document, params)
	 *   .then(manager => {
	 *     manager.startTracking();
	 *   });
	 * 
	 * @since 0.8.5-alpha
	 */
	static async createAsync(document, params) {
		// Wait for Ibira.js loading to complete
		if (typeof window !== 'undefined' && window.ibiraLoadingPromise) {
			await window.ibiraLoadingPromise;
			log('(WebGeocodingManager) Ibira.js loading complete, creating manager');
		} else {
			warn('(WebGeocodingManager) ibiraLoadingPromise not available, proceeding without wait');
		}
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
	 * @param {Function} [params.IbiraAPIFetchManager] - Optional IbiraAPIFetchManager class (for dependency injection)
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
		// Validate required parameters
		if (!document) {
			throw new TypeError('WebGeocodingManager requires a document object');
		}
		if (!params || !params.locationResult) {
			throw new TypeError('WebGeocodingManager requires params.locationResult to be specified');
		}

		// Store dependencies
		this.document = document;
		
		// Resolve locationResult to DOM element if it's a string ID
		if (typeof params.locationResult === 'string') {
			this.locationResult = document.getElementById(params.locationResult);
			if (!this.locationResult) {
				warn(`(WebGeocodingManager) Location result element '${params.locationResult}' not found in document`);
			}
		} else {
			this.locationResult = params.locationResult;
		}
		
		// Store element IDs configuration (frozen to prevent mutations)
		this.elementIds = params.elementIds || DEFAULT_ELEMENT_IDS;
		Object.freeze(this.elementIds);

		// Resolve display elements from element IDs or use provided params
		this.positionDisplay = params.positionDisplay || 
			(this.elementIds.positionDisplay ? document.getElementById(this.elementIds.positionDisplay) : null);
		this.enderecoPadronizadoDisplay = params.enderecoPadronizadoDisplay || 
			(this.elementIds.enderecoPadronizadoDisplay ? document.getElementById(this.elementIds.enderecoPadronizadoDisplay) : null);
		this.referencePlaceDisplay = params.referencePlaceDisplay || 
			(this.elementIds.referencePlaceDisplay ? document.getElementById(this.elementIds.referencePlaceDisplay) : null);
		this.sidraDisplay = params.sidraDisplay || 
			(this.elementIds.sidraDisplay ? document.getElementById(this.elementIds.sidraDisplay) : null);

		// Store displayer factory (enables dependency injection for testing)
		this.displayerFactory = params.displayerFactory || DisplayerFactory;

		// Initialize observer subject for external subscribers
		this.observerSubject = new ObserverSubject();

		// Phase 2: Initialize Phase 1 coordinators
		// GeocodingState replaces this.currentPosition and this.currentCoords
		this.geocodingState = new GeocodingState();
		
		// UICoordinator replaces _initializeUIElements()
		this.uiCoordinator = new UICoordinator(document, this.elementIds);
		this.uiCoordinator.initializeElements();
		
		// EventCoordinator replaces _initializeActionButtons() and click handlers
		// Must pass UICoordinator and GeocodingState as dependencies
		this.eventCoordinator = new EventCoordinator(this.uiCoordinator, this.geocodingState);
		this.eventCoordinator.initializeEventListeners();
		
		// Initialize services before ServiceCoordinator
		this._initializeFetchManager(params);
		
		// Create change detection coordinator (needs reverseGeocoder and observerSubject)
		this.changeDetectionCoordinator = new ChangeDetectionCoordinator({
			reverseGeocoder: this.reverseGeocoder,
			observerSubject: this.observerSubject
		});
		
		// Inject AddressDataExtractor into ChangeDetectionCoordinator to resolve dependency warning
		this.changeDetectionCoordinator.setAddressDataExtractor(AddressDataExtractor);
		
		// ServiceCoordinator replaces service initialization and coordination
		this.serviceCoordinator = new ServiceCoordinator({
			geolocationService: params.geolocationService || new GeolocationService(this.locationResult),
			reverseGeocoder: this.reverseGeocoder,
			changeDetectionCoordinator: this.changeDetectionCoordinator,
			observerSubject: this.observerSubject,
			locationResultElement: this.locationResult,
			displayerFactory: this.displayerFactory,
			document: document
		});

		log('>>> (WebGeocodingManager) Created with params:', params);
		log('>>> (WebGeocodingManager) locationResult element:', this.locationResult);
		log('>>> (WebGeocodingManager) positionDisplay element:', this.positionDisplay);
		log('>>> (WebGeocodingManager) enderecoPadronizadoDisplay element:', this.enderecoPadronizadoDisplay);
		log('>>> (WebGeocodingManager) referencePlaceDisplay element:', this.referencePlaceDisplay);
		log('>>> (WebGeocodingManager) sidraDisplay element:', this.sidraDisplay);
		// Create displayers and wire observers via ServiceCoordinator
		// Position display goes to positionDisplay, address display goes to locationResult
		this.serviceCoordinator
			.createDisplayers(
				this.positionDisplay,
				this.locationResult,
				this.enderecoPadronizadoDisplay,
				this.referencePlaceDisplay,
				this.sidraDisplay
			)
			.wireObservers();
		
		// Phase 3: SpeechCoordinator replaces initSpeechSynthesis() logic
		this.speechCoordinator = new SpeechCoordinator(
			document,
			this.elementIds.speechSynthesis,
			this.reverseGeocoder,
			this.observerSubject
		);
		
		// Expose geolocationService for backward compatibility
		this.geolocationService = this.serviceCoordinator.geolocationService;
		
		log("(WebGeocodingManager) Initialized successfully with Phase 1 & Phase 3 coordinators.");
	}

	/**
	 * Gets current position from GeocodingState (backward compatibility).
	 * @returns {Object|null} Current position object or null
	 */
	get currentPosition() {
		return this.geocodingState.getCurrentPosition();
	}

	/**
	 * Sets current position in GeocodingState (backward compatibility).
	 * @param {Object} position - Position object to store
	 */
	set currentPosition(position) {
		if (position) {
			this.geocodingState.setPosition(position);
		}
	}

	/**
	 * Gets current coordinates from GeocodingState (backward compatibility).
	 * @returns {Object|null} Current coordinates object or null
	 */
	get currentCoords() {
		return this.geocodingState.getCurrentCoordinates();
	}

	/**
	 * Sets current coordinates in GeocodingState (backward compatibility).
	 * @param {Object} coords - Coordinates object to store
	 */
	set currentCoords(coords) {
		if (coords) {
			const position = new GeoPosition({
				coords: {
					latitude: coords.latitude,
					longitude: coords.longitude,
					accuracy: coords.accuracy || 0
				},
				timestamp: Date.now()
			});
			this.geocodingState.setPosition(position);
		}
	}

	/**
	 * Initializes the fetch manager for API requests.
	 * 
	 * @param {Object} params - Constructor parameters
	 * @private
	 */
	_initializeFetchManager(params) {
		let fetchManager = null;
		
		// Try to get IbiraAPIFetchManager from various sources
		const IbiraAPIFetchManagerClass = params.IbiraAPIFetchManager || 
			(typeof window !== 'undefined' && window.IbiraAPIFetchManager) ||
			(typeof global !== 'undefined' && global.IbiraAPIFetchManager);

		if (IbiraAPIFetchManagerClass) {
			try {
				fetchManager = new IbiraAPIFetchManagerClass({
					maxCacheSize: 100,           // Maximum cache entries
					cacheExpiration: 300000,     // 5 minutes cache expiration
					cleanupInterval: 60000,      // Cleanup every minute
					maxRetries: 3,               // Default retry attempts
					retryDelay: 1000,            // Initial retry delay
					retryMultiplier: 2           // Exponential backoff
				});
				log('(WebGeocodingManager) Using IbiraAPIFetchManager');
			} catch (error) {
				warn('(WebGeocodingManager) Failed to create IbiraAPIFetchManager:', error.message);
				fetchManager = null;
			}
		} else {
			warn('(WebGeocodingManager) IbiraAPIFetchManager not available');
		}

		// Create reverse geocoder with or without fetch manager
		this.reverseGeocoder = params.reverseGeocoder ||
			new ReverseGeocoder(fetchManager);
		
		// Inject AddressDataExtractor into ReverseGeocoder to resolve dependency warning
		this.reverseGeocoder.AddressDataExtractor = AddressDataExtractor;
	}

	/**
	 * Gets chronometer element (backward compatibility with UICoordinator).
	 * @returns {Chronometer|null} Chronometer instance or null
	 */
	get chronometer() {
		return this.uiCoordinator.getElement('chronometer');
	}

	/**
	 * Gets timestamp display element (backward compatibility with UICoordinator).
	 * @returns {HTMLElement|null} Timestamp element or null
	 */
	get tsPosCapture() {
		return this.uiCoordinator.getElement('timestampDisplay');
	}

	/**
	 * Gets find restaurants button (backward compatibility with EventCoordinator).
	 * @returns {HTMLElement|null} Button element or null
	 */
	get findRestaurantsBtn() {
		return this.uiCoordinator.getElement('findRestaurantsBtn');
	}

	/**
	 * Gets city stats button (backward compatibility with EventCoordinator).
	 * @returns {HTMLElement|null} Button element or null
	 */
	get cityStatsBtn() {
		return this.uiCoordinator.getElement('cityStatsBtn');
	}

	/**
	 * Gets position displayer (backward compatibility with ServiceCoordinator).
	 * @returns {Object|null} Position displayer or null
	 */
	get positionDisplayer() {
		return this.serviceCoordinator.positionDisplayer;
	}

	/**
	 * Gets address displayer (backward compatibility with ServiceCoordinator).
	 * @returns {Object|null} Address displayer or null
	 */
	get addressDisplayer() {
		return this.serviceCoordinator.addressDisplayer;
	}

	/**
	 * Gets reference place displayer (backward compatibility with ServiceCoordinator).
	 * @returns {Object|null} Reference place displayer or null
	 */
	get referencePlaceDisplayer() {
		return this.serviceCoordinator.referencePlaceDisplayer;
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
	 *     log('Position changed:', pos);
	 *   }
	 * };
	 * manager.subscribe(myObserver);
	 */

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
	 *   log('Address changed:', endPad.enderecoCompleto());
	 * });
	 */
	subscribeFunction(observerFunction) {
		if (observerFunction == null) {
			warn("(WebGeocodingManager) Attempted to subscribe a null observer function.");
			return;
		}
		log(`(WebGeocodingManager) observer function ${observerFunction} subscribing ${this}`);
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
	 * **Phase 3**: Delegates to SpeechCoordinator
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
		this.speechCoordinator.initializeSpeechSynthesis();
	}

	/**
	 * Gets speech synthesis displayer (backward compatibility).
	 * @returns {Object|null} Speech displayer or null
	 */
	get htmlSpeechSynthesisDisplayer() {
		return this.speechCoordinator ? this.speechCoordinator.getSpeechDisplayer() : null;
	}

	/**
	 * Notifies all function observers about current state.
	 * 
	 * Calls each subscribed function observer with current position, address,
	 * and standardized address. This is a convenience method for manual
	 * notification of function observers.
	 * 
	 * **Functional Programming Principles Applied**:
	 * - **Declarative approach**: Uses forEach instead of imperative for loop
	 * - **Pure data preparation**: Extracts notification parameters once
	 * - **Null safety**: Guards against undefined function observers
	 * - **Single responsibility**: Clear separation of data prep and notification
	 * 
	 * @returns {void}
	 */
	notifyFunctionObservers() {
		// Guard against undefined function observers (defensive programming)
		const observers = this.functionObservers || [];
		
		// Prepare notification parameters once (avoid repetition, improve performance)
		const notificationData = [
			this.currentPosition,
			this.reverseGeocoder.currentAddress,
			this.reverseGeocoder.enderecoPadronizado,
		];
		
		// Functional approach: declarative iteration with clear intent
		observers.forEach(observerFunction => {
			try {
				observerFunction(...notificationData);
			} catch (error) {
				warn(`(WebGeocodingManager) Error notifying function observer:`, error.message);
				// Continue with other observers even if one fails
			}
		});
	}

	/**
	 * Gets a single location update from the geolocation service.
	 * 
	 * Delegates to ServiceCoordinator which handles:
	 * 1. Request single location update from GeolocationService
	 * 2. Store position in GeocodingState
	 * 3. Trigger reverse geocoding
	 * 4. Process and store results
	 * 5. Notify observers
	 * 
	 * @returns {Promise<Object>} Promise resolving to position object
	 * 
	 * @fires ReverseGeocoder#notifyObservers - When geocoding completes
	 * @fires WebGeocodingManager#notifyFunctionObservers - After geocoding completes
	 */
	getSingleLocationUpdate() {
		return this.serviceCoordinator
			.getSingleLocationUpdate()
			.then((position) => {
				if (position && position.coords) {
					// Wrap raw browser position in GeoPosition instance
					const geoPosition = new GeoPosition(position);
					
					// Update GeocodingState for backward compatibility
					this.currentPosition = geoPosition;
					this.currentCoords = position.coords;
					
					// Update change detection coordinator
					this.changeDetectionCoordinator.setCurrentPosition(position);
					
					// Notify function observers
					this.notifyFunctionObservers();
				}
				return position;
			})
			.catch((error) => {
				this._displayError(error);
				throw error;
			});
	}

	/**
	 * Starts continuous location tracking and initializes all monitoring systems.
	 * 
	 * Delegates service coordination to ServiceCoordinator:
	 * 1. Initializes speech synthesis UI
	 * 2. Gets initial location update
	 * 3. Starts continuous position watching
	 * 4. Registers callbacks for address component change detection
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

		// Get initial location and start continuous tracking via ServiceCoordinator
		this.getSingleLocationUpdate();
		this.serviceCoordinator.startTracking();

		// Set up address component change detection callbacks via coordinator
		this.changeDetectionCoordinator.setupChangeDetection();
	}

	/**
	 * Stops continuous geolocation tracking.
	 * 
	 * Delegates to ServiceCoordinator to stop the GeolocationService tracking.
	 * This method can be called to stop tracking when the user toggles off
	 * the tracking feature or when cleaning up resources.
	 * 
	 * @returns {void}
	 * 
	 * @example
	 * const manager = new WebGeocodingManager(document, {
	 *   locationResult: 'location-result'
	 * });
	 * manager.startTracking();
	 * // Later...
	 * manager.stopTracking(); // Stops tracking
	 */
	stopTracking() {
		if (this.serviceCoordinator && typeof this.serviceCoordinator.stopTracking === 'function') {
			this.serviceCoordinator.stopTracking();
			log('WebGeocodingManager: Tracking stopped');
		}
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
	 * Displays error messages to the user in a formatted way.
	 * 
	 * @param {Error} errorObj - Error object to display
	 * @returns {void}
	 * @private
	 */
	_displayError(errorObj) {
		error("Display Error:", errorObj);

		// Try to find a suitable element to display the error
		const errorElements = [
			this.document.getElementById('error-display'),
			this.locationResult,
			this.document.getElementById('result')
		].filter(element => element !== null);

		if (errorElements.length > 0) {
			const element = errorElements[0];
			element.innerHTML = `
				<div class="error-message" style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px; margin: 10px 0;">
					<h4>Erro</h4>
					<p><strong>Tipo:</strong> ${errorObj.name || 'Error'}</p>
					<p><strong>Mensagem:</strong> ${errorObj.message}</p>
					${errorObj.code ? `<p><strong>Código:</strong> ${errorObj.code}</p>` : ''}
				</div>
			`;
		} else {
			// Fallback to toast notification if no suitable element found
			showError(`Erro: ${errorObj.message}`);
		}
	}

	/**
	 * Destroys the manager and cleans up all resources.
	 * 
	 * **Phase 2-3 Refactoring**: Delegates cleanup to coordinators
	 * - ServiceCoordinator handles geolocation service cleanup
	 * - EventCoordinator handles event listener cleanup
	 * - UICoordinator handles UI element cleanup
	 * - GeocodingState handles state cleanup
	 * - SpeechCoordinator handles speech synthesis cleanup (Phase 3)
	 * 
	 * @returns {void}
	 * @since 0.8.6-alpha
	 * 
	 * @example
	 * const manager = new WebGeocodingManager(document, config);
	 * // ... use manager ...
	 * manager.destroy(); // Clean up when done
	 */
	destroy() {
		// Clean up coordinators (Phase 2 + Phase 3)
		if (this.serviceCoordinator && typeof this.serviceCoordinator.destroy === 'function') {
			this.serviceCoordinator.destroy();
		}
		
		if (this.eventCoordinator && typeof this.eventCoordinator.destroy === 'function') {
			this.eventCoordinator.destroy();
		}
		
		if (this.uiCoordinator && typeof this.uiCoordinator.destroy === 'function') {
			this.uiCoordinator.destroy();
		}
		
		if (this.geocodingState && typeof this.geocodingState.destroy === 'function') {
			this.geocodingState.destroy();
		}
		
		// Phase 3: Clean up speech coordinator
		if (this.speechCoordinator && typeof this.speechCoordinator.destroy === 'function') {
			this.speechCoordinator.destroy();
		}
		
		// Release coordinator references
		this.serviceCoordinator = null;
		this.eventCoordinator = null;
		this.uiCoordinator = null;
		this.geocodingState = null;
		this.speechCoordinator = null;
		
		// Release legacy references
		this.reverseGeocoder = null;
		this.geolocationService = null;
		this.changeDetectionCoordinator = null;
		this.observerSubject = null;
		this.document = null;
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
	 * log(manager.toString());
	 * // Output: "WebGeocodingManager: -23.5505, -46.6333"
	 */
	toString() {
		return `${this.constructor.name}: ${this.currentCoords ? this.currentCoords.latitude : "N/A"}, ${this.currentCoords ? this.currentCoords.longitude : "N/A"}`;
	}
}

// Apply observer mixin for subscribe/unsubscribe with null checking (notifyObservers has custom signature)
Object.assign(WebGeocodingManager.prototype, 
	withObserver({ checkNull: true, className: 'WebGeocodingManager', excludeNotify: true }));

export default WebGeocodingManager;
/**
 * Module exports for web geocoding management.
 * @exports WebGeocodingManager - Main geocoding coordinator class
 * @exports DEFAULT_ELEMENT_IDS - Default HTML element IDs configuration
 */
export { WebGeocodingManager, DEFAULT_ELEMENT_IDS };