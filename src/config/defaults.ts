/**
 * Default configuration for Guia Turístico application.
 * 
 * All values are immutable to prevent accidental modification.
 * Configuration follows referential transparency principles.
 * 
 * @module config/defaults
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */

// Version Information
export const APP_VERSION = {
	major: 0,
	minor: 12,
	patch: 7,
	prerelease: "alpha", // Indicates unstable development
	toString: function () {
		return `${this.major}.${this.minor}.${this.patch}-${this.prerelease}`;
	},
};

/**
 * Application name displayed in UI and logs.
 * @constant {string}
 */
export const APP_NAME = "Ondeestou";

/**
 * Application author name.
 * @constant {string}
 */
export const APP_AUTHOR = "Marcelo Pereira Barbosa";

// API Configuration
/**
 * CORS proxy URL for development (optional).
 * Set to null to use direct API access.
 * 
 * For local development with CORS issues, use one of:
 * - null (default - direct access, requires HTTPS or browser extension)
 * - 'https://api.allorigins.win/raw?url=' (public proxy)
 * - Your own proxy server URL
 * 
 * @constant {string|null}
 * @since 0.9.0-alpha
 */
export const CORS_PROXY = null;

/**
 * Enable CORS proxy fallback on error.
 * If true, will automatically try CORS proxy if direct request fails.
 * Only use in development.
 * 
 * @constant {boolean}
 * @since 0.9.0-alpha
 */
export const ENABLE_CORS_FALLBACK = true;  // ✅ ENABLED FOR TESTING

/**
 * Nominatim API base URL.
 * @constant {string}
 */
export const NOMINATIM_API_BASE = 'https://nominatim.openstreetmap.org';

// Timing Configuration
/** Position tracking interval in milliseconds */
export const TRACKING_INTERVAL = 50000;

/** Minimum distance change in meters to trigger position update */
export const MINIMUM_DISTANCE_CHANGE = 20;

/** 
 * Minimum time interval in milliseconds to force position update regardless of distance.
 * Used in conjunction with MINIMUM_DISTANCE_CHANGE to ensure updates occur even during
 * slow movement. Position updates if EITHER condition is met:
 * - Distance > MINIMUM_DISTANCE_CHANGE (20 meters) OR
 * - Time > MINIMUM_TIME_CHANGE (30 seconds)
 * 
 * This ensures neighborhood cards update even when driving slowly.
 * @since 0.9.0-alpha
 */
export const MINIMUM_TIME_CHANGE = 30000; // 30 seconds

/**
 * Minimum interval in milliseconds between geolocation API fetches (throttle window).
 * Applies to both `getSingleLocationUpdate()` and the `watchCurrentLocation()` callback.
 * Prevents excessive GPS hardware activations and downstream processing.
 * @since 0.12.7-alpha
 */
export const GEOLOCATION_THROTTLE_INTERVAL = 5000; // 5 seconds

/**
 * Reduced throttle interval (ms) applied while any address field has a pending confirmation.
 * GeolocationService switches from GEOLOCATION_THROTTLE_INTERVAL to this value so that
 * confirming reads arrive faster, reducing display lag for legitimate address changes.
 * Restores to GEOLOCATION_THROTTLE_INTERVAL once all confirmation buffers settle.
 *
 * At typical city driving speeds (≥20 km/h, 5s normal throttle):
 *   - Normal confirmation lag (5s × 3): ~10s
 *   - Fast confirmation lag (2s × 3):  ~4s — 60% improvement
 *
 * @since 0.12.8-alpha
 */
export const GEOLOCATION_THROTTLE_CONFIRMATION_INTERVAL = 2000; // 2 seconds

/**
 * Number of consecutive identical reverse-geocoding results required before a
 * `logradouro` (street name) change is published to the application.
 * Mitigates GPS intersection jitter: a ~50 m error margin can transiently place
 * the position on an adjacent street, producing a false address-change event.
 * @since 0.12.8-alpha
 */
export const LOGRADOURO_CONFIRMATION_COUNT = 3;

/**
 * Number of consecutive identical reverse-geocoding results required before a
 * `bairro` (neighbourhood) change is published to the application.
 * @since 0.12.8-alpha
 */
export const BAIRRO_CONFIRMATION_COUNT = 3;

/**
 * Number of consecutive identical reverse-geocoding results required before a
 * `municipio` (municipality/city) change is published to the application.
 * @since 0.12.8-alpha
 */
export const MUNICIPIO_CONFIRMATION_COUNT = 3;

/** Speech queue timer interval in milliseconds */
export const QUEUE_TIMER_INTERVAL = 5000;

// Location Configuration
/** Default text for unclassified reference places */
export const NO_REFERENCE_PLACE = "Não classificado";

/** Event name for address fetch completion */
export const ADDRESS_FETCHED_EVENT = "Address fetched";

/** Event name for geocoding errors */
export const GEOCODING_ERROR_EVENT = "Geocoding error";

// Portuguese UI Messages (v0.9.0+)
/** IBGE/SIDRA loading message */
export const IBGE_LOADING_MESSAGE = "Carregando dados do IBGE...";

/** IBGE/SIDRA error message prefix */
export const IBGE_ERROR_MESSAGE = "Erro ao carregar dados do IBGE";

/** IBGE/SIDRA temporary unavailability message */
export const IBGE_UNAVAILABLE_MESSAGE = "Dados do IBGE temporariamente indisponíveis";

/** Valid OSM reference place classes (geographic points, commercial locations, facilities, transport) */
export const VALID_REF_PLACE_CLASSES = Object.freeze([
	"place",    // Geographic locations (cities, towns, neighborhoods)
	"shop",     // Commercial establishments
	"amenity",  // Public facilities (restaurants, banks, schools)
	"railway",   // Railway stations and transport hubs
	"building"  // Buildings
]);

// Device-Specific Accuracy Thresholds
/** Accuracy thresholds for mobile devices (GPS) - stricter thresholds */
export const MOBILE_ACCURACY_THRESHOLDS = Object.freeze([
	"medium",
	"bad",
	"very bad"
]);

/** Accuracy thresholds for desktop devices (WiFi/IP) - more lenient thresholds */
export const DESKTOP_ACCURACY_THRESHOLDS = Object.freeze([
	"bad",
	"very bad"
]);

// Browser Geolocation API Configuration
/** Browser Geolocation API options for desktop (WiFi/IP-based location, fast) */
export const GEOLOCATION_OPTIONS = Object.freeze({
	enableHighAccuracy: true,
	timeout: 20000, // 20 seconds
	maximumAge: 0 // Do not use a cached position
});

/**
 * Browser Geolocation API options optimized for mobile devices.
 * 
 * Mobile GPS cold starts can take 30–60 seconds (vs near-instant WiFi/IP on desktop).
 * A longer timeout prevents silent failures on Android Chrome.
 * A non-zero maximumAge reduces GPS restarts when the user hasn't moved far.
 * 
 * @constant {Object}
 * @since 0.12.7-alpha
 */
export const MOBILE_GEOLOCATION_OPTIONS = Object.freeze({
	enableHighAccuracy: true,
	timeout: 40000,   // 40 seconds — accommodates GPS cold start on Android
	maximumAge: 60000 // Allow 1-minute cached position to reduce GPS restarts
});

// API Configuration
/** OpenStreetMap Nominatim API base URL */
export const OSM_BASE_URL = "https://nominatim.openstreetmap.org/reverse?format=json";

/**
 * Creates a complete configuration object with defaults.
 * Returns a new object (immutable pattern).
 * 
 * @returns {Object} Configuration object
 * @example
 * const config = createDefaultConfig();
 * log(config.trackingInterval); // 50000
 */
export const createDefaultConfig = () => ({
	trackingInterval: TRACKING_INTERVAL,
	minimumDistanceChange: MINIMUM_DISTANCE_CHANGE,
	minimumTimeChange: MINIMUM_TIME_CHANGE,
	independentQueueTimerInterval: QUEUE_TIMER_INTERVAL,
	noReferencePlace: NO_REFERENCE_PLACE,
	validRefPlaceClasses: [...VALID_REF_PLACE_CLASSES],
	mobileNotAcceptedAccuracy: [...MOBILE_ACCURACY_THRESHOLDS],
	desktopNotAcceptedAccuracy: [...DESKTOP_ACCURACY_THRESHOLDS],
	notAcceptedAccuracy: null as string[] | null, // Will be set dynamically based on device type
	geolocationOptions: { ...GEOLOCATION_OPTIONS },
	openstreetmapBaseUrl: OSM_BASE_URL
});
