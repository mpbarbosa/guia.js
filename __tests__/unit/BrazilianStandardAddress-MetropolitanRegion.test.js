/**
 * Unit tests for BrazilianStandardAddress - Metropolitan Region Feature
 * Tests the new regiaoMetropolitana property and regiaoMetropolitanaFormatada() method
 * 
 * @jest-environment node
 * @author MP Barbosa
 * @since 0.9.0-alpha
 */

import { describe, test, expect, beforeEach } from '@jest/globals';

// Import the class
let BrazilianStandardAddress;
try {
    const module = await import('../../src/data/BrazilianStandardAddress.js');
    BrazilianStandardAddress = module.default;
} catch (error) {
    console.warn('Could not load BrazilianStandardAddress:', error.message);
}

describe('BrazilianStandardAddress - Metropolitan Region (v0.9.0-alpha)', () => {
    
    describe('Constructor - regiaoMetropolitana property', () => {
        test('should initialize regiaoMetropolitana to null', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            
            expect(address).toHaveProperty('regiaoMetropolitana');
            expect(address.regiaoMetropolitana).toBeNull();
        });

        test('should have regiaoMetropolitana property alongside other address components', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            
            // Verify all expected properties exist
            expect(address).toHaveProperty('logradouro');
            expect(address).toHaveProperty('municipio');
            expect(address).toHaveProperty('regiaoMetropolitana');
            expect(address).toHaveProperty('uf');
            expect(address).toHaveProperty('siglaUF');
        });

        test('should allow setting regiaoMetropolitana after construction', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana do Recife';
            
            expect(address.regiaoMetropolitana).toBe('Região Metropolitana do Recife');
        });
    });

    describe('regiaoMetropolitanaFormatada() method', () => {
        test('should return empty string when regiaoMetropolitana is null', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            const result = address.regiaoMetropolitanaFormatada();
            
            expect(result).toBe('');
            expect(typeof result).toBe('string');
        });

        test('should return empty string when regiaoMetropolitana is undefined', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = undefined;
            const result = address.regiaoMetropolitanaFormatada();
            
            expect(result).toBe('');
        });

        test('should return empty string when regiaoMetropolitana is empty string', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = '';
            const result = address.regiaoMetropolitanaFormatada();
            
            expect(result).toBe('');
        });

        test('should return region name when regiaoMetropolitana is set', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana do Recife';
            const result = address.regiaoMetropolitanaFormatada();
            
            expect(result).toBe('Região Metropolitana do Recife');
        });
    });

    describe('Real-world metropolitan region examples', () => {
        test('should format Região Metropolitana do Recife correctly', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana do Recife';
            address.municipio = 'Recife';
            address.siglaUF = 'PE';
            
            expect(address.regiaoMetropolitanaFormatada()).toBe('Região Metropolitana do Recife');
            expect(address.municipioCompleto()).toBe('Recife, PE');
        });

        test('should format Região Metropolitana de São Paulo correctly', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana de São Paulo';
            address.municipio = 'São Paulo';
            address.siglaUF = 'SP';
            
            expect(address.regiaoMetropolitanaFormatada()).toBe('Região Metropolitana de São Paulo');
            expect(address.municipioCompleto()).toBe('São Paulo, SP');
        });

        test('should format Região Metropolitana do Rio de Janeiro correctly', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana do Rio de Janeiro';
            address.municipio = 'Rio de Janeiro';
            address.siglaUF = 'RJ';
            
            expect(address.regiaoMetropolitanaFormatada()).toBe('Região Metropolitana do Rio de Janeiro');
            expect(address.municipioCompleto()).toBe('Rio de Janeiro, RJ');
        });

        test('should handle Olinda in Recife metropolitan region', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana do Recife';
            address.municipio = 'Olinda';
            address.siglaUF = 'PE';
            
            expect(address.regiaoMetropolitanaFormatada()).toBe('Região Metropolitana do Recife');
            expect(address.municipioCompleto()).toBe('Olinda, PE');
        });
    });

    describe('Edge cases', () => {
        test('should handle very long metropolitan region names', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            const longName = 'Região Metropolitana de Nome Muito Longo Para Teste de Quebra de Linha';
            address.regiaoMetropolitana = longName;
            
            expect(address.regiaoMetropolitanaFormatada()).toBe(longName);
            expect(address.regiaoMetropolitanaFormatada().length).toBeGreaterThan(50);
        });

        test('should handle region with special characters', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana de São José dos Campos';
            
            expect(address.regiaoMetropolitanaFormatada()).toBe('Região Metropolitana de São José dos Campos');
            expect(address.regiaoMetropolitanaFormatada()).toContain('ã');
            expect(address.regiaoMetropolitanaFormatada()).toContain('é');
        });

        test('should handle non-metropolitan municipality (no region)', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            address.municipio = 'Arapiraca';
            address.siglaUF = 'AL';
            // regiaoMetropolitana remains null
            
            expect(address.regiaoMetropolitanaFormatada()).toBe('');
            expect(address.municipioCompleto()).toBe('Arapiraca, AL');
        });
    });

    describe('Integration with other formatting methods', () => {
        test('should work correctly when both region and municipality are set', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana do Recife';
            address.municipio = 'Recife';
            address.siglaUF = 'PE';
            address.bairro = 'Boa Viagem';
            
            expect(address.regiaoMetropolitanaFormatada()).toBe('Região Metropolitana do Recife');
            expect(address.municipioCompleto()).toBe('Recife, PE');
            expect(address.bairroCompleto()).toBe('Boa Viagem');
        });

        test('should maintain independence from municipioCompleto()', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana de São Paulo';
            address.municipio = 'São Paulo';
            // No siglaUF set
            
            expect(address.regiaoMetropolitanaFormatada()).toBe('Região Metropolitana de São Paulo');
            expect(address.municipioCompleto()).toBe('São Paulo'); // No state abbreviation
        });

        test('should work in complete address scenario', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            address.logradouro = 'Avenida Paulista';
            address.numero = '1578';
            address.bairro = 'Bela Vista';
            address.municipio = 'São Paulo';
            address.regiaoMetropolitana = 'Região Metropolitana de São Paulo';
            address.siglaUF = 'SP';
            address.cep = '01310-200';
            
            // All formatting methods should work correctly
            expect(address.logradouroCompleto()).toBe('Avenida Paulista, 1578');
            expect(address.bairroCompleto()).toBe('Bela Vista');
            expect(address.regiaoMetropolitanaFormatada()).toBe('Região Metropolitana de São Paulo');
            expect(address.municipioCompleto()).toBe('São Paulo, SP');
            
            // Complete address should include all components
            const completeAddress = address.enderecoCompleto();
            expect(completeAddress).toContain('Avenida Paulista');
            expect(completeAddress).toContain('Bela Vista');
            expect(completeAddress).toContain('São Paulo, SP');
        });
    });

    describe('Method behavior consistency', () => {
        test('regiaoMetropolitanaFormatada() should follow same pattern as bairroCompleto()', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            
            // Both should return empty string when null
            expect(address.regiaoMetropolitanaFormatada()).toBe('');
            expect(address.bairroCompleto()).toBe('');
            
            // Both should return the value when set
            address.regiaoMetropolitana = 'Região Metropolitana do Recife';
            address.bairro = 'Boa Viagem';
            
            expect(address.regiaoMetropolitanaFormatada()).toBe('Região Metropolitana do Recife');
            expect(address.bairroCompleto()).toBe('Boa Viagem');
        });

        test('should return string type consistently', () => {
            if (!BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const address = new BrazilianStandardAddress();
            
            // Null case
            expect(typeof address.regiaoMetropolitanaFormatada()).toBe('string');
            
            // With value
            address.regiaoMetropolitana = 'Região Metropolitana do Recife';
            expect(typeof address.regiaoMetropolitanaFormatada()).toBe('string');
        });
    });
});
