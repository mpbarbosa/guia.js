/**
 * Centralized singleton manager for device geographic position.
 * 
 * PositionManager implements the singleton and observer patterns to provide a single
 * source of truth for the current device position. It wraps the browser's Geolocation API,
 * applies multi-layer validation rules (accuracy, distance, time thresholds), and notifies
 * subscribed observers about position changes.
 * 
 * Key Features:
 * - Singleton pattern ensures one position state across application
 * - Observer pattern for decoupled position change notifications
 * - Smart filtering prevents excessive processing from GPS noise
 * - Multi-layer validation (accuracy quality, distance threshold, time interval)
 * - Integration with GeoPosition for enhanced position data
 * 
 * Validation Rules:
 * 1. Accuracy Quality: Rejects medium/bad/very bad accuracy on mobile devices
 * 2. Distance Threshold: Ignores movements less than 20 meters
 * 3. Time Interval: Distinguishes regular updates (≥50s) from immediate updates (<50s)
 * 
 * @module core/PositionManager
 * @pattern Singleton - Only one instance manages position state
 * @pattern Observer - Notifies subscribers of position changes
 * 
 * @see {@link GeoPosition} For position data wrapper with convenience methods
 * @see {@link ObserverSubject} For observer pattern implementation
 * @see [Complete Documentation](../../docs/architecture/POSITION_MANAGER.md)
 * 
 * @example
 * // Basic usage - get singleton instance
 * const manager = PositionManager.getInstance();
 * 
 * @example
 * // Subscribe to position updates
 * const observer = {
 *   update: (positionManager, eventType) => {
 *     if (eventType === PositionManager.strCurrPosUpdate) {
 *       console.log('Position:', positionManager.latitude, positionManager.longitude);
 *     }
 *   }
 * };
 * manager.subscribe(observer);
 * 
 * @example
 * // Update position (typically done by GeolocationService)
 * navigator.geolocation.getCurrentPosition((position) => {
 *   const manager = PositionManager.getInstance();
 *   manager.update(position); // Validates and updates if rules pass
 * });
 * 
 * @since 0.6.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import GeoPosition from './GeoPosition.js';
import ObserverSubject from './ObserverSubject.js';
import { calculateDistance } from '../utils/distance.js';
import { log, warn } from '../utils/logger.js';

/**
 * Get configuration - use imported defaults and allow override
 * This makes the module testable and reduces coupling
 */
let setupParams = null;

/**
 * Initialize setupParams - called when module loads or can be overridden for testing.
 * 
 * Sets the configuration object for position tracking parameters. This function
 * allows runtime configuration override, which is particularly useful for testing
 * scenarios where different configurations need to be tested.
 * 
 * @param {Object} config - Configuration object with tracking parameters
 * @param {string[]} config.notAcceptedAccuracy - Array of unacceptable accuracy levels
 * @param {number} config.minimumDistanceChange - Minimum distance change in meters to trigger update
 * @param {number} config.trackingInterval - Tracking interval in milliseconds
 * @returns {void}
 * 
 * @example
 * // Initialize with custom configuration
 * initializeConfig({
 *   notAcceptedAccuracy: ['medium', 'bad'],
 *   minimumDistanceChange: 50,
 *   trackingInterval: 30000
 * });
 * 
 * @since 0.8.6-alpha
 * @author Marcelo Pereira Barbosa
 */
export function initializeConfig(config) {
	setupParams = config;
}

// Initialize with defaults if available
try {
	const { createDefaultConfig } = await import('../config/defaults.js');
	setupParams = createDefaultConfig();
} catch (err) {
	// If config not available, use minimal defaults
	setupParams = {
		notAcceptedAccuracy: ['medium', 'bad', 'very bad'],
		minimumDistanceChange: 20,
		trackingInterval: 50000
	};
}

/**
 * Manages the current geolocation position using singleton and observer design patterns.
 * 
 * This class provides centralized management of the user's current geographic position,
 * implementing timing constraints, accuracy validation, and distance-based filtering
 * to ensure position updates are meaningful and efficient. It notifies subscribed
 * observers when position changes occur.
 * 
 * The PositionManager enforces several validation rules:
 * - Minimum time interval between updates (50 seconds by default)
 * - Minimum distance change threshold (20 meters by default)
 * - Accuracy quality requirements (rejects medium/bad/very bad accuracy)
 * 
 * @class PositionManager
 * @implements {Observer} - Implements observer pattern for position change notifications
 */
class PositionManager {
	/**
	 * Singleton instance holder. Only one PositionManager exists per application.
	 * @static
	 * @type {PositionManager|null}
	 * @private
	 */
	static instance = null;

	/**
	 * Event string constant fired when position is successfully updated.
	 * @static
	 * @type {string}
	 * @readonly
	 */
	static strCurrPosUpdate = "PositionManager updated";

	/**
	 * Event string constant fired when position update is rejected due to validation rules.
	 * @static
	 * @type {string}
	 * @readonly
	 */
	static strCurrPosNotUpdate = "PositionManager not updated";

	/**
	 * Event string constant fired when position is successfully updated and must be immediately processed.
	 * @static
	 * @type {string}
	 * @readonly
	 */
	static strImmediateAddressUpdate = 'Immediate address update';

	/**
	 * Gets or creates the singleton PositionManager instance.
	 * 
	 * Implements the singleton pattern ensuring only one PositionManager instance
	 * exists throughout the application lifecycle. If a position is provided when
	 * an instance already exists, it will attempt to update the existing instance.
	 * 
	 * @static
	 * @param {GeolocationPosition} [position] - HTML5 Geolocation API Position object
	 * @param {GeolocationCoordinates} [position.coords] - Coordinate information
	 * @param {number} [position.coords.latitude] - Latitude in decimal degrees
	 * @param {number} [position.coords.longitude] - Longitude in decimal degrees  
	 * @param {number} [position.coords.accuracy] - Accuracy in meters
	 * @param {number} [position.timestamp] - Timestamp when position was acquired
	 * @returns {PositionManager} The singleton PositionManager instance
	 * 
	 * @example
	 * // Create initial instance
	 * const manager = PositionManager.getInstance();
	 * 
	 * @example  
	 * // Create or update with position data
	 * navigator.geolocation.getCurrentPosition((position) => {
	 *   const manager = PositionManager.getInstance(position);
	 *   console.log(manager.latitude, manager.longitude);
	 * });
	 * 
	 * @since 0.6.0-alpha
	 */
	static getInstance(position) {
		if (!PositionManager.instance) {
			PositionManager.instance = new PositionManager(position);
		} else if (position) {
			PositionManager.instance.update(position);
		}
		return PositionManager.instance;
	}

	/**
	 * Creates a new PositionManager instance.
	 * 
	 * Initializes the position manager with an ObserverSubject for immutable observer 
	 * management and optional initial position data. This constructor is typically called 
	 * internally by the getInstance() method to maintain the singleton pattern.
	 * 
	 * @param {GeolocationPosition} [position] - Initial position data
	 * @param {GeolocationCoordinates} [position.coords] - Coordinate information
	 * @param {number} [position.coords.latitude] - Latitude in decimal degrees
	 * @param {number} [position.coords.longitude] - Longitude in decimal degrees
	 * @param {number} [position.coords.accuracy] - Accuracy in meters
	 * @param {number} [position.timestamp] - Timestamp when position was acquired
	 * 
	 * @example
	 * // Typically used internally by getInstance()
	 * const manager = new PositionManager(geolocationPosition);
	 * 
	 * @since 0.6.0-alpha
	 */
	constructor(position) {
		this.observerSubject = new ObserverSubject();
		this.tsPosicaoAtual = null;
		this.lastModified = null;
		if (position) {
			this.update(position);
		}
	}

	/**
	 * Gets the observers array for backward compatibility.
	 * @private
	 * @returns {Array} Array of subscribed observers
	 */
	get observers() {
		return this.observerSubject.observers;
	}

	/**
	 * Subscribes an observer to position change notifications.
	 * 
	 * Implements the observer pattern by delegating to ObserverSubject, which manages
	 * observers immutably. Observers will be notified when position updates occur. 
	 * Observers must implement an update() method that accepts (positionManager, eventType) parameters.
	 * 
	 * **Note:** Observer management uses immutable array updates via ObserverSubject,
	 * ensuring referential transparency for subscribe/unsubscribe operations.
	 * 
	 * @param {Object} observer - Observer object to subscribe
	 * @param {Function} observer.update - Method called on position changes
	 * @returns {void}
	 * 
	 * @example
	 * const myObserver = {
	 *   update: (positionManager, event) => {
	 *     console.log('Position event:', event, positionManager.latitude);
	 *   }
	 * };
	 * PositionManager.getInstance().subscribe(myObserver);
	 * 
	 * @since 0.6.0-alpha
	 */
	subscribe(observer) {
		this.observerSubject.subscribe(observer);
	}

	/**
	 * Unsubscribes an observer from position change notifications.
	 * 
	 * Removes the specified observer from the notification list so it will
	 * no longer receive position update events.
	 * 
	 * @param {Object} observer - Observer object to unsubscribe
	 * @returns {void}
	 * 
	 * @example
	 * PositionManager.getInstance().unsubscribe(myObserver);
	 * 
	 * @since 0.6.0-alpha
	 */
	unsubscribe(observer) {
		this.observerSubject.unsubscribe(observer);
	}

	/**
	 * Proxy properties from lastPosition for direct access
	 */
	get latitude() {
		return this.lastPosition?.latitude;
	}

	get longitude() {
		return this.lastPosition?.longitude;
	}

	get accuracy() {
		return this.lastPosition?.accuracy;
	}

	get accuracyQuality() {
		return this.lastPosition?.accuracyQuality;
	}

	get altitude() {
		return this.lastPosition?.altitude;
	}

	get heading() {
		return this.lastPosition?.heading;
	}

	get speed() {
		return this.lastPosition?.speed;
	}

	get timestamp() {
		return this.lastPosition?.timestamp;
	}

	/**
	 * Notifies all observers with the given event type.
	 * 
	 * @private
	 * @param {string} posEvent - Event type constant
	 * @param {*} data - Optional data to pass to observers
	 * @param {Error} error - Optional error object
	 */
	notifyObservers(posEvent, data = null, error = null) {
		this.observerSubject.notifyObservers(this, posEvent, data, error);
	}

	/**
	 * Updates the position with validation and filtering rules.
	 * 
	 * This is the core method that processes new position data with multiple
	 * validation layers to ensure only meaningful position updates are accepted:
	 * 
	 * Validation Rules:
	 * 1. Position validity: Must have valid position object with timestamp
	 * 2. Time constraint: Must wait at least 50 seconds (trackingInterval) between updates
	 * 3. Accuracy requirement: Rejects medium/bad/very bad accuracy positions  
	 * 4. Distance threshold: Must move at least 20 meters (minimumDistanceChange)
	 * 
	 * When validation passes, updates all position properties and notifies observers.
	 * When validation fails, notifies observers with the rejection reason.
	 * 
	 * @param {GeolocationPosition} position - New position data from Geolocation API
	 * @param {GeolocationCoordinates} position.coords - Coordinate information
	 * @param {number} position.coords.latitude - Latitude in decimal degrees
	 * @param {number} position.coords.longitude - Longitude in decimal degrees
	 * @param {number} position.coords.accuracy - Accuracy in meters
	 * @param {number} position.coords.altitude - Altitude in meters (may be null)
	 * @param {number} position.coords.altitudeAccuracy - Altitude accuracy in meters (may be null)  
	 * @param {number} position.coords.heading - Compass heading in degrees (may be null)
	 * @param {number} position.coords.speed - Speed in meters/second (may be null)
	 * @param {number} position.timestamp - Timestamp when position was acquired
	 * @returns {void}
	 * 
	 * @fires PositionManager#strCurrPosUpdate - When position successfully updated
	 * @fires PositionManager#strCurrPosNotUpdate - When position rejected by validation
	 * 
	 * @example
	 * // Update with new position (typically from Geolocation API)
	 * navigator.geolocation.getCurrentPosition((position) => {
	 *   const manager = PositionManager.getInstance();
	 *   manager.update(position); // Validates and updates if rules pass
	 * });
	 * 
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition} GeolocationPosition
	 * @since 0.6.0-alpha
	 */
	update(position) {
		let bUpdateCurrPos = true;
		let error = null;

		// Verifica se a posição é válida
		if (!position || !position.timestamp) {
			warn("(PositionManager) Invalid position data:", position);
			return;
		}

		// Verifica se a precisão é boa o suficiente
		if (
			setupParams.notAcceptedAccuracy && 
			Array.isArray(setupParams.notAcceptedAccuracy) &&
			setupParams.notAcceptedAccuracy.includes(
				GeoPosition.getAccuracyQuality(position.coords.accuracy)
			)
		) {
			bUpdateCurrPos = false;
			error = { name: "AccuracyError", message: "Accuracy is not good enough" };
			warn(
				"(PositionManager) Accuracy not good enough:",
				position.coords.accuracy,
			);
		}
		// Only update if position has changed significantly (more than 20 meters)
		if (
			this.lastPosition &&
			position &&
			this.lastPosition.latitude &&
			this.lastPosition.longitude &&
			position.coords
		) {
			const distance = calculateDistance(
				this.lastPosition.latitude,
				this.lastPosition.longitude,
				position.coords.latitude,
				position.coords.longitude,
			);
			if (distance < setupParams.minimumDistanceChange) {
				bUpdateCurrPos = false;
				error = { name: "DistanceError", message: "Movement is not significant enough" };
				warn(
					"(PositionManager) Movement not significant enough:",
					distance,
				);
			}
		}

		if (!bUpdateCurrPos) {
			this.notifyObservers(PositionManager.strCurrPosNotUpdate, null, error);
			return;
		}

		let posEvent = "";

		if (position.timestamp - (this.lastModified || 0) < setupParams.trackingInterval) {
			let errorMessage = `Less than ${setupParams.trackingInterval / 1000} seconds since last update: ${(position.timestamp - (this.lastModified || 0)) / 1000} seconds`;
			error = {
				name: "ElapseTimeError",
				message: errorMessage,
			};
			warn("(PositionManager) " + errorMessage);
			posEvent = PositionManager.strImmediateAddressUpdate;
		} else {
			posEvent = PositionManager.strCurrPosUpdate;
		}

		// Atualiza a posição apenas se tiver passado mais de 1 minuto
		this.lastPosition = new GeoPosition(position);
		this.position = this.lastPosition;
		this.lastModified = position.timestamp;
		this.notifyObservers(posEvent, null, error);
	}

	/**
	 * Returns a string representation of the current position.
	 * 
	 * Provides a formatted summary of key position properties for debugging
	 * and logging purposes. Includes class name and essential position data.
	 * 
	 * @returns {string} Formatted string with position details
	 * 
	 * @example
	 * const manager = PositionManager.getInstance(position);
	 * console.log(manager.toString());
	 * // Output: "PositionManager: -23.5505, -46.6333, good, 760, 0, 0, 1634567890123"
	 * 
	 * @since 0.6.0-alpha
	 */
	toString() {
		let position = this.lastPosition || {};
		if (!position || !this.latitude || !this.longitude) {
			return `${this.constructor.name}: No position data`;
		}
		return `${this.constructor.name}: ${position.latitude}, ${position.longitude}, ${position.accuracyQuality}, ${position.altitude}, ${position.speed}, ${position.heading}, ${position.timestamp}`;
	}
}

export default PositionManager;
