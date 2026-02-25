/**
 * Tests for BrowserGeolocationProvider
 * 
 * This test suite verifies that:
 * - BrowserGeolocationProvider wraps navigator.geolocation correctly
 * - Dependency injection works for navigator object
 * - Browser API support detection is accurate
 * - All methods delegate to navigator.geolocation
 * 
 * @jest-environment node
 * @author MP Barbosa
 * @since 0.6.1-alpha
 */

import { describe, test, expect, jest } from '@jest/globals';
import BrowserGeolocationProvider from '../../../src/services/providers/BrowserGeolocationProvider.js';

describe('BrowserGeolocationProvider', () => {
	
	describe('Constructor and Initialization', () => {
		test('should accept navigator object via dependency injection', () => {
			const mockNavigator = { geolocation: {} };
			const provider = new BrowserGeolocationProvider(mockNavigator);
			
			expect(provider.navigator).toBe(mockNavigator);
		});

		test('should use global navigator if none provided', () => {
			// Save original navigator
			const originalNavigator = global.navigator;
			
			try {
				global.navigator = { geolocation: {} };
				const provider = new BrowserGeolocationProvider();
				
				expect(provider.navigator).toBe(global.navigator);
			} finally {
				// Restore original navigator
				global.navigator = originalNavigator;
			}
		});

		test('should handle undefined navigator gracefully', () => {
			const provider = new BrowserGeolocationProvider(undefined);
			
			expect(provider.navigator).toBeNull();
		});
	});

	describe('isSupported()', () => {
		test('should return true when navigator has geolocation', () => {
			const mockNavigator = { geolocation: {} };
			const provider = new BrowserGeolocationProvider(mockNavigator);
			
			expect(provider.isSupported()).toBe(true);
		});

		test('should return false when navigator is null', () => {
			const provider = new BrowserGeolocationProvider(null);
			
			expect(provider.isSupported()).toBe(false);
		});

		test('should return false when navigator has no geolocation', () => {
			const mockNavigator = {};
			const provider = new BrowserGeolocationProvider(mockNavigator);
			
			expect(provider.isSupported()).toBe(false);
		});
	});

	describe('isPermissionsAPISupported()', () => {
		test('should return true when navigator has permissions', () => {
			const mockNavigator = { 
				geolocation: {},
				permissions: { query: jest.fn() }
			};
			const provider = new BrowserGeolocationProvider(mockNavigator);
			
			expect(provider.isPermissionsAPISupported()).toBe(true);
		});

		test('should return false when navigator has no permissions', () => {
			const mockNavigator = { geolocation: {} };
			const provider = new BrowserGeolocationProvider(mockNavigator);
			
			expect(provider.isPermissionsAPISupported()).toBe(false);
		});

		test('should return false when navigator is null', () => {
			const provider = new BrowserGeolocationProvider(null);
			
			expect(provider.isPermissionsAPISupported()).toBe(false);
		});
	});

	describe('getCurrentPosition()', () => {
		test('should delegate to navigator.geolocation.getCurrentPosition', () => {
			const mockGetCurrentPosition = jest.fn();
			const mockNavigator = {
				geolocation: {
					getCurrentPosition: mockGetCurrentPosition
				}
			};
			const provider = new BrowserGeolocationProvider(mockNavigator);
			
			const successCallback = jest.fn();
			const errorCallback = jest.fn();
			const options = { enableHighAccuracy: true };
			
			provider.getCurrentPosition(successCallback, errorCallback, options);
			
			expect(mockGetCurrentPosition).toHaveBeenCalledWith(
				successCallback,
				errorCallback,
				options
			);
		});

		test('should call error callback when not supported', () => {
			const provider = new BrowserGeolocationProvider(null);
			const errorCallback = jest.fn();
			
			provider.getCurrentPosition(jest.fn(), errorCallback, {});
			
			expect(errorCallback).toHaveBeenCalledWith({
				code: 0,
				message: 'Geolocation is not supported'
			});
		});

		test('should handle missing error callback when not supported', () => {
			const provider = new BrowserGeolocationProvider(null);
			
			// Should not throw even without error callback
			expect(() => {
				provider.getCurrentPosition(jest.fn(), null, {});
			}).not.toThrow();
		});
	});

	describe('watchPosition()', () => {
		test('should delegate to navigator.geolocation.watchPosition', () => {
			const mockWatchPosition = jest.fn().mockReturnValue(123);
			const mockNavigator = {
				geolocation: {
					watchPosition: mockWatchPosition
				}
			};
			const provider = new BrowserGeolocationProvider(mockNavigator);
			
			const successCallback = jest.fn();
			const errorCallback = jest.fn();
			const options = { enableHighAccuracy: true };
			
			const watchId = provider.watchPosition(successCallback, errorCallback, options);
			
			expect(mockWatchPosition).toHaveBeenCalledWith(
				successCallback,
				errorCallback,
				options
			);
			expect(watchId).toBe(123);
		});

		test('should return null when not supported', () => {
			const provider = new BrowserGeolocationProvider(null);
			
			const watchId = provider.watchPosition(jest.fn(), jest.fn(), {});
			
			expect(watchId).toBeNull();
		});
	});

	describe('clearWatch()', () => {
		test('should delegate to navigator.geolocation.clearWatch', () => {
			const mockClearWatch = jest.fn();
			const mockNavigator = {
				geolocation: {
					clearWatch: mockClearWatch
				}
			};
			const provider = new BrowserGeolocationProvider(mockNavigator);
			
			provider.clearWatch(123);
			
			expect(mockClearWatch).toHaveBeenCalledWith(123);
		});

		test('should not call clearWatch when not supported', () => {
			const provider = new BrowserGeolocationProvider(null);
			
			// Should not throw
			expect(() => {
				provider.clearWatch(123);
			}).not.toThrow();
		});

		test('should not call clearWatch when watchId is null', () => {
			const mockClearWatch = jest.fn();
			const mockNavigator = {
				geolocation: {
					clearWatch: mockClearWatch
				}
			};
			const provider = new BrowserGeolocationProvider(mockNavigator);
			
			provider.clearWatch(null);
			
			expect(mockClearWatch).not.toHaveBeenCalled();
		});
	});

	describe('getNavigator()', () => {
		test('should return the navigator object', () => {
			const mockNavigator = { geolocation: {} };
			const provider = new BrowserGeolocationProvider(mockNavigator);
			
			expect(provider.getNavigator()).toBe(mockNavigator);
		});

		test('should return null when no navigator', () => {
			const provider = new BrowserGeolocationProvider(null);
			
			expect(provider.getNavigator()).toBeNull();
		});
	});
});
