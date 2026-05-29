/**
 * Unit tests for NominatimGeocoderPort.
 *
 * Verifies that the custom Nominatim geocoder port correctly maps
 * `address.county` → `metropolitanRegion` (the upstream paraty_geoservices
 * built-in geocoder uses the wrong field `address.region` for this).
 *
 * @since 0.27.0-alpha
 */

import NominatimGeocoderPort from '../../src/services/NominatimGeocoderPort.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Build a minimal Nominatim reverse-geocode response. */
function makeNominatimResponse(addressOverrides: Record<string, unknown> = {}): unknown {
  return {
    place_id: 999,
    display_name: 'Avenida Paulista, Bela Vista, São Paulo, SP, Brasil',
    address: {
      road: 'Avenida Paulista',
      house_number: '1578',
      neighbourhood: 'Bela Vista',
      suburb: 'Bela Vista',
      city: 'São Paulo',
      county: 'Região Metropolitana de São Paulo',
      state: 'São Paulo',
      'ISO3166-2-lvl4': 'BR-SP',
      postcode: '01310-200',
      country: 'Brasil',
      country_code: 'br',
      ...addressOverrides,
    },
  };
}

// ── Mock global fetch ─────────────────────────────────────────────────────────

function mockFetch(responseBody: unknown): void {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue(responseBody),
  } as unknown as Response);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('NominatimGeocoderPort', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('reverseGeocode()', () => {
    it('maps address.county → metropolitanRegion', async () => {
      mockFetch(makeNominatimResponse());
      const port = new NominatimGeocoderPort();
      const result = await port.reverseGeocode(-23.5614, -46.6558);
      expect(result.metropolitanRegion).toBe('Região Metropolitana de São Paulo');
    });

    it('maps address.city → city', async () => {
      mockFetch(makeNominatimResponse());
      const port = new NominatimGeocoderPort();
      const result = await port.reverseGeocode(-23.5614, -46.6558);
      expect(result.city).toBe('São Paulo');
    });

    it('maps address.road → street', async () => {
      mockFetch(makeNominatimResponse());
      const port = new NominatimGeocoderPort();
      const result = await port.reverseGeocode(-23.5614, -46.6558);
      expect(result.street).toBe('Avenida Paulista');
    });

    it('maps ISO3166-2-lvl4 → stateCode', async () => {
      mockFetch(makeNominatimResponse());
      const port = new NominatimGeocoderPort();
      const result = await port.reverseGeocode(-23.5614, -46.6558);
      expect(result.stateCode).toBe('SP');
    });

    it('returns metropolitanRegion null when county is absent', async () => {
      const body = makeNominatimResponse();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (body as any).address.county;
      mockFetch(body);
      const port = new NominatimGeocoderPort();
      const result = await port.reverseGeocode(-23.5614, -46.6558);
      expect(result.metropolitanRegion).toBeNull();
    });

    it('does NOT map address.region → metropolitanRegion (upstream bug workaround)', async () => {
      // The upstream paraty_geoservices geocoder maps t.region → metropolitanRegion.
      // Our port intentionally ignores `region` and reads `county` instead.
      mockFetch(makeNominatimResponse({ region: 'Some Region', county: undefined }));
      const port = new NominatimGeocoderPort();
      const result = await port.reverseGeocode(-23.5614, -46.6558);
      // county is absent/undefined → metropolitanRegion must be null
      expect(result.metropolitanRegion).toBeNull();
    });

    it('builds the correct Nominatim URL with zoom=18 and addressdetails=1', async () => {
      mockFetch(makeNominatimResponse());
      const port = new NominatimGeocoderPort('https://nominatim.example.com');
      await port.reverseGeocode(-23.5614, -46.6558);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).toMatch(/reverse\?format=json/);
      expect(calledUrl).toMatch(/lat=-23\.5614/);
      expect(calledUrl).toMatch(/lon=-46\.6558/);
      expect(calledUrl).toMatch(/zoom=18/);
      expect(calledUrl).toMatch(/addressdetails=1/);
    });

    it('throws when the API returns a non-ok HTTP status', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
      } as unknown as Response);
      const port = new NominatimGeocoderPort();
      await expect(port.reverseGeocode(0, 0)).rejects.toThrow('HTTP 503');
    });

    it('returns empty GeoAddress when the response has no address object', async () => {
      mockFetch({ place_id: 1 }); // no address key
      const port = new NominatimGeocoderPort();
      const result = await port.reverseGeocode(0, 0);
      expect(result.metropolitanRegion).toBeNull();
      expect(result.city).toBeNull();
      expect(result.street).toBeNull();
    });
  });
});
