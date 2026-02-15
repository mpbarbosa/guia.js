'use strict';

/**
 * HTML speech synthesis UI controls manager.
 * 
 * This module manages all UI elements and event handlers for speech synthesis controls,
 * including voice selection dropdowns, control buttons (speak, pause, resume, stop),
 * and parameter sliders (rate, pitch). It delegates speech synthesis operations to
 * the SpeechSynthesisManager while handling all DOM interactions and user input.
 * 
 * **Design Pattern**: Controller with Event Management
 * - Manages DOM element references
 * - Sets up and cleans up event listeners
 * - Delegates speech operations to SpeechSynthesisManager
 * - No speech synthesis logic (single responsibility)
 * 
 * **Brazilian Portuguese Features**:
 * - Prioritizes pt-BR voices in voice selection
 * - Falls back to other Portuguese variants
 * - Provides clear voice identification in dropdown
 * 
 * **Memory Management**:
 * - Stores bound event handlers for cleanup
 * - Provides destroy() method to prevent memory leaks
 * - Removes all event listeners on cleanup
 * 
 * @module HtmlSpeechControls
 * @since 0.11.0-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * // Basic usage
 * import { HtmlSpeechControls } from './html/HtmlSpeechControls.js';
 * import SpeechSynthesisManager from './speech/SpeechSynthesisManager.js';
 * 
 * const speechManager = new SpeechSynthesisManager();
 * const controls = new HtmlSpeechControls(document, {
 *   voiceSelectId: 'voice-select',
 *   textInputId: 'text-input',
 *   speakBtnId: 'speak-btn',
 *   pauseBtnId: 'pause-btn',
 *   resumeBtnId: 'resume-btn',
 *   stopBtnId: 'stop-btn',
 *   rateInputId: 'rate',
 *   rateValueId: 'rate-value',
 *   pitchInputId: 'pitch',
 *   pitchValueId: 'pitch-value'
 * }, speechManager);
 * 
 * // Cleanup when done
 * controls.destroy();
 */

import SpeechSynthesisManager from '../speech/SpeechSynthesisManager.js';

/**
 * HTML speech synthesis UI controls manager.
 * 
 * Manages all UI elements and event handlers for speech synthesis controls.
 * Delegates speech operations to SpeechSynthesisManager while handling DOM
 * interactions, user input, and event listener lifecycle.
 * 
 * **Managed Elements**:
 * - Voice selection dropdown
 * - Text input field
 * - Control buttons (speak, pause, resume, stop)
 * - Rate and pitch sliders with value displays
 * 
 * **Event Handling**:
 * - Voice selection changes
 * - Button clicks (speak, pause, resume, stop)
 * - Slider input changes (rate, pitch)
 * - Voice loading events (voiceschanged)
 * 
 * @class HtmlSpeechControls
 * @since 0.11.0-alpha
 */
export class HtmlSpeechControls {
	/**
	 * Creates a new HtmlSpeechControls instance.
	 * 
	 * Initializes the speech controls manager with DOM references and a speech
	 * synthesis manager. Gets all DOM elements by ID, sets up event handlers,
	 * and populates the voice selection dropdown.
	 * 
	 * **Initialization Steps**:
	 * 1. Validate parameters
	 * 2. Get DOM element references
	 * 3. Populate voice dropdown
	 * 4. Set up event handlers
	 * 5. Freeze object for immutability
	 * 
	 * @constructor
	 * @param {Document} document - DOM document object
	 * @param {Object} elementIds - Element ID configuration
	 * @param {string} [elementIds.voiceSelectId] - Voice dropdown element ID
	 * @param {string} [elementIds.textInputId] - Text input element ID
	 * @param {string} [elementIds.speakBtnId] - Speak button element ID
	 * @param {string} [elementIds.pauseBtnId] - Pause button element ID
	 * @param {string} [elementIds.resumeBtnId] - Resume button element ID
	 * @param {string} [elementIds.stopBtnId] - Stop button element ID
	 * @param {string} [elementIds.rateInputId] - Rate slider element ID
	 * @param {string} [elementIds.rateValueId] - Rate value display element ID
	 * @param {string} [elementIds.pitchInputId] - Pitch slider element ID
	 * @param {string} [elementIds.pitchValueId] - Pitch value display element ID
	 * @param {SpeechSynthesisManager} speechManager - Speech synthesis manager instance
	 * @throws {TypeError} If document is null/undefined
	 * @throws {TypeError} If elementIds is null/undefined
	 * @throws {TypeError} If elementIds is not an object
	 * @throws {TypeError} If speechManager is null/undefined
	 * @since 0.11.0-alpha
	 * 
	 * @example
	 * const controls = new HtmlSpeechControls(document, {
	 *   voiceSelectId: 'voice-select',
	 *   textInputId: 'text-input',
	 *   speakBtnId: 'speak-btn'
	 * }, speechManager);
	 */
	constructor(document, elementIds, speechManager) {
		// Parameter validation
		if (document == null) {
			throw new TypeError("Document parameter cannot be null or undefined");
		}
		
		if (elementIds == null) {
			throw new TypeError("ElementIds parameter cannot be null or undefined");
		}
		
		if (typeof elementIds !== 'object') {
			throw new TypeError("ElementIds must be an object containing element ID configuration");
		}

		if (speechManager == null) {
			throw new TypeError("SpeechManager parameter cannot be null or undefined");
		}

		/**
		 * Document reference for DOM operations.
		 * @private
		 * @type {Document}
		 */
		this.document = document;

		/**
		 * Configuration object containing HTML element IDs.
		 * @private
		 * @type {Object}
		 */
		this.elementIds = elementIds;

		/**
		 * Speech synthesis manager for delegating speech operations.
		 * @private
		 * @type {SpeechSynthesisManager}
		 */
		this.speechManager = speechManager;

		// Get DOM elements with error handling
		/**
		 * Voice selection dropdown element.
		 * @private
		 * @type {HTMLSelectElement|null}
		 */
		this.voiceSelect = elementIds.voiceSelectId ? 
			this.document.getElementById(elementIds.voiceSelectId) : null;

		/**
		 * Text input field element.
		 * @private
		 * @type {HTMLInputElement|null}
		 */
		this.textInput = elementIds.textInputId ? 
			this.document.getElementById(elementIds.textInputId) : null;

		/**
		 * Speak button element.
		 * @private
		 * @type {HTMLButtonElement|null}
		 */
		this.speakBtn = elementIds.speakBtnId ? 
			this.document.getElementById(elementIds.speakBtnId) : null;

		/**
		 * Pause button element.
		 * @private
		 * @type {HTMLButtonElement|null}
		 */
		this.pauseBtn = elementIds.pauseBtnId ? 
			this.document.getElementById(elementIds.pauseBtnId) : null;

		/**
		 * Resume button element.
		 * @private
		 * @type {HTMLButtonElement|null}
		 */
		this.resumeBtn = elementIds.resumeBtnId ? 
			this.document.getElementById(elementIds.resumeBtnId) : null;

		/**
		 * Stop button element.
		 * @private
		 * @type {HTMLButtonElement|null}
		 */
		this.stopBtn = elementIds.stopBtnId ? 
			this.document.getElementById(elementIds.stopBtnId) : null;

		/**
		 * Rate slider input element.
		 * @private
		 * @type {HTMLInputElement|null}
		 */
		this.rateInput = elementIds.rateInputId ? 
			this.document.getElementById(elementIds.rateInputId) : null;

		/**
		 * Rate value display element.
		 * @private
		 * @type {HTMLElement|null}
		 */
		this.rateValue = elementIds.rateValueId ? 
			this.document.getElementById(elementIds.rateValueId) : null;

		/**
		 * Pitch slider input element.
		 * @private
		 * @type {HTMLInputElement|null}
		 */
		this.pitchInput = elementIds.pitchInputId ? 
			this.document.getElementById(elementIds.pitchInputId) : null;

		/**
		 * Pitch value display element.
		 * @private
		 * @type {HTMLElement|null}
		 */
		this.pitchValue = elementIds.pitchValueId ? 
			this.document.getElementById(elementIds.pitchValueId) : null;

		/**
		 * Bound event handlers for cleanup.
		 * @private
		 * @type {Map<string, Function>}
		 */
		this._boundHandlers = new Map();

		// Initialize UI
		this.updateVoices();
		this._setupEventHandlers();

		// Freeze instance for immutability
		Object.freeze(this);
	}

	/**
	 * Updates the voice selection dropdown with available voices.
	 * 
	 * Populates the voice selection dropdown with all available speech synthesis
	 * voices, prioritizing Brazilian Portuguese (pt-BR) voices for target users.
	 * If pt-BR voices are not available, falls back to other Portuguese variants,
	 * and finally to the system default voice.
	 * 
	 * **Voice Selection Priority**:
	 * 1. Brazilian Portuguese (pt-BR) - Primary target for travel guide
	 * 2. Other Portuguese variants (pt-*) - Secondary fallback
	 * 3. System default voice - Final fallback
	 * 
	 * **Accessibility Considerations**:
	 * - Voice names include language codes for user clarity
	 * - Automatic selection of appropriate voice for Brazilian users
	 * - Graceful fallback when preferred voices unavailable
	 * 
	 * @returns {void}
	 * @since 0.11.0-alpha
	 * 
	 * @example
	 * // Called automatically during initialization
	 * controls.updateVoices();
	 * 
	 * // Voice dropdown will show entries like:
	 * // "Google português do Brasil (pt-BR)" - Selected by default
	 * // "Microsoft Helena - Portuguese (Portugal) (pt-PT)"
	 * // "System Voice (en-US)"
	 */
	updateVoices() {
		if (!this.voiceSelect) return;

		// Clear existing options
		this.voiceSelect.innerHTML = '';

		// Get available voices from speech synthesis
		const voices = this.speechManager.synth.getVoices();

		// Track if we found a Brazilian Portuguese voice
		let brazilianVoiceFound = false;

		// Add voices to dropdown with priority selection
		voices.forEach((voice, index) => {
			const option = this.document.createElement('option');
			option.value = index;
			option.textContent = `${voice.name} (${voice.lang})`;

			// PRIORITY 1: Select Brazilian Portuguese voice (pt-BR) by default
			if (voice.lang.toLowerCase() === 'pt-br') {
				option.selected = true;
				this.speechManager.setVoice(voice);
				brazilianVoiceFound = true;
			}
			// PRIORITY 2: Select any Portuguese voice if pt-BR not found
			else if (!brazilianVoiceFound && voice.lang.toLowerCase().startsWith('pt')) {
				option.selected = true;
				this.speechManager.setVoice(voice);
			}

			this.voiceSelect.appendChild(option);
		});
	}

	/**
	 * Sets up event handlers for all speech synthesis controls.
	 * 
	 * Configures event listeners for all UI controls including voice selection,
	 * speech control buttons (speak, pause, resume, stop), and parameter sliders
	 * (rate, pitch). Also handles the voiceschanged event for dynamic voice loading.
	 * 
	 * Stores bound handlers in _boundHandlers Map for proper cleanup.
	 * 
	 * **Event Handlers Configured**:
	 * - Voice selection change: Updates selected voice in speech manager
	 * - Speak button: Speaks text from input field with default priority
	 * - Pause/Resume/Stop buttons: Controls speech synthesis playback
	 * - Rate/Pitch sliders: Adjusts speech parameters and updates display
	 * - Voice loading: Refreshes voice list when browser loads new voices
	 * 
	 * @private
	 * @returns {void}
	 * @since 0.11.0-alpha
	 */
	_setupEventHandlers() {
		// Voice selection change handler
		if (this.voiceSelect) {
			const voiceChangeHandler = (e) => {
				const voices = this.speechManager.synth.getVoices();
				const selectedVoice = voices[e.target.value];
				this.speechManager.setVoice(selectedVoice);
			};
			this.voiceSelect.addEventListener('change', voiceChangeHandler);
			this._boundHandlers.set('voiceChange', voiceChangeHandler);
		}

		// Speak button handler
		if (this.speakBtn && this.textInput) {
			const speakHandler = () => {
				const text = this.textInput.value.trim();
				if (text) {
					this.speechManager.speak(text, 0); // Default priority for manual speech
				}
			};
			this.speakBtn.addEventListener('click', speakHandler);
			this._boundHandlers.set('speak', speakHandler);
		}

		// Pause button handler
		if (this.pauseBtn) {
			const pauseHandler = () => {
				this.speechManager.pause();
			};
			this.pauseBtn.addEventListener('click', pauseHandler);
			this._boundHandlers.set('pause', pauseHandler);
		}

		// Resume button handler
		if (this.resumeBtn) {
			const resumeHandler = () => {
				this.speechManager.resume();
			};
			this.resumeBtn.addEventListener('click', resumeHandler);
			this._boundHandlers.set('resume', resumeHandler);
		}

		// Stop button handler
		if (this.stopBtn) {
			const stopHandler = () => {
				this.speechManager.stop();
			};
			this.stopBtn.addEventListener('click', stopHandler);
			this._boundHandlers.set('stop', stopHandler);
		}

		// Rate control slider handler
		if (this.rateInput && this.rateValue) {
			const rateHandler = (e) => {
				const rate = parseFloat(e.target.value);
				this.speechManager.setRate(rate);
				this.rateValue.textContent = rate.toFixed(1);
			};
			this.rateInput.addEventListener('input', rateHandler);
			this._boundHandlers.set('rate', rateHandler);
		}

		// Pitch control slider handler
		if (this.pitchInput && this.pitchValue) {
			const pitchHandler = (e) => {
				const pitch = parseFloat(e.target.value);
				this.speechManager.setPitch(pitch);
				this.pitchValue.textContent = pitch.toFixed(1);
			};
			this.pitchInput.addEventListener('input', pitchHandler);
			this._boundHandlers.set('pitch', pitchHandler);
		}

		// Handle dynamic voice loading (some browsers load voices asynchronously)
		if (typeof window !== 'undefined' && window.speechSynthesis && 
		    window.speechSynthesis.onvoiceschanged !== undefined) {
			const voicesChangedHandler = () => {
				this.updateVoices();
			};
			window.speechSynthesis.onvoiceschanged = voicesChangedHandler;
			this._boundHandlers.set('voicesChanged', voicesChangedHandler);
		}
	}

	/**
	 * Removes all event listeners and cleans up resources.
	 * 
	 * Properly removes all event listeners to prevent memory leaks when the
	 * controls are no longer needed. Should be called before discarding the
	 * controls instance.
	 * 
	 * **Cleanup Actions**:
	 * - Removes voice select change listener
	 * - Removes all button click listeners
	 * - Removes rate/pitch slider listeners
	 * - Clears voiceschanged handler
	 * - Clears bound handlers map
	 * 
	 * @returns {void}
	 * @since 0.11.0-alpha
	 * 
	 * @example
	 * // Cleanup when controls no longer needed
	 * controls.destroy();
	 */
	destroy() {
		// Remove voice select listener
		if (this.voiceSelect && this._boundHandlers.has('voiceChange')) {
			this.voiceSelect.removeEventListener('change', this._boundHandlers.get('voiceChange'));
		}

		// Remove button listeners
		if (this.speakBtn && this._boundHandlers.has('speak')) {
			this.speakBtn.removeEventListener('click', this._boundHandlers.get('speak'));
		}

		if (this.pauseBtn && this._boundHandlers.has('pause')) {
			this.pauseBtn.removeEventListener('click', this._boundHandlers.get('pause'));
		}

		if (this.resumeBtn && this._boundHandlers.has('resume')) {
			this.resumeBtn.removeEventListener('click', this._boundHandlers.get('resume'));
		}

		if (this.stopBtn && this._boundHandlers.has('stop')) {
			this.stopBtn.removeEventListener('click', this._boundHandlers.get('stop'));
		}

		// Remove slider listeners
		if (this.rateInput && this._boundHandlers.has('rate')) {
			this.rateInput.removeEventListener('input', this._boundHandlers.get('rate'));
		}

		if (this.pitchInput && this._boundHandlers.has('pitch')) {
			this.pitchInput.removeEventListener('input', this._boundHandlers.get('pitch'));
		}

		// Clear voiceschanged handler
		if (typeof window !== 'undefined' && window.speechSynthesis) {
			window.speechSynthesis.onvoiceschanged = null;
		}

		// Clear bound handlers
		this._boundHandlers.clear();
	}

	/**
	 * Returns a string representation of this controls manager.
	 * 
	 * @returns {string} String representation
	 * @since 0.11.0-alpha
	 * 
	 * @example
	 * const controls = new HtmlSpeechControls(document, elementIds, speechManager);
	 * console.log(controls.toString());
	 * // Output: "HtmlSpeechControls"
	 */
	toString() {
		return this.constructor.name;
	}
}

export default HtmlSpeechControls;
