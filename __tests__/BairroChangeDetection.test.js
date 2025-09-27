/**
 * Tests for bairro (neighborhood) change detection functionality
 * This test suite validates the bairro change detection features following the same pattern as logradouro detection
 */

// Mock document to prevent errors in test environment
global.document = undefined;

const { AddressDataExtractor } = require('../src/guia.js');

describe('AddressDataExtractor Bairro Change Detection', () => {
    beforeEach(() => {
        // Clear cache and reset change tracking before each test
        AddressDataExtractor.clearCache();
        AddressDataExtractor.lastNotifiedBairroChangeSignature = null;
    });

    afterEach(() => {
        // Clean up after each test
        AddressDataExtractor.clearCache();
        AddressDataExtractor.lastNotifiedBairroChangeSignature = null;
    });

    test('should return false when no addresses in cache', () => {
        expect(AddressDataExtractor.hasBairroChanged()).toBe(false);
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

        expect(AddressDataExtractor.hasBairroChanged()).toBe(false);
    });

    test('should return true on first detection of bairro change', () => {
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

        // Add second address with different neighborhood
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
        expect(AddressDataExtractor.hasBairroChanged()).toBe(true);
    });

    test('should return false on subsequent checks of same bairro change (prevents loop)', () => {
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

        // Add second address with different neighborhood
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
        expect(AddressDataExtractor.hasBairroChanged()).toBe(true);

        // Subsequent checks should return false (prevents notification loop)
        expect(AddressDataExtractor.hasBairroChanged()).toBe(false);
        expect(AddressDataExtractor.hasBairroChanged()).toBe(false);
        expect(AddressDataExtractor.hasBairroChanged()).toBe(false);
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

        // Add second address with different neighborhood
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
        expect(AddressDataExtractor.hasBairroChanged()).toBe(true);

        // Subsequent check should return false
        expect(AddressDataExtractor.hasBairroChanged()).toBe(false);

        // Add third address with another different neighborhood
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
        expect(AddressDataExtractor.hasBairroChanged()).toBe(true);

        // But subsequent checks should return false again
        expect(AddressDataExtractor.hasBairroChanged()).toBe(false);
    });

    test('should return false when bairro values are the same', () => {
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

        // Add second address with same neighborhood (but different street)
        const secondAddress = {
            address: {
                street: 'Rua dos Lírios',
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

        // Should return false since bairro is the same
        expect(AddressDataExtractor.hasBairroChanged()).toBe(false);
    });

    test('should handle null/undefined bairro values', () => {
        // Add first address with no neighborhood
        const firstAddress = {
            address: {
                street: 'Rua das Flores',
                house_number: '123',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01000-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(firstAddress);

        // Add second address with neighborhood
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
        expect(AddressDataExtractor.hasBairroChanged()).toBe(true);

        // Subsequent checks should return false
        expect(AddressDataExtractor.hasBairroChanged()).toBe(false);
    });

    test('should call callback when bairro changes on cache insert', () => {
        let callbackDetails = null;
        let callbackCallCount = 0;

        // Set up callback
        AddressDataExtractor.setBairroChangeCallback((changeDetails) => {
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

        // Add second address with different neighborhood - this should trigger callback
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
        expect(callbackDetails.previous.bairro).toBe('Centro');
        expect(callbackDetails.current.bairro).toBe('Bela Vista');

        // Adding a third address with same neighborhood should not trigger callback
        const thirdAddress = {
            address: {
                street: 'Rua Oscar Freire',
                house_number: '789',
                neighbourhood: 'Bela Vista', // Same neighborhood
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
        AddressDataExtractor.setBairroChangeCallback(null);
    });

    test('should not call callback when no callback is set', () => {
        // Ensure no callback is set
        AddressDataExtractor.setBairroChangeCallback(null);

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
        expect(AddressDataExtractor.hasBairroChanged()).toBe(true);
    });

    test('should provide detailed change information', () => {
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

        // Add second address with different neighborhood
        const secondAddress = {
            address: {
                street: 'Avenida Paulista',
                house_number: '456',
                neighbourhood: 'Bela Vista',
                suburb: 'Região Central',
                city: 'São Paulo',
                state: 'SP',
                postcode: '01310-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(secondAddress);

        const changeDetails = AddressDataExtractor.getBairroChangeDetails();

        expect(changeDetails).toBeDefined();
        expect(changeDetails.hasChanged).toBe(true);
        expect(changeDetails.previous.bairro).toBe('Centro');
        expect(changeDetails.current.bairro).toBe('Bela Vista');
        expect(changeDetails.previous.bairroCompleto).toBe('Centro');
        expect(changeDetails.current.bairroCompleto).toBe('Bela Vista, Região Central');
    });

    test('should work independently from logradouro change detection', () => {
        let bairroCallbackCount = 0;
        let logradouroCallbackCount = 0;

        // Set up both callbacks
        AddressDataExtractor.setBairroChangeCallback(() => {
            bairroCallbackCount++;
        });
        AddressDataExtractor.setLogradouroChangeCallback(() => {
            logradouroCallbackCount++;
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

        // Add second address with both different street and neighborhood
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

        // Both callbacks should have been called
        expect(bairroCallbackCount).toBe(1);
        expect(logradouroCallbackCount).toBe(1);

        // Add third address with same street but different neighborhood
        const thirdAddress = {
            address: {
                street: 'Avenida Paulista', // Same street
                house_number: '789',
                neighbourhood: 'Jardins', // Different neighborhood
                city: 'São Paulo',
                state: 'SP',
                postcode: '01310-001',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(thirdAddress);

        // Only bairro callback should have been called (not logradouro)
        expect(bairroCallbackCount).toBe(2);
        expect(logradouroCallbackCount).toBe(1);

        // Clean up
        AddressDataExtractor.setBairroChangeCallback(null);
        AddressDataExtractor.setLogradouroChangeCallback(null);
    });
});