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