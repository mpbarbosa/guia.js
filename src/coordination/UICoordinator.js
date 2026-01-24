'use strict';

/**
 * UICoordinator - Manages UI element initialization and DOM manipulation
 * 
 * @fileoverview Handles all DOM-related operations for WebGeocodingManager.
 * This class is responsible for finding, caching, and providing access to
 * UI elements, as well as updating UI display elements.
 * 
 * **Single Responsibility**: UI/DOM concerns only
 * 
 * **Design Principles**:
 * - Separation of Concerns: Isolates DOM manipulation from business logic
 * - Dependency Injection: Receives document and configuration
 * - Encapsulation: Hides internal element cache from consumers
 * - Immutability: Frozen element IDs configuration
 * 
 * @module coordination/UICoordinator
 * @since 0.7.0-alpha - Phase 1: WebGeocodingManager refactoring
 * @author Marcelo Pereira Barbosa
 * 
 * @requires utils/logger
 * 
 * @example
 * // Basic usage
 * const coordinator = new UICoordinator(document, {
 *   chronometer: 'chronometer',
 *   findRestaurantsBtn: 'find-restaurants-btn',
 *   timestampDisplay: 'tsPosCapture'
 * });
 * 
 * coordinator.initializeElements();
 * const button = coordinator.getElement('findRestaurantsBtn');
 * 
 * @example
 * // Update timestamp
 * coordinator.updateTimestamp(Date.now());
 */

import { log, warn } from '../utils/logger.js';

/**
 * UICoordinator class - Manages UI elements and DOM updates
 * 
 * @class
 */
class UICoordinator {
    /**
     * Creates a new UICoordinator instance
     * 
     * @param {Document} document - The document object to query for elements
     * @param {Object} elementIds - Configuration object mapping element names to IDs
     * @param {string} [elementIds.chronometer] - ID for chronometer element
     * @param {string} [elementIds.findRestaurantsBtn] - ID for find restaurants button
     * @param {string} [elementIds.cityStatsBtn] - ID for city stats button
     * @param {string} [elementIds.timestampDisplay] - ID for timestamp display element
     * @param {Object} [elementIds.speechSynthesis] - Speech synthesis element IDs
     * 
     * @throws {TypeError} If document is not provided
     * @throws {TypeError} If elementIds is not an object
     * 
     * @example
     * const coordinator = new UICoordinator(document, {
     *   chronometer: 'chronometer',
     *   findRestaurantsBtn: 'find-restaurants-btn'
     * });
     */
    constructor(document, elementIds = {}) {
        if (!document) {
            throw new TypeError('UICoordinator: document is required');
        }
        if (typeof elementIds !== 'object' || elementIds === null) {
            throw new TypeError('UICoordinator: elementIds must be an object');
        }

        /**
         * Document object for DOM queries
         * @type {Document}
         * @private
         */
        this._document = document;

        /**
         * Element ID configuration (frozen for immutability)
         * @type {Object}
         * @private
         */
        this._elementIds = Object.freeze({ ...elementIds });

        /**
         * Cached DOM elements
         * @type {Object.<string, HTMLElement|null>}
         * @private
         */
        this._elements = {};
    }

    /**
     * Initialize all UI elements by querying the DOM
     * 
     * Finds and caches all configured elements. Missing elements are logged
     * as warnings but do not throw errors (allows partial UI configurations).
     * 
     * @returns {Object} - Frozen map of element names to DOM elements
     * 
     * @example
     * const elements = coordinator.initializeElements();
     * log(elements.chronometer); // HTMLElement or null
     */
    initializeElements() {
        this._elements.chronometer = this._findElement('chronometer');
        this._elements.findRestaurantsBtn = this._findElement('findRestaurantsBtn');
        this._elements.cityStatsBtn = this._findElement('cityStatsBtn');
        this._elements.timestampDisplay = this._findElement('timestampDisplay');
        
        log('UICoordinator: Elements initialized', {
            found: Object.values(this._elements).filter(el => el !== null).length,
            total: Object.keys(this._elements).length
        });

        return Object.freeze({ ...this._elements });
    }

    /**
     * Get a specific UI element by name
     * 
     * @param {string} name - Element name (key from element cache)
     * @returns {HTMLElement|null} - The cached element or null if not found
     * 
     * @example
     * const button = coordinator.getElement('findRestaurantsBtn');
     * if (button) {
     *   button.addEventListener('click', handler);
     * }
     */
    getElement(name) {
        return this._elements[name] || null;
    }

    /**
     * Check if an element exists in the cache
     * 
     * @param {string} name - Element name
     * @returns {boolean} - True if element exists and is not null
     * 
     * @example
     * if (coordinator.hasElement('chronometer')) {
     *   // Use chronometer element
     * }
     */
    hasElement(name) {
        return this._elements[name] !== null && this._elements[name] !== undefined;
    }

    /**
     * Get all cached elements
     * 
     * @returns {Object} - Frozen copy of all cached elements
     * 
     * @example
     * const allElements = coordinator.getAllElements();
     * log(Object.keys(allElements)); // ['chronometer', 'findRestaurantsBtn', ...]
     */
    getAllElements() {
        return Object.freeze({ ...this._elements });
    }

    /**
     * Update timestamp display element
     * 
     * Formats and displays a timestamp in Brazilian Portuguese locale.
     * 
     * @param {number} timestamp - Unix timestamp in milliseconds
     * 
     * @example
     * coordinator.updateTimestamp(Date.now());
     * // Displays: "10/01/2026, 15:30:45"
     */
    updateTimestamp(timestamp) {
        const element = this._elements.timestampDisplay;
        if (element) {
            element.textContent = new Date(timestamp).toLocaleString('pt-BR');
            log('UICoordinator: Timestamp updated', { timestamp });
        } else {
            warn('UICoordinator: Timestamp display element not available');
        }
    }

    /**
     * Update chronometer display element
     * 
     * @param {string} text - Text to display in chronometer element
     * 
     * @example
     * coordinator.updateChronometer('00:05:23');
     */
    updateChronometer(text) {
        const element = this._elements.chronometer;
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Enable or disable a button element
     * 
     * @param {string} name - Element name
     * @param {boolean} enabled - True to enable, false to disable
     * 
     * @example
     * coordinator.setButtonEnabled('findRestaurantsBtn', false);
     */
    setButtonEnabled(name, enabled) {
        const element = this._elements[name];
        if (element && element.disabled !== undefined) {
            element.disabled = !enabled;
        }
    }

    /**
     * Clear cached elements (useful for testing or reinitialization)
     * 
     * @example
     * coordinator.clearElements();
     * coordinator.initializeElements(); // Reinitialize
     */
    clearElements() {
        this._elements = {};
        log('UICoordinator: Elements cleared');
    }

    /**
     * Get element ID configuration
     * 
     * @returns {Object} - Frozen copy of element IDs
     * 
     * @example
     * const config = coordinator.getElementIds();
     * log(config.chronometer); // 'chronometer'
     */
    getElementIds() {
        return this._elementIds;
    }

    /**
     * Find element by ID with warning if not found
     * 
     * @param {string} elementName - Key in elementIds configuration
     * @returns {HTMLElement|null} - Found element or null
     * @private
     * 
     * @example
     * const element = this._findElement('chronometer');
     */
    _findElement(elementName) {
        const elementId = this._elementIds[elementName];
        if (!elementId) {
            return null;
        }

        const element = this._document.getElementById(elementId);
        if (!element) {
            warn(`UICoordinator: Element '${elementId}' (${elementName}) not found in document`);
        }
        return element;
    }

    /**
     * Get string representation for debugging
     * 
     * @returns {string} - Debug string
     * 
     * @example
     * log(coordinator.toString());
     * // "UICoordinator: 4 elements (3 found, 1 missing)"
     */
    toString() {
        const total = Object.keys(this._elements).length;
        const found = Object.values(this._elements).filter(el => el !== null).length;
        const missing = total - found;
        return `UICoordinator: ${total} elements (${found} found, ${missing} missing)`;
    }
}

export default UICoordinator;
