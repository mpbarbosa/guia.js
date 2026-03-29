/**
 * Andarilho — Legacy geolocation utilities
 * 
 * These functions were the original geolocation implementation before the
 * SPA refactor. Kept for backward compatibility; prefer WebGeocodingManager
 * for new code.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// `any` is intentional here: `address` is a legacy global injected by the
// surrounding page at runtime; its shape is unknown to TypeScript.

// Globals expected to be set by the surrounding app (legacy pattern)
declare function renderAddress(address: unknown): string;
declare function buildTextToSpeech(address: unknown): string;
declare function speak(text: string): void;
declare function checkGeolocation(container: HTMLElement | null): void;
declare let address: any;

let currentCoords: GeolocationCoordinates | null = null;
let currentAddress: unknown = null;
const findRestaurantsBtn = document.getElementById('findRestaurantsBtn') as HTMLButtonElement | null;
const cityStatsBtn = document.getElementById('cityStatsBtn') as HTMLButtonElement | null;

function getLocation(): void {
  const locationResult = document.getElementById('locationResult');
  checkGeolocation(locationResult);

  currentCoords = null;
  currentAddress = null;

  navigator.geolocation.getCurrentPosition(
    async (_position: GeolocationPosition) => {
      try {
        const addressSection = document.getElementById('addressSection');
        if (addressSection) addressSection.innerHTML = renderAddress(address);

        if (
          address?.address &&
          (address.address.city || address.address.town || address.address.village)
        ) {
          if (cityStatsBtn) cityStatsBtn.disabled = false;
        }

        const text_input = document.getElementById('text-input') as HTMLInputElement | null;
        if (text_input) {
          const tts = buildTextToSpeech(address.address);
          text_input.value = tts;
          console.log('tts:', tts);
          speak(tts);
        }
      } catch (err) {
        const addressSection = document.getElementById('addressSection');
        if (addressSection) {
          addressSection.innerHTML = `<p class="error">Could not retrieve address: ${(err as Error).message}</p>`;
        }
      }
    },
    (err: GeolocationPositionError) => {
      let errorMessage: string;
      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'User denied the request for Geolocation.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable.';
          break;
        case err.TIMEOUT:
          errorMessage = 'The request to get user location timed out.';
          break;
        default:
          errorMessage = 'An unknown error occurred.';
      }
      if (locationResult) locationResult.innerHTML = `<p class="error">Error: ${errorMessage}</p>`;
      if (findRestaurantsBtn) findRestaurantsBtn.disabled = true;
      if (cityStatsBtn) cityStatsBtn.disabled = true;
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

interface OsmElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags: Record<string, string>;
  distance: number;
}

async function findNearbyRestaurants(): Promise<void> {
  if (!currentCoords) {
    alert('Please get your location first');
    return;
  }

  const restaurantsSection = document.getElementById('restaurantsSection');
  const restaurantsList = document.getElementById('restaurantsList');

  if (restaurantsSection) restaurantsSection.style.display = 'block';
  if (restaurantsList) restaurantsList.innerHTML = '<p class="loading">Searching for restaurants within 500 meters...</p>';
  if (findRestaurantsBtn) findRestaurantsBtn.disabled = true;

  try {
    const restaurants = await getNearbyRestaurants(
      currentCoords.latitude,
      currentCoords.longitude,
      500
    );

    if (!restaurantsList) return;

    if (restaurants.length === 0) {
      restaurantsList.innerHTML = '<p>No restaurants found within 500 meters.</p>';
    } else {
      restaurantsList.innerHTML = '';
      restaurants.forEach((restaurant: OsmElement) => {
        const el = document.createElement('div');
        el.className = 'restaurant';
        el.innerHTML = `
          <h4>${restaurant.tags.name || 'Unnamed Restaurant'}</h4>
          ${restaurant.tags.cuisine ? `<p>Cuisine: ${restaurant.tags.cuisine}</p>` : ''}
          ${restaurant.tags['addr:street'] ? `<p>Address: ${restaurant.tags['addr:street']}</p>` : ''}
          <p>Distance: ${Math.round(restaurant.distance)} meters</p>
          <a href="https://www.openstreetmap.org/node/${restaurant.id}" target="_blank">View on Map</a>
        `;
        restaurantsList.appendChild(el);
      });
    }
  } catch (err) {
    if (restaurantsList) restaurantsList.innerHTML = `<p class="error">Failed to fetch restaurants: ${(err as Error).message}</p>`;
  } finally {
    if (findRestaurantsBtn) findRestaurantsBtn.disabled = false;
  }
}

interface WikiSearchResult {
  query?: {
    search?: Array<{ pageid: number; title: string }>;
    pages?: Record<string, { extract?: string }>;
  };
}

interface CityStats {
  population: string | null;
  area: string | null;
  otherStats: Array<{ label: string; value: string }>;
}

async function getCityStats(): Promise<void> {
  const addr = currentAddress as { address?: Record<string, string> } | null;
  if (!addr?.address) {
    alert('City information not available');
    return;
  }

  const cityStatsSection = document.getElementById('cityStatsSection');
  const cityStatsDiv = document.getElementById('cityStats');

  if (cityStatsSection) cityStatsSection.style.display = 'block';
  if (cityStatsDiv) cityStatsDiv.innerHTML = '<p class="loading">Fetching city statistics from Wikipedia...</p>';
  if (cityStatsBtn) cityStatsBtn.disabled = true;

  try {
    const cityName = addr.address.city || addr.address.town || addr.address.village;
    const state = addr.address.state || '';
    const country = addr.address.country || '';

    const searchResults = await searchWikipedia(`${cityName}, ${state} ${country}`);

    if (
      searchResults.query?.search &&
      searchResults.query.search.length > 0 &&
      cityStatsDiv
    ) {
      const pageId = searchResults.query.search[0].pageid;
      const pageTitle = searchResults.query.search[0].title;
      const pageContent = await getWikipediaPage(pageId);
      const stats = extractCityStats(pageContent);

      cityStatsDiv.innerHTML = `
        <h4>${pageTitle}</h4>
        <div class="stats-grid">
          ${stats.population ? `<div class="stat-item"><h4>Population</h4><p>${stats.population}</p></div>` : ''}
          ${stats.area ? `<div class="stat-item"><h4>Area</h4><p>${stats.area}</p></div>` : ''}
        </div>
        ${stats.otherStats.map(s => `
          <div class="stat-item" style="grid-column: 1 / -1;">
            <h4>${s.label}</h4><p>${s.value}</p>
          </div>
        `).join('')}
        <div class="wikipedia-link">
          <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}" target="_blank">
            View full article on Wikipedia
          </a>
        </div>
      `;
    } else if (cityStatsDiv) {
      cityStatsDiv.innerHTML = `<p>No Wikipedia article found for ${addr.address.city || ''}.</p>`;
    }
  } catch (err) {
    if (cityStatsDiv) cityStatsDiv.innerHTML = `<p class="error">Failed to fetch city statistics: ${(err as Error).message}</p>`;
  } finally {
    if (cityStatsBtn) cityStatsBtn.disabled = false;
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getNearbyRestaurants(lat: number, lon: number, radius: number): Promise<OsmElement[]> {
  const query = `
    [out:json];
    (
      node["amenity"="restaurant"](around:${radius},${lat},${lon});
      way["amenity"="restaurant"](around:${radius},${lat},${lon});
      relation["amenity"="restaurant"](around:${radius},${lat},${lon});
    );
    out center;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Overpass API error: ${response.status}`);

  const data = await response.json() as { elements: OsmElement[] };
  return data.elements
    .map((element) => {
      const coords = element.center || { lat: element.lat ?? 0, lon: element.lon ?? 0 };
      return { ...element, distance: calculateDistance(lat, lon, coords.lat, coords.lon) };
    })
    .sort((a, b) => a.distance - b.distance);
}

async function searchWikipedia(searchTerm: string): Promise<WikiSearchResult> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Wikipedia API error: ${response.status}`);
  return response.json() as Promise<WikiSearchResult>;
}

async function getWikipediaPage(pageId: number): Promise<WikiSearchResult> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&pageids=${pageId}&explaintext=true&format=json&origin=*`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Wikipedia API error: ${response.status}`);
  return response.json() as Promise<WikiSearchResult>;
}

function extractCityStats(wikiData: WikiSearchResult): CityStats {
  const result: CityStats = { population: null, area: null, otherStats: [] };

  if (!wikiData.query?.pages) return result;

  const page = Object.values(wikiData.query.pages)[0];
  if (!page?.extract) return result;

  const text = page.extract;

  const populationMatch = text.match(/population\s*[^0-9]*([0-9,]+)/i);
  if (populationMatch) result.population = populationMatch[1];

  const areaMatch = text.match(/area\s*[^0-9]*([0-9,.]+)\s*(sq|square)?\s*(mi|km|miles|kilometers)/i);
  if (areaMatch) result.area = `${areaMatch[1]} ${areaMatch[3] || areaMatch[2] || ''}`.trim();

  const commonStats = [
    { regex: /elevation\s*[^0-9]*([0-9,.]+)\s*(meters|feet|m|ft)/i, label: 'Elevation' },
    { regex: /density\s*[^0-9]*([0-9,.]+)\s*\/\s*(?:sq|square)?\s*(mi|km)/i, label: 'Density' },
    { regex: /time\s*zone\s*([^\s.,;]+)/i, label: 'Time Zone' },
    { regex: /founded\s*([^\n]+)/i, label: 'Founded' },
  ];

  commonStats.forEach(({ regex, label }) => {
    const match = text.match(regex);
    if (match) {
      result.otherStats.push({
        label,
        value: match[1] + (match[2] ? ` ${match[2]}` : '') + (match[3] ? match[3] : ''),
      });
    }
  });

  return result;
}

export {
  getLocation,
  findNearbyRestaurants,
  getCityStats,
  getNearbyRestaurants,
  searchWikipedia,
  getWikipediaPage,
  extractCityStats,
};
