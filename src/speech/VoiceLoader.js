'use strict';

/**
 * Voice loader with exponential backoff retry for Web Speech API.
 * 
 * Handles asynchronous voice loading with robust retry mechanisms for browsers
 * that load voices asynchronously (Chrome, Edge). Implements exponential backoff
 * to efficiently wait for voices to become available while minimizing CPU usage.
 * 
 * **Key Features**:
 * - Exponential backoff retry (100ms, 200ms, 400ms, 800ms, ...)
 * - Promise-based API for async/await usage
 * - Voice caching to avoid repeated browser queries
 * - Browser compatibility (handles both sync and async voice loading)
 * - Configurable retry limits and delays
 * 
 * **Architecture**: Single Responsibility - Voice Loading Only
 * - Does NOT handle voice selection (see VoiceSelector)
 * - Does NOT manage speech synthesis (see SpeechSynthesisManager)
 * - Focused solely on detecting when voices become available
 * 
 * **Browser Compatibility**:
 * - Chrome/Edge: Voices load asynchronously, requires retry logic
 * - Firefox: Voices available immediately on first call
 * - Safari: Voices available after 'voiceschanged' event
 * 
 * @class VoiceLoader
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * // Basic usage with defaults
 * const loader = new VoiceLoader();
 * const voices = await loader.loadVoices();
 * console.log(`Loaded ${voices.length} voices`);
 * 
 * @example
 * // Custom configuration
 * const loader = new VoiceLoader({
 *   maxRetries: 15,
 *   initialDelay: 50,
 *   maxDelay: 3000
 * });
 * const voices = await loader.loadVoices();
 * 
 * @example
 * // Check if voices are cached
 * const loader = new VoiceLoader();
 * await loader.loadVoices();
 * if (loader.hasVoices()) {
 *   const voices = loader.getVoices(); // Returns cached voices
 * }
 */
class VoiceLoader {
    /**
     * Creates a new VoiceLoader instance.
     * 
     * @param {Object} config - Configuration options
     * @param {number} [config.maxRetries=10] - Maximum retry attempts
     * @param {number} [config.initialDelay=100] - Initial delay in milliseconds
     * @param {number} [config.maxDelay=5000] - Maximum delay cap in milliseconds
     * @param {SpeechSynthesis} [config.speechSynthesis=window.speechSynthesis] - Speech synthesis instance (for testing)
     * 
     * @example
     * const loader = new VoiceLoader({ maxRetries: 15 });
     */
    constructor(config = {}) {
        /**
         * Maximum number of retry attempts.
         * @type {number}
         * @private
         */
        this.maxRetries = config.maxRetries || 10;
        
        /**
         * Initial delay for exponential backoff (milliseconds).
         * @type {number}
         * @private
         */
        this.initialDelay = config.initialDelay || 100;
        
        /**
         * Maximum delay cap for exponential backoff (milliseconds).
         * @type {number}
         * @private
         */
        this.maxDelay = config.maxDelay || 5000;
        
        /**
         * Cached voices array.
         * @type {SpeechSynthesisVoice[]}
         * @private
         */
        this.voicesCache = [];
        
        /**
         * Speech synthesis instance (allows injection for testing).
         * @type {SpeechSynthesis|null}
         * @private
         */
        this.speechSynthesis = config.hasOwnProperty('speechSynthesis') 
            ? config.speechSynthesis
            : (typeof window !== 'undefined' ? window.speechSynthesis : null);
        
        /**
         * Promise for ongoing voice loading operation.
         * Prevents multiple concurrent load operations.
         * @type {Promise<SpeechSynthesisVoice[]>|null}
         * @private
         */
        this.loadingPromise = null;
    }
    
    /**
     * Loads voices with exponential backoff retry.
     * 
     * This method attempts to load voices from the browser's speech synthesis API,
     * retrying with exponentially increasing delays if voices are not immediately
     * available. Returns cached voices if already loaded.
     * 
     * **Retry Strategy**:
     * - Attempt 1: 100ms delay
     * - Attempt 2: 200ms delay
     * - Attempt 3: 400ms delay
     * - Attempt 4: 800ms delay
     * - ...continues until maxDelay reached
     * 
     * **Concurrency Safety**:
     * Multiple calls to loadVoices() return the same promise if loading is in progress.
     * 
     * @returns {Promise<SpeechSynthesisVoice[]>} Promise resolving to available voices
     * @throws {Error} If speechSynthesis is not available (Node.js environment)
     * 
     * @example
     * const loader = new VoiceLoader();
     * try {
     *   const voices = await loader.loadVoices();
     *   console.log(`Found ${voices.length} voices`);
     * } catch (error) {
     *   console.error('Voice loading failed:', error);
     * }
     */
    async loadVoices() {
        // Return cached voices if already loaded
        if (this.voicesCache.length > 0) {
            return this.voicesCache;
        }
        
        // Return in-progress loading promise if exists
        if (this.loadingPromise) {
            return this.loadingPromise;
        }
        
        // Check if speech synthesis is available
        if (!this.speechSynthesis) {
            throw new Error('Speech synthesis not available (browser environment required)');
        }
        
        // Create new loading promise
        this.loadingPromise = this._loadVoicesWithRetry();
        
        try {
            const voices = await this.loadingPromise;
            this.voicesCache = voices;
            return voices;
        } finally {
            this.loadingPromise = null;
        }
    }
    
    /**
     * Internal method implementing exponential backoff retry logic.
     * 
     * @private
     * @returns {Promise<SpeechSynthesisVoice[]>} Promise resolving to voices
     */
    async _loadVoicesWithRetry() {
        let delay = this.initialDelay;
        
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            // Try to get voices
            const voices = this.speechSynthesis.getVoices();
            
            // Success: voices available
            if (voices.length > 0) {
                return voices;
            }
            
            // Last attempt: return empty array
            if (attempt === this.maxRetries - 1) {
                return [];
            }
            
            // Wait with exponential backoff
            await this._delay(delay);
            
            // Double delay for next attempt, capped at maxDelay
            delay = Math.min(delay * 2, this.maxDelay);
        }
        
        return [];
    }
    
    /**
     * Helper method for creating delay promises.
     * 
     * @private
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise<void>} Promise resolving after delay
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Gets cached voices without triggering reload.
     * 
     * Returns the cached voices array if voices have been loaded previously.
     * Does NOT trigger a new load operation. Use loadVoices() to ensure
     * voices are loaded.
     * 
     * @returns {SpeechSynthesisVoice[]} Cached voices (empty array if not loaded)
     * 
     * @example
     * const loader = new VoiceLoader();
     * const cachedVoices = loader.getVoices(); // May be empty
     * 
     * await loader.loadVoices(); // Load voices
     * const voices = loader.getVoices(); // Returns loaded voices
     */
    getVoices() {
        return this.voicesCache;
    }
    
    /**
     * Checks if voices have been loaded and cached.
     * 
     * @returns {boolean} True if voices are cached, false otherwise
     * 
     * @example
     * const loader = new VoiceLoader();
     * if (loader.hasVoices()) {
     *   console.log('Voices already loaded');
     * } else {
     *   await loader.loadVoices();
     * }
     */
    hasVoices() {
        return this.voicesCache.length > 0;
    }
    
    /**
     * Clears cached voices, forcing reload on next loadVoices() call.
     * 
     * Useful for handling browser voice list changes or testing scenarios
     * where fresh voice data is needed.
     * 
     * @returns {void}
     * 
     * @example
     * const loader = new VoiceLoader();
     * await loader.loadVoices();
     * 
     * // Later, clear cache to force reload
     * loader.clearCache();
     * const freshVoices = await loader.loadVoices();
     */
    clearCache() {
        this.voicesCache = [];
    }
    
    /**
     * Gets retry configuration for debugging/testing.
     * 
     * @returns {{maxRetries: number, initialDelay: number, maxDelay: number}}
     * 
     * @example
     * const loader = new VoiceLoader();
     * const config = loader.getRetryConfig();
     * console.log(`Max retries: ${config.maxRetries}`);
     */
    getRetryConfig() {
        return {
            maxRetries: this.maxRetries,
            initialDelay: this.initialDelay,
            maxDelay: this.maxDelay
        };
    }
}

export default VoiceLoader;
