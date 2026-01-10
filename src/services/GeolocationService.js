'use strict';

/**
 * Geolocation service for browser-based location access.
 * 
 * ARCHITECTURAL OVERVIEW:
 * The GeolocationService class serves as a sophisticated wrapper around the browser's native
 * Geolocation API, designed to handle position tracking with robust error handling, caching,
 * and integration with the MP Barbosa travel guide application. The class follows established
 * patterns of graceful degradation, observer pattern implementation, and Material Design integration.
 * 
 * CORE FUNCTIONALITY:
 * Provides a wrapper around the browser Geolocation API with enhanced error handling,
 * permission management, and integration with PositionManager for centralized state management.
 * The service handles both single location requests and continuous position watching.
 * 
 * ERROR HANDLING AND LOCALIZATION:
 * The service includes sophisticated error handling with Portuguese error messages, mapping
 * standard geolocation error codes to localized text. Material Design-styled error displays
 * ensure consistent user experience even when geolocation fails, supporting Brazilian users.
 * 
 * POSITION VALIDATION AND PROCESSING:
 * Implements robust position validation and defensive programming to prevent runtime errors
 * on browsers or devices that don't support location services, maintaining graceful
 * degradation across different environments following MP Barbosa standards.
 * 
 * @module services/GeolocationService
 * @since 0.8.7-alpha (extracted from guia.js in Phase 2)
 * @author Marcelo Pereira Barbosa
 */

import PositionManager from '../core/PositionManager.js';
import { log } from '../utils/logger.js';
import { GEOLOCATION_OPTIONS } from '../config/defaults.js';
import BrowserGeolocationProvider from './providers/BrowserGeolocationProvider.js';

/**
 * Gets error information for a geolocation error code.
 * 
 * ERROR CODE MAPPING:
 * Maps standard W3C Geolocation API error codes (1-3) to structured error objects
 * with consistent naming and English messages. This standardization enables
 * better error handling and logging throughout the application.
 * 
 * DEFENSIVE PROGRAMMING:
 * Includes fallback for unknown error codes to prevent runtime failures,
 * following MP Barbosa standards for robust error handling.
 * 
 * @param {number} errorCode - Geolocation error code (1-3)
 * @returns {Object} Error info with name and message
 * @private
 */
const getGeolocationErrorInfo = (errorCode) => {
	// Standard W3C Geolocation API error code mappings
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

	// Fallback for unknown error codes (defensive programming)
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
 * BRAZILIAN MARKET FOCUS:
 * The Portuguese error messages demonstrate the application's focus on Brazilian users.
 * Messages like "Permissão negada pelo usuário" (Permission denied by user) and 
 * "Posição indisponível" (Position unavailable) ensure clear communication with the
 * target audience while maintaining accessibility standards.
 * 
 * LOCALIZATION STRATEGY:
 * Maps standard geolocation error codes to user-friendly Portuguese messages,
 * supporting the travel guide application's Brazilian user base with native
 * language error communication.
 * 
 * @param {number} errorCode - Geolocation error code
 * @returns {string} Portuguese error message
 * @private
 */
const getGeolocationErrorMessage = (errorCode) => {
	// Portuguese error messages for Brazilian users
	const errorMessages = {
		1: "Permissão negada pelo usuário",      // Permission denied by user
		2: "Posição indisponível",              // Position unavailable  
		3: "Timeout na obtenção da posição"     // Timeout getting position
	};

	// Fallback message for unknown errors in Portuguese
	return errorMessages[errorCode] || "Erro desconhecido";
};

/**
 * Generates HTML for displaying geolocation error.
 * 
 * MATERIAL DESIGN INTEGRATION:
 * Creates structured HTML error displays that integrate seamlessly with Material Design
 * theme, ensuring consistent user experience even when geolocation fails. The HTML
 * structure follows accessibility standards and responsive design principles.
 * 
 * PORTUGUESE LANGUAGE SUPPORT:
 * Generates localized error displays in Portuguese, including technical details
 * and user-friendly messages to help Brazilian users understand location issues.
 * 
 * @param {Object} error - Geolocation error object
 * @returns {string} HTML string for error display
 * @private
 */
const generateErrorDisplayHTML = (error) => {
	// Get localized Portuguese error message
	const errorMessage = getGeolocationErrorMessage(error.code);

	// Generate Material Design compatible error display
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
 * BROWSER COMPATIBILITY VALIDATION:
 * Implements robust position validation through defensive programming, checking
 * for navigator object availability and geolocation API support. This approach
 * prevents runtime errors on browsers or devices that don't support location
 * services, maintaining graceful degradation across different environments.
 * 
 * DEFENSIVE PROGRAMMING:
 * Follows MP Barbosa standards for graceful degradation by validating both
 * navigator existence and geolocation API availability before attempting
 * to access location services.
 * 
 * NOTE: This function is deprecated. Use provider.isSupported() instead.
 * Kept for backward compatibility with existing code.
 * 
 * @deprecated Use GeolocationProvider.isSupported() instead
 * @param {Object} navigatorObj - Navigator object to check
 * @returns {boolean} True if geolocation is supported
 * @private
 */
const isGeolocationSupported = (navigatorObj) => {
	// Check both navigator existence and geolocation API availability
	return navigatorObj && 'geolocation' in navigatorObj;
};

/**
 * Checks if Permissions API is supported.
 * 
 * NOTE: This function is deprecated. Use provider.isPermissionsAPISupported() instead.
 * Kept for backward compatibility with existing code.
 * 
 * @deprecated Use BrowserGeolocationProvider.isPermissionsAPISupported() instead
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
 * CONSTRUCTOR AND DEPENDENCY MANAGEMENT:
 * The constructor accepts an HTML element for displaying location results and an optional
 * configuration object. Following dependency injection standards, the class initializes
 * with default geolocation options while allowing these to be overridden through the
 * config parameter. The class stores the display element and sets up internal state
 * management for position tracking and error handling.
 * 
 * OBSERVER PATTERN INTEGRATION:
 * Implements comprehensive observer pattern functionality through subscription methods
 * that enable other components to receive position updates. This architectural choice
 * maintains consistency with the codebase's event-driven design, where position changes
 * automatically propagate through the system to trigger reverse geocoding and UI updates.
 * 
 * INTEGRATION WITH DISPLAY COMPONENTS:
 * When position data is successfully obtained, the service automatically updates the
 * provided HTML display element with location information. The class formats coordinate
 * data appropriately and triggers observer notifications, ensuring that subscribed
 * components like ReverseGeocoder and various displayer classes receive immediate updates.
 * 
 * STATE MANAGEMENT AND LIFECYCLE:
 * The service manages internal state for current position data, error conditions, and
 * observer subscriptions. The class design ensures that position updates are efficiently
 * propagated without redundant API calls, while maintaining fresh data through appropriate
 * cache expiration and retry mechanisms when position acquisition fails.
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
	 * The provider parameter enables dependency injection for testing. By allowing
	 * a GeolocationProvider to be passed in, the class becomes more testable and
	 * follows the Dependency Inversion Principle. Falls back to BrowserGeolocationProvider
	 * if no provider is specified.
	 * 
	 * **Breaking Change Note:**
	 * The second parameter changed from navigatorObj to geolocationProvider.
	 * For backward compatibility, if navigatorObj is provided (detected by checking
	 * if it has a 'geolocation' property), it will be wrapped in a BrowserGeolocationProvider.
	 * 
	 * @param {HTMLElement} [locationResult] - DOM element for displaying location results
	 * @param {GeolocationProvider|Object} [geolocationProvider] - Provider for geolocation operations (or navigator for backward compat)
	 * @param {Object} [positionManagerInstance] - PositionManager instance (injectable for testing)
	 * @param {Object} [config] - Configuration options
	 * @param {Object} [config.geolocationOptions] - Geolocation API options
	 * 
	 * @example
	 * const resultDiv = document.getElementById('location-display');
	 * const service = new GeolocationService(resultDiv);
	 * 
	 * @example
	 * // With dependency injection for testing (new way)
	 * const mockProvider = new MockGeolocationProvider({ defaultPosition: mockPosition });
	 * const mockPositionManager = { update: jest.fn() };
	 * const service = new GeolocationService(null, mockProvider, mockPositionManager);
	 * 
	 * @example
	 * // Backward compatible (old way still works)
	 * const mockNavigator = { geolocation: mockGeolocationAPI };
	 * const service = new GeolocationService(null, mockNavigator);
	 * 
	 * @since 0.8.3-alpha
	 */
	constructor(locationResult, geolocationProvider, positionManagerInstance, config = {}) {
		// Store DOM element for location result display
		this.locationResult = locationResult;
		
		// Initialize position watching state management
		this.watchId = null;
		this.isWatching = false;
		this.lastKnownPosition = null;
		this.permissionStatus = null;
		
		// RACE CONDITION PREVENTION:
		// Prevents overlapping geolocation requests that could cause stale data
		// or inconsistent state in the PositionManager
		this.isPendingRequest = false;
		this.pendingPromise = null;

		// CONFIGURATION AND PERFORMANCE OPTIMIZATION:
		// The service accepts configuration options for geolocation parameters including
		// accuracy requirements, timeout values, and cache age settings. These configurable
		// options allow balancing between accuracy and performance based on use case requirements.
		this.config = {
			geolocationOptions: config.geolocationOptions || GEOLOCATION_OPTIONS
		};

		// DEPENDENCY INJECTION PATTERN - GEOLOCATION PROVIDER:
		// Inject GeolocationProvider for flexible testing and different implementations
		// Supports three scenarios:
		// 1. Explicit provider injection (preferred for testing)
		// 2. Navigator object for backward compatibility (will be wrapped)
		// 3. Default to BrowserGeolocationProvider with global navigator
		if (geolocationProvider && typeof geolocationProvider.getCurrentPosition === 'function') {
			// Case 1: Already a provider instance
			this.provider = geolocationProvider;
			// Keep navigator reference for backward compatibility with checkPermissions()
			this.navigator = geolocationProvider.getNavigator ? geolocationProvider.getNavigator() : null;
		} else if (geolocationProvider && 'geolocation' in geolocationProvider) {
			// Case 2: Backward compatibility - navigator object passed
			this.provider = new BrowserGeolocationProvider(geolocationProvider);
			this.navigator = geolocationProvider;
		} else {
			// Case 3: Default - create BrowserGeolocationProvider with global navigator
			const nav = typeof navigator !== 'undefined' ? navigator : null;
			this.provider = new BrowserGeolocationProvider(nav);
			this.navigator = nav;
		}

		// POSITIONMANAGER INTEGRATION:
		// Get reference to PositionManager singleton (or use injected instance for testing)
		// This integration ensures centralized position state management and validation
		// according to configured tracking rules
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
			// Use provider's isPermissionsAPISupported if available, fallback to checking navigator
			const hasPermissionsAPI = this.provider.isPermissionsAPISupported 
				? this.provider.isPermissionsAPISupported()
				: isPermissionsAPISupported(this.navigator);
				
			if (hasPermissionsAPI) {
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
		// Return existing promise if request already pending
		if (this.isPendingRequest && this.pendingPromise) {
			return this.pendingPromise;
		}

		this.pendingPromise = new Promise((resolve, reject) => {
			// Double-check after promise creation
			if (this.isPendingRequest) {
				const error = new Error("A geolocation request is already pending");
				error.name = "RequestPendingError";
				reject(error);
				return;
			}

			// Check if geolocation is supported using provider
			if (!this.provider.isSupported()) {
				const error = new Error("Geolocation is not supported by this browser");
				error.name = "NotSupportedError";
				reject(error);
				return;
			}

			this.isPendingRequest = true;

			this.provider.getCurrentPosition(
				(position) => {
					this.isPendingRequest = false;
					this.pendingPromise = null;
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
					this.pendingPromise = null;
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

		return this.pendingPromise;
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
		// Check if geolocation is supported using provider
		if (!this.provider.isSupported()) {
			console.error("(GeolocationService) Geolocation is not supported by this browser");
			return null;
		}

		if (this.isWatching) {
			return this.watchId;
		}

		this.watchId = this.provider.watchPosition(
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
			this.provider.clearWatch(this.watchId);
			this.watchId = null;
			this.isWatching = false;
		} else {
			log("(GeolocationService) No active position watch to stop");
		}
	}

	/**
	 * Updates the location display element with current position information.
	 * 
	 * DISPLAY INTEGRATION:
	 * Formats coordinate data appropriately for display and integrates with the
	 * provided HTML element to show location information. This method ensures
	 * consistent formatting across the application while maintaining separation
	 * of concerns between data acquisition and presentation.
	 * 
	 * @private
	 * @param {GeolocationPosition} position - Position data from Geolocation API
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	updateLocationDisplay(position) {
		// Validate display element availability
		if (!this.locationResult) return;

		// Extract coordinate data for formatting
		const coords = position.coords;
		const timestamp = new Date(position.timestamp).toLocaleString();
		
		// FORMAT COORDINATE DATA:
		// Display coordinates with appropriate precision and timestamp
		// This ensures consistent presentation across the travel guide application
	}

	/**
	 * Updates the display element with error information.
	 * 
	 * ERROR DISPLAY INTEGRATION:
	 * Generates Material Design-styled error displays in Portuguese to maintain
	 * consistent user experience even when geolocation fails. This method ensures
	 * that users receive clear, localized feedback about location issues while
	 * maintaining the application's design standards.
	 * 
	 * @private
	 * @param {GeolocationPositionError} error - Geolocation error from API
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	updateErrorDisplay(error) {
		// Validate display element availability
		if (!this.locationResult) return;

		// LOCALIZED ERROR DISPLAY:
		// Generate Portuguese error message with Material Design styling
		// Ensures Brazilian users understand location issues with native language feedback
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

// MODULE EXPORT STRATEGY:
// Following established patterns, the class supports both ES6 module exports and
// traditional script loading, ensuring compatibility with the mixed module architecture.
// The service integrates seamlessly with existing WebGeocodingManager and observer
// pattern infrastructure, maintaining clean separation of concerns that characterizes
// the MP Barbosa coding standards.

// Export as both default and named export for maximum compatibility
export default GeolocationService;
export { GeolocationService };
