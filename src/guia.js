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


/**
 * Represents a standardized Brazilian address with formatted components.
 * 
 * This class provides a structured representation of Brazilian addresses following
 * national postal standards, with methods for formatting and displaying address
 * components in a consistent manner across the application.
 * 
 * @class BrazilianStandardAddress
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class BrazilianStandardAddress {
	/**
	 * Creates a new BrazilianStandardAddress instance.
	 * 
	 * Initializes all address components to null, creating an empty address
	 * that can be populated with standardized Brazilian address data.
	 */
	constructor() {
		this.logradouro = null;
		this.numero = null;
		this.complemento = null;
		this.bairro = null;
		this.municipio = null;
		this.uf = null;
		this.siglaUF = null;
		this.cep = null;
		this.pais = "Brasil";
	}

	/**
	 * Returns the complete formatted street address (logradouro + número).
	 * 
	 * @returns {string} Formatted street address or just street name
	 * @since 0.8.3-alpha
	 */
	logradouroCompleto() {
		if (!this.logradouro) return "";
		if (this.numero) {
			return `${this.logradouro}, ${this.numero}`;
		}
		return this.logradouro;
	}

	/**
	 * Returns the complete formatted neighborhood information.
	 * 
	 * @returns {string} Formatted neighborhood name
	 * @since 0.8.3-alpha
	 */
	bairroCompleto() {
		return this.bairro || "";
	}

	/**
	 * Returns the complete formatted city and state information.
	 * 
	 * @returns {string} Formatted city and state
	 * @since 0.8.3-alpha
	 */
	municipioCompleto() {
		if (!this.municipio) return "";
		if (this.siglaUF) {
			return `${this.municipio}, ${this.siglaUF}`;
		}
		return this.municipio;
	}

	/**
	 * Returns a complete formatted address string.
	 * Uses immutable pattern to build address parts array.
	 * 
	 * @returns {string} Complete formatted address
	 * @since 0.8.3-alpha
	 */
	enderecoCompleto() {
		return [
			this.logradouroCompleto(),
			this.bairro,
			this.municipioCompleto(),
			this.cep
		]
			.filter(Boolean)  // Remove falsy values
			.join(", ");
	}

	toString() {
		return `${this.constructor.name}: ${this.enderecoCompleto() || 'Empty address'}`;
	}
}

/**
 * Represents a reference place extracted from geocoding data.
 * 
 * This class encapsulates information about reference places such as shopping centers,
 * subway stations, cafes, and other points of interest. It extracts the "class", "type",
 * and "name" fields from geocoding API responses and provides a Portuguese description
 * of the reference place type.
 * 
 * Reference places are useful for providing contextual information to users about their
 * location, such as "You are at Shopping Center XYZ" or "Near Subway Station ABC".
 * 
 * @class ReferencePlace
 * @since 0.8.5-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * const data = { 
 *   class: 'shop', 
 *   type: 'mall', 
 *   name: 'Shopping Morumbi' 
 * };
 * const refPlace = new ReferencePlace(data);
 * console.log(refPlace.description); // "Shopping Center"
 * console.log(refPlace.name); // "Shopping Morumbi"
 * console.log(refPlace.toString()); // "ReferencePlace: Shopping Center - Shopping Morumbi"
 */
class ReferencePlace {
	/**
	 * Reference place mapping for known OSM classes/types.
	 * Maps OpenStreetMap feature classes and types to Portuguese descriptions.
	 * Keys must be lowercase to match OSM data.
	 * 
	 * @static
	 * @type {Object.<string, Object.<string, string>>}
	 * @see {@link https://wiki.openstreetmap.org/wiki/Map_Features} OSM feature documentation
	 * @since 0.8.5-alpha
	 */
	static referencePlaceMap = {
		"place": { "house": "Residencial" },
		"shop": {
			"mall": "Shopping Center",
			"car_repair": "Oficina Mecânica"
		},
		"amenity": { "cafe": "Café" },
		"railway": {
			"subway": "Estação do Metrô",
			"station": "Estação do Metrô"
		},
	};

	/**
	 * Creates a new ReferencePlace instance.
	 * 
	 * Extracts class, type, and name information from the provided geocoding data
	 * and calculates the Portuguese description of the reference place type.
	 * 
	 * @param {Object} data - Raw address data from geocoding API
	 * @param {string} [data.class] - The class category of the place (e.g., 'shop', 'amenity', 'railway')
	 * @param {string} [data.type] - The specific type within the class (e.g., 'mall', 'cafe', 'subway')
	 * @param {string} [data.name] - The name of the reference place
	 * 
	 * @since 0.8.5-alpha
	 */
	constructor(data) {
		this.className = (data && data.class) || null;
		this.typeName = (data && data.type) || null;
		this.name = (data && data.name) || null;
		this.description = this.calculateDescription();
		Object.freeze(this); // Prevent modification following MP Barbosa standards
	}

	/**
	 * Calculates the Portuguese description of the reference place type.
	 * 
	 * Uses the class and type information to look up a human-readable description
	 * in Portuguese from the reference place mapping configuration. Falls back to
	 * a default "Não classificado" (unclassified) message if no mapping is found.
	 * 
	 * @private
	 * @returns {string} Portuguese description of the reference place type
	 * @since 0.8.5-alpha
	 */
	calculateDescription() {
		if (!this.className || !this.typeName) {
			return setupParams.noReferencePlace;
		}

		// Check if this is a valid reference place class
		if (!setupParams.validRefPlaceClasses.includes(this.className)) {
			return setupParams.noReferencePlace;
		}

		if (this.className && this.typeName) {
			// Look up in the reference place map
			if (ReferencePlace.referencePlaceMap[this.className] &&
				ReferencePlace.referencePlaceMap[this.className][this.typeName]) {
				if (this.name) {
					return `${ReferencePlace.referencePlaceMap[this.className][this.typeName]} ${this.name}`;
				} else {
					return ReferencePlace.referencePlaceMap[this.className][this.typeName];
				}
			}
		}

		// Fallback to class/type combination
		return `${this.className}: ${this.typeName}`;
	}

	/**
	 * Returns a string representation of this reference place.
	 * 
	 * Provides a formatted string showing the description and name (if available)
	 * of the reference place.
	 * 
	 * @returns {string} String representation
	 * @since 0.8.5-alpha
	 * 
	 * @example
	 * const refPlace = new ReferencePlace({ class: 'shop', type: 'mall', name: 'Shopping Morumbi' });
	 * console.log(refPlace.toString()); 
	 * // Output: "ReferencePlace: Shopping Center - Shopping Morumbi"
	 */
	toString() {
		const baseName = `${this.constructor.name}: ${this.description}`;
		if (this.name) {
			return `${baseName} - ${this.name}`;
		}
		return baseName;
	}
}

/**
 * Displays and manages elapsed time information in HTML format.
 * 
 * This class tracks and displays timing information related to position updates,
 * showing how much time has elapsed since the last position change. It implements
 * the observer pattern to automatically update when new position data becomes available.
 * 
 * @class Chronometer
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class Chronometer {
	/**
	 * Creates a new Chronometer instance.
	 * 
	 * @param {HTMLElement} element - DOM element where chronometer will be displayed
	 */
	constructor(element) {
		console.log("Initializing Chronometer...");
		this.element = element;
		this.startTime = null;
		this.lastUpdateTime = null;
		this.isRunning = false;
		this.intervalId = null;
	}

	/**
	 * Starts the chronometer timing.
	 * 
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	start() {
		if (!this.isRunning) {
			this.startTime = Date.now();
			this.lastUpdateTime = this.startTime;
			this.isRunning = true;

			// Update display immediately
			this.updateDisplay();

			// Start interval to update display every second
			this.intervalId = setInterval(() => {
				this.updateDisplay();
			}, 1000);
		}
	}

	/**
	 * Stops the chronometer timing.
	 * 
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	stop() {
		if (this.isRunning) {
			this.isRunning = false;
			if (this.intervalId) {
				clearInterval(this.intervalId);
				this.intervalId = null;
			}
		}
	}

	/**
	 * Resets the chronometer to initial state.
	 * 
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	reset() {
		this.stop();
		this.startTime = null;
		this.lastUpdateTime = null;
		if (this.element) {
			this.element.textContent = "00:00:00";
		}
	}

	/**
	 * Gets the current elapsed time in milliseconds.
	 * 
	 * @returns {number} Elapsed time in milliseconds
	 * @since 0.8.3-alpha
	 */
	getElapsedTime() {
		if (!this.startTime) {
			return 0;
		}
		return Date.now() - this.startTime;
	}

	/**
	 * Formats elapsed time in milliseconds to HH:MM:SS format.
	 * 
	 * @param {number} milliseconds - Time duration in milliseconds
	 * @returns {string} Formatted time string in HH:MM:SS format
	 * @since 0.8.3-alpha
	 */
	formatTime(milliseconds) {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		return [hours, minutes, seconds]
			.map(unit => unit.toString().padStart(2, '0'))
			.join(':');
	}

	/**
	 * Updates the chronometer display with current elapsed time.
	 * 
	 * @private
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	updateDisplay() {
		if (this.element) {
			const elapsed = this.getElapsedTime();
			const formattedTime = this.formatTime(elapsed);
			this.element.textContent = formattedTime;
		}
	}

	/**
	 * Updates the chronometer based on position manager notifications.
	 * 
	 * Observer pattern update method that gets called when the PositionManager
	 * has new position data available.
	 * 
	 * @param {PositionManager} positionManager - The PositionManager instance
	 * @param {string} posEvent - The position event type
	 * @param {Object} loading - Loading state information  
	 * @param {Object} error - Error information if any
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	update(positionManager, posEvent, loading, error) {
		// Handle different position events
		if (posEvent === PositionManager.strCurrPosUpdate ||
			posEvent === PositionManager.strImmediateAddressUpdate) {
			// Position successfully updated - restart chronometer
			this.reset();
			this.start();
		} else if (posEvent === PositionManager.strCurrPosNotUpdate) {
			// Position update was rejected - continue running if already started
			if (!this.isRunning && this.element) {
				this.start();
			}
		}

		// Handle error states
		if (error) {
			this.stop();
			if (this.element) {
				this.element.textContent = "Error";
			}
		}

		// Handle loading states
		if (loading) {
			if (this.element) {
				this.element.textContent = "Loading...";
			}
		}
	}

	toString() {
		const state = this.isRunning ? 'running' : 'stopped';
		const elapsed = this.formatTime(this.getElapsedTime());
		return `${this.constructor.name}: ${state}, elapsed: ${elapsed}`;
	}
}

/**
 * Manages HTML text content updates with timestamp formatting.
 * 
 * @class HtmlText
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class HtmlText {
	/**
	 * Creates a new HtmlText instance.
	 * 
	 * @param {Document} document - Document object for DOM operations
	 * @param {HTMLElement} element - Target DOM element for text updates
	 */
	constructor(document, element) {
		this.document = document;
		this.element = element;
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	/**
	 * Updates the element with current timestamp on position changes.
	 * 
	 * @param {PositionManager} positionManager - The PositionManager instance
	 * @param {string} posEvent - The position event type
	 * @param {Object} loading - Loading state information
	 * @param {Object} error - Error information if any
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	update(positionManager, posEvent, loading, error) {
		if (this.element) {
			if (error) {
				this.element.textContent = `Error: ${error.message}`;
			} else if (loading) {
				this.element.textContent = "Loading...";
			} else if (posEvent === PositionManager.strCurrPosUpdate ||
				posEvent === PositionManager.strImmediateAddressUpdate) {
				this.element.textContent = new Date().toLocaleString();
			}
		}
	}

	toString() {
		return `${this.constructor.name}: ${this.element.id || 'no-id'}`;
	}
}

/**
 * Displays position information in HTML format with coordinates and accuracy details.
 * 
 * @class HTMLPositionDisplayer
 * @since 0.8.3-alpha  
 * @author Marcelo Pereira Barbosa
 */
class HTMLPositionDisplayer {
	constructor(element) {
		this.element = element;
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	/**
	 * Renders position data as formatted HTML.
	 * 
	 * @param {PositionManager} positionManager - PositionManager instance with position data
	 * @returns {string} Formatted HTML string for position display
	 * @since 0.8.3-alpha
	 */
	renderPositionHtml(positionManager) {
		if (!positionManager || !positionManager.lastPosition) {
			return "<p class='error'>No position data available.</p>";
		}

		const geoPosition = positionManager.lastPosition;
		const position = geoPosition.geolocationPosition;
		const coords = position.coords;

		let html = `<details class="position-details" closed>
            <summary><strong>Posição Atual</strong></summary>`;

		html += `<div class="coordinates">
		${position}<br>
		</div>`;

		// Display core coordinates
		html += `<div class="coordinates">
            <h4>Coordenadas:</h4>
            <p><strong>Latitude:</strong> ${coords ? (coords.latitude ? coords.latitude.toFixed(6) : 'N/A') : 'N/A'}°</p>
            <p><strong>Longitude:</strong> ${coords ? (coords.longitude ? coords.longitude.toFixed(6) : 'N/A') : 'N/A'}°</p>
        </div>`;

		// Display accuracy information
		html += `<div class="accuracy-info">
            <p><strong>Precisão:</strong> ${coords ? (coords.accuracy ? coords.accuracy.toFixed(2) : 'N/A') : 'N/A'} metros</p>
            <h4>Precisão:</h4>
            <p><strong>Qualidade:</strong> ${this.formatAccuracyQuality(position.accuracyQuality)}</p>
        </div>`;

		// Display altitude if available
		if (position.altitude !== null && position.altitude !== undefined) {
			html += `<div class="altitude-info">
                <h4>Altitude:</h4>
                <p><strong>Altitude:</strong> ${position.altitude.toFixed(2)} metros</p>`;

			if (position.altitudeAccuracy !== null && position.altitudeAccuracy !== undefined) {
				html += `<p><strong>Precisão da Altitude:</strong> ${position.altitudeAccuracy.toFixed(2)} metros</p>`;
			}
			html += `</div>`;
		}

		// Display movement information
		if (position.speed !== null && position.speed !== undefined) {
			const speedKmh = (position.speed * 3.6);
			html += `<div class="movement-info">
                <h4>Movimento:</h4>
                <p><strong>Velocidade:</strong> ${speedKmh.toFixed(2)} km/h</p>`;

			if (position.heading !== null && position.heading !== undefined) {
				html += `<p><strong>Direção:</strong> ${position.heading.toFixed(0)}°</p>`;
			}
			html += `</div>`;
		}

		html += `</details>`;
		return html;
	}

	formatAccuracyQuality(quality) {
		const qualityMap = {
			'excellent': 'Excelente',
			'good': 'Boa',
			'medium': 'Média',
			'bad': 'Ruim',
			'very bad': 'Muito Ruim'
		};
		return qualityMap[quality] || quality;
	}

	/**
	 * Updates the HTML display with new position information.
	 * 
	 * @param {PositionManager} positionManager - The PositionManager instance
	 * @param {string} posEvent - The position event type
	 * @param {Object} loading - Loading state information
	 * @param {Object} error - Error information if any
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	update(positionManager, posEvent, loading, error) {
		// Handle loading state
		if (loading) {
			this.element.innerHTML = '<p class="loading">Obtendo posição...</p>';
			return;
		}

		// Handle error state
		if (error) {
			this.element.innerHTML = `<p class="error">Erro ao obter posição: ${error.message}</p>`;
			return;
		}

		// Handle successful position updates
		if (posEvent === PositionManager.strCurrPosUpdate ||
			posEvent === PositionManager.strImmediateAddressUpdate) {
			if (positionManager && positionManager.lastPosition) {
				const html = this.renderPositionHtml(positionManager);
				this.element.innerHTML = html;
			} else {
				this.element.innerHTML = '<p class="warning">Dados de posição não disponíveis.</p>';
			}
		}
	}

	toString() {
		return `${this.constructor.name}: ${this.element.id || 'no-id'}`;
	}
}


class HTMLReferencePlaceDisplayer {
	constructor(element, referencePlaceDisplay = false) {
		this.element = element;
		this.referencePlaceDisplay = referencePlaceDisplay;
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	renderReferencePlaceHtml(referencePlace) {
		if (!referencePlace) {
			return "<p class='error'>No reference place data available.</p>";
		}


		// Display all referencePlace attributes
		let html = '<div class="reference-place-attributes">';
		html += referencePlace.description;
		html += `</div>`;
		return html;
	}

	update(addressData, brazilianStandardAddress, posEvent, loading, error) {
		log("+++ (50) (HTMLReferencePlaceDisplayer) update() called with posEvent:", posEvent);
		log("+++ (50.1) (HTMLReferencePlaceDisplayer) brazilian standard address: ", brazilianStandardAddress.constructor.name);
		log("+++ (50.2) (HTMLReferencePlaceDisplayer) Reference place: ", brazilianStandardAddress.referencePlace);
		// Handle loading state
		if (loading) {
			this.element.innerHTML = '<p class="loading">Carregando local de referência...</p>';
			return;
		}

		// Handle error state
		if (error) {
			this.element.innerHTML = `<p class="error">Erro ao carregar local de referência: ${error.message}</p>`;
			return;
		}

		// Handle successful reference place data
		if (posEvent == PositionManager.strCurrPosUpdate && (brazilianStandardAddress)) {
			log("+++ (51) (HTMLReferencePlaceDisplayer) Rendering reference place data:", brazilianStandardAddress);
			const html = this.renderReferencePlaceHtml(brazilianStandardAddress.referencePlace);
			this.element.innerHTML = html;
		}
	}

	toString() {
		return `${this.constructor.name}: ${this.element.id || 'no-id'}`;
	}
}

/**
 * Displays address information in HTML format.
 * 
 * @class HTMLAddressDisplayer
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class HTMLAddressDisplayer {
	constructor(element, enderecoPadronizadoDisplay = false) {
		this.element = element;
		this.enderecoPadronizadoDisplay = enderecoPadronizadoDisplay;
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	renderAddressHtml(addressData, enderecoPadronizado) {
		if (!addressData) {
			return "<p class='error'>No address data available.</p>";
		}

		if (this.enderecoPadronizadoDisplay && enderecoPadronizado) {
			this.enderecoPadronizadoDisplay.innerHTML = enderecoPadronizado.enderecoCompleto();
		}

		let html = `<details class="address-details" closed>
            <summary><strong>Endereço Atual</strong></summary>`;

		// Display all addressData attributes
		html += `<div class="address-attributes">
			<h4>Todos os atributos de addressData:</h4>
			<ul>`;
		for (const key in addressData) {
			if (Object.prototype.hasOwnProperty.call(addressData, key)) {
				const value = addressData[key];
				if (typeof value === 'object' && value !== null) {
					html += `<li><strong>${key}:</strong> <pre>${JSON.stringify(value, null, 2)}</pre></li>`;
				} else {
					html += `<li><strong>${key}:</strong> ${value}</li>`;
				}
			}
		}
		html += `</ul></div>`;

		// Display full address name if available
		if (addressData.display_name) {
			html += `<div class="full-address">
                <p><strong>Endereço Completo:</strong></p>
                <p class="display-name">${addressData.display_name}</p>
            </div>`;
		}

		html += `</details>`;
		return html;
	}

	update(addressData, enderecoPadronizado, posEvent, loading, error) {
		log("+++ (50) (HTMLAddressDisplayer) update() called with posEvent:", posEvent);
		// Handle loading state
		if (loading) {
			this.element.innerHTML = '<p class="loading">Carregando endereço...</p>';
			return;
		}

		// Handle error state
		if (error) {
			this.element.innerHTML = `<p class="error">Erro ao carregar endereço: ${error.message}</p>`;
			return;
		}

		// Handle successful address data
		if (posEvent == PositionManager.strCurrPosUpdate && (addressData || enderecoPadronizado)) {
			log("+++ (51) (HTMLAddressDisplayer) Rendering address data:", addressData);
			const html = this.renderAddressHtml(addressData, enderecoPadronizado);
			this.element.innerHTML += html;
		}
	}

	toString() {
		return `${this.constructor.name}: ${this.element.id || 'no-id'}`;
	}
}

/**
 * Factory for creating displayer instances.
 * 
 * This factory provides a centralized point for creating displayer objects,
 * enabling dependency injection and easier testing. The factory methods are
 * pure functions that create displayer instances without side effects.
 * 
 * **Benefits**:
 * - Decouples WebGeocodingManager from concrete displayer implementations
 * - Enables mock displayer injection for testing
 * - Provides single point of control for displayer creation
 * - Maintains referential transparency (pure functions)
 * 
 * **Usage**:
 * ```javascript
 * // Default usage
 * const posDisplayer = DisplayerFactory.createPositionDisplayer(element);
 * 
 * // Custom factory for testing
 * class MockDisplayerFactory {
 *     static createPositionDisplayer(element) {
 *         return new MockPositionDisplayer(element);
 *     }
 * }
 * ```
 * 
 * @class DisplayerFactory
 * @since 0.8.6-alpha
 * @author Marcelo Pereira Barbosa
 */
class DisplayerFactory {
	/**
	 * Creates a position displayer instance.
	 * 
	 * @param {HTMLElement|string} element - DOM element or element ID for display
	 * @returns {HTMLPositionDisplayer} Position displayer instance
	 * @since 0.8.6-alpha
	 */
	static createPositionDisplayer(element) {
		return new HTMLPositionDisplayer(element);
	}

	/**
	 * Creates an address displayer instance.
	 * 
	 * @param {HTMLElement|string} element - DOM element or element ID for display
	 * @param {HTMLElement|string|boolean} enderecoPadronizadoDisplay - Element for standardized address display
	 * @returns {HTMLAddressDisplayer} Address displayer instance
	 * @since 0.8.6-alpha
	 */
	static createAddressDisplayer(element, enderecoPadronizadoDisplay = false) {
		return new HTMLAddressDisplayer(element, enderecoPadronizadoDisplay);
	}

	/**
	 * Creates a reference place displayer instance.
	 * 
	 * @param {HTMLElement|string} element - DOM element or element ID for display
	 * @returns {HTMLReferencePlaceDisplayer} Reference place displayer instance
	 * @since 0.8.6-alpha
	 */
	static createReferencePlaceDisplayer(element) {
		return new HTMLReferencePlaceDisplayer(element);
	}
}

// Add after the HTMLPositionDisplayer class and before the AddressDataExtractor class
// ...existing code continues...

/**
 * Extracts and standardizes address data from geocoding API responses.
 * 
 * This class is responsible for the extraction and standardization logic only.
 * It processes raw address data from geocoding services (like OpenStreetMap/Nominatim)
 * and converts it into standardized Brazilian address format with proper field mapping.
 * 
 * The class follows the Single Responsibility Principle by focusing solely on
 * the transformation of raw address data into a BrazilianStandardAddress object.
 * Cache management and change detection are handled by the AddressCache class.
 * 
 * Responsibilities:
 * - Parse raw geocoding API response data
 * - Map API fields to Brazilian address standard fields (logradouro, bairro, municipio, etc.)
 * - Handle fallback values for missing or incomplete data
 * - Create immutable address instances
 * 
 * @class AddressExtractor
 * @since 0.8.4-alpha
 * @author Marcelo Pereira Barbosa
 */
class AddressExtractor {
	/**
	 * Creates a new AddressExtractor instance.
	 * 
	 * @param {Object} data - Raw address data from geocoding API
	 */
	constructor(data) {
		this.data = data;
		this.enderecoPadronizado = new BrazilianStandardAddress();
		this.padronizaEndereco();
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	/**
	 * Extracts the state abbreviation (siglaUF) from ISO3166-2-lvl4 field.
	 * 
	 * The ISO3166-2-lvl4 field contains the state code in the format "BR-XX"
	 * where XX is the two-letter state abbreviation (e.g., "BR-RJ" for Rio de Janeiro).
	 * This method extracts and returns just the state abbreviation part.
	 * 
	 * @private
	 * @param {string} iso3166Code - The ISO3166-2-lvl4 code (e.g., "BR-RJ", "BR-SP")
	 * @returns {string|null} The state abbreviation (e.g., "RJ", "SP") or null if invalid
	 * @since 0.8.6-alpha
	 * 
	 * @example
	 * extractSiglaUF("BR-RJ")  // Returns "RJ"
	 * extractSiglaUF("BR-SP")  // Returns "SP"
	 * extractSiglaUF("invalid") // Returns null
	 */
	static extractSiglaUF(iso3166Code) {
		if (!iso3166Code || typeof iso3166Code !== 'string') {
			return null;
		}

		// Extract the state code after "BR-" prefix
		const match = iso3166Code.match(/^BR-([A-Z]{2})$/);
		return match ? match[1] : null;
	}

	/**
	 * Standardizes the address data into Brazilian format.
	 * 
	 * Maps fields from the raw geocoding response to standardized Brazilian
	 * address components with proper fallback handling for missing data.
	 * 
	 * Supports both Nominatim API format (road, house_number, etc.) and 
	 * standard OSM address tags (addr:street, addr:housenumber, etc.).
	 * 
	 * @private
	 * @since 0.8.3-alpha
	 */
	padronizaEndereco() {
		if (!this.data || !this.data.address) {
			return;
		}

		const address = this.data.address;

		// Map street/road information
		// Supports: Nominatim format (road, street, pedestrian) and OSM tags (addr:street)
		this.enderecoPadronizado.logradouro = address['addr:street'] || address.road || address.street || address.pedestrian || null;

		// Map house number
		// Supports: Nominatim format (house_number) and OSM tags (addr:housenumber)
		this.enderecoPadronizado.numero = address['addr:housenumber'] || address.house_number || null;

		// Map neighborhood/suburb information
		// Supports: Nominatim format (neighbourhood, suburb, quarter) and OSM tags (addr:neighbourhood)
		this.enderecoPadronizado.bairro = address['addr:neighbourhood'] || address.neighbourhood || address.suburb || address.quarter || null;

		// Map municipality/city information
		// Supports: Nominatim format (city, town, municipality, village) and OSM tags (addr:city)
		this.enderecoPadronizado.municipio = address['addr:city'] || address.city || address.town || address.municipality || address.village || null;

		// Map state information
		// uf property: Contains ONLY full state names from addr:state or state fields
		// Priority: OSM tag (addr:state) > Nominatim state field
		// Rule: uf must contain only full state names (e.g., "São Paulo", "Rio de Janeiro")
		this.enderecoPadronizado.uf = address['addr:state'] || address.state || null;

		// siglaUF property: Contains ONLY two-letter state abbreviations
		// Priority: state_code > extracted from ISO3166-2-lvl4 > derived from uf if it's already a 2-letter code
		// Rule: siglaUF must contain only two-letter state abbreviations (e.g., "SP", "RJ")
		this.enderecoPadronizado.siglaUF = address.state_code || AddressExtractor.extractSiglaUF(address['ISO3166-2-lvl4']) || null;

		// If uf contains a two-letter code (edge case for backward compatibility), use it for siglaUF
		if (this.enderecoPadronizado.uf && /^[A-Z]{2}$/.test(this.enderecoPadronizado.uf)) {
			this.enderecoPadronizado.siglaUF = this.enderecoPadronizado.uf;
		}

		// Map postal code
		// Supports: Nominatim format (postcode) and OSM tags (addr:postcode)
		this.enderecoPadronizado.cep = address['addr:postcode'] || address.postcode || null;

		// Map country (default to Brasil for Brazilian addresses)
		this.enderecoPadronizado.pais = address.country === 'Brasil' || address.country === 'Brazil' ? 'Brasil' : (address.country || 'Brasil');

		this.enderecoPadronizado.referencePlace = new ReferencePlace(this.data);
	}

	/**
	 * Returns a string representation of this extractor.
	 * 
	 * @returns {string} String representation
	 * @since 0.8.3-alpha
	 */
	toString() {
		return `${this.constructor.name}: ${this.enderecoPadronizado.enderecoCompleto()}`;
	}
}

/**
 * Manages caching of standardized addresses with LRU eviction and change detection.
 * 
 * This class is responsible for cache management, performance optimization, and
 * change detection logic. It implements a sophisticated caching strategy including:
 * - LRU (Least Recently Used) eviction policy
 * - Time-based expiration of cache entries
 * - Change detection for address components (logradouro, bairro, municipio)
 * - Callback-based notifications for address changes
 * 
 * The class follows the Single Responsibility Principle by focusing solely on
 * cache management and change tracking. Address extraction logic is handled
 * by the AddressExtractor class.
 * 
 * Responsibilities:
 * - Generate unique cache keys from address data
 * - Store and retrieve cached addresses efficiently
 * - Implement LRU eviction when cache reaches capacity
 * - Clean expired cache entries based on timestamps
 * - Track address changes (current vs. previous)
 * - Notify registered callbacks when address components change
 * - Manage callback registration for change detection
 * 
 * @class AddressCache
 * @since 0.8.4-alpha
 * @author Marcelo Pereira Barbosa
 */
class AddressCache {

	/**
	 * Singleton instance holder. Only one AddressCache exists per application.
	 * @static
	 * @type {AddressCache|null}
	 * @private
	 */
	static instance = null;

	/**
	 * Gets or creates the singleton AddressCache instance.
	 * 
	 * Implements the singleton pattern ensuring only one AddressCache instance
	 * exists throughout the application lifecycle.
	 * 
	 * @static
	 * @returns {AddressCache} The singleton AddressCache instance
	 * @since 0.8.5-alpha
	 */
	static getInstance() {
		if (!AddressCache.instance) {
			AddressCache.instance = new AddressCache();
		}
		return AddressCache.instance;
	}

	/**
	 * Creates a new AddressCache instance.
	 * 
	 * Initializes the cache with default settings and empty state.
	 * This constructor is typically called internally by the getInstance() method
	 * to maintain the singleton pattern.
	 * 
	 * @private
	 * @since 0.8.5-alpha
	 */
	constructor() {
		this.observerSubject = new ObserverSubject();
		this.cache = new Map();
		this.maxCacheSize = 50;
		this.cacheExpirationMs = 300000; // 5 minutes
		this.lastNotifiedChangeSignature = null;
		this.lastNotifiedBairroChangeSignature = null;
		this.lastNotifiedMunicipioChangeSignature = null;
		this.logradouroChangeCallback = null;
		this.bairroChangeCallback = null;
		this.municipioChangeCallback = null;
		this.currentAddress = null;
		this.previousAddress = null;
		this.currentRawData = null;
		this.previousRawData = null;
	}

	/**
	 * Generates a cache key for address data to enable efficient caching and retrieval.
	 * 
	 * Creates a unique identifier based on address components that can be used to cache
	 * processed address data and avoid redundant processing. The cache key is designed
	 * to be stable for the same address data while being unique across different addresses.
	 * 
	 * @param {Object} data - Address data from geocoding API
	 * @returns {string|null} Cache key string or null if data is invalid
	 * 
	 * @example
	 * const cache = AddressCache.getInstance();
	 * const cacheKey = cache.generateCacheKey(addressData);
	 * if (cacheKey) {
	 *   console.log('Cache key:', cacheKey);
	 * }
	 * 
	 * @since 0.8.3-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	generateCacheKey(data) {
		// Validate input data
		if (!data || !data.address) {
			return null;
		}

		const address = data.address;

		// Create cache key from essential address components
		// Use components that uniquely identify a location
		const keyComponents = [
			address.road || address.street || '',
			address.house_number || '',
			address.neighbourhood || address.suburb || '',
			address.city || address.town || address.municipality || '',
			address.postcode || '',
			address.country_code || ''
		];

		// Filter out empty components and join with separator
		const cacheKey = keyComponents
			.filter(component => component.trim() !== '')
			.join('|');

		// Return null if no meaningful components found
		return cacheKey.length > 0 ? cacheKey : null;
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().generateCacheKey() instead
	 * @static
	 */
	static generateCacheKey(data) {
		return AddressCache.getInstance().generateCacheKey(data);
	}

	/**
	 * Evicts least recently used cache entries when maximum cache size is reached.
	 * 
	 * This method implements LRU (Least Recently Used) eviction policy to maintain
	 * cache size within configured limits. It removes the oldest entries based on
	 * lastAccessed timestamp to make room for new entries.
	 * 
	 * @private
	 * @since 0.8.3-alpha
	 */
	evictLeastRecentlyUsedIfNeeded() {
		if (this.cache.size >= this.maxCacheSize) {
			// Convert cache entries to array and sort by lastAccessed (oldest first)
			const entries = Array.from(this.cache.entries());
			entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

			// Calculate how many entries to remove (25% of max size)
			const entriesToRemove = Math.ceil(this.maxCacheSize * 0.25);

			// Remove the least recently used entries
			for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
				this.cache.delete(entries[i][0]);
			}
		}
	}

	/**
	 * Cleans up expired cache entries based on timestamp.
	 * Uses immutable pattern to build expired keys array.
	 * 
	 * @private
	 * @since 0.8.3-alpha
	 */
	cleanExpiredEntries() {
		const now = Date.now();

		// Build expiredKeys array immutably using filter and map
		const expiredKeys = Array.from(this.cache.entries())
			.filter(([key, entry]) => now - entry.timestamp > this.cacheExpirationMs)
			.map(([key]) => key);

		expiredKeys.forEach(key => this.cache.delete(key));

		if (expiredKeys.length > 0) {
			log(`(AddressCache) Cleaned ${expiredKeys.length} expired cache entries`);
		}
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().cleanExpiredEntries() instead
	 * @static
	 */
	static cleanExpiredEntries() {
		return AddressCache.getInstance().cleanExpiredEntries();
	}

	/**
	 * Clears all cache entries and resets change tracking.
	 * This method is primarily used for testing purposes.
	 * 
	 * @since 0.8.4-alpha
	 */
	clearCache() {
		this.cache.clear();
		this.currentAddress = null;
		this.previousAddress = null;
		this.currentRawData = null;
		this.previousRawData = null;
		this.lastNotifiedChangeSignature = null;
		this.lastNotifiedBairroChangeSignature = null;
		this.lastNotifiedMunicipioChangeSignature = null;
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().clearCache() instead
	 * @static
	 */
	static clearCache() {
		return AddressCache.getInstance().clearCache();
	}

	/**
	 * Sets the callback function to be called when logradouro changes are detected.
	 * 
	 * This method allows external components to register a callback function that will be
	 * invoked whenever a street (logradouro) change is detected between address updates.
	 * 
	 * @param {Function|null} callback - Function to call on logradouro changes, or null to remove callback
	 * @param {Object} callback.changeDetails - Details about the logradouro change
	 * @returns {void}
	 * 
	 * @example
	 * const cache = AddressCache.getInstance();
	 * cache.setLogradouroChangeCallback((changeDetails) => {
	 *   console.log('Street changed:', changeDetails);
	 * });
	 * 
	 * @since 0.8.3-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	setLogradouroChangeCallback(callback) {
		this.logradouroChangeCallback = callback;
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().setLogradouroChangeCallback() instead
	 * @static
	 */
	static setLogradouroChangeCallback(callback) {
		return AddressCache.getInstance().setLogradouroChangeCallback(callback);
	}

	/**
	 * Sets the callback function to be called when bairro changes are detected.
	 * 
	 * This method allows external components to register a callback function that will be
	 * invoked whenever a neighborhood (bairro) change is detected between address updates.
	 * 
	 * @param {Function|null} callback - Function to call on bairro changes, or null to remove callback
	 * @param {Object} callback.changeDetails - Details about the bairro change
	 * @returns {void}
	 * 
	 * @example
	 * const cache = AddressCache.getInstance();
	 * cache.setBairroChangeCallback((changeDetails) => {
	 *   console.log('Neighborhood changed:', changeDetails);
	 * });
	 * 
	 * @since 0.8.3-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	setBairroChangeCallback(callback) {
		this.bairroChangeCallback = callback;
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().setBairroChangeCallback() instead
	 * @static
	 */
	static setBairroChangeCallback(callback) {
		return AddressCache.getInstance().setBairroChangeCallback(callback);
	}

	/**
	 * Sets the callback function to be called when municipio changes are detected.
	 * 
	 * This method allows external components to register a callback function that will be
	 * invoked whenever a municipality (municipio) change is detected between address updates.
	 * 
	 * @param {Function|null} callback - Function to call on municipio changes, or null to remove callback
	 * @param {Object} callback.changeDetails - Details about the municipio change
	 * @returns {void}
	 * 
	 * @example
	 * const cache = AddressCache.getInstance();
	 * cache.setMunicipioChangeCallback((changeDetails) => {
	 *   console.log('Municipality changed:', changeDetails);
	 * });
	 * 
	 * @since 0.8.3-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	setMunicipioChangeCallback(callback) {
		this.municipioChangeCallback = callback;
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().setMunicipioChangeCallback() instead
	 * @static
	 */
	static setMunicipioChangeCallback(callback) {
		return AddressCache.getInstance().setMunicipioChangeCallback(callback);
	}

	/**
	 * Gets the currently registered logradouro change callback.
	 * 
	 * @returns {Function|null} The current callback function or null if none is set
	 * @since 0.8.3-alpha
	 */
	getLogradouroChangeCallback() {
		return this.logradouroChangeCallback;
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().getLogradouroChangeCallback() instead
	 * @static
	 */
	static getLogradouroChangeCallback() {
		return AddressCache.getInstance().getLogradouroChangeCallback();
	}

	/**
	 * Gets the currently registered bairro change callback.
	 * 
	 * @returns {Function|null} The current callback function or null if none is set
	 * @since 0.8.3-alpha
	 */
	getBairroChangeCallback() {
		return this.bairroChangeCallback;
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().getBairroChangeCallback() instead
	 * @static
	 */
	static getBairroChangeCallback() {
		return AddressCache.getInstance().getBairroChangeCallback();
	}

	/**
	 * Gets the currently registered municipio change callback.
	 * 
	 * @returns {Function|null} The current callback function or null if none is set
	 * @since 0.8.3-alpha
	 */
	getMunicipioChangeCallback() {
		return this.municipioChangeCallback;
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().getMunicipioChangeCallback() instead
	 * @static
	 */
	static getMunicipioChangeCallback() {
		return AddressCache.getInstance().getMunicipioChangeCallback();
	}

	/**
	 * Checks if logradouro has changed compared to previous address.
	 * Returns true only once per change to prevent notification loops.
	 * 
	 * @returns {boolean} True if logradouro has changed and not yet notified
	 * @since 0.8.3-alpha
	 */
	hasLogradouroChanged() {
		if (!this.currentAddress || !this.previousAddress) {
			return false;
		}

		const hasChanged = this.currentAddress.logradouro !== this.previousAddress.logradouro;

		if (!hasChanged) {
			return false;
		}

		// Create a signature for this change to track if we've already notified
		const changeSignature = `${this.previousAddress.logradouro}=>${this.currentAddress.logradouro}`;

		// If we've already notified about this exact change, return false
		if (this.lastNotifiedChangeSignature === changeSignature) {
			return false;
		}

		// Mark this change as notified
		this.lastNotifiedChangeSignature = changeSignature;
		return true;
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().hasLogradouroChanged() instead
	 * @static
	 */
	static hasLogradouroChanged() {
		return AddressCache.getInstance().hasLogradouroChanged();
	}

	/**
	 * Checks if bairro has changed compared to previous address.
	 * Returns true only once per change to prevent notification loops.
	 * 
	 * @returns {boolean} True if bairro has changed and not yet notified
	 * @since 0.8.3-alpha
	 */
	hasBairroChanged() {
		if (!this.currentAddress || !this.previousAddress) {
			return false;
		}

		const hasChanged = this.currentAddress.bairro !== this.previousAddress.bairro;

		if (!hasChanged) {
			return false;
		}

		// Create a signature for this change to track if we've already notified
		const changeSignature = `${this.previousAddress.bairro}=>${this.currentAddress.bairro}`;

		// If we've already notified about this exact change, return false
		if (this.lastNotifiedBairroChangeSignature === changeSignature) {
			return false;
		}

		// Mark this change as notified
		this.lastNotifiedBairroChangeSignature = changeSignature;
		return true;
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().hasBairroChanged() instead
	 * @static
	 */
	static hasBairroChanged() {
		return AddressCache.getInstance().hasBairroChanged();
	}

	/**
	 * Checks if municipio has changed compared to previous address.
	 * Returns true only once per change to prevent notification loops.
	 * 
	 * @returns {boolean} True if municipio has changed and not yet notified
	 * @since 0.8.3-alpha
	 */
	hasMunicipioChanged() {
		if (!this.currentAddress || !this.previousAddress) {
			return false;
		}

		const hasChanged = this.currentAddress.municipio !== this.previousAddress.municipio;

		if (!hasChanged) {
			return false;
		}

		// Create a signature for this change to track if we've already notified
		const changeSignature = `${this.previousAddress.municipio}=>${this.currentAddress.municipio}`;

		// If we've already notified about this exact change, return false
		if (this.lastNotifiedMunicipioChangeSignature === changeSignature) {
			return false;
		}

		// Mark this change as notified
		this.lastNotifiedMunicipioChangeSignature = changeSignature;
		return true;
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().hasMunicipioChanged() instead
	 * @static
	 */
	static hasMunicipioChanged() {
		return AddressCache.getInstance().hasMunicipioChanged();
	}

	/**
	 * Gets details about logradouro change.
	 * 
	 * @returns {Object} Change details with current and previous logradouro
	 * @since 0.8.3-alpha
	 */
	getLogradouroChangeDetails() {
		const currentLogradouro = this.currentAddress?.logradouro || null;
		const previousLogradouro = this.previousAddress?.logradouro || null;

		return {
			hasChanged: currentLogradouro !== previousLogradouro,
			current: {
				logradouro: currentLogradouro
			},
			previous: {
				logradouro: previousLogradouro
			},
			timestamp: Date.now()
		};
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().getLogradouroChangeDetails() instead
	 * @static
	 */
	static getLogradouroChangeDetails() {
		return AddressCache.getInstance().getLogradouroChangeDetails();
	}

	/**
	 * Gets details about bairro change.
	 * 
	 * @returns {Object} Change details with current and previous bairro
	 * @since 0.8.3-alpha
	 */
	getBairroChangeDetails() {
		const currentBairro = this.currentAddress?.bairro || null;
		const previousBairro = this.previousAddress?.bairro || null;

		// Compute bairroCompleto from raw data if available
		const currentBairroCompleto = this._computeBairroCompleto(this.currentRawData);
		const previousBairroCompleto = this._computeBairroCompleto(this.previousRawData);

		return {
			hasChanged: currentBairro !== previousBairro,
			current: {
				bairro: currentBairro,
				bairroCompleto: currentBairroCompleto
			},
			previous: {
				bairro: previousBairro,
				bairroCompleto: previousBairroCompleto
			},
			timestamp: Date.now()
		};
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().getBairroChangeDetails() instead
	 * @static
	 */
	static getBairroChangeDetails() {
		return AddressCache.getInstance().getBairroChangeDetails();
	}

	/**
	 * Computes complete bairro string from raw address data.
	 * Combines neighbourhood and suburb fields when both are present.
	 * 
	 * @private
	 * @param {Object} rawData - Raw address data from geocoding API
	 * @returns {string} Complete bairro string
	 * @since 0.8.4-alpha
	 */
	_computeBairroCompleto(rawData) {
		if (!rawData || !rawData.address) {
			return null;
		}

		const address = rawData.address;
		const neighbourhood = address.neighbourhood || null;
		const suburb = address.suburb || null;
		const quarter = address.quarter || null;

		// If we have both neighbourhood and suburb, combine them
		if (neighbourhood && suburb && neighbourhood !== suburb) {
			return `${neighbourhood}, ${suburb}`;
		}

		// Otherwise return whichever is available
		return neighbourhood || suburb || quarter || null;
	}

	/**
	 * Gets details about municipio change.
	 * 
	 * @returns {Object} Change details with current and previous municipio
	 * @since 0.8.3-alpha
	 */
	getMunicipioChangeDetails() {
		const currentMunicipio = this.currentAddress?.municipio ?? undefined;
		const previousMunicipio = this.previousAddress?.municipio ?? undefined;
		const currentUf = this.currentAddress?.uf ?? undefined;
		const previousUf = this.previousAddress?.uf ?? undefined;

		return {
			hasChanged: (currentMunicipio ?? null) !== (previousMunicipio ?? null),
			current: {
				municipio: currentMunicipio,
				uf: currentUf
			},
			previous: {
				municipio: previousMunicipio,
				uf: previousUf
			},
			timestamp: Date.now()
		};
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().getMunicipioChangeDetails() instead
	 * @static
	 */
	static getMunicipioChangeDetails() {
		return AddressCache.getInstance().getMunicipioChangeDetails();
	}

	/**
	 * Gets a cached or newly extracted Brazilian standard address with change detection.
	 * 
	 * This is the main entry point for retrieving standardized addresses. It coordinates
	 * between cache retrieval, address extraction, and change detection.
	 * 
	 * @param {Object} data - Raw address data from geocoding API
	 * @returns {BrazilianStandardAddress} Standardized address object
	 * @since 0.8.3-alpha
	 */
	getBrazilianStandardAddress(data) {
		const cacheKey = this.generateCacheKey(data);

		if (cacheKey) {
			// Clean expired entries periodically
			this.cleanExpiredEntries();

			// Check if we have a valid cached entry
			const cacheEntry = this.cache.get(cacheKey);
			if (cacheEntry) {
				const now = Date.now();
				if (now - cacheEntry.timestamp <= this.cacheExpirationMs) {
					// Update access time for LRU behavior (history-like)
					cacheEntry.lastAccessed = now;
					// Re-insert to update position in Map (Map maintains insertion order)
					this.cache.delete(cacheKey);
					this.cache.set(cacheKey, cacheEntry);

					return cacheEntry.address;
				} else {
					// Remove expired entry
					this.cache.delete(cacheKey);
				}
			}
		}

		// Create new standardized address using AddressExtractor
		const extractor = new AddressExtractor(data);

		// Cache the result if we have a valid key
		if (cacheKey) {
			// Check if cache has reached maximum size, evict least recently used entries
			this.evictLeastRecentlyUsedIfNeeded();

			const now = Date.now();
			this.cache.set(cacheKey, {
				address: extractor.enderecoPadronizado,
				rawData: data, // Store raw data for detailed change information
				timestamp: now,
				lastAccessed: now,
			});

			// Update current and previous addresses for change detection
			this.previousAddress = this.currentAddress;
			this.previousRawData = this.currentRawData;
			this.currentAddress = extractor.enderecoPadronizado;
			this.currentRawData = data;

			// Reset change notification flags when new address is cached
			// This allows detection of new changes after cache updates
			this.lastNotifiedChangeSignature = null;
			this.lastNotifiedBairroChangeSignature = null;
			this.lastNotifiedMunicipioChangeSignature = null;

			// Check for logradouro change after caching the new address
			// This replaces the timer-based approach with event-driven checking
			if (this.logradouroChangeCallback &&
				this.hasLogradouroChanged()) {
				log("+++ (300) (AddressCache) Detected logradouro change, invoking callback");
				const changeDetails = this.getLogradouroChangeDetails();
				try {
					this.logradouroChangeCallback(changeDetails);
				} catch (error) {
					console.error(
						"(AddressCache) Error calling logradouro change callback:",
						error,
					);
				}
			}

			// Check for bairro change after caching the new address
			// This follows the same pattern as logradouro change detection
			if (this.bairroChangeCallback &&
				this.hasBairroChanged()) {
				const changeDetails = this.getBairroChangeDetails();
				try {
					this.bairroChangeCallback(changeDetails);
				} catch (error) {
					console.error(
						"(AddressCache) Error calling bairro change callback:",
						error,
					);
				}
			}

			// Check for municipio change after caching the new address
			// This follows the same pattern as logradouro and bairro change detection
			if (this.municipioChangeCallback &&
				this.hasMunicipioChanged()) {
				const changeDetails = this.getMunicipioChangeDetails();
				try {
					this.municipioChangeCallback(changeDetails);
				} catch (error) {
					console.error(
						"(AddressCache) Error calling municipio change callback:",
						error,
					);
				}
			}
		}

		this.notifyObservers({ type: 'addressUpdated', address: extractor.enderecoPadronizado, cacheSize: this.getCacheSize() });

		this.notifyFunctions({ type: 'addressUpdated', address: extractor.enderecoPadronizado, cacheSize: this.getCacheSize() });

		// Return the newly extracted standardized address

		return extractor.enderecoPadronizado;
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().getBrazilianStandardAddress() instead
	 * @static
	 */
	static getBrazilianStandardAddress(data) {
		return AddressCache.getInstance().getBrazilianStandardAddress(data);
	}

	toString() {
		return `AddressCache {
			cache: ${this.cache.size},
			currentAddress: ${this.currentAddress},
			previousAddress: ${this.previousAddress}
		}`;
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().toString() instead
	 * @static
	 */
	static toString() {
		return AddressCache.getInstance().toString();
	}

	subscribe(observer) {
		return this.observerSubject.subscribe(observer);
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().subscribe() instead
	 * @static
	 */
	static subscribe(observer) {
		return AddressCache.getInstance().subscribe(observer);
	}

	unsubscribe(observer) {
		return this.observerSubject.unsubscribe(observer);
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().unsubscribe() instead
	 * @static
	 */
	static unsubscribe(observer) {
		return AddressCache.getInstance().unsubscribe(observer);
	}

	notifyObservers(event) {
		this.observerSubject.notifyObservers(event);
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().notifyObservers() instead
	 * @static
	 */
	static notifyObservers(event) {
		return AddressCache.getInstance().notifyObservers(event);
	}

	getCacheSize() {
		return this.cache.size;
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().getCacheSize() instead
	 * @static
	 */
	static getCacheSize() {
		return AddressCache.getInstance().getCacheSize();
	}

	subscribeFunction(fn) {
		return this.observerSubject.subscribeFunction(fn);
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().subscribeFunction() instead
	 * @static
	 */
	static subscribeFunction(fn) {
		return AddressCache.getInstance().subscribeFunction(fn);
	}

	unsubscribeFunction(fn) {
		return this.observerSubject.unsubscribeFunction(fn);
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().unsubscribeFunction() instead
	 * @static
	 */
	static unsubscribeFunction(fn) {
		return AddressCache.getInstance().unsubscribeFunction(fn);
	}

	notifyFunctions(event) {
		this.observerSubject.notifyFunctionObservers(event);
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().notifyFunctions() instead
	 * @static
	 */
	static notifyFunctions(event) {
		return AddressCache.getInstance().notifyFunctions(event);
	}

	/**
	 * Static getter for cache property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static get cache() {
		return AddressCache.getInstance().cache;
	}

	/**
	 * Static setter for cache property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set cache(value) {
		AddressCache.getInstance().cache = value;
	}

	/**
	 * Static getter for maxCacheSize property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static get maxCacheSize() {
		return AddressCache.getInstance().maxCacheSize;
	}

	/**
	 * Static setter for maxCacheSize property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set maxCacheSize(value) {
		AddressCache.getInstance().maxCacheSize = value;
	}

	/**
	 * Static getter for cacheExpirationMs property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static get cacheExpirationMs() {
		return AddressCache.getInstance().cacheExpirationMs;
	}

	/**
	 * Static setter for cacheExpirationMs property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set cacheExpirationMs(value) {
		AddressCache.getInstance().cacheExpirationMs = value;
	}

	/**
	 * Static getter for lastNotifiedChangeSignature property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static get lastNotifiedChangeSignature() {
		return AddressCache.getInstance().lastNotifiedChangeSignature;
	}

	/**
	 * Static setter for lastNotifiedChangeSignature property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set lastNotifiedChangeSignature(value) {
		AddressCache.getInstance().lastNotifiedChangeSignature = value;
	}

	/**
	 * Static getter for lastNotifiedBairroChangeSignature property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static get lastNotifiedBairroChangeSignature() {
		return AddressCache.getInstance().lastNotifiedBairroChangeSignature;
	}

	/**
	 * Static setter for lastNotifiedBairroChangeSignature property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set lastNotifiedBairroChangeSignature(value) {
		AddressCache.getInstance().lastNotifiedBairroChangeSignature = value;
	}

	/**
	 * Static getter for lastNotifiedMunicipioChangeSignature property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static get lastNotifiedMunicipioChangeSignature() {
		return AddressCache.getInstance().lastNotifiedMunicipioChangeSignature;
	}

	/**
	 * Static setter for lastNotifiedMunicipioChangeSignature property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set lastNotifiedMunicipioChangeSignature(value) {
		AddressCache.getInstance().lastNotifiedMunicipioChangeSignature = value;
	}

	/**
	 * Static getter for logradouroChangeCallback property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static get logradouroChangeCallback() {
		return AddressCache.getInstance().logradouroChangeCallback;
	}

	/**
	 * Static setter for logradouroChangeCallback property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set logradouroChangeCallback(value) {
		AddressCache.getInstance().logradouroChangeCallback = value;
	}

	/**
	 * Static getter for bairroChangeCallback property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static get bairroChangeCallback() {
		return AddressCache.getInstance().bairroChangeCallback;
	}

	/**
	 * Static setter for bairroChangeCallback property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set bairroChangeCallback(value) {
		AddressCache.getInstance().bairroChangeCallback = value;
	}

	/**
	 * Static getter for municipioChangeCallback property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static get municipioChangeCallback() {
		return AddressCache.getInstance().municipioChangeCallback;
	}

	/**
	 * Static setter for municipioChangeCallback property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set municipioChangeCallback(value) {
		AddressCache.getInstance().municipioChangeCallback = value;
	}

	/**
	 * Static getter for currentAddress property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static get currentAddress() {
		return AddressCache.getInstance().currentAddress;
	}

	/**
	 * Static setter for currentAddress property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set currentAddress(value) {
		AddressCache.getInstance().currentAddress = value;
	}

	/**
	 * Static getter for previousAddress property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static get previousAddress() {
		return AddressCache.getInstance().previousAddress;
	}

	/**
	 * Static setter for previousAddress property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set previousAddress(value) {
		AddressCache.getInstance().previousAddress = value;
	}

	/**
	 * Static getter for currentRawData property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static get currentRawData() {
		return AddressCache.getInstance().currentRawData;
	}

	/**
	 * Static setter for currentRawData property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set currentRawData(value) {
		AddressCache.getInstance().currentRawData = value;
	}

	/**
	 * Static getter for previousRawData property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static get previousRawData() {
		return AddressCache.getInstance().previousRawData;
	}

	/**
	 * Static setter for previousRawData property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set previousRawData(value) {
		AddressCache.getInstance().previousRawData = value;
	}

	/**
	 * Static getter for observerSubject property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static get observerSubject() {
		return AddressCache.getInstance().observerSubject;
	}

	/**
	 * Static setter for observerSubject property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set observerSubject(value) {
		AddressCache.getInstance().observerSubject = value;
	}
}


// Set up periodic cleanup of expired cache entries
// Use a non-blocking interval to avoid preventing Node.js exit
AddressCache.cleanupInterval = setInterval(() => {
	AddressCache.cleanExpiredEntries();
}, 60000); // Clean expired entries every 60 seconds

// Ensure the interval is not blocking Node.js exit
if (typeof AddressCache.cleanupInterval.unref === 'function') {
	AddressCache.cleanupInterval.unref();
}

/**
 * Legacy wrapper class that maintains backward compatibility with existing code.
 * 
 * This class serves as a facade that delegates to the specialized AddressExtractor
 * and AddressCache classes. It preserves the original API surface for existing code
 * while the implementation has been refactored to follow the Single Responsibility Principle.
 * 
 * The refactoring split the original AddressDataExtractor into two classes:
 * - AddressExtractor: Handles address extraction and standardization
 * - AddressCache: Manages caching, change detection, and callbacks
 * 
 * New code should use AddressCache.getBrazilianStandardAddress() directly.
 * This class exists to maintain compatibility with existing tests and consumers.
 * 
 * @class AddressDataExtractor
 * @deprecated Use AddressCache for cache operations and AddressExtractor for extraction
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class AddressDataExtractor {
	/**
	 * Creates a new AddressDataExtractor instance.
	 * Delegates to AddressExtractor for actual extraction.
	 * 
	 * @param {Object} data - Raw address data from geocoding API
	 */
	constructor(data) {
		const extractor = new AddressExtractor(data);
		this.data = extractor.data;
		this.enderecoPadronizado = extractor.enderecoPadronizado;
		this.referencePlace = extractor.referencePlace;
		Object.freeze(this);
	}

	/**
	 * Delegates to AddressCache for cache key generation.
	 * @static
	 */
	static generateCacheKey(data) {
		return AddressCache.generateCacheKey(data);
	}

	/**
	 * Clears the cache. Delegates to AddressCache.
	 * @static
	 */
	static clearCache() {
		return AddressCache.clearCache();
	}

	/**
	 * Delegates to AddressCache for callback management.
	 * @static
	 */
	static setLogradouroChangeCallback(callback) {
		return AddressCache.setLogradouroChangeCallback(callback);
	}

	/**
	 * Delegates to AddressCache for callback management.
	 * @static
	 */
	static setBairroChangeCallback(callback) {
		return AddressCache.setBairroChangeCallback(callback);
	}

	/**
	 * Delegates to AddressCache for callback management.
	 * @static
	 */
	static setMunicipioChangeCallback(callback) {
		return AddressCache.setMunicipioChangeCallback(callback);
	}

	/**
	 * Delegates to AddressCache for callback retrieval.
	 * @static
	 */
	static getLogradouroChangeCallback() {
		return AddressCache.getLogradouroChangeCallback();
	}

	/**
	 * Delegates to AddressCache for callback retrieval.
	 * @static
	 */
	static getBairroChangeCallback() {
		return AddressCache.getBairroChangeCallback();
	}

	/**
	 * Delegates to AddressCache for callback retrieval.
	 * @static
	 */
	static getMunicipioChangeCallback() {
		return AddressCache.getMunicipioChangeCallback();
	}

	/**
	 * Delegates to AddressCache for change detection.
	 * @static
	 */
	static hasLogradouroChanged() {
		return AddressCache.hasLogradouroChanged();
	}

	/**
	 * Delegates to AddressCache for change detection.
	 * @static
	 */
	static hasBairroChanged() {
		return AddressCache.hasBairroChanged();
	}

	/**
	 * Delegates to AddressCache for change detection.
	 * @static
	 */
	static hasMunicipioChanged() {
		return AddressCache.hasMunicipioChanged();
	}

	/**
	 * Delegates to AddressCache for change details.
	 * @static
	 */
	static getLogradouroChangeDetails() {
		return AddressCache.getLogradouroChangeDetails();
	}

	/**
	 * Delegates to AddressCache for change details.
	 * @static
	 */
	static getBairroChangeDetails() {
		return AddressCache.getBairroChangeDetails();
	}

	/**
	 * Delegates to AddressCache for change details.
	 * @static
	 */
	static getMunicipioChangeDetails() {
		return AddressCache.getMunicipioChangeDetails();
	}

	/**
	 * Main static method to get Brazilian standard address.
	 * Delegates to AddressCache which coordinates with AddressExtractor.
	 * @static
	 */
	static getBrazilianStandardAddress(data) {
		return AddressCache.getBrazilianStandardAddress(data);
	}

	/**
	 * Returns a string representation of this extractor.
	 * 
	 * @returns {string} String representation
	 * @since 0.8.3-alpha
	 */
	toString() {
		return `${this.constructor.name}: ${this.enderecoPadronizado.enderecoCompleto()}`;
	}
}

// Legacy static properties for AddressDataExtractor - delegated to AddressCache singleton
// These maintain backward compatibility but all operations use AddressCache singleton internally
// Use property descriptors to create live references that stay synchronized
Object.defineProperties(AddressDataExtractor, {
	cache: {
		get: () => AddressCache.getInstance().cache,
		set: (value) => { AddressCache.getInstance().cache = value; }
	},
	maxCacheSize: {
		get: () => AddressCache.getInstance().maxCacheSize,
		set: (value) => { AddressCache.getInstance().maxCacheSize = value; }
	},
	cacheExpirationMs: {
		get: () => AddressCache.getInstance().cacheExpirationMs,
		set: (value) => { AddressCache.getInstance().cacheExpirationMs = value; }
	},
	lastNotifiedChangeSignature: {
		get: () => AddressCache.getInstance().lastNotifiedChangeSignature,
		set: (value) => { AddressCache.getInstance().lastNotifiedChangeSignature = value; }
	},
	lastNotifiedBairroChangeSignature: {
		get: () => AddressCache.getInstance().lastNotifiedBairroChangeSignature,
		set: (value) => { AddressCache.getInstance().lastNotifiedBairroChangeSignature = value; }
	},
	lastNotifiedMunicipioChangeSignature: {
		get: () => AddressCache.getInstance().lastNotifiedMunicipioChangeSignature,
		set: (value) => { AddressCache.getInstance().lastNotifiedMunicipioChangeSignature = value; }
	},
	logradouroChangeCallback: {
		get: () => AddressCache.getInstance().logradouroChangeCallback,
		set: (value) => { AddressCache.getInstance().logradouroChangeCallback = value; }
	},
	bairroChangeCallback: {
		get: () => AddressCache.getInstance().bairroChangeCallback,
		set: (value) => { AddressCache.getInstance().bairroChangeCallback = value; }
	},
	municipioChangeCallback: {
		get: () => AddressCache.getInstance().municipioChangeCallback,
		set: (value) => { AddressCache.getInstance().municipioChangeCallback = value; }
	},
	currentAddress: {
		get: () => AddressCache.getInstance().currentAddress,
		set: (value) => { AddressCache.getInstance().currentAddress = value; }
	},
	previousAddress: {
		get: () => AddressCache.getInstance().previousAddress,
		set: (value) => { AddressCache.getInstance().previousAddress = value; }
	}
});

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
	window.HTMLAddressDisplayer = HTMLAddressDisplayer;
	window.HTMLPositionDisplayer = HTMLPositionDisplayer;
	window.HTMLReferencePlaceDisplayer = HTMLReferencePlaceDisplayer;
	window.DisplayerFactory = DisplayerFactory;
	window.SpeechSynthesisManager = SpeechSynthesisManager;
	window.SpeechQueue = SpeechQueue;
	window.findNearbyRestaurants = findNearbyRestaurants;
	window.fetchCityStatistics = fetchCityStatistics;
}

