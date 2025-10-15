/**
 * Tests for municipality change text announcements
 * Validates that the speech text includes both previous and current municipality
 * as specified in issue #218
 * 
 * @jest-environment node
 */

import { describe, test, expect, jest, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

// Mock DOM to prevent errors in test environment
global.document = undefined;

// Mock console to suppress logging during tests
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
};

// Mock setupParams that guia.js depends on
global.setupParams = {
    geolocationOptions: {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
    },
    positionUpdateTimeThreshold: 60000,
    positionUpdateDistanceThreshold: 50,
    validRefPlaceClasses: ['amenity', 'building', 'shop', 'place'],
    referencePlaceMap: {
        place: {
            city: 'Município',
            town: 'Cidade',
            village: 'Vila'
        },
        amenity: {
            cafe: 'Café',
            restaurant: 'Restaurante'
        }
    },
    noReferencePlace: 'Não classificado',
    independentQueueTimerInterval: 500
};

// Mock window.speechSynthesis for speech-related functionality
global.window = {
    speechSynthesis: {
        getVoices: jest.fn(() => []),
        speak: jest.fn(),
        cancel: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        onvoiceschanged: null
    }
};




// Import classes from guia.js
let BrazilianStandardAddress, HtmlSpeechSynthesisDisplayer;

const guiaModule = await import('../../src/guia.js');
    
    if (typeof global.BrazilianStandardAddress !== 'undefined') {
        BrazilianStandardAddress = global.BrazilianStandardAddress;
    }
    if (typeof global.HtmlSpeechSynthesisDisplayer !== 'undefined') {
        HtmlSpeechSynthesisDisplayer = global.HtmlSpeechSynthesisDisplayer;
    }
}

describe('Municipality Change Text Announcements (Issue #218)', () => {
    let mockDocument;
    let speechDisplayer;

    beforeEach(() => {
        // Create a minimal mock document
        mockDocument = {
            getElementById: jest.fn((id) => {
                if (id === 'text-to-speak') {
                    return { value: '' };
                }
                return null;
            })
        };

        // Create displayer instance
        const elementIds = {
            languageSelectId: 'language-select',
            voiceSelectId: 'voice-select',
            textInputId: 'text-to-speak',
            speakBtnId: 'speak-btn',
            pauseBtnId: 'pause-btn',
            resumeBtnId: 'resume-btn',
            stopBtnId: 'stop-btn',
            rateInputId: 'rate-input',
            rateValueId: 'rate-value',
            pitchInputId: 'pitch-input',
            pitchValueId: 'pitch-value'
        };

        if (HtmlSpeechSynthesisDisplayer) {
            speechDisplayer = new HtmlSpeechSynthesisDisplayer(mockDocument, elementIds);
        }
    });

    describe('buildTextToSpeechMunicipio method', () => {
        test('should include both previous and current municipality when changeDetails provided', () => {
            if (!speechDisplayer || !BrazilianStandardAddress) {
                console.warn('Classes not available - skipping test');
                return;
            }

            // Create current address
            const currentAddress = new BrazilianStandardAddress();
            currentAddress.municipio = 'Rio de Janeiro';
            currentAddress.uf = 'Rio de Janeiro';
            currentAddress.siglaUF = 'RJ';

            // Create changeDetails with previous municipality
            const changeDetails = {
                hasChanged: true,
                previous: {
                    municipio: 'São Paulo',
                    uf: 'SP'
                },
                current: {
                    municipio: 'Rio de Janeiro',
                    uf: 'RJ'
                },
                timestamp: Date.now()
            };

            const speechText = speechDisplayer.buildTextToSpeechMunicipio(currentAddress, changeDetails);

            // Verify the text matches the expected format from issue #218
            expect(speechText).toBe('Você saiu de São Paulo e entrou em Rio de Janeiro');
            expect(speechText).toContain('São Paulo');
            expect(speechText).toContain('Rio de Janeiro');
            expect(speechText).toContain('saiu de');
            expect(speechText).toContain('entrou em');
        });

        test('should fallback to simple text when no previous municipality', () => {
            if (!speechDisplayer || !BrazilianStandardAddress) {
                console.warn('Classes not available - skipping test');
                return;
            }

            const currentAddress = new BrazilianStandardAddress();
            currentAddress.municipio = 'Curitiba';
            currentAddress.siglaUF = 'PR';

            // No changeDetails provided
            const speechText = speechDisplayer.buildTextToSpeechMunicipio(currentAddress);

            expect(speechText).toBe('Você entrou no município de Curitiba');
            expect(speechText).toContain('Curitiba');
        });

        test('should handle first municipality visit (no previous)', () => {
            if (!speechDisplayer || !BrazilianStandardAddress) {
                console.warn('Classes not available - skipping test');
                return;
            }

            const currentAddress = new BrazilianStandardAddress();
            currentAddress.municipio = 'Brasília';
            currentAddress.siglaUF = 'DF';

            const changeDetails = {
                hasChanged: true,
                previous: {
                    municipio: null,  // First visit, no previous municipality
                    uf: null
                },
                current: {
                    municipio: 'Brasília',
                    uf: 'DF'
                }
            };

            const speechText = speechDisplayer.buildTextToSpeechMunicipio(currentAddress, changeDetails);

            // Should use fallback text when previous municipality is null
            expect(speechText).toBe('Você entrou no município de Brasília');
        });

        test('should return default text when current address has no municipio', () => {
            if (!speechDisplayer || !BrazilianStandardAddress) {
                console.warn('Classes not available - skipping test');
                return;
            }

            const currentAddress = new BrazilianStandardAddress();
            // No municipio set

            const speechText = speechDisplayer.buildTextToSpeechMunicipio(currentAddress);

            expect(speechText).toBe('Novo município detectado');
        });

        test('should handle realistic municipality changes across Brazil', () => {
            if (!speechDisplayer || !BrazilianStandardAddress) {
                console.warn('Classes not available - skipping test');
                return;
            }

            // Test various Brazilian cities
            const testCases = [
                {
                    previous: 'Porto Alegre',
                    current: 'Florianópolis',
                    expected: 'Você saiu de Porto Alegre e entrou em Florianópolis'
                },
                {
                    previous: 'Belo Horizonte',
                    current: 'Salvador',
                    expected: 'Você saiu de Belo Horizonte e entrou em Salvador'
                },
                {
                    previous: 'Recife',
                    current: 'Fortaleza',
                    expected: 'Você saiu de Recife e entrou em Fortaleza'
                }
            ];

            testCases.forEach(({ previous, current, expected }) => {
                const currentAddress = new BrazilianStandardAddress();
                currentAddress.municipio = current;

                const changeDetails = {
                    hasChanged: true,
                    previous: { municipio: previous },
                    current: { municipio: current }
                };

                const speechText = speechDisplayer.buildTextToSpeechMunicipio(currentAddress, changeDetails);
                expect(speechText).toBe(expected);
            });
        });
    });

    describe('Integration with update method', () => {
        test('should call buildTextToSpeechMunicipio when MunicipioChanged event occurs', () => {
            if (!speechDisplayer || !BrazilianStandardAddress) {
                console.warn('Classes not available - skipping test');
                return;
            }

            // Spy on the buildTextToSpeechMunicipio method
            const buildSpy = jest.spyOn(speechDisplayer, 'buildTextToSpeechMunicipio');

            const currentAddress = new BrazilianStandardAddress();
            currentAddress.municipio = 'Campinas';
            currentAddress.siglaUF = 'SP';

            const changeDetails = {
                hasChanged: true,
                previous: { municipio: 'Sorocaba', uf: 'SP' },
                current: { municipio: 'Campinas', uf: 'SP' }
            };

            // Call update method with MunicipioChanged event
            speechDisplayer.update(currentAddress, 'MunicipioChanged', null, changeDetails);

            // Verify buildTextToSpeechMunicipio was called with correct parameters
            expect(buildSpy).toHaveBeenCalledWith(currentAddress, changeDetails);
            expect(buildSpy).toHaveBeenCalledTimes(1);
        });

        test('should call buildTextToSpeechBairro when BairroChanged event occurs', () => {
            if (!speechDisplayer || !BrazilianStandardAddress) {
                console.warn('Classes not available - skipping test');
                return;
            }

            const buildSpy = jest.spyOn(speechDisplayer, 'buildTextToSpeechBairro');

            const currentAddress = new BrazilianStandardAddress();
            currentAddress.bairro = 'Jardins';

            speechDisplayer.update(currentAddress, 'BairroChanged', null, null);

            expect(buildSpy).toHaveBeenCalledWith(currentAddress);
        });

        test('should call buildTextToSpeechLogradouro when LogradouroChanged event occurs', () => {
            if (!speechDisplayer || !BrazilianStandardAddress) {
                console.warn('Classes not available - skipping test');
                return;
            }

            const buildSpy = jest.spyOn(speechDisplayer, 'buildTextToSpeechLogradouro');

            const currentAddress = new BrazilianStandardAddress();
            currentAddress.logradouro = 'Avenida Paulista';

            speechDisplayer.update(currentAddress, 'LogradouroChanged', null, null);

            expect(buildSpy).toHaveBeenCalledWith(currentAddress);
        });
    });
});
