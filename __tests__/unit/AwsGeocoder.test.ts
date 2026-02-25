/**
 * @jest-environment node
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import AwsGeocoder from '../../src/services/AwsGeocoder.js';

global.document = undefined;

const BASE_URL = 'https://test.example.com';

const sampleAwsResponse = {
	provider: 'aws-location-service',
	coordinates: { latitude: -23.55052, longitude: -46.633309 },
	address: {
		label: 'Movelstore, Sé, São Paulo, 01016-000, BRA',
		neighborhood: 'Sé',
		municipality: 'São Paulo',
		region: 'São Paulo',
		country: 'BRA',
		postalCode: '01016-000',
		interpolated: false,
	},
	geometry: { Point: [-46.633225, -23.5505466] },
};

function mockFetch(responseBody, status = 200) {
	global.fetch = jest.fn().mockResolvedValue({
		ok: status >= 200 && status < 300,
		status,
		statusText: status === 200 ? 'OK' : 'Error',
		json: jest.fn().mockResolvedValue(responseBody),
	});
}

describe('AwsGeocoder', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	describe('constructor', () => {
		test('uses provided baseUrl', () => {
			const g = new AwsGeocoder(BASE_URL);
			expect(g.endpoint).toBe(`${BASE_URL}/api/geocode/reverse`);
		});
	});

	describe('reverseGeocode', () => {
		test('sends POST with correct body and headers', async () => {
			mockFetch(sampleAwsResponse);
			const g = new AwsGeocoder(BASE_URL);
			await g.reverseGeocode(-23.55052, -46.633309);

			expect(global.fetch).toHaveBeenCalledWith(
				`${BASE_URL}/api/geocode/reverse`,
				expect.objectContaining({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ latitude: -23.55052, longitude: -46.633309 }),
				})
			);
		});

		test('returns rawData and enderecoPadronizado', async () => {
			mockFetch(sampleAwsResponse);
			const g = new AwsGeocoder(BASE_URL);
			const result = await g.reverseGeocode(-23.55052, -46.633309);

			expect(result.rawData).toEqual(sampleAwsResponse);
			expect(result.enderecoPadronizado.municipio).toBe('São Paulo');
			expect(result.enderecoPadronizado.bairro).toBe('Sé');
			expect(result.enderecoPadronizado.cep).toBe('01016-000');
			expect(result.enderecoPadronizado.pais).toBe('Brasil');
		});

		test('throws on non-OK HTTP response', async () => {
			mockFetch({}, 500);
			const g = new AwsGeocoder(BASE_URL);
			await expect(g.reverseGeocode(-23.55052, -46.633309)).rejects.toThrow('HTTP 500');
		});

		test('throws on network failure', async () => {
			global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
			const g = new AwsGeocoder(BASE_URL);
			await expect(g.reverseGeocode(-23.55052, -46.633309)).rejects.toThrow('Network error');
		});

		test('throws on invalid coordinates (null lat)', async () => {
			const g = new AwsGeocoder(BASE_URL);
			await expect(g.reverseGeocode(null, -46.633309)).rejects.toThrow('Invalid coordinates');
		});

		test('throws on invalid coordinates (null lon)', async () => {
			const g = new AwsGeocoder(BASE_URL);
			await expect(g.reverseGeocode(-23.55052, null)).rejects.toThrow('Invalid coordinates');
		});
	});
});
