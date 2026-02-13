'use strict';

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
 * **REFACTORED v0.9.0-alpha**: Now uses composition with AddressChangeDetector,
 * CallbackRegistry, and AddressDataStore for improved maintainability.
 * 
 * @module data/AddressCache
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import ObserverSubject from '../core/ObserverSubject.js';
import AddressExtractor from './AddressExtractor.js';
import BrazilianStandardAddress from './BrazilianStandardAddress.js';
import LRUCache from './LRUCache.js';
import { log } from '../utils/logger.js';
import timerManager from '../utils/TimerManager.js';

// NEW: Import refactored classes (v0.9.0-alpha)
import AddressChangeDetector from './AddressChangeDetector.js';
import CallbackRegistry from './CallbackRegistry.js';
import AddressDataStore from './AddressDataStore.js';

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
	 * @since 0.9.0-alpha
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
	 * **REFACTORED v0.9.0-alpha**: Now uses composition with three focused classes:
	 * - AddressChangeDetector for change detection logic
	 * - CallbackRegistry for callback management
	 * - AddressDataStore for data storage
	 * 
	 * @private
	 * @since 0.9.0-alpha
	 */
	constructor() {
		this.observerSubject = new ObserverSubject();
		
		// Use LRUCache for efficient caching with automatic eviction
		this.cache = new LRUCache(50, 300000); // 50 entries, 5 minutes expiration
		
		// NEW (v0.9.0-alpha): Composition with focused classes
		this.changeDetector = new AddressChangeDetector();
		this.callbackRegistry = new CallbackRegistry();
		this.dataStore = new AddressDataStore();
		
		// DEPRECATED (v0.9.0-alpha): Legacy properties kept for backward compatibility
		// These are now managed by the composed classes above but maintained
		// for any direct property access (use getInstance() methods instead)
		// Initialize from dataStore to ensure consistency
		this.lastNotifiedChangeSignature = null;
		this.lastNotifiedBairroChangeSignature = null;
		this.lastNotifiedMunicipioChangeSignature = null;
		this.logradouroChangeCallback = null;
		this.bairroChangeCallback = null;
		this.municipioChangeCallback = null;
		this.currentAddress = this.dataStore.getCurrent().address;
		this.previousAddress = this.dataStore.getPrevious().address;
		this.currentRawData = this.dataStore.getCurrentRawData();
		this.previousRawData = this.dataStore.getPreviousRawData();
		
		// Instance-based cleanup timer using TimerManager (prevents memory leaks)
		timerManager.setInterval(() => {
			this.cleanExpiredEntries();
		}, 60000, 'address-cache-cleanup'); // Clean expired entries every 60 seconds
	}

	/**
	 * Generates a cache key for address data to enable efficient caching and retrieval.
	 * 
	 * **REFACTORED v0.9.0-alpha**: Delegates to AddressDataStore.generateCacheKey()
	 * 
	 * @param {Object} data - Address data from geocoding API
	 * @returns {string|null} Cache key string or null if data is invalid
	 * @since 0.9.0-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	generateCacheKey(data) {
		return AddressDataStore.generateCacheKey(data);
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().generateCacheKey() or AddressDataStore.generateCacheKey() instead
	 * @static
	 */
	static generateCacheKey(data) {
		return AddressDataStore.generateCacheKey(data);
	}

	/**
	 * Evicts least recently used cache entries when maximum cache size is reached.
	 * 
	 * Delegates to LRUCache which automatically handles LRU eviction when
	 * entries are added via set(). This method is now a no-op since eviction
	 * happens automatically, but kept for backward compatibility.
	 * 
	 * @private
	 * @since 0.9.0-alpha
	 * @deprecated Eviction now automatic in LRUCache.set()
	 */
	evictLeastRecentlyUsedIfNeeded() {
		// No-op: LRUCache handles eviction automatically in set()
		// Kept for backward compatibility
	}

	/**
	 * Cleans up expired cache entries based on timestamp.
	 * 
	 * Delegates to LRUCache.cleanExpired() which removes all entries
	 * that have exceeded the expiration time.
	 * 
	 * @private
	 * @since 0.9.0-alpha
	 */
	cleanExpiredEntries() {
		const removed = this.cache.cleanExpired();
		
		if (removed > 0) {
			log(`(AddressCache) Cleaned ${removed} expired cache entries`);
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
	 * @since 0.9.0-alpha
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
		
		// Clear changeDetector signatures for fresh start
		this.changeDetector.clearAllSignatures();
		
		// Clear dataStore history
		this.dataStore.clear();
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
	 * **REFACTORED v0.9.0-alpha**: Delegates to CallbackRegistry
	 * 
	 * @example
	 * const cache = AddressCache.getInstance();
	 * cache.setLogradouroChangeCallback((changeDetails) => {
	 *   log('Street changed:', changeDetails);
	 * });
	 * 
	 * @since 0.9.0-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	setLogradouroChangeCallback(callback) {
		this.callbackRegistry.register('logradouro', callback);
		// Legacy: Keep property synchronized for backward compatibility
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
	 *   log('Neighborhood changed:', changeDetails);
	 * });
	 * 
	 * @since 0.9.0-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	setBairroChangeCallback(callback) {
		this.callbackRegistry.register('bairro', callback);
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
	 *   log('Municipality changed:', changeDetails);
	 * });
	 * 
	 * @since 0.9.0-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	setMunicipioChangeCallback(callback) {
		this.callbackRegistry.register('municipio', callback);
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
	 * @since 0.9.0-alpha
	 */
	getLogradouroChangeCallback() {
		return this.callbackRegistry.get('logradouro');
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
	 * @since 0.9.0-alpha
	 */
	getBairroChangeCallback() {
		return this.callbackRegistry.get('bairro');
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
	 * @since 0.9.0-alpha
	 */
	getMunicipioChangeCallback() {
		return this.callbackRegistry.get('municipio');
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
	 * **REFACTORED v0.9.0-alpha**: Now delegates to AddressChangeDetector
	 * 
	 * @returns {boolean} True if logradouro has changed and not yet notified
	 * @since 0.9.0-alpha
	 */
	hasLogradouroChanged() {
		const current = this.dataStore.getCurrent().address;
		const previous = this.dataStore.getPrevious().address;
		
		if (!current || !previous) {
			return false;
		}
		
		const hasChanged = this.changeDetector.hasFieldChanged(
			'logradouro',
			current,
			previous
		);
		
		// Sync legacy property for backward compatibility
		if (hasChanged) {
			this.lastNotifiedChangeSignature = 
				`${previous.logradouro}=>${current.logradouro}`;
		}
		
		return hasChanged;
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
	 * **REFACTORED v0.9.0-alpha**: Now delegates to AddressChangeDetector
	 * 
	 * @returns {boolean} True if bairro has changed and not yet notified
	 * @since 0.9.0-alpha
	 */
	hasBairroChanged() {
		const current = this.dataStore.getCurrent().address;
		const previous = this.dataStore.getPrevious().address;
		
		if (!current || !previous) {
			return false;
		}
		
		const hasChanged = this.changeDetector.hasFieldChanged(
			'bairro',
			current,
			previous
		);
		
		// Sync legacy property for backward compatibility
		if (hasChanged) {
			this.lastNotifiedBairroChangeSignature = 
				`${previous.bairro}=>${current.bairro}`;
		}
		
		return hasChanged;
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
	 * **REFACTORED v0.9.0-alpha**: Now delegates to AddressChangeDetector
	 * 
	 * @returns {boolean} True if municipio has changed and not yet notified
	 * @since 0.9.0-alpha
	 */
	hasMunicipioChanged() {
		const current = this.dataStore.getCurrent().address;
		const previous = this.dataStore.getPrevious().address;
		
		if (!current || !previous) {
			return false;
		}
		
		const hasChanged = this.changeDetector.hasFieldChanged(
			'municipio',
			current,
			previous
		);
		
		// Sync legacy property for backward compatibility
		if (hasChanged) {
			this.lastNotifiedMunicipioChangeSignature = 
				`${previous.municipio}=>${current.municipio}`;
		}
		
		return hasChanged;
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
	 * **REFACTORED v0.9.0-alpha**: Now delegates to AddressChangeDetector
	 * 
	 * @returns {Object} Change details with current and previous logradouro
	 * @since 0.9.0-alpha
	 */
	getLogradouroChangeDetails() {
		return this.changeDetector.getChangeDetails(
			'logradouro',
			this.dataStore.getCurrent().address,
			this.dataStore.getPrevious().address
		);
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
	 * **REFACTORED v0.9.0-alpha**: Now delegates to AddressChangeDetector
	 * 
	 * @returns {Object} Change details with current and previous bairro
	 * @since 0.9.0-alpha
	 */
	getBairroChangeDetails() {
		const current = this.dataStore.getCurrent().address;
		const previous = this.dataStore.getPrevious().address;
		const currentRawData = this.dataStore.getCurrentRawData();
		const previousRawData = this.dataStore.getPreviousRawData();
		
		// Compute bairroCompleto from raw data if available
		const currentBairroCompleto = this._computeBairroCompleto(currentRawData);
		const previousBairroCompleto = this._computeBairroCompleto(previousRawData);
		
		// Return legacy format for backward compatibility
		return {
			hasChanged: (current?.bairro ?? null) !== (previous?.bairro ?? null),
			current: {
				bairro: current?.bairro,
				bairroCompleto: currentBairroCompleto
			},
			previous: {
				bairro: previous?.bairro,
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
	 * @since 0.9.0-alpha
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
	 * **REFACTORED v0.9.0-alpha**: Now delegates to AddressChangeDetector
	 * 
	 * @returns {Object} Change details with current and previous municipio
	 * @since 0.9.0-alpha
	 */
	getMunicipioChangeDetails() {
		const current = this.dataStore.getCurrent().address;
		const previous = this.dataStore.getPrevious().address;
		
		const currentMunicipio = current?.municipio ?? undefined;
		const previousMunicipio = previous?.municipio ?? undefined;
		const currentUf = current?.uf ?? undefined;
		const previousUf = previous?.uf ?? undefined;

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
	 * @since 0.9.0-alpha
	 */
	getBrazilianStandardAddress(data) {
		const cacheKey = this.generateCacheKey(data);

		if (cacheKey) {
			// Clean expired entries periodically
			this.cleanExpiredEntries();

			// Check if we have a valid cached entry
			const cached = this.cache.get(cacheKey);
			if (cached) {
				// LRUCache.get() already handles expiration and LRU updates
				return cached.address;
			}
		}

		// Create new standardized address using AddressExtractor
		const extractor = new AddressExtractor(data);

		// Cache the result if we have a valid key
		if (cacheKey) {
			// Store in cache (LRUCache handles eviction automatically)
			this.cache.set(cacheKey, {
				address: extractor.enderecoPadronizado,
				rawData: data, // Store raw data for detailed change information
			});

			// Update data store with new address and raw data (v0.9.0-alpha refactoring)
			this.dataStore.update(extractor.enderecoPadronizado, data);
			
			// Sync legacy properties for backward compatibility
			this.currentAddress = this.dataStore.getCurrent().address;
			this.previousAddress = this.dataStore.getPrevious().address;
			this.currentRawData = this.dataStore.getCurrentRawData();
			this.previousRawData = this.dataStore.getPreviousRawData();

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
					error(
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
					error(
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
					error(
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
		return AddressCache.getInstance().cache.maxSize;
	}

	/**
	 * Static setter for maxCacheSize property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set maxCacheSize(value) {
		AddressCache.getInstance().cache.maxSize = value;
	}

	/**
	 * Static getter for cacheExpirationMs property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static get cacheExpirationMs() {
		return AddressCache.getInstance().cache.expirationMs;
	}

	/**
	 * Static setter for cacheExpirationMs property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set cacheExpirationMs(value) {
		AddressCache.getInstance().cache.expirationMs = value;
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

	/**
	 * Destroys the cache and cleans up all resources.
	 * 
	 * Stops the cleanup timer, clears the cache, and releases references.
	 * This method is critical for preventing timer leaks, especially in
	 * test environments where instances are created and destroyed frequently.
	 * 
	 * @returns {void}
	 * @since 0.9.0-alpha
	 * @author Marcelo Pereira Barbosa
	 * 
	 * @example
	 * const cache = AddressCache.getInstance();
	 * // ... use cache
	 * cache.destroy(); // Clean up when done
	 * 
	 * @example
	 * // In tests
	 * afterEach(() => {
	 *   const cache = AddressCache.getInstance();
	 *   cache.destroy();
	 * });
	 */
	destroy() {
		// Stop cleanup timer to prevent leak
		timerManager.clearTimer('address-cache-cleanup');
		
		// Clear all cached data
		this.clearCache();
		
		// Release references to prevent memory leaks
		this.observerSubject = null;
		this.logradouroChangeCallback = null;
		this.bairroChangeCallback = null;
		this.municipioChangeCallback = null;
		this.currentAddress = null;
		this.previousAddress = null;
		this.currentRawData = null;
		this.previousRawData = null;
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().destroy() instead
	 * @static
	 */
	static destroy() {
		return AddressCache.getInstance().destroy();
	}
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
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */

export default AddressCache;
/**
 * Module exports for address caching.
 * @exports AddressCache - LRU cache for geocoded addresses
 */
export { AddressCache };
