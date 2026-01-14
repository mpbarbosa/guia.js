/**
 * Tests for MockGeolocationProvider
 * 
 * This test suite verifies that:
 * - MockGeolocationProvider provides controllable behavior for testing
 * - Configuration options work as expected
 * - Position and error mocking is accurate
 * - Watch functionality can be simulated
 * 
 * @jest-environment node
 * @author MP Barbosa
 * @since 0.6.1-alpha
 */

import { describe, test, expect, jest } from '@jest/globals';
import MockGeolocationProvider from '../../../src/services/providers/MockGeolocationProvider.js';

describe('MockGeolocationProvider', () => {
	
	describe('Constructor and Configuration', () => {
		test('should initialize with default configuration', () => {
			const provider = new MockGeolocationProvider();
			
			expect(provider.isSupported()).toBe(true);
			expect(provider.config.defaultPosition).toBeNull();
			expect(provider.config.defaultError).toBeNull();
			expect(provider.config.delay).toBe(0);
		});

		test('should accept custom configuration', () => {
			const mockPosition = {
				coords: { latitude: -23.5505, longitude: -46.6333 },
				timestamp: Date.now()
			};
			
			const provider = new MockGeolocationProvider({
				supported: false,
				defaultPosition: mockPosition,
				delay: 100
			});
			
			expect(provider.isSupported()).toBe(false);
			expect(provider.config.defaultPosition).toBe(mockPosition);
			expect(provider.config.delay).toBe(100);
		});

		test('should accept default error configuration', () => {
			const mockError = { code: 1, message: 'Permission denied' };
			
			const provider = new MockGeolocationProvider({
				defaultError: mockError
			});
			
			expect(provider.config.defaultError).toBe(mockError);
		});
	});

	describe('isSupported()', () => {
		test('should return configured support value', () => {
			const supportedProvider = new MockGeolocationProvider({ supported: true });
			const unsupportedProvider = new MockGeolocationProvider({ supported: false });
			
			expect(supportedProvider.isSupported()).toBe(true);
			expect(unsupportedProvider.isSupported()).toBe(false);
		});

		test('should default to true', () => {
			const provider = new MockGeolocationProvider();
			
			expect(provider.isSupported()).toBe(true);
		});
	});

	describe('isPermissionsAPISupported()', () => {
		test('should always return false', () => {
			const provider = new MockGeolocationProvider();
			
			expect(provider.isPermissionsAPISupported()).toBe(false);
		});
	});

	describe('getCurrentPosition()', () => {
		test('should call success callback with default position', (done) => {
			const mockPosition = {
				coords: { latitude: -23.5505, longitude: -46.6333 },
				timestamp: Date.now()
			};
			
			const provider = new MockGeolocationProvider({
				defaultPosition: mockPosition
			});
			
			provider.getCurrentPosition(
				(position) => {
					expect(position).toBe(mockPosition);
					done();
				},
				() => {
					done(new Error('Should not call error callback'));
				}
			);
		});

		test('should call error callback with default error', (done) => {
			const mockError = { code: 1, message: 'Permission denied' };
			
			const provider = new MockGeolocationProvider({
				defaultError: mockError
			});
			
			provider.getCurrentPosition(
				() => {
					done(new Error('Should not call success callback'));
				},
				(error) => {
					expect(error).toBe(mockError);
					done();
				}
			);
		});

		test('should call error callback when not supported', (done) => {
			const provider = new MockGeolocationProvider({ supported: false });
			
			provider.getCurrentPosition(
				() => {
					done(new Error('Should not call success callback'));
				},
				(error) => {
					expect(error.code).toBe(0);
					expect(error.message).toBe('Geolocation is not supported');
					done();
				}
			);
		});

		test('should call error callback when no position or error configured', (done) => {
			const provider = new MockGeolocationProvider();
			
			provider.getCurrentPosition(
				() => {
					done(new Error('Should not call success callback'));
				},
				(error) => {
					expect(error.code).toBe(2);
					expect(error.message).toBe('Position unavailable');
					done();
				}
			);
		});

		test('should respect configured delay', (done) => {
			const mockPosition = {
				coords: { latitude: -23.5505, longitude: -46.6333 },
				timestamp: Date.now()
			};
			
			const provider = new MockGeolocationProvider({
				defaultPosition: mockPosition,
				delay: 50
			});
			
			const startTime = Date.now();
			
			provider.getCurrentPosition(
				() => {
					const elapsedTime = Date.now() - startTime;
					expect(elapsedTime).toBeGreaterThanOrEqual(50);
					done();
				},
				() => {
					done(new Error('Should not call error callback'));
				}
			);
		}, 10000);
	});

	describe('watchPosition()', () => {
		test('should return a watch ID', () => {
			const provider = new MockGeolocationProvider();
			
			const watchId = provider.watchPosition(jest.fn(), jest.fn());
			
			expect(typeof watchId).toBe('number');
			expect(watchId).toBeGreaterThan(0);
		});

		test('should return null when not supported', () => {
			const provider = new MockGeolocationProvider({ supported: false });
			
			const watchId = provider.watchPosition(jest.fn(), jest.fn());
			
			expect(watchId).toBeNull();
		});

		test('should call success callback with default position', (done) => {
			const mockPosition = {
				coords: { latitude: -23.5505, longitude: -46.6333 },
				timestamp: Date.now()
			};
			
			const provider = new MockGeolocationProvider({
				defaultPosition: mockPosition
			});
			
			provider.watchPosition(
				(position) => {
					expect(position).toBe(mockPosition);
					done();
				},
				() => {
					done(new Error('Should not call error callback'));
				}
			);
		});

		test('should track active watches', () => {
			const provider = new MockGeolocationProvider({
				defaultPosition: { coords: { latitude: 0, longitude: 0 } }
			});
			
			const watchId1 = provider.watchPosition(jest.fn(), jest.fn());
			const watchId2 = provider.watchPosition(jest.fn(), jest.fn());
			
			expect(provider.activeWatches.size).toBe(2);
			expect(provider.activeWatches.has(watchId1)).toBe(true);
			expect(provider.activeWatches.has(watchId2)).toBe(true);
		});
	});

	describe('clearWatch()', () => {
		test('should remove watch from active watches', () => {
			const provider = new MockGeolocationProvider({
				defaultPosition: { coords: { latitude: 0, longitude: 0 } }
			});
			
			const watchId = provider.watchPosition(jest.fn(), jest.fn());
			expect(provider.activeWatches.has(watchId)).toBe(true);
			
			provider.clearWatch(watchId);
			expect(provider.activeWatches.has(watchId)).toBe(false);
		});

		test('should handle clearing non-existent watch', () => {
			const provider = new MockGeolocationProvider();
			
			expect(() => {
				provider.clearWatch(999);
			}).not.toThrow();
		});
	});

	describe('setPosition()', () => {
		test('should update default position', () => {
			const provider = new MockGeolocationProvider();
			
			const newPosition = {
				coords: { latitude: -22.9068, longitude: -43.1729 },
				timestamp: Date.now()
			};
			
			provider.setPosition(newPosition);
			
			expect(provider.config.defaultPosition).toBe(newPosition);
			expect(provider.config.defaultError).toBeNull();
		});
	});

	describe('setError()', () => {
		test('should update default error', () => {
			const provider = new MockGeolocationProvider();
			
			const newError = { code: 3, message: 'Timeout' };
			
			provider.setError(newError);
			
			expect(provider.config.defaultError).toBe(newError);
			expect(provider.config.defaultPosition).toBeNull();
		});
	});

	describe('triggerWatchUpdate()', () => {
		test('should trigger all active watch callbacks with position', (done) => {
			const provider = new MockGeolocationProvider();
			
			const mockPosition = {
				coords: { latitude: -23.5505, longitude: -46.6333 },
				timestamp: Date.now()
			};
			
			let callCount = 0;
			const expectedCalls = 2;
			
			provider.watchPosition(
				(position) => {
					expect(position).toBe(mockPosition);
					callCount++;
					if (callCount === expectedCalls) done();
				},
				jest.fn()
			);
			
			provider.watchPosition(
				(position) => {
					expect(position).toBe(mockPosition);
					callCount++;
					if (callCount === expectedCalls) done();
				},
				jest.fn()
			);
			
			provider.triggerWatchUpdate(mockPosition);
		});

		test('should use default position if none provided', (done) => {
			const mockPosition = {
				coords: { latitude: -23.5505, longitude: -46.6333 },
				timestamp: Date.now()
			};
			
			const provider = new MockGeolocationProvider({
				defaultPosition: mockPosition
			});
			
			provider.watchPosition(
				(position) => {
					expect(position).toBe(mockPosition);
					done();
				},
				jest.fn()
			);
			
			provider.triggerWatchUpdate();
		});
	});

	describe('triggerWatchError()', () => {
		test('should trigger all active watch error callbacks', (done) => {
			const provider = new MockGeolocationProvider();
			
			const mockError = { code: 1, message: 'Permission denied' };
			
			let callCount = 0;
			const expectedCalls = 2;
			
			provider.watchPosition(
				jest.fn(),
				(error) => {
					expect(error).toBe(mockError);
					callCount++;
					if (callCount === expectedCalls) done();
				}
			);
			
			provider.watchPosition(
				jest.fn(),
				(error) => {
					expect(error).toBe(mockError);
					callCount++;
					if (callCount === expectedCalls) done();
				}
			);
			
			provider.triggerWatchError(mockError);
		});

		test('should use default error if none provided', (done) => {
			const mockError = { code: 1, message: 'Permission denied' };
			
			const provider = new MockGeolocationProvider({
				defaultError: mockError
			});
			
			provider.watchPosition(
				jest.fn(),
				(error) => {
					expect(error).toBe(mockError);
					done();
				}
			);
			
			provider.triggerWatchError();
		});
	});
});
