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
  }
}

export {};
