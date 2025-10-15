/**
 * Geolocation service for browser-based location access.
 * 
 * Provides a wrapper around the browser Geolocation API with enhanced error handling,
 * permission management, and integration with PositionManager for centralized state.
 * 
 * @module services/GeolocationService
 * @since 0.8.7-alpha (extracted from guia.js in Phase 2)
 * @author Marcelo Pereira Barbosa
 */

import PositionManager from '../core/PositionManager.js';
import { log } from '../utils/logger.js';
import { GEOLOCATION_OPTIONS } from '../config/defaults.js';

/**
 * Gets error information for a geolocation error code.
 * 
 * @param {number} errorCode - Geolocation error code (1-3)
 * @returns {Object} Error info with name and message
 * @private
 */
const getGeolocationErrorInfo = (errorCode) => {
	const errorMap = {
		1: {
			name: "PermissionDeniedError",
			message: "User denied geolocation permission"
		},
		2: {
			name: "PositionUnavailableError",
			message: "Position information is unavailable"
		},
		3: {
			name: "TimeoutError",
			message: "Geolocation request timed out"
		}
	};

	return errorMap[errorCode] || {
		name: "UnknownGeolocationError",
		message: "Unknown geolocation error occurred"
	};
};

/**
 * Formats a geolocation error into a consistent Error object.
 * 
 * @param {Object} error - Raw geolocation error with code property
 * @returns {Error} Formatted error object with descriptive message
 * @private
 */
const formatGeolocationError = (error) => {
	const errorInfo = getGeolocationErrorInfo(error.code);

	const formattedError = new Error(errorInfo.message);
	formattedError.name = errorInfo.name;
	formattedError.code = error.code;
	formattedError.originalError = error;

	return formattedError;
};

/**
 * Gets Portuguese error message for geolocation error code.
 * 
 * @param {number} errorCode - Geolocation error code
 * @returns {string} Portuguese error message
 * @private
 */
const getGeolocationErrorMessage = (errorCode) => {
	const errorMessages = {
		1: "Permissão negada pelo usuário",
		2: "Posição indisponível",
		3: "Timeout na obtenção da posição"
	};

	return errorMessages[errorCode] || "Erro desconhecido";
};

/**
 * Generates HTML for displaying geolocation error.
 * 
 * @param {Object} error - Geolocation error object
 * @returns {string} HTML string for error display
 * @private
 */
const generateErrorDisplayHTML = (error) => {
	const errorMessage = getGeolocationErrorMessage(error.code);

	return `
		<div class="location-error">
			<h4>Erro na Obtenção da Localização</h4>
			<p><strong>Código:</strong> ${error.code}</p>
			<p><strong>Mensagem:</strong> ${errorMessage}</p>
			<p><strong>Detalhes:</strong> ${error.message}</p>
		</div>
	`;
};

/**
 * Checks if navigator geolocation is supported.
 * 
 * @param {Object} navigatorObj - Navigator object to check
 * @returns {boolean} True if geolocation is supported
 * @private
 */
const isGeolocationSupported = (navigatorObj) => {
	return navigatorObj && 'geolocation' in navigatorObj;
};

/**
 * Checks if Permissions API is supported.
 * 
 * @param {Object} navigatorObj - Navigator object to check
 * @returns {boolean} True if Permissions API is supported
 * @private
 */
const isPermissionsAPISupported = (navigatorObj) => {
	return navigatorObj && 'permissions' in navigatorObj;
};

/**
 * Geolocation service using HTML5 Geolocation API.
 * 
 * @class GeolocationService
 */
class GeolocationService {
	/**
	 * Creates a new GeolocationService instance.
	 * 
	 * Initializes the geolocation service with a target DOM element for status display
	 * and sets up the connection with the PositionManager singleton for centralized
	 * position management.
	 * 
	 * **Dependency Injection:**
	 * The navigator parameter enables dependency injection for testing. By allowing
	 * the navigator object to be passed in, the class becomes more testable and
	 * follows the Dependency Inversion Principle.
	 * 
	 * @param {HTMLElement} [locationResult] - DOM element for displaying location results
	 * @param {Object} [navigatorObj] - Navigator object (injectable for testing)
	 * @param {Object} [positionManagerInstance] - PositionManager instance (injectable for testing)
	 * @param {Object} [config] - Configuration options
	 * @param {Object} [config.geolocationOptions] - Geolocation API options
	 * 
	 * @example
	 * const resultDiv = document.getElementById('location-display');
	 * const service = new GeolocationService(resultDiv);
	 * 
	 * @example
	 * // With dependency injection for testing
	 * const mockNavigator = { geolocation: mockGeolocationAPI };
	 * const mockPositionManager = { update: jest.fn() };
	 * const service = new GeolocationService(null, mockNavigator, mockPositionManager);
	 * 
	 * @since 0.8.3-alpha
	 */
	constructor(locationResult, navigatorObj, positionManagerInstance, config = {}) {
		this.locationResult = locationResult;
		this.watchId = null;
		this.isWatching = false;
		this.lastKnownPosition = null;
		this.permissionStatus = null;
		this.isPendingRequest = false; // Prevents race conditions from overlapping requests

		// Configuration with defaults
		this.config = {
			geolocationOptions: config.geolocationOptions || GEOLOCATION_OPTIONS
		};

		// Store navigator for dependency injection (enables testing)
		// Use provided navigator or global navigator if available
		this.navigator = navigatorObj || (typeof navigator !== 'undefined' ? navigator : null);

		// Get reference to PositionManager singleton (or use injected instance)
		this.positionManager = positionManagerInstance || PositionManager.getInstance();
	}

	/**
	 * Checks the current geolocation permission status.
	 * 
	 * Uses the modern Permissions API to check if the application has permission
	 * to access the user's location. This method provides a way to check permissions
	 * before attempting to get the user's location, allowing for better UX.
	 * 
	 * @async
	 * @returns {Promise<string>} Promise that resolves to permission state: 'granted', 'denied', or 'prompt'
	 * 
	 * @example
	 * const permission = await service.checkPermissions();
	 * if (permission === 'granted') {
	 *   // Safe to request location
	 * }
	 * 
	 * @since 0.8.3-alpha
	 */
	async checkPermissions() {
		try {
			if (isPermissionsAPISupported(this.navigator)) {
				const permission = await this.navigator.permissions.query({ name: 'geolocation' });
				this.permissionStatus = permission.state;
				return permission.state;
			} else {
				// Fallback for browsers without Permissions API
				return 'prompt';
			}
		} catch (error) {
			console.error("(GeolocationService) Error checking permissions:", error);
			return 'prompt';
		}
	}

	/**
	 * Gets a single location update using the Geolocation API.
	 * 
	 * Requests the user's current position once with high accuracy settings.
	 * This method integrates with the PositionManager to ensure all position
	 * data is centrally managed and properly validated.
	 * 
	 * **Concurrent Request Protection:**
	 * If a request is already pending, this method will reject immediately to
	 * prevent race conditions and stale data. Check `isPendingRequest()` before
	 * calling if you need to avoid errors from overlapping calls.
	 * 
	 * **Privacy Notice:**
	 * Location data is sensitive. Errors are logged without coordinates to protect
	 * user privacy. Full position data is only passed to authorized components.
	 * 
	 * @async
	 * @returns {Promise<GeolocationPosition>} Promise that resolves to the current position
	 * @throws {GeolocationPositionError} Geolocation API errors (permission denied, unavailable, timeout)
	 * @throws {Error} If a request is already pending (race condition prevention)
	 * 
	 * @example
	 * try {
	 *   const position = await service.getSingleLocationUpdate();
	 *   console.log('Lat:', position.coords.latitude);
	 *   console.log('Lng:', position.coords.longitude);
	 * } catch (error) {
	 *   console.error('Location error:', error.message);
	 * }
	 * 
	 * @example
	 * // Check for pending requests before calling
	 * if (!service.hasPendingRequest()) {
	 *   const position = await service.getSingleLocationUpdate();
	 * }
	 * 
	 * @since 0.8.3-alpha
	 */
	async getSingleLocationUpdate() {
		return new Promise((resolve, reject) => {
			// Prevent race conditions from overlapping requests
			if (this.isPendingRequest) {
				const error = new Error("A geolocation request is already pending");
				error.name = "RequestPendingError";
				reject(error);
				return;
			}

			if (!isGeolocationSupported(this.navigator)) {
				const error = new Error("Geolocation is not supported by this browser");
				error.name = "NotSupportedError";
				reject(error);
				return;
			}

			this.isPendingRequest = true;

			this.navigator.geolocation.getCurrentPosition(
				(position) => {
					this.isPendingRequest = false;
					this.lastKnownPosition = position;

					// Update PositionManager with new position
					this.positionManager.update(position);

					// Update display if element is available
					if (this.locationResult) {
						this.updateLocationDisplay(position);
					}

					resolve(position);
				},
				(error) => {
					this.isPendingRequest = false;
					// Privacy: Log error without coordinates
					console.error("(GeolocationService) Single location update failed:", error.message || error);

					// Update display with error if element is available
					if (this.locationResult) {
						this.updateErrorDisplay(error);
					}

					reject(formatGeolocationError(error));
				},
				this.config.geolocationOptions
			);
		});
	}

	/**
	 * Starts watching the user's position for continuous updates.
	 * 
	 * Begins continuous position monitoring using the Geolocation API's watchPosition
	 * method. Updates are automatically sent to the PositionManager for validation
	 * and processing according to the configured tracking rules.
	 * 
	 * **Privacy Notice:**
	 * Continuous tracking involves sensitive location data. Ensure users have
	 * consented to location tracking and understand how their data will be used.
	 * Stop tracking when no longer needed to preserve battery and privacy.
	 * 
	 * @returns {number|null} Watch ID for stopping the position watching, or null if not supported
	 * 
	 * @example
	 * const watchId = service.watchCurrentLocation();
	 * // Later, to stop watching:
	 * service.stopWatching();
	 * 
	 * @since 0.8.3-alpha
	 */
	watchCurrentLocation() {
		if (!isGeolocationSupported(this.navigator)) {
			console.error("(GeolocationService) Geolocation is not supported by this browser");
			return null;
		}

		if (this.isWatching) {
			return this.watchId;
		}

		this.watchId = this.navigator.geolocation.watchPosition(
			(position) => {
				this.lastKnownPosition = position;

				// Update PositionManager with new position
				this.positionManager.update(position);

				// Update display if element is available
				if (this.locationResult) {
					this.updateLocationDisplay(position);
				}
			},
			(error) => {
				// Privacy: Log error without coordinates
				console.error("(GeolocationService) Position watch error:", error.message || error);

				// Update display with error if element is available
				if (this.locationResult) {
					this.updateErrorDisplay(error);
				}
			},
			this.config.geolocationOptions
		);

		this.isWatching = true;

		return this.watchId;
	}

	/**
	 * Stops watching the user's position.
	 * 
	 * Stops the continuous position monitoring that was started with watchCurrentLocation().
	 * This is important for battery life and performance when position updates are no longer needed.
	 * 
	 * @returns {void}
	 * 
	 * @example
	 * service.stopWatching(); // Stops position monitoring
	 * 
	 * @since 0.8.3-alpha
	 */
	stopWatching() {
		if (this.watchId !== null && this.isWatching) {
			this.navigator.geolocation.clearWatch(this.watchId);
			this.watchId = null;
			this.isWatching = false;
		} else {
			log("(GeolocationService) No active position watch to stop");
		}
	}

	/**
	 * Updates the location display element with current position information.
	 * 
	 * @private
	 * @param {GeolocationPosition} position - Position data from Geolocation API
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	updateLocationDisplay(position) {
		if (!this.locationResult) return;

		const coords = position.coords;
		const timestamp = new Date(position.timestamp).toLocaleString();
	}

	/**
	 * Updates the display element with error information.
	 * 
	 * @private
	 * @param {GeolocationPositionError} error - Geolocation error from API
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	updateErrorDisplay(error) {
		if (!this.locationResult) return;

		this.locationResult.innerHTML = generateErrorDisplayHTML(error);
	}

	/**
	 * Gets the last known position without making a new API request.
	 * 
	 * @returns {GeolocationPosition|null} Last known position or null if none available
	 * @since 0.8.3-alpha
	 */
	getLastKnownPosition() {
		return this.lastKnownPosition;
	}

	/**
	 * Checks if the service is currently watching position.
	 * 
	 * @returns {boolean} True if position watching is active
	 * @since 0.8.3-alpha
	 */
	isCurrentlyWatching() {
		return this.isWatching;
	}

	/**
	 * Gets the current watch ID.
	 * 
	 * @returns {number|null} Watch ID or null if not watching
	 * @since 0.8.3-alpha
	 */
	getCurrentWatchId() {
		return this.watchId;
	}

	/**
	 * Checks if a geolocation request is currently pending.
	 * 
	 * Use this method to prevent race conditions by checking if a request is
	 * already in progress before calling getSingleLocationUpdate().
	 * 
	 * @returns {boolean} True if a request is pending, false otherwise
	 * 
	 * @example
	 * if (!service.hasPendingRequest()) {
	 *   const position = await service.getSingleLocationUpdate();
	 * } else {
	 *   console.log('Request already in progress');
	 * }
	 * 
	 * @since 0.8.3-alpha
	 */
	hasPendingRequest() {
		return this.isPendingRequest;
	}
}

// Export as both default and named export for flexibility
export default GeolocationService;
export { GeolocationService };
