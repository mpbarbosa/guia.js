/**
 * Tests for OSM JSON to Brazilian Address Standard translation
 * Validates FR-1, FR-2, and FR-3 from the functional specification
 */

// Mock document to prevent errors in test environment
global.document = undefined;

const { AddressDataExtractor, BrazilianStandardAddress } = require('../src/guia.js');

describe('OSM Address Tag Translation', () => {
    beforeEach(() => {
        // Clear cache before each test
        AddressDataExtractor.clearCache();
    });

    afterEach(() => {
        // Clean up after each test
        AddressDataExtractor.clearCache();
    });

    describe('FR-1: Identify and Extract OSM Address Tags', () => {
        test('should extract all standard OSM address tags', () => {
            const osmData = {
                address: {
                    'addr:street': 'Rua Oscar Freire',
                    'addr:housenumber': '123',
                    'addr:neighbourhood': 'Jardins',
                    'addr:city': 'São Paulo',
                    'addr:state': 'SP',
                    'addr:postcode': '01426-001'
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(osmData);

            expect(result).toBeDefined();
            expect(result.logradouro).toBe('Rua Oscar Freire');
            expect(result.numero).toBe('123');
            expect(result.bairro).toBe('Jardins');
            expect(result.municipio).toBe('São Paulo');
            expect(result.uf).toBe('SP');
            expect(result.cep).toBe('01426-001');
        });

        test('should handle missing OSM tags gracefully', () => {
            const osmData = {
                address: {
                    'addr:street': 'Avenida Paulista',
                    'addr:city': 'São Paulo'
                    // Missing: housenumber, neighbourhood, state, postcode
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(osmData);

            expect(result).toBeDefined();
            expect(result.logradouro).toBe('Avenida Paulista');
            expect(result.numero).toBeNull();
            expect(result.bairro).toBeNull();
            expect(result.municipio).toBe('São Paulo');
            expect(result.uf).toBeNull();
            expect(result.cep).toBeNull();
        });

        test('should handle empty address object', () => {
            const osmData = {
                address: {}
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(osmData);

            expect(result).toBeDefined();
            expect(result.logradouro).toBeNull();
            expect(result.numero).toBeNull();
            expect(result.bairro).toBeNull();
            expect(result.municipio).toBeNull();
            expect(result.uf).toBeNull();
            expect(result.cep).toBeNull();
        });

        test('should handle null data gracefully', () => {
            const osmData = null;

            const result = AddressDataExtractor.getBrazilianStandardAddress(osmData);

            expect(result).toBeDefined();
            expect(result.logradouro).toBeNull();
        });
    });

    describe('FR-2: Map to Brazilian Address Fields', () => {
        test('should map OSM tags to Brazilian standard fields', () => {
            const osmData = {
                address: {
                    'addr:street': 'Rua Augusta',
                    'addr:housenumber': '456',
                    'addr:neighbourhood': 'Consolação',
                    'addr:city': 'São Paulo',
                    'addr:state': 'São Paulo',
                    'addr:postcode': '01305-000'
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(osmData);

            // Verify Brazilian field names
            expect(result).toHaveProperty('logradouro');
            expect(result).toHaveProperty('numero');
            expect(result).toHaveProperty('bairro');
            expect(result).toHaveProperty('municipio');
            expect(result).toHaveProperty('uf');
            expect(result).toHaveProperty('cep');
            expect(result).toHaveProperty('pais');

            // Verify values
            expect(result.logradouro).toBe('Rua Augusta');
            expect(result.numero).toBe('456');
            expect(result.bairro).toBe('Consolação');
            expect(result.municipio).toBe('São Paulo');
            expect(result.uf).toBe('São Paulo');
            expect(result.cep).toBe('01305-000');
            expect(result.pais).toBe('Brasil');
        });

        test('should prioritize OSM tags over Nominatim format', () => {
            const mixedData = {
                address: {
                    'addr:street': 'OSM Street Name',
                    'road': 'Nominatim Road Name',
                    'addr:housenumber': '123',
                    'house_number': '456',
                    'addr:city': 'OSM City',
                    'city': 'Nominatim City'
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(mixedData);

            // OSM tags should take precedence
            expect(result.logradouro).toBe('OSM Street Name');
            expect(result.numero).toBe('123');
            expect(result.municipio).toBe('OSM City');
        });

        test('should fallback to Nominatim format when OSM tags missing', () => {
            const nominatimData = {
                address: {
                    'road': 'Rua das Flores',
                    'house_number': '789',
                    'neighbourhood': 'Centro',
                    'city': 'Rio de Janeiro',
                    'state': 'RJ',
                    'postcode': '20000-000'
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(nominatimData);

            expect(result.logradouro).toBe('Rua das Flores');
            expect(result.numero).toBe('789');
            expect(result.bairro).toBe('Centro');
            expect(result.municipio).toBe('Rio de Janeiro');
            expect(result.uf).toBe('RJ');
            expect(result.cep).toBe('20000-000');
        });

        test('should extract siglaUF from ISO3166-2-lvl4 field', () => {
            // Test data with ISO3166-2-lvl4 field for Rio de Janeiro
            const nominatimDataWithISO = {
                address: {
                    'road': 'Avenida Atlântica',
                    'neighbourhood': 'Copacabana',
                    'city': 'Rio de Janeiro',
                    'ISO3166-2-lvl4': 'BR-RJ',
                    'postcode': '22070-001'
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(nominatimDataWithISO);

            expect(result.logradouro).toBe('Avenida Atlântica');
            expect(result.bairro).toBe('Copacabana');
            expect(result.municipio).toBe('Rio de Janeiro');
            expect(result.uf).toBeNull(); // uf should be null when no state field exists
            expect(result.siglaUF).toBe('RJ'); // siglaUF should extract "RJ" from "BR-RJ"
            expect(result.cep).toBe('22070-001');
        });

        test('should prioritize state_code over ISO3166-2-lvl4', () => {
            const nominatimData = {
                address: {
                    'city': 'São Paulo',
                    'state_code': 'SP',
                    'ISO3166-2-lvl4': 'BR-RJ' // This should be ignored since state_code exists
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(nominatimData);

            expect(result.municipio).toBe('São Paulo');
            expect(result.uf).toBeNull(); // uf should be null when no state field exists (only state_code)
            expect(result.siglaUF).toBe('SP'); // siglaUF should use state_code, not ISO3166-2-lvl4
        });

        test('should handle various Brazilian state codes in ISO3166-2-lvl4', () => {
            const testCases = [
                { iso: 'BR-SP', city: 'São Paulo', expected: 'SP' },
                { iso: 'BR-RJ', city: 'Rio de Janeiro', expected: 'RJ' },
                { iso: 'BR-MG', city: 'Belo Horizonte', expected: 'MG' },
                { iso: 'BR-DF', city: 'Brasília', expected: 'DF' },
                { iso: 'BR-RS', city: 'Porto Alegre', expected: 'RS' },
                { iso: 'BR-BA', city: 'Salvador', expected: 'BA' }
            ];

            testCases.forEach(({ iso, city, expected }) => {
                const nominatimData = {
                    address: {
                        'city': city,
                        'ISO3166-2-lvl4': iso
                    }
                };

                const result = AddressDataExtractor.getBrazilianStandardAddress(nominatimData);
                expect(result.uf).toBeNull(); // uf should be null when no state field exists
                expect(result.siglaUF).toBe(expected); // siglaUF should extract from ISO3166-2-lvl4
            });
        });

        test('should return null for invalid ISO3166-2-lvl4 format', () => {
            const testCases = [
                { iso: 'invalid' },
                { iso: 'BR-' },
                { iso: 'BR-ABC' },
                { iso: 'RJ' },
                { iso: '' },
                { iso: null }
            ];

            testCases.forEach(({ iso }) => {
                const nominatimData = {
                    address: {
                        'city': 'Test City',
                        'ISO3166-2-lvl4': iso
                    }
                };

                const result = AddressDataExtractor.getBrazilianStandardAddress(nominatimData);
                expect(result.uf).toBeNull();
            });
        });
    });

    describe('FR-3: Format and Output Brazilian Address', () => {
        test('should return BrazilianStandardAddress instance', () => {
            const osmData = {
                address: {
                    'addr:street': 'Rua Test',
                    'addr:city': 'Test City'
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(osmData);

            expect(result).toBeInstanceOf(BrazilianStandardAddress);
        });

        test('should format complete address string', () => {
            const osmData = {
                address: {
                    'addr:street': 'Rua Oscar Freire',
                    'addr:housenumber': '123',
                    'addr:neighbourhood': 'Jardins',
                    'addr:city': 'São Paulo',
                    'addr:state': 'SP',
                    'addr:postcode': '01426-001'
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(osmData);
            const completeAddress = result.enderecoCompleto();

            expect(completeAddress).toContain('Rua Oscar Freire');
            expect(completeAddress).toContain('123');
            expect(completeAddress).toContain('Jardins');
            expect(completeAddress).toContain('São Paulo');
            expect(completeAddress).toContain('SP');
            expect(completeAddress).toContain('01426-001');
        });

        test('should format partial address with missing fields', () => {
            const osmData = {
                address: {
                    'addr:street': 'Avenida Paulista',
                    'addr:city': 'São Paulo'
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(osmData);
            const completeAddress = result.enderecoCompleto();

            expect(completeAddress).toContain('Avenida Paulista');
            expect(completeAddress).toContain('São Paulo');
            expect(completeAddress).not.toContain('null');
        });

        test('should provide formatted logradouro with number', () => {
            const osmData = {
                address: {
                    'addr:street': 'Rua Test',
                    'addr:housenumber': '100'
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(osmData);
            const logradouroCompleto = result.logradouroCompleto();

            expect(logradouroCompleto).toBe('Rua Test, 100');
        });

        test('should provide formatted municipio with state', () => {
            const osmData = {
                address: {
                    'addr:city': 'Belo Horizonte',
                    'addr:state': 'MG'
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(osmData);
            const municipioCompleto = result.municipioCompleto();

            expect(municipioCompleto).toBe('Belo Horizonte, MG');
        });
    });

    describe('UC-1: Convert OSM Address to Brazilian Format', () => {
        test('should convert complete OSM address to Brazilian format', () => {
            // User submits OSM JSON address
            const osmAddress = {
                address: {
                    'addr:street': 'Rua XV de Novembro',
                    'addr:housenumber': '500',
                    'addr:neighbourhood': 'Centro',
                    'addr:city': 'Curitiba',
                    'addr:state': 'PR',
                    'addr:postcode': '80020-000'
                }
            };

            // System processes and returns Brazilian format
            const brazilianAddress = AddressDataExtractor.getBrazilianStandardAddress(osmAddress);

            // Address can be used in Brazilian systems
            expect(brazilianAddress.logradouro).toBe('Rua XV de Novembro');
            expect(brazilianAddress.numero).toBe('500');
            expect(brazilianAddress.bairro).toBe('Centro');
            expect(brazilianAddress.municipio).toBe('Curitiba');
            expect(brazilianAddress.uf).toBe('PR');
            expect(brazilianAddress.cep).toBe('80020-000');
            expect(brazilianAddress.pais).toBe('Brasil');
        });
    });

    describe('UC-2: Handle Incomplete OSM Data', () => {
        test('should handle OSM data with missing tags', () => {
            // OSM data with some tags missing
            const partialOsmAddress = {
                address: {
                    'addr:street': 'Avenida Atlântica',
                    // Missing: housenumber, neighbourhood, state, postcode
                    'addr:city': 'Rio de Janeiro'
                }
            };

            // System outputs available fields
            const brazilianAddress = AddressDataExtractor.getBrazilianStandardAddress(partialOsmAddress);

            // Address is still usable with caveats
            expect(brazilianAddress.logradouro).toBe('Avenida Atlântica');
            expect(brazilianAddress.numero).toBeNull();
            expect(brazilianAddress.bairro).toBeNull();
            expect(brazilianAddress.municipio).toBe('Rio de Janeiro');
            expect(brazilianAddress.uf).toBeNull();
            expect(brazilianAddress.cep).toBeNull();
            
            // Should still format correctly with available data
            const formatted = brazilianAddress.enderecoCompleto();
            expect(formatted).toBeTruthy();
            expect(formatted).toContain('Avenida Atlântica');
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid data types gracefully', () => {
            const invalidData = {
                address: {
                    'addr:street': 123, // Number instead of string
                    'addr:housenumber': true, // Boolean instead of string
                    'addr:city': null
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(invalidData);

            expect(result).toBeDefined();
            // Values should be preserved as-is (no type validation required)
            expect(result.logradouro).toBe(123);
            expect(result.numero).toBe(true);
        });

        test('should handle missing address property', () => {
            const dataWithoutAddress = {
                lat: -23.5505,
                lon: -46.6333
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(dataWithoutAddress);

            expect(result).toBeDefined();
            expect(result.logradouro).toBeNull();
            expect(result.municipio).toBeNull();
        });

        test('should handle unexpected tags by ignoring them', () => {
            const dataWithUnexpectedTags = {
                address: {
                    'addr:street': 'Rua Valid',
                    'unexpected:tag': 'Should be ignored',
                    'another:weird:tag': 'Also ignored'
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(dataWithUnexpectedTags);

            expect(result).toBeDefined();
            expect(result.logradouro).toBe('Rua Valid');
            // Unexpected tags are simply not mapped
        });
    });

    describe('Backward Compatibility', () => {
        test('should still support old Nominatim format', () => {
            const nominatimData = {
                address: {
                    road: 'Rua Oscar Freire',
                    house_number: '123',
                    neighbourhood: 'Jardins',
                    city: 'São Paulo',
                    state: 'SP',
                    postcode: '01426-001'
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(nominatimData);

            expect(result.logradouro).toBe('Rua Oscar Freire');
            expect(result.numero).toBe('123');
            expect(result.bairro).toBe('Jardins');
            expect(result.municipio).toBe('São Paulo');
            expect(result.uf).toBe('SP');
            expect(result.cep).toBe('01426-001');
        });

        test('should support all Nominatim fallback fields', () => {
            const nominatimVariants = {
                address: {
                    street: 'Street Name',        // Fallback for road
                    pedestrian: 'Pedestrian Way',  // Another fallback for road
                    suburb: 'Suburb Area',         // Fallback for neighbourhood
                    quarter: 'Quarter Area',       // Another fallback
                    town: 'Town Name',             // Fallback for city
                    municipality: 'Municipality',  // Another fallback
                    village: 'Village Name',       // Another fallback
                    state_code: 'SC'               // Provides siglaUF only
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(nominatimVariants);

            // First available fallback should be used
            expect(result.logradouro).toBe('Street Name');
            expect(result.bairro).toBe('Suburb Area');
            expect(result.municipio).toBe('Town Name');
            expect(result.uf).toBeNull(); // uf should be null when no state field exists (only state_code)
            expect(result.siglaUF).toBe('SC'); // siglaUF should use state_code
        });
    });

    describe('Performance and Caching', () => {
        test('should cache translated addresses', () => {
            const osmData = {
                address: {
                    'addr:street': 'Rua Cache Test',
                    'addr:city': 'Test City'
                }
            };

            // First call
            const result1 = AddressDataExtractor.getBrazilianStandardAddress(osmData);
            
            // Second call with same data (should use cache)
            const result2 = AddressDataExtractor.getBrazilianStandardAddress(osmData);

            // Should return equivalent cached data with same values
            expect(result1.logradouro).toBe(result2.logradouro);
            expect(result1.municipio).toBe(result2.municipio);
            expect(result1.cep).toBe(result2.cep);
            expect(result1.bairro).toBe(result2.bairro);
            expect(result1.uf).toBe(result2.uf);
            expect(result1.numero).toBe(result2.numero);
        });
    });

    describe('Integration Tests', () => {
        test('should handle real-world OSM address example', () => {
            // Real-world example: Shopping Morumbi in São Paulo
            const realWorldOSM = {
                address: {
                    'addr:street': 'Avenida Roque Petroni Júnior',
                    'addr:housenumber': '1089',
                    'addr:neighbourhood': 'Jardim das Acácias',
                    'addr:city': 'São Paulo',
                    'addr:state': 'SP',
                    'addr:postcode': '04707-000'
                },
                class: 'shop',
                type: 'mall',
                name: 'Shopping Morumbi'
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(realWorldOSM);

            expect(result.logradouro).toBe('Avenida Roque Petroni Júnior');
            expect(result.numero).toBe('1089');
            expect(result.bairro).toBe('Jardim das Acácias');
            expect(result.municipio).toBe('São Paulo');
            expect(result.uf).toBe('SP');
            expect(result.cep).toBe('04707-000');
            
            // Should also have reference place
            expect(result.referencePlace).toBeDefined();
        });

        test('should handle mixed OSM and Nominatim format', () => {
            // Some APIs might return mixed formats
            const mixedFormat = {
                address: {
                    'addr:street': 'Rua OSM',
                    'house_number': '456',  // Nominatim format
                    'addr:neighbourhood': 'OSM Bairro',
                    'city': 'Nominatim City',  // Nominatim format
                    'addr:state': 'SP',
                    'postcode': '12345-000'  // Nominatim format
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(mixedFormat);

            // OSM tags should be prioritized
            expect(result.logradouro).toBe('Rua OSM');
            expect(result.bairro).toBe('OSM Bairro');
            expect(result.uf).toBe('SP');
            
            // Nominatim fallbacks should work
            expect(result.numero).toBe('456');
            expect(result.municipio).toBe('Nominatim City');
            expect(result.cep).toBe('12345-000');
        });
    });

    describe('State Field Rules Validation', () => {
        test('uf should contain ONLY full state names', () => {
            // Test case 1: Full state name in state field
            const dataWithFullName = {
                address: {
                    'state': 'São Paulo',
                    'state_code': 'SP'
                }
            };
            const result1 = AddressDataExtractor.getBrazilianStandardAddress(dataWithFullName);
            expect(result1.uf).toBe('São Paulo'); // Full name
            expect(result1.siglaUF).toBe('SP');    // Abbreviation

            // Test case 2: Only abbreviation available (state_code only)
            const dataWithAbbrevOnly = {
                address: {
                    'state_code': 'RJ'
                }
            };
            const result2 = AddressDataExtractor.getBrazilianStandardAddress(dataWithAbbrevOnly);
            expect(result2.uf).toBeNull();        // No full name available
            expect(result2.siglaUF).toBe('RJ');   // Abbreviation from state_code

            // Test case 3: Only ISO3166-2-lvl4 available
            const dataWithISOOnly = {
                address: {
                    'ISO3166-2-lvl4': 'BR-MG'
                }
            };
            const result3 = AddressDataExtractor.getBrazilianStandardAddress(dataWithISOOnly);
            expect(result3.uf).toBeNull();        // No full name available
            expect(result3.siglaUF).toBe('MG');   // Extracted from ISO
        });

        test('siglaUF should contain ONLY two-letter abbreviations', () => {
            // Test case 1: state_code provides abbreviation
            const dataWithStateCode = {
                address: {
                    'state': 'Rio de Janeiro',
                    'state_code': 'RJ'
                }
            };
            const result1 = AddressDataExtractor.getBrazilianStandardAddress(dataWithStateCode);
            expect(result1.siglaUF).toBe('RJ');
            expect(result1.siglaUF).toMatch(/^[A-Z]{2}$/); // Exactly 2 uppercase letters

            // Test case 2: ISO3166-2-lvl4 provides abbreviation
            const dataWithISO = {
                address: {
                    'state': 'Bahia',
                    'ISO3166-2-lvl4': 'BR-BA'
                }
            };
            const result2 = AddressDataExtractor.getBrazilianStandardAddress(dataWithISO);
            expect(result2.siglaUF).toBe('BA');
            expect(result2.siglaUF).toMatch(/^[A-Z]{2}$/);

            // Test case 3: No abbreviation source available
            const dataNoAbbrev = {
                address: {
                    'state': 'Pernambuco'
                    // No state_code or ISO3166-2-lvl4
                }
            };
            const result3 = AddressDataExtractor.getBrazilianStandardAddress(dataNoAbbrev);
            expect(result3.uf).toBe('Pernambuco');  // Full name present
            expect(result3.siglaUF).toBeNull();      // No abbreviation available
        });

        test('edge case: addr:state with two-letter code should populate siglaUF', () => {
            // When addr:state contains a two-letter code (backward compatibility)
            const dataWithAddrStateCode = {
                address: {
                    'addr:state': 'RS'  // Two-letter code in OSM tag
                }
            };
            const result = AddressDataExtractor.getBrazilianStandardAddress(dataWithAddrStateCode);
            expect(result.uf).toBe('RS');        // uf gets the two-letter code
            expect(result.siglaUF).toBe('RS');   // siglaUF should also get it
        });
    });
});
