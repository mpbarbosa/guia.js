'use strict';

/**
 * SpeechConfiguration manages speech synthesis parameters.
 * 
 * This class handles rate and pitch configuration for speech synthesis,
 * providing validation, clamping, and state management for speech parameters.
 * It ensures all values remain within valid ranges supported by the Web Speech API.
 * 
 * **Responsibilities**:
 * - Manage speech rate (speed) configuration
 * - Manage speech pitch configuration
 * - Validate parameter values
 * - Clamp values to valid ranges
 * - Provide configuration state
 * 
 * **Extracted from**: SpeechSynthesisManager (god class refactoring)
 * 
 * @class SpeechConfiguration
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */

/**
 * Configuration constants for speech parameters.
 * @constant {Object}
 * @private
 */
const PARAM_CONFIG = {
    minRate: 0.1,
    maxRate: 10.0,
    minPitch: 0.0,
    maxPitch: 2.0,
    defaultRate: 1.0,
    defaultPitch: 1.0
};

Object.freeze(PARAM_CONFIG);

/**
 * SpeechConfiguration class for managing speech synthesis parameters.
 */
export class SpeechConfiguration {
    /**
     * Creates a new SpeechConfiguration instance.
     * 
     * @param {boolean} [enableLogging=false] - Whether to enable logging
     */
    constructor(enableLogging = false) {
        this.enableLogging = enableLogging;
        this.rate = PARAM_CONFIG.defaultRate;
        this.pitch = PARAM_CONFIG.defaultPitch;
    }

    /**
     * Safe logging that checks for console availability.
     * @private
     */
    safeLog(message, ...params) {
        if (this.enableLogging && typeof console !== 'undefined' && console.log) {
            console.log(message, ...params);
        }
    }

    /**
     * Safe warning logging that checks for console availability.
     * @private
     */
    safeWarn(message, ...params) {
        if (this.enableLogging && typeof console !== 'undefined' && console.warn) {
            console.warn(message, ...params);
        }
    }

    /**
     * Set speech rate with validation and clamping.
     * 
     * Configures the speech synthesis rate (speed) with automatic validation
     * and clamping to ensure values remain within valid range (0.1 to 10.0).
     * 
     * @param {number} rate - Speech rate (0.1 to 10.0, where 1.0 is normal)
     * @returns {number} The clamped rate value
     * @throws {TypeError} If rate is not a valid number
     * 
     * @example
     * config.setRate(1.0);  // Normal speed
     * config.setRate(0.5);  // Slow speed
     * config.setRate(2.0);  // Fast speed
     */
    setRate(rate) {
        if (typeof rate !== 'number' || isNaN(rate)) {
            throw new TypeError('Rate must be a valid number');
        }

        const clampedRate = Math.max(PARAM_CONFIG.minRate, Math.min(PARAM_CONFIG.maxRate, rate));
        this.rate = clampedRate;

        if (clampedRate !== rate) {
            this.safeWarn(`(SpeechConfiguration) Rate ${rate} clamped to ${clampedRate} (valid range: ${PARAM_CONFIG.minRate}-${PARAM_CONFIG.maxRate})`);
        } else {
            this.safeLog(`(SpeechConfiguration) Speech rate set to ${clampedRate}`);
        }

        return this.rate;
    }

    /**
     * Set speech pitch with validation and clamping.
     * 
     * Configures the speech synthesis pitch with automatic validation
     * and clamping to ensure values remain within valid range (0.0 to 2.0).
     * 
     * @param {number} pitch - Speech pitch (0.0 to 2.0, where 1.0 is normal)
     * @returns {number} The clamped pitch value
     * @throws {TypeError} If pitch is not a valid number
     * 
     * @example
     * config.setPitch(1.0);  // Normal pitch
     * config.setPitch(1.5);  // Higher pitch
     * config.setPitch(0.8);  // Lower pitch
     */
    setPitch(pitch) {
        if (typeof pitch !== 'number' || isNaN(pitch)) {
            throw new TypeError('Pitch must be a valid number');
        }

        const clampedPitch = Math.max(PARAM_CONFIG.minPitch, Math.min(PARAM_CONFIG.maxPitch, pitch));
        this.pitch = clampedPitch;

        if (clampedPitch !== pitch) {
            this.safeWarn(`(SpeechConfiguration) Pitch ${pitch} clamped to ${clampedPitch} (valid range: ${PARAM_CONFIG.minPitch}-${PARAM_CONFIG.maxPitch})`);
        } else {
            this.safeLog(`(SpeechConfiguration) Speech pitch set to ${clampedPitch}`);
        }

        return this.pitch;
    }

    /**
     * Get current speech rate.
     * 
     * @returns {number} Current rate value
     */
    getRate() {
        return this.rate;
    }

    /**
     * Get current speech pitch.
     * 
     * @returns {number} Current pitch value
     */
    getPitch() {
        return this.pitch;
    }

    /**
     * Get current configuration as object.
     * 
     * @returns {{rate: number, pitch: number}} Current configuration
     */
    getConfiguration() {
        return {
            rate: this.rate,
            pitch: this.pitch
        };
    }

    /**
     * Reset configuration to defaults.
     * 
     * @returns {void}
     */
    reset() {
        this.rate = PARAM_CONFIG.defaultRate;
        this.pitch = PARAM_CONFIG.defaultPitch;
        this.safeLog('(SpeechConfiguration) Configuration reset to defaults');
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
     * Get valid range for rate parameter.
     * 
     * @returns {{min: number, max: number, default: number}} Rate range
     */
    static getRateRange() {
        return {
            min: PARAM_CONFIG.minRate,
            max: PARAM_CONFIG.maxRate,
            default: PARAM_CONFIG.defaultRate
        };
    }

    /**
     * Get valid range for pitch parameter.
     * 
     * @returns {{min: number, max: number, default: number}} Pitch range
     */
    static getPitchRange() {
        return {
            min: PARAM_CONFIG.minPitch,
            max: PARAM_CONFIG.maxPitch,
            default: PARAM_CONFIG.defaultPitch
        };
    }
}

export default SpeechConfiguration;
