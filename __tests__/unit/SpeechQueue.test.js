/**
 * Unit tests for SpeechQueue class
 * 
 * This test suite provides comprehensive coverage of the SpeechQueue class,
 * including priority ordering, observer pattern integration, expiration management,
 * parameter validation, edge cases, and memory management scenarios.
 * 
 * @fileoverview SpeechQueue unit tests
 * @author Marcelo Pereira Barbosa
 * @since 0.8.3-alpha
 */

import SpeechQueue from '../../src/speech/SpeechQueue.js';
import SpeechItem from '../../src/speech/SpeechItem.js';

// Mock ObserverSubject for testing
class MockObserverSubject {
	constructor() {
		this.observers = [];
		this.functionObservers = [];
	}

	subscribe(observer) {
		if (!this.observers.includes(observer)) {
			this.observers.push(observer);
		}
	}

	unsubscribe(observer) {
		const index = this.observers.indexOf(observer);
		if (index > -1) {
			this.observers.splice(index, 1);
		}
	}

	subscribeFunction(fn) {
		if (!this.functionObservers.includes(fn)) {
			this.functionObservers.push(fn);
		}
	}

	unsubscribeFunction(fn) {
		const index = this.functionObservers.indexOf(fn);
		if (index > -1) {
			this.functionObservers.splice(index, 1);
		}
	}

	notifyObservers(data) {
		this.observers.forEach(observer => {
			if (observer && typeof observer.update === 'function') {
				observer.update(data);
			}
		});
	}
}

// Mock ObserverSubject module for import (ES modules compatible)
import { jest } from '@jest/globals';

// Use dynamic import for mocking
jest.unstable_mockModule('../../src/core/ObserverSubject.js', () => ({
	default: jest.fn().mockImplementation(() => new MockObserverSubject())
}));

describe('SpeechQueue', () => {
	let queue;
	let mockObserver;
	let mockObserverFunction;

	beforeEach(() => {
		// Create fresh queue for each test
		queue = new SpeechQueue();
		
		// Create mock observers
		mockObserver = {
			update: jest.fn()
		};
		
		mockObserverFunction = jest.fn();
		
		// Clear all mocks
		jest.clearAllMocks();
	});

	describe('Constructor', () => {
		test('should create queue with default parameters', () => {
			const defaultQueue = new SpeechQueue();
			
			expect(defaultQueue.size()).toBe(0);
			expect(defaultQueue.isEmpty()).toBe(true);
		});

		test('should create queue with custom parameters', () => {
			const customQueue = new SpeechQueue(50, 60000);
			
			expect(customQueue.size()).toBe(0);
			expect(customQueue.isEmpty()).toBe(true);
		});

		test('should validate maxSize parameter', () => {
			// Invalid types
			expect(() => new SpeechQueue('invalid')).toThrow(RangeError);
			expect(() => new SpeechQueue(null)).toThrow(RangeError);
			expect(() => new SpeechQueue(undefined)).toThrow(RangeError);
			
			// Invalid ranges
			expect(() => new SpeechQueue(0)).toThrow(RangeError);
			expect(() => new SpeechQueue(-1)).toThrow(RangeError);
			expect(() => new SpeechQueue(1001)).toThrow(RangeError);
			
			// Valid ranges
			expect(() => new SpeechQueue(1)).not.toThrow();
			expect(() => new SpeechQueue(100)).not.toThrow();
			expect(() => new SpeechQueue(1000)).not.toThrow();
		});

		test('should validate expirationMs parameter', () => {
			// Invalid types
			expect(() => new SpeechQueue(100, 'invalid')).toThrow(RangeError);
			expect(() => new SpeechQueue(100, null)).toThrow(RangeError);
			
			// Invalid ranges
			expect(() => new SpeechQueue(100, 999)).toThrow(RangeError);
			expect(() => new SpeechQueue(100, 300001)).toThrow(RangeError);
			
			// Valid ranges
			expect(() => new SpeechQueue(100, 1000)).not.toThrow();
			expect(() => new SpeechQueue(100, 30000)).not.toThrow();
			expect(() => new SpeechQueue(100, 300000)).not.toThrow();
		});

		test('should freeze the instance to prevent modification', () => {
			expect(Object.isFrozen(queue)).toBe(true);
		});
	});

	describe('Observer Pattern - Object Observers', () => {
		test('should subscribe observers', () => {
			queue.subscribe(mockObserver);
			
			expect(queue.observers).toContain(mockObserver);
		});

		test('should handle null observer subscription gracefully', () => {
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
			
			queue.subscribe(null);
			
			expect(consoleSpy).toHaveBeenCalledWith("(SpeechQueue) Attempted to subscribe a null observer.");
			expect(queue.observers).not.toContain(null);
			
			consoleSpy.mockRestore();
		});

		test('should validate observer has update method', () => {
			const invalidObserver = { noUpdate: true };
			
			expect(() => queue.subscribe(invalidObserver)).toThrow(TypeError);
			expect(() => queue.subscribe(invalidObserver)).toThrow('Observer must have an update() method');
		});

		test('should unsubscribe observers', () => {
			queue.subscribe(mockObserver);
			expect(queue.observers).toContain(mockObserver);
			
			queue.unsubscribe(mockObserver);
			expect(queue.observers).not.toContain(mockObserver);
		});

		test('should notify observers on state changes', () => {
			queue.subscribe(mockObserver);
			
			queue.enqueue("Test message");
			
			expect(mockObserver.update).toHaveBeenCalledWith(queue);
		});
	});

	describe('Observer Pattern - Function Observers', () => {
		test('should subscribe function observers', () => {
			queue.subscribeFunction(mockObserverFunction);
			
			expect(queue.functionObservers).toContain(mockObserverFunction);
		});

		test('should handle null function observer subscription gracefully', () => {
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
			
			queue.subscribeFunction(null);
			
			expect(consoleSpy).toHaveBeenCalledWith("(SpeechQueue) Attempted to subscribe a null observer function.");
			expect(queue.functionObservers).not.toContain(null);
			
			consoleSpy.mockRestore();
		});

		test('should validate function observer is actually a function', () => {
			const invalidFunction = "not a function";
			
			expect(() => queue.subscribeFunction(invalidFunction)).toThrow(TypeError);
			expect(() => queue.subscribeFunction(invalidFunction)).toThrow('Observer must be a function');
		});

		test('should unsubscribe function observers', () => {
			queue.subscribeFunction(mockObserverFunction);
			expect(queue.functionObservers).toContain(mockObserverFunction);
			
			queue.unsubscribeFunction(mockObserverFunction);
			expect(queue.functionObservers).not.toContain(mockObserverFunction);
		});

		test('should handle null function observer unsubscription gracefully', () => {
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
			
			queue.unsubscribeFunction(null);
			
			expect(consoleSpy).toHaveBeenCalledWith("(SpeechQueue) Attempted to unsubscribe a null observer function.");
			
			consoleSpy.mockRestore();
		});

		test('should notify function observers on state changes', () => {
			queue.subscribeFunction(mockObserverFunction);
			
			queue.enqueue("Test message");
			
			expect(mockObserverFunction).toHaveBeenCalledWith(queue);
		});

		test('should handle errors in function observers gracefully', () => {
			const errorObserver = jest.fn(() => { throw new Error('Observer error'); });
			const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
			
			queue.subscribeFunction(errorObserver);
			queue.enqueue("Test message");
			
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"(SpeechQueue) Error in function observer:", 
				expect.any(Error)
			);
			
			consoleErrorSpy.mockRestore();
		});
	});

	describe('Enqueue Operations', () => {
		test('should enqueue item with default priority', () => {
			queue.enqueue("Hello world");
			
			expect(queue.size()).toBe(1);
			expect(queue.isEmpty()).toBe(false);
		});

		test('should enqueue item with custom priority', () => {
			queue.enqueue("High priority message", 5);
			
			expect(queue.size()).toBe(1);
		});

		test('should validate text parameter', () => {
			// Invalid types
			expect(() => queue.enqueue(123)).toThrow(TypeError);
			expect(() => queue.enqueue(null)).toThrow(TypeError);
			expect(() => queue.enqueue(undefined)).toThrow(TypeError);
			expect(() => queue.enqueue({})).toThrow(TypeError);
			
			// Empty or whitespace strings
			expect(() => queue.enqueue("")).toThrow(Error);
			expect(() => queue.enqueue("   ")).toThrow(Error);
			expect(() => queue.enqueue("\t\n")).toThrow(Error);
		});

		test('should validate priority parameter', () => {
			// Invalid types
			expect(() => queue.enqueue("Test", "invalid")).toThrow(TypeError);
			expect(() => queue.enqueue("Test", null)).toThrow(TypeError);
			expect(() => queue.enqueue("Test", {})).toThrow(TypeError);
			
			// Invalid numbers
			expect(() => queue.enqueue("Test", Infinity)).toThrow(TypeError);
			expect(() => queue.enqueue("Test", -Infinity)).toThrow(TypeError);
			expect(() => queue.enqueue("Test", NaN)).toThrow(TypeError);
		});

		test('should maintain priority ordering', () => {
			// Add items in mixed priority order
			queue.enqueue("Low priority", -1);
			queue.enqueue("High priority", 5);
			queue.enqueue("Medium priority", 2);
			queue.enqueue("Normal priority", 0);
			
			// Dequeue should return highest priority first
			expect(queue.dequeue().priority).toBe(5);
			expect(queue.dequeue().priority).toBe(2);
			expect(queue.dequeue().priority).toBe(0);
			expect(queue.dequeue().priority).toBe(-1);
		});

		test('should maintain insertion order for equal priorities', () => {
			queue.enqueue("First message", 1);
			queue.enqueue("Second message", 1);
			queue.enqueue("Third message", 1);
			
			expect(queue.dequeue().text).toBe("First message");
			expect(queue.dequeue().text).toBe("Second message");
			expect(queue.dequeue().text).toBe("Third message");
		});

		test('should enforce maximum size limit', () => {
			const smallQueue = new SpeechQueue(3, 30000);
			
			// Add more items than the limit
			smallQueue.enqueue("Item 1", 1);
			smallQueue.enqueue("Item 2", 2);
			smallQueue.enqueue("Item 3", 3);
			smallQueue.enqueue("Item 4", 4); // This should cause overflow
			
			expect(smallQueue.size()).toBe(3);
			
			// Should keep highest priority items
			expect(smallQueue.dequeue().priority).toBe(4);
			expect(smallQueue.dequeue().priority).toBe(3);
			expect(smallQueue.dequeue().priority).toBe(2);
		});

		test('should accept Brazilian Portuguese text', () => {
			const brazilianTexts = [
				"Bem-vindo ao Rio de Janeiro",
				"Você está em São Paulo",
				"Próxima parada: Copacabana",
				"Atenção: mudança de itinerário"
			];
			
			brazilianTexts.forEach(text => {
				expect(() => queue.enqueue(text)).not.toThrow();
			});
			
			expect(queue.size()).toBe(4);
		});
	});

	describe('Dequeue Operations', () => {
		test('should return null when queue is empty', () => {
			expect(queue.dequeue()).toBeNull();
		});

		test('should return highest priority item', () => {
			queue.enqueue("Low", 1);
			queue.enqueue("High", 5);
			queue.enqueue("Medium", 3);
			
			const item = queue.dequeue();
			expect(item.priority).toBe(5);
			expect(item.text).toBe("High");
		});

		test('should reduce queue size after dequeue', () => {
			queue.enqueue("Test message");
			expect(queue.size()).toBe(1);
			
			queue.dequeue();
			expect(queue.size()).toBe(0);
		});

		test('should return SpeechItem instances', () => {
			queue.enqueue("Test message");
			
			const item = queue.dequeue();
			expect(item).toBeInstanceOf(SpeechItem);
		});
	});

	describe('Queue State Management', () => {
		test('isEmpty should return true for empty queue', () => {
			expect(queue.isEmpty()).toBe(true);
		});

		test('isEmpty should return false for non-empty queue', () => {
			queue.enqueue("Test message");
			expect(queue.isEmpty()).toBe(false);
		});

		test('size should return correct count', () => {
			expect(queue.size()).toBe(0);
			
			queue.enqueue("Message 1");
			expect(queue.size()).toBe(1);
			
			queue.enqueue("Message 2");
			expect(queue.size()).toBe(2);
			
			queue.dequeue();
			expect(queue.size()).toBe(1);
		});

		test('clear should remove all items', () => {
			queue.enqueue("Message 1");
			queue.enqueue("Message 2");
			queue.enqueue("Message 3");
			
			expect(queue.size()).toBe(3);
			
			queue.clear();
			
			expect(queue.size()).toBe(0);
			expect(queue.isEmpty()).toBe(true);
		});

		test('clear should notify observers', () => {
			queue.subscribe(mockObserver);
			queue.subscribeFunction(mockObserverFunction);
			
			queue.clear();
			
			expect(mockObserver.update).toHaveBeenCalledWith(queue);
			expect(mockObserverFunction).toHaveBeenCalledWith(queue);
		});
	});

	describe('Expiration Management', () => {
		test('should remove expired items automatically', async () => {
			const shortQueue = new SpeechQueue(100, 1000); // 1 second expiration
			
			shortQueue.enqueue("Old message");
			expect(shortQueue.size()).toBe(1);
			
			// Wait for expiration
			await new Promise(resolve => setTimeout(resolve, 1100));
			
			// Next operation should clean expired items
			expect(shortQueue.size()).toBe(0);
		});

		test('should log expired item removal', async () => {
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
			const shortQueue = new SpeechQueue(100, 1000);
			
			shortQueue.enqueue("Expiring message");
			
			// Wait for expiration
			await new Promise(resolve => setTimeout(resolve, 1100));
			
			// Trigger cleanup
			shortQueue.size();
			
			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("(SpeechQueue) Removed 1 expired items")
			);
			
			consoleSpy.mockRestore();
		});

		test('should not log when no items are expired', () => {
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
			
			queue.enqueue("Fresh message");
			queue.size(); // Trigger cleanup
			
			expect(consoleSpy).not.toHaveBeenCalledWith(
				expect.stringContaining("(SpeechQueue) Removed")
			);
			
			consoleSpy.mockRestore();
		});
	});

	describe('Utility Methods', () => {
		test('toString should return descriptive string', () => {
			const result = queue.toString();
			
			expect(result).toContain('SpeechQueue');
			expect(result).toContain('size=0');
			expect(result).toContain('maxSize=100');
			expect(result).toContain('expirationMs=30000');
		});

		test('toString should reflect current queue state', () => {
			queue.enqueue("Test message");
			
			const result = queue.toString();
			expect(result).toContain('size=1');
		});

		test('getItems should return read-only copy of items', () => {
			queue.enqueue("First", 1);
			queue.enqueue("Second", 2);
			
			const items = queue.getItems();
			
			expect(items).toHaveLength(2);
			expect(items[0]).toBeInstanceOf(SpeechItem);
			expect(items[1]).toBeInstanceOf(SpeechItem);
			
			// Should be a copy, not the original array
			expect(items).not.toBe(queue.items);
		});

		test('getItems should return items in priority order', () => {
			queue.enqueue("Low", 1);
			queue.enqueue("High", 5);
			queue.enqueue("Medium", 3);
			
			const items = queue.getItems();
			
			expect(items[0].priority).toBe(5);
			expect(items[1].priority).toBe(3);
			expect(items[2].priority).toBe(1);
		});

		test('getItems should clean expired items before returning', async () => {
			const shortQueue = new SpeechQueue(100, 1000);
			
			shortQueue.enqueue("Will expire");
			expect(shortQueue.getItems()).toHaveLength(1);
			
			// Wait for expiration
			await new Promise(resolve => setTimeout(resolve, 1100));
			
			expect(shortQueue.getItems()).toHaveLength(0);
		});
	});

	describe('Memory Management', () => {
		test('should handle large number of items efficiently', () => {
			const largeQueue = new SpeechQueue(1000, 30000);
			
			// Add many items
			for (let i = 0; i < 500; i++) {
				largeQueue.enqueue(`Message ${i}`, Math.floor(Math.random() * 10));
			}
			
			expect(largeQueue.size()).toBe(500);
			
			// Should be able to process all items
			let processedCount = 0;
			while (!largeQueue.isEmpty()) {
				largeQueue.dequeue();
				processedCount++;
			}
			
			expect(processedCount).toBe(500);
		});

		test('should enforce size limits to prevent memory overflow', () => {
			const limitedQueue = new SpeechQueue(10, 30000);
			
			// Add more items than the limit
			for (let i = 0; i < 20; i++) {
				limitedQueue.enqueue(`Message ${i}`, i);
			}
			
			// Should only keep the maximum allowed items
			expect(limitedQueue.size()).toBe(10);
			
			// Should keep the highest priority items
			const firstItem = limitedQueue.dequeue();
			expect(firstItem.priority).toBe(19); // Highest priority added
		});
	});

	describe('Edge Cases', () => {
		test('should handle rapid enqueue/dequeue operations', () => {
			// Rapid operations
			for (let i = 0; i < 100; i++) {
				queue.enqueue(`Message ${i}`, i);
				if (i % 2 === 0) {
					queue.dequeue();
				}
			}
			
			expect(queue.size()).toBe(50);
		});

		test('should handle zero and negative priorities correctly', () => {
			queue.enqueue("Zero priority", 0);
			queue.enqueue("Negative priority", -5);
			queue.enqueue("Positive priority", 3);
			
			expect(queue.dequeue().priority).toBe(3);
			expect(queue.dequeue().priority).toBe(0);
			expect(queue.dequeue().priority).toBe(-5);
		});

		test('should handle very long text messages', () => {
			const longText = 'A'.repeat(10000); // 10KB text
			
			expect(() => queue.enqueue(longText)).not.toThrow();
			
			const item = queue.dequeue();
			expect(item.text).toBe(longText);
		});

		test('should handle special characters and Unicode', () => {
			const specialTexts = [
				"Emoji test: 🇧🇷 🎉 ✨",
				"Accents: ção, ãe, ñ, ü",
				"Symbols: @#$%^&*()_+-=[]{}|;':\",./<>?",
				"Unicode: 中文, العربية, русский",
				"Mixed: Hello 世界! Como está? 🌎"
			];
			
			specialTexts.forEach(text => {
				expect(() => queue.enqueue(text)).not.toThrow();
			});
			
			expect(queue.size()).toBe(5);
		});
	});

	describe('Integration with SpeechItem', () => {
		test('should create SpeechItem instances correctly', () => {
			queue.enqueue("Test message", 5);
			
			const item = queue.dequeue();
			
			expect(item).toBeInstanceOf(SpeechItem);
			expect(item.text).toBe("Test message");
			expect(item.priority).toBe(5);
			expect(item.timestamp).toBeInstanceOf(Date);
		});

		test('should respect SpeechItem expiration logic', async () => {
			const shortQueue = new SpeechQueue(100, 1000);
			
			shortQueue.enqueue("Will expire soon");
			const item = shortQueue.dequeue();
			
			expect(item.isExpired(1000)).toBe(false);
			
			// Wait for expiration
			await new Promise(resolve => setTimeout(resolve, 1100));
			
			expect(item.isExpired(1000)).toBe(true);
		});
	});
});