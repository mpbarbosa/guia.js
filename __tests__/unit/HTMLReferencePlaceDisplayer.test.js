import { ADDRESS_FETCHED_EVENT } from '../../src/config/defaults.js';
/**
 * Unit Tests for HTMLReferencePlaceDisplayer Class
 * 
 * This test suite validates the HTML reference place display functionality,
 * Portuguese localization, observer pattern integration, and Brazilian context features.
 * 
 * @author Marcelo Pereira Barbosa
 * @since 0.9.0-alpha
 */

import { jest } from '@jest/globals';
import HTMLReferencePlaceDisplayer from '../../src/html/HTMLReferencePlaceDisplayer.js';

// Mock ReferencePlace for testing
class MockReferencePlace {
    constructor(data = {}) {
        this.className = data.className || null;
        this.typeName = data.typeName || null;
        this.name = data.name || null;
        this.description = data.description || null;
    }

    calculateCategory() {
        // Simple mock implementation
        const categoryMap = {
            'shop': 'Shopping Center',
            'amenity': 'Café',
            'railway': 'Estação do Metrô',
            'building': 'Edifício',
            'place': 'Residencial'
        };
        return categoryMap[this.className] || 'unknown';
    }
}

describe('HTMLReferencePlaceDisplayer - MP Barbosa Travel Guide (v0.8.8-alpha)', () => {
    let mockElement, displayer;

    beforeEach(() => {
        // Mock DOM element
        mockElement = {
            id: 'reference-place-display',
            innerHTML: ''
        };

        // Create HTMLReferencePlaceDisplayer instance for testing
        displayer = new HTMLReferencePlaceDisplayer(mockElement);
    });

    describe('Constructor and Initialization', () => {
        test('should initialize with correct properties', () => {
            expect(displayer.element).toBe(mockElement);
            expect(displayer.referencePlaceDisplay).toBe(false);
            expect(Object.isFrozen(displayer)).toBe(true);
        });

        test('should handle additional reference place display element', () => {
            const additionalElement = { id: 'additional-display' };
            const displayerWithAdditional = new HTMLReferencePlaceDisplayer(mockElement, additionalElement);
            
            expect(displayerWithAdditional.element).toBe(mockElement);
            expect(displayerWithAdditional.referencePlaceDisplay).toBe(additionalElement);
            expect(Object.isFrozen(displayerWithAdditional)).toBe(true);
        });

        test('should handle null element gracefully', () => {
            const displayerWithNull = new HTMLReferencePlaceDisplayer(null);
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

    describe('Reference Place Data Rendering (Brazilian Context)', () => {
        test('should render shopping center with name', () => {
            const referencePlace = new MockReferencePlace({
                className: 'shop',
                typeName: 'mall', 
                name: 'Shopping Morumbi',
                description: 'Shopping Center'
            });
            
            const html = displayer.renderReferencePlaceHtml(referencePlace);
            
            expect(html).toContain('reference-place-container');
            expect(html).toContain('reference-place-type');
            expect(html).toContain('reference-place-name');
            expect(html).toContain('Shopping Center');
            expect(html).toContain('Shopping Morumbi');
        });

        test('should render subway station with Portuguese localization', () => {
            const referencePlace = new MockReferencePlace({
                className: 'railway',
                typeName: 'subway',
                name: 'Estação Sé',
                description: 'Estação do Metrô'
            });
            
            const html = displayer.renderReferencePlaceHtml(referencePlace);
            
            expect(html).toContain('Estação do Metrô');
            expect(html).toContain('Estação Sé');
            expect(html).toContain('reference-place-details');
            expect(html).toContain('Categoria: Estação do Metrô');
            expect(html).toContain('Tipo: subway');
        });

        test('should render cafe with Portuguese description', () => {
            const referencePlace = new MockReferencePlace({
                className: 'amenity',
                typeName: 'cafe',
                name: 'Café Girondino',
                description: 'Café'
            });
            
            const html = displayer.renderReferencePlaceHtml(referencePlace);
            
            expect(html).toContain('Café');
            expect(html).toContain('Café Girondino');
        });

        test('should handle reference place with only description', () => {
            const referencePlace = new MockReferencePlace({
                description: 'Restaurante'
            });
            
            const html = displayer.renderReferencePlaceHtml(referencePlace);
            
            expect(html).toContain('Restaurante');
            expect(html).toContain('reference-place-type');
            expect(html).not.toContain('reference-place-name');
        });

        test('should handle reference place with only name', () => {
            const referencePlace = new MockReferencePlace({
                name: 'Local Histórico'
            });
            
            const html = displayer.renderReferencePlaceHtml(referencePlace);
            
            expect(html).toContain('Local Histórico');
            expect(html).toContain('reference-place-name');
        });

        test('should return error message for null reference place', () => {
            const html = displayer.renderReferencePlaceHtml(null);
            
            expect(html).toContain("Dados de local de referência não disponíveis");
            expect(html).toContain("class='error'");
        });

        test('should return warning for empty reference place', () => {
            const emptyReferencePlace = new MockReferencePlace({});
            const html = displayer.renderReferencePlaceHtml(emptyReferencePlace);
            
            expect(html).toContain("Local de referência sem informações disponíveis");
            expect(html).toContain("class='warning'");
        });
    });

    describe('Portuguese Localization', () => {
        test('should use Portuguese terms in HTML output', () => {
            const referencePlace = new MockReferencePlace({
                className: 'shop',
                typeName: 'mall',
                description: 'Shopping Center'
            });
            
            const html = displayer.renderReferencePlaceHtml(referencePlace);
            
            expect(html).toContain('Categoria:');
            expect(html).toContain('Tipo:');
        });

        test('should provide Portuguese error messages', () => {
            const errorHtml = displayer.renderReferencePlaceHtml(null);
            const warningHtml = displayer.renderReferencePlaceHtml(new MockReferencePlace({}));
            
            expect(errorHtml).toContain('não disponíveis');
            expect(warningHtml).toContain('sem informações disponíveis');
        });
    });

    describe('Observer Pattern Integration', () => {
        let mockBrazilianStandardAddress;

        beforeEach(() => {
            mockBrazilianStandardAddress = {
                constructor: { name: 'BrazilianStandardAddress' },
                referencePlace: new MockReferencePlace({
                    className: 'shop',
                    typeName: 'mall',
                    name: 'Shopping Vila Olímpia',
                    description: 'Shopping Center'
                })
            };
        });

        test('should update element on position update event', () => {
            displayer.update(null, mockBrazilianStandardAddress, ADDRESS_FETCHED_EVENT, false, null);
            
            expect(mockElement.innerHTML).toContain('Shopping Center');
            expect(mockElement.innerHTML).toContain('Shopping Vila Olímpia');
        });

        test('should display loading message during loading state', () => {
            displayer.update(null, null, ADDRESS_FETCHED_EVENT, true, null);
            
            expect(mockElement.innerHTML).toContain('Carregando local de referência...');
            expect(mockElement.innerHTML).toContain('class="loading"');
        });

        test('should display error message on error', () => {
            const error = new Error('Serviço de localização indisponível');
            displayer.update(null, null, ADDRESS_FETCHED_EVENT, false, error);
            
            expect(mockElement.innerHTML).toContain('Erro ao carregar local de referência:');
            expect(mockElement.innerHTML).toContain('Serviço de localização indisponível');
            expect(mockElement.innerHTML).toContain('class="error"');
        });

        test('should not update for unrecognized events', () => {
            const originalContent = 'original content';
            mockElement.innerHTML = originalContent;
            
            displayer.update(null, mockBrazilianStandardAddress, 'unknownEvent', false, null);
            
            expect(mockElement.innerHTML).toBe(originalContent);
        });

        test('should handle missing standardized address gracefully', () => {
            const originalContent = 'original content';
            mockElement.innerHTML = originalContent;
            
            displayer.update(null, null, ADDRESS_FETCHED_EVENT, false, null);
            
            expect(mockElement.innerHTML).toBe(originalContent);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('should handle reference place with empty strings', () => {
            const referencePlace = new MockReferencePlace({
                name: '',
                description: ''
            });
            
            const html = displayer.renderReferencePlaceHtml(referencePlace);
            
            expect(html).toContain('sem informações disponíveis');
        });

        test('should handle reference place with whitespace-only name', () => {
            const referencePlace = new MockReferencePlace({
                name: '   ',
                description: 'Shopping Center'
            });
            
            const html = displayer.renderReferencePlaceHtml(referencePlace);
            
            expect(html).toContain('Shopping Center');
            expect(html).not.toContain('reference-place-name');
        });

        test('should handle update with null Brazilian standard address', () => {
            expect(() => {
                displayer.update(null, null, ADDRESS_FETCHED_EVENT, false, null);
            }).not.toThrow();
        });

        test('should handle update with malformed Brazilian standard address', () => {
            const malformedAddress = { someProperty: 'value' };
            
            expect(() => {
                displayer.update(null, malformedAddress, ADDRESS_FETCHED_EVENT, false, null);
            }).not.toThrow();
        });
    });

    describe('String Representation and Debugging', () => {
        test('should return correct string representation with element ID', () => {
            const result = displayer.toString();
            
            expect(result).toBe('HTMLReferencePlaceDisplayer: reference-place-display');
        });

        test('should handle missing element ID', () => {
            const elementWithoutId = { innerHTML: '' };
            const displayerNoId = new HTMLReferencePlaceDisplayer(elementWithoutId);
            
            const result = displayerNoId.toString();
            
            expect(result).toBe('HTMLReferencePlaceDisplayer: no-id');
        });

        test('should provide meaningful toString for debugging Brazilian places', () => {
            mockElement.id = 'sao-paulo-reference-display';
            const displayer = new HTMLReferencePlaceDisplayer(mockElement);
            
            expect(displayer.toString()).toBe('HTMLReferencePlaceDisplayer: sao-paulo-reference-display');
        });
    });

    describe('Performance and Memory Management', () => {
        test('should not create memory leaks with repeated updates', () => {
            const mockAddress = {
                constructor: { name: 'BrazilianStandardAddress' },
                referencePlace: new MockReferencePlace({
                    description: 'Shopping Center',
                    name: 'Shopping Center Norte'
                })
            };

            // Perform many updates
            for (let i = 0; i < 1000; i++) {
                displayer.update(null, mockAddress, ADDRESS_FETCHED_EVENT, false, null);
            }

            // Should still work correctly
            expect(mockElement.innerHTML).toContain('Shopping Center Norte');
        });

        test('should maintain immutability during intensive operations', () => {
            const originalElement = displayer.element;
            
            // Perform intensive operations
            for (let i = 0; i < 100; i++) {
                displayer.toString();
                displayer.renderReferencePlaceHtml(new MockReferencePlace({
                    description: 'Test Place'
                }));
            }
            
            // Object should remain frozen and unchanged
            expect(Object.isFrozen(displayer)).toBe(true);
            expect(displayer.element).toBe(originalElement);
        });
    });

    describe('Brazilian Reference Place Types', () => {
        test('should handle common Brazilian place types correctly', () => {
            const brazilianPlaces = [
                { description: 'Shopping Center', name: 'Shopping Iguatemi' },
                { description: 'Estação do Metrô', name: 'Estação Paulista' },
                { description: 'Supermercado', name: 'Extra Hiper' },
                { description: 'Hospital', name: 'Hospital Sírio-Libanês' },
                { description: 'Escola', name: 'Colégio Bandeirantes' }
            ];

            brazilianPlaces.forEach(place => {
                const referencePlace = new MockReferencePlace(place);
                const html = displayer.renderReferencePlaceHtml(referencePlace);
                
                expect(html).toContain(place.description);
                expect(html).toContain(place.name);
            });
        });
    });

    describe('HTML Structure Validation', () => {
        test('should generate proper HTML structure with semantic classes', () => {
            const referencePlace = new MockReferencePlace({
                description: 'Shopping Center',
                name: 'Shopping Morumbi',
                className: 'shop',
                typeName: 'mall'
            });
            
            const html = displayer.renderReferencePlaceHtml(referencePlace);
            
            expect(html).toContain('<div class="reference-place-container">');
            expect(html).toContain('<div class="reference-place-attributes">');
            expect(html).toContain('<span class="reference-place-type">');
            expect(html).toContain('<span class="reference-place-name">');
            expect(html).toContain('<div class="reference-place-details">');
            expect(html).toContain('<small class="reference-place-class">');
            expect(html).toContain('<small class="reference-place-type-detail">');
        });

        test('should close all HTML tags properly', () => {
            const referencePlace = new MockReferencePlace({
                description: 'Hospital',
                name: 'Hospital das Clínicas'
            });
            
            const html = displayer.renderReferencePlaceHtml(referencePlace);
            
            // Count opening and closing div tags
            const openingDivs = (html.match(/<div/g) || []).length;
            const closingDivs = (html.match(/<\/div>/g) || []).length;
            
            expect(openingDivs).toBe(closingDivs);
        });
    });
});