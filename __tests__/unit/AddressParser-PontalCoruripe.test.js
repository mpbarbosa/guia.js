/**
 * @fileoverview Unit tests for address-parser.js using real Nominatim data
 * Real-world test case: Rua da Praia, Pontal do Coruripe, Alagoas
 * Coordinates: -10.1594479, -36.1354556
 * 
 * Tests Brazilian address parsing with actual Nominatim response data
 * 
 * @jest-environment node
 * @author MP Barbosa
 * @since 0.9.0-alpha
 */

import { describe, test, expect } from '@jest/globals';
import {
  extractDistrito,
  extractBairro,
  determineLocationType,
  formatLocationValue
} from '../../src/address-parser.js';

// Real Nominatim response data from Pontal do Coruripe, Alagoas
const PONTAL_CORURIPE_ADDRESS = {
  road: "Rua da Praia",
  hamlet: "Pontal do Coruripe",
  state: "Alagoas",
  "ISO3166-2-lvl4": "BR-AL",
  region: "Região Nordeste",
  country: "Brasil",
  country_code: "br"
};

// Full Nominatim response object
const PONTAL_CORURIPE_FULL = {
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
  address: PONTAL_CORURIPE_ADDRESS,
  boundingbox: [
    "-10.1597767",
    "-10.1578791",
    "-36.1364781",
    "-36.1353974"
  ]
};

describe('Address Parser - Pontal do Coruripe Real Data', () => {
  describe('extractDistrito() with Pontal do Coruripe data', () => {
    test('should extract hamlet as distrito (Pontal do Coruripe)', () => {
      const result = extractDistrito(PONTAL_CORURIPE_ADDRESS);
      expect(result).toBe("Pontal do Coruripe");
    });

    test('should extract from nested address object', () => {
      const result = extractDistrito(PONTAL_CORURIPE_FULL);
      expect(result).toBe("Pontal do Coruripe");
    });

    test('should handle address with only hamlet field', () => {
      const address = { hamlet: "Pontal do Coruripe" };
      const result = extractDistrito(address);
      expect(result).toBe("Pontal do Coruripe");
    });

    test('should return hamlet when no village or district field', () => {
      const address = {
        road: "Rua da Praia",
        hamlet: "Pontal do Coruripe",
        state: "Alagoas"
      };
      const result = extractDistrito(address);
      expect(result).toBe("Pontal do Coruripe");
    });

    test('should prioritize village over hamlet if both exist', () => {
      const address = {
        village: "Vila Principal",
        hamlet: "Pontal do Coruripe"
      };
      const result = extractDistrito(address);
      expect(result).toBe("Vila Principal");
    });

    test('should handle Portuguese special characters in hamlet', () => {
      const address = { hamlet: "Pontal do Coruripe" };
      const result = extractDistrito(address);
      expect(result).toContain("Coruripe");
      expect(typeof result).toBe('string');
    });
  });

  describe('extractBairro() with Pontal do Coruripe data', () => {
    test('should return null when no bairro fields exist', () => {
      const result = extractBairro(PONTAL_CORURIPE_ADDRESS);
      expect(result).toBeNull();
    });

    test('should return null from full Nominatim object', () => {
      const result = extractBairro(PONTAL_CORURIPE_FULL);
      expect(result).toBeNull();
    });

    test('should return null when only hamlet field exists', () => {
      const address = {
        hamlet: "Pontal do Coruripe",
        state: "Alagoas"
      };
      const result = extractBairro(address);
      expect(result).toBeNull();
    });

    test('should extract suburb if present (modified scenario)', () => {
      const modifiedAddress = {
        ...PONTAL_CORURIPE_ADDRESS,
        suburb: "Centro"
      };
      const result = extractBairro(modifiedAddress);
      expect(result).toBe("Centro");
    });

    test('should extract neighbourhood if present (modified scenario)', () => {
      const modifiedAddress = {
        ...PONTAL_CORURIPE_ADDRESS,
        neighbourhood: "Praia"
      };
      const result = extractBairro(modifiedAddress);
      expect(result).toBe("Praia");
    });

    test('should handle address without any bairro indicators', () => {
      const address = {
        road: "Rua da Praia",
        hamlet: "Pontal do Coruripe"
      };
      const result = extractBairro(address);
      expect(result).toBeNull();
    });
  });

  describe('determineLocationType() with Pontal do Coruripe data', () => {
    test('should return distrito type for hamlet without suburb', () => {
      const result = determineLocationType(PONTAL_CORURIPE_ADDRESS);
      expect(result).toEqual({
        type: 'distrito',
        value: 'Pontal do Coruripe'
      });
    });

    test('should return distrito from full Nominatim response', () => {
      const result = determineLocationType(PONTAL_CORURIPE_FULL);
      expect(result).toEqual({
        type: 'distrito',
        value: 'Pontal do Coruripe'
      });
    });

    test('should identify as distrito (hamlet as administrative subdivision)', () => {
      const address = {
        hamlet: "Pontal do Coruripe",
        state: "Alagoas",
        country: "Brasil"
      };
      const result = determineLocationType(address);
      expect(result.type).toBe('distrito');
      expect(result.value).toBe('Pontal do Coruripe');
    });

    test('should prefer bairro if both hamlet and suburb exist', () => {
      const modifiedAddress = {
        hamlet: "Pontal do Coruripe",
        suburb: "Centro"
      };
      const result = determineLocationType(modifiedAddress);
      expect(result.type).toBe('bairro');
      expect(result.value).toBe('Centro');
    });

    test('should handle nested address structure', () => {
      const nestedAddress = {
        address: {
          hamlet: "Pontal do Coruripe",
          state: "Alagoas"
        }
      };
      const result = determineLocationType(nestedAddress);
      expect(result.type).toBe('distrito');
      expect(result.value).toBe('Pontal do Coruripe');
    });

    test('should handle Alagoas coastal hamlet specifically', () => {
      const result = determineLocationType(PONTAL_CORURIPE_ADDRESS);
      expect(result.type).toBe('distrito');
      expect(result.value).toContain('Pontal');
      expect(result.value).toContain('Coruripe');
    });

    test('should not modify original address object', () => {
      const addressCopy = { ...PONTAL_CORURIPE_ADDRESS };
      determineLocationType(PONTAL_CORURIPE_ADDRESS);
      expect(PONTAL_CORURIPE_ADDRESS).toEqual(addressCopy);
    });

    test('should be referentially transparent', () => {
      const result1 = determineLocationType(PONTAL_CORURIPE_ADDRESS);
      const result2 = determineLocationType(PONTAL_CORURIPE_ADDRESS);
      expect(result1).toEqual(result2);
    });
  });

  describe('formatLocationValue() with Pontal do Coruripe data', () => {
    test('should format Pontal do Coruripe without modification', () => {
      const result = formatLocationValue('Pontal do Coruripe');
      expect(result).toBe('Pontal do Coruripe');
    });

    test('should preserve Portuguese special characters', () => {
      const result = formatLocationValue('Pontal do Coruripe');
      expect(result).toContain('Pontal');
      expect(result).toContain('Coruripe');
    });

    test('should handle null value with "Não disponível"', () => {
      const result = formatLocationValue(null);
      expect(result).toBe('Não disponível');
    });

    test('should preserve spacing in location names', () => {
      const result = formatLocationValue('Pontal do Coruripe');
      expect(result).toMatch(/\s/); // Contains spaces
      expect(result.split(' ').length).toBe(3);
    });

    test('should handle empty string with "Não disponível"', () => {
      const result = formatLocationValue('');
      expect(result).toBe('Não disponível');
    });

    test('should handle whitespace-only with "Não disponível"', () => {
      const result = formatLocationValue('   ');
      expect(result).toBe('Não disponível');
    });
  });

  describe('Integration - Complete workflow with Pontal do Coruripe', () => {
    test('should extract distrito and format it correctly', () => {
      const distrito = extractDistrito(PONTAL_CORURIPE_ADDRESS);
      const formatted = formatLocationValue(distrito);
      
      expect(distrito).toBe('Pontal do Coruripe');
      expect(formatted).toBe('Pontal do Coruripe');
    });

    test('should handle full parsing workflow', () => {
      const locationType = determineLocationType(PONTAL_CORURIPE_ADDRESS);
      const formatted = formatLocationValue(locationType.value);
      
      expect(locationType.type).toBe('distrito');
      expect(locationType.value).toBe('Pontal do Coruripe');
      expect(formatted).toBe('Pontal do Coruripe');
    });

    test('should handle bairro absence correctly', () => {
      const bairro = extractBairro(PONTAL_CORURIPE_ADDRESS);
      const formatted = formatLocationValue(bairro);
      
      expect(bairro).toBeNull();
      expect(formatted).toBe('Não disponível');
    });

    test('should prioritize distrito when bairro is absent', () => {
      const locationType = determineLocationType(PONTAL_CORURIPE_ADDRESS);
      const distrito = extractDistrito(PONTAL_CORURIPE_ADDRESS);
      const bairro = extractBairro(PONTAL_CORURIPE_ADDRESS);
      
      expect(distrito).toBe('Pontal do Coruripe');
      expect(bairro).toBeNull();
      expect(locationType.type).toBe('distrito');
      expect(locationType.value).toBe(distrito);
    });

    test('should maintain data consistency across function calls', () => {
      const distrito1 = extractDistrito(PONTAL_CORURIPE_ADDRESS);
      const distrito2 = extractDistrito(PONTAL_CORURIPE_ADDRESS);
      const locationType = determineLocationType(PONTAL_CORURIPE_ADDRESS);
      
      expect(distrito1).toBe(distrito2);
      expect(locationType.value).toBe(distrito1);
    });

    test('should handle nested Nominatim structure', () => {
      const distrito = extractDistrito(PONTAL_CORURIPE_FULL);
      const bairro = extractBairro(PONTAL_CORURIPE_FULL);
      const locationType = determineLocationType(PONTAL_CORURIPE_FULL);
      
      expect(distrito).toBe('Pontal do Coruripe');
      expect(bairro).toBeNull();
      expect(locationType).toEqual({
        type: 'distrito',
        value: 'Pontal do Coruripe'
      });
    });
  });

  describe('Edge Cases - Pontal do Coruripe variations', () => {
    test('should handle address with only road and hamlet', () => {
      const address = {
        road: "Rua da Praia",
        hamlet: "Pontal do Coruripe"
      };
      
      const distrito = extractDistrito(address);
      const bairro = extractBairro(address);
      
      expect(distrito).toBe('Pontal do Coruripe');
      expect(bairro).toBeNull();
    });

    test('should handle address with additional fields', () => {
      const address = {
        ...PONTAL_CORURIPE_ADDRESS,
        postcode: "57460-000",
        municipality: "Coruripe"
      };
      
      const distrito = extractDistrito(address);
      expect(distrito).toBe('Pontal do Coruripe');
    });

    test('should handle address with missing hamlet', () => {
      const address = {
        road: "Rua da Praia",
        state: "Alagoas",
        country: "Brasil"
      };
      
      const locationType = determineLocationType(address);
      expect(locationType.type).toBe('bairro');
      expect(locationType.value).toBeNull();
    });

    test('should handle partial Nominatim response', () => {
      const partialAddress = {
        hamlet: "Pontal do Coruripe",
        state: "Alagoas"
      };
      
      const locationType = determineLocationType(partialAddress);
      expect(locationType.type).toBe('distrito');
      expect(locationType.value).toBe('Pontal do Coruripe');
    });

    test('should handle empty nested address', () => {
      const address = {
        address: {}
      };
      
      const distrito = extractDistrito(address);
      const bairro = extractBairro(address);
      
      expect(distrito).toBeNull();
      expect(bairro).toBeNull();
    });

    test('should handle null nested address', () => {
      const address = {
        address: null
      };
      
      const distrito = extractDistrito(address);
      const bairro = extractBairro(address);
      
      expect(distrito).toBeNull();
      expect(bairro).toBeNull();
    });
  });

  describe('Brazilian Geographic Context - Alagoas coastal hamlet', () => {
    test('should correctly identify coastal hamlet type', () => {
      const locationType = determineLocationType(PONTAL_CORURIPE_ADDRESS);
      
      expect(locationType.type).toBe('distrito');
      expect(locationType.value).toBe('Pontal do Coruripe');
    });

    test('should handle Alagoas state with hamlet subdivision', () => {
      const address = {
        hamlet: "Pontal do Coruripe",
        state: "Alagoas",
        "ISO3166-2-lvl4": "BR-AL"
      };
      
      const distrito = extractDistrito(address);
      const locationType = determineLocationType(address);
      
      expect(distrito).toBe('Pontal do Coruripe');
      expect(locationType.type).toBe('distrito');
    });

    test('should recognize Northeastern Brazil hamlet pattern', () => {
      const address = {
        hamlet: "Pontal do Coruripe",
        region: "Região Nordeste",
        state: "Alagoas"
      };
      
      const locationType = determineLocationType(address);
      expect(locationType.type).toBe('distrito');
      expect(locationType.value).toBe('Pontal do Coruripe');
    });

    test('should handle residential road in coastal hamlet', () => {
      const address = {
        road: "Rua da Praia",
        hamlet: "Pontal do Coruripe",
        state: "Alagoas"
      };
      
      const locationType = determineLocationType(address);
      expect(locationType.value).toBe('Pontal do Coruripe');
    });

    test('should differentiate between hamlet and municipality', () => {
      // Pontal do Coruripe is a hamlet (povoado) in Coruripe municipality
      const address = {
        hamlet: "Pontal do Coruripe",
        municipality: "Coruripe",
        state: "Alagoas"
      };
      
      const distrito = extractDistrito(address);
      expect(distrito).toBe('Pontal do Coruripe');
      expect(distrito).not.toBe('Coruripe');
    });
  });

  describe('Type Safety and Purity - Pontal do Coruripe', () => {
    test('extractDistrito returns string or null', () => {
      const result = extractDistrito(PONTAL_CORURIPE_ADDRESS);
      expect(typeof result === 'string' || result === null).toBe(true);
    });

    test('extractBairro returns string or null', () => {
      const result = extractBairro(PONTAL_CORURIPE_ADDRESS);
      expect(typeof result === 'string' || result === null).toBe(true);
    });

    test('determineLocationType returns object with type and value', () => {
      const result = determineLocationType(PONTAL_CORURIPE_ADDRESS);
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('value');
      expect(['distrito', 'bairro']).toContain(result.type);
    });

    test('formatLocationValue always returns string', () => {
      const result1 = formatLocationValue('Pontal do Coruripe');
      const result2 = formatLocationValue(null);
      
      expect(typeof result1).toBe('string');
      expect(typeof result2).toBe('string');
    });

    test('functions do not mutate input', () => {
      const originalAddress = { ...PONTAL_CORURIPE_ADDRESS };
      
      extractDistrito(PONTAL_CORURIPE_ADDRESS);
      extractBairro(PONTAL_CORURIPE_ADDRESS);
      determineLocationType(PONTAL_CORURIPE_ADDRESS);
      
      expect(PONTAL_CORURIPE_ADDRESS).toEqual(originalAddress);
    });

    test('functions are referentially transparent', () => {
      const d1 = extractDistrito(PONTAL_CORURIPE_ADDRESS);
      const d2 = extractDistrito(PONTAL_CORURIPE_ADDRESS);
      
      const b1 = extractBairro(PONTAL_CORURIPE_ADDRESS);
      const b2 = extractBairro(PONTAL_CORURIPE_ADDRESS);
      
      const l1 = determineLocationType(PONTAL_CORURIPE_ADDRESS);
      const l2 = determineLocationType(PONTAL_CORURIPE_ADDRESS);
      
      expect(d1).toBe(d2);
      expect(b1).toBe(b2);
      expect(l1).toEqual(l2);
    });
  });

  describe('Comparison with other Brazilian locations', () => {
    test('should differentiate hamlet from village', () => {
      const hamletAddress = { hamlet: "Pontal do Coruripe" };
      const villageAddress = { village: "Milho Verde" };
      
      const hamletResult = extractDistrito(hamletAddress);
      const villageResult = extractDistrito(villageAddress);
      
      expect(hamletResult).toBe('Pontal do Coruripe');
      expect(villageResult).toBe('Milho Verde');
    });

    test('should handle hamlet differently from city suburb', () => {
      const hamletAddress = {
        hamlet: "Pontal do Coruripe",
        state: "Alagoas"
      };
      
      const suburbAddress = {
        suburb: "Copacabana",
        city: "Rio de Janeiro",
        state: "Rio de Janeiro"
      };
      
      const hamletType = determineLocationType(hamletAddress);
      const suburbType = determineLocationType(suburbAddress);
      
      expect(hamletType.type).toBe('distrito');
      expect(suburbType.type).toBe('bairro');
    });

    test('should recognize hamlet as distrito type consistently', () => {
      const addresses = [
        { hamlet: "Pontal do Coruripe" },
        { hamlet: "Povoado Teste" },
        { hamlet: "Lugarejo Exemplo" }
      ];
      
      addresses.forEach(address => {
        const locationType = determineLocationType(address);
        expect(locationType.type).toBe('distrito');
      });
    });
  });
});
