/**
 * @jest-environment node
 */

// Mock DOM functions for testing
global.document = undefined;

// Import the guia.js functions
const { CurrentPosition } = require('../guia.js');

describe('CurrentPosition Class', () => {
  
  beforeEach(() => {
    // Reset singleton instance before each test
    CurrentPosition.instance = null;
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

      const instance1 = CurrentPosition.getInstance(mockPosition);
      const instance2 = CurrentPosition.getInstance(mockPosition);
      
      expect(instance1).toBe(instance2);
      expect(CurrentPosition.instance).toBe(instance1);
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

      const instance1 = CurrentPosition.getInstance(mockPosition1);
      expect(instance1.latitude).toBe(-23.5505);
      
      const instance2 = CurrentPosition.getInstance(mockPosition2);
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

      const instance = new CurrentPosition(mockPosition);
      
      expect(instance.latitude).toBe(-23.5505);
      expect(instance.longitude).toBe(-46.6333);
      expect(instance._accuracy).toBe(10); // Note: using _accuracy as it's the internal property
      expect(instance.altitude).toBe(760);
      expect(instance.timestamp).toBe(1234567890);
    });

    test('should handle position without coords', () => {
      const instance = new CurrentPosition(null);
      expect(instance.observers).toEqual([]);
      expect(instance.accuracyQuality).toBeNull();
    });
  });

  describe('Observer Pattern', () => {
    let instance;

    beforeEach(() => {
      instance = new CurrentPosition();
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
      const position1 = new CurrentPosition({
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 10
        },
        timestamp: Date.now()
      });

      const position2 = new CurrentPosition({
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
      expect(CurrentPosition.getAccuracyQuality(5)).toBe('excellent');
      expect(CurrentPosition.getAccuracyQuality(10)).toBe('excellent');
    });

    test('should classify good accuracy', () => {
      expect(CurrentPosition.getAccuracyQuality(20)).toBe('good');
      expect(CurrentPosition.getAccuracyQuality(30)).toBe('good');
    });

    test('should classify medium accuracy', () => {
      expect(CurrentPosition.getAccuracyQuality(50)).toBe('medium');
      expect(CurrentPosition.getAccuracyQuality(100)).toBe('medium');
    });

    test('should classify bad accuracy', () => {
      expect(CurrentPosition.getAccuracyQuality(150)).toBe('bad');
      expect(CurrentPosition.getAccuracyQuality(200)).toBe('bad');
    });

    test('should classify very bad accuracy', () => {
      expect(CurrentPosition.getAccuracyQuality(500)).toBe('very bad');
      expect(CurrentPosition.getAccuracyQuality(1000)).toBe('very bad');
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

      const instance = new CurrentPosition(mockPosition);
      const result = instance.toString();
      
      expect(result).toContain('CurrentPosition');
      expect(result).toContain('-23.5505');
      expect(result).toContain('-46.6333');
      expect(result).toContain('760');
      expect(result).toContain('1234567890');
    });
  });

});