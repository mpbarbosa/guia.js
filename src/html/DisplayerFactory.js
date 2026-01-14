'use strict';

/**
 * Factory for creating displayer instances with dependency injection support.
 * 
 * This factory provides a centralized point for creating displayer objects,
 * enabling dependency injection and easier testing. The factory methods are
 * pure functions that create displayer instances without side effects, following
 * MP Barbosa standards for referential transparency and clean architecture.
 * 
 * **Key Features**:
 * - Centralized displayer creation with consistent APIs
 * - Dependency injection support for testing and alternative implementations
 * - Pure functions with no side effects or state mutations
 * - Support for all HTML displayer types (Position, Address, Reference Place)
 * - Immutable design following MP Barbosa standards
 * 
 * **Design Principles**:
 * - **Single Responsibility**: Focused solely on displayer creation
 * - **Dependency Injection**: Enables mock displayer injection for testing
 * - **Factory Pattern**: Provides single point of control for displayer creation
 * - **Referential Transparency**: Pure functions with predictable outputs
 * - **Immutability**: All created displayers are frozen to prevent modification
 * 
 * **Usage**:
 * ```javascript
 * // Default usage for production
 * const posDisplayer = DisplayerFactory.createPositionDisplayer(element);
 * 
 * // Custom factory for testing
 * class MockDisplayerFactory {
 *     static createPositionDisplayer(element) {
 *         return new MockPositionDisplayer(element);
 *     }
 * }
 * ```
 * 
 * @class DisplayerFactory
 * @since 0.8.6-alpha
 * @author Marcelo Pereira Barbosa
 */

import HTMLPositionDisplayer from './HTMLPositionDisplayer.js';
import HTMLAddressDisplayer from './HTMLAddressDisplayer.js';
import HTMLReferencePlaceDisplayer from './HTMLReferencePlaceDisplayer.js';

class DisplayerFactory {
	/**
	 * Private constructor to prevent instantiation.
	 * DisplayerFactory is a static factory class - use static methods instead.
	 * 
	 * @throws {Error} Always throws - this class cannot be instantiated
	 */
	constructor() {
		throw new Error('DisplayerFactory is a static factory class and cannot be instantiated. Use static methods instead.');
	}

	/**
	 * Creates a position displayer instance for geographic coordinate display.
	 * 
	 * Creates an HTMLPositionDisplayer instance configured for displaying
	 * position information including coordinates, accuracy, altitude, and
	 * movement data with Brazilian Portuguese localization.
	 * 
	 * The created displayer is automatically frozen to prevent modification,
	 * following MP Barbosa immutability standards.
	 * 
	 * @param {HTMLElement|string} element - DOM element or element ID for display
	 * @returns {HTMLPositionDisplayer} Position displayer instance (frozen)
	 * 
	 * @example
	 * // With DOM element
	 * const element = document.getElementById('position-display');
	 * const displayer = DisplayerFactory.createPositionDisplayer(element);
	 * 
	 * @example
	 * // With element ID string
	 * const displayer = DisplayerFactory.createPositionDisplayer('position-display');
	 * 
	 * @since 0.8.6-alpha
	 */
	static createPositionDisplayer(element) {
		const displayer = new HTMLPositionDisplayer(element);
		return displayer; // HTMLPositionDisplayer already freezes itself
	}

	/**
	 * Creates an address displayer instance for comprehensive address visualization.
	 * 
	 * Creates an HTMLAddressDisplayer instance configured for displaying
	 * comprehensive address information including raw geocoding data and
	 * standardized Brazilian address formatting with progressive disclosure.
	 * 
	 * Supports optional standardized address display element for dual
	 * raw/standardized address presentation.
	 * 
	 * The created displayer is automatically frozen to prevent modification,
	 * following MP Barbosa immutability standards.
	 * 
	 * @param {HTMLElement|string} element - DOM element or element ID for main display
	 * @param {HTMLElement|string|boolean} [enderecoPadronizadoDisplay=false] - Element for standardized address display
	 * @returns {HTMLAddressDisplayer} Address displayer instance (frozen)
	 * 
	 * @example
	 * // Basic usage without standardized display
	 * const displayer = DisplayerFactory.createAddressDisplayer(mainElement);
	 * 
	 * @example
	 * // With standardized address display element
	 * const mainElement = document.getElementById('address-display');
	 * const standardizedElement = document.getElementById('standardized-display');
	 * const displayer = DisplayerFactory.createAddressDisplayer(mainElement, standardizedElement);
	 * 
	 * @since 0.8.6-alpha
	 */
	static createAddressDisplayer(element, enderecoPadronizadoDisplay = false) {
		const displayer = new HTMLAddressDisplayer(element, enderecoPadronizadoDisplay);
		return displayer; // HTMLAddressDisplayer already freezes itself
	}

	/**
	 * Creates a reference place displayer instance for Brazilian place visualization.
	 * 
	 * Creates an HTMLReferencePlaceDisplayer instance configured for displaying
	 * reference place information including shopping centers, subway stations,
	 * cafes, and other points of interest with Portuguese localization.
	 * 
	 * The created displayer integrates with the BrazilianStandardAddress system
	 * and provides semantic HTML structure for Brazilian place types.
	 * 
	 * The created displayer is automatically frozen to prevent modification,
	 * following MP Barbosa immutability standards.
	 * 
	 * @param {HTMLElement|string} element - DOM element or element ID for display
	 * @param {HTMLElement|boolean} [referencePlaceDisplay=false] - Additional display element or flag
	 * @returns {HTMLReferencePlaceDisplayer} Reference place displayer instance (frozen)
	 * 
	 * @example
	 * // Basic usage
	 * const element = document.getElementById('reference-place-display');
	 * const displayer = DisplayerFactory.createReferencePlaceDisplayer(element);
	 * 
	 * @example
	 * // With additional display element
	 * const mainElement = document.getElementById('main-display');
	 * const additionalElement = document.getElementById('reference-detail');
	 * const displayer = DisplayerFactory.createReferencePlaceDisplayer(mainElement, additionalElement);
	 * 
	 * @since 0.8.6-alpha
	 */
	static createReferencePlaceDisplayer(element, referencePlaceDisplay = false) {
		const displayer = new HTMLReferencePlaceDisplayer(element, referencePlaceDisplay);
		return displayer; // HTMLReferencePlaceDisplayer already freezes itself
	}

	/**
	 * Returns a string representation of the DisplayerFactory class.
	 * 
	 * Provides information about the factory class for debugging and logging.
	 * Since this is a static factory class, the string representation includes
	 * the class name and available factory methods.
	 * 
	 * @returns {string} String representation of the factory
	 * 
	 * @example
	 * console.log(DisplayerFactory.toString());
	 * // Output: "DisplayerFactory: 3 factory methods available"
	 * 
	 * @since 0.8.6-alpha
	 */
	static toString() {
		return `${this.name}: 3 factory methods available`;
	}
}

// Freeze the class to prevent modifications
Object.freeze(DisplayerFactory);

export default DisplayerFactory;
/**
 * Module exports for HTML displayer factory.
 * @exports DisplayerFactory - Factory for creating HTML display components
 */
export { DisplayerFactory };

// Export to window for browser compatibility
if (typeof window !== 'undefined') {
	window.DisplayerFactory = DisplayerFactory;
}