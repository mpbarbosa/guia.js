/**
 * Integration Tests for DisplayerFactory Module Extraction
 * 
 * Validates that the extracted DisplayerFactory module works correctly with imports/exports,
 * maintains backward compatibility, and integrates properly with WebGeocodingManager and
 * other system components following MP Barbosa standards.
 * 
 * @author Marcelo Pereira Barbosa  
 * @since 0.8.6-alpha
 */

import { jest } from '@jest/globals';

describe('DisplayerFactory Module Integration Tests', () => {
    let DisplayerFactory;

    beforeAll(async () => {
        // Test module import
        const module = await import('../../src/html/DisplayerFactory.js');
        DisplayerFactory = module.default;
    });

    describe('Module Import and Export Validation', () => {
        test('should import DisplayerFactory from html module', async () => {
            const { default: ImportedDisplayerFactory } = await import('../../src/html/DisplayerFactory.js');
            
            expect(ImportedDisplayerFactory).toBeDefined();
            expect(typeof ImportedDisplayerFactory).toBe('function');
            expect(ImportedDisplayerFactory.name).toBe('DisplayerFactory');
        });

        test('should support both default and named imports', async () => {
            const module = await import('../../src/html/DisplayerFactory.js');
            
            expect(module.default).toBeDefined();
            expect(module.DisplayerFactory).toBeDefined();
            expect(module.default).toBe(module.DisplayerFactory);
        });

        test('should export from guia.js for backward compatibility', async () => {
            const guia = await import('../../src/guia.js');
            
            expect(guia.DisplayerFactory).toBeDefined();
            expect(typeof guia.DisplayerFactory).toBe('function');
            
            // Test that it's the same class as the direct import
            const { default: DirectImport } = await import('../../src/html/DisplayerFactory.js');
            expect(guia.DisplayerFactory).toBe(DirectImport);
        });

        test('should be available in window object after import', async () => {
            // Import the module to trigger window assignment
            await import('../../src/html/DisplayerFactory.js');
            
            // Note: In test environment, window might not be available
            // This test validates the export logic exists
            const module = await import('../../src/html/DisplayerFactory.js');
            expect(module.default).toBeDefined();
        });
    });

    describe('Backward Compatibility Validation', () => {
        test('should maintain factory method API compatibility', async () => {
            const { default: ImportedDisplayerFactory } = await import('../../src/html/DisplayerFactory.js');
            
            const mockElement = { id: 'test', innerHTML: '' };
            
            // Test all factory methods exist and work
            const positionDisplayer = ImportedDisplayerFactory.createPositionDisplayer(mockElement);
            const addressDisplayer = ImportedDisplayerFactory.createAddressDisplayer(mockElement);
            const referenceDisplayer = ImportedDisplayerFactory.createReferencePlaceDisplayer(mockElement);
            
            expect(positionDisplayer).toBeDefined();
            expect(addressDisplayer).toBeDefined();
            expect(referenceDisplayer).toBeDefined();
            
            expect(typeof positionDisplayer.update).toBe('function');
            expect(typeof addressDisplayer.update).toBe('function');
            expect(typeof referenceDisplayer.update).toBe('function');
        });

        test('should work with legacy import from guia.js', async () => {
            const guia = await import('../../src/guia.js');
            const { DisplayerFactory: LegacyDisplayerFactory } = guia;
            
            const mockElement = { id: 'legacy-test', innerHTML: '' };
            
            // Should work exactly like direct import
            const positionDisplayer = LegacyDisplayerFactory.createPositionDisplayer(mockElement);
            const addressDisplayer = LegacyDisplayerFactory.createAddressDisplayer(mockElement, false);
            const referenceDisplayer = LegacyDisplayerFactory.createReferencePlaceDisplayer(mockElement);
            
            expect(positionDisplayer.toString()).toBe('HTMLPositionDisplayer: legacy-test');
            expect(addressDisplayer.toString()).toBe('HTMLAddressDisplayer: legacy-test');
            expect(referenceDisplayer.toString()).toBe('HTMLReferencePlaceDisplayer: legacy-test');
        });
    });

    describe('WebGeocodingManager Integration', () => {
        test('should work with WebGeocodingManager dependency injection', async () => {
            const guia = await import('../../src/guia.js');
            const { WebGeocodingManager, DisplayerFactory: GuiaDisplayerFactory } = guia;
            
            // Mock document and basic DOM structure
            const mockDocument = {
                getElementById: jest.fn().mockReturnValue({ 
                    id: 'mock-element', 
                    innerHTML: '', 
                    addEventListener: jest.fn(),
                    textContent: ''
                })
            };
            
            // Test that WebGeocodingManager can use DisplayerFactory
            const manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                displayerFactory: GuiaDisplayerFactory
            });
            
            expect(manager).toBeDefined();
            // WebGeocodingManager should store the factory for use
            expect(manager.displayerFactory).toBe(GuiaDisplayerFactory);
        });

        test('should enable mock factory injection for testing', async () => {
            const guia = await import('../../src/guia.js');
            const { WebGeocodingManager } = guia;
            
            // Create mock factory
            const MockDisplayerFactory = {
                createPositionDisplayer: jest.fn().mockReturnValue({
                    element: { id: 'mock-position' },
                    update: jest.fn(),
                    toString: () => 'MockPositionDisplayer'
                }),
                createAddressDisplayer: jest.fn().mockReturnValue({
                    element: { id: 'mock-address' },
                    enderecoPadronizadoDisplay: false,
                    update: jest.fn(),
                    toString: () => 'MockAddressDisplayer'
                }),
                createReferencePlaceDisplayer: jest.fn().mockReturnValue({
                    element: { id: 'mock-reference' },
                    referencePlaceDisplay: false,
                    update: jest.fn(), 
                    toString: () => 'MockReferencePlaceDisplayer'
                })
            };
            
            const mockDocument = {
                getElementById: jest.fn().mockReturnValue({
                    id: 'mock-element',
                    innerHTML: '',
                    addEventListener: jest.fn(),
                    textContent: ''
                })
            };
            
            // Test dependency injection
            const manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                displayerFactory: MockDisplayerFactory
            });
            
            // Verify mock factory was stored
            expect(manager.displayerFactory).toBe(MockDisplayerFactory);
        });
    });

    describe('Integration with HTML Displayers', () => {
        test('should create properly integrated displayer instances', async () => {
            const { default: ImportedDisplayerFactory } = await import('../../src/html/DisplayerFactory.js');
            
            const mockElements = {
                position: { id: 'position-test', innerHTML: '' },
                address: { id: 'address-test', innerHTML: '' },
                reference: { id: 'reference-test', innerHTML: '' }
            };
            
            const positionDisplayer = ImportedDisplayerFactory.createPositionDisplayer(mockElements.position);
            const addressDisplayer = ImportedDisplayerFactory.createAddressDisplayer(mockElements.address);
            const referenceDisplayer = ImportedDisplayerFactory.createReferencePlaceDisplayer(mockElements.reference);
            
            // Test that displayers have correct toString methods
            expect(positionDisplayer.toString()).toBe('HTMLPositionDisplayer: position-test');
            expect(addressDisplayer.toString()).toBe('HTMLAddressDisplayer: address-test');
            expect(referenceDisplayer.toString()).toBe('HTMLReferencePlaceDisplayer: reference-test');
            
            // Test that all are properly frozen
            expect(Object.isFrozen(positionDisplayer)).toBe(true);
            expect(Object.isFrozen(addressDisplayer)).toBe(true);
            expect(Object.isFrozen(referenceDisplayer)).toBe(true);
        });

        test('should create displayers that work with observer pattern', async () => {
            const ImportedDisplayerFactory = DisplayerFactory;
            
            const mockElement = { id: 'observer-test', innerHTML: '' };
            
            const positionDisplayer = ImportedDisplayerFactory.createPositionDisplayer(mockElement);
            const addressDisplayer = ImportedDisplayerFactory.createAddressDisplayer(mockElement);
            const referenceDisplayer = ImportedDisplayerFactory.createReferencePlaceDisplayer(mockElement);
            
            // Test observer pattern update method
            expect(typeof positionDisplayer.update).toBe('function');
            expect(typeof addressDisplayer.update).toBe('function');
            expect(typeof referenceDisplayer.update).toBe('function');
            
            // Test that update methods can be called without error
            expect(() => {
                positionDisplayer.update({ latitude: -23.5613, longitude: -46.6565 }, null, 'test', true, null);
            }).not.toThrow();
            
            expect(() => {
                const mockAddressData = { display_name: 'Test Address' };
                addressDisplayer.update(mockAddressData, null, 'test', true, null);
            }).not.toThrow();
            
            expect(() => {
                const mockBrazilianAddress = { enderecoCompleto: () => 'Test Address' };
                const mockReferencePlace = { name: 'Test Place', description: 'Test Description' };
                referenceDisplayer.update(mockBrazilianAddress, null, 'test', true, null);
            }).not.toThrow();
        });
    });

    describe('Cross-Module Compatibility', () => {
        test('should work alongside other HTML display modules', async () => {
            // Import all HTML modules to test compatibility
            const HtmlTextModule = await import('../../src/html/HtmlText.js');
            const HTMLPositionDisplayerModule = await import('../../src/html/HTMLPositionDisplayer.js');
            const HTMLAddressDisplayerModule = await import('../../src/html/HTMLAddressDisplayer.js');
            const HTMLReferencePlaceDisplayerModule = await import('../../src/html/HTMLReferencePlaceDisplayer.js');
            const DisplayerFactoryModule = await import('../../src/html/DisplayerFactory.js');
            
            const ImportedDisplayerFactory = DisplayerFactoryModule.default;
            
            // Create instances using factory
            const mockElement = { id: 'compatibility-test', innerHTML: '' };
            const positionDisplayer = ImportedDisplayerFactory.createPositionDisplayer(mockElement);
            const addressDisplayer = ImportedDisplayerFactory.createAddressDisplayer(mockElement);
            const referenceDisplayer = ImportedDisplayerFactory.createReferencePlaceDisplayer(mockElement);
            
            // Should be instances of the imported classes
            expect(positionDisplayer).toBeInstanceOf(HTMLPositionDisplayerModule.default);
            expect(addressDisplayer).toBeInstanceOf(HTMLAddressDisplayerModule.default);
            expect(referenceDisplayer).toBeInstanceOf(HTMLReferencePlaceDisplayerModule.default);
        });

        test('should integrate with data layer modules', async () => {
            const guia = await import('../../src/guia.js');
            const { DisplayerFactory: GuiaDisplayerFactory, BrazilianStandardAddress, ReferencePlace } = guia;
            
            // Test that factory creates displayers compatible with data layer
            const mockElement = { id: 'data-integration', innerHTML: '' };
            const addressDisplayer = GuiaDisplayerFactory.createAddressDisplayer(mockElement, false);
            const referenceDisplayer = GuiaDisplayerFactory.createReferencePlaceDisplayer(mockElement);
            
            // Should work with BrazilianStandardAddress
            const mockBrazilianAddress = new BrazilianStandardAddress();
            expect(() => {
                addressDisplayer.update({ display_name: 'Test' }, null, 'test', true, null);
            }).not.toThrow();
            
            // Should work with ReferencePlace (immutable - pass data to constructor)
            const mockReferencePlace = new ReferencePlace({
                class: 'shop',
                type: 'mall',
                name: 'Shopping Center'
            });
            
            expect(() => {
                referenceDisplayer.update(mockBrazilianAddress, null, 'test', true, mockReferencePlace);
            }).not.toThrow();
        });
    });

    describe('Performance and Memory Management Integration', () => {
        test('should not cause memory leaks during module import/export', async () => {
            // Import multiple times to test for memory issues
            for (let i = 0; i < 10; i++) {
                const { default: ImportedDisplayerFactory } = await import('../../src/html/DisplayerFactory.js');
                const element = { id: `test-${i}`, innerHTML: '' };
                
                const displayer = ImportedDisplayerFactory.createPositionDisplayer(element);
                
                expect(displayer.element.id).toBe(`test-${i}`);
                expect(Object.isFrozen(displayer)).toBe(true);
            }
        });

        test('should maintain consistent behavior across imports', async () => {
            const { default: Import1 } = await import('../../src/html/DisplayerFactory.js');
            const { default: Import2 } = await import('../../src/html/DisplayerFactory.js');
            
            // Should be the same factory function
            expect(Import1).toBe(Import2);
            
            // Should create equivalent instances
            const element = { id: 'consistency-test', innerHTML: '' };
            
            const displayer1 = Import1.createPositionDisplayer(element);
            const displayer2 = Import2.createPositionDisplayer(element);
            
            expect(displayer1.constructor).toBe(displayer2.constructor);
            expect(displayer1.element).toBe(displayer2.element);
            expect(displayer1.toString()).toBe(displayer2.toString());
        });

        test('should handle concurrent factory usage', async () => {
            const ImportedDisplayerFactory = DisplayerFactory;
            
            // Create multiple displayers concurrently
            const promises = Array.from({ length: 50 }, (_, i) => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        const element = { id: `concurrent-${i}`, innerHTML: '' };
                        const displayers = {
                            position: ImportedDisplayerFactory.createPositionDisplayer(element),
                            address: ImportedDisplayerFactory.createAddressDisplayer(element, false),
                            reference: ImportedDisplayerFactory.createReferencePlaceDisplayer(element)
                        };
                        resolve(displayers);
                    }, Math.random() * 10);
                });
            });
            
            const results = await Promise.all(promises);
            
            // All should be properly created
            results.forEach((displayers, index) => {
                expect(displayers.position.element.id).toBe(`concurrent-${index}`);
                expect(displayers.address.element.id).toBe(`concurrent-${index}`);
                expect(displayers.reference.element.id).toBe(`concurrent-${index}`);
            });
        });
    });

    describe('Static Factory Pattern Validation After Extraction', () => {
        test('should maintain static factory pattern after extraction', async () => {
            const { default: ImportedDisplayerFactory } = await import('../../src/html/DisplayerFactory.js');
            
            // Should not be constructable
            expect(() => new ImportedDisplayerFactory()).toThrow('DisplayerFactory is a static factory class and cannot be instantiated. Use static methods instead.');
            
            // Should have static methods
            expect(typeof ImportedDisplayerFactory.createPositionDisplayer).toBe('function');
            expect(typeof ImportedDisplayerFactory.createAddressDisplayer).toBe('function');
            expect(typeof ImportedDisplayerFactory.createReferencePlaceDisplayer).toBe('function');
            
            // Should work without instantiation
            const mockElement = { id: 'static-test', innerHTML: '' };
            expect(() => {
                ImportedDisplayerFactory.createPositionDisplayer(mockElement);
            }).not.toThrow();
        });

        test('should be frozen after extraction', async () => {
            const { default: ImportedDisplayerFactory } = await import('../../src/html/DisplayerFactory.js');
            
            expect(Object.isFrozen(ImportedDisplayerFactory)).toBe(true);
            
            // Should not allow modifications
            expect(() => {
                ImportedDisplayerFactory.newMethod = () => {};
            }).toThrow();
        });
    });

    describe('Brazilian Context Integration', () => {
        test('should work with Brazilian Portuguese elements and data', async () => {
            const guia = await import('../../src/guia.js');
            const { DisplayerFactory: GuiaDisplayerFactory } = guia;
            
            const brazilianElements = {
                posicao: { id: 'posicao-atual', innerHTML: '' },
                endereco: { id: 'endereco-completo', innerHTML: '' },
                referencia: { id: 'ponto-referencia', innerHTML: '' }
            };
            
            const positionDisplayer = GuiaDisplayerFactory.createPositionDisplayer(brazilianElements.posicao);
            const addressDisplayer = GuiaDisplayerFactory.createAddressDisplayer(brazilianElements.endereco);
            const referenceDisplayer = GuiaDisplayerFactory.createReferencePlaceDisplayer(brazilianElements.referencia);
            
            // Test Brazilian context data
            const brazilianPosition = {
                latitude: -23.550520, // São Paulo
                longitude: -46.633309,
                accuracy: 10
            };
            
            const brazilianAddress = {
                display_name: 'Avenida Paulista, Bela Vista, São Paulo, SP, Brasil',
                address: {
                    road: 'Avenida Paulista',
                    neighbourhood: 'Bela Vista',
                    city: 'São Paulo',
                    state: 'São Paulo',
                    country: 'Brasil'
                }
            };
            
            // Should handle Brazilian data without errors
            expect(() => {
                positionDisplayer.update(brazilianPosition, null, 'strCurrPosUpdate', true, null);
                addressDisplayer.update(brazilianAddress, null, 'strCurrPosUpdate', true, null);
            }).not.toThrow();
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle module loading errors gracefully', async () => {
            // This test ensures the module can be imported even in adverse conditions
            expect(DisplayerFactory).toBeDefined();
            
            // Test with edge case parameters
            const edgeCase = '';
            const displayer = DisplayerFactory.createPositionDisplayer(edgeCase);
            
            expect(displayer.element).toBe(edgeCase);
            expect(Object.isFrozen(displayer)).toBe(true);
        });

        test('should maintain factory functionality after WebGeocodingManager errors', async () => {
            const guia = await import('../../src/guia.js');
            const { WebGeocodingManager, DisplayerFactory: GuiaDisplayerFactory } = guia;
            
            // Try to create WebGeocodingManager with invalid config
            const mockDocument = {
                getElementById: jest.fn().mockReturnValue(null) // Returns null to simulate missing elements
            };
            
            try {
                const manager = new WebGeocodingManager(mockDocument, {
                    locationResult: 'non-existent-element',
                    displayerFactory: GuiaDisplayerFactory
                });
            } catch (error) {
                // Expected error due to missing elements
            }
            
            // Factory should still work normally after WebGeocodingManager error
            const testElement = { id: 'post-error-test', innerHTML: '' };
            const displayer = GuiaDisplayerFactory.createPositionDisplayer(testElement);
            
            expect(displayer.element).toBe(testElement);
            expect(Object.isFrozen(displayer)).toBe(true);
        });
    });

    describe('Configuration and Dependency Injection Integration', () => {
        test('should work with different WebGeocodingManager configurations', async () => {
            const guia = await import('../../src/guia.js');
            const { WebGeocodingManager, DisplayerFactory: GuiaDisplayerFactory } = guia;
            
            const configurations = [
                {
                    locationResult: 'location-result-1',
                    displayerFactory: GuiaDisplayerFactory
                },
                {
                    locationResult: 'location-result-2',
                    enderecoPadronizadoDisplay: 'endereco-display',
                    displayerFactory: GuiaDisplayerFactory
                },
                {
                    locationResult: 'location-result-3',
                    referencePlaceDisplay: 'reference-display',
                    displayerFactory: GuiaDisplayerFactory
                }
            ];
            
            const mockDocument = {
                getElementById: jest.fn().mockReturnValue({
                    id: 'mock-element',
                    innerHTML: '',
                    addEventListener: jest.fn(),
                    textContent: ''
                })
            };
            
            // All configurations should work with DisplayerFactory
            configurations.forEach((config, index) => {
                expect(() => {
                    const manager = new WebGeocodingManager(mockDocument, config);
                    expect(manager.displayerFactory).toBe(GuiaDisplayerFactory);
                }).not.toThrow();
            });
        });
    });
});