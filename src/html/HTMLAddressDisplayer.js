'use strict';
import { log, warn, error } from '../utils/logger.js';
import { escapeHtml } from '../utils/html-sanitizer.js';

import { ADDRESS_FETCHED_EVENT } from '../config/defaults.js';

/**
 * HTML-based address information displayer with comprehensive address data visualization.
 * @version 0.9.0-alpha
 * 
 * This class handles the display of address information in HTML format,
 * including raw geocoding data, standardized Brazilian addresses, and detailed
 * attribute breakdowns. It implements the observer pattern to automatically update
 * displays when address data changes and provides comprehensive formatting for
 * Brazilian Portuguese users.
 * 
 * **Key Features**:
 * - Comprehensive address display with all geocoding attributes
 * - Brazilian Portuguese localization
 * - Observer pattern integration for automatic updates
 * - Error and loading state handling
 * - Immutable design following MP Barbosa standards
 * - HTML5 details/summary structure for progressive disclosure
 * - Integration with BrazilianStandardAddress system
 * 
 * **Usage**:
 * ```javascript
 * const addressElement = document.getElementById('address-display');
 * const displayer = new HTMLAddressDisplayer(addressElement);
 * 
 * // Subscribe to address updates (example with ReverseGeocoder)
 * reverseGeocoder.subscribe(displayer);
 * 
 * // Manual update
 * displayer.update(addressData, standardizedAddress, 'strCurrPosUpdate', false, null);
 * ```
 * 
 * @class HTMLAddressDisplayer
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */
class HTMLAddressDisplayer {
	/**
	 * Creates a new HTMLAddressDisplayer instance.
	 * 
	 * Initializes the address displayer with a target DOM element for rendering
	 * address information. The instance is frozen after creation to prevent
	 * modification, following MP Barbosa immutability standards.
	 * 
	 * @param {HTMLElement} element - Target DOM element for address display
	 * @param {HTMLElement|boolean} [enderecoPadronizadoDisplay=false] - Additional element for standardized address display
	 * 
	 * @example
	 * // Basic usage
	 * const element = document.getElementById('address-display');
	 * const displayer = new HTMLAddressDisplayer(element);
	 * 
	 * @example
	 * // With additional standardized address display
	 * const mainElement = document.getElementById('main-display');
	 * const standardizedElement = document.getElementById('standardized-address');
	 * const displayer = new HTMLAddressDisplayer(mainElement, standardizedElement);
	 * 
	 * @since 0.9.0-alpha
	 */
	constructor(element, enderecoPadronizadoDisplay = false) {
		this.element = element;
		this.enderecoPadronizadoDisplay = enderecoPadronizadoDisplay;
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	/**
	 * Renders address data as formatted HTML with comprehensive attribute breakdown.
	 * 
	 * Creates a detailed HTML representation of address information including:
	 * - All raw address data attributes from geocoding API
	 * - Standardized address display (when available)
	 * - Full address display name
	 * - Progressive disclosure using HTML5 details/summary
	 * 
	 * The method provides comprehensive error handling and graceful degradation
	 * when address data is unavailable or invalid. It also updates the optional
	 * standardized address display element if provided.
	 * 
	 * @param {Object} addressData - Raw address data from geocoding API
	 * @param {BrazilianStandardAddress} enderecoPadronizado - Standardized Brazilian address
	 * @returns {string} Formatted HTML string for address display
	 * 
	 * @example
	 * const addressData = {
	 *   display_name: 'Avenida Paulista, 1578, Bela Vista, São Paulo, SP, Brasil',
	 *   address: {
	 *     road: 'Avenida Paulista',
	 *     house_number: '1578',
	 *     neighbourhood: 'Bela Vista'
	 *   }
	 * };
	 * const html = displayer.renderAddressHtml(addressData, standardizedAddress);
	 * 
	 * @since 0.9.0-alpha
	 */
	renderAddressHtml(addressData, enderecoPadronizado) {
		log('(HTMLAddressDisplayer) renderAddressHtml() called with addressData:', addressData);
		
		if (!addressData) {
			return "<p class='error'>Dados de endereço não disponíveis.</p>";
		}

		// Update standardized address display if element is provided
		if (this.enderecoPadronizadoDisplay && enderecoPadronizado) {
			log('(HTMLAddressDisplayer) Updating standardized address display:', enderecoPadronizado.enderecoCompleto());
			this.enderecoPadronizadoDisplay.innerHTML = escapeHtml(enderecoPadronizado.enderecoCompleto());
		}

		// Create progressive disclosure structure
		let html = `<details class="address-details" closed>
            <summary><strong>Endereço Atual</strong></summary>`;

		// Display comprehensive address attribute breakdown
		html += `<div class="address-attributes">
			<h4>Todos os atributos de addressData:</h4>
			<ul>`;

		// Iterate through all address data properties with type-aware formatting
		for (const key in addressData) {
			if (Object.prototype.hasOwnProperty.call(addressData, key)) {
				const value = addressData[key];
				if (typeof value === 'object' && value !== null) {
					// Format nested objects (like address sub-object) with JSON pretty-printing
					html += `<li><strong>${key}:</strong> <pre>${JSON.stringify(value, null, 2)}</pre></li>`;
				} else {
					// Format simple properties as key-value pairs
					html += `<li><strong>${key}:</strong> ${value}</li>`;
				}
			}
		}
		html += `</ul></div>`;

		// Display full address name if available (common in geocoding APIs)
		if (addressData.display_name) {
			html += `<div class="full-address">
                <p><strong>Endereço Completo:</strong></p>
                <p class="display-name">${addressData.display_name}</p>
            </div>`;
		}

		html += `</details>`;
		return html;
	}

	/**
	 * Updates the HTML display with new address information.
	 * 
	 * Observer pattern update method that gets called when address changes occur.
	 * Handles different states including loading, error, and successful address updates.
	 * Responds to position manager events and renders address information
	 * when address data is available.
	 * 
	 * **State Handling**:
	 * - Loading states: Display "Carregando endereço..." message
	 * - Error states: Display formatted error message with context
	 * - Success states: Render complete address information
	 * 
	 * **Event Handling**:
	 * Responds to position manager events:
	 * - `PositionManager.strCurrPosUpdate`: Regular position updates with address data
	 * 
	 * **Integration with BrazilianStandardAddress**:
	 * The method works with both raw geocoding data and standardized Brazilian
	 * address objects, displaying both comprehensive and standardized views.
	 * 
	 * @param {Object} addressData - Raw address data from geocoding API
	 * @param {BrazilianStandardAddress} enderecoPadronizado - Standardized Brazilian address
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
	 * displayer.update(addressData, standardizedAddress, 'strCurrPosUpdate', false, null);
	 * 
	 * @since 0.9.0-alpha
	 */
	update(addressData, enderecoPadronizado, posEvent, loading, error) {
		// Log update for debugging (following MP Barbosa logging standards)
		log(`(HTMLAddressDisplayer) update() called with posEvent: ${posEvent}`);
		
		if (!this.element) {
			warn('(HTMLAddressDisplayer) No element provided, skipping update');
			return;
		}
		
		// Handle loading state with Portuguese localized message
		if (loading) {
			this.element.innerHTML = '<p class="loading">Carregando endereço...</p>';
			return;
		}

		// Handle error state with Portuguese localized error message
		// XSS Protection: Sanitize error.message to prevent script injection
		if (error) {
			this.element.innerHTML = `<p class="error">Erro ao carregar endereço: ${escapeHtml(error.message)}</p>`;
			return;
		}

		// Handle successful address data for position updates
		// Note: Using actual event value from PositionManager constant
		if (posEvent === ADDRESS_FETCHED_EVENT && (addressData || enderecoPadronizado)) {
			// Render comprehensive address HTML
			const html = this.renderAddressHtml(addressData, enderecoPadronizado);
			this.element.innerHTML += html;
		}
		
		// Note: For other event types or when no address data is available,
		// we don't update the display to avoid clearing existing content unnecessarily
	}

	/**
	 * Returns a string representation of the HTMLAddressDisplayer instance.
	 * 
	 * Provides a human-readable representation showing the class name
	 * and the target element's ID (or 'no-id' if not set). Useful for
	 * logging and debugging purposes.
	 * 
	 * @returns {string} String representation of the displayer
	 * 
	 * @example
	 * log(displayer.toString());
	 * // Output: "HTMLAddressDisplayer: address-display"
	 * 
	 * @since 0.9.0-alpha
	 */
	toString() {
		return `${this.constructor.name}: ${this.element?.id || 'no-id'}`;
	}
}

export default HTMLAddressDisplayer;
/**
 * Module exports for HTML address display.
 * @exports HTMLAddressDisplayer - Renders formatted Brazilian addresses in HTML
 */
export { HTMLAddressDisplayer };

// Export to window for browser compatibility
if (typeof window !== 'undefined') {
	window.HTMLAddressDisplayer = HTMLAddressDisplayer;
}