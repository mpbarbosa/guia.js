// Semantic Versioning 2.0.0 - see https://semver.org/
// Version object for unstable development status
const guiaVersion = {
	major: 0,
	minor: 8,
	patch: 5,
	prerelease: "alpha", // Indicates unstable development
	toString: function () {
		return `${this.major}.${this.minor}.${this.patch}-${this.prerelease}`;
	},
};

const guiaName = "Ondeestou";
const guiaAuthor = "Marcelo Pereira Barbosa";
const setupParams = {
	trackingInterval: 50000, // milliseconds
	minimumDistanceChange: 20, // meters
	independentQueueTimerInterval: 5000, // milliseconds
	noReferencePlace: "Não classificado",
	validRefPlaceClasses: ["place", "shop", "amenity", "railway"],
	// Device-specific accuracy thresholds
	// Mobile devices (with GPS): stricter thresholds, reject medium/bad/very bad
	// Desktop devices (WiFi/IP location): relaxed thresholds, accept medium, reject bad/very bad
	mobileNotAcceptedAccuracy: ["medium", "bad", "very bad"],
	desktopNotAcceptedAccuracy: ["bad", "very bad"],
	notAcceptedAccuracy: null, // Will be set dynamically based on device type
	referencePlaceMap: {
		"place": { "house": "Residencial" },
		"shop": { "mall": "Shopping Center" },
		"amenity": { "cafe": "Café" },
		"railway": { "subway": "Estação do Metrô",
			"station": "Estação do Metrô"
		 },
	},
	geolocationOptions: {
		enableHighAccuracy: true,
		timeout: 20000, // 20 seconds
		maximumAge: 0, // Do not use a cached position
	},
	openstreetmapBaseUrl:
		"https://nominatim.openstreetmap.org/reverse?format=json",
};

const getOpenStreetMapUrl = (latitude, longitude) =>
	`${setupParams.openstreetmapBaseUrl}&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

/**
 * Calculates the great-circle distance between two geographic points using the Haversine formula.
 * 
 * The Haversine formula determines the shortest distance over the earth's surface between two points
 * given their latitude and longitude coordinates. This implementation assumes a spherical Earth
 * with radius 6,371,000 meters (mean radius).
 * 
 * Formula: d = R × c
 * Where:
 * - R = Earth's radius (6,371,000 meters)
 * - c = 2 × atan2(√a, √(1−a))
 * - a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
 * - φ = latitude in radians
 * - λ = longitude in radians
 * - Δφ = difference in latitudes
 * - Δλ = difference in longitudes
 * 
 * @param {number} lat1 - Latitude of first point in decimal degrees (-90 to 90)
 * @param {number} lon1 - Longitude of first point in decimal degrees (-180 to 180)
 * @param {number} lat2 - Latitude of second point in decimal degrees (-90 to 90)
 * @param {number} lon2 - Longitude of second point in decimal degrees (-180 to 180)
 * @returns {number} Distance in meters between the two points
 * 
 * @example
 * // Distance between São Paulo and Rio de Janeiro
 * const distance = calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729);
 * console.log(distance); // ~357,710 meters (357.7 km)
 * 
 * @see {@link https://en.wikipedia.org/wiki/Haversine_formula} Haversine formula on Wikipedia
 * @see {@link https://www.movable-type.co.uk/scripts/latlong.html} Calculate distance, bearing and more
 * 
 * @since 0.7.1-alpha
 * @author Marcelo Pereira Barbosa
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
	const R = 6371e3; // Earth radius in meters (mean radius)
	const φ1 = (lat1 * Math.PI) / 180; // Convert latitude 1 to radians
	const φ2 = (lat2 * Math.PI) / 180; // Convert latitude 2 to radians
	const Δφ = ((lat2 - lat1) * Math.PI) / 180; // Difference in latitude (radians)
	const Δλ = ((lon2 - lon1) * Math.PI) / 180; // Difference in longitude (radians)

	// Haversine formula core calculation
	const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c; // Distance in meters
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Detects if the current device is a mobile or tablet device.
 * 
 * Uses multiple detection methods to determine device type:
 * 1. User agent string matching for common mobile/tablet patterns
 * 2. Touch capability detection (maxTouchPoints > 0)
 * 3. Screen width heuristic (< 768px typically indicates mobile)
 * 
 * Mobile devices typically have GPS hardware providing more accurate
 * geolocation (< 20 meters), while desktop/laptop devices rely on
 * WiFi/IP-based location with lower accuracy (50-1000 meters).
 * 
 * @returns {boolean} True if device is mobile/tablet, false for desktop/laptop
 * 
 * @example
 * if (isMobileDevice()) {
 *   console.log('Mobile device detected - expecting high GPS accuracy');
 * } else {
 *   console.log('Desktop device detected - expecting lower accuracy');
 * }
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent} User Agent Detection
 * @since 0.8.4-alpha
 * @author Marcelo Pereira Barbosa
 */
const isMobileDevice = () => {
	// Check if we're in a browser environment
	if (typeof navigator === 'undefined' || typeof window === 'undefined') {
		return false; // Default to desktop for non-browser environments (e.g., Node.js)
	}

	// Method 1: User agent detection
	const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
	const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
	const isMobileUA = mobileRegex.test(userAgent.toLowerCase());

	// Method 2: Touch capability detection
	const hasTouchScreen = 'maxTouchPoints' in navigator && navigator.maxTouchPoints > 0;

	// Method 3: Screen width heuristic (tablets and phones typically < 768px)
	const isSmallScreen = window.innerWidth < 768;

	// Consider it mobile if any two of these conditions are true
	const detectionScore = [isMobileUA, hasTouchScreen, isSmallScreen].filter(Boolean).length;

	return detectionScore >= 2;
};

const log = (message, ...params) => {
	//get all params after message and concatenate them
	const fullMessage = `[${new Date().toISOString()}] ${message} ${params.join(" ")}`;
	console.log(fullMessage);
	if (typeof document !== "undefined") {
		//TODO: Remover a referência direta ao elemento HTML
		if (document.getElementById("bottom-scroll-textarea")) {
			document.getElementById("bottom-scroll-textarea").innerHTML +=
				`${fullMessage}\n`;
		}
	}
};

const warn = (message, ...params) => {
	console.warn(message, ...params);
	if (typeof document !== "undefined") {
		const logContainer = document.getElementById("bottom-scroll-textarea");
		if (logContainer) {
			logContainer.innerHTML += `${message} ${params.join(" ")}\n`;
		}
	}
};

// Initialize device-specific accuracy settings
// Mobile devices have GPS and can achieve higher accuracy, so we're stricter
// Desktop devices use WiFi/IP location which is less accurate, so we're more lenient
if (typeof navigator !== 'undefined') {
	const isMobile = isMobileDevice();
	setupParams.notAcceptedAccuracy = isMobile
		? setupParams.mobileNotAcceptedAccuracy
		: setupParams.desktopNotAcceptedAccuracy;
	console.log(`[Device Detection] Type: ${isMobile ? 'Mobile/Tablet' : 'Desktop/Laptop'}`);
	console.log(`[Device Detection] Rejecting accuracy levels: ${setupParams.notAcceptedAccuracy.join(', ')}`);
} else {
	// Default for non-browser environments (e.g., Node.js testing)
	setupParams.notAcceptedAccuracy = setupParams.mobileNotAcceptedAccuracy;
}

// Example usage:
log("Guia.js version:", guiaVersion.toString());

/* ============================
 * Camada de Modelo
 * ============================
 */

class GeoPosition {
	constructor(position) {
		position.toString = function () {
			return `PositionGeolocation: { latitude: ${this.coords.latitude}, longitude: ${this.coords.longitude}, accuracy: ${this.coords.accuracy} }`;
		};
		this.geolocationPosition = position;
		this.coords = position.coords;
		this.latitude = position.coords.latitude;
		this.longitude = position.coords.longitude;
		this.accuracy = position.coords.accuracy;
		this.accuracyQuality = GeoPosition.getAccuracyQuality(
			position.coords.accuracy,
		);
		this.altitude = position.coords.altitude;
		this.altitudeAccuracy = position.coords.altitudeAccuracy;
		this.heading = position.coords.heading;
		this.speed = position.coords.speed;
		this.timestamp = position.timestamp;
		log("+++ (1) (GeoPosition) Created:", this.toString());
	}

	/**
	 * Classifies GPS accuracy into quality levels based on accuracy value in meters.
	 * 
	 * Provides a standardized way to assess the quality of GPS position data
	 * based on the accuracy reported by the device. Lower values indicate better accuracy.
	 * 
	 * Quality Levels:
	 * - excellent: ≤ 10 meters (high precision, suitable for all applications)
	 * - good: 11-30 meters (good precision, suitable for most applications)  
	 * - medium: 31-100 meters (moderate precision, may be acceptable for some uses)
	 * - bad: 101-200 meters (poor precision, generally not recommended)
	 * - very bad: > 200 meters (very poor precision, should be rejected)
	 * 
	 * @static
	 * @param {number} accuracy - GPS accuracy value in meters from GeolocationCoordinates
	 * @returns {string} Quality classification: 'excellent'|'good'|'medium'|'bad'|'very bad'
	 * 
	 * @example
	 * // Classify different accuracy levels
	 * console.log(GeoPosition.getAccuracyQuality(5));   // 'excellent'
	 * console.log(GeoPosition.getAccuracyQuality(25));  // 'good'
	 * console.log(GeoPosition.getAccuracyQuality(75));  // 'medium'
	 * console.log(GeoPosition.getAccuracyQuality(150)); // 'bad'
	 * console.log(GeoPosition.getAccuracyQuality(500)); // 'very bad'
	 * 
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates/accuracy} GeolocationCoordinates.accuracy
	 * @since 0.5.0-alpha
	 */
	static getAccuracyQuality(accuracy) {
		if (accuracy <= 10) {
			return "excellent";
		} else if (accuracy <= 30) {
			return "good";
		} else if (accuracy <= 100) {
			return "medium";
		} else if (accuracy <= 200) {
			return "bad";
		} else {
			return "very bad";
		}
	}

	/**
	 * Calculates the accuracy quality for the current position.
	 * 
	 * Convenience method that applies the static getAccuracyQuality() method
	 * to this instance's accuracy value.
	 * 
	 * @returns {string} Quality classification for current position accuracy
	 * 
	 * @example
	 * const manager = PositionManager.getInstance(position);
	 * console.log(manager.calculateAccuracyQuality()); // 'good'
	 * 
	 * @since 0.5.0-alpha
	 * @deprecated Use accuracyQuality property instead - this method has a bug (calls undefined getAccuracyQuality)
	 */
	calculateAccuracyQuality() {
		return getAccuracyQuality(this.accuracy);
	}

	/**
	 * Calculates the distance between this position and another position.
	 * 
	 * Uses the Haversine formula to compute the great-circle distance between
	 * two geographic points. Useful for determining how far the device has
	 * moved or measuring distances to other locations.
	 * 
	 * @param {Object} otherPosition - Other position to calculate distance to
	 * @param {number} otherPosition.latitude - Latitude of other position in decimal degrees
	 * @param {number} otherPosition.longitude - Longitude of other position in decimal degrees
	 * @returns {number} Distance in meters between the two positions
	 * 
	 * @example
	 * const manager = PositionManager.getInstance(currentPosition);
	 * const restaurant = { latitude: -23.5489, longitude: -46.6388 };
	 * const distance = manager.distanceTo(restaurant);
	 * console.log(`Restaurant is ${Math.round(distance)} meters away`);
	 * 
	 * @see {@link calculateDistance} - The underlying distance calculation function
	 * @since 0.5.0-alpha
	 */
	distanceTo(otherPosition) {
		return calculateDistance(
			this.latitude,
			this.longitude,
			otherPosition.latitude,
			otherPosition.longitude,
		);
	}

	/**
	 * Sets the position accuracy and automatically calculates quality classification.
	 * 
	 * This setter automatically updates the accuracyQuality property whenever
	 * the accuracy value changes, ensuring consistency between the numeric
	 * accuracy value and its quality classification.
	 * 
	 * @param {number} value - Accuracy value in meters from GPS coordinates
	 * 
	 * @example
	 * const manager = PositionManager.getInstance();
	 * manager.accuracy = 15; // Sets accuracy and updates accuracyQuality to 'good'
	 * console.log(manager.accuracyQuality); // 'good'
	 * 
	 * @since 0.5.0-alpha
	 */
	set accuracy(value) {
		this._accuracy = value;
		this.accuracyQuality = GeoPosition.getAccuracyQuality(value);
	}

	/**
	 * Returns a string representation of the GeoPosition instance.
	 * 
	 * Provides a formatted summary of key position properties for debugging
	 * and logging purposes. Includes class name and essential position data
	 * following the same format as PositionManager.toString().
	 * 
	 * @returns {string} Formatted string with position details
	 * 
	 * @example
	 * const position = new GeoPosition(geolocationPosition);
	 * console.log(position.toString());
	 * // Output: "GeoPosition: -23.5505, -46.6333, good, 760, 0, 0, 1634567890123"
	 * 
	 * @since 0.5.0-alpha
	 */
	toString() {
		if (!this.latitude || !this.longitude) {
			return `${this.constructor.name}: No position data`;
		}
		return `${this.constructor.name}: ${this.latitude}, ${this.longitude}, ${this.accuracyQuality}, ${this.altitude}, ${this.speed}, ${this.heading}, ${this.timestamp}`;
	}
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
 * - Minimum time interval between updates (60 seconds by default)
 * - Minimum distance change threshold (20 meters by default)
 * - Accuracy quality requirements (rejects medium/bad/very bad accuracy)
 * 
 * @class PositionManager
 * @implements {Observer} - Implements observer pattern for position change notifications
 * @since 0.5.0-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * // Get singleton instance and update position
 * const position = PositionManager.getInstance(geolocationPosition);
 * console.log(position.latitude, position.longitude);
 * 
 * @example
 * // Subscribe to position changes
 * const observer = {
 *   update: (positionManager, event) => {
 *     if (event === PositionManager.strCurrPosUpdate) {
 *       console.log('Position updated:', positionManager.latitude);
 *     }
 *   }
 * };
 * PositionManager.getInstance().subscribe(observer);
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API} Geolocation API
 * @see {@link https://www.w3.org/TR/geolocation-API/} W3C Geolocation API Specification
 */

/**
 * ObserverSubject - Centralizes observer pattern implementation
 * 
 * This class provides a reusable implementation of the observer pattern,
 * supporting both object-based observers (with update methods) and function-based observers.
 * It eliminates code duplication across multiple classes that need observer functionality.
 * 
 * @class
 * @since 0.8.4-alpha
 * 
 * @example
 * // Using in a class via composition
 * class MyClass {
 *   constructor() {
 *     this.observerSubject = new ObserverSubject();
 *   }
 *   
 *   subscribe(observer) {
 *     this.observerSubject.subscribe(observer);
 *   }
 *   
 *   notify(...args) {
 *     this.observerSubject.notifyObservers(...args);
 *   }
 * }
 */
class ObserverSubject {
	/**
	 * Creates a new ObserverSubject instance.
	 * Initializes empty arrays for both object and function observers.
	 */
	constructor() {
		this.observers = [];
		this.functionObservers = [];
	}

	/**
	 * Subscribes an observer object to receive notifications.
	 * The observer must have an update() method that will be called on notifications.
	 * Uses immutable pattern to avoid direct array mutation.
	 * 
	 * @param {Object} observer - Observer object with an update method
	 * @param {Function} observer.update - Method called when notifying observers
	 * @returns {void}
	 * 
	 * @example
	 * const observer = {
	 *   update: (subject, ...args) => {
	 *     console.log('Notified with:', args);
	 *   }
	 * };
	 * observerSubject.subscribe(observer);
	 */
	subscribe(observer) {
		if (observer) {
			this.observers = [...this.observers, observer];
		}
	}

	/**
	 * Unsubscribes an observer object from notifications.
	 * 
	 * @param {Object} observer - Observer object to remove
	 * @returns {void}
	 * 
	 * @example
	 * observerSubject.unsubscribe(observer);
	 */
	unsubscribe(observer) {
		this.observers = this.observers.filter((o) => o !== observer);
	}

	/**
	 * Notifies all subscribed object observers.
	 * Calls the update() method on each observer with the provided arguments.
	 * 
	 * @param {...*} args - Arguments to pass to each observer's update method
	 * @returns {void}
	 * 
	 * @example
	 * observerSubject.notifyObservers(data1, data2, eventType);
	 */
	notifyObservers(...args) {
		log("+++ (100) (ObserverSubject) Notifying observers with args:", args);
		this.observers.forEach((observer) => {
			if (typeof observer.update === "function") {
				log("+++ (101) (ObserverSubject) Notifying observer:", observer);
				observer.update(...args);
			}
		});
	}

	/**
	 * Subscribes a function to receive notifications.
	 * Uses immutable pattern to avoid direct array mutation.
	 * 
	 * @param {Function} observerFunction - Function to be called on notifications
	 * @returns {void}
	 * 
	 * @example
	 * const handler = (subject, ...args) => {
	 *   console.log('Function observer notified:', args);
	 * };
	 * observerSubject.subscribeFunction(handler);
	 */
	subscribeFunction(observerFunction) {
		if (observerFunction) {
			this.functionObservers = [...this.functionObservers, observerFunction];
		}
	}

	/**
	 * Unsubscribes a function from notifications.
	 * 
	 * @param {Function} observerFunction - Function to remove
	 * @returns {void}
	 * 
	 * @example
	 * observerSubject.unsubscribeFunction(handler);
	 */
	unsubscribeFunction(observerFunction) {
		this.functionObservers = this.functionObservers.filter(
			(fn) => fn !== observerFunction,
		);
	}

	/**
	 * Notifies all subscribed function observers.
	 * 
	 * @param {...*} args - Arguments to pass to each observer function
	 * @returns {void}
	 * 
	 * @example
	 * observerSubject.notifyFunctionObservers(data1, data2);
	 */
	notifyFunctionObservers(...args) {
		this.functionObservers.forEach((fn) => {
			if (typeof fn === "function") {
				fn(...args);
			}
		});
	}

	/**
	 * Gets the count of subscribed object observers.
	 * 
	 * @returns {number} Number of subscribed observers
	 */
	getObserverCount() {
		return this.observers.length;
	}

	/**
	 * Gets the count of subscribed function observers.
	 * 
	 * @returns {number} Number of subscribed function observers
	 */
	getFunctionObserverCount() {
		return this.functionObservers.length;
	}

	/**
	 * Clears all observers (both object and function observers).
	 * 
	 * @returns {void}
	 */
	clearAllObservers() {
		this.observers = [];
		this.functionObservers = [];
	}
}

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
	 * Event string constant fired when position is successfully updated and must be immediatily processed.
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
	 * @since 0.5.0-alpha
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
	 * Initializes the position manager with empty observer list and optional 
	 * initial position data. This constructor is typically called internally
	 * by the getInstance() method to maintain the singleton pattern.
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
	 * @since 0.5.0-alpha
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
	 * Implements the observer pattern by adding observers that will be notified
	 * when position updates occur. Observers must implement an update() method
	 * that accepts (positionManager, eventType) parameters.
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
	 * @since 0.5.0-alpha
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
	 * const myObserver = { update: () => {} };
	 * const manager = PositionManager.getInstance();
	 * manager.subscribe(myObserver);
	 * // Later..
	 * manager.unsubscribe(myObserver);
	 * 
	 * @since 0.5.0-alpha
	 */
	unsubscribe(observer) {
		this.observerSubject.unsubscribe(observer);
	}

	/**
	 * Notifies all subscribed observers about position change events.
	 * 
	 * Called internally when position updates occur or are rejected.
	 * All subscribed observers receive the event notification via their
	 * update() method.
	 * 
	 * @param {string} posEvent - Event type (strCurrPosUpdate or strCurrPosNotUpdate)
	 * @returns {void}
	 * 
	 * @private
	 * @since 0.5.0-alpha
	 */
	notifyObservers(posEvent) {
		this.observerSubject.notifyObservers(this, posEvent)
	}

	/**
	 * Updates the position with validation and filtering rules.
	 * 
	 * This is the core method that processes new position data with multiple
	 * validation layers to ensure only meaningful position updates are accepted:
	 * 
	 * Validation Rules:
	 * 1. Position validity: Must have valid position object with timestamp
	 * 2. Time constraint: Must wait at least 60 seconds (trackingInterval) between updates
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
	 * @since 0.5.0-alpha
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
	 * @since 0.5.0-alpha
	 */
	toString() {
		let position = this.lastPosition || {};
		if (!position || !this.latitude || !this.longitude) {
			return `${this.constructor.name}: No position data`;
		}
		return `${this.constructor.name}: ${position.latitude}, ${position.longitude}, ${position.accuracyQuality}, ${position.altitude}, ${position.speed}, ${position.heading}, ${position.timestamp}`;
	}

}

/* ============================
 * Camada de Serviço
 * ============================
 */

class SingletonStatusManager {
	constructor() {
		if (SingletonStatusManager.instance) {
			return SingletonStatusManager.instance;
		}

		this.gettingLocation = false;
		SingletonStatusManager.instance = this;
	}

	isGettingLocation() {
		return this.gettingLocation;
	}

	setGettingLocation(status) {
		this.gettingLocation = status;
		if (status) {
			console.log("Getting location...");
		} else {
			console.log("Stopped getting location.");
		}
	}

	setGettingLocation(status) {
		this.gettingLocation = status;
	}

	static getInstance() {
		this.instance = this.instance || new SingletonStatusManager();
		return this.instance;
	}
}

class APIFetcher {
	constructor(url) {
		this.url = url;
		this.observerSubject = new ObserverSubject();
		this.fetching = false;
		this.data = null;
		this.error = null;
		this.loading = false;
		this.lastFetch = 0;
		this.timeout = 10000;
		this.cache = new Map();
		this.lastPosition = null;
	}

	/**
	 * Gets the observers array for backward compatibility.
	 * @private
	 * @returns {Array} Array of subscribed observers
	 */
	get observers() {
		return this.observerSubject.observers;
	}

	getCacheKey() {
		// Override this method in subclasses to provide a unique cache key
		return this.url;
	}

	setUrl(url) {
		this.url = url;
		this.data = null;
		this.error = null;
		this.loading = false;
		this.lastFetch = 0;
		this.cache.clear();
	}

	subscribe(observer) {
		this.observerSubject.subscribe(observer);
	}

	unsubscribe(observer) {
		this.observerSubject.unsubscribe(observer);
	}

	notifyObservers(appEvent) {
		this.observerSubject.notifyObservers(this.firstUpdateParam(), this.secondUpdateParam(), appEvent, this.error, this.loading);
	}

	firstUpdateParam() {
		return this.data;
	}

	secondUpdateParam() {
		return null;
	}

	/**
 * Fetches data from the configured URL with robust caching, loading states, and error handling.
 * 
 * This method implements a comprehensive data fetching strategy designed to efficiently retrieve 
 * and manage data from external APIs while providing a smooth user experience through intelligent 
 * caching and proper state management.
 * 
 * **Caching Strategy:**
 * The method starts by generating a cache key using getCacheKey(), which by default returns the URL 
 * but can be overridden in subclasses for more sophisticated caching strategies. It immediately 
 * checks if the data already exists in the cache - if it does, it retrieves the cached data and 
 * returns early, avoiding unnecessary network requests. This caching mechanism significantly 
 * improves performance by reducing redundant API calls.
 * 
 * **Loading State Management:**
 * When a cache miss occurs, the method sets `this.loading = true` to indicate that a network 
 * operation is in progress. This loading state can be used by the UI to show loading spinners 
 * or disable user interactions, providing immediate feedback to users.
 * 
 * **Network Operations:**
 * The actual data fetching uses the modern Fetch API with proper error handling - it checks if 
 * the response is successful using `response.ok` and throws a meaningful error if the request fails. 
 * The method follows the JSON API pattern by calling `response.json()` to parse the response data.
 * 
 * **Data Storage:**
 * Upon successful retrieval, it stores the data both in the instance (`this.data`) and in the cache 
 * for future use, ensuring consistent data availability across the application.
 * 
 * **Error Handling:**
 * The error handling is comprehensive, catching any network errors, parsing errors, or HTTP errors 
 * and storing them in `this.error` for the calling code to handle appropriately. This provides 
 * a clean separation of concerns and allows for more manageable error handling in the UI.
 * 
 * **Cleanup Guarantee:**
 * The `finally` block ensures that `this.loading` is always reset to `false`, regardless of whether 
 * the operation succeeded or failed. This prevents the UI from getting stuck in a loading state, 
 * which is a common source of bugs in data fetching implementations.
 * 
 * @async
 * @returns {Promise<void>} Resolves when data is fetched and stored, or retrieved from cache
 * @throws {Error} Network errors, HTTP errors, or JSON parsing errors are caught and stored in this.error
 * 
 * @example
 * // Basic usage with automatic caching
 * const fetcher = new APIFetcher('https://api.example.com/data');
 * await fetcher.fetchData();
 * console.log(fetcher.data); // Retrieved data
 * console.log(fetcher.loading); // false after completion
 * 
 * @example
 * // Error handling
 * try {
 *   await fetcher.fetchData();
 *   if (fetcher.error) {
 *     console.error('Fetch failed:', fetcher.error.message);
 *   }
 * } catch (error) {
 *   console.error('Unexpected error:', error);
 * }
 * 
 * @see {@link getCacheKey} - Override this method for custom cache key generation
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
	async fetchData() {
		// Generate cache key for this request (can be overridden in subclasses)
		const cacheKey = this.getCacheKey();

		// Check cache first - if data exists, return immediately to avoid network request
		if (this.cache.has(cacheKey)) {
			this.data = this.cache.get(cacheKey);
			return; // Early return with cached data improves performance
		}

		// Set loading state to indicate network operation in progress
		// UI can use this to show loading spinners or disable interactions
		this.loading = true;

		try {
			// Perform network request using modern Fetch API
			const response = await fetch(this.url);

			// Check if HTTP request was successful (status 200-299)
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Parse JSON response data
			const data = await response.json();

			// Store data in instance for immediate access
			this.data = data;

			// Cache the result for future requests with same cache key
			this.cache.set(cacheKey, data);

		} catch (error) {
			// Comprehensive error handling: network errors, HTTP errors, JSON parsing errors
			// Store error for calling code to handle appropriately
			this.error = error;
		} finally {
			// Always reset loading state regardless of success/failure
			// This prevents UI from getting stuck in loading state
			this.loading = false;
		}
	}
}

class ReverseGeocoder extends APIFetcher {
	constructor(latitude, longitude) {
		super("");
		Object.defineProperty(this, "currentAddress", {
			get: () => this.data,
			set: (value) => {
				this.data = value;
			},
		});
		this.setCoordinates(latitude, longitude);
	}

	secondUpdateParam() {
		return this.enderecoPadronizado;
	}

	setCoordinates(latitude, longitude) {
		if (!latitude || !longitude) {
			return;
		}
		this.latitude = latitude;
		this.longitude = longitude;
		this.url = getOpenStreetMapUrl(this.latitude, this.longitude);
		this.data = null;
		this.error = null;
		this.loading = false;
		this.lastFetch = 0;
	}

	getCacheKey() {
		return `${this.latitude},${this.longitude}`;
	}

	async fetchAddress() {
		return super.fetchData();
	}

	/**
	 * Observer pattern update method for PositionManager notifications.
	 * 
	 * This method is called when the PositionManager notifies observers about position changes.
	 * It updates the geocoder coordinates and triggers reverse geocoding for new positions.
	 * 
	 * @param {PositionManager} positionManager - The PositionManager instance with current position
	 * @param {string} posEvent - The position event type (strCurrPosUpdate, strCurrPosNotUpdate, etc.)
	 * @param {Object} loading - Loading state information
	 * @param {Object} error - Error information if any
	 * @returns {void}
	 * 
	 * @since 0.8.3-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	update(positionManager, posEvent, loading, error) {
		if (!positionManager || !positionManager.lastPosition) {
			warn("(ReverseGeocoder) Invalid PositionManager or no last position.");
			return;
		}

		// Only process actual position updates, ignore other events
		const coords = positionManager.lastPosition.coords;
		if (coords && coords.latitude && coords.longitude) {
			// Update coordinates
			this.setCoordinates(coords.latitude, coords.longitude);

			// Trigger reverse geocoding asynchronously
			this.reverseGeocode()
				.then((addressData) => {
					this.currentAddress = addressData;
					this.enderecoPadronizado = AddressDataExtractor.getBrazilianStandardAddress(addressData);
					// Notify this geocoder's own observers
					log("+++ (10) (ReverseGeocoder) Received the address data and now notifying the observers.");
					this.notifyObservers(posEvent);
				})
				.catch((error) => {
					console.error("(ReverseGeocoder) Reverse geocoding failed:", error);
					this.error = error;
					this.notifyObservers(posEvent);
				});
		}
	}

	/**
 * Performs reverse geocoding to convert latitude/longitude coordinates into human-readable address.
 * 
 * This method validates coordinates, constructs the OpenStreetMap API URL, and fetches address data
 * using the configured data fetching mechanism. It handles coordinate validation, URL generation,
 * and promise-based error handling for robust geocoding operations.
 * 
 * **ISSUES IDENTIFIED AND FIXED:**
 * 1. **Code Duplication**: The original method had duplicate coordinate and URL validation blocks
 *    that were identical and served no purpose. This has been consolidated into single checks.
 * 
 * 2. **Redundant Validation**: The method was checking coordinates and URL twice in succession,
 *    which added unnecessary overhead and made the code harder to maintain.
 * 
 * 3. **Promise Wrapping**: The method was unnecessarily wrapping the already-async fetchData()
 *    method in a new Promise, which is an anti-pattern. Modern async/await syntax is cleaner.
 * 
 * 4. **Error Handling**: The original error handling was verbose and didn't add value over
 *    the built-in promise rejection mechanisms.
 * 
 * **PERFORMANCE IMPROVEMENTS:**
 * - Eliminated duplicate validation checks that were executed twice
 * - Removed unnecessary Promise wrapping around async operations
 * - Streamlined error handling to use native promise mechanisms
 * - Reduced method complexity from multiple validation blocks to single-pass validation
 * 
 * **VALIDATION LOGIC:**
 * The method first validates that both latitude and longitude are provided and valid.
 * If coordinates are missing or invalid, it immediately rejects with a descriptive error.
 * If no URL is configured, it automatically generates one using the OpenStreetMap service.
 * 
 * @async
 * @returns {Promise<Object>} Promise that resolves to geocoded address data from OpenStreetMap
 * @throws {Error} Throws "Invalid coordinates" if latitude or longitude are missing/invalid
 * @throws {Error} Throws network errors, HTTP errors, or JSON parsing errors from fetchData()
 * 
 * @example
 * // Basic reverse geocoding
 * const geocoder = new ReverseGeocoder(-23.5505, -46.6333);
 * try {
 *   const addressData = await geocoder.reverseGeocode();
 *   console.log('Address:', addressData.display_name);
 * } catch (error) {
 *   console.error('Geocoding failed:', error.message);
 * }
 * 
 * @example
 * // With promise chaining (legacy style)
 * geocoder.reverseGeocode()
 *   .then(data => console.log('Success:', data))
 *   .catch(error => console.error('Failed:', error));
 * 
 * @see {@link fetchData} - The underlying data fetching method with caching
 * @see {@link getOpenStreetMapUrl} - URL generation utility for OpenStreetMap API
 * @see {@link https://nominatim.openstreetmap.org/} - OpenStreetMap Nominatim API documentation
 * 
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
	async reverseGeocode() {
		// FIXED: Single coordinate validation check (was duplicated twice in original)
		// Validate that both latitude and longitude are provided and valid
		if (!this.latitude || !this.longitude) {
			throw new Error("Invalid coordinates");
		}

		// FIXED: Single URL generation check (was duplicated twice in original)  
		// Generate OpenStreetMap URL if not already configured
		if (!this.url) {
			this.url = getOpenStreetMapUrl(this.latitude, this.longitude);
		}

		// FIXED: Use modern async/await instead of unnecessary Promise wrapping
		// The original code wrapped fetchData() in a new Promise, which is an anti-pattern
		// since fetchData() already returns a Promise
		try {
			// Fetch data using the configured URL with built-in caching and error handling
			await this.fetchData();

			// FIXED: Simplified error handling - if this.error exists, throw it directly
			// The original code was doing manual promise resolution/rejection which was redundant
			if (this.error) {
				throw this.error;
			}

			// Return the successfully fetched address data
			return this.data;

		} catch (error) {
			// FIXED: Simplified error propagation - just re-throw the error
			// Modern promise chains handle this automatically without manual catch/reject
			throw error;
		}
		l
	}

	/**
	 * Returns a string representation of the ReverseGeocoder instance.
	 * 
	 * Provides a formatted summary showing the class name and the coordinates
	 * being geocoded, useful for debugging and logging purposes.
	 * 
	 * @returns {string} Formatted string with class name and coordinates
	 * 
	 * @example
	 * const geocoder = new ReverseGeocoder(-23.5505, -46.6333);
	 * console.log(geocoder.toString());
	 * // Output: "ReverseGeocoder: -23.5505, -46.6333"
	 * 
	 * @example
	 * const geocoder = new ReverseGeocoder();
	 * console.log(geocoder.toString());
	 * // Output: "ReverseGeocoder: No coordinates set"
	 * 
	 * @since 0.8.4-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	toString() {
		if (!this.latitude || !this.longitude) {
			return `${this.constructor.name}: No coordinates set`;
		}
		return `${this.constructor.name}: ${this.latitude}, ${this.longitude}`;
	}
}

/**
 * Represents a standardized Brazilian address with formatted components.
 * 
 * This class provides a structured representation of Brazilian addresses following
 * national postal standards, with methods for formatting and displaying address
 * components in a consistent manner across the application.
 * 
 * @class BrazilianStandardAddress
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class BrazilianStandardAddress {
	/**
	 * Creates a new BrazilianStandardAddress instance.
	 * 
	 * Initializes all address components to null, creating an empty address
	 * that can be populated with standardized Brazilian address data.
	 */
	constructor() {
		this.logradouro = null;
		this.numero = null;
		this.complemento = null;
		this.bairro = null;
		this.municipio = null;
		this.uf = null;
		this.cep = null;
		this.pais = "Brasil";
	}

	/**
	 * Returns the complete formatted street address (logradouro + número).
	 * 
	 * @returns {string} Formatted street address or just street name
	 * @since 0.8.3-alpha
	 */
	logradouroCompleto() {
		if (!this.logradouro) return "";
		if (this.numero) {
			return `${this.logradouro}, ${this.numero}`;
		}
		return this.logradouro;
	}

	/**
	 * Returns the complete formatted neighborhood information.
	 * 
	 * @returns {string} Formatted neighborhood name
	 * @since 0.8.3-alpha
	 */
	bairroCompleto() {
		return this.bairro || "";
	}

	/**
	 * Returns the complete formatted city and state information.
	 * 
	 * @returns {string} Formatted city and state
	 * @since 0.8.3-alpha
	 */
	municipioCompleto() {
		if (!this.municipio) return "";
		if (this.uf) {
			return `${this.municipio}, ${this.uf}`;
		}
		return this.municipio;
	}

	/**
	 * Returns a complete formatted address string.
	 * Uses immutable pattern to build address parts array.
	 * 
	 * @returns {string} Complete formatted address
	 * @since 0.8.3-alpha
	 */
	enderecoCompleto() {
		return [
			this.logradouroCompleto(),
			this.bairro,
			this.municipioCompleto(),
			this.cep
		]
		.filter(Boolean)  // Remove falsy values
		.join(", ");
	}

	toString() {
		return `${this.constructor.name}: ${this.enderecoCompleto() || 'Empty address'}`;
	}
}

/**
 * Represents a reference place extracted from geocoding data.
 * 
 * This class encapsulates information about reference places such as shopping centers,
 * subway stations, cafes, and other points of interest. It extracts the "class", "type",
 * and "name" fields from geocoding API responses and provides a Portuguese description
 * of the reference place type.
 * 
 * Reference places are useful for providing contextual information to users about their
 * location, such as "You are at Shopping Center XYZ" or "Near Subway Station ABC".
 * 
 * @class ReferencePlace
 * @since 0.8.5-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * const data = { 
 *   class: 'shop', 
 *   type: 'mall', 
 *   name: 'Shopping Morumbi' 
 * };
 * const refPlace = new ReferencePlace(data);
 * console.log(refPlace.description); // "Shopping Center"
 * console.log(refPlace.name); // "Shopping Morumbi"
 * console.log(refPlace.toString()); // "ReferencePlace: Shopping Center - Shopping Morumbi"
 */
class ReferencePlace {
	/**
	 * Creates a new ReferencePlace instance.
	 * 
	 * Extracts class, type, and name information from the provided geocoding data
	 * and calculates the Portuguese description of the reference place type.
	 * 
	 * @param {Object} data - Raw address data from geocoding API
	 * @param {string} [data.class] - The class category of the place (e.g., 'shop', 'amenity', 'railway')
	 * @param {string} [data.type] - The specific type within the class (e.g., 'mall', 'cafe', 'subway')
	 * @param {string} [data.name] - The name of the reference place
	 * 
	 * @since 0.8.5-alpha
	 */
	constructor(data) {
		this.className = (data && data.class) || null;
		this.typeName = (data && data.type) || null;
		this.name = (data && data.name) || null;
		this.description = this.calculateDescription();
		Object.freeze(this); // Prevent modification following MP Barbosa standards
	}

	/**
	 * Calculates the Portuguese description of the reference place type.
	 * 
	 * Uses the class and type information to look up a human-readable description
	 * in Portuguese from the reference place mapping configuration. Falls back to
	 * a default "Não classificado" (unclassified) message if no mapping is found.
	 * 
	 * @private
	 * @returns {string} Portuguese description of the reference place type
	 * @since 0.8.5-alpha
	 */
	calculateDescription() {
		if (!this.className || !this.typeName) {
			return setupParams.noReferencePlace;
		}

		// Check if this is a valid reference place class
		if (!setupParams.validRefPlaceClasses.includes(this.className)) {
			return setupParams.noReferencePlace;
		}

		if (this.className && this.typeName) {
			// Look up in the reference place map
			if (setupParams.referencePlaceMap[this.className] &&
				setupParams.referencePlaceMap[this.className][this.typeName]) {
					if (this.name) {
						return `${setupParams.referencePlaceMap[this.className][this.typeName]} ${this.name}`;
					} else {
						return setupParams.referencePlaceMap[this.className][this.typeName];
					}
			}
		}

		// Fallback to class/type combination
		return `${this.className}: ${this.typeName}`;
	}

	/**
	 * Returns a string representation of this reference place.
	 * 
	 * Provides a formatted string showing the description and name (if available)
	 * of the reference place.
	 * 
	 * @returns {string} String representation
	 * @since 0.8.5-alpha
	 * 
	 * @example
	 * const refPlace = new ReferencePlace({ class: 'shop', type: 'mall', name: 'Shopping Morumbi' });
	 * console.log(refPlace.toString()); 
	 * // Output: "ReferencePlace: Shopping Center - Shopping Morumbi"
	 */
	toString() {
		const baseName = `${this.constructor.name}: ${this.description}`;
		if (this.name) {
			return `${baseName} - ${this.name}`;
		}
		return baseName;
	}
}

/**
 * Displays and manages elapsed time information in HTML format.
 * 
 * This class tracks and displays timing information related to position updates,
 * showing how much time has elapsed since the last position change. It implements
 * the observer pattern to automatically update when new position data becomes available.
 * 
 * @class Chronometer
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class Chronometer {
	/**
	 * Creates a new Chronometer instance.
	 * 
	 * @param {HTMLElement} element - DOM element where chronometer will be displayed
	 */
	constructor(element) {
		console.log("Initializing Chronometer...");
		this.element = element;
		this.startTime = null;
		this.lastUpdateTime = null;
		this.isRunning = false;
		this.intervalId = null;
	}

	/**
	 * Starts the chronometer timing.
	 * 
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	start() {
		if (!this.isRunning) {
			this.startTime = Date.now();
			this.lastUpdateTime = this.startTime;
			this.isRunning = true;

			// Update display immediately
			this.updateDisplay();

			// Start interval to update display every second
			this.intervalId = setInterval(() => {
				this.updateDisplay();
			}, 1000);
		}
	}

	/**
	 * Stops the chronometer timing.
	 * 
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	stop() {
		if (this.isRunning) {
			this.isRunning = false;
			if (this.intervalId) {
				clearInterval(this.intervalId);
				this.intervalId = null;
			}
		}
	}

	/**
	 * Resets the chronometer to initial state.
	 * 
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	reset() {
		this.stop();
		this.startTime = null;
		this.lastUpdateTime = null;
		if (this.element) {
			this.element.textContent = "00:00:00";
		}
	}

	/**
	 * Gets the current elapsed time in milliseconds.
	 * 
	 * @returns {number} Elapsed time in milliseconds
	 * @since 0.8.3-alpha
	 */
	getElapsedTime() {
		if (!this.startTime) {
			return 0;
		}
		return Date.now() - this.startTime;
	}

	/**
	 * Formats elapsed time in milliseconds to HH:MM:SS format.
	 * 
	 * @param {number} milliseconds - Time duration in milliseconds
	 * @returns {string} Formatted time string in HH:MM:SS format
	 * @since 0.8.3-alpha
	 */
	formatTime(milliseconds) {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		return [hours, minutes, seconds]
			.map(unit => unit.toString().padStart(2, '0'))
			.join(':');
	}

	/**
	 * Updates the chronometer display with current elapsed time.
	 * 
	 * @private
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	updateDisplay() {
		if (this.element) {
			const elapsed = this.getElapsedTime();
			const formattedTime = this.formatTime(elapsed);
			this.element.textContent = formattedTime;
		}
	}

	/**
	 * Updates the chronometer based on position manager notifications.
	 * 
	 * Observer pattern update method that gets called when the PositionManager
	 * has new position data available.
	 * 
	 * @param {PositionManager} positionManager - The PositionManager instance
	 * @param {string} posEvent - The position event type
	 * @param {Object} loading - Loading state information  
	 * @param {Object} error - Error information if any
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	update(positionManager, posEvent, loading, error) {
		// Handle different position events
		if (posEvent === PositionManager.strCurrPosUpdate ||
			posEvent === PositionManager.strImmediateAddressUpdate) {
			// Position successfully updated - restart chronometer
			this.reset();
			this.start();
		} else if (posEvent === PositionManager.strCurrPosNotUpdate) {
			// Position update was rejected - continue running if already started
			if (!this.isRunning && this.element) {
				this.start();
			}
		}

		// Handle error states
		if (error) {
			this.stop();
			if (this.element) {
				this.element.textContent = "Error";
			}
		}

		// Handle loading states
		if (loading) {
			if (this.element) {
				this.element.textContent = "Loading...";
			}
		}
	}

	toString() {
		const state = this.isRunning ? 'running' : 'stopped';
		const elapsed = this.formatTime(this.getElapsedTime());
		return `${this.constructor.name}: ${state}, elapsed: ${elapsed}`;
	}
}

/**
 * Manages HTML text content updates with timestamp formatting.
 * 
 * @class HtmlText
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class HtmlText {
	/**
	 * Creates a new HtmlText instance.
	 * 
	 * @param {Document} document - Document object for DOM operations
	 * @param {HTMLElement} element - Target DOM element for text updates
	 */
	constructor(document, element) {
		this.document = document;
		this.element = element;
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	/**
	 * Updates the element with current timestamp on position changes.
	 * 
	 * @param {PositionManager} positionManager - The PositionManager instance
	 * @param {string} posEvent - The position event type
	 * @param {Object} loading - Loading state information
	 * @param {Object} error - Error information if any
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	update(positionManager, posEvent, loading, error) {
		if (this.element) {
			if (error) {
				this.element.textContent = `Error: ${error.message}`;
			} else if (loading) {
				this.element.textContent = "Loading...";
			} else if (posEvent === PositionManager.strCurrPosUpdate ||
				posEvent === PositionManager.strImmediateAddressUpdate) {
				this.element.textContent = new Date().toLocaleString();
			}
		}
	}

	toString() {
		return `${this.constructor.name}: ${this.element.id || 'no-id'}`;
	}
}

/**
 * Displays position information in HTML format with coordinates and accuracy details.
 * 
 * @class HTMLPositionDisplayer
 * @since 0.8.3-alpha  
 * @author Marcelo Pereira Barbosa
 */
class HTMLPositionDisplayer {
	constructor(element) {
		this.element = element;
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	/**
	 * Renders position data as formatted HTML.
	 * 
	 * @param {PositionManager} positionManager - PositionManager instance with position data
	 * @returns {string} Formatted HTML string for position display
	 * @since 0.8.3-alpha
	 */
	renderPositionHtml(positionManager) {
		if (!positionManager || !positionManager.lastPosition) {
			return "<p class='error'>No position data available.</p>";
		}

		const geoPosition = positionManager.lastPosition;
		const position = geoPosition.geolocationPosition;
		const coords = position.coords;

		let html = `<details class="position-details" closed>
            <summary><strong>Posição Atual</strong></summary>`;

		html += `<div class="coordinates">
		${position}<br>
		</div>`;

		// Display core coordinates
		html += `<div class="coordinates">
            <h4>Coordenadas:</h4>
            <p><strong>Latitude:</strong> ${coords.latitude.toFixed(6)}°</p>
            <p><strong>Longitude:</strong> ${coords.longitude.toFixed(6)}°</p>
        </div>`;

		// Display accuracy information
		html += `<div class="accuracy-info">
            <p><strong>Precisão:</strong> ${coords.accuracy ? coords.accuracy.toFixed(2) : 'N/A'} metros</p>
            <h4>Precisão:</h4>
            <p><strong>Qualidade:</strong> ${this.formatAccuracyQuality(position.accuracyQuality)}</p>
        </div>`;

		// Display altitude if available
		if (position.altitude !== null && position.altitude !== undefined) {
			html += `<div class="altitude-info">
                <h4>Altitude:</h4>
                <p><strong>Altitude:</strong> ${position.altitude.toFixed(2)} metros</p>`;

			if (position.altitudeAccuracy !== null && position.altitudeAccuracy !== undefined) {
				html += `<p><strong>Precisão da Altitude:</strong> ${position.altitudeAccuracy.toFixed(2)} metros</p>`;
			}
			html += `</div>`;
		}

		// Display movement information
		if (position.speed !== null && position.speed !== undefined) {
			const speedKmh = (position.speed * 3.6);
			html += `<div class="movement-info">
                <h4>Movimento:</h4>
                <p><strong>Velocidade:</strong> ${speedKmh.toFixed(2)} km/h</p>`;

			if (position.heading !== null && position.heading !== undefined) {
				html += `<p><strong>Direção:</strong> ${position.heading.toFixed(0)}°</p>`;
			}
			html += `</div>`;
		}

		html += `</details>`;
		return html;
	}

	formatAccuracyQuality(quality) {
		const qualityMap = {
			'excellent': 'Excelente',
			'good': 'Boa',
			'medium': 'Média',
			'bad': 'Ruim',
			'very bad': 'Muito Ruim'
		};
		return qualityMap[quality] || quality;
	}

	/**
	 * Updates the HTML display with new position information.
	 * 
	 * @param {PositionManager} positionManager - The PositionManager instance
	 * @param {string} posEvent - The position event type
	 * @param {Object} loading - Loading state information
	 * @param {Object} error - Error information if any
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	update(positionManager, posEvent, loading, error) {
		// Handle loading state
		if (loading) {
			this.element.innerHTML = '<p class="loading">Obtendo posição...</p>';
			return;
		}

		// Handle error state
		if (error) {
			this.element.innerHTML = `<p class="error">Erro ao obter posição: ${error.message}</p>`;
			return;
		}

		// Handle successful position updates
		if (posEvent === PositionManager.strCurrPosUpdate ||
			posEvent === PositionManager.strImmediateAddressUpdate) {
			if (positionManager && positionManager.lastPosition) {
				const html = this.renderPositionHtml(positionManager);
				this.element.innerHTML = html;
			} else {
				this.element.innerHTML = '<p class="warning">Dados de posição não disponíveis.</p>';
			}
		}
	}

	toString() {
		return `${this.constructor.name}: ${this.element.id || 'no-id'}`;
	}
}


class HTMLReferencePlaceDisplayer {
	constructor(element, referencePlaceDisplay = false) {
		this.element = element;
		this.referencePlaceDisplay = referencePlaceDisplay;
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	renderReferencePlaceHtml(referencePlace) {
		if (!referencePlace) {
			return "<p class='error'>No reference place data available.</p>";
		}


		// Display all referencePlace attributes
		let html = '<div class="reference-place-attributes">';
		html += referencePlace.description; 
		html += `</div>`;
		return html;
	}

	update(addressData, brazilianStandardAddress, posEvent, loading, error) {
		log("+++ (50) (HTMLReferencePlaceDisplayer) update() called with posEvent:", posEvent);
		log("+++ (50.1) (HTMLReferencePlaceDisplayer) brazilian standard address: ", brazilianStandardAddress.constructor.name);
		log("+++ (50.2) (HTMLReferencePlaceDisplayer) Reference place: ", brazilianStandardAddress.referencePlace);
		// Handle loading state
		if (loading) {
			this.element.innerHTML = '<p class="loading">Carregando local de referência...</p>';
			return;
		}

		// Handle error state
		if (error) {
			this.element.innerHTML = `<p class="error">Erro ao carregar local de referência: ${error.message}</p>`;
			return;
		}

		// Handle successful reference place data
		if (posEvent == PositionManager.strCurrPosUpdate && (brazilianStandardAddress)) {
			log("+++ (51) (HTMLReferencePlaceDisplayer) Rendering reference place data:", brazilianStandardAddress);
			const html = this.renderReferencePlaceHtml(brazilianStandardAddress.referencePlace);
			this.element.innerHTML = html;
		}
	}

	toString() {
		return `${this.constructor.name}: ${this.element.id || 'no-id'}`;
	}
}

/**
 * Displays address information in HTML format.
 * 
 * @class HTMLAddressDisplayer
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class HTMLAddressDisplayer {
	constructor(element, enderecoPadronizadoDisplay = false) {
		this.element = element;
		this.enderecoPadronizadoDisplay = enderecoPadronizadoDisplay;
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	renderAddressHtml(addressData, enderecoPadronizado) {
		if (!addressData) {
			return "<p class='error'>No address data available.</p>";
		}

		if (this.enderecoPadronizadoDisplay && enderecoPadronizado) {
			this.enderecoPadronizadoDisplay.innerHTML = enderecoPadronizado.enderecoCompleto();
		}

		let html = `<details class="address-details" closed>
            <summary><strong>Endereço Atual</strong></summary>`;

		// Display all addressData attributes
		html += `<div class="address-attributes">
			<h4>Todos os atributos de addressData:</h4>
			<ul>`;
		for (const key in addressData) {
			if (Object.prototype.hasOwnProperty.call(addressData, key)) {
				const value = addressData[key];
				if (typeof value === 'object' && value !== null) {
					html += `<li><strong>${key}:</strong> <pre>${JSON.stringify(value, null, 2)}</pre></li>`;
				} else {
					html += `<li><strong>${key}:</strong> ${value}</li>`;
				}
			}
		}
		html += `</ul></div>`;

		// Display full address name if available
		if (addressData.display_name) {
			html += `<div class="full-address">
                <p><strong>Endereço Completo:</strong></p>
                <p class="display-name">${addressData.display_name}</p>
            </div>`;
		}

		html += `</details>`;
		return html;
	}

	update(addressData, enderecoPadronizado, posEvent, loading, error) {
		log("+++ (50) (HTMLAddressDisplayer) update() called with posEvent:", posEvent);
		// Handle loading state
		if (loading) {
			this.element.innerHTML = '<p class="loading">Carregando endereço...</p>';
			return;
		}

		// Handle error state
		if (error) {
			this.element.innerHTML = `<p class="error">Erro ao carregar endereço: ${error.message}</p>`;
			return;
		}

		// Handle successful address data
		if (posEvent == PositionManager.strCurrPosUpdate && (addressData || enderecoPadronizado)) {
			log("+++ (51) (HTMLAddressDisplayer) Rendering address data:", addressData);
			const html = this.renderAddressHtml(addressData, enderecoPadronizado);
			this.element.innerHTML += html;
		}
	}

	toString() {
		return `${this.constructor.name}: ${this.element.id || 'no-id'}`;
	}
}

// Add after the HTMLPositionDisplayer class and before the AddressDataExtractor class
// ...existing code continues...

/**
 * Extracts and standardizes address data from geocoding API responses.
 * 
 * This class is responsible for the extraction and standardization logic only.
 * It processes raw address data from geocoding services (like OpenStreetMap/Nominatim)
 * and converts it into standardized Brazilian address format with proper field mapping.
 * 
 * The class follows the Single Responsibility Principle by focusing solely on
 * the transformation of raw address data into a BrazilianStandardAddress object.
 * Cache management and change detection are handled by the AddressCache class.
 * 
 * Responsibilities:
 * - Parse raw geocoding API response data
 * - Map API fields to Brazilian address standard fields (logradouro, bairro, municipio, etc.)
 * - Handle fallback values for missing or incomplete data
 * - Create immutable address instances
 * 
 * @class AddressExtractor
 * @since 0.8.4-alpha
 * @author Marcelo Pereira Barbosa
 */
class AddressExtractor {
	/**
	 * Creates a new AddressExtractor instance.
	 * 
	 * @param {Object} data - Raw address data from geocoding API
	 */
	constructor(data) {
		this.data = data;
		this.enderecoPadronizado = new BrazilianStandardAddress();
		this.padronizaEndereco();
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	/**
	 * Standardizes the address data into Brazilian format.
	 * 
	 * Maps fields from the raw geocoding response to standardized Brazilian
	 * address components with proper fallback handling for missing data.
	 * 
	 * Supports both Nominatim API format (road, house_number, etc.) and 
	 * standard OSM address tags (addr:street, addr:housenumber, etc.).
	 * 
	 * @private
	 * @since 0.8.3-alpha
	 */
	padronizaEndereco() {
		if (!this.data || !this.data.address) {
			return;
		}

		const address = this.data.address;

		// Map street/road information
		// Supports: Nominatim format (road, street, pedestrian) and OSM tags (addr:street)
		this.enderecoPadronizado.logradouro = address['addr:street'] || address.road || address.street || address.pedestrian || null;

		// Map house number
		// Supports: Nominatim format (house_number) and OSM tags (addr:housenumber)
		this.enderecoPadronizado.numero = address['addr:housenumber'] || address.house_number || null;

		// Map neighborhood/suburb information
		// Supports: Nominatim format (neighbourhood, suburb, quarter) and OSM tags (addr:neighbourhood)
		this.enderecoPadronizado.bairro = address['addr:neighbourhood'] || address.neighbourhood || address.suburb || address.quarter || null;

		// Map municipality/city information
		// Supports: Nominatim format (city, town, municipality, village) and OSM tags (addr:city)
		this.enderecoPadronizado.municipio = address['addr:city'] || address.city || address.town || address.municipality || address.village || null;

		// Map state information
		// Supports: Nominatim format (state, state_code) and OSM tags (addr:state)
		this.enderecoPadronizado.uf = address['addr:state'] || address.state || address.state_code || null;

		// Map postal code
		// Supports: Nominatim format (postcode) and OSM tags (addr:postcode)
		this.enderecoPadronizado.cep = address['addr:postcode'] || address.postcode || null;

		// Map country (default to Brasil for Brazilian addresses)
		this.enderecoPadronizado.pais = address.country === 'Brasil' || address.country === 'Brazil' ? 'Brasil' : (address.country || 'Brasil');

		this.enderecoPadronizado.referencePlace = new ReferencePlace(this.data);
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

/**
 * Manages caching of standardized addresses with LRU eviction and change detection.
 * 
 * This class is responsible for cache management, performance optimization, and
 * change detection logic. It implements a sophisticated caching strategy including:
 * - LRU (Least Recently Used) eviction policy
 * - Time-based expiration of cache entries
 * - Change detection for address components (logradouro, bairro, municipio)
 * - Callback-based notifications for address changes
 * 
 * The class follows the Single Responsibility Principle by focusing solely on
 * cache management and change tracking. Address extraction logic is handled
 * by the AddressExtractor class.
 * 
 * Responsibilities:
 * - Generate unique cache keys from address data
 * - Store and retrieve cached addresses efficiently
 * - Implement LRU eviction when cache reaches capacity
 * - Clean expired cache entries based on timestamps
 * - Track address changes (current vs. previous)
 * - Notify registered callbacks when address components change
 * - Manage callback registration for change detection
 * 
 * @class AddressCache
 * @since 0.8.4-alpha
 * @author Marcelo Pereira Barbosa
 */
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
	 * @since 0.8.5-alpha
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
	 * @private
	 * @since 0.8.5-alpha
	 */
	constructor() {
		this.observerSubject = new ObserverSubject();
		this.cache = new Map();
		this.maxCacheSize = 50;
		this.cacheExpirationMs = 300000; // 5 minutes
		this.lastNotifiedChangeSignature = null;
		this.lastNotifiedBairroChangeSignature = null;
		this.lastNotifiedMunicipioChangeSignature = null;
		this.logradouroChangeCallback = null;
		this.bairroChangeCallback = null;
		this.municipioChangeCallback = null;
		this.currentAddress = null;
		this.previousAddress = null;
		this.currentRawData = null;
		this.previousRawData = null;
	}

	/**
	 * Generates a cache key for address data to enable efficient caching and retrieval.
	 * 
	 * Creates a unique identifier based on address components that can be used to cache
	 * processed address data and avoid redundant processing. The cache key is designed
	 * to be stable for the same address data while being unique across different addresses.
	 * 
	 * @param {Object} data - Address data from geocoding API
	 * @returns {string|null} Cache key string or null if data is invalid
	 * 
	 * @example
	 * const cache = AddressCache.getInstance();
	 * const cacheKey = cache.generateCacheKey(addressData);
	 * if (cacheKey) {
	 *   console.log('Cache key:', cacheKey);
	 * }
	 * 
	 * @since 0.8.3-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	generateCacheKey(data) {
		// Validate input data
		if (!data || !data.address) {
			return null;
		}

		const address = data.address;

		// Create cache key from essential address components
		// Use components that uniquely identify a location
		const keyComponents = [
			address.road || address.street || '',
			address.house_number || '',
			address.neighbourhood || address.suburb || '',
			address.city || address.town || address.municipality || '',
			address.postcode || '',
			address.country_code || ''
		];

		// Filter out empty components and join with separator
		const cacheKey = keyComponents
			.filter(component => component.trim() !== '')
			.join('|');

		// Return null if no meaningful components found
		return cacheKey.length > 0 ? cacheKey : null;
	}

	/**
	 * Static wrapper for backward compatibility.
	 * @deprecated Use getInstance().generateCacheKey() instead
	 * @static
	 */
	static generateCacheKey(data) {
		return AddressCache.getInstance().generateCacheKey(data);
	}

	/**
	 * Evicts least recently used cache entries when maximum cache size is reached.
	 * 
	 * This method implements LRU (Least Recently Used) eviction policy to maintain
	 * cache size within configured limits. It removes the oldest entries based on
	 * lastAccessed timestamp to make room for new entries.
	 * 
	 * @private
	 * @since 0.8.3-alpha
	 */
	evictLeastRecentlyUsedIfNeeded() {
		if (this.cache.size >= this.maxCacheSize) {
			// Convert cache entries to array and sort by lastAccessed (oldest first)
			const entries = Array.from(this.cache.entries());
			entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

			// Calculate how many entries to remove (25% of max size)
			const entriesToRemove = Math.ceil(this.maxCacheSize * 0.25);

			// Remove the least recently used entries
			for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
				this.cache.delete(entries[i][0]);
			}
		}
	}

	/**
	 * Cleans up expired cache entries based on timestamp.
	 * Uses immutable pattern to build expired keys array.
	 * 
	 * @private
	 * @since 0.8.3-alpha
	 */
	cleanExpiredEntries() {
		const now = Date.now();
		
		// Build expiredKeys array immutably using filter and map
		const expiredKeys = Array.from(this.cache.entries())
			.filter(([key, entry]) => now - entry.timestamp > this.cacheExpirationMs)
			.map(([key]) => key);

		expiredKeys.forEach(key => this.cache.delete(key));

		if (expiredKeys.length > 0) {
			log(`(AddressCache) Cleaned ${expiredKeys.length} expired cache entries`);
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
	 * @since 0.8.4-alpha
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
	 * @example
	 * const cache = AddressCache.getInstance();
	 * cache.setLogradouroChangeCallback((changeDetails) => {
	 *   console.log('Street changed:', changeDetails);
	 * });
	 * 
	 * @since 0.8.3-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	setLogradouroChangeCallback(callback) {
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
	 *   console.log('Neighborhood changed:', changeDetails);
	 * });
	 * 
	 * @since 0.8.3-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	setBairroChangeCallback(callback) {
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
	 *   console.log('Municipality changed:', changeDetails);
	 * });
	 * 
	 * @since 0.8.3-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	setMunicipioChangeCallback(callback) {
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
	 * @since 0.8.3-alpha
	 */
	getLogradouroChangeCallback() {
		return this.logradouroChangeCallback;
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
	 * @since 0.8.3-alpha
	 */
	getBairroChangeCallback() {
		return this.bairroChangeCallback;
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
	 * @since 0.8.3-alpha
	 */
	getMunicipioChangeCallback() {
		return this.municipioChangeCallback;
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
	 * @returns {boolean} True if logradouro has changed and not yet notified
	 * @since 0.8.3-alpha
	 */
	hasLogradouroChanged() {
		if (!this.currentAddress || !this.previousAddress) {
			return false;
		}

		const hasChanged = this.currentAddress.logradouro !== this.previousAddress.logradouro;

		if (!hasChanged) {
			return false;
		}

		// Create a signature for this change to track if we've already notified
		const changeSignature = `${this.previousAddress.logradouro}=>${this.currentAddress.logradouro}`;

		// If we've already notified about this exact change, return false
		if (this.lastNotifiedChangeSignature === changeSignature) {
			return false;
		}

		// Mark this change as notified
		this.lastNotifiedChangeSignature = changeSignature;
		return true;
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
	 * @returns {boolean} True if bairro has changed and not yet notified
	 * @since 0.8.3-alpha
	 */
	hasBairroChanged() {
		if (!this.currentAddress || !this.previousAddress) {
			return false;
		}

		const hasChanged = this.currentAddress.bairro !== this.previousAddress.bairro;

		if (!hasChanged) {
			return false;
		}

		// Create a signature for this change to track if we've already notified
		const changeSignature = `${this.previousAddress.bairro}=>${this.currentAddress.bairro}`;

		// If we've already notified about this exact change, return false
		if (this.lastNotifiedBairroChangeSignature === changeSignature) {
			return false;
		}

		// Mark this change as notified
		this.lastNotifiedBairroChangeSignature = changeSignature;
		return true;
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
	 * @returns {boolean} True if municipio has changed and not yet notified
	 * @since 0.8.3-alpha
	 */
	hasMunicipioChanged() {
		if (!this.currentAddress || !this.previousAddress) {
			return false;
		}

		const hasChanged = this.currentAddress.municipio !== this.previousAddress.municipio;

		if (!hasChanged) {
			return false;
		}

		// Create a signature for this change to track if we've already notified
		const changeSignature = `${this.previousAddress.municipio}=>${this.currentAddress.municipio}`;

		// If we've already notified about this exact change, return false
		if (this.lastNotifiedMunicipioChangeSignature === changeSignature) {
			return false;
		}

		// Mark this change as notified
		this.lastNotifiedMunicipioChangeSignature = changeSignature;
		return true;
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
	 * @returns {Object} Change details with current and previous logradouro
	 * @since 0.8.3-alpha
	 */
	getLogradouroChangeDetails() {
		const currentLogradouro = this.currentAddress?.logradouro || null;
		const previousLogradouro = this.previousAddress?.logradouro || null;

		return {
			hasChanged: currentLogradouro !== previousLogradouro,
			current: {
				logradouro: currentLogradouro
			},
			previous: {
				logradouro: previousLogradouro
			},
			timestamp: Date.now()
		};
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
	 * @returns {Object} Change details with current and previous bairro
	 * @since 0.8.3-alpha
	 */
	getBairroChangeDetails() {
		const currentBairro = this.currentAddress?.bairro || null;
		const previousBairro = this.previousAddress?.bairro || null;

		// Compute bairroCompleto from raw data if available
		const currentBairroCompleto = this._computeBairroCompleto(this.currentRawData);
		const previousBairroCompleto = this._computeBairroCompleto(this.previousRawData);

		return {
			hasChanged: currentBairro !== previousBairro,
			current: {
				bairro: currentBairro,
				bairroCompleto: currentBairroCompleto
			},
			previous: {
				bairro: previousBairro,
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
	 * @since 0.8.4-alpha
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
	 * @returns {Object} Change details with current and previous municipio
	 * @since 0.8.3-alpha
	 */
	getMunicipioChangeDetails() {
		const currentMunicipio = this.currentAddress?.municipio ?? undefined;
		const previousMunicipio = this.previousAddress?.municipio ?? undefined;
		const currentUf = this.currentAddress?.uf ?? undefined;
		const previousUf = this.previousAddress?.uf ?? undefined;

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
	 * @since 0.8.3-alpha
	 */
	getBrazilianStandardAddress(data) {
		const cacheKey = this.generateCacheKey(data);

		if (cacheKey) {
			// Clean expired entries periodically
			this.cleanExpiredEntries();

			// Check if we have a valid cached entry
			const cacheEntry = this.cache.get(cacheKey);
			if (cacheEntry) {
				const now = Date.now();
				if (now - cacheEntry.timestamp <= this.cacheExpirationMs) {
					// Update access time for LRU behavior (history-like)
					cacheEntry.lastAccessed = now;
					// Re-insert to update position in Map (Map maintains insertion order)
					this.cache.delete(cacheKey);
					this.cache.set(cacheKey, cacheEntry);

					return cacheEntry.address;
				} else {
					// Remove expired entry
					this.cache.delete(cacheKey);
				}
			}
		}

		// Create new standardized address using AddressExtractor
		const extractor = new AddressExtractor(data);

		// Cache the result if we have a valid key
		if (cacheKey) {
			// Check if cache has reached maximum size, evict least recently used entries
			this.evictLeastRecentlyUsedIfNeeded();

			const now = Date.now();
			this.cache.set(cacheKey, {
				address: extractor.enderecoPadronizado,
				rawData: data, // Store raw data for detailed change information
				timestamp: now,
				lastAccessed: now,
			});

			// Update current and previous addresses for change detection
			this.previousAddress = this.currentAddress;
			this.previousRawData = this.currentRawData;
			this.currentAddress = extractor.enderecoPadronizado;
			this.currentRawData = data;

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
					console.error(
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
					console.error(
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
					console.error(
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
		return AddressCache.getInstance().maxCacheSize;
	}

	/**
	 * Static setter for maxCacheSize property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set maxCacheSize(value) {
		AddressCache.getInstance().maxCacheSize = value;
	}

	/**
	 * Static getter for cacheExpirationMs property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static get cacheExpirationMs() {
		return AddressCache.getInstance().cacheExpirationMs;
	}

	/**
	 * Static setter for cacheExpirationMs property - backward compatibility.
	 * @deprecated Access instance properties through getInstance()
	 * @static
	 */
	static set cacheExpirationMs(value) {
		AddressCache.getInstance().cacheExpirationMs = value;
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
}


// Set up periodic cleanup of expired cache entries
// Use a non-blocking interval to avoid preventing Node.js exit
AddressCache.cleanupInterval = setInterval(() => {
	AddressCache.cleanExpiredEntries();
}, 60000); // Clean expired entries every 60 seconds

// Ensure the interval is not blocking Node.js exit
if (typeof AddressCache.cleanupInterval.unref === 'function') {
	AddressCache.cleanupInterval.unref();
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
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
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

/* ============================
 * Camada de Serviço - Continuação
 * ============================
 */

class WebGeocodingManager {
	constructor(document, params) {
		this.document = document;
		this.locationResult = params.locationResult;
		this.enderecoPadronizadoDisplay = params.enderecoPadronizadoDisplay || null;
		this.referencePlaceDisplay = params.referencePlaceDisplay || null;
		this.observerSubject = new ObserverSubject();
		this.currentPosition = null;
		this.currentCoords = null;

		this.initElements();

		this.geolocationService = new GeolocationService(this.locationResult);
		this.reverseGeocoder = new ReverseGeocoder();

		this.positionDisplayer = new HTMLPositionDisplayer(this.locationResult);
		this.addressDisplayer = new HTMLAddressDisplayer(this.locationResult, this.enderecoPadronizadoDisplay);
		this.referencePlaceDisplayer = new HTMLReferencePlaceDisplayer(this.referencePlaceDisplay);
		PositionManager.getInstance().subscribe(this.positionDisplayer);
		PositionManager.getInstance().subscribe(this.reverseGeocoder);
		this.reverseGeocoder.subscribe(this.referencePlaceDisplayer);
		this.reverseGeocoder.subscribe(this.addressDisplayer);
	}

	initElements() {
		let chronometer = this.document.getElementById("chronometer");
		if (chronometer) {
			this.chronometer = new Chronometer(chronometer);
			PositionManager.getInstance().subscribe(this.chronometer);
		} else {
			console.warn("Chronometer element not found.");
		}

		this.findRestaurantsBtn = document.getElementById("find-restaurants-btn");
		if (this.findRestaurantsBtn) {
			this.findRestaurantsBtn.addEventListener("click", () => {
				if (this.currentCoords) {
					findNearbyRestaurants(
						this.currentCoords.latitude,
						this.currentCoords.longitude,
					);
				} else {
					alert("Current coordinates not available.");
				}
			});
		} else {
			console.warn("Find Restaurants button not found.");
		}

		this.cityStatsBtn = document.getElementById("city-stats-btn");
		if (this.cityStatsBtn) {
			this.cityStatsBtn.addEventListener("click", () => {
				if (this.currentCoords) {
					fetchCityStatistics(
						this.currentCoords.latitude,
						this.currentCoords.longitude,
					);
				} else {
					alert("Current coordinates not available.");
				}
			});
		} else {
			console.warn("City Stats button not found.");
		}

		this.tsPosCapture = this.document.getElementById("tsPosCapture");
		if (this.tsPosCapture) {
			this.tsPosCapture.textContent = new Date().toLocaleString();
			this.posCaptureHtmlText = new HtmlText(this.document, this.tsPosCapture);
			PositionManager.getInstance().subscribe(this.posCaptureHtmlText);
			Object.freeze(this.posCaptureHtmlText); // Prevent further modification
		} else {
			console.warn("tsPosCapture element not found.");
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
	 * Gets the function observers array for backward compatibility.
	 * @private
	 * @returns {Array} Array of subscribed function observers
	 */
	get functionObservers() {
		return this.observerSubject.functionObservers;
	}

	subscribe(observer) {
		if (observer == null) {
			console.warn(
				"(WebGeocodingManager) Attempted to subscribe a null observer.",
			);
			return;
		}
		this.observerSubject.subscribe(observer);
	}

	unsubscribe(observer) {
		this.observerSubject.unsubscribe(observer);
	}

	notifyObservers() {
		this.observerSubject.notifyObservers(this.currentPosition,this.reverseGeocoder.currentAddress,this.reverseGeocoder.enderecoPadronizado);
	}

	subscribeFunction(observerFunction) {
		if (observerFunction == null) {
			console.warn(
				"(WebGeocodingManager) Attempted to subscribe a null observer function.",
			);
			return;
		}
		console.log(
			`(WebGeocodingManager) observer function ${observerFunction} subscribing ${this}`,
		);
		this.observerSubject.subscribeFunction(observerFunction);
	}

	unsubscribeFunction(observerFunction) {
		this.observerSubject.unsubscribeFunction(observerFunction);
	}

	getBrazilianStandardAddress() {
		return this.reverseGeocoder.enderecoPadronizado;
	}

	initSpeechSynthesis() {
		this.htmlSpeechSynthesisDisplayer = new HtmlSpeechSynthesisDisplayer(
			this.document,
			{
				languageSelectId: "language",
				voiceSelectId: "voice-select",
				textInputId: "text-input",
				speakBtnId: "speak-btn",
				pauseBtnId: "pause-btn",
				resumeBtnId: "resume-btn",
				stopBtnId: "stop-btn",
				rateInputId: "rate",
				rateValueId: "rate-value",
				pitchInputId: "pitch",
				pitchValueId: "pitch-value",
			},
		);
		this.reverseGeocoder.subscribe(this.htmlSpeechSynthesisDisplayer);
		this.subscribe(this.htmlSpeechSynthesisDisplayer);
		Object.freeze(this.htmlSpeechSynthesisDisplayer); // Prevent further modification
	}

	notifyFunctionObservers() {
		for (const fn of this.functionObservers) {
			fn(
				this.currentPosition,
				this.reverseGeocoder.currentAddress,
				this.reverseGeocoder.enderecoPadronizado,
			);
		}
	}

	getSingleLocationUpdate() {
		this.geolocationService
			.getSingleLocationUpdate()
			.then((position) => {
				if (position && position.coords) {
					this.currentPosition = position;
					this.reverseGeocoder.latitude = position.coords.latitude;
					this.reverseGeocoder.longitude = position.coords.longitude;
					return this.reverseGeocoder.reverseGeocode();
				} else {
					return null;
				}
			})
			.then((addressData) => {
				this.reverseGeocoder.currentAddress = addressData;
				this.reverseGeocoder.enderecoPadronizado =
					AddressDataExtractor.getBrazilianStandardAddress(addressData);
				this.reverseGeocoder.notifyObservers();
				this.notifyFunctionObservers();
			})
			.catch((error) => {
				displayError(error);
			});
	}

	startTracking() {
		this.initSpeechSynthesis();

		/*
	Get current location. Do an initial check to see
	if the user has granted location permissions. Do an immediate
	update.
	*/
		//this.geolocationService.checkPermissions().then((value) => {
		this.getSingleLocationUpdate();
		//});

		setTimeout(() => {
			null;
		}, 20000);

		// Start watching position with high accuracy
		let watchId = this.geolocationService.watchCurrentLocation();

		// Register callback for logradouro change detection (replaces timer-based approach)
		this.setupLogradouroChangeDetection();

		// Register callback for bairro change detection (follows same pattern as logradouro)
		this.setupBairroChangeDetection();

		// Register callback for municipio change detection (follows same pattern as logradouro and bairro)
		this.setupMunicipioChangeDetection();
	}

	/**
	 * Sets up logradouro change detection using callback mechanism (replaces timer-based approach)
	 */
	setupLogradouroChangeDetection() {
		// Register this instance's callback with AddressDataExtractor
		AddressDataExtractor.setLogradouroChangeCallback((changeDetails) => {
			this.handleLogradouroChange(changeDetails);
		});
	}

	/**
	 * Removes the logradouro change detection callback
	 */
	removeLogradouroChangeDetection() {
		AddressDataExtractor.setLogradouroChangeCallback(null);
	}

	/**
	 * Sets up bairro change detection using callback mechanism (follows same pattern as logradouro)
	 */
	setupBairroChangeDetection() {
		// Register this instance's callback with AddressDataExtractor
		AddressDataExtractor.setBairroChangeCallback((changeDetails) => {
			this.handleBairroChange(changeDetails);
		});
	}

	/**
	 * Removes the bairro change detection callback
	 */
	removeBairroChangeDetection() {
		AddressDataExtractor.setBairroChangeCallback(null);
	}

	/**
	 * Sets up municipio change detection using callback mechanism (follows same pattern as logradouro and bairro)
	 */
	setupMunicipioChangeDetection() {
		// Register this instance's callback with AddressDataExtractor
		AddressDataExtractor.setMunicipioChangeCallback((changeDetails) => {
			this.handleMunicipioChange(changeDetails);
		});
	}

	/**
	 * Removes the municipio change detection callback
	 */
	removeMunicipioChangeDetection() {
		AddressDataExtractor.setMunicipioChangeCallback(null);
	}

	/**
	 * Handles logradouro change events and notifies observers
	 * @param {Object} changeDetails - Details about the logradouro change
	 */
	handleLogradouroChange(changeDetails) {
		try {
			// Notify observers about the logradouro change
			this.notifyLogradouroChangeObservers(changeDetails);
		} catch (error) {
			console.error(
				"(WebGeocodingManager) Error handling logradouro change:",
				error,
			);
		}
	}

	/**
	 * Handles bairro change events and notifies observers
	 * @param {Object} changeDetails - Details about the bairro change
	 */
	handleBairroChange(changeDetails) {
		try {
			// Notify observers about the bairro change
			this.notifyBairroChangeObservers(changeDetails);
		} catch (error) {
			console.error(
				"(WebGeocodingManager) Error handling bairro change:",
				error,
			);
		}
	}

	/**
	 * Handles municipio change events and notifies observers
	 * @param {Object} changeDetails - Details about the municipio change
	 */
	handleMunicipioChange(changeDetails) {
		try {
			// Notify observers about the municipio change
			this.notifyMunicipioChangeObservers(changeDetails);
		} catch (error) {
			console.error(
				"(WebGeocodingManager) Error handling municipio change:",
				error,
			);
		}
	}

	/**
	 * Notifies observers specifically about logradouro changes
	 * @param {Object} changeDetails - Details about the logradouro change
	 */
	notifyLogradouroChangeObservers(changeDetails) {
		// Notify regular observers
		this.observerSubject.notifyObservers(changeDetails.current.logradouro, "LogradouroChanged", null, null);
		this.observerSubject.notifyFunctionObservers(this.currentPosition, this.reverseGeocoder.currentAddress, this.reverseGeocoder.enderecoPadronizado, changeDetails);
	}

	/**
	 * Notifies observers specifically about bairro changes
	 * @param {Object} changeDetails - Details about the bairro change
	 */
	notifyBairroChangeObservers(changeDetails) {
		// Notify regular observers
		log('(WebGeocodingManager) Notificando os observadores da mudança de bairro.');
		for (const observer of this.observers) {
			if (typeof observer.update === "function") {
				observer.update(
					changeDetails.current.bairro,
					"BairroChanged",
					null,
					null,
				);
			}
		}

		// Notify function observers with change details
		for (const fn of this.functionObservers) {
			try {
				fn(
					this.currentPosition,
					this.reverseGeocoder.currentAddress,
					this.reverseGeocoder.enderecoPadronizado,
					changeDetails,
				);
			} catch (error) {
				console.error(
					"(WebGeocodingManager) Error notifying function observer about bairro change:",
					error,
				);
			}
		}
	}

	/**
	 * Notifies observers specifically about municipio changes
	 * @param {Object} changeDetails - Details about the municipio change
	 */
	notifyMunicipioChangeObservers(changeDetails) {
		// Notify regular observers
		log('(WebGeocodingManager) Notificando os observadores da mudança de município.');
		for (const observer of this.observers) {
			if (typeof observer.update === "function") {
				observer.update(
					this.reverseGeocoder.currentAddress,
					"MunicipioChanged",
					null,
					null,
				);
			}
		}

		// Notify function observers with change details
		for (const fn of this.functionObservers) {
			try {
				fn(
					this.currentPosition,
					this.reverseGeocoder.currentAddress,
					this.reverseGeocoder.enderecoPadronizado,
					changeDetails,
				);
			} catch (error) {
				console.error(
					"(WebGeocodingManager) Error notifying function observer about municipio change:",
					error,
				);
			}
		}
	}

	toString() {
		return `${this.constructor.name}: ${this.currentCoords ? this.currentCoords.latitude : "N/A"}, ${this.currentCoords ? this.currentCoords.longitude : "N/A"}`;
	}
}

/**
 * Speech synthesis queue item for managing text-to-speech requests with priority support.
 * 
 * This class represents individual items in the speech synthesis queue, providing
 * priority-based ordering and automatic expiration to prevent stale speech requests
 * from being processed. Each item contains text content, priority level, and timestamp.
 * 
 * @class SpeechItem
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class SpeechItem {
	/**
	 * Creates a new speech queue item.
	 * 
	 * @param {string} text - Text content to be spoken
	 * @param {number} [priority=0] - Priority level (higher values = higher priority)
	 * @param {number} [timestamp=Date.now()] - Creation timestamp for expiration tracking
	 */
	constructor(text, priority = 0, timestamp = Date.now()) {
		this.text = text;
		this.priority = priority;
		this.timestamp = timestamp;
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	/**
	 * Checks if this speech item has expired based on the configured expiration time.
	 * 
	 * @param {number} expirationMs - Expiration time in milliseconds
	 * @returns {boolean} True if the item has expired
	 */
	isExpired(expirationMs = 30000) { // 30 seconds default
		return Date.now() - this.timestamp > expirationMs;
	}

	toString() {
		return `${this.constructor.name}: "${this.text}" (priority: ${this.priority})`;
	}
}

/**
 * Priority-based speech synthesis queue with automatic cleanup of expired items.
 * 
 * This class manages a queue of speech requests with priority ordering and automatic
 * expiration of old items to prevent memory leaks and ensure fresh speech content.
 * Higher priority items are processed first, and items are automatically removed
 * if they exceed the configured expiration time.
 * 
 * @class SpeechQueue
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class SpeechQueue {
	/**
	 * Creates a new speech queue.
	 * 
	 * @param {number} [maxSize=100] - Maximum number of items in queue
	 * @param {number} [expirationMs=30000] - Item expiration time in milliseconds
	 */
	constructor(maxSize = 100, expirationMs = 30000) {
		this.items = [];
		this.maxSize = maxSize;
		this.expirationMs = expirationMs;
		this.observerSubject = new ObserverSubject();
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
	 * Gets the function observers array for backward compatibility.
	 * @private
	 * @returns {Array} Array of subscribed function observers
	 */
	get functionObservers() {
		return this.observerSubject.functionObservers;
	}

	subscribe(observer) {
		if (observer == null) {
			console.warn("(SpeechQueue) Attempted to subscribe a null observer.");
			return;
		}
		this.observerSubject.subscribe(observer);
	}

	unsubscribe(observer) {
		this.observerSubject.unsubscribe(observer);
	}

	notifyObservers() {
		this.observerSubject.notifyObservers(this);
	}

	subscribeFunction(observerFunction) {
		if (observerFunction == null) {
			console.warn("(SpeechQueue) Attempted to subscribe a null observer function.");
			return;
		}
		this.observerSubject.subscribeFunction(observerFunction);
	}

	unsubscribeFunction(observerFunction) {
		if (observerFunction == null) {
			console.warn("(SpeechQueue) Attempted to unsubscribe a null observer function.");
			return;
		}
		this.observerSubject.unsubscribeFunction(observerFunction);
	}

	notifyFunctionObservers() {
		this.observerSubject.functionObservers.forEach((fn) => {
			fn(this);
		});
	}

	/**
	 * Adds a new speech item to the queue with priority ordering.
	 * 
	 * @param {string} text - Text to be spoken
	 * @param {number} [priority=0] - Priority level
	 */
	enqueue(text, priority = 0) {
		// Clean expired items first
		this.cleanExpired();

		// Create new item
		const item = new SpeechItem(text, priority);

		// Find insertion point to maintain priority order (higher priority first)
		let insertIndex = 0;
		for (let i = 0; i < this.items.length; i++) {
			if (this.items[i].priority < priority) {
				insertIndex = i;
				break;
			}
			insertIndex = i + 1;
		}

		// Insert item at correct position
		this.items.splice(insertIndex, 0, item);

		// Enforce size limit
		if (this.items.length > this.maxSize) {
			this.items = this.items.slice(0, this.maxSize);
		}

		this.notifyObservers();
		this.notifyFunctionObservers();

	}

	/**
	 * Removes and returns the highest priority item from the queue.
	 * 
	 * @returns {SpeechItem|null} Next speech item or null if queue is empty
	 */
	dequeue() {
		// Clean expired items first
		this.cleanExpired();

		// Return first item (highest priority due to ordering in enqueue)
		const item = this.items.shift();

		this.notifyObservers();
		this.notifyFunctionObservers();
		
		return item || null;
	}

	/**
	 * Checks if the queue is empty after cleaning expired items.
	 * 
	 * @returns {boolean} True if queue has no valid items
	 */
	isEmpty() {
		this.cleanExpired();
		return this.items.length === 0;
	}

	/**
	 * Gets the current size of the queue after cleaning expired items.
	 * 
	 * @returns {number} Number of valid items in queue
	 */
	size() {
		this.cleanExpired();
		return this.items.length;
	}

	/**
	 * Removes expired items from the queue.
	 * 
	 * @private
	 */
	cleanExpired() {
		const originalSize = this.items.length;
		this.items = this.items.filter(item => !item.isExpired(this.expirationMs));

		const removedCount = originalSize - this.items.length;
		if (removedCount > 0) {
			log(`(SpeechQueue) Removed ${removedCount} expired items`);
		}
	}

	/**
	 * Clears all items from the queue.
	 */
	clear() {
		this.items = [];
	}
}

/**
 * Manages Web Speech API synthesis with queue-based processing and voice configuration.
 * 
 * This class provides a comprehensive speech synthesis system with priority-based queuing,
 * voice selection, rate and pitch control, and robust error handling. It implements both
 * immediate speech and queued processing for managing multiple speech requests efficiently.
 * 
 * @class SpeechSynthesisManager
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class SpeechSynthesisManager {
	constructor() {
		this.synth = window.speechSynthesis;
		this.voices = [];
		this.voice = null;
		this.rate = 1.0;
		this.pitch = 1.0;
		this.isCurrentlySpeaking = false;
		this.speechQueue = new SpeechQueue();
		this.queueTimer = null;
		this.independentQueueTimerInterval = setupParams.independentQueueTimerInterval;
		this.voiceRetryTimer = null;
		this.voiceRetryAttempts = 0;
		this.maxVoiceRetryAttempts = 10;
		this.voiceRetryInterval = 1000; // 1 second
		this.loadVoices();
	}

	/**
	 * Loads available voices and selects default Portuguese voice.
	 * Prioritizes Brazilian Portuguese (pt-BR) voices for target users.
	 * Includes retry mechanism to keep trying if Brazilian Portuguese voice is not immediately available.
	 */
	loadVoices() {
		const updateVoices = () => {
			this.voices = this.synth.getVoices();

			// PRIORITY 1: Try to find Brazilian Portuguese voice (pt-BR)
			let portugueseVoice = this.voices.find(voice =>
				voice.lang && voice.lang.toLowerCase() === 'pt-br'
			);

			// PRIORITY 2: If pt-BR not found, try any other Portuguese voice (pt, pt-PT, etc.)
			if (!portugueseVoice) {
				portugueseVoice = this.voices.find(voice =>
					voice.lang && voice.lang.toLowerCase().startsWith('pt')
				);
			}

			this.voice = portugueseVoice || this.voices[0] || null;

			// If Brazilian Portuguese voice was found, stop retry timer
			if (portugueseVoice && portugueseVoice.lang.toLowerCase() === 'pt-br') {
				this.stopVoiceRetryTimer();
			}
			// If no Brazilian Portuguese voice found and voices are available, start retry mechanism
			else if (this.voices.length > 0 && !this.voiceRetryTimer && this.voiceRetryAttempts < this.maxVoiceRetryAttempts) {
				this.startVoiceRetryTimer();
			}
		};
		// Always update voices immediately in case they're already loaded
		updateVoices();
		// Listen for voiceschanged event to update when voices are loaded asynchronously
		if (typeof window !== "undefined" && window.speechSynthesis) {
			window.speechSynthesis.onvoiceschanged = updateVoices;
		}
	}

	/**
	 * Starts the retry timer to periodically check for Brazilian Portuguese voice.
	 */
	startVoiceRetryTimer() {
		if (this.voiceRetryTimer) return;

		this.voiceRetryTimer = setInterval(() => {
			this.voiceRetryAttempts++;

			// Check for Brazilian Portuguese voice
			const voices = this.synth.getVoices();
			const brazilianVoice = voices.find(voice =>
				voice.lang && voice.lang.toLowerCase() === 'pt-br'
			);

			if (brazilianVoice) {
				this.voice = brazilianVoice;
				this.stopVoiceRetryTimer();
			} else if (this.voiceRetryAttempts >= this.maxVoiceRetryAttempts) {
				this.stopVoiceRetryTimer();
			}
		}, this.voiceRetryInterval);
	}

	/**
	 * Stops the voice retry timer.
	 */
	stopVoiceRetryTimer() {
		if (this.voiceRetryTimer) {
			clearInterval(this.voiceRetryTimer);
			this.voiceRetryTimer = null;
		}
	}

	/**
	 * Sets the speech synthesis voice.
	 * 
	 * @param {SpeechSynthesisVoice} voice - Voice to use for synthesis
	 */
	setVoice(voice) {
		this.voice = voice;
	}

	/**
	 * Sets the speech rate (speed).
	 * 
	 * @param {number} rate - Speech rate (0.1 to 10, default 1.0)
	 */
	setRate(rate) {
		this.rate = Math.max(0.1, Math.min(10, rate));
	}

	/**
	 * Sets the speech pitch.
	 * 
	 * @param {number} pitch - Speech pitch (0 to 2, default 1.0)
	 */
	setPitch(pitch) {
		this.pitch = Math.max(0, Math.min(2, pitch));
	}

	/**
	 * Primary entry point for adding text-to-speech requests to the speech synthesis system.
	 * 
	 * Implements a clean three-step process: input validation, queue management, and conditional 
	 * processing initiation. This method serves as the public interface for all speech requests,
	 * handling both immediate processing and queued batch processing scenarios through intelligent
	 * state management and priority-based queue operations.
	 * 
	 * @param {string} text - Text content to be spoken by the speech synthesis system
	 * @param {number} [priority=0] - Priority level for queue positioning (higher values = higher priority)
	 * @returns {void}
	 * 
	 * @example
	 * // Basic speech request with default priority
	 * speechManager.speak("Welcome to the application", 0);
	 * 
	 * @example  
	 * // High priority urgent message (jumps ahead in queue)
	 * speechManager.speak("Emergency alert", 2);
	 * 
	 * @since 0.8.3-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	speak(text, priority = 0) {
		log("+++ (600) (SpeechSynthesisManager) Speak: ", text);
		// STEP 1: Input Validation - Robust validation prevents empty/whitespace content
		if (!text || text.trim() === "") {
			warn("(SpeechSynthesisManager) No text provided to speak.");
			return;
		}

		// STEP 2: Queue Management - Add text to priority-based speech queue
		this.speechQueue.enqueue(text, priority);

		// STEP 3: Conditional Processing Initiation - Intelligent queue processing
		if (!this.isCurrentlySpeaking) {
			this.processQueue();
		}
	}

	/**
	 * Processes the speech synthesis queue in a state-managed, sequential manner.
	 * 
	 * This method is the core orchestrator for the speech synthesis queue system, managing 
	 * the sequential processing of text-to-speech requests while ensuring only one speech 
	 * utterance plays at a time and maintaining a queue of pending items.
	 * 
	 * @returns {void}
	 * @since 0.8.3-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	processQueue() {
		// Pure helper function that encapsulates queue retrieval logic with guard clauses
		const getNextSpeechItem = () =>
			!this.isCurrentlySpeaking && !this.speechQueue.isEmpty()
				? this.speechQueue.dequeue()
				: null;

		// Attempt to get next valid item from queue
		const item = getNextSpeechItem();

		// Early return if no item available
		if (!item) return;

		// Set concurrency control flag to prevent overlapping speech processing
		this.isCurrentlySpeaking = true;

		// Create new speech utterance with retrieved text content
		const utterance = new SpeechSynthesisUtterance(item.text);

		// Configure utterance with instance voice settings
		utterance.voice = this.voice;
		utterance.rate = this.rate;
		utterance.pitch = this.pitch;

		// Event handler for successful speech completion
		utterance.onend = () => {
			this.isCurrentlySpeaking = false;
		};

		// Event handler for speech errors
		utterance.onerror = (event) => {
			this.isCurrentlySpeaking = false;
		};

		// Execute the speech utterance using Web Speech API
		this.synth.speak(utterance);
	}

	/**
	 * Starts the independent queue processing timer.
	 */
	startQueueTimer() {
		this.stopQueueTimer();

		this.queueTimer = setInterval(() => {
			this.processQueue();
		}, this.independentQueueTimerInterval);
	}

	/**
	 * Stops the queue processing timer.
	 */
	stopQueueTimer() {
		if (this.queueTimer) {
			clearInterval(this.queueTimer);
			this.queueTimer = null;
		}
	}

	/**
	 * Pauses current speech synthesis.
	 */
	pause() {
		if (this.synth.speaking) {
			this.synth.pause();
		}
	}

	/**
	 * Resumes paused speech synthesis.
	 */
	resume() {
		if (this.synth.paused) {
			this.synth.resume();
		}
	}

	/**
	 * Stops current speech and clears the queue.
	 */
	stop() {
		this.synth.cancel();
		this.speechQueue.clear();
		this.isCurrentlySpeaking = false;
		this.stopQueueTimer();
	}

	toString() {
		return `${this.constructor.name}: voice=${this.voice?.name || 'none'}, rate=${this.rate}, pitch=${this.pitch}, isSpeaking=${this.isCurrentlySpeaking}, queueSize=${this.speechQueue.size()}`;
	}
}

/**
 * HTML-based speech synthesis controller with UI integration and address change notifications.
 * 
 * This class provides a complete speech synthesis interface integrated with HTML controls,
 * supporting voice selection, rate/pitch adjustment, and automatic speech notifications
 * for address changes. It implements priority-based speech with higher priority for
 * neighborhood (bairro) changes over street (logradouro) changes.
 * 
 * @class HtmlSpeechSynthesisDisplayer
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class HtmlSpeechSynthesisDisplayer {
	/**
	 * Creates a new HtmlSpeechSynthesisDisplayer instance.
	 * 
	 * @param {Document} document - Document object for DOM operations
	 * @param {Object} elementIds - Object containing HTML element IDs for controls
	 * @param {string} elementIds.languageSelectId - Language selection dropdown ID
	 * @param {string} elementIds.voiceSelectId - Voice selection dropdown ID
	 * @param {string} elementIds.textInputId - Text input field ID
	 * @param {string} elementIds.speakBtnId - Speak button ID
	 * @param {string} elementIds.pauseBtnId - Pause button ID
	 * @param {string} elementIds.resumeBtnId - Resume button ID
	 * @param {string} elementIds.stopBtnId - Stop button ID
	 * @param {string} elementIds.rateInputId - Rate slider ID
	 * @param {string} elementIds.rateValueId - Rate value display ID
	 * @param {string} elementIds.pitchInputId - Pitch slider ID
	 * @param {string} elementIds.pitchValueId - Pitch value display ID
	 */
	constructor(document, elementIds) {
		this.document = document;
		this.elementIds = elementIds;
		this.speechManager = new SpeechSynthesisManager();

		// Get DOM elements
		this.languageSelect = this.document.getElementById(elementIds.languageSelectId);
		this.voiceSelect = this.document.getElementById(elementIds.voiceSelectId);
		this.textInput = this.document.getElementById(elementIds.textInputId);
		this.speakBtn = this.document.getElementById(elementIds.speakBtnId);
		this.pauseBtn = this.document.getElementById(elementIds.pauseBtnId);
		this.resumeBtn = this.document.getElementById(elementIds.resumeBtnId);
		this.stopBtn = this.document.getElementById(elementIds.stopBtnId);
		this.rateInput = this.document.getElementById(elementIds.rateInputId);
		this.rateValue = this.document.getElementById(elementIds.rateValueId);
		this.pitchInput = this.document.getElementById(elementIds.pitchInputId);
		this.pitchValue = this.document.getElementById(elementIds.pitchValueId);

		this.init();
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	/**
	 * Initializes the speech synthesis interface and event handlers.
	 */
	init() {
		this.updateVoices();
		this.setupEventHandlers();
		this.speechManager.startQueueTimer();
	}

	/**
	 * Updates the voice selection dropdown with available voices.
	 * Prioritizes Brazilian Portuguese (pt-BR) voices for target users.
	 */
	updateVoices() {
		if (!this.voiceSelect) return;

		// Clear existing options
		this.voiceSelect.innerHTML = '';

		// Get available voices
		const voices = this.speechManager.synth.getVoices();

		// Track if we found a Brazilian Portuguese voice
		let brazilianVoiceFound = false;

		// Add voices to dropdown
		voices.forEach((voice, index) => {
			const option = this.document.createElement('option');
			option.value = index;
			option.textContent = `${voice.name} (${voice.lang})`;

			// PRIORITY 1: Select Brazilian Portuguese voice (pt-BR) by default
			if (voice.lang.toLowerCase() === 'pt-br') {
				option.selected = true;
				this.speechManager.setVoice(voice);
				brazilianVoiceFound = true;
			}
			// PRIORITY 2: Select any Portuguese voice if pt-BR not found
			else if (!brazilianVoiceFound && voice.lang.toLowerCase().startsWith('pt')) {
				option.selected = true;
				this.speechManager.setVoice(voice);
			}

			this.voiceSelect.appendChild(option);
		});
	}

	/**
	 * Sets up event handlers for all speech synthesis controls.
	 */
	setupEventHandlers() {
		// Voice selection change
		if (this.voiceSelect) {
			this.voiceSelect.addEventListener('change', (e) => {
				const voices = this.speechManager.synth.getVoices();
				const selectedVoice = voices[e.target.value];
				this.speechManager.setVoice(selectedVoice);
			});
		}

		// Speak button
		if (this.speakBtn && this.textInput) {
			this.speakBtn.addEventListener('click', () => {
				const text = this.textInput.value.trim();
				if (text) {
					this.speechManager.speak(text, 0); // Default priority
				}
			});
		}

		// Control buttons
		if (this.pauseBtn) {
			this.pauseBtn.addEventListener('click', () => {
				this.speechManager.pause();
			});
		}

		if (this.resumeBtn) {
			this.resumeBtn.addEventListener('click', () => {
				this.speechManager.resume();
			});
		}

		if (this.stopBtn) {
			this.stopBtn.addEventListener('click', () => {
				this.speechManager.stop();
			});
		}

		// Rate control
		if (this.rateInput && this.rateValue) {
			this.rateInput.addEventListener('input', (e) => {
				const rate = parseFloat(e.target.value);
				this.speechManager.setRate(rate);
				this.rateValue.textContent = rate.toFixed(1);
			});
		}

		// Pitch control
		if (this.pitchInput && this.pitchValue) {
			this.pitchInput.addEventListener('input', (e) => {
				const pitch = parseFloat(e.target.value);
				this.speechManager.setPitch(pitch);
				this.pitchValue.textContent = pitch.toFixed(1);
			});
		}

		// Handle voice loading events
		if (window.speechSynthesis.onvoiceschanged !== undefined) {
			window.speechSynthesis.onvoiceschanged = () => {
				this.updateVoices();
			};
		}
	}

	/**
	 * Builds text for logradouro (street) change announcements.
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current standardized address
	 * @returns {string} Formatted speech text for logradouro
	 */
	buildTextToSpeechLogradouro(currentAddress) {
		if (!currentAddress || !currentAddress.logradouro) {
			return "Nova localização detectada";
		}
		return `Você está agora em ${currentAddress.logradouroCompleto()}`;
	}

	/**
	 * Builds text for bairro (neighborhood) change announcements.
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current standardized address
	 * @returns {string} Formatted speech text for bairro
	 */
	buildTextToSpeechBairro(currentAddress) {
		if (!currentAddress || !currentAddress.bairro) {
			return "Novo bairro detectado";
		}
		return `Você entrou no bairro ${currentAddress.bairroCompleto()}`;
	}

	/**
	 * Builds text for municipio (municipality) change announcements.
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current standardized address
	 * @returns {string} Formatted speech text for municipio
	 */
	buildTextToSpeechMunicipio(currentAddress) {
		if (!currentAddress || !currentAddress.municipio) {
			return "Novo município detectado";
		}
		return `Você entrou no município de ${currentAddress.municipio}`;
	}

	/**
	 * Builds text for full address announcements.
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current standardized address
	 * @returns {string} Formatted speech text for full address
	 */
	buildTextToSpeech(currentAddress) {
		if (!currentAddress) {
			return "Localização não disponível";
		}
		let speechText = "Você está em ";

		if (currentAddress.logradouro) {
			speechText += currentAddress.logradouroCompleto();
			if (currentAddress.bairro) {
				speechText += `, ${currentAddress.bairroCompleto()}`;
			}
			if (currentAddress.municipio) {
				speechText += `, ${currentAddress.municipio}`;
			}
		} else if (currentAddress.bairro) {
			speechText += `bairro ${currentAddress.bairroCompleto()}`;
			if (currentAddress.municipio) {
				speechText += `, ${currentAddress.municipio}`;
			}
		} else if (currentAddress.municipio) {
			speechText += currentAddress.municipio;
		} else {
			speechText = "Localização detectada, mas endereço não disponível";
		}

		return speechText;
	}

	/**
	 * Updates the HTML display with new address information and handles speech synthesis.
	 * 
	 * Observer pattern update method that gets called when address changes occur.
	 * Implements priority-based speech notifications and periodic full address announcements:
	 * - Municipality changes (priority 3): Highest priority for city changes
	 * - Neighborhood/Bairro changes (priority 2): Medium priority for neighborhood changes
	 * - Street/Logradouro changes (priority 1): Low priority for street changes
	 * - Full address every 50 seconds (priority 0): Periodic announcements at trackingInterval
	 * 
	 * The 50-second interval feature ensures users receive regular location updates while
	 * driving, providing a better user experience than more frequent announcements.
	 * 
	 * @param {Object} currentAddress - Current address data
	 * @param {string|BrazilianStandardAddress} enderecoPadronizadoOrEvent - Standardized address or event type
	 * @param {string} posEvent - Position event type (strCurrPosUpdate, strImmediateAddressUpdate, etc.)
	 * @param {Object} loading - Loading state information
	 * @param {Object} error - Error information if any
	 * @returns {void}
	 * 
	 * @since 0.8.3-alpha
	 * @author Marcelo Pereira Barbosa
	 */
	update(currentAddress, enderecoPadronizadoOrEvent, posEvent, loading, error) {
		log("+++ (301) HtmlSpeechSynthesisDisplayer.update called +++");
		log("+++ (302) currentAddress: ", currentAddress);
		log("+++ (303) enderecoPadronizadoOrEvent: " , enderecoPadronizadoOrEvent);
		log("+++ (304) posEvent: ", posEvent);
		// Early return if no current address
		if (!currentAddress) {
			return;
		}

		let textToBeSpoken = "";
		let priority = 0;

		// Determine speech content and priority based on event type
		// Priority order: Municipality (3) > Bairro (2) > Logradouro (1) > Full address every 50s (0)
		if (["MunicipioChanged","BairroChanged","LogradouroChanged"].includes(enderecoPadronizadoOrEvent)) {
			log("+++ (310) (HtmlSpeechSyntesisDisplayer) Changed")
			textToBeSpoken = currentAddress;
			const priorities = {"MunicipioChanged": 3, "BairroChanged": 2, "LogradouroChanged": 1};
			priority = priorities[enderecoPadronizadoOrEvent]; // Set priority based on event
		} else if (posEvent === PositionManager.strCurrPosUpdate) {
			// Full address update every 50 seconds (trackingInterval)
			// This is the main feature: speak full address at regular 50-second intervals
			textToBeSpoken = this.buildTextToSpeech(enderecoPadronizadoOrEvent);
			priority = 0; // Lowest priority for periodic full address updates
		}
		// Note: For immediate updates (strImmediateAddressUpdate), we don't speak
		// unless there's a specific change event (handled by the conditions above)

		// Common operations for all cases
		if (textToBeSpoken && this.textInput) {
			this.textInput.value = textToBeSpoken;
			this.speechManager.speak(textToBeSpoken, priority);
		}
	}

	/**
	 * Returns a string representation of this displayer.
	 * 
	 * @returns {string} String representation including class name and current voice
	 * @since 0.8.3-alpha
	 */
	toString() {
		const voiceName = this.speechManager.voice?.name || 'no voice';
		return `${this.constructor.name}: ${voiceName}`;
	}
}

/**
 * Provides geolocation services using the HTML5 Geolocation API with enhanced error handling.
 * 
 * This class encapsulates geolocation functionality with comprehensive error handling,
 * permission management, and position tracking capabilities. It integrates with the
 * PositionManager singleton to provide centralized position management and implements
 * the observer pattern for position change notifications.
 * 
 * @class GeolocationService
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * const service = new GeolocationService(document.getElementById('result'));
 * service.getSingleLocationUpdate()
 *   .then(position => console.log('Location:', position))
 *   .catch(error => console.error('Error:', error));
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API} Geolocation API
 * @see {@link https://www.w3.org/TR/geolocation-API/} W3C Geolocation API Specification
 */
class GeolocationService {
	/**
	 * Creates a new GeolocationService instance.
	 * 
	 * Initializes the geolocation service with a target DOM element for status display
	 * and sets up the connection with the PositionManager singleton for centralized
	 * position management.
	 * 
	 * @param {HTMLElement} [locationResult] - DOM element for displaying location results
	 * 
	 * @example
	 * const resultDiv = document.getElementById('location-display');
	 * const service = new GeolocationService(resultDiv);
	 * 
	 * @since 0.8.3-alpha
	 */
	constructor(locationResult) {
		this.locationResult = locationResult;
		this.watchId = null;
		this.isWatching = false;
		this.lastKnownPosition = null;
		this.permissionStatus = null;

		// Get reference to PositionManager singleton
		this.positionManager = PositionManager.getInstance();
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
			if ('permissions' in navigator) {
				const permission = await navigator.permissions.query({ name: 'geolocation' });
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
	 * @async
	 * @returns {Promise<GeolocationPosition>} Promise that resolves to the current position
	 * @throws {GeolocationPositionError} Geolocation API errors (permission denied, unavailable, timeout)
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
	 * @since 0.8.3-alpha
	 */
	async getSingleLocationUpdate() {
		return new Promise((resolve, reject) => {
			if (!navigator.geolocation) {
				const error = new Error("Geolocation is not supported by this browser");
				error.name = "NotSupportedError";
				reject(error);
				return;
			}

			navigator.geolocation.getCurrentPosition(
				(position) => {
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
					console.error("(GeolocationService) Single location update failed:", error);

					// Update display with error if element is available
					if (this.locationResult) {
						this.updateErrorDisplay(error);
					}

					reject(this.formatGeolocationError(error));
				},
				setupParams.geolocationOptions
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
		if (!navigator.geolocation) {
			console.error("(GeolocationService) Geolocation is not supported by this browser");
			return null;
		}

		if (this.isWatching) {
			return this.watchId;
		}

		this.watchId = navigator.geolocation.watchPosition(
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
				console.error("(GeolocationService) Position watch error:", error);

				// Update display with error if element is available
				if (this.locationResult) {
					this.updateErrorDisplay(error);
				}
			},
			setupParams.geolocationOptions
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
			navigator.geolocation.clearWatch(this.watchId);
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

		const errorMessages = {
			1: "Permissão negada pelo usuário",
			2: "Posição indisponível",
			3: "Timeout na obtenção da posição"
		};

		const errorMessage = errorMessages[error.code] || "Erro desconhecido";

		this.locationResult.innerHTML = `
            <div class="location-error">
                <h4>Erro na Obtenção da Localização</h4>
                <p><strong>Código:</strong> ${error.code}</p>
                <p><strong>Mensagem:</strong> ${errorMessage}</p>
                <p><strong>Detalhes:</strong> ${error.message}</p>
            </div>
        `;
	}

	/**
	 * Formats geolocation errors into a consistent error object.
	 * 
	 * @private
	 * @param {GeolocationPositionError} error - Raw geolocation error
	 * @returns {Error} Formatted error object with descriptive message
	 * @since 0.8.3-alpha
	 */
	formatGeolocationError(error) {
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

		const errorInfo = errorMap[error.code] || {
			name: "UnknownGeolocationError",
			message: "Unknown geolocation error occurred"
		};

		const formattedError = new Error(errorInfo.message);
		formattedError.name = errorInfo.name;
		formattedError.code = error.code;
		formattedError.originalError = error;

		return formattedError;
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
	 * Returns a string representation of this service.
	 * 
	 * @returns {string} String representation with service status
	 * @since 0.8.3-alpha
	 */
	toString() {
		const status = this.isWatching ? 'watching' : 'idle';
		const hasPosition = this.lastKnownPosition ? 'has position' : 'no position';
		return `${this.constructor.name}: ${status}, ${hasPosition}`;
	}
}

// Additional utility functions for geolocation support

/**
 * Displays error messages to the user in a formatted way.
 * 
 * @param {Error} error - Error object to display
 * @returns {void}
 * 
 * @example
 * displayError(new Error('Location not available'));
 * 
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
function displayError(error) {
	console.error("Display Error:", error);

	// Try to find a suitable element to display the error
	const errorElements = [
		document.getElementById('error-display'),
		document.getElementById('location-result'),
		document.getElementById('result')
	].filter(element => element !== null);

	if (errorElements.length > 0) {
		const element = errorElements[0];
		element.innerHTML = `
            <div class="error-message" style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px; margin: 10px 0;">
                <h4>Erro</h4>
                <p><strong>Tipo:</strong> ${error.name || 'Error'}</p>
                <p><strong>Mensagem:</strong> ${error.message}</p>
                ${error.code ? `<p><strong>Código:</strong> ${error.code}</p>` : ''}
            </div>
        `;
	} else {
		// Fallback to alert if no suitable element found
		alert(`Erro: ${error.message}`);
	}
}

/**
 * Gets the type of address location from geocoding data.
 * 
 * @param {Object} addressData - Address data from geocoding API
 * @returns {string} Formatted address type description
 * 
 * @example
 * const type = getAddressType(geocodingData);
 * console.log('Location type:', type);
 * 
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
function getAddressType(addressData) {
	if (!addressData || !addressData.class || !addressData.type) {
		return setupParams.noReferencePlace;
	}

	const className = addressData.class;
	const typeName = addressData.type;

	// Check if this is a valid reference place class
	if (!setupParams.validRefPlaceClasses.includes(className)) {
		return setupParams.noReferencePlace;
	}

	// Look up in the reference place map
	if (setupParams.referencePlaceMap[className] &&
		setupParams.referencePlaceMap[className][typeName]) {
		return setupParams.referencePlaceMap[className][typeName];
	}

	// Fallback to class/type combination
	return `${className}: ${typeName}`;
}

/**
 * Placeholder function for finding nearby restaurants.
 * 
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {void}
 * 
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
function findNearbyRestaurants(latitude, longitude) {
	// Implementation would go here for restaurant search
	alert(`Procurando restaurantes próximos a ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
}

/**
 * Placeholder function for fetching city statistics.
 * 
 * @param {number} latitude - Latitude coordinate  
 * @param {number} longitude - Longitude coordinate
 * @returns {void}
 * 
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
function fetchCityStatistics(latitude, longitude) {
	// Implementation would go here for city statistics
	alert(`Obtendo estatísticas da cidade para ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
}

// Export for testing and module usage
if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		guiaVersion,
		calculateDistance,
		delay,
		getAddressType,
		isMobileDevice,
		setupParams,
		ObserverSubject,
		GeoPosition,
		PositionManager,
		SingletonStatusManager,
		APIFetcher,
		ReverseGeocoder,
		GeolocationService,
		WebGeocodingManager,
		BrazilianStandardAddress,
		ReferencePlace,
		AddressExtractor,
		AddressCache,
		AddressDataExtractor,
		HTMLAddressDisplayer,
		HTMLPositionDisplayer,
		SpeechSynthesisManager,
		SpeechQueue,
		findNearbyRestaurants,
		fetchCityStatistics
	};
}

