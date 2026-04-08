import {
  getLocation,
  findNearbyRestaurants,
  getCityStats,
  getNearbyRestaurants,
  searchWikipedia,
  getWikipediaPage,
  extractCityStats,
} from '../src/andarilho';

describe('andarilho.ts', () => {
  // --- Mocks and setup ---
  let originalNavigator: any;
  let originalAlert: any;
  let originalConsole: any;
  let domElements: Record<string, HTMLElement> = {};
  let addressGlobal: any;
  let renderAddress: jest.Mock;
  let buildTextToSpeech: jest.Mock;
  let speak: jest.Mock;
  let checkGeolocation: jest.Mock;

  beforeAll(() => {
    // @ts-ignore
    global.renderAddress = renderAddress = jest.fn();
    // @ts-ignore
    global.buildTextToSpeech = buildTextToSpeech = jest.fn();
    // @ts-ignore
    global.speak = speak = jest.fn();
    // @ts-ignore
    global.checkGeolocation = checkGeolocation = jest.fn();
    // @ts-ignore
    global.alert = jest.fn();
    // @ts-ignore
    global.console = { ...console, log: jest.fn() };
  });

  beforeEach(() => {
    // DOM mocks
    domElements = {};
    [
      'findRestaurantsBtn',
      'cityStatsBtn',
      'locationResult',
      'addressSection',
      'text-input',
      'restaurantsSection',
      'restaurantsList',
      'cityStatsSection',
      'cityStats',
    ].forEach((id) => {
      const el = document.createElement('div');
      el.id = id;
      domElements[id] = el;
      if (id === 'findRestaurantsBtn' || id === 'cityStatsBtn') {
        (el as any).disabled = false;
      }
      if (id === 'text-input') {
        const input = document.createElement('input');
        input.id = id;
        domElements[id] = input;
      }
      document.body.appendChild(domElements[id]);
    });

    // @ts-ignore
    document.getElementById = jest.fn((id: string) => domElements[id] || null);

    // Reset global address
    addressGlobal = {
      address: {
        city: 'Testville',
        state: 'TestState',
        country: 'TestCountry',
        town: '',
        village: '',
      },
    };
    // @ts-ignore
    global.address = addressGlobal;

    renderAddress.mockReset();
    buildTextToSpeech.mockReset();
    speak.mockReset();
    checkGeolocation.mockReset();
    // @ts-ignore
    global.alert.mockReset();
    // @ts-ignore
    global.console.log.mockReset();
  });

  afterEach(() => {
    Object.values(domElements).forEach((el) => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
  });

  // --- getLocation ---
  describe('getLocation', () => {
    let getCurrentPositionMock: jest.Mock;

    beforeEach(() => {
      getCurrentPositionMock = jest.fn();
      // In jsdom, window.navigator is read-only; mutate only the geolocation sub-property
      // (jest.setup.js already sets window.navigator.geolocation as a writable plain object).
      window.navigator.geolocation.getCurrentPosition = getCurrentPositionMock;
    });

    afterEach(() => {
      // Restore the no-op stub set by jest.setup.js
      window.navigator.geolocation.getCurrentPosition = () => {};
    });

    it('should call checkGeolocation and reset currentCoords/currentAddress', () => {
      getCurrentPositionMock.mockImplementation(() => {});
      getLocation();
      expect(checkGeolocation).toHaveBeenCalledWith(domElements['locationResult']);
    });

    it('should handle successful geolocation and update DOM, enable cityStatsBtn, set tts, and call speak', async () => {
      renderAddress.mockReturnValue('<div>Rendered Address</div>');
      buildTextToSpeech.mockReturnValue('Hello, world!');
      // @ts-ignore
      global.address = {
        address: {
          city: 'Testville',
          state: 'TestState',
          country: 'TestCountry',
        },
      };

      let successCb: any;
      getCurrentPositionMock.mockImplementation((success, _error) => {
        success({});
      });

      await getLocation();

      expect(renderAddress).toHaveBeenCalled();
      expect(domElements['addressSection'].innerHTML).toContain('Rendered Address');
      expect(domElements['cityStatsBtn'].disabled).toBe(false);
      expect(buildTextToSpeech).toHaveBeenCalled();
      expect((domElements['text-input'] as HTMLInputElement).value).toBe('Hello, world!');
      expect(speak).toHaveBeenCalledWith('Hello, world!');
      expect(console.log).toHaveBeenCalledWith('tts:', 'Hello, world!');
    });

    it('should handle missing addressSection gracefully', async () => {
      domElements['addressSection'].remove();
      getCurrentPositionMock.mockImplementation((success, _error) => {
        success({});
      });
      await getLocation();
      // Should not throw
    });

    it('should handle missing text-input gracefully', async () => {
      domElements['text-input'].remove();
      getCurrentPositionMock.mockImplementation((success, _error) => {
        success({});
      });
      await getLocation();
      // Should not throw
    });

    it('should handle error in success callback and show error in addressSection', async () => {
      renderAddress.mockImplementation(() => {
        throw new Error('fail render');
      });
      getCurrentPositionMock.mockImplementation((success, _error) => {
        success({});
      });
      await getLocation();
      expect(domElements['addressSection'].innerHTML).toContain('Could not retrieve address: fail render');
    });

    it('should handle geolocation error: PERMISSION_DENIED', () => {
      getCurrentPositionMock.mockImplementation((_success, error) => {
        error({ code: 1, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 });
      });
      getLocation();
      expect(domElements['locationResult'].innerHTML).toContain('User denied the request for Geolocation.');
      expect(domElements['findRestaurantsBtn'].disabled).toBe(true);
      expect(domElements['cityStatsBtn'].disabled).toBe(true);
    });

    it('should handle geolocation error: POSITION_UNAVAILABLE', () => {
      getCurrentPositionMock.mockImplementation((_success, error) => {
        error({ code: 2, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 });
      });
      getLocation();
      expect(domElements['locationResult'].innerHTML).toContain('Location information is unavailable.');
    });

    it('should handle geolocation error: TIMEOUT', () => {
      getCurrentPositionMock.mockImplementation((_success, error) => {
        error({ code: 3, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 });
      });
      getLocation();
      expect(domElements['locationResult'].innerHTML).toContain('timed out');
    });

    it('should handle geolocation error: unknown', () => {
      getCurrentPositionMock.mockImplementation((_success, error) => {
        error({ code: 999, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 });
      });
      getLocation();
      expect(domElements['locationResult'].innerHTML).toContain('An unknown error occurred.');
    });
  });

  // --- findNearbyRestaurants ---
  describe('findNearbyRestaurants', () => {
    let fetchMock: jest.SpyInstance;
    let originalCurrentCoords: any;

    beforeEach(() => {
      fetchMock = jest.spyOn(global, 'fetch' as any);
      // @ts-ignore
      originalCurrentCoords = global.currentCoords;
      // @ts-ignore
      global.currentCoords = { latitude: 1, longitude: 2 };
    });

    afterEach(() => {
      fetchMock.mockRestore();
      // @ts-ignore
      global.currentCoords = originalCurrentCoords;
    });

    it('should alert if currentCoords is null', async () => {
      // @ts-ignore
      global.currentCoords = null;
      await findNearbyRestaurants();
      expect(global.alert).toHaveBeenCalledWith('Please get your location first');
    });

    it('should show loading, disable button, and display no restaurants found', async () => {
      const restaurantsList = domElements['restaurantsList'];
      let loadingHtml = '';
      let disabledDuringLoad = false;
      fetchMock.mockImplementation(async () => {
        loadingHtml = restaurantsList.innerHTML;
        disabledDuringLoad = (domElements['findRestaurantsBtn'] as any).disabled;
        return { ok: true, json: async () => ({ elements: [] }) };
      });
      await findNearbyRestaurants();
      expect(loadingHtml).toContain('Searching for restaurants');
      expect(disabledDuringLoad).toBe(true);
      // After fetch
      expect(restaurantsList.innerHTML).toContain('No restaurants found');
      expect(domElements['findRestaurantsBtn'].disabled).toBe(false);
    });

    it('should render found restaurants with all fields', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          elements: [
            {
              id: 123,
              lat: 1,
              lon: 2,
              tags: { name: 'Pizza Place', cuisine: 'Italian', 'addr:street': 'Main St' },
              distance: 100,
            },
          ],
        }),
      });
      const restaurantsList = domElements['restaurantsList'];
      await findNearbyRestaurants();
      expect(restaurantsList.innerHTML).not.toContain('No restaurants found');
      expect(restaurantsList.querySelector('.restaurant')).not.toBeNull();
      expect(restaurantsList.innerHTML).toContain('Pizza Place');
      expect(restaurantsList.innerHTML).toContain('Cuisine: Italian');
      expect(restaurantsList.innerHTML).toContain('Address: Main St');
      expect(restaurantsList.innerHTML).toContain('Distance: 0 meters');
      expect(restaurantsList.innerHTML).toContain('View on Map');
      expect(domElements['findRestaurantsBtn'].disabled).toBe(false);
    });

    it('should handle missing restaurantsList gracefully', async () => {
      domElements['restaurantsList'].remove();
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ elements: [] }),
      });
      await findNearbyRestaurants();
      // Should not throw
    });

    it('should handle fetch error and show error message', async () => {
      fetchMock.mockRejectedValue(new Error('fail fetch'));
      const restaurantsList = domElements['restaurantsList'];
      await findNearbyRestaurants();
      expect(restaurantsList.innerHTML).toContain('Failed to fetch restaurants: fail fetch');
      expect(domElements['findRestaurantsBtn'].disabled).toBe(false);
    });
  });

  // --- getCityStats ---
  describe('getCityStats', () => {
    let fetchMock: jest.SpyInstance;
    let originalCurrentAddress: any;

    beforeEach(() => {
      fetchMock = jest.spyOn(global, 'fetch' as any);
      // @ts-ignore
      originalCurrentAddress = global.currentAddress;
      // @ts-ignore
      global.currentAddress = {
        address: {
          city: 'Testville',
          state: 'TestState',
          country: 'TestCountry',
        },
      };
    });

    afterEach(() => {
      fetchMock.mockRestore();
      // @ts-ignore
      global.currentAddress = originalCurrentAddress;
    });

    it('should alert if currentAddress is missing or lacks address', async () => {
      // @ts-ignore
      global.currentAddress = null;
      await getCityStats();
      expect(global.alert).toHaveBeenCalledWith('City information not available');
    });

    it('should show loading, disable button, and display city stats from Wikipedia', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            query: {
              search: [{ pageid: 42, title: 'Testville' }],
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            query: {
              pages: {
                '42': {
                  extract: 'Testville is a city. The population is 123,456. The area is 789.1 km.',
                },
              },
            },
          }),
        });

      const cityStatsDiv = domElements['cityStats'];
      await getCityStats();
      expect(cityStatsDiv.innerHTML).toContain('Testville');
      expect(cityStatsDiv.innerHTML).toContain('Population');
      expect(cityStatsDiv.innerHTML).toContain('123,456');
      expect(cityStatsDiv.innerHTML).toContain('Area');
      expect(cityStatsDiv.innerHTML).toContain('789.1 km');
      expect(cityStatsDiv.innerHTML).toContain('View full article on Wikipedia');
      expect(domElements['cityStatsBtn'].disabled).toBe(false);
    });

    it('should display no article found if Wikipedia search returns no results', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ query: { search: [] } }),
      });
      const cityStatsDiv = domElements['cityStats'];
      await getCityStats();
      expect(cityStatsDiv.innerHTML).toContain('No Wikipedia article found');
      expect(domElements['cityStatsBtn'].disabled).toBe(false);
    });

    it('should handle fetch error and show error message', async () => {
      fetchMock.mockRejectedValue(new Error('fail wiki'));
      const cityStatsDiv = domElements['cityStats'];
      await getCityStats();
      expect(cityStatsDiv.innerHTML).toContain('Failed to fetch city statistics: fail wiki');
      expect(domElements['cityStatsBtn'].disabled).toBe(false);
    });

    it('should handle missing cityStatsDiv gracefully', async () => {
      domElements['cityStats'].remove();
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ query: { search: [] } }),
      });
      await getCityStats();
      // Should not throw
    });
  });

  // --- getNearbyRestaurants ---
  describe('getNearbyRestaurants', () => {
    let fetchMock: jest.SpyInstance;

    beforeEach(() => {
      fetchMock = jest.spyOn(global, 'fetch' as any);
    });

    afterEach(() => {
      fetchMock.mockRestore();
    });

    it('should fetch and return sorted restaurants with calculated distance', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          elements: [
            { id: 1, lat: 1, lon: 2, tags: {}, distance: 0 },
            { id: 2, lat: 1.01, lon: 2.01, tags: {}, distance: 0 },
          ],
        }),
      });
      const result = await getNearbyRestaurants(1, 2, 500);
      expect(fetchMock).toHaveBeenCalled();
      expect(result.length).toBe(2);
      expect(result[0].distance).toBeLessThanOrEqual(result[1].distance);
    });

    it('should throw if fetch response is not ok', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 500 });
      await expect(getNearbyRestaurants(1, 2, 500)).rejects.toThrow('Overpass API error: 500');
    });
  });

  // --- searchWikipedia ---
  describe('searchWikipedia', () => {
    let fetchMock: jest.SpyInstance;

    beforeEach(() => {
      fetchMock = jest.spyOn(global, 'fetch' as any);
    });

    afterEach(() => {
      fetchMock.mockRestore();
    });

    it('should fetch and return search results', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ query: { search: [{ pageid: 1, title: 'Test' }] } }),
      });
      const result = await searchWikipedia('Test');
      expect(fetchMock).toHaveBeenCalled();
      expect(result.query?.search?.[0].title).toBe('Test');
    });

    it('should throw if fetch response is not ok', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 404 });
      await expect(searchWikipedia('Test')).rejects.toThrow('Wikipedia API error: 404');
    });
  });

  // --- getWikipediaPage ---
  describe('getWikipediaPage', () => {
    let fetchMock: jest.SpyInstance;

    beforeEach(() => {
      fetchMock = jest.spyOn(global, 'fetch' as any);
    });

    afterEach(() => {
      fetchMock.mockRestore();
    });

    it('should fetch and return page data', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ query: { pages: { '1': { extract: 'Test extract' } } } }),
      });
      const result = await getWikipediaPage(1);
      expect(fetchMock).toHaveBeenCalled();
      expect(result.query?.pages?.['1'].extract).toBe('Test extract');
    });

    it('should throw if fetch response is not ok', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 500 });
      await expect(getWikipediaPage(1)).rejects.toThrow('Wikipedia API error: 500');
    });
  });

  // --- extractCityStats ---
  describe('extractCityStats', () => {
    it('should extract population and area from wikiData', () => {
      const wikiData = {
        query: {
          pages: {
            '1': {
              extract: 'The population is 123,456. The area is 789.1 km.',
            },
          },
        },
      };
      const stats = extractCityStats(wikiData);
      expect(stats.population).toBe('123,456');
      expect(stats.area).toBe('789.1 km');
    });

    it('should extract other common stats (elevation, density, time zone, founded)', () => {
      const wikiData = {
        query: {
          pages: {
            '1': {
              extract:
                'Elevation 500 meters. Density 1,234 / km. Time zone UTC+2. Founded 1800.',
            },
          },
        },
      };
      const stats = extractCityStats(wikiData);
      expect(stats.otherStats).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ label: 'Elevation', value: '500 meters' }),
          expect.objectContaining({ label: 'Density', value: '1,234 km' }),
          expect.objectContaining({ label: 'Time Zone', value: 'UTC+2' }),
          expect.objectContaining({ label: 'Founded', value: '1800.' }),
        ])
      );
    });

    it('should return nulls and empty array if no extract', () => {
      const wikiData = { query: { pages: { '1': {} } } };
      const stats = extractCityStats(wikiData);
      expect(stats.population).toBeNull();
      expect(stats.area).toBeNull();
      expect(stats.otherStats).toEqual([]);
    });

    it('should return nulls and empty array if no pages', () => {
      const wikiData = { query: {} };
      const stats = extractCityStats(wikiData);
      expect(stats.population).toBeNull();
      expect(stats.area).toBeNull();
      expect(stats.otherStats).toEqual([]);
    });
  });
});
