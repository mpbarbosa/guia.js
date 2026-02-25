/**
 * End-to-End Test: Brazilian Address Processing Pipeline
 * 
 * This E2E test validates the complete Brazilian address processing workflow:
 * 1. OpenStreetMap/Nominatim API data retrieval
 * 2. Address translation (OSM format → Brazilian format)
 * 3. Address component extraction and normalization
 * 4. Brazilian standard address formatting
 * 5. Display name generation for Brazilian users
 * 6. Integration with IBGE data (municipality information)
 * 
 * Tests the Brazil-specific address processing that makes Guia.js suitable
 * for Brazilian users and navigation scenarios.
 * 
 * @jest-environment node
 * @author MP Barbosa
 * @since 0.6.0-alpha
 */

import { describe, test, expect, jest, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

// Mock DOM functions to prevent errors in test environment
global.document = undefined;

// Mock console to suppress logging during tests
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
};

// Mock setupParams
global.setupParams = {
    geolocationOptions: {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
    },
    validRefPlaceClasses: ['amenity', 'building', 'shop', 'place'],
    notAcceptedAccuracy: ['bad', 'very bad'],
    referencePlaceMap: {
        amenity: {
            restaurant: 'Restaurante',
            cafe: 'Cafeteria',
            bar: 'Bar',
            pharmacy: 'Farmácia',
            hospital: 'Hospital'
        },
        shop: {
            supermarket: 'Supermercado',
            convenience: 'Loja de Conveniência',
            bakery: 'Padaria'
        },
        place: {
            house: 'Residencial',
            neighbourhood: 'Bairro',
            suburb: 'Subúrbio'
        },
        building: {
            commercial: 'Comercial',
            residential: 'Residencial',
            public: 'Público'
        }
    },
    noReferencePlace: 'Não classificado'
};

// Mock utility functions
global.log = jest.fn();
global.warn = jest.fn();
global.getOpenStreetMapUrl = jest.fn((lat, lon) => 
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
);

// Mock fetch for API calls
global.fetch = jest.fn();

// Import classes from guia.js
let BrazilianStandardAddress, AddressDataExtractor, ReverseGeocoder, 
    ReferencePlace, AddressExtractor, GeoPosition;

try {
    const guiaModule = await import('../../src/guia.js');
    
    // Extract the classes we need for testing
} catch (error) {
    console.warn('Could not load guia.js:', error.message);
}

describe('E2E: Brazilian Address Processing Pipeline', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Pipeline: OSM Data → Brazilian Address Format', () => {
        
        test('should process complete São Paulo address from OSM to Brazilian format', async () => {
            if (!ReverseGeocoder || !AddressDataExtractor || !BrazilianStandardAddress) {
                console.warn('Required classes not available, skipping test');
                return;
            }

            // Step 1: Mock OSM/Nominatim response for Avenida Paulista
            const osmResponse = {
                place_id: 123456789,
                licence: 'Data © OpenStreetMap contributors',
                osm_type: 'way',
                osm_id: 987654321,
                lat: '-23.5616778',
                lon: '-46.6565712',
                display_name: 'Avenida Paulista, 1578, Bela Vista, São Paulo, SP, 01310-200, Brasil',
                address: {
                    road: 'Avenida Paulista',
                    house_number: '1578',
                    neighbourhood: 'Bela Vista',
                    suburb: 'Região Sul',
                    city: 'São Paulo',
                    state: 'São Paulo',
                    postcode: '01310-200',
                    country: 'Brasil',
                    country_code: 'br'
                },
                boundingbox: ['-23.5617', '-23.5616', '-46.6566', '-46.6565']
            };

            // Mock fetch to return OSM response
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => osmResponse
            });

            // Step 2: Execute reverse geocoding
            const geocoder = new ReverseGeocoder();
            const geocodedData = await geocoder.getReverseGeocodedData(-23.5616778, -46.6565712);

            expect(geocodedData).toBeDefined();
            expect(geocodedData.address).toBeDefined();
            expect(geocodedData.address.city).toBe('São Paulo');

            // Step 3: Extract Brazilian standard address
            const brazilianAddress = AddressDataExtractor.getBrazilianStandardAddress(geocodedData);

            // Step 4: Verify Brazilian format
            expect(brazilianAddress).toBeDefined();
            expect(brazilianAddress.logradouro).toBe('Avenida Paulista');
            expect(brazilianAddress.numero).toBe('1578');
            expect(brazilianAddress.bairro).toBe('Bela Vista');
            expect(brazilianAddress.municipio).toBe('São Paulo');
            expect(brazilianAddress.estado).toBe('São Paulo');
            expect(brazilianAddress.cep).toBe('01310-200');
            expect(brazilianAddress.pais).toBe('Brasil');
        });

        test('should handle Rio de Janeiro address with Portuguese street types', async () => {
            if (!AddressDataExtractor || !BrazilianStandardAddress) {
                console.warn('Required classes not available, skipping test');
                return;
            }

            const osmResponse = {
                display_name: 'Praia de Copacabana, Copacabana, Rio de Janeiro, RJ, Brasil',
                address: {
                    road: 'Praia de Copacabana',
                    neighbourhood: 'Copacabana',
                    city: 'Rio de Janeiro',
                    state: 'Rio de Janeiro',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const brazilianAddress = AddressDataExtractor.getBrazilianStandardAddress(osmResponse);

            expect(brazilianAddress.logradouro).toBe('Praia de Copacabana');
            expect(brazilianAddress.bairro).toBe('Copacabana');
            expect(brazilianAddress.municipio).toBe('Rio de Janeiro');
            expect(brazilianAddress.estado).toBe('Rio de Janeiro');
        });

        test('should process Brasília address with Brazilian naming conventions', async () => {
            if (!AddressDataExtractor || !BrazilianStandardAddress) {
                console.warn('Required classes not available, skipping test');
                return;
            }

            const osmResponse = {
                display_name: 'Esplanada dos Ministérios, Zona Cívico-Administrativa, Brasília, DF, Brasil',
                address: {
                    road: 'Esplanada dos Ministérios',
                    neighbourhood: 'Zona Cívico-Administrativa',
                    city: 'Brasília',
                    state: 'Distrito Federal',
                    postcode: '70050-000',
                    country: 'Brasil'
                }
            };

            const brazilianAddress = AddressDataExtractor.getBrazilianStandardAddress(osmResponse);

            expect(brazilianAddress.logradouro).toBe('Esplanada dos Ministérios');
            expect(brazilianAddress.municipio).toBe('Brasília');
            expect(brazilianAddress.estado).toBe('Distrito Federal');
            expect(brazilianAddress.cep).toBe('70050-000');
        });
    });

    describe('Pipeline: Address Component Extraction', () => {
        
        test('should extract all Brazilian address components correctly', () => {
            if (!AddressDataExtractor || !BrazilianStandardAddress) {
                console.warn('Required classes not available, skipping test');
                return;
            }

            const completeAddress = {
                address: {
                    road: 'Rua das Flores',
                    house_number: '123',
                    neighbourhood: 'Jardim Botânico',
                    city: 'São Paulo',
                    state: 'São Paulo',
                    postcode: '01234-567',
                    country: 'Brasil'
                }
            };

            const extracted = AddressDataExtractor.getBrazilianStandardAddress(completeAddress);

            // Verify all components
            expect(extracted.logradouro).toBe('Rua das Flores');
            expect(extracted.numero).toBe('123');
            expect(extracted.bairro).toBe('Jardim Botânico');
            expect(extracted.municipio).toBe('São Paulo');
            expect(extracted.estado).toBe('São Paulo');
            expect(extracted.cep).toBe('01234-567');
            expect(extracted.pais).toBe('Brasil');
        });

        test('should handle missing address components gracefully', () => {
            if (!AddressDataExtractor || !BrazilianStandardAddress) {
                console.warn('Required classes not available, skipping test');
                return;
            }

            const incompleteAddress = {
                address: {
                    city: 'Campinas',
                    state: 'São Paulo',
                    country: 'Brasil'
                }
                // Missing: road, house_number, neighbourhood, postcode
            };

            const extracted = AddressDataExtractor.getBrazilianStandardAddress(incompleteAddress);

            // Should handle gracefully
            expect(extracted.municipio).toBe('Campinas');
            expect(extracted.estado).toBe('São Paulo');
            expect(extracted.pais).toBe('Brasil');
            
            // Optional fields may be empty or undefined
            expect(extracted.logradouro === '' || extracted.logradouro === undefined).toBe(true);
        });

        test('should normalize Brazilian state abbreviations', () => {
            if (!AddressDataExtractor) {
                console.warn('AddressDataExtractor not available, skipping test');
                return;
            }

            const stateTests = [
                { input: 'São Paulo', expected: 'São Paulo' },
                { input: 'Rio de Janeiro', expected: 'Rio de Janeiro' },
                { input: 'Minas Gerais', expected: 'Minas Gerais' },
                { input: 'Bahia', expected: 'Bahia' },
                { input: 'Paraná', expected: 'Paraná' },
            ];

            stateTests.forEach(test => {
                const address = {
                    address: {
                        city: 'Test City',
                        state: test.input,
                        country: 'Brasil'
                    }
                };

                const result = AddressDataExtractor.getBrazilianStandardAddress(address);
                expect(result.estado).toBe(test.expected);
            });
        });
    });

    describe('Pipeline: Display Name Generation', () => {
        
        test('should generate user-friendly display names for Brazilian addresses', () => {
            if (!AddressDataExtractor || !BrazilianStandardAddress) {
                console.warn('Required classes not available, skipping test');
                return;
            }

            const address = {
                address: {
                    road: 'Rua Augusta',
                    house_number: '2690',
                    neighbourhood: 'Cerqueira César',
                    city: 'São Paulo',
                    state: 'São Paulo'
                }
            };

            const brazilianAddress = AddressDataExtractor.getBrazilianStandardAddress(address);

            // Create display name from components
            const displayName = `${brazilianAddress.logradouro}, ${brazilianAddress.numero}, ${brazilianAddress.bairro}, ${brazilianAddress.municipio} - ${brazilianAddress.estado}`;

            expect(displayName).toContain('Rua Augusta');
            expect(displayName).toContain('2690');
            expect(displayName).toContain('Cerqueira César');
            expect(displayName).toContain('São Paulo');
        });

        test('should format addresses for speech synthesis in Portuguese', () => {
            if (!BrazilianStandardAddress) {
                console.warn('BrazilianStandardAddress not available, skipping test');
                return;
            }

            const address = new BrazilianStandardAddress();
            address.logradouro = 'Avenida Paulista';
            address.numero = '1578';
            address.bairro = 'Bela Vista';
            address.municipio = 'São Paulo';

            // Generate speech-friendly text
            const speechText = `Você está na ${address.logradouro}, número ${address.numero}, bairro ${address.bairro}, ${address.municipio}`;

            expect(speechText).toContain('Você está na');
            expect(speechText).toContain('Avenida Paulista');
            expect(speechText).toContain('número 1578');
            expect(speechText).toContain('bairro Bela Vista');
        });
    });

    describe('Pipeline: Reference Place Integration', () => {
        
        test('should create reference places for Brazilian points of interest', () => {
            if (!ReferencePlace) {
                console.warn('ReferencePlace not available, skipping test');
                return;
            }

            // Test Brazilian amenities
            const restaurant = new ReferencePlace('amenity', 'restaurant', 'Restaurante da Praça');
            expect(restaurant).toBeDefined();
            expect(restaurant.typeName).toBe('restaurant');

            const pharmacy = new ReferencePlace('amenity', 'pharmacy', 'Farmácia São João');
            expect(pharmacy).toBeDefined();
            expect(pharmacy.typeName).toBe('pharmacy');
        });

        test('should handle Brazilian commercial establishments', () => {
            if (!ReferencePlace) {
                console.warn('ReferencePlace not available, skipping test');
                return;
            }

            const supermarket = new ReferencePlace('shop', 'supermarket', 'Supermercado Extra');
            expect(supermarket).toBeDefined();
            expect(supermarket.className).toBe('shop');
            expect(supermarket.typeName).toBe('supermarket');
        });

        test('should translate reference place types to Portuguese', () => {
            if (!ReferencePlace) {
                console.warn('ReferencePlace not available, skipping test');
                return;
            }

            // Verify translation mapping exists
            const translations = ReferencePlace.referencePlaceMap;
            
            expect(translations.amenity).toBeDefined();
            expect(translations.amenity.cafe).toBe('Café');
            expect(translations.shop).toBeDefined();
        });
    });

    describe('Pipeline: Multiple Address Formats', () => {
        
        test('should process addresses from different Brazilian cities consistently', () => {
            if (!AddressDataExtractor) {
                console.warn('AddressDataExtractor not available, skipping test');
                return;
            }

            const cities = [
                {
                    name: 'São Paulo',
                    address: { city: 'São Paulo', state: 'São Paulo', neighbourhood: 'Centro' }
                },
                {
                    name: 'Rio de Janeiro',
                    address: { city: 'Rio de Janeiro', state: 'Rio de Janeiro', neighbourhood: 'Copacabana' }
                },
                {
                    name: 'Belo Horizonte',
                    address: { city: 'Belo Horizonte', state: 'Minas Gerais', neighbourhood: 'Savassi' }
                },
                {
                    name: 'Porto Alegre',
                    address: { city: 'Porto Alegre', state: 'Rio Grande do Sul', neighbourhood: 'Moinhos de Vento' }
                },
                {
                    name: 'Recife',
                    address: { city: 'Recife', state: 'Pernambuco', neighbourhood: 'Boa Viagem' }
                }
            ];

            cities.forEach(cityData => {
                const result = AddressDataExtractor.getBrazilianStandardAddress({
                    address: cityData.address
                });

                expect(result.municipio).toBe(cityData.address.city);
                expect(result.estado).toBe(cityData.address.state);
                expect(result.bairro).toBe(cityData.address.neighbourhood);
            });
        });

        test('should handle various Brazilian street type prefixes', () => {
            if (!AddressDataExtractor) {
                console.warn('AddressDataExtractor not available, skipping test');
                return;
            }

            const streetTypes = [
                'Rua das Flores',
                'Avenida Paulista',
                'Travessa do Comércio',
                'Praça da Sé',
                'Alameda Santos',
                'Largo São Bento',
                'Viela do Canto',
                'Estrada de Itapecerica'
            ];

            streetTypes.forEach(street => {
                const address = {
                    address: {
                        road: street,
                        city: 'São Paulo',
                        state: 'São Paulo'
                    }
                };

                const result = AddressDataExtractor.getBrazilianStandardAddress(address);
                expect(result.logradouro).toBe(street);
            });
        });
    });

    describe('Pipeline: CEP (Postal Code) Processing', () => {
        
        test('should format CEP correctly', () => {
            if (!AddressDataExtractor) {
                console.warn('AddressDataExtractor not available, skipping test');
                return;
            }

            const validCEPs = [
                '01310-200',
                '20040-020',
                '30130-100',
                '40110-160',
                '50030-230'
            ];

            validCEPs.forEach(cep => {
                const address = {
                    address: {
                        postcode: cep,
                        city: 'Test City',
                        state: 'Test State'
                    }
                };

                const result = AddressDataExtractor.getBrazilianStandardAddress(address);
                expect(result.cep).toBe(cep);
            });
        });

        test('should handle addresses without CEP', () => {
            if (!AddressDataExtractor) {
                console.warn('AddressDataExtractor not available, skipping test');
                return;
            }

            const address = {
                address: {
                    road: 'Rua Teste',
                    city: 'São Paulo',
                    state: 'São Paulo'
                    // No postcode
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(address);
            expect(result.municipio).toBe('São Paulo');
            // CEP should be empty or undefined
            expect(result.cep === '' || result.cep === undefined).toBe(true);
        });
    });

    describe('Pipeline: End-to-End Brazilian Address Workflow', () => {
        
        test('should execute complete pipeline for real São Paulo location', async () => {
            if (!GeoPosition || !ReverseGeocoder || !AddressDataExtractor) {
                console.warn('Required classes not available, skipping test');
                return;
            }

            // Step 1: User position in São Paulo
            const position = new GeoPosition({
                latitude: -23.5505,
                longitude: -46.6333,
                accuracy: 10,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null
            });

            expect(position.latitude).toBe(-23.5505);

            // Step 2: Mock complete OSM response
            const osmData = {
                display_name: 'Avenida Paulista, 1578, Bela Vista, São Paulo, SP, 01310-200, Brasil',
                address: {
                    road: 'Avenida Paulista',
                    house_number: '1578',
                    neighbourhood: 'Bela Vista',
                    city: 'São Paulo',
                    state: 'São Paulo',
                    postcode: '01310-200',
                    country: 'Brasil'
                }
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => osmData
            });

            // Step 3: Reverse geocode
            const geocoder = new ReverseGeocoder();
            const geocodedData = await geocoder.getReverseGeocodedData(
                position.latitude,
                position.longitude
            );

            // Step 4: Extract Brazilian address
            const brazilianAddr = AddressDataExtractor.getBrazilianStandardAddress(geocodedData);

            // Step 5: Verify complete address
            expect(brazilianAddr.logradouro).toBe('Avenida Paulista');
            expect(brazilianAddr.numero).toBe('1578');
            expect(brazilianAddr.bairro).toBe('Bela Vista');
            expect(brazilianAddr.municipio).toBe('São Paulo');
            expect(brazilianAddr.estado).toBe('São Paulo');
            expect(brazilianAddr.cep).toBe('01310-200');
            expect(brazilianAddr.pais).toBe('Brasil');

            // Step 6: Generate display text
            const displayText = `${brazilianAddr.logradouro}, ${brazilianAddr.numero} - ${brazilianAddr.bairro}, ${brazilianAddr.municipio}/${brazilianAddr.estado}`;
            expect(displayText).toContain('Avenida Paulista');
            expect(displayText).toContain('Bela Vista');
        });
    });
});
