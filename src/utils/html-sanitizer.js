/**
 * HTML Sanitization Utilities
 * 
 * Provides safe HTML escaping to prevent XSS (Cross-Site Scripting) attacks
 * when displaying user-generated or error content in innerHTML contexts.
 * 
 * @module utils/html-sanitizer
 * @since 0.9.0-alpha
 */

/**
 * Safely escapes HTML special characters to prevent XSS attacks.
 * 
 * This function converts potentially dangerous characters (&, <, >, ", ') 
 * into their HTML entity equivalents, making it safe to insert untrusted 
 * text into innerHTML without risking script injection.
 * 
 * **Security Context:**
 * - Use this function whenever displaying error messages, user input, or
 *   any untrusted data via innerHTML
 * - Protects against XSS attacks where error.message might contain malicious code
 * 
 * **Implementation:**
 * - Uses consistent manual character replacement across all environments
 * - Ensures quotes are properly escaped (DOM textContent doesn't escape quotes)
 * 
 * @param {string|null|undefined} text - The text to escape
 * @returns {string} HTML-safe escaped text
 * 
 * @example
 * // Unsafe - XSS vulnerable
 * element.innerHTML = `<p>Error: ${error.message}</p>`;
 * 
 * @example
 * // Safe - properly escaped
 * import { escapeHtml } from './utils/html-sanitizer.js';
 * element.innerHTML = `<p>Error: ${escapeHtml(error.message)}</p>`;
 * 
 * @example
 * // Handles malicious input
 * const malicious = '<script>alert("XSS")</script>';
 * const safe = escapeHtml(malicious);
 * // Result: '&lt;script&gt;alert("XSS")&lt;/script&gt;'
 */
export function escapeHtml(text) {
	// Handle null/undefined gracefully
	if (text == null) {
		return '';
	}

	// Convert to string if needed
	const str = String(text);

	// Use manual character replacement for consistent behavior across environments
	// Note: DOM textContent -> innerHTML doesn't escape quotes, so we use manual replacement
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/**
 * Safely escapes HTML and truncates to maximum length.
 * Useful for displaying error messages with length constraints.
 * 
 * @param {string|null|undefined} text - The text to escape and truncate
 * @param {number} [maxLength=200] - Maximum length before truncation
 * @returns {string} HTML-safe escaped and truncated text
 * 
 * @example
 * import { escapeHtmlTruncate } from './utils/html-sanitizer.js';
 * const longError = 'A'.repeat(300);
 * const safe = escapeHtmlTruncate(longError, 100);
 * // Result: 'AAA...AAA' (100 chars, HTML-safe)
 */
export function escapeHtmlTruncate(text, maxLength = 200) {
	const escaped = escapeHtml(text);
	if (escaped.length <= maxLength) {
		return escaped;
	}
	return escaped.substring(0, maxLength - 3) + '...';
}

// Default export for convenience
export default {
	escapeHtml,
	escapeHtmlTruncate
};
