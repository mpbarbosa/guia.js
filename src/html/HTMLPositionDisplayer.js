'use strict';

/**
 * HTML-based position information displayer with coordinates and accuracy details.
 * 
 * This class handles the display of geographic position data in HTML format,
 * including coordinates, accuracy information, altitude, and movement data.
 * It implements the observer pattern to automatically update displays when
 * position data changes and provides comprehensive formatting for Brazilian
 * Portuguese users.
 * 
 * **Key Features**:
 * - Comprehensive position data display with coordinates, accuracy, altitude
 * - Observer pattern integration for automatic updates
 * - Brazilian Portuguese localization
 * - Error and loading state handling
 * - Immutable design following MP Barbosa standards
 * - HTML5 details/summary structure for progressive disclosure
 * 
 * **Usage**:
 * ```javascript
 * const positionElement = document.getElementById('position-display');
 * const displayer = new HTMLPositionDisplayer(positionElement);
 * 
 * // Subscribe to position updates (example with PositionManager)
 * positionManager.subscribe(displayer);
 * 
 * // Manual update
 * displayer.update(positionManager, 'position.updated', false, null);
 * ```
 * 
 * @class HTMLPositionDisplayer
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class HTMLPositionDisplayer {
	/**
	 * Creates a new HTMLPositionDisplayer instance.
	 * 
	 * Initializes the position displayer with a target DOM element for rendering
	 * position information. The instance is frozen after creation to prevent
	 * modification, following MP Barbosa immutability standards.
	 * 
	 * @param {HTMLElement} element - Target DOM element for position display
	 * 
	 * @example
	 * // Basic usage
	 * const element = document.getElementById('position-display');
	 * const displayer = new HTMLPositionDisplayer(element);
	 * 
	 * @since 0.8.3-alpha
	 */
	constructor(element) {
		this.element = element;
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	/**
	 * Renders position data as formatted HTML with comprehensive details.
	 * 
	 * Creates a detailed HTML representation of position data including:
	 * - Core coordinates (latitude/longitude with 6 decimal precision)
	 * - Accuracy information with quality classification
	 * - Altitude data (when available)
	 * - Movement information (speed and heading when available)
	 * 
	 * Uses HTML5 details/summary structure for progressive disclosure,
	 * allowing users to expand sections as needed.
	 * 
	 * @param {PositionManager} positionManager - PositionManager instance with position data
	 * @returns {string} Formatted HTML string for position display
	 * 
	 * @example
	 * const html = displayer.renderPositionHtml(positionManager);
	 * element.innerHTML = html;
	 * 
	 * @since 0.8.3-alpha
	 */
	renderPositionHtml(positionManager) {
		if (!positionManager || !positionManager.lastPosition) {
			return "<p class='error'>No position data available.</p>";
		}

		const geoPosition = positionManager.lastPosition;
		const position = geoPosition.geolocationPosition;
		const coords = position.coords;

		let html = `<details class="position-details" closed>
            <summary><strong>Posição Atual</strong></summary>`;

		html += `<div class="coordinates">
		${position}<br>
		</div>`;

		// Display core coordinates with high precision
		html += `<div class="coordinates">
            <h4>Coordenadas:</h4>
            <p><strong>Latitude:</strong> ${coords && coords.latitude !== null && coords.latitude !== undefined ? coords.latitude.toFixed(6) : 'N/A'}°</p>
            <p><strong>Longitude:</strong> ${coords && coords.longitude !== null && coords.longitude !== undefined ? coords.longitude.toFixed(6) : 'N/A'}°</p>
        </div>`;

		// Display accuracy information with quality classification
		html += `<div class="accuracy-info">
            <p><strong>Precisão:</strong> ${coords ? (coords.accuracy ? coords.accuracy.toFixed(2) : 'N/A') : 'N/A'} metros</p>
            <h4>Precisão:</h4>
            <p><strong>Qualidade:</strong> ${this.formatAccuracyQuality(geoPosition.accuracyQuality)}</p>
        </div>`;

		// Display altitude information when available
		if (coords && coords.altitude !== null && coords.altitude !== undefined) {
			html += `<div class="altitude-info">
                <h4>Altitude:</h4>
                <p><strong>Altitude:</strong> ${coords.altitude.toFixed(2)} metros</p>`;

			if (coords.altitudeAccuracy !== null && coords.altitudeAccuracy !== undefined) {
				html += `<p><strong>Precisão da Altitude:</strong> ${coords.altitudeAccuracy.toFixed(2)} metros</p>`;
			}
			html += `</div>`;
		}

		// Display movement information when available
		if (coords && coords.speed !== null && coords.speed !== undefined) {
			const speedKmh = (coords.speed * 3.6);
			html += `<div class="movement-info">
                <h4>Movimento:</h4>
                <p><strong>Velocidade:</strong> ${speedKmh.toFixed(2)} km/h</p>`;

			if (coords.heading !== null && coords.heading !== undefined) {
				html += `<p><strong>Direção:</strong> ${coords.heading.toFixed(0)}°</p>`;
			}
			html += `</div>`;
		}

		html += `</details>`;
		return html;
	}

	/**
	 * Formats accuracy quality classification for Brazilian Portuguese users.
	 * 
	 * Converts English accuracy quality indicators to localized Portuguese
	 * descriptions for better user understanding.
	 * 
	 * @param {string} quality - Accuracy quality indicator
	 * @returns {string} Localized quality description
	 * 
	 * @example
	 * const quality = displayer.formatAccuracyQuality('excellent');
	 * console.log(quality); // "Excelente"
	 * 
	 * @since 0.8.3-alpha
	 */
	formatAccuracyQuality(quality) {
		const qualityMap = {
			'excellent': 'Excelente',
			'good': 'Boa',
			'medium': 'Média',
			'bad': 'Ruim',
			'very bad': 'Muito Ruim'
		};
		return qualityMap[quality] || quality;
	}

	/**
	 * Updates the HTML display with new position information.
	 * 
	 * Observer pattern update method that gets called when position changes occur.
	 * Handles different states including loading, error, and successful position updates.
	 * Responds to both regular position updates and immediate address updates.
	 * 
	 * **State Handling**:
	 * - Loading states: Display "Obtendo posição..." message
	 * - Error states: Display formatted error message with context
	 * - Success states: Render complete position information
	 * 
	 * **Event Handling**:
	 * Responds to position manager events:
	 * - `PositionManager.strCurrPosUpdate`: Regular position updates
	 * - `PositionManager.strImmediateAddressUpdate`: Immediate position updates
	 * 
	 * @param {PositionManager} positionManager - The PositionManager instance
	 * @param {string} posEvent - The position event type
	 * @param {Object} loading - Loading state information
	 * @param {Object} error - Error information if any
	 * @returns {void}
	 * 
	 * @example
	 * // Typically called automatically via observer pattern
	 * positionManager.subscribe(displayer);
	 * 
	 * @since 0.8.3-alpha
	 */
	update(positionManager, posEvent, loading, error) {
		// Validate element exists before attempting DOM updates
		if (!this.element) {
			console.warn('HTMLPositionDisplayer: Cannot update - element is null or undefined');
			return;
		}

		// Handle loading state with localized message
		if (loading) {
			this.element.innerHTML = '<p class="loading">Obtendo posição...</p>';
			return;
		}

		// Handle error state with detailed error information
		if (error) {
			this.element.innerHTML = `<p class="error">Erro ao obter posição: ${error.message}</p>`;
			return;
		}

		// Handle successful position updates for relevant events
		// Note: Using actual event values from PositionManager constants
		if (posEvent === 'PositionManager updated' || posEvent === 'Immediate address update') {
			if (positionManager && positionManager.lastPosition) {
				const html = this.renderPositionHtml(positionManager);
				this.element.innerHTML = html;
			} else {
				this.element.innerHTML = '<p class="warning">Dados de posição não disponíveis.</p>';
			}
		}
	}

	/**
	 * Returns a string representation of the HTMLPositionDisplayer instance.
	 * 
	 * Provides a human-readable representation showing the class name
	 * and the target element's ID (or 'no-id' if not set). Useful for
	 * logging and debugging purposes.
	 * 
	 * @returns {string} String representation of the displayer
	 * 
	 * @example
	 * console.log(displayer.toString());
	 * // Output: "HTMLPositionDisplayer: position-display"
	 * 
	 * @since 0.8.3-alpha
	 */
	toString() {
		const id = this.element.id;
		return `${this.constructor.name}: ${!id || id === 'null' ? 'no-id' : id}`;
	}
}

export default HTMLPositionDisplayer;
/**
 * Module exports for HTML position display.
 * @exports HTMLPositionDisplayer - Renders geographic coordinates and map links in HTML
 */
export { HTMLPositionDisplayer };

// Export to window for browser compatibility
if (typeof window !== 'undefined') {
	window.HTMLPositionDisplayer = HTMLPositionDisplayer;
}