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
import PositionManager from '../core/PositionManager.js';
import { log, warn, error } from '../utils/logger.js';
import { ADDRESS_FETCHED_EVENT, GEOCODING_ERROR_EVENT } from '../config/defaults.js';
import { withObserver } from '../utils/ObserverMixin.js';
import { env } from '../config/environment.js';
import AwsGeocoder from './AwsGeocoder.js';

/**
 * Generates OpenStreetMap Nominatim API URL for reverse geocoding.
 * 
 * "Nominatim" is the search and geocoding engine used by OpenStreetMap.
 * See: https://nominatim.org/
 * 
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {string} baseUrl - Base URL for OpenStreetMap API
 * @param {string|null} corsProxy - Optional CORS proxy URL prefix
 * @returns {string} Complete API URL (with or without CORS proxy)
 * @private
 */
const getOpenStreetMapUrl = (latitude: number, longitude: number, baseUrl: string, corsProxy: string | null = null): string => {
	const nominatimUrl = `${baseUrl}&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
	// Wrap with CORS proxy if provided
	return corsProxy ? `${corsProxy}${encodeURIComponent(nominatimUrl)}` : nominatimUrl;
};

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
	latitude: number | null;
	longitude: number | null;
	url: string | null;
	config: { openstreetmapBaseUrl: string; corsProxy: string | null; enableCorsFallback: boolean };
	_awsGeocoder: { reverseGeocode(lat: number, lon: number): Promise<{ rawData: unknown; enderecoPadronizado: unknown }> } | null;
	_primaryProvider: 'aws' | 'nominatim';
	_corsRetryAttempted: boolean;
	observerSubject!: ObserverSubject;
	currentAddress: unknown;
	enderecoPadronizado: unknown;
	data: unknown;
	error: unknown;
	loading: boolean;
	lastFetch: number;
	fetchManager: { fetch(url: string): Promise<unknown>; subscribe(observer: unknown, url: string): void; observers?: unknown[] } | null;
	AddressDataExtractor: { getBrazilianStandardAddress(data: unknown): unknown } | null;
	declare subscribe: (observer: unknown) => void;
	declare unsubscribe: (observer: unknown) => void;

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
	 * @param {AwsGeocoder} [config.awsGeocoder] - AWS geocoder instance (injected or auto-created)
	 */
	constructor(fetchManager: typeof ReverseGeocoder.prototype.fetchManager, config: {
		openstreetmapBaseUrl?: string;
		corsProxy?: string | null;
		enableCorsFallback?: boolean;
		awsGeocoder?: ReverseGeocoder['_awsGeocoder'];
	} = {}) {
		// Initialize declared properties
		this.latitude = null;
		this.longitude = null;
		this.url = null;
		this.enderecoPadronizado = null;
		this.data = null;
		this.error = null;
		this.loading = false;
		this.lastFetch = 0;
		this.AddressDataExtractor = null;

		// Store fetch manager for API operations (supports IbiraAPIFetchManager or fallback)
		this.fetchManager = fetchManager;
		
		// Configure OpenStreetMap Nominatim API with fallback to default endpoint
		this.config = {
			openstreetmapBaseUrl: config.openstreetmapBaseUrl || 
				`${env.nominatimApiUrl}/reverse?format=json`,
			corsProxy: config.corsProxy || null,
			enableCorsFallback: config.enableCorsFallback || false
		};

		// AWS geocoder: use injected instance, or auto-create when AWS is enabled
		this._awsGeocoder = config.awsGeocoder ||
			(env.awsLbsEnabled && env.awsLbsBaseUrl ? new AwsGeocoder() : null);

		// Runtime-switchable primary provider (initialized from env config)
		this._primaryProvider = (env.geocodingPrimaryProvider === 'nominatim') ? 'nominatim' : 'aws';
		
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
	_subscribe(url: string) {
		if (!this.fetchManager) return;
		const fm = this.fetchManager;
		this.observerSubject.observers.forEach((observer: unknown) => {
			fm.subscribe(observer, url);
		});
	}
	
	/**
	 * Notify all subscribed observers of address changes.
	 * Enables reactive UI updates when geocoding completes.
	 * 
	 * @param {...*} args - Arguments to pass to observer update() methods (typically address data)
	 */
	notifyObservers(...args: unknown[]) {
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
	setCoordinates(latitude: number, longitude: number) {
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
	async fetchAddress(): Promise<unknown> {
		// Determine provider order. Reads from the runtime-switchable field so
		// callers can use switchProvider() without restarting the application.
		const primaryIsAws = this._primaryProvider !== 'nominatim';

		// ── Primary provider: AWS Location Based Service (when configured as primary) ──
		if (primaryIsAws && this._awsGeocoder && this.latitude && this.longitude) {
			try {
				const { rawData, enderecoPadronizado } = await this._awsGeocoder.reverseGeocode(
					this.latitude, this.longitude
				);
				this.currentAddress = rawData;
				this.enderecoPadronizado = enderecoPadronizado;
				log('(ReverseGeocoder.fetchAddress) AWS provider succeeded');
				this._dispatchProviderEvent('aws');
				this.notifyObservers(
					this.currentAddress,
					this.enderecoPadronizado,
					ADDRESS_FETCHED_EVENT,
					false,
					null
				);
				return rawData;
			} catch (awsErr) {
				warn('(ReverseGeocoder.fetchAddress) AWS provider failed, falling back to Nominatim:', (awsErr as Error).message);
			}
		}

		// ── Primary/Fallback provider: OpenStreetMap Nominatim ───────────────
		try {
			const addressData = await this.reverseGeocode();
			console.log('(ReverseGeocoder.fetchAddress) Reverse geocode result:', addressData);
			// Store raw address data
			this.currentAddress = addressData;
			
			// Standardize address for Brazilian format
			if (this.AddressDataExtractor) {
				this.enderecoPadronizado = this.AddressDataExtractor.getBrazilianStandardAddress(addressData);
				log('(ReverseGeocoder.fetchAddress) Standardized address:', {
					municipio: (this.enderecoPadronizado as Record<string, unknown> | null)?.municipio,
					bairro: (this.enderecoPadronizado as Record<string, unknown> | null)?.bairro,
					siglaUF: (this.enderecoPadronizado as Record<string, unknown> | null)?.siglaUF
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
			this._dispatchProviderEvent('nominatim');
			
			return addressData;
		} catch (err) {
			// ── Fallback: AWS Location Based Service (when Nominatim is primary) ─
			if (!primaryIsAws && this._awsGeocoder && this.latitude && this.longitude) {
				try {
					const { rawData, enderecoPadronizado } = await this._awsGeocoder.reverseGeocode(
						this.latitude, this.longitude
					);
					this.currentAddress = rawData;
					this.enderecoPadronizado = enderecoPadronizado;
					log('(ReverseGeocoder.fetchAddress) AWS fallback succeeded');
					this._dispatchProviderEvent('aws');
					this.notifyObservers(
						this.currentAddress,
						this.enderecoPadronizado,
						ADDRESS_FETCHED_EVENT,
						false,
						null
					);
					return rawData;
				} catch (awsErr) {
					warn('(ReverseGeocoder.fetchAddress) AWS fallback also failed:', (awsErr as Error).message);
				}
			}

			// Enhanced error handling with user-friendly messages
			let errorMessage = 'Falha ao buscar endereço';
			let shouldNotifyUser = false;
			let shouldRetryWithProxy = false;
			
			// Detect CORS errors
			if ((err as Error).message && ((err as Error).message.includes('CORS') || (err as Error).message.includes('Failed to fetch'))) {
				errorMessage = 'Não foi possível acessar o serviço de geocodificação.';
				shouldNotifyUser = true;
				shouldRetryWithProxy = this.config.enableCorsFallback && !this._corsRetryAttempted;
				
				if (shouldRetryWithProxy) {
					errorMessage += ' Tentando via proxy...';
				} else {
					errorMessage += ' Verifique sua conexão ou consulte CORS_TROUBLESHOOTING.md';
				}
			} else if ((err as Error).message && (err as Error).message.includes('429')) {
				errorMessage = 'Limite de requisições atingido. Aguarde alguns segundos e tente novamente.';
				shouldNotifyUser = true;
			} else if ((err as Error).message && (err as Error).message.includes('425')) {
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
				this.config.corsProxy = 'https://api.allorigins.win/raw?url=';
				
				try {
					// Retry the fetch
					const result: unknown = await this.fetchAddress();
					
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
			
			// Notify observers with proper error event
			this.notifyObservers(null, null, GEOCODING_ERROR_EVENT, false, err);
			
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
	update(positionManager: unknown, posEvent: unknown, _loading: unknown, _errState: unknown) {
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
		if (!positionManager || !(positionManager as { lastPosition?: unknown }).lastPosition) {
			warn("(ReverseGeocoder) Invalid PositionManager or no last position.");
			return;
		}

		// EVENT TYPE VALIDATION:
		// Only process when position was actually updated, not when rejected
		// Prevents unnecessary geocoding when position fails validation (accuracy, distance, time)
		if (posEvent !== PositionManager.strCurrPosUpdate && 
		    posEvent !== PositionManager.strImmediateAddressUpdate) {
			log(`(ReverseGeocoder) Ignoring event: ${posEvent} - not a position update`);
			return;
		}

		// EVENT FILTERING AND COORDINATE EXTRACTION:
		// Only process actual position updates, ignore other events for performance optimization
		// Extract coordinates from position data with proper validation
		const pm = positionManager as { lastPosition: { coords: { latitude: number; longitude: number } } };
		const coords = pm.lastPosition.coords;
		if (coords && coords.latitude && coords.longitude) {
			console.log('(ReverseGeocoder) Received position update with coordinates:', {
				latitude: coords.latitude,
				longitude: coords.longitude
			});
			// Update internal coordinates for geocoding operation
			this.setCoordinates(coords.latitude, coords.longitude);

			// ASYNCHRONOUS GEOCODING PIPELINE:
			// Use fetchAddress() which includes CORS retry logic and proper error handling
			// This ensures consistent behavior whether called directly or via observer pattern
			this.fetchAddress()
				.then(() => {
					// fetchAddress() handles observer notifications internally
					// Success path logs are already included in fetchAddress()
					log('(ReverseGeocoder.update) Geocoding completed successfully');
				})
				.catch((err: unknown) => {
					// ERROR HANDLING:
					// Log geocoding failures but DO NOT notify observers
					// fetchAddress() already handles CORS retry and error notifications
					// Just log the error here for debugging purposes
					if (typeof error === 'function') {
						error("(ReverseGeocoder.update) Geocoding failed:", err);
					} else {
						console.error("[ReverseGeocoder.update] Geocoding failed:", err);
					}
					this.error = err;
					
					// Error already logged, no need to re-throw since observers
					// don't need notification on error (no data to display)
				});
		} else {
			warn("(ReverseGeocoder) Position update received without valid coordinates. Coordinates:", coords);
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
			} catch (e) {
				throw e;
			}
		}

		// FIXED: Use modern async/await instead of unnecessary Promise wrapping
		// The original code wrapped fetchData() in a new Promise, which is an anti-pattern
		// since fetchData() already returns a Promise
		try {
			// Fetch data using the configured URL with built-in caching and error handling
			return await this.fetchManager.fetch(this.url);

		} catch (e) {
			// FIXED: Simplified error propagation - just re-throw the error
			// Modern promise chains handle this automatically without manual catch/reject
			throw e;
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

	/**
	 * Switches the primary geocoding provider at runtime.
	 *
	 * Allows the application to toggle between Nominatim and AWS Location
	 * Service without restarting. The change takes effect on the next call
	 * to `fetchAddress()`.
	 *
	 * @param {'aws'|'nominatim'} provider - The provider to set as primary
	 * @throws {Error} If `provider` is not a recognised value
	 * @fires CustomEvent#geocoder-provider-changed
	 *
	 * @example
	 * reverseGeocoder.switchProvider('nominatim');
	 */
	switchProvider(provider: 'aws' | 'nominatim'): void {
		if (provider !== 'aws' && provider !== 'nominatim') {
			throw new Error(`(ReverseGeocoder) Unknown provider: "${provider}". Use 'aws' or 'nominatim'.`);
		}
		if (this._primaryProvider === provider) return; // no-op

		log(`(ReverseGeocoder) Switching primary provider: ${this._primaryProvider} → ${provider}`);
		this._primaryProvider = provider;

		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('geocoder-provider-changed', { detail: { provider } }));
		}
	}

	/**
	 * Returns whether the AWS geocoder is available (configured and enabled).
	 *
	 * @returns {boolean}
	 */
	hasAwsProvider(): boolean {
		return this._awsGeocoder !== null;
	}

	/**
	 * Returns the name of the currently configured primary provider.
	 *
	 * @returns {'aws'|'nominatim'}
	 */
	getPrimaryProvider(): 'aws' | 'nominatim' {
		return this._primaryProvider;
	}

	/**
	 * Dispatches a 'geocoder-provider-used' CustomEvent so the UI can reflect
	 * which LBS handled the last geocoding request.
	 *
	 * @param {'aws'|'nominatim'} provider
	 * @private
	 */
	_dispatchProviderEvent(provider: 'aws' | 'nominatim'): void {
		if (typeof window === 'undefined') return;
		window.dispatchEvent(new CustomEvent('geocoder-provider-used', { detail: { provider } }));
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
