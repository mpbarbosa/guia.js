/**
 * Logging utilities with timestamp formatting.
 * 
 * Pure functions for consistent logging across the application.
 * All functions are referentially transparent - they produce console output
 * as a side effect but don't modify any state.
 * 
 * @module utils/logger
 * @since 0.8.6-alpha
 * @author Marcelo Pereira Barbosa
 */

/**
 * Formats current timestamp for log messages.
 * 
 * @returns {string} ISO 8601 timestamp
 * 
 * @example
 * formatTimestamp(); // "2025-10-15T04:33:48.006Z"
 * 
 * @since 0.8.6-alpha
 */
export const formatTimestamp = () => new Date().toISOString();

/**
 * Logs info message with timestamp.
 * 
 * @param {string} message - Message to log
 * @param {...any} params - Additional parameters
 * 
 * @example
 * log('Position updated', { lat: -23.5505, lon: -46.6333 });
 * // Output: [2025-10-15T04:33:48.006Z] Position updated { lat: -23.5505, lon: -46.6333 }
 * 
 * @since 0.8.6-alpha
 */
export const log = (message, ...params) => {
	console.log(`[${formatTimestamp()}]`, message, ...params);
};

/**
 * Logs warning message with timestamp.
 * 
 * @param {string} message - Warning message
 * @param {...any} params - Additional parameters
 * 
 * @example
 * warn('Low accuracy detected', { accuracy: 500 });
 * // Output: [2025-10-15T04:33:48.006Z] Low accuracy detected { accuracy: 500 }
 * 
 * @since 0.8.6-alpha
 */
export const warn = (message, ...params) => {
	console.warn(`[${formatTimestamp()}]`, message, ...params);
};
