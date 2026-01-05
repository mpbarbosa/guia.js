/**
 * Browser-based geolocation provider using the Web Geolocation API.
 * 
 * ARCHITECTURAL OVERVIEW:
 * Wraps the browser's navigator.geolocation API to provide a clean, testable
 * interface for geolocation services. This class isolates the browser-specific
 * code from the business logic in GeolocationService.
 * 
 * DEPENDENCY INJECTION:
 * Accepts navigator object as constructor parameter to enable testing and
 * support different browser environments.
 * 
 * REFERENTIAL TRANSPARENCY:
 * The class methods are thin wrappers around the browser API. Side effects
 * (geolocation calls) are isolated at this boundary, making higher-level
 * code more testable and predictable.
 * 
 * @module services/providers/BrowserGeolocationProvider
 * @since 0.6.1-alpha
 * @author Marcelo Pereira Barbosa
 */

import GeolocationProvider from './GeolocationProvider.js';

/**
 * Browser geolocation provider using navigator.geolocation API.
 * 
 * @class BrowserGeolocationProvider
 * @extends GeolocationProvider
 */
class BrowserGeolocationProvider extends GeolocationProvider {
	/**
	 * Creates a new BrowserGeolocationProvider instance.
	 * 
	 * DEPENDENCY INJECTION:
	 * Accepts navigator object to enable testing with mock objects and
	 * support different execution environments (browser, Node.js).
	 * 
	 * @param {Object} [navigatorObj] - Navigator object (injectable for testing)
	 * 
	 * @example
	 * // Browser usage
	 * const provider = new BrowserGeolocationProvider(navigator);
	 * 
	 * @example
	 * // Testing with mock
	 * const mockNavigator = { geolocation: { getCurrentPosition: jest.fn() } };
	 * const provider = new BrowserGeolocationProvider(mockNavigator);
	 */
	constructor(navigatorObj) {
		super();
		
		// Use provided navigator or global navigator if available
		this.navigator = navigatorObj || (typeof navigator !== 'undefined' ? navigator : null);
	}

	/**
	 * Gets the current geographic position.
	 * 
	 * Delegates to navigator.geolocation.getCurrentPosition with all parameters.
	 * 
	 * @param {Function} successCallback - Called with position on success
	 * @param {Function} errorCallback - Called with error on failure
	 * @param {Object} options - Geolocation options
	 * @returns {void}
	 */
	getCurrentPosition(successCallback, errorCallback, options) {
		if (!this.isSupported()) {
			const error = {
				code: 0,
				message: 'Geolocation is not supported'
			};
			if (errorCallback) {
				errorCallback(error);
			}
			return;
		}

		this.navigator.geolocation.getCurrentPosition(
			successCallback,
			errorCallback,
			options
		);
	}

	/**
	 * Starts watching the geographic position for changes.
	 * 
	 * Delegates to navigator.geolocation.watchPosition with all parameters.
	 * 
	 * @param {Function} successCallback - Called with position on each update
	 * @param {Function} errorCallback - Called with error on failure
	 * @param {Object} options - Geolocation options
	 * @returns {number|null} Watch ID for clearing the watch, or null if not supported
	 */
	watchPosition(successCallback, errorCallback, options) {
		if (!this.isSupported()) {
			return null;
		}

		return this.navigator.geolocation.watchPosition(
			successCallback,
			errorCallback,
			options
		);
	}

	/**
	 * Stops watching the geographic position.
	 * 
	 * Delegates to navigator.geolocation.clearWatch.
	 * 
	 * @param {number} watchId - Watch ID returned from watchPosition
	 * @returns {void}
	 */
	clearWatch(watchId) {
		if (this.isSupported() && watchId !== null) {
			this.navigator.geolocation.clearWatch(watchId);
		}
	}

	/**
	 * Checks if geolocation is supported by the browser.
	 * 
	 * PURE FUNCTION:
	 * Deterministic check based on navigator object structure.
	 * No side effects, always returns same result for same navigator object.
	 * 
	 * @returns {boolean} True if geolocation is supported
	 */
	isSupported() {
		return Boolean(this.navigator && 'geolocation' in this.navigator);
	}

	/**
	 * Checks if Permissions API is supported by the browser.
	 * 
	 * PURE FUNCTION:
	 * Deterministic check based on navigator object structure.
	 * 
	 * @returns {boolean} True if Permissions API is supported
	 */
	isPermissionsAPISupported() {
		return Boolean(this.navigator && 'permissions' in this.navigator);
	}

	/**
	 * Gets the navigator object for advanced use cases.
	 * 
	 * @returns {Object|null} Navigator object or null if not available
	 */
	getNavigator() {
		return this.navigator;
	}
}

// Export as both default and named export for compatibility
export default BrowserGeolocationProvider;
export { BrowserGeolocationProvider };
