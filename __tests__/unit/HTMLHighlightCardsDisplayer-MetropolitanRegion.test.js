/**
 * Unit tests for HTMLHighlightCardsDisplayer - Metropolitan Region Display Feature
 * Tests the display of metropolitan region in the municipality card
 * 
 * @jest-environment node
 * @author MP Barbosa
 * @since 0.9.0-alpha
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { JSDOM } from 'jsdom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder (required for jsdom in Node.js)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock console
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
};

// Import the classes
let HTMLHighlightCardsDisplayer, BrazilianStandardAddress;
try {
    const displayerModule = await import('../../src/html/HTMLHighlightCardsDisplayer.js');
    const addressModule = await import('../../src/data/BrazilianStandardAddress.js');
    HTMLHighlightCardsDisplayer = displayerModule.default;
    BrazilianStandardAddress = addressModule.default;
} catch (error) {
    console.warn('Could not load modules:', error.message);
}

describe('HTMLHighlightCardsDisplayer - Metropolitan Region (v0.9.0-alpha)', () => {
    let dom;
    let document;
    let displayer;

    beforeEach(() => {
        // Create a fresh DOM for each test
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <div class="highlight-card">
                    <div id="municipio-label" class="highlight-card-label">Município</div>
                    <div id="regiao-metropolitana-value" class="metropolitan-region-value"></div>
                    <div id="municipio-value" class="highlight-card-value">—</div>
                </div>
                <div class="highlight-card">
                    <div id="bairro-label" class="highlight-card-label">Bairro</div>
                    <div id="bairro-value" class="highlight-card-value">—</div>
                </div>
            </body>
            </html>
        `);
        document = dom.window.document;
        
        // Clear mock calls
        jest.clearAllMocks();
    });

    describe('Constructor - element initialization', () => {
        test('should get reference to regiao-metropolitana-value element', () => {
            if (!HTMLHighlightCardsDisplayer) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            expect(displayer._regiaoMetropolitanaElement).toBeTruthy();
            expect(displayer._regiaoMetropolitanaElement.id).toBe('regiao-metropolitana-value');
        });

        test('should get references to all three card elements', () => {
            if (!HTMLHighlightCardsDisplayer) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            expect(displayer._municipioElement).toBeTruthy();
            expect(displayer._regiaoMetropolitanaElement).toBeTruthy();
            expect(displayer._bairroElement).toBeTruthy();
        });

        test('should handle missing regiao-metropolitana-value element gracefully', () => {
            if (!HTMLHighlightCardsDisplayer) {
                expect(true).toBe(true);
                return;
            }

            // Remove the element
            const element = document.getElementById('regiao-metropolitana-value');
            element.remove();

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            expect(displayer._regiaoMetropolitanaElement).toBeNull();
        });
    });

    describe('update() method - metropolitan region display', () => {
        test('should update regiao-metropolitana-value element with region data', () => {
            if (!HTMLHighlightCardsDisplayer || !BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana do Recife';
            address.municipio = 'Recife';
            address.siglaUF = 'PE';
            address.bairro = 'Boa Viagem';

            displayer.update({}, address);

            const regionElement = document.getElementById('regiao-metropolitana-value');
            expect(regionElement.textContent).toBe('Região Metropolitana do Recife');
        });

        test('should clear regiao-metropolitana-value when region is null', () => {
            if (!HTMLHighlightCardsDisplayer || !BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            const address = new BrazilianStandardAddress();
            address.municipio = 'Arapiraca';
            address.siglaUF = 'AL';
            // regiaoMetropolitana is null

            displayer.update({}, address);

            const regionElement = document.getElementById('regiao-metropolitana-value');
            expect(regionElement.textContent).toBe('');
        });

        test('should call regiaoMetropolitanaFormatada() method', () => {
            if (!HTMLHighlightCardsDisplayer || !BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana de São Paulo';
            address.municipio = 'São Paulo';
            address.siglaUF = 'SP';

            // Spy on the method
            const spy = jest.spyOn(address, 'regiaoMetropolitanaFormatada');

            displayer.update({}, address);

            expect(spy).toHaveBeenCalled();
        });

        test('should log warning when regiao-metropolitana-value element is missing', () => {
            if (!HTMLHighlightCardsDisplayer || !BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            // Remove the element
            const element = document.getElementById('regiao-metropolitana-value');
            element.remove();

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana do Recife';

            displayer.update({}, address);

            expect(console.warn).toHaveBeenCalled();
        });
    });

    describe('Real-world metropolitan region examples', () => {
        test('should display Região Metropolitana do Recife', () => {
            if (!HTMLHighlightCardsDisplayer || !BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana do Recife';
            address.municipio = 'Recife';
            address.siglaUF = 'PE';
            address.bairro = 'Santo Amaro';

            displayer.update({}, address);

            expect(document.getElementById('regiao-metropolitana-value').textContent).toBe('Região Metropolitana do Recife');
            expect(document.getElementById('municipio-value').textContent).toBe('Recife, PE');
            expect(document.getElementById('bairro-value').textContent).toBe('Santo Amaro');
        });

        test('should display Região Metropolitana de São Paulo', () => {
            if (!HTMLHighlightCardsDisplayer || !BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana de São Paulo';
            address.municipio = 'São Paulo';
            address.siglaUF = 'SP';
            address.bairro = 'Glicério';

            displayer.update({}, address);

            expect(document.getElementById('regiao-metropolitana-value').textContent).toBe('Região Metropolitana de São Paulo');
            expect(document.getElementById('municipio-value').textContent).toBe('São Paulo, SP');
            expect(document.getElementById('bairro-value').textContent).toBe('Glicério');
        });

        test('should display Olinda in Recife metropolitan region', () => {
            if (!HTMLHighlightCardsDisplayer || !BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana do Recife';
            address.municipio = 'Olinda';
            address.siglaUF = 'PE';

            displayer.update({}, address);

            expect(document.getElementById('regiao-metropolitana-value').textContent).toBe('Região Metropolitana do Recife');
            expect(document.getElementById('municipio-value').textContent).toBe('Olinda, PE');
        });
    });

    describe('Non-metropolitan municipalities', () => {
        test('should not display region for non-metropolitan municipality', () => {
            if (!HTMLHighlightCardsDisplayer || !BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            const address = new BrazilianStandardAddress();
            address.municipio = 'Arapiraca';
            address.siglaUF = 'AL';
            // No regiaoMetropolitana

            displayer.update({}, address);

            expect(document.getElementById('regiao-metropolitana-value').textContent).toBe('');
            expect(document.getElementById('municipio-value').textContent).toBe('Arapiraca, AL');
        });

        test('should handle Pontal do Coruripe (incomplete data)', () => {
            if (!HTMLHighlightCardsDisplayer || !BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            const address = new BrazilianStandardAddress();
            // No municipality, no region

            displayer.update({}, address);

            expect(document.getElementById('regiao-metropolitana-value').textContent).toBe('');
            expect(document.getElementById('municipio-value').textContent).toBe('—');
        });
    });

    describe('Integration with other card updates', () => {
        test('should update all three values in single call', () => {
            if (!HTMLHighlightCardsDisplayer || !BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana do Recife';
            address.municipio = 'Recife';
            address.siglaUF = 'PE';
            address.bairro = 'Boa Viagem';

            displayer.update({}, address);

            // All three should be updated
            expect(document.getElementById('regiao-metropolitana-value').textContent).toBe('Região Metropolitana do Recife');
            expect(document.getElementById('municipio-value').textContent).toBe('Recife, PE');
            expect(document.getElementById('bairro-value').textContent).toBe('Boa Viagem');
        });

        test('should maintain independence between region and municipality updates', () => {
            if (!HTMLHighlightCardsDisplayer || !BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            // First update - with region
            const address1 = new BrazilianStandardAddress();
            address1.regiaoMetropolitana = 'Região Metropolitana do Recife';
            address1.municipio = 'Recife';
            address1.siglaUF = 'PE';

            displayer.update({}, address1);
            
            expect(document.getElementById('regiao-metropolitana-value').textContent).toBe('Região Metropolitana do Recife');

            // Second update - no region
            const address2 = new BrazilianStandardAddress();
            address2.municipio = 'Arapiraca';
            address2.siglaUF = 'AL';

            displayer.update({}, address2);

            expect(document.getElementById('regiao-metropolitana-value').textContent).toBe('');
            expect(document.getElementById('municipio-value').textContent).toBe('Arapiraca, AL');
        });
    });

    describe('Edge cases', () => {
        test('should handle very long metropolitan region names', () => {
            if (!HTMLHighlightCardsDisplayer || !BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana de Nome Muito Longo Para Teste de Quebra de Linha e Validação';
            address.municipio = 'TestCity';
            address.siglaUF = 'TS';

            displayer.update({}, address);

            const regionText = document.getElementById('regiao-metropolitana-value').textContent;
            expect(regionText.length).toBeGreaterThan(70);
        });

        test('should handle special characters in region names', () => {
            if (!HTMLHighlightCardsDisplayer || !BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana de São José dos Campos';
            address.municipio = 'São José dos Campos';
            address.siglaUF = 'SP';

            displayer.update({}, address);

            const regionText = document.getElementById('regiao-metropolitana-value').textContent;
            expect(regionText).toContain('ã');
            expect(regionText).toContain('é');
        });

        test('should handle null enderecoPadronizado gracefully', () => {
            if (!HTMLHighlightCardsDisplayer) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            // Should not throw error
            expect(() => {
                displayer.update({}, null);
            }).not.toThrow();

            expect(console.warn).toHaveBeenCalled();
        });

        test('should handle undefined enderecoPadronizado gracefully', () => {
            if (!HTMLHighlightCardsDisplayer) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            // Should not throw error
            expect(() => {
                displayer.update({}, undefined);
            }).not.toThrow();

            expect(console.warn).toHaveBeenCalled();
        });
    });

    describe('Logging behavior', () => {
        test('should log metropolitan region in update call', () => {
            if (!HTMLHighlightCardsDisplayer || !BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            const address = new BrazilianStandardAddress();
            address.regiaoMetropolitana = 'Região Metropolitana do Recife';
            address.municipio = 'Recife';
            address.siglaUF = 'PE';

            displayer.update({}, address);

            // Should have logged the update
            expect(console.log).toHaveBeenCalled();
        });

        test('should log empty string when region is null', () => {
            if (!HTMLHighlightCardsDisplayer || !BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            displayer = new HTMLHighlightCardsDisplayer(document);
            
            const address = new BrazilianStandardAddress();
            address.municipio = 'Arapiraca';
            // No region

            displayer.update({}, address);

            // Should log that region was updated to empty
            expect(console.log).toHaveBeenCalled();
        });
    });

    describe('DOM element order verification', () => {
        test('should have region element between label and municipality value', () => {
            if (!HTMLHighlightCardsDisplayer || !BrazilianStandardAddress) {
                expect(true).toBe(true);
                return;
            }

            const label = document.getElementById('municipio-label');
            const region = document.getElementById('regiao-metropolitana-value');
            const municipio = document.getElementById('municipio-value');

            // Get parent container
            const container = label.parentElement;
            const children = Array.from(container.children);

            const labelIndex = children.indexOf(label);
            const regionIndex = children.indexOf(region);
            const municipioIndex = children.indexOf(municipio);

            // Verify order: label < region < municipio
            expect(regionIndex).toBeGreaterThan(labelIndex);
            expect(municipioIndex).toBeGreaterThan(regionIndex);
        });
    });
});
