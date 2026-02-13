'use strict';

/**
 * Centralized callback registry with type-safe management and error handling.
 * 
 * Provides unified callback registration and execution for different address change types,
 * eliminating code duplication and improving maintainability.
 * 
 * **Key Features**:
 * - Type-safe callback registration
 * - Centralized error handling for callback execution
 * - Support for multiple callback types (logradouro, bairro, municipio, address)
 * - Null-safe operations
 * - Immutable design following MP Barbosa standards
 * 
 * **Design Pattern**:
 * This class uses the Registry pattern to replace 15+ pairs of static wrapper
 * methods (setLogradouroChangeCallback/getLogradouroChangeCallback, etc.),
 * reducing ~240 lines of code duplication.
 * 
 * @module data/CallbackRegistry
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * import CallbackRegistry from './CallbackRegistry.js';
 * 
 * const registry = new CallbackRegistry();
 * 
 * // Register callbacks for different change types
 * registry.register('logradouro', (details) => {
 *   console.log('Street changed:', details);
 * });
 * 
 * registry.register('bairro', (details) => {
 *   console.log('Neighborhood changed:', details);
 * });
 * 
 * // Execute callbacks with error handling
 * registry.execute('logradouro', changeDetails);
 * 
 * @example
 * // Check if callback is registered
 * if (registry.has('municipio')) {
 *   console.log('Municipality callback is registered');
 * }
 * 
 * @example
 * // Unregister callback
 * registry.unregister('bairro');
 */
class CallbackRegistry {
	
	/**
	 * Creates a new CallbackRegistry instance.
	 * 
	 * Initializes the internal Map to store callbacks by type.
	 * 
	 * @since 0.9.0-alpha
	 */
	constructor() {
		/**
		 * Map storing callbacks by type.
		 * Key: callback type (string) - e.g., 'logradouro', 'bairro', 'municipio'
		 * Value: callback function or null
		 * @type {Map<string, Function|null>}
		 * @private
		 */
		this.callbacks = new Map();
	}
	
	/**
	 * Registers a callback for a specific change type.
	 * 
	 * The callback can be a function or null (to unregister). Any non-function,
	 * non-null value will throw a TypeError.
	 * 
	 * @param {string} type - Change type identifier (e.g., 'logradouro', 'bairro', 'municipio', 'address')
	 * @param {Function|null} callback - Callback function to register, or null to unregister
	 * @throws {TypeError} If callback is not a function or null
	 * 
	 * @example
	 * registry.register('logradouro', (details) => {
	 *   console.log('Street changed from', details.from, 'to', details.to);
	 * });
	 * 
	 * @example
	 * // Unregister by passing null
	 * registry.register('bairro', null);
	 * 
	 * @example
	 * // Invalid - throws TypeError
	 * registry.register('municipio', 'not a function'); // TypeError
	 * 
	 * @since 0.9.0-alpha
	 */
	register(type, callback) {
		if (callback !== null && typeof callback !== 'function') {
			throw new TypeError(
				`Callback for type "${type}" must be a function or null. Received: ${typeof callback}`
			);
		}
		
		this.callbacks.set(type, callback);
	}
	
	/**
	 * Gets the registered callback for a specific type.
	 * 
	 * Returns the callback function if registered, or null if not registered
	 * or explicitly set to null.
	 * 
	 * @param {string} type - Change type identifier
	 * @returns {Function|null} Registered callback or null
	 * 
	 * @example
	 * const callback = registry.get('logradouro');
	 * if (callback) {
	 *   callback(changeDetails);
	 * }
	 * 
	 * @example
	 * // Returns null if not registered
	 * const cb = registry.get('nonexistent'); // null
	 * 
	 * @since 0.9.0-alpha
	 */
	get(type) {
		return this.callbacks.get(type) || null;
	}
	
	/**
	 * Executes the callback for a specific type with error handling.
	 * 
	 * If a callback is registered and is a function, it will be called with
	 * the provided arguments. Any errors thrown by the callback are caught
	 * and logged to console.error, preventing callback errors from breaking
	 * the application.
	 * 
	 * @param {string} type - Change type identifier
	 * @param {...any} args - Arguments to pass to the callback
	 * @returns {boolean} True if callback was executed, false if not registered
	 * 
	 * @example
	 * registry.execute('bairro', {
	 *   from: 'Centro',
	 *   to: 'Boa Vista',
	 *   currentAddress: currentAddr
	 * });
	 * 
	 * @example
	 * // Safe execution - errors are caught and logged
	 * registry.register('municipio', () => {
	 *   throw new Error('Callback error');
	 * });
	 * registry.execute('municipio'); // Logs error, doesn't crash
	 * 
	 * @since 0.9.0-alpha
	 */
	execute(type, ...args) {
		const callback = this.callbacks.get(type);
		
		if (typeof callback === 'function') {
			try {
				callback(...args);
				return true;
			} catch (error) {
				console.error(`[CallbackRegistry] Error executing callback for type "${type}":`, error);
				// Error is logged but not re-thrown to prevent breaking the application
				return false;
			}
		}
		
		return false;
	}
	
	/**
	 * Checks if a callback is registered for a specific type.
	 * 
	 * Returns true even if the callback is explicitly set to null.
	 * Use in combination with get() to check for function callbacks.
	 * 
	 * @param {string} type - Change type identifier
	 * @returns {boolean} True if type is registered (even if null)
	 * 
	 * @example
	 * registry.register('logradouro', myCallback);
	 * registry.has('logradouro'); // true
	 * 
	 * @example
	 * registry.register('bairro', null);
	 * registry.has('bairro'); // true (registered but null)
	 * 
	 * @example
	 * registry.has('nonexistent'); // false
	 * 
	 * @since 0.9.0-alpha
	 */
	has(type) {
		return this.callbacks.has(type);
	}
	
	/**
	 * Unregisters a callback for a specific type.
	 * 
	 * Removes the type from the registry completely (different from
	 * setting it to null with register()).
	 * 
	 * @param {string} type - Change type identifier
	 * @returns {boolean} True if callback was unregistered, false if it didn't exist
	 * 
	 * @example
	 * registry.unregister('logradouro');
	 * registry.has('logradouro'); // false
	 * 
	 * @example
	 * const success = registry.unregister('nonexistent'); // false
	 * 
	 * @since 0.9.0-alpha
	 */
	unregister(type) {
		return this.callbacks.delete(type);
	}
	
	/**
	 * Clears all registered callbacks.
	 * 
	 * Resets the registry to initial state with no callbacks registered.
	 * 
	 * @returns {void}
	 * 
	 * @example
	 * registry.clear();
	 * registry.has('logradouro'); // false
	 * registry.has('bairro'); // false
	 * 
	 * @since 0.9.0-alpha
	 */
	clear() {
		this.callbacks.clear();
	}
	
	/**
	 * Gets all registered callback types.
	 * 
	 * Returns an array of all type identifiers that have callbacks registered
	 * (including those explicitly set to null).
	 * 
	 * @returns {string[]} Array of registered type identifiers
	 * 
	 * @example
	 * registry.register('logradouro', callback1);
	 * registry.register('bairro', callback2);
	 * const types = registry.getRegisteredTypes(); // ['logradouro', 'bairro']
	 * 
	 * @example
	 * // Returns empty array when no callbacks registered
	 * const emptyRegistry = new CallbackRegistry();
	 * emptyRegistry.getRegisteredTypes(); // []
	 * 
	 * @since 0.9.0-alpha
	 */
	getRegisteredTypes() {
		return Array.from(this.callbacks.keys());
	}
	
	/**
	 * Gets the count of registered callbacks.
	 * 
	 * @returns {number} Number of registered callback types
	 * 
	 * @example
	 * registry.register('logradouro', callback);
	 * registry.register('bairro', callback);
	 * registry.size(); // 2
	 * 
	 * @since 0.9.0-alpha
	 */
	size() {
		return this.callbacks.size;
	}
	
	/**
	 * Checks if the registry is empty.
	 * 
	 * @returns {boolean} True if no callbacks are registered
	 * 
	 * @example
	 * const registry = new CallbackRegistry();
	 * registry.isEmpty(); // true
	 * 
	 * registry.register('logradouro', callback);
	 * registry.isEmpty(); // false
	 * 
	 * @since 0.9.0-alpha
	 */
	isEmpty() {
		return this.callbacks.size === 0;
	}
}

// Export for ES6 modules
export default CallbackRegistry;

// CommonJS compatibility (Node.js)
if (typeof module !== 'undefined' && module.exports) {
	module.exports = CallbackRegistry;
}
