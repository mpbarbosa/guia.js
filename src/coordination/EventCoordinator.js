'use strict';

/**
 * EventCoordinator - Manages event handling and user interactions
 * 
 * @fileoverview Handles all DOM event listeners for WebGeocodingManager.
 * This class is responsible for setting up, managing, and cleaning up
 * event listeners for UI buttons and interactive elements.
 * 
 * **Single Responsibility**: Event handling only
 * 
 * **Design Principles**:
 * - Separation of Concerns: Isolates event handling from business logic
 * - Dependency Injection: Receives UICoordinator and GeocodingState
 * - Resource Management: Tracks handlers for proper cleanup
 * - Extensibility: Supports external callback delegation (window functions)
 * 
 * @module coordination/EventCoordinator
 * @since 0.9.0-alpha - Phase 1: WebGeocodingManager refactoring
 * @author Marcelo Pereira Barbosa
 * 
 * @requires utils/logger
 * 
 * @example
 * // Basic usage
 * const eventCoordinator = new EventCoordinator(uiCoordinator, geocodingState);
 * eventCoordinator.initializeEventListeners();
 * 
 * // Later, cleanup
 * eventCoordinator.removeEventListeners();
 * 
 * @example
 * // With external handlers (window integration)
 * window.findNearbyRestaurants = (lat, lon) => {
 *   log(`Finding restaurants at ${lat}, ${lon}`);
 * };
 * eventCoordinator.initializeEventListeners();
 */

import { log, warn } from '../utils/logger.js';
import { showError, showInfo } from '../utils/toast.js';

/**
 * EventCoordinator class - Manages event listeners and handlers
 * 
 * @class
 */
class EventCoordinator {
    /**
     * Creates a new EventCoordinator instance
     * 
     * @param {UICoordinator} uiCoordinator - UI coordinator for accessing DOM elements
     * @param {GeocodingState} geocodingState - State manager for current position/coordinates
     * 
     * @throws {TypeError} If uiCoordinator is not provided
     * @throws {TypeError} If geocodingState is not provided
     * 
     * @example
     * const coordinator = new EventCoordinator(uiCoordinator, geocodingState);
     */
    constructor(uiCoordinator, geocodingState) {
        if (!uiCoordinator) {
            throw new TypeError('EventCoordinator: uiCoordinator is required');
        }
        if (!geocodingState) {
            throw new TypeError('EventCoordinator: geocodingState is required');
        }

        /**
         * UI coordinator for accessing DOM elements
         * @type {UICoordinator}
         * @private
         */
        this._uiCoordinator = uiCoordinator;

        /**
         * State manager for position/coordinates
         * @type {GeocodingState}
         * @private
         */
        this._geocodingState = geocodingState;

        /**
         * Map of elements to their event handlers (for cleanup)
         * @type {Map<HTMLElement, {type: string, listener: Function}>}
         * @private
         */
        this._handlers = new Map();

        /**
         * Flag to track if listeners are initialized
         * @type {boolean}
         * @private
         */
        this._initialized = false;
    }

    /**
     * Initialize all event listeners for buttons
     * 
     * Sets up click handlers for:
     * - Find restaurants button
     * - City statistics button
     * 
     * Can be called multiple times safely (idempotent).
     * 
     * @returns {EventCoordinator} This instance for chaining
     * 
     * @example
     * coordinator.initializeEventListeners();
     */
    initializeEventListeners() {
        if (this._initialized) {
            warn('EventCoordinator: Event listeners already initialized');
            return this;
        }

        this._setupFindRestaurantsButton();
        this._setupCityStatsButton();
        
        this._initialized = true;
        
        log('EventCoordinator: Event listeners initialized', {
            handlersCount: this._handlers.size
        });

        return this;
    }

    /**
     * Remove all event listeners (cleanup)
     * 
     * Properly cleans up all registered event handlers to prevent memory leaks.
     * Safe to call multiple times.
     * 
     * @returns {EventCoordinator} This instance for chaining
     * 
     * @example
     * coordinator.removeEventListeners();
     */
    removeEventListeners() {
        this._handlers.forEach((handlerInfo, element) => {
            const { type, listener } = handlerInfo;
            element.removeEventListener(type, listener);
        });
        
        const removedCount = this._handlers.size;
        this._handlers.clear();
        this._initialized = false;
        
        log('EventCoordinator: Event listeners removed', { removedCount });

        return this;
    }

    /**
     * Check if event listeners are initialized
     * 
     * @returns {boolean} True if listeners are initialized
     * 
     * @example
     * if (coordinator.isInitialized()) {
     *   log('Event listeners are active');
     * }
     */
    isInitialized() {
        return this._initialized;
    }

    /**
     * Get count of registered event handlers
     * 
     * @returns {number} Number of active event handlers
     * 
     * @example
     * log(`Active handlers: ${coordinator.getHandlerCount()}`);
     */
    getHandlerCount() {
        return this._handlers.size;
    }

    /**
     * Setup find restaurants button click handler
     * 
     * @private
     */
    _setupFindRestaurantsButton() {
        const button = this._uiCoordinator.getElement('findRestaurantsBtn');
        if (!button) {
            // Button removed - feature not available
            return;
        }

        const handler = () => this._handleFindRestaurants();
        button.addEventListener('click', handler);
        this._handlers.set(button, { type: 'click', listener: handler });
        
        log('EventCoordinator: Find restaurants button handler attached');
    }

    /**
     * Handle find restaurants button click
     * 
     * Delegates to window.findNearbyRestaurants if available,
     * otherwise shows an alert with coordinates.
     * 
     * @private
     */
    _handleFindRestaurants() {
        const coords = this._geocodingState.getCurrentCoordinates();
        
        if (!coords) {
            showError('Coordenadas atuais não disponíveis.');
            warn('EventCoordinator: Find restaurants clicked but coordinates not available');
            return;
        }

        log('EventCoordinator: Find restaurants requested', coords);

        // Check if external handler exists
        if (typeof window !== 'undefined' && typeof window.findNearbyRestaurants === 'function') {
            window.findNearbyRestaurants(coords.latitude, coords.longitude);
        } else {
            // Fallback: show info toast
            const message = `Procurando restaurantes próximos a ` +
                `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
            showInfo(message);
        }
    }

    /**
     * Setup city stats button click handler
     * 
     * @private
     */
    _setupCityStatsButton() {
        const button = this._uiCoordinator.getElement('cityStatsBtn');
        if (!button) {
            // Button removed - feature not available
            return;
        }

        const handler = () => this._handleCityStats();
        button.addEventListener('click', handler);
        this._handlers.set(button, { type: 'click', listener: handler });
        
        log('EventCoordinator: City stats button handler attached');
    }

    /**
     * Handle city stats button click
     * 
     * Delegates to window.fetchCityStatistics if available,
     * otherwise shows an alert with coordinates.
     * 
     * @private
     */
    _handleCityStats() {
        const coords = this._geocodingState.getCurrentCoordinates();
        
        if (!coords) {
            showError('Coordenadas atuais não disponíveis.');
            warn('EventCoordinator: City stats clicked but coordinates not available');
            return;
        }

        log('EventCoordinator: City stats requested', coords);

        // Check if external handler exists
        if (typeof window !== 'undefined' && typeof window.fetchCityStatistics === 'function') {
            window.fetchCityStatistics(coords.latitude, coords.longitude);
        } else {
            // Fallback: show info toast
            const message = `Obtendo estatísticas da cidade para ` +
                `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
            showInfo(message);
        }
    }

    /**
     * Get string representation for debugging
     * 
     * @returns {string} Debug string
     * 
     * @example
     * log(coordinator.toString());
     * // "EventCoordinator: 2 handlers (initialized)"
     */
    toString() {
        const status = this._initialized ? 'initialized' : 'not initialized';
        return `EventCoordinator: ${this._handlers.size} handlers (${status})`;
    }
}

export default EventCoordinator;
