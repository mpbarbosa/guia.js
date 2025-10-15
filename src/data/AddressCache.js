/**
 * Address cache with LRU eviction and change detection.
 * 
 * Manages caching of standardized addresses with sophisticated strategies including:
 * - LRU (Least Recently Used) eviction policy
 * - Time-based expiration of cache entries
 * - Change detection for address components (logradouro, bairro, municipio)
 * - Callback-based notifications for address changes
 * - Observer pattern integration
 * 
 * Implements singleton pattern ensuring only one cache instance exists.
 * 
 * @module data/AddressCache
 * @since 0.8.4-alpha
 * @author Marcelo Pereira Barbosa
 */

import ObserverSubject from '../core/ObserverSubject.js';
import AddressExtractor from './AddressExtractor.js';
import BrazilianStandardAddress from './BrazilianStandardAddress.js';
import { log } from '../utils/logger.js';

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

export default AddressCache;
export { AddressCache };
