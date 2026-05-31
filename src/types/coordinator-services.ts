/**
 * Shared service contracts for coordination-layer dependency injection.
 *
 * These interfaces keep coordinator wiring decoupled from concrete service
 * implementations while staying narrow enough for tests and alternative
 * coordinator entry points.
 *
 * @module types/coordinator-services
 * @since 0.28.4-alpha
 */

import type {
  GeoPosition,
  GeoPositionError,
} from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geoservices@v1.6.5/dist/esm/index.js';

export interface IGeolocationServiceForSC {
  getSingleLocationUpdate(): Promise<GeoPosition>;
  watchCurrentLocation?(
    onUpdate?: (position: GeoPosition) => void,
    onError?: (error: GeoPositionError) => void,
  ): number | null;
  stopWatching?(): void;
  stopTracking?(): void;
  setThrottleInterval?(ms: number): void;
}

export interface IReverseGeocoderForSC {
  subscribe(observer: unknown): void;
  observerSubject?: { observers: unknown[] };
  latitude: number | null;
  longitude: number | null;
  currentAddress: unknown;
  enderecoPadronizado: unknown;
  update?: (...args: unknown[]) => void;
}

export interface IChangeDetectionCoordinatorForSC {
  setCurrentPosition(position: unknown): void;
  setupChangeDetection(): void;
}

export interface IObserverSubjectForSC {
  subscribe(observer: unknown): void;
}

export interface IDisplayerFactory {
  createPositionDisplayer(el: unknown): unknown;
  createAddressDisplayer(el1: unknown, el2: unknown): unknown;
  createReferencePlaceDisplayer(el: unknown): unknown;
  createHighlightCardsDisplayer(doc: Document): unknown;
  createSidraDisplayer(el: unknown): unknown;
}

export interface IDisplayers {
  position: unknown;
  address: unknown;
  referencePlace: unknown;
  highlightCards: unknown;
  sidra: unknown;
  [key: string]: unknown;
}

export interface ServiceCoordinatorParams {
  geolocationService: IGeolocationServiceForSC;
  reverseGeocoder: IReverseGeocoderForSC;
  changeDetectionCoordinator: IChangeDetectionCoordinatorForSC;
  observerSubject: unknown;
  displayerFactory?: IDisplayerFactory;
  document?: Document;
}
