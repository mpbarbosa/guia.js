/**
 * Tests for AddressDataExtractor setMunicipioChangeCallback integration
 * This test suite validates that the municipio change callback functionality works correctly
 */

// Mock document to prevent errors in test environment
global.document = undefined;

const { AddressDataExtractor } = require('../../src/guia.js');

describe('AddressDataExtractor Municipio Change Callback Integration', () => {
    beforeEach(() => {
        // Clear cache and reset change tracking before each test
        AddressDataExtractor.clearCache();
        AddressDataExtractor.lastNotifiedMunicipioChangeSignature = null;
        // Ensure no callback is set
        AddressDataExtractor.setMunicipioChangeCallback(null);
    });

    afterEach(() => {
        // Clean up after each test
        AddressDataExtractor.clearCache();
        AddressDataExtractor.lastNotifiedMunicipioChangeSignature = null;
        AddressDataExtractor.setMunicipioChangeCallback(null);
    });

    test('should have setMunicipioChangeCallback method', () => {
        expect(typeof AddressDataExtractor.setMunicipioChangeCallback).toBe('function');
    });

    test('should setup and remove municipio change detection callback', () => {
        // Initially, no callback should be set
        expect(AddressDataExtractor.municipioChangeCallback).toBeNull();
        
        const mockCallback = jest.fn();
        
        // Setup municipio change detection
        AddressDataExtractor.setMunicipioChangeCallback(mockCallback);
        
        // Callback should now be set
        expect(AddressDataExtractor.municipioChangeCallback).toBe(mockCallback);
        
        // Remove municipio change detection
        AddressDataExtractor.setMunicipioChangeCallback(null);
        
        // Callback should be cleared
        expect(AddressDataExtractor.municipioChangeCallback).toBeNull();
    });

    test('should call callback when municipio changes occur', () => {
        const mockCallback = jest.fn();
        
        // Setup municipio change detection
        AddressDataExtractor.setMunicipioChangeCallback(mockCallback);
        
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
        
        // Add second address with different municipality - this should trigger the callback
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
        
        // Callback should have been called once
        expect(mockCallback).toHaveBeenCalledTimes(1);
        
        const callArgs = mockCallback.mock.calls[0][0];
        expect(callArgs).toBeDefined();
        expect(callArgs.hasChanged).toBe(true);
        expect(callArgs.previous.municipio).toBe('São Paulo');
        expect(callArgs.current.municipio).toBe('Rio de Janeiro');
    });

    test('should not call callback when no municipio change occurs', () => {
        const mockCallback = jest.fn();
        
        // Setup municipio change detection
        AddressDataExtractor.setMunicipioChangeCallback(mockCallback);
        
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
        
        // Add second address with same municipality
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
        
        // Callback should not have been called
        expect(mockCallback).not.toHaveBeenCalled();
    });
});