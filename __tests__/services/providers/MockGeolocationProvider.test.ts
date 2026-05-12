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
		test('should initialize with default configuration', (done) => {
			const provider = new MockGeolocationProvider();
			
			expect(provider.isSupported()).toBe(true);
			// With no defaults configured, getCurrentPosition delivers a "Position unavailable" error immediately (delay=0)
			const start = Date.now();
			provider.getCurrentPosition(
				() => { done(new Error('Should not call success callback')); },
				(error) => {
					expect(error.code).toBe(2);
					expect(error.message).toBe('Position unavailable');
					expect(Date.now() - start).toBeLessThan(100);
					done();
				}
			);
		});

		test('should accept custom configuration', (done) => {
			const mockPosition = {
				coords: { latitude: -23.5505, longitude: -46.6333 },
				timestamp: Date.now()
			};
			
			const unsupportedProvider = new MockGeolocationProvider({
				supported: false,
				defaultPosition: mockPosition,
				delay: 50
			});
			
			expect(unsupportedProvider.isSupported()).toBe(false);
			// When not supported, error callback is invoked regardless of configured position
			unsupportedProvider.getCurrentPosition(
				() => { done(new Error('Should not call success callback')); },
				(error) => { expect(error).toBeDefined(); done(); }
			);
		}, 10000);

		test('should accept default error configuration', (done) => {
			const mockError = { code: 1 as const, message: 'Permission denied' };
			
			const provider = new MockGeolocationProvider({
				defaultError: mockError
			});
			
			provider.getCurrentPosition(
				() => { done(new Error('Should not call success callback')); },
				(error) => {
					expect(error).toBe(mockError);
					done();
				}
			);
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
					expect(error.code).toBe(2);
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
					expect(elapsedTime).toBeGreaterThanOrEqual(45);
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
				defaultPosition: { coords: { latitude: 0, longitude: 0 }, timestamp: Date.now() }
			});
			
			const watchId1 = provider.watchPosition(jest.fn(), jest.fn());
			const watchId2 = provider.watchPosition(jest.fn(), jest.fn());
			
			// Each call should return a distinct numeric ID
			expect(typeof watchId1).toBe('number');
			expect(typeof watchId2).toBe('number');
			expect(watchId1).not.toBe(watchId2);
			
			provider.destroy();
		});
	});

	describe('clearWatch()', () => {
		test('should remove watch from active watches', () => {
			const mockPosition = { coords: { latitude: 0, longitude: 0 }, timestamp: Date.now() };
			const provider = new MockGeolocationProvider({ defaultPosition: mockPosition });
			
			const callback = jest.fn();
			const watchId = provider.watchPosition(callback, jest.fn());
			
			provider.clearWatch(watchId);
			
			// After clearWatch, triggerWatchUpdate should not invoke the cleared callback
			provider.triggerWatchUpdate(mockPosition);
			expect(callback).not.toHaveBeenCalled();
		});

		test('should handle clearing non-existent watch', () => {
			const provider = new MockGeolocationProvider();
			
			expect(() => {
				provider.clearWatch(999);
			}).not.toThrow();
		});
	});

	describe('setPosition()', () => {
		test('should update default position', (done) => {
			const provider = new MockGeolocationProvider();
			
			const newPosition = {
				coords: { latitude: -22.9068, longitude: -43.1729 },
				timestamp: Date.now()
			};
			
			provider.setPosition(newPosition);
			
			provider.getCurrentPosition(
				(position) => {
					expect(position).toBe(newPosition);
					done();
				},
				() => { done(new Error('Should not call error callback after setPosition')); }
			);
		});
	});

	describe('setError()', () => {
		test('should update default error', (done) => {
			const provider = new MockGeolocationProvider();
			
			const newError = { code: 3 as const, message: 'Timeout' };
			
			provider.setError(newError);
			
			provider.getCurrentPosition(
				() => { done(new Error('Should not call success callback after setError')); },
				(error) => {
					expect(error).toBe(newError);
					done();
				}
			);
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
