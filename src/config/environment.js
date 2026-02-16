'use strict';

/**
 * Environment configuration loader.
 * 
 * Provides centralized access to environment variables with fallbacks to defaults.
 * In browser environments, reads from window.__ENV__ injected at build time.
 * In Node.js, uses process.env with dotenv support.
 * 
 * @module config/environment
 * @since 0.11.0-alpha
 * @author Marcelo Pereira Barbosa
 */

/**
 * Default environment configuration.
 */
const defaults = {
  // API Configuration
  NOMINATIM_API_URL: 'https://nominatim.openstreetmap.org',
  NOMINATIM_USER_AGENT: 'GuiaTuristico/0.11.0',
  IBGE_API_URL: 'https://servicodados.ibge.gov.br',
  
  // Rate Limiting (requests per minute)
  RATE_LIMIT_NOMINATIM: 60,
  RATE_LIMIT_IBGE: 120,
  
  // Feature Flags
  ENABLE_SPEECH_SYNTHESIS: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_ANALYTICS: false,
  
  // Development Settings
  DEBUG_MODE: false,
  LOG_LEVEL: 'info',
  
  // Security
  CSP_ENABLED: true,
  CORS_ENABLED: false
};

/**
 * Get environment variable with fallback to default.
 * 
 * @param {string} key - Environment variable key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Environment variable value or default
 */
function getEnv(key, defaultValue) {
  // Browser environment - check window.__ENV__
  if (typeof window !== 'undefined' && window.__ENV__) {
    return window.__ENV__[key] !== undefined ? window.__ENV__[key] : defaultValue;
  }
  
  // Node.js environment - check process.env
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key];
    if (value !== undefined) {
      // Convert string booleans to actual booleans
      if (value === 'true') return true;
      if (value === 'false') return false;
      // Convert numeric strings to numbers
      if (/^\d+$/.test(value)) return parseInt(value, 10);
      return value;
    }
  }
  
  return defaultValue;
}

/**
 * Environment configuration object.
 * Exposes all environment variables with type-safe access.
 */
export const env = {
  // API Configuration
  nominatimApiUrl: getEnv('NOMINATIM_API_URL', defaults.NOMINATIM_API_URL),
  nominatimUserAgent: getEnv('NOMINATIM_USER_AGENT', defaults.NOMINATIM_USER_AGENT),
  ibgeApiUrl: getEnv('IBGE_API_URL', defaults.IBGE_API_URL),
  
  // Rate Limiting
  rateLimitNominatim: getEnv('RATE_LIMIT_NOMINATIM', defaults.RATE_LIMIT_NOMINATIM),
  rateLimitIbge: getEnv('RATE_LIMIT_IBGE', defaults.RATE_LIMIT_IBGE),
  
  // Feature Flags
  enableSpeechSynthesis: getEnv('ENABLE_SPEECH_SYNTHESIS', defaults.ENABLE_SPEECH_SYNTHESIS),
  enableOfflineMode: getEnv('ENABLE_OFFLINE_MODE', defaults.ENABLE_OFFLINE_MODE),
  enableAnalytics: getEnv('ENABLE_ANALYTICS', defaults.ENABLE_ANALYTICS),
  
  // Development Settings
  debugMode: getEnv('DEBUG_MODE', defaults.DEBUG_MODE),
  logLevel: getEnv('LOG_LEVEL', defaults.LOG_LEVEL),
  
  // Security
  cspEnabled: getEnv('CSP_ENABLED', defaults.CSP_ENABLED),
  corsEnabled: getEnv('CORS_ENABLED', defaults.CORS_ENABLED),
  
  /**
   * Check if running in development mode.
   * @returns {boolean} True if in development mode
   */
  isDevelopment() {
    return this.debugMode || 
           (typeof process !== 'undefined' && process.env.NODE_ENV === 'development');
  },
  
  /**
   * Check if running in production mode.
   * @returns {boolean} True if in production mode
   */
  isProduction() {
    return !this.isDevelopment();
  }
};

export default env;
