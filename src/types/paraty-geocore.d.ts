/**
 * TypeScript ambient type declarations for the paraty_geocore.js CDN module.
 *
 * Exports: GeoPosition, GeoPositionError, ObserverSubject, DualObserverSubject,
 * GeocodingState, calculateDistance, EARTH_RADIUS_METERS, delay,
 * withObserver, ObserverMixinOptions, ObserverMixinResult,
 * PositionManager, PositionManagerConfig, initializeConfig, createPositionManagerConfig.
 *
 * @see https://github.com/mpbarbosa/paraty_geocore.js
 * @see https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.11.3/dist/esm/index.js
 */

declare module 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.11.3/dist/esm/index.js' {
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
	 */
	export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;

	/**
	 * Creates a Promise that resolves after the specified number of milliseconds.
	 * Negative values are clamped to 0.
	 */
	export function delay(ms: number): Promise<void>;

	/** Generic observer/subject — manages a list of typed observer callbacks. */
	export class ObserverSubject<T> {
		subscribe(observer: (snapshot: T) => void): () => void;
		unsubscribe(callback: (snapshot: T) => void): boolean;
		getObserverCount(): number;
		clearObservers(): void;
		_notifyObservers(snapshot: T): void;
		_observers: Array<(snapshot: T) => void>;
	}

	/**
	 * Dual-pattern observer subject — supports both GoF object observers (with update())
	 * and function-based observers in two independent collections.
	 *
	 * Canonical implementation: paraty_geocore.js / src/core/DualObserverSubject.ts
	 */
	export class DualObserverSubject {
		/** Object observers subscribed via subscribe(). */
		readonly observers: ReadonlyArray<{ update?: (...args: unknown[]) => void }>;
		/** Function observers subscribed via subscribeFunction(). */
		readonly functionObservers: ReadonlyArray<(...args: unknown[]) => void>;

		/** Subscribe an object observer (called via update() on notification). Null/undefined silently ignored. */
		subscribe(observer: { update?: (...args: unknown[]) => void } | null | undefined): void;
		/** Unsubscribe an object observer by reference. */
		unsubscribe(observer: { update?: (...args: unknown[]) => void }): void;
		/** Notify all object observers — calls update(...args) on each. */
		notifyObservers(...args: unknown[]): void;

		/** Subscribe a function observer. Null/undefined silently ignored. */
		subscribeFunction(fn: ((...args: unknown[]) => void) | null | undefined): void;
		/** Unsubscribe a function observer by reference. */
		unsubscribeFunction(fn: (...args: unknown[]) => void): void;
		/** Notify all function observers — calls fn(...args) on each. */
		notifyFunctionObservers(...args: unknown[]): void;

		/** Count of object observers. */
		getObserverCount(): number;
		/** Count of function observers. */
		getFunctionObserverCount(): number;
		/** Clear both observer collections. */
		clearAllObservers(): void;
	}

	/** Snapshot passed to GeocodingState observers on every state change. */
	export interface GeocodingStateSnapshot {
		position: GeoPosition | null;
		coordinates: { latitude: number; longitude: number } | null;
	}

	/** Centralized state manager for current position and coordinates. */
	export class GeocodingState extends ObserverSubject<GeocodingStateSnapshot> {
		constructor();

		/**
		 * Set current position and notify observers.
		 * @throws {TypeError} If position is not a GeoPosition instance or null.
		 * @returns {GeocodingState} This instance for chaining.
		 */
		setPosition(position: GeoPosition | null): GeocodingState;

		/** Returns the current GeoPosition, or null if not set. */
		getCurrentPosition(): GeoPosition | null;

		/** Returns {latitude, longitude}, or null if no position is set. */
		getCurrentCoordinates(): { latitude: number; longitude: number } | null;

		/** Returns true if a position is currently set. */
		hasPosition(): boolean;

		/** Clears the current position state. */
		clear(): void;
	}

	// ─── ObserverMixin (0.11.0) ────────────────────────────────────────────────

	/**
	 * Configuration options for the {@link withObserver} mixin factory.
	 * @since 0.11.0
	 */
	export interface ObserverMixinOptions {
		/** When true, validates that the internal `observerSubject` is not null before delegating. */
		checkNull?: boolean;
		/** Class name used in warning messages (requires `checkNull: true`). */
		className?: string;
		/** When true, the `notify` method is omitted from the returned mixin. */
		excludeNotify?: boolean;
	}

	/**
	 * The set of observer-pattern methods returned by {@link withObserver}.
	 * When `excludeNotify` is `true` the `notify` member is absent at runtime.
	 * @since 0.11.0
	 */
	export interface ObserverMixinResult {
		subscribe(observer: ObserverObject | ObserverFunction): void;
		unsubscribe(observer: ObserverObject | ObserverFunction): void;
		notify?(data?: unknown): void;
	}

	/**
	 * Factory that returns a plain object whose methods delegate to `this.observerSubject`.
	 * Mix the result into a class prototype via `Object.assign(MyClass.prototype, withObserver())`.
	 *
	 * @param {ObserverMixinOptions} [options] - Optional configuration.
	 * @returns {ObserverMixinResult} Object containing subscribe/unsubscribe (and optionally notify).
	 * @since 0.11.0
	 *
	 * @example
	 * import { withObserver } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.11.3/dist/esm/index.js';
	 *
	 * class MyClass {
	 *     constructor() { this.observerSubject = new DualObserverSubject(); }
	 * }
	 * Object.assign(MyClass.prototype, withObserver({ checkNull: true, className: 'MyClass' }));
	 */
	export function withObserver(options?: ObserverMixinOptions): ObserverMixinResult;

	/** Configuration options for PositionManager. */
	export interface PositionManagerConfig {
		trackingInterval: number;
		minimumDistanceChange: number;
		minimumTimeChange: number;
		notAcceptedAccuracy: AccuracyQuality[] | null;
	}

	/**
	 * Returns a PositionManagerConfig with default values.
	 * Defaults: trackingInterval=50000ms, minimumDistanceChange=20m,
	 * minimumTimeChange=30000ms, notAcceptedAccuracy=null.
	 */
	export function createPositionManagerConfig(): PositionManagerConfig;

	/**
	 * Replaces (merges) the active PositionManager configuration with the provided values.
	 * Missing keys are filled from createPositionManagerConfig() defaults.
	 */
	export function initializeConfig(config: Partial<PositionManagerConfig>): void;

	/**
	 * Singleton manager for device geolocation position.
	 * Implements the observer pattern to notify subscribers of position changes.
	 */
	export class PositionManager {
		static instance: PositionManager | null;

		/** Fired when position is successfully updated. */
		static strCurrPosUpdate: string;
		/** Fired when position update is rejected by validation rules. */
		static strCurrPosNotUpdate: string;
		/** Fired when position is updated and must be immediately processed. */
		static strImmediateAddressUpdate: string;

		/** Last accepted geographic position (public in library). */
		lastPosition: GeoPosition | null;

		latitude: number | undefined;
		longitude: number | undefined;
		accuracy: number | undefined;
		accuracyQuality: AccuracyQuality | undefined;
		altitude: number | null | undefined;
		heading: number | null | undefined;
		speed: number | null | undefined;
		timestamp: number | undefined;

		constructor(position?: GeolocationPosition);

		static getInstance(position?: GeolocationPosition): PositionManager;
		update(position: GeolocationPosition): void;
		subscribe(observer: { update?: (...args: unknown[]) => void } | ((...args: unknown[]) => void)): void;
		unsubscribe(observer: { update?: (...args: unknown[]) => void } | ((...args: unknown[]) => void)): void;
		notifyObservers(posEvent: string, data?: unknown, error?: { name: string; message: string } | null): void;
		toString(): string;
	}
}
