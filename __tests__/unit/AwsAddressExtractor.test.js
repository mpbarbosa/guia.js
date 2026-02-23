/**
 * @jest-environment node
 */

import { describe, test, expect } from '@jest/globals';
import AwsAddressExtractor from '../../src/data/AwsAddressExtractor.js';

global.document = undefined;

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

describe('AwsAddressExtractor', () => {
	describe('field extraction from AWS response', () => {
		test('extracts bairro from neighborhood', () => {
			const ex = new AwsAddressExtractor(sampleAwsResponse);
			expect(ex.enderecoPadronizado.bairro).toBe('Sé');
		});

		test('extracts municipio from municipality', () => {
			const ex = new AwsAddressExtractor(sampleAwsResponse);
			expect(ex.enderecoPadronizado.municipio).toBe('São Paulo');
		});

		test('extracts uf from region', () => {
			const ex = new AwsAddressExtractor(sampleAwsResponse);
			expect(ex.enderecoPadronizado.uf).toBe('São Paulo');
		});

		test('extracts cep from postalCode', () => {
			const ex = new AwsAddressExtractor(sampleAwsResponse);
			expect(ex.enderecoPadronizado.cep).toBe('01016-000');
		});

		test('normalizes BRA country code to Brasil', () => {
			const ex = new AwsAddressExtractor(sampleAwsResponse);
			expect(ex.enderecoPadronizado.pais).toBe('Brasil');
		});

		test('normalizes BR country code to Brasil', () => {
			const data = { address: { ...sampleAwsResponse.address, country: 'BR' } };
			const ex = new AwsAddressExtractor(data);
			expect(ex.enderecoPadronizado.pais).toBe('Brasil');
		});

		test('normalizes Brasil string to Brasil', () => {
			const data = { address: { ...sampleAwsResponse.address, country: 'Brasil' } };
			const ex = new AwsAddressExtractor(data);
			expect(ex.enderecoPadronizado.pais).toBe('Brasil');
		});

		test('siglaUF is null (AWS does not provide state code)', () => {
			const ex = new AwsAddressExtractor(sampleAwsResponse);
			expect(ex.enderecoPadronizado.siglaUF).toBeNull();
		});

		test('logradouro is null (AWS does not provide street)', () => {
			const ex = new AwsAddressExtractor(sampleAwsResponse);
			expect(ex.enderecoPadronizado.logradouro).toBeNull();
		});

		test('numero is null (AWS does not provide house number)', () => {
			const ex = new AwsAddressExtractor(sampleAwsResponse);
			expect(ex.enderecoPadronizado.numero).toBeNull();
		});

		test('regiaoMetropolitana is null (AWS does not provide metro region)', () => {
			const ex = new AwsAddressExtractor(sampleAwsResponse);
			expect(ex.enderecoPadronizado.regiaoMetropolitana).toBeNull();
		});
	});

	describe('null / missing data handling', () => {
		test('handles null data gracefully', () => {
			const ex = new AwsAddressExtractor(null);
			expect(ex.enderecoPadronizado.municipio).toBeNull();
			expect(ex.enderecoPadronizado.bairro).toBeNull();
		});

		test('handles missing address object gracefully', () => {
			const ex = new AwsAddressExtractor({ provider: 'aws-location-service' });
			expect(ex.enderecoPadronizado.municipio).toBeNull();
		});

		test('handles missing individual fields', () => {
			const ex = new AwsAddressExtractor({ address: { municipality: 'Recife' } });
			expect(ex.enderecoPadronizado.municipio).toBe('Recife');
			expect(ex.enderecoPadronizado.bairro).toBeNull();
			expect(ex.enderecoPadronizado.cep).toBeNull();
		});

		test('instance is frozen (immutable)', () => {
			const ex = new AwsAddressExtractor(sampleAwsResponse);
			expect(Object.isFrozen(ex)).toBe(true);
		});
	});

	describe('toString', () => {
		test('includes class name', () => {
			const ex = new AwsAddressExtractor(sampleAwsResponse);
			expect(ex.toString()).toContain('AwsAddressExtractor');
		});
	});
});
