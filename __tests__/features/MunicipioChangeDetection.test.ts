/**
 * Tests for municipio (municipality) change detection functionality
 * This test suite validates the municipio change detection features following the same pattern as logradouro and bairro detection
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { AddressDataExtractor } from '../../src/guia.js';

// Mock document to prevent errors in test environment
global.document = undefined;

describe('AddressDataExtractor Municipio Change Detection', () => {
    beforeEach(() => {
        // Clear cache and reset change tracking before each test
        AddressDataExtractor.clearCache();
        AddressDataExtractor.lastNotifiedMunicipioChangeSignature = null;
    });

    afterEach(() => {
        // Clean up after each test
        AddressDataExtractor.clearCache();
        AddressDataExtractor.lastNotifiedMunicipioChangeSignature = null;
    });

    test('should return false when no addresses in cache', () => {
        expect(AddressDataExtractor.hasMunicipioChanged()).toBe(false);
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

        expect(AddressDataExtractor.hasMunicipioChanged()).toBe(false);
    });

    test('should return true on first detection of municipio change', () => {
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
        AddressDataExtractor.getBrazilianStandardAddress(firstAddress);
        AddressDataExtractor.getBrazilianStandardAddress(firstAddress);

        // Add second address with different municipality — 3x
        const secondAddress = {
            address: {
                street: 'Avenida Copacabana',
                house_number: '456',
                neighbourhood: 'Copacabana',
                city: 'Rio de Janeiro',
                state: 'RJ',
                postcode: '22070-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(secondAddress);

        expect(AddressDataExtractor.hasMunicipioChanged()).toBe(true);
    });

    test('should return false when same municipio is used again', () => {
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
        AddressDataExtractor.getBrazilianStandardAddress(firstAddress);
        AddressDataExtractor.getBrazilianStandardAddress(firstAddress);

        // Add second address with different municipality — 3x
        const secondAddress = {
            address: {
                street: 'Avenida Copacabana',
                house_number: '456',
                neighbourhood: 'Copacabana',
                city: 'Rio de Janeiro',
                state: 'RJ',
                postcode: '22070-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(secondAddress);

        // First call should return true
        expect(AddressDataExtractor.hasMunicipioChanged()).toBe(true);

        // Second call should return false (same change signature)
        expect(AddressDataExtractor.hasMunicipioChanged()).toBe(false);
    });

    test('should return false when same municipio in different addresses', () => {
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

        // Add second address with same municipality but different details
        const secondAddress = {
            address: {
                street: 'Avenida Paulista',
                house_number: '456',
                neighbourhood: 'Bela Vista',
                city: 'São Paulo', // Same municipality
                state: 'SP',
                postcode: '01310-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(secondAddress);

        expect(AddressDataExtractor.hasMunicipioChanged()).toBe(false);
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
        AddressDataExtractor.getBrazilianStandardAddress(firstAddress);
        AddressDataExtractor.getBrazilianStandardAddress(firstAddress);

        // Add second address with different municipality — 3x
        const secondAddress = {
            address: {
                street: 'Avenida Copacabana',
                house_number: '456',
                neighbourhood: 'Copacabana',
                city: 'Rio de Janeiro',
                state: 'RJ',
                postcode: '22070-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(secondAddress);

        const changeDetails = AddressDataExtractor.getMunicipioChangeDetails();
        
        expect(changeDetails).toBeDefined();
        expect(changeDetails.hasChanged).toBe(true);
        expect(changeDetails.previous.municipio).toBe('São Paulo');
        expect(changeDetails.current.municipio).toBe('Rio de Janeiro');
        expect(changeDetails.previous.uf).toBe('SP');
        expect(changeDetails.current.uf).toBe('RJ');
    });

    test('should work independently from logradouro and bairro change detection', () => {
        let municipioCallbackCount = 0;
        let bairroCallbackCount = 0;
        let logradouroCallbackCount = 0;

        // Set up all callbacks
        AddressDataExtractor.setMunicipioChangeCallback(() => {
            municipioCallbackCount++;
        });
        AddressDataExtractor.setBairroChangeCallback(() => {
            bairroCallbackCount++;
        });
        AddressDataExtractor.setLogradouroChangeCallback(() => {
            logradouroCallbackCount++;
        });

        // Add first address — 3x to satisfy the confirmation buffer
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
        // 3 unique cache keys, same fields → buffer confirms 'São Paulo' / 'Centro' / 'Rua das Flores'
        AddressDataExtractor.getBrazilianStandardAddress({ ...firstAddress, address: { ...firstAddress.address, postcode: '01000-000' } });
        AddressDataExtractor.getBrazilianStandardAddress({ ...firstAddress, address: { ...firstAddress.address, postcode: '01000-001' } });
        AddressDataExtractor.getBrazilianStandardAddress({ ...firstAddress, address: { ...firstAddress.address, postcode: '01000-002' } });

        // Add second address with different municipality, bairro, and logradouro — 3x
        const secondAddress = {
            address: {
                street: 'Avenida Copacabana', // Different logradouro
                house_number: '456',
                neighbourhood: 'Copacabana', // Different bairro
                city: 'Rio de Janeiro', // Different municipality
                state: 'RJ',
                postcode: '22070-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        // 3 unique cache keys → buffers confirm 'Rio de Janeiro' / 'Copacabana' / 'Avenida Copacabana'
        AddressDataExtractor.getBrazilianStandardAddress({ ...secondAddress, address: { ...secondAddress.address, postcode: '22070-000' } });
        AddressDataExtractor.getBrazilianStandardAddress({ ...secondAddress, address: { ...secondAddress.address, postcode: '22070-001' } });
        AddressDataExtractor.getBrazilianStandardAddress({ ...secondAddress, address: { ...secondAddress.address, postcode: '22070-002' } });

        // All three callbacks should have been called
        expect(municipioCallbackCount).toBe(1);
        expect(bairroCallbackCount).toBe(1);
        expect(logradouroCallbackCount).toBe(1);

        // Clean up
        AddressDataExtractor.setMunicipioChangeCallback(null);
        AddressDataExtractor.setBairroChangeCallback(null);
        AddressDataExtractor.setLogradouroChangeCallback(null);
    });

    test('should trigger callback when municipio changes', () => {
        let callbackCallCount = 0;
        let callbackDetails = null;

        // Set up callback
        AddressDataExtractor.setMunicipioChangeCallback((details) => {
            callbackCallCount++;
            callbackDetails = details;
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
        // 3 unique cache keys, same city → buffer confirms 'São Paulo'
        AddressDataExtractor.getBrazilianStandardAddress({ ...firstAddress, address: { ...firstAddress.address, postcode: '01000-000' } });
        AddressDataExtractor.getBrazilianStandardAddress({ ...firstAddress, address: { ...firstAddress.address, postcode: '01000-001' } });
        AddressDataExtractor.getBrazilianStandardAddress({ ...firstAddress, address: { ...firstAddress.address, postcode: '01000-002' } });

        // Add second address with different municipality — 3x
        const secondAddress = {
            address: {
                street: 'Avenida Copacabana',
                house_number: '456',
                neighbourhood: 'Copacabana',
                city: 'Rio de Janeiro',
                state: 'RJ',
                postcode: '22070-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        // 3 unique cache keys, same city → buffer confirms 'Rio de Janeiro'
        AddressDataExtractor.getBrazilianStandardAddress({ ...secondAddress, address: { ...secondAddress.address, postcode: '22070-000' } });
        AddressDataExtractor.getBrazilianStandardAddress({ ...secondAddress, address: { ...secondAddress.address, postcode: '22070-001' } });
        AddressDataExtractor.getBrazilianStandardAddress({ ...secondAddress, address: { ...secondAddress.address, postcode: '22070-002' } });

        // Callback should have been called once
        expect(callbackCallCount).toBe(1);
        expect(callbackDetails).toBeDefined();
        expect(callbackDetails.hasChanged).toBe(true);
        expect(callbackDetails.previous.municipio).toBe('São Paulo');
        expect(callbackDetails.current.municipio).toBe('Rio de Janeiro');

        // Adding a third address with same municipality should not trigger callback
        const thirdAddress = {
            address: {
                street: 'Rua da Barra',
                house_number: '789',
                neighbourhood: 'Barra da Tijuca',
                city: 'Rio de Janeiro', // Same municipality
                state: 'RJ',
                postcode: '22640-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        // 3 unique cache keys, same city → no new callback (Rio de Janeiro already confirmed)
        AddressDataExtractor.getBrazilianStandardAddress({ ...thirdAddress, address: { ...thirdAddress.address, postcode: '22640-010' } });
        AddressDataExtractor.getBrazilianStandardAddress({ ...thirdAddress, address: { ...thirdAddress.address, postcode: '22640-011' } });
        AddressDataExtractor.getBrazilianStandardAddress({ ...thirdAddress, address: { ...thirdAddress.address, postcode: '22640-012' } });

        // Callback count should remain the same (no change detected)
        expect(callbackCallCount).toBe(1);

        // Clean up
        AddressDataExtractor.setMunicipioChangeCallback(null);
    });

    test('should not call callback when no callback is set', () => {
        // Ensure no callback is set
        AddressDataExtractor.setMunicipioChangeCallback(null);

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
                street: 'Avenida Copacabana',
                house_number: '456',
                neighbourhood: 'Copacabana',
                city: 'Rio de Janeiro',
                state: 'RJ',
                postcode: '22070-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        
        // This should not throw an error even though no callback is set
        expect(() => {
            AddressDataExtractor.getBrazilianStandardAddress(secondAddress);
        }).not.toThrow();

        // Change should still be detectable
        expect(AddressDataExtractor.hasMunicipioChanged()).toBe(true);
    });

    test('should handle null/undefined municipio values gracefully', () => {
        // Add first address with no municipio
        const firstAddress = {
            address: {
                street: 'Rua das Flores',
                house_number: '123',
                neighbourhood: 'Centro',
                // No city/municipality field
                state: 'SP',
                postcode: '01000-000',
                country: 'Brasil',
                country_code: 'BR'
            }
        };
        AddressDataExtractor.getBrazilianStandardAddress(firstAddress);

        // Add second address with municipio
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

        // Should detect change from null/undefined to "São Paulo"
        expect(AddressDataExtractor.hasMunicipioChanged()).toBe(true);

        const changeDetails = AddressDataExtractor.getMunicipioChangeDetails();
        expect(changeDetails.hasChanged).toBe(true);
        expect(changeDetails.previous.municipio).toBeUndefined();
        expect(changeDetails.current.municipio).toBe('São Paulo');
    });
});