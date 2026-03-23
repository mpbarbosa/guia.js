import {
  extractDistrito,
  extractBairro,
  determineLocationType,
  formatLocationValue,
} from '../src/address-parser';

describe('address-parser', () => {
  describe('extractDistrito', () => {
    it('returns district from "village"', () => {
      expect(extractDistrito({ village: 'Centro' })).toBe('Centro');
    });

    it('returns district from "district"', () => {
      expect(extractDistrito({ district: 'Distrito Sul' })).toBe('Distrito Sul');
    });

    it('returns district from "hamlet"', () => {
      expect(extractDistrito({ hamlet: 'Vila Nova' })).toBe('Vila Nova');
    });

    it('returns district from "town"', () => {
      expect(extractDistrito({ town: 'Cidade Velha' })).toBe('Cidade Velha');
    });

    it('returns district from nested "address" object', () => {
      expect(
        extractDistrito({ address: { district: 'Distrito Norte' } })
      ).toBe('Distrito Norte');
    });

    it('returns null if no district fields present', () => {
      expect(extractDistrito({ city: 'São Paulo' })).toBeNull();
    });

    it('returns null for null or undefined input', () => {
      expect(extractDistrito(null)).toBeNull();
      expect(extractDistrito(undefined)).toBeNull();
    });

    it('returns first available field in priority order', () => {
      expect(
        extractDistrito({
          hamlet: 'Hamlet',
          district: 'District',
          village: 'Village',
          town: 'Town',
        })
      ).toBe('Village');
    });

    it('returns first available nested field in priority order', () => {
      expect(
        extractDistrito({
          address: {
            hamlet: 'Hamlet',
            district: 'District',
            village: 'Village',
            town: 'Town',
          },
        })
      ).toBe('Village');
    });

    it('returns null if all possible fields are empty strings', () => {
      expect(
        extractDistrito({
          village: '',
          district: '',
          hamlet: '',
          town: '',
        })
      ).toBeNull();
    });

    it('returns null if nested address fields are empty strings', () => {
      expect(
        extractDistrito({
          address: {
            village: '',
            district: '',
            hamlet: '',
            town: '',
          },
        })
      ).toBeNull();
    });
  });

  describe('extractBairro', () => {
    it('returns bairro from "suburb"', () => {
      expect(extractBairro({ suburb: 'Jardim Paulista' })).toBe('Jardim Paulista');
    });

    it('returns bairro from "neighbourhood"', () => {
      expect(extractBairro({ neighbourhood: 'Bairro Alto' })).toBe('Bairro Alto');
    });

    it('returns bairro from "quarter"', () => {
      expect(extractBairro({ quarter: 'Centro Histórico' })).toBe('Centro Histórico');
    });

    it('returns bairro from "residential"', () => {
      expect(extractBairro({ residential: 'Residencial Sul' })).toBe('Residencial Sul');
    });

    it('returns bairro from nested "address" object', () => {
      expect(
        extractBairro({ address: { suburb: 'Jardim América' } })
      ).toBe('Jardim América');
    });

    it('returns null if no bairro fields present', () => {
      expect(extractBairro({ city: 'Rio de Janeiro' })).toBeNull();
    });

    it('returns null for null or undefined input', () => {
      expect(extractBairro(null)).toBeNull();
      expect(extractBairro(undefined)).toBeNull();
    });

    it('returns first available field in priority order', () => {
      expect(
        extractBairro({
          residential: 'Residencial',
          quarter: 'Quarter',
          neighbourhood: 'Neighbourhood',
          suburb: 'Suburb',
        })
      ).toBe('Suburb');
    });

    it('returns first available nested field in priority order', () => {
      expect(
        extractBairro({
          address: {
            residential: 'Residencial',
            quarter: 'Quarter',
            neighbourhood: 'Neighbourhood',
            suburb: 'Suburb',
          },
        })
      ).toBe('Suburb');
    });

    it('returns null if all possible fields are empty strings', () => {
      expect(
        extractBairro({
          suburb: '',
          neighbourhood: '',
          quarter: '',
          residential: '',
        })
      ).toBeNull();
    });

    it('returns null if nested address fields are empty strings', () => {
      expect(
        extractBairro({
          address: {
            suburb: '',
            neighbourhood: '',
            quarter: '',
            residential: '',
          },
        })
      ).toBeNull();
    });
  });

  describe('determineLocationType', () => {
    it('returns distrito if distrito exists and bairro does not', () => {
      expect(
        determineLocationType({ district: 'Distrito Leste' })
      ).toEqual({ type: 'distrito', value: 'Distrito Leste' });
    });

    it('returns bairro if bairro exists', () => {
      expect(
        determineLocationType({ suburb: 'Bairro Central' })
      ).toEqual({ type: 'bairro', value: 'Bairro Central' });
    });

    it('returns bairro if both distrito and bairro exist', () => {
      expect(
        determineLocationType({ district: 'Distrito Oeste', suburb: 'Bairro Sul' })
      ).toEqual({ type: 'bairro', value: 'Bairro Sul' });
    });

    it('returns bairro with null value if neither exists', () => {
      expect(
        determineLocationType({ city: 'Curitiba' })
      ).toEqual({ type: 'bairro', value: null });
    });

    it('returns distrito if only nested distrito exists', () => {
      expect(
        determineLocationType({ address: { district: 'Distrito Norte' } })
      ).toEqual({ type: 'distrito', value: 'Distrito Norte' });
    });

    it('returns bairro if only nested bairro exists', () => {
      expect(
        determineLocationType({ address: { suburb: 'Bairro Leste' } })
      ).toEqual({ type: 'bairro', value: 'Bairro Leste' });
    });

    it('returns bairro with null value for null or undefined input', () => {
      expect(determineLocationType(null)).toEqual({ type: 'bairro', value: null });
      expect(determineLocationType(undefined)).toEqual({ type: 'bairro', value: null });
    });
  });

  describe('formatLocationValue', () => {
    it('returns value as-is for non-empty string', () => {
      expect(formatLocationValue('Centro')).toBe('Centro');
    });

    it('returns "Não disponível" for null', () => {
      expect(formatLocationValue(null)).toBe('Não disponível');
    });

    it('returns "Não disponível" for undefined', () => {
      expect(formatLocationValue(undefined)).toBe('Não disponível');
    });

    it('returns "Não disponível" for empty string', () => {
      expect(formatLocationValue('')).toBe('Não disponível');
    });

    it('returns "Não disponível" for whitespace string', () => {
      expect(formatLocationValue('   ')).toBe('Não disponível');
    });
  });
});
