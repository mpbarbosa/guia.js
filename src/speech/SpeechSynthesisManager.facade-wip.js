'use strict';
import { log, warn, error } from '../utils/logger.js';

/**
 * Speech Synthesis Manager - Facade Pattern
 * 
 * Coordinates speech synthesis components to provide a unified interface for text-to-speech
 * functionality. This facade delegates responsibilities to specialized components while
 * maintaining backward compatibility with the original API.
 * 
 * **Architecture**: Facade Pattern
 * - Coordinates VoiceManager, SpeechConfiguration, SpeechQueueProcessor, and SpeechController
 * - Provides unified public API
 * - Maintains backward compatibility
 * - Simplifies complex subsystem interactions
 * 
 * **Components**:
 * - VoiceManager: Voice loading and selection
 * - SpeechConfiguration: Rate/pitch configuration
 * - SpeechQueueProcessor: Queue management with priority
 * - SpeechController: Core speech synthesis operations
 * 
 * @class SpeechSynthesisManager
 * @since 0.8.4-alpha (refactored to facade pattern)
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * // Basic usage (unchanged API)
 * import SpeechSynthesisManager from './speech/SpeechSynthesisManager.js';
 * 
 * const speechManager = new SpeechSynthesisManager();
 * speechManager.speak("Hello world!", 0);
 * 
 * @example
 * // Advanced configuration
 * const manager = new SpeechSynthesisManager(true); // Enable logging
 * manager.setRate(1.2);
 * manager.setPitch(1.1);
 * manager.speak("Important message", 2);
 */

import SpeechQueue from './SpeechQueue.js';
import { VoiceManager } from './VoiceManager.js';
import { SpeechConfiguration } from './SpeechConfiguration.js';
import { SpeechQueueProcessor } from './SpeechQueueProcessor.js';
import { SpeechController } from './SpeechController.js';

/**
 * Speech Synthesis Manager - Facade for coordinating speech components
 */
export class SpeechSynthesisManager {
    /**
     * Creates a new SpeechSynthesisManager instance.
     * 
     * @param {boolean} enableLogging - Enable console logging for debugging
     * @throws {TypeError} If enableLogging is not a boolean
     * @throws {Error} If Web Speech API is not available
     */
    constructor(enableLogging = false) {
        // Validate parameters
        if (typeof enableLogging !== 'boolean') {
            throw new TypeError(`enableLogging must be a boolean, got: ${typeof enableLogging}`);
        }

        // Validate Web Speech API availability
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            throw new Error('Web Speech API not available in this environment');
        }

        this.enableLogging = enableLogging;
        this.synth = window.speechSynthesis;
        
        // State management
        this.isCurrentlySpeaking = false;
        
        // Initialize components
        this._initializeComponents();
        
        // Load voices
        this.voiceManager.loadVoices();
        
        this._log('(SpeechSynthesisManager) Initialized successfully with facade pattern');
    }

    /**
     * Initialize all speech synthesis components.
     * @private
     */
    _initializeComponents() {
        // Voice management
        this.voiceManager = new VoiceManager(this.synth, this.enableLogging);
        
        // Configuration management
        this.config = new SpeechConfiguration(this.enableLogging);
        
        // Queue management
        this.speechQueue = new SpeechQueue(100, 30000, this.enableLogging);
        this.queueProcessor = new SpeechQueueProcessor(
            () => this._processNextItem(),
            100,  // interval in ms
            this.enableLogging
        );
        
        // Speech synthesis controller
        this.controller = new SpeechController(this.synth, this.enableLogging);
    }

    /**
     * Process the next item in the queue.
     * @private
     */
    _processNextItem() {
        // Check if we can process
        if (this.isCurrentlySpeaking || this.speechQueue.isEmpty()) {
            return;
        }

        // Get next item
        const item = this.speechQueue.dequeue();
        if (!item) {
            return;
        }

        this._log(`(SpeechSynthesisManager) Processing: "${item.text}" (priority: ${item.priority})`);
        
        // Set state
        this.isCurrentlySpeaking = true;

        // Get current configuration
        const config = {
            voice: this.voiceManager.getCurrentVoice(),
            rate: this.config.getRate(),
            pitch: this.config.getPitch()
        };

        // Speak with callbacks
        this.controller.speak(item.text, config, {
            onEnd: () => {
                this._log(`(SpeechSynthesisManager) Speech completed: "${item.text}"`);
                this.isCurrentlySpeaking = false;
                
                // Continue processing queue
                if (!this.speechQueue.isEmpty()) {
                    setTimeout(() => this._processNextItem(), 10);
                }
            },
            onError: (event) => {
                this._warn(`(SpeechSynthesisManager) Speech error: "${item.text}"`, event.error);
                this.isCurrentlySpeaking = false;
                
                // Continue processing queue after error
                if (!this.speechQueue.isEmpty()) {
                    setTimeout(() => this._processNextItem(), 10);
                }
            }
        });
    }

    /**
     * Log messages if logging is enabled.
     * @private
     */
    _log(message, ...params) {
        if (this.enableLogging && typeof console !== 'undefined' && console.log) {
            log(message, ...params);
        }
    }

    /**
     * Log warnings if logging is enabled.
     * @private
     */
    _warn(message, ...params) {
        if (this.enableLogging && typeof console !== 'undefined' && console.warn) {
            warn(message, ...params);
        }
    }

    // ==================== Public API ====================

    /**
     * Get logging state.
     * @returns {boolean}
     */
    get isLoggingEnabled() {
        return this.enableLogging;
    }

    /**
     * Get current rate.
     * @returns {number}
     */
    get rate() {
        return this.config.getRate();
    }

    /**
     * Set rate directly (for backward compatibility).
     * @param {number} value
     */
    set rate(value) {
        this.config.setRate(value);
    }

    /**
     * Get current pitch.
     * @returns {number}
     */
    get pitch() {
        return this.config.getPitch();
    }

    /**
     * Set pitch directly (for backward compatibility).
     * @param {number} value
     */
    set pitch(value) {
        this.config.setPitch(value);
    }

    /**
     * Get current voice.
     * @returns {SpeechSynthesisVoice|null}
     */
    get voice() {
        return this.voiceManager.getCurrentVoice();
    }

    /**
     * Get available voices array.
     * @returns {Array<SpeechSynthesisVoice>}
     */
    get voices() {
        return this.voiceManager.getAvailableVoices();
    }

    /**
     * Get queue timer (for backward compatibility).
     * @returns {number|null}
     */
    get queueTimer() {
        return this.queueProcessor.timer;
    }

    /**
     * Set queue timer (for backward compatibility).
     * @param {number|null} value
     */
    set queueTimer(value) {
        // Backward compatibility - allow direct assignment
        this.queueProcessor.timer = value;
    }

    /**
     * Get max voice retry attempts (for backward compatibility).
     * @returns {number}
     */
    get maxVoiceRetryAttempts() {
        return this.voiceManager.maxVoiceRetryAttempts;
    }

    /**
     * Set max voice retry attempts (for backward compatibility).
     * @param {number} value
     */
    set maxVoiceRetryAttempts(value) {
        this.voiceManager.maxVoiceRetryAttempts = value;
    }

    /**
     * Get independent queue timer interval (for backward compatibility).
     * @returns {number}
     */
    get independentQueueTimerInterval() {
        return this.queueProcessor.interval;
    }

    /**
     * Set independent queue timer interval (for backward compatibility).
     * @param {number} value
     */
    set independentQueueTimerInterval(value) {
        this.queueProcessor.interval = value;
    }

    /**
     * Load voices (for backward compatibility).
     * Delegates to VoiceManager.
     */
    loadVoices() {
        this.voiceManager.loadVoices();
    }

    /**
     * Process queue (for backward compatibility).
     * Internal method exposed for testing.
     * @private
     */
    processQueue() {
        this._processNextItem();
    }

    /**
     * Start voice retry timer (for backward compatibility).
     */
    startVoiceRetryTimer() {
        this.voiceManager.startVoiceRetryTimer();
    }

    /**
     * Stop voice retry timer (for backward compatibility).
     */
    stopVoiceRetryTimer() {
        this.voiceManager.stopVoiceRetryTimer();
    }

    /**
     * Enable logging.
     */
    enableLogs() {
        this.enableLogging = true;
        this.voiceManager.enableLogs();
        this.config.enableLogs();
        this.queueProcessor.enableLogs();
        this.controller.enableLogs();
    }

    /**
     * Disable logging.
     */
    disableLogs() {
        this.enableLogging = false;
        this.voiceManager.disableLogs();
        this.config.disableLogs();
        this.queueProcessor.disableLogs();
        this.controller.disableLogs();
    }

    /**
     * Toggle logging state.
     */
    toggleLogs() {
        if (this.enableLogging) {
            this.disableLogs();
        } else {
            this.enableLogs();
        }
    }

    /**
     * Set voice for speech synthesis.
     * @param {SpeechSynthesisVoice|null} voice - Voice to use
     * @returns {boolean} True if voice was set successfully
     */
    setVoice(voice) {
        return this.voiceManager.setVoice(voice);
    }

    /**
     * Set speech rate.
     * @param {number} rate - Speech rate (0.1-10.0)
     * @returns {number} Clamped rate value
     */
    setRate(rate) {
        return this.config.setRate(rate);
    }

    /**
     * Set speech pitch.
     * @param {number} pitch - Speech pitch (0.0-2.0)
     * @returns {number} Clamped pitch value
     */
    setPitch(pitch) {
        return this.config.setPitch(pitch);
    }

    /**
     * Get available voices.
     * @returns {Array<SpeechSynthesisVoice>}
     */
    getAvailableVoices() {
        return this.voiceManager.getAvailableVoices();
    }

    /**
     * Get current voice.
     * @returns {SpeechSynthesisVoice|null}
     */
    getCurrentVoice() {
        return this.voiceManager.getCurrentVoice();
    }

    /**
     * Speak text with optional priority.
     * @param {string} text - Text to speak
     * @param {number} priority - Priority level (default: 0)
     */
    speak(text, priority = 0) {
        this._log(`(SpeechSynthesisManager) Speak request: "${text}" (priority: ${priority})`);
        
        // Validate inputs
        if (typeof text !== 'string') {
            throw new TypeError('Text must be a string');
        }
        
        if (!text || text.trim() === '') {
            throw new Error('Text cannot be empty or only whitespace');
        }

        if (typeof priority !== 'number' || isNaN(priority)) {
            throw new TypeError('Priority must be a number');
        }

        // Add to queue
        this.speechQueue.enqueue(text.trim(), priority);
        this._log(`(SpeechSynthesisManager) Text added to queue (size: ${this.speechQueue.size()})`);

        // Start processing if not already speaking
        if (!this.isCurrentlySpeaking) {
            this._log('(SpeechSynthesisManager) Starting queue processing');
            this._processNextItem();
        } else {
            this._log('(SpeechSynthesisManager) Currently speaking, text queued');
        }
    }

    /**
     * Start independent queue timer for reliable processing.
     */
    startQueueTimer() {
        this.queueProcessor.start();
        this._log('(SpeechSynthesisManager) Queue timer started');
    }

    /**
     * Stop queue timer.
     */
    stopQueueTimer() {
        this.queueProcessor.stop();
        this._log('(SpeechSynthesisManager) Queue timer stopped');
    }

    /**
     * Pause current speech.
     */
    pause() {
        if (this.controller.pause()) {
            this._log('(SpeechSynthesisManager) Speech paused');
        } else {
            this._log('(SpeechSynthesisManager) No active speech to pause');
        }
    }

    /**
     * Resume paused speech.
     */
    resume() {
        if (this.controller.resume()) {
            this._log('(SpeechSynthesisManager) Speech resumed');
        } else {
            this._log('(SpeechSynthesisManager) No paused speech to resume');
        }
    }

    /**
     * Stop current speech and clear queue.
     */
    stop() {
        // Stop controller
        this.controller.stop();
        
        // Clear queue
        const queueSize = this.speechQueue.size();
        this.speechQueue.clear();
        
        // Reset state
        this.isCurrentlySpeaking = false;
        
        // Stop timers
        this.stopQueueTimer();
        this.voiceManager.stopVoiceRetryTimer();
        
        this._log(`(SpeechSynthesisManager) Stopped and cleared (${queueSize} items removed)`);
    }

    /**
     * Get queue size.
     * @returns {number}
     */
    getQueueSize() {
        return this.speechQueue.size();
    }

    /**
     * Check if currently speaking.
     * @returns {boolean}
     */
    isSpeaking() {
        return this.isCurrentlySpeaking;
    }

    /**
     * Get status information.
     * @returns {Object}
     */
    getStatus() {
        return {
            isSpeaking: this.isCurrentlySpeaking,
            isPaused: this.controller.isPaused(),
            queueSize: this.speechQueue.size(),
            voice: this.voiceManager.getCurrentVoice()?.name || 'none',
            rate: this.config.getRate(),
            pitch: this.config.getPitch(),
            voicesAvailable: this.voiceManager.getAvailableVoices().length
        };
    }

    /**
     * Get string representation.
     * @returns {string}
     */
    toString() {
        const voice = this.voiceManager.getCurrentVoice();
        return `${this.constructor.name}: voice=${voice?.name || 'none'}, rate=${this.config.getRate()}, pitch=${this.config.getPitch()}, isSpeaking=${this.isCurrentlySpeaking}, queueSize=${this.speechQueue.size()}`;
    }

    /**
     * Clean up resources.
     */
    destroy() {
        this._log('(SpeechSynthesisManager) Destroying...');
        
        // Stop all operations
        this.stop();
        
        // Destroy components
        if (this.controller) {
            this.controller.destroy();
        }
        
        if (this.voiceManager) {
            this.voiceManager.destroy();
        }
        
        if (this.queueProcessor) {
            this.queueProcessor.destroy();
        }
        
        // Clear references
        this.synth = null;
        this.voiceManager = null;
        this.config = null;
        this.speechQueue = null;
        this.queueProcessor = null;
        this.controller = null;
        
        this._log('(SpeechSynthesisManager) Destroyed successfully');
    }
}

export default SpeechSynthesisManager;
