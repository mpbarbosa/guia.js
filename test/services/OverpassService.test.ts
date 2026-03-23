import { findNearby } from '../../src/services/OverpassService';

jest.mock('../../src/utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
}));
jest.mock('../../src/utils/distance.js', () => ({
  calculateDistance: jest.fn(() => 123),
}));

const { log, warn } = require('../../src/utils/logger.js');
const { calculateDistance } = require('../../src/utils/distance.js');

const mockFetch = global.fetch as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
  global.fetch = jest.fn();
  (calculateDistance as jest.Mock).mockReturnValue(123);
});

describe('OverpassService.findNearby', () => {
  const lat = -23.55052;
  const lon = -46.633308;
  const radius = 500;
  const category = 'restaurant';

  function mockOverpassResponse(elements: any[], ok = true, status = 200, statusText = 'OK') {
    mockFetch.mockResolvedValueOnce({
      ok,
      status,
      statusText,
      json: async () => ({ elements }),
    });
  }

  it('returns sorted named places on happy path', async () => {
    mockOverpassResponse([
      {
        id: 1,
        lat: -23.55,
        lon: -46.63,
        tags: { name: 'A', cuisine: 'pizza' },
      },
      {
        id: 2,
        center: { lat: -23.551, lon: -46.634 },
        tags: { name: 'B' },
      },
      {
        id: 3,
        lat: -23.552,
        lon: -46.635,
        tags: { name: 'C' },
      },
    ]);
    (calculateDistance as jest.Mock)
      .mockReturnValueOnce(50)
      .mockReturnValueOnce(30)
      .mockReturnValueOnce(100);

    const results = await findNearby(lat, lon, radius, category);

    expect(results).toHaveLength(3);
    expect(results[0].name).toBe('B');
    expect(results[1].name).toBe('A');
    expect(results[2].name).toBe('C');
    expect(results[0].distance).toBe(30);
    expect(results[1].distance).toBe(50);
    expect(results[2].distance).toBe(100);
    expect(results[0].osmLink).toBe('https://www.openstreetmap.org/node/2');
    expect(results[1].tags.cuisine).toBe('pizza');
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Searching for restaurant'));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Found 3 named restaurant places'));
  });

  it('filters out unnamed places', async () => {
    mockOverpassResponse([
      { id: 1, lat, lon, tags: {} },
      { id: 2, lat, lon, tags: { name: '' } },
      { id: 3, lat, lon, tags: { name: 'Named' } },
    ]);
    (calculateDistance as jest.Mock).mockReturnValue(42);

    const results = await findNearby(lat, lon, radius, category);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Named');
  });

  it('uses default values for missing lat/lon/center', async () => {
    mockOverpassResponse([
      { id: 1, tags: { name: 'Fallback' } },
    ]);
    (calculateDistance as jest.Mock).mockReturnValue(99);

    const results = await findNearby(lat, lon, radius, category);
    expect(results[0].lat).toBe(lat);
    expect(results[0].lon).toBe(lon);
    expect(results[0].distance).toBe(99);
  });

  it('warns if no named places found', async () => {
    mockOverpassResponse([
      { id: 1, tags: {} },
      { id: 2, tags: { name: '' } },
    ]);
    const results = await findNearby(lat, lon, radius, category);
    expect(results).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('No named restaurant found'));
  });

  it('throws on non-ok HTTP response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    });
    await expect(findNearby(lat, lon, radius, category)).rejects.toThrow('Overpass API error: 500 Internal Server Error');
  });

  it('throws on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network down'));
    await expect(findNearby(lat, lon, radius, category)).rejects.toThrow('Network down');
  });

  it('uses default category and radius if not provided', async () => {
    mockOverpassResponse([
      { id: 1, lat, lon, tags: { name: 'DefaultCat' } },
    ]);
    (calculateDistance as jest.Mock).mockReturnValue(1);

    const results = await findNearby(lat, lon);
    expect(results[0].category).toBe('restaurant');
    expect(results[0].distance).toBe(1);
  });

  it('builds correct query for each category', async () => {
    const categories = ['restaurant', 'pharmacy', 'hospital', 'tourist_info', 'cafe', 'supermarket'] as const;
    for (const cat of categories) {
      mockOverpassResponse([
        { id: 1, lat, lon, tags: { name: cat } },
      ]);
      (calculateDistance as jest.Mock).mockReturnValue(2);
      await findNearby(lat, lon, 1000, cat);
      expect(log).toHaveBeenCalledWith(expect.stringContaining(cat));
    }
  });
});
