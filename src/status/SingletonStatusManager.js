'use strict';

/**
 * SingletonStatusManager - Status and progress tracking with singleton pattern implementation.
 * 
 * This class provides centralized status management for the MP Barbosa Travel Guide system,
 * implementing the singleton pattern to ensure a single source of truth for application state.
 * It manages boolean flags for various operational states, particularly location tracking status.
 * 
 * **Design Patterns:**
 * - **Singleton Pattern**: Ensures only one instance exists throughout the application lifecycle
 * - **State Management**: Centralized status tracking with consistent interface
 * - **Thread Safety**: Instance creation is protected against race conditions
 * 
 * **Key Features:**
 * - Singleton pattern enforcement with proper instance management
 * - Location tracking status management with logging
 * - Immutable instance prevention after creation
 * - Browser and Node.js environment compatibility
 * - Memory-efficient single instance design
 * 
 * **Status Management:**
 * - `gettingLocation`: Boolean flag indicating if location acquisition is in progress
 * - Automatic logging of status changes for debugging and monitoring
 * - Consistent state access across all application components
 * 
 * **Thread Safety:**
 * - Protected instance creation prevents multiple instances in concurrent scenarios
 * - Static getInstance() method ensures safe singleton access
 * - Immutable instance after creation for data integrity
 * 
 * @class SingletonStatusManager
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * // Get singleton instance
 * const statusManager = SingletonStatusManager.getInstance();
 * 
 * @example
 * // Track location acquisition status
 * statusManager.setGettingLocation(true);
 * if (statusManager.isGettingLocation()) {
 *   console.log('Location acquisition in progress...');
 * }
 * 
 * @example
 * // Multiple references return same instance
 * const manager1 = SingletonStatusManager.getInstance();
 * const manager2 = SingletonStatusManager.getInstance();
 * console.log(manager1 === manager2); // true
 */
class SingletonStatusManager {
    /**
     * Creates a new SingletonStatusManager instance or returns existing instance.
     * 
     * This constructor implements the singleton pattern by checking for an existing
     * instance and returning it if found. If no instance exists, it creates a new
     * one, initializes the status flags, and stores it as the singleton instance.
     * 
     * **Singleton Pattern Implementation:**
     * 1. Check if static instance already exists
     * 2. If exists, return the existing instance (preserves singleton behavior)
     * 3. If not exists, initialize new instance with default state
     * 4. Store instance reference for future access
     * 5. Return the newly created instance
     * 
     * **Default State:**
     * - `gettingLocation`: false (no location acquisition in progress)
     * 
     * @constructor
     * @returns {SingletonStatusManager} The singleton instance
     * 
     * @example
     * // Direct instantiation (not recommended)
     * const manager = new SingletonStatusManager();
     * 
     * @example
     * // Multiple instantiations return same instance
     * const manager1 = new SingletonStatusManager();
     * const manager2 = new SingletonStatusManager();
     * console.log(manager1 === manager2); // true
     * 
     * @since 0.8.3-alpha
     */
    constructor() {
        // Singleton pattern: return existing instance if available
        if (SingletonStatusManager.instance) {
            return SingletonStatusManager.instance;
        }

        // Initialize status flags with default values
        this.gettingLocation = false;

        // Store this instance as the singleton reference
        SingletonStatusManager.instance = this;

        // Note: Object.freeze() is not applied to allow status updates
        // while maintaining singleton pattern integrity
    }

    /**
     * Checks if location acquisition is currently in progress.
     * 
     * This method provides read-only access to the location tracking status.
     * It returns the current state of the `gettingLocation` flag, which indicates
     * whether the application is actively attempting to acquire location data.
     * 
     * **Use Cases:**
     * - UI state management (show/hide loading indicators)
     * - Preventing concurrent location requests
     * - Conditional logic based on location acquisition state
     * - Status reporting and debugging
     * 
     * @returns {boolean} True if location acquisition is in progress, false otherwise
     * 
     * @example
     * // Check status before starting new location request
     * const statusManager = SingletonStatusManager.getInstance();
     * if (!statusManager.isGettingLocation()) {
     *   // Safe to start location acquisition
     *   startLocationTracking();
     * }
     * 
     * @example
     * // UI state management
     * const isActive = statusManager.isGettingLocation();
     * toggleLoadingSpinner(isActive);
     * 
     * @since 0.8.3-alpha
     */
    isGettingLocation() {
        return this.gettingLocation;
    }

    /**
     * Updates the location acquisition status with automatic logging.
     * 
     * This method sets the location tracking status and provides automatic logging
     * for debugging and monitoring purposes. It handles both starting and stopping
     * location acquisition processes with appropriate log messages.
     * 
     * **Logging Behavior:**
     * - When status is set to `true`: Logs "Getting location..."
     * - When status is set to `false`: Logs "Stopped getting location."
     * - Logging helps with debugging location acquisition workflows
     * 
     * **Thread Safety:**
     * - Method is safe to call from multiple contexts due to singleton nature
     * - Boolean assignment is atomic operation in JavaScript
     * 
     * @param {boolean} status - New location acquisition status
     * @returns {void}
     * 
     * @throws {TypeError} If status parameter is not a boolean
     * 
     * @example
     * // Start location acquisition
     * const statusManager = SingletonStatusManager.getInstance();
     * statusManager.setGettingLocation(true);
     * // Logs: "Getting location..."
     * 
     * @example
     * // Stop location acquisition
     * statusManager.setGettingLocation(false);
     * // Logs: "Stopped getting location."
     * 
     * @example
     * // Error handling
     * try {
     *   statusManager.setGettingLocation("invalid"); // TypeError
     * } catch (error) {
     *   console.error('Invalid status type:', error.message);
     * }
     * 
     * @since 0.8.3-alpha
     */
    setGettingLocation(status) {
        // Validate input parameter type
        if (typeof status !== 'boolean') {
            throw new TypeError(`Status must be a boolean, received: ${typeof status}`);
        }

        // Update the status flag
        this.gettingLocation = status;

        // Provide automatic logging for debugging and monitoring
        // Safely handle console availability across different environments
        if (typeof console !== 'undefined' && console.log) {
            if (status) {
                console.log('Getting location...');
            } else {
                console.log('Stopped getting location.');
            }
        }
    }

    /**
     * Gets the singleton instance of SingletonStatusManager.
     * 
     * This is the recommended way to access the SingletonStatusManager instance.
     * It ensures that only one instance exists throughout the application lifecycle
     * and provides a consistent interface for accessing the status manager.
     * 
     * **Singleton Pattern Benefits:**
     * - **Memory Efficiency**: Only one instance exists in memory
     * - **Consistency**: All components access the same state
     * - **Thread Safety**: Safe concurrent access to singleton instance
     * - **Global Access**: Available from anywhere in the application
     * 
     * **Implementation Details:**
     * - Creates new instance if none exists
     * - Returns existing instance if already created
     * - Thread-safe instance creation and access
     * 
     * @static
     * @returns {SingletonStatusManager} The singleton instance
     * 
     * @example
     * // Recommended usage pattern
     * const statusManager = SingletonStatusManager.getInstance();
     * statusManager.setGettingLocation(true);
     * 
     * @example
     * // Multiple calls return same instance
     * const manager1 = SingletonStatusManager.getInstance();
     * const manager2 = SingletonStatusManager.getInstance();
     * console.log(manager1 === manager2); // true
     * 
     * @example
     * // Safe to call from different modules
     * import SingletonStatusManager from './status/SingletonStatusManager.js';
     * const manager = SingletonStatusManager.getInstance();
     * 
     * @since 0.8.3-alpha
     */
    static getInstance() {
        // Create instance if it doesn't exist (lazy initialization)
        this.instance = this.instance || new SingletonStatusManager();
        return this.instance;
    }

    /**
     * Resets the singleton instance for testing purposes.
     * 
     * This method is primarily intended for unit testing scenarios where
     * a fresh instance is needed between test cases. In production code,
     * the singleton should maintain its state throughout the application lifecycle.
     * 
     * **Warning**: This method should only be used in testing environments.
     * Using it in production code breaks the singleton pattern guarantees.
     * 
     * @static
     * @returns {void}
     * 
     * @example
     * // In test setup
     * beforeEach(() => {
     *   SingletonStatusManager.resetInstance();
     * });
     * 
     * @example
     * // Testing fresh instance creation
     * SingletonStatusManager.resetInstance();
     * const manager = SingletonStatusManager.getInstance();
     * expect(manager.isGettingLocation()).toBe(false);
     * 
     * @since 0.8.3-alpha
     */
    static resetInstance() {
        SingletonStatusManager.instance = null;
    }

    /**
     * Returns a string representation of the SingletonStatusManager instance.
     * 
     * Provides a human-readable representation showing the class name and
     * current status values. Useful for logging, debugging, and monitoring
     * the current state of the status manager.
     * 
     * @returns {string} String representation with current status
     * 
     * @example
     * const statusManager = SingletonStatusManager.getInstance();
     * statusManager.setGettingLocation(true);
     * console.log(statusManager.toString());
     * // Output: "SingletonStatusManager: gettingLocation=true"
     * 
     * @example
     * // Default state
     * const manager = new SingletonStatusManager();
     * console.log(manager.toString());
     * // Output: "SingletonStatusManager: gettingLocation=false"
     * 
     * @since 0.8.3-alpha
     */
    toString() {
        return `${this.constructor.name}: gettingLocation=${this.gettingLocation}`;
    }
}

// Export for ES6 modules
export default SingletonStatusManager;

// Backward compatibility for window object (browser environments)
if (typeof window !== 'undefined') {
    window.SingletonStatusManager = SingletonStatusManager;
}