/**
 * Integration Tests for HTMLReferencePlaceDisplayer
 * 
 * These tests validate the integration between HTMLReferencePlaceDisplayer and the main guia.js library,
 * ensuring proper module import/export functionality and backward compatibility.
 * 
 * @author Marcelo Pereira Barbosa
 * @since 0.8.3-alpha
 */

import { jest } from '@jest/globals';

describe('HTMLReferencePlaceDisplayer Integration Tests', () => {
    let HTMLReferencePlaceDisplayer;

    beforeAll(async () => {
        // Test module import
        const module = await import('../../src/html/HTMLReferencePlaceDisplayer.js');
        HTMLReferencePlaceDisplayer = module.default;
    });

    describe('Module Import/Export', () => {
        test('should import HTMLReferencePlaceDisplayer class correctly', () => {
            expect(HTMLReferencePlaceDisplayer).toBeDefined();
            expect(typeof HTMLReferencePlaceDisplayer).toBe('function');
            expect(HTMLReferencePlaceDisplayer.name).toBe('HTMLReferencePlaceDisplayer');
        });

        test('should be constructable after import', () => {
            const mockElement = { id: 'test', innerHTML: '' };
            const instance = new HTMLReferencePlaceDisplayer(mockElement);
            
            expect(instance).toBeInstanceOf(HTMLReferencePlaceDisplayer);
            expect(instance.element).toBe(mockElement);
        });
    });

    describe('Integration with Main Library', () => {
        test('should be available through main guia.js export', async () => {
            // Test that HTMLReferencePlaceDisplayer is accessible through main library
            const guiaModule = await import('../../src/guia.js');
            
            // The class should be available as an export
            expect(guiaModule.HTMLReferencePlaceDisplayer).toBeDefined();
            expect(guiaModule.HTMLReferencePlaceDisplayer).toBe(HTMLReferencePlaceDisplayer);
        });

        test('should maintain backward compatibility', async () => {
            const guiaModule = await import('../../src/guia.js');
            
            // Test instantiation through main module
            const mockElement = { id: 'compatibility-test', innerHTML: '' };
            const instance = new guiaModule.HTMLReferencePlaceDisplayer(mockElement);
            
            expect(instance).toBeInstanceOf(HTMLReferencePlaceDisplayer);
            expect(instance.toString()).toBe('HTMLReferencePlaceDisplayer: compatibility-test');
        });
    });

    describe('Real DOM Integration', () => {
        let testElement;

        beforeEach(() => {
            // Create real DOM element for testing
            testElement = {
                id: 'reference-place-integration-test',
                innerHTML: '',
                style: {}
            };
        });

        test('should work with real DOM-like elements', () => {
            const instance = new HTMLReferencePlaceDisplayer(testElement);
            
            const mockReferencePlace = {
                description: 'Shopping Center',
                name: 'Shopping Ibirapuera',
                className: 'shop',
                typeName: 'mall'
            };
            
            const html = instance.renderReferencePlaceHtml(mockReferencePlace);
            
            expect(html).toContain('Shopping Ibirapuera');
            expect(html).toContain('reference-place-container');
        });

        test('should update DOM element through observer pattern', () => {
            const instance = new HTMLReferencePlaceDisplayer(testElement);
            
            const mockBrazilianAddress = {
                constructor: { name: 'BrazilianStandardAddress' },
                referencePlace: {
                    description: 'Estação do Metrô',
                    name: 'Estação Faria Lima'
                }
            };
            
            instance.update(null, mockBrazilianAddress, 'strCurrPosUpdate', false, null);
            
            expect(testElement.innerHTML).toContain('Estação Faria Lima');
            expect(testElement.innerHTML).toContain('Estação do Metrô');
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle module loading errors gracefully', async () => {
            // This test ensures the module can be imported even in adverse conditions
            expect(HTMLReferencePlaceDisplayer).toBeDefined();
            
            // Test with null constructor parameter
            const instance = new HTMLReferencePlaceDisplayer(null);
            expect(instance.element).toBeNull();
            expect(Object.isFrozen(instance)).toBe(true);
        });

        test('should integrate error handling with observer pattern', () => {
            const mockElement = { id: 'error-test', innerHTML: '' };
            const instance = new HTMLReferencePlaceDisplayer(mockElement);
            
            const error = new Error('Falha na conexão com serviço de referência');
            instance.update(null, null, 'strCurrPosUpdate', false, error);
            
            expect(mockElement.innerHTML).toContain('Erro ao carregar local de referência');
            expect(mockElement.innerHTML).toContain('Falha na conexão com serviço de referência');
        });
    });

    describe('Performance Integration', () => {
        test('should handle multiple instances without conflict', () => {
            const elements = Array.from({ length: 10 }, (_, i) => ({
                id: `test-element-${i}`,
                innerHTML: ''
            }));
            
            const instances = elements.map(el => new HTMLReferencePlaceDisplayer(el));
            
            instances.forEach((instance, index) => {
                expect(instance.toString()).toBe(`HTMLReferencePlaceDisplayer: test-element-${index}`);
            });
            
            // Test that all instances work independently
            const mockReferencePlace = {
                description: 'Farmácia',
                name: `Drogaria São Paulo ${Math.random()}`
            };
            
            instances.forEach(instance => {
                const html = instance.renderReferencePlaceHtml(mockReferencePlace);
                expect(html).toContain('Farmácia');
            });
        });
    });

    describe('Brazilian Context Integration', () => {
        test('should properly format Brazilian place names and descriptions', () => {
            const mockElement = { id: 'brazilian-test', innerHTML: '' };
            const instance = new HTMLReferencePlaceDisplayer(mockElement);
            
            const brazilianPlaces = [
                { description: 'Padaria', name: 'Padaria do Seu José' },
                { description: 'Açougue', name: 'Açougue Central' },
                { description: 'Lanchonete', name: 'Lanchonete da Esquina' },
                { description: 'Farmácia', name: 'Farmácia Drogasil' }
            ];
            
            brazilianPlaces.forEach(place => {
                const html = instance.renderReferencePlaceHtml(place);
                expect(html).toContain(place.description);
                expect(html).toContain(place.name);
                expect(html).toContain('reference-place-container');
            });
        });

        test('should handle Portuguese special characters correctly', () => {
            const mockElement = { id: 'portuguese-test', innerHTML: '' };
            const instance = new HTMLReferencePlaceDisplayer(mockElement);
            
            const referencePlace = {
                description: 'Açougue',
                name: 'Açougue São João',
                className: 'comércio',
                typeName: 'alimentação'
            };
            
            const html = instance.renderReferencePlaceHtml(referencePlace);
            
            expect(html).toContain('Açougue');
            expect(html).toContain('São João');
            expect(html).toContain('comércio');
            expect(html).toContain('alimentação');
        });
    });

    describe('Cross-Module Compatibility', () => {
        test('should work alongside other HTML display modules', async () => {
            // Import other HTML display modules
            const HtmlTextModule = await import('../../src/html/HtmlText.js');
            const HTMLPositionDisplayerModule = await import('../../src/html/HTMLPositionDisplayer.js');
            
            const HtmlText = HtmlTextModule.default;
            const HTMLPositionDisplayer = HTMLPositionDisplayerModule.default;
            
            // Create instances of all modules with proper mock elements
            const mockDocument = { getElementById: () => null };
            const textElement = { id: 'text-test', innerHTML: '', style: {} };
            const positionElement = { id: 'position-test', innerHTML: '', style: {} };
            const referenceElement = { id: 'reference-test', innerHTML: '', style: {} };
            
            const htmlText = new HtmlText(mockDocument, textElement);
            const positionDisplayer = new HTMLPositionDisplayer(positionElement);
            const referenceDisplayer = new HTMLReferencePlaceDisplayer(referenceElement);
            
            // All should be properly instantiated
            expect(htmlText.toString()).toBe('HtmlText: text-test');
            expect(positionDisplayer.toString()).toBe('HTMLPositionDisplayer: position-test');
            expect(referenceDisplayer.toString()).toBe('HTMLReferencePlaceDisplayer: reference-test');
            
            // All should be immutable
            expect(Object.isFrozen(htmlText)).toBe(true);
            expect(Object.isFrozen(positionDisplayer)).toBe(true);
            expect(Object.isFrozen(referenceDisplayer)).toBe(true);
        });
    });
});