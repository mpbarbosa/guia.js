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

		test('siglaUF is resolved from region via state name lookup', () => {
			const ex = new AwsAddressExtractor(sampleAwsResponse);
			expect(ex.enderecoPadronizado.siglaUF).toBe('SP');
		});

		test('logradouro is parsed from label first segment', () => {
			const ex = new AwsAddressExtractor(sampleAwsResponse);
			expect(ex.enderecoPadronizado.logradouro).toBe('Movelstore');
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

// ---------------------------------------------------------------------------
// New sample: street address with addressNumber, no neighborhood field
// { "latitude": -23.5407368, "longitude": -46.5927702,
//   "address": { "label": "Rua Eloi Cerqueira 72, Belém, São Paulo, 03062-010, BRA",
//                "addressNumber": "72", "municipality": "São Paulo",
//                "region": "São Paulo", "country": "BRA",
//                "postalCode": "03062-010", "interpolated": false } }
// ---------------------------------------------------------------------------

const ruaEloiSample = {
	provider: 'aws-location-service',
	coordinates: { latitude: -23.5407368, longitude: -46.5927702 },
	address: {
		label: 'Rua Eloi Cerqueira 72, Belém, São Paulo, 03062-010, BRA',
		addressNumber: '72',
		municipality: 'São Paulo',
		region: 'São Paulo',
		country: 'BRA',
		postalCode: '03062-010',
		interpolated: false,
	},
};

describe('AwsAddressExtractor — Rua Eloi Cerqueira sample (label-parsed fields)', () => {
	test('extracts numero from addressNumber', () => {
		const ex = new AwsAddressExtractor(ruaEloiSample);
		expect(ex.enderecoPadronizado.numero).toBe('72');
	});

	test('extracts logradouro from label (strips addressNumber)', () => {
		const ex = new AwsAddressExtractor(ruaEloiSample);
		expect(ex.enderecoPadronizado.logradouro).toBe('Rua Eloi Cerqueira');
	});

	test('extracts bairro from label when neighborhood field is absent', () => {
		const ex = new AwsAddressExtractor(ruaEloiSample);
		expect(ex.enderecoPadronizado.bairro).toBe('Belém');
	});

	test('extracts municipio from municipality', () => {
		const ex = new AwsAddressExtractor(ruaEloiSample);
		expect(ex.enderecoPadronizado.municipio).toBe('São Paulo');
	});

	test('extracts uf from region', () => {
		const ex = new AwsAddressExtractor(ruaEloiSample);
		expect(ex.enderecoPadronizado.uf).toBe('São Paulo');
	});

	test('extracts cep from postalCode', () => {
		const ex = new AwsAddressExtractor(ruaEloiSample);
		expect(ex.enderecoPadronizado.cep).toBe('03062-010');
	});

	test('normalizes BRA country code to Brasil', () => {
		const ex = new AwsAddressExtractor(ruaEloiSample);
		expect(ex.enderecoPadronizado.pais).toBe('Brasil');
	});

	test('siglaUF is resolved from region via state name lookup', () => {
		const ex = new AwsAddressExtractor(ruaEloiSample);
		expect(ex.enderecoPadronizado.siglaUF).toBe('SP');
	});

	test('regiaoMetropolitana is null (AWS does not provide metro region)', () => {
		const ex = new AwsAddressExtractor(ruaEloiSample);
		expect(ex.enderecoPadronizado.regiaoMetropolitana).toBeNull();
	});

	test('enderecoCompleto includes street, bairro, municipio, siglaUF, cep', () => {
		const ex = new AwsAddressExtractor(ruaEloiSample);
		const full = ex.enderecoPadronizado.enderecoCompleto();
		expect(full).toBe('Rua Eloi Cerqueira, 72, Belém, São Paulo, SP, 03062-010');
	});

	test('instance is frozen (immutable)', () => {
		const ex = new AwsAddressExtractor(ruaEloiSample);
		expect(Object.isFrozen(ex)).toBe(true);
	});
});

describe('AwsAddressExtractor — label parsing edge cases', () => {
	test('no label → logradouro is null, bairro from neighborhood', () => {
		const data = { address: { neighborhood: 'Centro', municipality: 'Recife' } };
		const ex = new AwsAddressExtractor(data);
		expect(ex.enderecoPadronizado.logradouro).toBeNull();
		expect(ex.enderecoPadronizado.bairro).toBe('Centro');
	});

	test('label with no addressNumber → full first segment becomes logradouro', () => {
		const data = { address: { label: 'Avenida Paulista, Bela Vista, São Paulo, 01310-100, BRA', municipality: 'São Paulo' } };
		const ex = new AwsAddressExtractor(data);
		expect(ex.enderecoPadronizado.logradouro).toBe('Avenida Paulista');
		expect(ex.enderecoPadronizado.bairro).toBe('Bela Vista');
	});

	test('label parts[1] equals municipality → not set as bairro', () => {
		const data = { address: { label: 'Praça da Sé, São Paulo, São Paulo, 01001-000, BRA', municipality: 'São Paulo' } };
		const ex = new AwsAddressExtractor(data);
		expect(ex.enderecoPadronizado.bairro).toBeNull();
	});

	test('addressNumber present without label → numero extracted, logradouro null', () => {
		const data = { address: { addressNumber: '10', municipality: 'Campinas' } };
		const ex = new AwsAddressExtractor(data);
		expect(ex.enderecoPadronizado.numero).toBe('10');
		expect(ex.enderecoPadronizado.logradouro).toBeNull();
	});

	test('label with only one segment → no bairro extracted from label', () => {
		const data = { address: { label: 'Aeroporto Internacional de Guarulhos', municipality: 'Guarulhos' } };
		const ex = new AwsAddressExtractor(data);
		expect(ex.enderecoPadronizado.bairro).toBeNull();
		expect(ex.enderecoPadronizado.logradouro).toBe('Aeroporto Internacional de Guarulhos');
	});

	test('neighborhood takes priority over label-parsed bairro', () => {
		const data = {
			address: {
				label: 'Rua X 5, LabelBairro, São Paulo, 01000-000, BRA',
				addressNumber: '5',
				neighborhood: 'ExplicitBairro',
				municipality: 'São Paulo',
			},
		};
		const ex = new AwsAddressExtractor(data);
		expect(ex.enderecoPadronizado.bairro).toBe('ExplicitBairro');
	});
});

// ---------------------------------------------------------------------------
// Sample from real capture: Avenida Julio De Castilhos 831
// { "latitude": -23.5407389, "longitude": -46.5927839,
//   "address": { "label": "Avenida Julio De Castilhos 831, Belém, São Paulo, 03059-005, BRA",
//                "addressNumber": "831", "municipality": "São Paulo",
//                "region": "São Paulo", "country": "BRA",
//                "postalCode": "03059-005", "interpolated": false } }
// ---------------------------------------------------------------------------

const avenidaJulioSample = {
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

describe('AwsAddressExtractor — Avenida Julio De Castilhos sample', () => {
	test('extracts numero from addressNumber', () => {
		const ex = new AwsAddressExtractor(avenidaJulioSample);
		expect(ex.enderecoPadronizado.numero).toBe('831');
	});

	test('extracts logradouro from label (strips addressNumber)', () => {
		const ex = new AwsAddressExtractor(avenidaJulioSample);
		expect(ex.enderecoPadronizado.logradouro).toBe('Avenida Julio De Castilhos');
	});

	test('extracts bairro from label when neighborhood field is absent', () => {
		const ex = new AwsAddressExtractor(avenidaJulioSample);
		expect(ex.enderecoPadronizado.bairro).toBe('Belém');
	});

	test('extracts municipio from municipality', () => {
		const ex = new AwsAddressExtractor(avenidaJulioSample);
		expect(ex.enderecoPadronizado.municipio).toBe('São Paulo');
	});

	test('extracts uf from region', () => {
		const ex = new AwsAddressExtractor(avenidaJulioSample);
		expect(ex.enderecoPadronizado.uf).toBe('São Paulo');
	});

	test('resolves siglaUF to SP from region "São Paulo"', () => {
		const ex = new AwsAddressExtractor(avenidaJulioSample);
		expect(ex.enderecoPadronizado.siglaUF).toBe('SP');
	});

	test('extracts cep from postalCode', () => {
		const ex = new AwsAddressExtractor(avenidaJulioSample);
		expect(ex.enderecoPadronizado.cep).toBe('03059-005');
	});

	test('normalizes BRA country code to Brasil', () => {
		const ex = new AwsAddressExtractor(avenidaJulioSample);
		expect(ex.enderecoPadronizado.pais).toBe('Brasil');
	});
});

describe('AwsAddressExtractor — _resolveStateSigla', () => {
	test.each([
		['Acre', 'AC'],
		['Alagoas', 'AL'],
		['Amapá', 'AP'],
		['Amazonas', 'AM'],
		['Bahia', 'BA'],
		['Ceará', 'CE'],
		['Distrito Federal', 'DF'],
		['Espírito Santo', 'ES'],
		['Goiás', 'GO'],
		['Maranhão', 'MA'],
		['Mato Grosso', 'MT'],
		['Mato Grosso do Sul', 'MS'],
		['Minas Gerais', 'MG'],
		['Pará', 'PA'],
		['Paraíba', 'PB'],
		['Paraná', 'PR'],
		['Pernambuco', 'PE'],
		['Piauí', 'PI'],
		['Rio de Janeiro', 'RJ'],
		['Rio Grande do Norte', 'RN'],
		['Rio Grande do Sul', 'RS'],
		['Rondônia', 'RO'],
		['Roraima', 'RR'],
		['Santa Catarina', 'SC'],
		['São Paulo', 'SP'],
		['Sergipe', 'SE'],
		['Tocantins', 'TO'],
	])('resolves %s → %s', (name, sigla) => {
		const data = { address: { region: name } };
		const ex = new AwsAddressExtractor(data);
		expect(ex.enderecoPadronizado.siglaUF).toBe(sigla);
	});

	test('returns null for unknown state name', () => {
		const data = { address: { region: 'Unknown State' } };
		const ex = new AwsAddressExtractor(data);
		expect(ex.enderecoPadronizado.siglaUF).toBeNull();
	});

	test('returns null when region is absent', () => {
		const data = { address: { municipality: 'Recife' } };
		const ex = new AwsAddressExtractor(data);
		expect(ex.enderecoPadronizado.siglaUF).toBeNull();
	});
});
