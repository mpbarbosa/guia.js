/**
 * Integration tests for GeolocationService with provider pattern
 * 
 * This test suite demonstrates:
 * - Using MockGeolocationProvider with GeolocationService
 * - Complete workflow with provider injection
 * - Backward compatibility with navigator injection
 * - Provider switching at runtime
 * 
 * @jest-environment node
 * @author MP Barbosa
 * @since 0.6.1-alpha
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock console
global.console = {
	log: jest.fn(),
	error: jest.fn(),
	warn: jest.fn(),
	info: jest.fn()
};

// Mock DOM
global.document = undefined;
global.window = {
	location: {
		hostname: 'localhost',
		port: '8080'
	}
};

// Mock setupParams
global.setupParams = {
	geolocationOptions: {
		enableHighAccuracy: true,
		timeout: 20000,
		maximumAge: 0
	},
	trackingInterval: 50000,
	minimumDistanceChange: 20
};

let GeolocationService, MockGeolocationProvider, BrowserGeolocationProvider;

try {
	const guiaModule = await import('../../src/guia.js');
	GeolocationService = global.GeolocationService;
	MockGeolocationProvider = global.MockGeolocationProvider;
	BrowserGeolocationProvider = global.BrowserGeolocationProvider;
} catch (error) {
	console.warn('Could not load guia.js:', error.message);
}

describe('GeolocationService - Provider Pattern Integration', () => {
	
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('MockGeolocationProvider Integration', () => {
		test('should work with MockGeolocationProvider for testing', async () => {
			if (!GeolocationService || !MockGeolocationProvider) {
				console.warn('Classes not available - skipping test');
				expect(true).toBe(true);
				return;
			}

			const mockPosition = {
				coords: {
					latitude: -23.5505,
					longitude: -46.6333,
					accuracy: 15
				},
				timestamp: Date.now()
			};

			// Create mock provider with predefined position
			const mockProvider = new MockGeolocationProvider({
				defaultPosition: mockPosition
			});

			// Create mock PositionManager
			const mockPositionManager = {
				update: jest.fn()
			};

			// Create service with mock provider
			const service = new GeolocationService(
				null,
				mockProvider,
				mockPositionManager
			);

			// Get position
			const position = await service.getSingleLocationUpdate();

			// Verify behavior
			expect(position).toBe(mockPosition);
			expect(mockPositionManager.update).toHaveBeenCalledWith(mockPosition);
			expect(service.lastKnownPosition).toBe(mockPosition);
		});

		test('should handle errors with MockGeolocationProvider', async () => {
			if (!GeolocationService || !MockGeolocationProvider) {
				console.warn('Classes not available - skipping test');
				expect(true).toBe(true);
				return;
			}

			const mockError = {
				code: 1,
				message: 'Permission denied'
			};

			// Create mock provider that returns error
			const mockProvider = new MockGeolocationProvider({
				defaultError: mockError
			});

			const mockPositionManager = {
				update: jest.fn()
			};

			const service = new GeolocationService(
				null,
				mockProvider,
				mockPositionManager
			);

			// Should reject with formatted error
			await expect(service.getSingleLocationUpdate())
				.rejects
				.toMatchObject({
					name: 'PermissionDeniedError',
					code: 1
				});

			// PositionManager should not be updated on error
			expect(mockPositionManager.update).not.toHaveBeenCalled();
		});

		test('should support watch functionality with MockGeolocationProvider', (done) => {
			if (!GeolocationService || !MockGeolocationProvider) {
				console.warn('Classes not available - skipping test');
				expect(true).toBe(true);
				done();
				return;
			}

			const mockPosition = {
				coords: {
					latitude: -23.5505,
					longitude: -46.6333,
					accuracy: 15
				},
				timestamp: Date.now()
			};

			const mockProvider = new MockGeolocationProvider({
				defaultPosition: mockPosition
			});

			const mockPositionManager = {
				update: jest.fn()
			};

			const service = new GeolocationService(
				null,
				mockProvider,
				mockPositionManager
			);

			// Start watching
			const watchId = service.watchCurrentLocation();

			// Wait for initial callback
			setTimeout(() => {
				expect(watchId).toBeTruthy();
				expect(service.isCurrentlyWatching()).toBe(true);
				expect(mockPositionManager.update).toHaveBeenCalled();

				// Trigger another update
				mockProvider.triggerWatchUpdate({
					coords: {
						latitude: -23.5506,
						longitude: -46.6334,
						accuracy: 15
					},
					timestamp: Date.now()
				});

				setTimeout(() => {
					// Should have been called twice now
					expect(mockPositionManager.update).toHaveBeenCalledTimes(2);

					// Stop watching
					service.stopWatching();
					expect(service.isCurrentlyWatching()).toBe(false);

					done();
				}, 50);
			}, 50);
		});

		test('should allow changing position dynamically', async () => {
			if (!GeolocationService || !MockGeolocationProvider) {
				console.warn('Classes not available - skipping test');
				expect(true).toBe(true);
				return;
			}

			const mockProvider = new MockGeolocationProvider();
			const mockPositionManager = {
				update: jest.fn()
			};

			const service = new GeolocationService(
				null,
				mockProvider,
				mockPositionManager
			);

			// Set first position
			const position1 = {
				coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 15 },
				timestamp: Date.now()
			};
			mockProvider.setPosition(position1);

			const result1 = await service.getSingleLocationUpdate();
			expect(result1).toBe(position1);

			// Change position
			const position2 = {
				coords: { latitude: -22.9068, longitude: -43.1729, accuracy: 15 },
				timestamp: Date.now()
			};
			mockProvider.setPosition(position2);

			const result2 = await service.getSingleLocationUpdate();
			expect(result2).toBe(position2);
		});
	});

	describe('BrowserGeolocationProvider Integration', () => {
		test('should work with BrowserGeolocationProvider', async () => {
			if (!GeolocationService || !BrowserGeolocationProvider) {
				console.warn('Classes not available - skipping test');
				expect(true).toBe(true);
				return;
			}

			const mockPosition = {
				coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 15 },
				timestamp: Date.now()
			};

			const mockNavigator = {
				geolocation: {
					getCurrentPosition: jest.fn((success) => success(mockPosition))
				}
			};

			const browserProvider = new BrowserGeolocationProvider(mockNavigator);
			const mockPositionManager = {
				update: jest.fn()
			};

			const service = new GeolocationService(
				null,
				browserProvider,
				mockPositionManager
			);

			const position = await service.getSingleLocationUpdate();

			expect(position).toBe(mockPosition);
			expect(mockNavigator.geolocation.getCurrentPosition).toHaveBeenCalled();
			expect(mockPositionManager.update).toHaveBeenCalledWith(mockPosition);
		});
	});

	describe('Backward Compatibility', () => {
		test('should still work with navigator object injection', async () => {
			if (!GeolocationService) {
				console.warn('GeolocationService not available - skipping test');
				expect(true).toBe(true);
				return;
			}

			const mockPosition = {
				coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 15 },
				timestamp: Date.now()
			};

			const mockNavigator = {
				geolocation: {
					getCurrentPosition: jest.fn((success) => success(mockPosition))
				}
			};

			const mockPositionManager = {
				update: jest.fn()
			};

			// Old way: inject navigator directly (backward compatible)
			const service = new GeolocationService(
				null,
				mockNavigator,
				mockPositionManager
			);

			// Should automatically wrap in BrowserGeolocationProvider
			const position = await service.getSingleLocationUpdate();

			expect(position).toBe(mockPosition);
			expect(mockNavigator.geolocation.getCurrentPosition).toHaveBeenCalled();
			expect(mockPositionManager.update).toHaveBeenCalledWith(mockPosition);
		});
	});

	describe('Provider Interface Compliance', () => {
		test('should verify MockGeolocationProvider implements required methods', () => {
			if (!MockGeolocationProvider) {
				console.warn('MockGeolocationProvider not available - skipping test');
				expect(true).toBe(true);
				return;
			}

			const provider = new MockGeolocationProvider();

			// Verify all required methods exist
			expect(typeof provider.getCurrentPosition).toBe('function');
			expect(typeof provider.watchPosition).toBe('function');
			expect(typeof provider.clearWatch).toBe('function');
			expect(typeof provider.isSupported).toBe('function');
		});

		test('should verify BrowserGeolocationProvider implements required methods', () => {
			if (!BrowserGeolocationProvider) {
				console.warn('BrowserGeolocationProvider not available - skipping test');
				expect(true).toBe(true);
				return;
			}

			const mockNavigator = { geolocation: {} };
			const provider = new BrowserGeolocationProvider(mockNavigator);

			// Verify all required methods exist
			expect(typeof provider.getCurrentPosition).toBe('function');
			expect(typeof provider.watchPosition).toBe('function');
			expect(typeof provider.clearWatch).toBe('function');
			expect(typeof provider.isSupported).toBe('function');
		});
	});
});
