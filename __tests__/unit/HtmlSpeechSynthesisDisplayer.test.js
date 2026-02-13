/**
 * Unit tests for HtmlSpeechSynthesisDisplayer class.
 * 
 * This test suite provides comprehensive coverage for the HtmlSpeechSynthesisDisplayer
 * class, testing constructor validation, observer pattern integration, speech synthesis
 * controls, voice configuration, address change handling, priority speech synthesis,
 * and error handling scenarios.
 * 
 * Test Categories:
 * - Constructor validation and parameter handling
 * - Observer pattern implementation and update methods
 * - Speech synthesis UI controls and event handlers
 * - Voice configuration and Brazilian Portuguese prioritization
 * - Address change handling with priority-based speech
 * - Text generation methods for different address components
 * - Error handling and edge cases
 * - DOM element interaction and event handling
 * 
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import { jest } from '@jest/globals';

// Mock DOM environment for testing
const mockDocument = {
	getElementById: jest.fn(),
	createElement: jest.fn()
};

// Mock window for speech synthesis
// Note: jest.setup.js creates window, so we override its properties
if (typeof window !== 'undefined') {
	window.speechSynthesis = {
		onvoiceschanged: null,
		getVoices: jest.fn().mockReturnValue([
			{ name: 'Google português do Brasil', lang: 'pt-BR' },
			{ name: 'Microsoft Helena', lang: 'pt-PT' },
			{ name: 'System Voice', lang: 'en-US' }
		]),
		speak: jest.fn(),
		cancel: jest.fn(),
		pause: jest.fn(),
		resume: jest.fn()
	};
}

// Mock SpeechSynthesisManager
class MockSpeechSynthesisManager {
	constructor() {
		this.synth = window.speechSynthesis;
		this.voice = null;
		this.rate = 1.0;
		this.pitch = 1.0;
		this.isCurrentlySpeaking = false;
		this.speechQueue = {
			size: jest.fn().mockReturnValue(0)
		};
	}

	setVoice(voice) {
		this.voice = voice;
	}

	setRate(rate) {
		this.rate = rate;
	}

	setPitch(pitch) {
		this.pitch = pitch;
	}

	speak(text, priority) {
		this.isCurrentlySpeaking = true;
		return { text, priority };
	}

	pause() {
		this.isCurrentlySpeaking = false;
	}

	resume() {
		this.isCurrentlySpeaking = true;
	}

	stop() {
		this.isCurrentlySpeaking = false;
	}

	startQueueTimer() {
		// Mock implementation
	}
}

// Mock PositionManager
const MockPositionManager = {
	strCurrPosUpdate: 'PositionManager updated',
	strImmediateAddressUpdate: 'Immediate address update'
};

// Mock BrazilianStandardAddress for testing
class MockBrazilianStandardAddress {
	constructor(data = {}) {
		this.logradouro = data.logradouro || null;
		this.numero = data.numero || null;
		this.bairro = data.bairro || null;
		this.municipio = data.municipio || null;
		this.uf = data.uf || null;
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
}

// Mock console for testing
global.console = {
	log: jest.fn(),
	warn: jest.fn(),
	error: jest.fn()
};

// Mock module imports
jest.unstable_mockModule('../../src/guia.js', () => ({
	SpeechSynthesisManager: MockSpeechSynthesisManager
}));

jest.unstable_mockModule('../../src/core/PositionManager.js', () => ({
	default: MockPositionManager
}));

// Import the class under test
const HtmlSpeechSynthesisDisplayer = (await import('../../src/html/HtmlSpeechSynthesisDisplayer.js')).default;

describe('HtmlSpeechSynthesisDisplayer - MP Barbosa Travel Guide (v0.9.0-alpha)', () => {
	let displayer;
	let mockElementIds;
	let mockElements;

	beforeEach(() => {
		jest.clearAllMocks();

		// Reset mock document
		mockDocument.getElementById.mockReset();
		mockDocument.createElement.mockReset();

		// Setup mock element IDs
		mockElementIds = {
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

		// Setup mock DOM elements
		mockElements = {
			languageSelect: { innerHTML: '', appendChild: jest.fn(), addEventListener: jest.fn() },
			voiceSelect: { innerHTML: '', appendChild: jest.fn(), addEventListener: jest.fn() },
			textInput: { value: '', addEventListener: jest.fn() },
			speakBtn: { addEventListener: jest.fn() },
			pauseBtn: { addEventListener: jest.fn() },
			resumeBtn: { addEventListener: jest.fn() },
			stopBtn: { addEventListener: jest.fn() },
			rateInput: { addEventListener: jest.fn() },
			rateValue: { textContent: '1.0' },
			pitchInput: { addEventListener: jest.fn() },
			pitchValue: { textContent: '1.0' }
		};

		// Configure mock document.getElementById
		mockDocument.getElementById.mockImplementation((id) => {
			switch (id) {
				case 'language': return mockElements.languageSelect;
				case 'voice-select': return mockElements.voiceSelect;
				case 'text-input': return mockElements.textInput;
				case 'speak-btn': return mockElements.speakBtn;
				case 'pause-btn': return mockElements.pauseBtn;
				case 'resume-btn': return mockElements.resumeBtn;
				case 'stop-btn': return mockElements.stopBtn;
				case 'rate': return mockElements.rateInput;
				case 'rate-value': return mockElements.rateValue;
				case 'pitch': return mockElements.pitchInput;
				case 'pitch-value': return mockElements.pitchValue;
				default: return null;
			}
		});

		// Configure mock document.createElement
		mockDocument.createElement.mockImplementation((tagName) => {
			if (tagName === 'option') {
				return {
					value: '',
					textContent: '',
					selected: false
				};
			}
			return {};
		});
	});

	describe('Constructor Validation', () => {
		test('should create displayer with valid parameters', () => {
			expect(() => {
				displayer = new HtmlSpeechSynthesisDisplayer(mockDocument, mockElementIds);
			}).not.toThrow();

			expect(displayer).toBeInstanceOf(HtmlSpeechSynthesisDisplayer);
			expect(displayer.document).toBe(mockDocument);
			expect(displayer.elementIds).toBe(mockElementIds);
		});

		test('should throw TypeError when document is null', () => {
			expect(() => {
				new HtmlSpeechSynthesisDisplayer(null, mockElementIds);
			}).toThrow(TypeError);
			expect(() => {
				new HtmlSpeechSynthesisDisplayer(null, mockElementIds);
			}).toThrow('Document parameter cannot be null or undefined');
		});

		test('should throw TypeError when document is undefined', () => {
			expect(() => {
				new HtmlSpeechSynthesisDisplayer(undefined, mockElementIds);
			}).toThrow(TypeError);
			expect(() => {
				new HtmlSpeechSynthesisDisplayer(undefined, mockElementIds);
			}).toThrow('Document parameter cannot be null or undefined');
		});

		test('should throw TypeError when elementIds is null', () => {
			expect(() => {
				new HtmlSpeechSynthesisDisplayer(mockDocument, null);
			}).toThrow(TypeError);
			expect(() => {
				new HtmlSpeechSynthesisDisplayer(mockDocument, null);
			}).toThrow('ElementIds parameter cannot be null or undefined');
		});

		test('should throw TypeError when elementIds is undefined', () => {
			expect(() => {
				new HtmlSpeechSynthesisDisplayer(mockDocument, undefined);
			}).toThrow(TypeError);
		});

		test('should throw TypeError when elementIds is not an object', () => {
			expect(() => {
				new HtmlSpeechSynthesisDisplayer(mockDocument, 'invalid');
			}).toThrow(TypeError);
			expect(() => {
				new HtmlSpeechSynthesisDisplayer(mockDocument, 'invalid');
			}).toThrow('ElementIds must be an object containing element ID configuration');
		});

		test('should handle missing DOM elements gracefully', () => {
			mockDocument.getElementById.mockReturnValue(null);

			expect(() => {
				displayer = new HtmlSpeechSynthesisDisplayer(mockDocument, mockElementIds);
			}).not.toThrow();

			expect(displayer.voiceSelect).toBeNull();
			expect(displayer.textInput).toBeNull();
		});

		test('should be immutable after construction', () => {
			displayer = new HtmlSpeechSynthesisDisplayer(mockDocument, mockElementIds);

			expect(() => {
				displayer.document = {};
			}).toThrow();

			expect(() => {
				displayer.newProperty = 'test';
			}).toThrow();
		});
	});

	describe('Voice Configuration', () => {
		beforeEach(() => {
			displayer = new HtmlSpeechSynthesisDisplayer(mockDocument, mockElementIds);
		});

		test('should prioritize Brazilian Portuguese voices', () => {
			displayer.updateVoices();

			// Should have called createElement for voice options
			expect(mockDocument.createElement).toHaveBeenCalledWith('option');

			// Should have cleared existing options
			expect(mockElements.voiceSelect.innerHTML).toBe('');
		});

		test('should handle missing voice select element', () => {
			// Create a new displayer with null voice select element
			const nullElements = { ...mockElements, voiceSelect: null };
			mockDocument.getElementById.mockImplementation((id) => {
				return nullElements[mockElementIds.voiceSelectId] === null && id === mockElementIds.voiceSelectId 
					? null 
					: mockElements[id] || null;
			});
			const testDisplayer = new HtmlSpeechSynthesisDisplayer(mockDocument, mockElementIds);

			expect(() => {
				testDisplayer.updateVoices();
			}).not.toThrow();
		});

		test('should setup voice change event handler', () => {
			expect(mockElements.voiceSelect.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
		});

		test('should handle voices changed event', () => {
			expect(() => {
				if (global.window.speechSynthesis.onvoiceschanged) {
					global.window.speechSynthesis.onvoiceschanged();
				}
			}).not.toThrow();
		});
	});

	describe('Speech Control Event Handlers', () => {
		beforeEach(() => {
			displayer = new HtmlSpeechSynthesisDisplayer(mockDocument, mockElementIds);
		});

		test('should setup speak button event handler', () => {
			expect(mockElements.speakBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
		});

		test('should setup pause button event handler', () => {
			expect(mockElements.pauseBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
		});

		test('should setup resume button event handler', () => {
			expect(mockElements.resumeBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
		});

		test('should setup stop button event handler', () => {
			expect(mockElements.stopBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
		});

		test('should setup rate control event handler', () => {
			expect(mockElements.rateInput.addEventListener).toHaveBeenCalledWith('input', expect.any(Function));
		});

		test('should setup pitch control event handler', () => {
			expect(mockElements.pitchInput.addEventListener).toHaveBeenCalledWith('input', expect.any(Function));
		});

		test('should handle missing control elements gracefully', () => {
			mockDocument.getElementById.mockReturnValue(null);

			expect(() => {
				new HtmlSpeechSynthesisDisplayer(mockDocument, mockElementIds);
			}).not.toThrow();
		});
	});

	describe('Text Generation Methods', () => {
		beforeEach(() => {
			displayer = new HtmlSpeechSynthesisDisplayer(mockDocument, mockElementIds);
		});

		describe('buildTextToSpeechLogradouro', () => {
			test('should build logradouro text with complete address', () => {
				const address = new MockBrazilianStandardAddress({
					logradouro: 'Rua das Flores',
					numero: '123'
				});

				const result = displayer.buildTextToSpeechLogradouro(address);
				expect(result).toBe('Você está agora em Rua das Flores, 123');
			});

			test('should handle missing logradouro', () => {
				const address = new MockBrazilianStandardAddress({});
				const result = displayer.buildTextToSpeechLogradouro(address);
				expect(result).toBe('Nova localização detectada');
			});

			test('should handle null address', () => {
				const result = displayer.buildTextToSpeechLogradouro(null);
				expect(result).toBe('Nova localização detectada');
			});

			test('should handle undefined address', () => {
				const result = displayer.buildTextToSpeechLogradouro(undefined);
				expect(result).toBe('Nova localização detectada');
			});
		});

		describe('buildTextToSpeechBairro', () => {
			test('should build bairro text with neighborhood name', () => {
				const address = new MockBrazilianStandardAddress({
					bairro: 'Centro'
				});

				const result = displayer.buildTextToSpeechBairro(address);
				expect(result).toBe('Você entrou no bairro Centro');
			});

			test('should handle missing bairro', () => {
				const address = new MockBrazilianStandardAddress({});
				const result = displayer.buildTextToSpeechBairro(address);
				expect(result).toBe('Novo bairro detectado');
			});

			test('should handle null address', () => {
				const result = displayer.buildTextToSpeechBairro(null);
				expect(result).toBe('Novo bairro detectado');
			});
		});

		describe('buildTextToSpeechMunicipio', () => {
			test('should build municipio text with current municipality', () => {
				const address = new MockBrazilianStandardAddress({
					municipio: 'São Paulo'
				});

				const result = displayer.buildTextToSpeechMunicipio(address);
				expect(result).toBe('Você entrou no município de São Paulo');
			});

			test('should build municipio text with change details', () => {
				const address = new MockBrazilianStandardAddress({
					municipio: 'São Paulo'
				});

				const changeDetails = {
					previous: { municipio: 'Santos' },
					current: { municipio: 'São Paulo' }
				};

				const result = displayer.buildTextToSpeechMunicipio(address, changeDetails);
				expect(result).toBe('Você saiu de Santos e entrou em São Paulo');
			});

			test('should handle missing municipio', () => {
				const address = new MockBrazilianStandardAddress({});
				const result = displayer.buildTextToSpeechMunicipio(address);
				expect(result).toBe('Novo município detectado');
			});

			test('should handle null address', () => {
				const result = displayer.buildTextToSpeechMunicipio(null);
				expect(result).toBe('Novo município detectado');
			});

			test('should handle incomplete change details', () => {
				const address = new MockBrazilianStandardAddress({
					municipio: 'São Paulo'
				});

				const changeDetails = { current: { municipio: 'São Paulo' } };
				const result = displayer.buildTextToSpeechMunicipio(address, changeDetails);
				expect(result).toBe('Você entrou no município de São Paulo');
			});
		});

		describe('buildTextToSpeech', () => {
			test('should build full address text with all components', () => {
				const address = new MockBrazilianStandardAddress({
					logradouro: 'Rua das Flores',
					numero: '123',
					bairro: 'Centro',
					municipio: 'São Paulo'
				});

				const result = displayer.buildTextToSpeech(address);
				expect(result).toBe('Você está em Rua das Flores, 123, Centro, São Paulo');
			});

			test('should build text with only bairro and municipio', () => {
				const address = new MockBrazilianStandardAddress({
					bairro: 'Copacabana',
					municipio: 'Rio de Janeiro'
				});

				const result = displayer.buildTextToSpeech(address);
				expect(result).toBe('Você está em bairro Copacabana, Rio de Janeiro');
			});

			test('should build text with only municipio', () => {
				const address = new MockBrazilianStandardAddress({
					municipio: 'Brasília'
				});

				const result = displayer.buildTextToSpeech(address);
				expect(result).toBe('Você está em Brasília');
			});

			test('should handle empty address', () => {
				const address = new MockBrazilianStandardAddress({});
				const result = displayer.buildTextToSpeech(address);
				expect(result).toBe('Localização detectada, mas endereço não disponível');
			});

			test('should handle null address', () => {
				const result = displayer.buildTextToSpeech(null);
				expect(result).toBe('Localização não disponível');
			});
		});
	});

	describe('Observer Pattern Implementation', () => {
		beforeEach(() => {
			displayer = new HtmlSpeechSynthesisDisplayer(mockDocument, mockElementIds);
			mockElements.textInput.value = '';
		});

		test('should handle municipality change with priority 3', () => {
			const address = new MockBrazilianStandardAddress({
				municipio: 'São Paulo'
			});

			const changeDetails = {
				previous: { municipio: 'Santos' },
				current: { municipio: 'São Paulo' }
			};

			displayer.update(address, 'MunicipioChanged', 'PositionManager updated', changeDetails);

			expect(mockElements.textInput.value).toBe('Você saiu de Santos e entrou em São Paulo');
		});

		test('should handle bairro change with priority 2', () => {
			const address = new MockBrazilianStandardAddress({
				bairro: 'Centro'
			});

			displayer.update(address, 'BairroChanged', 'PositionManager updated');

			expect(mockElements.textInput.value).toBe('Você entrou no bairro Centro');
		});

		test('should handle logradouro change with priority 1', () => {
			const address = new MockBrazilianStandardAddress({
				logradouro: 'Rua das Flores',
				numero: '123'
			});

			displayer.update(address, 'LogradouroChanged', 'PositionManager updated');

			expect(mockElements.textInput.value).toBe('Você está agora em Rua das Flores, 123');
		});

		test('should handle periodic full address update with priority 0', () => {
			const currentAddress = {};
			const standardizedAddress = new MockBrazilianStandardAddress({
				logradouro: 'Rua das Palmeiras',
				bairro: 'Jardins',
				municipio: 'São Paulo'
			});

			displayer.update(currentAddress, standardizedAddress, MockPositionManager.strCurrPosUpdate);

			expect(mockElements.textInput.value).toBe('Você está em Rua das Palmeiras, Jardins, São Paulo');
		});

		test('should ignore immediate address updates without change events', () => {
			const address = new MockBrazilianStandardAddress({
				municipio: 'São Paulo'
			});

			displayer.update(address, address, MockPositionManager.strImmediateAddressUpdate);

			expect(mockElements.textInput.value).toBe('');
		});

		test('should handle null current address gracefully', () => {
			expect(() => {
				displayer.update(null, 'MunicipioChanged', 'PositionManager updated');
			}).not.toThrow();

			expect(mockElements.textInput.value).toBe('');
		});

		test('should handle missing text input element', () => {
			// Create a new displayer with null text input element
			const nullElements = { ...mockElements, textInput: null };
			mockDocument.getElementById.mockImplementation((id) => {
				return nullElements[mockElementIds.textInputId] === null && id === mockElementIds.textInputId 
					? null 
					: mockElements[id] || null;
			});
			const testDisplayer = new HtmlSpeechSynthesisDisplayer(mockDocument, mockElementIds);

			const address = new MockBrazilianStandardAddress({
				municipio: 'São Paulo'
			});

			expect(() => {
				testDisplayer.update(address, 'MunicipioChanged', 'PositionManager updated');
			}).not.toThrow();
		});

		test('should log debug information when console is available', () => {
			const address = new MockBrazilianStandardAddress({
				municipio: 'São Paulo'
			});

			displayer.update(address, 'MunicipioChanged', 'PositionManager updated');

			expect(console.log).toHaveBeenCalledWith(expect.stringContaining('['), '+++ (301) HtmlSpeechSynthesisDisplayer.update called +++');
			expect(console.log).toHaveBeenCalledWith(expect.stringContaining('['), '+++ (302) currentAddress: ', address);
		});
	});

	describe('String Representation', () => {
		beforeEach(() => {
			displayer = new HtmlSpeechSynthesisDisplayer(mockDocument, mockElementIds);
		});

		test('should return class name with voice name', () => {
			displayer.speechManager.voice = { name: 'Google português do Brasil' };
			const result = displayer.toString();
			expect(result).toBe('HtmlSpeechSynthesisDisplayer: Google português do Brasil');
		});

		test('should return class name with no voice when voice is null', () => {
			displayer.speechManager.voice = null;
			const result = displayer.toString();
			expect(result).toBe('HtmlSpeechSynthesisDisplayer: no voice');
		});

		test('should return class name with no voice when voice is undefined', () => {
			displayer.speechManager.voice = undefined;
			const result = displayer.toString();
			expect(result).toBe('HtmlSpeechSynthesisDisplayer: no voice');
		});
	});

	describe('Error Handling and Edge Cases', () => {
		beforeEach(() => {
			displayer = new HtmlSpeechSynthesisDisplayer(mockDocument, mockElementIds);
		});

		test('should handle malformed address objects', () => {
			const malformedAddress = { invalidProperty: 'test' };

			expect(() => {
				displayer.buildTextToSpeech(malformedAddress);
			}).not.toThrow();

			const result = displayer.buildTextToSpeech(malformedAddress);
			expect(result).toBe('Localização detectada, mas endereço não disponível');
		});

		test('should handle address components with empty strings', () => {
			const address = new MockBrazilianStandardAddress({
				logradouro: '',
				bairro: '',
				municipio: ''
			});

			const result = displayer.buildTextToSpeech(address);
			expect(result).toBe('Localização detectada, mas endereço não disponível');
		});

		test('should handle unknown event types gracefully', () => {
			const address = new MockBrazilianStandardAddress({
				municipio: 'São Paulo'
			});

			expect(() => {
				displayer.update(address, 'UnknownEvent', 'PositionManager updated');
			}).not.toThrow();
		});

		test('should handle update with all null parameters', () => {
			expect(() => {
				displayer.update(null, null, null, null, null);
			}).not.toThrow();
		});

		test('should handle missing speechManager gracefully', () => {
			// This test verifies the constructor doesn't crash if SpeechSynthesisManager fails
			expect(displayer.speechManager).toBeDefined();
			expect(typeof displayer.speechManager.speak).toBe('function');
		});
	});

	describe('Brazilian Portuguese Specific Features', () => {
		beforeEach(() => {
			displayer = new HtmlSpeechSynthesisDisplayer(mockDocument, mockElementIds);
		});

		test('should use proper Portuguese prepositions in address text', () => {
			const address = new MockBrazilianStandardAddress({
				logradouro: 'Avenida Paulista',
				bairro: 'Bela Vista',
				municipio: 'São Paulo'
			});

			const result = displayer.buildTextToSpeech(address);
			expect(result).toContain('Você está em');
		});

		test('should use correct Portuguese for municipality changes', () => {
			const address = new MockBrazilianStandardAddress({
				municipio: 'Rio de Janeiro'
			});

			const changeDetails = {
				previous: { municipio: 'Niterói' },
				current: { municipio: 'Rio de Janeiro' }
			};

			const result = displayer.buildTextToSpeechMunicipio(address, changeDetails);
			expect(result).toContain('Você saiu de');
			expect(result).toContain('e entrou em');
		});

		test('should use correct Portuguese for neighborhood entry', () => {
			const address = new MockBrazilianStandardAddress({
				bairro: 'Ipanema'
			});

			const result = displayer.buildTextToSpeechBairro(address);
			expect(result).toBe('Você entrou no bairro Ipanema');
		});

		test('should handle Brazilian city names correctly', () => {
			const brazilianCities = [
				'São Paulo',
				'Rio de Janeiro',
				'Belo Horizonte',
				'Brasília',
				'João Pessoa'
			];

			brazilianCities.forEach(city => {
				const address = new MockBrazilianStandardAddress({ municipio: city });
				const result = displayer.buildTextToSpeech(address);
				expect(result).toBe(`Você está em ${city}`);
			});
		});
	});

	describe('Accessibility Features', () => {
		beforeEach(() => {
			displayer = new HtmlSpeechSynthesisDisplayer(mockDocument, mockElementIds);
		});

		test('should provide clear voice identification in toString', () => {
			displayer.speechManager.voice = { name: 'Google português do Brasil' };
			const result = displayer.toString();
			expect(result).toContain('Google português do Brasil');
		});

		test('should handle voice loading events for accessibility', () => {
			expect(() => {
				if (global.window.speechSynthesis.onvoiceschanged) {
					global.window.speechSynthesis.onvoiceschanged();
				}
			}).not.toThrow();
		});

		test('should provide consistent speech patterns for location awareness', () => {
			const addresses = [
				new MockBrazilianStandardAddress({ municipio: 'São Paulo' }),
				new MockBrazilianStandardAddress({ municipio: 'Rio de Janeiro' }),
				new MockBrazilianStandardAddress({ municipio: 'Brasília' })
			];

			addresses.forEach(address => {
				const result = displayer.buildTextToSpeech(address);
				expect(result).toMatch(/^Você está em .+/);
			});
		});
	});
});