'use strict';
import { log, warn, error } from '../utils/logger.js';

/**
 * Geographic position data wrapper with convenience methods.
 * 
 * Provides an immutable wrapper around browser Geolocation API position data,
 * adding convenience methods for distance calculations and accuracy assessment.
 * 
 * @module core/GeoPosition
 * @since 0.6.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import { calculateDistance } from '../utils/distance.js';

/**
 * Represents a geographic position with enhanced methods.
 * 
 * @class
 * @immutable All instances are frozen after creation
 */
class GeoPosition {
	constructor(position) {
		// Create defensive copies to avoid sharing references with external state
		const coords = position?.coords ?? {};
		this.geolocationPosition = position ? { ...position, coords: { ...coords } } : null;
		this.coords = coords ? { ...coords } : null;
		this.latitude = coords.latitude;
		this.longitude = coords.longitude;
		this.accuracy = coords.accuracy;
		this.accuracyQuality = GeoPosition.getAccuracyQuality(
			coords.accuracy,
		);
		this.altitude = coords.altitude;
		this.altitudeAccuracy = coords.altitudeAccuracy;
		this.heading = coords.heading;
		this.speed = coords.speed;
		this.timestamp = position?.timestamp;
		Object.freeze(this); // Make the instance immutable
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
	 * log(GeoPosition.getAccuracyQuality(5));   // 'excellent'
	 * log(GeoPosition.getAccuracyQuality(25));  // 'good'
	 * log(GeoPosition.getAccuracyQuality(75));  // 'medium'
	 * log(GeoPosition.getAccuracyQuality(150)); // 'bad'
	 * log(GeoPosition.getAccuracyQuality(500)); // 'very bad'
	 * 
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates/accuracy} GeolocationCoordinates.accuracy
	 * @since 0.6.0-alpha
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
	 * log(manager.calculateAccuracyQuality()); // 'good'
	 * 
	 * @since 0.6.0-alpha
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
	 * log(`Restaurant is ${Math.round(distance)} meters away`);
	 * 
	 * @see {@link calculateDistance} - The underlying distance calculation function
	 * @since 0.6.0-alpha
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
	 * log(position.toString());
	 * // Output: "GeoPosition: -23.5505, -46.6333, good, 760, 0, 0, 1634567890123"
	 * 
	 * @since 0.6.0-alpha
	 */
	toString() {
		if (!this.latitude || !this.longitude) {
			return `${this.constructor.name}: No position data`;
		}
		return `${this.constructor.name}: ${this.latitude}, ${this.longitude}, ${this.accuracyQuality}, ${this.altitude}, ${this.speed}, ${this.heading}, ${this.timestamp}`;
	}
}

export default GeoPosition;
