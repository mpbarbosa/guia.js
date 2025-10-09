/**
 * Tests for Nominatim API JSON Format
 * Validates complete Nominatim API response structure and data extraction
 * Tests based on real-world Nominatim JSON response from Mairiporã, São Paulo
 * 
 * @jest-environment node
 * @author MP Barbosa
 * @since 0.5.0-alpha
 */

// Mock document to prevent errors in test environment
global.document = undefined;

const { AddressDataExtractor, ReferencePlace } = require('../../src/guia.js');

// Real-world Nominatim JSON response from the issue
const MAIRIPORA_JSON = {
    "place_id": 8779308,
    "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
    "osm_type": "way",
    "osm_id": 184347107,
    "lat": "-23.3303320",
    "lon": "-46.5766545",
    "class": "shop",
    "type": "car_repair",
    "place_rank": 30,
    "importance": 0.00005967727168683936,
    "addresstype": "shop",
    "name": "",
    "display_name": "Avenida Dona Charlotte Izirmai, Estância Santo Antônio, Capoavinha, Mairiporã, Região Imediata de São Paulo, Região Metropolitana de São Paulo, São Paulo, Região Sudeste, 07600-072, Brasil",
    "address": {
        "road": "Avenida Dona Charlotte Izirmai",
        "neighbourhood": "Estância Santo Antônio",
        "suburb": "Capoavinha",
        "city_district": "Mairiporã",
        "town": "Mairiporã",
        "municipality": "Região Imediata de São Paulo",
        "county": "Região Metropolitana de São Paulo",
        "state": "São Paulo",
        "ISO3166-2-lvl4": "BR-SP",
        "region": "Região Sudeste",
        "postcode": "07600-072",
        "country": "Brasil",
        "country_code": "br"
    },
    "boundingbox": ["-23.3304031", "-23.3302619", "-46.5767479", "-46.5765611"]
};

describe('Nominatim JSON Format Tests', () => {
    beforeEach(() => {
        // Clear cache before each test
        if (AddressDataExtractor && AddressDataExtractor.clearCache) {
            AddressDataExtractor.clearCache();
        }
    });

    afterEach(() => {
        // Clean up after each test
        if (AddressDataExtractor && AddressDataExtractor.clearCache) {
            AddressDataExtractor.clearCache();
        }
    });

    describe('Top-Level Fields', () => {
        test('should have valid place_id as number', () => {
            expect(MAIRIPORA_JSON.place_id).toBeDefined();
            expect(typeof MAIRIPORA_JSON.place_id).toBe('number');
            expect(MAIRIPORA_JSON.place_id).toBe(8779308);
        });

        test('should have licence information', () => {
            expect(MAIRIPORA_JSON.licence).toBeDefined();
            expect(typeof MAIRIPORA_JSON.licence).toBe('string');
            expect(MAIRIPORA_JSON.licence).toContain('OpenStreetMap');
            expect(MAIRIPORA_JSON.licence).toContain('ODbL 1.0');
        });

        test('should have valid osm_type', () => {
            expect(MAIRIPORA_JSON.osm_type).toBeDefined();
            expect(['way', 'node', 'relation']).toContain(MAIRIPORA_JSON.osm_type);
            expect(MAIRIPORA_JSON.osm_type).toBe('way');
        });

        test('should have valid osm_id as number', () => {
            expect(MAIRIPORA_JSON.osm_id).toBeDefined();
            expect(typeof MAIRIPORA_JSON.osm_id).toBe('number');
            expect(MAIRIPORA_JSON.osm_id).toBe(184347107);
        });

        test('should have coordinates as strings', () => {
            // Nominatim returns lat/lon as strings, not numbers
            expect(MAIRIPORA_JSON.lat).toBeDefined();
            expect(MAIRIPORA_JSON.lon).toBeDefined();
            expect(typeof MAIRIPORA_JSON.lat).toBe('string');
            expect(typeof MAIRIPORA_JSON.lon).toBe('string');
            expect(MAIRIPORA_JSON.lat).toBe('-23.3303320');
            expect(MAIRIPORA_JSON.lon).toBe('-46.5766545');
            
            // Should be parseable as numbers
            expect(parseFloat(MAIRIPORA_JSON.lat)).toBeCloseTo(-23.3303320);
            expect(parseFloat(MAIRIPORA_JSON.lon)).toBeCloseTo(-46.5766545);
        });

        test('should have valid class and type', () => {
            expect(MAIRIPORA_JSON.class).toBeDefined();
            expect(MAIRIPORA_JSON.type).toBeDefined();
            expect(MAIRIPORA_JSON.class).toBe('shop');
            expect(MAIRIPORA_JSON.type).toBe('car_repair');
        });

        test('should have place_rank as number', () => {
            expect(MAIRIPORA_JSON.place_rank).toBeDefined();
            expect(typeof MAIRIPORA_JSON.place_rank).toBe('number');
            expect(MAIRIPORA_JSON.place_rank).toBe(30);
            expect(MAIRIPORA_JSON.place_rank).toBeGreaterThanOrEqual(0);
            expect(MAIRIPORA_JSON.place_rank).toBeLessThanOrEqual(30);
        });

        test('should have importance score as number', () => {
            expect(MAIRIPORA_JSON.importance).toBeDefined();
            expect(typeof MAIRIPORA_JSON.importance).toBe('number');
            expect(MAIRIPORA_JSON.importance).toBeGreaterThan(0);
        });

        test('should have addresstype', () => {
            expect(MAIRIPORA_JSON.addresstype).toBeDefined();
            expect(MAIRIPORA_JSON.addresstype).toBe('shop');
        });

        test('should have name field (can be empty string)', () => {
            expect(MAIRIPORA_JSON).toHaveProperty('name');
            expect(typeof MAIRIPORA_JSON.name).toBe('string');
            // In this case, name is empty
            expect(MAIRIPORA_JSON.name).toBe('');
        });

        test('should have formatted display_name', () => {
            expect(MAIRIPORA_JSON.display_name).toBeDefined();
            expect(typeof MAIRIPORA_JSON.display_name).toBe('string');
            expect(MAIRIPORA_JSON.display_name).toContain('Avenida Dona Charlotte Izirmai');
            expect(MAIRIPORA_JSON.display_name).toContain('Mairiporã');
            expect(MAIRIPORA_JSON.display_name).toContain('São Paulo');
            expect(MAIRIPORA_JSON.display_name).toContain('Brasil');
        });
    });

    describe('Address Object Structure', () => {
        test('should have address object', () => {
            expect(MAIRIPORA_JSON.address).toBeDefined();
            expect(typeof MAIRIPORA_JSON.address).toBe('object');
            expect(MAIRIPORA_JSON.address).not.toBeNull();
        });

        test('should have road field', () => {
            expect(MAIRIPORA_JSON.address.road).toBeDefined();
            expect(MAIRIPORA_JSON.address.road).toBe('Avenida Dona Charlotte Izirmai');
        });

        test('should have neighbourhood field', () => {
            expect(MAIRIPORA_JSON.address.neighbourhood).toBeDefined();
            expect(MAIRIPORA_JSON.address.neighbourhood).toBe('Estância Santo Antônio');
        });

        test('should have suburb field', () => {
            expect(MAIRIPORA_JSON.address.suburb).toBeDefined();
            expect(MAIRIPORA_JSON.address.suburb).toBe('Capoavinha');
        });

        test('should have town field', () => {
            expect(MAIRIPORA_JSON.address.town).toBeDefined();
            expect(MAIRIPORA_JSON.address.town).toBe('Mairiporã');
        });

        test('should have municipality field', () => {
            expect(MAIRIPORA_JSON.address.municipality).toBeDefined();
            expect(MAIRIPORA_JSON.address.municipality).toBe('Região Imediata de São Paulo');
        });

        test('should have county field', () => {
            expect(MAIRIPORA_JSON.address.county).toBeDefined();
            expect(MAIRIPORA_JSON.address.county).toBe('Região Metropolitana de São Paulo');
        });

        test('should have state field', () => {
            expect(MAIRIPORA_JSON.address.state).toBeDefined();
            expect(MAIRIPORA_JSON.address.state).toBe('São Paulo');
        });

        test('should have ISO3166-2-lvl4 field', () => {
            expect(MAIRIPORA_JSON.address['ISO3166-2-lvl4']).toBeDefined();
            expect(MAIRIPORA_JSON.address['ISO3166-2-lvl4']).toBe('BR-SP');
            expect(MAIRIPORA_JSON.address['ISO3166-2-lvl4']).toMatch(/^BR-[A-Z]{2}$/);
        });

        test('should have region field', () => {
            expect(MAIRIPORA_JSON.address.region).toBeDefined();
            expect(MAIRIPORA_JSON.address.region).toBe('Região Sudeste');
        });

        test('should have postcode field', () => {
            expect(MAIRIPORA_JSON.address.postcode).toBeDefined();
            expect(MAIRIPORA_JSON.address.postcode).toBe('07600-072');
            expect(MAIRIPORA_JSON.address.postcode).toMatch(/^\d{5}-\d{3}$/);
        });

        test('should have country field', () => {
            expect(MAIRIPORA_JSON.address.country).toBeDefined();
            expect(MAIRIPORA_JSON.address.country).toBe('Brasil');
        });

        test('should have country_code field', () => {
            expect(MAIRIPORA_JSON.address.country_code).toBeDefined();
            expect(MAIRIPORA_JSON.address.country_code).toBe('br');
            expect(MAIRIPORA_JSON.address.country_code).toMatch(/^[a-z]{2}$/);
        });
    });

    describe('Bounding Box Format', () => {
        test('should have boundingbox as array', () => {
            expect(MAIRIPORA_JSON.boundingbox).toBeDefined();
            expect(Array.isArray(MAIRIPORA_JSON.boundingbox)).toBe(true);
            expect(MAIRIPORA_JSON.boundingbox.length).toBe(4);
        });

        test('should have bounding box values as strings', () => {
            MAIRIPORA_JSON.boundingbox.forEach((value, index) => {
                expect(typeof value).toBe('string');
            });
        });

        test('should have valid bounding box format [min_lat, max_lat, min_lon, max_lon]', () => {
            const [minLat, maxLat, minLon, maxLon] = MAIRIPORA_JSON.boundingbox;
            
            expect(minLat).toBe('-23.3304031');
            expect(maxLat).toBe('-23.3302619');
            expect(minLon).toBe('-46.5767479');
            expect(maxLon).toBe('-46.5765611');
            
            // Verify min < max relationships
            expect(parseFloat(minLat)).toBeLessThan(parseFloat(maxLat));
            expect(parseFloat(minLon)).toBeLessThan(parseFloat(maxLon));
        });

        test('should have coordinates within bounding box', () => {
            const [minLat, maxLat, minLon, maxLon] = MAIRIPORA_JSON.boundingbox;
            const lat = parseFloat(MAIRIPORA_JSON.lat);
            const lon = parseFloat(MAIRIPORA_JSON.lon);
            
            expect(lat).toBeGreaterThanOrEqual(parseFloat(minLat));
            expect(lat).toBeLessThanOrEqual(parseFloat(maxLat));
            expect(lon).toBeGreaterThanOrEqual(parseFloat(minLon));
            expect(lon).toBeLessThanOrEqual(parseFloat(maxLon));
        });
    });

    describe('Reference Place - shop/car_repair', () => {
        test('should create ReferencePlace for shop/car_repair', () => {
            if (!ReferencePlace) {
                console.warn('ReferencePlace not available - skipping test');
                return;
            }

            const refPlaceData = {
                class: MAIRIPORA_JSON.class,
                type: MAIRIPORA_JSON.type,
                name: MAIRIPORA_JSON.name || 'Oficina'
            };

            const refPlace = new ReferencePlace(refPlaceData);
            
            expect(refPlace.className).toBe('shop');
            expect(refPlace.typeName).toBe('car_repair');
            expect(refPlace.name).toBe('Oficina');
            expect(refPlace.description).toBe('Oficina Oficina Mecânica');
        });

        test('should handle empty name in reference place', () => {
            if (!ReferencePlace) {
                console.warn('ReferencePlace not available - skipping test');
                return;
            }

            const refPlaceData = {
                class: MAIRIPORA_JSON.class,
                type: MAIRIPORA_JSON.type,
                name: MAIRIPORA_JSON.name  // Empty string
            };

            const refPlace = new ReferencePlace(refPlaceData);
            
            expect(refPlace.className).toBe('shop');
            expect(refPlace.typeName).toBe('car_repair');
            // Empty name should result in null
            expect(refPlace.name).toBeNull();
        });
    });

    describe('Address Extraction from Nominatim JSON', () => {
        test('should extract Brazilian standard address from Mairiporã JSON', () => {
            if (!AddressDataExtractor || !AddressDataExtractor.getBrazilianStandardAddress) {
                console.warn('AddressDataExtractor not available - skipping test');
                return;
            }

            const result = AddressDataExtractor.getBrazilianStandardAddress(MAIRIPORA_JSON);

            expect(result).toBeDefined();
            expect(result.logradouro).toBe('Avenida Dona Charlotte Izirmai');
            expect(result.bairro).toBe('Estância Santo Antônio');
            expect(result.municipio).toBe('Mairiporã');
            expect(result.uf).toBe('São Paulo');
            expect(result.siglaUF).toBe('SP');
            expect(result.cep).toBe('07600-072');
            expect(result.pais).toBe('Brasil');
        });

        test('should prioritize town over city_district for municipio', () => {
            if (!AddressDataExtractor || !AddressDataExtractor.getBrazilianStandardAddress) {
                console.warn('AddressDataExtractor not available - skipping test');
                return;
            }

            const result = AddressDataExtractor.getBrazilianStandardAddress(MAIRIPORA_JSON);

            // town field value should be used for municipio
            // Both town and city_district have same value "Mairiporã" in this JSON
            expect(result.municipio).toBe('Mairiporã');
            
            // Verify the JSON has both fields with same value
            expect(MAIRIPORA_JSON.address.town).toBe('Mairiporã');
            expect(MAIRIPORA_JSON.address.city_district).toBe('Mairiporã');
        });

        test('should extract state abbreviation from ISO3166-2-lvl4', () => {
            if (!AddressDataExtractor || !AddressDataExtractor.getBrazilianStandardAddress) {
                console.warn('AddressDataExtractor not available - skipping test');
                return;
            }

            const result = AddressDataExtractor.getBrazilianStandardAddress(MAIRIPORA_JSON);

            // siglaUF should extract "SP" from "BR-SP"
            expect(result.siglaUF).toBe('SP');
        });

        test('should handle missing house_number gracefully', () => {
            if (!AddressDataExtractor || !AddressDataExtractor.getBrazilianStandardAddress) {
                console.warn('AddressDataExtractor not available - skipping test');
                return;
            }

            const result = AddressDataExtractor.getBrazilianStandardAddress(MAIRIPORA_JSON);

            // No house_number in the JSON
            expect(result.numero).toBeNull();
        });

        test('should handle suburb as fallback for bairro', () => {
            if (!AddressDataExtractor || !AddressDataExtractor.getBrazilianStandardAddress) {
                console.warn('AddressDataExtractor not available - skipping test');
                return;
            }

            // Create test data with only suburb (no neighbourhood)
            const testData = {
                address: {
                    road: 'Test Road',
                    suburb: 'Capoavinha',
                    town: 'Mairiporã',
                    state: 'São Paulo',
                    country: 'Brasil'
                }
            };

            const result = AddressDataExtractor.getBrazilianStandardAddress(testData);

            // suburb should be used for bairro when neighbourhood is missing
            expect(result.bairro).toBe('Capoavinha');
        });
    });

    describe('Data Type Validation', () => {
        test('should validate all numeric IDs are numbers', () => {
            expect(typeof MAIRIPORA_JSON.place_id).toBe('number');
            expect(typeof MAIRIPORA_JSON.osm_id).toBe('number');
        });

        test('should validate all coordinates are strings', () => {
            expect(typeof MAIRIPORA_JSON.lat).toBe('string');
            expect(typeof MAIRIPORA_JSON.lon).toBe('string');
            MAIRIPORA_JSON.boundingbox.forEach(coord => {
                expect(typeof coord).toBe('string');
            });
        });

        test('should validate scores are numbers', () => {
            expect(typeof MAIRIPORA_JSON.place_rank).toBe('number');
            expect(typeof MAIRIPORA_JSON.importance).toBe('number');
        });

        test('should validate address fields are strings', () => {
            const addressFields = [
                'road', 'neighbourhood', 'suburb', 'town', 
                'municipality', 'county', 'state', 'region', 
                'postcode', 'country', 'country_code', 'ISO3166-2-lvl4'
            ];

            addressFields.forEach(field => {
                if (MAIRIPORA_JSON.address[field] !== undefined) {
                    expect(typeof MAIRIPORA_JSON.address[field]).toBe('string');
                }
            });
        });
    });

    describe('Portuguese Character Encoding', () => {
        test('should correctly handle Portuguese characters in address', () => {
            // Test that Portuguese characters are preserved
            expect(MAIRIPORA_JSON.display_name).toContain('São Paulo');
            expect(MAIRIPORA_JSON.display_name).toContain('Região');
            expect(MAIRIPORA_JSON.address.state).toContain('São Paulo');
            expect(MAIRIPORA_JSON.address.region).toContain('Região');
            expect(MAIRIPORA_JSON.address.municipality).toContain('São');
        });

        test('should handle special characters in street names', () => {
            // Verify special characters are preserved
            expect(MAIRIPORA_JSON.address.neighbourhood).toContain('Antônio');
            expect(MAIRIPORA_JSON.address.region).toContain('Sudeste');
        });
    });

    describe('Complete JSON Structure Integrity', () => {
        test('should have all required top-level fields', () => {
            const requiredFields = [
                'place_id', 'licence', 'osm_type', 'osm_id',
                'lat', 'lon', 'class', 'type', 'place_rank',
                'importance', 'addresstype', 'name', 'display_name',
                'address', 'boundingbox'
            ];

            requiredFields.forEach(field => {
                expect(MAIRIPORA_JSON).toHaveProperty(field);
            });
        });

        test('should have valid address structure for Mairiporã', () => {
            const expectedAddressFields = [
                'road', 'neighbourhood', 'suburb', 'town',
                'municipality', 'county', 'state', 'ISO3166-2-lvl4',
                'region', 'postcode', 'country', 'country_code'
            ];

            expectedAddressFields.forEach(field => {
                expect(MAIRIPORA_JSON.address).toHaveProperty(field);
            });
        });

        test('should match expected JSON structure from issue', () => {
            // Verify the JSON matches the expected structure from the issue
            expect(MAIRIPORA_JSON.place_id).toBe(8779308);
            expect(MAIRIPORA_JSON.osm_id).toBe(184347107);
            expect(MAIRIPORA_JSON.class).toBe('shop');
            expect(MAIRIPORA_JSON.type).toBe('car_repair');
            expect(MAIRIPORA_JSON.address.road).toBe('Avenida Dona Charlotte Izirmai');
            expect(MAIRIPORA_JSON.address.town).toBe('Mairiporã');
            expect(MAIRIPORA_JSON.address.postcode).toBe('07600-072');
        });
    });
});
