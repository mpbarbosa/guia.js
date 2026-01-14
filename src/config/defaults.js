'use strict';

/**
 * Default configuration for Guia Turístico application.
 * 
 * All values are immutable to prevent accidental modification.
 * Configuration follows referential transparency principles.
 * 
 * @module config/defaults
 * @since 0.7.0-alpha
 * @author Marcelo Pereira Barbosa
 */

// Version Information
export const APP_VERSION = {
	major: 0,
	minor: 7,
	patch: 0,
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

// Timing Configuration
/** Position tracking interval in milliseconds */
export const TRACKING_INTERVAL = 50000;

/** Minimum distance change in meters to trigger position update */
export const MINIMUM_DISTANCE_CHANGE = 20;

/** Speech queue timer interval in milliseconds */
export const QUEUE_TIMER_INTERVAL = 5000;

// Location Configuration
/** Default text for unclassified reference places */
export const NO_REFERENCE_PLACE = "Não classificado";

/** Valid OSM reference place classes (geographic points, commercial locations, facilities, transport) */
export const VALID_REF_PLACE_CLASSES = Object.freeze([
	"place",    // Geographic locations (cities, towns, neighborhoods)
	"shop",     // Commercial establishments
	"amenity",  // Public facilities (restaurants, banks, schools)
	"railway"   // Railway stations and transport hubs
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
/** Browser Geolocation API options */
export const GEOLOCATION_OPTIONS = Object.freeze({
	enableHighAccuracy: true,
	timeout: 20000, // 20 seconds
	maximumAge: 0 // Do not use a cached position
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
 * console.log(config.trackingInterval); // 50000
 */
export const createDefaultConfig = () => ({
	trackingInterval: TRACKING_INTERVAL,
	minimumDistanceChange: MINIMUM_DISTANCE_CHANGE,
	independentQueueTimerInterval: QUEUE_TIMER_INTERVAL,
	noReferencePlace: NO_REFERENCE_PLACE,
	validRefPlaceClasses: [...VALID_REF_PLACE_CLASSES],
	mobileNotAcceptedAccuracy: [...MOBILE_ACCURACY_THRESHOLDS],
	desktopNotAcceptedAccuracy: [...DESKTOP_ACCURACY_THRESHOLDS],
	notAcceptedAccuracy: null, // Will be set dynamically based on device type
	geolocationOptions: { ...GEOLOCATION_OPTIONS },
	openstreetmapBaseUrl: OSM_BASE_URL
});
