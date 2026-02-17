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
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
  // NOTE: 'frame-ancestors' cannot be used in <meta> tags, only in HTTP headers
  // Use X-Frame-Options header instead (see securityHeaders below)
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
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
  // NOTE: 'frame-ancestors' cannot be used in <meta> tags, only in HTTP headers
  // Use X-Frame-Options header instead (see securityHeaders below)
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
 * NOTE: This version is for meta tags and does NOT include HTTP-only directives
 * like 'frame-ancestors'. Use getCSPHeadersWithFrameAncestors() for HTTP headers.
 * 
 * @param {boolean} isProduction - Whether running in production mode
 * @returns {Object} Headers object with CSP
 * 
 * @example
 * // For meta tag injection
 * const cspHeaders = getCSPHeaders(true);
 * meta.setAttribute('content', cspHeaders['Content-Security-Policy']);
 */
export function getCSPHeaders(isProduction = true) {
  const directives = isProduction ? productionCSP : developmentCSP;
  return {
    'Content-Security-Policy': formatCSP(directives)
  };
}

/**
 * Additional security headers for production.
 * 
 * NOTE: X-Frame-Options provides clickjacking protection since 'frame-ancestors'
 * CSP directive cannot be used in <meta> tags (only in HTTP headers).
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY', // Replaces frame-ancestors for meta tag deployments
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(self), microphone=(), camera=()'
};

/**
 * CSP directives that can ONLY be used in HTTP headers (not in meta tags).
 * These should be added by the server when serving via HTTP headers.
 */
export const httpOnlyCSP = {
  'frame-ancestors': ["'none'"] // Prevent clickjacking (HTTP header only)
};

/**
 * Get CSP header value for server configuration (includes HTTP-only directives).
 * 
 * @param {boolean} isProduction - Whether running in production mode
 * @returns {Object} Headers object with CSP including HTTP-only directives
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
export function getCSPHeadersWithFrameAncestors(isProduction = true) {
  const directives = isProduction ? productionCSP : developmentCSP;
  const combinedDirectives = { ...directives, ...httpOnlyCSP };
  return {
    'Content-Security-Policy': formatCSP(combinedDirectives)
  };
}

/**
 * Get all security headers including CSP.
 * 
 * @param {boolean} isProduction - Whether running in production mode
 * @param {boolean} includeFrameAncestors - Include frame-ancestors (only for HTTP headers)
 * @returns {Object} Complete set of security headers
 * 
 * @example
 * // For static hosting (meta tags)
 * const headers = getAllSecurityHeaders(true, false);
 * 
 * // For HTTP server
 * const headers = getAllSecurityHeaders(true, true);
 */
export function getAllSecurityHeaders(isProduction = true, includeFrameAncestors = false) {
  const cspHeaders = includeFrameAncestors 
    ? getCSPHeadersWithFrameAncestors(isProduction)
    : getCSPHeaders(isProduction);
  
  return {
    ...cspHeaders,
    ...securityHeaders
  };
}
