/**
 * Tests for GeolocationProvider base class/interface (re-exported from paraty_geoservices).
 *
 * This test suite verifies that:
 * - GeolocationProvider is an abstract base class that can be extended
 * - Concrete subclasses that implement all methods work correctly
 * - Unimplemented abstract methods are absent at runtime (not a function)
 *
 * @jest-environment node
 * @author MP Barbosa
 * @since 0.6.1-alpha
 */

import { describe, test, expect } from '@jest/globals';
import GeolocationProvider from '../../../src/services/providers/GeolocationProvider.js';

describe('GeolocationProvider - Base Class/Interface', () => {

	describe('Abstract Methods', () => {
		test('should not have getCurrentPosition on prototype when not implemented', () => {
			class Stub extends GeolocationProvider {}
			const provider = new Stub();
			expect(typeof provider.getCurrentPosition).toBe('undefined');
		});

		test('should not have watchPosition on prototype when not implemented', () => {
			class Stub extends GeolocationProvider {}
			const provider = new Stub();
			expect(typeof provider.watchPosition).toBe('undefined');
		});

		test('should not have clearWatch on prototype when not implemented', () => {
			class Stub extends GeolocationProvider {}
			const provider = new Stub();
			expect(typeof provider.clearWatch).toBe('undefined');
		});

		test('should not have isSupported on prototype when not implemented', () => {
			class Stub extends GeolocationProvider {}
			const provider = new Stub();
			expect(typeof provider.isSupported).toBe('undefined');
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

			expect(() => provider.watchPosition(() => {}, () => {}, {})).toThrow();
			expect(() => provider.clearWatch(123)).toThrow();
			expect(() => provider.isSupported()).toThrow();
		});
	});
});
