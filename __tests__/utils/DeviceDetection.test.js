/**
 * @jest-environment node
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';


/*
  * Unit tests for device detection and accuracy configuration in guia.js
  * Mock DOM functions for testing
  * Tests cover various user agent strings and screen sizes
  * Ensure referential transparency and deterministic behavior
  * Tests for both mobile and desktop scenarios
  * Validate accuracy configuration based on device type
  * Integration tests with accuracy quality classification
  * Edge cases for missing properties and non-browser environments
  * Clear module cache between tests to ensure fresh evaluation
  * Restore original globals after each test to avoid side effects
  * Use Jest for mocking and assertions
  * Comprehensive coverage of all branches in device detection logic
  * Ensure mobile detection is robust against various user agent formats
  * Validate that desktop detection works correctly with common desktop UAs
  * Test boundary conditions for screen width checks (e.g., exactly 768px)
  * Confirm that touch point detection works across different scenarios
  * Ensure that the presence of window.opera is handled correctly
  * Verify that the absence of navigator or window does not cause errors
  * Check that accuracy settings are stricter for mobile devices as intended
  * Ensure that medium accuracy is accepted on desktop but rejected on mobile
  * Validate that the default accuracy settings are applied in non-browser environments
  * Test with a variety of user agent strings to cover different devices and browsers
  * Ensure that the tests are isolated and do not interfere with each other
  * Use descriptive test names for clarity on what each test is validating
  * Maintainability and readability of test code for future updates
  * Adherence to best practices in unit testing and mocking
  * Ensure that all possible code paths in the device detection logic are tested
  * Validate that the function behaves correctly with both real and mocked inputs
  * Confirm that the function is resilient to unexpected or malformed inputs
  * Ensure that the tests can be run in any environment without relying on a real browser
  * Provide clear error messages when tests fail for easier debugging
  * Use of beforeEach and afterEach hooks to manage test setup and teardown
  * Ensure that the tests are performant and do not introduce significant overhead
  * Comprehensive documentation of test cases for future reference
  * DEVICE_DETECTION.md for detailed explanation of the detection logic
  * ACCURACY_CONFIGURATION.md for details on accuracy settings rationale
  * Ensure compatibility with various versions of Jest and Node.js
  * Regularly update tests to reflect changes in the main codebase
*/
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
    test('should detect mobile device from user agent', async () => {
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
      const { isMobileDevice } = await import('../../src/guia.js');
      
      expect(isMobileDevice()).toBe(true);
    });

    test('should handle missing navigator.userAgent gracefully', async () => {
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
      const { isMobileDevice } = await import('../../src/guia.js');
      
      // Should still work with touch points and small screen (2 out of 3)
      expect(isMobileDevice()).toBe(true);
    });

    test('should handle navigator.vendor fallback', async () => {
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
      const { isMobileDevice } = await import('../../src/guia.js');
      
      // Should detect as desktop (0 out of 3 mobile indicators)
      expect(isMobileDevice()).toBe(false);
    });

    test('should handle window.opera defined', async () => {
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
      const { isMobileDevice } = await import('../../src/guia.js');
      
      // Should detect as desktop
      expect(isMobileDevice()).toBe(false);
    });

    test('should handle edge case: exactly 768px width', async () => {
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
      const { isMobileDevice } = await import('../../src/guia.js');
      
      // Should be desktop (not < 768)
      expect(isMobileDevice()).toBe(false);
    });

    test('should handle edge case: 767px width', async () => {
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
      const { isMobileDevice } = await import('../../src/guia.js');
      
      // Should be mobile (2 out of 3: touch + small screen)
      expect(isMobileDevice()).toBe(true);
    });

    test('should handle maxTouchPoints = 0 explicitly', async () => {
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
      const { isMobileDevice } = await import('../../src/guia.js');
      
      // Should be desktop (0 out of 3)
      expect(isMobileDevice()).toBe(false);
    });

    test('should handle missing maxTouchPoints property', async () => {
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
      const { isMobileDevice } = await import('../../src/guia.js');
      
      // Should still detect mobile from UA and screen width (2 out of 3)
      expect(isMobileDevice()).toBe(true);
    });

    test('should support dependency injection for referential transparency', async () => {
      // Don't need to mock globals - use dependency injection
      jest.resetModules();
      const { isMobileDevice } = await import('../../src/guia.js');
      
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

    test('should be deterministic with same inputs (referential transparency)', async () => {
      jest.resetModules();
      const { isMobileDevice } = await import('../../src/guia.js');
      
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

    test('should detect desktop device from user agent', async () => {
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
      const { isMobileDevice } = await import('../../src/guia.js');
      
      expect(isMobileDevice()).toBe(false);
    });

    test('should detect tablet device', async () => {
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
      const { isMobileDevice } = await import('../../src/guia.js');
      
      expect(isMobileDevice()).toBe(true);
    });

    test('should return false in non-browser environment', async () => {
      // Set both to undefined to simulate Node.js environment
      global.navigator = undefined;
      global.window = undefined;

      // Reload module
      const { isMobileDevice } = await import('../../src/guia.js');
      
      expect(isMobileDevice()).toBe(false);
    });

    test('should use multiple detection methods (scoring)', async () => {
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
      const { isMobileDevice } = await import('../../src/guia.js');
      
      // Should return true because 2 out of 3 indicators suggest mobile
      expect(isMobileDevice()).toBe(true);
    });
  });

  // Tests for setupParams accuracy configuration based on device type
  // Ensure mobile settings are stricter than desktop 
  describe('setupParams accuracy configuration', () => {
    // Ensure accuracy arrays are defined
    // and have expected contents
    // Validate that mobile settings are stricter than desktop
    test('should have mobile and desktop accuracy arrays defined', async () => {
      const { setupParams } = await import('../../src/guia.js');
      
      // Check that both arrays are defined and are arrays
      expect(setupParams.mobileNotAcceptedAccuracy).toBeDefined();
      expect(setupParams.desktopNotAcceptedAccuracy).toBeDefined();
      expect(Array.isArray(setupParams.mobileNotAcceptedAccuracy)).toBe(true);
      expect(Array.isArray(setupParams.desktopNotAcceptedAccuracy)).toBe(true);
    });

    // Validate that mobile settings are stricter than desktop
    // Mobile should reject more accuracy levels than desktop
    // Mobile should reject "medium" accuracy
    // Desktop should accept "medium" accuracy
    // Both should reject "bad" and "very bad"
    // This ensures the intended behavior of accuracy configuration
    test('mobile accuracy should be stricter than desktop', async () => {
      const { setupParams } = await import('../../src/guia.js');
      
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

    test('should initialize notAcceptedAccuracy based on device type in browser', async () => {
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
      const { setupParams } = await import('../../src/guia.js');
      
      // Should use mobile settings
      expect(setupParams.notAcceptedAccuracy).toEqual(setupParams.mobileNotAcceptedAccuracy);
    });

    test('should use mobile settings as default in non-browser environment', async () => {
      // Simulate Node.js environment
      global.navigator = undefined;
      global.window = undefined;

      // Clear cache and reload
      jest.resetModules();
      const { setupParams } = await import('../../src/guia.js');
      
      // Should default to mobile (stricter) settings
      expect(setupParams.notAcceptedAccuracy).toEqual(setupParams.mobileNotAcceptedAccuracy);
    });
  });

  // Integration tests with accuracy quality classification
  // to ensure correct behavior based on device type
  // and accuracy quality
  describe('Integration with accuracy quality classification', () => {
    // Mobile device tests
    // Medium accuracy should be rejected on mobile
    test('mobile device should reject medium accuracy', async () => {
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
      const { setupParams, GeoPosition } = await import('../../src/guia.js');
      
      // Medium accuracy (50 meters) should be rejected on mobile
      const mediumAccuracy = 50;
      const quality = GeoPosition.getAccuracyQuality(mediumAccuracy);
      
      expect(quality).toBe('medium');
      expect(setupParams.notAcceptedAccuracy).toContain('medium');
    });

    // Desktop device tests
    // Medium accuracy should be accepted on desktop
    // since desktop settings are less strict
    test('desktop device should accept medium accuracy', async () => {
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
      const { setupParams, GeoPosition } = await import('../../src/guia.js');
      
      // Medium accuracy (50 meters) should be accepted on desktop
      const mediumAccuracy = 50;
      const quality = GeoPosition.getAccuracyQuality(mediumAccuracy);
      
      expect(quality).toBe('medium');
      expect(setupParams.notAcceptedAccuracy).not.toContain('medium');
    });
  });
});
