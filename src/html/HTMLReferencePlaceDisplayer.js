'use strict';
import { log, warn, error } from '../utils/logger.js';
import { escapeHtml } from '../utils/html-sanitizer.js';

import { ADDRESS_FETCHED_EVENT, NO_REFERENCE_PLACE } from "../config/defaults.js";

/**
 * HTML-based reference place information displayer with Portuguese localization.
 * @version 0.7.1-alpha
 * 
 * This class handles the display of reference place information in HTML format,
 * including shopping centers, subway stations, cafes, and other points of interest.
 * It implements the observer pattern to automatically update displays when
 * reference place data changes and provides comprehensive formatting for Brazilian
 * Portuguese users.
 * 
 * **Key Features**:
 * - Reference place display with Portuguese descriptions
 * - Observer pattern integration for automatic updates
 * - Brazilian Portuguese localization
 * - Error and loading state handling
 * - Immutable design following MP Barbosa standards
 * - Integration with BrazilianStandardAddress system
 * 
 * **Usage**:
 * ```javascript
 * const referencePlaceElement = document.getElementById('reference-place-display');
 * const displayer = new HTMLReferencePlaceDisplayer(referencePlaceElement);
 * 
 * // Subscribe to address updates (example with ReverseGeocoder)
 * reverseGeocoder.subscribe(displayer);
 * 
 * // Manual update
 * displayer.update(addressData, standardizedAddress, 'strCurrPosUpdate', false, null);
 * ```
 * 
 * @class HTMLReferencePlaceDisplayer
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class HTMLReferencePlaceDisplayer {
	/**
	 * Creates a new HTMLReferencePlaceDisplayer instance.
	 * 
	 * Initializes the reference place displayer with a target DOM element for rendering
	 * reference place information. The instance is frozen after creation to prevent
	 * modification, following MP Barbosa immutability standards.
	 * 
	 * @param {HTMLElement} element - Target DOM element for reference place display
	 * @param {HTMLElement|boolean} [referencePlaceDisplay=false] - Additional display element or flag
	 * 
	 * @example
	 * // Basic usage
	 * const element = document.getElementById('reference-place-display');
	 * const displayer = new HTMLReferencePlaceDisplayer(element);
	 * 
	 * @example
	 * // With additional display element
	 * const mainElement = document.getElementById('main-display');
	 * const additionalElement = document.getElementById('reference-detail');
	 * const displayer = new HTMLReferencePlaceDisplayer(mainElement, additionalElement);
	 * 
	 * @since 0.8.3-alpha
	 */
	constructor(element, referencePlaceDisplay = false) {
		this.element = element;
		this.referencePlaceDisplay = referencePlaceDisplay;
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	/**
	 * Renders reference place data as formatted HTML with Portuguese descriptions.
	 * 
	 * Creates an HTML representation of reference place information including:
	 * - Portuguese description of the place type (e.g., "Shopping Center", "Estação do Metrô")
	 * - Place name when available
	 * - Error handling for missing or invalid data
	 * 
	 * The method provides comprehensive error handling and graceful degradation
	 * when reference place data is unavailable or invalid.
	 * 
	 * @param {ReferencePlace} referencePlace - ReferencePlace instance with place data
	 * @returns {string} Formatted HTML string for reference place display
	 * 
	 * @example
	 * const referencePlace = new ReferencePlace({
	 *   class: 'shop',
	 *   type: 'mall',
	 *   name: 'Shopping Morumbi'
	 * });
	 * const html = displayer.renderReferencePlaceHtml(referencePlace);
	 * // Returns: '<div class="reference-place-attributes">Shopping Center Shopping Morumbi</div>'
	 * 
	 * @since 0.8.3-alpha
	 */
	renderReferencePlaceHtml(referencePlace) {
		if (!referencePlace) {
			return "<p class='error'>Dados de local de referência não disponíveis.</p>";
		}

		// Validate that we have a proper ReferencePlace object with required properties
		if (!referencePlace.description && !referencePlace.name) {
			return "<p class='warning'>Local de referência sem informações disponíveis.</p>";
		}

		// Create comprehensive HTML structure for reference place information
		let html = '<div class="reference-place-container">';
		
		// Add main reference place information
		html += '<div class="reference-place-attributes">';
		
		// Display the Portuguese description (e.g., "Shopping Center", "Estação do Metrô")
		if (referencePlace.description && referencePlace.description != NO_REFERENCE_PLACE) {
			html += `<span class="reference-place-type">${escapeHtml(referencePlace.description)}</span>`;
			
			// Add the place name if available and referencePlace.name is not substring of referencePlace.description
			if (referencePlace.name && referencePlace.name.trim() && !referencePlace.description.includes(referencePlace.name)) {
				html += ` <span class="reference-place-name">${escapeHtml(referencePlace.name)}</span>`;
			}
		} else if (referencePlace.name) {
			// If we only have a name without description, show just the name
			html += `<span class="reference-place-name">${escapeHtml(referencePlace.name)}</span>`;
		}
		
		html += '</div>';
		
		// Add additional details if available
		if (referencePlace.className || referencePlace.typeName) {
			html += '<div class="reference-place-details">';
			if (referencePlace.className) {
				html += `<small class="reference-place-class">Categoria: ${escapeHtml(referencePlace.calculateCategory())}</small>`;
			}
			if (referencePlace.typeName) {
				html += ` <small class="reference-place-type-detail">Tipo: ${escapeHtml(referencePlace.typeName)}</small>`;
			}
			html += '</div>';
		}
		
		html += '</div>';
		return html;
	}

	/**
	 * Updates the HTML display with new reference place information.
	 * 
	 * Observer pattern update method that gets called when address changes occur.
	 * Handles different states including loading, error, and successful reference place updates.
	 * Responds to position manager events and renders reference place information
	 * when standardized address data is available.
	 * 
	 * **State Handling**:
	 * - Loading states: Display "Carregando local de referência..." message
	 * - Error states: Display formatted error message with context
	 * - Success states: Render complete reference place information
	 * 
	 * **Event Handling**:
	 * Responds to position manager events:
	 * - `PositionManager.strCurrPosUpdate`: Regular position updates with reference place data
	 * 
	 * **Integration with BrazilianStandardAddress**:
	 * The method expects a BrazilianStandardAddress object that contains a referencePlace
	 * property with the extracted reference place information.
	 * 
	 * @param {Object} addressData - Raw address data from geocoding API (for future use)
	 * @param {BrazilianStandardAddress} brazilianStandardAddress - Standardized address with reference place
	 * @param {string} posEvent - The position event type
	 * @param {Object} loading - Loading state information
	 * @param {Object} error - Error information if any
	 * @returns {void}
	 * 
	 * @example
	 * // Typically called automatically via observer pattern
	 * reverseGeocoder.subscribe(displayer);
	 * 
	 * @example
	 * // Manual update for testing
	 * displayer.update(rawData, standardizedAddress, 'strCurrPosUpdate', false, null);
	 * 
	 * @since 0.8.3-alpha
	 */
	update(addressData, brazilianStandardAddress, posEvent, loading, error) {
		// Log update for debugging (following MP Barbosa logging standards)
		log(`(HTMLReferencePlaceDisplayer) update() called with posEvent: ${posEvent}`);
		
		if (brazilianStandardAddress) {
			log(`(HTMLReferencePlaceDisplayer) Brazilian standard address: ${brazilianStandardAddress.constructor.name}`);
			log(`(HTMLReferencePlaceDisplayer) Reference place:`, brazilianStandardAddress.referencePlace);
		}

		// Handle loading state with Portuguese localized message
		if (loading) {
			this.element.innerHTML = '<p class="loading">Carregando local de referência...</p>';
			return;
		}

		// Handle error state with Portuguese localized error message
		// XSS Protection: Sanitize error.message to prevent script injection
		if (error) {
			this.element.innerHTML = `<p class="error">Erro ao carregar local de referência: ${escapeHtml(error.message)}</p>`;
			return;
		}

		// Handle successful reference place data for position updates
		// Note: Using actual event value from PositionManager constant
		if (posEvent === ADDRESS_FETCHED_EVENT && brazilianStandardAddress) {
			log(`(HTMLReferencePlaceDisplayer) Rendering reference place data:`, brazilianStandardAddress);
			
			// Extract reference place from the standardized address
			const referencePlace = brazilianStandardAddress.referencePlace;
			
			// Render the reference place HTML
			const html = this.renderReferencePlaceHtml(referencePlace);
			this.element.innerHTML = html;
		}
		
		// Note: For other event types or when no standardized address is available,
		// we don't update the display to avoid clearing existing content unnecessarily
	}

	/**
	 * Returns a string representation of the HTMLReferencePlaceDisplayer instance.
	 * 
	 * Provides a human-readable representation showing the class name
	 * and the target element's ID (or 'no-id' if not set). Useful for
	 * logging and debugging purposes.
	 * 
	 * @returns {string} String representation of the displayer
	 * 
	 * @example
	 * log(displayer.toString());
	 * // Output: "HTMLReferencePlaceDisplayer: reference-place-display"
	 * 
	 * @since 0.8.3-alpha
	 */
	toString() {
		return `${this.constructor.name}: ${this.element.id || 'no-id'}`;
	}
}

export default HTMLReferencePlaceDisplayer;
/**
 * Module exports for HTML reference place display.
 * @exports HTMLReferencePlaceDisplayer - Renders reference locations with distance info in HTML
 */
export { HTMLReferencePlaceDisplayer };

// Export to window for browser compatibility
if (typeof window !== 'undefined') {
	window.HTMLReferencePlaceDisplayer = HTMLReferencePlaceDisplayer;
}