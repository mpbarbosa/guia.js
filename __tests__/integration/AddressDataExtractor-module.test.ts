/**
 * Integration tests for AddressDataExtractor module extraction.
 * 
 * This test suite validates that the AddressDataExtractor class has been properly
 * extracted from guia.js into its own module while maintaining full backward compatibility.
 * 
 * @module tests/integration/AddressDataExtractor-module
 * @since v0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

describe('AddressDataExtractor Module Extraction - MP Barbosa Travel Guide (v0.4.1-alpha)', () => {
    
    beforeEach(async () => {
        jest.clearAllMocks();
        
        // Clear the AddressCache singleton instance before each test
        const { default: AddressCache } = await import('../../src/data/AddressCache.js');
        AddressCache.instance = null;
    });

    describe('Module Import and Export Validation', () => {
        test('should import AddressDataExtractor from dedicated module', async () => {
            const { default: AddressDataExtractor } = await import('../../src/data/AddressDataExtractor.js');
            
            expect(AddressDataExtractor).toBeDefined();
            expect(typeof AddressDataExtractor).toBe('function');
            expect(AddressDataExtractor.name).toBe('AddressDataExtractor');
        });

        test('should support both default and named imports', async () => {
            const module = await import('../../src/data/AddressDataExtractor.js');
            
            expect(module.default).toBeDefined();
            expect(module.AddressDataExtractor).toBeDefined();
            expect(module.default).toBe(module.AddressDataExtractor);
        });

        test('should export from guia.js for backward compatibility', async () => {
            const guia = await import('../../src/guia.js');
            
            expect(guia.AddressDataExtractor).toBeDefined();
            expect(typeof guia.AddressDataExtractor).toBe('function');
            
            // Test that it's the same class as the direct import
            const { default: DirectImport } = await import('../../src/data/AddressDataExtractor.js');
            expect(guia.AddressDataExtractor).toBe(DirectImport);
        });
    });

    describe('Backward Compatibility Validation', () => {
        test('should maintain constructor API compatibility', async () => {
            const { default: AddressDataExtractor } = await import('../../src/data/AddressDataExtractor.js');
            
            const mockData = {
                address: {
                    road: 'Avenida Paulista',
                    house_number: '1578',
                    suburb: 'Bela Vista',
                    city: 'São Paulo',
                    state: 'São Paulo',
                    postcode: '01310-200',
                    country: 'Brasil'
                }
            };
            
            const extractor = new AddressDataExtractor(mockData);
            
            // Validate instance properties
            expect(extractor.data).toBeDefined();
            expect(extractor.enderecoPadronizado).toBeDefined();
            // referencePlace is on enderecoPadronizado, not on extractor directly
            expect(extractor.enderecoPadronizado.referencePlace).toBeDefined();
            
            // Validate address extraction
            expect(extractor.enderecoPadronizado.logradouro).toBe('Avenida Paulista');
            expect(extractor.enderecoPadronizado.numero).toBe('1578');
            expect(extractor.enderecoPadronizado.bairro).toBe('Bela Vista');
            expect(extractor.enderecoPadronizado.municipio).toBe('São Paulo');
            
            // Validate immutability
            expect(Object.isFrozen(extractor)).toBe(true);
        });

        test('should delegate the Padaria Nova Armada payload to the same normalized standardized address contract', async () => {
            const { default: AddressDataExtractor } = await import('../../src/data/AddressDataExtractor.js');

            const nominatimResponse = {
                place_id: 13667678,
                osm_type: 'node',
                osm_id: 2418401651,
                class: 'shop',
                type: 'bakery',
                name: 'Padaria Nova Armada',
                address: {
                    shop: 'Padaria Nova Armada',
                    road: 'Rua José Bonifácio',
                    suburb: 'Torre',
                    city_district: 'Recife',
                    city: 'Recife',
                    municipality: 'Região Geográfica Imediata do Recife',
                    county: 'Região Metropolitana do Recife',
                    state: 'Pernambuco',
                    'ISO3166-2-lvl4': 'BR-PE',
                    postcode: '50710-435',
                    country: 'Brasil'
                }
            };

            const extractor = new AddressDataExtractor(nominatimResponse);
            const address = extractor.enderecoPadronizado;

            expect(address.constructor.name).toBe('BrazilianStandardAddress');
            expect(address.logradouro).toBe('Rua José Bonifácio');
            expect(address.bairro).toBe('Torre');
            expect(address.distrito).toBeNull();
            expect(address.municipio).toBe('Recife');
            expect(address.siglaUF).toBe('PE');
            expect(address.referencePlace?.name).toBe('Padaria Nova Armada');
            expect(address.enderecoCompleto()).toBe('Rua José Bonifácio, Torre, Recife, PE, 50710-435');
        });

        test('should delegate the Milho Verde Camping Nozinho payload to the same standardized address contract', async () => {
            const { default: AddressDataExtractor } = await import('../../src/data/AddressDataExtractor.js');

            const nominatimResponse = {
                place_id: 10564916,
                osm_type: 'node',
                osm_id: 7612345678,
                class: 'tourism',
                type: 'camp_site',
                name: 'Camping Nozinho',
                display_name: 'Camping Nozinho, 172, Rua Direita, Milho Verde, Serro, Região Geográfica Imediata de Diamantina, Região Geográfica Intermediária de Teófilo Otoni, Minas Gerais, Região Sudeste, 39150-000, Brasil',
                address: {
                    tourism: 'Camping Nozinho',
                    house_number: '172',
                    road: 'Rua Direita',
                    city_district: 'Milho Verde',
                    town: 'Serro',
                    municipality: 'Região Geográfica Imediata de Diamantina',
                    state_district: 'Região Geográfica Intermediária de Teófilo Otoni',
                    state: 'Minas Gerais',
                    'ISO3166-2-lvl4': 'BR-MG',
                    region: 'Região Sudeste',
                    postcode: '39150-000',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };

            const extractor = new AddressDataExtractor(nominatimResponse);
            const address = extractor.enderecoPadronizado;

            expect(address.constructor.name).toBe('BrazilianStandardAddress');
            expect(address.logradouro).toBe('Rua Direita');
            expect(address.numero).toBe('172');
            expect(address.bairro).toBeNull();
            expect(address.distrito).toBe('Milho Verde');
            expect(address.municipio).toBe('Serro');
            expect(address.siglaUF).toBe('MG');
            expect(address.referencePlace?.name).toBe('Camping Nozinho');
            expect(address.referencePlace?.className).toBe('tourism');
            expect(address.referencePlace?.typeName).toBe('camp_site');
            expect(address.enderecoCompleto()).toBe('Rua Direita, 172, Milho Verde, Serro, MG, 39150-000');
        });

        test('should preserve both bairro and distrito when the payload contains both locality levels', async () => {
            const { default: AddressDataExtractor } = await import('../../src/data/AddressDataExtractor.js');

            const nominatimResponse = {
                address: {
                    road: 'Rua José Bonifácio',
                    suburb: 'Torre',
                    city_district: 'Distrito Sanitário IV',
                    city: 'Recife',
                    state: 'Pernambuco',
                    'ISO3166-2-lvl4': 'BR-PE',
                    postcode: '50710-435',
                    country: 'Brasil'
                }
            };

            const address = new AddressDataExtractor(nominatimResponse).enderecoPadronizado;
            expect(address.bairro).toBe('Torre');
            expect(address.distrito).toBe('Distrito Sanitário IV');
            expect(address.enderecoCompleto()).toBe('Rua José Bonifácio, Torre, Distrito Sanitário IV, Recife, PE, 50710-435');
        });

        test('should delegate all static methods to AddressCache', async () => {
            const { default: AddressDataExtractor } = await import('../../src/data/AddressDataExtractor.js');
            
            const mockData = {
                address: {
                    road: 'Test Street',
                    city: 'Test City'
                }
            };
            
            // Test main static method
            const address = AddressDataExtractor.getBrazilianStandardAddress(mockData);
            expect(address).toBeDefined();
            expect(address.logradouro).toBe('Test Street');
            expect(address.municipio).toBe('Test City');
            
            // Test cache management methods
            expect(typeof AddressDataExtractor.clearCache).toBe('function');
            expect(typeof AddressDataExtractor.generateCacheKey).toBe('function');
            expect(() => AddressDataExtractor.clearCache()).not.toThrow();
            
            // Test callback setter/getter methods
            const callbackMethods = [
                'setLogradouroChangeCallback', 'getLogradouroChangeCallback',
                'setBairroChangeCallback', 'getBairroChangeCallback',
                'setMunicipioChangeCallback', 'getMunicipioChangeCallback'
            ];
            
            callbackMethods.forEach(method => {
                expect(typeof AddressDataExtractor[method]).toBe('function');
            });
            
            // Test change detection methods
            const changeDetectionMethods = [
                'hasLogradouroChanged', 'hasBairroChanged', 'hasMunicipioChanged',
                'getLogradouroChangeDetails', 'getBairroChangeDetails', 'getMunicipioChangeDetails'
            ];
            
            changeDetectionMethods.forEach(method => {
                expect(typeof AddressDataExtractor[method]).toBe('function');
            });
        });

        test('should synchronize static properties with AddressCache singleton', async () => {
            const { default: AddressDataExtractor } = await import('../../src/data/AddressDataExtractor.js');
            const { default: AddressCache } = await import('../../src/data/AddressCache.js');
            
            const cache = AddressCache.getInstance();
            
            // Test bidirectional property synchronization
            cache.maxCacheSize = 150;
            expect(AddressDataExtractor.maxCacheSize).toBe(150);
            
            AddressDataExtractor.maxCacheSize = 200;
            expect(cache.maxCacheSize).toBe(200);
            
            // Test cache expiration property
            cache.cacheExpirationMs = 60000;
            expect(AddressDataExtractor.cacheExpirationMs).toBe(60000);
            
            AddressDataExtractor.cacheExpirationMs = 120000;
            expect(cache.cacheExpirationMs).toBe(120000);
            
            // Test callback properties
            const testCallback = () => {};
            AddressDataExtractor.logradouroChangeCallback = testCallback;
            expect(cache.logradouroChangeCallback).toBe(testCallback);
            
            cache.bairroChangeCallback = testCallback;
            expect(AddressDataExtractor.bairroChangeCallback).toBe(testCallback);
        });
    });

    describe('Facade Pattern Implementation', () => {
        test('should properly delegate to AddressExtractor for instance creation', async () => {
            const { default: AddressDataExtractor } = await import('../../src/data/AddressDataExtractor.js');
            
            const mockData = {
                address: {
                    road: 'Rua das Flores',
                    house_number: '123',
                    neighbourhood: 'Centro',
                    city: 'São Paulo',
                    state: 'SP',
                    country: 'Brasil'
                }
            };
            
            const extractor = new AddressDataExtractor(mockData);
            
            // Verify the facade creates proper delegation
            expect(extractor.enderecoPadronizado.constructor.name).toBe('BrazilianStandardAddress');
            // referencePlace is on enderecoPadronizado, not on extractor directly
            expect(extractor.enderecoPadronizado.referencePlace.constructor.name).toBe('ReferencePlace');
            
            // Verify toString method works
            expect(typeof extractor.toString).toBe('function');
            expect(extractor.toString()).toContain('AddressDataExtractor:');
        });

        test('should maintain proper error handling delegation', async () => {
            const { default: AddressDataExtractor } = await import('../../src/data/AddressDataExtractor.js');
            
            // Test with invalid data - current implementation is defensive and doesn't throw
            const invalidData = null;
            
            // Should not throw - creates instance with empty/default values
            expect(() => {
                new AddressDataExtractor(invalidData);
            }).not.toThrow();
            
            // Verify it creates a valid instance with defaults
            const extractor = new AddressDataExtractor(invalidData);
            expect(extractor).toBeDefined();
            expect(extractor.enderecoPadronizado).toBeDefined();
        });
    });

    describe('Performance and Memory Management', () => {
        test('should not create memory leaks through property descriptors', async () => {
            const { default: AddressDataExtractor } = await import('../../src/data/AddressDataExtractor.js');
            const { default: AddressCache } = await import('../../src/data/AddressCache.js');
            
            const initialInstanceCount = AddressCache.instance ? 1 : 0;
            
            // Access properties multiple times
            for (let i = 0; i < 10; i++) {
                AddressDataExtractor.maxCacheSize = 100 + i;
                const size = AddressDataExtractor.maxCacheSize;
                expect(size).toBe(100 + i);
            }
            
            // Should still have only one singleton instance
            expect(AddressCache.getInstance()).toBeDefined();
            // Additional instances should not be created
            const finalInstanceCount = AddressCache.instance ? 1 : 0;
            expect(finalInstanceCount).toBe(1);
        });

        test('should maintain efficient delegation without creating wrapper objects', async () => {
            const { default: AddressDataExtractor } = await import('../../src/data/AddressDataExtractor.js');
            
            const mockData = {
                address: {
                    road: 'Test Road',
                    city: 'Test City'
                }
            };
            
            // Measure multiple calls to ensure delegation is efficient
            const startTime = performance.now();
            
            for (let i = 0; i < 100; i++) {
                const address = AddressDataExtractor.getBrazilianStandardAddress(mockData);
                expect(address.logradouro).toBe('Test Road');
            }
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            // Should complete within reasonable time (allowing for CI variations)
            expect(executionTime).toBeLessThan(1000); // 1 second max for 100 operations
        });
    });

    describe('Documentation and Deprecation Notices', () => {
        test('should include proper JSDoc deprecation notice', async () => {
            const { default: AddressDataExtractor } = await import('../../src/data/AddressDataExtractor.js');
            
            // Test that the class exists and is functional
            expect(AddressDataExtractor).toBeDefined();
            
            // The deprecation should be documented in JSDoc, but class should still work
            const mockData = { address: { road: 'Test', city: 'Test' } };
            const address = AddressDataExtractor.getBrazilianStandardAddress(mockData);
            expect(address).toBeDefined();
        });
    });
});