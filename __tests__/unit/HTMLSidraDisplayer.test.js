/**
 * Unit Tests for HTMLSidraDisplayer Class
 * 
 * This test suite validates the HTML SIDRA data display functionality,
 * observer pattern integration, and IBGE API integration.
 * 
 * @author Marcelo Pereira Barbosa
 * @since 0.7.1-alpha
 */

import { jest } from '@jest/globals';
import HTMLSidraDisplayer from '../../src/html/HTMLSidraDisplayer.js';
import { ADDRESS_FETCHED_EVENT } from '../../src/config/defaults.js';

describe('HTMLSidraDisplayer Class', () => {
  
  describe('Constructor', () => {
    test('should create instance with element', () => {
      const mockElement = { id: 'test-sidra', innerHTML: '' };
      const displayer = new HTMLSidraDisplayer(mockElement);
      
      expect(displayer).toBeDefined();
      expect(displayer.element).toBe(mockElement);
      expect(displayer.dataType).toBe('PopEst'); // default
    });

    test('should create instance with custom data type', () => {
      const mockElement = { id: 'test-sidra', innerHTML: '' };
      const displayer = new HTMLSidraDisplayer(mockElement, { dataType: 'GDP' });
      
      expect(displayer.dataType).toBe('GDP');
    });

    test('should freeze instance after construction', () => {
      const mockElement = { id: 'test-sidra', innerHTML: '' };
      const displayer = new HTMLSidraDisplayer(mockElement);
      
      expect(Object.isFrozen(displayer)).toBe(true);
    });
  });

  describe('update() Method', () => {
    let mockElement;
    let displayer;
    let mockDisplaySidraDadosParams;

    beforeEach(() => {
      mockElement = { id: 'test-sidra', innerHTML: '' };
      
      // Mock global function BEFORE creating displayer
      mockDisplaySidraDadosParams = jest.fn();
      window.displaySidraDadosParams = mockDisplaySidraDadosParams;
      
      displayer = new HTMLSidraDisplayer(mockElement);
    });

    afterEach(() => {
      delete window.displaySidraDadosParams;
    });

    test('should handle loading state', () => {
      displayer.update(null, null, ADDRESS_FETCHED_EVENT, true, null);
      
      expect(mockElement.innerHTML).toContain('Carregando dados do IBGE');
      expect(mockElement.innerHTML).toContain('loading');
    });

    test('should handle error state', () => {
      const error = new Error('Test error');
      displayer.update(null, null, ADDRESS_FETCHED_EVENT, false, error);
      
      expect(mockElement.innerHTML).toContain('Erro ao carregar dados do IBGE');
      expect(mockElement.innerHTML).toContain('Test error');
      expect(mockElement.innerHTML).toContain('error');
    });

    test('should update SIDRA data on ADDRESS_FETCHED_EVENT', () => {
      const mockEnderecoPadronizado = {
        municipio: 'São Paulo',
        siglaUF: 'SP'
      };

      displayer.update(null, mockEnderecoPadronizado, ADDRESS_FETCHED_EVENT, false, null);

      expect(mockDisplaySidraDadosParams).toHaveBeenCalledWith(
        mockElement,
        'PopEst',
        { municipio: 'São Paulo', siglaUf: 'SP' }
      );
    });

    test('should not update on other event types', () => {
      const mockEnderecoPadronizado = {
        municipio: 'São Paulo',
        siglaUF: 'SP'
      };

      displayer.update(null, mockEnderecoPadronizado, 'PositionManager updated', false, null);

      expect(mockDisplaySidraDadosParams).not.toHaveBeenCalled();
    });

    test('should handle missing element gracefully', () => {
      const noElementDisplayer = new HTMLSidraDisplayer(null);
      
      expect(() => {
        noElementDisplayer.update(null, { municipio: 'Test' }, ADDRESS_FETCHED_EVENT, false, null);
      }).not.toThrow();
    });

    test('should handle missing enderecoPadronizado', () => {
      displayer.update(null, null, ADDRESS_FETCHED_EVENT, false, null);
      
      expect(mockDisplaySidraDadosParams).not.toHaveBeenCalled();
    });

    test('should handle missing global function', () => {
      delete window.displaySidraDadosParams;
      
      const mockEnderecoPadronizado = {
        municipio: 'São Paulo',
        siglaUF: 'SP'
      };

      expect(() => {
        displayer.update(null, mockEnderecoPadronizado, ADDRESS_FETCHED_EVENT, false, null);
      }).not.toThrow();
    });

    test('should handle errors from global function', () => {
      window.displaySidraDadosParams = jest.fn(() => {
        throw new Error('SIDRA API error');
      });

      const mockEnderecoPadronizado = {
        municipio: 'São Paulo',
        siglaUF: 'SP'
      };

      displayer.update(null, mockEnderecoPadronizado, ADDRESS_FETCHED_EVENT, false, null);

      expect(mockElement.innerHTML).toContain('Dados do IBGE temporariamente indisponíveis');
      expect(mockElement.innerHTML).toContain('error');
    });
  });

  describe('toString() Method', () => {
    test('should return formatted string with element ID and data type', () => {
      const mockElement = { id: 'test-sidra', innerHTML: '' };
      const displayer = new HTMLSidraDisplayer(mockElement);
      
      const result = displayer.toString();
      
      expect(result).toBe('HTMLSidraDisplayer: test-sidra (PopEst)');
    });

    test('should handle element without ID', () => {
      const mockElement = { innerHTML: '' };
      const displayer = new HTMLSidraDisplayer(mockElement);
      
      const result = displayer.toString();
      
      expect(result).toBe('HTMLSidraDisplayer: no-id (PopEst)');
    });

    test('should include custom data type in string', () => {
      const mockElement = { id: 'test-sidra', innerHTML: '' };
      const displayer = new HTMLSidraDisplayer(mockElement, { dataType: 'GDP' });
      
      const result = displayer.toString();
      
      expect(result).toBe('HTMLSidraDisplayer: test-sidra (GDP)');
    });
  });

  describe('Observer Pattern Integration', () => {
    test('should work as observer with update() method', () => {
      const mockElement = { id: 'test-sidra', innerHTML: '' };
      
      // Mock global function BEFORE creating displayer
      const mockFn = jest.fn();
      window.displaySidraDadosParams = mockFn;
      
      const displayer = new HTMLSidraDisplayer(mockElement);

      const mockEnderecoPadronizado = {
        municipio: 'Rio de Janeiro',
        siglaUF: 'RJ'
      };

      // Simulate observer notification
      displayer.update(null, mockEnderecoPadronizado, ADDRESS_FETCHED_EVENT, false, null);

      expect(mockFn).toHaveBeenCalled();
      
      delete window.displaySidraDadosParams;
    });
  });

  describe('Brazilian Context', () => {
    test('should use Portuguese error messages', () => {
      const mockElement = { id: 'test-sidra', innerHTML: '' };
      const displayer = new HTMLSidraDisplayer(mockElement);
      
      const error = new Error('Test error');
      displayer.update(null, null, ADDRESS_FETCHED_EVENT, false, error);
      
      expect(mockElement.innerHTML).toContain('Erro ao carregar dados do IBGE');
    });

    test('should use Portuguese loading message', () => {
      const mockElement = { id: 'test-sidra', innerHTML: '' };
      const displayer = new HTMLSidraDisplayer(mockElement);
      
      displayer.update(null, null, ADDRESS_FETCHED_EVENT, true, null);
      
      expect(mockElement.innerHTML).toContain('Carregando dados do IBGE');
    });

    test('should handle Brazilian municipalities correctly', () => {
      const mockElement = { id: 'test-sidra', innerHTML: '' };
      
      const mockDisplaySidraDadosParams = jest.fn();
      window.displaySidraDadosParams = mockDisplaySidraDadosParams;
      
      const displayer = new HTMLSidraDisplayer(mockElement);

      const brazilianMunicipalities = [
        { municipio: 'São Paulo', siglaUF: 'SP' },
        { municipio: 'Rio de Janeiro', siglaUF: 'RJ' },
        { municipio: 'Belo Horizonte', siglaUF: 'MG' },
        { municipio: 'Brasília', siglaUF: 'DF' }
      ];

      brazilianMunicipalities.forEach(endereco => {
        displayer.update(null, endereco, ADDRESS_FETCHED_EVENT, false, null);
        
        expect(mockDisplaySidraDadosParams).toHaveBeenCalledWith(
          mockElement,
          'PopEst',
          { municipio: endereco.municipio, siglaUf: endereco.siglaUF }
        );
      });

      delete window.displaySidraDadosParams;
    });
  });

  describe('Immutability', () => {
    test('should not allow modification of element property', () => {
      const mockElement = { id: 'test-sidra', innerHTML: '' };
      const displayer = new HTMLSidraDisplayer(mockElement);
      
      expect(() => {
        displayer.element = { id: 'different', innerHTML: '' };
      }).toThrow();
    });

    test('should not allow modification of dataType property', () => {
      const mockElement = { id: 'test-sidra', innerHTML: '' };
      const displayer = new HTMLSidraDisplayer(mockElement);
      
      expect(() => {
        displayer.dataType = 'Different';
      }).toThrow();
    });

    test('should not allow adding new properties', () => {
      const mockElement = { id: 'test-sidra', innerHTML: '' };
      const displayer = new HTMLSidraDisplayer(mockElement);
      
      expect(() => {
        displayer.newProperty = 'test';
      }).toThrow();
    });
  });
});
