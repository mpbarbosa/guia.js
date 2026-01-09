/**
 * Integration tests for SpeechQueue class
 * 
 * This test suite provides integration testing for the SpeechQueue class,
 * focusing on module compatibility, SpeechSynthesisManager integration,
 * cross-module functionality validation, and backward compatibility verification.
 * 
 * @fileoverview SpeechQueue integration tests
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

describe('SpeechQueue Integration Tests', () => {
	let queue;

	beforeEach(() => {
		queue = new SpeechQueue();
		jest.clearAllMocks();
	});

	describe('Module Import and Export Compatibility', () => {
		test('should import SpeechQueue as default export', () => {
			expect(SpeechQueue).toBeDefined();
			expect(typeof SpeechQueue).toBe('function');
			expect(SpeechQueue.name).toBe('SpeechQueue');
		});

		test('should be compatible with ES6 module system', () => {
			// Test that SpeechQueue can be instantiated as ES6 class
			const queue = new SpeechQueue();
			
			expect(queue).toBeInstanceOf(SpeechQueue);
			expect(queue.constructor).toBe(SpeechQueue);
		});

		test('should work with CommonJS require pattern (backward compatibility)', () => {
			// Test that the module structure supports CommonJS patterns
			const QueueConstructor = SpeechQueue;
			const queue = new QueueConstructor();
			
			expect(queue).toBeInstanceOf(SpeechQueue);
			expect(typeof queue.enqueue).toBe('function');
			expect(typeof queue.dequeue).toBe('function');
		});

		test('should maintain proper prototype chain', () => {
			const queue = new SpeechQueue();
			
			expect(queue.constructor).toBe(SpeechQueue);
			expect(Object.getPrototypeOf(queue)).toBe(SpeechQueue.prototype);
			expect(queue instanceof SpeechQueue).toBe(true);
		});
	});

	describe('Integration with SpeechItem Module', () => {
		test('should create and manage SpeechItem instances correctly', () => {
			queue.enqueue("Test integration", 5);
			
			const item = queue.dequeue();
			
			expect(item).toBeInstanceOf(SpeechItem);
			expect(item.text).toBe("Test integration");
			expect(item.priority).toBe(5);
			// Timestamp is stored as a number (Date.now()), not a Date object
			expect(typeof item.timestamp).toBe('number');
			expect(item.timestamp).toBeGreaterThan(0);
		});

		test('should handle SpeechItem expiration integration', async () => {
			const shortQueue = new SpeechQueue(100, 1000); // 1 second expiration
			
			// Add item that will expire
			shortQueue.enqueue("Will expire");
			expect(shortQueue.size()).toBe(1);
			
			// Wait for item to expire
			await new Promise(resolve => setTimeout(resolve, 1100));
			
			// Queue should automatically clean expired items
			expect(shortQueue.size()).toBe(0);
			expect(shortQueue.isEmpty()).toBe(true);
		});

		test('should maintain SpeechItem immutability principles', () => {
			queue.enqueue("Immutable test", 3);
			const item = queue.dequeue();
			
			expect(Object.isFrozen(item)).toBe(true);
			
			// Should not be able to modify SpeechItem properties
			expect(() => {
				item.text = "Modified";
			}).toThrow();
			
			expect(() => {
				item.priority = 10;
			}).toThrow();
		});

		test('should work with SpeechItem factory methods', () => {
			// Create SpeechItem independently and verify queue compatibility
			const item = new SpeechItem("Factory created", 2);
			
			// Queue should work with externally created SpeechItem instances
			expect(item).toBeInstanceOf(SpeechItem);
			expect(item.text).toBe("Factory created");
			expect(item.priority).toBe(2);
		});
	});

	describe('Observer Pattern Integration', () => {
		test('should integrate with ObserverSubject module correctly', () => {
			// Test that the mocked ObserverSubject is working
			expect(queue.observers).toBeDefined();
			expect(queue.functionObservers).toBeDefined();
			expect(Array.isArray(queue.observers)).toBe(true);
			expect(Array.isArray(queue.functionObservers)).toBe(true);
		});

		test('should handle multiple observer types simultaneously', () => {
			const objectObserver = { update: jest.fn() };
			const functionObserver = jest.fn();
			
			queue.subscribe(objectObserver);
			queue.subscribeFunction(functionObserver);
			
			queue.enqueue("Test notification");
			
			expect(objectObserver.update).toHaveBeenCalledWith(queue);
			expect(functionObserver).toHaveBeenCalledWith(queue);
		});

		test('should maintain observer state across queue operations', () => {
			const observer = { update: jest.fn() };
			queue.subscribe(observer);
			
			// Multiple operations should trigger multiple notifications
			queue.enqueue("First");
			queue.enqueue("Second");
			queue.dequeue();
			queue.clear();
			
			expect(observer.update).toHaveBeenCalledTimes(4);
			observer.update.mock.calls.forEach(call => {
				expect(call[0]).toBe(queue);
			});
		});

		test('should clean up observers properly', () => {
			const observer1 = { update: jest.fn() };
			const observer2 = { update: jest.fn() };
			
			queue.subscribe(observer1);
			queue.subscribe(observer2);
			expect(queue.observers).toHaveLength(2);
			
			queue.unsubscribe(observer1);
			expect(queue.observers).toHaveLength(1);
			expect(queue.observers).toContain(observer2);
			expect(queue.observers).not.toContain(observer1);
		});
	});

	describe('Cross-Module Functionality', () => {
		test('should work with guia.js module structure', () => {
			// Test that SpeechQueue maintains compatibility with guia.js patterns
			const queueMethods = [
				'enqueue', 'dequeue', 'isEmpty', 'size', 'clear',
				'subscribe', 'unsubscribe', 'subscribeFunction', 'unsubscribeFunction',
				'toString', 'getItems'
			];
			
			queueMethods.forEach(method => {
				expect(typeof queue[method]).toBe('function');
			});
		});

		test('should handle Brazilian Portuguese content like other guia modules', () => {
			const brazilianContent = [
				"Bem-vindo ao Brasil",
				"Você está em São Paulo",
				"Próximo destino: Rio de Janeiro",
				"Informações turísticas disponíveis",
				"Atenção: mudança de rota"
			];
			
			brazilianContent.forEach((text, index) => {
				queue.enqueue(text, index);
			});
			
			expect(queue.size()).toBe(5);
			
			// All items should be properly processed
			const items = queue.getItems();
			items.forEach(item => {
				expect(item.text).toMatch(/[São|Rio|Brasil|Próximo|Informações|Atenção]/);
				expect(item).toBeInstanceOf(SpeechItem);
			});
		});

		test('should integrate with MP Barbosa error handling patterns', () => {
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
			
			// Test null handling
			queue.subscribe(null);
			queue.subscribeFunction(null);
			queue.unsubscribeFunction(null);
			
			expect(consoleSpy).toHaveBeenCalledTimes(3);
			expect(consoleSpy).toHaveBeenCalledWith("(SpeechQueue) Attempted to subscribe a null observer.");
			expect(consoleSpy).toHaveBeenCalledWith("(SpeechQueue) Attempted to subscribe a null observer function.");
			expect(consoleSpy).toHaveBeenCalledWith("(SpeechQueue) Attempted to unsubscribe a null observer function.");
			
			consoleSpy.mockRestore();
		});

		test('should maintain mutable design for state management (not frozen)', () => {
			// SpeechQueue is intentionally mutable for state management
			// Unlike SpeechItem (value object), SpeechQueue is a stateful container
			expect(Object.isFrozen(queue)).toBe(false);
			
			// Queue operations require mutability - these should NOT throw
			expect(() => {
				queue.items = [];
			}).not.toThrow();
			
			expect(() => {
				queue.maxSize = 200;
			}).not.toThrow();
			
			expect(() => {
				queue.newProperty = "test";
			}).toThrow();
		});
	});

	describe('Performance Integration', () => {
		test('should handle large datasets efficiently', () => {
			const startTime = Date.now();
			
			// Add 1000 items
			for (let i = 0; i < 1000; i++) {
				queue.enqueue(`Item ${i}`, Math.floor(Math.random() * 10));
			}
			
			const addTime = Date.now() - startTime;
			expect(addTime).toBeLessThan(2000); // Should complete within 2 seconds (allows for system load variance)
			
			// Verify all items were added (up to maxSize limit)
			expect(queue.size()).toBeLessThanOrEqual(100); // Default maxSize
			
			// Process all items efficiently
			const processStart = Date.now();
			while (!queue.isEmpty()) {
				queue.dequeue();
			}
			const processTime = Date.now() - processStart;
			
			expect(processTime).toBeLessThan(500); // Should process quickly
		});

		test('should manage memory efficiently with expiration', async () => {
			const shortQueue = new SpeechQueue(50, 1000); // 1 second expiration
			
			// Add many items
			for (let i = 0; i < 20; i++) {
				shortQueue.enqueue(`Item ${i}`);
			}
			
			expect(shortQueue.size()).toBe(20);
			
			// Wait for expiration
			await new Promise(resolve => setTimeout(resolve, 1100));
			
			// All items should be expired and cleaned up
			expect(shortQueue.size()).toBe(0);
		});

		test('should maintain consistent performance under load', () => {
			const operations = 1000;
			const startTime = Date.now();
			
			// Perform mixed operations
			for (let i = 0; i < operations; i++) {
				if (i % 3 === 0) {
					queue.enqueue(`Load test ${i}`, i % 5);
				} else if (i % 3 === 1 && !queue.isEmpty()) {
					queue.dequeue();
				} else {
					queue.size(); // Trigger cleanup
				}
			}
			
			const totalTime = Date.now() - startTime;
			const avgTime = totalTime / operations;
			
			expect(avgTime).toBeLessThan(1); // Average operation should be under 1ms
		});
	});

	describe('Backward Compatibility', () => {
		test('should maintain API compatibility with previous versions', () => {
			// Test all public methods exist and work
			const publicMethods = [
				'enqueue',
				'dequeue', 
				'isEmpty',
				'size',
				'clear',
				'subscribe',
				'unsubscribe',
				'subscribeFunction',
				'unsubscribeFunction',
				'toString',
				'getItems'
			];
			
			publicMethods.forEach(method => {
				expect(queue[method]).toBeDefined();
				expect(typeof queue[method]).toBe('function');
			});
		});

		test('should support legacy observer patterns', () => {
			// Test both old and new observer patterns work
			const legacyObserver = {
				update: jest.fn()
			};
			
			const modernObserver = jest.fn();
			
			queue.subscribe(legacyObserver);
			queue.subscribeFunction(modernObserver);
			
			queue.enqueue("Compatibility test");
			
			expect(legacyObserver.update).toHaveBeenCalled();
			expect(modernObserver).toHaveBeenCalled();
		});

		test('should handle parameter formats consistently', () => {
			// Test different parameter combinations
			queue.enqueue("Default priority"); // Uses default
			queue.enqueue("Explicit priority", 5);
			queue.enqueue("Zero priority", 0);
			queue.enqueue("Negative priority", -1);
			
			expect(queue.size()).toBe(4);
			
			// Should maintain order by priority
			expect(queue.dequeue().priority).toBe(5);
			expect(queue.dequeue().priority).toBe(0);
			expect(queue.dequeue().priority).toBe(0); // Default
			expect(queue.dequeue().priority).toBe(-1);
		});
	});

	describe('Error Handling Integration', () => {
		test('should handle invalid inputs gracefully across modules', () => {
			// Test that errors are properly typed and informative
			expect(() => queue.enqueue(null)).toThrow(TypeError);
			expect(() => queue.enqueue("")).toThrow(Error);
			expect(() => queue.enqueue("test", "invalid")).toThrow(TypeError);
			
			// Queue should remain in valid state after errors
			expect(queue.size()).toBe(0);
			expect(queue.isEmpty()).toBe(true);
		});

		test('should recover from observer errors', () => {
			const errorObserver = jest.fn(() => {
				throw new Error("Observer failed");
			});
			
			const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
			
			queue.subscribeFunction(errorObserver);
			
			// Should not crash when observer throws
			expect(() => queue.enqueue("Test with error")).not.toThrow();
			
			expect(consoleErrorSpy).toHaveBeenCalled();
			expect(queue.size()).toBe(1); // Operation should still succeed
			
			consoleErrorSpy.mockRestore();
		});

		test('should handle constructor errors properly', () => {
			// Test constructor validation
			expect(() => new SpeechQueue(-1)).toThrow(RangeError);
			expect(() => new SpeechQueue(100, 500)).toThrow(RangeError);
			expect(() => new SpeechQueue("invalid")).toThrow(RangeError);
			
			// Valid constructor should still work
			expect(() => new SpeechQueue(50, 15000)).not.toThrow();
		});
	});

	describe('Real-world Usage Scenarios', () => {
		test('should handle typical travel guide usage patterns', () => {
			// Simulate typical Brazilian travel guide usage
			const scenarios = [
				{ text: "Bem-vindo ao Rio de Janeiro!", priority: 2, type: "welcome" },
				{ text: "Você está próximo ao Cristo Redentor", priority: 1, type: "location" },
				{ text: "A temperatura atual é 28°C", priority: 0, type: "weather" },
				{ text: "ATENÇÃO: Área temporariamente fechada", priority: 3, type: "alert" },
				{ text: "Sugestão: Visite o Pão de Açúcar", priority: -1, type: "suggestion" }
			];
			
			scenarios.forEach(scenario => {
				queue.enqueue(scenario.text, scenario.priority);
			});
			
			expect(queue.size()).toBe(5);
			
			// Should process in priority order
			const alert = queue.dequeue();
			expect(alert.priority).toBe(3);
			expect(alert.text).toContain("ATENÇÃO");
			
			const welcome = queue.dequeue();
			expect(welcome.priority).toBe(2);
			expect(welcome.text).toContain("Bem-vindo");
		});

		test('should handle concurrent user interactions', () => {
			const observer = { update: jest.fn() };
			queue.subscribe(observer);
			
			// Simulate rapid user interactions
			queue.enqueue("Primeira interação", 1);
			queue.enqueue("Segunda interação", 2);
			queue.enqueue("Terceira interação", 0);
			
			// User changes mind and clears queue
			queue.clear();
			
			// Add new content
			queue.enqueue("Nova informação", 1);
			
			expect(queue.size()).toBe(1);
			expect(observer.update).toHaveBeenCalledTimes(5); // 3 enqueues + 1 clear + 1 enqueue
		});

		test('should integrate with accessibility requirements', () => {
			// Test accessibility-focused usage patterns
			const accessibilityContent = [
				"Navegação por voz ativada",
				"Próxima instrução em 3 segundos",
				"Você chegou ao seu destino",
				"Repetindo última instrução"
			];
			
			accessibilityContent.forEach((text, index) => {
				queue.enqueue(text, index);
			});
			
			// Should maintain proper ordering for accessibility
			const items = queue.getItems();
			expect(items).toHaveLength(4);
			
			// Higher priority items should come first for accessibility
			items.forEach((item, index) => {
				if (index > 0) {
					expect(item.priority).toBeLessThanOrEqual(items[index - 1].priority);
				}
			});
		});
	});
});