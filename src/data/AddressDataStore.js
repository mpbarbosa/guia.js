'use strict';

/**
 * Address data storage with history tracking.
 * 
 * Manages current and previous address data (both standardized and raw formats),
 * providing a clean interface for data access and cache key generation.
 * 
 * **Key Features**:
 * - Stores current and previous addresses with automatic history management
 * - Generates cache keys from raw geocoding data
 * - Provides null-safe data access methods
 * - Immutable design following MP Barbosa standards
 * 
 * **Design Pattern**:
 * This class extracts data storage responsibilities from AddressCache,
 * implementing the Single Responsibility Principle and simplifying
 * the cache coordination logic.
 * 
 * @module data/AddressDataStore
 * @since 0.8.7-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * import AddressDataStore from './AddressDataStore.js';
 * 
 * const store = new AddressDataStore();
 * 
 * // Update with new address
 * store.update(standardizedAddress, rawGeocodingData);
 * 
 * // Access current data
 * const { address, raw } = store.getCurrent();
 * 
 * // Check if we have history
 * if (store.hasHistory()) {
 *   const { address: prev } = store.getPrevious();
 *   console.log('Changed from', prev.logradouro, 'to', address.logradouro);
 * }
 * 
 * @example
 * // Generate cache key from raw data
 * const key = AddressDataStore.generateCacheKey(rawData);
 */
class AddressDataStore {
	
	/**
	 * Creates a new AddressDataStore instance.
	 * 
	 * Initializes storage with null values for all address data.
	 * 
	 * @since 0.8.7-alpha
	 */
	constructor() {
		/**
		 * Current standardized address object
		 * @type {Object|null}
		 * @private
		 */
		this.currentAddress = null;
		
		/**
		 * Previous standardized address object
		 * @type {Object|null}
		 * @private
		 */
		this.previousAddress = null;
		
		/**
		 * Current raw geocoding data
		 * @type {Object|null}
		 * @private
		 */
		this.currentRawData = null;
		
		/**
		 * Previous raw geocoding data
		 * @type {Object|null}
		 * @private
		 */
		this.previousRawData = null;
	}
	
	/**
	 * Updates address data, moving current to previous.
	 * 
	 * This method implements automatic history tracking by:
	 * 1. Moving current address to previous
	 * 2. Moving current raw data to previous
	 * 3. Setting new current values
	 * 
	 * @param {Object|null} newAddress - New standardized address object
	 * @param {Object|null} newRawData - New raw geocoding data
	 * @returns {void}
	 * 
	 * @example
	 * store.update(standardizedAddress, rawData);
	 * 
	 * @example
	 * // Can update with null to clear current
	 * store.update(null, null);
	 * 
	 * @since 0.8.7-alpha
	 */
	update(newAddress, newRawData) {
		// Move current to previous
		this.previousAddress = this.currentAddress;
		this.previousRawData = this.currentRawData;
		
		// Set new current
		this.currentAddress = newAddress;
		this.currentRawData = newRawData;
	}
	
	/**
	 * Gets current address data.
	 * 
	 * Returns an object containing both standardized address and raw data.
	 * 
	 * @returns {{address: Object|null, raw: Object|null}} Current address and raw data
	 * 
	 * @example
	 * const { address, raw } = store.getCurrent();
	 * if (address) {
	 *   console.log('Current:', address.logradouro);
	 * }
	 * 
	 * @since 0.8.7-alpha
	 */
	getCurrent() {
		return {
			address: this.currentAddress,
			raw: this.currentRawData
		};
	}
	
	/**
	 * Gets previous address data.
	 * 
	 * Returns an object containing both standardized address and raw data
	 * from before the last update.
	 * 
	 * @returns {{address: Object|null, raw: Object|null}} Previous address and raw data
	 * 
	 * @example
	 * const { address, raw } = store.getPrevious();
	 * if (address) {
	 *   console.log('Previous:', address.logradouro);
	 * }
	 * 
	 * @since 0.8.7-alpha
	 */
	getPrevious() {
		return {
			address: this.previousAddress,
			raw: this.previousRawData
		};
	}
	
	/**
	 * Checks if store has both current and previous data.
	 * 
	 * Returns true only if both current and previous addresses exist,
	 * indicating history is available for change detection.
	 * 
	 * @returns {boolean} True if both current and previous addresses exist
	 * 
	 * @example
	 * if (store.hasHistory()) {
	 *   // Safe to compare current and previous
	 *   const changed = current.bairro !== previous.bairro;
	 * }
	 * 
	 * @since 0.8.7-alpha
	 */
	hasHistory() {
		return this.currentAddress !== null && this.previousAddress !== null;
	}
	
	/**
	 * Gets current raw data only.
	 * Convenience method for backward compatibility.
	 * 
	 * @returns {Object|null} Current raw data from geocoding API
	 * @since 0.8.7-alpha
	 */
	getCurrentRawData() {
		return this.currentRawData;
	}
	
	/**
	 * Gets previous raw data only.
	 * Convenience method for backward compatibility.
	 * 
	 * @returns {Object|null} Previous raw data from geocoding API
	 * @since 0.8.7-alpha
	 */
	getPreviousRawData() {
		return this.previousRawData;
	}
	
	/**
	 * Clears all stored address data.
	 * 
	 * Resets the store to initial state with all values set to null.
	 * 
	 * @returns {void}
	 * 
	 * @example
	 * store.clear();
	 * console.log(store.hasHistory()); // false
	 * 
	 * @since 0.8.7-alpha
	 */
	clear() {
		this.currentAddress = null;
		this.previousAddress = null;
		this.currentRawData = null;
		this.previousRawData = null;
	}
	
	/**
	 * Checks if current address exists.
	 * 
	 * @returns {boolean} True if current address is not null
	 * 
	 * @example
	 * if (store.hasCurrent()) {
	 *   console.log('We have a current address');
	 * }
	 * 
	 * @since 0.8.7-alpha
	 */
	hasCurrent() {
		return this.currentAddress !== null;
	}
	
	/**
	 * Checks if previous address exists.
	 * 
	 * @returns {boolean} True if previous address is not null
	 * 
	 * @example
	 * if (store.hasPrevious()) {
	 *   console.log('We have a previous address');
	 * }
	 * 
	 * @since 0.8.7-alpha
	 */
	hasPrevious() {
		return this.previousAddress !== null;
	}
	
	/**
	 * Clears all stored address data and resets history.
	 * 
	 * Resets both current and previous address data (standardized and raw formats)
	 * to null, effectively clearing the entire address history.
	 * 
	 * @returns {void}
	 * 
	 * @example
	 * store.clear();
	 * console.log(store.getCurrent().address); // null
	 * console.log(store.hasHistory()); // false
	 * 
	 * @since 0.8.7-alpha
	 */
	clear() {
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
	 * This is a static method as it doesn't depend on instance state and can be used
	 * independently for cache key generation.
	 * 
	 * @static
	 * @param {Object} data - Address data from geocoding API
	 * @returns {string|null} Cache key string or null if data is invalid
	 * 
	 * @example
	 * const key = AddressDataStore.generateCacheKey(geocodingData);
	 * if (key) {
	 *   console.log('Cache key:', key);
	 * }
	 * 
	 * @example
	 * // Returns null for invalid data
	 * const key = AddressDataStore.generateCacheKey(null); // null
	 * const key2 = AddressDataStore.generateCacheKey({}); // null
	 * 
	 * @since 0.8.7-alpha
	 */
	static generateCacheKey(data) {
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
}

// Export for ES6 modules
export default AddressDataStore;

// CommonJS compatibility (Node.js)
if (typeof module !== 'undefined' && module.exports) {
	module.exports = AddressDataStore;
}
