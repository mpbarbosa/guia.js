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

  // AWS Location Based Service
  AWS_LBS_BASE_URL: '',
  AWS_LBS_ENABLED: false,
  
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
 * Parse a string value into its appropriate type.
 * Converts "true"/"false" strings to booleans and numeric strings to numbers.
 * 
 * @param {string} value - Raw string value
 * @returns {boolean|number|string} Parsed value
 */
function parseValue(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  return value;
}

/**
 * Get environment variable with fallback to default.
 * Resolution order:
 *   1. import.meta.env.VITE_* – inlined by Vite via VITE_STATIC_ENV static map
 *   2. window.__ENV__          – runtime injection (legacy / server-side rendering)
 *   3. process.env             – Node.js / Jest test environment
 *   4. defaultValue            – hardcoded fallback
 * 
 * @param {string} key - Environment variable key (without VITE_ prefix)
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Environment variable value or default
 */
/**
 * Static map of Vite env variables using literal property access so Vite can
 * inline the values at build time. Dynamic key access (import.meta.env[key])
 * is NOT replaced by Vite; only literal references are.
 */
const VITE_STATIC_ENV = typeof import.meta !== 'undefined' && import.meta.env
  ? {
      NOMINATIM_API_URL:      import.meta.env.VITE_NOMINATIM_API_URL,
      NOMINATIM_USER_AGENT:   import.meta.env.VITE_NOMINATIM_USER_AGENT,
      IBGE_API_URL:           import.meta.env.VITE_IBGE_API_URL,
      AWS_LBS_BASE_URL:       import.meta.env.VITE_AWS_LBS_BASE_URL,
      AWS_LBS_ENABLED:        import.meta.env.VITE_AWS_LBS_ENABLED,
      RATE_LIMIT_NOMINATIM:   import.meta.env.VITE_RATE_LIMIT_NOMINATIM,
      RATE_LIMIT_IBGE:        import.meta.env.VITE_RATE_LIMIT_IBGE,
      ENABLE_SPEECH_SYNTHESIS:import.meta.env.VITE_ENABLE_SPEECH_SYNTHESIS,
      ENABLE_OFFLINE_MODE:    import.meta.env.VITE_ENABLE_OFFLINE_MODE,
      ENABLE_ANALYTICS:       import.meta.env.VITE_ENABLE_ANALYTICS,
      DEBUG_MODE:             import.meta.env.VITE_DEBUG_MODE,
      LOG_LEVEL:              import.meta.env.VITE_LOG_LEVEL,
      CSP_ENABLED:            import.meta.env.VITE_CSP_ENABLED,
      CORS_ENABLED:           import.meta.env.VITE_CORS_ENABLED,
    }
  : {};

function getEnv(key, defaultValue) {
  // 1. Vite build/dev environment – use the static map so Vite inlines values.
  const viteValue = VITE_STATIC_ENV[key];
  if (viteValue !== undefined) return parseValue(String(viteValue));

  // 2. Browser runtime injection via window.__ENV__ (e.g. from a server template)
  if (typeof window !== 'undefined' && window.__ENV__) {
    const windowValue = window.__ENV__[key];
    if (windowValue !== undefined) return parseValue(String(windowValue));
  }

  // 3. Node.js / Jest – process.env (may also contain VITE_-prefixed vars from dotenv)
  if (typeof process !== 'undefined' && process.env) {
    const nodeValue = process.env[`VITE_${key}`] ?? process.env[key];
    if (nodeValue !== undefined) return parseValue(nodeValue);
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

  // AWS Location Based Service
  awsLbsBaseUrl: getEnv('AWS_LBS_BASE_URL', defaults.AWS_LBS_BASE_URL),
  awsLbsEnabled: getEnv('AWS_LBS_ENABLED', defaults.AWS_LBS_ENABLED),
  
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
