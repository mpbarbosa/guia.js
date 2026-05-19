/**
 * High-level geolocation façade with throttling and race-condition protection.
 *
 * Wraps a {@link GeolocationProvider} and adds:
 * - Leading-edge throttle on watch callbacks (configurable via {@link GeolocationService.setThrottleInterval})
 * - Race-condition guard for single-shot requests ({@link GeolocationService.hasPendingRequest})
 * - Automatic low-accuracy retry on GPS timeout (error code 3)
 *
 * Ported from paraty_geoservices@v1.6.3.
 *
 * @module services/GeolocationService
 * @see https://github.com/mpbarbosa/paraty_geoservices
 */

import { GeolocationProvider } from './providers/GeolocationProvider';
import type { GeoPosition, GeoPositionError, GeoPositionOptions } from './providers/GeolocationProvider';
import type {
	GeolocationPermissionReader,
	GeolocationPermissionState,
} from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geoservices@v1.6.3/dist/esm/index.js';
import { throttle } from '../utils/throttle';
import type { ThrottledFunction } from '../utils/throttle';

const GEOLOCATION_THROTTLE_INTERVAL = 5_000;

const DEFAULT_OPTIONS: GeoPositionOptions = {
	enableHighAccuracy: true,
	timeout: 15_000,
	maximumAge: 0,
};

export interface GeolocationServiceConfig {
	geolocationOptions?: GeoPositionOptions;
	permissionReader?: GeolocationPermissionReader;
}

function isGeolocationPermissionReader(
	value: GeolocationProvider | GeolocationPermissionReader,
): value is GeolocationPermissionReader {
	return typeof (value as { checkPermissions?: unknown }).checkPermissions === 'function';
}

/**
 * High-level geolocation façade.
 *
 * **Constructor injection:**
 * Pass any `GeolocationProvider` instance — `BrowserGeolocationProvider`,
 * `MockGeolocationProvider`, or a custom adapter.
 *
 * @example
 * const provider = new BrowserGeolocationProvider();
 * const service = new GeolocationService(provider);
 * const position = await service.getSingleLocationUpdate();
 */
class GeolocationService {
	private watchId: number | null;
	private isWatching: boolean;
	private lastKnownPosition: GeoPosition | null;
	private isPendingRequest: boolean;
	private pendingPromise: Promise<GeoPosition> | null;
	private lastSingleFetchTime: number;
	private throttledWatchHandler: ThrottledFunction<[GeoPosition], void>;
	private _rawWatchHandler: (position: GeoPosition) => void;
	private _throttleInterval: number;
	private config: { geolocationOptions: GeoPositionOptions };
	private permissionReader: GeolocationPermissionReader | null;
	private provider: GeolocationProvider;

	constructor(
		provider: GeolocationProvider,
		config: GeolocationServiceConfig = {},
	) {
		if (!provider) {
			throw new TypeError('GeolocationService requires a GeolocationProvider instance');
		}

		this.watchId = null;
		this.isWatching = false;
		this.lastKnownPosition = null;
		this.isPendingRequest = false;
		this.pendingPromise = null;
		this.lastSingleFetchTime = 0;
		this._throttleInterval = GEOLOCATION_THROTTLE_INTERVAL;

		this._rawWatchHandler = (position: GeoPosition) => {
			this.lastKnownPosition = position;
		};
		this.throttledWatchHandler = throttle(this._rawWatchHandler, this._throttleInterval);

		this.config = {
			geolocationOptions: config.geolocationOptions ?? DEFAULT_OPTIONS,
		};
		this.provider = provider;
		this.permissionReader =
			config.permissionReader ??
			(isGeolocationPermissionReader(provider) ? provider : null);
	}

	/**
	 * Checks the current geolocation permission status using the Permissions API.
	 * Falls back to `'prompt'` when the Permissions API is unavailable or throws.
	 */
	checkPermissions(): Promise<GeolocationPermissionState> {
		return this.permissionReader?.checkPermissions() ?? Promise.resolve('prompt');
	}

	/**
	 * Gets a single location update.
	 *
	 * - Returns the same pending `Promise` when called concurrently.
	 * - Returns the cached position without a new GPS call when within the throttle window.
	 * - Retries automatically with low accuracy when a high-accuracy request times out.
	 */
	getSingleLocationUpdate(): Promise<GeoPosition> {
		if (this.isPendingRequest && this.pendingPromise) {
			return this.pendingPromise;
		}

		if (
			Date.now() - this.lastSingleFetchTime < this._throttleInterval &&
			this.lastKnownPosition
		) {
			return Promise.resolve(this.lastKnownPosition);
		}

		this.pendingPromise = new Promise<GeoPosition>((resolve, reject) => {
			if (this.isPendingRequest) {
				const err = new Error('A geolocation request is already pending');
				err.name = 'RequestPendingError';
				reject(err);
				return;
			}

			if (!this.provider.isSupported()) {
				const err = new Error('Geolocation is not supported by this browser');
				err.name = 'NotSupportedError';
				reject(err);
				return;
			}

			this.isPendingRequest = true;

			this.provider.getCurrentPosition(
				(position) => {
					this.isPendingRequest = false;
					this.pendingPromise = null;
					this.lastKnownPosition = position;
					this.lastSingleFetchTime = Date.now();
					resolve(position);
				},
				(err) => {
					// Timeout (code 3) with high accuracy: retry once at low accuracy
					if (err.code === 3 && this.config.geolocationOptions.enableHighAccuracy !== false) {
						const fallbackOptions: GeoPositionOptions = {
							...this.config.geolocationOptions,
							enableHighAccuracy: false,
							timeout: 10_000,
						};
						this.provider.getCurrentPosition(
							(position) => {
								this.isPendingRequest = false;
								this.pendingPromise = null;
								this.lastKnownPosition = position;
								this.lastSingleFetchTime = Date.now();
								resolve(position);
							},
							(fallbackErr) => {
								this.isPendingRequest = false;
								this.pendingPromise = null;
								reject(fallbackErr);
							},
							fallbackOptions,
						);
						return;
					}

					this.isPendingRequest = false;
					this.pendingPromise = null;
					reject(err);
				},
				this.config.geolocationOptions,
			);
		});

		return this.pendingPromise;
	}

	/**
	 * Starts watching the position for continuous updates.
	 *
	 * The `onUpdate` callback is throttled: at most once per `_throttleInterval` ms
	 * (default 5 s). Call `flushThrottle()` to force-deliver the next update.
	 * Timeout errors (code 3) are silently swallowed — the watch keeps running.
	 */
	watchCurrentLocation(
		onUpdate?: (position: GeoPosition) => void,
		onError?: (error: GeoPositionError) => void,
	): number | null {
		if (!this.provider.isSupported()) {
			return null;
		}

		if (this.isWatching) {
			return this.watchId;
		}

		this._rawWatchHandler = (position: GeoPosition) => {
			this.lastKnownPosition = position;
			onUpdate?.(position);
		};
		this.throttledWatchHandler = throttle(this._rawWatchHandler, this._throttleInterval);

		const watchId = this.provider.watchPosition(
			(position: GeoPosition) => this.throttledWatchHandler(position),
			(err: GeoPositionError) => {
				if (err.code === 3) {
					return;
				}
				onError?.(err);
			},
			this.config.geolocationOptions,
		);

		this.watchId = watchId;
		this.isWatching = true;
		return this.watchId;
	}

	/** Stops watching the position. Safe to call when no watch is active. */
	stopWatching(): void {
		if (this.watchId !== null && this.isWatching) {
			this.provider.clearWatch(this.watchId);
			this.watchId = null;
			this.isWatching = false;
		}
	}

	/** Returns the last position delivered by any method, or `null`. */
	getLastKnownPosition(): GeoPosition | null {
		return this.lastKnownPosition;
	}

	/** Returns `true` if a position watch is currently active. */
	isCurrentlyWatching(): boolean {
		return this.isWatching;
	}

	/** Returns the active watch ID, or `null` when not watching. */
	getCurrentWatchId(): number | null {
		return this.watchId;
	}

	/** Returns `true` while a `getSingleLocationUpdate` call is in flight. */
	hasPendingRequest(): boolean {
		return this.isPendingRequest;
	}

	/**
	 * Resets both throttle guards so the next position fetch and the next watch
	 * callback execute immediately, regardless of elapsed time.
	 */
	flushThrottle(): void {
		this.lastSingleFetchTime = 0;
		this.throttledWatchHandler.flush();
	}

	/**
	 * Replaces the active throttle interval. The active watch subscription is
	 * unaffected — only the rate at which GPS events are forwarded changes.
	 */
	setThrottleInterval(ms: number): void {
		this._throttleInterval = ms;
		this.throttledWatchHandler = throttle(this._rawWatchHandler, ms);
	}
}

export default GeolocationService;
export { GeolocationService };
