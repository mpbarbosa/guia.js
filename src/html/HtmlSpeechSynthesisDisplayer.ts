import { log } from '../utils/logger.js';
import type { SpeechElementIds } from './HtmlSpeechControls.js';
import type BrazilianStandardAddress from '../data/BrazilianStandardAddress.js';

/**
 * HTML-based speech synthesis controller with UI integration and address change notifications.
 * 
 * **THIS IS A FACADE**: This class maintains backward compatibility with the original
 * HtmlSpeechSynthesisDisplayer API while internally composing three focused components:
 * - HtmlSpeechControls: Manages UI elements and event handlers
 * - AddressSpeechObserver: Handles address change notifications
 * - SpeechTextBuilder: Formats Brazilian Portuguese address announcements
 * 
 * This facade pattern allows the external API to remain unchanged while the internal
 * implementation has been refactored for better maintainability, testability, and
 * Single Responsibility Principle compliance.
 * 
 * Key features:
 * - HTML UI integration with voice controls (select, rate, pitch sliders)
 * - Observer pattern integration for address change notifications
 * - Priority-based speech synthesis (municipality > bairro > logradouro)
 * - Brazilian Portuguese voice prioritization with fallback support
 * - Periodic full address announcements at 50-second intervals
 * - Accessibility features for travel guide users
 * - Backward compatible with original API
 * 
 * @module HtmlSpeechSynthesisDisplayer
 * @since 0.11.0-alpha - Refactored to facade pattern
 * @author Marcelo Pereira Barbosa
 */

import HtmlSpeechControls from './HtmlSpeechControls.js';
import AddressSpeechObserver from '../observers/AddressSpeechObserver.js';
import SpeechSynthesisManager from '../speech/SpeechSynthesisManager.js';
import SpeechTextBuilder from '../speech/SpeechTextBuilder.js';

/**
 * HTML-based speech synthesis controller with UI integration and address change notifications.
 * 
 * **Facade Pattern**: Composes HtmlSpeechControls, AddressSpeechObserver, and SpeechTextBuilder
 * to maintain backward compatibility with the original monolithic implementation.
 * 
 * **Architecture Pattern**: Facade + Composition
 * - Implements observer pattern to receive address change notifications
 * - Controls HTML UI elements for speech synthesis configuration via HtmlSpeechControls
 * - Manages address change notifications via AddressSpeechObserver
 * - Formats speech text via SpeechTextBuilder
 * 
 * **Priority System for Brazilian Travel Guide**:
 * - Municipality changes (priority 3): Highest priority for city changes
 * - Neighborhood/Bairro changes (priority 2): Medium priority for local area changes
 * - Street/Logradouro changes (priority 1): Low priority for street-level changes
 * - Periodic full address (priority 0): Background announcements every 50 seconds
 * 
 * **Brazilian Portuguese Optimization**:
 * - Automatically selects pt-BR voices when available
 * - Falls back to other Portuguese variants if pt-BR not found
 * - Optimized speech text formatting for Brazilian addresses
 * - Travel guide context with accessibility features
 * 
 * @class HtmlSpeechSynthesisDisplayer
 * @since 0.11.0-alpha - Refactored to facade pattern
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * // Basic usage with HTML elements (same as original API)
 * const displayer = new HtmlSpeechSynthesisDisplayer(document, {
 *   languageSelectId: 'language',
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
 * });
 * 
 * // Subscribe to address change notifications (same as original API)
 * reverseGeocoder.subscribe(displayer);
 * webGeocodingManager.subscribe(displayer);
 * 
 * @example
 * // Observer pattern integration (same as original API)
 * const observer = {
 *   update: (currentAddress, event, posEvent, changeDetails) => {
 *     // Displayer automatically handles:
 *     // - Municipality changes with priority 3
 *     // - Bairro changes with priority 2  
 *     // - Logradouro changes with priority 1
 *     // - Periodic full address with priority 0
 *   }
 * };
 */
class HtmlSpeechSynthesisDisplayer {
	document: Document;
	elementIds: SpeechElementIds;
	speechManager: SpeechSynthesisManager;
	_textBuilder: SpeechTextBuilder;
	_speechControls: HtmlSpeechControls;
	_addressObserver: AddressSpeechObserver;
	/**
	 * Creates a new HtmlSpeechSynthesisDisplayer facade instance.
	 * 
	 * **Backward Compatible API**: This constructor maintains the exact same signature
	 * and behavior as the original monolithic implementation. Internally, it creates
	 * and coordinates three focused components.
	 * 
	 * **Initialization Process**:
	 * 1. Validate parameters (document and elementIds required)
	 * 2. Create shared SpeechSynthesisManager instance
	 * 3. Create shared SpeechTextBuilder instance
	 * 4. Create HtmlSpeechControls for UI management
	 * 5. Create AddressSpeechObserver for address change notifications
	 * 6. Freeze the facade instance to prevent external modification
	 * 
	 * **Element ID Configuration**:
	 * All element IDs are required for full functionality, but missing elements
	 * are handled gracefully with console warnings. This allows partial UI
	 * implementations while maintaining core speech synthesis functionality.
	 * 
	 * @param {Document} document - Document object for DOM operations
	 * @param {Object} elementIds - Object containing HTML element IDs for controls
	 * @param {string} elementIds.languageSelectId - Language selection dropdown ID
	 * @param {string} elementIds.voiceSelectId - Voice selection dropdown ID
	 * @param {string} elementIds.textInputId - Text input field ID
	 * @param {string} elementIds.speakBtnId - Speak button ID
	 * @param {string} elementIds.pauseBtnId - Pause button ID
	 * @param {string} elementIds.resumeBtnId - Resume button ID
	 * @param {string} elementIds.stopBtnId - Stop button ID
	 * @param {string} elementIds.rateInputId - Rate slider ID
	 * @param {string} elementIds.rateValueId - Rate value display ID
	 * @param {string} elementIds.pitchInputId - Pitch slider ID
	 * @param {string} elementIds.pitchValueId - Pitch value display ID
	 * 
	 * @throws {TypeError} When document is null or undefined
	 * @throws {TypeError} When elementIds is null or undefined
	 * @throws {TypeError} When elementIds is not an object
	 * 
	 * @example
	 * const displayer = new HtmlSpeechSynthesisDisplayer(document, {
	 *   languageSelectId: 'language',
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
	 * });
	 */
	constructor(document: Document, elementIds: SpeechElementIds) {
		// Parameter validation with specific error messages (same as original)
		if (document == null) {
			throw new TypeError("Document parameter cannot be null or undefined");
		}
		
		if (elementIds == null) {
			throw new TypeError("ElementIds parameter cannot be null or undefined");
		}
		
		if (typeof elementIds !== 'object') {
			throw new TypeError("ElementIds must be an object containing element ID configuration");
		}

		/**
		 * Document reference for DOM operations.
		 * @type {Document}
		 */
		this.document = document;

		/**
		 * Configuration object containing HTML element IDs.
		 * @type {Object}
		 */
		this.elementIds = elementIds;

		/**
		 * Shared speech synthesis manager for processing speech requests.
		 * @type {SpeechSynthesisManager}
		 */
		this.speechManager = new SpeechSynthesisManager();

		/**
		 * Shared speech text builder for formatting Brazilian Portuguese addresses.
		 * @private
		 * @type {SpeechTextBuilder}
		 */
		this._textBuilder = new SpeechTextBuilder();

		/**
		 * UI controller for speech synthesis controls.
		 * Manages DOM elements, event handlers, and voice selection.
		 * @private
		 * @type {HtmlSpeechControls}
		 */
		this._speechControls = new HtmlSpeechControls(
			document,
			elementIds,
			this.speechManager
		);

		/**
		 * Observer for address change notifications.
		 * Handles priority-based speech synthesis for address updates.
		 * @private
		 * @type {AddressSpeechObserver}
		 */
		this._addressObserver = new AddressSpeechObserver(
			this.speechManager,
			this._textBuilder,
			document.getElementById(elementIds.textInputId || '') // Optional text input for updates
		);

		// Log successful initialization
		log('HtmlSpeechSynthesisDisplayer: Facade initialized with composed components');

		// Freeze the facade instance to prevent external modification
		// (same immutability guarantee as original implementation)
		Object.freeze(this);
	}

	// ========================================================================
	// Public Property Accessors (Backward Compatibility)
	// ========================================================================
	
	/**
	 * Gets the voice selection dropdown element.
	 * @returns {HTMLSelectElement|null} Voice select element or null if not found
	 */
	get voiceSelect() {
		return this._speechControls?.voiceSelect || null;
	}

	/**
	 * Gets the text input element.
	 * @returns {HTMLInputElement|null} Text input element or null if not found
	 */
	get textInput() {
		return this._speechControls?.textInput || null;
	}

	/**
	 * Gets the language selection dropdown element.
	 * @returns {HTMLSelectElement|null} Language select element or null if not found
	 */
	get languageSelect() {
		return (this._speechControls as unknown as Record<string, unknown>)?.languageSelect as HTMLSelectElement | null || null;
	}

	/**
	 * Gets the speak button element.
	 * @returns {HTMLButtonElement|null} Speak button element or null if not found
	 */
	get speakBtn() {
		return this._speechControls?.speakBtn || null;
	}

	/**
	 * Gets the pause button element.
	 * @returns {HTMLButtonElement|null} Pause button element or null if not found
	 */
	get pauseBtn() {
		return this._speechControls?.pauseBtn || null;
	}

	/**
	 * Gets the resume button element.
	 * @returns {HTMLButtonElement|null} Resume button element or null if not found
	 */
	get resumeBtn() {
		return this._speechControls?.resumeBtn || null;
	}

	/**
	 * Gets the stop button element.
	 * @returns {HTMLButtonElement|null} Stop button element or null if not found
	 */
	get stopBtn() {
		return this._speechControls?.stopBtn || null;
	}

	/**
	 * Gets the rate slider element.
	 * @returns {HTMLInputElement|null} Rate slider element or null if not found
	 */
	get rateInput() {
		return this._speechControls?.rateInput || null;
	}

	/**
	 * Gets the rate value display element.
	 * @returns {HTMLSpanElement|null} Rate value display element or null if not found
	 */
	get rateValue() {
		return this._speechControls?.rateValue || null;
	}

	/**
	 * Gets the pitch slider element.
	 * @returns {HTMLInputElement|null} Pitch slider element or null if not found
	 */
	get pitchInput() {
		return this._speechControls?.pitchInput || null;
	}

	/**
	 * Gets the pitch value display element.
	 * @returns {HTMLSpanElement|null} Pitch value display element or null if not found
	 */
	get pitchValue() {
		return this._speechControls?.pitchValue || null;
	}

	// ========================================================================
	// Public Methods (Backward Compatibility)
	// ========================================================================

	/**
	 * Updates the voice selection dropdown with available voices.
	 * 
	 * **Backward Compatible API**: Delegates to HtmlSpeechControls component.
	 * 
	 * This method populates the voice selection dropdown with available system voices,
	 * automatically prioritizing Brazilian Portuguese (pt-BR) voices.
	 * 
	 * @returns {void}
	 * 
	 * @example
	 * displayer.updateVoices();
	 */
	updateVoices(): void {
		// Delegate to HtmlSpeechControls component
		if (this._speechControls && typeof this._speechControls.updateVoices === 'function') {
			this._speechControls.updateVoices();
		}
	}

	/**
	 * Builds speech text for street/logradouro changes.
	 * 
	 * **Backward Compatible API**: Delegates to SpeechTextBuilder component.
	 * 
	 * Formats Brazilian Portuguese text announcing the current street address
	 * with proper prepositions and formatting.
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current address data
	 * @returns {string} Formatted speech text for logradouro
	 * 
	 * @example
	 * const text = displayer.buildTextToSpeechLogradouro(address);
	 * // Returns: "Você está na Rua das Flores, 123"
	 */
	buildTextToSpeechLogradouro(currentAddress: BrazilianStandardAddress): string {
		return this._textBuilder.buildTextToSpeechLogradouro(currentAddress);
	}

	/**
	 * Builds speech text for neighborhood/bairro changes.
	 * 
	 * **Backward Compatible API**: Delegates to SpeechTextBuilder component.
	 * 
	 * Formats Brazilian Portuguese text announcing entry into a new neighborhood
	 * with proper prepositions.
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current address data
	 * @returns {string} Formatted speech text for bairro
	 * 
	 * @example
	 * const text = displayer.buildTextToSpeechBairro(address);
	 * // Returns: "Você entrou no bairro Centro"
	 */
	buildTextToSpeechBairro(currentAddress: BrazilianStandardAddress): string {
		return this._textBuilder.buildTextToSpeechBairro(currentAddress);
	}

	/**
	 * Builds speech text for municipality changes.
	 * 
	 * **Backward Compatible API**: Delegates to SpeechTextBuilder component.
	 * 
	 * Formats Brazilian Portuguese text announcing arrival in a new city/municipality,
	 * optionally including the previous location for context.
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current address data
	 * @param {Object} [changeDetails] - Optional details about municipality change
	 * @param {string} [changeDetails.oldValue] - Previous municipality name
	 * @param {string} [changeDetails.newValue] - New municipality name
	 * @returns {string} Formatted speech text for municipio
	 * 
	 * @example
	 * const text = displayer.buildTextToSpeechMunicipio(address, {
	 *   oldValue: 'Recife',
	 *   newValue: 'Olinda'
	 * });
	 * // Returns: "Você saiu de Recife e entrou em Olinda"
	 */
	buildTextToSpeechMunicipio(currentAddress: BrazilianStandardAddress, changeDetails?: Record<string, unknown>): string {
		return this._textBuilder.buildTextToSpeechMunicipio(currentAddress, changeDetails);
	}

	/**
	 * Builds full address speech text.
	 * 
	 * **Backward Compatible API**: Delegates to SpeechTextBuilder component.
	 * 
	 * Formats complete Brazilian Portuguese address announcement including
	 * street, neighborhood, and city information.
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current address data
	 * @returns {string} Formatted speech text for full address
	 * 
	 * @example
	 * const text = displayer.buildTextToSpeech(address);
	 * // Returns: "Você está na Rua das Flores, 123, no bairro Centro, em São Paulo"
	 */
	buildTextToSpeech(currentAddress: BrazilianStandardAddress): string {
		return this._textBuilder.buildTextToSpeech(currentAddress);
	}

	/**
	 * Observer pattern update method for address change notifications.
	 * 
	 * **Backward Compatible API**: This method maintains the exact same signature
	 * and behavior as the original monolithic implementation. It delegates to the
	 * AddressSpeechObserver component while maintaining the same external interface.
	 * 
	 * This method is called by observable subjects (ReverseGeocoder, WebGeocodingManager)
	 * when address data changes. It implements priority-based speech synthesis:
	 * - Priority 3: Municipality changes (highest)
	 * - Priority 2.5: First address announcement
	 * - Priority 2: Bairro/neighborhood changes
	 * - Priority 1: Logradouro/street changes
	 * - Priority 0: Periodic full address (every 50+ seconds)
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current address data
	 * @param {string} event - Event type (e.g., 'MunicipioChanged', 'BairroChanged')
	 * @param {string} posEvent - Position event type (e.g., 'strCurrPosUpdate')
	 * @param {Object} [changeDetails] - Optional details about what changed
	 * 
	 * @returns {void}
	 * 
	 * @example
	 * // Called automatically by observable subjects
	 * displayer.update(
	 *   brazilianAddress,
	 *   'BairroChanged',
	 *   'strCurrPosUpdate',
	 *   { oldValue: 'Centro', newValue: 'Jardins' }
	 * );
	 */
	update(currentAddress: BrazilianStandardAddress, event: string, posEvent: string, changeDetails?: Record<string, unknown>): void {
		// Log for backward compatibility with original implementation
		if (typeof console !== 'undefined' && typeof console.log === 'function') {
			log('+++ (301) HtmlSpeechSynthesisDisplayer.update called +++');
			log('+++ (302) currentAddress: ', currentAddress);
		}

		// Delegate to AddressSpeechObserver component
		// This maintains the same observer pattern interface while using composition
		this._addressObserver.update(currentAddress, event, posEvent, changeDetails, undefined);
	}

	/**
	 * String representation of the displayer.
	 * 
	 * **Backward Compatible API**: Returns the same format as the original implementation,
	 * showing the class name and currently selected voice.
	 * 
	 * @returns {string} String representation with voice name
	 * 
	 * @example
	 * console.log(displayer.toString());
	 * // Output: "HtmlSpeechSynthesisDisplayer: Google português do Brasil"
	 * 
	 * @example
	 * // When no voice is selected
	 * console.log(displayer.toString());
	 * // Output: "HtmlSpeechSynthesisDisplayer: no voice"
	 */
	toString(): string {
		const voiceName = this.speechManager.voice?.name || 'no voice';
		return `${this.constructor.name}: ${voiceName}`;
	}

	/**
	 * Cleanup method for proper resource disposal.
	 * 
	 * **New in Facade**: This method wasn't in the original implementation but
	 * is added to properly cleanup the composed components and prevent memory leaks.
	 * 
	 * Calling this method:
	 * - Removes all event listeners from HtmlSpeechControls
	 * - Cleans up speech queue processing
	 * - Prevents memory leaks from event handlers
	 * 
	 * **Important**: After calling destroy(), this instance should not be used.
	 * Create a new instance if speech synthesis is needed again.
	 * 
	 * @returns {void}
	 * 
	 * @example
	 * // Cleanup when component is unmounted or no longer needed
	 * displayer.destroy();
	 */
	destroy(): void {
		// Cleanup HtmlSpeechControls event listeners
		if (this._speechControls && typeof this._speechControls.destroy === 'function') {
			this._speechControls.destroy();
		}

		// Note: AddressSpeechObserver and SpeechTextBuilder don't require cleanup
		// as they don't register event listeners or timers

		log('HtmlSpeechSynthesisDisplayer: Facade destroyed and resources cleaned up');
	}
}

export default HtmlSpeechSynthesisDisplayer;
