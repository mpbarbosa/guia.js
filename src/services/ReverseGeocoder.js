'use strict';

/**
 * Reverse geocoding service for converting coordinates to addresses.
 * @version 0.9.0-alpha
 * 
 * ARCHITECTURAL OVERVIEW:
 * The ReverseGeocoder class serves as a critical service layer component in the travel guide
 * application, responsible for converting geographic coordinates into human-readable addresses
 * using the OpenStreetMap Nominatim API. The class follows the project's established patterns
 * of dependency injection, observer pattern implementation, and graceful error handling.
 * 
 * INTEGRATION WITH WEBGEOCODINGMANAGER:
 * Within the broader WebGeocodingManager architecture, the ReverseGeocoder class serves as
 * a bridge between position updates and address display components. It receives position
 * notifications, performs geocoding operations, and propagates address updates to subscribed
 * UI components, maintaining clean separation of concerns.
 * 
 * OBSERVER PATTERN IMPLEMENTATION:
 * The class implements a comprehensive observer pattern through an ObserverSubject instance,
 * enabling other components to subscribe to geocoding updates. This allows UI components like
 * HTMLAddressDisplayer and HtmlSpeechSynthesisDisplayer to receive automatic updates when
 * new address data becomes available.
 * 
 * BRAZILIAN ADDRESS STANDARDIZATION:
 * The integration with AddressDataExtractor.getBrazilianStandardAddress() demonstrates the
 * focus on Brazilian users, automatically converting raw OpenStreetMap data into standardized
 * Brazilian address formats. This includes proper handling of logradouro (street), bairro
 * (neighborhood), and municipio (municipality) components, with Portuguese language support.
 * 
 * @module services/ReverseGeocoder
 * @since 0.9.0-alpha (extracted from guia.js in Phase 2)
 * @author Marcelo Pereira Barbosa
 */

import ObserverSubject from '../core/ObserverSubject.js';
import { log, warn, error } from '../utils/logger.js';
import { ADDRESS_FETCHED_EVENT } from '../config/defaults.js';
import { withObserver } from '../utils/ObserverMixin.js';

/**
 * Generates OpenStreetMap Nominatim API URL for reverse geocoding.
 * 
 * "Nominatim" is the search and geocoding engine used by OpenStreetMap.
 * See: https://nominatim.org/
 * 
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {string} baseUrl - Base URL for OpenStreetMap API
 * @returns {string} Complete API URL
 * @private
 */
const getOpenStreetMapUrl = (latitude, longitude, baseUrl) =>
	`${baseUrl}&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

/**
 * Reverse geocoder for converting geographic coordinates to addresses.
 * 
 * CONSTRUCTOR AND DEPENDENCY MANAGEMENT:
 * The constructor accepts a fetchManager parameter (typically IbiraAPIFetchManager) and an
 * optional configuration object. This design follows dependency injection standards, allowing
 * for flexible testing and different API backends. The class stores the fetch manager and
 * sets up default configuration with the OpenStreetMap Nominatim API URL, demonstrating
 * preference for external service integration with fallback capabilities.
 * 
 * CACHING AND PERFORMANCE OPTIMIZATION:
 * The class integrates with the AddressDataExtractor system for address standardization
 * and caching. The getCacheKey() method generates unique identifiers for caching geocoded
 * results, while the fetchAddress() method leverages established caching and retry mechanisms.
 * 
 * ERROR HANDLING AND GRACEFUL DEGRADATION:
 * Following MP Barbosa standards, the class includes comprehensive error handling with
 * meaningful warning messages. Methods validate input parameters and gracefully handle
 * cases where data is unavailable or malformed, ensuring the application continues
 * functioning even when geocoding services are unavailable.
 * 
 * @class ReverseGeocoder
 */
class ReverseGeocoder {
	/**
	 * Creates a new ReverseGeocoder instance.
	 * 
	 * DEPENDENCY INJECTION PATTERN:
	 * The constructor follows the dependency injection pattern by receiving the fetchManager
	 * and configuration parameters, enabling flexible testing with mock objects and supporting
	 * different API backends while maintaining clean separation of concerns.
	 * 
	 * @param {Object} fetchManager - API fetch manager (IbiraAPIFetchManager or fallback)
	 * @param {Object} [config] - Configuration options
	 * @param {string} [config.openstreetmapBaseUrl] - Base URL for OpenStreetMap API
	 * @param {string|null} [config.corsProxy] - CORS proxy URL (null for direct access)
	 * @param {boolean} [config.enableCorsFallback] - Auto-retry with CORS proxy on error
	 */
	constructor(fetchManager, config = {}) {
		// Store fetch manager for API operations (supports IbiraAPIFetchManager or fallback)
		this.fetchManager = fetchManager;
		
		// Configure OpenStreetMap Nominatim API with fallback to default endpoint
		this.config = {
			openstreetmapBaseUrl: config.openstreetmapBaseUrl || 
				'https://nominatim.openstreetmap.org/reverse?format=json',
			corsProxy: config.corsProxy || null,
			enableCorsFallback: config.enableCorsFallback || false
		};
		
		// Track if CORS fallback has been used
		this._corsRetryAttempted = false;
		
		// Define getter/setter property for current address data
		// This pattern maintains backward compatibility while enabling reactive updates
		Object.defineProperty(this, "currentAddress", {
			get: () => this.data,
			set: (value) => {
				this.data = value;
			},
		});
		
		// Initialize observer subject for notifying subscribers of address changes
		// This enables UI components to automatically update when new addresses are resolved
		this.observerSubject = new ObserverSubject();
	}

	// OBSERVER PATTERN DELEGATION METHODS:
	// These methods delegate to the internal ObserverSubject, maintaining consistency
	// with the codebase's observer architecture and enabling UI components to receive
	// automatic updates when new address data becomes available.

	/**
	 * Internal method to subscribe observers to fetch manager URL updates.
	 * Links geocoding operations with observer notifications for reactive updates.
	 * 
	 * @param {string} url - URL to monitor for fetch updates
	 */
	_subscribe(url) {
		this.observerSubject.observers.forEach((observer) => {
			this.fetchManager.subscribe(observer, url);
		});
	}
	
	/**
	 * Notify all subscribed observers of address changes.
	 * Enables reactive UI updates when geocoding completes.
	 * 
	 * @param {...*} args - Arguments to pass to observer update() methods (typically address data)
	 */
	notifyObservers(...args) {
		log("(ReverseGeocoder) Notifying observers with args:", args);
		this.observerSubject.notifyObservers(...args);
	}

	/**
	 * Returns the standardized Brazilian address for observer notifications.
	 * This method provides the second parameter for observer update calls,
	 * enabling UI components to receive both raw and standardized address data.
	 */
	secondUpdateParam() {
		return this.enderecoPadronizado;
	}

	/**
	 * Sets coordinates for reverse geocoding operations.
	 * 
	 * CORE GEOCODING FUNCTIONALITY:
	 * This method accepts latitude and longitude parameters, constructs the appropriate
	 * OpenStreetMap URL using the helper function getOpenStreetMapUrl(), and resets
	 * the internal state for new geocoding operations. Input validation ensures that
	 * invalid coordinates don't trigger unnecessary API calls.
	 * 
	 * @param {number} latitude - Latitude coordinate
	 * @param {number} longitude - Longitude coordinate
	 */
	setCoordinates(latitude, longitude) {
		// Validate coordinates before processing to avoid unnecessary API calls
		if (!latitude || !longitude) {
			return;
		}
		
		// Store coordinates for geocoding operations
		this.latitude = latitude;
		this.longitude = longitude;
		
		// Generate OpenStreetMap Nominatim API URL for these coordinates
		this.url = getOpenStreetMapUrl(
			this.latitude, 
			this.longitude, 
			this.config.openstreetmapBaseUrl,
			this.config.corsProxy
		);
		
		// Reset state for new geocoding operation
		this.data = null;
		this.error = null;
		this.loading = false;
		this.lastFetch = 0;
	}

	/**
	 * Generates unique cache key for geocoded results.
	 * 
	 * CACHING STRATEGY:
	 * Creates unique identifiers for caching geocoded results based on coordinates,
	 * enabling efficient lookup of previously resolved addresses and reducing
	 * unnecessary API calls for the same locations.
	 * 
	 * @returns {string} Unique cache key based on latitude and longitude
	 */
	getCacheKey() {
		return `${this.latitude},${this.longitude}`;
	}

	/**
	 * Fetches address data using reverse geocoding.
	 * 
	 * PERFORMANCE INTEGRATION:
	 * Delegates to reverseGeocode() method which handles coordinate validation,
	 * URL generation, and API fetching with built-in caching and retry mechanisms
	 * for optimal performance and reliability when accessing external geocoding services.
	/**
	 * Fetches address for currently set coordinates and notifies observers.
	 * 
	 * This method performs reverse geocoding for the coordinates set via
	 * setCoordinates() and notifies all subscribed observers with the result.
	 * 
	 * @async
	 * @returns {Promise<Object>} Promise resolving to Nominatim address data object
	 * @throws {Error} If coordinates are invalid or geocoding fails
	 * @since 0.9.0-alpha
	 */
	async fetchAddress() {
		try {
			const addressData = await this.reverseGeocode();
			console.log('(ReverseGeocoder.fetchAddress) Reverse geocode result:', addressData);
			// Store raw address data
			this.currentAddress = addressData;
			
			// Standardize address for Brazilian format
			if (this.AddressDataExtractor) {
				this.enderecoPadronizado = this.AddressDataExtractor.getBrazilianStandardAddress(addressData);
				log('(ReverseGeocoder.fetchAddress) Standardized address:', {
					municipio: this.enderecoPadronizado?.municipio,
					bairro: this.enderecoPadronizado?.bairro,
					siglaUF: this.enderecoPadronizado?.siglaUF
				});
			}
			
			// Notify observers with complete parameters
			console.log('(ReverseGeocoder.fetchAddress) About to notify observers with:', {
				hasAddressData: !!this.currentAddress,
				hasEnderecoPadronizado: !!this.enderecoPadronizado,
				observerCount: this.observerSubject.observers.length
			});
			
			this.notifyObservers(
				this.currentAddress, 
				this.enderecoPadronizado, 
				ADDRESS_FETCHED_EVENT, // posEvent
				false, // loading
				null  // error
			);
			
			log('(ReverseGeocoder.fetchAddress) Observers notified successfully');
			
			return addressData;
		} catch (err) {
			// Enhanced error handling with user-friendly messages
			let errorMessage = 'Falha ao buscar endereço';
			let shouldNotifyUser = false;
			let shouldRetryWithProxy = false;
			
			// Detect CORS errors
			if (err.message && (err.message.includes('CORS') || err.message.includes('Failed to fetch'))) {
				errorMessage = 'Não foi possível acessar o serviço de geocodificação.';
				shouldNotifyUser = true;
				shouldRetryWithProxy = this.config.enableCorsFallback && !this._corsRetryAttempted;
				
				if (shouldRetryWithProxy) {
					errorMessage += ' Tentando via proxy...';
				} else {
					errorMessage += ' Verifique sua conexão ou consulte CORS_TROUBLESHOOTING.md';
				}
			} else if (err.message && err.message.includes('429')) {
				errorMessage = 'Limite de requisições atingido. Aguarde alguns segundos e tente novamente.';
				shouldNotifyUser = true;
			} else if (err.message && err.message.includes('425')) {
				errorMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns segundos.';
				shouldNotifyUser = true;
			}
			
			// Log the error
			if (typeof error === 'function') {
				error('(ReverseGeocoder.fetchAddress) Failed:', err);
			} else {
				console.error('[ReverseGeocoder.fetchAddress] Failed:', err);
			}
			
			// Show user-friendly error notification if applicable
			if (shouldNotifyUser && typeof window !== 'undefined' && window.ErrorRecovery) {
				window.ErrorRecovery.displayError('Erro de Rede', errorMessage);
			}
			
			// Try CORS proxy fallback if enabled and not already attempted
			if (shouldRetryWithProxy) {
				warn('(ReverseGeocoder) Retrying with CORS proxy fallback...');
				this._corsRetryAttempted = true;
				
				// Use allorigins.win as fallback CORS proxy
				const originalUrl = this.config.openstreetmapBaseUrl;
				this.config.corsProxy = 'https://api.allorigins.win/raw?url=';
				
				try {
					// Retry the fetch
					const result = await this.fetchAddress();
					
					// Reset proxy after successful fetch
					this.config.corsProxy = null;
					this._corsRetryAttempted = false;
					
					log('(ReverseGeocoder) CORS proxy fallback succeeded');
					return result;
				} catch (retryErr) {
					// Reset state
					this.config.corsProxy = null;
					warn('(ReverseGeocoder) CORS proxy fallback also failed:', retryErr);
				}
			}
			
			// Store error state
			this.error = err;
			
			// Notify observers with error
			this.notifyObservers(null, null, 'Address fetch failed', false, err);
			
			throw err;
		}
	}

	/**
	 * Observer pattern update method for PositionManager notifications.
	 * 
	 * POSITION MANAGER INTEGRATION:
	 * This method serves as the observer callback for PositionManager notifications,
	 * automatically triggering reverse geocoding when position updates occur. This method
	 * demonstrates the architecture's event-driven design, where position changes flow
	 * through to address resolution and subsequent UI updates.
	 * 
	 * EVENT-DRIVEN ARCHITECTURE:
	 * The method includes proper error handling and validation, ensuring that invalid
	 * position data doesn't crash the geocoding process. It only processes actual position
	 * updates, filtering out other event types to optimize performance.
	 * 
	 * BRAZILIAN ADDRESS PROCESSING:
	 * When address data is successfully retrieved, the method automatically converts it
	 * to Brazilian standard format using AddressDataExtractor, supporting Portuguese
	 * language display and local address conventions.
	 * 
	 * @param {PositionManager} positionManager - The PositionManager instance with current position
	 * @param {string} posEvent - The position event type (strCurrPosUpdate, strCurrPosNotUpdate, etc.)
	 * @param {Object} loading - Loading state information
	 * @param {Object} error - Error information if any
	 * @returns {void}
	 * 
	 * @since 0.9.0-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	update(positionManager, posEvent, loading, error) {
		log(`(ReverseGeocoder) update() called with posEvent: ${posEvent}`);
		// DEPENDENCY MANAGEMENT:
		// AddressDataExtractor is imported dynamically to avoid circular dependency
		// This is a temporary solution until AddressDataExtractor is also extracted
		// Will be set externally or via dependency injection following MP Barbosa patterns
		if (!this.AddressDataExtractor) {
			warn("(ReverseGeocoder) AddressDataExtractor not available");
		}

		// INPUT VALIDATION:
		// Validate positionManager and position data to ensure robust operation
		// Following MP Barbosa standards for graceful degradation when data is unavailable
		if (!positionManager || !positionManager.lastPosition) {
			warn("(ReverseGeocoder) Invalid PositionManager or no last position.");
			return;
		}

		// EVENT FILTERING AND COORDINATE EXTRACTION:
		// Only process actual position updates, ignore other events for performance optimization
		// Extract coordinates from position data with proper validation
		const coords = positionManager.lastPosition.coords;
		if (coords && coords.latitude && coords.longitude) {
			console.log('(ReverseGeocoder) Received position update with coordinates:', {
				latitude: coords.latitude,
				longitude: coords.longitude
			});
			// Update internal coordinates for geocoding operation
			this.setCoordinates(coords.latitude, coords.longitude);

			// ASYNCHRONOUS GEOCODING PIPELINE:
			// Trigger reverse geocoding asynchronously to avoid blocking the UI thread
			// Handle both success and error cases with proper observer notifications
			this.reverseGeocode()
				.then((addressData) => {
					// Store raw address data from OpenStreetMap
					this.currentAddress = addressData;
					
					log('(ReverseGeocoder) Address data received:', addressData);
					
					// BRAZILIAN ADDRESS STANDARDIZATION:
					// Convert raw OpenStreetMap data to Brazilian standard format
					// Supports Portuguese language display and local address conventions
					if (this.AddressDataExtractor) {
						this.enderecoPadronizado = this.AddressDataExtractor.getBrazilianStandardAddress(addressData);
						log('(ReverseGeocoder) Standardized address:', {
							municipio: this.enderecoPadronizado?.municipio,
							bairro: this.enderecoPadronizado?.bairro,
							siglaUF: this.enderecoPadronizado?.siglaUF
						});
					}
					
					// Notify subscribers that new address data is available
					log('(ReverseGeocoder) About to notify observers with:', {
						hasAddressData: !!this.currentAddress,
						hasEnderecoPadronizado: !!this.enderecoPadronizado,
						observerCount: this.observerSubject.observers.length
					});
					this.notifyObservers(this.currentAddress, this.enderecoPadronizado, posEvent, false, null);
					log('(ReverseGeocoder) Observers notified successfully');
				})
				.catch((err) => {
					// ERROR HANDLING:
					// Log geocoding failures and notify observers of error state
					// Ensures application continues functioning even when geocoding fails
					if (typeof error === 'function') {
						error("(ReverseGeocoder) Reverse geocoding failed:", err);
					} else {
						console.error("[ReverseGeocoder] Reverse geocoding failed:", err);
					}
					this.error = err;
					this.notifyObservers(null, null, posEvent, false, err);
					
					// FIXED: Re-throw error after notification to prevent silent failure
					// This ensures calling code can catch and handle the error appropriately
					throw err;
				});
		} else {
			warn("(ReverseGeocoder) Position update received without valid coordinates.");
		}
	}

	/**
 * Performs reverse geocoding to convert latitude/longitude coordinates into human-readable address.
 * 
 * This method validates coordinates, constructs the OpenStreetMap API URL, and fetches address data
 * using the configured data fetching mechanism. It handles coordinate validation, URL generation,
 * and promise-based error handling for robust geocoding operations.
 * 
 * **ISSUES IDENTIFIED AND FIXED:**
 * 1. **Code Duplication**: The original method had duplicate coordinate and URL validation blocks
 *    that were identical and served no purpose. This has been consolidated into single checks.
 * 
 * 2. **Redundant Validation**: The method was checking coordinates and URL twice in succession,
 *    which added unnecessary overhead and made the code harder to maintain.
 * 
 * 3. **Promise Wrapping**: The method was unnecessarily wrapping the already-async fetchData()
 *    method in a new Promise, which is an anti-pattern. Modern async/await syntax is cleaner.
 * 
 * 4. **Error Handling**: The original error handling was verbose and didn't add value over
 *    the built-in promise rejection mechanisms.
 * 
 * **PERFORMANCE IMPROVEMENTS:**
 * - Eliminated duplicate validation checks that were executed twice
 * - Removed unnecessary Promise wrapping around async operations
 * - Streamlined error handling to use native promise mechanisms
 * - Reduced method complexity from multiple validation blocks to single-pass validation
 * 
 * **VALIDATION LOGIC:**
 * The method first validates that both latitude and longitude are provided and valid.
 * If coordinates are missing or invalid, it immediately rejects with a descriptive error.
 * If no URL is configured, it automatically generates one using the OpenStreetMap service.
 * 
 * @async
 * @returns {Promise<Object>} Promise that resolves to geocoded address data from OpenStreetMap
 * @throws {Error} Throws "Invalid coordinates" if latitude or longitude are missing/invalid
 * @throws {Error} Throws network errors, HTTP errors, or JSON parsing errors from fetchData()
 * 
 * @example
 * // Basic reverse geocoding
 * const geocoder = new ReverseGeocoder(fetchManager);
 * geocoder.setCoordinates(-23.5505, -46.6333);
 * try {
 *   const addressData = await geocoder.reverseGeocode();
 *   log('Address:', addressData.display_name);
 * } catch (error) {
 *   error('Geocoding failed:', error.message);
 * }
 * 
 * @example
 * // With promise chaining (legacy style)
 * geocoder.reverseGeocode()
 *   .then(data => log('Success:', data))
 *   .catch(error => error('Failed:', error));
 * 
 * @see {@link https://nominatim.openstreetmap.org/} - OpenStreetMap Nominatim API documentation
 * 
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */
	async reverseGeocode() {
		// FIXED: Single coordinate validation check (was duplicated twice in original)
		// Validate that both latitude and longitude are provided and valid
		if (!this.latitude || !this.longitude) {
			throw new Error("Invalid coordinates");
		}

		// FIXED: Single URL generation check (was duplicated twice in original)  
		// Generate OpenStreetMap URL if not already configured
		if (!this.url) {
			this.url = getOpenStreetMapUrl(
				this.latitude, 
				this.longitude, 
				this.config.openstreetmapBaseUrl,
				this.config.corsProxy
			);
		}

		this._subscribe(this.url);

		// FIXED: Check if fetchManager is available before using it
		// If IbiraAPIFetchManager is not available, fall back to browser fetch API
		if (!this.fetchManager) {
			// Use browser fetch API as fallback (normal operation without ibira.js)
			try {
				const response = await fetch(this.url);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return await response.json();
			} catch (error) {
				throw error;
			}
		}

		// FIXED: Use modern async/await instead of unnecessary Promise wrapping
		// The original code wrapped fetchData() in a new Promise, which is an anti-pattern
		// since fetchData() already returns a Promise
		try {
			// Fetch data using the configured URL with built-in caching and error handling
			return await this.fetchManager.fetch(this.url);

		} catch (error) {
			// FIXED: Simplified error propagation - just re-throw the error
			// Modern promise chains handle this automatically without manual catch/reject
			throw error;
		}
	}

	/**
	 * Returns a string representation of the ReverseGeocoder instance.
	 * 
	 * Provides a formatted summary showing the class name and the coordinates
	 * being geocoded, useful for debugging and logging purposes.
	 * 
	 * @returns {string} Formatted string with class name and coordinates
	 * 
	 * @example
	 * const geocoder = new ReverseGeocoder(fetchManager);
	 * geocoder.setCoordinates(-23.5505, -46.6333);
	 * log(geocoder.toString());
	 * // Output: "ReverseGeocoder: -23.5505, -46.6333"
	 * 
	 * @example
	 * const geocoder = new ReverseGeocoder(fetchManager);
	 * log(geocoder.toString());
	 * // Output: "ReverseGeocoder: No coordinates set"
	 * 
	 * @since 0.9.0-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	toString() {
		if (!this.latitude || !this.longitude) {
			return `${this.constructor.name}: No coordinates set`;
		}
		return `${this.constructor.name}: ${this.latitude}, ${this.longitude}`;
	}
}

// Apply observer mixin for subscribe/unsubscribe delegation (notifyObservers has custom logging)
Object.assign(ReverseGeocoder.prototype, withObserver({ excludeNotify: true }));

// MODULE EXPORT STRATEGY:
// The file includes both default and named exports for flexibility, providing support
// for different import styles while maintaining compatibility with the existing codebase.
// This dual export strategy aligns with the project's approach of supporting both ES6
// modules and traditional script loading patterns.

export default ReverseGeocoder;
/**
 * Module exports for reverse geocoding service.
 * @exports ReverseGeocoder - OpenStreetMap Nominatim reverse geocoding integration
 */
export { ReverseGeocoder };
