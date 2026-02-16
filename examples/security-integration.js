/**
 * Example: Integrating Security Features
 * 
 * This example demonstrates how to integrate environment variables,
 * CSP, and rate limiting in the Guia Turístico application.
 */

import { env } from '../src/config/environment.js';
import { getCSPMetaContent, getAllSecurityHeaders } from '../src/config/csp.js';
import RateLimiter, { createDefaultLimiters } from '../src/utils/rate-limiter.js';
import ReverseGeocoder from '../src/services/ReverseGeocoder.js';

// ========================================
// 1. Environment Variables Usage
// ========================================

console.log('=== Environment Configuration ===');
console.log('API URL:', env.nominatimApiUrl);
console.log('Rate Limit:', env.rateLimitNominatim, 'req/min');
console.log('Debug Mode:', env.debugMode);
console.log('Environment:', env.isProduction() ? 'Production' : 'Development');

// ========================================
// 2. Content Security Policy Setup
// ========================================

console.log('\n=== CSP Configuration ===');

// Get CSP for current environment
const cspContent = getCSPMetaContent(env.isProduction());
console.log('CSP:', cspContent.substring(0, 100) + '...');

// In browser, you would do:
if (typeof document !== 'undefined') {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = cspContent;
  document.head.appendChild(meta);
  console.log('✓ CSP meta tag injected');
}

// For server-side (Express.js example):
const securityHeaders = getAllSecurityHeaders(env.isProduction());
console.log('Security headers:', Object.keys(securityHeaders));

// ========================================
// 3. Rate Limiting Setup
// ========================================

console.log('\n=== Rate Limiting Configuration ===');

// Create rate limiters with environment-based config
const limiters = {
  nominatim: new RateLimiter({
    maxRequests: env.rateLimitNominatim,
    interval: 60000,
    maxQueueSize: 100,
    name: 'Nominatim'
  }),
  ibge: new RateLimiter({
    maxRequests: env.rateLimitIbge,
    interval: 60000,
    maxQueueSize: 100,
    name: 'IBGE'
  })
};

console.log('Nominatim limiter:', env.rateLimitNominatim, 'req/min');
console.log('IBGE limiter:', env.rateLimitIbge, 'req/min');

// ========================================
// 4. Rate-Limited API Wrapper Example
// ========================================

/**
 * Rate-limited reverse geocoder wrapper.
 */
class RateLimitedReverseGeocoder extends ReverseGeocoder {
  constructor(latitude, longitude, rateLimiter) {
    super(latitude, longitude);
    this.rateLimiter = rateLimiter;
  }

  async fetch() {
    // Wrap the fetch call with rate limiting
    return this.rateLimiter.schedule(async () => {
      return super.fetch();
    });
  }
}

// ========================================
// 5. Usage Example
// ========================================

async function example() {
  console.log('\n=== Usage Example ===');
  
  try {
    // Create rate-limited geocoder
    const geocoder = new RateLimitedReverseGeocoder(
      -23.550520, // São Paulo latitude
      -46.633309, // São Paulo longitude
      limiters.nominatim
    );
    
    // Fetch address with rate limiting
    console.log('Fetching address...');
    const address = await geocoder.fetch();
    console.log('Address:', address.display_name);
    
    // Check rate limiter stats
    const stats = limiters.nominatim.getStats();
    console.log('\nRate Limiter Statistics:');
    console.log('- Total requests:', stats.totalRequests);
    console.log('- Queued requests:', stats.queuedRequests);
    console.log('- Current tokens:', stats.currentTokens);
    console.log('- Average wait time:', stats.averageWaitTime.toFixed(2), 'ms');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ========================================
// 6. Multiple Concurrent Requests Example
// ========================================

async function multipleRequestsExample() {
  console.log('\n=== Multiple Requests Example ===');
  
  const locations = [
    { lat: -23.550520, lon: -46.633309, name: 'São Paulo' },
    { lat: -22.906847, lon: -43.172897, name: 'Rio de Janeiro' },
    { lat: -19.916681, lon: -43.934493, name: 'Belo Horizonte' }
  ];
  
  console.log(`Fetching ${locations.length} addresses with rate limiting...`);
  
  const promises = locations.map(loc => {
    const geocoder = new RateLimitedReverseGeocoder(
      loc.lat,
      loc.lon,
      limiters.nominatim
    );
    return geocoder.fetch().then(data => ({
      location: loc.name,
      address: data.display_name
    }));
  });
  
  try {
    const results = await Promise.all(promises);
    results.forEach(result => {
      console.log(`${result.location}:`, result.address);
    });
    
    // Show final stats
    const stats = limiters.nominatim.getStats();
    console.log('\nFinal Statistics:');
    console.log('- Total requests:', stats.totalRequests);
    console.log('- Queued:', stats.queuedRequests);
    console.log('- Rejected:', stats.rejectedRequests);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ========================================
// Run Examples (Node.js only)
// ========================================

if (typeof process !== 'undefined' && process.argv[1] === new URL(import.meta.url).pathname) {
  console.log('Guia Turístico - Security Features Integration Example\n');
  
  // Only run the first example to avoid API rate limits
  example().catch(console.error);
  
  // Uncomment to run multiple requests example:
  // multipleRequestsExample().catch(console.error);
}

export { RateLimitedReverseGeocoder };
