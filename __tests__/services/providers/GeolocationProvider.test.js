/**
 * Tests for GeolocationProvider base class/interface
 * 
 * This test suite verifies that:
 * - The base class enforces the provider interface
 * - Abstract methods throw errors when not implemented
 * - Subclasses must implement all required methods
 * 
 * @jest-environment node
 * @author MP Barbosa
 * @since 0.6.1-alpha
 */

import { describe, test, expect } from '@jest/globals';
import GeolocationProvider from '../../../src/services/providers/GeolocationProvider.js';

describe('GeolocationProvider - Base Class/Interface', () => {
	
	describe('Abstract Methods', () => {
		test('should throw error when getCurrentPosition is not implemented', () => {
			const provider = new GeolocationProvider();
			
			expect(() => {
				provider.getCurrentPosition(() => {}, () => {}, {});
			}).toThrow('GeolocationProvider.getCurrentPosition() must be implemented by subclass');
		});

		test('should throw error when watchPosition is not implemented', () => {
			const provider = new GeolocationProvider();
			
			expect(() => {
				provider.watchPosition(() => {}, () => {}, {});
			}).toThrow('GeolocationProvider.watchPosition() must be implemented by subclass');
		});

		test('should throw error when clearWatch is not implemented', () => {
			const provider = new GeolocationProvider();
			
			expect(() => {
				provider.clearWatch(123);
			}).toThrow('GeolocationProvider.clearWatch() must be implemented by subclass');
		});

		test('should throw error when isSupported is not implemented', () => {
			const provider = new GeolocationProvider();
			
			expect(() => {
				provider.isSupported();
			}).toThrow('GeolocationProvider.isSupported() must be implemented by subclass');
		});
	});

	describe('Subclass Implementation', () => {
		test('should allow subclass to implement all methods', () => {
			class TestProvider extends GeolocationProvider {
				getCurrentPosition(success, error, options) {
					return 'implemented';
				}

				watchPosition(success, error, options) {
					return 123;
				}

				clearWatch(watchId) {
					return true;
				}

				isSupported() {
					return true;
				}
			}

			const provider = new TestProvider();
			
			expect(provider.getCurrentPosition(() => {}, () => {}, {})).toBe('implemented');
			expect(provider.watchPosition(() => {}, () => {}, {})).toBe(123);
			expect(provider.clearWatch(123)).toBe(true);
			expect(provider.isSupported()).toBe(true);
		});

		test('should enforce implementation of all abstract methods', () => {
			class IncompleteProvider extends GeolocationProvider {
				getCurrentPosition() {
					return 'implemented';
				}
				// Missing watchPosition, clearWatch, isSupported
			}

			const provider = new IncompleteProvider();
			
			expect(() => provider.watchPosition(() => {}, () => {}, {}))
				.toThrow('GeolocationProvider.watchPosition() must be implemented by subclass');
			expect(() => provider.clearWatch(123))
				.toThrow('GeolocationProvider.clearWatch() must be implemented by subclass');
			expect(() => provider.isSupported())
				.toThrow('GeolocationProvider.isSupported() must be implemented by subclass');
		});
	});
});
