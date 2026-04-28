/**
 * OverpassService — query the Overpass API for nearby OpenStreetMap places.
 *
 * @module services/OverpassService
 * @since 0.17.1-alpha
 * @author Marcelo Pereira Barbosa
 */

import { log, warn } from '../utils/logger.js';
import { calculateDistance } from '../utils/distance.js';

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';
const OVERPASS_TIMEOUT = 15;
const NEARBY_CACHE_TTL_MS = 60 * 1000;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export type PlaceCategory = 'restaurant' | 'pharmacy' | 'hospital' | 'tourist_info' | 'cafe' | 'supermarket';

export interface OsmPlace {
  id: number;
  name: string;
  lat: number;
  lon: number;
  /** Distance from query point in metres. */
  distance: number;
  category: PlaceCategory;
  tags: Record<string, string>;
  osmLink: string;
}

const TAG_MAP: Record<PlaceCategory, string> = {
  restaurant:   '"amenity"="restaurant"',
  pharmacy:     '"amenity"="pharmacy"',
  hospital:     '"amenity"="hospital"',
  tourist_info: '"tourism"="information"',
  cafe:         '"amenity"="cafe"',
  supermarket:  '"shop"="supermarket"',
};

const nearbyResultsCache = new Map<string, CacheEntry<OsmPlace[]>>();
const inflightNearbyRequests = new Map<string, Promise<OsmPlace[]>>();

function buildQuery(lat: number, lon: number, radius: number, category: PlaceCategory): string {
  const tag = TAG_MAP[category];
  return `[out:json][timeout:${OVERPASS_TIMEOUT}];(node[${tag}](around:${radius},${lat},${lon});way[${tag}](around:${radius},${lat},${lon}););out center;`;
}

function buildNearbyCacheKey(
  lat: number,
  lon: number,
  radius: number,
  category: PlaceCategory,
): string {
  return `${category}:${radius}:${lat.toFixed(5)}:${lon.toFixed(5)}`;
}

function getCachedNearbyResults(cacheKey: string): OsmPlace[] | undefined {
  const cached = nearbyResultsCache.get(cacheKey);
  if (!cached) return undefined;
  if (cached.expiresAt <= Date.now()) {
    nearbyResultsCache.delete(cacheKey);
    return undefined;
  }
  return cached.value;
}

function setCachedNearbyResults(cacheKey: string, value: OsmPlace[]): void {
  nearbyResultsCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + NEARBY_CACHE_TTL_MS,
  });
}

/**
 * Find nearby places of a given category using the Overpass API.
 *
 * @param lat      - Latitude of the search origin.
 * @param lon      - Longitude of the search origin.
 * @param radius   - Search radius in metres (default 500).
 * @param category - OSM category to search (default 'restaurant').
 * @returns Sorted array of matching places, closest first. Only named places are included.
 * @throws On network failure or non-OK HTTP response.
 */
export async function findNearby(
  lat: number,
  lon: number,
  radius = 500,
  category: PlaceCategory = 'restaurant',
): Promise<OsmPlace[]> {
  const cacheKey = buildNearbyCacheKey(lat, lon, radius, category);
  const cachedResults = getCachedNearbyResults(cacheKey);
  if (cachedResults) {
    log(`(OverpassService) Reusing cached ${category} results`);
    return cachedResults;
  }

  const inflightRequest = inflightNearbyRequests.get(cacheKey);
  if (inflightRequest) {
    log(`(OverpassService) Awaiting in-flight ${category} request`);
    return inflightRequest;
  }

  log(`(OverpassService) Searching for ${category} within ${radius}m of ${lat.toFixed(5)},${lon.toFixed(5)}`);

  const requestPromise = (async (): Promise<OsmPlace[]> => {
    try {
      const query = buildQuery(lat, lon, radius, category);
      const url = `${OVERPASS_API}?data=${encodeURIComponent(query)}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);

      const data = await response.json() as {
        elements: Array<{
          id: number;
          lat?: number;
          lon?: number;
          center?: { lat: number; lon: number };
          tags?: Record<string, string>;
        }>;
      };

      const places = data.elements
        .map(el => {
          const plLat = el.center?.lat ?? el.lat ?? lat;
          const plLon = el.center?.lon ?? el.lon ?? lon;
          const tags = el.tags ?? {};
          return {
            id: el.id,
            name: tags.name ?? '',
            lat: plLat,
            lon: plLon,
            distance: Math.round(calculateDistance(lat, lon, plLat, plLon)),
            category,
            tags,
            osmLink: `https://www.openstreetmap.org/node/${el.id}`,
          };
        })
        .filter(p => p.name.length > 0)
        .sort((a, b) => a.distance - b.distance);

      setCachedNearbyResults(cacheKey, places);
      log(`(OverpassService) Found ${places.length} named ${category} places`);
      if (places.length === 0) warn(`(OverpassService) No named ${category} found within ${radius}m`);

      return places;
    } finally {
      inflightNearbyRequests.delete(cacheKey);
    }
  })();

  inflightNearbyRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

export function __resetNearbyCacheForTests(): void {
  nearbyResultsCache.clear();
  inflightNearbyRequests.clear();
}

export default { findNearby };
