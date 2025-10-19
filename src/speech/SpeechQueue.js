/**
 * Priority-based speech synthesis queue with automatic cleanup and observer pattern integration.
 * 
 * This module provides a robust queue implementation for managing speech synthesis requests
 * with priority ordering, automatic expiration cleanup, and comprehensive observer pattern
 * support. Designed specifically for Brazilian Portuguese travel guide applications,
 * it ensures efficient memory management and smooth speech processing workflow.
 * 
 * Key features:
 * - Priority-based ordering (higher priority items processed first)
 * - Automatic expiration cleanup to prevent memory leaks
 * - Observer pattern integration for real-time queue state monitoring
 * - Configurable size limits and expiration timeouts
 * - Comprehensive parameter validation and error handling
 * - Brazilian Portuguese travel context optimizations
 * 
 * @module SpeechQueue
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */

import SpeechItem from './SpeechItem.js';
import ObserverSubject from '../core/ObserverSubject.js';

/**
 * Priority-based speech synthesis queue with automatic cleanup of expired items.
 * 
 * This class manages a queue of speech requests with priority ordering and automatic
 * expiration of old items to prevent memory leaks and ensure fresh speech content.
 * Higher priority items are processed first, and items are automatically removed
 * if they exceed the configured expiration time.
 * 
 * The queue implements the Observer pattern to notify subscribers of state changes,
 * making it suitable for integration with UI components and other system modules
 * that need to react to queue modifications.
 * 
 * @class SpeechQueue
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * // Create a queue with default settings
 * const queue = new SpeechQueue();
 * 
 * @example
 * // Create a queue with custom size and expiration
 * const queue = new SpeechQueue(50, 60000); // 50 items max, 60s expiration
 * 
 * @example
 * // Create a queue with logging disabled
 * const queue = new SpeechQueue(100, 30000, false); // No logging output
 * 
 * @example
 * // Add items with different priorities
 * queue.enqueue("Welcome message", 0);        // Normal priority
 * queue.enqueue("Emergency alert", 2);        // High priority (processed first)
 * queue.enqueue("Background info", -1);       // Low priority
 */
class SpeechQueue {
	/**
	 * Creates a new speech queue with configurable size and expiration settings.
	 * 
	 * @param {number} [maxSize=100] - Maximum number of items in queue (1-1000)
	 * @param {number} [expirationMs=30000] - Item expiration time in milliseconds (1000-300000)
	 * @param {boolean} [enableLogging=true] - Whether to enable logging output
	 * @throws {TypeError} When parameters are not numbers
	 * @throws {RangeError} When parameters are outside valid ranges
	 */
	constructor(maxSize = 100, expirationMs = 30000, enableLogging = false) {
		// Parameter validation with specific error messages for debugging
		if (!Number.isInteger(maxSize) || maxSize < 1 || maxSize > 1000) {
			throw new RangeError(`maxSize must be an integer between 1 and 1000, got: ${maxSize}`);
		}
		
		if (!Number.isInteger(expirationMs) || expirationMs < 1000 || expirationMs > 300000) {
			throw new RangeError(`expirationMs must be an integer between 1000 and 300000, got: ${expirationMs}`);
		}

		if (typeof enableLogging !== 'boolean') {
			throw new TypeError(`enableLogging must be a boolean, got: ${typeof enableLogging}`);
		}

		/**
		 * Array of SpeechItem objects ordered by priority (highest first).
		 * @private
		 * @type {SpeechItem[]}
		 */
		this.items = [];

		/**
		 * Maximum number of items allowed in the queue.
		 * @private
		 * @type {number}
		 */
		this.maxSize = maxSize;

		/**
		 * Expiration time for queue items in milliseconds.
		 * @private
		 * @type {number}
		 */
		this.expirationMs = expirationMs;

		/**
		 * Observer subject for managing queue state notifications.
		 * @private
		 * @type {ObserverSubject}
		 */
		this.observerSubject = new ObserverSubject();

		/**
		 * Controls whether logging is enabled for this queue instance.
		 * @private
		 * @type {boolean}
		 */
		this.enableLogging = enableLogging;

		// Note: Unlike SpeechItem, SpeechQueue must remain mutable to manage its internal state
		// The queue operations require modification of the items array for proper functionality
	}

	/**
	 * Gets the observers array for backward compatibility.
	 * 
	 * This getter provides access to the current list of subscribed observers
	 * while maintaining the encapsulation of the underlying ObserverSubject.
	 * 
	 * @returns {Array} Array of subscribed observers
	 * @readonly
	 */
	get observers() {
		return this.observerSubject.observers;
	}

	/**
	 * Gets the function observers array for backward compatibility.
	 * 
	 * This getter provides access to the current list of subscribed function observers
	 * while maintaining the encapsulation of the underlying ObserverSubject.
	 * 
	 * @returns {Array} Array of subscribed function observers
	 * @readonly
	 */
	get functionObservers() {
		return this.observerSubject.functionObservers;
	}

	/**
	 * Gets the current logging state.
	 * 
	 * @returns {boolean} True if logging is enabled, false otherwise
	 * @readonly
	 */
	get isLoggingEnabled() {
		return this.enableLogging;
	}

	/**
	 * Enables logging for this queue instance.
	 * 
	 * @example
	 * queue.enableLogs();
	 * queue.cleanExpired(); // Will log removed items count
	 */
	enableLogs() {
		this.enableLogging = true;
	}

	/**
	 * Disables logging for this queue instance.
	 * 
	 * @example
	 * queue.disableLogs();
	 * queue.cleanExpired(); // Will not log removed items count
	 */
	disableLogs() {
		this.enableLogging = false;
	}

	/**
	 * Toggles the logging state for this queue instance.
	 * 
	 * @returns {boolean} The new logging state after toggling
	 * 
	 * @example
	 * const newState = queue.toggleLogs();
	 * console.log(`Logging is now ${newState ? 'enabled' : 'disabled'}`);
	 */
	toggleLogs() {
		this.enableLogging = !this.enableLogging;
		return this.enableLogging;
	}

	/**
	 * Subscribes an observer to queue state changes.
	 * 
	 * Observers must implement an update() method that will be called
	 * whenever the queue state changes (items added, removed, or expired).
	 * 
	 * @param {Object} observer - Observer object with update() method
	 * @throws {TypeError} When observer is null or doesn't have update method
	 * 
	 * @example
	 * const observer = {
	 *   update(queue) {
	 *     console.log(`Queue size: ${queue.size()}`);
	 *   }
	 * };
	 * queue.subscribe(observer);
	 */
	subscribe(observer) {
		if (observer == null) {
			console.warn("(SpeechQueue) Attempted to subscribe a null observer.");
			return;
		}
		
		if (typeof observer.update !== 'function') {
			throw new TypeError("Observer must have an update() method");
		}
		
		this.observerSubject.subscribe(observer);
	}

	/**
	 * Unsubscribes an observer from queue state changes.
	 * 
	 * @param {Object} observer - Observer object to unsubscribe
	 */
	unsubscribe(observer) {
		this.observerSubject.unsubscribe(observer);
	}

	/**
	 * Notifies all subscribed observers of queue state changes.
	 * 
	 * This method is called automatically when the queue state changes
	 * but can also be called manually if needed.
	 * 
	 * @private
	 */
	notifyObservers() {
		this.observerSubject.notifyObservers(this);
	}

	/**
	 * Subscribes a function observer to queue state changes.
	 * 
	 * Function observers are simpler than object observers - they receive
	 * the queue instance as their only parameter when called.
	 * 
	 * @param {Function} observerFunction - Function to call on state changes
	 * @throws {TypeError} When observerFunction is not a function
	 * 
	 * @example
	 * queue.subscribeFunction((queue) => {
	 *   console.log(`Queue has ${queue.size()} items`);
	 * });
	 */
	subscribeFunction(observerFunction) {
		if (observerFunction == null) {
			console.warn("(SpeechQueue) Attempted to subscribe a null observer function.");
			return;
		}
		
		if (typeof observerFunction !== 'function') {
			throw new TypeError("Observer must be a function");
		}
		
		this.observerSubject.subscribeFunction(observerFunction);
	}

	/**
	 * Unsubscribes a function observer from queue state changes.
	 * 
	 * @param {Function} observerFunction - Function observer to unsubscribe
	 */
	unsubscribeFunction(observerFunction) {
		if (observerFunction == null) {
			console.warn("(SpeechQueue) Attempted to unsubscribe a null observer function.");
			return;
		}
		
		this.observerSubject.unsubscribeFunction(observerFunction);
	}

	/**
	 * Notifies all subscribed function observers of queue state changes.
	 * 
	 * This method is called automatically when the queue state changes
	 * but can also be called manually if needed.
	 * 
	 * @private
	 */
	notifyFunctionObservers() {
		this.observerSubject.functionObservers.forEach((fn) => {
			try {
				fn(this);
			} catch (error) {
				console.error("(SpeechQueue) Error in function observer:", error);
			}
		});
	}

	/**
	 * Adds a new speech item to the queue with priority ordering.
	 * 
	 * Items are inserted in priority order with higher priority items placed
	 * before lower priority items. Equal priority items maintain insertion order.
	 * Expired items are automatically cleaned before insertion.
	 * 
	 * @param {string} text - Text to be spoken
	 * @param {number} [priority=0] - Priority level (higher = more important)
	 * @throws {TypeError} When text is not a string or priority is not a number
	 * @throws {Error} When text is empty or only whitespace
	 * 
	 * @example
	 * queue.enqueue("Welcome to São Paulo", 0);           // Normal priority
	 * queue.enqueue("Chegando em Copacabana", 1);         // Higher priority
	 * queue.enqueue("Sistema atualizado", -1);            // Lower priority
	 */
	enqueue(text, priority = 0) {
		// Input validation
		if (typeof text !== 'string') {
			throw new TypeError(`Text must be a string, got: ${typeof text}`);
		}
		
		if (text.trim() === '') {
			throw new Error("Text cannot be empty or only whitespace");
		}
		
		if (typeof priority !== 'number' || !Number.isFinite(priority)) {
			throw new TypeError(`Priority must be a finite number, got: ${typeof priority}`);
		}

		// Clean expired items first to ensure accurate size calculations
		this.cleanExpired();

		// Create new SpeechItem
		const item = new SpeechItem(text, priority);

		// Find insertion point to maintain priority order (higher priority first)
		let insertIndex = 0;
		for (let i = 0; i < this.items.length; i++) {
			if (this.items[i].priority < priority) {
				insertIndex = i;
				break;
			}
			insertIndex = i + 1;
		}

		// Insert item at correct position
		this.items.splice(insertIndex, 0, item);

		// Enforce size limit by removing lowest priority items
		if (this.items.length > this.maxSize) {
			this.items = this.items.slice(0, this.maxSize);
		}

		// Notify observers of queue state change
		this.notifyObservers();
		this.notifyFunctionObservers();
	}

	/**
	 * Removes and returns the highest priority item from the queue.
	 * 
	 * Expired items are automatically cleaned before retrieval to ensure
	 * only valid items are returned. Returns null if the queue is empty
	 * after cleaning.
	 * 
	 * @returns {SpeechItem|null} Next speech item or null if queue is empty
	 * 
	 * @example
	 * const nextItem = queue.dequeue();
	 * if (nextItem) {
	 *   console.log(`Speaking: ${nextItem.text}`);
	 * }
	 */
	dequeue() {
		// Clean expired items first to ensure we don't return stale items
		this.cleanExpired();

		// Return first item (highest priority due to ordering in enqueue)
		const item = this.items.shift() || null;

		// Notify observers of queue state change
		this.notifyObservers();
		this.notifyFunctionObservers();

		return item;
	}

	/**
	 * Checks if the queue is empty after cleaning expired items.
	 * 
	 * This method automatically cleans expired items before checking
	 * the queue status to provide accurate results.
	 * 
	 * @returns {boolean} True if queue has no valid items
	 * 
	 * @example
	 * if (!queue.isEmpty()) {
	 *   const item = queue.dequeue();
	 *   // Process item
	 * }
	 */
	isEmpty() {
		this.cleanExpired();
		return this.items.length === 0;
	}

	/**
	 * Gets the current size of the queue after cleaning expired items.
	 * 
	 * This method automatically cleans expired items before counting
	 * to provide an accurate count of valid items.
	 * 
	 * @returns {number} Number of valid items in queue
	 * 
	 * @example
	 * console.log(`Queue has ${queue.size()} pending items`);
	 */
	size() {
		this.cleanExpired();
		return this.items.length;
	}

	/**
	 * Removes expired items from the queue.
	 * 
	 * This private method is called automatically by other queue operations
	 * to ensure expired items don't accumulate and consume memory. Logs
	 * the number of removed items for debugging purposes.
	 * 
	 * @private
	 */
	cleanExpired() {
		const originalSize = this.items.length;
		
		// Filter out expired items using the item's expiration check
		this.items = this.items.filter(item => !item.isExpired(this.expirationMs));

		const removedCount = originalSize - this.items.length;
		if (removedCount > 0 && this.enableLogging) {
			// Use console.log for compatibility with existing logging system
			console.log(`(SpeechQueue) Removed ${removedCount} expired items`);
		}
	}

	/**
	 * Clears all items from the queue.
	 * 
	 * This method immediately removes all items regardless of their
	 * expiration status and notifies observers of the change.
	 * 
	 * @example
	 * queue.clear(); // Remove all pending speech items
	 */
	clear() {
		this.items = [];
		
		// Notify observers of queue state change
		this.notifyObservers();
		this.notifyFunctionObservers();
	}

	/**
	 * Returns a string representation of the queue for debugging.
	 * 
	 * @returns {string} Queue description with size and configuration
	 * 
	 * @example
	 * console.log(queue.toString());
	 * // Output: "SpeechQueue: size=3, maxSize=100, expirationMs=30000"
	 */
	toString() {
		return `${this.constructor.name}: size=${this.size()}, maxSize=${this.maxSize}, expirationMs=${this.expirationMs}`;
	}

	/**
	 * Gets a read-only array of current queue items for inspection.
	 * 
	 * This method returns a shallow copy of the items array to prevent
	 * external modification while allowing inspection of queue contents.
	 * Automatically cleans expired items before returning.
	 * 
	 * @returns {SpeechItem[]} Read-only copy of current queue items
	 * 
	 * @example
	 * const items = queue.getItems();
	 * items.forEach(item => console.log(`Priority ${item.priority}: ${item.text}`));
	 */
	getItems() {
		this.cleanExpired();
		return [...this.items]; // Shallow copy for read-only access
	}
}

export default SpeechQueue;