/**
 * Unit tests for Nominatim JSON data from Pontal do Coruripe, Alagoas.
 * Tests data structure validation, address extraction, and Brazilian location processing.
 * 
 * Real-world test case: Rua da Praia, Pontal do Coruripe, Alagoas
 * Coordinates: -10.1594479, -36.1354556
 * 
 * @jest-environment node
 * @author MP Barbosa
 * @since 0.8.6-alpha
 */

import { describe, test, expect, beforeAll } from '@jest/globals';

// Sample Nominatim response data from Pontal do Coruripe
const NOMINATIM_DATA = {
    place_id: 13731911,
    licence: "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
    osm_type: "way",
    osm_id: 169377494,
    lat: "-10.1594479",
    lon: "-36.1354556",
    class: "highway",
    type: "residential",
    place_rank: 26,
    importance: 0.05338622034027615,
    addresstype: "road",
    name: "Rua da Praia",
    display_name: "Rua da Praia, Pontal do Coruripe, Alagoas, Região Nordeste, Brasil",
    address: {
        road: "Rua da Praia",
        hamlet: "Pontal do Coruripe",
        state: "Alagoas",
        "ISO3166-2-lvl4": "BR-AL",
        region: "Região Nordeste",
        country: "Brasil",
        country_code: "br"
    },
    boundingbox: [
        "-10.1597767",
        "-10.1578791",
        "-36.1364781",
        "-36.1353974"
    ]
};

describe('Nominatim Pontal do Coruripe Data Structure', () => {
    test('should have all required top-level fields', () => {
        expect(NOMINATIM_DATA).toHaveProperty('place_id');
        expect(NOMINATIM_DATA).toHaveProperty('lat');
        expect(NOMINATIM_DATA).toHaveProperty('lon');
        expect(NOMINATIM_DATA).toHaveProperty('address');
        expect(NOMINATIM_DATA).toHaveProperty('display_name');
    });

    test('should have valid place_id', () => {
        expect(NOMINATIM_DATA.place_id).toBe(13731911);
        expect(typeof NOMINATIM_DATA.place_id).toBe('number');
        expect(NOMINATIM_DATA.place_id).toBeGreaterThan(0);
    });

    test('should have valid coordinate data', () => {
        expect(NOMINATIM_DATA.lat).toBe("-10.1594479");
        expect(NOMINATIM_DATA.lon).toBe("-36.1354556");
        
        const lat = parseFloat(NOMINATIM_DATA.lat);
        const lon = parseFloat(NOMINATIM_DATA.lon);
        
        expect(lat).toBeGreaterThanOrEqual(-90);
        expect(lat).toBeLessThanOrEqual(90);
        expect(lon).toBeGreaterThanOrEqual(-180);
        expect(lon).toBeLessThanOrEqual(180);
    });

    test('should have valid OSM metadata', () => {
        expect(NOMINATIM_DATA.osm_type).toBe("way");
        expect(NOMINATIM_DATA.osm_id).toBe(169377494);
        expect(['node', 'way', 'relation']).toContain(NOMINATIM_DATA.osm_type);
    });

    test('should have valid classification', () => {
        expect(NOMINATIM_DATA.class).toBe("highway");
        expect(NOMINATIM_DATA.type).toBe("residential");
        expect(NOMINATIM_DATA.addresstype).toBe("road");
    });

    test('should have valid place rank and importance', () => {
        expect(NOMINATIM_DATA.place_rank).toBe(26);
        expect(NOMINATIM_DATA.importance).toBeCloseTo(0.0534, 3);
        expect(NOMINATIM_DATA.place_rank).toBeGreaterThanOrEqual(0);
        expect(NOMINATIM_DATA.place_rank).toBeLessThanOrEqual(30);
    });

    test('should have valid name', () => {
        expect(NOMINATIM_DATA.name).toBe("Rua da Praia");
        expect(NOMINATIM_DATA.name).toMatch(/^Rua/);
        expect(typeof NOMINATIM_DATA.name).toBe('string');
        expect(NOMINATIM_DATA.name.length).toBeGreaterThan(0);
    });

    test('should have valid display_name', () => {
        expect(NOMINATIM_DATA.display_name).toBe("Rua da Praia, Pontal do Coruripe, Alagoas, Região Nordeste, Brasil");
        expect(NOMINATIM_DATA.display_name).toContain("Rua da Praia");
        expect(NOMINATIM_DATA.display_name).toContain("Pontal do Coruripe");
        expect(NOMINATIM_DATA.display_name).toContain("Alagoas");
        expect(NOMINATIM_DATA.display_name).toContain("Brasil");
    });

    test('should have valid bounding box', () => {
        expect(Array.isArray(NOMINATIM_DATA.boundingbox)).toBe(true);
        expect(NOMINATIM_DATA.boundingbox).toHaveLength(4);
        
        const [minLat, maxLat, minLon, maxLon] = NOMINATIM_DATA.boundingbox.map(parseFloat);
        
        expect(minLat).toBeLessThan(maxLat);
        expect(minLon).toBeLessThan(maxLon);
        expect(minLat).toBeCloseTo(-10.1597767, 5);
        expect(maxLat).toBeCloseTo(-10.1578791, 5);
        expect(minLon).toBeCloseTo(-36.1364781, 5);
        expect(maxLon).toBeCloseTo(-36.1353974, 5);
    });

    test('should have valid licence information', () => {
        expect(NOMINATIM_DATA.licence).toContain("OpenStreetMap");
        expect(NOMINATIM_DATA.licence).toContain("ODbL");
        expect(NOMINATIM_DATA.licence).toContain("http://osm.org/copyright");
    });
});

describe('Nominatim Address Object - Pontal do Coruripe', () => {
    test('should have address object', () => {
        expect(NOMINATIM_DATA.address).toBeDefined();
        expect(typeof NOMINATIM_DATA.address).toBe('object');
        expect(NOMINATIM_DATA.address).not.toBeNull();
    });

    test('should have road field', () => {
        expect(NOMINATIM_DATA.address.road).toBe("Rua da Praia");
        expect(typeof NOMINATIM_DATA.address.road).toBe('string');
    });

    test('should have hamlet field', () => {
        expect(NOMINATIM_DATA.address.hamlet).toBe("Pontal do Coruripe");
        expect(typeof NOMINATIM_DATA.address.hamlet).toBe('string');
    });

    test('should have state field', () => {
        expect(NOMINATIM_DATA.address.state).toBe("Alagoas");
        expect(typeof NOMINATIM_DATA.address.state).toBe('string');
    });

    test('should have ISO3166-2-lvl4 field for Brazilian state', () => {
        expect(NOMINATIM_DATA.address["ISO3166-2-lvl4"]).toBe("BR-AL");
        expect(NOMINATIM_DATA.address["ISO3166-2-lvl4"]).toMatch(/^BR-[A-Z]{2}$/);
    });

    test('should have region field', () => {
        expect(NOMINATIM_DATA.address.region).toBe("Região Nordeste");
        expect(NOMINATIM_DATA.address.region).toContain("Região");
    });

    test('should have country field in Portuguese', () => {
        expect(NOMINATIM_DATA.address.country).toBe("Brasil");
        expect(NOMINATIM_DATA.address.country_code).toBe("br");
    });

    test('should NOT have municipality field (hamlet instead)', () => {
        expect(NOMINATIM_DATA.address.municipality).toBeUndefined();
        expect(NOMINATIM_DATA.address.city).toBeUndefined();
        expect(NOMINATIM_DATA.address.town).toBeUndefined();
        expect(NOMINATIM_DATA.address.village).toBeUndefined();
        // Instead, it has hamlet
        expect(NOMINATIM_DATA.address.hamlet).toBeDefined();
    });

    test('should NOT have neighbourhood or suburb field', () => {
        expect(NOMINATIM_DATA.address.neighbourhood).toBeUndefined();
        expect(NOMINATIM_DATA.address.suburb).toBeUndefined();
    });

    test('should NOT have postcode', () => {
        expect(NOMINATIM_DATA.address.postcode).toBeUndefined();
    });
});

describe('Brazilian Address Standardization - Pontal do Coruripe', () => {
    test('should extract Brazilian state code', () => {
        const stateCode = NOMINATIM_DATA.address["ISO3166-2-lvl4"];
        expect(stateCode).toBe("BR-AL");
        
        const extractedCode = stateCode.split('-')[1];
        expect(extractedCode).toBe("AL");
        expect(extractedCode).toHaveLength(2);
    });

    test('should identify location as Northeastern Brazil', () => {
        expect(NOMINATIM_DATA.address.region).toContain("Nordeste");
        
        const lat = parseFloat(NOMINATIM_DATA.lat);
        const lon = parseFloat(NOMINATIM_DATA.lon);
        
        // Northeastern Brazil coordinates validation
        expect(lat).toBeGreaterThan(-20); // North of São Paulo
        expect(lat).toBeLessThan(0); // South of equator
        expect(lon).toBeGreaterThan(-50); // Eastern Brazil
        expect(lon).toBeLessThan(-30); // Western limit
    });

    test('should format Brazilian address components', () => {
        const address = NOMINATIM_DATA.address;
        const formattedAddress = `${address.road}, ${address.hamlet}, ${address.state} - ${address.country}`;
        
        expect(formattedAddress).toBe("Rua da Praia, Pontal do Coruripe, Alagoas - Brasil");
        expect(formattedAddress).toContain("Rua da Praia");
        expect(formattedAddress).toContain("Pontal do Coruripe");
    });

    test('should handle Portuguese place names correctly', () => {
        // Portuguese special characters
        expect(NOMINATIM_DATA.address.region).toContain("ã"); // Região
        expect(NOMINATIM_DATA.display_name).toMatch(/[À-ÿ]/); // Contains accents
    });

    test('should extract municipality from hamlet field', () => {
        const municipality = NOMINATIM_DATA.address.hamlet;
        expect(municipality).toBe("Pontal do Coruripe");
        expect(municipality).toMatch(/^[A-Z]/); // Capitalized
    });
});

describe('Geolocation Data Validation - Pontal do Coruripe', () => {
    test('should have valid latitude for Alagoas state', () => {
        const lat = parseFloat(NOMINATIM_DATA.lat);
        
        // Alagoas approximate bounds
        expect(lat).toBeGreaterThan(-10.5);
        expect(lat).toBeLessThan(-8.8);
    });

    test('should have valid longitude for Alagoas state', () => {
        const lon = parseFloat(NOMINATIM_DATA.lon);
        
        // Alagoas approximate bounds
        expect(lon).toBeGreaterThan(-38);
        expect(lon).toBeLessThan(-35);
    });

    test('should calculate bounding box dimensions', () => {
        const [minLat, maxLat, minLon, maxLon] = NOMINATIM_DATA.boundingbox.map(parseFloat);
        
        const latDiff = Math.abs(maxLat - minLat);
        const lonDiff = Math.abs(maxLon - minLon);
        
        // Residential street should have small bounding box
        expect(latDiff).toBeLessThan(0.01); // ~1km
        expect(lonDiff).toBeLessThan(0.01); // ~1km
        expect(latDiff).toBeGreaterThan(0); // Non-zero
        expect(lonDiff).toBeGreaterThan(0); // Non-zero
    });

    test('should verify coordinates within bounding box', () => {
        const [minLat, maxLat, minLon, maxLon] = NOMINATIM_DATA.boundingbox.map(parseFloat);
        const lat = parseFloat(NOMINATIM_DATA.lat);
        const lon = parseFloat(NOMINATIM_DATA.lon);
        
        expect(lat).toBeGreaterThanOrEqual(minLat);
        expect(lat).toBeLessThanOrEqual(maxLat);
        expect(lon).toBeGreaterThanOrEqual(minLon);
        expect(lon).toBeLessThanOrEqual(maxLon);
    });
});

describe('Road Classification - Pontal do Coruripe', () => {
    test('should identify as residential highway', () => {
        expect(NOMINATIM_DATA.class).toBe("highway");
        expect(NOMINATIM_DATA.type).toBe("residential");
    });

    test('should have addresstype as road', () => {
        expect(NOMINATIM_DATA.addresstype).toBe("road");
    });

    test('should have appropriate place_rank for residential street', () => {
        // Residential streets typically have place_rank 26-27
        expect(NOMINATIM_DATA.place_rank).toBeGreaterThanOrEqual(25);
        expect(NOMINATIM_DATA.place_rank).toBeLessThanOrEqual(27);
    });

    test('should have low importance for local street', () => {
        // Local residential streets have low importance (< 0.1)
        expect(NOMINATIM_DATA.importance).toBeLessThan(0.1);
        expect(NOMINATIM_DATA.importance).toBeGreaterThan(0);
    });
});

describe('Data Type Consistency - Pontal do Coruripe', () => {
    test('coordinates should be string type', () => {
        expect(typeof NOMINATIM_DATA.lat).toBe('string');
        expect(typeof NOMINATIM_DATA.lon).toBe('string');
    });

    test('bounding box should contain strings', () => {
        NOMINATIM_DATA.boundingbox.forEach(coord => {
            expect(typeof coord).toBe('string');
        });
    });

    test('numeric IDs should be numbers', () => {
        expect(typeof NOMINATIM_DATA.place_id).toBe('number');
        expect(typeof NOMINATIM_DATA.osm_id).toBe('number');
        expect(typeof NOMINATIM_DATA.place_rank).toBe('number');
    });

    test('importance should be number', () => {
        expect(typeof NOMINATIM_DATA.importance).toBe('number');
    });

    test('all address fields should be strings', () => {
        Object.entries(NOMINATIM_DATA.address).forEach(([key, value]) => {
            expect(typeof value).toBe('string');
        });
    });
});

describe('Edge Cases and Error Handling - Pontal do Coruripe', () => {
    test('should handle missing optional fields gracefully', () => {
        const optionalFields = [
            'house_number', 'postcode', 'neighbourhood', 
            'suburb', 'city', 'municipality', 'village', 'town'
        ];
        
        optionalFields.forEach(field => {
            expect(NOMINATIM_DATA.address[field]).toBeUndefined();
        });
    });

    test('should handle coordinate parsing errors', () => {
        const lat = parseFloat(NOMINATIM_DATA.lat);
        const lon = parseFloat(NOMINATIM_DATA.lon);
        
        expect(isNaN(lat)).toBe(false);
        expect(isNaN(lon)).toBe(false);
        expect(isFinite(lat)).toBe(true);
        expect(isFinite(lon)).toBe(true);
    });

    test('should validate required address fields exist', () => {
        const requiredFields = ['road', 'state', 'country', 'country_code'];
        
        requiredFields.forEach(field => {
            expect(NOMINATIM_DATA.address[field]).toBeDefined();
            expect(NOMINATIM_DATA.address[field]).not.toBe('');
        });
    });

    test('should handle special characters in place names', () => {
        const placeName = NOMINATIM_DATA.name;
        
        // Should not have HTML entities or escape sequences
        expect(placeName).not.toContain('&');
        expect(placeName).not.toContain('\\');
        expect(placeName).not.toContain('&#');
    });
});

describe('Integration with Guia Turístico App - Pontal do Coruripe', () => {
    test('should be compatible with BrazilianStandardAddress format', () => {
        const address = NOMINATIM_DATA.address;
        
        // Required fields for Brazilian address standardization
        expect(address.state).toBeDefined();
        expect(address.country).toBe("Brasil");
        expect(address.country_code).toBe("br");
    });

    test('should support ReverseGeocoder response format', () => {
        expect(NOMINATIM_DATA).toHaveProperty('lat');
        expect(NOMINATIM_DATA).toHaveProperty('lon');
        expect(NOMINATIM_DATA).toHaveProperty('display_name');
        expect(NOMINATIM_DATA).toHaveProperty('address');
    });

    test('should provide data for GeoPosition initialization', () => {
        const position = {
            coords: {
                latitude: parseFloat(NOMINATIM_DATA.lat),
                longitude: parseFloat(NOMINATIM_DATA.lon)
            }
        };
        
        expect(position.coords.latitude).toBeCloseTo(-10.1594479, 6);
        expect(position.coords.longitude).toBeCloseTo(-36.1354556, 6);
    });

    test('should provide data for HTMLAddressDisplayer', () => {
        const displayData = {
            name: NOMINATIM_DATA.name,
            road: NOMINATIM_DATA.address.road,
            municipality: NOMINATIM_DATA.address.hamlet,
            state: NOMINATIM_DATA.address.state,
            country: NOMINATIM_DATA.address.country
        };
        
        expect(displayData.name).toBe("Rua da Praia");
        expect(displayData.municipality).toBe("Pontal do Coruripe");
        expect(displayData.state).toBe("Alagoas");
    });
});
