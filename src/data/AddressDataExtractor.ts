/**
 * Legacy address data extractor facade.
 * 
 * This module provides backward compatibility for the original AddressDataExtractor
 * class while delegating to the refactored AddressExtractor and AddressCache classes.
 * Following the Single Responsibility Principle, the original class was split into
 * specialized components with clear, focused responsibilities.
 * 
 * @module data/AddressDataExtractor
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import type BrazilianStandardAddress from './BrazilianStandardAddress.js';
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
 * @since 0.9.0-alpha
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
	data: object;
	enderecoPadronizado: BrazilianStandardAddress;

	constructor(data: object) {
		const extractor = new AddressExtractor(data);
		this.data = extractor.data;
		this.enderecoPadronizado = extractor.enderecoPadronizado;
		Object.freeze(this);
	}

	/**
	 * Delegates to AddressCache for cache key generation.
	 * @static
	 */
	static generateCacheKey(data: object) {
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
	static setLogradouroChangeCallback(callback: ((...args: unknown[]) => void) | null) {
		return AddressCache.setLogradouroChangeCallback(callback);
	}

	/**
	 * Delegates to AddressCache for callback management.
	 * @static
	 */
	static setBairroChangeCallback(callback: ((...args: unknown[]) => void) | null) {
		return AddressCache.setBairroChangeCallback(callback);
	}

	/**
	 * Delegates to AddressCache for callback management.
	 * @static
	 */
	static setMunicipioChangeCallback(callback: ((...args: unknown[]) => void) | null) {
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
	static getBrazilianStandardAddress(data: object) {
		return AddressCache.getBrazilianStandardAddress(data);
	}

	/**
	 * Returns a string representation of this extractor.
	 * 
	 * @returns {string} String representation
	 * @since 0.9.0-alpha
	 */
	toString() {
		return `${this.constructor.name}: ${this.enderecoPadronizado.enderecoCompleto()}`;
	}
}

// Legacy static properties for AddressDataExtractor - delegated to AddressCache singleton
// These maintain backward compatibility but all operations use AddressCache singleton internally
// Use property descriptors to create live references that stay synchronized
type AnyRecord = Record<string, unknown>;
const _getCache = (): AnyRecord => AddressCache.getInstance() as unknown as AnyRecord;

Object.defineProperties(AddressDataExtractor, {
	cache: {
		get: () => _getCache().cache,
		set: (value) => { _getCache().cache = value; }
	},
	maxCacheSize: {
		get: () => _getCache().maxCacheSize,
		set: (value) => { _getCache().maxCacheSize = value; }
	},
	cacheExpirationMs: {
		get: () => _getCache().cacheExpirationMs,
		set: (value) => { _getCache().cacheExpirationMs = value; }
	},
	lastNotifiedChangeSignature: {
		get: () => _getCache().lastNotifiedChangeSignature,
		set: (value) => { _getCache().lastNotifiedChangeSignature = value; }
	},
	lastNotifiedBairroChangeSignature: {
		get: () => _getCache().lastNotifiedBairroChangeSignature,
		set: (value) => { _getCache().lastNotifiedBairroChangeSignature = value; }
	},
	lastNotifiedMunicipioChangeSignature: {
		get: () => _getCache().lastNotifiedMunicipioChangeSignature,
		set: (value) => { _getCache().lastNotifiedMunicipioChangeSignature = value; }
	},
	logradouroChangeCallback: {
		get: () => _getCache().logradouroChangeCallback,
		set: (value) => { _getCache().logradouroChangeCallback = value; }
	},
	bairroChangeCallback: {
		get: () => _getCache().bairroChangeCallback,
		set: (value) => { _getCache().bairroChangeCallback = value; }
	},
	municipioChangeCallback: {
		get: () => _getCache().municipioChangeCallback,
		set: (value) => { _getCache().municipioChangeCallback = value; }
	},
	currentAddress: {
		get: () => _getCache().currentAddress,
		set: (value) => { _getCache().currentAddress = value; }
	},
	previousAddress: {
		get: () => _getCache().previousAddress,
		set: (value) => { _getCache().previousAddress = value; }
	}
});

export default AddressDataExtractor;
/**
 * Module exports for address data extraction.
 * @exports AddressDataExtractor - Facade for address extraction and caching operations
 */
export { AddressDataExtractor };