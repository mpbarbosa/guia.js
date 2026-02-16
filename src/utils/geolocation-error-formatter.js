'use strict';

import { escapeHtml } from './html-sanitizer.js';

/**
 * Geolocation error formatting utilities.
 * 
 * Provides standardized error formatting for geolocation API errors including
 * error code mapping, Portuguese localization, and HTML generation for display.
 * 
 * @module utils/geolocation-error-formatter
 * @since 0.11.0-alpha
 * @author Marcelo Pereira Barbosa
 */

/**
 * Gets error information for a geolocation error code.
 * 
 * ERROR CODE MAPPING:
 * Maps standard W3C Geolocation API error codes (1-3) to structured error objects
 * with consistent naming and English messages. This standardization enables
 * better error handling and logging throughout the application.
 * 
 * DEFENSIVE PROGRAMMING:
 * Includes fallback for unknown error codes to prevent runtime failures,
 * following MP Barbosa standards for robust error handling.
 * 
 * @param {number} errorCode - Geolocation error code (1-3)
 * @returns {Object} Error info with name and message
 * @private
 */
const getGeolocationErrorInfo = (errorCode) => {
	// Standard W3C Geolocation API error code mappings
	const errorMap = {
		1: {
			name: "PermissionDeniedError",
			message: "User denied geolocation permission"
		},
		2: {
			name: "PositionUnavailableError", 
			message: "Position information is unavailable"
		},
		3: {
			name: "TimeoutError",
			message: "Geolocation request timed out"
		}
	};

	// Fallback for unknown error codes (defensive programming)
	return errorMap[errorCode] || {
		name: "UnknownGeolocationError",
		message: "Unknown geolocation error occurred"
	};
};

/**
 * Formats a geolocation error into a consistent Error object.
 * 
 * @param {Object} error - Raw geolocation error with code property
 * @returns {Error} Formatted error object with descriptive message
 */
export const formatGeolocationError = (error) => {
	const errorInfo = getGeolocationErrorInfo(error.code);

	const formattedError = new Error(errorInfo.message);
	formattedError.name = errorInfo.name;
	formattedError.code = error.code;
	formattedError.originalError = error;

	return formattedError;
};

/**
 * Gets Portuguese error message for geolocation error code.
 * 
 * BRAZILIAN MARKET FOCUS:
 * The Portuguese error messages demonstrate the application's focus on Brazilian users.
 * Messages like "Permissão negada pelo usuário" (Permission denied by user) and 
 * "Posição indisponível" (Position unavailable) ensure clear communication with the
 * target audience while maintaining accessibility standards.
 * 
 * LOCALIZATION STRATEGY:
 * Maps standard geolocation error codes to user-friendly Portuguese messages,
 * supporting the travel guide application's Brazilian user base with native
 * language error communication.
 * 
 * @param {number} errorCode - Geolocation error code
 * @returns {string} Portuguese error message
 */
export const getGeolocationErrorMessage = (errorCode) => {
	// Portuguese error messages for Brazilian users
	const errorMessages = {
		1: "Permissão negada pelo usuário",      // Permission denied by user
		2: "Posição indisponível",              // Position unavailable  
		3: "Timeout na obtenção da posição"     // Timeout getting position
	};

	// Fallback message for unknown errors in Portuguese
	return errorMessages[errorCode] || "Erro desconhecido";
};

/**
 * Generates HTML for displaying geolocation error.
 * 
 * MATERIAL DESIGN INTEGRATION:
 * Creates structured HTML error displays that integrate seamlessly with Material Design
 * theme, ensuring consistent user experience even when geolocation fails. The HTML
 * structure follows accessibility standards and responsive design principles.
 * 
 * PORTUGUESE LANGUAGE SUPPORT:
 * Generates localized error displays in Portuguese, including technical details
 * and user-friendly messages to help Brazilian users understand location issues.
 * 
 * @param {Object} error - Geolocation error object
 * @returns {string} HTML string for error display
 */
export const generateErrorDisplayHTML = (error) => {
	// Get localized Portuguese error message
	const errorMessage = getGeolocationErrorMessage(error.code);

	// Generate Material Design compatible error display
	// XSS Protection: Sanitize error.message to prevent script injection
	return `
		<div class="location-error">
			<h4>Erro na Obtenção da Localização</h4>
			<p><strong>Código:</strong> ${error.code}</p>
			<p><strong>Mensagem:</strong> ${errorMessage}</p>
			<p><strong>Detalhes:</strong> ${escapeHtml(error.message)}</p>
		</div>
	`;
};
