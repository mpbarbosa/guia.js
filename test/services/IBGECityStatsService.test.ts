import { fetchStats } from '../../src/services/IBGECityStatsService';

jest.mock('../../src/utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
}));
jest.mock('../../src/config/environment.js', () => ({
  env: {},
}));

const { log, warn } = require('../../src/utils/logger.js');

const mockFetch = global.fetch as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
  global.fetch = jest.fn();
});

describe('IBGECityStatsService.fetchStats', () => {
  const municipio = 'São Paulo';
  const siglaUf = 'SP';
  const ibgeCode = 3550308;

  function mockFindMunicipioByNameResponse(results: any[], ok = true) {
    mockFetch
      .mockResolvedValueOnce({
        ok,
        json: async () => results,
      });
  }

  function mockFetchPopulationResponse(data: any, ok = true) {
    mockFetch
      .mockResolvedValueOnce({
        ok,
        json: async () => data,
      });
  }

  function mockFetchAreaResponse(data: any, ok = true) {
    mockFetch
      .mockResolvedValueOnce({
        ok,
        json: async () => data,
      });
  }

  it('returns full CityStats on happy path', async () => {
    // 1. findMunicipioByName
    mockFindMunicipioByNameResponse([
      {
        id: ibgeCode,
        nome: 'São Paulo',
        microrregiao: { mesorregiao: { UF: { sigla: 'SP' } } },
      },
    ]);
    // 2. fetchPopulation
    mockFetchPopulationResponse([
      {
        resultados: [
          {
            series: [
              {
                serie: { '2022': '12345678', '2021': '12000000' },
              },
            ],
          },
        ],
      },
    ]);
    // 3. fetchArea
    mockFetchAreaResponse({
      features: [{ properties: { area_km2: 1521.11 } }],
    });

    const stats = await fetchStats(municipio, siglaUf);

    expect(stats).toEqual({
      ibgeCode: String(ibgeCode),
      name: 'São Paulo',
      uf: 'SP',
      areaKm2: 1521.11,
      population: 12345678,
      populationYear: '2022',
    });
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Fetching stats'));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Stats for São Paulo/SP'));
  });

  it('returns null if municipality not found', async () => {
    mockFindMunicipioByNameResponse([]);
    const stats = await fetchStats('Unknown City', 'ZZ');
    expect(stats).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Municipality not found'));
  });

  it('returns first result if no exact UF match', async () => {
    mockFindMunicipioByNameResponse([
      {
        id: 1,
        nome: 'Cidade X',
        microrregiao: { mesorregiao: { UF: { sigla: 'MG' } } },
      },
      {
        id: 2,
        nome: 'Cidade X',
        microrregiao: { mesorregiao: { UF: { sigla: 'SP' } } },
      },
    ]);
    // fetchPopulation
    mockFetchPopulationResponse([
      {
        resultados: [
          {
            series: [
              {
                serie: { '2020': '1000' },
              },
            ],
          },
        ],
      },
    ]);
    // fetchArea
    mockFetchAreaResponse({
      features: [{ properties: { area_km2: 10 } }],
    });

    const stats = await fetchStats('Cidade X', 'RJ');
    expect(stats?.ibgeCode).toBe('1');
    expect(stats?.name).toBe('Cidade X');
  });

  it('handles missing microrregiao and regiao-imediata gracefully', async () => {
    mockFindMunicipioByNameResponse([
      {
        id: 3,
        nome: 'Cidade Y',
      },
    ]);
    mockFetchPopulationResponse([
      {
        resultados: [
          {
            series: [
              {
                serie: { '2021': '5000' },
              },
            ],
          },
        ],
      },
    ]);
    mockFetchAreaResponse({
      features: [{ properties: { area_km2: 20 } }],
    });

    const stats = await fetchStats('Cidade Y', 'SP');
    expect(stats?.ibgeCode).toBe('3');
    expect(stats?.name).toBe('Cidade Y');
  });

  it('sets areaKm2 to null if fetchArea returns null', async () => {
    mockFindMunicipioByNameResponse([
      {
        id: 4,
        nome: 'Cidade Z',
        microrregiao: { mesorregiao: { UF: { sigla: 'SP' } } },
      },
    ]);
    mockFetchPopulationResponse([
      {
        resultados: [
          {
            series: [
              {
                serie: { '2021': '2000' },
              },
            ],
          },
        ],
      },
    ]);
    mockFetchAreaResponse({ features: [] });

    const stats = await fetchStats('Cidade Z', 'SP');
    expect(stats?.areaKm2).toBeNull();
  });

  it('sets population and year to null if fetchPopulation returns null', async () => {
    mockFindMunicipioByNameResponse([
      {
        id: 5,
        nome: 'Cidade W',
        microrregiao: { mesorregiao: { UF: { sigla: 'SP' } } },
      },
    ]);
    mockFetchPopulationResponse([{}]);
    mockFetchAreaResponse({
      features: [{ properties: { area_km2: 30 } }],
    });

    const stats = await fetchStats('Cidade W', 'SP');
    expect(stats?.population).toBeNull();
    expect(stats?.populationYear).toBeNull();
  });

  it('handles fetchPopulation with empty series', async () => {
    mockFindMunicipioByNameResponse([
      {
        id: 6,
        nome: 'Cidade V',
        microrregiao: { mesorregiao: { UF: { sigla: 'SP' } } },
      },
    ]);
    mockFetchPopulationResponse([
      {
        resultados: [
          {
            series: [],
          },
        ],
      },
    ]);
    mockFetchAreaResponse({
      features: [{ properties: { area_km2: 40 } }],
    });

    const stats = await fetchStats('Cidade V', 'SP');
    expect(stats?.population).toBeNull();
    expect(stats?.populationYear).toBeNull();
  });

  it('handles fetchPopulation with non-numeric value', async () => {
    mockFindMunicipioByNameResponse([
      {
        id: 7,
        nome: 'Cidade U',
        microrregiao: { mesorregiao: { UF: { sigla: 'SP' } } },
      },
    ]);
    mockFetchPopulationResponse([
      {
        resultados: [
          {
            series: [
              {
                serie: { '2022': 'not-a-number' },
              },
            ],
          },
        ],
      },
    ]);
    mockFetchAreaResponse({
      features: [{ properties: { area_km2: 50 } }],
    });

    const stats = await fetchStats('Cidade U', 'SP');
    expect(stats?.population).toBeNull();
    expect(stats?.populationYear).toBeNull();
  });

  it('handles fetchArea API error gracefully', async () => {
    mockFindMunicipioByNameResponse([
      {
        id: 8,
        nome: 'Cidade T',
        microrregiao: { mesorregiao: { UF: { sigla: 'SP' } } },
      },
    ]);
    mockFetchPopulationResponse([
      {
        resultados: [
          {
            series: [
              {
                serie: { '2021': '1234' },
              },
            ],
          },
        ],
      },
    ]);
    // fetchArea returns not ok
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    const stats = await fetchStats('Cidade T', 'SP');
    expect(stats?.areaKm2).toBeNull();
  });

  it('handles fetchPopulation API error gracefully', async () => {
    mockFindMunicipioByNameResponse([
      {
        id: 9,
        nome: 'Cidade S',
        microrregiao: { mesorregiao: { UF: { sigla: 'SP' } } },
      },
    ]);
    // fetchPopulation returns not ok
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });
    mockFetchAreaResponse({
      features: [{ properties: { area_km2: 60 } }],
    });

    const stats = await fetchStats('Cidade S', 'SP');
    expect(stats?.population).toBeNull();
    expect(stats?.populationYear).toBeNull();
  });

  it('handles fetchArea network error gracefully', async () => {
    mockFindMunicipioByNameResponse([
      {
        id: 10,
        nome: 'Cidade R',
        microrregiao: { mesorregiao: { UF: { sigla: 'SP' } } },
      },
    ]);
    mockFetchPopulationResponse([
      {
        resultados: [
          {
            series: [
              {
                serie: { '2021': '4321' },
              },
            ],
          },
        ],
      },
    ]);
    // fetchArea throws
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const stats = await fetchStats('Cidade R', 'SP');
    expect(stats?.areaKm2).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Could not fetch area'));
  });

  it('handles fetchPopulation network error gracefully', async () => {
    mockFindMunicipioByNameResponse([
      {
        id: 11,
        nome: 'Cidade Q',
        microrregiao: { mesorregiao: { UF: { sigla: 'SP' } } },
      },
    ]);
    // fetchPopulation throws
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    mockFetchAreaResponse({
      features: [{ properties: { area_km2: 70 } }],
    });

    const stats = await fetchStats('Cidade Q', 'SP');
    expect(stats?.population).toBeNull();
    expect(stats?.populationYear).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Could not fetch population'));
  });

  it('returns null if all fetches fail', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const stats = await fetchStats('Cidade P', 'SP');
    expect(stats).toBeNull();
  });
});
