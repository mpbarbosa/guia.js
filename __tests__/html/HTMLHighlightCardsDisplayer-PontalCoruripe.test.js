/**
 * @fileoverview Unit tests for HTMLHighlightCardsDisplayer with Pontal do Coruripe data
 * Tests highlight cards display using real-world Nominatim data from coastal Alagoas
 * 
 * Real-world test case: Rua da Praia, Pontal do Coruripe, Alagoas
 * Coordinates: -10.1594479, -36.1354556
 * 
 * @jest-environment node
 * @author MP Barbosa
 * @since 0.8.6-alpha
 */

'use strict';

import HTMLHighlightCardsDisplayer from '../../src/html/HTMLHighlightCardsDisplayer.js';
import BrazilianStandardAddress from '../../src/data/BrazilianStandardAddress.js';

// Real Nominatim response data from Pontal do Coruripe, Alagoas
const PONTAL_CORURIPE_ADDRESS = {
    road: "Rua da Praia",
    hamlet: "Pontal do Coruripe",
    state: "Alagoas",
    "ISO3166-2-lvl4": "BR-AL",
    region: "Região Nordeste",
    country: "Brasil",
    country_code: "br"
};

const PONTAL_CORURIPE_FULL = {
    place_id: 13731911,
    licence: "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
    osm_type: "way",
    osm_id: 169377494,
    lat: "-10.1594479",
    lon: "-36.1354556",
    class: "highway",
    type: "residential",
    place_rank: 26,
    importance: 0.05338622034027615,
    addresstype: "road",
    name: "Rua da Praia",
    display_name: "Rua da Praia, Pontal do Coruripe, Alagoas, Região Nordeste, Brasil",
    address: PONTAL_CORURIPE_ADDRESS,
    boundingbox: ["-10.1597767", "-10.1578791", "-36.1364781", "-36.1353974"]
};

describe('HTMLHighlightCardsDisplayer - Pontal do Coruripe Real Data', () => {
    let displayer;
    let mockDocument;
    let municipioElement;
    let bairroElement;

    beforeEach(() => {
        // Create mock DOM elements
        municipioElement = {
            textContent: ''
        };

        bairroElement = {
            textContent: ''
        };

        // Mock document with getElementById
        mockDocument = {
            getElementById: (id) => {
                if (id === 'municipio-value') return municipioElement;
                if (id === 'bairro-value') return bairroElement;
                return null;
            }
        };

        displayer = new HTMLHighlightCardsDisplayer(mockDocument);
    });

    describe('Pontal do Coruripe - Hamlet without Municipality', () => {
        test('should display hamlet as município when no city field exists', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';

            displayer.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Pontal do Coruripe, AL');
        });

        test('should display "—" for bairro when hamlet has no neighborhood subdivision', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';
            enderecoPadronizado.bairro = null;

            displayer.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);

            expect(bairroElement.textContent).toBe('—');
        });

        test('should handle Pontal do Coruripe with full Nominatim data', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';
            enderecoPadronizado.bairro = null;

            displayer.update(PONTAL_CORURIPE_FULL, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Pontal do Coruripe, AL');
            expect(bairroElement.textContent).toBe('—');
        });

        test('should preserve Portuguese characters in hamlet name', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';

            displayer.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);

            expect(municipioElement.textContent).toContain('Pontal');
            expect(municipioElement.textContent).toContain('Coruripe');
        });
    });

    describe('Alagoas State (AL) - Coastal Hamlet Display', () => {
        test('should display Alagoas state abbreviation correctly', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';

            displayer.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);

            expect(municipioElement.textContent).toContain('AL');
            expect(municipioElement.textContent).toMatch(/,\s*AL$/);
        });

        test('should handle Alagoas hamlet without bairro field', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';
            enderecoPadronizado.bairro = undefined;

            displayer.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);

            expect(bairroElement.textContent).toBe('—');
        });

        test('should display Coruripe municipality (parent of Pontal)', () => {
            // Pontal do Coruripe is actually part of Coruripe municipality
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Coruripe';
            enderecoPadronizado.siglaUF = 'AL';

            displayer.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Coruripe, AL');
        });

        test('should handle district/hamlet as bairro when provided', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Coruripe';
            enderecoPadronizado.siglaUF = 'AL';
            enderecoPadronizado.bairro = 'Pontal do Coruripe';

            displayer.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Coruripe, AL');
            expect(bairroElement.textContent).toBe('Pontal do Coruripe');
        });
    });

    describe('Northeastern Brazil - Hamlet Patterns', () => {
        test('should handle hamlet from Região Nordeste', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';
            enderecoPadronizado.uf = 'Alagoas';

            displayer.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Pontal do Coruripe, AL');
        });

        test('should handle coastal hamlet without postcode', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';
            enderecoPadronizado.cep = null;

            displayer.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Pontal do Coruripe, AL');
        });

        test('should display hamlet name with proper capitalization', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';

            displayer.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);

            // Check capitalization (Pontal, not pontal)
            expect(municipioElement.textContent).toMatch(/^Pontal/);
        });
    });

    describe('Hamlet vs City Distinction', () => {
        test('should differentiate hamlet from regular city', () => {
            // Hamlet case
            const hamletAddress = new BrazilianStandardAddress();
            hamletAddress.municipio = 'Pontal do Coruripe';
            hamletAddress.siglaUF = 'AL';
            hamletAddress.bairro = null;

            displayer.update(PONTAL_CORURIPE_ADDRESS, hamletAddress);
            const hamletDisplay = municipioElement.textContent;

            // City case (for comparison)
            const cityAddress = new BrazilianStandardAddress();
            cityAddress.municipio = 'Maceió';
            cityAddress.siglaUF = 'AL';
            cityAddress.bairro = 'Centro';

            municipioElement.textContent = '';
            bairroElement.textContent = '';
            displayer.update({}, cityAddress);
            const cityDisplay = municipioElement.textContent;

            expect(hamletDisplay).toBe('Pontal do Coruripe, AL');
            expect(cityDisplay).toBe('Maceió, AL');
        });

        test('should show hamlet has no bairro while city has', () => {
            // Hamlet: no bairro
            const hamletAddress = new BrazilianStandardAddress();
            hamletAddress.municipio = 'Pontal do Coruripe';
            hamletAddress.siglaUF = 'AL';
            hamletAddress.bairro = null;

            displayer.update(PONTAL_CORURIPE_ADDRESS, hamletAddress);
            expect(bairroElement.textContent).toBe('—');

            // City: with bairro
            municipioElement.textContent = '';
            bairroElement.textContent = '';

            const cityAddress = new BrazilianStandardAddress();
            cityAddress.municipio = 'Maceió';
            cityAddress.siglaUF = 'AL';
            cityAddress.bairro = 'Pajuçara';

            displayer.update({}, cityAddress);
            expect(bairroElement.textContent).toBe('Pajuçara');
        });
    });

    describe('Address Data Variations - Pontal do Coruripe', () => {
        test('should handle address with only hamlet field', () => {
            const addressWithOnlyHamlet = {
                hamlet: "Pontal do Coruripe",
                state: "Alagoas"
            };

            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';

            displayer.update(addressWithOnlyHamlet, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Pontal do Coruripe, AL');
        });

        test('should handle address with road + hamlet', () => {
            const addressWithRoadAndHamlet = {
                road: "Rua da Praia",
                hamlet: "Pontal do Coruripe",
                state: "Alagoas"
            };

            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';
            enderecoPadronizado.logradouro = 'Rua da Praia';

            displayer.update(addressWithRoadAndHamlet, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Pontal do Coruripe, AL');
        });

        test('should handle full ISO3166-2-lvl4 code extraction', () => {
            const addressWithISO = {
                hamlet: "Pontal do Coruripe",
                state: "Alagoas",
                "ISO3166-2-lvl4": "BR-AL"
            };

            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            // Extract AL from BR-AL
            const stateCode = addressWithISO["ISO3166-2-lvl4"].split('-')[1];
            enderecoPadronizado.siglaUF = stateCode;

            displayer.update(addressWithISO, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Pontal do Coruripe, AL');
        });
    });

    describe('Edge Cases - Pontal do Coruripe Scenarios', () => {
        test('should handle empty hamlet name', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = '';
            enderecoPadronizado.siglaUF = 'AL';

            displayer.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('—');
        });

        test('should handle null hamlet name', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = null;
            enderecoPadronizado.siglaUF = 'AL';

            displayer.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('—');
        });

        test('should handle undefined state abbreviation', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = undefined;

            displayer.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Pontal do Coruripe');
        });

        test('should handle whitespace-only hamlet name', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = '   ';
            enderecoPadronizado.siglaUF = 'AL';

            displayer.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);

            // municipioCompleto() returns whitespace + state
            expect(municipioElement.textContent).toBe('   , AL');
        });

        test('should handle null enderecoPadronizado', () => {
            expect(() => {
                displayer.update(PONTAL_CORURIPE_ADDRESS, null);
            }).not.toThrow();

            // Elements should remain unchanged
            expect(municipioElement.textContent).toBe('');
            expect(bairroElement.textContent).toBe('');
        });

        test('should handle undefined enderecoPadronizado', () => {
            expect(() => {
                displayer.update(PONTAL_CORURIPE_ADDRESS, undefined);
            }).not.toThrow();
        });
    });

    describe('BrazilianStandardAddress Integration', () => {
        test('should use municipioCompleto() method correctly', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';

            const result = enderecoPadronizado.municipioCompleto();
            expect(result).toBe('Pontal do Coruripe, AL');

            displayer.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);

            expect(municipioElement.textContent).toBe(result);
        });

        test('should handle BrazilianStandardAddress with all fields', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.logradouro = 'Rua da Praia';
            enderecoPadronizado.numero = 's/n';
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';
            enderecoPadronizado.uf = 'Alagoas';
            enderecoPadronizado.bairro = null;
            enderecoPadronizado.pais = 'Brasil';

            displayer.update(PONTAL_CORURIPE_FULL, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Pontal do Coruripe, AL');
            expect(bairroElement.textContent).toBe('—');
        });

        test('should verify BrazilianStandardAddress country is Brasil', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';

            expect(enderecoPadronizado.pais).toBe('Brasil');

            displayer.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Pontal do Coruripe, AL');
        });
    });

    describe('DOM Element Handling', () => {
        test('should not throw when municipio element is missing', () => {
            const mockDocNoMunicipio = {
                getElementById: (id) => {
                    if (id === 'bairro-value') return bairroElement;
                    return null;
                }
            };

            const displayerNoMunicipio = new HTMLHighlightCardsDisplayer(mockDocNoMunicipio);
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';

            expect(() => {
                displayerNoMunicipio.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);
            }).not.toThrow();
        });

        test('should not throw when bairro element is missing', () => {
            const mockDocNoBairro = {
                getElementById: (id) => {
                    if (id === 'municipio-value') return municipioElement;
                    return null;
                }
            };

            const displayerNoBairro = new HTMLHighlightCardsDisplayer(mockDocNoBairro);
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';

            expect(() => {
                displayerNoBairro.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);
            }).not.toThrow();
        });

        test('should not throw when both elements are missing', () => {
            const mockDocNoElements = {
                getElementById: () => null
            };

            const displayerNoElements = new HTMLHighlightCardsDisplayer(mockDocNoElements);
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';

            expect(() => {
                displayerNoElements.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);
            }).not.toThrow();
        });
    });

    describe('Multiple Updates - State Management', () => {
        test('should handle sequential updates with different hamlets', () => {
            // First update: Pontal do Coruripe
            const address1 = new BrazilianStandardAddress();
            address1.municipio = 'Pontal do Coruripe';
            address1.siglaUF = 'AL';

            displayer.update(PONTAL_CORURIPE_ADDRESS, address1);
            expect(municipioElement.textContent).toBe('Pontal do Coruripe, AL');

            // Second update: Different hamlet
            const address2 = new BrazilianStandardAddress();
            address2.municipio = 'Milho Verde';
            address2.siglaUF = 'MG';

            displayer.update({}, address2);
            expect(municipioElement.textContent).toBe('Milho Verde, MG');
        });

        test('should handle update from hamlet to city', () => {
            // First: hamlet
            const hamletAddress = new BrazilianStandardAddress();
            hamletAddress.municipio = 'Pontal do Coruripe';
            hamletAddress.siglaUF = 'AL';
            hamletAddress.bairro = null;

            displayer.update(PONTAL_CORURIPE_ADDRESS, hamletAddress);
            expect(municipioElement.textContent).toBe('Pontal do Coruripe, AL');
            expect(bairroElement.textContent).toBe('—');

            // Second: city with bairro
            const cityAddress = new BrazilianStandardAddress();
            cityAddress.municipio = 'Maceió';
            cityAddress.siglaUF = 'AL';
            cityAddress.bairro = 'Centro';

            displayer.update({}, cityAddress);
            expect(municipioElement.textContent).toBe('Maceió, AL');
            expect(bairroElement.textContent).toBe('Centro');
        });

        test('should maintain last valid state when null is passed', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';

            displayer.update(PONTAL_CORURIPE_ADDRESS, enderecoPadronizado);
            const initialMunicipio = municipioElement.textContent;

            displayer.update(PONTAL_CORURIPE_ADDRESS, null);
            expect(municipioElement.textContent).toBe(initialMunicipio);
        });
    });

    describe('Real-World Integration Scenarios', () => {
        test('should handle complete Pontal do Coruripe workflow', () => {
            // Simulate real geocoding workflow
            const addressData = PONTAL_CORURIPE_FULL;
            
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.logradouro = addressData.address.road;
            enderecoPadronizado.municipio = addressData.address.hamlet;
            
            // Extract state code from ISO3166-2-lvl4
            const isoCode = addressData.address["ISO3166-2-lvl4"];
            enderecoPadronizado.siglaUF = isoCode ? isoCode.split('-')[1] : null;
            enderecoPadronizado.uf = addressData.address.state;
            enderecoPadronizado.bairro = null; // No bairro in hamlet
            
            displayer.update(addressData, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Pontal do Coruripe, AL');
            expect(bairroElement.textContent).toBe('—');
        });

        test('should reflect geocoding result for coastal Alagoas hamlet', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Pontal do Coruripe';
            enderecoPadronizado.siglaUF = 'AL';
            enderecoPadronizado.bairro = null;

            displayer.update(PONTAL_CORURIPE_FULL, enderecoPadronizado);

            // Verify both cards updated
            expect(municipioElement.textContent).not.toBe('');
            expect(bairroElement.textContent).not.toBe('');
            
            // Verify correct values
            expect(municipioElement.textContent).toBe('Pontal do Coruripe, AL');
            expect(bairroElement.textContent).toBe('—');
        });
    });
});
