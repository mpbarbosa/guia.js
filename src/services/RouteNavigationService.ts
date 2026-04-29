/**
 * RouteNavigationService — geocode Brazilian addresses and plan OSRM routes.
 *
 * @module services/RouteNavigationService
 * @since 0.18.0-alpha
 */

import { log } from '../utils/logger.js';
import { env } from '../config/environment.js';

const NOMINATIM_SEARCH_URL = `${String(env.nominatimApiUrl).replace(/\/$/, '')}/search`;
const OSRM_ROUTE_URL = 'https://router.project-osrm.org/route/v1/driving';
const GEOCODE_CACHE_TTL_MS = 5 * 60 * 1000;
const ROUTE_CACHE_TTL_MS = 2 * 60 * 1000;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface NominatimSearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface OsrmRouteResponse {
  code?: string;
  routes?: Array<{
    distance: number;
    duration: number;
    legs?: Array<{
      steps?: Array<{
        distance: number;
        duration: number;
        name?: string;
        maneuver?: {
          type?: string;
          modifier?: string;
        };
      }>;
    }>;
  }>;
}

export interface RouteLocationInput {
  query?: string;
  latitude?: number;
  longitude?: number;
  displayName?: string;
}

export interface ResolvedRouteLocation {
  displayName: string;
  latitude: number;
  longitude: number;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface PlannedRoute {
  origin: ResolvedRouteLocation;
  destination: ResolvedRouteLocation;
  distanceMeters: number;
  durationSeconds: number;
  steps: RouteStep[];
  googleMapsUrl: string;
  openStreetMapUrl: string;
}

const geocodeCache = new Map<string, CacheEntry<ResolvedRouteLocation>>();
const routeCache = new Map<string, CacheEntry<PlannedRoute>>();
const inflightGeocodeRequests = new Map<string, Promise<ResolvedRouteLocation>>();
const inflightRouteRequests = new Map<string, Promise<PlannedRoute>>();

function getCachedValue<T>(cache: Map<string, CacheEntry<T>>, cacheKey: string): T | undefined {
  const cached = cache.get(cacheKey);
  if (!cached) return undefined;
  if (cached.expiresAt <= Date.now()) {
    cache.delete(cacheKey);
    return undefined;
  }
  return cached.value;
}

function setCachedValue<T>(
  cache: Map<string, CacheEntry<T>>,
  cacheKey: string,
  value: T,
  ttlMs: number,
): void {
  cache.set(cacheKey, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ');
}

function buildGeocodeCacheKey(query: string): string {
  return normalizeQuery(query).toLowerCase();
}

function buildRouteCacheKey(origin: ResolvedRouteLocation, destination: ResolvedRouteLocation): string {
  return [
    origin.latitude.toFixed(5),
    origin.longitude.toFixed(5),
    destination.latitude.toFixed(5),
    destination.longitude.toFixed(5),
  ].join('::');
}

function buildGoogleMapsUrl(origin: ResolvedRouteLocation, destination: ResolvedRouteLocation): string {
  const originCoords = `${origin.latitude},${origin.longitude}`;
  const destinationCoords = `${destination.latitude},${destination.longitude}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originCoords)}&destination=${encodeURIComponent(destinationCoords)}&travelmode=driving`;
}

function buildOpenStreetMapUrl(origin: ResolvedRouteLocation, destination: ResolvedRouteLocation): string {
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${origin.latitude}%2C${origin.longitude}%3B${destination.latitude}%2C${destination.longitude}`;
}

function translateModifier(modifier?: string): string {
  switch (modifier) {
    case 'left':
      return 'à esquerda';
    case 'right':
      return 'à direita';
    case 'slight left':
      return 'levemente à esquerda';
    case 'slight right':
      return 'levemente à direita';
    case 'sharp left':
      return 'forte à esquerda';
    case 'sharp right':
      return 'forte à direita';
    case 'straight':
      return 'em frente';
    case 'uturn':
      return 'para retorno';
    default:
      return '';
  }
}

function buildStepInstruction(
  type: string | undefined,
  modifier: string | undefined,
  name: string | undefined,
): string {
  const roadName = name?.trim() ? ` em ${name.trim()}` : '';

  switch (type) {
    case 'depart':
      return `Saia${roadName}`;
    case 'arrive':
      return 'Chegue ao destino';
    case 'turn': {
      const direction = translateModifier(modifier);
      return direction ? `Vire ${direction}${roadName}` : `Vire${roadName}`;
    }
    case 'continue':
      return `Continue${roadName}`;
    case 'merge':
      return `Siga pela via${roadName}`;
    case 'roundabout':
      return `Entre na rotatória${roadName}`;
    case 'fork': {
      const direction = translateModifier(modifier);
      return direction ? `Mantenha-se ${direction}${roadName}` : `Siga na bifurcação${roadName}`;
    }
    case 'end of road': {
      const direction = translateModifier(modifier);
      return direction ? `No fim da via, vire ${direction}${roadName}` : `No fim da via${roadName}`;
    }
    default:
      return roadName ? `Siga${roadName}` : 'Siga em frente';
  }
}

function assertCoordinates(location: RouteLocationInput, label: 'origem' | 'destino'): ResolvedRouteLocation {
  if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
    throw new Error(`${label[0].toUpperCase()}${label.slice(1)} indisponível para calcular a rota.`);
  }

  const displayName = location.displayName?.trim() || `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
  return {
    displayName,
    latitude: location.latitude,
    longitude: location.longitude,
  };
}

/**
 * Geocode a Brazilian address using Nominatim search.
 */
export async function geocodeBrazilianAddress(query: string): Promise<ResolvedRouteLocation> {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    throw new Error('Informe um endereço válido para calcular a rota.');
  }

  const cacheKey = buildGeocodeCacheKey(normalizedQuery);
  const cachedLocation = getCachedValue(geocodeCache, cacheKey);
  if (cachedLocation) {
    log(`(RouteNavigationService) Reusing cached geocode for "${normalizedQuery}"`);
    return cachedLocation;
  }

  const inflightRequest = inflightGeocodeRequests.get(cacheKey);
  if (inflightRequest) {
    return inflightRequest;
  }

  const requestPromise = (async (): Promise<ResolvedRouteLocation> => {
    try {
      const url = `${NOMINATIM_SEARCH_URL}?format=jsonv2&limit=1&countrycodes=br&accept-language=pt-BR&q=${encodeURIComponent(normalizedQuery)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Nominatim search error: ${response.status} ${response.statusText}`);
      }

      const results = await response.json() as NominatimSearchResult[];
      const firstResult = results[0];
      if (!firstResult) {
        throw new Error(`Nenhum endereço brasileiro encontrado para "${normalizedQuery}".`);
      }

      const resolvedLocation: ResolvedRouteLocation = {
        displayName: firstResult.display_name,
        latitude: Number(firstResult.lat),
        longitude: Number(firstResult.lon),
      };

      setCachedValue(geocodeCache, cacheKey, resolvedLocation, GEOCODE_CACHE_TTL_MS);
      return resolvedLocation;
    } finally {
      inflightGeocodeRequests.delete(cacheKey);
    }
  })();

  inflightGeocodeRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

async function resolveLocation(
  location: RouteLocationInput,
  label: 'origem' | 'destino',
): Promise<ResolvedRouteLocation> {
  if (location.query?.trim()) {
    return geocodeBrazilianAddress(location.query);
  }

  return assertCoordinates(location, label);
}

/**
 * Plan a driving route between two Brazilian locations.
 */
export async function planRoute(params: {
  origin: RouteLocationInput;
  destination: RouteLocationInput;
}): Promise<PlannedRoute> {
  const [origin, destination] = await Promise.all([
    resolveLocation(params.origin, 'origem'),
    resolveLocation(params.destination, 'destino'),
  ]);

  const cacheKey = buildRouteCacheKey(origin, destination);
  const cachedRoute = getCachedValue(routeCache, cacheKey);
  if (cachedRoute) {
    log('(RouteNavigationService) Reusing cached route result');
    return cachedRoute;
  }

  const inflightRequest = inflightRouteRequests.get(cacheKey);
  if (inflightRequest) {
    return inflightRequest;
  }

  const requestPromise = (async (): Promise<PlannedRoute> => {
    try {
      const routeUrl = `${OSRM_ROUTE_URL}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=false&steps=true`;
      const response = await fetch(routeUrl);
      if (!response.ok) {
        throw new Error(`OSRM route error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as OsrmRouteResponse;
      const bestRoute = data.routes?.[0];
      if (!bestRoute) {
        throw new Error('Nenhuma rota viável encontrada entre a origem e o destino.');
      }

      const steps = (bestRoute.legs ?? [])
        .flatMap(leg => leg.steps ?? [])
        .map(step => ({
          instruction: buildStepInstruction(step.maneuver?.type, step.maneuver?.modifier, step.name),
          distanceMeters: Math.round(step.distance),
          durationSeconds: Math.round(step.duration),
        }))
        .filter(step => step.instruction.length > 0);

      const plannedRoute: PlannedRoute = {
        origin,
        destination,
        distanceMeters: Math.round(bestRoute.distance),
        durationSeconds: Math.round(bestRoute.duration),
        steps,
        googleMapsUrl: buildGoogleMapsUrl(origin, destination),
        openStreetMapUrl: buildOpenStreetMapUrl(origin, destination),
      };

      setCachedValue(routeCache, cacheKey, plannedRoute, ROUTE_CACHE_TTL_MS);
      return plannedRoute;
    } finally {
      inflightRouteRequests.delete(cacheKey);
    }
  })();

  inflightRouteRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

export function __resetRouteNavigationCacheForTests(): void {
  geocodeCache.clear();
  routeCache.clear();
  inflightGeocodeRequests.clear();
  inflightRouteRequests.clear();
}

export default {
  geocodeBrazilianAddress,
  planRoute,
};
