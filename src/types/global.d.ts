/**
 * Global window interface augmentations for Guia Turístico.
 * Declares window-level functions and properties set by the application.
 */

import type ReverseGeocoder from '../services/ReverseGeocoder.js';

declare global {
  interface Window {
    /** Find nearby restaurants at the given coordinates (placeholder, registered by guia.js) */
    findNearbyRestaurants?: (latitude: number, longitude: number) => void;
    /** Fetch city statistics for the given coordinates (placeholder, registered by guia.js) */
    fetchCityStatistics?: (latitude: number, longitude: number) => void;
    /** GuiaApp namespace exposed for console/debug access (registered by app.js) */
    GuiaApp?: {
      switchProvider?: (provider: string) => void;
      geocoder?: ReverseGeocoder;
      [key: string]: unknown;
    };
    ibiraLoadingPromise?: Promise<void>;
    IbiraAPIFetchManager?: new(config: object) => unknown;
    ErrorRecovery?: { displayError(title: string, message: string): void };

    // Classes registered on window for legacy/debug access
    /** HTMLPositionDisplayer class (registered in HTMLPositionDisplayer.ts) */
    HTMLPositionDisplayer?: unknown;
    /** HTMLReferencePlaceDisplayer class */
    HTMLReferencePlaceDisplayer?: unknown;
    /** DisplayerFactory class (registered in DisplayerFactory.ts) */
    DisplayerFactory?: unknown;
    /** SingletonStatusManager class (registered in SingletonStatusManager.ts) */
    SingletonStatusManager?: unknown;
    /** SpeechItem class (registered in SpeechItem.ts) */
    SpeechItem?: unknown;

    // Runtime utilities
    /** Toast notification function (registered by components/Toast) */
    showToast?: (message: string, type?: string, duration?: number) => void;
    /** SIDRA data params displayer (registered by HTMLSidraDisplayer) */
    displaySidraDadosParams?: (container: HTMLElement, dataType: string, params: unknown) => void;

    // Runtime environment injection (populated by server template or .env)
    /** Server-injected environment variables (alternative to Vite's import.meta.env) */
    __ENV__?: Record<string, string>;

    // Error tracking SDKs (loaded externally)
    Sentry?: {
      init(config: object): void;
      withScope(callback: (scope: unknown) => void): void;
      captureException(error: unknown): void;
      captureMessage(message: string): void;
      setUser(user: object | null): void;
      BrowserTracing: new(config?: object) => unknown;
      [key: string]: unknown;
    };
    Rollbar?: {
      error(error: unknown, context?: object): void;
      [key: string]: unknown;
    };
  }
}

export {};
