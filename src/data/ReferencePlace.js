/**
 * Reference place data extracted from geocoding data.
 * 
 * This module encapsulates information about reference places such as shopping centers,
 * subway stations, cafes, and other points of interest. It extracts the "class", "type",
 * and "name" fields from geocoding API responses and provides a Portuguese description
 * of the reference place type.
 * 
 * Reference places are useful for providing contextual information to users about their
 * location, such as "You are at Shopping Center XYZ" or "Near Subway Station ABC".
 * 
 * @module data/ReferencePlace
 * @since 0.8.5-alpha
 * @author Marcelo Pereira Barbosa
 */

import { NO_REFERENCE_PLACE, VALID_REF_PLACE_CLASSES } from '../config/defaults.js';

/**
 * Represents a reference place extracted from geocoding data.
 * 
 * @class
 * @immutable All instances are frozen after creation
 * 
 * @example
 * const data = { 
 *   class: 'shop', 
 *   type: 'mall', 
 *   name: 'Shopping Morumbi' 
 * };
 * const refPlace = new ReferencePlace(data);
 * console.log(refPlace.description); // "Shopping Center"
 * console.log(refPlace.name); // "Shopping Morumbi"
 * console.log(refPlace.toString()); // "ReferencePlace: Shopping Center - Shopping Morumbi"
 */
class ReferencePlace {
	/**
	 * Reference place mapping for known OSM classes/types.
	 * Maps OpenStreetMap feature classes and types to Portuguese descriptions.
	 * Keys must be lowercase to match OSM data.
	 * 
	 * @static
	 * @type {Object.<string, Object.<string, string>>}
	 * @see {@link https://wiki.openstreetmap.org/wiki/Map_Features} OSM feature documentation
	 * @since 0.8.5-alpha
	 */
	static referencePlaceMap = {
		"place": { "house": "Residencial" },
		"shop": {
			"mall": "Shopping Center",
			"car_repair": "Oficina Mecânica"
		},
		"amenity": { "cafe": "Café" },
		"railway": {
			"subway": "Estação do Metrô",
			"station": "Estação do Metrô"
		},
	};

	/**
	 * Creates a new ReferencePlace instance.
	 * 
	 * Extracts class, type, and name information from the provided geocoding data
	 * and calculates the Portuguese description of the reference place type.
	 * 
	 * @param {Object} data - Raw address data from geocoding API
	 * @param {string} [data.class] - The class category of the place (e.g., 'shop', 'amenity', 'railway')
	 * @param {string} [data.type] - The specific type within the class (e.g., 'mall', 'cafe', 'subway')
	 * @param {string} [data.name] - The name of the reference place
	 * 
	 * @since 0.8.5-alpha
	 */
	constructor(data) {
		this.className = (data && data.class) || null;
		this.typeName = (data && data.type) || null;
		this.name = (data && data.name) || null;
		this.description = this.calculateDescription();
		Object.freeze(this); // Prevent modification following MP Barbosa standards
	}

	/**
	 * Calculates the Portuguese description of the reference place type.
	 * 
	 * Uses the class and type information to look up a human-readable description
	 * in Portuguese from the reference place mapping configuration. Falls back to
	 * a default "Não classificado" (unclassified) message if no mapping is found.
	 * 
	 * @private
	 * @returns {string} Portuguese description of the reference place type
	 * @since 0.8.5-alpha
	 */
	calculateDescription() {
		if (!this.className || !this.typeName) {
			return NO_REFERENCE_PLACE;
		}

		// Check if this is a valid reference place class
		if (!VALID_REF_PLACE_CLASSES.includes(this.className)) {
			return NO_REFERENCE_PLACE;
		}

		if (this.className && this.typeName) {
			// Look up in the reference place map
			if (ReferencePlace.referencePlaceMap[this.className] &&
				ReferencePlace.referencePlaceMap[this.className][this.typeName]) {
				if (this.name) {
					return `${ReferencePlace.referencePlaceMap[this.className][this.typeName]} ${this.name}`;
				} else {
					return ReferencePlace.referencePlaceMap[this.className][this.typeName];
				}
			}
		}

		// Fallback to class/type combination
		return `${this.className}: ${this.typeName}`;
	}

	/**
	 * Returns a string representation of this reference place.
	 * 
	 * Provides a formatted string showing the description and name (if available)
	 * of the reference place.
	 * 
	 * @returns {string} String representation
	 * @since 0.8.5-alpha
	 * 
	 * @example
	 * const refPlace = new ReferencePlace({ class: 'shop', type: 'mall', name: 'Shopping Morumbi' });
	 * console.log(refPlace.toString()); 
	 * // Output: "ReferencePlace: Shopping Center - Shopping Morumbi"
	 */
	toString() {
		const baseName = `${this.constructor.name}: ${this.description}`;
		if (this.name) {
			return `${baseName} - ${this.name}`;
		}
		return baseName;
	}
}

export default ReferencePlace;
export { ReferencePlace };
