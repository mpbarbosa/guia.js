import { log, warn } from './logger.js';

/**
 * Token bucket rate limiter.
 * 
 * Uses token bucket algorithm to limit request rate:
 * - Tokens refill at constant rate (maxRequests per refillInterval)
 * - Each request consumes one token
 * - Requests are queued when no tokens available
 * - Queue has maximum size to prevent memory issues
 */
class RateLimiter {
  maxRequests: number;
  interval: number;
  maxQueueSize: number;
  name: string;
  tokens: number;
  lastRefill: number;
  queue: Array<{ fn: () => unknown; resolve: () => void; reject: (err: unknown) => void; timestamp: number }>;
  stats: { totalRequests: number; queuedRequests: number; rejectedRequests: number; averageWaitTime: number };

  /**
   * Create a new rate limiter.
   * 
   * @param {Object} options - Configuration options
   * @param {number} options.maxRequests - Maximum requests allowed per interval
   * @param {number} options.interval - Time interval in milliseconds (default: 60000 = 1 minute)
   * @param {number} options.maxQueueSize - Maximum queued requests (default: 100)
   * @param {string} options.name - Identifier for logging
   */
  constructor({ maxRequests, interval = 60000, maxQueueSize = 100, name = 'API' }: { maxRequests: number; interval?: number; maxQueueSize?: number; name?: string }) {
    this.maxRequests = maxRequests;
    this.interval = interval;
    this.maxQueueSize = maxQueueSize;
    this.name = name;
    
    // Token bucket state
    this.tokens = maxRequests;
    this.lastRefill = Date.now();
    
    // Request queue
    this.queue = [];
    
    // Statistics
    this.stats = {
      totalRequests: 0,
      queuedRequests: 0,
      rejectedRequests: 0,
      averageWaitTime: 0
    };
    
    log(`Rate limiter created: ${this.name} (${this.maxRequests} req/${this.interval}ms)`);
  }
  
  /**
   * Refill tokens based on elapsed time.
   * @private
   */
  _refillTokens() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    
    // Calculate tokens to add based on elapsed time
    const tokensToAdd = (elapsed / this.interval) * this.maxRequests;
    
    if (tokensToAdd >= 1) {
      this.tokens = Math.min(this.maxRequests, this.tokens + Math.floor(tokensToAdd));
      this.lastRefill = now;
    }
  }
  
  /**
   * Process queued requests when tokens become available.
   * @private
   */
  _processQueue() {
    while (this.queue.length > 0 && this.tokens > 0) {
      const request = this.queue.shift();
      if (!request) break;
      this.tokens--;
      
      const waitTime = Date.now() - request.timestamp;
      this.stats.averageWaitTime = 
        (this.stats.averageWaitTime * this.stats.queuedRequests + waitTime) / 
        (this.stats.queuedRequests + 1);
      
      request.resolve();
    }
  }
  
  /**
   * Schedule a request with rate limiting.
   * 
   * @param {Function} fn - Async function to execute
   * @returns {Promise<*>} Promise that resolves with function result
   * @throws {Error} If queue is full
   * 
   * @example
   * const limiter = new RateLimiter({ maxRequests: 60, interval: 60000 });
   * const result = await limiter.schedule(async () => {
   *   const response = await fetch('https://api.example.com');
   *   return response.json();
   * });
   */
  async schedule(fn: () => unknown): Promise<unknown> {
    this._refillTokens();
    this.stats.totalRequests++;
    
    // If tokens available, execute immediately
    if (this.tokens > 0) {
      this.tokens--;
      return fn();
    }
    
    // Otherwise, queue the request
    if (this.queue.length >= this.maxQueueSize) {
      this.stats.rejectedRequests++;
      throw new Error(`Rate limiter queue full for ${this.name} (max: ${this.maxQueueSize})`);
    }
    
    this.stats.queuedRequests++;
    warn(`Request queued for ${this.name} (queue size: ${this.queue.length + 1})`);
    
    // Return promise that resolves when token becomes available
    return new Promise((resolve, reject) => {
      const request = {
        fn,
        resolve: async () => {
          try {
            const result = await fn();
            resolve(result);
          } catch (err) {
            reject(err);
          }
        },
        reject,
        timestamp: Date.now()
      };
      
      this.queue.push(request);
      
      // Schedule queue processing
      const timeUntilRefill = this.interval - (Date.now() - this.lastRefill);
      setTimeout(() => {
        this._refillTokens();
        this._processQueue();
      }, timeUntilRefill);
    });
  }
  
  /**
   * Get current rate limiter statistics.
   * 
   * @returns {Object} Statistics object
   */
  getStats(): Record<string, number> {
    return {
      ...this.stats,
      currentTokens: this.tokens,
      queueLength: this.queue.length,
      utilizationRate: (this.stats.totalRequests / (this.maxRequests * Math.ceil(Date.now() - this.lastRefill / this.interval))) * 100
    };
  }
  
  /**
   * Reset rate limiter state.
   */
  reset(): void {
    this.tokens = this.maxRequests;
    this.lastRefill = Date.now();
    this.queue = [];
    this.stats = {
      totalRequests: 0,
      queuedRequests: 0,
      rejectedRequests: 0,
      averageWaitTime: 0
    };
    log(`Rate limiter reset: ${this.name}`);
  }
}

/**
 * Create pre-configured rate limiters for common APIs.
 */
export function createDefaultLimiters(): { nominatim: RateLimiter; ibge: RateLimiter } {
  return {
    nominatim: new RateLimiter({
      maxRequests: 60, // 1 request per second
      interval: 60000,
      name: 'Nominatim'
    }),
    ibge: new RateLimiter({
      maxRequests: 120, // 2 requests per second
      interval: 60000,
      name: 'IBGE'
    })
  };
}

export default RateLimiter;
