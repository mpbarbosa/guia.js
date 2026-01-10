/**
 * Unit tests for LRUCache class.
 * 
 * Tests the core caching functionality including:
 * - LRU (Least Recently Used) eviction
 * - Time-based expiration
 * - Get/set operations
 * - Cache size management
 * 
 * @since 0.8.7-alpha
 * @author Marcelo Pereira Barbosa
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import LRUCache from '../../src/data/LRUCache.js';

describe('LRUCache', () => {
	let cache;

	beforeEach(() => {
		// Create cache with small size for testing
		cache = new LRUCache(3, 1000); // 3 entries, 1 second expiration
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('Constructor', () => {
		test('should initialize with default values', () => {
			const defaultCache = new LRUCache();
			expect(defaultCache.size).toBe(0);
			expect(defaultCache.maxSize).toBe(50);
			expect(defaultCache.expirationMs).toBe(300000);
		});

		test('should initialize with custom values', () => {
			const customCache = new LRUCache(10, 5000);
			expect(customCache.maxSize).toBe(10);
			expect(customCache.expirationMs).toBe(5000);
		});
	});

	describe('Basic Operations', () => {
		test('should store and retrieve values', () => {
			cache.set('key1', 'value1');
			expect(cache.get('key1')).toBe('value1');
		});

		test('should return null for non-existent keys', () => {
			expect(cache.get('nonexistent')).toBeNull();
		});

		test('should track cache size', () => {
			expect(cache.size).toBe(0);
			cache.set('key1', 'value1');
			expect(cache.size).toBe(1);
			cache.set('key2', 'value2');
			expect(cache.size).toBe(2);
		});

		test('should clear all entries', () => {
			cache.set('key1', 'value1');
			cache.set('key2', 'value2');
			expect(cache.size).toBe(2);
			
			cache.clear();
			expect(cache.size).toBe(0);
			expect(cache.get('key1')).toBeNull();
		});

		test('should check key existence', () => {
			cache.set('key1', 'value1');
			expect(cache.has('key1')).toBe(true);
			expect(cache.has('key2')).toBe(false);
		});
	});

	describe('LRU Eviction', () => {
		test('should evict least recently used entry when full', () => {
			// Fill cache to max (3 entries)
			cache.set('key1', 'value1');
			cache.set('key2', 'value2');
			cache.set('key3', 'value3');
			expect(cache.size).toBe(3);

			// Add 4th entry should evict key1 (least recent)
			cache.set('key4', 'value4');
			expect(cache.size).toBe(3);
			expect(cache.get('key1')).toBeNull(); // Evicted
			expect(cache.get('key2')).toBe('value2');
			expect(cache.get('key3')).toBe('value3');
			expect(cache.get('key4')).toBe('value4');
		});

		test('should update LRU order when accessing entries', () => {
			cache.set('key1', 'value1');
			cache.set('key2', 'value2');
			cache.set('key3', 'value3');

			// Access key1 to make it most recent
			cache.get('key1');

			// Add 4th entry should evict key2 (now least recent)
			cache.set('key4', 'value4');
			expect(cache.get('key1')).toBe('value1'); // Still exists
			expect(cache.get('key2')).toBeNull();      // Evicted
			expect(cache.get('key3')).toBe('value3');
			expect(cache.get('key4')).toBe('value4');
		});
	});

	describe('Expiration', () => {
		test('should expire entries after expiration time', () => {
			cache.set('key1', 'value1');
			expect(cache.get('key1')).toBe('value1');

			// Advance time past expiration (1 second + buffer)
			jest.advanceTimersByTime(1500);

			// Entry should be expired and removed
			expect(cache.get('key1')).toBeNull();
			expect(cache.size).toBe(0);
		});

		test('should not expire entries before expiration time', () => {
			cache.set('key1', 'value1');
			
			// Advance time but not past expiration
			jest.advanceTimersByTime(500);

			// Entry should still exist
			expect(cache.get('key1')).toBe('value1');
		});

		test('should clean expired entries manually', () => {
			cache.set('key1', 'value1');
			cache.set('key2', 'value2');
			expect(cache.size).toBe(2);

			// Advance time past expiration
			jest.advanceTimersByTime(1500);

			// Clean expired entries
			const removed = cache.cleanExpired();
			expect(removed).toBe(2);
			expect(cache.size).toBe(0);
		});

		test('should only clean expired entries', () => {
			cache.set('key1', 'value1');
			
			// Advance time partially
			jest.advanceTimersByTime(500);
			
			// Add new entry (won't be expired)
			cache.set('key2', 'value2');
			
			// Advance time to expire first entry only
			jest.advanceTimersByTime(600);

			// Clean should remove only key1
			const removed = cache.cleanExpired();
			expect(removed).toBe(1);
			expect(cache.size).toBe(1);
			expect(cache.get('key1')).toBeNull();
			expect(cache.get('key2')).toBe('value2');
		});
	});

	describe('Complex Scenarios', () => {
		test('should handle multiple sets to same key', () => {
			cache.set('key1', 'value1');
			cache.set('key1', 'value2');
			expect(cache.get('key1')).toBe('value2');
			expect(cache.size).toBe(1);
		});

		test('should handle object values', () => {
			const obj1 = { name: 'Alice', age: 30 };
			const obj2 = { name: 'Bob', age: 25 };
			
			cache.set('user1', obj1);
			cache.set('user2', obj2);
			
			expect(cache.get('user1')).toEqual(obj1);
			expect(cache.get('user2')).toEqual(obj2);
		});

		test('should have correct toString representation', () => {
			cache.set('key1', 'value1');
			const str = cache.toString();
			
			expect(str).toContain('LRUCache');
			expect(str).toContain('size=1');
			expect(str).toContain('expiration=1000ms');
		});
	});

	describe('Edge Cases', () => {
		test('should handle cache size of 1', () => {
			const tinyCache = new LRUCache(1, 1000);
			tinyCache.set('key1', 'value1');
			expect(tinyCache.size).toBe(1);

			// Adding second entry should evict first
			tinyCache.set('key2', 'value2');
			expect(tinyCache.size).toBe(1);
			expect(tinyCache.get('key1')).toBeNull();
			expect(tinyCache.get('key2')).toBe('value2');
		});

		test('should handle zero expiration time', () => {
			const instantCache = new LRUCache(3, 0);
			instantCache.set('key1', 'value1');
			
			// Any time advancement should expire
			jest.advanceTimersByTime(1);
			expect(instantCache.get('key1')).toBeNull();
		});

		test('should handle empty cache operations', () => {
			expect(cache.size).toBe(0);
			expect(cache.cleanExpired()).toBe(0);
			cache.clear();
			expect(cache.size).toBe(0);
		});
	});
});
