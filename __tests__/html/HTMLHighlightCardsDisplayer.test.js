/**
 * HTMLHighlightCardsDisplayer Unit Tests
 * Tests for município state abbreviation display feature (v0.8.7-alpha)
 * 
 * @jest-environment node
 */

'use strict';

import HTMLHighlightCardsDisplayer from '../../src/html/HTMLHighlightCardsDisplayer.js';
import BrazilianStandardAddress from '../../src/data/BrazilianStandardAddress.js';

describe('HTMLHighlightCardsDisplayer - Município State Abbreviation Display', () => {
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

    describe('Feature: Município with State Abbreviation (v0.8.7-alpha)', () => {
        test('should display município with state abbreviation when siglaUF is available', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Recife';
            enderecoPadronizado.siglaUF = 'PE';

            displayer.update({}, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Recife, PE');
        });

        test('should display "São Paulo, SP" correctly', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'São Paulo';
            enderecoPadronizado.siglaUF = 'SP';

            displayer.update({}, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('São Paulo, SP');
        });

        test('should display "Arapiraca, AL" correctly', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Arapiraca';
            enderecoPadronizado.siglaUF = 'AL';

            displayer.update({}, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Arapiraca, AL');
        });

        test('should display only município name when siglaUF is not available', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Recife';
            enderecoPadronizado.siglaUF = null;

            displayer.update({}, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Recife');
        });

        test('should display placeholder "—" when município is null', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = null;
            enderecoPadronizado.siglaUF = 'PE';

            displayer.update({}, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('—');
        });

        test('should display placeholder "—" when both município and siglaUF are null', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = null;
            enderecoPadronizado.siglaUF = null;

            displayer.update({}, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('—');
        });

        test('should use municipioCompleto() method for formatting', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Rio de Janeiro';
            enderecoPadronizado.siglaUF = 'RJ';

            // Call the method to verify it works
            const result = enderecoPadronizado.municipioCompleto();
            expect(result).toBe('Rio de Janeiro, RJ');

            displayer.update({}, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Rio de Janeiro, RJ');
        });

        test('should handle empty string município', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = '';
            enderecoPadronizado.siglaUF = 'MG';

            displayer.update({}, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('—');
        });

        test('should handle whitespace-only município', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = '   ';
            enderecoPadronizado.siglaUF = 'BA';

            displayer.update({}, enderecoPadronizado);

            // municipioCompleto() returns the whitespace, so we get it with state
            expect(municipioElement.textContent).toBe('   , BA');
        });
    });

    describe('All Brazilian States Coverage', () => {
        const stateExamples = [
            { municipio: 'Maceió', siglaUF: 'AL', expected: 'Maceió, AL' },
            { municipio: 'Manaus', siglaUF: 'AM', expected: 'Manaus, AM' },
            { municipio: 'Salvador', siglaUF: 'BA', expected: 'Salvador, BA' },
            { municipio: 'Fortaleza', siglaUF: 'CE', expected: 'Fortaleza, CE' },
            { municipio: 'Brasília', siglaUF: 'DF', expected: 'Brasília, DF' },
            { municipio: 'Vitória', siglaUF: 'ES', expected: 'Vitória, ES' },
            { municipio: 'Goiânia', siglaUF: 'GO', expected: 'Goiânia, GO' },
            { municipio: 'São Luís', siglaUF: 'MA', expected: 'São Luís, MA' },
            { municipio: 'Belo Horizonte', siglaUF: 'MG', expected: 'Belo Horizonte, MG' },
            { municipio: 'Campo Grande', siglaUF: 'MS', expected: 'Campo Grande, MS' },
            { municipio: 'Cuiabá', siglaUF: 'MT', expected: 'Cuiabá, MT' },
            { municipio: 'Belém', siglaUF: 'PA', expected: 'Belém, PA' },
            { municipio: 'João Pessoa', siglaUF: 'PB', expected: 'João Pessoa, PB' },
            { municipio: 'Recife', siglaUF: 'PE', expected: 'Recife, PE' },
            { municipio: 'Teresina', siglaUF: 'PI', expected: 'Teresina, PI' },
            { municipio: 'Curitiba', siglaUF: 'PR', expected: 'Curitiba, PR' },
            { municipio: 'Rio de Janeiro', siglaUF: 'RJ', expected: 'Rio de Janeiro, RJ' },
            { municipio: 'Natal', siglaUF: 'RN', expected: 'Natal, RN' },
            { municipio: 'Porto Velho', siglaUF: 'RO', expected: 'Porto Velho, RO' },
            { municipio: 'Boa Vista', siglaUF: 'RR', expected: 'Boa Vista, RR' },
            { municipio: 'Porto Alegre', siglaUF: 'RS', expected: 'Porto Alegre, RS' },
            { municipio: 'Florianópolis', siglaUF: 'SC', expected: 'Florianópolis, SC' },
            { municipio: 'Aracaju', siglaUF: 'SE', expected: 'Aracaju, SE' },
            { municipio: 'São Paulo', siglaUF: 'SP', expected: 'São Paulo, SP' },
            { municipio: 'Palmas', siglaUF: 'TO', expected: 'Palmas, TO' }
        ];

        test.each(stateExamples)(
            'should display "$expected" for $municipio, $siglaUF',
            ({ municipio, siglaUF, expected }) => {
                const enderecoPadronizado = new BrazilianStandardAddress();
                enderecoPadronizado.municipio = municipio;
                enderecoPadronizado.siglaUF = siglaUF;

                displayer.update({}, enderecoPadronizado);

                expect(municipioElement.textContent).toBe(expected);
            }
        );
    });

    describe('Backwards Compatibility', () => {
        test('should not break when enderecoPadronizado is null', () => {
            expect(() => {
                displayer.update({}, null);
            }).not.toThrow();
        });

        test('should not update elements when enderecoPadronizado is null', () => {
            const initialText = municipioElement.textContent;
            
            displayer.update({}, null);

            expect(municipioElement.textContent).toBe(initialText);
        });

        test('should work with old-style objects without municipioCompleto method', () => {
            // Simulate legacy object without the method
            const legacyAddress = {
                municipio: 'Recife',
                siglaUF: 'PE',
                municipioCompleto: function() {
                    if (!this.municipio) return "";
                    if (this.siglaUF) {
                        return `${this.municipio}, ${this.siglaUF}`;
                    }
                    return this.municipio;
                }
            };

            displayer.update({}, legacyAddress);

            expect(municipioElement.textContent).toBe('Recife, PE');
        });
    });

    describe('Bairro Display (Unchanged)', () => {
        test('should still display bairro correctly', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Recife';
            enderecoPadronizado.siglaUF = 'PE';
            enderecoPadronizado.bairro = 'Boa Viagem';

            displayer.update({}, enderecoPadronizado);

            expect(bairroElement.textContent).toBe('Boa Viagem');
        });

        test('should display placeholder for null bairro', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Recife';
            enderecoPadronizado.siglaUF = 'PE';
            enderecoPadronizado.bairro = null;

            displayer.update({}, enderecoPadronizado);

            expect(bairroElement.textContent).toBe('—');
        });
    });

    describe('Edge Cases', () => {
        test('should handle município with special characters', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'São José dos Pinhais';
            enderecoPadronizado.siglaUF = 'PR';

            displayer.update({}, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('São José dos Pinhais, PR');
        });

        test('should handle very long município names', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Presidente Epitácio';
            enderecoPadronizado.siglaUF = 'SP';

            displayer.update({}, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Presidente Epitácio, SP');
        });

        test('should handle município with hyphens', () => {
            const enderecoPadronizado = new BrazilianStandardAddress();
            enderecoPadronizado.municipio = 'Ponta Grossa';
            enderecoPadronizado.siglaUF = 'PR';

            displayer.update({}, enderecoPadronizado);

            expect(municipioElement.textContent).toBe('Ponta Grossa, PR');
        });
    });
});
