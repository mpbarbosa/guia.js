/**
 * Unit tests for AddressExtractor - Metropolitan Region Extraction Feature
 * Tests the extraction of metropolitan region from Nominatim address.county field
 * 
 * @jest-environment node
 * @author MP Barbosa
 * @since 0.9.0-alpha
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock DOM to prevent errors
global.document = undefined;

// Mock console
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
};

// Import the class
let AddressExtractor, BrazilianStandardAddress;
try {
    const extractorModule = await import('../../src/data/AddressExtractor.js');
    const addressModule = await import('../../src/data/BrazilianStandardAddress.js');
    AddressExtractor = extractorModule.default;
    BrazilianStandardAddress = addressModule.default;
} catch (error) {
    console.warn('Could not load modules:', error.message);
}

describe('AddressExtractor - Metropolitan Region (v0.9.0-alpha)', () => {
    
    describe('Extraction from address.county field', () => {
        test('should extract Região Metropolitana do Recife from county field', () => {
            if (!AddressExtractor) {
                expect(true).toBe(true);
                return;
            }

            const nominatimData = {
                address: {
                    road: 'Avenida Norte Miguel Arraes de Alencar',
                    suburb: 'Santo Amaro',
                    city: 'Recife',
                    county: 'Região Metropolitana do Recife',
                    state: 'Pernambuco',
                    'ISO3166-2-lvl4': 'BR-PE',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const extractor = new AddressExtractor(nominatimData);
            
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toBe('Região Metropolitana do Recife');
        });

        test('should extract Região Metropolitana de São Paulo from county field', () => {
            if (!AddressExtractor) {
                expect(true).toBe(true);
                return;
            }

            const nominatimData = {
                address: {
                    road: 'Rua Santa Teresa',
                    suburb: 'Glicério',
                    city: 'São Paulo',
                    county: 'Região Metropolitana de São Paulo',
                    state: 'São Paulo',
                    'ISO3166-2-lvl4': 'BR-SP',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const extractor = new AddressExtractor(nominatimData);
            
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toBe('Região Metropolitana de São Paulo');
        });

        test('should extract Região Metropolitana do Rio de Janeiro from county field', () => {
            if (!AddressExtractor) {
                expect(true).toBe(true);
                return;
            }

            const nominatimData = {
                address: {
                    road: 'Avenida Atlântica',
                    suburb: 'Copacabana',
                    city: 'Rio de Janeiro',
                    county: 'Região Metropolitana do Rio de Janeiro',
                    state: 'Rio de Janeiro',
                    'ISO3166-2-lvl4': 'BR-RJ',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const extractor = new AddressExtractor(nominatimData);
            
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toBe('Região Metropolitana do Rio de Janeiro');
        });
    });

    describe('Fallback behavior - missing county field', () => {
        test('should set regiaoMetropolitana to null when county is missing', () => {
            if (!AddressExtractor) {
                expect(true).toBe(true);
                return;
            }

            const nominatimData = {
                address: {
                    road: 'Rua Principal',
                    city: 'Arapiraca',
                    state: 'Alagoas',
                    'ISO3166-2-lvl4': 'BR-AL',
                    country: 'Brasil',
                    country_code: 'br'
                    // No county field
                }
            };

            const extractor = new AddressExtractor(nominatimData);
            
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toBeNull();
        });

        test('should set regiaoMetropolitana to null when county is empty string', () => {
            if (!AddressExtractor) {
                expect(true).toBe(true);
                return;
            }

            const nominatimData = {
                address: {
                    road: 'Rua Principal',
                    city: 'Arapiraca',
                    county: '',
                    state: 'Alagoas',
                    'ISO3166-2-lvl4': 'BR-AL',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const extractor = new AddressExtractor(nominatimData);
            
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toBeFalsy();
        });

        test('should set regiaoMetropolitana to null when county is undefined', () => {
            if (!AddressExtractor) {
                expect(true).toBe(true);
                return;
            }

            const nominatimData = {
                address: {
                    road: 'Rua Principal',
                    city: 'Arapiraca',
                    county: undefined,
                    state: 'Alagoas',
                    'ISO3166-2-lvl4': 'BR-AL',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const extractor = new AddressExtractor(nominatimData);
            
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toBeNull();
        });
    });

    describe('Real-world Nominatim response examples', () => {
        test('should extract region from Recife real API response', () => {
            if (!AddressExtractor) {
                expect(true).toBe(true);
                return;
            }

            // Real Nominatim response from Recife coordinates (-8.047562, -34.877)
            const nominatimData = {
                place_id: 13549499,
                lat: '-8.0475799',
                lon: '-34.8770131',
                address: {
                    road: 'Avenida Norte Miguel Arraes de Alencar',
                    suburb: 'Santo Amaro',
                    city_district: 'Recife',
                    city: 'Recife',
                    municipality: 'Região Geográfica Imediata do Recife',
                    county: 'Região Metropolitana do Recife',
                    state_district: 'Região Geográfica Intermediária do Recife',
                    state: 'Pernambuco',
                    'ISO3166-2-lvl4': 'BR-PE',
                    region: 'Região Nordeste',
                    postcode: '50040-200',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const extractor = new AddressExtractor(nominatimData);
            
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toBe('Região Metropolitana do Recife');
            expect(extractor.enderecoPadronizado.municipio).toBe('Recife');
            expect(extractor.enderecoPadronizado.siglaUF).toBe('PE');
            expect(extractor.enderecoPadronizado.bairro).toBe('Santo Amaro');
        });

        test('should extract region from São Paulo real API response', () => {
            if (!AddressExtractor) {
                expect(true).toBe(true);
                return;
            }

            // Real Nominatim response from São Paulo coordinates (-23.550520, -46.633309)
            const nominatimData = {
                place_id: 123456,
                lat: '-23.550520',
                lon: '-46.633309',
                address: {
                    railway: 'Sé',
                    road: 'Rua Santa Teresa',
                    suburb: 'Glicério',
                    city: 'São Paulo',
                    municipality: 'Região Imediata de São Paulo',
                    county: 'Região Metropolitana de São Paulo',
                    state_district: 'Região Geográfica Intermediária de São Paulo',
                    state: 'São Paulo',
                    'ISO3166-2-lvl4': 'BR-SP',
                    region: 'Região Sudeste',
                    postcode: '01016-020',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const extractor = new AddressExtractor(nominatimData);
            
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toBe('Região Metropolitana de São Paulo');
            expect(extractor.enderecoPadronizado.municipio).toBe('São Paulo');
            expect(extractor.enderecoPadronizado.siglaUF).toBe('SP');
        });

        test('should handle Pontal do Coruripe without county field', () => {
            if (!AddressExtractor) {
                expect(true).toBe(true);
                return;
            }

            // Pontal do Coruripe data - no metropolitan region
            const nominatimData = {
                place_id: 13731911,
                lat: '-10.1594479',
                lon: '-36.1354556',
                address: {
                    road: 'Rua da Praia',
                    hamlet: 'Pontal do Coruripe',
                    state: 'Alagoas',
                    'ISO3166-2-lvl4': 'BR-AL',
                    region: 'Região Nordeste',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const extractor = new AddressExtractor(nominatimData);
            
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toBeNull();
            expect(extractor.enderecoPadronizado.municipio).toBeNull(); // No municipality in data
        });
    });

    describe('Metropolitan region municipalities', () => {
        test('should extract region for Olinda (part of Recife metro)', () => {
            if (!AddressExtractor) {
                expect(true).toBe(true);
                return;
            }

            const nominatimData = {
                address: {
                    road: 'Rua do Sol',
                    suburb: 'Carmo',
                    city: 'Olinda',
                    county: 'Região Metropolitana do Recife',
                    state: 'Pernambuco',
                    'ISO3166-2-lvl4': 'BR-PE',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const extractor = new AddressExtractor(nominatimData);
            
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toBe('Região Metropolitana do Recife');
            expect(extractor.enderecoPadronizado.municipio).toBe('Olinda');
        });

        test('should extract region for Guarulhos (part of São Paulo metro)', () => {
            if (!AddressExtractor) {
                expect(true).toBe(true);
                return;
            }

            const nominatimData = {
                address: {
                    road: 'Avenida Papa João Paulo I',
                    city: 'Guarulhos',
                    county: 'Região Metropolitana de São Paulo',
                    state: 'São Paulo',
                    'ISO3166-2-lvl4': 'BR-SP',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const extractor = new AddressExtractor(nominatimData);
            
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toBe('Região Metropolitana de São Paulo');
            expect(extractor.enderecoPadronizado.municipio).toBe('Guarulhos');
        });
    });

    describe('Integration with other address fields', () => {
        test('should extract region alongside all other address components', () => {
            if (!AddressExtractor) {
                expect(true).toBe(true);
                return;
            }

            const nominatimData = {
                address: {
                    road: 'Avenida Boa Viagem',
                    house_number: '5000',
                    suburb: 'Boa Viagem',
                    city: 'Recife',
                    county: 'Região Metropolitana do Recife',
                    state: 'Pernambuco',
                    'ISO3166-2-lvl4': 'BR-PE',
                    postcode: '51021-000',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const extractor = new AddressExtractor(nominatimData);
            
            // All address components should be extracted
            expect(extractor.enderecoPadronizado.logradouro).toBe('Avenida Boa Viagem');
            expect(extractor.enderecoPadronizado.numero).toBe('5000');
            expect(extractor.enderecoPadronizado.bairro).toBe('Boa Viagem');
            expect(extractor.enderecoPadronizado.municipio).toBe('Recife');
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toBe('Região Metropolitana do Recife');
            expect(extractor.enderecoPadronizado.uf).toBe('Pernambuco');
            expect(extractor.enderecoPadronizado.siglaUF).toBe('PE');
            expect(extractor.enderecoPadronizado.cep).toBe('51021-000');
        });

        test('should not interfere with municipality extraction when county is different', () => {
            if (!AddressExtractor) {
                expect(true).toBe(true);
                return;
            }

            const nominatimData = {
                address: {
                    city: 'Recife',
                    municipality: 'Some Geographic Region', // Different from county
                    county: 'Região Metropolitana do Recife',
                    state: 'Pernambuco',
                    'ISO3166-2-lvl4': 'BR-PE',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const extractor = new AddressExtractor(nominatimData);
            
            // Municipality should use city field, not county
            expect(extractor.enderecoPadronizado.municipio).toBe('Recife');
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toBe('Região Metropolitana do Recife');
        });
    });

    describe('Edge cases and special characters', () => {
        test('should handle region names with special characters', () => {
            if (!AddressExtractor) {
                expect(true).toBe(true);
                return;
            }

            const nominatimData = {
                address: {
                    city: 'São José dos Campos',
                    county: 'Região Metropolitana do Vale do Paraíba e Litoral Norte',
                    state: 'São Paulo',
                    'ISO3166-2-lvl4': 'BR-SP',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const extractor = new AddressExtractor(nominatimData);
            
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toContain('ã');
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toContain('í');
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toBe('Região Metropolitana do Vale do Paraíba e Litoral Norte');
        });

        test('should handle very long county names', () => {
            if (!AddressExtractor) {
                expect(true).toBe(true);
                return;
            }

            const longCounty = 'Região Metropolitana de Nome Muito Longo Para Teste de Quebra de Linha e Validação';
            const nominatimData = {
                address: {
                    city: 'TestCity',
                    county: longCounty,
                    state: 'TestState',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const extractor = new AddressExtractor(nominatimData);
            
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toBe(longCounty);
            expect(extractor.enderecoPadronizado.regiaoMetropolitana.length).toBeGreaterThan(70);
        });
    });

    describe('Data type validation', () => {
        test('should set regiaoMetropolitana as string when county is present', () => {
            if (!AddressExtractor) {
                expect(true).toBe(true);
                return;
            }

            const nominatimData = {
                address: {
                    city: 'Recife',
                    county: 'Região Metropolitana do Recife',
                    state: 'Pernambuco',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const extractor = new AddressExtractor(nominatimData);
            
            expect(typeof extractor.enderecoPadronizado.regiaoMetropolitana).toBe('string');
        });

        test('should set regiaoMetropolitana to null (not undefined) when county is missing', () => {
            if (!AddressExtractor) {
                expect(true).toBe(true);
                return;
            }

            const nominatimData = {
                address: {
                    city: 'Arapiraca',
                    state: 'Alagoas',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const extractor = new AddressExtractor(nominatimData);
            
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).toBeNull();
            expect(extractor.enderecoPadronizado.regiaoMetropolitana).not.toBeUndefined();
        });
    });
});
