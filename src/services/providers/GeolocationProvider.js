'use strict';

/**
 * Interface/Base class for geolocation providers.
 * 
 * ARCHITECTURAL OVERVIEW:
 * Defines the contract that all geolocation providers must implement. This abstraction
 * enables dependency injection and makes the GeolocationService testable without 
 * requiring actual browser APIs.
 * 
 * DESIGN PRINCIPLES:
 * - Interface Segregation: Minimal, focused API for geolocation operations
 * - Dependency Inversion: GeolocationService depends on this abstraction, not concrete implementations
 * - Open/Closed: Open for extension (new providers), closed for modification
 * 
 * @module services/providers/GeolocationProvider
 * @since 0.6.1-alpha
 * @author Marcelo Pereira Barbosa
 */

/**
 * Base class/interface for geolocation providers.
 * 
 * Implementations must provide three core methods:
 * - getCurrentPosition: Get current position once
 * - watchPosition: Start continuous position monitoring
 * - clearWatch: Stop position monitoring
 * 
 * @class GeolocationProvider
 */
class GeolocationProvider {
	/**
	 * Gets the current geographic position.
	 * 
	 * @abstract
	 * @param {Function} successCallback - Called with position on success
	 * @param {Function} errorCallback - Called with error on failure
	 * @param {Object} options - Geolocation options (enableHighAccuracy, timeout, maximumAge)
	 * @returns {void}
	 * 
	 * @example
	 * provider.getCurrentPosition(
	 *   (position) => console.log(position.coords.latitude),
	 *   (error) => console.error(error.message),
	 *   { enableHighAccuracy: true, timeout: 5000 }
	 * );
	 */
	getCurrentPosition(successCallback, errorCallback, options) {
		throw new Error('GeolocationProvider.getCurrentPosition() must be implemented by subclass');
	}

	/**
	 * Starts watching the geographic position for changes.
	 * 
	 * @abstract
	 * @param {Function} successCallback - Called with position on each update
	 * @param {Function} errorCallback - Called with error on failure
	 * @param {Object} options - Geolocation options (enableHighAccuracy, timeout, maximumAge)
	 * @returns {number} Watch ID for clearing the watch
	 * 
	 * @example
	 * const watchId = provider.watchPosition(
	 *   (position) => console.log('Position updated:', position.coords),
	 *   (error) => console.error(error.message),
	 *   { enableHighAccuracy: true }
	 * );
	 */
	watchPosition(successCallback, errorCallback, options) {
		throw new Error('GeolocationProvider.watchPosition() must be implemented by subclass');
	}

	/**
	 * Stops watching the geographic position.
	 * 
	 * @abstract
	 * @param {number} watchId - Watch ID returned from watchPosition
	 * @returns {void}
	 * 
	 * @example
	 * provider.clearWatch(watchId);
	 */
	clearWatch(watchId) {
		throw new Error('GeolocationProvider.clearWatch() must be implemented by subclass');
	}

	/**
	 * Checks if geolocation is supported by this provider.
	 * 
	 * @abstract
	 * @returns {boolean} True if geolocation is supported
	 * 
	 * @example
	 * if (provider.isSupported()) {
	 *   // Use geolocation
	 * }
	 */
	isSupported() {
		throw new Error('GeolocationProvider.isSupported() must be implemented by subclass');
	}
}

// Export as both default and named export for compatibility
export default GeolocationProvider;
export { GeolocationProvider };
