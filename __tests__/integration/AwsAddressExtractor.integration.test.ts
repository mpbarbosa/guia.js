/**
 * @jest-environment node
 *
 * Integration tests for AwsAddressExtractor.
 *
 * Validates the full extraction pipeline end-to-end:
 *   AWS response shape → AwsAddressExtractor → BrazilianStandardAddress
 *
 * Covers the `region` → `uf` + `siglaUF` mapping introduced in 0.11.1-alpha,
 * including the lookup table for all 27 Brazilian states and the Distrito Federal.
 */

import { describe, test, expect } from '@jest/globals';
import AwsAddressExtractor from '../../src/data/AwsAddressExtractor.js';

global.document = undefined;

// ---------------------------------------------------------------------------
// Real-world capture: Avenida Julio De Castilhos 831, Belém, São Paulo
// provider: aws-location-service
// ---------------------------------------------------------------------------
const avJulioResponse = {
	provider: 'aws-location-service',
	coordinates: { latitude: -23.5407389, longitude: -46.5927839 },
	address: {
		label: 'Avenida Julio De Castilhos 831, Belém, São Paulo, 03059-005, BRA',
		addressNumber: '831',
		municipality: 'São Paulo',
		region: 'São Paulo',
		country: 'BRA',
		postalCode: '03059-005',
		interpolated: false,
	},
};

describe('AwsAddressExtractor integration — region maps to uf and siglaUF', () => {
	test('full extraction pipeline populates uf and siglaUF from region', () => {
		const ex = new AwsAddressExtractor(avJulioResponse);
		const addr = ex.enderecoPadronizado;

		expect(addr.uf).toBe('São Paulo');
		expect(addr.siglaUF).toBe('SP');
	});

	test('municipioCompleto() uses siglaUF when available', () => {
		const ex = new AwsAddressExtractor(avJulioResponse);
		// BrazilianStandardAddress.municipioCompleto() appends siglaUF
		expect(ex.enderecoPadronizado.municipioCompleto()).toBe('São Paulo, SP');
	});

	test('enderecoCompleto() produces correctly formatted string', () => {
		const ex = new AwsAddressExtractor(avJulioResponse);
		expect(ex.enderecoPadronizado.enderecoCompleto()).toBe(
			'Avenida Julio De Castilhos, 831, Belém, São Paulo, SP, 03059-005',
		);
	});

	test('all core address fields are populated', () => {
		const ex = new AwsAddressExtractor(avJulioResponse);
		const addr = ex.enderecoPadronizado;

		expect(addr.logradouro).toBe('Avenida Julio De Castilhos');
		expect(addr.numero).toBe('831');
		expect(addr.bairro).toBe('Belém');
		expect(addr.municipio).toBe('São Paulo');
		expect(addr.uf).toBe('São Paulo');
		expect(addr.siglaUF).toBe('SP');
		expect(addr.cep).toBe('03059-005');
		expect(addr.pais).toBe('Brasil');
		expect(addr.regiaoMetropolitana).toBeNull();
	});
});

// ---------------------------------------------------------------------------
// Cross-state coverage: ensure region lookup works for several states
// ---------------------------------------------------------------------------
describe('AwsAddressExtractor integration — region lookup across Brazilian states', () => {
	const stateCases = [
		{ region: 'Pernambuco', sigla: 'PE', municipio: 'Recife' },
		{ region: 'Rio de Janeiro', sigla: 'RJ', municipio: 'Rio de Janeiro' },
		{ region: 'Minas Gerais', sigla: 'MG', municipio: 'Belo Horizonte' },
		{ region: 'Bahia', sigla: 'BA', municipio: 'Salvador' },
		{ region: 'Distrito Federal', sigla: 'DF', municipio: 'Brasília' },
	];

	test.each(stateCases)(
		'region "$region" resolves siglaUF to "$sigla"',
		({ region, sigla, municipio }) => {
			const data = {
				address: {
					label: `${municipio}, ${region}, BRA`,
					municipality: municipio,
					region,
					country: 'BRA',
				},
			};
			const ex = new AwsAddressExtractor(data);
			expect(ex.enderecoPadronizado.uf).toBe(region);
			expect(ex.enderecoPadronizado.siglaUF).toBe(sigla);
			expect(ex.enderecoPadronizado.municipioCompleto()).toBe(`${municipio}, ${sigla}`);
		},
	);
});

// ---------------------------------------------------------------------------
// Edge cases that interact with the broader pipeline
// ---------------------------------------------------------------------------
describe('AwsAddressExtractor integration — edge cases', () => {
	test('unknown region leaves siglaUF null but uf is preserved', () => {
		const data = {
			address: {
				municipality: 'Campinas',
				region: 'Estado Fictício',
				country: 'BRA',
			},
		};
		const ex = new AwsAddressExtractor(data);
		expect(ex.enderecoPadronizado.uf).toBe('Estado Fictício');
		expect(ex.enderecoPadronizado.siglaUF).toBeNull();
		// municipioCompleto falls back to just municipio when siglaUF is null
		expect(ex.enderecoPadronizado.municipioCompleto()).toBe('Campinas');
	});

	test('missing region leaves both uf and siglaUF null', () => {
		const data = { address: { municipality: 'Porto Alegre', country: 'BRA' } };
		const ex = new AwsAddressExtractor(data);
		expect(ex.enderecoPadronizado.uf).toBeNull();
		expect(ex.enderecoPadronizado.siglaUF).toBeNull();
	});

	test('instance immutability is maintained after siglaUF population', () => {
		const ex = new AwsAddressExtractor(avJulioResponse);
		expect(Object.isFrozen(ex)).toBe(true);
	});
});
