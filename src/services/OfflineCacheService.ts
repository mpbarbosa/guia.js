/**
 * OfflineCacheService — persistent storage for recent locations and city stats.
 *
 * Uses IndexedDB when available and falls back to an in-memory store in
 * non-browser or test environments.
 *
 * @module services/OfflineCacheService
 * @since 0.19.1-alpha
 */

import { calculateDistance } from '../utils/distance.js';

const DB_NAME = 'guia-offline-cache';
const DB_VERSION = 1;
const STORE_NAME = 'cache_entries';
const LATEST_LOCATION_KEY = 'location:latest';
const RECENT_LOCATIONS_KEY = 'location:recent';
const MAX_RECENT_LOCATIONS = 10;

const fallbackStore = new Map<string, unknown>();

export interface CachedAddressSummary {
  logradouro?: string | null;
  bairro?: string | null;
  municipio?: string | null;
  siglaUF?: string | null;
  displayText: string;
}

export interface CachedLocationSnapshot {
  latitude: number;
  longitude: number;
  timestamp: number;
  address: CachedAddressSummary | null;
}

export interface CachedCityStats {
  ibgeCode: string;
  name: string;
  uf: string;
  areaKm2: number | null;
  population: number | null;
  populationYear: string | null;
  cachedAt: number;
}

function hasIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openDb(): Promise<IDBDatabase | null> {
  if (!hasIndexedDb()) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
  });
}

async function getStoredValue<T>(key: string): Promise<T | null> {
  const db = await openDb();
  if (!db) {
    return (fallbackStore.get(key) as T | undefined) ?? null;
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve((request.result as T | undefined) ?? null);
      db.close();
    };
    request.onerror = () => {
      db.close();
      reject(request.error ?? new Error(`IndexedDB get failed for key ${key}`));
    };
  });
}

async function setStoredValue<T>(key: string, value: T): Promise<void> {
  const db = await openDb();
  if (!db) {
    fallbackStore.set(key, value);
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error(`IndexedDB put failed for key ${key}`));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error ?? new Error(`IndexedDB transaction failed for key ${key}`));
    };
  });
}

function buildCityStatsKey(municipio: string, siglaUf: string): string {
  return `city-stats:${municipio.trim().toLowerCase()}::${siglaUf.trim().toUpperCase()}`;
}

function sameRoundedLocation(a: CachedLocationSnapshot, b: CachedLocationSnapshot): boolean {
  return a.latitude.toFixed(5) === b.latitude.toFixed(5)
    && a.longitude.toFixed(5) === b.longitude.toFixed(5);
}

function normalizeRecentLocations(
  existing: CachedLocationSnapshot[],
  nextSnapshot: CachedLocationSnapshot,
): CachedLocationSnapshot[] {
  const withoutDuplicate = existing.filter(snapshot => !sameRoundedLocation(snapshot, nextSnapshot));
  return [nextSnapshot, ...withoutDuplicate].slice(0, MAX_RECENT_LOCATIONS);
}

export async function saveLocationSnapshot(snapshot: CachedLocationSnapshot): Promise<CachedLocationSnapshot> {
  const recentSnapshots = (await getStoredValue<CachedLocationSnapshot[]>(RECENT_LOCATIONS_KEY)) ?? [];
  const nextRecentSnapshots = normalizeRecentLocations(recentSnapshots, snapshot);

  await Promise.all([
    setStoredValue(LATEST_LOCATION_KEY, snapshot),
    setStoredValue(RECENT_LOCATIONS_KEY, nextRecentSnapshots),
  ]);

  return snapshot;
}

export async function getLatestLocationSnapshot(): Promise<CachedLocationSnapshot | null> {
  return getStoredValue<CachedLocationSnapshot>(LATEST_LOCATION_KEY);
}

export async function findNearestLocationSnapshot(
  latitude: number,
  longitude: number,
  maxDistanceMeters = 250,
): Promise<CachedLocationSnapshot | null> {
  const snapshots = (await getStoredValue<CachedLocationSnapshot[]>(RECENT_LOCATIONS_KEY)) ?? [];

  let closestSnapshot: CachedLocationSnapshot | null = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const snapshot of snapshots) {
    const distance = calculateDistance(latitude, longitude, snapshot.latitude, snapshot.longitude);
    if (distance <= maxDistanceMeters && distance < closestDistance) {
      closestSnapshot = snapshot;
      closestDistance = distance;
    }
  }

  return closestSnapshot;
}

export async function saveCityStatsToOfflineCache(
  municipio: string,
  siglaUf: string,
  stats: Omit<CachedCityStats, 'cachedAt'>,
): Promise<void> {
  await setStoredValue(buildCityStatsKey(municipio, siglaUf), {
    ...stats,
    cachedAt: Date.now(),
  } satisfies CachedCityStats);
}

export async function getCityStatsFromOfflineCache(
  municipio: string,
  siglaUf: string,
): Promise<CachedCityStats | null> {
  return getStoredValue<CachedCityStats>(buildCityStatsKey(municipio, siglaUf));
}

export async function __resetOfflineCacheForTests(): Promise<void> {
  fallbackStore.clear();

  if (!hasIndexedDb()) return;

  const db = await openDb();
  if (!db) return;

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('IndexedDB clear failed'));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error ?? new Error('IndexedDB clear transaction failed'));
    };
  });
}

export default {
  saveLocationSnapshot,
  getLatestLocationSnapshot,
  findNearestLocationSnapshot,
  saveCityStatsToOfflineCache,
  getCityStatsFromOfflineCache,
};
