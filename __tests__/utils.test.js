/**
 * @jest-environment node
 */

// Mock DOM functions for testing
global.document = undefined;

// Import the guia.js functions
const {
  guiaVersion,
  calculateDistance,
  delay,
  getAddressType
} = require('../src/guia.js');

describe('Guia.js Core Utilities', () => {
  
  describe('guiaVersion', () => {
    test('should have correct version structure', () => {
      expect(guiaVersion).toBeDefined();
      expect(guiaVersion.major).toBe(0);
      expect(guiaVersion.minor).toBe(6);
      expect(guiaVersion.patch).toBe(0);
      expect(guiaVersion.prerelease).toBe('alpha');
    });

    test('toString should return correct format', () => {
      expect(guiaVersion.toString()).toBe('0.6.0-alpha');
    });
  });

  describe('calculateDistance', () => {
    test('should calculate distance between same points as 0', () => {
      const distance = calculateDistance(0, 0, 0, 0);
      expect(distance).toBe(0);
    });

    test('should calculate distance between São Paulo center and Cristo Redentor', () => {
      // São Paulo (Sé): -23.5505, -46.6333
      // Rio de Janeiro (Cristo): -22.9519, -43.2105
      const distance = calculateDistance(-23.5505, -46.6333, -22.9519, -43.2105);
      
      // Expected distance is approximately 358 km
      expect(distance).toBeGreaterThan(350000); // 350 km
      expect(distance).toBeLessThan(370000);    // 370 km
    });

    test('should calculate short distances accurately', () => {
      // Two points 1 km apart approximately
      const lat1 = -23.5505, lon1 = -46.6333;
      const lat2 = -23.5505, lon2 = -46.6243; // ~1km east
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(900);   // ~900m
      expect(distance).toBeLessThan(1100);     // ~1100m
    });

    test('should handle negative coordinates', () => {
      const distance = calculateDistance(-10, -10, -20, -20);
      expect(distance).toBeGreaterThan(0);
      expect(typeof distance).toBe('number');
    });
  });

  describe('getAddressType', () => {
    test('should classify residential address correctly', () => {
      const address = { class: 'place', type: 'house' };
      expect(getAddressType(address)).toBe('Residencial');
    });

    test('should classify mall correctly', () => {
      const address = { class: 'shop', type: 'mall' };
      expect(getAddressType(address)).toBe('Shopping Center');
    });

    test('should return unclassified for unknown types', () => {
      const address = { class: 'unknown', type: 'unknown' };
      expect(getAddressType(address)).toBe('Não classificado');
    });

    test('should handle missing properties', () => {
      const address = {};
      expect(getAddressType(address)).toBe('Não classificado');
    });
  });

  describe('delay', () => {
    test('should return a promise', () => {
      const result = delay(1);
      expect(result).toBeInstanceOf(Promise);
    });

    test('should resolve after specified time', async () => {
      const start = Date.now();
      await delay(10);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(9); // Allow some tolerance
    });
  });

});