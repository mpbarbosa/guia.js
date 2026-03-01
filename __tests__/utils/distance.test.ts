'use strict';

import { calculateDistance, delay, EARTH_RADIUS_METERS } from '../../src/utils/distance.js';

describe('distance utils', () => {
	describe('EARTH_RADIUS_METERS', () => {
		it('should be 6371000 (mean Earth radius in meters)', () => {
			expect(EARTH_RADIUS_METERS).toBe(6371e3);
		});
	});

	describe('calculateDistance', () => {
		it('should return 0 for identical coordinates', () => {
			expect(calculateDistance(-23.5505, -46.6333, -23.5505, -46.6333)).toBe(0);
		});

		it('should return a positive number for different coordinates', () => {
			// São Paulo → Rio de Janeiro
			const dist = calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729);
			expect(dist).toBeGreaterThan(0);
		});

		it('should approximate São Paulo–Rio de Janeiro distance (~357 km)', () => {
			// Known distance: ~357,710 m
			const dist = calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729);
			expect(dist).toBeGreaterThan(350_000);
			expect(dist).toBeLessThan(370_000);
		});

		it('should be symmetric (A→B equals B→A)', () => {
			const ab = calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729);
			const ba = calculateDistance(-22.9068, -43.1729, -23.5505, -46.6333);
			expect(ab).toBeCloseTo(ba, 5);
		});

		it('should handle equatorial distance (same latitude, different longitude)', () => {
			// 1 degree of longitude on equator ≈ 111,195 m
			const dist = calculateDistance(0, 0, 0, 1);
			expect(dist).toBeGreaterThan(111_000);
			expect(dist).toBeLessThan(112_000);
		});

		it('should handle polar coordinates without throwing', () => {
			expect(() => calculateDistance(90, 0, -90, 0)).not.toThrow();
		});

		it('should return distance close to 0 for very nearby points (20 m)', () => {
			// ~20 m north of São Paulo city centre
			const dist = calculateDistance(-23.5505, -46.6333, -23.5503, -46.6333);
			expect(dist).toBeGreaterThan(0);
			expect(dist).toBeLessThan(50);
		});

		it('should return a number (not NaN) for normal inputs', () => {
			const dist = calculateDistance(-15.7942, -47.8825, -3.7327, -38.5267);
			expect(typeof dist).toBe('number');
			expect(isNaN(dist)).toBe(false);
		});
	});

	describe('delay', () => {
		it('should return a Promise', () => {
			const result = delay(0);
			expect(result).toBeInstanceOf(Promise);
		});

		it('should resolve after the specified milliseconds', async () => {
			const start = Date.now();
			await delay(50);
			const elapsed = Date.now() - start;
			// Allow generous tolerance for test runner overhead
			expect(elapsed).toBeGreaterThanOrEqual(40);
		});

		it('should resolve immediately for delay of 0 ms', async () => {
			await expect(delay(0)).resolves.toBeUndefined();
		});
	});
});
