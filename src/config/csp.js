'use strict';

/**
 * Content Security Policy (CSP) configuration.
 * 
 * Provides CSP headers and meta tag content for securing the application
 * against XSS, clickjacking, and other injection attacks.
 * 
 * @module config/csp
 * @since 0.11.0-alpha
 * @author Marcelo Pereira Barbosa
 */

/**
 * CSP directives for production environment.
 * Strict policy that only allows necessary sources.
 */
export const productionCSP = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for inline event handlers (onclick)
    'https://cdn.jsdelivr.net', // For ibira.js CDN
    'https://www.googletagmanager.com' // If analytics enabled
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'" // Required for inline styles in Material Design
  ],
  'img-src': [
    "'self'",
    'data:', // For inline images
    'https:', // External images
    'https://nominatim.openstreetmap.org' // Map tiles
  ],
  'font-src': [
    "'self'",
    'data:' // For inline fonts
  ],
  'connect-src': [
    "'self'",
    'https://nominatim.openstreetmap.org', // Geocoding API
    'https://servicodados.ibge.gov.br', // IBGE API
    'https://www.google-analytics.com' // If analytics enabled
  ],
  'frame-ancestors': ["'none'"], // Prevent clickjacking
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

/**
 * CSP directives for development environment.
 * More relaxed policy for development convenience.
 */
export const developmentCSP = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'", // For hot reload in development
    'https://cdn.jsdelivr.net'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'"
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'http:' // Allow HTTP in development
  ],
  'font-src': [
    "'self'",
    'data:'
  ],
  'connect-src': [
    "'self'",
    'https://nominatim.openstreetmap.org',
    'https://servicodados.ibge.gov.br',
    'http://localhost:*', // Local development servers
    'ws://localhost:*' // WebSocket for hot reload
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

/**
 * Convert CSP directives object to string format.
 * 
 * @param {Object} directives - CSP directives object
 * @returns {string} CSP string for use in headers or meta tags
 * 
 * @example
 * const csp = formatCSP(productionCSP);
 * // Returns: "default-src 'self'; script-src 'self' 'unsafe-inline'; ..."
 */
export function formatCSP(directives) {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Get CSP meta tag content for injection into HTML.
 * 
 * @param {boolean} isProduction - Whether running in production mode
 * @returns {string} CSP content string for meta tag
 * 
 * @example
 * const cspContent = getCSPMetaContent(true);
 * document.querySelector('meta[http-equiv="Content-Security-Policy"]')
 *   .setAttribute('content', cspContent);
 */
export function getCSPMetaContent(isProduction = true) {
  const directives = isProduction ? productionCSP : developmentCSP;
  return formatCSP(directives);
}

/**
 * Get CSP header value for server configuration.
 * 
 * @param {boolean} isProduction - Whether running in production mode
 * @returns {Object} Headers object with CSP
 * 
 * @example
 * // Express.js
 * const cspHeaders = getCSPHeaders(true);
 * app.use((req, res, next) => {
 *   Object.entries(cspHeaders).forEach(([key, value]) => {
 *     res.setHeader(key, value);
 *   });
 *   next();
 * });
 */
export function getCSPHeaders(isProduction = true) {
  const directives = isProduction ? productionCSP : developmentCSP;
  return {
    'Content-Security-Policy': formatCSP(directives)
  };
}

/**
 * Additional security headers for production.
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(self), microphone=(), camera=()'
};

/**
 * Get all security headers including CSP.
 * 
 * @param {boolean} isProduction - Whether running in production mode
 * @returns {Object} Complete set of security headers
 */
export function getAllSecurityHeaders(isProduction = true) {
  return {
    ...getCSPHeaders(isProduction),
    ...securityHeaders
  };
}
