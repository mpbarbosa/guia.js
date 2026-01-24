'use strict';
import { log, warn, error } from '../utils/logger.js';

/**
 * Legacy address data extractor facade.
 * 
 * This module provides backward compatibility for the original AddressDataExtractor
 * class while delegating to the refactored AddressExtractor and AddressCache classes.
 * Following the Single Responsibility Principle, the original class was split into
 * specialized components with clear, focused responsibilities.
 * 
 * @module data/AddressDataExtractor
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */

import AddressExtractor from './AddressExtractor.js';
import AddressCache from './AddressCache.js';

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
 * 
 * @example
 * // Legacy usage (still supported)
 * const extractor = new AddressDataExtractor(geocodingData);
 * const address = extractor.enderecoPadronizado;
 * 
 * @example
 * // Preferred modern usage
 * const address = AddressCache.getBrazilianStandardAddress(geocodingData);
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

export default AddressDataExtractor;
/**
 * Module exports for address data extraction.
 * @exports AddressDataExtractor - Facade for address extraction and caching operations
 */
export { AddressDataExtractor };