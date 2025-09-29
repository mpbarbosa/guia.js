// Semantic Versioning 2.0.0 - see https://semver.org/
// Version object for unstable development status
const guiaVersion = {
	major: 0,
	minor: 8,
	patch: 0,
	prerelease: "alpha", // Indicates unstable development
	toString: function () {
		return `${this.major}.${this.minor}.${this.patch}-${this.prerelease}`;
	},
};

const guiaName = "Guia Turístico em Movimento";
const guiaAuthor = "Marcelo Pereira Barbosa";
const setupParams = {
	trackingInterval: 60000, // milliseconds
	minimumDistanceChange: 20, // meters
	independentQueueTimerInterval: 5000, // milliseconds
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

// Example usage:
log("Guia.js version:", guiaVersion.toString());

/* ============================
 * Camada de Modelo
 * ============================
 */

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
		this.observers = [];
		this.accuracyQuality = null;
		this.tsPosicaoAtual = null;
		this.lastModified = null;
		if (position) {
			this.update(position);
		}
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
		if (observer) {
			this.observers.push(observer);
		}
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
	 * // Later...
	 * manager.unsubscribe(myObserver);
	 * 
	 * @since 0.5.0-alpha
	 */
	unsubscribe(observer) {
		this.observers = this.observers.filter((o) => o !== observer);
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
		this.observers.forEach((observer) => {
			observer.update(this, posEvent);
		});
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
	 * console.log(PositionManager.getAccuracyQuality(5));   // 'excellent'
	 * console.log(PositionManager.getAccuracyQuality(25));  // 'good'
	 * console.log(PositionManager.getAccuracyQuality(75));  // 'medium'
	 * console.log(PositionManager.getAccuracyQuality(150)); // 'bad'
	 * console.log(PositionManager.getAccuracyQuality(500)); // 'very bad'
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
		this.accuracyQuality = PositionManager.getAccuracyQuality(value);
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
		if (position.timestamp - (this.lastModified || 0) < setupParams.trackingInterval) {
			bUpdateCurrPos = false;
			let errorMessage = `Less than ${setupParams.trackingInterval / 1000} seconds since last update: ${(position.timestamp - (this.lastModified || 0)) / 1000} seconds`;
			error = {
				name: "ElapseTimeError",
				message: errorMessage,
			};
			warn("(PositionManager) " + errorMessage);
		}

		// Verifica se a precisão é boa o suficiente
		if (
			PositionManager.getAccuracyQuality(position.coords.accuracy) in
			["medium", "bad", "very bad"]
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
			this.latitude &&
			this.longitude &&
			position.coords
		) {
			const distance = calculateDistance(
				this.latitude,
				this.longitude,
				position.coords.latitude,
				position.coords.longitude,
			);
			if (distance < setupParams.minimumDistanceChange) {
				bUpdateCurrPos = false;
			}
		}

		if (!bUpdateCurrPos) {
			this.notifyObservers(PositionManager.strCurrPosNotUpdate, null, error);
			log("(PositionManager) PositionManager not updated:", this);
			return;
		}

		// Atualiza a posição apenas se tiver passado mais de 1 minuto
		log("(PositionManager) Updating PositionManager...");
		this.lastPosition = position;
		this.position = position;
		this.coords = position.coords;
		this.latitude = position.coords.latitude;
		this.longitude = position.coords.longitude;
		this.accuracy = position.coords.accuracy;
		this.accuracyQuality = PositionManager.getAccuracyQuality(
			position.coords.accuracy,
		);
		this.altitude = position.coords.altitude;
		this.altitudeAccuracy = position.coords.altitudeAccuracy;
		this.heading = position.coords.heading;
		this.speed = position.coords.speed;
		this.timestamp = position.timestamp;
		this.lastModified = position.timestamp;
		this.notifyObservers(PositionManager.strCurrPosUpdate, null, error);
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
		return `${this.constructor.name}: ${this.latitude}, ${this.longitude}, ${this.accuracyQuality}, ${this.altitude}, ${this.speed}, ${this.heading}, ${this.timestamp}`;
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
		console.log("Setting gettingLocation status to:", status);
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
		this.observers = [];
		this.fetching = false;
		this.data = null;
		this.error = null;
		this.loading = false;
		this.lastFetch = 0;
		this.timeout = 10000;
		this.cache = new Map();
		this.lastPosition = null;
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
		console.log("(APIFetcher) URL set to:", this.url);
		console.log("(APIFetcher) Notifying observers after URL change.");
		this.notifyObservers();
	}

	subscribe(observer) {
		console.log(`(APIFetcher) observer ${observer} subscribing ${this}`);
		if (observer) {
			this.observers.push(observer);
		}
	}

	unsubscribe(observer) {
		this.observers = this.observers.filter((o) => o !== observer);
	}

	notifyObservers() {
		log("(APIFetcher) Notifying observers: " + this.observers);
		this.observers.forEach((observer) => {
			observer.update(
				this.firstUpdateParam(),
				this.secondUpdateParam(),
				this.error,
				this.loading,
			);
		});
	}

	firstUpdateParam() {
		return this.data;
	}

	secondUpdateParam() {
		return null;
	}

	async fetchData() {
		const cacheKey = this.getCacheKey();
		if (this.cache.has(cacheKey)) {
			this.data = this.cache.get(cacheKey);
			return;
		}
		this.loading = true;

		try {
			const response = await fetch(this.url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			this.data = data;
			this.cache.set(cacheKey, data);
		} catch (error) {
			this.error = error;
		} finally {
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
		this.cache.clear();
		this.notifyObservers();
	}

	getCacheKey() {
		return `${this.latitude},${this.longitude}`;
	}

	async fetchAddress() {
		return super.fetchData();
	}

	reverseGeocode() {
		if (!this.latitude || !this.longitude) {
			return Promise.reject(new Error("Invalid coordinates"));
		}
		if (!this.url) {
			this.url = getOpenStreetMapUrl(this.latitude, this.longitude);
		}
		if (!this.latitude || !this.longitude) {
			return Promise.reject(new Error("Invalid coordinates"));
		}
		if (!this.url) {
			this.url = getOpenStreetMapUrl(this.latitude, this.longitude);
		}
		return new Promise((resolve, reject) => {
			this.fetchData()
				.then(() => {
					if (this.error) {
						reject(this.error);
					} else {
						resolve(this.data);
					}
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	update(position, posEvent) {
		// Proceed with reverse geocoding if position is updated
		if (posEvent == PositionManager.strCurrPosUpdate) {
			SingletonStatusManager.getInstance().setGettingLocation(true);

			this.setCoordinates(position.coords.latitude, position.coords.longitude);
			this.reverseGeocode()
				.then((addressData) => {
					this.currentAddress = addressData;
					//TODO: #23 Remover dependencia de AddressDataExtractor no ReverseGeocoder
					this.enderecoPadronizado =
						AddressDataExtractor.getBrazilianStandardAddress(addressData);
					this.notifyObservers();
				})
				.catch((error) => {
					displayError(error);
				});
		}
	}

	toString() {
		return `${this.constructor.name}: ${this.latitude}, ${this.longitude}`;
	}

	secondUpdateParam() {
		return this.enderecoPadronizado;
	}
}

function getAddressType(address) {
	const addressClass = address.class;
	const addressType = address.type;
	let addressTypeDescr;

	if (addressClass == "place" && addressType == "house") {
		addressTypeDescr = "Residencial";
	} else if (addressClass == "shop" && addressType == "mall") {
		addressTypeDescr = "Shopping Center";
	} else if (addressClass == "amenity" && addressType == "cafe") {
		addressTypeDescr = "Café";
	} else if (addressClass == "amenity" && addressType == "cafe") {
		addressTypeDescr = "Café";
	} else {
		addressTypeDescr = "Não classificado";
	}
	return addressTypeDescr;
}

class GeolocationService {
	constructor(element) {
		this.element = element;
		this.currentPosition = null;
		this.currentCoords = null;
		this.currentAddress = null;
		this.trackingInterval = null;
		this.locationResult = null;
		this.observers = [];
		this.gettingLocation = false;
		this.tsPosicaoAtual = null;
		this.tsPosicaoAnterior = null;
	}

	subscribe(observer) {
		if (observer == null) {
			console.warn(
				"(GeolocationService) Attempted to subscribe a null observer.",
			);
			return;
		}
		this.observers.push(observer);
	}

	unsubscribe(observer) {
		this.observers = this.observers.filter((o) => o !== observer);
	}

	notifyObservers() {
		console.log(
			"(GeolocationService) Notifying observers of location update...",
		);
		this.observers.forEach((observer) => {
			console.log("Notifying observer:", observer);
			observer.update(this.currentPosition);
		});
	}

	defaultOptions() {
		return {
			enableHighAccuracy: true,
			maximumAge: 0, // Don't use a cached position
			timeout: 10000, // 10 seconds
		};
	}

	checkGeolocation() {
		// Check if geolocation is supported by the browser
		const element = this.locationResult;
		if (element !== null) {
			if (!navigator.geolocation) {
				element.innerHTML =
					'<p class="error">O seu navegador não tem a funcionalidade de geolocalização.</p>';
				console.log("Your browser does not support geolocation.");
			} else {
				element.innerHTML +=
					"<p>O seu navegador tem a funcionalidade de geolocalização.</p>";
				console.log("Your browser supports geolocation.");
			}
		}
	}

	async getCurrentLocation() {
		this.checkGeolocation();
		return new Promise(async function (resolve, reject) {
			// Get current position
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					SingletonStatusManager.getInstance().setGettingLocation(true);
					resolve(PositionManager.getInstance(position));
				},
				(error) => {
					reject(error);
				},
				{
					enableHighAccuracy: true,
					maximumAge: 0, // Don't use a cached position
					timeout: 60000, // 60 seconds
				},
			);
		});
	}

	updatePosition(position) {
		SingletonStatusManager.getInstance().setGettingLocation(true);

		if (findRestaurantsBtn) {
			findRestaurantsBtn.disabled = true;
		}
		if (cityStatsBtn) {
			cityStatsBtn.disabled = true;
		}
		this.currentPosition = position;
		this.currentCoords = position.coords;
		this.notifyObservers();
	}

	/**
	 * Updates position with immediate address change processing
	 * This method bypasses the normal PositionManager timing constraints
	 * to enable immediate location change notifications
	 * @param {GeolocationPosition} position - The position update
	 * @param {WebGeocodingManager} webGeocodingManager - Reference to WebGeocodingManager for immediate address processing
	 */
	updatePositionWithImmediateAddressCheck(position, webGeocodingManager) {
		log("(GeolocationService) Processing position update with immediate address change detection...");
		
		// Update position data
		this.currentPosition = position;
		this.currentCoords = position.coords;
		
		// Notify regular observers first
		this.notifyObservers();
		
		// Trigger immediate address update if webGeocodingManager is provided
		if (webGeocodingManager && typeof webGeocodingManager.getImmediateAddressUpdate === 'function') {
			webGeocodingManager.getImmediateAddressUpdate(position)
				.then(() => {
					log("(GeolocationService) Immediate address update completed");
				})
				.catch((error) => {
					console.error("(GeolocationService) Error in immediate address update:", error);
				});
		}
	}

	async watchCurrentLocation() {
		this.checkGeolocation();
		return new Promise(async function (resolve, reject) {
			// Get current position
			navigator.geolocation.watchPosition(
				async (position) => {
					SingletonStatusManager.getInstance().setGettingLocation(true);
					let currentPos = PositionManager.getInstance(position);
					resolve(currentPos);
				},
				(error) => {
					reject(error);
				},
				{
					enableHighAccuracy: true,
					maximumAge: 0, // Don't use a cached position
					timeout: 10000, // 10 seconds
				},
			);
		});
	}

	async getSingleLocationUpdate() {
		if (this.locationResult) {
			this.locationResult.innerHTML =
				'<p class="loading">Buscando a sua localização...</p>';
		}

		SingletonStatusManager.getInstance().setGettingLocation(true);

		return this.getCurrentLocation().then((position) => {
			let currentPos = PositionManager.getInstance(position);
			this.currentPosition = position;
			this.currentCoords = position.coords;
			this.notifyObservers();
			return position;
		}).catch((error) => {
			console.error("(GeolocationService) Error getting location:", error);
			displayError(error);
			SingletonStatusManager.getInstance().setGettingLocation(false);
			throw error; // Re-throw to allow further handling if needed
		});
	}

	async getWatchLocationUpdate() {
		if (this.locationResult) {
			this.locationResult.innerHTML =
				'<p class="loading">Buscando a sua localização...</p>';
			let currentPos = PositionManager.getInstance();
		}

		SingletonStatusManager.getInstance().setGettingLocation(true);

		return this.watchCurrentLocation().then((position) => {
			this.currentPosition = position;
			this.currentCoords = position.coords;
			this.notifyObservers();
			return position;
		}).catch((error) => {
			console.error("(GeolocationService) Error watching location:", error);
			displayError(error);
			SingletonStatusManager.getInstance().setGettingLocation(false);
			throw error; // Re-throw to allow further handling if needed
		});
	}

	toString() {
		return `${this.constructor.name}: ${this.currentCoords ? this.currentCoords.latitude : "N/A"}, ${this.currentCoords ? this.currentCoords.longitude : "N/A"}`;
	}
}

class WebGeocodingManager {
	constructor(document, resultElement) {
		this.document = document;
		this.locationResult = resultElement;
		this.observers = [];
		this.functionObservers = [];
		this.currentPosition = null;
		this.currentCoords = null;

		this.initElements();

		this.geolocationService = new GeolocationService(this.locationResult);
		this.reverseGeocoder = new ReverseGeocoder();

		this.positionDisplayer = new HTMLPositionDisplayer(this.locationResult);
		this.addressDisplayer = new HTMLAddressDisplayer(this.locationResult);

		PositionManager.getInstance().subscribe(this.positionDisplayer);
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

	subscribe(observer) {
		if (observer == null) {
			console.warn(
				"(WebGeocodingManager) Attempted to subscribe a null observer.",
			);
			return;
		}
		console.log(
			`(WebGeocodingManager) observer ${observer} subscribing ${this}`,
		);
		this.observers.push(observer);
	}

	unsubscribe(observer) {
		this.observers = this.observers.filter((o) => o !== observer);
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
		this.functionObservers.push(observerFunction);
	}

	unsubscribeFunction(observerFunction) {
		this.functionObservers = this.functionObservers.filter(
			(fn) => fn !== observerFunction,
		);
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

		this.notifyObservers();
	}

	notifyObservers() {
		console.log("(WebGeocodingManager) Notifying observers");
		for (const observer of this.observers) {
			observer.update(this.currentPosition);
		}
	}

	notifyFunctionObservers() {
		console.log("(WebGeocodingManager) Notifying function observers");
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

	/**
	 * Get address update for immediate location change notifications
	 * This method bypasses the PositionManager 60-second timing constraints
	 * and processes address changes immediately for critical location notifications
	 * @param {GeolocationPosition} position - Current position object
	 */
	getImmediateAddressUpdate(position) {
		log("(WebGeocodingManager) Getting immediate address update for location change detection...");
		
		if (!position || !position.coords) {
			log("(WebGeocodingManager) Invalid position for immediate address update");
			return Promise.reject(new Error("Invalid position provided"));
		}

		// Create a new ReverseGeocoder instance for immediate processing
		const immediateGeocoder = new ReverseGeocoder(position.coords.latitude, position.coords.longitude);
		
		return immediateGeocoder.reverseGeocode()
			.then((addressData) => {
				log("(WebGeocodingManager) Got immediate address data, processing for change detection...");
				
				// Use the new immediate processing method that bypasses normal timing constraints
				const enderecoPadronizado = AddressDataExtractor.processAddressForImmediateChange(addressData, true);
				
				log("(WebGeocodingManager) Immediate address processing completed");
				return {
					currentAddress: addressData,
					enderecoPadronizado: enderecoPadronizado
				};
			})
			.catch((error) => {
				console.error("(WebGeocodingManager) Error in immediate address update:", error);
				throw error;
			});
	}

	updatePosition(position) {
		this.reverseGeocoder.latitude = position.coords.latitude;
		this.reverseGeocoder.longitude = position.coords.longitude;
		this.reverseGeocoder
			.reverseGeocode()
			.then((addressData) => {
				this.reverseGeocoder.currentAddress = addressData;
				this.reverseGeocoder.notifyObservers();
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
		this.geolocationService.getWatchLocationUpdate().then((value) => {
			value.subscribe(this.positionDisplayer);
			value.subscribe(this.reverseGeocoder);
			//value.subscribe(this.htmlSpeechSynthesisDisplayer);
		}).catch((error) => {
			console.error("(WebGeocodingManager) Error setting up location watching:", error);
			// Error is already handled by GeolocationService, just log it here
		});

		// Start immediate address change tracking (separate from regular position tracking)
		this.startImmediateAddressChangeTracking();

		// Register callback for logradouro change detection (replaces timer-based approach)
		this.setupLogradouroChangeDetection();

		// Register callback for bairro change detection (follows same pattern as logradouro)
		this.setupBairroChangeDetection();

		// Register callback for municipio change detection (follows same pattern as logradouro and bairro)
		this.setupMunicipioChangeDetection();
	}

	/**
	 * Start immediate address change tracking that bypasses the 60-second position manager constraint
	 * This enables immediate speech notifications for street/neighborhood/municipality changes
	 */
	startImmediateAddressChangeTracking() {
		log("(WebGeocodingManager) Starting immediate address change tracking...");
		
		// Set up a separate high-frequency position watcher specifically for address changes
		// This runs independently of the main PositionManager timing constraints
		if (navigator.geolocation) {
			this.immediateTrackingWatchId = navigator.geolocation.watchPosition(
				(position) => {
					// Use the immediate address checking method
					this.geolocationService.updatePositionWithImmediateAddressCheck(position, this);
				},
				(error) => {
					log("(WebGeocodingManager) Immediate tracking geolocation error:", error.message);
				},
				{
					enableHighAccuracy: true,
					maximumAge: 5000, // Allow 5-second cached positions for immediate tracking
					timeout: 30000 // 30-second timeout
				}
			);
			
			log("(WebGeocodingManager) Immediate address change tracking started with watch ID:", this.immediateTrackingWatchId);
		} else {
			console.warn("(WebGeocodingManager) Geolocation not supported for immediate tracking");
		}
	}

	/**
	 * Stop immediate address change tracking
	 */
	stopImmediateAddressChangeTracking() {
		if (this.immediateTrackingWatchId) {
			navigator.geolocation.clearWatch(this.immediateTrackingWatchId);
			this.immediateTrackingWatchId = null;
			log("(WebGeocodingManager) Immediate address change tracking stopped");
		}
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
		log('(WebGeocodingManager) Notificando os observadores da mudança de logradouro.');
		for (const observer of this.observers) {
			if (typeof observer.update === "function") {
				log(`(WebGeocodingManager) Notificando o observador ${observer.toString()} sobre a mudança de logradouro.`);
				observer.update(
					this.reverseGeocoder.currentAddress,
					"LogradouroChanged",
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
					"(WebGeocodingManager) Error notifying function observer:",
					error,
				);
			}
		}
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
				log(`(WebGeocodingManager) Notificando o observador ${observer.toString()} sobre a mudança de bairro.`);
				observer.update(
					this.reverseGeocoder.currentAddress,
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
				log(`(WebGeocodingManager) Notificando o observador ${observer.toString()} sobre a mudança de município.`);
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

class Chronometer {
	constructor(element) {
		this.element = element;
		this.startTime = null;
		this.elapsedTime = 0;
		this.timerInterval = null;
	}

	start() {
		if (this.timerInterval) {
			return; // Already running
		}
		this.startTime = Date.now() - this.elapsedTime;
		this.timerInterval = setInterval(() => {
			this.elapsedTime = Date.now() - this.startTime;
			this.updateDisplay();
		}, 1000);
	}

	stop() {
		if (!this.timerInterval) {
			return; // Not running
		}
		clearInterval(this.timerInterval);
		this.timerInterval = null;
	}

	reset() {
		this.stop();
		this.elapsedTime = 0;
		this.updateDisplay();
	}

	updateDisplay() {
		const totalSeconds = Math.floor(this.elapsedTime / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		this.element.textContent = `${String(hours).padStart(2, "0")}:${String(
			minutes,
		).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	}

	update(currentPosition, posEvent) {
		// Start the chronometer when a new position is received
		// Stop it if no position is available
		if (posEvent == PositionManager.strCurrPosUpdate) {
			if (this.timerInterval && currentPosition) {
				this.reset();
				this.start();
			} else if (!this.timerInterval && currentPosition) {
				this.start();
			} else {
				this.stop();
				this.reset();
			}
		}
	}

	toString() {
		return `${this.constructor.name}: ${this.element.textContent}`;
	}
}

/* --------------
 * Camada de GUI
 * --------------------
 */

class HTMLPositionDisplayer {
	constructor(element) {
		this.element = element;
		Object.freeze(this); // Prevent further modification
	}

	renderHtmlCoords(position) {
		if (!position || !position.coords) {
			return "<p class='error'>No position data available.</p>";
		}
		const latitude = position.coords.latitude;
		const longitude = position.coords.longitude;
		const altitude = position.coords.altitude;
		const precisao = position.coords.accuracy; // in meters
		const precisaoAltitude = position.coords.altitudeAccuracy;
		const direcao = position.coords.heading; // in degrees
		const velocidade = position.coords.speed; // in meters per second
		const timestamp = new Date(position.timestamp).toLocaleString();

		let html = `<details class="coords-details" closed>
					<summary><strong>Coordinates Details</strong></summary>`;
		if (latitude) {
			html += `<p> <strong>Latitude:</strong> ${latitude.toFixed(6)}</p > `;
		}
		if (longitude) {
			html += `<p> <strong>Longitude:</strong> ${longitude.toFixed(6)}</p > `;
		}
		if (altitude) {
			html += `<p> <strong>Altitude:</strong> ${altitude.toFixed(2)} metros</p > `;
		}
		if (precisao) {
			html += `<p> <strong>Precisão:</strong> ±${Math.round(precisao)} metros</p > `;
		}
		if (precisaoAltitude) {
			html += `<p> <strong>Precisão da altitude:</strong> ±${Math.round(precisaoAltitude)} metros</p > `;
		}
		if (direcao) {
			html += `<p> <strong>Direção:</strong> ${direcao.toFixed(2)}°</p > `;
		}
		if (velocidade) {
			html += `<p> <strong>Velocidade:</strong> ${velocidade.toFixed(2)} m / s</p > `;
		}
		if (timestamp) {
			html += `<p> <strong>Timestamp:</strong> ${timestamp}</p > `;
		}
		html += `<p>
            <a href="https://www.google.com/maps?q=${latitude},${longitude}" target="_blank">Ver no Google Maps</a>
            <a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}">Ver no Google Street View</a>
        </p>
        </details>`;

		return html;
	}

	showCoords(position) {
		let html = this.renderHtmlCoords(position);
		// Display coordinates first
		const loc = `<div id="lookingUpAddress">
        <p class="loading">Looking up address...</p>
        </div>
        <div class="section" id="restaurantsSection" style="display:none;">
        <h3>Nearby Restaurants</h3>
        <div id="restaurantsList"></div>
        </div>
        <div class="section" id="cityStatsSection" style="display:none;">
        <h3>City Statistics</h3>
        <div id="cityStats"></div>
        </div> `;
		html += loc;
		// Display coordinates first
		this.element.innerHTML = html;
	}

	displayPosition(position) {
		this.showCoords(position);
	}

	update(currentPosition, posEvent, loading, error) {
		// Extract coordinates
		// Format coordinates to 6 decimal places
		// Display coordinates
		// Provide link to Google Maps
		// Provide link to Google Street View
		if (posEvent == PositionManager.strCurrPosUpdate) {
			const currentCoords = currentPosition ? currentPosition.coords : null;
			// Display loading or error messages if applicable
			// Otherwise, display the position
			if (loading) {
				this.element.innerHTML = '<p class="loading">Loading...</p>';
			} else if (error) {
				this.element.innerHTML = `<p class="error">Error: ${error.message}</p>`;
			} else if (currentCoords) {
				this.element.innerHTML = "";
				this.displayPosition(currentPosition);
			} else {
				this.element.innerHTML =
					'<p class="error">No position data available.</p>';
			}
		}
	}

	toString() {
		return `${this.constructor.name}: ${this.element.id}`;
	}
}

class BrazilianStandardAddress {
	constructor() {
		this.municipio = null;
		this.logradouro = null;
		this.house_number = null;
		this.bairro = null;
		this.regiaoCidade = null;
		this.uf = null;
		this.siglaUf = null;
		this.cep = null;
		this.pais = null;
		this.codigoPais = null;
	}

	getLogradouro() {
		return this.logradouro;
	}

	logradouroCompleto() {
		return this.house_number
			? `${this.logradouro}, ${this.house_number}`
			: `${this.logradouro}, s/n`;
	}

	bairroCompleto() {
		return this.regiaoCidade
			? `${this.bairro}, ${this.regiaoCidade}`
			: this.bairro;
	}

	toString() {
		return `${this.constructor.name}: ${this.logradouroCompleto()}, ${this.bairroCompleto()}, ${this.municipio}`;
	}
}

class GeoDataParser {
	constructor(data) {
		this.data = data;
	}

	parse() {
		// Implement parsing logic here
		this.referencePlace = GeoDataExtractor.isReferencePlace(this.data)
			? new ReferencePlace(this.data)
			: null;
		this.referencePlace = GeoDataExtractor.isReferencePlace(this.data)
			? new ReferencePlace(this.data)
			: null;
	}
}

class GeoDataExtractor {
	constructor(data) {
		this.data = data;
	}

	extract() {
		// Implement extraction logic here
	}

	static isReferencePlace(data) {
		return ReferencePlaceExtractor.isReferencePlace(data);
	}
}

class GeoDataValidator {
	constructor(data) {
		this.data = data;
	}

	validate() {
		// Implement validation logic here
	}
}

class GeoDataFormatter {
	constructor(data) {
		this.data = data;
	}

	format() {
		// Implement formatting logic here
	}
}

class GeoDataPresenter {
	constructor(element) {
		this.element = element;
	}

	present(data) {
		// Implement presentation logic here
	}
}

class ReferencePlaceExtractor {
	constructor(data) {
		this.data = data;
		this.extract();
		Object.freeze(this);
	}

	extract() {
		// Implement extraction logic here
		this.placeClass = this.data["class"];
		this.placeType = this.data["type"];
		this.placeName = this.data["name"];
	}

	static isReferencePlace(data) {
		let validRefPlaceClasses = ["shop"];
		let refPlaceClass = new ReferencePlaceExtractor(data).placeClass;
		return validRefPlaceClasses.includes(refPlaceClass);
	}
}

class ReferencePlaceValidator {
	constructor(data) {
		this.data = data;
	}

	validate() {
		// Implement validation logic here
	}
}

class ReferencePlaceFormatter {
	constructor(data) {
		this.data = data;
	}

	format() {
		// Implement formatting logic here
	}
}

class ReferencePlaceDisplayer {
	constructor(element) {
		this.element = element;
	}
	display(data) {
		// Implement display logic here
	}
}

class ReferencePlace {
	constructor(data) {
		this.data = data;
		this.extractor = new ReferencePlaceExtractor(data);
		this.validator = new ReferencePlaceValidator(data);
		this.formatter = new ReferencePlaceFormatter(data);
		this.displayer = new ReferencePlaceDisplayer();
		this.presenter = new ReferencePlacePresenter();
		this.process();
		Object.freeze(this); // Prevent further modification
	}

	process() {
		// Implement processing logic here
		this.placeClass = this.extractor.placeClass;
		this.placeType = this.extractor.placeType;
		this.placeName = this.extractor.placeName;

		this.validator.validate();
		this.formatter.format();
		this.displayer.display();
		//this.presenter.present();
	}
}
class ReferencePlacePresenter {
	constructor(element) {
		this.element = element;
	}
}

class AddressDataExtractor {
	constructor(data) {
		this.data = data;
		this.enderecoPadronizado = new BrazilianStandardAddress();
		this.padronizaEndereco();
		Object.freeze(this); // Prevent further modification
	}

	padronizaEndereco() {
		if (!this.data || !this.data.address) {
			return;
		}
		let address = this.data.address;
		this.enderecoPadronizado.logradouro = address.street || address.road;

		this.enderecoPadronizado.house_number = address.house_number || "";

		this.enderecoPadronizado.bairro = address.neighbourhood || address.suburb;

		if (address.neighbourhood && address.suburb) {
			this.enderecoPadronizado.regiaoCidade = address.suburb;
		}

		this.enderecoPadronizado.municipio =
			address.city || address.town || address.municipality || address.county;

		this.enderecoPadronizado.uf = address.state || "";

		this.enderecoPadronizado.cep = address.postcode || "";

		this.enderecoPadronizado.pais = address.country || "";

		this.enderecoPadronizado.codigoPais = address.country_code
			? address.country_code.toUpperCase()
			: "";

		// Extract state code from ISO3166-2-lvl4 if available
		// Example format: "BR-SP" for São Paulo, Brazil
		if (address["ISO3166-2-lvl4"]) {
			const pattern = /^BR-(\w{2})$/;
			const match = address["ISO3166-2-lvl4"].match(pattern);
			if (match) {
				this.enderecoPadronizado.siglaUf = match[1];
			}
		}

		Object.freeze(this.enderecoPadronizado); // Prevent further modification
	}

	toString() {
		return `${this.constructor.name}: ${this.enderecoPadronizado.toString()}`;
	}

	/**
	 * Sets the cache expiration time in milliseconds
	 * @param {number} expirationMs - Expiration time in milliseconds
	 */
	static setCacheExpirationTime(expirationMs) {
		if (typeof expirationMs !== "number" || expirationMs < 0) {
			throw new Error("Cache expiration time must be a non-negative number");
			if (typeof expirationMs !== "number" || expirationMs < 0) {
				throw new Error("Cache expiration time must be a non-negative number");
			}
			AddressDataExtractor.cacheExpirationMs = expirationMs;
		}
	}

	/**
	 * Generates a cache key from address data
	 * @param {Object} data - Address data object
	 * @returns {string} Cache key
	 */
	static generateCacheKey(data) {
		if (!data || !data.address) {
			return null;
		}

		const address = data.address;
		const keyParts = [
			address.street || address.road || "",
			address.house_number || "",
			address.neighbourhood || address.suburb || "",
			address.city ||
			address.town ||
			address.municipality ||
			address.county ||
			"",
			address.state || "",
			address.postcode || "",
			address.country_code || "",
		];

		return keyParts.join("|");
	}

	/**
	 * Cleans expired entries from the cache
	 */
	static cleanExpiredEntries() {
		const now = Date.now();
		let cleanedCount = 0;

		for (const [key, cacheEntry] of AddressDataExtractor.cache.entries()) {
			if (now - cacheEntry.timestamp > AddressDataExtractor.cacheExpirationMs) {
				AddressDataExtractor.cache.delete(key);
				cleanedCount++;
			}
		}

		if (cleanedCount > 0) {
			console.log(
				`(AddressDataExtractor) Cleaned ${cleanedCount} expired cache entries`,
			);
		}
	}

	/**
	 * Clears all cache entries
	 */
	static clearCache() {
		AddressDataExtractor.cache.clear();
	}

	/**
	 * Gets the current cache size
	 * @returns {number} Number of entries in cache
	 */
	static getCacheSize() {
		return AddressDataExtractor.cache.size;
	}

	/**
	 * Gets the current address (most recently accessed) from cache
	 * @returns {BrazilianStandardAddress|null} Current address or null if cache is empty
	 */
	static getCurrentAddress() {
		if (AddressDataExtractor.cache.size === 0) {
			return null;
		}

		// Map maintains insertion order, last entry is most recent
		const entries = Array.from(AddressDataExtractor.cache.values());
		const currentEntry = entries[entries.length - 1];

		return currentEntry ? currentEntry.address : null;
	}

	/**
	 * Gets the previous address (immediately before current) from cache
	 * @returns {BrazilianStandardAddress|null} Previous address or null if less than 2 entries
	 */
	static getPreviousAddress() {
		if (AddressDataExtractor.cache.size < 2) {
			return null;
		}

		// Map maintains insertion order, second-to-last entry is previous
		const entries = Array.from(AddressDataExtractor.cache.values());
		const previousEntry = entries[entries.length - 2];

		return previousEntry ? previousEntry.address : null;
	}

	/**
	 * Checks if the logradouro (street) has changed between the current and previous addresses
	 * @returns {boolean} True if logradouro has changed, false otherwise
	 */
	static hasLogradouroChanged() {
		const currentAddress = AddressDataExtractor.getCurrentAddress();
		const previousAddress = AddressDataExtractor.getPreviousAddress();

		// If we don't have both addresses, no change can be detected
		if (!currentAddress || !previousAddress) {
			return false;
		}

		// Compare logradouro values, handling null/undefined cases
		const currentLogradouro = currentAddress.logradouro;
		const previousLogradouro = previousAddress.logradouro;

		// Check if addresses are actually different
		const hasChanged = currentLogradouro !== previousLogradouro;

		if (!hasChanged) {
			return false;
		}

		// Create a signature for this specific change to prevent loops
		const changeSignature = `${previousLogradouro}|${currentLogradouro}`;

		// If we've already notified about this exact change, don't notify again
		if (AddressDataExtractor.lastNotifiedChangeSignature === changeSignature) {
			return false;
		}

		// Mark this change as the one we're about to notify
		AddressDataExtractor.lastNotifiedChangeSignature = changeSignature;

		return true;
	}

	/**
	 * Gets detailed information about logradouro changes between current and previous addresses
	 * @returns {Object|null} Object with change details or null if no comparison possible
	 */
	static getLogradouroChangeDetails() {
		const currentAddress = AddressDataExtractor.getCurrentAddress();
		const previousAddress = AddressDataExtractor.getPreviousAddress();

		// If we don't have both addresses, no change details can be provided
		if (!currentAddress || !previousAddress) {
			return null;
		}

		const currentLogradouro = currentAddress.logradouro;
		const previousLogradouro = previousAddress.logradouro;
		const hasChanged = currentLogradouro !== previousLogradouro;

		return {
			hasChanged: hasChanged,
			previous: {
				logradouro: previousLogradouro,
				logradouroCompleto: previousAddress.logradouroCompleto(),
			},
			current: {
				logradouro: currentLogradouro,
				logradouroCompleto: currentAddress.logradouroCompleto(),
			},
		};
	}

	/**
	 * Checks if the bairro (neighborhood) has changed between the current and previous addresses
	 * @returns {boolean} True if bairro has changed, false otherwise
	 */
	static hasBairroChanged() {
		const currentAddress = AddressDataExtractor.getCurrentAddress();
		const previousAddress = AddressDataExtractor.getPreviousAddress();

		// If we don't have both addresses, no change can be detected
		if (!currentAddress || !previousAddress) {
			return false;
		}

		// Compare bairro values, handling null/undefined cases
		const currentBairro = currentAddress.bairro;
		const previousBairro = previousAddress.bairro;

		// Check if addresses are actually different
		const hasChanged = currentBairro !== previousBairro;

		if (!hasChanged) {
			return false;
		}

		// Create a signature for this specific change to prevent loops
		const changeSignature = `${previousBairro}|${currentBairro}`;

		// If we've already notified about this exact change, don't notify again
		if (AddressDataExtractor.lastNotifiedBairroChangeSignature === changeSignature) {
			return false;
		}

		// Mark this change as the one we're about to notify
		AddressDataExtractor.lastNotifiedBairroChangeSignature = changeSignature;

		return true;
	}

	/**
	 * Gets detailed information about bairro changes between current and previous addresses
	 * @returns {Object|null} Object with change details or null if no comparison possible
	 */
	static getBairroChangeDetails() {
		const currentAddress = AddressDataExtractor.getCurrentAddress();
		const previousAddress = AddressDataExtractor.getPreviousAddress();

		// If we don't have both addresses, no change details can be provided
		if (!currentAddress || !previousAddress) {
			return null;
		}

		const currentBairro = currentAddress.bairro;
		const previousBairro = previousAddress.bairro;
		const hasChanged = currentBairro !== previousBairro;

		return {
			hasChanged: hasChanged,
			previous: {
				bairro: previousBairro,
				bairroCompleto: previousAddress.bairroCompleto(),
			},
			current: {
				bairro: currentBairro,
				bairroCompleto: currentAddress.bairroCompleto(),
			},
		};
	}

	/**
	 * Checks if the municipio (municipality) has changed between the current and previous addresses
	 * @returns {boolean} True if municipio has changed, false otherwise
	 */
	static hasMunicipioChanged() {
		const currentAddress = AddressDataExtractor.getCurrentAddress();
		const previousAddress = AddressDataExtractor.getPreviousAddress();

		// If we don't have both addresses, no change can be detected
		if (!currentAddress || !previousAddress) {
			return false;
		}

		// Compare municipio values, handling null/undefined cases
		const currentMunicipio = currentAddress.municipio;
		const previousMunicipio = previousAddress.municipio;

		// Check if addresses are actually different
		const hasChanged = currentMunicipio !== previousMunicipio;

		if (!hasChanged) {
			return false;
		}

		// Create a signature for this specific change to prevent loops
		const changeSignature = `${previousMunicipio}|${currentMunicipio}`;

		// If we've already notified about this exact change, don't notify again
		if (AddressDataExtractor.lastNotifiedMunicipioChangeSignature === changeSignature) {
			return false;
		}

		// Mark this change as the one we're about to notify
		AddressDataExtractor.lastNotifiedMunicipioChangeSignature = changeSignature;

		return true;
	}

	/**
	 * Gets detailed information about municipio changes between current and previous addresses
	 * @returns {Object|null} Object with change details or null if no comparison possible
	 */
	static getMunicipioChangeDetails() {
		const currentAddress = AddressDataExtractor.getCurrentAddress();
		const previousAddress = AddressDataExtractor.getPreviousAddress();

		// If we don't have both addresses, no change details can be provided
		if (!currentAddress || !previousAddress) {
			return null;
		}

		const currentMunicipio = currentAddress.municipio;
		const previousMunicipio = previousAddress.municipio;
		const hasChanged = currentMunicipio !== previousMunicipio;

		return {
			hasChanged: hasChanged,
			previous: {
				municipio: previousMunicipio,
				uf: previousAddress.uf,
			},
			current: {
				municipio: currentMunicipio,
				uf: currentAddress.uf,
			},
		};
	}

	/**
	 * Sets the maximum cache size for LRU behavior
	 * @param {number} maxSize - Maximum number of entries in cache
	 */
	static setMaxCacheSize(maxSize) {
		if (typeof maxSize !== "number" || maxSize < 1) {
			throw new Error("Maximum cache size must be a positive number");
			if (typeof maxSize !== "number" || maxSize < 1) {
				throw new Error("Maximum cache size must be a positive number");
			}
			AddressDataExtractor.maxCacheSize = maxSize;

			// Evict entries if current size exceeds new limit
			AddressDataExtractor.evictLeastRecentlyUsedIfNeeded();
		}
	}

	/**
	 * Evicts least recently used entries if cache exceeds maximum size
	 * This implements the history-like behavior where old entries are removed
	 */
	static evictLeastRecentlyUsedIfNeeded() {
		while (
			AddressDataExtractor.cache.size >= AddressDataExtractor.maxCacheSize
		) {
			// Map maintains insertion order, so first entry is least recently used
			// (since we re-insert on access to move to end)
			const firstKey = AddressDataExtractor.cache.keys().next().value;
			if (firstKey) {
				AddressDataExtractor.cache.delete(firstKey);
			} else {
				break; // Safety check
			}
		}
	}

	/**
	 * Sets a callback function to be called when logradouro changes are detected
	 * @param {Function} callback - Function to call when logradouro changes occur
	 */
	static setLogradouroChangeCallback(callback) {
		AddressDataExtractor.logradouroChangeCallback = callback;
	}

	/**
	 * Sets a callback function to be called when bairro changes are detected
	 * @param {Function} callback - Function to call when bairro changes occur
	 */
	static setBairroChangeCallback(callback) {
		AddressDataExtractor.bairroChangeCallback = callback;
	}

	/**
	 * Sets a callback function to be called when municipio changes are detected
	 * @param {Function} callback - Function to call when municipio changes occur
	 */
	static setMunicipioChangeCallback(callback) {
		AddressDataExtractor.municipioChangeCallback = callback;
	}

	static getBrazilianStandardAddress(data) {
		const cacheKey = AddressDataExtractor.generateCacheKey(data);

		if (cacheKey) {
			// Clean expired entries periodically
			AddressDataExtractor.cleanExpiredEntries();

			// Check if we have a valid cached entry
			const cacheEntry = AddressDataExtractor.cache.get(cacheKey);
			if (cacheEntry) {
				const now = Date.now();
				if (
					now - cacheEntry.timestamp <=
					AddressDataExtractor.cacheExpirationMs
				) {
					if (
						now - cacheEntry.timestamp <=
						AddressDataExtractor.cacheExpirationMs
					) {
						// Update access time for LRU behavior (history-like)
						cacheEntry.lastAccessed = now;
						// Re-insert to update position in Map (Map maintains insertion order)
						AddressDataExtractor.cache.delete(cacheKey);
						AddressDataExtractor.cache.set(cacheKey, cacheEntry);

						return cacheEntry.address;
					} else {
						// Remove expired entry
						AddressDataExtractor.cache.delete(cacheKey);
					}
				}
			}

			// Create new standardized address
			const extractor = new AddressDataExtractor(data);

			// Cache the result if we have a valid key
			if (cacheKey) {
				// Check if cache has reached maximum size, evict least recently used entries
				AddressDataExtractor.evictLeastRecentlyUsedIfNeeded();

				const now = Date.now();
				AddressDataExtractor.cache.set(cacheKey, {
					address: extractor.enderecoPadronizado,
					timestamp: now,
					lastAccessed: now,
				});

				// Reset change notification flags when new address is cached
				// This allows detection of new changes after cache updates
				AddressDataExtractor.lastNotifiedChangeSignature = null;
				AddressDataExtractor.lastNotifiedBairroChangeSignature = null;
				AddressDataExtractor.lastNotifiedMunicipioChangeSignature = null;

				// Check for logradouro change after caching the new address
				// This replaces the timer-based approach with event-driven checking
				if (AddressDataExtractor.logradouroChangeCallback && 
					AddressDataExtractor.hasLogradouroChanged()) {
					const changeDetails = AddressDataExtractor.getLogradouroChangeDetails();
					try {
						AddressDataExtractor.logradouroChangeCallback(changeDetails);
					} catch (error) {
						console.error(
							"(AddressDataExtractor) Error calling logradouro change callback:",
							error,
						);
					}
				}

				// Check for bairro change after caching the new address
				// This follows the same pattern as logradouro change detection
				if (AddressDataExtractor.bairroChangeCallback && 
					AddressDataExtractor.hasBairroChanged()) {
					const changeDetails = AddressDataExtractor.getBairroChangeDetails();
					try {
						AddressDataExtractor.bairroChangeCallback(changeDetails);
					} catch (error) {
						console.error(
							"(AddressDataExtractor) Error calling bairro change callback:",
							error,
						);
					}
				}

				// Check for municipio change after caching the new address
				// This follows the same pattern as logradouro and bairro change detection
				if (AddressDataExtractor.municipioChangeCallback && 
					AddressDataExtractor.hasMunicipioChanged()) {
					const changeDetails = AddressDataExtractor.getMunicipioChangeDetails();
					try {
						AddressDataExtractor.municipioChangeCallback(changeDetails);
					} catch (error) {
						console.error(
							"(AddressDataExtractor) Error calling municipio change callback:",
							error,
						);
					}
				}
			}

			return extractor.enderecoPadronizado;
		}
	}

	/**
	 * Process address data for immediate location change detection (bypasses position manager timing constraints)
	 * This method allows critical location changes to be detected and announced immediately
	 * without waiting for the 60-second position update interval
	 * @param {Object} data - Address data from geocoding API
	 * @param {boolean} forceImmediateNotification - Force notification even if timing constraints would normally block it
	 * @returns {BrazilianStandardAddress} Processed address object
	 */
	static processAddressForImmediateChange(data, forceImmediateNotification = true) {
		log("(AddressDataExtractor) Processing address for immediate change detection...");
		
		if (!data) {
			log("(AddressDataExtractor) No address data provided for immediate processing");
			return null;
		}

		// Create new standardized address (skip cache for immediate processing to ensure fresh detection)
		const extractor = new AddressDataExtractor(data);

		// Store previous address before updating current
		if (AddressDataExtractor.currentAddress) {
			AddressDataExtractor.previousAddress = { ...AddressDataExtractor.currentAddress };
		}
		AddressDataExtractor.currentAddress = { ...data };

		// For immediate processing, we don't reset change tracking signatures
		// This allows us to detect changes even when called multiple times quickly

		// Check for logradouro change with immediate notification capability
		if (AddressDataExtractor.logradouroChangeCallback && 
			AddressDataExtractor.hasLogradouroChanged()) {
			const changeDetails = AddressDataExtractor.getLogradouroChangeDetails();
			changeDetails.immediate = forceImmediateNotification;
			try {
				log("(AddressDataExtractor) Triggering immediate logradouro change callback...");
				AddressDataExtractor.logradouroChangeCallback(changeDetails);
			} catch (error) {
				console.error(
					"(AddressDataExtractor) Error calling immediate logradouro change callback:",
					error,
				);
			}
		}

		// Check for bairro change with immediate notification capability
		if (AddressDataExtractor.bairroChangeCallback && 
			AddressDataExtractor.hasBairroChanged()) {
			const changeDetails = AddressDataExtractor.getBairroChangeDetails();
			changeDetails.immediate = forceImmediateNotification;
			try {
				log("(AddressDataExtractor) Triggering immediate bairro change callback...");
				AddressDataExtractor.bairroChangeCallback(changeDetails);
			} catch (error) {
				console.error(
					"(AddressDataExtractor) Error calling immediate bairro change callback:",
					error,
				);
			}
		}

		// Check for municipio change with immediate notification capability
		if (AddressDataExtractor.municipioChangeCallback && 
			AddressDataExtractor.hasMunicipioChanged()) {
			const changeDetails = AddressDataExtractor.getMunicipioChangeDetails();
			changeDetails.immediate = forceImmediateNotification;
			try {
				log("(AddressDataExtractor) Triggering immediate municipio change callback...");
				AddressDataExtractor.municipioChangeCallback(changeDetails);
			} catch (error) {
				console.error(
					"(AddressDataExtractor) Error calling immediate municipio change callback:",
					error,
				);
			}
		}

		return extractor.enderecoPadronizado;
	}
}

// Initialize static properties for AddressDataExtractor
// Static cache for BrazilianStandardAddress instances
AddressDataExtractor.cache = new Map();
// Default cache expiration time in milliseconds (5 minutes)
AddressDataExtractor.defaultCacheExpirationMs = 5 * 60 * 1000;
// Configurable cache expiration time
AddressDataExtractor.cacheExpirationMs =
	AddressDataExtractor.defaultCacheExpirationMs;
// Maximum cache size for LRU (history-like) behavior - default to 50 entries
AddressDataExtractor.defaultMaxCacheSize = 50;
AddressDataExtractor.maxCacheSize = AddressDataExtractor.defaultMaxCacheSize;
// Track last logradouro change to prevent notification loops
AddressDataExtractor.lastNotifiedChangeSignature = null;
// Callback function to notify when logradouro changes occur
AddressDataExtractor.logradouroChangeCallback = null;
// Track last bairro change to prevent notification loops
AddressDataExtractor.lastNotifiedBairroChangeSignature = null;
// Callback function to notify when bairro changes occur
AddressDataExtractor.bairroChangeCallback = null;
// Track last municipio change to prevent notification loops
AddressDataExtractor.lastNotifiedMunicipioChangeSignature = null;
// Callback function to notify when municipio changes occur
AddressDataExtractor.municipioChangeCallback = null;

class HTMLAddressDisplayer {
	constructor(element) {
		this.element = element;
		Object.freeze(this); // Prevent further modification
	}

	renderAddress(geodataParser, enderecoPadronizado) {
		// Render address data into HTML
		// Display address components in a structured format
		// Handle missing components gracefully
		// Include links to view the address on a map service if coordinates are available
		// Return the generated HTML string

		// Check if data is valid
		if (!geodataParser.data || !geodataParser.data.address) {
			return "<p class='error'>No address data available.</p>";
		}

		const lookingUpAddress = document.getElementById("lookingUpAddress");
		if (lookingUpAddress) {
			lookingUpAddress.style.display = "none";
			lookingUpAddress.innerHTML = "";
		}

		// Determine address type
		const addressTypeDescr = getAddressType(geodataParser.data);

		let html = "";
		
		// Display municipality prominently at the top
		if (enderecoPadronizado && enderecoPadronizado.municipio) {
			html += `<div id="municipio-display" style="background-color: #e8f4fd; border: 2px solid #0066cc; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">`;
			html += `<h2 style="margin: 0; color: #0066cc; font-size: 24px; font-weight: bold;">📍 ${enderecoPadronizado.municipio}</h2>`;
			if (enderecoPadronizado.uf) {
				html += `<p style="margin: 5px 0 0 0; color: #0066cc; font-size: 16px;">${enderecoPadronizado.uf}</p>`;
			}
			html += `</div>`;
		}
		
		// Display bairro prominently but less highlighted than municipality
		if (enderecoPadronizado && enderecoPadronizado.bairro) {
			html += `<div id="bairro-display" style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 12px; margin-bottom: 15px; text-align: center;">`;
			html += `<h3 style="margin: 0; color: #6c757d; font-size: 18px; font-weight: 500;">🏘️ ${enderecoPadronizado.bairroCompleto()}</h3>`;
			html += `</div>`;
		}
		
		// Element dadosSidra as requested in the issue
		html += `<div id="dadosSidra"></div>`;
		
		if (geodataParser.referencePlace) {
			html += `<p><strong>Referência:</strong> ${geodataParser.referencePlace.placeName}</p>`;
		}
		if (geodataParser.data.address) {
			html += `<p><strong>Tipo:</strong> ${addressTypeDescr}<br>`;
			if (enderecoPadronizado) {
				html += `<strong>Logradouro/Número:</strong> ${enderecoPadronizado.logradouroCompleto()}<br>`;
				html += `<strong>Bairro:</strong> ${enderecoPadronizado.bairroCompleto()}<br>`;
				html += `<strong>Município/Cidade:</strong> ${enderecoPadronizado.municipio}<br>`;
			}

			html +=
				"<details close><summary>(Address Components) Componentes do endereço</summary>";
			html += "<p><strong>Address Details:</strong></p><ul>";
			for (const [key, value] of Object.entries(geodataParser.data.address)) {
				html += `<li><strong>${key}:</strong> ${value}</li>`;
			}
			html += "</ul>";
			html += "</details>";

			html += "<p>";
			// Display raw address details
			html +=
				"<details close><summary>(Raw Address) Detalhes do endereço (raw)</summary>";
			html += `<strong>Detalhes do endereço (raw):</strong><br>
	${geodataParser.data.address.road || geodataParser.data.address.street || ""} ${geodataParser.data.address.house_number || ""}<br>
	${geodataParser.data.address.neighbourhood || geodataParser.data.address.suburb || ""}<br>
    ${geodataParser.data.address.municipality}<br>
    ${geodataParser.data.address.county}<br>
    <strong>UF:</strong> ${geodataParser.data.address.state}<br>
    <strong>Região:</strong> ${geodataParser.data.address.region}<br>
    <strong>CEP:</strong> ${geodataParser.data.address.postcode}<br>
    <strong>País:</strong> ${geodataParser.data.address.country}<br>
    <strong>Código do país:</strong> ${geodataParser.data.address.country_code}<br>
    <strong>Boundingbox</strong>: ${geodataParser.data.boundingbox} </p> `;
			html += "</details>";
			html +=
				"<details close><summary>(Raw Data) Dados em formato JSON</summary>";
			html += `${JSON.stringify(geodataParser.data)}`;
			html += "</details>";
		}

		return html;
	}

	displayAddress(data, enderecoPadronizado) {
		let geodataParser = new GeoDataParser(data);
		geodataParser.parse();
		let html = this.renderAddress(geodataParser, enderecoPadronizado);
		this.element.innerHTML += html;
	}

	update(currentAddress, enderecoPadronizado, loading, error) {
		if (currentAddress) {
			if (this.findRestaurantsBtn) {
				this.findRestaurantsBtn.disabled = true;
			}
			if (this.cityStatsBtn) {
				this.cityStatsBtn.disabled = true;
			}
			this.displayAddress(currentAddress, enderecoPadronizado);
		}
	}

	toString() {
		return `${this.constructor.name}: ${this.element.id}`;
	}
}

function displayError(error) {
	// Error callback
	let errorMessage;
	console.log(error);
	console.log(error.code);
	switch (error.code) {
		case error.PERMISSION_DENIED:
			errorMessage = "User denied the request for Geolocation.";
			break;
		case error.POSITION_UNAVAILABLE:
			errorMessage = "Location information is unavailable.";
			break;
		case error.TIMEOUT:
			errorMessage = "Não foi possível obter sua localização. Isso pode acontecer quando o GPS está desligado ou em ambientes fechados. Tente novamente em local aberto.";
			break;
		case error.UNKNOWN_ERROR:
			errorMessage = "An unknown error occurred.";
			break;
	}
	// Try to find a result area to display the error
	const resultArea = document.getElementById("result-area");
	if (resultArea) {
		resultArea.innerHTML = `<p class="error">Error: ${errorMessage}</p>`;
	} else {
		console.error("Error:", errorMessage);
	}
	/*if (findRestaurantsBtn) {
		findRestaurantsBtn.disabled = true;
	}
	if (cityStatsBtn) {
		cityStatsBtn.disabled = true;
	}*/
}

/* ============================
 * Voz do guia
 * ============================
 */

class SpeechQueue {
	constructor() {
		this.queue = [];
		this.isProcessing = false;
		this.timeoutDuration = 5000; // 5 seconds timeout
		this.observerFunctions = [];
	}

	subscribeFunction(observerFunction) {
		this.observerFunctions.push(observerFunction);
	}

	unsubscribeFunction(observerFunction) {
		this.observerFunctions = this.observerFunctions.filter(fn => fn !== observerFunction);
	}

	notifyObserverFunctions() {
		for (const observerFunction of this.observerFunctions) {
			observerFunction(this.queue);
		}
	}

	enqueue(text, priority = 0) {
		const timestamp = Date.now();
		const item = { text, priority, timestamp };

		// Remove expired items (older than 5 seconds)
		this.queue = this.queue.filter(item =>
			(Date.now() - item.timestamp) < this.timeoutDuration
		);

		// Insert with priority (higher priority first, then by timestamp)
		let inserted = false;
		for (let i = 0; i < this.queue.length; i++) {
			if (item.priority > this.queue[i].priority) {
				this.queue.splice(i, 0, item);
				inserted = true;
				this.notifyObserverFunctions();
				break;
			}
		}
		if (!inserted) {
			this.queue.push(item);
			this.notifyObserverFunctions();
		}

		log(`SpeechQueue: Enqueued "${text}" with priority ${priority}. Queue length: ${this.queue.length}`);
	}

	dequeue() {
		// Remove expired items first
		this.queue = this.queue.filter(item =>
			(Date.now() - item.timestamp) < this.timeoutDuration
		);

		if (this.queue.length > 0) {
			const item = this.queue.shift();
			log(`SpeechQueue: Dequeued "${item.text}". Queue length: ${this.queue.length}`);
			this.notifyObserverFunctions();
			return item;
		}
		return null;
	}

	isEmpty() {
		// Clean expired items
		this.queue = this.queue.filter(item =>
			(Date.now() - item.timestamp) < this.timeoutDuration
		);
		return this.queue.length === 0;
	}

	clear() {
		this.queue = [];
		this.notifyObserverFunctions();
		log("SpeechQueue: Cleared queue");
	}

	size() {
		// Clean expired items
		this.queue = this.queue.filter(item =>
			(Date.now() - item.timestamp) < this.timeoutDuration
		);
		return this.queue.length;
	}
}

class SpeechSynthesisManager {
	constructor() {
		this.synth = window.speechSynthesis;
		this.language = "pt-BR"; // Default language
		this.voices = [];
		this.filteredVoices = [];
		this.rate = 1;
		this.pitch = 1;
		this.voice = null;
		this.speechQueue = new SpeechQueue();
		this.isCurrentlySpeaking = false;
		this.queueTimer = null;
		this.independentQueueTimerInterval = setupParams.independentQueueTimerInterval; // Add this line
		this.loadVoices();
		this.startQueueTimer();
	}

	async getSpeechVoices() {
		return new Promise((resolve) => {
			// Check if voices are already loaded
			let voices = this.synth.getVoices();
			if (voices.length > 0) {
				resolve(voices);
				return;
			}

			// if not, wait for voices to be loaded
			window.speechSynthesis.onvoiceschanged = () => {
				voices = this.synth.getVoices();
				resolve(voices);
			};
		});
	}

	async loadVoices() {
		try {
			const availableVoices = await this.getSpeechVoices();

			// You can now use the 'voices' array to populate a dropdown, select a specific voice, etc.
			if (availableVoices.length > 0) {
				this.voices = availableVoices;
				this.filteredVoices = this.voices.filter((voice) =>
					voice.lang.startsWith(this.language),
				);
				if (this.filteredVoices.length > 0) {
					this.voice = this.filteredVoices[0]; // Default to first voice in filtered list
				}
			} else {
				warn(
					"(SpeechSynthesisManager) No voices available for selected language:",
					this.language,
				);
			}
		} catch (error) {
			console.error("(SpeechSynthesisManager) Error loading voices:", error);
		}
	}

	setLanguage(selectedLanguage) {
		this.language = selectedLanguage;
		this.loadVoices();
		this.filteredVoices = this.voices.filter((voice) =>
			voice.lang.startsWith(this.language),
		);
		if (this.filteredVoices.length > 0) {
			this.voice = this.filteredVoices[0]; // Default to first voice in filtered list
		}
	}

	setSelectedVoiceIndex(index) {
		//TODO: Para usar com UI
	}

	speak(text, priority = 0) {
		log("(SpeechSynthesisManager) Queuing text for speech:", text);

		if (!text || text.trim() === "") {
			warn("(SpeechSynthesisManager) No text provided to speak.");
			return;
		}
		// Add to queue with priority
		this.speechQueue.enqueue(text, priority);

		// Process queue if not currently speaking
		if (!this.isCurrentlySpeaking) {
			log("(SpeechSynthesisManager) Not currently speaking, processing queue...");
			this.processQueue();
		}
	}

	startQueueTimer() {
		this.stopQueueTimer();
		
		// Fix: Use the properly defined interval
		this.queueTimer = setInterval(() => {
			this.processQueue();
		}, this.independentQueueTimerInterval);

		log(`(SpeechSynthesisManager) Queue timer started (${this.independentQueueTimerInterval/1000}s interval)`);
	}

	stopQueueTimer() {
		if (this.queueTimer) {
			clearInterval(this.queueTimer);
			this.queueTimer = null;
			log("(SpeechSynthesisManager) Queue timer stopped");
		}
	}

	processQueue() {
		log("(SpeechSynthesisManager) Processing speech queue...");
		
		// Enhanced protection against concurrent execution
		if (this.isCurrentlySpeaking || this.speechQueue.isEmpty()) {
			return;
		}

		const item = this.speechQueue.dequeue();
		if (!item) {
			return;
		}

		this.isCurrentlySpeaking = true;
		const utterance = new SpeechSynthesisUtterance(item.text);
		utterance.voice = this.voice;
		utterance.rate = this.rate;
		utterance.pitch = this.pitch;

		log(`Speaking with priority ${item.priority}: "${item.text}"`);

		utterance.onend = () => {
			log("(SpeechSynthesisManager - utterance.onend) Speech synthesis finished.");
			this.isCurrentlySpeaking = false;
			// Remove setTimeout to rely only on timer-based processing
			// This eliminates one source of concurrent calls
		};

		utterance.onerror = (event) => {
			log("(SpeechSynthesisManager - utterance.onerror) Speech synthesis error:", event.error);
			this.isCurrentlySpeaking = false;
			// Remove setTimeout here too
		};

		this.synth.speak(utterance);
	}

	pause() {
		if (this.synth.speaking) {
			this.synth.pause();
		}
	}

	resume() {
		if (this.synth.paused) {
			this.synth.resume();
		}
	}

	stop() {
		if (this.synth.speaking || this.synth.paused) {
			this.synth.cancel();
		}
		this.speechQueue.clear();
		this.isCurrentlySpeaking = false;
		this.stopQueueTimer();
		this.startQueueTimer(); // Restart the timer after stopping
	}

	toString() {
		return `${this.constructor.name}: Language=${this.language}, Rate=${this.rate}, Pitch=${this.pitch}, Voice=${this.voice ? this.voice.name : "N/A"}`;
	}
}

class HtmlSpeechSynthesisDisplayer {
	constructor(document, elements) {
		this.document = document;
		this.elements = elements;
		this.speechManager = new SpeechSynthesisManager();
		this.init();
		Object.freeze(this); // Prevent further modification
	}
	//
	// Initialize the app
	init() {
		// Some browsers need this event to load voices
		// DOM elements
		this.textInput = this.document.getElementById(this.elements.textInputId);
		this.speakBtn = this.document.getElementById(this.elements.speakBtnId);
		this.pauseBtn = document.getElementById(this.elements.pauseBtnId);
		this.resumeBtn = document.getElementById(this.elements.resumeBtnId);
		this.stopBtn = document.getElementById(this.elements.stopBtnId);
		this.voiceSelect = document.getElementById(this.elements.voiceSelectId);
		this.languageSelect = document.getElementById(
			this.elements.languageSelectId,
		);
		this.rateInput = document.getElementById(this.elements.rateInputId);
		this.pitchInput = document.getElementById(this.elements.pitchInputId);
		this.rateValue = document.getElementById(this.elements.rateValueId);
		this.pitchValue = document.getElementById(this.elements.pitchValueId);

		// Set up event listeners
		if (this.speakBtn) {
			this.speakBtn.addEventListener("click", this.speak);
		}
		if (this.pauseBtn) {
			this.pauseBtn.addEventListener("click", this.pauseSpeech);
		}
		if (this.resumeBtn) {
			this.resumeBtn.addEventListener("click", this.resumeSpeech);
		}
		if (this.stopBtn) {
			this.stopBtn.addEventListener("click", this.stopSpeech);
		}
		if (this.languageSelect) {
			this.languageSelect.addEventListener("change", this.updateVoices);
		}
		if (this.voiceSelect) {
			this.voiceSelect.addEventListener("change", () => {
				this.speechManager.selectedVoiceIndex(this.voiceSelect.value);
				this.updateVoices();
			});
		}
		if (this.rateInput) {
			this.rateInput.addEventListener("input", this.updateRate);
		}
		if (this.pitchInput) {
			this.pitchInput.addEventListener("input", this.updatePitch);
		}

		this.updateVoices();
	}
	// Load available voices
	updateVoices() {
		//this.speechManager.setLanguage(this.languageSelect.value);

		// Populate voice dropdown
		if (this.voiceSelect) {
			this.voiceSelect.innerHTML = "";
		}
		let filteredVoices = this.speechManager.filteredVoices;
		if (filteredVoices.length > 0) {
			filteredVoices.forEach((voice, index) => {
				const option = document.createElement("option");
				option.value = index;
				option.textContent = `${voice.name} (${voice.lang})`;
				if (this.voiceSelect) {
					this.voiceSelect.appendChild(option);
				}
			});
		} else {
			const option = document.createElement("option");
			option.textContent = "No voices available for selected language";
			if (this.voiceSelect) {
				this.voiceSelect.appendChild(option);
			}
			warn("No voices available for language:", this.speechManager.language);
		}
	}

	updateRate() {
		const rate = rateInput.value;
		this.speechManager.rate = rate;
		this.rateValue.textContent = value;
	}

	updatePitch(pitch) {
		this.speechManager.pitch = pitch;
		pitchValue.textContent = pitchInput.value;
	}

	speak(textToSpeak = null, priority = 0) {
		let text = textToSpeak;

		// If no text provided, get from text input
		if (!text && this.textInput && this.textInput.value) {
			text = this.textInput.value.trim();
		}

		if (!text || text === "") {
			return;
		}

		// For new functionality, add to queue instead of stopping current speech
		this.speechManager.speak(text, priority);
	}
	// Speak function
	speak2(textToBeSpoken, textAlert) {
		// Set selected voice
		const selectedVoiceIndex = voiceSelect.value;
		if (selectedVoiceIndex && filteredVoices[selectedVoiceIndex]) {
			currentUtterance.voice = filteredVoices[selectedVoiceIndex];
		}

		// Set speech parameters
		currentUtterance.rate = parseFloat(rateInput.value);
		currentUtterance.pitch = parseFloat(pitchInput.value);
		currentUtterance.volume = 1;

		// Event listeners
		currentUtterance.onstart = function () {
			speakBtn.disabled = true;
			pauseBtn.disabled = false;
			stopBtn.disabled = false;
		};

		currentUtterance.onend = function () {
			speakBtn.disabled = false;
			pauseBtn.disabled = true;
			resumeBtn.disabled = true;
			stopBtn.disabled = true;
			currentUtterance = null;
		};

		currentUtterance.onpause = function () {
			pauseBtn.disabled = true;
			resumeBtn.disabled = false;
		};

		currentUtterance.onresume = function () {
			pauseBtn.disabled = false;
			resumeBtn.disabled = true;
		};

		currentUtterance.onerror = function (event) {
			console.error("Speech error:", event.error);
			speakBtn.disabled = false;
			pauseBtn.disabled = true;
			resumeBtn.disabled = true;
			stopBtn.disabled = true;
			currentUtterance = null;
		};

		window.speechSynthesis.cancel();
		window.speechSynthesis.speak(currentUtterance);
	}

	pause() {
		this.speechManager.pause();
	}

	resume() {
		this.speechManager.resume();
	}

	stop() {
		this.speechManager.stop();
	}

	getFullAddress(addressExtractor) {
		const enderecoPadronizado = addressExtractor.enderecoPadronizado;
		const parts = [];
		if (enderecoPadronizado.logradouro) {
			parts.push(enderecoPadronizado.logradouroCompleto());
		}
		if (enderecoPadronizado.bairro) {
			parts.push(enderecoPadronizado.bairroCompleto());
		}
		if (enderecoPadronizado.municipio) {
			parts.push(enderecoPadronizado.municipio);
		}
		return parts.join(", ");
	}

	getLogradouro(addressExtractor) {
		const enderecoPadronizado = addressExtractor.enderecoPadronizado;
		return enderecoPadronizado.getLogradouro();
	}

	getBairro(addressExtractor) {
		const enderecoPadronizado = addressExtractor.enderecoPadronizado;
		return enderecoPadronizado.bairro || "Bairro não identificado";
	}

	getMunicipio(addressExtractor) {
		const enderecoPadronizado = addressExtractor.enderecoPadronizado;
		return enderecoPadronizado.municipio || "Município não identificado";
	}

	buildTextToSpeech(currentAddress) {
		const addressExtractor = new AddressDataExtractor(currentAddress);
		const textToBeSpoken = `Você está em ${this.getFullAddress(addressExtractor)}.`;
		return textToBeSpoken;
	}

	buildTextToSpeechLogradouro(currentAddress) {
		let addressExtractor = new AddressDataExtractor(currentAddress);
		let textToBeSpoken = this.getLogradouro(addressExtractor);
		return textToBeSpoken;
	}

	buildTextToSpeechBairro(currentAddress) {
		let addressExtractor = new AddressDataExtractor(currentAddress);
		let textToBeSpoken = this.getBairro(addressExtractor);
		return textToBeSpoken;
	}

	buildTextToSpeechMunicipio(currentAddress) {
		let addressExtractor = new AddressDataExtractor(currentAddress);
		let textToBeSpoken = this.getMunicipio(addressExtractor);
		return textToBeSpoken;
	}

	/**
	 * Immediately sends speech for critical location changes without validation conditions
	 * This ensures street/neighbourhood/municipality changes are announced immediately
	 * @param {Object} currentAddress - Current address object
	 * @param {string} changeEvent - Type of change event
	 * @param {number} priority - Speech priority
	 */
	speakLocationChangeImmediately(currentAddress, changeEvent, priority) {
		log(`(HtmlSpeechSynthesisDisplayer) Immediate speech for ${changeEvent} - bypassing validation conditions...`);
		
		let textToBeSpoken = "";
		
		// Build text based on change event type - no validation conditions
		if (changeEvent === "MunicipioChanged") {
			textToBeSpoken = this.buildTextToSpeechMunicipio(currentAddress) || "Município alterado";
		} else if (changeEvent === "BairroChanged") {
			textToBeSpoken = this.buildTextToSpeechBairro(currentAddress) || "Bairro alterado";
		} else if (changeEvent === "LogradouroChanged") {
			textToBeSpoken = this.buildTextToSpeechLogradouro(currentAddress) || "Rua alterada";
		}
		
		// Force speech immediately - no validation conditions
		if (textToBeSpoken) {
			// Update text input if available
			if (this.textInput) {
				this.textInput.value = textToBeSpoken;
			}
			
			// Force immediate queue and processing - bypass normal speak method validations
			log(`(HtmlSpeechSynthesisDisplayer) Force queueing immediate speech: "${textToBeSpoken}" with priority ${priority}`);
			this.speechManager.speechQueue.enqueue(textToBeSpoken, priority);
			
			// Force immediate processing regardless of current speaking state
			this.speechManager.processQueue();
		} else {
			// Even if no text could be built, announce the change
			const fallbackText = changeEvent === "MunicipioChanged" ? "Município alterado" :
								changeEvent === "BairroChanged" ? "Bairro alterado" : "Rua alterada";
			log(`(HtmlSpeechSynthesisDisplayer) Using fallback text for immediate speech: "${fallbackText}"`);
			this.speechManager.speechQueue.enqueue(fallbackText, priority);
			this.speechManager.processQueue();
		}
	}

	update(currentAddress, enderecoPadronizadoOrEvent, loading, error) {
		log("(HtmlSpeechSynthesisDisplayer) Updating speech synthesis display...");
		log("currentAddress:", currentAddress);
		log("enderecoPadronizadoOrEvent:", enderecoPadronizadoOrEvent);

		// Check for critical location changes that need immediate speech
		const criticalLocationChanges = ["MunicipioChanged", "BairroChanged", "LogradouroChanged"];
		if (criticalLocationChanges.includes(enderecoPadronizadoOrEvent)) {
			// For critical location changes, send to speech queue immediately without validation conditions
			const priority = enderecoPadronizadoOrEvent === "MunicipioChanged" ? 2 :
							enderecoPadronizadoOrEvent === "BairroChanged" ? 1 : 0;
			
			this.speakLocationChangeImmediately(currentAddress, enderecoPadronizadoOrEvent, priority);
			return; // Return early for immediate speech handling
		}

		// Early return if no current address (only for non-critical updates)
		if (!currentAddress) {
			return;
		}

		let textToBeSpoken = "";
		let priority = 0;

		// Handle normal updates (non-location changes)
		log("(HtmlSpeechSynthesisDisplayer) Normal address update, speaking full address...");
		textToBeSpoken = this.buildTextToSpeech(currentAddress);
		priority = 0; // Lowest priority for full address updates
		log("textToBeSpoken:", textToBeSpoken);

		// Common operations for normal cases
		if (textToBeSpoken) {
			this.textInput.value = textToBeSpoken;
			this.speak(textToBeSpoken, priority);
		}
	}

	toString() {
		return `${this.constructor.name}: ${this.elements.textInputId}`;
	}
}

class HtmlText {
	constructor(document, element) {
		this.document = document;
		this.element = element;
		Object.freeze(this); // Prevent further modification
	}

	updateDisplay(text) {
		if (this.element) {
			this.element.textContent = text;
		}
	}

	update(currentPosition, posEvent) {
		console.log("(HtmlText) update", currentPosition, posEvent);
		if (!currentPosition) {
			this.updateDisplay("No position data available.");
			return;
		}
		const ts = new Date(currentPosition.timestamp);
		const tsStr = ts.toLocaleString();
		const posEventStr = posEvent ? `Event: ${posEvent}` : "";
		const coords = currentPosition.coords;
		if (coords) {
			const lat = coords.latitude.toFixed(6);
			const lon = coords.longitude.toFixed(6);
			const alt = coords.altitude ? coords.altitude.toFixed(2) + " m" : "N/A";
			const acc = coords.accuracy ? Math.round(coords.accuracy) + " m" : "N/A";
			const head = coords.heading ? coords.heading.toFixed(2) + "°" : "N/A";
			const speed = coords.speed ? coords.speed.toFixed(2) + " m/s" : "N/A";

			let text = posEventStr
				? `${posEventStr} | Lat: ${lat}, Lon: ${lon}, Alt: ${alt}, Acc: ${acc}, Head: ${head}, Speed: ${speed}`
				: `Lat: ${lat}, Lon: ${lon}, Alt: ${alt}, Acc: ${acc}, Head: ${head}, Speed: ${speed}`;
			text = (text || "") + ", Timestamp: " + (tsStr || "");
			this.updateDisplay(text);
		}
	}

	toString() {
		return `${this.constructor.name}: ${this.element.id}`;
	}
}

// Export for Node.js testing - only when in Node.js environment
if (typeof module !== "undefined" && module.exports) {
	module.exports = {
		guiaVersion,
		calculateDistance,
		delay,
		log,
		warn,
		PositionManager,
		SingletonStatusManager,
		APIFetcher,
		ReverseGeocoder,
		getAddressType,
		GeolocationService,
		WebGeocodingManager,
		Chronometer,
		HTMLPositionDisplayer,
		HTMLAddressDisplayer,
		BrazilianStandardAddress,
		AddressDataExtractor,
		SpeechQueue,
		SpeechSynthesisManager,
		HtmlSpeechSynthesisDisplayer,
		HtmlText,
	};
}
