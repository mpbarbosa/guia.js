/**
 * @fileoverview Unit tests for address-parser module
 * Tests pure functions for Brazilian geopolitical division handling
 */

import {
  extractDistrito,
  extractBairro,
  determineLocationType,
  formatLocationValue
} from '../../src/address-parser.js';

describe('Address Parser - Pure Functions', () => {
  describe('extractDistrito()', () => {
    test('should extract village from address', () => {
      const address = { village: 'Milho Verde' };
      expect(extractDistrito(address)).toBe('Milho Verde');
    });

    test('should extract district as fallback', () => {
      const address = { district: 'Santo Antônio do Salto' };
      expect(extractDistrito(address)).toBe('Santo Antônio do Salto');
    });

    test('should extract hamlet as fallback', () => {
      const address = { hamlet: 'Povoado Rural' };
      expect(extractDistrito(address)).toBe('Povoado Rural');
    });

    test('should extract town as fallback', () => {
      const address = { town: 'Vila de São Jorge' };
      expect(extractDistrito(address)).toBe('Vila de São Jorge');
    });

    test('should extract from nested address object', () => {
      const address = {
        address: { village: 'Milho Verde' }
      };
      expect(extractDistrito(address)).toBe('Milho Verde');
    });

    test('should prefer top-level over nested', () => {
      const address = {
        village: 'Top Level',
        address: { village: 'Nested Level' }
      };
      expect(extractDistrito(address)).toBe('Top Level');
    });

    test('should return null for null address', () => {
      expect(extractDistrito(null)).toBeNull();
    });

    test('should return null for undefined address', () => {
      expect(extractDistrito(undefined)).toBeNull();
    });

    test('should return null when no distrito fields exist', () => {
      const address = { city: 'Serro', suburb: 'Centro' };
      expect(extractDistrito(address)).toBeNull();
    });

    test('should follow priority chain: village > district > hamlet > town', () => {
      const address = {
        village: 'Village',
        district: 'District',
        hamlet: 'Hamlet',
        town: 'Town'
      };
      expect(extractDistrito(address)).toBe('Village');
    });

    test('is referentially transparent', () => {
      const address = { village: 'Milho Verde' };
      expect(extractDistrito(address)).toBe(extractDistrito(address));
    });
  });

  describe('extractBairro()', () => {
    test('should extract suburb from address', () => {
      const address = { suburb: 'Centro' };
      expect(extractBairro(address)).toBe('Centro');
    });

    test('should extract neighbourhood as fallback', () => {
      const address = { neighbourhood: 'Jardim Paulista' };
      expect(extractBairro(address)).toBe('Jardim Paulista');
    });

    test('should extract quarter as fallback', () => {
      const address = { quarter: 'Bairro Alto' };
      expect(extractBairro(address)).toBe('Bairro Alto');
    });

    test('should extract residential as fallback', () => {
      const address = { residential: 'Condomínio Flores' };
      expect(extractBairro(address)).toBe('Condomínio Flores');
    });

    test('should extract from nested address object', () => {
      const address = {
        address: { suburb: 'Copacabana' }
      };
      expect(extractBairro(address)).toBe('Copacabana');
    });

    test('should prefer top-level over nested', () => {
      const address = {
        suburb: 'Top Level',
        address: { suburb: 'Nested Level' }
      };
      expect(extractBairro(address)).toBe('Top Level');
    });

    test('should return null for null address', () => {
      expect(extractBairro(null)).toBeNull();
    });

    test('should return null for undefined address', () => {
      expect(extractBairro(undefined)).toBeNull();
    });

    test('should return null when no bairro fields exist', () => {
      const address = { city: 'São Paulo', village: 'Milho Verde' };
      expect(extractBairro(address)).toBeNull();
    });

    test('should follow priority chain: suburb > neighbourhood > quarter > residential', () => {
      const address = {
        suburb: 'Suburb',
        neighbourhood: 'Neighbourhood',
        quarter: 'Quarter',
        residential: 'Residential'
      };
      expect(extractBairro(address)).toBe('Suburb');
    });

    test('is referentially transparent', () => {
      const address = { suburb: 'Centro' };
      expect(extractBairro(address)).toBe(extractBairro(address));
    });
  });

  describe('determineLocationType()', () => {
    test('should return distrito when only village exists', () => {
      const address = { village: 'Milho Verde' };
      const result = determineLocationType(address);
      expect(result).toEqual({ type: 'distrito', value: 'Milho Verde' });
    });

    test('should return bairro when only suburb exists', () => {
      const address = { suburb: 'Centro' };
      const result = determineLocationType(address);
      expect(result).toEqual({ type: 'bairro', value: 'Centro' });
    });

    test('should return bairro when both village and suburb exist', () => {
      const address = {
        village: 'Milho Verde',
        suburb: 'Centro'
      };
      const result = determineLocationType(address);
      expect(result).toEqual({ type: 'bairro', value: 'Centro' });
    });

    test('should return distrito with district field', () => {
      const address = { district: 'Santo Antônio' };
      const result = determineLocationType(address);
      expect(result).toEqual({ type: 'distrito', value: 'Santo Antônio' });
    });

    test('should return bairro with null value when neither exists', () => {
      const address = { city: 'Serro' };
      const result = determineLocationType(address);
      expect(result).toEqual({ type: 'bairro', value: null });
    });

    test('should handle null address', () => {
      const result = determineLocationType(null);
      expect(result).toEqual({ type: 'bairro', value: null });
    });

    test('should handle undefined address', () => {
      const result = determineLocationType(undefined);
      expect(result).toEqual({ type: 'bairro', value: null });
    });

    test('should handle empty address object', () => {
      const result = determineLocationType({});
      expect(result).toEqual({ type: 'bairro', value: null });
    });

    test('should handle nested address structure', () => {
      const address = {
        address: {
          village: 'Milho Verde'
        }
      };
      const result = determineLocationType(address);
      expect(result).toEqual({ type: 'distrito', value: 'Milho Verde' });
    });

    test('is referentially transparent', () => {
      const address = { village: 'Milho Verde' };
      const result1 = determineLocationType(address);
      const result2 = determineLocationType(address);
      expect(result1).toEqual(result2);
    });

    test('does not modify input', () => {
      const address = { village: 'Milho Verde', suburb: 'Centro' };
      const addressCopy = { ...address };
      determineLocationType(address);
      expect(address).toEqual(addressCopy);
    });
  });

  describe('formatLocationValue()', () => {
    test('should return value as-is when valid', () => {
      expect(formatLocationValue('Milho Verde')).toBe('Milho Verde');
    });

    test('should return "Não disponível" for null', () => {
      expect(formatLocationValue(null)).toBe('Não disponível');
    });

    test('should return "Não disponível" for undefined', () => {
      expect(formatLocationValue(undefined)).toBe('Não disponível');
    });

    test('should return "Não disponível" for empty string', () => {
      expect(formatLocationValue('')).toBe('Não disponível');
    });

    test('should return "Não disponível" for whitespace-only string', () => {
      expect(formatLocationValue('   ')).toBe('Não disponível');
    });

    test('should preserve leading/trailing spaces in valid values', () => {
      expect(formatLocationValue('Centro  ')).toBe('Centro  ');
    });

    test('should handle special characters', () => {
      expect(formatLocationValue('São José dos Campos')).toBe('São José dos Campos');
    });

    test('is referentially transparent', () => {
      expect(formatLocationValue('Test')).toBe(formatLocationValue('Test'));
    });
  });

  describe('Property-Based Tests', () => {
    test('extractDistrito: always returns string or null', () => {
      const testCases = [
        { village: 'Test' },
        { district: 'Test' },
        {},
        null,
        undefined
      ];

      testCases.forEach(address => {
        const result = extractDistrito(address);
        expect(result === null || typeof result === 'string').toBe(true);
      });
    });

    test('extractBairro: always returns string or null', () => {
      const testCases = [
        { suburb: 'Test' },
        { neighbourhood: 'Test' },
        {},
        null,
        undefined
      ];

      testCases.forEach(address => {
        const result = extractBairro(address);
        expect(result === null || typeof result === 'string').toBe(true);
      });
    });

    test('determineLocationType: always returns object with type and value', () => {
      const testCases = [
        { village: 'Test' },
        { suburb: 'Test' },
        { village: 'V', suburb: 'S' },
        {},
        null
      ];

      testCases.forEach(address => {
        const result = determineLocationType(address);
        expect(result).toHaveProperty('type');
        expect(result).toHaveProperty('value');
        expect(['distrito', 'bairro']).toContain(result.type);
      });
    });

    test('formatLocationValue: always returns string', () => {
      const testCases = ['Test', null, undefined, '', '   '];

      testCases.forEach(value => {
        const result = formatLocationValue(value);
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('Integration Tests - Real-world scenarios', () => {
    test('Milho Verde district scenario (district without bairro)', () => {
      const address = {
        village: 'Milho Verde',
        city: 'Serro',
        state: 'Minas Gerais'
      };

      const result = determineLocationType(address);
      expect(result.type).toBe('distrito');
      expect(result.value).toBe('Milho Verde');
      expect(formatLocationValue(result.value)).toBe('Milho Verde');
    });

    test('City with neighborhood scenario (common case)', () => {
      const address = {
        suburb: 'Copacabana',
        city: 'Rio de Janeiro',
        state: 'Rio de Janeiro'
      };

      const result = determineLocationType(address);
      expect(result.type).toBe('bairro');
      expect(result.value).toBe('Copacabana');
      expect(formatLocationValue(result.value)).toBe('Copacabana');
    });

    test('City without subdivisions (small town)', () => {
      const address = {
        city: 'Pequena Cidade',
        state: 'Goiás'
      };

      const result = determineLocationType(address);
      expect(result.type).toBe('bairro');
      expect(result.value).toBeNull();
      expect(formatLocationValue(result.value)).toBe('Não disponível');
    });

    test('District with neighborhood (district subdivided)', () => {
      const address = {
        village: 'Grande Distrito',
        suburb: 'Centro do Distrito',
        city: 'Município',
        state: 'São Paulo'
      };

      const result = determineLocationType(address);
      // Should prefer bairro when both exist (more specific)
      expect(result.type).toBe('bairro');
      expect(result.value).toBe('Centro do Distrito');
    });
  });
});