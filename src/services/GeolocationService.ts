
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
 * @since 0.9.0-alpha (extracted from guia.js in Phase 2)
 * @author Marcelo Pereira Barbosa
 */

import PositionManager from '../core/PositionManager.js';
import { log, warn, error } from '../utils/logger.js';
import { GEOLOCATION_OPTIONS, MOBILE_GEOLOCATION_OPTIONS, GEOLOCATION_THROTTLE_INTERVAL } from '../config/defaults.js';
import { throttle, ThrottledFunction } from '../utils/throttle.js';
import { isMobileDevice } from '../utils/device.js';
import BrowserGeolocationProvider from './providers/BrowserGeolocationProvider.js';
import { 
	formatGeolocationError, 
	generateErrorDisplayHTML 
} from '../utils/geolocation-error-formatter.js';


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
const isPermissionsAPISupported = (navigatorObj: Navigator | null | undefined): boolean => {
	return navigatorObj != null && 'permissions' in navigatorObj;
};

/** Minimal interface for geolocation providers (BrowserGeolocationProvider et al.) */
interface IGeolocationProvider {
	isPermissionsAPISupported?(): boolean;
	isSupported(): boolean;
	getCurrentPosition(
		success: PositionCallback,
		error: PositionErrorCallback,
		options?: PositionOptions
	): void;
	watchPosition(
		success: PositionCallback,
		error: PositionErrorCallback,
		options?: PositionOptions
	): number;
	clearWatch(id: number): void;
	getNavigator?(): Navigator | null;
}

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
	// ─── Instance property declarations ──────────────────────────────────────
	private locationResult: Element | null;
	private watchId: number | null;
	private isWatching: boolean;
	private lastKnownPosition: GeolocationPosition | null;
	private isPendingRequest: boolean;
	private pendingPromise: Promise<GeolocationPosition> | null;
	private lastSingleFetchTime: number;
	/**
	 * Leading-edge throttled wrapper around the `watchPosition` success callback.
	 *
	 * Created once in the constructor via {@link throttle} and passed directly to
	 * `navigator.geolocation.watchPosition`. Because the browser can fire raw GPS
	 * events many times per second, this guard ensures that
	 * `PositionManager.update()` and DOM re-renders run **at most once every
	 * `GEOLOCATION_THROTTLE_INTERVAL` milliseconds** (currently 5 s).
	 *
	 * Use {@link flushThrottle} to reset the cooldown on demand (e.g., when the
	 * user explicitly taps a "refresh location" button).
	 *
	 * @see {@link throttle} — `src/utils/throttle.ts`
	 * @see {@link flushThrottle}
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private throttledWatchHandler: ThrottledFunction<[GeolocationPosition], void>;
	// Raw (unthrottled) handler — stored so setThrottleInterval() can re-wrap it
	private _rawWatchHandler: (position: GeolocationPosition) => void;
	private config: { geolocationOptions: PositionOptions };
	private provider!: IGeolocationProvider;
	private navigator: Navigator | null;
	private positionManager: PositionManager;
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
	 * @since 0.9.0-alpha
	 */
	constructor(
		locationResult?: Element | null,
		geolocationProvider?: IGeolocationProvider | { geolocation: unknown } | null,
		positionManagerInstance?: PositionManager | null,
		config: { geolocationOptions?: PositionOptions } = {}
	) {
		log(">>> (GeolocationService) constructor called");
		// Store DOM element for location result display
		this.locationResult = locationResult ?? null;
		
		// Initialize position watching state management
		this.watchId = null;
		this.isWatching = false;
		this.lastKnownPosition = null;
		
		
		// RACE CONDITION PREVENTION:
		// Prevents overlapping geolocation requests that could cause stale data
		// or inconsistent state in the PositionManager
		this.isPendingRequest = false;
		this.pendingPromise = null;
		this.lastSingleFetchTime = 0;

		// Leading-edge throttle: the browser can fire raw GPS events many times per
		// second. This guard ensures PositionManager.update() and DOM re-renders run
		// at most once per GEOLOCATION_THROTTLE_INTERVAL (5 s). The same handler is
		// reused for the full lifetime of the instance and passed directly to
		// watchPosition(). Call flushThrottle() to reset the cooldown on demand.
		this._rawWatchHandler = (position: GeolocationPosition) => {
			this.lastKnownPosition = position;
			this.positionManager.update(position);
			if (this.locationResult) {
				this.updateLocationDisplay(position);
			}
		};
		this.throttledWatchHandler = throttle(this._rawWatchHandler, GEOLOCATION_THROTTLE_INTERVAL);

		// CONFIGURATION AND PERFORMANCE OPTIMIZATION:
		// The service accepts configuration options for geolocation parameters including
		// accuracy requirements, timeout values, and cache age settings. These configurable
		// options allow balancing between accuracy and performance based on use case requirements.
		this.config = {
			geolocationOptions: config.geolocationOptions || (isMobileDevice() ? MOBILE_GEOLOCATION_OPTIONS : GEOLOCATION_OPTIONS)
		};

		// DEPENDENCY INJECTION PATTERN - GEOLOCATION PROVIDER:
		// Inject GeolocationProvider for flexible testing and different implementations
		// Supports three scenarios:
		// 1. Explicit provider injection (preferred for testing)
		// 2. Navigator object for backward compatibility (will be wrapped)
		// 3. Default to BrowserGeolocationProvider with global navigator
		if (geolocationProvider && typeof (geolocationProvider as IGeolocationProvider).getCurrentPosition === 'function') {
			// Case 1: Already a provider instance
			const p = geolocationProvider as IGeolocationProvider;
			this.provider = p;
			// Keep navigator reference for backward compatibility with checkPermissions()
			this.navigator = p.getNavigator ? p.getNavigator() : null;
		} else if (geolocationProvider && 'geolocation' in geolocationProvider) {
			// Case 2: Backward compatibility - navigator object passed
			this.provider = new BrowserGeolocationProvider(geolocationProvider as Navigator) as unknown as IGeolocationProvider;
			this.navigator = geolocationProvider as Navigator;
		} else {
			// Case 3: Default - create BrowserGeolocationProvider with global navigator
			const nav = typeof navigator !== 'undefined' ? navigator : null;
			this.provider = new BrowserGeolocationProvider(nav) as unknown as IGeolocationProvider;
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
	 * @since 0.9.0-alpha
	 */
	async checkPermissions() {
		log(">>> (GeolocationService) checkPermissions called");
		try {
			// Use provider's isPermissionsAPISupported if available, fallback to checking navigator
			const hasPermissionsAPI = this.provider.isPermissionsAPISupported 
				? this.provider.isPermissionsAPISupported()
				: isPermissionsAPISupported(this.navigator);
				
			if (hasPermissionsAPI) {
				const permission = await this.navigator!.permissions.query({ name: 'geolocation' });
				// permission.state stored (diagnostic use only)
				return permission.state;
			} else {
				// Fallback for browsers without Permissions API
				return 'prompt';
			}
		} catch (err) {
			error("(GeolocationService) Error checking permissions:", err);
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
	 *   log('Lat:', position.coords.latitude);
	 *   log('Lng:', position.coords.longitude);
	 * } catch (error) {
	 *   error('Location error:', error.message);
	 * }
	 * 
	 * @example
	 * // Check for pending requests before calling
	 * if (!service.hasPendingRequest()) {
	 *   const position = await service.getSingleLocationUpdate();
	 * }
	 * 
	 * @since 0.9.0-alpha
	 */
	async getSingleLocationUpdate() {
		log(">>> (GeolocationService) getSingleLocationUpdate called");
		// Return existing promise if request already pending
		if (this.isPendingRequest && this.pendingPromise) {
			return this.pendingPromise;
		}

		// Manual throttle guard for single-shot fetches: if the last GPS call
		// succeeded less than GEOLOCATION_THROTTLE_INTERVAL ago and a cached
		// position is available, return it immediately without a new GPS call.
		// This mirrors the leading-edge throttle applied to watchPosition callbacks
		// and uses the same cooldown constant. Call flushThrottle() to bypass.
		const now = Date.now();
		if (now - this.lastSingleFetchTime < GEOLOCATION_THROTTLE_INTERVAL && this.lastKnownPosition) {
			log(">>> (GeolocationService) getSingleLocationUpdate throttled — returning cached position");
			return Promise.resolve(this.lastKnownPosition);
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
					log(">>> (GeolocationService) Single location update successful:", position);
					this.isPendingRequest = false;
					this.pendingPromise = null;
					this.lastKnownPosition = position;
					this.lastSingleFetchTime = Date.now();

					log(">>> (GeolocationService) Updating PositionManager with new position");
					// Update PositionManager with new position
					this.positionManager.update(position);

					// Update display if element is available
					if (this.locationResult) {
						this.updateLocationDisplay(position);
					}

					resolve(position);
				},
				(err) => {
					// On TIMEOUT (code 3), retry once with low-accuracy (WiFi/IP) which is faster
					if (err.code === 3 && this.config.geolocationOptions.enableHighAccuracy !== false) {
						warn("(GeolocationService) High-accuracy timed out, retrying with low accuracy...");
						const fallbackOptions: PositionOptions = {
							...this.config.geolocationOptions,
							enableHighAccuracy: false,
							timeout: 10000
						};
						this.provider.getCurrentPosition(
							(position) => {
								log(">>> (GeolocationService) Low-accuracy fallback successful");
								this.isPendingRequest = false;
								this.pendingPromise = null;
								this.lastKnownPosition = position;
								this.lastSingleFetchTime = Date.now();
								this.positionManager.update(position);
								if (this.locationResult) {
									this.updateLocationDisplay(position);
								}
								resolve(position);
							},
							(fallbackErr) => {
								this.isPendingRequest = false;
								this.pendingPromise = null;
								error("(GeolocationService) Single location update failed:", fallbackErr.message || fallbackErr);
								if (this.locationResult) {
									this.updateErrorDisplay(fallbackErr);
								}
								reject(formatGeolocationError(fallbackErr));
							},
							fallbackOptions
						);
						return; // Await fallback result; do not reject yet
					}

					this.isPendingRequest = false;
					this.pendingPromise = null;
					// Privacy: Log error without coordinates
					error("(GeolocationService) Single location update failed:", err.message || err);

					// Update display with error if element is available
					if (this.locationResult) {
						this.updateErrorDisplay(err);
					}

					reject(formatGeolocationError(err));
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
	 * @since 0.9.0-alpha
	 */
	watchCurrentLocation() {
		// Check if geolocation is supported using provider
		if (!this.provider.isSupported()) {
			error("(GeolocationService) Geolocation is not supported by this browser");
			return null;
		}

		if (this.isWatching) {
			return this.watchId;
		}

		this.watchId = this.provider.watchPosition(
			(position: GeolocationPosition) => this.throttledWatchHandler(position),
			(err) => {
				// Timeout (code 3) is transient for a continuous watch — the watch
				// keeps running and will deliver a fix once the device acquires one.
				// Only surface fatal errors (permission denied, position unavailable).
				if (err.code === 3) {
					warn("(GeolocationService) Position watch timeout (watch continues):", err.message || err);
					return;
				}

				error("(GeolocationService) Position watch error:", err.message || err);

				// Update display with error if element is available
				if (this.locationResult) {
					this.updateErrorDisplay(err);
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
	 * @since 0.9.0-alpha
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
	 * @since 0.9.0-alpha
	 */
	updateLocationDisplay(position: GeolocationPosition) {
		// Validate display element availability
		if (!this.locationResult) return;

		// Extract coordinate data for formatting
		const coords = position.coords;
		void new Date(position.timestamp).toLocaleString(); // timestamp formatting available if needed
		
		// FORMAT COORDINATE DATA:
		// Display coordinates with appropriate precision and timestamp
		// This ensures consistent presentation across the travel guide application
		
		// Update the simple coordinate display in #lat-long-display
		// This provides immediate visual feedback to the user
		if (typeof document !== 'undefined') {
			const latLongDisplay = document.getElementById('lat-long-display');
			if (latLongDisplay && coords) {
				const lat = coords.latitude ? coords.latitude.toFixed(6) : 'N/A';
				const lng = coords.longitude ? coords.longitude.toFixed(6) : 'N/A';
				latLongDisplay.textContent = `${lat}, ${lng}`;
			}
			
			// Update altitude display with Brazilian locale formatting
			const altitudeContainer = document.getElementById('altitude-container');
			const altitudeDisplay = document.getElementById('altitude-display');
			
			if (altitudeContainer && altitudeDisplay && coords) {
				if (coords.altitude !== null && coords.altitude !== undefined) {
					// Format altitude with Brazilian locale (comma as decimal separator)
					const altitudeFormatted = coords.altitude.toLocaleString('pt-BR', {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2
					});
					altitudeDisplay.textContent = `${altitudeFormatted} metros`;
					altitudeContainer.classList.remove('hidden'); // Show the altitude
				} else {
					// Hide altitude when not available
					altitudeContainer.classList.add('hidden');
				}
			}
		}
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
	 * @since 0.9.0-alpha
	 */
	updateErrorDisplay(error: GeolocationPositionError) {
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
	 * @since 0.9.0-alpha
	 */
	getLastKnownPosition() {
		return this.lastKnownPosition;
	}

	/**
	 * Checks if the service is currently watching position.
	 * 
	 * @returns {boolean} True if position watching is active
	 * @since 0.9.0-alpha
	 */
	isCurrentlyWatching() {
		return this.isWatching;
	}

	/**
	 * Gets the current watch ID.
	 * 
	 * @returns {number|null} Watch ID or null if not watching
	 * @since 0.9.0-alpha
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
	 *   log('Request already in progress');
	 * }
	 * 
	 * @since 0.9.0-alpha
	 */
	hasPendingRequest() {
		return this.isPendingRequest;
	}

	/**
	 * Resets **both** throttle guards so the next position fetch and the next
	 * `watchPosition` callback both execute immediately, regardless of how
	 * recently the last one occurred.
	 *
	 * Two guards are reset:
	 * 1. `lastSingleFetchTime = 0` — bypasses the manual timestamp check in
	 *    {@link getSingleLocationUpdate} so the next call triggers a real GPS
	 *    request instead of returning a cached position.
	 * 2. `throttledWatchHandler.flush()` — calls {@link ThrottledFunction.flush}
	 *    to reset the leading-edge throttle so the next `watchPosition` callback
	 *    is not dropped.
	 *
	 * Use sparingly — for example when the user explicitly taps "refresh location".
	 *
	 * @see {@link throttle} — `src/utils/throttle.ts`
	 * @see {@link ThrottledFunction.flush}
	 * @since 0.12.5-alpha
	 */
	flushThrottle() {
		this.lastSingleFetchTime = 0;
		this.throttledWatchHandler.flush();
	}

	/**
	 * Replaces the active leading-edge throttle with a new one at the given interval.
	 *
	 * Called by `WebGeocodingManager` when `AddressCache` signals that any address
	 * field has a pending confirmation candidate.  The throttle is tightened to
	 * `GEOLOCATION_THROTTLE_CONFIRMATION_INTERVAL` (2 s) so that confirming reads
	 * arrive faster, then restored to `GEOLOCATION_THROTTLE_INTERVAL` (5 s) once
	 * all buffers settle.
	 *
	 * The active `watchPosition` subscription is unaffected — only the rate at which
	 * raw GPS events are forwarded to `PositionManager` changes (FR-04.4).
	 *
	 * @param {number} ms - The new throttle interval in milliseconds.
	 * @since 0.12.10-alpha
	 */
	setThrottleInterval(ms: number): void {
		this.throttledWatchHandler = throttle(this._rawWatchHandler, ms);
	}
}

// MODULE EXPORT STRATEGY:
// Following established patterns, the class supports both ES6 module exports and
// traditional script loading, ensuring compatibility with the mixed module architecture.
// The service integrates seamlessly with existing WebGeocodingManager and observer
// pattern infrastructure, maintaining clean separation of concerns that characterizes
// the MP Barbosa coding standards.

export default GeolocationService;
/**
 * Module exports for geolocation service.
 * @exports GeolocationService - Browser geolocation API wrapper with provider abstraction
 */
export { GeolocationService };
