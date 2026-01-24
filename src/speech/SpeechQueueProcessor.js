'use strict';
import { log, warn, error } from '../utils/logger.js';

/**
 * SpeechQueueProcessor manages timer-based queue processing.
 * 
 * This class handles the independent timer-based processing system for speech queues,
 * providing a reliable mechanism for triggering queue processing at regular intervals.
 * It's designed to work alongside event-driven processing as a backup mechanism.
 * 
 * **Responsibilities**:
 * - Manage queue processing timer
 * - Control timer lifecycle (start/stop)
 * - Provide callback-based processing triggers
 * - Prevent timer leaks and duplicates
 * 
 * **Extracted from**: SpeechSynthesisManager (god class refactoring)
 * 
 * @class SpeechQueueProcessor
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */

/**
 * Configuration constants for queue processing.
 * @constant {Object}
 * @private
 */
const PROCESSOR_CONFIG = {
    defaultInterval: 100, // Default processing interval in ms
    minInterval: 10,      // Minimum allowed interval
    maxInterval: 5000     // Maximum allowed interval
};

Object.freeze(PROCESSOR_CONFIG);

/**
 * SpeechQueueProcessor class for timer-based queue processing.
 */
export class SpeechQueueProcessor {
    /**
     * Creates a new SpeechQueueProcessor instance.
     * 
     * @param {Function} processCallback - Function to call for processing queue
     * @param {number} [interval=100] - Processing interval in milliseconds
     * @param {boolean} [enableLogging=false] - Whether to enable logging
     * @throws {TypeError} If processCallback is not a function
     * @throws {RangeError} If interval is outside valid range
     */
    constructor(processCallback, interval = PROCESSOR_CONFIG.defaultInterval, enableLogging = false) {
        if (typeof processCallback !== 'function') {
            throw new TypeError('processCallback must be a function');
        }

        if (typeof interval !== 'number' || interval < PROCESSOR_CONFIG.minInterval || interval > PROCESSOR_CONFIG.maxInterval) {
            throw new RangeError(`interval must be between ${PROCESSOR_CONFIG.minInterval} and ${PROCESSOR_CONFIG.maxInterval}ms`);
        }

        this.processCallback = processCallback;
        this.interval = interval;
        this.enableLogging = enableLogging;
        this.timer = null;
        this.isRunning = false;
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
     * Start the queue processing timer.
     * 
     * Initiates a timer that calls the process callback at regular intervals.
     * Prevents duplicate timers by stopping any existing timer first.
     * 
     * @returns {void}
     * 
     * @example
     * processor.start();
     */
    start() {
        if (this.isRunning) {
            this.safeLog('(SpeechQueueProcessor) Timer already running');
            return;
        }

        this.stop(); // Ensure no existing timer

        this.safeLog(`(SpeechQueueProcessor) Starting queue timer (${this.interval}ms interval)`);

        this.timer = setInterval(() => {
            try {
                this.processCallback();
            } catch (error) {
                this.safeWarn('(SpeechQueueProcessor) Error in process callback:', error);
            }
        }, this.interval);

        this.isRunning = true;
    }

    /**
     * Stop the queue processing timer.
     * 
     * Safely terminates the processing timer and resets state.
     * Can be called multiple times safely.
     * 
     * @returns {void}
     * 
     * @example
     * processor.stop();
     */
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            this.isRunning = false;
            this.safeLog('(SpeechQueueProcessor) Queue timer stopped');
        }
    }

    /**
     * Restart the timer with optional new interval.
     * 
     * @param {number} [newInterval] - New interval in ms (optional)
     * @returns {void}
     * @throws {RangeError} If newInterval is outside valid range
     * 
     * @example
     * processor.restart(200); // Restart with 200ms interval
     */
    restart(newInterval) {
        if (newInterval !== undefined) {
            if (typeof newInterval !== 'number' || newInterval < PROCESSOR_CONFIG.minInterval || newInterval > PROCESSOR_CONFIG.maxInterval) {
                throw new RangeError(`interval must be between ${PROCESSOR_CONFIG.minInterval} and ${PROCESSOR_CONFIG.maxInterval}ms`);
            }
            this.interval = newInterval;
        }

        const wasRunning = this.isRunning;
        this.stop();
        
        if (wasRunning) {
            this.start();
        }
    }

    /**
     * Check if timer is currently running.
     * 
     * @returns {boolean} True if timer is active
     */
    isActive() {
        return this.isRunning;
    }

    /**
     * Get current interval setting.
     * 
     * @returns {number} Current interval in milliseconds
     */
    getInterval() {
        return this.interval;
    }

    /**
     * Set new interval (takes effect on next restart).
     * 
     * @param {number} newInterval - New interval in ms
     * @returns {void}
     * @throws {RangeError} If interval is outside valid range
     */
    setInterval(newInterval) {
        if (typeof newInterval !== 'number' || newInterval < PROCESSOR_CONFIG.minInterval || newInterval > PROCESSOR_CONFIG.maxInterval) {
            throw new RangeError(`interval must be between ${PROCESSOR_CONFIG.minInterval} and ${PROCESSOR_CONFIG.maxInterval}ms`);
        }

        this.interval = newInterval;
        this.safeLog(`(SpeechQueueProcessor) Interval updated to ${newInterval}ms`);
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
     * Cleanup resources and stop timer.
     * 
     * @returns {void}
     */
    destroy() {
        this.stop();
        this.processCallback = null;
    }

    /**
     * Get valid interval range.
     * 
     * @returns {{min: number, max: number, default: number}} Interval range
     */
    static getIntervalRange() {
        return {
            min: PROCESSOR_CONFIG.minInterval,
            max: PROCESSOR_CONFIG.maxInterval,
            default: PROCESSOR_CONFIG.defaultInterval
        };
    }
}

export default SpeechQueueProcessor;
