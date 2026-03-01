// paraty-geocore.test.ts
import GeoPosition, {
  EARTH_RADIUS_METERS,
  calculateDistance,
  delay,
  GeoPositionError,
  GeoPositionInput,
  GeoCoords,
} from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.9.4-alpha/dist/esm/index.js';

describe('GeoPosition', () => {
  const validCoords: GeoCoords = {
    latitude: -23.219,
    longitude: -44.717,
    accuracy: 5,
    altitude: 10,
    altitudeAccuracy: 2,
    heading: 90,
    speed: 1.5,
  };

  const validInput: GeoPositionInput = {
    timestamp: 1640995200000,
    coords: validCoords,
  };

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

  it('should throw GeoPositionError for invalid input', () => {
    expect(() => new GeoPosition({})).not.toThrow();
    // @ts-expect-error
    expect(() => new GeoPosition(null)).toThrow(GeoPositionError);
    // @ts-expect-error
    expect(() => new GeoPosition(undefined)).toThrow(GeoPositionError);
    // @ts-expect-error
    expect(() => new GeoPosition(42)).toThrow(GeoPositionError);
    // @ts-expect-error
    expect(() => new GeoPosition('invalid')).toThrow(GeoPositionError);
  });

  it('should classify accuracy quality correctly', () => {
    expect(GeoPosition.getAccuracyQuality(1)).toBe('excellent');
    expect(GeoPosition.getAccuracyQuality(5)).toBe('good');
    expect(GeoPosition.getAccuracyQuality(15)).toBe('medium');
    expect(GeoPosition.getAccuracyQuality(50)).toBe('bad');
    expect(GeoPosition.getAccuracyQuality(200)).toBe('very bad');
  });

  it('should use accuracyQuality property and deprecated method', () => {
    const pos = new GeoPosition({ coords: { accuracy: 1 } });
    expect(pos.accuracyQuality).toBe('excellent');
    expect(pos.calculateAccuracyQuality()).toBe('excellent');
  });

  it('should return NaN for distanceTo if coordinates are missing', () => {
    const pos = new GeoPosition({});
    expect(pos.distanceTo({ latitude: 0, longitude: 0 })).toBeNaN();
  });

  it('should calculate distanceTo another position', () => {
    const pos = new GeoPosition({ coords: { latitude: 0, longitude: 0 } });
    const dist = pos.distanceTo({ latitude: 0, longitude: 1 });
    expect(typeof dist).toBe('number');
    expect(dist).toBeGreaterThan(0);
  });

  it('should return a string representation', () => {
    const pos = new GeoPosition(validInput);
    expect(typeof pos.toString()).toBe('string');
    expect(pos.toString()).toContain('GeoPosition');
  });
});

describe('EARTH_RADIUS_METERS', () => {
  it('should be a positive number', () => {
    expect(typeof EARTH_RADIUS_METERS).toBe('number');
    expect(EARTH_RADIUS_METERS).toBeGreaterThan(6000000);
    expect(EARTH_RADIUS_METERS).toBeLessThan(7000000);
  });
});

describe('calculateDistance', () => {
  it('should return 0 for identical points', () => {
    expect(calculateDistance(0, 0, 0, 0)).toBeCloseTo(0);
  });

  it('should return correct distance for known points', () => {
    // Rio de Janeiro (-22.9068, -43.1729) to São Paulo (-23.5505, -46.6333)
    const dist = calculateDistance(-22.9068, -43.1729, -23.5505, -46.6333);
    expect(dist).toBeGreaterThan(300000);
    expect(dist).toBeLessThan(400000);
  });

  it('should handle edge cases (antipodes)', () => {
    const dist = calculateDistance(0, 0, 0, 180);
    expect(dist).toBeGreaterThan(20000000);
  });

  it('should handle invalid input (NaN)', () => {
    expect(calculateDistance(NaN, 0, 0, 0)).toBeNaN();
    expect(calculateDistance(0, NaN, 0, 0)).toBeNaN();
    expect(calculateDistance(0, 0, NaN, 0)).toBeNaN();
    expect(calculateDistance(0, 0, 0, NaN)).toBeNaN();
  });
});

describe('delay', () => {
  it('should resolve after specified milliseconds', async () => {
    const start = Date.now();
    await delay(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(50);
  });

  it('should clamp negative values to 0', async () => {
    const start = Date.now();
    await delay(-100);
    expect(Date.now() - start).toBeGreaterThanOrEqual(0);
  });
});
