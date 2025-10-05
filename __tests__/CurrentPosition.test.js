/**
 * @jest-environment node
 */

// Mock DOM functions for testing
global.document = undefined;

// Import the guia.js functions
const { PositionManager, GeoPosition } = require('../src/guia.js');

describe('PositionManager Class', () => {
  
  beforeEach(() => {
    // Reset singleton instance before each test
    PositionManager.instance = null;
  });

  describe('Singleton Pattern', () => {
    test('should create single instance', () => {
      const mockPosition = {
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 10,
          altitude: 760,
          altitudeAccuracy: 5,
          heading: 0,
          speed: 0
        },
        timestamp: Date.now()
      };

      const instance1 = PositionManager.getInstance(mockPosition);
      const instance2 = PositionManager.getInstance(mockPosition);
      
      expect(instance1).toBe(instance2);
      expect(PositionManager.instance).toBe(instance1);
    });

    test('should update existing instance when called again', () => {
      const mockPosition1 = {
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 10,
          altitude: 760,
          altitudeAccuracy: 5,
          heading: 0,
          speed: 0
        },
        timestamp: Date.now()
      };

      const mockPosition2 = {
        coords: {
          latitude: -22.9068,
          longitude: -43.1729,
          accuracy: 8,
          altitude: 11,
          altitudeAccuracy: 3,
          heading: 90,
          speed: 5
        },
        timestamp: Date.now() + 120000 // Add 2 minutes to bypass the time check
      };

      const instance1 = PositionManager.getInstance(mockPosition1);
      expect(instance1.latitude).toBe(-23.5505);
      
      const instance2 = PositionManager.getInstance(mockPosition2);
      expect(instance1).toBe(instance2);
      expect(instance1.latitude).toBe(-22.9068);
    });
  });

  describe('Position Management', () => {
    test('should initialize with position data', () => {
      const mockPosition = {
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 10,
          altitude: 760,
          altitudeAccuracy: 5,
          heading: 0,
          speed: 0
        },
        timestamp: 1234567890
      };

      const instance = new PositionManager(mockPosition);
      
      expect(instance.latitude).toBe(-23.5505);
      expect(instance.longitude).toBe(-46.6333);
      expect(instance._accuracy).toBe(10); // Note: using _accuracy as it's the internal property
      expect(instance.altitude).toBe(760);
      expect(instance.timestamp).toBe(1234567890);
    });

    test('should handle position without coords', () => {
      const instance = new PositionManager(null);
      expect(instance.observers).toEqual([]);
      expect(instance.accuracyQuality).toBeNull();
    });
  });

  describe('Observer Pattern', () => {
    let instance;

    beforeEach(() => {
      instance = new PositionManager();
    });

    test('should subscribe observers', () => {
      const observer = { update: jest.fn() };
      instance.subscribe(observer);
      expect(instance.observers).toContain(observer);
    });

    test('should handle null observer subscription', () => {
      const initialLength = instance.observers.length;
      instance.subscribe(null);
      expect(instance.observers.length).toBe(initialLength);
    });

    test('should unsubscribe observers', () => {
      const observer1 = { update: jest.fn() };
      const observer2 = { update: jest.fn() };
      
      instance.subscribe(observer1);
      instance.subscribe(observer2);
      expect(instance.observers.length).toBe(2);
      
      instance.unsubscribe(observer1);
      expect(instance.observers.length).toBe(1);
      expect(instance.observers).toContain(observer2);
      expect(instance.observers).not.toContain(observer1);
    });
  });

  describe('Distance Calculation', () => {
    test('should calculate distance to another position', () => {
      const position1 = new PositionManager({
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 10
        },
        timestamp: Date.now()
      });

      const position2 = new PositionManager({
        coords: {
          latitude: -22.9068,
          longitude: -43.1729,
          accuracy: 10
        },
        timestamp: Date.now()
      });

      const distance = position1.distanceTo(position2);
      expect(distance).toBeGreaterThan(350000); // > 350km
      expect(distance).toBeLessThan(400000);    // < 400km
    });
  });

  describe('Accuracy Quality', () => {
    test('should classify excellent accuracy', () => {
      expect(GeoPosition.getAccuracyQuality(5)).toBe('excellent');
      expect(GeoPosition.getAccuracyQuality(10)).toBe('excellent');
    });

    test('should classify good accuracy', () => {
      expect(GeoPosition.getAccuracyQuality(20)).toBe('good');
      expect(GeoPosition.getAccuracyQuality(30)).toBe('good');
    });

    test('should classify medium accuracy', () => {
      expect(GeoPosition.getAccuracyQuality(50)).toBe('medium');
      expect(GeoPosition.getAccuracyQuality(100)).toBe('medium');
    });

    test('should classify bad accuracy', () => {
      expect(GeoPosition.getAccuracyQuality(150)).toBe('bad');
      expect(GeoPosition.getAccuracyQuality(200)).toBe('bad');
    });

    test('should classify very bad accuracy', () => {
      expect(GeoPosition.getAccuracyQuality(500)).toBe('very bad');
      expect(GeoPosition.getAccuracyQuality(1000)).toBe('very bad');
    });
  });

  describe('toString Method', () => {
    test('should return formatted string representation', () => {
      const mockPosition = {
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 10,
          altitude: 760,
          altitudeAccuracy: 5,
          heading: 0,
          speed: 0
        },
        timestamp: 1234567890
      };

      const instance = new PositionManager(mockPosition);
      const result = instance.toString();
      
      expect(result).toContain('PositionManager');
      expect(result).toContain('-23.5505');
      expect(result).toContain('-46.6333');
      expect(result).toContain('760');
      expect(result).toContain('1234567890');
    });
  });

});

describe('GeoPosition Class', () => {
  
  describe('toString Method', () => {
    test('should return formatted string representation with all position data', () => {
      const mockPosition = {
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 10,
          altitude: 760,
          altitudeAccuracy: 5,
          heading: 90,
          speed: 5
        },
        timestamp: 1234567890
      };

      const geoPosition = new GeoPosition(mockPosition);
      const result = geoPosition.toString();
      
      expect(result).toContain('GeoPosition');
      expect(result).toContain('-23.5505');
      expect(result).toContain('-46.6333');
      expect(result).toContain('excellent'); // accuracy quality for 10m
      expect(result).toContain('760');
      expect(result).toContain('90');
      expect(result).toContain('5');
      expect(result).toContain('1234567890');
    });

    test('should handle position with good accuracy quality', () => {
      const mockPosition = {
        coords: {
          latitude: -22.9068,
          longitude: -43.1729,
          accuracy: 25, // good accuracy
          altitude: 11,
          altitudeAccuracy: 3,
          heading: 0,
          speed: 0
        },
        timestamp: 9876543210
      };

      const geoPosition = new GeoPosition(mockPosition);
      const result = geoPosition.toString();
      
      expect(result).toContain('GeoPosition');
      expect(result).toContain('-22.9068');
      expect(result).toContain('-43.1729');
      expect(result).toContain('good');
    });

    test('should handle null altitude, heading, and speed', () => {
      const mockPosition = {
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 50, // medium accuracy
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: 1111111111
      };

      const geoPosition = new GeoPosition(mockPosition);
      const result = geoPosition.toString();
      
      expect(result).toContain('GeoPosition');
      expect(result).toContain('-23.5505');
      expect(result).toContain('-46.6333');
      expect(result).toContain('medium');
      expect(result).toContain('null');
    });

    test('should return "No position data" when latitude or longitude is missing', () => {
      const mockPosition = {
        coords: {
          latitude: null,
          longitude: null,
          accuracy: 10,
          altitude: 760,
          altitudeAccuracy: 5,
          heading: 0,
          speed: 0
        },
        timestamp: 1234567890
      };

      const geoPosition = new GeoPosition(mockPosition);
      const result = geoPosition.toString();
      
      expect(result).toBe('GeoPosition: No position data');
    });

    test('should follow same format as PositionManager.toString()', () => {
      const mockPosition = {
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 10,
          altitude: 760,
          altitudeAccuracy: 5,
          heading: 0,
          speed: 0
        },
        timestamp: 1234567890
      };

      const geoPosition = new GeoPosition(mockPosition);
      const result = geoPosition.toString();
      
      // Expected format: "GeoPosition: latitude, longitude, accuracyQuality, altitude, speed, heading, timestamp"
      const expectedPattern = /^GeoPosition: -?\d+\.?\d*, -?\d+\.?\d*, \w+, -?\d+\.?\d*, -?\d+\.?\d*, -?\d+\.?\d*, \d+$/;
      expect(result).toMatch(expectedPattern);
    });
  });

  describe('GeolocationPosition toString Method', () => {
    test('should add toString method to the position parameter with correct values', () => {
      const mockPosition = {
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 10,
          altitude: 760,
          altitudeAccuracy: 5,
          heading: 0,
          speed: 0
        },
        timestamp: 1234567890
      };

      const geoPosition = new GeoPosition(mockPosition);
      
      // Test that the position parameter now has a toString method
      expect(mockPosition.toString).toBeDefined();
      expect(typeof mockPosition.toString).toBe('function');
      
      // Test that the toString method returns correct format
      const result = mockPosition.toString();
      expect(result).toContain('PositionGeolocation');
      expect(result).toContain('latitude');
      expect(result).toContain('longitude');
      expect(result).toContain('accuracy');
      expect(result).toContain('-23.5505');
      expect(result).toContain('-46.6333');
      expect(result).toContain('10');
    });

    test('should show coordinates from coords property', () => {
      const mockPosition = {
        coords: {
          latitude: -22.9068,
          longitude: -43.1729,
          accuracy: 25,
          altitude: 11,
          altitudeAccuracy: 3,
          heading: 0,
          speed: 0
        },
        timestamp: 9876543210
      };

      const geoPosition = new GeoPosition(mockPosition);
      const result = mockPosition.toString();
      
      // Verify the method accesses coords.latitude, coords.longitude, coords.accuracy
      expect(result).toBe('PositionGeolocation: { latitude: -22.9068, longitude: -43.1729, accuracy: 25 }');
    });

    test('should handle different accuracy values', () => {
      const mockPosition = {
        coords: {
          latitude: 0,
          longitude: 0,
          accuracy: 150,
          altitude: 0,
          altitudeAccuracy: 0,
          heading: 0,
          speed: 0
        },
        timestamp: 0
      };

      const geoPosition = new GeoPosition(mockPosition);
      const result = mockPosition.toString();
      
      expect(result).toBe('PositionGeolocation: { latitude: 0, longitude: 0, accuracy: 150 }');
    });
  });

});