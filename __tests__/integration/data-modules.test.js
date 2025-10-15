/**
 * Integration test for extracted data processing modules
 * 
 * Verifies that BrazilianStandardAddress, ReferencePlace, AddressExtractor,
 * and AddressCache work correctly when imported as separate modules
 * 
 * @jest-environment node
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock globals before importing
global.document = undefined;
global.window = { log: jest.fn(), warn: jest.fn() };
global.console = { ...console, log: jest.fn(), warn: jest.fn() };

describe('Data Processing Modules Integration', () => {
    
    describe('Module Imports', () => {
        test('should import BrazilianStandardAddress from data module', async () => {
            const { default: BrazilianStandardAddress } = await import('../../src/data/BrazilianStandardAddress.js');
            expect(BrazilianStandardAddress).toBeDefined();
            expect(typeof BrazilianStandardAddress).toBe('function');
        });

        test('should import ReferencePlace from data module', async () => {
            const { default: ReferencePlace } = await import('../../src/data/ReferencePlace.js');
            expect(ReferencePlace).toBeDefined();
            expect(typeof ReferencePlace).toBe('function');
        });

        test('should import AddressExtractor from data module', async () => {
            const { default: AddressExtractor } = await import('../../src/data/AddressExtractor.js');
            expect(AddressExtractor).toBeDefined();
            expect(typeof AddressExtractor).toBe('function');
        });

        test('should import AddressCache from data module', async () => {
            const { default: AddressCache } = await import('../../src/data/AddressCache.js');
            expect(AddressCache).toBeDefined();
            expect(typeof AddressCache).toBe('function');
        });

        test('should export classes from guia.js for backward compatibility', async () => {
            const guia = await import('../../src/guia.js');
            
            expect(guia.BrazilianStandardAddress).toBeDefined();
            expect(guia.ReferencePlace).toBeDefined();
            expect(guia.AddressExtractor).toBeDefined();
            expect(guia.AddressCache).toBeDefined();
        });
    });

    describe('BrazilianStandardAddress', () => {
        test('should create empty address with default values', async () => {
            const { default: BrazilianStandardAddress } = await import('../../src/data/BrazilianStandardAddress.js');
            
            const address = new BrazilianStandardAddress();
            
            expect(address.logradouro).toBeNull();
            expect(address.numero).toBeNull();
            expect(address.bairro).toBeNull();
            expect(address.municipio).toBeNull();
            expect(address.uf).toBeNull();
            expect(address.siglaUF).toBeNull();
            expect(address.cep).toBeNull();
            expect(address.pais).toBe('Brasil');
        });

        test('should format complete address correctly', async () => {
            const { default: BrazilianStandardAddress } = await import('../../src/data/BrazilianStandardAddress.js');
            
            const address = new BrazilianStandardAddress();
            address.logradouro = 'Avenida Paulista';
            address.numero = '1578';
            address.bairro = 'Bela Vista';
            address.municipio = 'São Paulo';
            address.siglaUF = 'SP';
            address.cep = '01310-200';
            
            expect(address.logradouroCompleto()).toBe('Avenida Paulista, 1578');
            expect(address.bairroCompleto()).toBe('Bela Vista');
            expect(address.municipioCompleto()).toBe('São Paulo, SP');
            expect(address.enderecoCompleto()).toBe('Avenida Paulista, 1578, Bela Vista, São Paulo, SP, 01310-200');
        });
    });

    describe('ReferencePlace', () => {
        test('should create immutable reference place', async () => {
            const { default: ReferencePlace } = await import('../../src/data/ReferencePlace.js');
            
            const data = {
                class: 'shop',
                type: 'mall',
                name: 'Shopping Morumbi'
            };
            
            const refPlace = new ReferencePlace(data);
            
            expect(refPlace.className).toBe('shop');
            expect(refPlace.typeName).toBe('mall');
            expect(refPlace.name).toBe('Shopping Morumbi');
            expect(refPlace.description).toBe('Shopping Center Shopping Morumbi');
            expect(Object.isFrozen(refPlace)).toBe(true);
        });

        test('should handle unclassified reference places', async () => {
            const { default: ReferencePlace } = await import('../../src/data/ReferencePlace.js');
            
            const data = {
                class: 'unknown',
                type: 'unknown'
            };
            
            const refPlace = new ReferencePlace(data);
            
            expect(refPlace.description).toBe('Não classificado');
        });
    });

    describe('AddressExtractor', () => {
        test('should extract and standardize address data', async () => {
            const { default: AddressExtractor } = await import('../../src/data/AddressExtractor.js');
            
            const mockData = {
                address: {
                    road: 'Avenida Paulista',
                    house_number: '1578',
                    suburb: 'Bela Vista',
                    city: 'São Paulo',
                    state: 'São Paulo',
                    'ISO3166-2-lvl4': 'BR-SP',
                    postcode: '01310-200',
                    country: 'Brasil'
                },
                class: 'place',
                type: 'house',
                name: 'My Place'
            };
            
            const extractor = new AddressExtractor(mockData);
            
            expect(extractor.enderecoPadronizado.logradouro).toBe('Avenida Paulista');
            expect(extractor.enderecoPadronizado.numero).toBe('1578');
            expect(extractor.enderecoPadronizado.bairro).toBe('Bela Vista');
            expect(extractor.enderecoPadronizado.municipio).toBe('São Paulo');
            expect(extractor.enderecoPadronizado.siglaUF).toBe('SP');
            expect(extractor.enderecoPadronizado.cep).toBe('01310-200');
            expect(Object.isFrozen(extractor)).toBe(true);
        });

        test('should extract state abbreviation from ISO code', async () => {
            const { default: AddressExtractor } = await import('../../src/data/AddressExtractor.js');
            
            expect(AddressExtractor.extractSiglaUF('BR-SP')).toBe('SP');
            expect(AddressExtractor.extractSiglaUF('BR-RJ')).toBe('RJ');
            expect(AddressExtractor.extractSiglaUF('invalid')).toBeNull();
            expect(AddressExtractor.extractSiglaUF(null)).toBeNull();
        });
    });

    describe('AddressCache', () => {
        beforeEach(async () => {
            // Clear the singleton instance before each test
            const { default: AddressCache } = await import('../../src/data/AddressCache.js');
            AddressCache.instance = null;
        });

        test('should implement singleton pattern', async () => {
            const { default: AddressCache } = await import('../../src/data/AddressCache.js');
            
            const cache1 = AddressCache.getInstance();
            const cache2 = AddressCache.getInstance();
            
            expect(cache1).toBe(cache2);
        });

        test('should generate cache key from address data', async () => {
            const { default: AddressCache } = await import('../../src/data/AddressCache.js');
            
            const cache = AddressCache.getInstance();
            const mockData = {
                address: {
                    road: 'Avenida Paulista',
                    house_number: '1578',
                    suburb: 'Bela Vista',
                    city: 'São Paulo',
                    postcode: '01310-200',
                    country_code: 'br'
                }
            };
            
            const cacheKey = cache.generateCacheKey(mockData);
            
            expect(cacheKey).toBeDefined();
            expect(typeof cacheKey).toBe('string');
            expect(cacheKey).toContain('Avenida Paulista');
            expect(cacheKey).toContain('1578');
        });

        test('should clear cache correctly', async () => {
            const { default: AddressCache } = await import('../../src/data/AddressCache.js');
            
            const cache = AddressCache.getInstance();
            cache.currentAddress = { logradouro: 'Test' };
            cache.previousAddress = { logradouro: 'Previous' };
            
            cache.clearCache();
            
            expect(cache.currentAddress).toBeNull();
            expect(cache.previousAddress).toBeNull();
            expect(cache.cache.size).toBe(0);
        });

        test('should support callback registration', async () => {
            const { default: AddressCache } = await import('../../src/data/AddressCache.js');
            
            const cache = AddressCache.getInstance();
            const callback = jest.fn();
            
            cache.setLogradouroChangeCallback(callback);
            
            expect(cache.getLogradouroChangeCallback()).toBe(callback);
        });
    });

    describe('Module Interactions', () => {
        test('AddressExtractor should use BrazilianStandardAddress', async () => {
            const { default: AddressExtractor } = await import('../../src/data/AddressExtractor.js');
            const { default: BrazilianStandardAddress } = await import('../../src/data/BrazilianStandardAddress.js');
            
            const mockData = {
                address: {
                    road: 'Test Road',
                    city: 'Test City'
                }
            };
            
            const extractor = new AddressExtractor(mockData);
            
            expect(extractor.enderecoPadronizado).toBeInstanceOf(BrazilianStandardAddress);
        });

        test('AddressExtractor should use ReferencePlace', async () => {
            const { default: AddressExtractor } = await import('../../src/data/AddressExtractor.js');
            const { default: ReferencePlace } = await import('../../src/data/ReferencePlace.js');
            
            const mockData = {
                address: {
                    road: 'Test Road'
                },
                class: 'shop',
                type: 'mall',
                name: 'Test Mall'
            };
            
            const extractor = new AddressExtractor(mockData);
            
            expect(extractor.enderecoPadronizado.referencePlace).toBeInstanceOf(ReferencePlace);
        });

        test('All modules should be importable together', async () => {
            const BrazilianStandardAddress = (await import('../../src/data/BrazilianStandardAddress.js')).default;
            const ReferencePlace = (await import('../../src/data/ReferencePlace.js')).default;
            const AddressExtractor = (await import('../../src/data/AddressExtractor.js')).default;
            const AddressCache = (await import('../../src/data/AddressCache.js')).default;
            
            expect(BrazilianStandardAddress).toBeDefined();
            expect(ReferencePlace).toBeDefined();
            expect(AddressExtractor).toBeDefined();
            expect(AddressCache).toBeDefined();
            
            // Create instances to verify they work together
            const address = new BrazilianStandardAddress();
            const refPlace = new ReferencePlace({ class: 'shop', type: 'mall' });
            const extractor = new AddressExtractor({ address: { road: 'Test' } });
            const cache = AddressCache.getInstance();
            
            expect(address).toBeDefined();
            expect(refPlace).toBeDefined();
            expect(extractor).toBeDefined();
            expect(cache).toBeDefined();
        });
    });
});
