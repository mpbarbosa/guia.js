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
import HtmlSpeechSynthesisDisplayer from './html/HtmlSpeechSynthesisDisplayer.js';

// Import speech synthesis classes
import SpeechItem from './speech/SpeechItem.js';
import SpeechQueue from './speech/SpeechQueue.js';
import SpeechSynthesisManager from './speech/SpeechSynthesisManager.js';

// Import status management classes
import SingletonStatusManager from './status/SingletonStatusManager.js';

// Import coordination classes
import WebGeocodingManager, { DEFAULT_ELEMENT_IDS } from './coordination/WebGeocodingManager.js';

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

// SingletonStatusManager - Extracted to src/status/SingletonStatusManager.js

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

/* ============================
 * Camada de Serviço - Continuação
 * ============================
 */

// WebGeocodingManager - Extracted to src/coordination/WebGeocodingManager.js

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
	HtmlSpeechSynthesisDisplayer,
	SpeechItem,
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
	window.HtmlSpeechSynthesisDisplayer = HtmlSpeechSynthesisDisplayer;
	window.SpeechItem = SpeechItem;
	window.SpeechSynthesisManager = SpeechSynthesisManager;
	window.SpeechQueue = SpeechQueue;
	window.findNearbyRestaurants = findNearbyRestaurants;
	window.fetchCityStatistics = fetchCityStatistics;
}

