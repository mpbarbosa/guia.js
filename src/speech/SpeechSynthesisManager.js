'use strict';
import { log, warn, error } from '../utils/logger.js';

/**
 * Speech Synthesis Manager for Web Speech API integration with queue-based processing.
 * 
 * This module provides a comprehensive speech synthesis system with priority-based queuing,
 * voice selection optimized for Brazilian Portuguese, rate and pitch control, retry mechanisms,
 * and robust error handling. It implements both immediate speech and queued processing for
 * managing multiple speech requests efficiently in web applications.
 * 
 * **Key Features**:
 * - **Priority-based Speech Queue**: Manages multiple speech requests with priority ordering
 * - **Brazilian Portuguese Voice Prioritization**: Automatically selects pt-BR voices when available
 * - **Retry Mechanisms**: Robust voice loading with retry logic for asynchronous voice loading
 * - **Rate and Pitch Control**: Configurable speech parameters with validation and clamping
 * - **State Management**: Concurrent speech prevention with proper state tracking
 * - **Cross-Environment Safety**: Works in browsers with graceful fallbacks for missing APIs
 * - **Timer-based Processing**: Independent queue processing for reliable speech delivery
 * 
 * **Architecture Pattern**: Manager/Controller
 * - Manages Web Speech API interactions and speech synthesis state
 * - Coordinates between speech queue and browser speech synthesis
 * - Provides configuration interface for voice, rate, and pitch parameters
 * - Implements retry logic for robust voice loading in different browsers
 * 
 * **Design Principles Applied**:
 * - **Single Responsibility**: Focused on speech synthesis management and queue processing
 * - **Robustness**: Comprehensive error handling and retry mechanisms for voice loading
 * - **Performance**: Efficient queue processing with state-based concurrency control
 * - **Accessibility**: Prioritizes Brazilian Portuguese voices for target user base
 * - **Browser Compatibility**: Graceful degradation for environments without speech synthesis
 * 
 * @class SpeechSynthesisManager
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * // Basic usage with default settings
 * import SpeechSynthesisManager from './speech/SpeechSynthesisManager.js';
 * 
 * const speechManager = new SpeechSynthesisManager();
 * speechManager.speak("Olá, bem-vindo ao sistema!", 0);
 * 
 * @example
 * // Advanced usage with custom configuration
 * const speechManager = new SpeechSynthesisManager();
 * speechManager.setRate(1.2);
 * speechManager.setPitch(1.1);
 * speechManager.speak("Mensagem urgente!", 2); // High priority
 * 
 * @example
 * // Queue management and control
 * const speechManager = new SpeechSynthesisManager();
 * speechManager.speak("Primeira mensagem", 0);
 * speechManager.speak("Segunda mensagem", 1); // Higher priority
 * speechManager.pause(); // Pause current speech
 * speechManager.resume(); // Resume speech
 * speechManager.stop(); // Stop and clear queue
 */

// Import dependencies
import SpeechQueue from './SpeechQueue.js';
import VoiceLoader from './VoiceLoader.js';
import VoiceSelector from './VoiceSelector.js';
import SpeechConfiguration from './SpeechConfiguration.js';
import timerManager from '../utils/TimerManager.js';

// Logging functions are now instance methods for configurable logging control

/**
 * Configuration constants for speech synthesis management.
 * 
 * These constants define default behavior and limits for the speech synthesis system,
 * including retry mechanisms, voice loading timeouts, and processing intervals.
 * 
 * @constant {Object}
 * @private
 */
const SPEECH_CONFIG = {
    // Voice loading and retry configuration
    maxVoiceRetryAttempts: 10,           // Maximum attempts to find Brazilian Portuguese voice
    voiceRetryInterval: 1000,            // Interval between voice retry attempts (ms)
    
    // Queue processing configuration  
    independentQueueTimerInterval: 100,   // Default queue processing interval (ms)
    
    // Speech parameter limits
    minRate: 0.1,                        // Minimum speech rate
    maxRate: 10.0,                       // Maximum speech rate
    minPitch: 0.0,                       // Minimum speech pitch
    maxPitch: 2.0,                       // Maximum speech pitch
    
    // Default values
    defaultRate: 1.0,                    // Default speech rate
    defaultPitch: 1.0,                   // Default speech pitch
    
    // Voice selection priorities
    primaryLanguage: 'pt-br',            // Primary target language (Brazilian Portuguese)
    fallbackLanguagePrefix: 'pt'         // Fallback language prefix (any Portuguese)
};

Object.freeze(SPEECH_CONFIG);

/**
 * SpeechSynthesisManager class for managing Web Speech API synthesis with queue-based processing.
 * 
 * This class provides a comprehensive speech synthesis system that manages voice selection,
 * speech queuing with priority support, rate and pitch control, and robust error handling.
 * It automatically prioritizes Brazilian Portuguese voices and includes retry mechanisms
 * for reliable voice loading across different browsers and environments.
 * 
 * **Architecture Pattern**: Manager/Controller with Composition
 * - Uses extracted composition classes: VoiceLoader, VoiceSelector, SpeechConfiguration
 * - Delegates voice loading to VoiceLoader
 * - Delegates voice selection to VoiceSelector
 * - Delegates rate/pitch configuration to SpeechConfiguration
 * - Manages overall speech synthesis orchestration
 * 
 * **State Management**:
 * - Tracks current speaking status to prevent overlapping speech
 * - Manages voice loading state with retry mechanisms (legacy, for backward compatibility)
 * - Maintains queue processing timers for independent operation
 * 
 * **Voice Selection Strategy**:
 * 1. **Primary**: Brazilian Portuguese (pt-BR) voices
 * 2. **Fallback**: Any Portuguese (pt-*) voices  
 * 3. **Default**: First available voice or null
 * 
 * **Queue Processing**:
 * - Priority-based ordering (higher priority numbers speak first)
 * - State-controlled processing (prevents concurrent speech)
 * - Timer-based independent processing for reliability
 * 
 * @class
 */
class SpeechSynthesisManager {
    /**
     * Creates a new SpeechSynthesisManager instance.
     * 
     * Initializes the speech synthesis system with Web Speech API integration,
     * sets up voice loading with retry mechanisms, creates the speech queue,
     * and configures default speech parameters. The constructor performs
     * immediate voice loading and establishes retry timers if needed.
     * 
     * **Initialization Process**:
     * 1. Initialize Web Speech API interface (window.speechSynthesis)
     * 2. Set up voice storage and selection state
     * 3. Configure speech parameters (rate, pitch) with defaults
     * 4. Initialize speech queue for priority-based processing
     * 5. Set up timer management for queue processing
     * 6. Configure voice retry mechanism for Brazilian Portuguese
     * 7. Begin voice loading process with retry logic
     * 
     * @constructor
     * @param {boolean} [enableLogging=false] - Whether to enable logging output
     * @throws {Error} If Web Speech API is not available in the environment
     * @throws {TypeError} When enableLogging parameter is not a boolean
     * 
     * @example
     * // Basic instantiation
     * const speechManager = new SpeechSynthesisManager();
     * 
     * @example
     * // Instantiation with logging enabled
     * const speechManager = new SpeechSynthesisManager(true);
     * 
     * @example
     * // Instantiation with immediate usage
     * const speechManager = new SpeechSynthesisManager();
     * speechManager.speak("Sistema inicializado com sucesso!");
     */
    constructor(enableLogging = false) {
        // Parameter validation
        if (typeof enableLogging !== 'boolean') {
            throw new TypeError(`enableLogging must be a boolean, got: ${typeof enableLogging}`);
        }

        // Store logging preference
        this.enableLogging = enableLogging;

        // Validate Web Speech API availability
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            throw new Error('Web Speech API not available in this environment');
        }
        
        // Initialize Web Speech API interface
        this.synth = window.speechSynthesis;
        
        // Initialize composition components (extracted classes)
        this.voiceLoader = new VoiceLoader({ enableLogging });
        this.voiceSelector = new VoiceSelector({ 
            primaryLanguage: SPEECH_CONFIG.primaryLanguage,
            fallbackLanguagePrefix: SPEECH_CONFIG.fallbackLanguagePrefix 
        });
        this.configuration = new SpeechConfiguration(enableLogging);
        
        // Initialize voice selection and storage (for backward compatibility)
        this.voices = [];                    // Array of available SpeechSynthesisVoice objects
        this.voice = null;                   // Currently selected voice (null until loaded)
        
        // Initialize rate and pitch from configuration (synchronized with this.configuration)
        this.rate = this.configuration.getRate();       // Speech rate (delegated to configuration)
        this.pitch = this.configuration.getPitch();     // Speech pitch (delegated to configuration)
        
        // Initialize state management
        this.isCurrentlySpeaking = false;    // Concurrency control flag
        
        // Initialize speech queue for priority-based processing
        this.speechQueue = new SpeechQueue(100, 30000, enableLogging);
        
        // Initialize timer management for queue processing
        this.queueTimer = null;              // Timer for independent queue processing
        this.independentQueueTimerInterval = SPEECH_CONFIG.independentQueueTimerInterval;
        
        // Legacy voice retry mechanism properties (kept for backward compatibility)
        this.voiceRetryTimer = null;         // Timer for voice retry attempts (deprecated)
        this.voiceRetryAttempts = 0;         // Counter for retry attempts (deprecated)
        this.maxVoiceRetryAttempts = SPEECH_CONFIG.maxVoiceRetryAttempts;
        this.voiceRetryInterval = SPEECH_CONFIG.voiceRetryInterval;
        
        // Begin voice loading process using new VoiceLoader
        this.loadVoices();
        
        this.safeLog('(SpeechSynthesisManager) Initialized successfully with Web Speech API');
    }

    /**
     * Gets the current logging state.
     * 
     * @returns {boolean} True if logging is enabled, false otherwise
     * @readonly
     */
    get isLoggingEnabled() {
        return this.enableLogging;
    }

    /**
     * Enables logging for this speech manager instance.
     * 
     * @example
     * speechManager.enableLogs();
     * speechManager.speak("Test message"); // Will log speech operations
     */
    enableLogs() {
        this.enableLogging = true;
        this.speechQueue.enableLogs();
    }

    /**
     * Disables logging for this speech manager instance.
     * 
     * @example
     * speechManager.disableLogs();
     * speechManager.speak("Test message"); // Will not log speech operations
     */
    disableLogs() {
        this.enableLogging = false;
        this.speechQueue.disableLogs();
    }

    /**
     * Toggles the logging state for this speech manager instance.
     * 
     * @returns {boolean} The new logging state after toggling
     * 
     * @example
     * const newState = speechManager.toggleLogs();
     * log(`Logging is now ${newState ? 'enabled' : 'disabled'}`);
     */
    toggleLogs() {
        this.enableLogging = !this.enableLogging;
        this.speechQueue.toggleLogs();
        return this.enableLogging;
    }

    /**
     * Safe logging method that respects the logging state.
     * 
     * @private
     * @param {string} message - Main log message
     * @param {...any} params - Additional parameters to log
     */
    safeLog(message, ...params) {
        if (this.enableLogging && typeof console !== 'undefined' && console.log) {
            const fullMessage = `[${new Date().toISOString()}] ${message} ${params.join(" ")}`;
            log(fullMessage);
        }
    }

    /**
     * Safe warning method that respects the logging state.
     * 
     * @private
     * @param {string} message - Main warning message
     * @param {...any} params - Additional parameters to log
     */
    safeWarn(message, ...params) {
        if (this.enableLogging && typeof console !== 'undefined' && console.warn) {
            warn(message, ...params);
        }
    }

    /**
     * Loads available voices and selects the optimal Portuguese voice.
     * 
     * This method implements a sophisticated voice selection strategy that prioritizes
     * Brazilian Portuguese voices for the target user base using the extracted composition
     * classes VoiceLoader and VoiceSelector. It includes a retry mechanism to handle
     * asynchronous voice loading in different browsers, ensuring reliable voice selection
     * even when voices are not immediately available.
     * 
     * **Voice Selection Priority** (delegated to VoiceSelector):
     * 1. **Brazilian Portuguese (pt-BR)**: Primary target for Brazilian users
     * 2. **Portuguese variants (pt-*)**: Fallback for any Portuguese dialect
     * 3. **First available voice**: Default fallback for non-Portuguese environments
     * 4. **Null**: If no voices are available
     * 
     * **Retry Mechanism** (delegated to VoiceLoader):
     * - Uses exponential backoff for efficient retry
     * - Handles asynchronous voice loading in different browsers
     * - Automatically completes when voices are available
     * 
     * **Composition Classes**:
     * - VoiceLoader: Handles voice loading with exponential backoff retry
     * - VoiceSelector: Implements voice prioritization and selection strategy
     * 
     * @private
     * @returns {void}
     * 
     * @example
     * // Called automatically by constructor
     * // Constructor calls this.loadVoices() after initializing composition components
     */
    loadVoices() {
        /**
         * Internal voice update logic with priority-based selection.
         * Synchronous voice selection that works with cached voices.
         * 
         * @private
         * @returns {void}
         */
        const selectVoiceSync = () => {
            // Get voices from Web Speech API directly (synchronous fallback for backward compatibility)
            this.voices = this.synth.getVoices();
            this.safeLog(`(SpeechSynthesisManager) Found ${this.voices.length} available voices`);
            
            // Select voice using VoiceSelector (with priority strategy)
            this.voice = this.voiceSelector.selectVoice(this.voices);
            
            // Log voice selection result for debugging
            if (this.voice) {
                const voiceType = this.voice.lang?.toLowerCase() === SPEECH_CONFIG.primaryLanguage 
                    ? 'Brazilian Portuguese' 
                    : this.voice.lang?.toLowerCase().startsWith(SPEECH_CONFIG.fallbackLanguagePrefix)
                        ? 'Portuguese variant'
                        : 'fallback';
                this.safeLog(`(SpeechSynthesisManager) Selected ${voiceType} voice: ${this.voice.name} (${this.voice.lang})`);
            } else {
                this.safeWarn('(SpeechSynthesisManager) No voices available for speech synthesis');
            }
        };
        
        /**
         * Internal async voice loading logic with exponential backoff.
         * Provides reliable voice loading for browsers that load voices asynchronously.
         * 
         * @private
         * @returns {void}
         */
        const loadVoicesAsync = async () => {
            try {
                // Step 1: Load voices using VoiceLoader (with exponential backoff retry)
                await this.voiceLoader.loadVoices();
                
                // Step 2: Get cached voices from loader
                this.voices = this.voiceLoader.getVoices();
                this.safeLog(`(SpeechSynthesisManager) Found ${this.voices.length} available voices (async)`);
                
                // Step 3: Select voice using VoiceSelector (with priority strategy)
                this.voice = this.voiceSelector.selectVoice(this.voices);
                
                // Step 4: Log voice selection result for debugging
                if (this.voice) {
                    const voiceType = this.voice.lang?.toLowerCase() === SPEECH_CONFIG.primaryLanguage 
                        ? 'Brazilian Portuguese' 
                        : this.voice.lang?.toLowerCase().startsWith(SPEECH_CONFIG.fallbackLanguagePrefix)
                            ? 'Portuguese variant'
                            : 'fallback';
                    this.safeLog(`(SpeechSynthesisManager) Selected ${voiceType} voice (async): ${this.voice.name} (${this.voice.lang})`);
                } else {
                    this.safeWarn('(SpeechSynthesisManager) No voices available for speech synthesis (async)');
                }
                
            } catch (err) {
                this.safeWarn('(SpeechSynthesisManager) Error loading voices asynchronously:', err);
            }
        };

        // Step 1: Immediate synchronous voice selection (handles cases where voices are already loaded)
        selectVoiceSync();
        
        // Step 2: Trigger asynchronous voice loading for delayed voice availability
        loadVoicesAsync();

        // Step 3: Set up event listener for asynchronous voice loading (handles voice changes)
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = selectVoiceSync;
            this.safeLog('(SpeechSynthesisManager) Voice change listener registered');
        }
    }

    /**
     * Starts the retry timer for Brazilian Portuguese voice detection.
     * 
     * @deprecated This method is no longer used. VoiceLoader now handles voice loading
     * with exponential backoff retry. This method is kept for backward compatibility only.
     * 
     * This method implements a timer-based retry mechanism that periodically checks
     * for the availability of Brazilian Portuguese voices. This is necessary because
     * some browsers load voices asynchronously, and the desired voice may not be
     * immediately available at initialization time.
     * 
     * **Retry Logic**:
     * - Executes at regular intervals (configurable via SPEECH_CONFIG.voiceRetryInterval)
     * - Limited to maximum attempts to prevent infinite loops
     * - Automatically stops when Brazilian Portuguese voice is found
     * - Automatically stops when maximum attempts are reached
     * - Prevents multiple concurrent retry timers
     * 
     * @private
     * @returns {void}
     * 
     * @example
     * // Called automatically by loadVoices() when needed
     * // Manual usage for testing:
     * speechManager.startVoiceRetryTimer();
     */
    startVoiceRetryTimer() {
        // Prevent multiple concurrent retry timers
        if (this.voiceRetryTimer) {
            this.safeLog('(SpeechSynthesisManager) Voice retry timer already running');
            return;
        }

        this.safeLog(`(SpeechSynthesisManager) Starting voice retry timer (max ${this.maxVoiceRetryAttempts} attempts)`);

        this.voiceRetryTimer = timerManager.setInterval(() => {
            this.voiceRetryAttempts++;
            this.safeLog(`(SpeechSynthesisManager) Voice retry attempt ${this.voiceRetryAttempts}/${this.maxVoiceRetryAttempts}`);

            // Get current available voices for retry check
            const voices = this.synth.getVoices();
            const brazilianVoice = voices.find(voice =>
                voice.lang && voice.lang.toLowerCase() === SPEECH_CONFIG.primaryLanguage
            );

            if (brazilianVoice) {
                // SUCCESS: Brazilian Portuguese voice found
                this.voice = brazilianVoice;
                this.safeLog(`(SpeechSynthesisManager) Brazilian Portuguese voice found: ${brazilianVoice.name}`);
                this.stopVoiceRetryTimer();
            } else if (this.voiceRetryAttempts >= this.maxVoiceRetryAttempts) {
                // FAILURE: Maximum attempts reached without finding Brazilian Portuguese voice
                this.safeWarn(`(SpeechSynthesisManager) Maximum voice retry attempts (${this.maxVoiceRetryAttempts}) reached`);
                this.stopVoiceRetryTimer();
            }
        }, this.voiceRetryInterval, 'speech-voice-retry-legacy');
    }

    /**
     * Stops the voice retry timer and cleans up retry state.
     * 
     * @deprecated This method is no longer used. VoiceLoader now handles voice loading
     * with exponential backoff retry. This method is kept for backward compatibility only.
     * 
     * This method safely terminates the voice retry mechanism, clearing the interval
     * timer and resetting the timer reference. It can be called multiple times safely
     * and handles cases where no timer is currently running.
     * 
     * @private
     * @returns {void}
     * 
     * @example
     * // Called automatically when Brazilian Portuguese voice is found
     * // Manual usage for cleanup:
     * speechManager.stopVoiceRetryTimer();
     */
    stopVoiceRetryTimer() {
        if (this.voiceRetryTimer) {
            timerManager.clearTimer(this.voiceRetryTimer);
            this.voiceRetryTimer = null;
            this.safeLog('(SpeechSynthesisManager) Voice retry timer stopped');
        }
    }

    /**
     * Sets the speech synthesis voice with validation.
     * 
     * This method allows manual selection of a specific voice from the available
     * voices. It provides validation to ensure the voice is valid and logs the
     * change for debugging purposes. This can override the automatic Brazilian
     * Portuguese voice selection.
     * 
     * @param {SpeechSynthesisVoice|null} voice - Voice to use for synthesis
     * @throws {TypeError} If voice is provided but not a valid SpeechSynthesisVoice
     * @returns {void}
     * 
     * @example
     * // Set specific voice by selection
     * const voices = speechManager.getAvailableVoices();
     * const englishVoice = voices.find(v => v.lang.startsWith('en'));
     * speechManager.setVoice(englishVoice);
     * 
     * @example
     * // Clear voice selection (use default)
     * speechManager.setVoice(null);
     */
    setVoice(voice) {
        // Validate voice parameter
        if (voice !== null && (typeof voice !== 'object' || !voice.name)) {
            throw new TypeError('Voice must be a valid SpeechSynthesisVoice object or null');
        }

        this.voice = voice;
        
        if (voice) {
            this.safeLog(`(SpeechSynthesisManager) Voice set to: ${voice.name} (${voice.lang})`);
        } else {
            this.safeLog('(SpeechSynthesisManager) Voice cleared (will use default)');
        }
    }

    /**
     * Sets the speech rate with validation and clamping.
     * 
     * This method configures the speech synthesis rate (speed) with automatic
     * validation and clamping to ensure values remain within the valid range
     * supported by the Web Speech API. Invalid values are automatically corrected.
     * 
     * **Implementation**: Delegates to SpeechConfiguration for parameter management
     * while maintaining backward compatibility by syncing this.rate property.
     * 
     * @param {number} rate - Speech rate (0.1 to 10.0, where 1.0 is normal speed)
     * @throws {TypeError} If rate is not a number
     * @returns {void}
     * 
     * @example
     * // Set normal speech rate
     * speechManager.setRate(1.0);
     * 
     * @example
     * // Set slow speech rate for accessibility
     * speechManager.setRate(0.5);
     * 
     * @example
     * // Set fast speech rate (automatically clamped to maximum)
     * speechManager.setRate(15); // Will be clamped to 10.0
     */
    setRate(rate) {
        // Validate rate parameter type
        if (typeof rate !== 'number' || isNaN(rate)) {
            throw new TypeError('Rate must be a valid number');
        }

        // Delegate to configuration object (handles clamping and logging)
        const result = this.configuration.setRate(rate);
        
        // Sync to this.rate for backward compatibility
        this.rate = result;
    }

    /**
     * Sets the speech pitch with validation and clamping.
     * 
     * This method configures the speech synthesis pitch with automatic validation
     * and clamping to ensure values remain within the valid range supported by
     * the Web Speech API. Invalid values are automatically corrected.
     * 
     * **Implementation**: Delegates to SpeechConfiguration for parameter management
     * while maintaining backward compatibility by syncing this.pitch property.
     * 
     * @param {number} pitch - Speech pitch (0.0 to 2.0, where 1.0 is normal pitch)
     * @throws {TypeError} If pitch is not a number
     * @returns {void}
     * 
     * @example
     * // Set normal speech pitch
     * speechManager.setPitch(1.0);
     * 
     * @example
     * // Set higher pitch for emphasis
     * speechManager.setPitch(1.5);
     * 
     * @example
     * // Set invalid pitch (automatically clamped to maximum)
     * speechManager.setPitch(5.0); // Will be clamped to 2.0
     */
    setPitch(pitch) {
        // Validate pitch parameter type
        if (typeof pitch !== 'number' || isNaN(pitch)) {
            throw new TypeError('Pitch must be a valid number');
        }

        // Delegate to configuration object (handles clamping and logging)
        const result = this.configuration.setPitch(pitch);
        
        // Sync to this.pitch for backward compatibility
        this.pitch = result;
    }

    /**
     * Gets all available voices for selection.
     * 
     * Returns a copy of the currently available voices array to prevent external
     * modification while allowing voice inspection and selection. This method
     * provides access to voice metadata for UI components or voice selection logic.
     * 
     * @returns {SpeechSynthesisVoice[]} Array of available voices (copy)
     * 
     * @example
     * // Get all available voices
     * const voices = speechManager.getAvailableVoices();
     * log(`Found ${voices.length} voices`);
     * 
     * @example
     * // Find specific language voices
     * const voices = speechManager.getAvailableVoices();
     * const englishVoices = voices.filter(v => v.lang.startsWith('en'));
     */
    getAvailableVoices() {
        // Return copy to prevent external modification
        return [...this.voices];
    }

    /**
     * Gets the currently selected voice.
     * 
     * Returns the currently active voice object, which may be null if no voice
     * has been loaded or selected. This provides access to voice metadata for
     * UI display or debugging purposes.
     * 
     * @returns {SpeechSynthesisVoice|null} Currently selected voice or null
     * 
     * @example
     * // Check current voice
     * const currentVoice = speechManager.getCurrentVoice();
     * if (currentVoice) {
     *     log(`Using voice: ${currentVoice.name} (${currentVoice.lang})`);
     * } else {
     *     log('No voice selected');
     * }
     */
    getCurrentVoice() {
        return this.voice;
    }

    /**
     * Primary entry point for adding text-to-speech requests to the speech synthesis system.
     * 
     * Implements a clean three-step process: input validation, queue management, and conditional 
     * processing initiation. This method serves as the public interface for all speech requests,
     * handling both immediate processing and queued batch processing scenarios through intelligent
     * state management and priority-based queue operations.
     * 
     * **Processing Flow**:
     * 1. **Input Validation**: Ensures text is valid and non-empty
     * 2. **Queue Management**: Adds text to priority-based speech queue
     * 3. **Conditional Processing**: Starts queue processing if not currently speaking
     * 
     * **Priority System**:
     * - Higher priority numbers are processed first
     * - Equal priority items are processed in FIFO order
     * - Priority 0 is normal priority (default)
     * - Negative priorities are processed after normal priority
     * 
     * @param {string} text - Text content to be spoken by the speech synthesis system
     * @param {number} [priority=0] - Priority level for queue positioning (higher values = higher priority)
     * @throws {TypeError} If text is not a string
     * @throws {Error} If text is empty or only whitespace
     * @returns {void}
     * 
     * @example
     * // Basic speech request with default priority
     * speechManager.speak("Welcome to the application");
     * 
     * @example  
     * // High priority urgent message (jumps ahead in queue)
     * speechManager.speak("Emergency alert: System malfunction detected!", 2);
     * 
     * @example
     * // Low priority background information
     * speechManager.speak("Background processing complete", -1);
     * 
     * @since 0.9.0-alpha
     * @author Marcelo Pereira Barbosa
     */
    speak(text, priority = 0) {
        this.safeLog(`(SpeechSynthesisManager) Speak request: "${text}" (priority: ${priority})`);
        
        // STEP 1: Input Validation - Comprehensive validation prevents invalid requests
        if (typeof text !== 'string') {
            throw new TypeError('Text must be a string');
        }
        
        if (!text || text.trim() === "") {
            throw new Error('Text cannot be empty or only whitespace');
        }

        if (typeof priority !== 'number' || isNaN(priority)) {
            throw new TypeError('Priority must be a number');
        }

        // STEP 2: Queue Management - Add text to priority-based speech queue
        this.speechQueue.enqueue(text.trim(), priority);
        this.safeLog(`(SpeechSynthesisManager) Text added to queue (size: ${this.speechQueue.size()})`);

        // STEP 3: Conditional Processing Initiation - Intelligent queue processing
        if (!this.isCurrentlySpeaking) {
            this.safeLog('(SpeechSynthesisManager) Starting queue processing');
            this.processQueue();
        } else {
            this.safeLog('(SpeechSynthesisManager) Currently speaking, text queued for later processing');
        }
    }

    /**
     * Processes the speech synthesis queue in a state-managed, sequential manner.
     * 
     * This method is the core orchestrator for the speech synthesis queue system, managing 
     * the sequential processing of text-to-speech requests while ensuring only one speech 
     * utterance plays at a time and maintaining a queue of pending items. It implements
     * robust error handling and state management for reliable speech processing.
     * 
     * **Processing Logic**:
     * 1. Check if processing is possible (not currently speaking, queue not empty)
     * 2. Retrieve next highest priority item from queue
     * 3. Set concurrency control flag to prevent overlapping speech
     * 4. Create and configure speech utterance with current voice settings
     * 5. Set up event handlers for completion and error scenarios
     * 6. Execute speech synthesis via Web Speech API
     * 
     * **State Management**:
     * - Uses `isCurrentlySpeaking` flag to prevent concurrent speech processing
     * - Automatically resets state on speech completion or error
     * - Maintains queue integrity through proper error handling
     * 
     * @private
     * @returns {void}
     * @since 0.9.0-alpha
     * @author Marcelo Pereira Barbosa
     */
    processQueue() {
        // Pure helper function that encapsulates queue retrieval logic with guard clauses
        const getNextSpeechItem = () => {
            // Early return if processing is not possible
            if (this.isCurrentlySpeaking || this.speechQueue.isEmpty()) {
                return null;
            }
            return this.speechQueue.dequeue();
        };

        // Attempt to get next valid item from queue
        const item = getNextSpeechItem();

        // Early return if no item available for processing
        if (!item) {
            this.safeLog('(SpeechSynthesisManager) No items in queue or currently speaking');
            return;
        }

        this.safeLog(`(SpeechSynthesisManager) Processing speech item: "${item.text}" (priority: ${item.priority})`);

        // Set concurrency control flag to prevent overlapping speech processing
        this.isCurrentlySpeaking = true;

        // Create new speech utterance with retrieved text content
        const utterance = new SpeechSynthesisUtterance(item.text);

        // Configure utterance with current instance voice settings
        utterance.voice = this.voice;
        utterance.rate = this.rate;
        utterance.pitch = this.pitch;

        // Event handler for successful speech completion
        utterance.onend = () => {
            this.safeLog(`(SpeechSynthesisManager) Speech completed: "${item.text}"`);
            this.isCurrentlySpeaking = false;
            
            // Continue processing queue if more items exist
            if (!this.speechQueue.isEmpty()) {
                this.safeLog('(SpeechSynthesisManager) Continuing with next queue item');
                // Use setTimeout to avoid potential recursion issues
                timerManager.setTimeout(() => this.processQueue(), 10, 'speech-queue-next');
            }
        };

        // Event handler for speech errors
        utterance.onerror = (event) => {
            this.safeWarn(`(SpeechSynthesisManager) Speech error for "${item.text}":`, event.error);
            this.isCurrentlySpeaking = false;
            
            // Continue processing queue even after errors to prevent queue stalling
            if (!this.speechQueue.isEmpty()) {
                this.safeLog('(SpeechSynthesisManager) Continuing queue processing after error');
                timerManager.setTimeout(() => this.processQueue(), 10, 'speech-queue-error-recovery');
            }
        };

        // Execute the speech utterance using Web Speech API
        try {
            this.synth.speak(utterance);
            this.safeLog(`(SpeechSynthesisManager) Speech utterance started for: "${item.text}"`);
        } catch (error) {
            this.safeWarn('(SpeechSynthesisManager) Failed to start speech utterance:', error);
            this.isCurrentlySpeaking = false;
            
            // Continue processing queue after synthesis errors
            if (!this.speechQueue.isEmpty()) {
                timerManager.setTimeout(() => this.processQueue(), 10, 'speech-queue-catch-recovery');
            }
        }
    }

    /**
     * Starts the independent queue processing timer for reliable speech delivery.
     * 
     * This method initializes a timer-based queue processing system that provides
     * an independent mechanism for processing queued speech items. This is useful
     * for ensuring reliable speech delivery in scenarios where the event-driven
     * processing might be unreliable or when explicit timer-based processing is preferred.
     * 
     * **Timer Benefits**:
     * - Provides backup processing mechanism if event-driven processing fails
     * - Ensures regular queue checking at configurable intervals
     * - Useful for debugging and testing speech queue behavior
     * - Can help with browser-specific speech synthesis quirks
     * 
     * @returns {void}
     * 
     * @example
     * // Start timer-based queue processing
     * speechManager.startQueueTimer();
     * speechManager.speak("This will be processed by timer");
     * 
     * @example
     * // Custom timer interval usage
     * speechManager.independentQueueTimerInterval = 200; // 200ms
     * speechManager.startQueueTimer();
     */
    startQueueTimer() {
        // Stop any existing timer to prevent duplicates
        this.stopQueueTimer();

        this.safeLog(`(SpeechSynthesisManager) Starting queue timer (${this.independentQueueTimerInterval}ms interval)`);

        // Use TimerManager for automatic cleanup and leak prevention
        this.queueTimer = timerManager.setInterval(
            () => this.processQueue(),
            this.independentQueueTimerInterval,
            'speech-synthesis-queue'
        );
    }

    /**
     * Stops the independent queue processing timer.
     * 
     * This method safely terminates the timer-based queue processing system,
     * clearing the interval timer and resetting the timer reference. It can
     * be called multiple times safely and handles cases where no timer is running.
     * 
     * @returns {void}
     * 
     * @example
     * // Stop timer-based processing
     * speechManager.stopQueueTimer();
     */
    stopQueueTimer() {
        if (this.queueTimer) {
            // Use TimerManager for cleanup
            timerManager.clearTimer('speech-synthesis-queue');
            this.queueTimer = null;
            this.safeLog('(SpeechSynthesisManager) Queue timer stopped');
        }
    }

    /**
     * Pauses the current speech synthesis without affecting the queue.
     * 
     * This method pauses the currently playing speech utterance while preserving
     * the speech queue and current state. The speech can be resumed later using
     * the resume() method. This is useful for temporary interruptions or user
     * control over speech playback.
     * 
     * @returns {void}
     * 
     * @example
     * // Pause current speech
     * speechManager.speak("This is a long message that can be paused");
     * setTimeout(() => speechManager.pause(), 1000);
     */
    pause() {
        if (this.synth.speaking && !this.synth.paused) {
            this.synth.pause();
            this.safeLog('(SpeechSynthesisManager) Speech paused');
        } else {
            this.safeLog('(SpeechSynthesisManager) No active speech to pause');
        }
    }

    /**
     * Resumes paused speech synthesis.
     * 
     * This method resumes speech synthesis that was previously paused using
     * the pause() method. It only has an effect if speech is currently paused;
     * otherwise, it logs an appropriate message.
     * 
     * @returns {void}
     * 
     * @example
     * // Resume paused speech
     * speechManager.resume();
     */
    resume() {
        if (this.synth.paused) {
            this.synth.resume();
            this.safeLog('(SpeechSynthesisManager) Speech resumed');
        } else {
            this.safeLog('(SpeechSynthesisManager) No paused speech to resume');
        }
    }

    /**
     * Stops current speech synthesis and clears the entire queue.
     * 
     * This method immediately stops any currently playing speech, clears all
     * pending items from the speech queue, resets the speaking state, and stops
     * any running queue processing timers. This is useful for emergency stops
     * or when the user wants to cancel all speech activity.
     * 
     * **Cleanup Actions**:
     * - Cancels current speech utterance
     * - Clears all items from speech queue
     * - Resets isCurrentlySpeaking state
     * - Stops queue processing timer
     * 
     * @returns {void}
     * 
     * @example
     * // Emergency stop all speech
     * speechManager.stop();
     * 
     * @example
     * // Clear queue and stop for new content
     * speechManager.stop();
     * speechManager.speak("New urgent message");
     */
    stop() {
        // Cancel any current speech synthesis
        this.synth.cancel();
        
        // Clear all pending items from queue
        const queueSize = this.speechQueue.size();
        this.speechQueue.clear();
        
        // Reset speaking state
        this.isCurrentlySpeaking = false;
        
        // Stop queue processing timer
        this.stopQueueTimer();
        
        this.safeLog(`(SpeechSynthesisManager) Speech stopped and queue cleared (${queueSize} items removed)`);
    }

    /**
     * Gets the current size of the speech queue.
     * 
     * Returns the number of items currently pending in the speech queue,
     * not including any currently playing speech. This is useful for
     * monitoring queue status and implementing queue management logic.
     * 
     * @returns {number} Number of items in the speech queue
     * 
     * @example
     * // Check queue status
     * log(`Queue has ${speechManager.getQueueSize()} pending items`);
     * 
     * @example
     * // Conditional processing based on queue size
     * if (speechManager.getQueueSize() > 5) {
     *     speechManager.stop(); // Clear overloaded queue
     * }
     */
    getQueueSize() {
        return this.speechQueue.size();
    }

    /**
     * Checks if speech synthesis is currently active.
     * 
     * Returns true if speech is currently being synthesized (either playing
     * or paused), false otherwise. This provides external visibility into
     * the speech synthesis state for UI updates or conditional logic.
     * 
     * @returns {boolean} True if currently speaking, false otherwise
     * 
     * @example
     * // Check speaking status
     * if (!speechManager.isSpeaking()) {
     *     speechManager.speak("Ready for new speech");
     * }
     * 
     * @example
     * // UI state updates
     * const speakButton = document.getElementById('speak-btn');
     * speakButton.disabled = speechManager.isSpeaking();
     */
    isSpeaking() {
        return this.isCurrentlySpeaking;
    }

    /**
     * Gets comprehensive status information about the speech synthesis system.
     * 
     * Returns an object containing current configuration, state, and queue information
     * for debugging, monitoring, or UI display purposes. This provides a complete
     * snapshot of the speech synthesis system state including values from the
     * SpeechConfiguration composition object.
     * 
     * @returns {Object} Status object with comprehensive system information
     * @returns {Object} return.voice - Current voice information (name, lang) or null
     * @returns {number} return.rate - Current speech rate (from SpeechConfiguration)
     * @returns {number} return.pitch - Current speech pitch (from SpeechConfiguration)  
     * @returns {boolean} return.isSpeaking - Whether currently speaking
     * @returns {number} return.queueSize - Number of items in queue
     * @returns {boolean} return.queueTimerActive - Whether queue timer is running
     * @returns {number} return.voiceRetryAttempts - Number of voice retry attempts made (legacy)
     * @returns {boolean} return.voiceRetryActive - Whether voice retry timer is running (legacy)
     * 
     * @example
     * // Get complete status
     * const status = speechManager.getStatus();
     * log('Speech Status:', status);
     * 
     * @example
     * // Monitor queue for debugging
     * setInterval(() => {
     *     const status = speechManager.getStatus();
     *     if (status.queueSize > 0) {
     *         log(`Queue: ${status.queueSize} items, Speaking: ${status.isSpeaking}`);
     *     }
     * }, 1000);
     */
    getStatus() {
        return {
            voice: this.voice ? { name: this.voice.name, lang: this.voice.lang } : null,
            rate: this.rate,  // Synchronized with this.configuration.rate
            pitch: this.pitch,  // Synchronized with this.configuration.pitch
            isSpeaking: this.isCurrentlySpeaking,
            queueSize: this.speechQueue.size(),
            queueTimerActive: this.queueTimer !== null,
            voiceRetryAttempts: this.voiceRetryAttempts,
            voiceRetryActive: this.voiceRetryTimer !== null
        };
    }

    /**
     * Returns a string representation of the SpeechSynthesisManager instance.
     * 
     * Provides a human-readable representation showing the class name and current
     * configuration including voice, rate, pitch, speaking status, and queue size.
     * This is useful for logging, debugging, and development purposes.
     * 
     * @returns {string} String representation with current configuration
     * 
     * @example
     * log(speechManager.toString());
     * // Output: "SpeechSynthesisManager: voice=Google português do Brasil, rate=1, pitch=1, isSpeaking=false, queueSize=0"
     * 
     * @example
     * // Use in error logging
     * error('Speech error in:', speechManager.toString());
     */
    toString() {
        return `${this.constructor.name}: voice=${this.voice?.name || 'none'}, rate=${this.rate}, pitch=${this.pitch}, isSpeaking=${this.isCurrentlySpeaking}, queueSize=${this.speechQueue.size()}`;
    }

    /**
     * Destroys the speech manager and cleans up all resources.
     * 
     * Stops all timers (voice retry and queue processing), cancels any ongoing speech,
     * clears the queue, and releases references. This method is critical for preventing
     * timer leaks in test environments where SpeechSynthesisManager instances are
     * created and destroyed frequently.
     * 
     * Call this method when the speech manager is no longer needed to ensure proper
     * cleanup of all resources and prevent memory/timer leaks.
     * 
     * @returns {void}
     * @since 0.9.0-alpha
     * @author Marcelo Pereira Barbosa
     * 
     * @example
     * const speechManager = new SpeechSynthesisManager();
     * speechManager.speak("Hello world");
     * // ... use speech manager
     * speechManager.destroy(); // Clean up when done
     * 
     * @example
     * // In tests
     * describe('SpeechSynthesisManager', () => {
     *   let manager;
     *   
     *   beforeEach(() => {
     *     manager = new SpeechSynthesisManager();
     *   });
     *   
     *   afterEach(() => {
     *     if (manager) {
     *       manager.destroy(); // Prevent timer leaks
     *     }
     *   });
     * });
     */
    destroy() {
        // Stop all timers to prevent leaks
        this.stopVoiceRetryTimer();
        this.stopQueueTimer();
        
        // Cancel any ongoing speech
        if (this.synth) {
            this.synth.cancel();
        }
        
        // Clear the speech queue
        if (this.speechQueue) {
            this.speechQueue.clear();
        }
        
        // Release references to prevent memory leaks
        this.synth = null;
        this.speechQueue = null;
        this.voice = null;
        this.voiceRetryTimer = null;
        this.queueTimer = null;
    }
}

export default SpeechSynthesisManager;
/**
 * Module exports for speech synthesis management.
 * @exports SPEECH_CONFIG - Default speech synthesis configuration
 */
export { SPEECH_CONFIG };