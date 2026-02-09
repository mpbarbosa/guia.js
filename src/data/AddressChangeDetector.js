'use strict';

/**
 * Generic address field change detector with notification signature tracking.
 * 
 * Provides unified change detection logic for any address field (logradouro, bairro,
 * municipio, etc.), eliminating code duplication and improving maintainability.
 * 
 * **Key Features**:
 * - Generic change detection for any address field
 * - Notification signature tracking prevents duplicate notifications
 * - Detailed change information with before/after values
 * - Immutable design following MP Barbosa standards
 * - Comprehensive error handling
 * 
 * **Design Pattern**:
 * This class uses composition to replace three nearly identical methods
 * (hasLogradouroChanged, hasBairroChanged, hasMunicipioChanged) with a
 * single generic implementation, reducing ~120 lines of code duplication.
 * 
 * @module data/AddressChangeDetector
 * @since 0.8.7-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * import AddressChangeDetector from './AddressChangeDetector.js';
 * 
 * const detector = new AddressChangeDetector();
 * 
 * // Check if logradouro changed
 * if (detector.hasFieldChanged('logradouro', currentAddress, previousAddress)) {
 *   const details = detector.getChangeDetails('logradouro', currentAddress, previousAddress);
 *   console.log('Street changed:', details);
 * }
 * 
 * @example
 * // Extensible - works with any field
 * detector.hasFieldChanged('regiaoMetropolitana', current, previous);
 * detector.hasFieldChanged('municipio', current, previous);
 * detector.hasFieldChanged('bairro', current, previous);
 */
class AddressChangeDetector {
	
	/**
	 * Creates a new AddressChangeDetector instance.
	 * 
	 * Initializes the notification signature tracking Map to prevent
	 * duplicate change notifications for the same field transition.
	 * 
	 * @since 0.8.7-alpha
	 */
	constructor() {
		/**
		 * Map tracking the last notified signature for each field.
		 * Key: field name (string)
		 * Value: change signature (string in format "old=>new")
		 * @type {Map<string, string>}
		 * @private
		 */
		this.notificationSignatures = new Map();
	}
	
	/**
	 * Detects if a field has changed between two addresses.
	 * 
	 * Returns true only if:
	 * 1. Both current and previous addresses exist
	 * 2. The field value has actually changed
	 * 3. This exact change hasn't been notified before
	 * 
	 * Uses signature tracking to prevent notification loops where the same
	 * change would be reported multiple times.
	 * 
	 * @param {string} field - Field name to check (e.g., 'logradouro', 'bairro', 'municipio')
	 * @param {Object|null} current - Current address object
	 * @param {Object|null} previous - Previous address object
	 * @returns {boolean} True if field changed and not yet notified
	 * 
	 * @example
	 * const changed = detector.hasFieldChanged('bairro', currentAddr, previousAddr);
	 * if (changed) {
	 *   console.log('Neighborhood changed!');
	 * }
	 * 
	 * @example
	 * // Returns false if addresses are null/undefined
	 * detector.hasFieldChanged('municipio', null, previousAddr); // false
	 * 
	 * @example
	 * // Returns false if already notified about this exact change
	 * detector.hasFieldChanged('logradouro', current, previous); // true (first time)
	 * detector.hasFieldChanged('logradouro', current, previous); // false (duplicate)
	 * 
	 * @since 0.8.7-alpha
	 */
	hasFieldChanged(field, current, previous) {
		// Validate addresses exist
		if (!current || !previous) {
			return false;
		}
		
		// Check if field value changed
		const hasChanged = current[field] !== previous[field];
		if (!hasChanged) {
			return false;
		}
		
		// Create signature for this specific change
		const changeSignature = `${previous[field]}=>${current[field]}`;
		
		// Check if we've already notified about this exact change
		const lastSignature = this.notificationSignatures.get(field);
		if (lastSignature === changeSignature) {
			return false;
		}
		
		// Mark this change as notified
		this.notificationSignatures.set(field, changeSignature);
		return true;
	}
	
	/**
	 * Gets detailed information about a field change.
	 * 
	 * Returns an object containing:
	 * - from: Previous field value
	 * - to: Current field value
	 * - field: Field name that changed
	 * - previousAddress: Full previous address (standardized)
	 * - currentAddress: Full current address (standardized)
	 * - previousRawData: Raw geocoding data before change (if available)
	 * - currentRawData: Raw geocoding data after change (if available)
	 * 
	 * @param {string} field - Field name that changed
	 * @param {Object} current - Current address object
	 * @param {Object} previous - Previous address object
	 * @param {Object} [rawCurrent=null] - Current raw geocoding data (optional)
	 * @param {Object} [rawPrevious=null] - Previous raw geocoding data (optional)
	 * @returns {Object} Change details object
	 * 
	 * @example
	 * const details = detector.getChangeDetails('bairro', current, previous);
	 * console.log(`Bairro changed from ${details.from} to ${details.to}`);
	 * 
	 * @example
	 * // With raw data for advanced processing
	 * const details = detector.getChangeDetails(
	 *   'municipio', 
	 *   currentAddr, 
	 *   previousAddr,
	 *   currentRaw,
	 *   previousRaw
	 * );
	 * console.log('Full context:', details);
	 * 
	 * @since 0.8.7-alpha
	 */
	getChangeDetails(field, current, previous, rawCurrent = null, rawPrevious = null) {
		return {
			from: previous ? previous[field] : null,
			to: current ? current[field] : null,
			field: field,
			previousAddress: previous,
			currentAddress: current,
			previousRawData: rawPrevious,
			currentRawData: rawCurrent
		};
	}
	
	/**
	 * Clears the notification signature for a specific field.
	 * 
	 * Use this when you want to allow the same change to be notified again,
	 * such as when resetting state or clearing history.
	 * 
	 * @param {string} field - Field name to clear
	 * @returns {boolean} True if signature was cleared, false if it didn't exist
	 * 
	 * @example
	 * detector.clearFieldSignature('logradouro');
	 * // Now the next logradouro change will notify even if same values
	 * 
	 * @since 0.8.7-alpha
	 */
	clearFieldSignature(field) {
		return this.notificationSignatures.delete(field);
	}
	
	/**
	 * Clears all notification signatures.
	 * 
	 * Resets the change detector to initial state, allowing all changes
	 * to be detected and notified again.
	 * 
	 * @returns {void}
	 * 
	 * @example
	 * detector.clearAllSignatures();
	 * // All fields will now trigger notifications on next change
	 * 
	 * @since 0.8.7-alpha
	 */
	clearAllSignatures() {
		this.notificationSignatures.clear();
	}
	
	/**
	 * Gets the current notification signature for a field.
	 * 
	 * Useful for debugging or inspecting change state.
	 * 
	 * @param {string} field - Field name to check
	 * @returns {string|undefined} Change signature or undefined if not set
	 * 
	 * @example
	 * const signature = detector.getFieldSignature('bairro');
	 * console.log('Last bairro change:', signature); // "Centro=>Boa Vista"
	 * 
	 * @since 0.8.7-alpha
	 */
	getFieldSignature(field) {
		return this.notificationSignatures.get(field);
	}
	
	/**
	 * Checks if a field has a notification signature set.
	 * 
	 * @param {string} field - Field name to check
	 * @returns {boolean} True if field has been notified
	 * 
	 * @example
	 * if (!detector.hasFieldSignature('municipio')) {
	 *   console.log('No municipio change notified yet');
	 * }
	 * 
	 * @since 0.8.7-alpha
	 */
	hasFieldSignature(field) {
		return this.notificationSignatures.has(field);
	}
	
	/**
	 * Gets all field names that have notification signatures.
	 * 
	 * @returns {string[]} Array of field names with active signatures
	 * 
	 * @example
	 * const fields = detector.getTrackedFields();
	 * console.log('Tracking changes for:', fields); // ['logradouro', 'bairro']
	 * 
	 * @since 0.8.7-alpha
	 */
	getTrackedFields() {
		return Array.from(this.notificationSignatures.keys());
	}
}

// Export for ES6 modules
export default AddressChangeDetector;

// CommonJS compatibility (Node.js)
if (typeof module !== 'undefined' && module.exports) {
	module.exports = AddressChangeDetector;
}
