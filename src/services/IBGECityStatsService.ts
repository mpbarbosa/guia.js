/**
 * IBGECityStatsService — fetch city statistics from IBGE Localidades + SIDRA APIs.
 *
 * Given a municipality name and state abbreviation (already extracted from Nominatim),
 * this service queries:
 *   - IBGE Localidades API  → IBGE code, official name, area (km²)
 *   - IBGE SIDRA aggregate 6579 → most recent population estimate
 *
 * @module services/IBGECityStatsService
 * @since 0.17.2-alpha
 * @author Marcelo Pereira Barbosa
 */

import { log, warn } from '../utils/logger.js';
import { env } from '../config/environment.js';

const BASE = (env.ibgeApiUrl as string) || 'https://servicodados.ibge.gov.br';
const CITY_STATS_CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface CityStats {
  /** IBGE municipality code (7-digit). */
  ibgeCode: string;
  /** Official municipality name. */
  name: string;
  /** State abbreviation (UF). */
  uf: string;
  /** Area in km², or null if unavailable. */
  areaKm2: number | null;
  /** Most recent population estimate, or null if unavailable. */
  population: number | null;
  /** Year of the population estimate. */
  populationYear: string | null;
}

interface IbgeLocalidade {
  id: number;
  nome: string;
  microrregiao?: { mesorregiao?: { UF?: { sigla?: string } } };
  'regiao-imediata'?: { 'regiao-intermediaria'?: { UF?: { sigla?: string } } };
}

interface SidraResult {
  resultados?: Array<{
    series?: Array<{
      serie?: Record<string, string>;
    }>;
  }>;
}

const cityStatsCache = new Map<string, CacheEntry<CityStats | null>>();
const inflightCityStatsRequests = new Map<string, Promise<CityStats | null>>();

function buildCityStatsCacheKey(municipio: string, siglaUf: string): string {
  return `${municipio.trim().toLowerCase()}::${siglaUf.trim().toUpperCase()}`;
}

function getCachedCityStats(cacheKey: string): CityStats | null | undefined {
  const cached = cityStatsCache.get(cacheKey);
  if (!cached) return undefined;
  if (cached.expiresAt <= Date.now()) {
    cityStatsCache.delete(cacheKey);
    return undefined;
  }
  return cached.value;
}

function setCachedCityStats(cacheKey: string, value: CityStats | null): void {
  cityStatsCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + CITY_STATS_CACHE_TTL_MS,
  });
}

/**
 * Look up an IBGE municipality by (approximate) name and state.
 * Returns the best match or null.
 */
async function findMunicipioByName(municipio: string, uf: string): Promise<IbgeLocalidade | null> {
  const encoded = encodeURIComponent(municipio);
  const url = `${BASE}/api/v1/localidades/municipios?nome=${encoded}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`IBGE Localidades API error: ${response.status}`);

  const results = await response.json() as IbgeLocalidade[];
  if (!results.length) return null;

  // Prefer exact UF match
  const ufUpper = uf.toUpperCase();
  const exact = results.find(r => {
    const sigla =
      r.microrregiao?.mesorregiao?.UF?.sigla ??
      r['regiao-imediata']?.['regiao-intermediaria']?.UF?.sigla ?? '';
    return sigla.toUpperCase() === ufUpper;
  });

  return exact ?? results[0];
}

/**
 * Fetch area (km²) for a municipality from IBGE Localidades.
 */
async function fetchArea(ibgeCode: string): Promise<number | null> {
  try {
    const url = `${BASE}/api/v2/malhas/municipios/${ibgeCode}?formato=application/json`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json() as { features?: Array<{ properties?: { area_km2?: number } }> };
    return data.features?.[0]?.properties?.area_km2 ?? null;
  } catch {
    warn(`(IBGECityStatsService) Could not fetch area for code ${ibgeCode}`);
    return null;
  }
}

/**
 * Fetch the most recent population estimate from IBGE SIDRA (aggregate 6579).
 * Returns { population, year } or null on failure.
 */
async function fetchPopulation(ibgeCode: string): Promise<{ population: number; year: string } | null> {
  try {
    // Aggregate 6579 = population estimates; variable 9324 = estimated resident population
    const url = `${BASE}/api/v3/agregados/6579/periodos/-1/variaveis/9324?localidades=N6[${ibgeCode}]`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json() as SidraResult[];
    const serie = data[0]?.resultados?.[0]?.series?.[0]?.serie;
    if (!serie) return null;

    const years = Object.keys(serie).sort().reverse();
    if (!years.length) return null;

    const year = years[0];
    const value = parseInt(serie[year], 10);
    return isNaN(value) ? null : { population: value, year };
  } catch {
    warn(`(IBGECityStatsService) Could not fetch population for code ${ibgeCode}`);
    return null;
  }
}

/**
 * Fetch city statistics for a Brazilian municipality.
 *
 * @param municipio - Municipality name (as returned by Nominatim).
 * @param siglaUf   - State abbreviation (e.g. 'SP', 'RJ').
 * @returns Populated CityStats object, or null if the municipality could not be found.
 */
export async function fetchStats(municipio: string, siglaUf: string): Promise<CityStats | null> {
  const cacheKey = buildCityStatsCacheKey(municipio, siglaUf);
  const cachedStats = getCachedCityStats(cacheKey);
  if (cachedStats !== undefined) {
    log(`(IBGECityStatsService) Reusing cached stats for ${municipio} / ${siglaUf}`);
    return cachedStats;
  }

  const inflightRequest = inflightCityStatsRequests.get(cacheKey);
  if (inflightRequest) {
    log(`(IBGECityStatsService) Awaiting in-flight stats request for ${municipio} / ${siglaUf}`);
    return inflightRequest;
  }

  log(`(IBGECityStatsService) Fetching stats for ${municipio} / ${siglaUf}`);

  const requestPromise = (async (): Promise<CityStats | null> => {
    try {
      const localidade = await findMunicipioByName(municipio, siglaUf);
      if (!localidade) {
        warn(`(IBGECityStatsService) Municipality not found: "${municipio}"`);
        setCachedCityStats(cacheKey, null);
        return null;
      }

      const ibgeCode = String(localidade.id);

      const [popData, area] = await Promise.all([
        fetchPopulation(ibgeCode),
        fetchArea(ibgeCode),
      ]);

      const stats: CityStats = {
        ibgeCode,
        name: localidade.nome,
        uf: siglaUf.toUpperCase(),
        areaKm2: area,
        population: popData?.population ?? null,
        populationYear: popData?.year ?? null,
      };

      setCachedCityStats(cacheKey, stats);
      log(`(IBGECityStatsService) Stats for ${stats.name}/${stats.uf}: pop=${stats.population}, area=${stats.areaKm2}km²`);
      return stats;
    } catch (err) {
      warn(`(IBGECityStatsService) Failed to fetch stats for "${municipio}": ${(err as Error).message}`);
      return null;
    } finally {
      inflightCityStatsRequests.delete(cacheKey);
    }
  })();

  inflightCityStatsRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

export function __resetCityStatsCacheForTests(): void {
  cityStatsCache.clear();
  inflightCityStatsRequests.clear();
}

export default { fetchStats };
