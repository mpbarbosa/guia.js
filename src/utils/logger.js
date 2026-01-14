'use strict';

/**
 * Logging utilities with timestamp formatting and environment-aware configuration.
 * 
 * Provides centralized logging with environment-based control to prevent
 * console pollution in production. All functions check the logging level
 * before outputting to console.
 * 
 * **Environment Configuration**:
 * - Set `GUIA_LOG_LEVEL` environment variable or localStorage key
 * - Levels: 'none', 'error', 'warn', 'log', 'debug' (default: 'log')
 * - Production detection via NODE_ENV or manual configuration
 * 
 * @module utils/logger
 * @since 0.8.6-alpha
 * @author Marcelo Pereira Barbosa
 */

/**
 * Log levels in ascending order of verbosity.
 * @private
 */
const LOG_LEVELS = {
	none: 0,
	error: 1,
	warn: 2,
	log: 3,
	debug: 4
};

/**
 * Current logging configuration.
 * @private
 */
let logConfig = {
	level: LOG_LEVELS.log,
	enabled: true,
	timestamp: true
};

/**
 * Detects if running in production environment.
 * 
 * @returns {boolean} True if production environment detected
 * @private
 */
const _isProduction = () => {
	// Node.js environment check
	if (typeof process !== 'undefined' && process.env) {
		return process.env.NODE_ENV === 'production';
	}
	// Browser check for production indicators
	if (typeof window !== 'undefined') {
		return window.location?.hostname !== 'localhost' && 
		       !window.location?.hostname?.startsWith('127.0.0.1');
	}
	return false;
};

/**
 * Gets configured log level from environment or localStorage.
 * 
 * Priority:
 * 1. GUIA_LOG_LEVEL environment variable (Node.js)
 * 2. localStorage.GUIA_LOG_LEVEL (browser)
 * 3. Default based on environment (production = 'error', development = 'log')
 * 
 * @returns {string} Log level name
 * @private
 */
const _getConfiguredLevel = () => {
	// Check Node.js environment variable
	if (typeof process !== 'undefined' && process.env?.GUIA_LOG_LEVEL) {
		return process.env.GUIA_LOG_LEVEL.toLowerCase();
	}
	// Check browser localStorage (safely)
	if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
		try {
			const stored = localStorage.getItem('GUIA_LOG_LEVEL');
			if (stored) return stored.toLowerCase();
		} catch (e) {
			// localStorage not available or blocked, continue to default
		}
	}
	// Default based on environment
	return _isProduction() ? 'error' : 'log';
};

/**
 * Initializes logging configuration.
 * Called automatically on module load.
 * 
 * @private
 */
const _initializeConfig = () => {
	const levelName = _getConfiguredLevel();
	logConfig.level = LOG_LEVELS[levelName] ?? LOG_LEVELS.log;
	logConfig.enabled = logConfig.level > LOG_LEVELS.none;
};

// Initialize on module load
_initializeConfig();

/**
 * Checks if a specific log level is enabled.
 * 
 * @param {number} level - Log level to check
 * @returns {boolean} True if level is enabled
 * @private
 */
const _isLevelEnabled = (level) => {
	return logConfig.enabled && logConfig.level >= level;
};

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
 * Logs info message with timestamp (if LOG level enabled).
 * 
 * Respects environment configuration - disabled in production by default.
 * Use for general informational messages during development.
 * 
 * @param {string} message - Message to log
 * @param {...any} params - Additional parameters
 * 
 * @example
 * log('Position updated', { lat: -23.5505, lon: -46.6333 });
 * // Output: [2025-10-15T04:33:48.006Z] Position updated { lat: -23.5505, lon: -46.6333 }
 * // (only if log level >= 'log')
 * 
 * @since 0.8.6-alpha
 */
export const log = (message, ...params) => {
	if (_isLevelEnabled(LOG_LEVELS.log)) {
		console.log(`[${formatTimestamp()}]`, message, ...params);
	}
};

/**
 * Logs warning message with timestamp (if WARN level enabled).
 * 
 * Respects environment configuration. Use for non-critical issues
 * that should be visible in production.
 * 
 * @param {string} message - Warning message
 * @param {...any} params - Additional parameters
 * 
 * @example
 * warn('Low accuracy detected', { accuracy: 500 });
 * // Output: [2025-10-15T04:33:48.006Z] Low accuracy detected { accuracy: 500 }
 * // (only if log level >= 'warn')
 * 
 * @since 0.8.6-alpha
 */
export const warn = (message, ...params) => {
	if (_isLevelEnabled(LOG_LEVELS.warn)) {
		console.warn(`[${formatTimestamp()}]`, message, ...params);
	}
};

/**
 * Logs error message with timestamp (if ERROR level enabled).
 * 
 * Always enabled except when explicitly set to 'none'. Use for
 * critical errors that need attention even in production.
 * 
 * @param {string} message - Error message
 * @param {...any} params - Additional parameters
 * 
 * @example
 * error('Geolocation failed', { code: 1, message: 'Permission denied' });
 * // Output: [2025-10-15T04:33:48.006Z] Geolocation failed { code: 1, message: 'Permission denied' }
 * // (only if log level >= 'error')
 * 
 * @since 0.8.6-alpha
 */
export const error = (message, ...params) => {
	if (_isLevelEnabled(LOG_LEVELS.error)) {
		console.error(`[${formatTimestamp()}]`, message, ...params);
	}
};

/**
 * Logs debug message with timestamp (if DEBUG level enabled).
 * 
 * Only enabled when explicitly configured. Use for verbose
 * debugging information during development.
 * 
 * @param {string} message - Debug message
 * @param {...any} params - Additional parameters
 * 
 * @example
 * debug('Observer notified', { observerCount: 5 });
 * // Output: [2025-10-15T04:33:48.006Z] Observer notified { observerCount: 5 }
 * // (only if log level >= 'debug')
 * 
 * @since 0.7.0-alpha
 */
export const debug = (message, ...params) => {
	if (_isLevelEnabled(LOG_LEVELS.debug)) {
		console.debug(`[${formatTimestamp()}] [DEBUG]`, message, ...params);
	}
};

/**
 * Configures logging at runtime.
 * 
 * Allows dynamic adjustment of logging behavior without restarting.
 * Changes persist in memory only (not saved to localStorage automatically).
 * 
 * @param {Object} options - Configuration options
 * @param {string} [options.level] - Log level: 'none', 'error', 'warn', 'log', 'debug'
 * @param {boolean} [options.enabled] - Enable/disable all logging
 * @param {boolean} [options.timestamp] - Include timestamps in logs
 * 
 * @example
 * // Disable all logging
 * setLogLevel({ enabled: false });
 * 
 * // Set to error-only in production
 * setLogLevel({ level: 'error' });
 * 
 * // Enable debug mode for development
 * setLogLevel({ level: 'debug' });
 * 
 * @since 0.7.0-alpha
 * @param {Object} [options] - Configuration options
 * @param {string} [options.level] - Log level ('debug', 'info', 'warn', 'error')
 * @param {boolean} [options.enabled] - Enable/disable logging
 * @returns {void}
 */
export const setLogLevel = (options = {}) => {
	if (options.level && LOG_LEVELS[options.level] !== undefined) {
		logConfig.level = LOG_LEVELS[options.level];
	}
	if (typeof options.enabled === 'boolean') {
		logConfig.enabled = options.enabled;
	}
	if (typeof options.timestamp === 'boolean') {
		logConfig.timestamp = options.timestamp;
	}
};

/**
 * Gets current logging configuration.
 * 
 * @returns {Object} Current configuration with level name and enabled state
 * 
 * @example
 * const config = getLogLevel();
 * console.log(config); // { level: 'log', levelName: 'log', enabled: true }
 * 
 * @since 0.7.0-alpha
 */
export const getLogLevel = () => {
	const levelName = Object.keys(LOG_LEVELS).find(
		key => LOG_LEVELS[key] === logConfig.level
	) || 'log';
	
	return {
		level: logConfig.level,
		levelName,
		enabled: logConfig.enabled,
		timestamp: logConfig.timestamp,
		isProduction: _isProduction()
	};
};
