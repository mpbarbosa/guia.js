'use strict';
import { log, warn, error } from '../utils/logger.js';
import { TimerManager } from '../utils/TimerManager.js';

const timerManager = TimerManager.getInstance();

/**
 * VoiceManager handles voice loading, selection, and retry logic for Web Speech API.
 * 
 * This class is responsible for managing speech synthesis voices with a focus on
 * Brazilian Portuguese language prioritization. It implements robust retry mechanisms
 * for asynchronous voice loading across different browsers and provides a clean
 * interface for voice selection and management.
 * 
 * **Responsibilities**:
 * - Load available voices from Web Speech API
 * - Prioritize Brazilian Portuguese voices (pt-BR)
 * - Implement retry mechanism for async voice loading
 * - Manage voice selection state
 * - Provide voice validation
 * 
 * **Extracted from**: SpeechSynthesisManager (god class refactoring)
 * 
 * @class VoiceManager
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */

/**
 * Configuration constants for voice management.
 * @constant {Object}
 * @private
 */
const VOICE_CONFIG = {
    maxVoiceRetryAttempts: 10,
    voiceRetryInterval: 1000,
    primaryLanguage: 'pt-br',
    fallbackLanguagePrefix: 'pt'
};

Object.freeze(VOICE_CONFIG);

/**
 * VoiceManager class for handling Web Speech API voice management.
 */
export class VoiceManager {
    /**
     * Creates a new VoiceManager instance.
     * 
     * @param {SpeechSynthesis} synth - Web Speech API synthesis interface
     * @param {boolean} [enableLogging=false] - Whether to enable logging
     * @throws {TypeError} If synth is not provided or invalid
     */
    constructor(synth, enableLogging = false) {
        if (!synth || typeof synth.getVoices !== 'function') {
            throw new TypeError('VoiceManager requires a valid SpeechSynthesis object');
        }

        this.synth = synth;
        this.enableLogging = enableLogging;
        this.voices = [];
        this.voice = null;
        this.voiceRetryTimer = null;
        this.voiceRetryAttempts = 0;
        this.maxVoiceRetryAttempts = VOICE_CONFIG.maxVoiceRetryAttempts;
        this.voiceRetryInterval = VOICE_CONFIG.voiceRetryInterval;
    }

    /**
     * Safe logging that checks for console availability.
     * @private
     */
    safeLog(message, ...params) {
        if (this.enableLogging && typeof console !== 'undefined' && console.log) {
            log(message, ...params);
        }
    }

    /**
     * Safe warning logging that checks for console availability.
     * @private
     */
    safeWarn(message, ...params) {
        if (this.enableLogging && typeof console !== 'undefined' && console.warn) {
            warn(message, ...params);
        }
    }

    /**
     * Load voices with Brazilian Portuguese prioritization.
     * 
     * This method loads available voices from the Web Speech API and automatically
     * selects the best available voice based on language priorities:
     * 1. Brazilian Portuguese (pt-BR)
     * 2. Any Portuguese variant (pt-*)
     * 3. First available voice
     * 
     * Implements retry mechanism for browsers with async voice loading.
     * 
     * @returns {void}
     */
    loadVoices() {
        const updateVoices = () => {
            this.voices = this.synth.getVoices();
            
            this.safeLog(`(VoiceManager) Found ${this.voices.length} available voices`);

            // PRIORITY 1: Brazilian Portuguese (pt-BR)
            let portugueseVoice = this.voices.find(voice =>
                voice.lang && voice.lang.toLowerCase() === VOICE_CONFIG.primaryLanguage
            );

            // PRIORITY 2: Any Portuguese (pt-*)
            if (!portugueseVoice) {
                portugueseVoice = this.voices.find(voice =>
                    voice.lang && voice.lang.toLowerCase().startsWith(VOICE_CONFIG.fallbackLanguagePrefix)
                );
            }

            // PRIORITY 3: First available voice
            this.voice = portugueseVoice || this.voices[0] || null;

            // Log selection result
            if (this.voice) {
                const voiceType = this.voice.lang?.toLowerCase() === VOICE_CONFIG.primaryLanguage 
                    ? 'Brazilian Portuguese' 
                    : this.voice.lang?.toLowerCase().startsWith(VOICE_CONFIG.fallbackLanguagePrefix)
                        ? 'Portuguese variant'
                        : 'fallback';
                this.safeLog(`(VoiceManager) Selected ${voiceType} voice: ${this.voice.name} (${this.voice.lang})`);
            } else {
                this.safeWarn('(VoiceManager) No voices available');
            }

            // Manage retry timer
            if (portugueseVoice && portugueseVoice.lang.toLowerCase() === VOICE_CONFIG.primaryLanguage) {
                this.stopVoiceRetryTimer();
                this.safeLog('(VoiceManager) Brazilian Portuguese voice acquired, retry stopped');
            } else if (this.voices.length > 0 && !this.voiceRetryTimer && this.voiceRetryAttempts < this.maxVoiceRetryAttempts) {
                this.safeLog('(VoiceManager) Starting voice retry mechanism');
                this.startVoiceRetryTimer();
            }
        };

        // Immediate update
        updateVoices();

        // Set up event listener for async loading
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = updateVoices;
            this.safeLog('(VoiceManager) Voice change listener registered');
        }
    }

    /**
     * Start retry timer for Brazilian Portuguese voice detection.
     * 
     * @private
     * @returns {void}
     */
    startVoiceRetryTimer() {
        if (this.voiceRetryTimer) {
            this.safeLog('(VoiceManager) Voice retry timer already running');
            return;
        }

        this.safeLog(`(VoiceManager) Starting voice retry timer (max ${this.maxVoiceRetryAttempts} attempts)`);

        this.voiceRetryTimer = timerManager.setInterval(() => {
            this.voiceRetryAttempts++;
            this.safeLog(`(VoiceManager) Voice retry attempt ${this.voiceRetryAttempts}/${this.maxVoiceRetryAttempts}`);

            const voices = this.synth.getVoices();
            const brazilianVoice = voices.find(voice =>
                voice.lang && voice.lang.toLowerCase() === VOICE_CONFIG.primaryLanguage
            );

            if (brazilianVoice) {
                this.voice = brazilianVoice;
                this.safeLog(`(VoiceManager) Brazilian Portuguese voice found: ${brazilianVoice.name}`);
                this.stopVoiceRetryTimer();
            } else if (this.voiceRetryAttempts >= this.maxVoiceRetryAttempts) {
                this.safeWarn(`(VoiceManager) Maximum voice retry attempts (${this.maxVoiceRetryAttempts}) reached`);
                this.stopVoiceRetryTimer();
            }
        }, this.voiceRetryInterval, 'voice-retry-timer');
    }

    /**
     * Stop voice retry timer and cleanup.
     * 
     * @private
     * @returns {void}
     */
    stopVoiceRetryTimer() {
        if (this.voiceRetryTimer) {
            timerManager.clearTimer(this.voiceRetryTimer);
            this.voiceRetryTimer = null;
            this.safeLog('(VoiceManager) Voice retry timer stopped');
        }
    }

    /**
     * Get currently selected voice.
     * 
     * @returns {SpeechSynthesisVoice|null} Current voice or null
     */
    getCurrentVoice() {
        return this.voice;
    }

    /**
     * Set voice with validation.
     * 
     * @param {SpeechSynthesisVoice|null} voice - Voice to set
     * @returns {SpeechSynthesisVoice|null} The set voice
     * @throws {TypeError} If voice is invalid
     */
    setVoice(voice) {
        if (voice !== null && (typeof voice !== 'object' || !voice.name)) {
            throw new TypeError('Voice must be a valid SpeechSynthesisVoice object or null');
        }
        
        if (voice) {
            this.safeLog(`(VoiceManager) Voice manually set: ${voice.name} (${voice.lang})`);
        } else {
            this.safeLog('(VoiceManager) Voice set to null');
        }
        
        this.voice = voice;
        return this.voice;
    }

    /**
     * Get all available voices.
     * 
     * @returns {SpeechSynthesisVoice[]} Array of available voices
     */
    getAvailableVoices() {
        return [...this.voices];
    }

    /**
     * Check if Brazilian Portuguese voice is available.
     * 
     * @returns {boolean} True if Brazilian Portuguese voice is available
     */
    hasBrazilianVoice() {
        return this.voice !== null && 
               this.voice.lang && 
               this.voice.lang.toLowerCase() === VOICE_CONFIG.primaryLanguage;
    }

    /**
     * Enable logging.
     * 
     * @returns {void}
     */
    enableLogs() {
        this.enableLogging = true;
    }

    /**
     * Disable logging.
     * 
     * @returns {void}
     */
    disableLogs() {
        this.enableLogging = false;
    }

    /**
     * Cleanup resources.
     * 
     * @returns {void}
     */
    destroy() {
        this.stopVoiceRetryTimer();
        this.voices = [];
        this.voice = null;
    }
}

export default VoiceManager;
