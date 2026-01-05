/**
 * Mock geolocation provider for testing and development.
 * 
 * ARCHITECTURAL OVERVIEW:
 * Provides a controllable, predictable geolocation provider for unit and
 * integration testing. Eliminates dependencies on actual browser APIs,
 * making tests faster, more reliable, and deterministic.
 * 
 * TESTING BENEFITS:
 * - No need for browser environment in tests
 * - Deterministic behavior (no real GPS required)
 * - Ability to simulate errors and edge cases
 * - Instant responses (no network delays)
 * 
 * REFERENTIAL TRANSPARENCY:
 * This mock follows the same interface as BrowserGeolocationProvider but
 * with controlled, predictable behavior that can be configured for testing.
 * 
 * @module services/providers/MockGeolocationProvider
 * @since 0.6.1-alpha
 * @author Marcelo Pereira Barbosa
 */

import GeolocationProvider from './GeolocationProvider.js';

/**
 * Mock geolocation provider for testing.
 * 
 * @class MockGeolocationProvider
 * @extends GeolocationProvider
 */
class MockGeolocationProvider extends GeolocationProvider {
	/**
	 * Creates a new MockGeolocationProvider instance.
	 * 
	 * @param {Object} config - Configuration for mock behavior
	 * @param {boolean} [config.supported=true] - Whether geolocation is supported
	 * @param {Object} [config.defaultPosition=null] - Default position to return
	 * @param {Object} [config.defaultError=null] - Default error to return
	 * @param {number} [config.delay=0] - Delay in ms before callbacks (simulates async)
	 * 
	 * @example
	 * // Mock successful geolocation
	 * const provider = new MockGeolocationProvider({
	 *   defaultPosition: {
	 *     coords: { latitude: -23.5505, longitude: -46.6333 },
	 *     timestamp: Date.now()
	 *   }
	 * });
	 * 
	 * @example
	 * // Mock geolocation error
	 * const provider = new MockGeolocationProvider({
	 *   defaultError: { code: 1, message: 'Permission denied' }
	 * });
	 */
	constructor(config = {}) {
		super();
		
		this.config = {
			supported: config.supported !== undefined ? config.supported : true,
			defaultPosition: config.defaultPosition || null,
			defaultError: config.defaultError || null,
			delay: config.delay || 0
		};
		
		// Track watch IDs
		this.watchIdCounter = 0;
		this.activeWatches = new Map();
	}

	/**
	 * Gets the current geographic position.
	 * 
	 * Returns configured default position or error after optional delay.
	 * 
	 * @param {Function} successCallback - Called with position on success
	 * @param {Function} errorCallback - Called with error on failure
	 * @param {Object} options - Geolocation options (unused in mock)
	 * @returns {void}
	 */
	getCurrentPosition(successCallback, errorCallback, options) {
		if (!this.isSupported()) {
			const error = {
				code: 0,
				message: 'Geolocation is not supported'
			};
			this._callWithDelay(() => {
				if (errorCallback) errorCallback(error);
			});
			return;
		}

		this._callWithDelay(() => {
			if (this.config.defaultError) {
				if (errorCallback) {
					errorCallback(this.config.defaultError);
				}
			} else if (this.config.defaultPosition) {
				if (successCallback) {
					successCallback(this.config.defaultPosition);
				}
			} else {
				// No position or error configured
				if (errorCallback) {
					errorCallback({
						code: 2,
						message: 'Position unavailable'
					});
				}
			}
		});
	}

	/**
	 * Starts watching the geographic position for changes.
	 * 
	 * Returns a watch ID and optionally calls callbacks repeatedly.
	 * 
	 * @param {Function} successCallback - Called with position on each update
	 * @param {Function} errorCallback - Called with error on failure
	 * @param {Object} options - Geolocation options (unused in mock)
	 * @returns {number|null} Watch ID for clearing the watch, or null if not supported
	 */
	watchPosition(successCallback, errorCallback, options) {
		if (!this.isSupported()) {
			return null;
		}

		const watchId = ++this.watchIdCounter;
		
		this.activeWatches.set(watchId, {
			successCallback,
			errorCallback,
			options
		});

		// Call immediately with default position or error
		this._callWithDelay(() => {
			if (!this.activeWatches.has(watchId)) {
				return; // Watch was cleared
			}

			if (this.config.defaultError) {
				if (errorCallback) {
					errorCallback(this.config.defaultError);
				}
			} else if (this.config.defaultPosition) {
				if (successCallback) {
					successCallback(this.config.defaultPosition);
				}
			}
		});

		return watchId;
	}

	/**
	 * Stops watching the geographic position.
	 * 
	 * @param {number} watchId - Watch ID returned from watchPosition
	 * @returns {void}
	 */
	clearWatch(watchId) {
		this.activeWatches.delete(watchId);
	}

	/**
	 * Checks if geolocation is supported.
	 * 
	 * @returns {boolean} True if geolocation is configured as supported
	 */
	isSupported() {
		return this.config.supported;
	}

	/**
	 * Checks if Permissions API is supported.
	 * 
	 * @returns {boolean} Always returns false for mock
	 */
	isPermissionsAPISupported() {
		return false;
	}

	/**
	 * Sets the position that will be returned by future calls.
	 * 
	 * Useful for testing position updates.
	 * 
	 * @param {Object} position - Position object to return
	 * @returns {void}
	 * 
	 * @example
	 * provider.setPosition({
	 *   coords: { latitude: -22.9068, longitude: -43.1729 },
	 *   timestamp: Date.now()
	 * });
	 */
	setPosition(position) {
		this.config.defaultPosition = position;
		this.config.defaultError = null;
	}

	/**
	 * Sets the error that will be returned by future calls.
	 * 
	 * Useful for testing error handling.
	 * 
	 * @param {Object} error - Error object to return
	 * @returns {void}
	 * 
	 * @example
	 * provider.setError({ code: 1, message: 'Permission denied' });
	 */
	setError(error) {
		this.config.defaultError = error;
		this.config.defaultPosition = null;
	}

	/**
	 * Triggers an update for all active watches.
	 * 
	 * Useful for testing continuous position monitoring.
	 * 
	 * @param {Object} [position] - Position to send (uses default if not provided)
	 * @returns {void}
	 * 
	 * @example
	 * const watchId = provider.watchPosition(callback);
	 * provider.triggerWatchUpdate({ coords: { latitude: -23.5, longitude: -46.6 } });
	 */
	triggerWatchUpdate(position) {
		const positionToSend = position || this.config.defaultPosition;
		
		this.activeWatches.forEach((watch) => {
			if (watch.successCallback && positionToSend) {
				watch.successCallback(positionToSend);
			}
		});
	}

	/**
	 * Triggers an error for all active watches.
	 * 
	 * @param {Object} [error] - Error to send (uses default if not provided)
	 * @returns {void}
	 */
	triggerWatchError(error) {
		const errorToSend = error || this.config.defaultError || {
			code: 2,
			message: 'Position unavailable'
		};
		
		this.activeWatches.forEach((watch) => {
			if (watch.errorCallback) {
				watch.errorCallback(errorToSend);
			}
		});
	}

	/**
	 * Helper to call function with configured delay.
	 * 
	 * @private
	 * @param {Function} fn - Function to call
	 * @returns {void}
	 */
	_callWithDelay(fn) {
		if (this.config.delay > 0) {
			setTimeout(fn, this.config.delay);
		} else {
			// Call synchronously (but still async to simulate Promise behavior)
			setTimeout(fn, 0);
		}
	}
}

// Export as both default and named export for compatibility
export default MockGeolocationProvider;
export { MockGeolocationProvider };
