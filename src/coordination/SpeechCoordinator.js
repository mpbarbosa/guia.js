'use strict';

/**
 * SpeechCoordinator - Manages speech synthesis functionality
 * 
 * @fileoverview Handles speech synthesis UI initialization and coordination.
 * This class is responsible for creating and configuring the HtmlSpeechSynthesisDisplayer
 * and wiring it to receive updates from the geocoding system.
 * 
 * **Single Responsibility**: Speech synthesis coordination only
 * 
 * **Design Principles**:
 * - Separation of Concerns: Isolates speech synthesis from main coordination logic
 * - Dependency Injection: Receives required dependencies via constructor
 * - Lazy Initialization: Only initializes when initializeSpeechSynthesis() is called
 * - Immutability: Freezes displayer after creation
 * 
 * @module coordination/SpeechCoordinator
 * @since 0.9.0-alpha - Phase 3: WebGeocodingManager optimization
 * @author Marcelo Pereira Barbosa
 * 
 * @requires html/HtmlSpeechSynthesisDisplayer
 * @requires utils/logger
 * 
 * @example
 * // Basic usage
 * const speechCoordinator = new SpeechCoordinator(document, elementIds, reverseGeocoder, observerSubject);
 * speechCoordinator.initializeSpeechSynthesis();
 * 
 * // Later, cleanup
 * speechCoordinator.destroy();
 */

import HtmlSpeechSynthesisDisplayer from '../html/HtmlSpeechSynthesisDisplayer.js';
import { log, warn } from '../utils/logger.js';

/**
 * SpeechCoordinator class - Manages speech synthesis
 * 
 * @class
 */
class SpeechCoordinator {
    /**
     * Creates a new SpeechCoordinator instance
     * 
     * @param {Document} document - DOM document object
     * @param {Object} elementIds - Speech synthesis element IDs configuration
     * @param {Object} elementIds.languageSelectId - Language selection dropdown ID
     * @param {Object} elementIds.voiceSelectId - Voice selection dropdown ID
     * @param {Object} elementIds.textInputId - Text input field ID
     * @param {Object} elementIds.speakBtnId - Speak button ID
     * @param {Object} elementIds.pauseBtnId - Pause button ID
     * @param {Object} elementIds.resumeBtnId - Resume button ID
     * @param {Object} elementIds.stopBtnId - Stop button ID
     * @param {Object} elementIds.rateInputId - Rate slider ID
     * @param {Object} elementIds.rateValueId - Rate value display ID
     * @param {Object} elementIds.pitchInputId - Pitch slider ID
     * @param {Object} elementIds.pitchValueId - Pitch value display ID
     * @param {ReverseGeocoder} reverseGeocoder - Reverse geocoder to subscribe to
     * @param {ObserverSubject} observerSubject - Observer subject to subscribe to
     * 
     * @throws {TypeError} If document is not provided
     * @throws {TypeError} If elementIds is not provided
     * @throws {TypeError} If reverseGeocoder is not provided
     * @throws {TypeError} If observerSubject is not provided
     * 
     * @example
     * const coordinator = new SpeechCoordinator(
     *   document,
     *   elementIds.speechSynthesis,
     *   reverseGeocoder,
     *   observerSubject
     * );
     */
    constructor(document, elementIds, reverseGeocoder, observerSubject) {
        if (!document) {
            throw new TypeError('SpeechCoordinator: document is required');
        }
        if (!elementIds) {
            throw new TypeError('SpeechCoordinator: elementIds is required');
        }
        if (!reverseGeocoder) {
            throw new TypeError('SpeechCoordinator: reverseGeocoder is required');
        }
        if (!observerSubject) {
            throw new TypeError('SpeechCoordinator: observerSubject is required');
        }

        /**
         * DOM document object
         * @type {Document}
         * @private
         */
        this._document = document;

        /**
         * Speech synthesis element IDs
         * @type {Object}
         * @private
         */
        this._elementIds = elementIds;

        /**
         * Reverse geocoder to subscribe to
         * @type {ReverseGeocoder}
         * @private
         */
        this._reverseGeocoder = reverseGeocoder;

        /**
         * Observer subject to subscribe to
         * @type {ObserverSubject}
         * @private
         */
        this._observerSubject = observerSubject;

        /**
         * Speech synthesis displayer instance
         * @type {HtmlSpeechSynthesisDisplayer|null}
         * @private
         */
        this._speechDisplayer = null;

        /**
         * Flag to track if speech synthesis is initialized
         * @type {boolean}
         * @private
         */
        this._initialized = false;
    }

    /**
     * Initialize speech synthesis UI and wire up observers
     * 
     * Creates HtmlSpeechSynthesisDisplayer instance and subscribes it to:
     * - ReverseGeocoder (for address updates)
     * - ObserverSubject (for position updates)
     * 
     * The displayer is frozen after creation to prevent modification.
     * Can be called multiple times safely (idempotent).
     * 
     * @returns {SpeechCoordinator} This instance for chaining
     * 
     * @example
     * coordinator.initializeSpeechSynthesis();
     */
    initializeSpeechSynthesis() {
        if (this._initialized) {
            warn('SpeechCoordinator: Speech synthesis already initialized');
            return this;
        }

        try {
            // Create speech synthesis displayer
            this._speechDisplayer = new HtmlSpeechSynthesisDisplayer(
                this._document,
                this._elementIds
            );

            // Subscribe to geocoder and observer subject for updates
            this._reverseGeocoder.subscribe(this._speechDisplayer);
            this._observerSubject.subscribe(this._speechDisplayer);

            // Freeze to prevent modifications
            Object.freeze(this._speechDisplayer);

            this._initialized = true;
            log('SpeechCoordinator: Speech synthesis initialized successfully');
        } catch (error) {
            warn('SpeechCoordinator: Failed to initialize speech synthesis:', error.message);
        }

        return this;
    }

    /**
     * Gets the speech displayer instance
     * 
     * @returns {HtmlSpeechSynthesisDisplayer|null} Speech displayer or null if not initialized
     * 
     * @example
     * const displayer = coordinator.getSpeechDisplayer();
     * if (displayer) {
     *   displayer.speak('Hello world');
     * }
     */
    getSpeechDisplayer() {
        return this._speechDisplayer;
    }

    /**
     * Gets speech synthesis element IDs (backward compatibility)
     * @returns {Object} Element IDs configuration
     */
    get elementIds() {
        return this._elementIds;
    }

    /**
     * Checks if speech synthesis is initialized
     * 
     * @returns {boolean} True if initialized, false otherwise
     * 
     * @example
     * if (coordinator.isInitialized()) {
     *   log('Speech synthesis ready');
     * }
     */
    isInitialized() {
        return this._initialized;
    }

    /**
     * Destroys the coordinator and cleans up resources
     * 
     * Unsubscribes speech displayer from all observers and releases references.
     * 
     * @returns {void}
     * 
     * @example
     * coordinator.destroy();
     */
    destroy() {
        if (this._speechDisplayer) {
            // Unsubscribe from observers
            if (this._reverseGeocoder) {
                this._reverseGeocoder.unsubscribe(this._speechDisplayer);
            }
            if (this._observerSubject) {
                this._observerSubject.unsubscribe(this._speechDisplayer);
            }
        }

        // Release references
        this._speechDisplayer = null;
        this._initialized = false;
        
        log('SpeechCoordinator: Cleanup complete');
    }

    /**
     * Returns a string representation of this SpeechCoordinator instance
     * 
     * @returns {string} String representation
     * 
     * @example
     * log(coordinator.toString());
     * // Output: "SpeechCoordinator: initialized"
     */
    toString() {
        const status = this._initialized ? 'initialized' : 'not initialized';
        return `${this.constructor.name}: ${status}`;
    }
}

export default SpeechCoordinator;
/**
 * Module exports for speech coordination.
 * @exports SpeechCoordinator - Main speech synthesis coordinator class
 */
export { SpeechCoordinator };
