/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { HtmlSpeechControls } from '../../src/html/HtmlSpeechControls.js';
import SpeechSynthesisManager from '../../src/speech/SpeechSynthesisManager.js';

describe('HtmlSpeechControls', () => {
	let document;
	let elementIds;
	let speechManager;
	let mockVoices;

	beforeEach(() => {
		// Setup JSDOM document
		document = global.document;

		// Create mock DOM elements
		const container = document.createElement('div');
		container.innerHTML = `
			<select id="voice-select"></select>
			<input type="text" id="text-input" value="Test speech" />
			<button id="speak-btn">Speak</button>
			<button id="pause-btn">Pause</button>
			<button id="resume-btn">Resume</button>
			<button id="stop-btn">Stop</button>
			<input type="range" id="rate" min="0.5" max="2" step="0.1" value="1" />
			<span id="rate-value">1.0</span>
			<input type="range" id="pitch" min="0" max="2" step="0.1" value="1" />
			<span id="pitch-value">1.0</span>
		`;
		document.body.appendChild(container);

		// Element IDs configuration
		elementIds = {
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

		// Mock voices
		mockVoices = [
			{ name: 'Google português do Brasil', lang: 'pt-BR', default: false, localService: true },
			{ name: 'Microsoft Helena', lang: 'pt-PT', default: false, localService: true },
			{ name: 'System Voice', lang: 'en-US', default: true, localService: false }
		];

		// Create mock SpeechSynthesisManager
		speechManager = new SpeechSynthesisManager();
		jest.spyOn(speechManager.synth, 'getVoices').mockReturnValue(mockVoices);
		jest.spyOn(speechManager, 'setVoice').mockImplementation(() => {});
		jest.spyOn(speechManager, 'speak').mockImplementation(() => {});
		jest.spyOn(speechManager, 'pause').mockImplementation(() => {});
		jest.spyOn(speechManager, 'resume').mockImplementation(() => {});
		jest.spyOn(speechManager, 'stop').mockImplementation(() => {});
		jest.spyOn(speechManager, 'setRate').mockImplementation(() => {});
		jest.spyOn(speechManager, 'setPitch').mockImplementation(() => {});

		// Mock window.speechSynthesis for voiceschanged event
		global.window = { speechSynthesis: { onvoiceschanged: undefined } };
	});

	afterEach(() => {
		// Cleanup DOM
		document.body.innerHTML = '';
		jest.restoreAllMocks();
	});

	describe('Constructor', () => {
		it('should create instance with valid parameters', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			expect(controls).toBeInstanceOf(HtmlSpeechControls);
			expect(controls.document).toBe(document);
			expect(controls.elementIds).toBe(elementIds);
			expect(controls.speechManager).toBe(speechManager);
		});

		it('should throw TypeError if document is null', () => {
			expect(() => {
				new HtmlSpeechControls(null, elementIds, speechManager);
			}).toThrow(TypeError);
			expect(() => {
				new HtmlSpeechControls(null, elementIds, speechManager);
			}).toThrow("Document parameter cannot be null or undefined");
		});

		it('should throw TypeError if document is undefined', () => {
			expect(() => {
				new HtmlSpeechControls(undefined, elementIds, speechManager);
			}).toThrow(TypeError);
		});

		it('should throw TypeError if elementIds is null', () => {
			expect(() => {
				new HtmlSpeechControls(document, null, speechManager);
			}).toThrow(TypeError);
			expect(() => {
				new HtmlSpeechControls(document, null, speechManager);
			}).toThrow("ElementIds parameter cannot be null or undefined");
		});

		it('should throw TypeError if elementIds is not an object', () => {
			expect(() => {
				new HtmlSpeechControls(document, "not-an-object", speechManager);
			}).toThrow(TypeError);
			expect(() => {
				new HtmlSpeechControls(document, "not-an-object", speechManager);
			}).toThrow("ElementIds must be an object containing element ID configuration");
		});

		it('should throw TypeError if speechManager is null', () => {
			expect(() => {
				new HtmlSpeechControls(document, elementIds, null);
			}).toThrow(TypeError);
			expect(() => {
				new HtmlSpeechControls(document, elementIds, null);
			}).toThrow("SpeechManager parameter cannot be null or undefined");
		});

		it('should get all DOM elements by ID', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			expect(controls.voiceSelect).toBeInstanceOf(HTMLSelectElement);
			expect(controls.textInput).toBeInstanceOf(HTMLInputElement);
			expect(controls.speakBtn).toBeInstanceOf(HTMLButtonElement);
			expect(controls.pauseBtn).toBeInstanceOf(HTMLButtonElement);
			expect(controls.resumeBtn).toBeInstanceOf(HTMLButtonElement);
			expect(controls.stopBtn).toBeInstanceOf(HTMLButtonElement);
			expect(controls.rateInput).toBeInstanceOf(HTMLInputElement);
			expect(controls.rateValue).toBeInstanceOf(HTMLSpanElement);
			expect(controls.pitchInput).toBeInstanceOf(HTMLInputElement);
			expect(controls.pitchValue).toBeInstanceOf(HTMLSpanElement);
		});

		it('should handle missing element IDs gracefully', () => {
			const partialIds = {
				voiceSelectId: 'voice-select'
				// Other IDs omitted
			};

			const controls = new HtmlSpeechControls(document, partialIds, speechManager);
			
			expect(controls.voiceSelect).toBeInstanceOf(HTMLSelectElement);
			expect(controls.textInput).toBeNull();
			expect(controls.speakBtn).toBeNull();
		});

		it('should handle non-existent element IDs gracefully', () => {
			const invalidIds = {
				voiceSelectId: 'non-existent-id'
			};

			const controls = new HtmlSpeechControls(document, invalidIds, speechManager);
			
			expect(controls.voiceSelect).toBeNull();
		});

		it('should call updateVoices during initialization', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			// Verify voice dropdown was populated
			const voiceSelect = document.getElementById('voice-select');
			expect(voiceSelect.options.length).toBe(3);
			expect(voiceSelect.options[0].textContent).toContain('pt-BR');
		});

		it('should freeze the instance after construction', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			expect(Object.isFrozen(controls)).toBe(true);
		});

		it('should store bound handlers in Map', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			expect(controls._boundHandlers).toBeInstanceOf(Map);
			expect(controls._boundHandlers.size).toBeGreaterThan(0);
		});
	});

	describe('updateVoices()', () => {
		it('should populate voice dropdown with available voices', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			const voiceSelect = document.getElementById('voice-select');
			expect(voiceSelect.options.length).toBe(3);
			
			expect(voiceSelect.options[0].textContent).toBe('Google português do Brasil (pt-BR)');
			expect(voiceSelect.options[1].textContent).toBe('Microsoft Helena (pt-PT)');
			expect(voiceSelect.options[2].textContent).toBe('System Voice (en-US)');
		});

		it('should prioritize pt-BR voice by default', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			const voiceSelect = document.getElementById('voice-select');
			expect(voiceSelect.options[0].selected).toBe(true);
			expect(speechManager.setVoice).toHaveBeenCalledWith(mockVoices[0]);
		});

		it('should select pt-PT voice if pt-BR not available', () => {
			const voicesWithoutBR = [
				{ name: 'Microsoft Helena', lang: 'pt-PT', default: false, localService: true },
				{ name: 'System Voice', lang: 'en-US', default: true, localService: false }
			];
			speechManager.synth.getVoices.mockReturnValue(voicesWithoutBR);

			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			const voiceSelect = document.getElementById('voice-select');
			expect(voiceSelect.options[0].selected).toBe(true);
			expect(speechManager.setVoice).toHaveBeenCalledWith(voicesWithoutBR[0]);
		});

		it('should clear existing options before populating', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			const voiceSelect = document.getElementById('voice-select');
			const initialCount = voiceSelect.options.length;
			
			// Call updateVoices again
			controls.updateVoices();
			
			// Should still have same count, not doubled
			expect(voiceSelect.options.length).toBe(initialCount);
		});

		it('should do nothing if voiceSelect is null', () => {
			const noVoiceIds = {
				textInputId: 'text-input'
			};
			
			const controls = new HtmlSpeechControls(document, noVoiceIds, speechManager);
			
			// Should not throw
			expect(() => controls.updateVoices()).not.toThrow();
		});

		it('should set voice index as option value', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			const voiceSelect = document.getElementById('voice-select');
			expect(voiceSelect.options[0].value).toBe('0');
			expect(voiceSelect.options[1].value).toBe('1');
			expect(voiceSelect.options[2].value).toBe('2');
		});

		it('should handle empty voice list', () => {
			speechManager.synth.getVoices.mockReturnValue([]);

			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			const voiceSelect = document.getElementById('voice-select');
			expect(voiceSelect.options.length).toBe(0);
		});
	});

	describe('Event Handlers', () => {
		describe('Voice Selection', () => {
			it('should set voice when selection changes', () => {
				const controls = new HtmlSpeechControls(document, elementIds, speechManager);
				
				const voiceSelect = document.getElementById('voice-select');
				voiceSelect.value = '2';
				voiceSelect.dispatchEvent(new Event('change'));
				
				expect(speechManager.setVoice).toHaveBeenCalledWith(mockVoices[2]);
			});
		});

		describe('Speak Button', () => {
			it('should speak text when speak button is clicked', () => {
				const controls = new HtmlSpeechControls(document, elementIds, speechManager);
				
				const textInput = document.getElementById('text-input');
				const speakBtn = document.getElementById('speak-btn');
				
				textInput.value = 'Hello world';
				speakBtn.click();
				
				expect(speechManager.speak).toHaveBeenCalledWith('Hello world', 0);
			});

			it('should not speak if text is empty', () => {
				const controls = new HtmlSpeechControls(document, elementIds, speechManager);
				
				const textInput = document.getElementById('text-input');
				const speakBtn = document.getElementById('speak-btn');
				
				textInput.value = '';
				speakBtn.click();
				
				expect(speechManager.speak).not.toHaveBeenCalled();
			});

			it('should trim whitespace before speaking', () => {
				const controls = new HtmlSpeechControls(document, elementIds, speechManager);
				
				const textInput = document.getElementById('text-input');
				const speakBtn = document.getElementById('speak-btn');
				
				textInput.value = '  Hello world  ';
				speakBtn.click();
				
				expect(speechManager.speak).toHaveBeenCalledWith('Hello world', 0);
			});
		});

		describe('Control Buttons', () => {
			it('should pause when pause button is clicked', () => {
				const controls = new HtmlSpeechControls(document, elementIds, speechManager);
				
				const pauseBtn = document.getElementById('pause-btn');
				pauseBtn.click();
				
				expect(speechManager.pause).toHaveBeenCalled();
			});

			it('should resume when resume button is clicked', () => {
				const controls = new HtmlSpeechControls(document, elementIds, speechManager);
				
				const resumeBtn = document.getElementById('resume-btn');
				resumeBtn.click();
				
				expect(speechManager.resume).toHaveBeenCalled();
			});

			it('should stop when stop button is clicked', () => {
				const controls = new HtmlSpeechControls(document, elementIds, speechManager);
				
				const stopBtn = document.getElementById('stop-btn');
				stopBtn.click();
				
				expect(speechManager.stop).toHaveBeenCalled();
			});
		});

		describe('Rate Slider', () => {
			it('should update rate when slider changes', () => {
				const controls = new HtmlSpeechControls(document, elementIds, speechManager);
				
				const rateInput = document.getElementById('rate');
				rateInput.value = '1.5';
				rateInput.dispatchEvent(new Event('input'));
				
				expect(speechManager.setRate).toHaveBeenCalledWith(1.5);
			});

			it('should update rate value display', () => {
				const controls = new HtmlSpeechControls(document, elementIds, speechManager);
				
				const rateInput = document.getElementById('rate');
				const rateValue = document.getElementById('rate-value');
				
				rateInput.value = '1.5';
				rateInput.dispatchEvent(new Event('input'));
				
				expect(rateValue.textContent).toBe('1.5');
			});

			it('should format rate value to 1 decimal place', () => {
				const controls = new HtmlSpeechControls(document, elementIds, speechManager);
				
				const rateInput = document.getElementById('rate');
				const rateValue = document.getElementById('rate-value');
				
				rateInput.value = '1.567';
				rateInput.dispatchEvent(new Event('input'));
				
				expect(rateValue.textContent).toBe('1.6');
			});
		});

		describe('Pitch Slider', () => {
			it('should update pitch when slider changes', () => {
				const controls = new HtmlSpeechControls(document, elementIds, speechManager);
				
				const pitchInput = document.getElementById('pitch');
				pitchInput.value = '1.2';
				pitchInput.dispatchEvent(new Event('input'));
				
				expect(speechManager.setPitch).toHaveBeenCalledWith(1.2);
			});

			it('should update pitch value display', () => {
				const controls = new HtmlSpeechControls(document, elementIds, speechManager);
				
				const pitchInput = document.getElementById('pitch');
				const pitchValue = document.getElementById('pitch-value');
				
				pitchInput.value = '1.2';
				pitchInput.dispatchEvent(new Event('input'));
				
				expect(pitchValue.textContent).toBe('1.2');
			});

			it('should format pitch value to 1 decimal place', () => {
				const controls = new HtmlSpeechControls(document, elementIds, speechManager);
				
				const pitchInput = document.getElementById('pitch');
				const pitchValue = document.getElementById('pitch-value');
				
				pitchInput.value = '1.234';
				pitchInput.dispatchEvent(new Event('input'));
				
				expect(pitchValue.textContent).toBe('1.2');
			});
		});

		describe('Voices Changed Event', () => {
			it('should set up voiceschanged handler if available', () => {
				const controls = new HtmlSpeechControls(document, elementIds, speechManager);
				
				expect(window.speechSynthesis.onvoiceschanged).toBeDefined();
				expect(controls._boundHandlers.has('voicesChanged')).toBe(true);
			});

			it('should update voices when voiceschanged fires', () => {
				const controls = new HtmlSpeechControls(document, elementIds, speechManager);
				
				// Clear the call count from initialization
				speechManager.synth.getVoices.mockClear();
				
				// Trigger voiceschanged
				window.speechSynthesis.onvoiceschanged();
				
				expect(speechManager.synth.getVoices).toHaveBeenCalled();
			});
		});
	});

	describe('destroy()', () => {
		it('should remove voice select listener', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			const voiceSelect = document.getElementById('voice-select');
			
			controls.destroy();
			
			// Trigger event after destroy
			speechManager.setVoice.mockClear();
			voiceSelect.value = '1';
			voiceSelect.dispatchEvent(new Event('change'));
			
			// Should not be called since listener was removed
			expect(speechManager.setVoice).not.toHaveBeenCalled();
		});

		it('should remove speak button listener', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			const speakBtn = document.getElementById('speak-btn');
			
			controls.destroy();
			
			speechManager.speak.mockClear();
			speakBtn.click();
			
			expect(speechManager.speak).not.toHaveBeenCalled();
		});

		it('should remove pause button listener', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			const pauseBtn = document.getElementById('pause-btn');
			
			controls.destroy();
			
			speechManager.pause.mockClear();
			pauseBtn.click();
			
			expect(speechManager.pause).not.toHaveBeenCalled();
		});

		it('should remove resume button listener', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			const resumeBtn = document.getElementById('resume-btn');
			
			controls.destroy();
			
			speechManager.resume.mockClear();
			resumeBtn.click();
			
			expect(speechManager.resume).not.toHaveBeenCalled();
		});

		it('should remove stop button listener', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			const stopBtn = document.getElementById('stop-btn');
			
			controls.destroy();
			
			speechManager.stop.mockClear();
			stopBtn.click();
			
			expect(speechManager.stop).not.toHaveBeenCalled();
		});

		it('should remove rate slider listener', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			const rateInput = document.getElementById('rate');
			
			controls.destroy();
			
			speechManager.setRate.mockClear();
			rateInput.value = '1.5';
			rateInput.dispatchEvent(new Event('input'));
			
			expect(speechManager.setRate).not.toHaveBeenCalled();
		});

		it('should remove pitch slider listener', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			const pitchInput = document.getElementById('pitch');
			
			controls.destroy();
			
			speechManager.setPitch.mockClear();
			pitchInput.value = '1.2';
			pitchInput.dispatchEvent(new Event('input'));
			
			expect(speechManager.setPitch).not.toHaveBeenCalled();
		});

		it('should clear voiceschanged handler', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			expect(window.speechSynthesis.onvoiceschanged).not.toBeNull();
			
			controls.destroy();
			
			expect(window.speechSynthesis.onvoiceschanged).toBeNull();
		});

		it('should clear bound handlers map', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			const initialSize = controls._boundHandlers.size;
			expect(initialSize).toBeGreaterThan(0);
			
			controls.destroy();
			
			expect(controls._boundHandlers.size).toBe(0);
		});

		it('should not throw if elements are null', () => {
			const minimalIds = { voiceSelectId: 'voice-select' };
			const controls = new HtmlSpeechControls(document, minimalIds, speechManager);
			
			expect(() => controls.destroy()).not.toThrow();
		});

		it('should be safe to call multiple times', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			controls.destroy();
			
			expect(() => controls.destroy()).not.toThrow();
		});
	});

	describe('toString()', () => {
		it('should return class name', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			expect(controls.toString()).toBe('HtmlSpeechControls');
		});
	});

	describe('Integration Tests', () => {
		it('should coordinate between UI and speech manager', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			// Change rate
			const rateInput = document.getElementById('rate');
			rateInput.value = '1.5';
			rateInput.dispatchEvent(new Event('input'));
			
			// Change pitch
			const pitchInput = document.getElementById('pitch');
			pitchInput.value = '1.2';
			pitchInput.dispatchEvent(new Event('input'));
			
			// Speak
			const textInput = document.getElementById('text-input');
			const speakBtn = document.getElementById('speak-btn');
			textInput.value = 'Test speech';
			speakBtn.click();
			
			expect(speechManager.setRate).toHaveBeenCalledWith(1.5);
			expect(speechManager.setPitch).toHaveBeenCalledWith(1.2);
			expect(speechManager.speak).toHaveBeenCalledWith('Test speech', 0);
		});

		it('should handle full lifecycle (create, use, destroy)', () => {
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			// Use controls
			const speakBtn = document.getElementById('speak-btn');
			speakBtn.click();
			expect(speechManager.speak).toHaveBeenCalled();
			
			// Cleanup
			controls.destroy();
			
			// Verify cleanup
			speechManager.speak.mockClear();
			speakBtn.click();
			expect(speechManager.speak).not.toHaveBeenCalled();
		});
	});

	describe('Edge Cases', () => {
		it('should handle missing DOM elements gracefully', () => {
			// Remove some elements
			document.getElementById('pause-btn').remove();
			document.getElementById('resume-btn').remove();
			
			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			// Should not throw
			expect(() => controls.destroy()).not.toThrow();
		});

		it('should handle case-insensitive language comparison', () => {
			const voicesWithMixedCase = [
				{ name: 'Voice 1', lang: 'PT-BR', default: false, localService: true },
				{ name: 'Voice 2', lang: 'en-US', default: true, localService: false }
			];
			speechManager.synth.getVoices.mockReturnValue(voicesWithMixedCase);

			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			// Should still prioritize pt-BR (case-insensitive)
			expect(speechManager.setVoice).toHaveBeenCalledWith(voicesWithMixedCase[0]);
		});

		it('should handle voices without localization', () => {
			const voicesWithoutLang = [
				{ name: 'System Voice', lang: '', default: true, localService: false }
			];
			speechManager.synth.getVoices.mockReturnValue(voicesWithoutLang);

			const controls = new HtmlSpeechControls(document, elementIds, speechManager);
			
			const voiceSelect = document.getElementById('voice-select');
			expect(voiceSelect.options.length).toBe(1);
		});
	});
});
