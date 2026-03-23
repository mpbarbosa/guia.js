// paraty-geocore.test.js
// Tests that validate the runtime behaviour described in src/types/paraty-geocore.d.ts.
// Written as .js so ts-jest skips TypeScript compilation; Jest's moduleNameMapper
// resolves the https:// CDN URL to the local paraty_geocore.js source.
import {
  GeoPosition,
  EARTH_RADIUS_METERS,
  calculateDistance,
  delay,
  GeoPositionError,
} from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.12.3-alpha/dist/esm/index.js';

const validCoords = {
  latitude: -23.219,
  longitude: -44.717,
  accuracy: 5,
  altitude: 10,
  altitudeAccuracy: 2,
  heading: 90,
  speed: 1.5,
};

const validInput = {
  timestamp: 1640995200000,
  coords: validCoords,
};

// ---------------------------------------------------------------------------
describe('GeoPosition', () => {
  it('should create an immutable GeoPosition from valid input', () => {
    const pos = new GeoPosition(validInput);
    expect(pos.latitude).toBe(validCoords.latitude);
    expect(pos.longitude).toBe(validCoords.longitude);
    expect(pos.accuracy).toBe(validCoords.accuracy);
    expect(pos.timestamp).toBe(validInput.timestamp);
    expect(Object.isFrozen(pos)).toBe(true);
    expect(Object.isFrozen(pos.coords)).toBe(true);
    expect(pos.geolocationPosition).not.toBeNull();
  });

  it('should create a GeoPosition using the static from() method', () => {
    const pos = GeoPosition.from(validInput);
    expect(pos).toBeInstanceOf(GeoPosition);
    expect(pos.latitude).toBe(validCoords.latitude);
  });

  it('should throw GeoPositionError for primitive inputs (undefined)', () => {
    expect(() => new GeoPosition(undefined)).toThrow(GeoPositionError);
  });

  it('should throw GeoPositionError for primitive inputs (number)', () => {
    expect(() => new GeoPosition(42)).toThrow(GeoPositionError);
  });

  it('should throw GeoPositionError for primitive inputs (string)', () => {
    expect(() => new GeoPosition('invalid')).toThrow(GeoPositionError);
  });

  it('should not throw for null (null is treated as missing position)', () => {
    expect(() => new GeoPosition(null)).not.toThrow();
  });

  it('should not throw for an empty object input', () => {
    expect(() => new GeoPosition({})).not.toThrow();
  });

  it('should classify accuracy quality correctly via static method', () => {
    // Thresholds: excellent ≤ 10 m, good ≤ 30 m, medium ≤ 100 m, bad ≤ 200 m, > 200 m → very bad
    expect(GeoPosition.getAccuracyQuality(5)).toBe('excellent');
    expect(GeoPosition.getAccuracyQuality(20)).toBe('good');
    expect(GeoPosition.getAccuracyQuality(50)).toBe('medium');
    expect(GeoPosition.getAccuracyQuality(150)).toBe('bad');
    expect(GeoPosition.getAccuracyQuality(300)).toBe('very bad');
  });

  it('should expose accuracyQuality property', () => {
    const pos = new GeoPosition({ coords: { accuracy: 1 } });
    expect(pos.accuracyQuality).toBe('excellent');
  });

  it('should return NaN from distanceTo() when this position has no coordinates', () => {
    const pos = new GeoPosition({});
    expect(pos.distanceTo({ latitude: 0, longitude: 0 })).toBeNaN();
  });

  it('should calculate distanceTo() a nearby point correctly', () => {
    const pos = new GeoPosition({ coords: { latitude: 0, longitude: 0 } });
    const dist = pos.distanceTo({ latitude: 0, longitude: 1 });
    expect(typeof dist).toBe('number');
    expect(dist).toBeGreaterThan(0);
  });

  it('should return a string from toString()', () => {
    const pos = new GeoPosition(validInput);
    const str = pos.toString();
    expect(typeof str).toBe('string');
    expect(str).toContain('GeoPosition');
  });
});

// ---------------------------------------------------------------------------
describe('EARTH_RADIUS_METERS', () => {
  it('should be a positive number in the expected range (~6,371 km)', () => {
    expect(typeof EARTH_RADIUS_METERS).toBe('number');
    expect(EARTH_RADIUS_METERS).toBeGreaterThan(6_000_000);
    expect(EARTH_RADIUS_METERS).toBeLessThan(7_000_000);
  });
});

// ---------------------------------------------------------------------------
describe('calculateDistance', () => {
  it('should return 0 for identical points', () => {
    expect(calculateDistance(0, 0, 0, 0)).toBeCloseTo(0);
  });

  it('should approximate Rio de Janeiro → São Paulo distance (~357 km)', () => {
    const dist = calculateDistance(-22.9068, -43.1729, -23.5505, -46.6333);
    expect(dist).toBeGreaterThan(300_000);
    expect(dist).toBeLessThan(400_000);
  });

  it('should be symmetric (A→B equals B→A)', () => {
    const ab = calculateDistance(-22.9068, -43.1729, -23.5505, -46.6333);
    const ba = calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729);
    expect(ab).toBeCloseTo(ba, 5);
  });

  it('should return a large distance for antipodal points', () => {
    const dist = calculateDistance(0, 0, 0, 180);
    expect(dist).toBeGreaterThan(20_000_000);
  });
});

// ---------------------------------------------------------------------------
describe('delay', () => {
  it('should return a Promise', () => {
    const p = delay(0);
    expect(p).toBeInstanceOf(Promise);
  });

  it('should resolve after the specified milliseconds', async () => {
    const start = Date.now();
    await delay(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(40);
  });

  it('should resolve for delay of 0 ms', async () => {
    await expect(delay(0)).resolves.toBeUndefined();
  });
});
