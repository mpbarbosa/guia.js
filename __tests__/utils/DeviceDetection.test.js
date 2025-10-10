/**
 * @jest-environment node
 */

// Mock DOM functions for testing
global.document = undefined;

describe('Device Detection and Accuracy Configuration', () => {
  let originalNavigator;
  let originalWindow;

  beforeEach(() => {
    // Save original values
    originalNavigator = global.navigator;
    originalWindow = global.window;
    
    // Clear module cache to allow re-evaluation with new mocks
    jest.resetModules();
  });

  afterEach(() => {
    // Restore originals
    global.navigator = originalNavigator;
    global.window = originalWindow;
  });

  describe('isMobileDevice function', () => {
    test('should detect mobile device from user agent', () => {
      // Mock mobile user agent
      global.navigator = {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        maxTouchPoints: 5,
      };
      global.window = {
        innerWidth: 375,
        opera: undefined,
      };

      // Reload module with mocked navigator
      const { isMobileDevice } = require('../../src/guia.js');
      
      expect(isMobileDevice()).toBe(true);
    });

    test('should handle missing navigator.userAgent gracefully', () => {
      // Mock navigator without userAgent
      global.navigator = {
        maxTouchPoints: 5,
      };
      global.window = {
        innerWidth: 375,
        opera: undefined,
      };

      // Reload module with mocked navigator
      jest.resetModules();
      const { isMobileDevice } = require('../../src/guia.js');
      
      // Should still work with touch points and small screen (2 out of 3)
      expect(isMobileDevice()).toBe(true);
    });

    test('should handle navigator.vendor fallback', () => {
      // Mock with vendor string
      global.navigator = {
        vendor: 'Apple Computer, Inc.',
        maxTouchPoints: 0,
      };
      global.window = {
        innerWidth: 1920,
        opera: undefined,
      };

      // Reload module
      jest.resetModules();
      const { isMobileDevice } = require('../../src/guia.js');
      
      // Should detect as desktop (0 out of 3 mobile indicators)
      expect(isMobileDevice()).toBe(false);
    });

    test('should handle window.opera defined', () => {
      // Mock with Opera browser
      global.navigator = {
        userAgent: 'Opera/9.80',
        maxTouchPoints: 0,
      };
      global.window = {
        innerWidth: 1920,
        opera: 'Opera',
      };

      // Reload module
      jest.resetModules();
      const { isMobileDevice } = require('../../src/guia.js');
      
      // Should detect as desktop
      expect(isMobileDevice()).toBe(false);
    });

    test('should handle edge case: exactly 768px width', () => {
      // Mock device with exactly 768px (boundary case)
      global.navigator = {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
        maxTouchPoints: 0,
      };
      global.window = {
        innerWidth: 768, // Exactly at the threshold
        opera: undefined,
      };

      // Reload module
      jest.resetModules();
      const { isMobileDevice } = require('../../src/guia.js');
      
      // Should be desktop (not < 768)
      expect(isMobileDevice()).toBe(false);
    });

    test('should handle edge case: 767px width', () => {
      // Mock device with 767px (just below threshold)
      global.navigator = {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
        maxTouchPoints: 5,
      };
      global.window = {
        innerWidth: 767, // Just below threshold
        opera: undefined,
      };

      // Reload module
      jest.resetModules();
      const { isMobileDevice } = require('../../src/guia.js');
      
      // Should be mobile (2 out of 3: touch + small screen)
      expect(isMobileDevice()).toBe(true);
    });

    test('should handle maxTouchPoints = 0 explicitly', () => {
      // Mock device with no touch capability
      global.navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        maxTouchPoints: 0,
      };
      global.window = {
        innerWidth: 1920,
        opera: undefined,
      };

      // Reload module
      jest.resetModules();
      const { isMobileDevice } = require('../../src/guia.js');
      
      // Should be desktop (0 out of 3)
      expect(isMobileDevice()).toBe(false);
    });

    test('should handle missing maxTouchPoints property', () => {
      // Mock older browser without maxTouchPoints
      global.navigator = {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      };
      global.window = {
        innerWidth: 375,
        opera: undefined,
      };

      // Reload module
      jest.resetModules();
      const { isMobileDevice } = require('../../src/guia.js');
      
      // Should still detect mobile from UA and screen width (2 out of 3)
      expect(isMobileDevice()).toBe(true);
    });

    test('should support dependency injection for referential transparency', () => {
      // Don't need to mock globals - use dependency injection
      jest.resetModules();
      const { isMobileDevice } = require('../../src/guia.js');
      
      // Test with injected mobile device
      const mobileResult = isMobileDevice({
        navigatorObj: {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
          maxTouchPoints: 5,
        },
        windowObj: {
          innerWidth: 375,
        }
      });
      expect(mobileResult).toBe(true);
      
      // Test with injected desktop device
      const desktopResult = isMobileDevice({
        navigatorObj: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          maxTouchPoints: 0,
        },
        windowObj: {
          innerWidth: 1920,
        }
      });
      expect(desktopResult).toBe(false);
    });

    test('should be deterministic with same inputs (referential transparency)', () => {
      jest.resetModules();
      const { isMobileDevice } = require('../../src/guia.js');
      
      const testInput = {
        navigatorObj: {
          userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
          maxTouchPoints: 5,
        },
        windowObj: {
          innerWidth: 768,
        }
      };
      
      // Multiple calls with same input should return same result
      const result1 = isMobileDevice(testInput);
      const result2 = isMobileDevice(testInput);
      const result3 = isMobileDevice(testInput);
      
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe(true); // Tablet with touch and 768px width
    });

    test('should detect desktop device from user agent', () => {
      // Mock desktop user agent
      global.navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
        maxTouchPoints: 0,
        vendor: '',
      };
      global.window = {
        innerWidth: 1920,
        opera: undefined,
      };

      // Reload module with mocked navigator
      const { isMobileDevice } = require('../../src/guia.js');
      
      expect(isMobileDevice()).toBe(false);
    });

    test('should detect tablet device', () => {
      // Mock tablet user agent
      global.navigator = {
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
        maxTouchPoints: 5,
        vendor: 'Apple Computer, Inc.',
      };
      global.window = {
        innerWidth: 768,
        opera: undefined,
      };

      // Reload module with mocked navigator
      const { isMobileDevice } = require('../../src/guia.js');
      
      expect(isMobileDevice()).toBe(true);
    });

    test('should return false in non-browser environment', () => {
      // Set both to undefined to simulate Node.js environment
      global.navigator = undefined;
      global.window = undefined;

      // Reload module
      const { isMobileDevice } = require('../../src/guia.js');
      
      expect(isMobileDevice()).toBe(false);
    });

    test('should use multiple detection methods (scoring)', () => {
      // Mock device with 2 out of 3 mobile indicators
      global.navigator = {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', // Desktop UA
        maxTouchPoints: 5, // Touch support (mobile indicator)
        vendor: '',
      };
      global.window = {
        innerWidth: 600, // Small screen (mobile indicator)
        opera: undefined,
      };

      // Reload module
      const { isMobileDevice } = require('../../src/guia.js');
      
      // Should return true because 2 out of 3 indicators suggest mobile
      expect(isMobileDevice()).toBe(true);
    });
  });

  describe('setupParams accuracy configuration', () => {
    test('should have mobile and desktop accuracy arrays defined', () => {
      const { setupParams } = require('../../src/guia.js');
      
      expect(setupParams.mobileNotAcceptedAccuracy).toBeDefined();
      expect(setupParams.desktopNotAcceptedAccuracy).toBeDefined();
      expect(Array.isArray(setupParams.mobileNotAcceptedAccuracy)).toBe(true);
      expect(Array.isArray(setupParams.desktopNotAcceptedAccuracy)).toBe(true);
    });

    test('mobile accuracy should be stricter than desktop', () => {
      const { setupParams } = require('../../src/guia.js');
      
      // Mobile should reject more accuracy levels (stricter)
      expect(setupParams.mobileNotAcceptedAccuracy.length).toBeGreaterThanOrEqual(
        setupParams.desktopNotAcceptedAccuracy.length
      );
      
      // Mobile should reject "medium" accuracy
      expect(setupParams.mobileNotAcceptedAccuracy).toContain('medium');
      
      // Desktop should accept "medium" accuracy (not in rejected list)
      expect(setupParams.desktopNotAcceptedAccuracy).not.toContain('medium');
      
      // Both should reject "bad" and "very bad"
      expect(setupParams.mobileNotAcceptedAccuracy).toContain('bad');
      expect(setupParams.mobileNotAcceptedAccuracy).toContain('very bad');
      expect(setupParams.desktopNotAcceptedAccuracy).toContain('bad');
      expect(setupParams.desktopNotAcceptedAccuracy).toContain('very bad');
    });

    test('should initialize notAcceptedAccuracy based on device type in browser', () => {
      // Mock mobile device
      global.navigator = {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        maxTouchPoints: 5,
      };
      global.window = {
        innerWidth: 375,
        opera: undefined,
      };

      // Clear cache and reload to trigger initialization
      jest.resetModules();
      const { setupParams } = require('../../src/guia.js');
      
      // Should use mobile settings
      expect(setupParams.notAcceptedAccuracy).toEqual(setupParams.mobileNotAcceptedAccuracy);
    });

    test('should use mobile settings as default in non-browser environment', () => {
      // Simulate Node.js environment
      global.navigator = undefined;
      global.window = undefined;

      // Clear cache and reload
      jest.resetModules();
      const { setupParams } = require('../../src/guia.js');
      
      // Should default to mobile (stricter) settings
      expect(setupParams.notAcceptedAccuracy).toEqual(setupParams.mobileNotAcceptedAccuracy);
    });
  });

  describe('Integration with accuracy quality classification', () => {
    test('mobile device should reject medium accuracy', () => {
      // Mock mobile device
      global.navigator = {
        userAgent: 'Mozilla/5.0 (Android 11; Mobile)',
        maxTouchPoints: 5,
      };
      global.window = {
        innerWidth: 360,
        opera: undefined,
      };

      jest.resetModules();
      const { setupParams, GeoPosition } = require('../../src/guia.js');
      
      // Medium accuracy (50 meters) should be rejected on mobile
      const mediumAccuracy = 50;
      const quality = GeoPosition.getAccuracyQuality(mediumAccuracy);
      
      expect(quality).toBe('medium');
      expect(setupParams.notAcceptedAccuracy).toContain('medium');
    });

    test('desktop device should accept medium accuracy', () => {
      // Mock desktop device
      global.navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        maxTouchPoints: 0,
      };
      global.window = {
        innerWidth: 1920,
        opera: undefined,
      };

      jest.resetModules();
      const { setupParams, GeoPosition } = require('../../src/guia.js');
      
      // Medium accuracy (50 meters) should be accepted on desktop
      const mediumAccuracy = 50;
      const quality = GeoPosition.getAccuracyQuality(mediumAccuracy);
      
      expect(quality).toBe('medium');
      expect(setupParams.notAcceptedAccuracy).not.toContain('medium');
    });
  });
});
