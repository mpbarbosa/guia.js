/**
 * Reverse geocoding service for converting coordinates to addresses.
 * 
 * Provides reverse geocoding functionality using the OpenStreetMap Nominatim API
 * to convert latitude/longitude coordinates into human-readable addresses.
 * Implements the observer pattern to notify subscribers of address changes.
 * 
 * @module services/ReverseGeocoder
 * @since 0.8.7-alpha (extracted from guia.js in Phase 2)
 * @author Marcelo Pereira Barbosa
 */

import ObserverSubject from '../core/ObserverSubject.js';
import { warn } from '../utils/logger.js';

/**
 * Generates OpenStreetMap Nominatim API URL for reverse geocoding.
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
 * @class ReverseGeocoder
 */
class ReverseGeocoder {
	/**
	 * Creates a new ReverseGeocoder instance.
	 * 
	 * @param {Object} fetchManager - API fetch manager (IbiraAPIFetchManager)
	 * @param {Object} [config] - Configuration options
	 * @param {string} [config.openstreetmapBaseUrl] - Base URL for OpenStreetMap API
	 */
	constructor(fetchManager, config = {}) {
		this.fetchManager = fetchManager;
		this.config = {
			openstreetmapBaseUrl: config.openstreetmapBaseUrl || 
				'https://nominatim.openstreetmap.org/reverse?format=json'
		};
		
		Object.defineProperty(this, "currentAddress", {
			get: () => this.data,
			set: (value) => {
				this.data = value;
			},
		});
		this.observerSubject = new ObserverSubject();
	}

	subscribe(observer) {
		this.observerSubject.subscribe(observer);
	}

	_subscribe(url) {
		this.observerSubject.observers.forEach((observer) => {
			this.fetchManager.subscribe(observer, url);
		});
	}
	
	unsubscribe(observer) {
		this.observerSubject.unsubscribe(observer);
	}

	notifyObservers(...args) {
		this.observerSubject.notifyObservers(...args);
	}

	secondUpdateParam() {
		return this.enderecoPadronizado;
	}

	setCoordinates(latitude, longitude) {
		if (!latitude || !longitude) {
			return;
		}
		this.latitude = latitude;
		this.longitude = longitude;
		this.url = getOpenStreetMapUrl(this.latitude, this.longitude, this.config.openstreetmapBaseUrl);
		this.data = null;
		this.error = null;
		this.loading = false;
		this.lastFetch = 0;
	}

	getCacheKey() {
		return `${this.latitude},${this.longitude}`;
	}

	async fetchAddress() {
		return super.fetchData();
	}

	/**
	 * Observer pattern update method for PositionManager notifications.
	 * 
	 * This method is called when the PositionManager notifies observers about position changes.
	 * It updates the geocoder coordinates and triggers reverse geocoding for new positions.
	 * 
	 * @param {PositionManager} positionManager - The PositionManager instance with current position
	 * @param {string} posEvent - The position event type (strCurrPosUpdate, strCurrPosNotUpdate, etc.)
	 * @param {Object} loading - Loading state information
	 * @param {Object} error - Error information if any
	 * @returns {void}
	 * 
	 * @since 0.8.3-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	update(positionManager, posEvent, loading, error) {
		// Import AddressDataExtractor dynamically to avoid circular dependency
		// This is a temporary solution until AddressDataExtractor is also extracted
		if (!this.AddressDataExtractor) {
			// Will be set externally or via dependency injection
			warn("(ReverseGeocoder) AddressDataExtractor not available");
		}

		if (!positionManager || !positionManager.lastPosition) {
			warn("(ReverseGeocoder) Invalid PositionManager or no last position.");
			return;
		}

		// Only process actual position updates, ignore other events
		const coords = positionManager.lastPosition.coords;
		if (coords && coords.latitude && coords.longitude) {
			// Update coordinates
			this.setCoordinates(coords.latitude, coords.longitude);

			// Trigger reverse geocoding asynchronously
			this.reverseGeocode()
				.then((addressData) => {
					this.currentAddress = addressData;
					if (this.AddressDataExtractor) {
						this.enderecoPadronizado = this.AddressDataExtractor.getBrazilianStandardAddress(addressData);
					}
					// Notify this geocoder's own observers
					this.notifyObservers(posEvent);
				})
				.catch((error) => {
					console.error("(ReverseGeocoder) Reverse geocoding failed:", error);
					this.error = error;
					this.notifyObservers(posEvent);
				});
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
 *   console.log('Address:', addressData.display_name);
 * } catch (error) {
 *   console.error('Geocoding failed:', error.message);
 * }
 * 
 * @example
 * // With promise chaining (legacy style)
 * geocoder.reverseGeocode()
 *   .then(data => console.log('Success:', data))
 *   .catch(error => console.error('Failed:', error));
 * 
 * @see {@link https://nominatim.openstreetmap.org/} - OpenStreetMap Nominatim API documentation
 * 
 * @since 0.8.3-alpha
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
			this.url = getOpenStreetMapUrl(this.latitude, this.longitude, this.config.openstreetmapBaseUrl);
		}

		this._subscribe(this.url);

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
	 * console.log(geocoder.toString());
	 * // Output: "ReverseGeocoder: -23.5505, -46.6333"
	 * 
	 * @example
	 * const geocoder = new ReverseGeocoder(fetchManager);
	 * console.log(geocoder.toString());
	 * // Output: "ReverseGeocoder: No coordinates set"
	 * 
	 * @since 0.8.4-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	toString() {
		if (!this.latitude || !this.longitude) {
			return `${this.constructor.name}: No coordinates set`;
		}
		return `${this.constructor.name}: ${this.latitude}, ${this.longitude}`;
	}
}

// Export as both default and named export for flexibility
export default ReverseGeocoder;
export { ReverseGeocoder };
