'use strict';
import { log, warn, error } from '../utils/logger.js';

/**
 * SpeechController handles the core speech synthesis operations using the Web Speech API.
 * 
 * This class is responsible for creating SpeechSynthesisUtterance objects, configuring them
 * with appropriate voice/rate/pitch settings, attaching event handlers, and executing speech
 * synthesis through the browser's speechSynthesis interface.
 * 
 * **Responsibilities**:
 * - Create and configure SpeechSynthesisUtterance instances
 * - Set up event handlers for speech lifecycle (start, end, error, boundary)
 * - Execute speech synthesis via Web Speech API
 * - Provide error handling and recovery mechanisms
 * - Manage speech operation state (speaking, pausing, resuming, stopping)
 * 
 * **Design Pattern**: Controller
 * - Coordinates between speech configuration and Web Speech API
 * - Provides clean abstraction over browser speech synthesis
 * - Handles error scenarios gracefully
 * 
 * @class SpeechController
 * @since 0.8.4-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * // Basic usage
 * import { SpeechController } from './speech/SpeechController.js';
 * 
 * const controller = new SpeechController(window.speechSynthesis);
 * const config = { voice: myVoice, rate: 1.0, pitch: 1.0 };
 * 
 * controller.speak('Hello world', config, {
 *   onEnd: () => log('Speech completed'),
 *   onError: (error) => error('Speech error:', error)
 * });
 * 
 * @example
 * // With all callbacks
 * controller.speak('Important message', config, {
 *   onStart: () => log('Speech started'),
 *   onEnd: () => log('Speech ended'),
 *   onError: (error) => error('Error:', error),
 *   onBoundary: (event) => log('Word boundary:', event)
 * });
 */
export class SpeechController {
    /**
     * Creates a new SpeechController instance.
     * 
     * @param {SpeechSynthesis} synth - Browser's speechSynthesis interface
     * @param {boolean} enableLogging - Enable console logging for debugging
     * @throws {TypeError} If synth is not provided or invalid
     */
    constructor(synth, enableLogging = false) {
        if (!synth) {
            throw new TypeError('SpeechController requires a valid SpeechSynthesis instance');
        }
        
        this.synth = synth;
        this.enableLogging = enableLogging;
        this.currentUtterance = null;
    }

    /**
     * Safely log messages if logging is enabled.
     * 
     * @param {string} message - Log message
     * @param {...*} params - Additional parameters to log
     * @private
     */
    _log(message, ...params) {
        if (this.enableLogging && typeof console !== 'undefined' && console.log) {
            log(message, ...params);
        }
    }

    /**
     * Safely log warnings if logging is enabled.
     * 
     * @param {string} message - Warning message
     * @param {...*} params - Additional parameters to log
     * @private
     */
    _warn(message, ...params) {
        if (this.enableLogging && typeof console !== 'undefined' && console.warn) {
            warn(message, ...params);
        }
    }

    /**
     * Create and configure a SpeechSynthesisUtterance with the provided text and configuration.
     * 
     * @param {string} text - Text to synthesize
     * @param {Object} config - Speech configuration
     * @param {SpeechSynthesisVoice|null} config.voice - Voice to use (or null for default)
     * @param {number} config.rate - Speech rate (0.1-10.0)
     * @param {number} config.pitch - Speech pitch (0.0-2.0)
     * @returns {SpeechSynthesisUtterance} Configured utterance
     * @private
     */
    _createUtterance(text, config) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        if (config.voice) {
            utterance.voice = config.voice;
        }
        
        utterance.rate = config.rate;
        utterance.pitch = config.pitch;
        
        return utterance;
    }

    /**
     * Attach event handlers to the utterance.
     * 
     * @param {SpeechSynthesisUtterance} utterance - Utterance to attach handlers to
     * @param {string} text - Original text (for logging)
     * @param {Object} callbacks - Event callbacks
     * @param {Function} [callbacks.onStart] - Called when speech starts
     * @param {Function} [callbacks.onEnd] - Called when speech completes
     * @param {Function} [callbacks.onError] - Called on speech error
     * @param {Function} [callbacks.onBoundary] - Called at word boundaries
     * @private
     */
    _attachEventHandlers(utterance, text, callbacks = {}) {
        // onstart event handler
        if (callbacks.onStart) {
            utterance.onstart = () => {
                this._log(`(SpeechController) Speech started: "${text}"`);
                callbacks.onStart();
            };
        }

        // onend event handler
        if (callbacks.onEnd) {
            utterance.onend = () => {
                this._log(`(SpeechController) Speech completed: "${text}"`);
                this.currentUtterance = null;
                callbacks.onEnd();
            };
        } else {
            // Default handler to clear current utterance
            utterance.onend = () => {
                this._log(`(SpeechController) Speech completed: "${text}"`);
                this.currentUtterance = null;
            };
        }

        // onerror event handler
        if (callbacks.onError) {
            utterance.onerror = (event) => {
                this._warn(`(SpeechController) Speech error for "${text}":`, event.error);
                this.currentUtterance = null;
                callbacks.onError(event);
            };
        } else {
            // Default error handler
            utterance.onerror = (event) => {
                this._warn(`(SpeechController) Speech error for "${text}":`, event.error);
                this.currentUtterance = null;
            };
        }

        // onboundary event handler (optional, for word tracking)
        if (callbacks.onBoundary) {
            utterance.onboundary = (event) => {
                this._log(`(SpeechController) Word boundary at position ${event.charIndex}`);
                callbacks.onBoundary(event);
            };
        }
    }

    /**
     * Speak the provided text with the given configuration and callbacks.
     * 
     * This method creates a configured SpeechSynthesisUtterance, attaches event handlers,
     * and executes the speech synthesis. It provides comprehensive error handling and
     * ensures proper cleanup on completion or error.
     * 
     * @param {string} text - Text to synthesize
     * @param {Object} config - Speech configuration
     * @param {SpeechSynthesisVoice|null} config.voice - Voice to use
     * @param {number} config.rate - Speech rate (0.1-10.0)
     * @param {number} config.pitch - Speech pitch (0.0-2.0)
     * @param {Object} callbacks - Event callbacks
     * @param {Function} [callbacks.onStart] - Called when speech starts
     * @param {Function} [callbacks.onEnd] - Called when speech completes
     * @param {Function} [callbacks.onError] - Called on speech error
     * @param {Function} [callbacks.onBoundary] - Called at word boundaries
     * @returns {boolean} True if speech was initiated successfully, false otherwise
     * @throws {TypeError} If text is not a string or config is invalid
     * 
     * @example
     * const config = { voice: myVoice, rate: 1.0, pitch: 1.0 };
     * controller.speak('Hello', config, {
     *   onEnd: () => log('Done')
     * });
     */
    speak(text, config, callbacks = {}) {
        // Input validation
        if (typeof text !== 'string') {
            throw new TypeError('Text must be a string');
        }

        if (!text || text.trim() === '') {
            this._warn('(SpeechController) Cannot speak empty text');
            return false;
        }

        if (!config || typeof config !== 'object') {
            throw new TypeError('Config must be an object with voice, rate, and pitch');
        }

        // Create and configure utterance
        const utterance = this._createUtterance(text, config);
        this.currentUtterance = utterance;

        // Attach event handlers
        this._attachEventHandlers(utterance, text, callbacks);

        // Execute speech synthesis
        try {
            this.synth.speak(utterance);
            this._log(`(SpeechController) Speech utterance initiated for: "${text}"`);
            return true;
        } catch (error) {
            this._warn('(SpeechController) Failed to start speech utterance:', error);
            this.currentUtterance = null;
            
            // Call error callback if provided
            if (callbacks.onError) {
                callbacks.onError({ error: error.message || 'Unknown error' });
            }
            
            return false;
        }
    }

    /**
     * Pause currently speaking utterance.
     * 
     * @returns {boolean} True if pause was successful, false otherwise
     */
    pause() {
        if (!this.synth.speaking) {
            this._log('(SpeechController) No speech to pause');
            return false;
        }

        if (this.synth.paused) {
            this._log('(SpeechController) Speech already paused');
            return false;
        }

        try {
            this.synth.pause();
            this._log('(SpeechController) Speech paused');
            return true;
        } catch (error) {
            this._warn('(SpeechController) Failed to pause speech:', error);
            return false;
        }
    }

    /**
     * Resume paused speech.
     * 
     * @returns {boolean} True if resume was successful, false otherwise
     */
    resume() {
        if (!this.synth.paused) {
            this._log('(SpeechController) Speech not paused');
            return false;
        }

        try {
            this.synth.resume();
            this._log('(SpeechController) Speech resumed');
            return true;
        } catch (error) {
            this._warn('(SpeechController) Failed to resume speech:', error);
            return false;
        }
    }

    /**
     * Stop current speech and clear pending utterances.
     * 
     * @returns {boolean} True if stop was successful, false otherwise
     */
    stop() {
        if (!this.synth.speaking && !this.synth.pending) {
            this._log('(SpeechController) No speech to stop');
            return false;
        }

        try {
            this.synth.cancel();
            this.currentUtterance = null;
            this._log('(SpeechController) Speech stopped and cleared');
            return true;
        } catch (error) {
            this._warn('(SpeechController) Failed to stop speech:', error);
            return false;
        }
    }

    /**
     * Check if speech is currently active.
     * 
     * @returns {boolean} True if speaking, false otherwise
     */
    isSpeaking() {
        return this.synth.speaking;
    }

    /**
     * Check if speech is paused.
     * 
     * @returns {boolean} True if paused, false otherwise
     */
    isPaused() {
        return this.synth.paused;
    }

    /**
     * Get the current utterance being processed.
     * 
     * @returns {SpeechSynthesisUtterance|null} Current utterance or null
     */
    getCurrentUtterance() {
        return this.currentUtterance;
    }

    /**
     * Enable logging for debugging.
     */
    enableLogs() {
        this.enableLogging = true;
    }

    /**
     * Disable logging.
     */
    disableLogs() {
        this.enableLogging = false;
    }

    /**
     * Clean up resources and stop any active speech.
     */
    destroy() {
        this.stop();
        this.currentUtterance = null;
        this._log('(SpeechController) Destroyed');
    }
}

export default SpeechController;
