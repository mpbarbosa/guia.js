'use strict';
import { log, warn, error as logError } from '../utils/logger.js';

import { ADDRESS_FETCHED_EVENT, IBGE_LOADING_MESSAGE, IBGE_ERROR_MESSAGE, IBGE_UNAVAILABLE_MESSAGE } from '../config/defaults.js';

/**
 * HTML-based SIDRA data displayer with IBGE integration.
 * @version 0.7.1-alpha
 * 
 * This class handles the display of SIDRA (Sistema IBGE de Recuperação Automática) data
 * in HTML format, including population statistics and other IBGE demographic information.
 * It implements the observer pattern to automatically update displays when address data
 * changes and provides comprehensive formatting for Brazilian Portuguese users.
 * 
 * **Key Features**:
 * - SIDRA/IBGE data display with municipality-based queries
 * - Brazilian Portuguese localization
 * - Observer pattern integration for automatic updates
 * - Error and loading state handling
 * - Immutable design following MP Barbosa standards
 * - Integration with BrazilianStandardAddress system
 * 
 * **Usage**:
 * ```javascript
 * const sidraElement = document.getElementById('dadosSidra');
 * const displayer = new HTMLSidraDisplayer(sidraElement);
 * 
 * // Subscribe to address updates (example with ReverseGeocoder)
 * reverseGeocoder.subscribe(displayer);
 * 
 * // Manual update
 * displayer.update(addressData, standardizedAddress, ADDRESS_FETCHED_EVENT, false, null);
 * ```
 * 
 * @class HTMLSidraDisplayer
 * @since 0.7.1-alpha
 * @author Marcelo Pereira Barbosa
 */
class HTMLSidraDisplayer {
	/**
	 * Creates a new HTMLSidraDisplayer instance.
	 * 
	 * Initializes the SIDRA displayer with a target DOM element for rendering
	 * demographic information. The instance is frozen after creation to prevent
	 * modification, following MP Barbosa immutability standards.
	 * 
	 * @param {HTMLElement} element - Target DOM element for SIDRA data display
	 * @param {Object} [options={}] - Configuration options
	 * @param {string} [options.dataType='PopEst'] - SIDRA data type to display (default: PopEst for population estimate)
	 * 
	 * @example
	 * // Basic usage
	 * const element = document.getElementById('dadosSidra');
	 * const displayer = new HTMLSidraDisplayer(element);
	 * 
	 * @example
	 * // With custom data type
	 * const element = document.getElementById('dadosSidra');
	 * const displayer = new HTMLSidraDisplayer(element, { dataType: 'GDP' });
	 * 
	 * @since 0.7.1-alpha
	 */
	constructor(element, options = {}) {
		this.element = element;
		this.dataType = options.dataType || 'PopEst';
		log(`>>> (HTMLSidraDisplayer) Created for element id='${element?.id || 'no-id'}' with dataType='${this.dataType}'`);
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	/**
	 * Updates the SIDRA display based on address data.
	 * 
	 * This method implements the observer pattern interface, receiving updates
	 * from address-related observables. It extracts municipality and state information
	 * from the standardized address and triggers SIDRA data display through the
	 * global displaySidraDadosParams function (if available).
	 * 
	 * The method filters updates to only process ADDRESS_FETCHED_EVENT to avoid
	 * unnecessary data fetching on other event types.
	 * 
	 * @param {Object} addressData - Raw address data from geocoding API (unused in current implementation)
	 * @param {Object} enderecoPadronizado - Standardized Brazilian address object
	 * @param {string} enderecoPadronizado.municipio - Municipality name (e.g., "São Paulo")
	 * @param {string} enderecoPadronizado.siglaUF - State abbreviation (e.g., "SP")
	 * @param {string} posEvent - Position event type (should be ADDRESS_FETCHED_EVENT for SIDRA updates)
	 * @param {boolean} loading - Loading state indicator
	 * @param {Error|null} error - Error object if update failed
	 * 
	 * @example
	 * // Called automatically by observer pattern
	 * displayer.update(addressData, { municipio: 'São Paulo', siglaUF: 'SP' }, ADDRESS_FETCHED_EVENT, false, null);
	 * 
	 * @since 0.7.1-alpha
	 */
	update(addressData, enderecoPadronizado, posEvent, loading, error) {
		// Log update for debugging (following MP Barbosa logging standards)
		log(`(HTMLSidraDisplayer) update() called with posEvent: ${posEvent}`);
		
		if (!this.element) {
			warn('(HTMLSidraDisplayer) No element provided, skipping update');
			return;
		}
		
		// Handle loading state with Portuguese localized message
		if (loading) {
			this.element.innerHTML = `<p class="loading">${IBGE_LOADING_MESSAGE}</p>`;
			return;
		}

		// Handle error state with Portuguese localized error message
		if (error) {
			this.element.innerHTML = `<p class="error">${IBGE_ERROR_MESSAGE}: ${error.message}</p>`;
			return;
		}

		// Only update SIDRA data on address fetch events
		if (posEvent === ADDRESS_FETCHED_EVENT && enderecoPadronizado) {
			this._updateSidraData(enderecoPadronizado);
		}
	}

	/**
	 * Updates SIDRA data display using the global displaySidraDadosParams function.
	 * 
	 * This method is called internally by update() to fetch and display SIDRA data
	 * for the given municipality. It relies on the global window.displaySidraDadosParams
	 * function (typically loaded from andarilho.js or similar SIDRA integration script).
	 * 
	 * If the global function is not available, the method silently returns without
	 * error, allowing the application to continue functioning without SIDRA data.
	 * 
	 * @param {Object} enderecoPadronizado - Standardized Brazilian address object
	 * @param {string} enderecoPadronizado.municipio - Municipality name
	 * @param {string} enderecoPadronizado.siglaUF - State abbreviation
	 * @private
	 * 
	 * @example
	 * // Internal usage
	 * this._updateSidraData({ municipio: 'São Paulo', siglaUF: 'SP' });
	 * 
	 * @since 0.7.1-alpha
	 */
	_updateSidraData(enderecoPadronizado) {
		// Validate input
		if (!enderecoPadronizado) {
			warn('(HTMLSidraDisplayer) No enderecoPadronizado provided, skipping SIDRA update');
			return;
		}

		// Check if global SIDRA function is available
		if (typeof window.displaySidraDadosParams !== 'function') {
			warn('(HTMLSidraDisplayer) window.displaySidraDadosParams not available, SIDRA library not loaded');
			this.element.innerHTML = `<p class="info">Dados do IBGE não disponíveis (biblioteca SIDRA não carregada)</p>`;
			return;
		}

		// Prepare parameters for SIDRA API
		const params = {
			"municipio": enderecoPadronizado.municipio,
			"siglaUf": enderecoPadronizado.siglaUF
		};

		log(`(HTMLSidraDisplayer) Updating SIDRA data for ${params.municipio}, ${params.siglaUf}`);
		
		// Call global SIDRA display function with error handling
		try {
			window.displaySidraDadosParams(this.element, this.dataType, params);
		} catch (err) {
			logError('(HTMLSidraDisplayer) Error updating SIDRA data:', err);
			// Show user-friendly error message in Portuguese
			this.element.innerHTML = `<p class="error">${IBGE_UNAVAILABLE_MESSAGE}</p>`;
		}
	}

	/**
	 * Returns a string representation of the HTMLSidraDisplayer instance.
	 * 
	 * Provides a human-readable representation showing the class name,
	 * the target element's ID (or 'no-id' if not set), and the data type.
	 * Useful for logging and debugging purposes.
	 * 
	 * @returns {string} String representation of the displayer
	 * 
	 * @example
	 * log(displayer.toString());
	 * // Output: "HTMLSidraDisplayer: dadosSidra (PopEst)"
	 * 
	 * @since 0.7.1-alpha
	 */
	toString() {
		const elementId = this.element?.id || 'no-id';
		return `HTMLSidraDisplayer: ${elementId} (${this.dataType})`;
	}
}

export default HTMLSidraDisplayer;
