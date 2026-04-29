/**
 * @jest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import {
  __resetRouteNavigationCacheForTests,
  geocodeBrazilianAddress,
  planRoute,
} from '../../src/services/RouteNavigationService.js';

describe('RouteNavigationService', () => {
  beforeEach(() => {
    __resetRouteNavigationCacheForTests();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('geocodes a Brazilian address through Nominatim', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([
        {
          display_name: 'Marco Zero, Recife, Pernambuco, Brasil',
          lat: '-8.063149',
          lon: '-34.871139',
        },
      ]),
    });

    const result = await geocodeBrazilianAddress('Marco Zero, Recife - PE');

    expect(result.displayName).toContain('Marco Zero');
    expect(result.latitude).toBeCloseTo(-8.063149);
    expect(result.longitude).toBeCloseTo(-34.871139);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('countrycodes=br'),
    );
  });

  test('plans a route from current coordinates to a typed destination', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([
          {
            display_name: 'Marco Zero, Recife, Pernambuco, Brasil',
            lat: '-8.063149',
            lon: '-34.871139',
          },
        ]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          code: 'Ok',
          routes: [
            {
              distance: 2450,
              duration: 520,
              legs: [
                {
                  steps: [
                    {
                      distance: 120,
                      duration: 30,
                      name: 'Rua da Aurora',
                      maneuver: { type: 'depart' },
                    },
                    {
                      distance: 2300,
                      duration: 490,
                      name: 'Avenida Alfredo Lisboa',
                      maneuver: { type: 'turn', modifier: 'right' },
                    },
                  ],
                },
              ],
            },
          ],
        }),
      });

    const route = await planRoute({
      origin: {
        latitude: -8.0476,
        longitude: -34.877,
        displayName: 'Localização atual',
      },
      destination: {
        query: 'Marco Zero, Recife - PE',
      },
    });

    expect(route.distanceMeters).toBe(2450);
    expect(route.durationSeconds).toBe(520);
    expect(route.destination.displayName).toContain('Marco Zero');
    expect(route.steps[0].instruction).toContain('Saia');
    expect(route.steps[1].instruction).toContain('Vire');
    expect(route.googleMapsUrl).toContain('google.com/maps/dir');
    expect(route.openStreetMapUrl).toContain('openstreetmap.org/directions');
  });

  test('reuses cached route results for the same origin and destination', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([
          {
            display_name: 'Recife Antigo, Recife, Pernambuco, Brasil',
            lat: '-8.063131',
            lon: '-34.871042',
          },
        ]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([
          {
            display_name: 'Praça do Carmo, Olinda, Pernambuco, Brasil',
            lat: '-8.008889',
            lon: '-34.855278',
          },
        ]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          code: 'Ok',
          routes: [
            {
              distance: 5000,
              duration: 900,
              legs: [{ steps: [] }],
            },
          ],
        }),
      });

    const params = {
      origin: { query: 'Recife Antigo, Recife - PE' },
      destination: { query: 'Praça do Carmo, Olinda - PE' },
    };

    const first = await planRoute(params);
    const second = await planRoute(params);

    expect(second).toEqual(first);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
