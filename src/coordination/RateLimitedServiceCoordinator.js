'use strict';

/**
 * Rate-limited service coordinator for API requests.
 * 
 * Provides centralized rate limiting for all API services (Nominatim, IBGE, etc.)
 * with automatic request scheduling and queue management.
 * 
 * @module coordination/RateLimitedServiceCoordinator
 * @since 0.11.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import RateLimiter from '../utils/rate-limiter.js';
import { env } from '../config/environment.js';
import { log, warn } from '../utils/logger.js';

/**
 * Singleton coordinator for rate-limited API services.
 */
class RateLimitedServiceCoordinator {
  constructor() {
    if (RateLimitedServiceCoordinator.instance) {
      return RateLimitedServiceCoordinator.instance;
    }
    
    // Initialize rate limiters based on environment configuration
    this.limiters = {
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
    
    log('Rate-limited service coordinator initialized');
    log('- Nominatim:', env.rateLimitNominatim, 'req/min');
    log('- IBGE:', env.rateLimitIbge, 'req/min');
    
    RateLimitedServiceCoordinator.instance = this;
  }
  
  /**
   * Get singleton instance.
   * @returns {RateLimitedServiceCoordinator} Singleton instance
   */
  static getInstance() {
    if (!RateLimitedServiceCoordinator.instance) {
      RateLimitedServiceCoordinator.instance = new RateLimitedServiceCoordinator();
    }
    return RateLimitedServiceCoordinator.instance;
  }
  
  /**
   * Schedule a Nominatim API request with rate limiting.
   * 
   * @param {Function} fn - Async function that performs the API call
   * @returns {Promise<*>} Result of the API call
   * 
   * @example
   * const data = await coordinator.scheduleNominatim(async () => {
   *   const response = await fetch(url);
   *   return response.json();
   * });
   */
  async scheduleNominatim(fn) {
    return this.limiters.nominatim.schedule(fn);
  }
  
  /**
   * Schedule an IBGE API request with rate limiting.
   * 
   * @param {Function} fn - Async function that performs the API call
   * @returns {Promise<*>} Result of the API call
   * 
   * @example
   * const data = await coordinator.scheduleIbge(async () => {
   *   const response = await fetch(url);
   *   return response.json();
   * });
   */
  async scheduleIbge(fn) {
    return this.limiters.ibge.schedule(fn);
  }
  
  /**
   * Get statistics for all rate limiters.
   * 
   * @returns {Object} Statistics for each API
   */
  getStats() {
    return {
      nominatim: this.limiters.nominatim.getStats(),
      ibge: this.limiters.ibge.getStats()
    };
  }
  
  /**
   * Get statistics for a specific API.
   * 
   * @param {string} api - API name ('nominatim' or 'ibge')
   * @returns {Object|null} Statistics or null if API not found
   */
  getStatsForAPI(api) {
    return this.limiters[api]?.getStats() || null;
  }
  
  /**
   * Log statistics for all APIs.
   */
  logStats() {
    const stats = this.getStats();
    
    log('\n=== Rate Limiter Statistics ===');
    Object.entries(stats).forEach(([api, apiStats]) => {
      log(`\n${api.toUpperCase()}:`);
      log('  Total requests:', apiStats.totalRequests);
      log('  Queued requests:', apiStats.queuedRequests);
      log('  Rejected requests:', apiStats.rejectedRequests);
      log('  Current tokens:', apiStats.currentTokens);
      log('  Queue length:', apiStats.queueLength);
      log('  Average wait time:', apiStats.averageWaitTime.toFixed(2), 'ms');
      log('  Utilization rate:', apiStats.utilizationRate.toFixed(2), '%');
    });
    log('================================\n');
  }
  
  /**
   * Reset all rate limiters.
   */
  resetAll() {
    Object.values(this.limiters).forEach(limiter => limiter.reset());
    log('All rate limiters reset');
  }
  
  /**
   * Reset a specific rate limiter.
   * 
   * @param {string} api - API name ('nominatim' or 'ibge')
   */
  reset(api) {
    if (this.limiters[api]) {
      this.limiters[api].reset();
      log(`Rate limiter reset: ${api}`);
    } else {
      warn(`Unknown API: ${api}`);
    }
  }
}

// Create and export singleton instance
const coordinator = RateLimitedServiceCoordinator.getInstance();

export default coordinator;
export { RateLimitedServiceCoordinator };
