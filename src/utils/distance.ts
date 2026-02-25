/**
 * Distance calculation utilities for geolocation.
 * 
 * Pure functions for geographic distance calculations using the Haversine formula.
 * All functions are referentially transparent with no side effects.
 * 
 * @module utils/distance
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */

/**
 * Earth's mean radius in meters used for Haversine distance calculations.
 * @constant {number}
 */
export const EARTH_RADIUS_METERS = 6371e3;

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
 * log(distance); // ~357,710 meters (357.7 km)
 * 
 * @see {@link https://en.wikipedia.org/wiki/Haversine_formula} Haversine formula on Wikipedia
 * @see {@link https://www.movable-type.co.uk/scripts/latlong.html} Calculate distance, bearing and more
 * 
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
	const R = EARTH_RADIUS_METERS; // Earth radius in meters (mean radius)
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

/**
 * Creates a promise that resolves after the specified delay.
 * 
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise<void>} Promise that resolves after the delay
 * 
 * @example
 * await delay(1000); // Wait 1 second
 * 
 * @since 0.9.0-alpha
 */
export const delay = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms));
