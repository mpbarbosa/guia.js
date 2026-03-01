// __tests__/andarilho.test.js
import {
  getNearbyRestaurants,
  searchWikipedia,
  getWikipediaPage,
  extractCityStats,
} from '../src/andarilho';

global.fetch = jest.fn();

describe('getNearbyRestaurants', () => {
  const lat = -19.123;
  const lon = -43.456;
  const radius = 500;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns sorted restaurants by distance (happy path)', async () => {
    const mockElements = [
      { id: 1, lat: lat + 0.001, lon: lon + 0.001, tags: { name: 'A' } },
      { id: 2, lat: lat + 0.002, lon: lon + 0.002, tags: { name: 'B' } },
    ];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ elements: mockElements }),
    });

    const result = await getNearbyRestaurants(lat, lon, radius);
    expect(result).toHaveLength(2);
    expect(result[0].distance).toBeLessThanOrEqual(result[1].distance);
    expect(result[0].tags.name).toBe('A');
    expect(result[1].tags.name).toBe('B');
  });

  it('handles Overpass API error response', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(getNearbyRestaurants(lat, lon, radius)).rejects.toThrow(
      /Overpass API error: 500/,
    );
  });

  it('handles fetch/network error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network down'));
    await expect(getNearbyRestaurants(lat, lon, radius)).rejects.toThrow(
      /Network down/,
    );
  });

  it('handles empty elements array', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ elements: [] }),
    });
    const result = await getNearbyRestaurants(lat, lon, radius);
    expect(result).toEqual([]);
  });

  it('handles elements with center property', async () => {
    const mockElements = [
      {
        id: 3,
        center: { lat: lat + 0.003, lon: lon + 0.003 },
        tags: { name: 'C' },
      },
    ];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ elements: mockElements }),
    });
    const result = await getNearbyRestaurants(lat, lon, radius);
    expect(result[0].tags.name).toBe('C');
    expect(result[0].distance).toBeGreaterThan(0);
  });
});

describe('searchWikipedia', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns search results (happy path)', async () => {
    const mockResults = { query: { search: [{ pageid: 1, title: 'City' }] } };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });
    const result = await searchWikipedia('City');
    expect(result).toEqual(mockResults);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('srsearch=City'),
    );
  });

  it('handles Wikipedia API error response', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(searchWikipedia('City')).rejects.toThrow(
      /Wikipedia API error: 404/,
    );
  });

  it('handles fetch/network error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network fail'));
    await expect(searchWikipedia('City')).rejects.toThrow(/Network fail/);
  });
});

describe('getWikipediaPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns page content (happy path)', async () => {
    const mockPage = { query: { pages: { 1: { extract: 'Some info' } } } };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPage,
    });
    const result = await getWikipediaPage(1);
    expect(result).toEqual(mockPage);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('pageids='),
    );
  });

  it('handles Wikipedia API error response', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 403 });
    await expect(getWikipediaPage(1)).rejects.toThrow(
      /Wikipedia API error: 403/,
    );
  });

  it('handles fetch/network error', async () => {
    fetch.mockRejectedValueOnce(new Error('Fetch error'));
    await expect(getWikipediaPage(1)).rejects.toThrow(/Fetch error/);
  });
});

describe('extractCityStats', () => {
  it('extracts population and area from Wikipedia text (happy path)', () => {
    const wikiData = {
      query: {
        pages: {
          1: {
            extract:
              'The city has a population of 12,345 and an area of 67.89 sq km. Elevation is 800 m. Density is 123.4 / sq km. Time zone UTC-3. Founded 1700.',
          },
        },
      },
    };
    const stats = extractCityStats(wikiData);
    expect(stats.population).toBe('12,345');
    expect(stats.area).toBe('67.89 km');
    expect(stats.otherStats).toEqual(
      expect.arrayContaining([
        { label: 'Elevation', value: '800 m' },
        { label: 'Density', value: '123.4 km' },
        { label: 'Time Zone', value: 'UTC-3' },
        { label: 'Founded', value: '1700.' },
      ]),
    );
  });

  it('returns nulls for missing extract', () => {
    const wikiData = { query: { pages: { 1: {} } } };
    const stats = extractCityStats(wikiData);
    expect(stats.population).toBeNull();
    expect(stats.area).toBeNull();
    expect(stats.otherStats).toEqual([]);
  });

  it('returns nulls for missing pages', () => {
    const wikiData = { query: {} };
    const stats = extractCityStats(wikiData);
    expect(stats.population).toBeNull();
    expect(stats.area).toBeNull();
    expect(stats.otherStats).toEqual([]);
  });

  it('handles edge case: population/area not present', () => {
    const wikiData = {
      query: {
        pages: {
          1: { extract: 'No population or area info here.' },
        },
      },
    };
    const stats = extractCityStats(wikiData);
    expect(stats.population).toBeNull();
    expect(stats.area).toBeNull();
    expect(stats.otherStats).toEqual([]);
  });

  it('handles edge case: otherStats partially present', () => {
    const wikiData = {
      query: {
        pages: {
          1: { extract: 'Elevation is 900 meters. Founded 1800.' },
        },
      },
    };
    const stats = extractCityStats(wikiData);
    expect(stats.population).toBeNull();
    expect(stats.area).toBeNull();
    expect(stats.otherStats).toEqual(
      expect.arrayContaining([
        { label: 'Elevation', value: '900 meters' },
        { label: 'Founded', value: '1800.' },
      ]),
    );
  });
});
