/**
 * Test scenario to replicate and verify fix for:
 * TypeError: GeocodingState: position must be a GeoPosition instance or null
 * 
 * Issue: WebGeocodingManager.getSingleLocationUpdate() receives a raw browser position
 * object from GeolocationService but passes it to GeocodingState.setPosition() which
 * expects a GeoPosition instance.
 */

import GeocodingState from '../../src/core/GeocodingState.js';
import GeoPosition from '../../src/core/GeoPosition.js';

describe('Bug Fix: GeoPosition Type Error', () => {
	let geocodingState;

	beforeEach(() => {
		geocodingState = new GeocodingState();
	});

	test('should reject raw browser position object (reproduce bug)', () => {
		// Simulate what GeolocationService returns
		const rawBrowserPosition = {
			coords: {
				latitude: -23.550520,
				longitude: -46.633309,
				accuracy: 10,
				altitude: null,
				altitudeAccuracy: null,
				heading: null,
				speed: null
			},
			timestamp: Date.now()
		};

		// This should throw TypeError (the bug)
		expect(() => {
			geocodingState.setPosition(rawBrowserPosition);
		}).toThrow(TypeError);
		
		expect(() => {
			geocodingState.setPosition(rawBrowserPosition);
		}).toThrow('GeocodingState: position must be a GeoPosition instance or null');
	});

	test('should accept GeoPosition instance (correct usage)', () => {
		// Simulate what GeolocationService returns
		const rawBrowserPosition = {
			coords: {
				latitude: -23.550520,
				longitude: -46.633309,
				accuracy: 10,
				altitude: null,
				altitudeAccuracy: null,
				heading: null,
				speed: null
			},
			timestamp: Date.now()
		};

		// Wrap in GeoPosition (the fix)
		const geoPosition = new GeoPosition(rawBrowserPosition);

		// This should work without throwing
		expect(() => {
			geocodingState.setPosition(geoPosition);
		}).not.toThrow();

		// Verify position was set correctly
		const position = geocodingState.getCurrentPosition();
		expect(position).toBe(geoPosition);
		expect(position.latitude).toBe(-23.550520);
		expect(position.longitude).toBe(-46.633309);
	});

	test('should accept null value', () => {
		// Setting null should work (clear position)
		expect(() => {
			geocodingState.setPosition(null);
		}).not.toThrow();

		expect(geocodingState.getCurrentPosition()).toBeNull();
	});

	test('should reject other types', () => {
		// Test various invalid types
		expect(() => {
			geocodingState.setPosition(undefined);
		}).toThrow(TypeError);

		expect(() => {
			geocodingState.setPosition('invalid');
		}).toThrow(TypeError);

		expect(() => {
			geocodingState.setPosition(123);
		}).toThrow(TypeError);

		expect(() => {
			geocodingState.setPosition({ lat: 10, lon: 20 });
		}).toThrow(TypeError);
	});

	test('integration test: simulate WebGeocodingManager flow', () => {
		// Simulate what happens in WebGeocodingManager.getSingleLocationUpdate()
		// at line 709: this.currentPosition = position;
		
		// Step 1: GeolocationService returns raw browser position
		const rawPosition = {
			coords: {
				latitude: -23.550520,
				longitude: -46.633309,
				accuracy: 10,
				altitude: null,
				altitudeAccuracy: null,
				heading: null,
				speed: null
			},
			timestamp: Date.now()
		};

		// Step 2: Without fix - this throws error
		expect(() => {
			geocodingState.setPosition(rawPosition);
		}).toThrow('GeocodingState: position must be a GeoPosition instance or null');

		// Step 3: With fix - wrap in GeoPosition first
		const geoPosition = new GeoPosition(rawPosition);
		expect(() => {
			geocodingState.setPosition(geoPosition);
		}).not.toThrow();

		// Verify coordinates are accessible
		expect(geocodingState.getCurrentCoordinates()).toEqual({
			latitude: -23.550520,
			longitude: -46.633309
		});
	});
});
