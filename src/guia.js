// Semantic Versioning 2.0.0 - see https://semver.org/
// Version object for unstable development status
const guiaVersion = {
	major: 0,
	minor: 7,
	patch: 1,
	prerelease: "alpha", // Indicates unstable development
	toString: function () {
		return `${this.major}.${this.minor}.${this.patch}-${this.prerelease}`;
	},
};

const guiaName = "Guia Turístico em Movimento";
const guiaAuthor = "Marcelo Pereira Barbosa";
const setupParams = {
	logradouroChangeTimer: 1000, // milliseconds
	trackingInterval: 60000, // milliseconds
	openstreetmapBaseUrl:
		"https://nominatim.openstreetmap.org/reverse?format=json",
};

const getOpenStreetMapUrl = (latitude, longitude) =>
	`${setupParams.openstreetmapBaseUrl}&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

// Haversine distance calculation between two coordinates
//TODO: #68 Mover para uma biblioteca utilitarian
//TODO: #68 Mover para uma biblioteca utilitarian
function calculateDistance(lat1, lon1, lat2, lon2) {
	const R = 6371e3; // Earth radius in meters
	const φ1 = (lat1 * Math.PI) / 180;
	const φ2 = (lat2 * Math.PI) / 180;
	const Δφ = ((lat2 - lat1) * Math.PI) / 180;
	const Δλ = ((lon2 - lon1) * Math.PI) / 180;

	const a =
		Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c;
}

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

class PositionManager {
	static instance = null;
	static strCurrPosUpdate = "PositionManager updated";
	static strCurrPosNotUpdate = "PositionManager not updated";

	static getInstance(position) {
		if (!PositionManager.instance) {
			PositionManager.instance = new PositionManager(position);
		} else if (position) {
			PositionManager.instance.update(position);
		}
		return PositionManager.instance;
	}

	constructor(position) {
		this.observers = [];
		this.accuracyQuality = null;
		this.tsPosicaoAtual = null;
		if (position) {
			this.update(position);
		}
	}

	subscribe(observer) {
		if (observer) {
			this.observers.push(observer);
		}
	}

	unsubscribe(observer) {
		this.observers = this.observers.filter((o) => o !== observer);
	}

	notifyObservers(posEvent) {
		this.observers.forEach((observer) => {
			observer.update(this, posEvent);
		});
	}

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

	calculateAccuracyQuality() {
		return getAccuracyQuality(this.accuracy);
	}

	set accuracy(value) {
		this._accuracy = value;
		this.accuracyQuality = PositionManager.getAccuracyQuality(value);
	}

	update(position) {
		let bUpdateCurrPos = true;
		let error = null;

		// Verifica se a posição é válida
		if (!position || !position.timestamp) {
			warn("(PositionManager) Invalid position data:", position);
			return;
		}
		const tempoDecorrido = position.timestamp - (this.tsPosicaoAtual || 0);
		if (tempoDecorrido < setupParams.trackingInterval) {
			bUpdateCurrPos = false;
			error = {
				name: "ElapseTimeError",
				message: "Less than 1 minute since last update",
			};
			warn("(PositionManager) Less than 1 minute since last update.");
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
			console.log(
				"(PositionManager) Distance from last position:",
				distance,
				"meters",
			);
			if (distance < 20) {
				console.log(
					"(PositionManager) Position change is less than 20 meters. Not updating.",
				);
				return;
			}
		}
		this.lastPosition = position;

		if (!bUpdateCurrPos) {
			this.notifyObservers(PositionManager.strCurrPosNotUpdate, null, error);
			console.log("(PositionManager) PositionManager not updated:", this);
			return;
		}

		// Atualiza a posição apenas se tiver passado mais de 1 minuto
		console.log("(PositionManager) Updating PositionManager...");
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
		this.tsPosicaoAtual = position.timestamp;
		console.log("(PositionManager) PositionManager updated:", this);
		this.notifyObservers(PositionManager.strCurrPosUpdate, null, error);
		console.log("(PositionManager) Notified observers.");
	}

	toString() {
		return `${this.constructor.name}: ${this.latitude}, ${this.longitude}, ${this.accuracyQuality}, ${this.altitude}, ${this.speed}, ${this.heading}, ${this.timestamp}`;
	}

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
			log("(APIFetcher) Notifying observer:", observer);
			log("First param:", this.firstUpdateParam());
			log("Second param:", this.secondUpdateParam());
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
	var addressTypeDescr;

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
		console.log(
			`(GeolocationService) observer ${observer} subscribing ${this}`,
		);
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
		var element = this.locationResult;
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
		console.log("(GeolocationService) Getting current location...");
		this.checkGeolocation();
		return new Promise(async function (resolve, reject) {
			// Get current position
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					SingletonStatusManager.getInstance().setGettingLocation(true);

					console.log("(GeolocationService) Position obtained:", position);
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
		console.log("(GeolocationService) watchPosition callback");
		SingletonStatusManager.getInstance().setGettingLocation(true);

		if (findRestaurantsBtn) {
			findRestaurantsBtn.disabled = true;
		}
		if (cityStatsBtn) {
			cityStatsBtn.disabled = true;
		}
		console.log("(GeolocationService) Position obtained:", position);
		this.currentPosition = position;
		this.currentCoords = position.coords;
		console.log("(GeolocationService) Notifying observers...");
		this.notifyObservers();
	}

	async watchCurrentLocation() {
		console.log("(GeolocationService) watchCurrentLocation");
		console.log("(GeolocationService) Getting current location...");
		this.checkGeolocation();
		return new Promise(async function (resolve, reject) {
			// Get current position
			navigator.geolocation.watchPosition(
				async (position) => {
					console.log("(GeolocationService) watchPosition callback");

					SingletonStatusManager.getInstance().setGettingLocation(true);

					console.log("(GeolocationService) Position obtained:", position);
					var currentPos = PositionManager.getInstance(position);
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
		console.log("(GeolocationService) Getting single location update...");
		if (this.locationResult) {
			this.locationResult.innerHTML =
				'<p class="loading">Buscando a sua localização...</p>';
			console.log("(GeolocationService) locationResult:", this.locationResult);
		}

		SingletonStatusManager.getInstance().setGettingLocation(true);

		return this.getCurrentLocation().then((position) => {
			console.log("(GeolocationService) Position obtained:", position);
			this.currentPosition = position;
			this.currentCoords = position.coords;
			this.notifyObservers();
			return position;
		});
	}

	async getWatchLocationUpdate() {
		console.log("(GeolocationService) getWatchLocationUpdate");
		if (this.locationResult) {
			this.locationResult.innerHTML =
				'<p class="loading">Buscando a sua localização...</p>';
			console.log("(GeolocationService) locationResult:", this.locationResult);
		}

		SingletonStatusManager.getInstance().setGettingLocation(true);

		return this.watchCurrentLocation().then((position) => {
			console.log(
				"(GeolocationService) watchPosition callback received position:",
				position,
			);
			this.currentPosition = position;
			this.currentCoords = position.coords;
			console.log("(GeolocationService) Notifying observers...");
			this.notifyObservers();
			return position;
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
		this.logradouroChangeTimer = null;

		this.initElements();

		this.geolocationService = new GeolocationService(this.locationResult);
		this.reverseGeocoder = new ReverseGeocoder();

		this.positionDisplayer = new HTMLPositionDisplayer(this.locationResult);
		this.addressDisplayer = new HTMLAddressDisplayer(this.locationResult);

		PositionManager.getInstance().subscribe(this.positionDisplayer);
		this.reverseGeocoder.subscribe(this.addressDisplayer);
	}

	initElements() {
		var chronometer = this.document.getElementById("chronometer");
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

		console.log("WebGeocodingManager initialized.");
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

		log("(WebGeocodingManager) Setting up periodic updates...");
		// Start watching position with high accuracy
		this.geolocationService.getWatchLocationUpdate().then((value) => {
			value.subscribe(this.positionDisplayer);
			value.subscribe(this.reverseGeocoder);
			//value.subscribe(this.htmlSpeechSynthesisDisplayer);
		});

		// Start logradouro change detection (30s interval)
		this.startLogradouroChangeDetection();
	}

	/**
	 * Starts the logradouro change detection timer (checks every 30 seconds)
	 */
	startLogradouroChangeDetection() {
		if (this.logradouroChangeTimer) {
			clearInterval(this.logradouroChangeTimer);
		}

		this.logradouroChangeTimer = setInterval(() => {
			this.checkLogradouroChange();
		}, setupParams.logradouroChangeTimer);
	}

	/**
	 * Stops the logradouro change detection timer
	 */
	stopLogradouroChangeDetection() {
		if (this.logradouroChangeTimer) {
			clearInterval(this.logradouroChangeTimer);
			this.logradouroChangeTimer = null;
		}
	}

	/**
	 * Checks if the logradouro has changed and notifies observers
	 */
	checkLogradouroChange() {
		try {
			if (AddressDataExtractor.hasLogradouroChanged()) {
				const changeDetails = AddressDataExtractor.getLogradouroChangeDetails();
				// Notify observers about the logradouro change
				this.notifyLogradouroChangeObservers(changeDetails);
			}
		} catch (error) {
			console.error(
				"(WebGeocodingManager) Error checking logradouro change:",
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
		for (const observer of this.observers) {
			if (typeof observer.update === "function") {
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

	rese() {
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
			var pattern = /^BR-(\w{2})$/;
			var match = address["ISO3166-2-lvl4"].match(pattern);
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

				// Reset change notification flag when new address is cached
				// This allows detection of new changes after cache updates
				AddressDataExtractor.lastNotifiedChangeSignature = null;
			}

			return extractor.enderecoPadronizado;
		}
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
			errorMessage = "The request to get user location timed out.";
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
				break;
			}
		}
		if (!inserted) {
			this.queue.push(item);
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
		log("Initializing speech manager...");
		this.synth = window.speechSynthesis;
		this.language = "pt-BR"; // Default language
		this.voices = [];
		this.filteredVoices = [];
		this.rate = 1;
		this.pitch = 1;
		this.voice = null;
		this.speechQueue = new SpeechQueue();
		this.isCurrentlySpeaking = false;
		this.loadVoices();
	}

	async getSpeechVoices() {
		return new Promise((resolve) => {
			// Check if voices are already loaded
			var voices = this.synth.getVoices();
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
			log("(SpeechSynthesisManager) Voices loaded:", availableVoices);

			// You can now use the 'voices' array to populate a dropdown, select a specific voice, etc.
			if (availableVoices.length > 0) {
				this.voices = availableVoices;
				this.filteredVoices = this.voices.filter((voice) =>
					voice.lang.startsWith(this.language),
				);
				log("(SpeechSynthesisManager) Filtered voices:", this.filteredVoices);
				log("(SpeechSynthesisManager) Filtered voices:", this.filteredVoices);
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
		log("(SpeechSynthesisManager) Setting language to:", this.language);
		log("(SpeechSynthesisManager) Loading voices...");
		this.loadVoices();
		this.filteredVoices = this.voices.filter((voice) =>
			voice.lang.startsWith(this.language),
		);
		if (this.filteredVoices.length > 0) {
			this.voice = this.filteredVoices[0]; // Default to first voice in filtered list
		}
		log("Filtered voices:", this.filteredVoices);
	}

	setSelectectedVoiceIndex(index) {
		log("Setting selected voice index to:", index);
	}

	speak(text, priority = 0) {
		// Add to queue with priority
		this.speechQueue.enqueue(text, priority);
		
		// Process queue if not currently speaking
		if (!this.isCurrentlySpeaking) {
			this.processQueue();
		}
	}

	processQueue() {
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
		
		log("Speaking with voice:", this.voice);
		log(`Speaking with priority ${item.priority}: "${item.text}"`);
		
		utterance.onend = () => {
			log("Spoke with voice:", this.voice);
			log("Speech synthesis finished.");
			this.isCurrentlySpeaking = false;
			// Process next item in queue
			setTimeout(() => this.processQueue(), 100);
		};
		
		utterance.onerror = (event) => {
			log("Speech synthesis error:", event.error);
			this.isCurrentlySpeaking = false;
			// Process next item in queue even on error
			setTimeout(() => this.processQueue(), 100);
		};
		
		log("Starting speech synthesis...");
		this.synth.speak(utterance);
		log("Speech synthesis started.");
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
	}

	toString() {
		return `${this.constructor.name}: Language=${this.language}, Rate=${this.rate}, Pitch=${this.pitch}, Voice=${this.voice ? this.voice.name : "N/A"}`;
	}
}

class HtmlSpeechSynthesisDisplayer {
	constructor(document, elements) {
		log("Initializing HtmlSpeechSynthesisDisplayer...");
		this.document = document;
		this.elements = elements;
		log("Initializing speech manager...");
		this.speechManager = new SpeechSynthesisManager();
		log("Speech manager initialized.");
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
		log("(HtmlSpeechSynthesisDisplayer) Voices cleared.");
		var filteredVoices = this.speechManager.filteredVoices;
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
			warn("No voices available for language:", this.speechManager.language);
		}
	}

	updateRate() {
		var rate = rateInput.value;
		this.speechManager.rate = rate;
		this.rateValue.textContent = value;
	}

	updatePitch(pitch) {
		this.speechManager.pitch = pitch;
		pitchValue.textContent = pitchInput.value;
	}

	speak(textToSpeak = null, priority = 0) {
		var text = textToSpeak;
		
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
		console.log("selectedVoiceIndex:", selectedVoiceIndex);
		console.log("voices: ", filteredVoices);
		if (selectedVoiceIndex && filteredVoices[selectedVoiceIndex]) {
			console.log("voice:", filteredVoices[selectedVoiceIndex]);
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

		console.log("language:", currentUtterance.lang);
		console.log("voice:", currentUtterance.voice);
		console.log("rate:", currentUtterance.rate);
		console.log("pitch:", currentUtterance.pitch);

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
		var enderecoPadronizado = addressExtractor.enderecoPadronizado;
		var parts = [];
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
		var enderecoPadronizado = addressExtractor.enderecoPadronizado;
		return enderecoPadronizado.getLogradouro();
	}

	buildTextToSpeech(currentAddress) {
		var addressExtractor = new AddressDataExtractor(currentAddress);
		var textToBeSpoken = `Você está em ${this.getFullAddress(addressExtractor)}.`;
		return textToBeSpoken;
	}

	buildTextToSpeechLogradouro(currentAddress) {
		log("Building text for logradouro change...");
		let previousAddress = AddressDataExtractor.getPreviousAddress();
		log(
			"previousAddress:",
			previousAddress ? previousAddress.toString() : "N/A",
		);
		log("currentAddress:", currentAddress ? currentAddress.toString() : "N/A");
		let logradouroChanged = AddressDataExtractor.hasLogradouroChanged();
		log("logradouroChanged:", logradouroChanged);

		let addressExtractor = new AddressDataExtractor(currentAddress);
		let textToBeSpoken = this.getLogradouro(addressExtractor);
		return textToBeSpoken;
	}

	update(currentAddress, enderecoPadronizadoOrEvent, loading, error) {
		log("(HtmlSpeechSynthesisDisplayer) Updating speech synthesis display...");
		log("(HtmlSpeechSynthesisDisplayer) Updating speech synthesis display...");
		log("currentAddress:", currentAddress);
		log("enderecoPadronizadoOrEvent:", enderecoPadronizadoOrEvent);

		// Check if this is a logradouro change notification
		if (enderecoPadronizadoOrEvent === "LogradouroChanged") {
			log(
				"(HtmlSpeechSynthesisDisplayer) Logradouro change detected, speaking new location...",
			);
			log(
				"(HtmlSpeechSynthesisDisplayer) Logradouro change detected, speaking new location...",
			);
			if (currentAddress) {
				this.updateVoices();
				let textToBeSpoken = this.buildTextToSpeechLogradouro(currentAddress);
				log("textToBeSpoken for logradouro change:", textToBeSpoken);
				this.textInput.value = textToBeSpoken;
				// Higher priority for logradouro changes (priority = 1)
				this.speak(textToBeSpoken, 1);
			}
		} else if (currentAddress) {
			// Normal update from reverseGeocoder
			this.updateVoices();
			var textToBeSpoken = "";
			textToBeSpoken += this.buildTextToSpeech(currentAddress);
			log("textToBeSpoken:", textToBeSpoken);
			this.textInput.value = textToBeSpoken;
			// Normal priority for full address updates (priority = 0)
			this.speak(textToBeSpoken, 0);
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
		AddressDataExtractor,
		SpeechQueue,
		SpeechSynthesisManager,
		HtmlSpeechSynthesisDisplayer,
		HtmlText,
	};
}
