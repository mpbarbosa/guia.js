/**
 * TypeScript ambient type declarations for the paraty_geocore.js CDN module.
 *
 * Exports: GeoPosition, GeoPositionError, ObserverSubject, DualObserverSubject,
 * GeocodingState, calculateDistance, EARTH_RADIUS_METERS, delay,
 * withObserver, ObserverMixinOptions, ObserverMixinResult,
 * ReferencePlace, NO_REFERENCE_PLACE, VALID_REF_PLACE_CLASSES, OsmElement,
 * log, warn.
 *
 * @see https://github.com/mpbarbosa/paraty_geocore.js
 * @see https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.12.10-alpha/dist/esm/index.js
 */

declare module 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.12.10-alpha/dist/esm/index.js' {
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
	 * import { withObserver } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.12.10-alpha/dist/esm/index.js';
	 *
	 * class MyClass {
	 *     constructor() { this.observerSubject = new DualObserverSubject(); }
	 * }
	 * Object.assign(MyClass.prototype, withObserver({ checkNull: true, className: 'MyClass' }));
	 */
	export function withObserver(options?: ObserverMixinOptions): ObserverMixinResult;

	// ─── ReferencePlace (0.12.4-alpha) ────────────────────────────────────────

	/** Minimal OSM element shape used by ReferencePlace to identify points of interest. */
	export interface OsmElement {
		class?: string;
		type?: string;
		name?: string;
		[key: string]: unknown;
	}

	/** Fallback description returned when no mapping exists for a class/type pair. */
	export const NO_REFERENCE_PLACE: string;

	/** OSM feature classes that are considered valid reference places. */
	export const VALID_REF_PLACE_CLASSES: ReadonlyArray<string>;

	/**
	 * Immutable value object representing a reference place (POI) extracted from geocoding data.
	 * @immutable All instances are frozen after construction.
	 * @since 0.12.4-alpha
	 */
	export class ReferencePlace {
		readonly className: string | null;
		readonly typeName: string | null;
		readonly name: string | null;
		readonly description: string;

		static readonly referencePlaceMap: Record<string, Record<string, string>>;

		constructor(data: OsmElement | null | undefined);
		calculateDescription(): string;
		calculateCategory(): string;
		toString(): string;
	}

	/**
	 * Emits a timestamped informational message via `console.log`.
	 * @since 0.12.1-alpha
	 */
	export function log(message: string, ...params: unknown[]): void;

	/**
	 * Emits a timestamped warning message via `console.warn`.
	 * @since 0.12.1-alpha
	 */
	export function warn(message: string, ...params: unknown[]): void;
}

// Ibira.js ambient module declarations
declare module 'https://cdn.jsdelivr.net/gh/mpbarbosa/ibira.js@0.4.22-alpha/src/index.js' {
  export class IbiraAPIFetchManager {
    constructor(config?: object);
    fetch(url: string): Promise<unknown>;
    fetchData(url: string): Promise<unknown>;
  }
}

declare module 'ibira.js' {
  export class IbiraAPIFetchManager {
    constructor(config?: object);
    fetch(url: string): Promise<unknown>;
    fetchData(url: string): Promise<unknown>;
  }
}

// bessa_patterns.ts ambient module declaration (importmap alias)
declare module 'bessa_patterns.ts' {
  export class CallbackRegistry {
    constructor();
    register(type: string, callback: ((...args: unknown[]) => void) | null): void;
    get(type: string): ((...args: unknown[]) => void) | null;
    execute(type: string, ...args: unknown[]): boolean;
    has(type: string): boolean;
    unregister(type: string): boolean;
    clear(): void;
    getRegisteredTypes(): string[];
    size(): number;
    isEmpty(): boolean;
  }

  export class ObserverSubject<T> {
    subscribe(observer: (snapshot: T) => void): () => void;
    unsubscribe(callback: (snapshot: T) => void): boolean;
    getObserverCount(): number;
    clearObservers(): void;
    _notifyObservers(snapshot: T): void;
  }

  export class DualObserverSubject {
    subscribe(observer: { update?: (...args: unknown[]) => void } | null | undefined): void;
    unsubscribe(observer: { update?: (...args: unknown[]) => void }): void;
    notifyObservers(...args: unknown[]): void;
    subscribeFunction(fn: ((...args: unknown[]) => void) | null | undefined): void;
    unsubscribeFunction(fn: (...args: unknown[]) => void): void;
    notifyFunctionObservers(...args: unknown[]): void;
    getObserverCount(): number;
    getFunctionObserverCount(): number;
    clearAllObservers(): void;
  }

  export interface ObserverObject {
    update?: (...args: unknown[]) => void;
  }
  export type ObserverFunction = (...args: unknown[]) => void;

  export interface ObserverMixinOptions {
    checkNull?: boolean;
    className?: string;
    excludeNotify?: boolean;
  }
  export interface ObserverMixinResult {
    subscribe(observer: ObserverObject | ObserverFunction): void;
    unsubscribe(observer: ObserverObject | ObserverFunction): void;
    notify?(data?: unknown): void;
  }
  export function withObserver(options?: ObserverMixinOptions): ObserverMixinResult;
}
