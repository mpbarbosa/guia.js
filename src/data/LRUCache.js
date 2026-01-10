'use strict';

/**
 * LRU (Least Recently Used) cache with time-based expiration.
 * 
 * A generic, reusable cache implementation that:
 * - Stores key-value pairs with automatic LRU eviction
 * - Expires entries after a configurable time period
 * - Tracks access times for proper LRU ordering
 * - Provides O(1) get/set operations using Map
 * 
 * This class is a pure data structure with no business logic dependencies,
 * making it reusable across the application for any caching needs.
 * 
 * **Usage**:
 * ```javascript
 * const cache = new LRUCache(50, 300000); // 50 items, 5 min expiration
 * 
 * // Store value
 * cache.set('user:123', { name: 'John', age: 30 });
 * 
 * // Retrieve value (updates access time)
 * const user = cache.get('user:123'); // { name: 'John', age: 30 }
 * 
 * // Clean up expired entries
 * cache.cleanExpired();
 * ```
 * 
 * @class LRUCache
 * @since 0.8.7-alpha
 * @author Marcelo Pereira Barbosa (extracted from AddressCache)
 */
class LRUCache {
	/**
	 * Creates a new LRU cache instance.
	 * 
	 * @param {number} [maxSize=50] - Maximum number of entries before eviction
	 * @param {number} [expirationMs=300000] - Time in ms before entries expire (default: 5 minutes)
	 * 
	 * @example
	 * // Default configuration (50 entries, 5 minutes)
	 * const cache = new LRUCache();
	 * 
	 * @example
	 * // Custom configuration
	 * const cache = new LRUCache(100, 600000); // 100 entries, 10 minutes
	 */
	constructor(maxSize = 50, expirationMs = 300000) {
		this.cache = new Map();
		this.maxSize = maxSize;
		this.expirationMs = expirationMs;
	}

	/**
	 * Retrieves a value from the cache by key.
	 * 
	 * If the entry exists and hasn't expired, updates its access time for LRU
	 * tracking and returns the value. If expired, removes the entry and returns null.
	 * 
	 * **Complexity**: O(1) for retrieval, O(1) for LRU update
	 * 
	 * @param {string} key - Cache key to retrieve
	 * @returns {*|null} The cached value, or null if not found or expired
	 * 
	 * @example
	 * cache.set('key1', { data: 'value' });
	 * const value = cache.get('key1'); // { data: 'value' }
	 * 
	 * // After expiration period
	 * const expired = cache.get('key1'); // null (entry removed)
	 */
	get(key) {
		const entry = this.cache.get(key);
		if (!entry) {
			return null;
		}

		// Check if entry has expired
		const now = Date.now();
		if (now - entry.timestamp > this.expirationMs) {
			this.cache.delete(key);
			return null;
		}

		// Update access time for LRU tracking
		entry.lastAccessed = now;

		// Move to end of Map to maintain LRU order (most recent)
		// Map maintains insertion order, so delete + re-insert moves to end
		this.cache.delete(key);
		this.cache.set(key, entry);

		return entry.value;
	}

	/**
	 * Stores a value in the cache.
	 * 
	 * If the cache is at maximum capacity, automatically evicts the least
	 * recently used entry before storing the new value. Each entry tracks
	 * both creation time (for expiration) and last access time (for LRU).
	 * 
	 * **Complexity**: O(1) average case, O(n) worst case when eviction needed
	 * 
	 * @param {string} key - Cache key
	 * @param {*} value - Value to store
	 * @returns {void}
	 * 
	 * @example
	 * cache.set('user:123', { name: 'Alice', role: 'admin' });
	 * cache.set('user:456', { name: 'Bob', role: 'user' });
	 */
	set(key, value) {
		// Evict LRU entry if cache is full
		this.evictIfNeeded();

		const now = Date.now();
		this.cache.set(key, {
			value,
			timestamp: now,        // For expiration checking
			lastAccessed: now      // For LRU tracking
		});
	}

	/**
	 * Evicts the least recently used entry if cache is at maximum capacity.
	 * 
	 * Uses Map's iteration order (insertion order) where the first entry
	 * is the least recently accessed. This works because get() moves accessed
	 * entries to the end.
	 * 
	 * **Complexity**: O(1) - removes first entry from Map
	 * 
	 * @private
	 * @returns {void}
	 */
	evictIfNeeded() {
		if (this.cache.size >= this.maxSize) {
			// First entry in Map is least recently accessed
			const firstKey = this.cache.keys().next().value;
			if (firstKey !== undefined) {
				this.cache.delete(firstKey);
			}
		}
	}

	/**
	 * Removes all expired entries from the cache.
	 * 
	 * Iterates through all entries and removes those that have exceeded
	 * the expiration time. This method should be called periodically to
	 * free up memory from expired entries.
	 * 
	 * **Complexity**: O(n) where n is the number of cache entries
	 * 
	 * @returns {number} Number of entries removed
	 * 
	 * @example
	 * // Periodic cleanup (e.g., every 60 seconds)
	 * setInterval(() => {
	 *   const removed = cache.cleanExpired();
	 *   console.log(`Cleaned up ${removed} expired entries`);
	 * }, 60000);
	 */
	cleanExpired() {
		const now = Date.now();
		let removed = 0;

		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > this.expirationMs) {
				this.cache.delete(key);
				removed++;
			}
		}

		return removed;
	}

	/**
	 * Removes all entries from the cache.
	 * 
	 * **Complexity**: O(1)
	 * 
	 * @returns {void}
	 * 
	 * @example
	 * cache.clear();
	 * console.log(cache.size); // 0
	 */
	clear() {
		this.cache.clear();
	}

	/**
	 * Gets the current number of entries in the cache.
	 * 
	 * @returns {number} Number of cached entries
	 * 
	 * @example
	 * console.log(`Cache contains ${cache.size} entries`);
	 */
	get size() {
		return this.cache.size;
	}

	/**
	 * Checks if a key exists in the cache (without updating access time).
	 * 
	 * Unlike get(), this method doesn't update LRU tracking or check expiration.
	 * Use this for existence checks without affecting cache behavior.
	 * 
	 * @param {string} key - Key to check
	 * @returns {boolean} True if key exists, false otherwise
	 * 
	 * @example
	 * if (cache.has('user:123')) {
	 *   console.log('User is cached');
	 * }
	 */
	has(key) {
		return this.cache.has(key);
	}

	/**
	 * Returns a string representation of the cache state.
	 * 
	 * Useful for debugging and logging. Shows current size, max size,
	 * and expiration period.
	 * 
	 * @returns {string} String representation of cache
	 * 
	 * @example
	 * console.log(cache.toString());
	 * // "LRUCache: size=25/50, expiration=300000ms"
	 */
	toString() {
		return `${this.constructor.name}: size=${this.size}/${this.maxSize}, expiration=${this.expirationMs}ms`;
	}
}

export default LRUCache;
