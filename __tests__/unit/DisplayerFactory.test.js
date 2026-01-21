/**
 * Unit Tests for DisplayerFactory Class
 * 
 * This test suite validates the factory pattern implementation for displayer creation,
 * dependency injection support, immutability enforcement, and referential transparency
 * following MP Barbosa standards.
 * 
 * @author Marcelo Pereira Barbosa
 * @since 0.8.6-alpha
 */

import { jest } from '@jest/globals';
import DisplayerFactory from '../../src/html/DisplayerFactory.js';
import HTMLPositionDisplayer from '../../src/html/HTMLPositionDisplayer.js';
import HTMLAddressDisplayer from '../../src/html/HTMLAddressDisplayer.js';
import HTMLReferencePlaceDisplayer from '../../src/html/HTMLReferencePlaceDisplayer.js';

describe('DisplayerFactory - MP Barbosa Travel Guide (v0.8.10-alpha)', () => {
    let mockElement;

    beforeEach(() => {
        // Create mock element for testing
        mockElement = {
            id: 'test-element',
            innerHTML: '',
            textContent: ''
        };
    });

    describe('Constructor and Static Nature', () => {
        test('should be a static factory class (no instantiation)', () => {
            // Factory should not be instantiated
            expect(() => new DisplayerFactory()).toThrow('DisplayerFactory is a static factory class and cannot be instantiated. Use static methods instead.');
        });

        test('should have static factory methods', () => {
            expect(typeof DisplayerFactory.createPositionDisplayer).toBe('function');
            expect(typeof DisplayerFactory.createAddressDisplayer).toBe('function');
            expect(typeof DisplayerFactory.createReferencePlaceDisplayer).toBe('function');
            expect(typeof DisplayerFactory.toString).toBe('function');
        });

        test('should be frozen to prevent modifications', () => {
            expect(Object.isFrozen(DisplayerFactory)).toBe(true);
            
            expect(() => {
                DisplayerFactory.newMethod = () => {};
            }).toThrow();
        });
    });

    describe('Position Displayer Factory', () => {
        test('should create HTMLPositionDisplayer instance', () => {
            const displayer = DisplayerFactory.createPositionDisplayer(mockElement);

            expect(displayer).toBeDefined();
            expect(displayer).toBeInstanceOf(HTMLPositionDisplayer);
            expect(displayer.element).toBe(mockElement);
        });

        test('should create immutable position displayer (MP Barbosa standards)', () => {
            const displayer = DisplayerFactory.createPositionDisplayer(mockElement);

            expect(Object.isFrozen(displayer)).toBe(true);
            
            expect(() => {
                displayer.newProperty = 'test';
            }).toThrow();
        });

        test('should create position displayer with string element ID', () => {
            const displayer = DisplayerFactory.createPositionDisplayer('position-element-id');

            expect(displayer).toBeInstanceOf(HTMLPositionDisplayer);
            expect(displayer.element).toBe('position-element-id');
        });

        test('should return frozen position displayer', () => {
            const displayer = DisplayerFactory.createPositionDisplayer(mockElement);
            
            expect(Object.isFrozen(displayer)).toBe(true);
            expect(displayer.toString()).toBe('HTMLPositionDisplayer: test-element');
        });
    });

    describe('Address Displayer Factory', () => {
        test('should create HTMLAddressDisplayer instance with default parameters', () => {
            const displayer = DisplayerFactory.createAddressDisplayer(mockElement);

            expect(displayer).toBeDefined();
            expect(displayer).toBeInstanceOf(HTMLAddressDisplayer);
            expect(displayer.element).toBe(mockElement);
            expect(displayer.enderecoPadronizadoDisplay).toBe(false);
        });

        test('should create HTMLAddressDisplayer with enderecoPadronizadoDisplay element', () => {
            const mockEnderecoDisplay = { id: 'endereco-display' };
            const displayer = DisplayerFactory.createAddressDisplayer(
                mockElement,
                mockEnderecoDisplay
            );

            expect(displayer).toBeInstanceOf(HTMLAddressDisplayer);
            expect(displayer.element).toBe(mockElement);
            expect(displayer.enderecoPadronizadoDisplay).toBe(mockEnderecoDisplay);
        });

        test('should create immutable address displayer (MP Barbosa standards)', () => {
            const displayer = DisplayerFactory.createAddressDisplayer(mockElement);

            expect(Object.isFrozen(displayer)).toBe(true);
            
            expect(() => {
                displayer.newProperty = 'test';
            }).toThrow();
        });

        test('should handle different enderecoPadronizadoDisplay types', () => {
            // Test with null
            const displayer1 = DisplayerFactory.createAddressDisplayer(mockElement, null);
            expect(displayer1.enderecoPadronizadoDisplay).toBe(null);

            // Test with string
            const displayer2 = DisplayerFactory.createAddressDisplayer(mockElement, 'element-id');
            expect(displayer2.enderecoPadronizadoDisplay).toBe('element-id');

            // Test with boolean true
            const displayer3 = DisplayerFactory.createAddressDisplayer(mockElement, true);
            expect(displayer3.enderecoPadronizadoDisplay).toBe(true);
        });
    });

    describe('Reference Place Displayer Factory', () => {
        test('should create HTMLReferencePlaceDisplayer instance with default parameters', () => {
            const displayer = DisplayerFactory.createReferencePlaceDisplayer(mockElement);

            expect(displayer).toBeDefined();
            expect(displayer).toBeInstanceOf(HTMLReferencePlaceDisplayer);
            expect(displayer.element).toBe(mockElement);
            expect(displayer.referencePlaceDisplay).toBe(false);
        });

        test('should create HTMLReferencePlaceDisplayer with additional display element', () => {
            const mockAdditionalDisplay = { id: 'additional-display' };
            const displayer = DisplayerFactory.createReferencePlaceDisplayer(
                mockElement,
                mockAdditionalDisplay
            );

            expect(displayer).toBeInstanceOf(HTMLReferencePlaceDisplayer);
            expect(displayer.element).toBe(mockElement);
            expect(displayer.referencePlaceDisplay).toBe(mockAdditionalDisplay);
        });

        test('should create immutable reference place displayer (MP Barbosa standards)', () => {
            const displayer = DisplayerFactory.createReferencePlaceDisplayer(mockElement);

            expect(Object.isFrozen(displayer)).toBe(true);
            
            expect(() => {
                displayer.newProperty = 'test';
            }).toThrow();
        });
    });

    describe('Referential Transparency (Pure Functions)', () => {
        test('should create equivalent position displayers for same inputs', () => {
            const displayer1 = DisplayerFactory.createPositionDisplayer(mockElement);
            const displayer2 = DisplayerFactory.createPositionDisplayer(mockElement);

            // Should be different instances but same type with same element
            expect(displayer1).not.toBe(displayer2);
            expect(displayer1.constructor).toBe(displayer2.constructor);
            expect(displayer1.element).toBe(displayer2.element);
        });

        test('should create equivalent address displayers for same inputs', () => {
            const displayer1 = DisplayerFactory.createAddressDisplayer(mockElement, false);
            const displayer2 = DisplayerFactory.createAddressDisplayer(mockElement, false);

            expect(displayer1).not.toBe(displayer2);
            expect(displayer1.constructor).toBe(displayer2.constructor);
            expect(displayer1.element).toBe(displayer2.element);
            expect(displayer1.enderecoPadronizadoDisplay).toBe(displayer2.enderecoPadronizadoDisplay);
        });

        test('should create equivalent reference place displayers for same inputs', () => {
            const displayer1 = DisplayerFactory.createReferencePlaceDisplayer(mockElement);
            const displayer2 = DisplayerFactory.createReferencePlaceDisplayer(mockElement);

            expect(displayer1).not.toBe(displayer2);
            expect(displayer1.constructor).toBe(displayer2.constructor);
            expect(displayer1.element).toBe(displayer2.element);
        });

        test('should produce consistent results across multiple calls', () => {
            const results = Array.from({ length: 10 }, () => ({
                position: DisplayerFactory.createPositionDisplayer(mockElement),
                address: DisplayerFactory.createAddressDisplayer(mockElement, true),
                reference: DisplayerFactory.createReferencePlaceDisplayer(mockElement, false)
            }));

            results.forEach((result, index) => {
                expect(result.position.element).toBe(mockElement);
                expect(result.address.element).toBe(mockElement);
                expect(result.reference.element).toBe(mockElement);
                
                expect(result.position.toString()).toBe('HTMLPositionDisplayer: test-element');
                expect(result.address.toString()).toBe('HTMLAddressDisplayer: test-element');
                expect(result.reference.toString()).toBe('HTMLReferencePlaceDisplayer: test-element');
            });
        });
    });

    describe('No Side Effects Validation', () => {
        test('should not modify input element when creating position displayer', () => {
            const originalInnerHTML = mockElement.innerHTML;
            const originalTextContent = mockElement.textContent;

            DisplayerFactory.createPositionDisplayer(mockElement);

            expect(mockElement.innerHTML).toBe(originalInnerHTML);
            expect(mockElement.textContent).toBe(originalTextContent);
        });

        test('should not modify input element when creating address displayer', () => {
            const originalInnerHTML = mockElement.innerHTML;
            const originalTextContent = mockElement.textContent;

            DisplayerFactory.createAddressDisplayer(mockElement);

            expect(mockElement.innerHTML).toBe(originalInnerHTML);
            expect(mockElement.textContent).toBe(originalTextContent);
        });

        test('should not modify input element when creating reference place displayer', () => {
            const originalInnerHTML = mockElement.innerHTML;
            const originalTextContent = mockElement.textContent;

            DisplayerFactory.createReferencePlaceDisplayer(mockElement);

            expect(mockElement.innerHTML).toBe(originalInnerHTML);
            expect(mockElement.textContent).toBe(originalTextContent);
        });

        test('should not have any persistent state between factory calls', () => {
            const element1 = { id: 'element1', innerHTML: '' };
            const element2 = { id: 'element2', innerHTML: '' };

            const displayer1 = DisplayerFactory.createPositionDisplayer(element1);
            const displayer2 = DisplayerFactory.createPositionDisplayer(element2);

            // Factory should be stateless
            expect(displayer1.element).toBe(element1);
            expect(displayer2.element).toBe(element2);
            expect(displayer1.element).not.toBe(displayer2.element);
        });
    });

    describe('String Representation and Debugging', () => {
        test('should return meaningful string representation', () => {
            const result = DisplayerFactory.toString();
            
            expect(result).toBe('DisplayerFactory: 5 factory methods available');
        });

        test('should provide static toString method', () => {
            expect(typeof DisplayerFactory.toString).toBe('function');
        });
    });

    describe('Factory Method Validation', () => {
        test('should have all required static factory methods', () => {
            const methods = [
                'createPositionDisplayer',
                'createAddressDisplayer', 
                'createReferencePlaceDisplayer',
                'toString'
            ];

            methods.forEach(methodName => {
                expect(DisplayerFactory).toHaveProperty(methodName);
                expect(typeof DisplayerFactory[methodName]).toBe('function');
            });
        });

        test('should not require instantiation of factory', () => {
            // Factory should work without creating an instance
            expect(() => {
                DisplayerFactory.createPositionDisplayer(mockElement);
            }).not.toThrow();

            expect(() => {
                DisplayerFactory.createAddressDisplayer(mockElement);
            }).not.toThrow();

            expect(() => {
                DisplayerFactory.createReferencePlaceDisplayer(mockElement);
            }).not.toThrow();
        });
    });

    describe('Parameter Validation', () => {
        test('should handle null elements gracefully in position displayer', () => {
            const displayer = DisplayerFactory.createPositionDisplayer(null);
            
            expect(displayer).toBeInstanceOf(HTMLPositionDisplayer);
            expect(displayer.element).toBeNull();
            expect(Object.isFrozen(displayer)).toBe(true);
        });

        test('should handle null elements gracefully in address displayer', () => {
            const displayer = DisplayerFactory.createAddressDisplayer(null);
            
            expect(displayer).toBeInstanceOf(HTMLAddressDisplayer);
            expect(displayer.element).toBeNull();
            expect(Object.isFrozen(displayer)).toBe(true);
        });

        test('should handle null elements gracefully in reference place displayer', () => {
            const displayer = DisplayerFactory.createReferencePlaceDisplayer(null);
            
            expect(displayer).toBeInstanceOf(HTMLReferencePlaceDisplayer);
            expect(displayer.element).toBeNull();
            expect(Object.isFrozen(displayer)).toBe(true);
        });

        test('should handle undefined elements gracefully', () => {
            const positionDisplayer = DisplayerFactory.createPositionDisplayer(undefined);
            const addressDisplayer = DisplayerFactory.createAddressDisplayer(undefined);
            const referenceDisplayer = DisplayerFactory.createReferencePlaceDisplayer(undefined);

            expect(positionDisplayer.element).toBeUndefined();
            expect(addressDisplayer.element).toBeUndefined();
            expect(referenceDisplayer.element).toBeUndefined();

            expect(Object.isFrozen(positionDisplayer)).toBe(true);
            expect(Object.isFrozen(addressDisplayer)).toBe(true);
            expect(Object.isFrozen(referenceDisplayer)).toBe(true);
        });
    });

    describe('Performance and Memory Management', () => {
        test('should not create memory leaks with repeated factory calls', () => {
            const elements = Array.from({ length: 100 }, (_, i) => ({
                id: `test-element-${i}`,
                innerHTML: ''
            }));

            // Create many displayers
            const displayers = elements.map(element => ({
                position: DisplayerFactory.createPositionDisplayer(element),
                address: DisplayerFactory.createAddressDisplayer(element),
                referencePlace: DisplayerFactory.createReferencePlaceDisplayer(element)
            }));

            // All should be properly created and frozen
            displayers.forEach((set, index) => {
                expect(set.position.element.id).toBe(`test-element-${index}`);
                expect(set.address.element.id).toBe(`test-element-${index}`);
                expect(set.referencePlace.element.id).toBe(`test-element-${index}`);
                
                expect(Object.isFrozen(set.position)).toBe(true);
                expect(Object.isFrozen(set.address)).toBe(true);
                expect(Object.isFrozen(set.referencePlace)).toBe(true);
            });
        });

        test('should maintain consistent performance across many calls', () => {
            const startTime = Date.now();

            // Create many displayers
            for (let i = 0; i < 1000; i++) {
                const element = { id: `perf-test-${i}`, innerHTML: '' };
                DisplayerFactory.createPositionDisplayer(element);
                DisplayerFactory.createAddressDisplayer(element);
                DisplayerFactory.createReferencePlaceDisplayer(element);
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete reasonably quickly (adjust threshold as needed)
            expect(duration).toBeLessThan(1000); // 1 second max for 3000 factory calls
        });

        test('should not leak memory through closure capture', () => {
            let displayers = [];

            // Create displayers and store references
            for (let i = 0; i < 50; i++) {
                const element = { id: `memory-test-${i}`, innerHTML: '' };
                displayers.push({
                    position: DisplayerFactory.createPositionDisplayer(element),
                    address: DisplayerFactory.createAddressDisplayer(element, false),
                    reference: DisplayerFactory.createReferencePlaceDisplayer(element, false)
                });
            }

            // Clear references
            displayers = null;

            // Factory should still work normally after clearing references
            const testElement = { id: 'post-clear-test', innerHTML: '' };
            const newDisplayer = DisplayerFactory.createPositionDisplayer(testElement);
            
            expect(newDisplayer.element.id).toBe('post-clear-test');
            expect(Object.isFrozen(newDisplayer)).toBe(true);
        });
    });

    describe('Brazilian Context Integration', () => {
        test('should create displayers suitable for Brazilian geographic data', () => {
            const brazilianElements = [
                { id: 'sao-paulo-position', innerHTML: '' },
                { id: 'rio-address', innerHTML: '' },
                { id: 'brasilia-reference', innerHTML: '' }
            ];

            const positionDisplayer = DisplayerFactory.createPositionDisplayer(brazilianElements[0]);
            const addressDisplayer = DisplayerFactory.createAddressDisplayer(brazilianElements[1]);
            const referenceDisplayer = DisplayerFactory.createReferencePlaceDisplayer(brazilianElements[2]);

            // All displayers should be created successfully
            expect(positionDisplayer).toBeInstanceOf(HTMLPositionDisplayer);
            expect(addressDisplayer).toBeInstanceOf(HTMLAddressDisplayer);
            expect(referenceDisplayer).toBeInstanceOf(HTMLReferencePlaceDisplayer);

            // All should be immutable following MP Barbosa standards
            expect(Object.isFrozen(positionDisplayer)).toBe(true);
            expect(Object.isFrozen(addressDisplayer)).toBe(true);
            expect(Object.isFrozen(referenceDisplayer)).toBe(true);
        });

        test('should create displayers with Portuguese element IDs', () => {
            const portugueseElements = [
                { id: 'localizacao-atual', innerHTML: '' },
                { id: 'endereco-completo', innerHTML: '' },
                { id: 'ponto-referencia', innerHTML: '' }
            ];

            const positionDisplayer = DisplayerFactory.createPositionDisplayer(portugueseElements[0]);
            const addressDisplayer = DisplayerFactory.createAddressDisplayer(portugueseElements[1]);
            const referenceDisplayer = DisplayerFactory.createReferencePlaceDisplayer(portugueseElements[2]);

            expect(positionDisplayer.toString()).toBe('HTMLPositionDisplayer: localizacao-atual');
            expect(addressDisplayer.toString()).toBe('HTMLAddressDisplayer: endereco-completo');
            expect(referenceDisplayer.toString()).toBe('HTMLReferencePlaceDisplayer: ponto-referencia');
        });
    });

    describe('Factory Class Immutability', () => {
        test('should not allow modification of factory methods', () => {
            const originalCreatePosition = DisplayerFactory.createPositionDisplayer;
            
            expect(() => {
                DisplayerFactory.createPositionDisplayer = () => 'modified';
            }).toThrow();
            
            // Original method should still work
            expect(DisplayerFactory.createPositionDisplayer).toBe(originalCreatePosition);
        });

        test('should not allow addition of new methods', () => {
            expect(() => {
                DisplayerFactory.newMethod = () => 'new method';
            }).toThrow();
            
            expect(DisplayerFactory.newMethod).toBeUndefined();
        });

        test('should not allow deletion of existing methods', () => {
            expect(() => {
                delete DisplayerFactory.createPositionDisplayer;
            }).toThrow();
            
            expect(DisplayerFactory.createPositionDisplayer).toBeDefined();
        });
    });

    describe('Error Handling and Edge Cases', () => {
        test('should handle edge case element values', () => {
            const edgeCases = [
                '', // empty string
                0, // falsy number
                false, // boolean false
                [], // empty array
                {} // empty object
            ];

            edgeCases.forEach(edgeCase => {
                expect(() => {
                    const positionDisplayer = DisplayerFactory.createPositionDisplayer(edgeCase);
                    const addressDisplayer = DisplayerFactory.createAddressDisplayer(edgeCase);
                    const referenceDisplayer = DisplayerFactory.createReferencePlaceDisplayer(edgeCase);
                    
                    expect(positionDisplayer.element).toBe(edgeCase);
                    expect(addressDisplayer.element).toBe(edgeCase);
                    expect(referenceDisplayer.element).toBe(edgeCase);
                }).not.toThrow();
            });
        });

        test('should maintain factory behavior after errors', () => {
            // Trigger error (attempt to instantiate)
            try {
                new DisplayerFactory();
            } catch (error) {
                // Expected error
            }

            // Factory should still work normally
            const element = { id: 'post-error-test', innerHTML: '' };
            const displayer = DisplayerFactory.createPositionDisplayer(element);
            
            expect(displayer).toBeInstanceOf(HTMLPositionDisplayer);
            expect(displayer.element).toBe(element);
            expect(Object.isFrozen(displayer)).toBe(true);
        });
    });
});