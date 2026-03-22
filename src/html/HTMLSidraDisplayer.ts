import { log, warn, error as logError } from '../utils/logger.js';
import { escapeHtml } from '../utils/html-sanitizer.js';
import ibgeDataFormatter from '../utils/ibge-data-formatter.js';
import type { BrazilianStandardAddress } from '../data/BrazilianStandardAddress.js';

import { ADDRESS_FETCHED_EVENT, IBGE_LOADING_MESSAGE, IBGE_ERROR_MESSAGE, IBGE_UNAVAILABLE_MESSAGE } from '../config/defaults.js';

/**
 * HTML-based SIDRA data displayer with IBGE integration.
 * @version 0.9.0-alpha
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
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */
class HTMLSidraDisplayer {
	element: HTMLElement;
	dataType: string;
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
	 * @since 0.9.0-alpha
	 */
	constructor(element: HTMLElement | string, options: { dataType?: string } = {}) {
		this.element = typeof element === 'string' ? document.getElementById(element) as HTMLElement : element;
		this.dataType = options.dataType || 'PopEst';
		log(`>>> (HTMLSidraDisplayer) Created for element id='${this.element?.id || 'no-id'}' with dataType='${this.dataType}'`);
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
	 * @since 0.9.0-alpha
	 */
	update(_addressData: object, enderecoPadronizado: BrazilianStandardAddress | null, posEvent: string, loading: unknown, error: { message: string } | null | false): void {
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
		// XSS Protection: Sanitize error.message to prevent script injection
		if (error) {
			this.element.innerHTML = `<p class="error">${IBGE_ERROR_MESSAGE}: ${escapeHtml(error.message)}</p>`;
			return;
		}

		// Only update SIDRA data on address fetch events
		if (posEvent === ADDRESS_FETCHED_EVENT && enderecoPadronizado) {
			this._updateSidraData(enderecoPadronizado);
		}
	}

	/**
	 * Updates SIDRA data display using the enhanced IBGE formatter.
	 * 
	 * This method is called internally by update() to fetch and display SIDRA data
	 * for the given municipality. It uses the IBGEDataFormatter to provide user-friendly,
	 * contextualized demographic information with natural language and visual formatting.
	 * 
	 * Falls back to the global window.displaySidraDadosParams function if formatter fails,
	 * allowing the application to continue functioning with original SIDRA data display.
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
	 * @since 0.9.0-alpha
	 * @updated 0.11.0-alpha - Enhanced with IBGEDataFormatter for user-friendly display
	 */
	_updateSidraData(enderecoPadronizado: BrazilianStandardAddress): void {
		// Validate input
		if (!enderecoPadronizado) {
			warn('(HTMLSidraDisplayer) No enderecoPadronizado provided, skipping SIDRA update');
			return;
		}

		// Prepare parameters for SIDRA API
		const params = {
			"municipio": enderecoPadronizado.municipio,
			"siglaUf": enderecoPadronizado.siglaUF
		};

		log(`(HTMLSidraDisplayer) Updating SIDRA data for ${params.municipio}, ${params.siglaUf} with enhanced formatter`);
		
		// Use enhanced IBGE Data Formatter for user-friendly display
		try {
			ibgeDataFormatter.interceptAndFormat(this.element, this.dataType, { municipio: params.municipio ?? '', siglaUf: params.siglaUf ?? '' });
		} catch (err) {
			logError('(HTMLSidraDisplayer) Error using IBGE formatter, falling back to original:', err);
			
			// Fallback to original SIDRA display function if available
			if (typeof window.displaySidraDadosParams === 'function') {
				try {
					window.displaySidraDadosParams(this.element, this.dataType, params);
				} catch (fallbackErr) {
					logError('(HTMLSidraDisplayer) Error in fallback SIDRA display:', fallbackErr);
					this.element.innerHTML = `<p class="error">${IBGE_UNAVAILABLE_MESSAGE}</p>`;
				}
			} else {
				warn('(HTMLSidraDisplayer) window.displaySidraDadosParams not available, SIDRA library not loaded');
				this.element.innerHTML = `<p class="info">Dados do IBGE não disponíveis (biblioteca SIDRA não carregada)</p>`;
			}
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
	 * @since 0.9.0-alpha
	 */
	toString(): string {
		const elementId = this.element?.id || 'no-id';
		return `HTMLSidraDisplayer: ${elementId} (${this.dataType})`;
	}
}

export default HTMLSidraDisplayer;
