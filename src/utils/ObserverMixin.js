'use strict';

import { warn } from './logger.js';

/**
 * Observer Pattern Mixin for delegating to ObserverSubject.
 * 
 * This mixin eliminates code duplication by providing standard observer pattern
 * delegation methods. It handles subscription management, unsubscription, and
 * notification with optional null checking and logging.
 * 
 * **Benefits**:
 * - Eliminates 15+ lines of boilerplate per class
 * - Consistent observer interface across all classes
 * - Optional null checking and validation
 * - Backward compatible with existing implementations
 * 
 * **Usage Patterns**:
 * 
 * 1. **Simple delegation** (most common):
 * ```javascript
 * import { withObserver } from '../utils/ObserverMixin.js';
 * import ObserverSubject from '../core/ObserverSubject.js';
 * 
 * class MyClass {
 *     constructor() {
 *         this.observerSubject = new ObserverSubject();
 *     }
 * }
 * 
 * // Add observer methods
 * Object.assign(MyClass.prototype, withObserver());
 * ```
 * 
 * 2. **With null checking** (for critical paths):
 * ```javascript
 * Object.assign(MyClass.prototype, withObserver({ checkNull: true, className: 'MyClass' }));
 * ```
 * 
 * 3. **With custom notification logic**:
 * ```javascript
 * class MyClass {
 *     constructor() {
 *         this.observerSubject = new ObserverSubject();
 *     }
 *     
 *     // Override notifyObservers for custom behavior
 *     notifyObservers(event, data) {
 *         log(`Notifying with event: ${event}`);
 *         this.observerSubject.notifyObservers(this, event, data);
 *     }
 * }
 * 
 * // Add subscribe/unsubscribe only
 * Object.assign(MyClass.prototype, withObserver({ excludeNotify: true }));
 * ```
 * 
 * @module utils/ObserverMixin
 * @since 0.8.7-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * // Standard usage (most classes)
 * import { withObserver } from '../utils/ObserverMixin.js';
 * 
 * class ReverseGeocoder {
 *     constructor() {
 *         this.observerSubject = new ObserverSubject();
 *     }
 * }
 * Object.assign(ReverseGeocoder.prototype, withObserver());
 * 
 * @example
 * // With null checking (for user-facing APIs)
 * class WebGeocodingManager {
 *     constructor() {
 *         this.observerSubject = new ObserverSubject();
 *     }
 * }
 * Object.assign(WebGeocodingManager.prototype, 
 *     withObserver({ checkNull: true, className: 'WebGeocodingManager' }));
 */

/**
 * Configuration options for observer mixin.
 * @typedef {Object} ObserverMixinOptions
 * @property {boolean} [checkNull=false] - Whether to validate observer is not null
 * @property {string} [className='Class'] - Class name for logging (if checkNull=true)
 * @property {boolean} [excludeNotify=false] - Exclude notifyObservers method (use custom)
 */

/**
 * Creates an observer mixin with standard delegation methods.
 * 
 * Returns an object with subscribe, unsubscribe, and optionally notifyObservers
 * methods that delegate to this.observerSubject. The class must have an
 * observerSubject property initialized before using these methods.
 * 
 * @param {ObserverMixinOptions} [options={}] - Configuration options
 * @returns {Object} Object with observer delegation methods
 * 
 * @example
 * // Basic usage
 * Object.assign(MyClass.prototype, withObserver());
 * 
 * @example
 * // With null checking
 * Object.assign(MyClass.prototype, withObserver({ 
 *     checkNull: true, 
 *     className: 'MyClass' 
 * }));
 */
export function withObserver(options = {}) {
	const {
		checkNull = false,
		className = 'Class',
		excludeNotify = false
	} = options;

	const mixin = {
		/**
		 * Subscribes an observer to receive notifications.
		 * 
		 * @param {Object} observer - Observer object with update() method
		 * @returns {void}
		 */
		subscribe(observer) {
			if (checkNull && observer == null) {
				warn(`(${className}) Attempted to subscribe a null observer.`);
				return;
			}
			this.observerSubject.subscribe(observer);
		},

		/**
		 * Unsubscribes an observer from receiving notifications.
		 * 
		 * @param {Object} observer - Observer object to remove
		 * @returns {void}
		 */
		unsubscribe(observer) {
			this.observerSubject.unsubscribe(observer);
		}
	};

	// Add notifyObservers unless explicitly excluded
	if (!excludeNotify) {
		/**
		 * Notifies all subscribed observers with the provided arguments.
		 * 
		 * @param {...*} args - Arguments to pass to observer update methods
		 * @returns {void}
		 */
		mixin.notifyObservers = function(...args) {
			this.observerSubject.notifyObservers(...args);
		};
	}

	return mixin;
}

/**
 * Default export for convenience.
 * @type {Function}
 */
export default withObserver;
