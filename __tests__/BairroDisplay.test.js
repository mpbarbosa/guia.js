/**
 * Tests for bairro prominent display functionality
 * This test suite validates that bairro is displayed prominently but less highlighted than municipality
 */

// Mock document to prevent errors in test environment
global.document = {
    getElementById: jest.fn().mockReturnValue(null)
};

const { HTMLAddressDisplayer, BrazilianStandardAddress } = require('../src/guia.js');

describe('HTMLAddressDisplayer Bairro Display', () => {
    let addressDisplayer;
    let mockElement;

    beforeEach(() => {
        mockElement = {
            innerHTML: '',
            id: 'test-result-area'
        };
        addressDisplayer = new HTMLAddressDisplayer(mockElement);
    });

    test('should display bairro prominently when bairro exists', () => {
        // Create mock geocoding data
        const mockGeoData = {
            data: {
                address: {
                    road: 'Avenida Paulista',
                    house_number: '1578',
                    neighbourhood: 'Bela Vista',
                    suburb: 'Região Central',
                    city: 'São Paulo',
                    state: 'São Paulo',
                    country: 'Brasil',
                    country_code: 'br'
                }
            }
        };

        // Create standardized address
        const enderecoPadronizado = new BrazilianStandardAddress();
        enderecoPadronizado.municipio = 'São Paulo';
        enderecoPadronizado.bairro = 'Bela Vista';
        enderecoPadronizado.regiaoCidade = 'Região Central';
        enderecoPadronizado.uf = 'SP';

        // Render the address
        const html = addressDisplayer.renderAddress(
            { data: mockGeoData.data }, 
            enderecoPadronizado
        );

        // Verify bairro display is present
        expect(html).toContain('id="bairro-display"');
        expect(html).toContain('🏘️ Bela Vista, Região Central');
        
        // Verify bairro styling (less prominent than municipality)
        expect(html).toContain('background-color: #f8f9fa');
        expect(html).toContain('border: 1px solid #dee2e6');
        expect(html).toContain('font-size: 18px');
        expect(html).toContain('font-weight: 500');
        
        // Verify municipality is still more prominent
        expect(html).toContain('id="municipio-display"');
        expect(html).toContain('background-color: #e8f4fd');
        expect(html).toContain('border: 2px solid #0066cc');
        expect(html).toContain('font-size: 24px');
        expect(html).toContain('font-weight: bold');
    });

    test('should not display bairro section when bairro is null', () => {
        // Create mock geocoding data without bairro
        const mockGeoData = {
            data: {
                address: {
                    road: 'Rua Teste',
                    city: 'São Paulo',
                    state: 'São Paulo',
                    country: 'Brasil',
                    country_code: 'br'
                }
            }
        };

        // Create standardized address without bairro
        const enderecoPadronizado = new BrazilianStandardAddress();
        enderecoPadronizado.municipio = 'São Paulo';
        enderecoPadronizado.bairro = null;
        enderecoPadronizado.uf = 'SP';

        // Render the address
        const html = addressDisplayer.renderAddress(
            { data: mockGeoData.data }, 
            enderecoPadronizado
        );

        // Verify bairro display is not present
        expect(html).not.toContain('id="bairro-display"');
        expect(html).not.toContain('🏘️');
        
        // But municipality should still be displayed
        expect(html).toContain('id="municipio-display"');
        expect(html).toContain('📍 São Paulo');
    });

    test('should display only bairro name when regiaoCidade is not available', () => {
        // Create mock geocoding data
        const mockGeoData = {
            data: {
                address: {
                    road: 'Rua das Flores',
                    neighbourhood: 'Centro',
                    city: 'São Paulo',
                    state: 'São Paulo',
                    country: 'Brasil',
                    country_code: 'br'
                }
            }
        };

        // Create standardized address with bairro but no regiaoCidade
        const enderecoPadronizado = new BrazilianStandardAddress();
        enderecoPadronizado.municipio = 'São Paulo';
        enderecoPadronizado.bairro = 'Centro';
        enderecoPadronizado.regiaoCidade = null;
        enderecoPadronizado.uf = 'SP';

        // Render the address
        const html = addressDisplayer.renderAddress(
            { data: mockGeoData.data }, 
            enderecoPadronizado
        );

        // Verify bairro display shows only the bairro name
        expect(html).toContain('🏘️ Centro');
        expect(html).not.toContain('Centro,'); // Should not have comma since no regiaoCidade
    });
});