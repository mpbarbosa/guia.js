/**
 * Unit Tests for HTMLAddressDisplayer Class
 * 
 * This test suite validates the HTML address display functionality,
 * comprehensive data visualization, observer pattern integration, and 
 * Brazilian Portuguese localization capabilities.
 * 
 * @author Marcelo Pereira Barbosa
 * @since 0.8.3-alpha
 */

import { jest } from '@jest/globals';
import HTMLAddressDisplayer from '../../src/html/HTMLAddressDisplayer.js';

// Mock BrazilianStandardAddress for testing
class MockBrazilianStandardAddress {
    constructor(data = {}) {
        this.logradouro = data.logradouro || null;
        this.numero = data.numero || null;
        this.bairro = data.bairro || null;
        this.municipio = data.municipio || null;
        this.uf = data.uf || null;
        this.cep = data.cep || null;
    }
    
    enderecoCompleto() {
        const parts = [];
        if (this.logradouro) parts.push(this.logradouro);
        if (this.numero) parts.push(this.numero);
        if (this.bairro) parts.push(this.bairro);
        if (this.municipio) parts.push(this.municipio);
        if (this.uf) parts.push(this.uf);
        return parts.join(', ');
    }
}

describe('HTMLAddressDisplayer - MP Barbosa Travel Guide (v0.8.9-alpha)', () => {
    let mockElement, displayer;

    beforeEach(() => {
        // Mock DOM element
        mockElement = {
            id: 'address-display',
            innerHTML: ''
        };

        // Create HTMLAddressDisplayer instance for testing
        displayer = new HTMLAddressDisplayer(mockElement);
    });

    describe('Constructor and Initialization', () => {
        test('should initialize with correct properties', () => {
            expect(displayer.element).toBe(mockElement);
            expect(displayer.enderecoPadronizadoDisplay).toBe(false);
            expect(Object.isFrozen(displayer)).toBe(true);
        });

        test('should handle additional standardized address display element', () => {
            const standardizedElement = { id: 'standardized-display' };
            const displayerWithStandardized = new HTMLAddressDisplayer(mockElement, standardizedElement);
            
            expect(displayerWithStandardized.element).toBe(mockElement);
            expect(displayerWithStandardized.enderecoPadronizadoDisplay).toBe(standardizedElement);
            expect(Object.isFrozen(displayerWithStandardized)).toBe(true);
        });

        test('should handle null element gracefully', () => {
            const displayerWithNull = new HTMLAddressDisplayer(null);
            expect(displayerWithNull.element).toBeNull();
            expect(Object.isFrozen(displayerWithNull)).toBe(true);
        });

        test('should be immutable after construction (MP Barbosa standards)', () => {
            expect(() => {
                displayer.newProperty = 'test';
            }).toThrow();
            
            expect(() => {
                displayer.element = null;
            }).toThrow();
        });
    });

    describe('Address Data Rendering (Brazilian Context)', () => {
        test('should render complete São Paulo address with all attributes', () => {
            const addressData = {
                display_name: 'Avenida Paulista, 1578, Bela Vista, São Paulo, SP, Brasil',
                address: {
                    road: 'Avenida Paulista',
                    house_number: '1578',
                    neighbourhood: 'Bela Vista',
                    city: 'São Paulo',
                    state: 'São Paulo',
                    postcode: '01310-200',
                    country: 'Brasil'
                },
                lat: '-23.5613',
                lon: '-46.6565',
                class: 'highway',
                type: 'primary'
            };
            
            const html = displayer.renderAddressHtml(addressData);
            
            expect(html).toContain('address-details');
            expect(html).toContain('Endereço Atual');
            expect(html).toContain('Todos os atributos de addressData:');
            expect(html).toContain('display_name');
            expect(html).toContain('Avenida Paulista, 1578, Bela Vista');
            expect(html).toContain('Endereço Completo:');
            expect(html).toContain('address');
            expect(html).toContain('Avenida Paulista');
        });

        test('should render Rio de Janeiro tourist location address', () => {
            const addressData = {
                display_name: 'Cristo Redentor, Corcovado, Rio de Janeiro, RJ, Brasil',
                address: {
                    tourism: 'Cristo Redentor',
                    suburb: 'Corcovado',
                    city: 'Rio de Janeiro',
                    state: 'Rio de Janeiro',
                    country: 'Brasil'
                },
                class: 'tourism',
                type: 'attraction'
            };
            
            const html = displayer.renderAddressHtml(addressData);
            
            expect(html).toContain('Cristo Redentor');
            expect(html).toContain('Rio de Janeiro');
            expect(html).toContain('tourism');
            expect(html).toContain('attraction');
        });

        test('should handle complex nested address objects', () => {
            const addressData = {
                display_name: 'Shopping Iguatemi, São Paulo, SP',
                address: {
                    shop: 'Shopping Iguatemi',
                    road: 'Avenida Brigadeiro Faria Lima',
                    house_number: '2232',
                    neighbourhood: 'Jardim Paulistano',
                    city: 'São Paulo',
                    state: 'São Paulo'
                },
                extratags: {
                    brand: 'Iguatemi',
                    opening_hours: 'Mo-Sa 10:00-22:00; Su 14:00-20:00'
                }
            };
            
            const html = displayer.renderAddressHtml(addressData);
            
            expect(html).toContain('Shopping Iguatemi');
            expect(html).toContain('Brigadeiro Faria Lima');
            expect(html).toContain('extratags');
            expect(html).toContain('<pre>'); // JSON formatting for nested objects
        });

        test('should return error message for null address data', () => {
            const html = displayer.renderAddressHtml(null);
            
            expect(html).toContain("Dados de endereço não disponíveis");
            expect(html).toContain("class='error'");
        });

        test('should handle address data without display_name', () => {
            const addressData = {
                address: {
                    road: 'Rua Augusta',
                    neighbourhood: 'Consolação',
                    city: 'São Paulo'
                }
            };
            
            const html = displayer.renderAddressHtml(addressData);
            
            expect(html).toContain('Rua Augusta');
            expect(html).toContain('Consolação');
            expect(html).not.toContain('Endereço Completo:');
        });
    });

    describe('Standardized Address Integration', () => {
        test('should update standardized display element when provided', () => {
            const standardizedElement = { innerHTML: '' };
            const displayerWithStandardized = new HTMLAddressDisplayer(mockElement, standardizedElement);
            
            const addressData = {
                display_name: 'Test Address',
                address: { road: 'Test Street' }
            };
            
            const standardizedAddress = new MockBrazilianStandardAddress({
                logradouro: 'Rua Teste',
                numero: '123',
                bairro: 'Centro',
                municipio: 'São Paulo',
                uf: 'SP'
            });
            
            const html = displayerWithStandardized.renderAddressHtml(addressData, standardizedAddress);
            
            expect(standardizedElement.innerHTML).toBe('Rua Teste, 123, Centro, São Paulo, SP');
            expect(html).toContain('Test Address');
        });

        test('should not update standardized element when not provided', () => {
            const addressData = { display_name: 'Test Address' };
            const standardizedAddress = new MockBrazilianStandardAddress({
                logradouro: 'Rua Teste'
            });
            
            // Should not throw error when enderecoPadronizadoDisplay is false
            expect(() => {
                displayer.renderAddressHtml(addressData, standardizedAddress);
            }).not.toThrow();
        });
    });

    describe('Portuguese Localization', () => {
        test('should use Portuguese terms in HTML output', () => {
            const addressData = {
                display_name: 'Endereço de teste',
                address: { road: 'Rua de Teste' }
            };
            
            const html = displayer.renderAddressHtml(addressData);
            
            expect(html).toContain('Endereço Atual');
            expect(html).toContain('Todos os atributos de addressData:');
            expect(html).toContain('Endereço Completo:');
        });

        test('should provide Portuguese error messages', () => {
            const errorHtml = displayer.renderAddressHtml(null);
            
            expect(errorHtml).toContain('não disponíveis');
        });
    });

    describe('Observer Pattern Integration', () => {
        test('should update element on position update event', () => {
            const addressData = {
                display_name: 'Praça da Sé, São Paulo, SP',
                address: {
                    place: 'Praça da Sé',
                    city: 'São Paulo',
                    state: 'São Paulo'
                }
            };
            
            const standardizedAddress = new MockBrazilianStandardAddress({
                municipio: 'São Paulo',
                uf: 'SP'
            });
            
            displayer.update(addressData, standardizedAddress, 'strCurrPosUpdate', false, null);
            
            expect(mockElement.innerHTML).toContain('Praça da Sé');
            expect(mockElement.innerHTML).toContain('São Paulo');
        });

        test('should display loading message during loading state', () => {
            displayer.update(null, null, 'strCurrPosUpdate', true, null);
            
            expect(mockElement.innerHTML).toContain('Carregando endereço...');
            expect(mockElement.innerHTML).toContain('class="loading"');
        });

        test('should display error message on error', () => {
            const error = new Error('Serviço de geocodificação indisponível');
            displayer.update(null, null, 'strCurrPosUpdate', false, error);
            
            expect(mockElement.innerHTML).toContain('Erro ao carregar endereço:');
            expect(mockElement.innerHTML).toContain('Serviço de geocodificação indisponível');
            expect(mockElement.innerHTML).toContain('class="error"');
        });

        test('should not update for unrecognized events', () => {
            const originalContent = 'original content';
            mockElement.innerHTML = originalContent;
            
            const addressData = { display_name: 'Test Address' };
            displayer.update(addressData, null, 'unknownEvent', false, null);
            
            expect(mockElement.innerHTML).toBe(originalContent);
        });

        test('should handle missing address data gracefully', () => {
            const originalContent = 'original content';
            mockElement.innerHTML = originalContent;
            
            displayer.update(null, null, 'strCurrPosUpdate', false, null);
            
            expect(mockElement.innerHTML).toBe(originalContent);
        });

        test('should handle null element gracefully in update', () => {
            const displayerWithNull = new HTMLAddressDisplayer(null);
            
            expect(() => {
                displayerWithNull.update({}, null, 'strCurrPosUpdate', false, null);
            }).not.toThrow();
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('should handle address data with empty objects', () => {
            const addressData = {
                display_name: '',
                address: {},
                extratags: {}
            };
            
            const html = displayer.renderAddressHtml(addressData);
            
            expect(html).toContain('address-details');
            expect(html).toContain('{}'); // Empty object representation
        });

        test('should handle address data with null nested objects', () => {
            const addressData = {
                display_name: 'Test',
                address: null,
                coordinates: null
            };
            
            const html = displayer.renderAddressHtml(addressData);
            
            expect(html).toContain('null');
        });

        test('should handle update with malformed address data', () => {
            const malformedData = { someProperty: 'value' };
            
            expect(() => {
                displayer.update(malformedData, null, 'strCurrPosUpdate', false, null);
            }).not.toThrow();
        });
    });

    describe('String Representation and Debugging', () => {
        test('should return correct string representation with element ID', () => {
            const result = displayer.toString();
            
            expect(result).toBe('HTMLAddressDisplayer: address-display');
        });

        test('should handle missing element ID', () => {
            const elementWithoutId = { innerHTML: '' };
            const displayerNoId = new HTMLAddressDisplayer(elementWithoutId);
            
            const result = displayerNoId.toString();
            
            expect(result).toBe('HTMLAddressDisplayer: no-id');
        });

        test('should provide meaningful toString for debugging Brazilian addresses', () => {
            mockElement.id = 'sao-paulo-address-display';
            const displayer = new HTMLAddressDisplayer(mockElement);
            
            expect(displayer.toString()).toBe('HTMLAddressDisplayer: sao-paulo-address-display');
        });

        test('should handle null element in toString', () => {
            const displayerWithNull = new HTMLAddressDisplayer(null);
            
            const result = displayerWithNull.toString();
            
            expect(result).toBe('HTMLAddressDisplayer: no-id');
        });
    });

    describe('Performance and Memory Management', () => {
        test('should not create memory leaks with repeated updates', () => {
            const addressData = {
                display_name: 'Repeated Address Test',
                address: {
                    road: 'Test Street',
                    city: 'Test City'
                }
            };

            // Perform many updates
            for (let i = 0; i < 1000; i++) {
                displayer.update(addressData, null, 'strCurrPosUpdate', false, null);
            }

            // Should still work correctly
            expect(mockElement.innerHTML).toContain('Repeated Address Test');
        });

        test('should handle large address data objects efficiently', () => {
            // Create large address object
            const largeAddressData = {
                display_name: 'Large Address Test',
                address: {}
            };
            
            // Add many properties to simulate complex geocoding response
            for (let i = 0; i < 100; i++) {
                largeAddressData.address[`property_${i}`] = `value_${i}`;
            }
            
            const html = displayer.renderAddressHtml(largeAddressData);
            
            expect(html).toContain('Large Address Test');
            expect(html).toContain('property_0');
            expect(html).toContain('property_99');
        });

        test('should maintain immutability during intensive operations', () => {
            const originalElement = displayer.element;
            
            // Perform intensive operations
            for (let i = 0; i < 100; i++) {
                displayer.toString();
                displayer.renderAddressHtml({
                    display_name: `Test ${i}`,
                    address: { road: `Street ${i}` }
                });
            }
            
            // Object should remain frozen and unchanged
            expect(Object.isFrozen(displayer)).toBe(true);
            expect(displayer.element).toBe(originalElement);
        });
    });

    describe('Brazilian Address Types', () => {
        test('should handle common Brazilian address types correctly', () => {
            const brazilianAddresses = [
                {
                    display_name: 'Avenida Paulista, São Paulo, SP',
                    address: { road: 'Avenida Paulista', city: 'São Paulo' }
                },
                {
                    display_name: 'Copacabana, Rio de Janeiro, RJ',
                    address: { neighbourhood: 'Copacabana', city: 'Rio de Janeiro' }
                },
                {
                    display_name: 'Centro, Brasília, DF',
                    address: { suburb: 'Centro', city: 'Brasília' }
                },
                {
                    display_name: 'Pelourinho, Salvador, BA',
                    address: { historic: 'Pelourinho', city: 'Salvador' }
                }
            ];

            brazilianAddresses.forEach(addressData => {
                const html = displayer.renderAddressHtml(addressData);
                
                expect(html).toContain(addressData.display_name);
                expect(html).toContain('address-details');
            });
        });
    });

    describe('HTML Structure Validation', () => {
        test('should generate proper HTML5 details/summary structure', () => {
            const addressData = {
                display_name: 'Test Structure',
                address: { road: 'Test Road' }
            };
            
            const html = displayer.renderAddressHtml(addressData);
            
            expect(html).toContain('<details class="address-details" closed>');
            expect(html).toContain('<summary><strong>Endereço Atual</strong></summary>');
            expect(html).toContain('</details>');
        });

        test('should generate semantic CSS classes for styling', () => {
            const addressData = {
                display_name: 'Semantic Test',
                address: { road: 'Semantic Street' }
            };
            
            const html = displayer.renderAddressHtml(addressData);
            
            expect(html).toContain('class="address-details"');
            expect(html).toContain('class="address-attributes"');
            expect(html).toContain('class="full-address"');
            expect(html).toContain('class="display-name"');
        });

        test('should close all HTML tags properly', () => {
            const addressData = {
                display_name: 'Tag Balance Test',
                address: { road: 'Balance Street' }
            };
            
            const html = displayer.renderAddressHtml(addressData);
            
            // Count opening and closing tags
            const openingTags = (html.match(/<\w+/g) || []).length;
            const closingTags = (html.match(/<\/\w+>/g) || []).length;
            const selfClosingTags = (html.match(/<\w+[^>]*\/>/g) || []).length;
            
            // Should have balanced tags (accounting for self-closing tags)
            expect(openingTags - selfClosingTags).toBe(closingTags);
        });
    });

    describe('Data Type Handling', () => {
        test('should format numbers correctly', () => {
            const addressData = {
                display_name: 'Numeric Test',
                lat: -23.5613,
                lon: -46.6565,
                osm_id: 123456789,
                importance: 0.75
            };
            
            const html = displayer.renderAddressHtml(addressData);
            
            expect(html).toContain('-23.5613');
            expect(html).toContain('-46.6565');
            expect(html).toContain('123456789');
            expect(html).toContain('0.75');
        });

        test('should format boolean values correctly', () => {
            const addressData = {
                display_name: 'Boolean Test',
                verified: true,
                deprecated: false
            };
            
            const html = displayer.renderAddressHtml(addressData);
            
            expect(html).toContain('true');
            expect(html).toContain('false');
        });

        test('should handle arrays in address data', () => {
            const addressData = {
                display_name: 'Array Test',
                categories: ['tourism', 'attraction', 'monument'],
                coordinates: [-23.5613, -46.6565]
            };
            
            const html = displayer.renderAddressHtml(addressData);
            
            expect(html).toContain('tourism');
            expect(html).toContain('<pre>'); // Arrays should be JSON formatted
        });
    });
});