'use strict';

/**
 * GeocodingState - Centralized state management for geocoding data
 * 
 * @fileoverview Manages the current position and coordinate state for the geocoding workflow.
 * Implements the Observer pattern to notify subscribers of state changes.
 * This class follows the Single Responsibility Principle by focusing solely on state management.
 * 
 * **Design Principles:**
 * - **Single Responsibility:** State management only
 * - **Immutability:** Returns defensive copies of state
 * - **Observer Pattern:** Notify observers of state changes
 * - **Encapsulation:** Private state with public accessors
 * 
 * @module core/GeocodingState
 * @since 0.7.0-alpha - Extracted from WebGeocodingManager during Phase 17 refactoring
 * @author Marcelo Pereira Barbosa
 * 
 * @requires core/GeoPosition
 * @requires utils/logger
 * 
 * @example
 * // Basic usage
 * import GeocodingState from './core/GeocodingState.js';
 * 
 * const state = new GeocodingState();
 * 
 * // Subscribe to state changes
 * state.subscribe((stateSnapshot) => {
 *   console.log('Position updated:', stateSnapshot.position);
 * });
 * 
 * // Set position (triggers notification)
 * const position = new GeoPosition(browserPosition);
 * state.setPosition(position);
 * 
 * @example
 * // Get current state
 * const coords = state.getCurrentCoordinates();
 * console.log(coords.latitude, coords.longitude);
 * 
 * const position = state.getCurrentPosition();
 * console.log(position.accuracy, position.accuracyQuality);
 */

import GeoPosition from './GeoPosition.js';
import { warn } from '../utils/logger.js';

/**
 * GeocodingState class - Manages position and coordinate state
 * 
 * @class
 */
class GeocodingState {
    /**
     * Creates a new GeocodingState instance
     * 
     * @constructor
     */
    constructor() {
        /**
         * Current position (GeoPosition instance)
         * @type {GeoPosition|null}
         * @private
         */
        this._currentPosition = null;

        /**
         * Current coordinates (extracted from position)
         * @type {Object|null}
         * @private
         */
        this._currentCoordinates = null;

        /**
         * State change observers (callbacks)
         * @type {Function[]}
         * @private
         */
        this._observers = [];
    }

    /**
     * Set current position and notify observers
     * 
     * @param {GeoPosition|null} position - The new position, or null to clear
     * @throws {TypeError} If position is not a GeoPosition instance or null
     * @returns {GeocodingState} This instance for chaining
     * 
     * @example
     * const position = new GeoPosition(browserPosition);
     * state.setPosition(position);
     * 
     * @example
     * state.setPosition(null); // Clear position
     */
    setPosition(position) {
        if (position !== null && !(position instanceof GeoPosition)) {
            throw new TypeError('GeocodingState: position must be a GeoPosition instance or null');
        }

        this._currentPosition = position;
        this._currentCoordinates = position ? {
            latitude: position.latitude,
            longitude: position.longitude
        } : null;

        if (position !== null) {
            this._notifyObservers();
        }
        
        return this;
    }

    /**
     * Get current position
     * 
     * @returns {GeoPosition|null} The current position or null if not set
     * 
     * @example
     * const position = state.getCurrentPosition();
     * if (position) {
     *   console.log(position.latitude, position.accuracyQuality);
     * }
     */
    getCurrentPosition() {
        return this._currentPosition;
    }

    /**
     * Get current coordinates (defensive copy)
     * 
     * @returns {Object|null} Coordinates object {latitude, longitude} or null
     * 
     * @example
     * const coords = state.getCurrentCoordinates();
     * if (coords) {
     *   console.log(`Lat: ${coords.latitude}, Lon: ${coords.longitude}`);
     * }
     */
    getCurrentCoordinates() {
        return this._currentCoordinates ? { ...this._currentCoordinates } : null;
    }

    /**
     * Check if position is available
     * 
     * @returns {boolean} True if position is set
     * 
     * @example
     * if (state.hasPosition()) {
     *   const coords = state.getCurrentCoordinates();
     *   // Use coordinates...
     * }
     */
    hasPosition() {
        return this._currentPosition !== null;
    }

    /**
     * Subscribe to state changes
     * 
     * Callback receives a state snapshot object with position and coordinates.
     * 
     * @param {Function} callback - Called when state changes: (stateSnapshot) => void
     * @returns {Function} Unsubscribe function
     * @throws {TypeError} If callback is not a function
     * 
     * @example
     * const unsubscribe = state.subscribe((stateSnapshot) => {
     *   console.log('New position:', stateSnapshot.position);
     *   console.log('Coordinates:', stateSnapshot.coordinates);
     * });
     * 
     * // Later, unsubscribe
     * unsubscribe();
     */
    subscribe(callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('GeocodingState: callback must be a function');
        }
        this._observers.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this._observers.indexOf(callback);
            if (index > -1) {
                this._observers.splice(index, 1);
            }
        };
    }

    /**
     * Unsubscribe from state changes
     * 
     * @param {Function} callback - The callback to remove
     * @returns {boolean} True if callback was found and removed
     * 
     * @example
     * const handler = (state) => console.log(state);
     * state.subscribe(handler);
     * // Later...
     * state.unsubscribe(handler);
     */
    unsubscribe(callback) {
        const index = this._observers.indexOf(callback);
        if (index > -1) {
            this._observers.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Get number of active observers
     * 
     * @returns {number} Number of subscribed observers
     * 
     * @example
     * console.log(`Active observers: ${state.getObserverCount()}`);
     */
    getObserverCount() {
        return this._observers.length;
    }

    /**
     * Clear all observers
     * 
     * Useful for cleanup or testing.
     * 
     * @example
     * state.clearObservers();
     */
    clearObservers() {
        this._observers = [];
    }

    /**
     * Clear current position state
     * 
     * @example
     * state.clear();
     * console.log(state.hasPosition()); // false
     */
    clear() {
        this._currentPosition = null;
        this._currentCoordinates = null;
    }

    /**
     * Notify all observers of state change
     * 
     * Observers receive a state snapshot with position and coordinates.
     * Errors in observer callbacks are caught and logged.
     * 
     * @private
     */
    _notifyObservers() {
        const stateSnapshot = {
            position: this._currentPosition,
            coordinates: this.getCurrentCoordinates()
        };

        this._observers.forEach(callback => {
            try {
                callback(stateSnapshot);
            } catch (error) {
                warn('GeocodingState: Error notifying observer', error);
            }
        });
    }

    /**
     * Get string representation of current state
     * 
     * @returns {string} State summary
     * 
     * @example
     * console.log(state.toString());
     * // "GeocodingState: position: available, coordinates: (lat, lon), observers: 2"
     */
    toString() {
        const hasPos = this._currentPosition ? 'available' : 'null';
        const coords = this._currentCoordinates ?
            `(${this._currentCoordinates.latitude.toFixed(4)}, ${this._currentCoordinates.longitude.toFixed(4)})` :
            'null';
        return `GeocodingState: position: ${hasPos}, coordinates: ${coords}, observers: ${this._observers.length}`;
    }
}

export default GeocodingState;
