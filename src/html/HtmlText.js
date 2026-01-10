'use strict';

/**
 * Manages HTML text content updates with timestamp formatting.
 * 
 * This class handles HTML text element updates with automatic timestamp formatting
 * for position management systems. It implements the observer pattern to automatically
 * update text content when position data becomes available.
 * 
 * **Key Features**:
 * - Automatic timestamp formatting with localized display
 * - Observer pattern integration with position management systems
 * - Error and loading state handling
 * - Immutable design following MP Barbosa standards
 * - Configurable event names for different observer systems
 * 
 * **Usage**:
 * ```javascript
 * const textElement = document.getElementById('timestamp');
 * const htmlText = new HtmlText(document, textElement);
 * 
 * // Subscribe to position updates (example with PositionManager)
 * positionManager.subscribe(htmlText);
 * 
 * // Manual update
 * htmlText.update(positionManager, 'position.updated', false, null);
 * ```
 * 
 * @class HtmlText
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class HtmlText {
	/**
	 * Creates a new HtmlText instance.
	 * 
	 * Initializes the HTML text manager with a DOM document and target element
	 * for text updates. The instance is frozen after creation to prevent
	 * modification, following MP Barbosa immutability standards.
	 * 
	 * @param {Document} document - Document object for DOM operations
	 * @param {HTMLElement} element - Target DOM element for text updates
	 * @param {Object} [eventConfig] - Configuration object for position events
	 * @param {string} [eventConfig.positionUpdate='strCurrPosUpdate'] - Event name for successful position updates
	 * @param {string} [eventConfig.immediateAddressUpdate='strImmediateAddressUpdate'] - Event name for immediate address updates
	 * 
	 * @example
	 * // Basic usage with default PositionManager events
	 * const element = document.getElementById('timestamp');
	 * const htmlText = new HtmlText(document, element);
	 * 
	 * @example
	 * // Custom event configuration for different observer systems
	 * const htmlText = new HtmlText(document, element, {
	 *   positionUpdate: 'location.updated',
	 *   immediateAddressUpdate: 'address.immediate'
	 * });
	 */
	constructor(document, element, eventConfig = {}) {
		this.document = document;
		this.element = element;
		
		// Configure event names with defaults matching PositionManager constants
		this.eventConfig = {
			positionUpdate: eventConfig.positionUpdate || 'PositionManager updated',
			immediateAddressUpdate: eventConfig.immediateAddressUpdate || 'Immediate address update'
		};
		
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	/**
	 * Updates the element with current timestamp on position changes.
	 * 
	 * Observer pattern update method that gets called when a position management
	 * system has new position data available. The HTML text manager responds to
	 * different position events by updating the text content with timestamps,
	 * error messages, or loading indicators.
	 * 
	 * **Event Handling**:
	 * - Position update events: Display current timestamp with localized formatting
	 * - Immediate address events: Display current timestamp with localized formatting
	 * - Error states: Display error message with context
	 * - Loading states: Display "Loading..." message
	 * 
	 * Event names are configurable via constructor eventConfig parameter.
	 * 
	 * @param {Object} positionManager - The position manager instance
	 * @param {string} posEvent - The position event type
	 * @param {Object} loading - Loading state information
	 * @param {Object} error - Error information if any
	 * @returns {void}
	 * @since 0.8.3-alpha
	 * 
	 * @example
	 * // Typically called automatically via observer pattern
	 * positionManager.subscribe(htmlText);
	 */
	update(positionManager, posEvent, loading, error) {
		if (this.element) {
			if (error) {
				this.element.textContent = `Error: ${error.message}`;
			} else if (loading) {
				this.element.textContent = "Loading...";
			} else if (posEvent === this.eventConfig.positionUpdate ||
				posEvent === this.eventConfig.immediateAddressUpdate) {
				this.element.textContent = new Date().toLocaleString();
			}
		}
	}

	/**
	 * Returns a string representation of the HtmlText instance.
	 * 
	 * Provides a human-readable representation showing the class name
	 * and the target element's ID (or 'no-id' if not set). Useful for
	 * debugging and logging purposes.
	 * 
	 * @returns {string} String representation with class name and element ID
	 * @since 0.8.3-alpha
	 * 
	 * @example
	 * console.log(htmlText.toString());
	 * // Output: "HtmlText: timestamp-display" (if element has id="timestamp-display")
	 * // Output: "HtmlText: no-id" (if element has no id)
	 */
	toString() {
		return `${this.constructor.name}: ${this.element?.id || 'no-id'}`;
	}
}

export default HtmlText;