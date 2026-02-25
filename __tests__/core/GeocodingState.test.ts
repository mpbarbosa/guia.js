/**
 * @fileoverview Unit tests for GeocodingState class
 * @description Comprehensive test suite for centralized state management
 * Tests cover state initialization, updates, observer pattern, and error handling
 * 
 * @jest-environment node
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock console to suppress logging during tests
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
};

// Mock DOM to prevent errors in test environment
global.document = undefined;

// Mock global utility functions that GeocodingState may use
global.log = jest.fn();
global.warn = jest.fn();

// Import classes under test
let GeocodingState, GeoPosition;
try {
    const geocodingStateModule = await import('../../src/core/GeocodingState.js');
    const geoPositionModule = await import('../../src/core/GeoPosition.js');
    
    GeocodingState = geocodingStateModule.default;
    GeoPosition = geoPositionModule.default;
} catch (error) {
    console.warn('Could not load modules:', error.message);
}

/**
 * Helper function to create mock browser geolocation position object
 * 
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Object} Mock position object compatible with GeoPosition constructor
 */
function createMockPosition(lat, lon) {
  return {
    coords: {
      latitude: lat,
      longitude: lon,
      accuracy: 15,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null
    },
    timestamp: Date.now()
  };
}

describe('GeocodingState', () => {
  describe('Constructor', () => {
    test('should create instance with null initial state', () => {
      const state = new GeocodingState();
      
      expect(state).toBeInstanceOf(GeocodingState);
      expect(state.getCurrentPosition()).toBeNull();
      expect(state.getCurrentCoordinates()).toBeNull();
    });

    test('should initialize with empty observers array', () => {
      const state = new GeocodingState();
      const observerCount = state.toString().match(/observers: (\d+)/)?.[1];
      
      expect(observerCount).toBe('0');
    });
  });

  describe('setPosition()', () => {
    test('should update position with valid GeoPosition', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      state.setPosition(position);
      
      expect(state.getCurrentPosition()).toBe(position);
    });

    test('should update coordinates when position is set', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      state.setPosition(position);
      const coords = state.getCurrentCoordinates();
      
      expect(coords).toEqual({
        latitude: -23.550520,
        longitude: -46.633309
      });
    });

    test('should accept null to clear position', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      state.setPosition(position);
      state.setPosition(null);
      
      expect(state.getCurrentPosition()).toBeNull();
      expect(state.getCurrentCoordinates()).toBeNull();
    });

    test('should throw TypeError for non-GeoPosition values', () => {
      const state = new GeocodingState();
      
      expect(() => {
        state.setPosition({ latitude: 10, longitude: 20 });
      }).toThrow(TypeError);
      
      expect(() => {
        state.setPosition('invalid');
      }).toThrow(TypeError);
      
      expect(() => {
        state.setPosition(123);
      }).toThrow(TypeError);
    });

    test('should notify observers when position changes', () => {
      const state = new GeocodingState();
      const observer = jest.fn();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      state.subscribe(observer);
      state.setPosition(position);
      
      expect(observer).toHaveBeenCalledTimes(1);
      expect(observer).toHaveBeenCalledWith({
        position: position,
        coordinates: { latitude: -23.550520, longitude: -46.633309 }
      });
    });

    test('should notify multiple observers', () => {
      const state = new GeocodingState();
      const observer1 = jest.fn();
      const observer2 = jest.fn();
      const observer3 = jest.fn();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      state.subscribe(observer1);
      state.subscribe(observer2);
      state.subscribe(observer3);
      state.setPosition(position);
      
      const expectedSnapshot = {
        position: position,
        coordinates: { latitude: -23.550520, longitude: -46.633309 }
      };
      expect(observer1).toHaveBeenCalledWith(expectedSnapshot);
      expect(observer2).toHaveBeenCalledWith(expectedSnapshot);
      expect(observer3).toHaveBeenCalledWith(expectedSnapshot);
    });

    test('should not notify observers when position is null', () => {
      const state = new GeocodingState();
      const observer = jest.fn();
      
      state.subscribe(observer);
      state.setPosition(null);
      
      expect(observer).not.toHaveBeenCalled();
    });

    test('should handle observer errors gracefully', () => {
      const state = new GeocodingState();
      const errorObserver = jest.fn(() => {
        throw new Error('Observer error');
      });
      const successObserver = jest.fn();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      state.subscribe(errorObserver);
      state.subscribe(successObserver);
      
      // Should not throw even if observer throws
      expect(() => {
        state.setPosition(position);
      }).not.toThrow();
      
      // Other observers should still be called with snapshot
      expect(successObserver).toHaveBeenCalledWith(expect.objectContaining({
        position: position,
        coordinates: expect.any(Object)
      }));
    });

    test('should allow chaining by returning this', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      const result = state.setPosition(position);
      
      expect(result).toBe(state);
    });
  });

  describe('getCurrentPosition()', () => {
    test('should return null initially', () => {
      const state = new GeocodingState();
      
      expect(state.getCurrentPosition()).toBeNull();
    });

    test('should return current GeoPosition', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      state.setPosition(position);
      
      expect(state.getCurrentPosition()).toBe(position);
    });

    test('should return same instance on multiple calls', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      state.setPosition(position);
      const pos1 = state.getCurrentPosition();
      const pos2 = state.getCurrentPosition();
      
      expect(pos1).toBe(pos2);
    });

    test('should return null after clearing position', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      state.setPosition(position);
      state.setPosition(null);
      
      expect(state.getCurrentPosition()).toBeNull();
    });
  });

  describe('getCurrentCoordinates()', () => {
    test('should return null initially', () => {
      const state = new GeocodingState();
      
      expect(state.getCurrentCoordinates()).toBeNull();
    });

    test('should return coordinates object with latitude and longitude', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      state.setPosition(position);
      const coords = state.getCurrentCoordinates();
      
      expect(coords).toEqual({
        latitude: -23.550520,
        longitude: -46.633309
      });
    });

    test('should return defensive copy (not original)', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      state.setPosition(position);
      const coords1 = state.getCurrentCoordinates();
      const coords2 = state.getCurrentCoordinates();
      
      expect(coords1).toEqual(coords2);
      expect(coords1).not.toBe(coords2); // Different objects
    });

    test('should not allow external mutation of coordinates', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      state.setPosition(position);
      const coords = state.getCurrentCoordinates();
      coords.latitude = 999;
      coords.longitude = 999;
      
      // Internal state should remain unchanged
      const coords2 = state.getCurrentCoordinates();
      expect(coords2).toEqual({
        latitude: -23.550520,
        longitude: -46.633309
      });
    });

    test('should return null after clearing position', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      state.setPosition(position);
      state.setPosition(null);
      
      expect(state.getCurrentCoordinates()).toBeNull();
    });

    test('should handle positions with zero coordinates', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(0, 0));
      
      state.setPosition(position);
      const coords = state.getCurrentCoordinates();
      
      expect(coords).toEqual({
        latitude: 0,
        longitude: 0
      });
    });

    test('should handle extreme coordinate values', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(90, 180));
      
      state.setPosition(position);
      const coords = state.getCurrentCoordinates();
      
      expect(coords).toEqual({
        latitude: 90,
        longitude: 180
      });
    });
  });

  describe('hasPosition()', () => {
    test('should return false initially', () => {
      const state = new GeocodingState();
      
      expect(state.hasPosition()).toBe(false);
    });

    test('should return true after setting position', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      state.setPosition(position);
      
      expect(state.hasPosition()).toBe(true);
    });

    test('should return false after clearing position', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      state.setPosition(position);
      state.setPosition(null);
      
      expect(state.hasPosition()).toBe(false);
    });

    test('should handle rapid state changes', () => {
      const state = new GeocodingState();
      const pos1 = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      const pos2 = new GeoPosition(createMockPosition(40.7128, -74.0060));
      
      expect(state.hasPosition()).toBe(false);
      state.setPosition(pos1);
      expect(state.hasPosition()).toBe(true);
      state.setPosition(pos2);
      expect(state.hasPosition()).toBe(true);
      state.setPosition(null);
      expect(state.hasPosition()).toBe(false);
    });
  });

  describe('subscribe()', () => {
    test('should register observer function', () => {
      const state = new GeocodingState();
      const observer = jest.fn();
      
      const unsubscribe = state.subscribe(observer);
      
      expect(typeof unsubscribe).toBe('function');
    });

    test('should throw TypeError for non-function observer', () => {
      const state = new GeocodingState();
      
      expect(() => {
        state.subscribe(null);
      }).toThrow(TypeError);
      
      expect(() => {
        state.subscribe('not a function');
      }).toThrow(TypeError);
      
      expect(() => {
        state.subscribe({ callback: jest.fn() });
      }).toThrow(TypeError);
    });

    test('should allow multiple subscriptions', () => {
      const state = new GeocodingState();
      const observer1 = jest.fn();
      const observer2 = jest.fn();
      const observer3 = jest.fn();
      
      state.subscribe(observer1);
      state.subscribe(observer2);
      state.subscribe(observer3);
      
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      state.setPosition(position);
      
      expect(observer1).toHaveBeenCalled();
      expect(observer2).toHaveBeenCalled();
      expect(observer3).toHaveBeenCalled();
    });

    test('should return unsubscribe function that works', () => {
      const state = new GeocodingState();
      const observer = jest.fn();
      
      const unsubscribe = state.subscribe(observer);
      unsubscribe();
      
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      state.setPosition(position);
      
      expect(observer).not.toHaveBeenCalled();
    });

    test('should handle unsubscribe called multiple times', () => {
      const state = new GeocodingState();
      const observer = jest.fn();
      
      const unsubscribe = state.subscribe(observer);
      unsubscribe();
      unsubscribe(); // Should not throw
      
      expect(() => unsubscribe()).not.toThrow();
    });

    test('should only remove specific observer on unsubscribe', () => {
      const state = new GeocodingState();
      const observer1 = jest.fn();
      const observer2 = jest.fn();
      const observer3 = jest.fn();
      
      state.subscribe(observer1);
      const unsubscribe2 = state.subscribe(observer2);
      state.subscribe(observer3);
      
      unsubscribe2();
      
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      state.setPosition(position);
      
      expect(observer1).toHaveBeenCalled();
      expect(observer2).not.toHaveBeenCalled();
      expect(observer3).toHaveBeenCalled();
    });

    test('should support observer resubscription after unsubscribe', () => {
      const state = new GeocodingState();
      const observer = jest.fn();
      
      const unsubscribe1 = state.subscribe(observer);
      unsubscribe1();
      
      state.subscribe(observer); // Resubscribe
      
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      state.setPosition(position);
      
      expect(observer).toHaveBeenCalledTimes(1);
    });
  });

  describe('toString()', () => {
    test('should return string with position null initially', () => {
      const state = new GeocodingState();
      const str = state.toString();
      
      expect(str).toContain('GeocodingState');
      expect(str).toContain('position: null');
      expect(str).toContain('observers: 0');
    });

    test('should include coordinates when position is set', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      state.setPosition(position);
      const str = state.toString();
      
      expect(str).toContain('GeocodingState');
      expect(str).toContain('-23.5505');
      expect(str).toContain('-46.6333');
    });

    test('should show observer count', () => {
      const state = new GeocodingState();
      
      state.subscribe(jest.fn());
      state.subscribe(jest.fn());
      state.subscribe(jest.fn());
      
      const str = state.toString();
      expect(str).toContain('observers: 3');
    });

    test('should format coordinates to 4 decimal places', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(-23.550520123456, -46.633309987654));
      
      state.setPosition(position);
      const str = state.toString();
      
      expect(str).toContain('-23.5505');
      expect(str).toContain('-46.6333');
    });

    test('should handle zero coordinates', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(0, 0));
      
      state.setPosition(position);
      const str = state.toString();
      
      expect(str).toContain('0.0000');
    });

    test('should be usable for debugging', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(40.7128, -74.0060));
      
      state.subscribe(jest.fn());
      state.subscribe(jest.fn());
      state.setPosition(position);
      
      const str = state.toString();
      
      expect(str).toMatch(/GeocodingState.*40\.7128.*-74\.0060.*observers: 2/);
    });
  });

  describe('Integration Scenarios', () => {
    test('should support complete workflow: subscribe -> update -> unsubscribe', () => {
      const state = new GeocodingState();
      const observer = jest.fn();
      
      // Subscribe
      const unsubscribe = state.subscribe(observer);
      
      // Update position
      const pos1 = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      state.setPosition(pos1);
      expect(observer).toHaveBeenCalledTimes(1);
      
      // Update position again
      const pos2 = new GeoPosition(createMockPosition(40.7128, -74.0060));
      state.setPosition(pos2);
      expect(observer).toHaveBeenCalledTimes(2);
      
      // Unsubscribe
      unsubscribe();
      
      // Update after unsubscribe
      const pos3 = new GeoPosition(createMockPosition(51.5074, -0.1278));
      state.setPosition(pos3);
      expect(observer).toHaveBeenCalledTimes(2); // Should not increase
      
      // Verify observer was called with correct snapshots
      expect(observer).toHaveBeenNthCalledWith(1, expect.objectContaining({ position: pos1 }));
      expect(observer).toHaveBeenNthCalledWith(2, expect.objectContaining({ position: pos2 }));
    });

    test('should support multiple observers with different lifecycles', () => {
      const state = new GeocodingState();
      const observer1 = jest.fn();
      const observer2 = jest.fn();
      const observer3 = jest.fn();
      
      // Staggered subscriptions
      state.subscribe(observer1);
      
      const pos1 = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      state.setPosition(pos1);
      expect(observer1).toHaveBeenCalledTimes(1);
      
      const unsubscribe2 = state.subscribe(observer2);
      
      const pos2 = new GeoPosition(createMockPosition(40.7128, -74.0060));
      state.setPosition(pos2);
      expect(observer1).toHaveBeenCalledTimes(2);
      expect(observer2).toHaveBeenCalledTimes(1);
      
      unsubscribe2();
      state.subscribe(observer3);
      
      const pos3 = new GeoPosition(createMockPosition(51.5074, -0.1278));
      state.setPosition(pos3);
      expect(observer1).toHaveBeenCalledTimes(3);
      expect(observer2).toHaveBeenCalledTimes(1);
      expect(observer3).toHaveBeenCalledTimes(1);
    });

    test('should maintain state consistency during rapid updates', () => {
      const state = new GeocodingState();
      const positions = [
        new GeoPosition(createMockPosition(-23.550520, -46.633309)),
        new GeoPosition(createMockPosition(40.7128, -74.0060)),
        new GeoPosition(createMockPosition(51.5074, -0.1278)),
        new GeoPosition(createMockPosition(35.6762, 139.6503)),
        new GeoPosition(createMockPosition(-33.8688, 151.2093))
      ];
      
      positions.forEach(pos => {
        state.setPosition(pos);
        expect(state.getCurrentPosition()).toBe(pos);
        expect(state.hasPosition()).toBe(true);
      });
      
      expect(state.getCurrentPosition()).toBe(positions[4]);
    });

    test('should handle observer that modifies state', () => {
      const state = new GeocodingState();
      let callCount = 0;
      
      const observer = jest.fn((snapshot) => {
        callCount++;
        // Observer tries to modify state (should not cause infinite loop)
        if (callCount === 1) {
          // This should work but not trigger the same observer again
          state.setPosition(new GeoPosition(createMockPosition(0, 0)));
        }
      });
      
      state.subscribe(observer);
      
      const pos = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      state.setPosition(pos);
      
      // Observer should be called twice (once for initial, once for nested update)
      expect(observer).toHaveBeenCalled();
      expect(state.getCurrentPosition().latitude).toBe(0);
    });

    test('should support state inspection without modification', () => {
      const state = new GeocodingState();
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      state.setPosition(position);
      
      // Multiple reads should not affect state
      const pos1 = state.getCurrentPosition();
      const coords1 = state.getCurrentCoordinates();
      const hasPos1 = state.hasPosition();
      const str1 = state.toString();
      
      const pos2 = state.getCurrentPosition();
      const coords2 = state.getCurrentCoordinates();
      const hasPos2 = state.hasPosition();
      const str2 = state.toString();
      
      expect(pos1).toBe(pos2);
      expect(coords1).toEqual(coords2);
      expect(hasPos1).toBe(hasPos2);
      expect(str1).toBe(str2);
    });
  });

  describe('Error Handling', () => {
    test('should handle observer throwing during notification', () => {
      const state = new GeocodingState();
      const errorObserver = jest.fn(() => {
        throw new Error('Observer failed');
      });
      const successObserver = jest.fn();
      
      state.subscribe(errorObserver);
      state.subscribe(successObserver);
      
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      
      // Should not throw
      expect(() => {
        state.setPosition(position);
      }).not.toThrow();
      
      // Both observers should have been called
      expect(errorObserver).toHaveBeenCalled();
      expect(successObserver).toHaveBeenCalled();
    });

    test('should maintain state even if all observers throw', () => {
      const state = new GeocodingState();
      const observer1 = jest.fn(() => { throw new Error('Error 1'); });
      const observer2 = jest.fn(() => { throw new Error('Error 2'); });
      
      state.subscribe(observer1);
      state.subscribe(observer2);
      
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      state.setPosition(position);
      
      // State should be updated despite observer errors
      expect(state.getCurrentPosition()).toBe(position);
      expect(state.hasPosition()).toBe(true);
    });

    test('should handle TypeError in setPosition', () => {
      const state = new GeocodingState();
      
      expect(() => {
        state.setPosition('invalid');
      }).toThrow(TypeError);
      
      expect(() => {
        state.setPosition({ lat: 10, lon: 20 });
      }).toThrow(TypeError);
      
      // State should remain unchanged
      expect(state.getCurrentPosition()).toBeNull();
      expect(state.hasPosition()).toBe(false);
    });

    test('should handle TypeError in subscribe', () => {
      const state = new GeocodingState();
      
      expect(() => {
        state.subscribe(null);
      }).toThrow(TypeError);
      
      expect(() => {
        state.subscribe(123);
      }).toThrow(TypeError);
      
      // Should not affect other functionality
      const validObserver = jest.fn();
      expect(() => {
        state.subscribe(validObserver);
      }).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    test('should release observer references on unsubscribe', () => {
      const state = new GeocodingState();
      const observer1 = jest.fn();
      const observer2 = jest.fn();
      
      const unsubscribe1 = state.subscribe(observer1);
      const unsubscribe2 = state.subscribe(observer2);
      
      unsubscribe1();
      unsubscribe2();
      
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      state.setPosition(position);
      
      expect(observer1).not.toHaveBeenCalled();
      expect(observer2).not.toHaveBeenCalled();
      
      const str = state.toString();
      expect(str).toContain('observers: 0');
    });

    test('should handle many observers efficiently', () => {
      const state = new GeocodingState();
      const observers = Array.from({ length: 100 }, () => jest.fn());
      
      // Subscribe all
      observers.forEach(obs => state.subscribe(obs));
      
      // Notify all
      const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
      state.setPosition(position);
      
      // Verify all called with snapshot
      observers.forEach(obs => {
        expect(obs).toHaveBeenCalledWith(expect.objectContaining({
          position: position,
          coordinates: expect.any(Object)
        }));
      });
    });

    test('should allow clearing all observers by unsubscribing', () => {
      const state = new GeocodingState();
      const unsubscribers = [];
      
      for (let i = 0; i < 10; i++) {
        const unsubscribe = state.subscribe(jest.fn());
        unsubscribers.push(unsubscribe);
      }
      
      // Unsubscribe all
      unsubscribers.forEach(unsub => unsub());
      
      const str = state.toString();
      expect(str).toContain('observers: 0');
    });
  });
});
