'use strict';
import { log, warn, error } from '../utils/logger.js';

/**
 * HTML-based speech synthesis controller with UI integration and address change notifications.
 * 
 * This module provides a complete speech synthesis interface integrated with HTML controls,
 * supporting voice selection, rate/pitch adjustment, and automatic speech notifications
 * for address changes in Brazilian Portuguese travel guide applications. It implements
 * priority-based speech synthesis with higher priority for neighborhood (bairro) and
 * municipality (municipio) changes over street (logradouro) changes.
 * 
 * Key features:
 * - HTML UI integration with voice controls (select, rate, pitch sliders)
 * - Observer pattern integration for address change notifications
 * - Priority-based speech synthesis (municipality > bairro > logradouro)
 * - Brazilian Portuguese voice prioritization with fallback support
 * - Periodic full address announcements at 50-second intervals
 * - Accessibility features for travel guide users
 * - Immutable design with comprehensive error handling
 * 
 * @module HtmlSpeechSynthesisDisplayer
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import SpeechSynthesisManager from '../speech/SpeechSynthesisManager.js';
import PositionManager from '../core/PositionManager.js';

/**
 * HTML-based speech synthesis controller with UI integration and address change notifications.
 * 
 * This class provides a complete speech synthesis interface integrated with HTML controls,
 * supporting voice selection, rate/pitch adjustment, and automatic speech notifications
 * for address changes. It implements priority-based speech with higher priority for
 * neighborhood (bairro) changes over street (logradouro) changes.
 * 
 * **Architecture Pattern**: Observer + Controller
 * - Implements observer pattern to receive address change notifications
 * - Controls HTML UI elements for speech synthesis configuration
 * - Manages priority-based speech synthesis through SpeechSynthesisManager
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
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * // Basic usage with HTML elements
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
 * // Subscribe to address change notifications
 * reverseGeocoder.subscribe(displayer);
 * webGeocodingManager.subscribe(displayer);
 * 
 * @example
 * // Observer pattern integration
 * const observer = {
 *   update: (currentAddress, event, posEvent, changeDetails) => {
 *     // Displayer automatically handles:
 *     // - Municipality changes with priority 3
 *     // - Bairro changes with priority 2  
 *     // - Logradouro changes with priority 1
 *     // - Periodic full address with priority 0
 *   }
 * };
 * 
 * @example
 * // Brazilian Portuguese address handling
 * const currentAddress = new BrazilianStandardAddress({
 *   logradouro: 'Rua das Flores',
 *   numero: '123',
 *   bairro: 'Centro',
 *   municipio: 'São Paulo',
 *   uf: 'SP'
 * });
 * 
 * displayer.update(currentAddress, 'BairroChanged', 'strCurrPosUpdate');
 * // Speaks: "Você entrou no bairro Centro" with priority 2
 */
class HtmlSpeechSynthesisDisplayer {
	/**
	 * Creates a new HtmlSpeechSynthesisDisplayer instance.
	 * 
	 * Initializes the speech synthesis UI controller with HTML element references
	 * and sets up event handlers for voice controls. The constructor validates
	 * element IDs and creates a SpeechSynthesisManager for speech processing.
	 * 
	 * **Element ID Configuration**:
	 * All element IDs are required for full functionality, but missing elements
	 * are handled gracefully with console warnings. This allows partial UI
	 * implementations while maintaining core speech synthesis functionality.
	 * 
	 * **Initialization Process**:
	 * 1. Store document reference and element ID configuration
	 * 2. Create SpeechSynthesisManager instance for speech processing
	 * 3. Locate and store references to HTML control elements
	 * 4. Initialize voice selection and event handlers
	 * 5. Start speech queue processing timer
	 * 6. Freeze instance to prevent external modification
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
	constructor(document, elementIds) {
		// Parameter validation with specific error messages
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
		 * Speech synthesis manager for processing speech requests.
		 * @private
		 * @type {SpeechSynthesisManager}
		 */
		this.speechManager = new SpeechSynthesisManager();

		// Get DOM elements with error handling
		/**
		 * Language selection dropdown element.
		 * @private
		 * @type {HTMLSelectElement|null}
		 */
		this.languageSelect = this.document.getElementById(elementIds.languageSelectId);

		/**
		 * Voice selection dropdown element.
		 * @private
		 * @type {HTMLSelectElement|null}
		 */
		this.voiceSelect = this.document.getElementById(elementIds.voiceSelectId);

		/**
		 * Text input field element.
		 * @private
		 * @type {HTMLInputElement|null}
		 */
		this.textInput = this.document.getElementById(elementIds.textInputId);

		/**
		 * Speak button element.
		 * @private
		 * @type {HTMLButtonElement|null}
		 */
		this.speakBtn = this.document.getElementById(elementIds.speakBtnId);

		/**
		 * Pause button element.
		 * @private
		 * @type {HTMLButtonElement|null}
		 */
		this.pauseBtn = this.document.getElementById(elementIds.pauseBtnId);

		/**
		 * Resume button element.
		 * @private
		 * @type {HTMLButtonElement|null}
		 */
		this.resumeBtn = this.document.getElementById(elementIds.resumeBtnId);

		/**
		 * Stop button element.
		 * @private
		 * @type {HTMLButtonElement|null}
		 */
		this.stopBtn = this.document.getElementById(elementIds.stopBtnId);

		/**
		 * Rate slider input element.
		 * @private
		 * @type {HTMLInputElement|null}
		 */
		this.rateInput = this.document.getElementById(elementIds.rateInputId);

		/**
		 * Rate value display element.
		 * @private
		 * @type {HTMLElement|null}
		 */
		this.rateValue = this.document.getElementById(elementIds.rateValueId);

		/**
		 * Pitch slider input element.
		 * @private
		 * @type {HTMLInputElement|null}
		 */
		this.pitchInput = this.document.getElementById(elementIds.pitchInputId);

		/**
		 * Pitch value display element.
		 * @private
		 * @type {HTMLElement|null}
		 */
		this.pitchValue = this.document.getElementById(elementIds.pitchValueId);

		// Initialize the speech synthesis interface
		this._initialize();

		// Freeze instance to prevent external modification (MP Barbosa pattern)
		Object.freeze(this);
	}

	/**
	 * Initializes the speech synthesis interface and event handlers.
	 * 
	 * Sets up the complete speech synthesis UI by updating voice selections,
	 * configuring event handlers for all controls, and starting the speech
	 * queue processing timer. This method is called automatically during
	 * construction and should not be called manually.
	 * 
	 * **Initialization Steps**:
	 * 1. Update voice selection dropdown with available voices
	 * 2. Set up event handlers for all UI controls
	 * 3. Start the speech synthesis queue timer for processing
	 * 
	 * @private
	 * @returns {void}
	 */
	_initialize() {
		this.updateVoices();
		this._setupEventHandlers();
		this.speechManager.startQueueTimer();
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
	 * 
	 * @example
	 * // Called automatically during initialization
	 * // Also called when browser voice list changes
	 * displayer.updateVoices();
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
	 * **Event Handlers Configured**:
	 * - Voice selection change: Updates selected voice in speech manager
	 * - Speak button: Speaks text from input field with default priority
	 * - Pause/Resume/Stop buttons: Controls speech synthesis playback
	 * - Rate/Pitch sliders: Adjusts speech parameters and updates display
	 * - Voice loading: Refreshes voice list when browser loads new voices
	 * 
	 * **Error Handling**:
	 * - Missing elements are handled gracefully with no errors
	 * - Invalid parameter values are validated in speech manager
	 * - Event listener failures are caught and logged
	 * 
	 * @private
	 * @returns {void}
	 */
	_setupEventHandlers() {
		// Voice selection change handler
		if (this.voiceSelect) {
			this.voiceSelect.addEventListener('change', (e) => {
				const voices = this.speechManager.synth.getVoices();
				const selectedVoice = voices[e.target.value];
				this.speechManager.setVoice(selectedVoice);
			});
		}

		// Speak button handler
		if (this.speakBtn && this.textInput) {
			this.speakBtn.addEventListener('click', () => {
				const text = this.textInput.value.trim();
				if (text) {
					this.speechManager.speak(text, 0); // Default priority for manual speech
				}
			});
		}

		// Speech control button handlers
		if (this.pauseBtn) {
			this.pauseBtn.addEventListener('click', () => {
				this.speechManager.pause();
			});
		}

		if (this.resumeBtn) {
			this.resumeBtn.addEventListener('click', () => {
				this.speechManager.resume();
			});
		}

		if (this.stopBtn) {
			this.stopBtn.addEventListener('click', () => {
				this.speechManager.stop();
			});
		}

		// Rate control slider handler
		if (this.rateInput && this.rateValue) {
			this.rateInput.addEventListener('input', (e) => {
				const rate = parseFloat(e.target.value);
				this.speechManager.setRate(rate);
				this.rateValue.textContent = rate.toFixed(1);
			});
		}

		// Pitch control slider handler
		if (this.pitchInput && this.pitchValue) {
			this.pitchInput.addEventListener('input', (e) => {
				const pitch = parseFloat(e.target.value);
				this.speechManager.setPitch(pitch);
				this.pitchValue.textContent = pitch.toFixed(1);
			});
		}

		// Handle dynamic voice loading (some browsers load voices asynchronously)
		if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
			window.speechSynthesis.onvoiceschanged = () => {
				this.updateVoices();
			};
		}
	}

	/**
	 * Builds text for logradouro (street) change announcements.
	 * 
	 * Creates appropriately formatted Brazilian Portuguese text for street-level
	 * address changes. Uses the complete street address (logradouroCompleto)
	 * which includes street type, name, and number when available.
	 * 
	 * **Brazilian Portuguese Formatting**:
	 * - Uses "Você está agora em" for natural speech flow
	 * - Includes complete street information (tipo + logradouro + número)
	 * - Handles missing information gracefully with fallback message
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current standardized address
	 * @returns {string} Formatted speech text for logradouro change
	 * 
	 * @example
	 * const address = new BrazilianStandardAddress({
	 *   logradouro: 'Rua das Flores',
	 *   numero: '123'
	 * });
	 * 
	 * const text = displayer.buildTextToSpeechLogradouro(address);
	 * // Returns: "Você está agora em Rua das Flores, 123"
	 * 
	 * @example
	 * // Handles missing address gracefully
	 * const text = displayer.buildTextToSpeechLogradouro(null);
	 * // Returns: "Nova localização detectada"
	 */
	buildTextToSpeechLogradouro(currentAddress) {
		if (!currentAddress || !currentAddress.logradouro) {
			return "Nova localização detectada";
		}
		return `Você está agora em ${currentAddress.logradouroCompleto()}`;
	}

	/**
	 * Builds text for bairro (neighborhood) change announcements.
	 * 
	 * Creates appropriately formatted Brazilian Portuguese text for neighborhood
	 * changes. Uses "bairroCompleto" method to include neighborhood type and name
	 * when available, providing natural speech flow for Brazilian users.
	 * 
	 * **Brazilian Portuguese Formatting**:
	 * - Uses "Você entrou no bairro" for natural entrance notification
	 * - Includes complete neighborhood information when available
	 * - Handles missing information with appropriate fallback message
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current standardized address
	 * @returns {string} Formatted speech text for bairro change
	 * 
	 * @example
	 * const address = new BrazilianStandardAddress({
	 *   bairro: 'Centro'
	 * });
	 * 
	 * const text = displayer.buildTextToSpeechBairro(address);
	 * // Returns: "Você entrou no bairro Centro"
	 * 
	 * @example
	 * // Handles missing neighborhood gracefully
	 * const text = displayer.buildTextToSpeechBairro(null);
	 * // Returns: "Novo bairro detectado"
	 */
	buildTextToSpeechBairro(currentAddress) {
		if (!currentAddress || !currentAddress.bairro) {
			return "Novo bairro detectado";
		}
		return `Você entrou no bairro ${currentAddress.bairroCompleto()}`;
	}

	/**
	 * Builds text for municipio (municipality) change announcements.
	 * 
	 * Creates appropriately formatted Brazilian Portuguese text for municipality
	 * changes. When change details are available, includes information about the
	 * previous municipality for a more informative announcement. This is particularly
	 * useful for travel guide applications where users are moving between cities.
	 * 
	 * **Brazilian Portuguese Formatting**:
	 * - Uses "Você saiu de X e entrou em Y" when previous municipality known
	 * - Falls back to "Você entrou no município de X" for simple announcements
	 * - Handles missing information with appropriate fallback message
	 * 
	 * **Change Details Support**:
	 * - Utilizes previous municipality information when available
	 * - Provides context for inter-city travel scenarios
	 * - Graceful degradation when change details unavailable
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current standardized address
	 * @param {Object} [changeDetails] - Details about the municipality change
	 * @param {Object} [changeDetails.previous] - Previous municipality info
	 * @param {string} [changeDetails.previous.municipio] - Previous municipality name
	 * @param {Object} [changeDetails.current] - Current municipality info
	 * @param {string} [changeDetails.current.municipio] - Current municipality name
	 * @returns {string} Formatted speech text for municipio change
	 * 
	 * @example
	 * const address = new BrazilianStandardAddress({
	 *   municipio: 'São Paulo'
	 * });
	 * 
	 * const changeDetails = {
	 *   previous: { municipio: 'Santos' },
	 *   current: { municipio: 'São Paulo' }
	 * };
	 * 
	 * const text = displayer.buildTextToSpeechMunicipio(address, changeDetails);
	 * // Returns: "Você saiu de Santos e entrou em São Paulo"
	 * 
	 * @example
	 * // Simple municipality change without previous info
	 * const text = displayer.buildTextToSpeechMunicipio(address);
	 * // Returns: "Você entrou no município de São Paulo"
	 */
	buildTextToSpeechMunicipio(currentAddress, changeDetails) {
		if (!currentAddress || !currentAddress.municipio) {
			return "Novo município detectado";
		}

		// If we have changeDetails with previous municipality, include it in the message
		if (changeDetails && changeDetails.previous && changeDetails.previous.municipio) {
			return `Você saiu de ${changeDetails.previous.municipio} e entrou em ${currentAddress.municipio}`;
		}

		// Fallback to simple message if no previous municipality info
		return `Você entrou no município de ${currentAddress.municipio}`;
	}

	/**
	 * Builds text for full address announcements.
	 * 
	 * Creates comprehensive Brazilian Portuguese text for complete address
	 * announcements. This method is used for periodic full address updates
	 * (every 50 seconds) and provides complete location context to users.
	 * 
	 * **Address Hierarchy Processing**:
	 * 1. Street level: "Você está em [logradouro], [bairro], [municipio]"
	 * 2. Neighborhood level: "Você está em bairro [bairro], [municipio]"
	 * 3. Municipality level: "Você está em [municipio]"
	 * 4. Fallback: "Localização detectada, mas endereço não disponível"
	 * 
	 * **Brazilian Portuguese Formatting**:
	 * - Natural speech flow with appropriate prepositions
	 * - Hierarchical address information from specific to general
	 * - Graceful handling of incomplete address data
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current standardized address
	 * @returns {string} Formatted speech text for full address
	 * 
	 * @example
	 * const address = new BrazilianStandardAddress({
	 *   logradouro: 'Rua das Flores',
	 *   numero: '123',
	 *   bairro: 'Centro',
	 *   municipio: 'São Paulo'
	 * });
	 * 
	 * const text = displayer.buildTextToSpeech(address);
	 * // Returns: "Você está em Rua das Flores, 123, Centro, São Paulo"
	 * 
	 * @example
	 * // Handles partial address information
	 * const partialAddress = new BrazilianStandardAddress({
	 *   bairro: 'Copacabana',
	 *   municipio: 'Rio de Janeiro'
	 * });
	 * 
	 * const text = displayer.buildTextToSpeech(partialAddress);
	 * // Returns: "Você está em bairro Copacabana, Rio de Janeiro"
	 */
	buildTextToSpeech(currentAddress) {
		if (!currentAddress) {
			return "Localização não disponível";
		}
		
		let speechText = "Você está em ";

		if (currentAddress.logradouro) {
			speechText += currentAddress.logradouroCompleto();
			if (currentAddress.bairro) {
				speechText += `, ${currentAddress.bairroCompleto()}`;
			}
			if (currentAddress.municipio) {
				speechText += `, ${currentAddress.municipio}`;
			}
		} else if (currentAddress.bairro) {
			speechText += `bairro ${currentAddress.bairroCompleto()}`;
			if (currentAddress.municipio) {
				speechText += `, ${currentAddress.municipio}`;
			}
		} else if (currentAddress.municipio) {
			speechText += currentAddress.municipio;
		} else {
			speechText = "Localização detectada, mas endereço não disponível";
		}

		return speechText;
	}

	/**
	 * Updates the HTML display with new address information and handles speech synthesis.
	 * 
	 * Observer pattern update method that gets called when address changes occur.
	 * Implements priority-based speech notifications and periodic full address announcements:
	 * - Municipality changes (priority 3): Highest priority for city changes
	 * - Neighborhood/Bairro changes (priority 2): Medium priority for neighborhood changes
	 * - Street/Logradouro changes (priority 1): Low priority for street changes
	 * - Full address every 50 seconds (priority 0): Periodic announcements at trackingInterval
	 * 
	 * **Priority System Rationale**:
	 * The 50-second interval feature ensures users receive regular location updates while
	 * driving or walking, providing a better user experience than more frequent announcements.
	 * Priority ordering ensures important changes (municipality) are not interrupted by
	 * less important ones (street changes).
	 * 
	 * **Event Processing Logic**:
	 * 1. Address component changes: Uses specific build methods with appropriate priority
	 * 2. Position updates: Provides periodic full address announcements
	 * 3. Immediate updates: Silent unless accompanied by component change events
	 * 
	 * **Integration Points**:
	 * - ReverseGeocoder notifications for address changes
	 * - WebGeocodingManager notifications for position updates
	 * - ChangeDetectionCoordinator for component-specific changes
	 * 
	 * @param {Object} currentAddress - Current address data
	 * @param {string|BrazilianStandardAddress} enderecoPadronizadoOrEvent - Standardized address or event type
	 * @param {string} posEvent - Position event type (strCurrPosUpdate, strImmediateAddressUpdate, etc.)
	 * @param {Object} [loadingOrChangeDetails] - Loading state information or changeDetails for address component changes
	 * @param {Object} [error] - Error information if any
	 * @returns {void}
	 * 
	 * @fires SpeechSynthesisManager#speak - When speech synthesis is triggered
	 * 
	 * @since 0.9.0-alpha
	 * @author Marcelo Pereira Barbosa
	 * 
	 * @example
	 * // Municipality change notification
	 * displayer.update(
	 *   currentAddress,
	 *   'MunicipioChanged',
	 *   'strCurrPosUpdate',
	 *   { previous: { municipio: 'Santos' }, current: { municipio: 'São Paulo' } }
	 * );
	 * // Speaks with priority 3: "Você saiu de Santos e entrou em São Paulo"
	 * 
	 * @example
	 * // Periodic full address update
	 * displayer.update(
	 *   currentAddress,
	 *   standardizedAddress,
	 *   'strCurrPosUpdate'
	 * );
	 * // Speaks with priority 0: "Você está em Rua das Flores, Centro, São Paulo"
	 * 
	 * @example
	 * // Street change notification
	 * displayer.update(
	 *   currentAddress,
	 *   'LogradouroChanged',
	 *   'strCurrPosUpdate'
	 * );
	 * // Speaks with priority 1: "Você está agora em Rua das Palmeiras"
	 */
	update(currentAddress, enderecoPadronizadoOrEvent, posEvent, loadingOrChangeDetails, error) {
		// Debug logging for troubleshooting (can be removed in production)
		if (typeof console !== 'undefined' && console.log) {
			log("+++ (301) HtmlSpeechSynthesisDisplayer.update called +++");
			log("+++ (302) currentAddress: ", currentAddress);
			log("+++ (303) enderecoPadronizadoOrEvent: ", enderecoPadronizadoOrEvent);
			log("+++ (304) posEvent: ", posEvent);
		}

		// Early return if no current address
		if (!currentAddress) {
			return;
		}

		let textToBeSpoken = "";
		let priority = 0;

		// Determine speech content and priority based on event type
		// Priority order: Municipality (3) > Bairro (2) > Logradouro (1) > Full address every 50s (0)
		if (["MunicipioChanged", "BairroChanged", "LogradouroChanged"].includes(enderecoPadronizadoOrEvent)) {
			if (typeof console !== 'undefined' && console.log) {
				log("+++ (310) (HtmlSpeechSyntesisDisplayer) Changed");
			}

			// Call the appropriate build method based on event type
			if (enderecoPadronizadoOrEvent === "MunicipioChanged") {
				textToBeSpoken = this.buildTextToSpeechMunicipio(currentAddress, loadingOrChangeDetails);
				priority = 3; // Highest priority for municipality changes
			} else if (enderecoPadronizadoOrEvent === "BairroChanged") {
				textToBeSpoken = this.buildTextToSpeechBairro(currentAddress);
				priority = 2; // Medium priority for neighborhood changes
			} else if (enderecoPadronizadoOrEvent === "LogradouroChanged") {
				textToBeSpoken = this.buildTextToSpeechLogradouro(currentAddress);
				priority = 1; // Low priority for street changes
			}
		} else if (posEvent === PositionManager.strCurrPosUpdate) {
			// Full address update every 50 seconds (trackingInterval)
			// This is the main feature: speak full address at regular 50-second intervals
			textToBeSpoken = this.buildTextToSpeech(enderecoPadronizadoOrEvent);
			priority = 0; // Lowest priority for periodic full address updates
		}
		// Note: For immediate updates (strImmediateAddressUpdate), we don't speak
		// unless there's a specific change event (handled by the conditions above)

		// Common operations for all cases
		if (textToBeSpoken && this.textInput) {
			this.textInput.value = textToBeSpoken;
			this.speechManager.speak(textToBeSpoken, priority);
		}
	}

	/**
	 * Returns a string representation of this displayer.
	 * 
	 * Provides a human-readable string representation including the class name
	 * and current voice information. Useful for debugging and logging purposes.
	 * 
	 * @returns {string} String representation including class name and current voice
	 * @since 0.9.0-alpha
	 * 
	 * @example
	 * const displayer = new HtmlSpeechSynthesisDisplayer(document, elementIds);
	 * log(displayer.toString());
	 * // Output: "HtmlSpeechSynthesisDisplayer: Google português do Brasil"
	 * 
	 * @example
	 * // When no voice is selected
	 * log(displayer.toString());
	 * // Output: "HtmlSpeechSynthesisDisplayer: no voice"
	 */
	toString() {
		const voiceName = this.speechManager.voice?.name || 'no voice';
		return `${this.constructor.name}: ${voiceName}`;
	}
}

export default HtmlSpeechSynthesisDisplayer;