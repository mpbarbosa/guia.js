/**
 * TypeScript ambient type declarations for the paraty_geocore.js CDN module.
 *
 * This file enables TypeScript type-checking for the CDN URL import used in
 * `src/core/GeoPosition.ts`. Without this declaration, TypeScript cannot resolve
 * the `https://` URL to any type information.
 *
 * @see https://github.com/mpbarbosa/paraty_geocore.js
 * @see https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.9.4-alpha/dist/esm/index.js
 */

declare module 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.9.4-alpha/dist/esm/index.js' {
	/** GPS accuracy quality classification. */
	export type AccuracyQuality = 'excellent' | 'good' | 'medium' | 'bad' | 'very bad';

	/** Coordinate properties extracted from a GeolocationCoordinates object. */
	export interface GeoCoords {
		latitude?: number;
		longitude?: number;
		accuracy?: number;
		altitude?: number | null;
		altitudeAccuracy?: number | null;
		heading?: number | null;
		speed?: number | null;
	}

	/** Input shape accepted by the GeoPosition constructor. */
	export interface GeoPositionInput {
		timestamp?: number;
		coords?: GeoCoords;
	}

	/** Error thrown by GeoPosition when given an invalid (primitive) input. */
	export class GeoPositionError extends Error {
		constructor(message: string);
	}

	/**
	 * Immutable geographic position with convenience methods.
	 * @immutable All instances and nested objects are frozen after creation.
	 */
	export class GeoPosition {
		readonly geolocationPosition: Readonly<{ timestamp: number | undefined; coords: Readonly<GeoCoords> }> | null;
		readonly coords: Readonly<GeoCoords> | null;
		readonly latitude: number | undefined;
		readonly longitude: number | undefined;
		readonly accuracy: number | undefined;
		readonly accuracyQuality: AccuracyQuality;
		readonly altitude: number | null | undefined;
		readonly altitudeAccuracy: number | null | undefined;
		readonly heading: number | null | undefined;
		readonly speed: number | null | undefined;
		readonly timestamp: number | undefined;

		constructor(position: GeoPositionInput);

		/** Factory method — creates a GeoPosition from a GeoPositionInput. */
		static from(position: GeoPositionInput): GeoPosition;

		/** Classifies GPS accuracy in meters into a quality level. */
		static getAccuracyQuality(accuracy: number): AccuracyQuality;

		/** @deprecated Use the `accuracyQuality` property instead. */
		calculateAccuracyQuality(): AccuracyQuality;

		/**
		 * Distance in meters between this position and another,
		 * or `NaN` if this position has no coordinates.
		 */
		distanceTo(otherPosition: { latitude: number; longitude: number }): number;

		toString(): string;
	}

	export default GeoPosition;

	/** Earth's mean radius in meters used for Haversine distance calculations. */
	export const EARTH_RADIUS_METERS: number;

	/**
	 * Calculates the great-circle distance between two geographic points using the Haversine formula.
	 * @param lat1 - Latitude of first point in decimal degrees
	 * @param lon1 - Longitude of first point in decimal degrees
	 * @param lat2 - Latitude of second point in decimal degrees
	 * @param lon2 - Longitude of second point in decimal degrees
	 * @returns Distance in meters between the two points
	 */
	export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;

	/**
	 * Creates a Promise that resolves after the specified number of milliseconds.
	 * Negative values are clamped to 0.
	 * @param ms - Delay duration in milliseconds
	 * @returns Promise that resolves after `ms` milliseconds
	 */
	export function delay(ms: number): Promise<void>;
}
