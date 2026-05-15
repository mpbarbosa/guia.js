/**
 * TypeScript ambient type declarations for the paraty_geoservices CDN module.
 *
 * Exports: GeoPosition, GeoPositionError, GeoPositionOptions,
 * GeolocationProvider, BrowserGeolocationProvider,
 * GetCurrentPositionUseCase, WatchPositionUseCase, GetCurrentPositionOutput.
 *
 * @see https://github.com/mpbarbosa/paraty_geoservices
 * @see https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geoservices@1.2.6/dist/esm/index.js
 */

declare module 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geoservices@1.2.6/dist/esm/index.js' {
	/** Geographic coordinates and metadata returned by a provider. */
	export interface GeoPosition {
		coords: {
			latitude: number;
			longitude: number;
			accuracy: number;
			altitude: number | null;
			altitudeAccuracy: number | null;
			heading: number | null;
			speed: number | null;
		};
		timestamp: number;
	}

	/** Error returned by a geolocation provider. */
	export interface GeoPositionError {
		readonly code: 1 | 2 | 3;
		readonly message: string;
	}

	/** Options controlling how a provider acquires a position fix. */
	export interface GeoPositionOptions {
		enableHighAccuracy?: boolean;
		timeout?: number;
		maximumAge?: number;
	}

	/** Output DTO for the GetCurrentPosition use case. */
	export interface GetCurrentPositionOutput {
		position: GeoPosition;
	}

	/**
	 * Abstract port that all geolocation providers must implement.
	 *
	 * Extend this class to integrate a new location source (e.g. browser
	 * Geolocation API, GPS hardware, mock).
	 *
	 * @abstract
	 */
	export abstract class GeolocationProvider {
		abstract getCurrentPosition(
			successCallback: (pos: GeoPosition) => void,
			errorCallback: (err: GeoPositionError) => void,
			options?: GeoPositionOptions,
		): void;

		abstract watchPosition(
			successCallback: (pos: GeoPosition) => void,
			errorCallback: (err: GeoPositionError) => void,
			options?: GeoPositionOptions,
		): number | null;

		abstract clearWatch(watchId: number): void;

		abstract isSupported(): boolean;
	}

	/**
	 * Browser-based geolocation provider using navigator.geolocation.
	 * Intended for browser environments only.
	 */
	export class BrowserGeolocationProvider extends GeolocationProvider {
		constructor(navigatorObj?: Navigator | null);

		getCurrentPosition(
			successCallback: (pos: GeoPosition) => void,
			errorCallback: (err: GeoPositionError) => void,
			options?: GeoPositionOptions,
		): void;

		watchPosition(
			successCallback: (pos: GeoPosition) => void,
			errorCallback: (err: GeoPositionError) => void,
			options?: GeoPositionOptions,
		): number | null;

		clearWatch(watchId: number): void;
		isSupported(): boolean;
		isPermissionsAPISupported(): boolean;
		getNavigator(): Navigator | null;
	}

	/** Configuration options for MockGeolocationProvider. */
	export interface MockGeolocationProviderConfig {
		supported?: boolean;
		defaultPosition?: GeoPosition | null;
		defaultError?: GeoPositionError | null;
		delay?: number;
	}

	/**
	 * Mock geolocation provider for tests and deterministic local development.
	 */
	export class MockGeolocationProvider extends GeolocationProvider {
		constructor(config?: MockGeolocationProviderConfig);

		getCurrentPosition(
			successCallback: (pos: GeoPosition) => void,
			errorCallback: (err: GeoPositionError) => void,
			options?: GeoPositionOptions,
		): void;

		watchPosition(
			successCallback: (pos: GeoPosition) => void,
			errorCallback: (err: GeoPositionError) => void,
			options?: GeoPositionOptions,
		): number | null;

		clearWatch(watchId: number): void;
		isSupported(): boolean;
		isPermissionsAPISupported(): boolean;
		setPosition(position: GeoPosition): void;
		setError(error: GeoPositionError): void;
		triggerWatchUpdate(position?: GeoPosition): void;
		triggerWatchError(error?: GeoPositionError): void;
		destroy(): void;
	}

	/**
	 * Use case: acquire the device's current geographic position once.
	 * Wraps the callback-based GeolocationProvider in a Promise.
	 */
	export class GetCurrentPositionUseCase {
		constructor(provider: GeolocationProvider);
		execute(options?: GeoPositionOptions): Promise<GetCurrentPositionOutput>;
	}

	/**
	 * Use case: continuously watch the device's geographic position for changes.
	 */
	export class WatchPositionUseCase {
		constructor(provider: GeolocationProvider);
		start(
			onUpdate: (pos: GeoPosition) => void,
			onError: (err: GeoPositionError) => void,
			options?: GeoPositionOptions,
		): void;
		stop(): void;
		get isWatching(): boolean;
	}

	/** Provider-agnostic resolved address returned by any reverse geocoder. */
	export interface GeoAddress {
		street: string | null;
		streetNumber: string | null;
		complement: string | null;
		neighborhood: string | null;
		city: string | null;
		metropolitanRegion: string | null;
		state: string | null;
		stateCode: string | null;
		postalCode: string | null;
		country: string;
	}

	/** Port interface that all reverse geocoding providers must satisfy. */
	export interface ReverseGeocoderPort {
		reverseGeocode(latitude: number, longitude: number): Promise<GeoAddress>;
	}

	/** Raw address field shape returned by the AWS Location Service API. */
	export interface AwsAddress {
		label?: string;
		addressNumber?: string;
		street?: string;
		neighborhood?: string;
		municipality?: string;
		region?: string;
		postalCode?: string;
		country?: string;
		interpolated?: boolean;
		[key: string]: unknown;
	}

	/** Top-level response envelope from the AWS Location Service reverse-geocoding endpoint. */
	export interface AwsReverseGeocodeResponse {
		provider?: string;
		coordinates?: { latitude?: number; longitude?: number };
		address?: AwsAddress;
		geometry?: { Point?: [number, number]; [key: string]: unknown };
		[key: string]: unknown;
	}

	/**
	 * Reverse geocoder that calls an AWS Location Service-compatible API.
	 * Implements {@link ReverseGeocoderPort}.
	 */
	export class AwsGeocoder implements ReverseGeocoderPort {
		readonly baseUrl: string;
		readonly endpoint: string;
		constructor(baseUrl?: string);
		reverseGeocode(latitude: number, longitude: number): Promise<GeoAddress>;
	}
}
