/**
 * TypeScript ambient type declarations for the paraty_geoservices CDN module.
 *
 * Exports: GeoPosition, GeoPositionError, GeoPositionOptions,
 * GeolocationProvider, BrowserGeolocationProvider,
 * GetCurrentPositionUseCase, WatchPositionUseCase, GetCurrentPositionOutput.
 *
 * @see https://github.com/mpbarbosa/paraty_geoservices
 * @see https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geoservices@v1.6.3/dist/esm/index.js
 */

declare module 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geoservices@v1.6.3/dist/esm/index.js' {
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

	export type GeolocationPermissionState = 'granted' | 'denied' | 'prompt';

	export interface GeolocationPermissionReader {
		checkPermissions(): Promise<GeolocationPermissionState>;
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

	export interface GeolocationServiceConfig {
		geolocationOptions?: GeoPositionOptions;
		permissionReader?: GeolocationPermissionReader;
	}

	export class GeolocationService {
		constructor(provider: GeolocationProvider, config?: GeolocationServiceConfig);
		checkPermissions(): Promise<GeolocationPermissionState>;
		getSingleLocationUpdate(): Promise<GeoPosition>;
		watchCurrentLocation(
			onUpdate?: (pos: GeoPosition) => void,
			onError?: (err: GeoPositionError) => void,
		): number | null;
		stopWatching(): void;
		getLastKnownPosition(): GeoPosition | null;
		isCurrentlyWatching(): boolean;
		getCurrentWatchId(): number | null;
		hasPendingRequest(): boolean;
		flushThrottle(): void;
		setThrottleInterval(ms: number): void;
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

	/** User-visible error notification; avoids direct `window` coupling. */
	export interface ReverseGeocodeErrorNotifier {
		displayError(title: string, message: string): void;
	}

	/** Optional legacy Brazilian address normalizer (CDN AddressDataExtractor bridge). */
	export interface BrazilianAddressNormalizer {
		getBrazilianStandardAddress(data: unknown): unknown;
	}

	/** Options for constructing a {@link ReverseGeocoderService} directly. */
	export interface ReverseGeocoderServiceOptions {
		nominatimGeocoder: ReverseGeocoderPort;
		awsGeocoder?: ReverseGeocoderPort | null;
		geocodingPrimaryProvider?: 'aws' | 'nominatim';
		positionUpdateEvent?: string;
		immediateAddressUpdateEvent?: string;
		logger?: { info(msg: string, ...a: unknown[]): void; warn(msg: string, ...a: unknown[]): void; error(msg: string, ...a: unknown[]): void } | null;
		errorNotifier?: ReverseGeocodeErrorNotifier | null;
		emitBrowserProviderEvents?: boolean;
	}

	/** @deprecated Use {@link ReverseGeocoderServiceOptions}. Kept for factory config typing. */
	export interface ReverseGeocoderConfig {
		nominatimGeocoder?: ReverseGeocoderPort | null;
		awsGeocoder?: ReverseGeocoderPort | null;
		nominatimApiUrl?: string;
		openstreetmapBaseUrl?: string;
		corsProxy?: string | null;
		enableCorsFallback?: boolean;
		geocodingPrimaryProvider?: 'aws' | 'nominatim';
		positionUpdateEvent?: string;
		immediateAddressUpdateEvent?: string;
		errorNotifier?: ReverseGeocodeErrorNotifier | null;
		emitBrowserProviderEvents?: boolean;
	}

	/** Minimal legacy fetch-manager interface accepted by NominatimGeocoder. */
	export interface LegacyFetchManager {
		fetch(url: string): Promise<unknown>;
		subscribe(observer: unknown, url: string): void;
		observers?: unknown[];
	}

	/** Factory config for {@link createReverseGeocoderService}. */
	export interface CreateReverseGeocoderServiceConfig extends ReverseGeocoderConfig {
		awsLbsEnabled?: boolean;
		awsLbsBaseUrl?: string;
	}

	/**
	 * Orchestrates reverse geocoding across injected providers and notifies observers.
	 * Exported as `ReverseGeocoderService` from the CDN index; aliased as `ReverseGeocoder`
	 * in src/services/ReverseGeocoder.ts.
	 */
	export class ReverseGeocoderService {
		latitude: number | null;
		longitude: number | null;
		url: string | null;
		observerSubject: { observers: unknown[]; notifyObservers(...args: unknown[]): void };
		currentAddress: GeoAddress | null;
		standardizedAddress: GeoAddress | unknown | null;
		/** @deprecated Use standardizedAddress. */
		get enderecoPadronizado(): GeoAddress | unknown | null;
		set enderecoPadronizado(value: GeoAddress | unknown | null);
		/** @deprecated Use currentAddress. */
		get data(): GeoAddress | null;
		set data(value: GeoAddress | null);
		error: unknown;
		loading: boolean;
		lastFetch: number;
		AddressDataExtractor: BrazilianAddressNormalizer | null;
		declare subscribe: (observer: unknown) => void;
		declare unsubscribe: (observer: unknown) => void;

		constructor(options: ReverseGeocoderServiceOptions);

		_subscribe(url: string): void;
		notifyObservers(...args: unknown[]): void;
		secondUpdateParam(): GeoAddress | unknown | null;
		setCoordinates(latitude: number, longitude: number): void;
		getCacheKey(): string;
		fetchAddress(): Promise<GeoAddress>;
		update(positionManager: unknown, posEvent: unknown, loading: unknown, errState: unknown): void;
		/** @deprecated Use fetchAddress(). */
		reverseGeocode(): Promise<GeoAddress>;
		toString(): string;
		switchProvider(provider: 'aws' | 'nominatim'): void;
		hasAwsProvider(): boolean;
		getPrimaryProvider(): 'aws' | 'nominatim';
		_dispatchProviderEvent(provider: 'aws' | 'nominatim'): void;
	}

	/**
	 * Creates a fully wired {@link ReverseGeocoderService} with Nominatim and optional AWS adapters.
	 */
	export function createReverseGeocoderService(
		fetchManager?: LegacyFetchManager | null,
		config?: CreateReverseGeocoderServiceConfig,
	): ReverseGeocoderService;
}

declare module 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geoservices@v1.6.3/dist/esm/application/services/ChangeDetectionCoordinator.js' {
	type GeoPosition = import('https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geoservices@v1.6.3/dist/esm/index.js').GeoPosition;
	type GeoAddress = import('https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geoservices@v1.6.3/dist/esm/index.js').GeoAddress;

	export interface AddressFieldChangeEvent {
		from: string | null;
		to: string | null;
		previousAddress: GeoAddress | null;
		currentAddress: GeoAddress | null;
	}

	export type AddressChangeType = 'StreetChanged' | 'NeighborhoodChanged' | 'CityChanged';

	export interface IAddressChangeObserver {
		update(
			newValue: string | null,
			changeType: AddressChangeType,
			reserved: null,
			event: AddressFieldChangeEvent,
		): void;
	}

	export interface IObserverSubject {
		observers: IAddressChangeObserver[] | null;
		functionObservers: Array<(
			position: GeoPosition | null,
			address: GeoAddress | null,
			event: AddressFieldChangeEvent,
		) => void>;
	}

	export interface IAddressComponentExtractor {
		setStreetChangeCallback(cb: ((event: AddressFieldChangeEvent) => void) | null): void;
		setNeighborhoodChangeCallback(cb: ((event: AddressFieldChangeEvent) => void) | null): void;
		setCityChangeCallback(cb: ((event: AddressFieldChangeEvent) => void) | null): void;
	}

	export interface IAddressState {
		currentAddress: GeoAddress | null;
	}

	export interface ILogger {
		warn(message: string, ...args: unknown[]): void;
		error(message: string, ...args: unknown[]): void;
		info(message: string, ...args: unknown[]): void;
	}

	export class ChangeDetectionCoordinator {
		addressState: IAddressState;
		observerSubject: IObserverSubject;
		currentPosition: GeoPosition | null;

		constructor(params: {
			addressState: IAddressState;
			observerSubject: IObserverSubject;
			logger: ILogger;
		});

		setAddressComponentExtractor(extractor: IAddressComponentExtractor): void;
		setCurrentPosition(position: GeoPosition | null): void;
		setupChangeDetection(): void;
		removeAllChangeDetection(): void;
		setupStreetChangeDetection(): void;
		removeStreetChangeDetection(): void;
		setupNeighborhoodChangeDetection(): void;
		removeNeighborhoodChangeDetection(): void;
		setupCityChangeDetection(): void;
		removeCityChangeDetection(): void;
		handleStreetChange(event: AddressFieldChangeEvent): void;
		handleNeighborhoodChange(event: AddressFieldChangeEvent): void;
		handleCityChange(event: AddressFieldChangeEvent): void;
		notifyStreetChangeObservers(event: AddressFieldChangeEvent): void;
		notifyNeighborhoodChangeObservers(event: AddressFieldChangeEvent): void;
		notifyCityChangeObservers(event: AddressFieldChangeEvent): void;
	}

	export default ChangeDetectionCoordinator;
}
