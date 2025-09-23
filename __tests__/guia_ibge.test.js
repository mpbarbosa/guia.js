/**
 * @jest-environment node
 */

// Import the guia_ibge.js functions
const { renderUrlUFNome } = require('../guia_ibge.js');

describe('guia_ibge.js', () => {
  
  describe('renderUrlUFNome', () => {
    test('should create correct IBGE URL for São Paulo', () => {
      const result = renderUrlUFNome('São Paulo', '35');
      const expected = '<a href="https://servicodados.ibge.gov.br/api/v1/localidades/estados/35">São Paulo</a>';
      expect(result).toBe(expected);
    });

    test('should create correct IBGE URL for Rio de Janeiro', () => {
      const result = renderUrlUFNome('Rio de Janeiro', '33');
      const expected = '<a href="https://servicodados.ibge.gov.br/api/v1/localidades/estados/33">Rio de Janeiro</a>';
      expect(result).toBe(expected);
    });

    test('should handle empty strings', () => {
      const result = renderUrlUFNome('', '');
      const expected = '<a href="https://servicodados.ibge.gov.br/api/v1/localidades/estados/"></a>';
      expect(result).toBe(expected);
    });

    test('should handle special characters in state name', () => {
      const result = renderUrlUFNome('Minas Gerais & Co.', '31');
      const expected = '<a href="https://servicodados.ibge.gov.br/api/v1/localidades/estados/31">Minas Gerais & Co.</a>';
      expect(result).toBe(expected);
    });

    test('should handle numeric state IDs', () => {
      const result = renderUrlUFNome('Bahia', 29);
      const expected = '<a href="https://servicodados.ibge.gov.br/api/v1/localidades/estados/29">Bahia</a>';
      expect(result).toBe(expected);
    });
  });

});