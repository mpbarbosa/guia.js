/**
 * Tests for AddressDataExtractor class focusing on logradouro change detection
 * This test specifically validates the fix for the logradouro change loop issue
 */

// Mock document to prevent errors in test environment
global.document = undefined;

const { AddressDataExtractor } = require('../src/guia.js');

describe('AddressDataExtractor Logradouro Change Detection', () => {
    beforeEach(() => {
        // Clear cache and reset change tracking before each test
        AddressDataExtractor.clearCache();
        AddressDataExtractor.lastNotifiedChangeSignature = null;
    });

    afterEach(() => {
        // Clean up after each test
        AddressDataExtractor.clearCache();
        AddressDataExtractor.lastNotifiedChangeSignature = null;
    });

    test('should return false when no addresses in cache', () => {
        expect(AddressDataExtractor.hasLogradouroChanged()).toBe(false);
    });

    test('should return false when only one address in cache', () => {
        // Create mock address data
        const mockData = {
            address: {
                street: 'Rua das Flores',
                house_number: '123',
                neighbourhood: 'Centro',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01000-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };

        // Add one address to cache
        AddressDataExtractor.getBrazilianStandardAddress(mockData);

        expect(AddressDataExtractor.hasLogradouroChanged()).toBe(false);
    });

    test('should return true on first detection of logradouro change', () => {
        // Add first address
        const firstAddress = {
            address: {
                street: 'Rua das Flores',
                house_number: '123',
                neighbourhood: 'Centro',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01000-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(firstAddress);

        // Add second address with different street
        const secondAddress = {
            address: {
                street: 'Avenida Paulista',
                house_number: '456',
                neighbourhood: 'Bela Vista',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01310-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(secondAddress);

        // First check should return true
        expect(AddressDataExtractor.hasLogradouroChanged()).toBe(true);
    });

    test('should return false on subsequent checks of same logradouro change (prevents loop)', () => {
        // Add first address
        const firstAddress = {
            address: {
                street: 'Rua das Flores',
                house_number: '123',
                neighbourhood: 'Centro',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01000-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(firstAddress);

        // Add second address with different street
        const secondAddress = {
            address: {
                street: 'Avenida Paulista',
                house_number: '456',
                neighbourhood: 'Bela Vista',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01310-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(secondAddress);

        // First check should return true
        expect(AddressDataExtractor.hasLogradouroChanged()).toBe(true);

        // Subsequent checks should return false (prevents notification loop)
        expect(AddressDataExtractor.hasLogradouroChanged()).toBe(false);
        expect(AddressDataExtractor.hasLogradouroChanged()).toBe(false);
        expect(AddressDataExtractor.hasLogradouroChanged()).toBe(false);
    });

    test('should reset and detect new change after cache update', () => {
        // Add first address
        const firstAddress = {
            address: {
                street: 'Rua das Flores',
                house_number: '123',
                neighbourhood: 'Centro',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01000-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(firstAddress);

        // Add second address with different street
        const secondAddress = {
            address: {
                street: 'Avenida Paulista',
                house_number: '456',
                neighbourhood: 'Bela Vista',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01310-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(secondAddress);

        // First check should return true
        expect(AddressDataExtractor.hasLogradouroChanged()).toBe(true);

        // Subsequent check should return false
        expect(AddressDataExtractor.hasLogradouroChanged()).toBe(false);

        // Add third address with another different street
        const thirdAddress = {
            address: {
                street: 'Rua Augusta',
                house_number: '789',
                neighbourhood: 'Consolação',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01305-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(thirdAddress);

        // Should detect new change
        expect(AddressDataExtractor.hasLogradouroChanged()).toBe(true);

        // But subsequent checks should return false again
        expect(AddressDataExtractor.hasLogradouroChanged()).toBe(false);
    });

    test('should return false when logradouro values are the same', () => {
        // Add first address
        const firstAddress = {
            address: {
                street: 'Rua das Flores',
                house_number: '123',
                neighbourhood: 'Centro',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01000-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(firstAddress);

        // Add second address with same street (but different number)
        const secondAddress = {
            address: {
                street: 'Rua das Flores',
                house_number: '456',
                neighbourhood: 'Centro',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01000-001',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(secondAddress);

        // Should return false since logradouro is the same
        expect(AddressDataExtractor.hasLogradouroChanged()).toBe(false);
    });

    test('should handle null/undefined logradouro values', () => {
        // Add first address with no street
        const firstAddress = {
            address: {
                house_number: '123',
                neighbourhood: 'Centro',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01000-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(firstAddress);

        // Add second address with street
        const secondAddress = {
            address: {
                street: 'Avenida Paulista',
                house_number: '456',
                neighbourhood: 'Bela Vista',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01310-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(secondAddress);

        // Should detect change from undefined to defined
        expect(AddressDataExtractor.hasLogradouroChanged()).toBe(true);

        // Subsequent checks should return false
        expect(AddressDataExtractor.hasLogradouroChanged()).toBe(false);
    });

    test('should call callback when logradouro changes on cache insert', () => {
        let callbackDetails = null;
        let callbackCallCount = 0;

        // Set up callback
        AddressDataExtractor.setLogradouroChangeCallback((changeDetails) => {
            callbackDetails = changeDetails;
            callbackCallCount++;
        });

        // Add first address
        const firstAddress = {
            address: {
                street: 'Rua das Flores',
                house_number: '123',
                neighbourhood: 'Centro',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01000-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(firstAddress);

        // No callback should be called yet (only one address)
        expect(callbackCallCount).toBe(0);
        expect(callbackDetails).toBeNull();

        // Add second address with different street - this should trigger callback
        const secondAddress = {
            address: {
                street: 'Avenida Paulista',
                house_number: '456',
                neighbourhood: 'Bela Vista',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01310-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(secondAddress);

        // Callback should have been called once
        expect(callbackCallCount).toBe(1);
        expect(callbackDetails).toBeDefined();
        expect(callbackDetails.hasChanged).toBe(true);
        expect(callbackDetails.previous.logradouro).toBe('Rua das Flores');
        expect(callbackDetails.current.logradouro).toBe('Avenida Paulista');

        // Adding a third address with same street should not trigger callback
        const thirdAddress = {
            address: {
                street: 'Avenida Paulista', // Same street
                house_number: '789',
                neighbourhood: 'Bela Vista',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01310-001',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(thirdAddress);

        // Callback count should remain the same (no change detected)
        expect(callbackCallCount).toBe(1);

        // Clean up
        AddressDataExtractor.setLogradouroChangeCallback(null);
    });

    test('should not call callback when no callback is set', () => {
        // Ensure no callback is set
        AddressDataExtractor.setLogradouroChangeCallback(null);

        // Add addresses
        const firstAddress = {
            address: {
                street: 'Rua das Flores',
                house_number: '123',
                neighbourhood: 'Centro',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01000-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(firstAddress);

        const secondAddress = {
            address: {
                street: 'Avenida Paulista',
                house_number: '456',
                neighbourhood: 'Bela Vista',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01310-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        
        // This should not throw an error even though no callback is set
        expect(() => {
            AddressDataExtractor.getBrazilianStandardAddress(secondAddress);
        }).not.toThrow();

        // Change should still be detectable
        expect(AddressDataExtractor.hasLogradouroChanged()).toBe(true);
    });
});

describe('AddressDataExtractor ReferencePlace Integration', () => {
    beforeEach(() => {
        AddressDataExtractor.clearCache();
    });

    afterEach(() => {
        AddressDataExtractor.clearCache();
    });

    test('should extract reference place for shopping mall', () => {
        const mallData = {
            class: 'shop',
            type: 'mall',
            name: 'Shopping Morumbi',
            address: {
                road: 'Avenida Roque Petroni Junior',
                house_number: '1089',
                neighbourhood: 'Jardim das Acácias',
                city: 'São Paulo',
                state: 'São Paulo'
            }
        };

        const extractor = new AddressDataExtractor(mallData);
        
        expect(extractor.referencePlace).toBeDefined();
        expect(extractor.referencePlace.className).toBe('shop');
        expect(extractor.referencePlace.typeName).toBe('mall');
        expect(extractor.referencePlace.name).toBe('Shopping Morumbi');
        expect(extractor.referencePlace.description).toBe('Shopping Center');
    });

    test('should extract reference place for subway station', () => {
        const subwayData = {
            class: 'railway',
            type: 'subway',
            name: 'Estação Sé',
            address: {
                road: 'Praça da Sé',
                neighbourhood: 'Sé',
                city: 'São Paulo',
                state: 'São Paulo'
            }
        };

        const extractor = new AddressDataExtractor(subwayData);
        
        expect(extractor.referencePlace).toBeDefined();
        expect(extractor.referencePlace.className).toBe('railway');
        expect(extractor.referencePlace.typeName).toBe('subway');
        expect(extractor.referencePlace.name).toBe('Estação Sé');
        expect(extractor.referencePlace.description).toBe('Estação do Metrô');
    });

    test('should handle data without reference place', () => {
        const regularData = {
            address: {
                road: 'Rua Augusta',
                house_number: '123',
                neighbourhood: 'Consolação',
                city: 'São Paulo',
                state: 'São Paulo'
            }
        };

        const extractor = new AddressDataExtractor(regularData);
        
        expect(extractor.referencePlace).toBeDefined();
        expect(extractor.referencePlace.className).toBeNull();
        expect(extractor.referencePlace.typeName).toBeNull();
        expect(extractor.referencePlace.name).toBeNull();
        expect(extractor.referencePlace.description).toBe('Não classificado');
    });

    test('should extract reference place with residential data', () => {
        const residentialData = {
            class: 'place',
            type: 'house',
            name: 'Casa do João',
            address: {
                road: 'Rua das Flores',
                house_number: '100',
                neighbourhood: 'Jardim das Flores',
                city: 'São Paulo',
                state: 'São Paulo'
            }
        };

        const extractor = new AddressDataExtractor(residentialData);
        
        expect(extractor.referencePlace).toBeDefined();
        expect(extractor.referencePlace.className).toBe('place');
        expect(extractor.referencePlace.typeName).toBe('house');
        expect(extractor.referencePlace.name).toBe('Casa do João');
        expect(extractor.referencePlace.description).toBe('Residencial');
    });
});