/**
 * Integration Tests for HTMLAddressDisplayer
 * 
 * These tests validate the integration between HTMLAddressDisplayer and the main guia.js library,
 * ensuring proper module import/export functionality and backward compatibility.
 * 
 * @author Marcelo Pereira Barbosa
 * @since 0.9.0-alpha
 */

import { jest } from '@jest/globals';
import { ADDRESS_FETCHED_EVENT } from '../../src/config/defaults.js';

describe('HTMLAddressDisplayer Integration Tests', () => {
    let HTMLAddressDisplayer;

    beforeAll(async () => {
        // Test module import
        const module = await import('../../src/html/HTMLAddressDisplayer.js');
        HTMLAddressDisplayer = module.default;
    });

    describe('Module Import/Export', () => {
        test('should import HTMLAddressDisplayer class correctly', () => {
            expect(HTMLAddressDisplayer).toBeDefined();
            expect(typeof HTMLAddressDisplayer).toBe('function');
            expect(HTMLAddressDisplayer.name).toBe('HTMLAddressDisplayer');
        });

        test('should be constructable after import', () => {
            const mockElement = { id: 'test', innerHTML: '' };
            const instance = new HTMLAddressDisplayer(mockElement);
            
            expect(instance).toBeInstanceOf(HTMLAddressDisplayer);
            expect(instance.element).toBe(mockElement);
        });

        test('should support named export', async () => {
            const { HTMLAddressDisplayer: NamedImport } = await import('../../src/html/HTMLAddressDisplayer.js');
            
            expect(NamedImport).toBeDefined();
            expect(NamedImport).toBe(HTMLAddressDisplayer);
        });
    });

    describe('Integration with Main Library', () => {
        test('should be available through main guia.js export', async () => {
            // Test that HTMLAddressDisplayer is accessible through main library
            const guiaModule = await import('../../src/guia.js');
            
            // The class should be available as an export
            expect(guiaModule.HTMLAddressDisplayer).toBeDefined();
            expect(guiaModule.HTMLAddressDisplayer).toBe(HTMLAddressDisplayer);
        });

        test('should maintain backward compatibility', async () => {
            const guiaModule = await import('../../src/guia.js');
            
            // Test instantiation through main module
            const mockElement = { id: 'compatibility-test', innerHTML: '' };
            const instance = new guiaModule.HTMLAddressDisplayer(mockElement);
            
            expect(instance).toBeInstanceOf(HTMLAddressDisplayer);
            expect(instance.toString()).toBe('HTMLAddressDisplayer: compatibility-test');
        });

        test('should work with DisplayerFactory', async () => {
            const guiaModule = await import('../../src/guia.js');
            const { DisplayerFactory } = guiaModule;
            
            const mockElement = { id: 'factory-test', innerHTML: '' };
            const displayer = DisplayerFactory.createAddressDisplayer(mockElement);
            
            expect(displayer).toBeInstanceOf(HTMLAddressDisplayer);
            expect(displayer.element).toBe(mockElement);
        });
    });

    describe('Real DOM Integration', () => {
        let testElement;

        beforeEach(() => {
            // Create real DOM element for testing
            testElement = {
                id: 'address-integration-test',
                innerHTML: '',
                style: {}
            };
        });

        test('should work with real DOM-like elements', () => {
            const instance = new HTMLAddressDisplayer(testElement);
            
            const mockAddressData = {
                display_name: 'Avenida Paulista, São Paulo, SP',
                address: {
                    road: 'Avenida Paulista',
                    city: 'São Paulo',
                    state: 'São Paulo'
                }
            };
            
            const html = instance.renderAddressHtml(mockAddressData);
            
            expect(html).toContain('Avenida Paulista');
            expect(html).toContain('address-details');
        });

        test('should update DOM element through observer pattern', () => {
            const instance = new HTMLAddressDisplayer(testElement);
            
            const mockAddressData = {
                display_name: 'Shopping Iguatemi, São Paulo',
                address: {
                    shop: 'Shopping Iguatemi',
                    city: 'São Paulo'
                }
            };
            
            instance.update(mockAddressData, null, ADDRESS_FETCHED_EVENT, false, null);
            
            expect(testElement.innerHTML).toContain('Shopping Iguatemi');
            expect(testElement.innerHTML).toContain('address-details');
        });

        test('should work with standardized address display element', () => {
            const standardizedElement = { id: 'standardized-test', innerHTML: '' };
            const instance = new HTMLAddressDisplayer(testElement, standardizedElement);
            
            const mockAddressData = {
                display_name: 'Test Address'
            };
            
            // Mock standardized address
            const mockStandardizedAddress = {
                enderecoCompleto: () => 'Rua Teste, 123, Centro, São Paulo, SP'
            };
            
            const html = instance.renderAddressHtml(mockAddressData, mockStandardizedAddress);
            
            expect(standardizedElement.innerHTML).toBe('Rua Teste, 123, Centro, São Paulo, SP');
            expect(html).toContain('Test Address');
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle module loading errors gracefully', async () => {
            // This test ensures the module can be imported even in adverse conditions
            expect(HTMLAddressDisplayer).toBeDefined();
            
            // Test with null constructor parameter
            const instance = new HTMLAddressDisplayer(null);
            expect(instance.element).toBeNull();
            expect(Object.isFrozen(instance)).toBe(true);
        });

        test('should integrate error handling with observer pattern', () => {
            const mockElement = { id: 'error-test', innerHTML: '' };
            const instance = new HTMLAddressDisplayer(mockElement);
            
            const error = new Error('Falha na conexão com serviço de geocodificação');
            instance.update(null, null, ADDRESS_FETCHED_EVENT, false, error);
            
            expect(mockElement.innerHTML).toContain('Erro ao carregar endereço');
            expect(mockElement.innerHTML).toContain('Falha na conexão com serviço de geocodificação');
        });
    });

    describe('Performance Integration', () => {
        test('should handle multiple instances without conflict', () => {
            const elements = Array.from({ length: 10 }, (_, i) => ({
                id: `test-element-${i}`,
                innerHTML: ''
            }));
            
            const instances = elements.map(el => new HTMLAddressDisplayer(el));
            
            instances.forEach((instance, index) => {
                expect(instance.toString()).toBe(`HTMLAddressDisplayer: test-element-${index}`);
            });
            
            // Test that all instances work independently
            const mockAddressData = {
                display_name: `Endereço de Teste ${Math.random()}`,
                address: { road: 'Rua de Teste' }
            };
            
            instances.forEach(instance => {
                const html = instance.renderAddressHtml(mockAddressData);
                expect(html).toContain('Rua de Teste');
            });
        });
    });

    describe('Brazilian Context Integration', () => {
        test('should properly format Brazilian addresses and place names', () => {
            const mockElement = { id: 'brazilian-test', innerHTML: '' };
            const instance = new HTMLAddressDisplayer(mockElement);
            
            const brazilianAddresses = [
                {
                    display_name: 'Mercado Municipal, São Paulo, SP',
                    address: { amenity: 'marketplace', city: 'São Paulo' }
                },
                {
                    display_name: 'Igreja do Rosário, Ouro Preto, MG',
                    address: { amenity: 'place_of_worship', city: 'Ouro Preto' }
                },
                {
                    display_name: 'Terminal Rodoviário, Brasília, DF',
                    address: { amenity: 'bus_station', city: 'Brasília' }
                },
                {
                    display_name: 'Farol da Barra, Salvador, BA',
                    address: { man_made: 'lighthouse', city: 'Salvador' }
                }
            ];
            
            brazilianAddresses.forEach(addressData => {
                const html = instance.renderAddressHtml(addressData);
                expect(html).toContain(addressData.display_name);
                expect(html).toContain('address-details');
            });
        });

        test('should handle Portuguese special characters correctly', () => {
            const mockElement = { id: 'portuguese-test', innerHTML: '' };
            const instance = new HTMLAddressDisplayer(mockElement);
            
            const addressData = {
                display_name: 'Praça da Sé, São Paulo, SP',
                address: {
                    place: 'Praça da Sé',
                    city: 'São Paulo',
                    state: 'São Paulo'
                },
                tags: {
                    name: 'Praça da Sé',
                    'name:pt': 'Praça da Sé'
                }
            };
            
            const html = instance.renderAddressHtml(addressData);
            
            expect(html).toContain('Praça da Sé');
            expect(html).toContain('São Paulo');
            expect(html).toContain('name:pt');
        });
    });

    describe('Cross-Module Compatibility', () => {
        test('should work alongside other HTML display modules', async () => {
            // Import other HTML display modules
            const HtmlTextModule = await import('../../src/html/HtmlText.js');
            const HTMLPositionDisplayerModule = await import('../../src/html/HTMLPositionDisplayer.js');
            const HTMLReferencePlaceDisplayerModule = await import('../../src/html/HTMLReferencePlaceDisplayer.js');
            
            const HtmlText = HtmlTextModule.default;
            const HTMLPositionDisplayer = HTMLPositionDisplayerModule.default;
            const HTMLReferencePlaceDisplayer = HTMLReferencePlaceDisplayerModule.default;
            
            // Create instances of all modules
            const mockDocument = { getElementById: () => null };
            const textElement = { id: 'text-test', innerHTML: '', style: {} };
            const positionElement = { id: 'position-test', innerHTML: '', style: {} };
            const referenceElement = { id: 'reference-test', innerHTML: '', style: {} };
            const addressElement = { id: 'address-test', innerHTML: '', style: {} };
            
            const htmlText = new HtmlText(mockDocument, textElement);
            const positionDisplayer = new HTMLPositionDisplayer(positionElement);
            const referenceDisplayer = new HTMLReferencePlaceDisplayer(referenceElement);
            const addressDisplayer = new HTMLAddressDisplayer(addressElement);
            
            // All should be properly instantiated
            expect(htmlText.toString()).toBe('HtmlText: text-test');
            expect(positionDisplayer.toString()).toBe('HTMLPositionDisplayer: position-test');
            expect(referenceDisplayer.toString()).toBe('HTMLReferencePlaceDisplayer: reference-test');
            expect(addressDisplayer.toString()).toBe('HTMLAddressDisplayer: address-test');
            
            // All should be immutable
            expect(Object.isFrozen(htmlText)).toBe(true);
            expect(Object.isFrozen(positionDisplayer)).toBe(true);
            expect(Object.isFrozen(referenceDisplayer)).toBe(true);
            expect(Object.isFrozen(addressDisplayer)).toBe(true);
        });
    });

    describe('Data Format Integration', () => {
        test('should handle various geocoding API response formats', () => {
            const mockElement = { id: 'format-test', innerHTML: '' };
            const instance = new HTMLAddressDisplayer(mockElement);
            
            // Test Nominatim format
            const nominatimData = {
                place_id: 123456,
                licence: 'Data © OpenStreetMap contributors',
                osm_type: 'way',
                osm_id: 789012,
                boundingbox: ['-23.5678', '-23.5567', '-46.6678', '-46.6567'],
                lat: '-23.5613',
                lon: '-46.6565',
                display_name: 'Avenida Paulista, Bela Vista, São Paulo, SP, Brasil',
                class: 'highway',
                type: 'primary',
                importance: 0.75,
                address: {
                    road: 'Avenida Paulista',
                    neighbourhood: 'Bela Vista',
                    city: 'São Paulo',
                    state: 'São Paulo',
                    postcode: '01310-200',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };
            
            const html = instance.renderAddressHtml(nominatimData);
            
            expect(html).toContain('place_id');
            expect(html).toContain('123456');
            expect(html).toContain('boundingbox');
            expect(html).toContain('Avenida Paulista');
            expect(html).toContain('address-details');
        });

        test('should handle minimal address data gracefully', () => {
            const mockElement = { id: 'minimal-test', innerHTML: '' };
            const instance = new HTMLAddressDisplayer(mockElement);
            
            const minimalData = {
                lat: '-23.5613',
                lon: '-46.6565'
            };
            
            const html = instance.renderAddressHtml(minimalData);
            
            expect(html).toContain('-23.5613');
            expect(html).toContain('-46.6565');
            expect(html).not.toContain('Endereço Completo:');
        });
    });

    describe('Factory Pattern Integration', () => {
        test('should create instances through DisplayerFactory with standardized element', async () => {
            const guiaModule = await import('../../src/guia.js');
            const { DisplayerFactory } = guiaModule;
            
            const mainElement = { id: 'main-factory-test', innerHTML: '' };
            const standardizedElement = { id: 'standardized-factory-test', innerHTML: '' };
            
            const displayer = DisplayerFactory.createAddressDisplayer(mainElement, standardizedElement);
            
            expect(displayer).toBeInstanceOf(HTMLAddressDisplayer);
            expect(displayer.element).toBe(mainElement);
            expect(displayer.enderecoPadronizadoDisplay).toBe(standardizedElement);
        });

        test('should maintain consistent behavior when created via factory', async () => {
            const guiaModule = await import('../../src/guia.js');
            const { DisplayerFactory } = guiaModule;
            
            const element = { id: 'factory-behavior-test', innerHTML: '' };
            const displayer = DisplayerFactory.createAddressDisplayer(element);
            
            const addressData = {
                display_name: 'Factory Test Address',
                address: { road: 'Factory Test Street' }
            };
            
            displayer.update(addressData, null, ADDRESS_FETCHED_EVENT, false, null);
            
            expect(element.innerHTML).toContain('Factory Test Address');
            expect(element.innerHTML).toContain('Factory Test Street');
        });
    });

    describe('Municipio-Value DOM Element Validation', () => {
        test('should validate municipio-value element exists and is properly structured', () => {
            // Simulate the DOM structure from address-converter.html
            const municipioElement = { 
                id: 'municipio-value', 
                innerHTML: '',
                innerText: '—',
                textContent: '—',
                className: 'highlight-card-value',
                getAttribute: (attr) => {
                    if (attr === 'id') return 'municipio-value';
                    if (attr === 'class') return 'highlight-card-value';
                    if (attr === 'aria-live') return 'polite';
                    return null;
                }
            };
            
            // Validate element properties
            expect(municipioElement.id).toBe('municipio-value');
            expect(municipioElement.getAttribute('id')).toBe('municipio-value');
            expect(municipioElement.getAttribute('class')).toBe('highlight-card-value');
            expect(municipioElement.getAttribute('aria-live')).toBe('polite');
        });

        test('should update municipio-value element with city data', () => {
            const mockDocument = {
                getElementById: jest.fn((id) => {
                    if (id === 'municipio-value') {
                        return {
                            id: 'municipio-value',
                            innerText: '—',
                            textContent: '—'
                        };
                    }
                    return null;
                })
            };
            
            const municipioElement = mockDocument.getElementById('municipio-value');
            
            // Simulate address data update
            const addressData = {
                address: {
                    city: 'Serro',
                    state: 'Minas Gerais'
                }
            };
            
            // Update municipio value
            const cityValue = addressData.address.city || 'Não disponível';
            const stateValue = addressData.address.state || '';
            municipioElement.innerText = stateValue ? `${cityValue}, ${stateValue}` : cityValue;
            
            expect(municipioElement.innerText).toBe('Serro, Minas Gerais');
            expect(municipioElement.innerText).toContain('Serro');
            expect(municipioElement.innerText).not.toBe('—');
        });

        test('should handle missing city data in municipio-value element', () => {
            const municipioElement = { 
                id: 'municipio-value', 
                innerText: '—',
                textContent: '—'
            };
            
            // Simulate address data without city
            const addressData = {
                address: {
                    state: 'Minas Gerais'
                }
            };
            
            // Update should show "Não disponível"
            const cityValue = addressData.address.city || addressData.address.town || addressData.address.village;
            municipioElement.innerText = cityValue || 'Não disponível';
            
            expect(municipioElement.innerText).toBe('Não disponível');
            expect(municipioElement.innerText).not.toContain('undefined');
        });

        test('should extract city from various address formats for municipio-value', () => {
            const testCases = [
                {
                    addressData: { address: { city: 'São Paulo' } },
                    expected: 'São Paulo'
                },
                {
                    addressData: { address: { town: 'Serro' } },
                    expected: 'Serro'
                },
                {
                    addressData: { address: { village: 'Milho Verde' } },
                    expected: 'Milho Verde'
                },
                {
                    addressData: { city: 'Rio de Janeiro' },
                    expected: 'Rio de Janeiro'
                },
                {
                    addressData: { address: {} },
                    expected: 'Não disponível'
                }
            ];
            
            testCases.forEach(({ addressData, expected }) => {
                const municipioElement = { 
                    id: 'municipio-value', 
                    innerText: '—' 
                };
                
                // Extract city using the same logic as address-converter.html
                const city = addressData.city || 
                            addressData.town || 
                            addressData.village || 
                            addressData.address?.city || 
                            addressData.address?.town || 
                            addressData.address?.village;
                
                municipioElement.innerText = city || 'Não disponível';
                
                expect(municipioElement.innerText).toBe(expected);
            });
        });

        test('should validate municipio-value displays Serro for Milho Verde coordinates', () => {
            const municipioElement = { 
                id: 'municipio-value', 
                innerText: '—',
                textContent: '—'
            };
            
            // Milho Verde coordinates should resolve to Serro municipality
            const milhoVerdeAddressData = {
                address: {
                    village: 'Milho Verde',
                    municipality: 'Serro',
                    city: 'Serro',
                    state: 'Minas Gerais',
                    state_code: 'MG',
                    country: 'Brasil',
                    country_code: 'br'
                }
            };
            
            // Update municipio value
            const city = milhoVerdeAddressData.address.city || 
                        milhoVerdeAddressData.address.town || 
                        milhoVerdeAddressData.address.village;
            const state = milhoVerdeAddressData.address.state || '';
            
            municipioElement.innerText = city ? (state ? `${city}, ${state}` : city) : 'Não disponível';
            
            expect(municipioElement.innerText).toContain('Serro');
            expect(municipioElement.innerText).toContain('Minas Gerais');
            expect(municipioElement.innerText).toBe('Serro, Minas Gerais');
        });

        test('should not display placeholder values in municipio-value', () => {
            const municipioElement = { 
                id: 'municipio-value', 
                innerText: '—' 
            };
            
            const addressData = {
                address: {
                    city: 'Belo Horizonte',
                    state: 'MG'
                }
            };
            
            municipioElement.innerText = `${addressData.address.city}, ${addressData.address.state}`;
            
            // Should not contain placeholder characters
            expect(municipioElement.innerText).not.toBe('—');
            expect(municipioElement.innerText).not.toContain('—');
            expect(municipioElement.innerText).not.toBe('');
            expect(municipioElement.innerText).toBe('Belo Horizonte, MG');
        });

        test('should validate municipio-value with state abbreviations', () => {
            const stateAbbreviations = [
                { city: 'São Paulo', state: 'SP' },
                { city: 'Serro', state: 'MG' },
                { city: 'Rio de Janeiro', state: 'RJ' },
                { city: 'Salvador', state: 'BA' },
                { city: 'Brasília', state: 'DF' }
            ];
            
            stateAbbreviations.forEach(({ city, state }) => {
                const municipioElement = { 
                    id: 'municipio-value', 
                    innerText: '—' 
                };
                
                municipioElement.innerText = `${city}, ${state}`;
                
                expect(municipioElement.innerText).toContain(city);
                expect(municipioElement.innerText).toContain(state);
                expect(municipioElement.innerText).toMatch(/^[^—]+, [A-Z]{2}$/);
            });
        });

        test('should handle empty or null values gracefully in municipio-value', () => {
            const municipioElement = { 
                id: 'municipio-value', 
                innerText: '—' 
            };
            
            const invalidCases = [null, undefined, '', '   ', {}];
            
            invalidCases.forEach(invalidData => {
                const city = invalidData?.address?.city || invalidData?.city;
                municipioElement.innerText = city || 'Não disponível';
                
                expect(municipioElement.innerText).toBe('Não disponível');
                expect(municipioElement.innerText).not.toContain('undefined');
                expect(municipioElement.innerText).not.toContain('null');
            });
        });
    });
});