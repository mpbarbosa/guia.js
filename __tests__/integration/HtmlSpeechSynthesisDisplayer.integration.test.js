/**
 * Integration tests for HtmlSpeechSynthesisDisplayer class.
 * 
 * This test suite provides comprehensive integration testing for the HtmlSpeechSynthesisDisplayer
 * class, testing real-world scenarios, module compatibility, UI interactions, and cross-browser
 * compatibility. These tests focus on how the HtmlSpeechSynthesisDisplayer interacts with other
 * components in the MP Barbosa Travel Guide system.
 * 
 * Test Categories:
 * - Module compatibility and dependency integration
 * - Real DOM interaction and event handling
 * - SpeechSynthesisManager integration scenarios
 * - Observer pattern integration with PositionManager
 * - Cross-browser compatibility scenarios
 * - Accessibility features and screen reader compatibility
 * - Performance considerations and memory management
 * - Edge cases in production-like environments
 * 
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import { jest } from '@jest/globals';

// TODO: Setup real DOM environment for integration testing
// DOM testing not yet implemented - consider happy-dom when needed
// Note: guia.js library includes jsdom as transitive dependency if needed
// import { JSDOM } from 'jsdom';

// Create a mock DOM environment (DOM testing not yet implemented)
const mockWindow = {
    document: {
        getElementById: jest.fn(),
        createElement: jest.fn(),
    },
    navigator: {},
    SpeechSynthesisUtterance: jest.fn(),
    speechSynthesis: {},
    close: jest.fn()
};

// Create a more realistic DOM environment (temporarily using mock instead of JSDOM)
const dom = {
    window: mockWindow
};

/*
// DOM testing not yet implemented - consider happy-dom alternative if needed
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
    <title>MP Barbosa Travel Guide - Speech Synthesis Test</title>
    <meta charset="UTF-8">
</head>
<body>
    <div id="speech-controls">
        <select id="language"></select>
        <select id="voice-select"></select>
        <textarea id="text-input" placeholder="Texto para falar..."></textarea>
        <button id="speak-btn">Falar</button>
        <button id="pause-btn">Pausar</button>
        <button id="resume-btn">Retomar</button>
        <button id="stop-btn">Parar</button>
        <div class="controls">
            <label for="rate">Velocidade:</label>
            <input type="range" id="rate" min="0.1" max="2" step="0.1" value="1">
            <span id="rate-value">1.0</span>
        </div>
        <div class="controls">
            <label for="pitch">Tom:</label>
            <input type="range" id="pitch" min="0" max="2" step="0.1" value="1">
            <span id="pitch-value">1.0</span>
        </div>
    </div>
</body>
</html>
`, {
    url: 'http://localhost:8080',
    pretendToBeVisual: true,
    resources: 'usable'
});
*/

// Setup global environment
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Mock Web Speech API for comprehensive testing
const mockUtterance = {
    text: '',
    rate: 1,
    pitch: 1,
    voice: null,
    onstart: null,
    onend: null,
    onerror: null
};

const mockSpeechSynthesis = {
    speaking: false,
    pending: false,
    paused: false,
    voices: [
        { name: 'Google português do Brasil', lang: 'pt-BR', default: false },
        { name: 'Microsoft Helena', lang: 'pt-PT', default: false },
        { name: 'Alex', lang: 'en-US', default: true }
    ],
    onvoiceschanged: null,
    
    speak: jest.fn((utterance) => {
        mockSpeechSynthesis.speaking = true;
        mockSpeechSynthesis.pending = false;
        if (utterance.onstart) {
            setTimeout(() => utterance.onstart(), 10);
        }
        if (utterance.onend) {
            setTimeout(() => {
                utterance.onend();
                mockSpeechSynthesis.speaking = false;
            }, 100);
        }
    }),
    
    cancel: jest.fn(() => {
        mockSpeechSynthesis.speaking = false;
        mockSpeechSynthesis.pending = false;
        mockSpeechSynthesis.paused = false;
    }),
    
    pause: jest.fn(() => {
        mockSpeechSynthesis.paused = true;
    }),
    
    resume: jest.fn(() => {
        mockSpeechSynthesis.paused = false;
    }),
    
    getVoices: jest.fn(() => mockSpeechSynthesis.voices)
};

global.window.SpeechSynthesisUtterance = jest.fn(() => ({ ...mockUtterance }));
global.window.speechSynthesis = mockSpeechSynthesis;

// Mock console for cleaner test output
global.console = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
};

// Real implementations for testing integration
class IntegrationSpeechSynthesisManager {
    constructor() {
        this.synth = global.window.speechSynthesis;
        this.voice = null;
        this.rate = 1.0;
        this.pitch = 1.0;
        this.isCurrentlySpeaking = false;
        this.speechQueue = {
            queue: [],
            size: () => this.speechQueue.queue.length,
            enqueue: (item) => this.speechQueue.queue.push(item),
            dequeue: () => this.speechQueue.queue.shift()
        };
    }

    setVoice(voice) {
        this.voice = voice;
    }

    setRate(rate) {
        this.rate = parseFloat(rate);
    }

    setPitch(pitch) {
        this.pitch = parseFloat(pitch);
    }

    speak(text, priority = 0) {
        if (!text) return null;

        const utterance = new global.window.SpeechSynthesisUtterance(text);
        utterance.voice = this.voice;
        utterance.rate = this.rate;
        utterance.pitch = this.pitch;

        utterance.onstart = () => {
            this.isCurrentlySpeaking = true;
        };

        utterance.onend = () => {
            this.isCurrentlySpeaking = false;
        };

        utterance.onerror = () => {
            this.isCurrentlySpeaking = false;
        };

        this.synth.speak(utterance);
        return utterance;
    }

    pause() {
        this.synth.pause();
    }

    resume() {
        this.synth.resume();
    }

    stop() {
        this.synth.cancel();
        this.isCurrentlySpeaking = false;
    }

    startQueueTimer() {
        // Mock timer implementation
    }
}

const IntegrationPositionManager = {
    strCurrPosUpdate: 'PositionManager updated',
    strImmediateAddressUpdate: 'Immediate address update'
};

// TODO: Mock the module imports for integration (disabled while test is skipped)
/*
jest.unstable_mockModule('../../src/guia.js', () => ({
    SpeechSynthesisManager: IntegrationSpeechSynthesisManager
}));

jest.unstable_mockModule('../../src/core/PositionManager.js', () => ({
    default: IntegrationPositionManager
}));
*/

// Import the class under test
let HtmlSpeechSynthesisDisplayer;
try {
    HtmlSpeechSynthesisDisplayer = (await import('../../src/html/HtmlSpeechSynthesisDisplayer.js')).default;
} catch (e) {
    // Test is skipped anyway, mock it
    HtmlSpeechSynthesisDisplayer = class {};
}

// Helper class for realistic address testing
class TestBrazilianStandardAddress {
    constructor(data = {}) {
        this.logradouro = data.logradouro || null;
        this.numero = data.numero || null;
        this.bairro = data.bairro || null;
        this.municipio = data.municipio || null;
        this.uf = data.uf || 'SP';
        this.cep = data.cep || null;
    }

    logradouroCompleto() {
        if (this.logradouro && this.numero) {
            return `${this.logradouro}, ${this.numero}`;
        }
        return this.logradouro || 'Endereço não disponível';
    }

    bairroCompleto() {
        return this.bairro || 'Bairro não disponível';
    }

    toString() {
        const parts = [];
        if (this.logradouro) parts.push(this.logradouroCompleto());
        if (this.bairro) parts.push(this.bairro);
        if (this.municipio) parts.push(this.municipio);
        if (this.uf) parts.push(this.uf);
        return parts.join(', ') || 'Endereço não disponível';
    }
}

// TODO: DOM testing not yet implemented
// Consider happy-dom (84% smaller, better ES module support) when enabling these tests
describe.skip('HtmlSpeechSynthesisDisplayer Integration Tests - MP Barbosa Travel Guide (v0.9.0-alpha)', () => {
    let displayer;
    let elementIds;

    beforeEach(() => {
        jest.clearAllMocks();

        // Reset speech synthesis mocks
        mockSpeechSynthesis.speaking = false;
        mockSpeechSynthesis.pending = false;
        mockSpeechSynthesis.paused = false;

        // Setup element IDs for real DOM elements
        elementIds = {
            languageSelectId: 'language',
            voiceSelectId: 'voice-select',
            textInputId: 'text-input',
            speakBtnId: 'speak-btn',
            pauseBtnId: 'pause-btn',
            resumeBtnId: 'resume-btn',
            stopBtnId: 'stop-btn',
            rateInputId: 'rate',
            rateValueId: 'rate-value',
            pitchInputId: 'pitch',
            pitchValueId: 'pitch-value'
        };
    });

    describe('Module Integration and Dependency Management', () => {
        test('should successfully integrate with real DOM environment', () => {
            expect(() => {
                displayer = new HtmlSpeechSynthesisDisplayer(global.document, elementIds);
            }).not.toThrow();

            expect(displayer).toBeInstanceOf(HtmlSpeechSynthesisDisplayer);
            expect(displayer.document).toBe(global.document);
        });

        test('should integrate with SpeechSynthesisManager properly', () => {
            displayer = new HtmlSpeechSynthesisDisplayer(global.document, elementIds);

            expect(displayer.speechManager).toBeInstanceOf(IntegrationSpeechSynthesisManager);
            expect(typeof displayer.speechManager.speak).toBe('function');
            expect(typeof displayer.speechManager.setVoice).toBe('function');
        });

        test('should handle PositionManager constants integration', () => {
            displayer = new HtmlSpeechSynthesisDisplayer(global.document, elementIds);

            const address = new TestBrazilianStandardAddress({
                municipio: 'São Paulo'
            });

            expect(() => {
                displayer.update(address, 'MunicipioChanged', IntegrationPositionManager.strCurrPosUpdate);
            }).not.toThrow();
        });

        test('should maintain backward compatibility with legacy systems', () => {
            displayer = new HtmlSpeechSynthesisDisplayer(global.document, elementIds);

            // Test that the displayer works with different calling patterns
            const address = new TestBrazilianStandardAddress({
                logradouro: 'Rua das Flores',
                municipio: 'São Paulo'
            });

            // Legacy pattern
            displayer.update(address, address, 'PositionManager updated');
            
            // New pattern
            displayer.update(address, 'LogradouroChanged', 'PositionManager updated');

            expect(displayer.textInput.value).toBeTruthy();
        });
    });

    describe('Real DOM Interaction and Event Handling', () => {
        beforeEach(() => {
            displayer = new HtmlSpeechSynthesisDisplayer(global.document, elementIds);
        });

        test('should handle real DOM element interactions', () => {
            const textInput = global.document.getElementById('text-input');
            const speakBtn = global.document.getElementById('speak-btn');

            expect(textInput).toBeTruthy();
            expect(speakBtn).toBeTruthy();
            expect(displayer.textInput).toBe(textInput);
            expect(displayer.speakBtn).toBe(speakBtn);
        });

        test('should handle voice selection through DOM events', () => {
            const voiceSelect = global.document.getElementById('voice-select');
            
            // Simulate voice selection
            voiceSelect.value = '0';
            const changeEvent = new global.window.Event('change', { bubbles: true });
            voiceSelect.dispatchEvent(changeEvent);

            // Should not throw error
            expect(displayer.speechManager).toBeDefined();
        });

        test('should handle speech controls through DOM events', () => {
            const speakBtn = global.document.getElementById('speak-btn');
            const pauseBtn = global.document.getElementById('pause-btn');
            const stopBtn = global.document.getElementById('stop-btn');

            displayer.textInput.value = 'Teste de fala';

            // Test speak button
            const clickEvent = new global.window.Event('click', { bubbles: true });
            speakBtn.dispatchEvent(clickEvent);

            expect(mockSpeechSynthesis.speak).toHaveBeenCalled();

            // Test pause button
            pauseBtn.dispatchEvent(clickEvent);
            expect(mockSpeechSynthesis.pause).toHaveBeenCalled();

            // Test stop button
            stopBtn.dispatchEvent(clickEvent);
            expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
        });

        test('should handle rate and pitch controls through DOM events', () => {
            const rateInput = global.document.getElementById('rate');
            const pitchInput = global.document.getElementById('pitch');
            const rateValue = global.document.getElementById('rate-value');
            const pitchValue = global.document.getElementById('pitch-value');

            // Test rate change
            rateInput.value = '1.5';
            const inputEvent = new global.window.Event('input', { bubbles: true });
            rateInput.dispatchEvent(inputEvent);

            expect(rateValue.textContent).toBe('1.5');
            expect(displayer.speechManager.rate).toBe(1.5);

            // Test pitch change
            pitchInput.value = '1.2';
            pitchInput.dispatchEvent(inputEvent);

            expect(pitchValue.textContent).toBe('1.2');
            expect(displayer.speechManager.pitch).toBe(1.2);
        });
    });

    describe('Observer Pattern Integration Scenarios', () => {
        beforeEach(() => {
            displayer = new HtmlSpeechSynthesisDisplayer(global.document, elementIds);
        });

        test('should handle complex address change scenarios', () => {
            // Simulate a complete journey with multiple address changes
            const addresses = [
                new TestBrazilianStandardAddress({
                    logradouro: 'Rua Augusta',
                    numero: '100',
                    bairro: 'Centro',
                    municipio: 'São Paulo'
                }),
                new TestBrazilianStandardAddress({
                    logradouro: 'Avenida Paulista',
                    numero: '1000',
                    bairro: 'Bela Vista',
                    municipio: 'São Paulo'
                }),
                new TestBrazilianStandardAddress({
                    logradouro: 'Rua das Flores',
                    numero: '50',
                    bairro: 'Jardins',
                    municipio: 'São Paulo'
                })
            ];

            addresses.forEach((address, index) => {
                if (index === 0) {
                    // First address - full update
                    displayer.update(address, address, IntegrationPositionManager.strCurrPosUpdate);
                } else {
                    // Subsequent addresses - specific changes
                    displayer.update(address, 'LogradouroChanged', IntegrationPositionManager.strCurrPosUpdate);
                }
                
                expect(displayer.textInput.value).toBeTruthy();
                expect(displayer.textInput.value).toContain('Rua');
            });
        });

        test('should handle municipality changes with proper Portuguese grammar', () => {
            const previousAddress = new TestBrazilianStandardAddress({
                municipio: 'Santos'
            });

            const currentAddress = new TestBrazilianStandardAddress({
                municipio: 'São Paulo'
            });

            const changeDetails = {
                previous: previousAddress,
                current: currentAddress
            };

            displayer.update(currentAddress, 'MunicipioChanged', IntegrationPositionManager.strCurrPosUpdate, changeDetails);

            expect(displayer.textInput.value).toContain('Você saiu de Santos');
            expect(displayer.textInput.value).toContain('e entrou em São Paulo');
        });

        test('should prioritize municipality changes over neighborhood changes', () => {
            const address = new TestBrazilianStandardAddress({
                bairro: 'Copacabana',
                municipio: 'Rio de Janeiro'
            });

            // First, trigger a bairro change
            displayer.update(address, 'BairroChanged', IntegrationPositionManager.strCurrPosUpdate);
            const bairroText = displayer.textInput.value;

            // Then, trigger a municipality change (higher priority)
            displayer.update(address, 'MunicipioChanged', IntegrationPositionManager.strCurrPosUpdate);
            const municipioText = displayer.textInput.value;

            expect(bairroText).toContain('bairro');
            expect(municipioText).toContain('município');
            expect(municipioText).not.toBe(bairroText);
        });
    });

    describe('Cross-Browser Compatibility', () => {
        beforeEach(() => {
            displayer = new HtmlSpeechSynthesisDisplayer(global.document, elementIds);
        });

        test('should handle missing Speech Synthesis API gracefully', () => {
            const originalSpeechSynthesis = global.window.speechSynthesis;
            global.window.speechSynthesis = undefined;

            expect(() => {
                new HtmlSpeechSynthesisDisplayer(global.document, elementIds);
            }).not.toThrow();

            global.window.speechSynthesis = originalSpeechSynthesis;
        });

        test('should handle empty voices array', () => {
            mockSpeechSynthesis.getVoices.mockReturnValue([]);

            displayer.updateVoices();

            expect(displayer.voiceSelect.innerHTML).toBe('');
        });

        test('should handle voices that become available asynchronously', (done) => {
            // Simulate voices loading asynchronously
            setTimeout(() => {
                mockSpeechSynthesis.voices = [
                    { name: 'Google português do Brasil', lang: 'pt-BR' },
                    { name: 'Microsoft Helena', lang: 'pt-PT' }
                ];

                if (mockSpeechSynthesis.onvoiceschanged) {
                    mockSpeechSynthesis.onvoiceschanged();
                }

                expect(mockSpeechSynthesis.getVoices).toHaveBeenCalled();
                done();
            }, 50);
        });

        test('should handle different DOM implementations', () => {
            // Test with minimal DOM implementation
            const minimalDocument = {
                getElementById: jest.fn().mockReturnValue(null)
            };

            expect(() => {
                new HtmlSpeechSynthesisDisplayer(minimalDocument, elementIds);
            }).not.toThrow();
        });
    });

    describe('Performance and Memory Management', () => {
        beforeEach(() => {
            displayer = new HtmlSpeechSynthesisDisplayer(global.document, elementIds);
        });

        test('should handle rapid address updates efficiently', () => {
            const addresses = Array.from({ length: 100 }, (_, i) => 
                new TestBrazilianStandardAddress({
                    logradouro: `Rua ${i}`,
                    numero: `${i * 10}`,
                    bairro: `Bairro ${i % 10}`,
                    municipio: `Cidade ${i % 5}`
                })
            );

            const startTime = Date.now();

            addresses.forEach(address => {
                displayer.update(address, 'LogradouroChanged', IntegrationPositionManager.strCurrPosUpdate);
            });

            const endTime = Date.now();
            const executionTime = endTime - startTime;

            // Should handle 100 updates in reasonable time (less than 1 second)
            expect(executionTime).toBeLessThan(1000);
        });

        test('should not create memory leaks with repeated updates', () => {
            const initialMemory = process.memoryUsage().heapUsed;

            // Simulate many updates
            for (let i = 0; i < 1000; i++) {
                const address = new TestBrazilianStandardAddress({
                    logradouro: `Test Street ${i}`,
                    municipio: `Test City ${i % 10}`
                });

                displayer.update(address, 'LogradouroChanged', IntegrationPositionManager.strCurrPosUpdate);
            }

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }

            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;

            // Memory increase should be reasonable (less than 10MB)
            expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
        });

        test('should handle long text efficiently', () => {
            const longAddress = new TestBrazilianStandardAddress({
                logradouro: 'A'.repeat(1000),
                bairro: 'B'.repeat(500),
                municipio: 'C'.repeat(100)
            });

            expect(() => {
                displayer.update(longAddress, longAddress, IntegrationPositionManager.strCurrPosUpdate);
            }).not.toThrow();

            expect(displayer.textInput.value.length).toBeGreaterThan(0);
        });
    });

    describe('Accessibility Integration', () => {
        beforeEach(() => {
            displayer = new HtmlSpeechSynthesisDisplayer(global.document, elementIds);
        });

        test('should provide ARIA-compatible text updates', () => {
            const address = new TestBrazilianStandardAddress({
                logradouro: 'Rua Vergueiro',
                bairro: 'Liberdade',
                municipio: 'São Paulo'
            });

            displayer.update(address, address, IntegrationPositionManager.strCurrPosUpdate);

            const textContent = displayer.textInput.value;
            expect(textContent).toMatch(/^Você está em/);
            expect(textContent).not.toContain('undefined');
            expect(textContent).not.toContain('null');
        });

        test('should handle screen reader scenarios', () => {
            const address = new TestBrazilianStandardAddress({
                municipio: 'São Paulo'
            });

            displayer.update(address, 'MunicipioChanged', IntegrationPositionManager.strCurrPosUpdate);

            const speechText = displayer.textInput.value;
            expect(speechText).toBeTruthy();
            expect(speechText.length).toBeGreaterThan(10);
            expect(speechText).toContain('São Paulo');
        });

        test('should provide consistent voice identification for assistive technology', () => {
            displayer.speechManager.voice = { name: 'Google português do Brasil' };
            
            const identification = displayer.toString();
            expect(identification).toContain('HtmlSpeechSynthesisDisplayer');
            expect(identification).toContain('Google português do Brasil');
        });
    });

    describe('Real-World Scenario Integration', () => {
        beforeEach(() => {
            displayer = new HtmlSpeechSynthesisDisplayer(global.document, elementIds);
        });

        test('should handle São Paulo city tour scenario', () => {
            const tourStops = [
                new TestBrazilianStandardAddress({
                    logradouro: 'Praça da Sé',
                    bairro: 'Sé',
                    municipio: 'São Paulo'
                }),
                new TestBrazilianStandardAddress({
                    logradouro: 'Avenida Paulista',
                    numero: '1578',
                    bairro: 'Bela Vista',
                    municipio: 'São Paulo'
                }),
                new TestBrazilianStandardAddress({
                    logradouro: 'Rua Oscar Freire',
                    numero: '909',
                    bairro: 'Jardins',
                    municipio: 'São Paulo'
                }),
                new TestBrazilianStandardAddress({
                    logradouro: 'Rua da Consolação',
                    bairro: 'Centro',
                    municipio: 'São Paulo'
                })
            ];

            tourStops.forEach((stop, index) => {
                if (index === 0) {
                    displayer.update(stop, stop, IntegrationPositionManager.strCurrPosUpdate);
                } else {
                    displayer.update(stop, 'LogradouroChanged', IntegrationPositionManager.strCurrPosUpdate);
                }

                expect(displayer.textInput.value).toContain('São Paulo');
                expect(displayer.textInput.value.length).toBeGreaterThan(10);
            });
        });

        test('should handle interstate travel scenario', () => {
            const states = [
                { municipio: 'São Paulo', uf: 'SP' },
                { municipio: 'Rio de Janeiro', uf: 'RJ' },
                { municipio: 'Belo Horizonte', uf: 'MG' },
                { municipio: 'Brasília', uf: 'DF' }
            ];

            states.forEach((stateData, index) => {
                const address = new TestBrazilianStandardAddress(stateData);
                
                if (index > 0) {
                    const changeDetails = {
                        previous: { municipio: states[index - 1].municipio },
                        current: { municipio: stateData.municipio }
                    };
                    
                    displayer.update(address, 'MunicipioChanged', IntegrationPositionManager.strCurrPosUpdate, changeDetails);
                    
                    expect(displayer.textInput.value).toContain('saiu de');
                    expect(displayer.textInput.value).toContain('entrou em');
                } else {
                    displayer.update(address, address, IntegrationPositionManager.strCurrPosUpdate);
                }
                
                expect(displayer.textInput.value).toContain(stateData.municipio);
            });
        });

        test('should handle GPS accuracy improvement scenario', () => {
            // Simulate improving GPS accuracy
            const addresses = [
                new TestBrazilianStandardAddress({
                    municipio: 'São Paulo'  // Initial rough location
                }),
                new TestBrazilianStandardAddress({
                    bairro: 'Centro',
                    municipio: 'São Paulo'  // Neighborhood identified
                }),
                new TestBrazilianStandardAddress({
                    logradouro: 'Rua Direita',
                    bairro: 'Centro',
                    municipio: 'São Paulo'  // Street identified
                }),
                new TestBrazilianStandardAddress({
                    logradouro: 'Rua Direita',
                    numero: '10',
                    bairro: 'Centro',
                    municipio: 'São Paulo'  // Full address
                })
            ];

            addresses.forEach((address, index) => {
                if (index === 0) {
                    displayer.update(address, address, IntegrationPositionManager.strCurrPosUpdate);
                    expect(displayer.textInput.value).toBe('Você está em São Paulo');
                } else if (index === 1) {
                    displayer.update(address, 'BairroChanged', IntegrationPositionManager.strCurrPosUpdate);
                    expect(displayer.textInput.value).toContain('bairro Centro');
                } else if (index === 2) {
                    displayer.update(address, 'LogradouroChanged', IntegrationPositionManager.strCurrPosUpdate);
                    expect(displayer.textInput.value).toContain('Rua Direita');
                } else {
                    displayer.update(address, 'LogradouroChanged', IntegrationPositionManager.strCurrPosUpdate);
                    expect(displayer.textInput.value).toContain('Rua Direita, 10');
                }
            });
        });
    });

    describe('Error Recovery and Edge Cases', () => {
        beforeEach(() => {
            displayer = new HtmlSpeechSynthesisDisplayer(global.document, elementIds);
        });

        test('should recover from speech synthesis errors', () => {
            // Simulate speech synthesis error
            mockSpeechSynthesis.speak.mockImplementationOnce(() => {
                throw new Error('Speech synthesis failed');
            });

            const address = new TestBrazilianStandardAddress({
                municipio: 'São Paulo'
            });

            expect(() => {
                displayer.update(address, 'MunicipioChanged', IntegrationPositionManager.strCurrPosUpdate);
            }).not.toThrow();

            // Should still update text input even if speech fails
            expect(displayer.textInput.value).toBeTruthy();
        });

        test('should handle corrupted address data gracefully', () => {
            const corruptedAddresses = [
                { municipio: null },
                { municipio: '' },
                { municipio: undefined },
                { logradouro: 'Test', numero: null },
                {}
            ];

            corruptedAddresses.forEach(corruptedData => {
                const address = new TestBrazilianStandardAddress(corruptedData);
                
                expect(() => {
                    displayer.update(address, address, IntegrationPositionManager.strCurrPosUpdate);
                }).not.toThrow();
            });
        });

        test('should handle DOM manipulation during operation', () => {
            const address = new TestBrazilianStandardAddress({
                municipio: 'São Paulo'
            });

            // Start an update
            displayer.update(address, 'MunicipioChanged', IntegrationPositionManager.strCurrPosUpdate);

            // Simulate DOM element removal
            const originalTextInput = displayer.textInput;
            displayer.textInput = null;

            // Should not crash on subsequent updates
            expect(() => {
                displayer.update(address, 'BairroChanged', IntegrationPositionManager.strCurrPosUpdate);
            }).not.toThrow();

            // Restore for cleanup
            displayer.textInput = originalTextInput;
        });

        test('should handle concurrent updates safely', () => {
            const addresses = Array.from({ length: 10 }, (_, i) => 
                new TestBrazilianStandardAddress({
                    municipio: `City ${i}`
                })
            );

            // Simulate rapid concurrent updates
            const updatePromises = addresses.map((address, index) => 
                new Promise(resolve => {
                    setTimeout(() => {
                        displayer.update(address, 'MunicipioChanged', IntegrationPositionManager.strCurrPosUpdate);
                        resolve();
                    }, Math.random() * 10);
                })
            );

            return Promise.all(updatePromises).then(() => {
                expect(displayer.textInput.value).toBeTruthy();
            });
        });
    });
});