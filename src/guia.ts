'use strict';
import { log as logToConsole, warn as warnToConsole } from './utils/logger.js';
import { showInfo } from './utils/toast.js';

import { calculateDistance, delay } from './utils/distance.js';
import { isMobileDevice } from './utils/device.js';

import {
  APP_VERSION,
  createDefaultConfig,
} from './config/defaults.js';

import { GeoPosition } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.12.9-alpha/dist/esm/index.js';
import ObserverSubject from './core/ObserverSubject.js';
import PositionManager from './core/PositionManager.js';

import ReverseGeocoder from './services/ReverseGeocoder.js';
import GeolocationService from './services/GeolocationService.js';
import ChangeDetectionCoordinator from './services/ChangeDetectionCoordinator.js';

import GeolocationProvider from './services/providers/GeolocationProvider.js';
import BrowserGeolocationProvider from './services/providers/BrowserGeolocationProvider.js';
import MockGeolocationProvider from './services/providers/MockGeolocationProvider.js';

import BrazilianStandardAddress from './data/BrazilianStandardAddress.js';
import ReferencePlace from './data/ReferencePlace.js';
import AddressExtractor from './data/AddressExtractor.js';
import AddressCache from './data/AddressCache.js';
import AddressDataExtractor from './data/AddressDataExtractor.js';

import Chronometer from './timing/Chronometer.js';

import HtmlText from './html/HtmlText.js';
import HTMLPositionDisplayer from './html/HTMLPositionDisplayer.js';
import HTMLReferencePlaceDisplayer from './html/HTMLReferencePlaceDisplayer.js';
import HTMLAddressDisplayer from './html/HTMLAddressDisplayer.js';
import DisplayerFactory from './html/DisplayerFactory.js';
import HtmlSpeechSynthesisDisplayer from './html/HtmlSpeechSynthesisDisplayer.js';

import SpeechItem from './speech/SpeechItem.js';
import SpeechQueue from './speech/SpeechQueue.js';
import SpeechSynthesisManager from './speech/SpeechSynthesisManager.js';

import SingletonStatusManager from './status/SingletonStatusManager.js';

import WebGeocodingManager, { DEFAULT_ELEMENT_IDS } from './coordination/WebGeocodingManager.js';

/** Log wrapper that also appends to the DOM textarea if available */
const log = (message: string, ...params: unknown[]): void => {
  const fullMessage = `[${new Date().toISOString()}] ${message} ${params.join(' ')}`;
  logToConsole(fullMessage);
  if (typeof document !== 'undefined') {
    const el = document.getElementById('bottom-scroll-textarea');
    if (el) el.innerHTML += `${fullMessage}\n`;
  }
};

const warn = (message: string, ...params: unknown[]): void => {
  warnToConsole(message, ...params);
  if (typeof document !== 'undefined') {
    const el = document.getElementById('bottom-scroll-textarea');
    if (el) el.innerHTML += `${message} ${params.join(' ')}\n`;
  }
};

// IbiraAPIFetchManager is loaded asynchronously; starts as undefined.
let IbiraAPIFetchManager: (new(config: object) => unknown) | undefined;

interface IbiraModule {
  IbiraAPIFetchManager?: new(config: object) => unknown;
}

type IbiraLoadResult =
  | { success: true; source: 'cdn' | 'local'; manager: new(config: object) => unknown }
  | { success: false; source: 'fallback'; manager: new(config: object) => unknown };

const ibiraLoadingPromise: Promise<unknown> = (async (): Promise<IbiraLoadResult> => {
  try {
    if (typeof window !== 'undefined') {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('CDN import timeout')), 5000)
        );
        const importPromise = import('https://cdn.jsdelivr.net/gh/mpbarbosa/ibira.js@0.4.13-alpha/src/index.js') as Promise<IbiraModule>;
        const ibiraModule = await Promise.race([importPromise, timeoutPromise]);

        if (!ibiraModule?.IbiraAPIFetchManager) throw new Error('Invalid ibira.js module from CDN');

        IbiraAPIFetchManager = ibiraModule.IbiraAPIFetchManager;
        log('(guia.js) Ibira.js loaded successfully from CDN');
        return { success: true, source: 'cdn', manager: IbiraAPIFetchManager } as IbiraLoadResult;
      } catch (cdnError) {
        warn('(guia.js) CDN load failed:', (cdnError as Error).message, '- trying local module');
      }
    }

    try {
      const ibiraModule = await import('ibira.js') as IbiraModule;
      if (!ibiraModule?.IbiraAPIFetchManager) throw new Error('Invalid ibira.js module from node_modules');

      IbiraAPIFetchManager = ibiraModule.IbiraAPIFetchManager;
      log('(guia.js) Ibira.js loaded successfully from node_modules');
      return { success: true, source: 'local', manager: IbiraAPIFetchManager } as IbiraLoadResult;
    } catch (localError) {
      warn('(guia.js) Local module load failed:', (localError as Error).message);
      throw new Error('Failed to load ibira.js from both CDN and node_modules');
    }
  } catch (err) {
    warn('(guia.js) Failed to load ibira.js from any source:', (err as Error).message);

    class IbiraAPIFetchManagerFallback {
      constructor(_config: object = {}) {
        warn('(IbiraAPIFetchManagerFallback) Using fallback - ibira.js not available');
      }
      async fetch(_url: string): Promise<never> {
        return Promise.reject(new Error('Fallback fetch manager - ibira.js library not available'));
      }
      async fetchData(url: string) {
        return this.fetch(url);
      }
    }

    IbiraAPIFetchManager = IbiraAPIFetchManagerFallback;
    return { success: false, source: 'fallback', manager: IbiraAPIFetchManagerFallback } as IbiraLoadResult;
  }
})();

if (typeof window !== 'undefined') {
  window.ibiraLoadingPromise = ibiraLoadingPromise;
  (window as Window & { log?: unknown; warn?: unknown }).log = log;
  (window as Window & { log?: unknown; warn?: unknown }).warn = warn;

  ibiraLoadingPromise.then(() => {
    if (IbiraAPIFetchManager) window.IbiraAPIFetchManager = IbiraAPIFetchManager;
  }).catch((err: unknown) => {
    warn('ibira.js loading failed:', err);
  });
}

const guiaVersion = APP_VERSION;
const setupParams = createDefaultConfig();

if (typeof navigator !== 'undefined') {
  const isMobile = isMobileDevice();
  setupParams.notAcceptedAccuracy = isMobile
    ? setupParams.mobileNotAcceptedAccuracy
    : setupParams.desktopNotAcceptedAccuracy;
  log(`[Device Detection] Type: ${isMobile ? 'Mobile/Tablet' : 'Desktop/Laptop'}`);
  log(`[Device Detection] Rejecting accuracy levels: ${(setupParams.notAcceptedAccuracy ?? []).join(', ')}`);
} else {
  setupParams.notAcceptedAccuracy = setupParams.mobileNotAcceptedAccuracy;
}

log('Guia.js version:', guiaVersion.toString());

interface AddressData {
  class?: string;
  type?: string;
}

function getAddressType(addressData: AddressData): string {
  if (!addressData?.class || !addressData?.type) return setupParams.noReferencePlace;

  const className = addressData.class;
  const typeName = addressData.type;

  if (!setupParams.validRefPlaceClasses.includes(className)) return setupParams.noReferencePlace;

  const rpMap = ReferencePlace.referencePlaceMap as Record<string, Record<string, string>>;
  if (rpMap[className]?.[typeName]) return rpMap[className][typeName];

  return `${className}: ${typeName}`;
}

function findNearbyRestaurants(latitude: number, longitude: number): void {
  showInfo(`Procurando restaurantes próximos a ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
}

function fetchCityStatistics(latitude: number, longitude: number): void {
  showInfo(`Obtendo estatísticas da cidade para ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
}

export {
  guiaVersion,
  calculateDistance,
  delay,
  getAddressType,
  isMobileDevice,
  setupParams,
  ObserverSubject,
  GeoPosition,
  PositionManager,
  SingletonStatusManager,
  ReverseGeocoder,
  GeolocationService,
  GeolocationProvider,
  BrowserGeolocationProvider,
  MockGeolocationProvider,
  ChangeDetectionCoordinator,
  BrazilianStandardAddress,
  ReferencePlace,
  AddressExtractor,
  AddressCache,
  AddressDataExtractor,
  Chronometer,
  HtmlText,
  HTMLAddressDisplayer,
  HTMLPositionDisplayer,
  HTMLReferencePlaceDisplayer,
  DisplayerFactory,
  HtmlSpeechSynthesisDisplayer,
  SpeechItem,
  SpeechSynthesisManager,
  SpeechQueue,
  IbiraAPIFetchManager,
  ibiraLoadingPromise,
  findNearbyRestaurants,
  fetchCityStatistics,
};

if (typeof window !== 'undefined') {
  const w = window as unknown as Record<string, unknown>;
  w.guiaVersion = guiaVersion;
  w.calculateDistance = calculateDistance;
  w.findNearbyRestaurants = findNearbyRestaurants;
  w.fetchCityStatistics = fetchCityStatistics;
  w.delay = delay;
  w.getAddressType = getAddressType;
  w.isMobileDevice = isMobileDevice;
  w.setupParams = setupParams;
  try { w.DEFAULT_ELEMENT_IDS = DEFAULT_ELEMENT_IDS; } catch (_e) { /* circular dep */ }
  w.ObserverSubject = ObserverSubject;
  w.GeoPosition = GeoPosition;
  w.PositionManager = PositionManager;
  w.SingletonStatusManager = SingletonStatusManager;
  w.ReverseGeocoder = ReverseGeocoder;
  w.GeolocationService = GeolocationService;
  w.GeolocationProvider = GeolocationProvider;
  w.BrowserGeolocationProvider = BrowserGeolocationProvider;
  w.MockGeolocationProvider = MockGeolocationProvider;
  try { w.ChangeDetectionCoordinator = ChangeDetectionCoordinator; } catch (_e) { /* circular dep */ }
  try { w.WebGeocodingManager = WebGeocodingManager; } catch (_e) { /* circular dep */ }
  w.BrazilianStandardAddress = BrazilianStandardAddress;
  w.ReferencePlace = ReferencePlace;
  w.AddressExtractor = AddressExtractor;
  w.AddressCache = AddressCache;
  w.AddressDataExtractor = AddressDataExtractor;
  w.Chronometer = Chronometer;
  w.HtmlText = HtmlText;
  w.HTMLAddressDisplayer = HTMLAddressDisplayer;
  w.HTMLPositionDisplayer = HTMLPositionDisplayer;
  w.HTMLReferencePlaceDisplayer = HTMLReferencePlaceDisplayer;
  w.DisplayerFactory = DisplayerFactory;
  w.HtmlSpeechSynthesisDisplayer = HtmlSpeechSynthesisDisplayer;
  w.SpeechItem = SpeechItem;
  w.SpeechSynthesisManager = SpeechSynthesisManager;
  w.SpeechQueue = SpeechQueue;
}
