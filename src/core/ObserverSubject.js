/**
 * ObserverSubject - Centralizes observer pattern implementation with immutable state updates
 * 
 * This class provides a reusable implementation of the observer pattern,
 * supporting both object-based observers (with update methods) and function-based observers.
 * It eliminates code duplication across multiple classes that need observer functionality.
 * 
 * **Referential Transparency & Immutability:**
 * - Observer arrays are managed immutably using spread operator and filter
 * - subscribe() and unsubscribe() create new arrays instead of mutating in place
 * - State transitions are predictable and referentially transparent
 * - Each operation returns void but updates state without direct mutation
 * 
 * @module core/ObserverSubject
 * @class
 * @since 0.8.4-alpha
 * 
 * @example
 * // Using in a class via composition
 * class MyClass {
 *   constructor() {
 *     this.observerSubject = new ObserverSubject();
 *   }
 *   
 *   subscribe(observer) {
 *     this.observerSubject.subscribe(observer);
 *   }
 *   
 *   notify(...args) {
 *     this.observerSubject.notifyObservers(...args);
 *   }
 * }
 * 
 * @example
 * // Immutable observer management
 * const subject = new ObserverSubject();
 * const observer1 = { update: () => {} };
 * const observer2 = { update: () => {} };
 * 
 * subject.subscribe(observer1);
 * const array1 = subject.observers; // [observer1]
 * 
 * subject.subscribe(observer2);
 * const array2 = subject.observers; // [observer1, observer2]
 * 
 * // array1 and array2 are different instances (immutable pattern)
 * console.log(array1 !== array2); // true
 * console.log(array1.length); // 1 (original unchanged)
 * console.log(array2.length); // 2 (new array created)
 */

import { log } from '../utils/logger.js';

class ObserverSubject {
	/**
	 * Creates a new ObserverSubject instance.
	 * Initializes empty arrays for both object and function observers.
	 */
	constructor() {
		this.observers = [];
		this.functionObservers = [];
	}

	/**
	 * Subscribes an observer object to receive notifications.
	 * The observer must have an update() method that will be called on notifications.
	 * 
	 * **Immutable Pattern:** Creates a new array using spread operator instead of 
	 * mutating the existing observers array. This ensures referential transparency
	 * and makes state transitions predictable.
	 * 
	 * @param {Object} observer - Observer object with an update method
	 * @param {Function} observer.update - Method called when notifying observers
	 * @returns {void}
	 * 
	 * @example
	 * const observer = {
	 *   update: (subject, ...args) => {
	 *     console.log('Notified with:', args);
	 *   }
	 * };
	 * observerSubject.subscribe(observer);
	 * 
	 * @example
	 * // Demonstrating immutability
	 * const originalArray = observerSubject.observers;
	 * observerSubject.subscribe(observer);
	 * const newArray = observerSubject.observers;
	 * console.log(originalArray !== newArray); // true - new array created
	 */
	subscribe(observer) {
		if (observer) {
			this.observers = [...this.observers, observer];
		}
	}

	/**
	 * Unsubscribes an observer object from notifications.
	 * 
	 * **Immutable Pattern:** Uses filter to create a new array without the observer,
	 * instead of mutating the existing array. This maintains referential transparency.
	 * 
	 * @param {Object} observer - Observer object to remove
	 * @returns {void}
	 * 
	 * @example
	 * observerSubject.unsubscribe(observer);
	 * 
	 * @example
	 * // Demonstrating immutability
	 * const arrayBefore = observerSubject.observers;
	 * observerSubject.unsubscribe(observer);
	 * const arrayAfter = observerSubject.observers;
	 * console.log(arrayBefore !== arrayAfter); // true - new array created
	 */
	unsubscribe(observer) {
		this.observers = this.observers.filter((o) => o !== observer);
	}

	/**
	 * Notifies all subscribed object observers.
	 * Calls the update() method on each observer with the provided arguments.
	 * 
	 * @param {...*} args - Arguments to pass to each observer's update method
	 * @returns {void}
	 * 
	 * @example
	 * observerSubject.notifyObservers(data1, data2, eventType);
	 */
	notifyObservers(...args) {
		log("+++ (100) (ObserverSubject) Notifying observers with args:", args);
		this.observers.forEach((observer) => {
			if (typeof observer.update === "function") {
				log("+++ (101) (ObserverSubject) Notifying observer:", observer);
				observer.update(...args);
			}
		});
	}

	/**
	 * Subscribes a function to receive notifications.
	 * 
	 * **Immutable Pattern:** Creates a new array using spread operator instead of 
	 * mutating the existing functionObservers array.
	 * 
	 * @param {Function} observerFunction - Function to be called on notifications
	 * @returns {void}
	 * 
	 * @example
	 * const handler = (subject, ...args) => {
	 *   console.log('Function observer notified:', args);
	 * };
	 * observerSubject.subscribeFunction(handler);
	 */
	subscribeFunction(observerFunction) {
		if (observerFunction) {
			this.functionObservers = [...this.functionObservers, observerFunction];
		}
	}

	/**
	 * Unsubscribes a function from notifications.
	 * 
	 * **Immutable Pattern:** Uses filter to create a new array without the function,
	 * maintaining immutability and referential transparency.
	 * 
	 * @param {Function} observerFunction - Function to remove
	 * @returns {void}
	 * 
	 * @example
	 * observerSubject.unsubscribeFunction(handler);
	 */
	unsubscribeFunction(observerFunction) {
		this.functionObservers = this.functionObservers.filter(
			(fn) => fn !== observerFunction,
		);
	}

	/**
	 * Notifies all subscribed function observers.
	 * 
	 * @param {...*} args - Arguments to pass to each observer function
	 * @returns {void}
	 * 
	 * @example
	 * observerSubject.notifyFunctionObservers(data1, data2);
	 */
	notifyFunctionObservers(...args) {
		this.functionObservers.forEach((fn) => {
			if (typeof fn === "function") {
				fn(...args);
			}
		});
	}

	/**
	 * Gets the count of subscribed object observers.
	 * 
	 * @returns {number} Number of subscribed observers
	 */
	getObserverCount() {
		return this.observers.length;
	}

	/**
	 * Gets the count of subscribed function observers.
	 * 
	 * @returns {number} Number of subscribed function observers
	 */
	getFunctionObserverCount() {
		return this.functionObservers.length;
	}

	/**
	 * Clears all observers (both object and function observers).
	 * 
	 * @returns {void}
	 */
	clearAllObservers() {
		this.observers = [];
		this.functionObservers = [];
	}
}

export default ObserverSubject;
