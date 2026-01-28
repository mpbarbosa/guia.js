'use strict';
import { log, warn, error } from '../utils/logger.js';

/**
 * Address data extractor and standardizer.
 * 
 * Extracts and standardizes address data from geocoding API responses,
 * converting various API formats into a consistent BrazilianStandardAddress structure.
 * Supports both Nominatim API format and standard OSM address tags.
 * 
 * @module data/AddressExtractor
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */

import BrazilianStandardAddress from './BrazilianStandardAddress.js';
import ReferencePlace from './ReferencePlace.js';

/**
 * Extracts and standardizes address data from geocoding API responses.
 * 
 * This class processes raw address data from geocoding APIs (like OpenStreetMap Nominatim)
 * and converts it into a standardized Brazilian address format. It handles multiple
 * address field formats and provides intelligent fallback logic for missing data.
 * 
 * The resulting address is frozen (immutable) to maintain referential transparency.
 * 
 * @class
 * @immutable All instances are frozen after creation
 */
class AddressExtractor {
	/**
	 * Creates a new AddressExtractor instance.
	 * 
	 * @param {Object} data - Raw address data from geocoding API
	 */
	constructor(data) {
		this.data = data;
		this.enderecoPadronizado = new BrazilianStandardAddress();
		this.padronizaEndereco();
		Object.freeze(this); // Prevent further modification following MP Barbosa standards
	}

	/**
	 * Extracts the state abbreviation (siglaUF) from ISO3166-2-lvl4 field.
	 * 
	 * The ISO3166-2-lvl4 field contains the state code in the format "BR-XX"
	 * where XX is the two-letter state abbreviation (e.g., "BR-RJ" for Rio de Janeiro).
	 * This method extracts and returns just the state abbreviation part.
	 * 
	 * @private
	 * @param {string} iso3166Code - The ISO3166-2-lvl4 code (e.g., "BR-RJ", "BR-SP")
	 * @returns {string|null} The state abbreviation (e.g., "RJ", "SP") or null if invalid
	 * @since 0.8.6-alpha
	 * 
	 * @example
	 * extractSiglaUF("BR-RJ")  // Returns "RJ"
	 * extractSiglaUF("BR-SP")  // Returns "SP"
	 * extractSiglaUF("invalid") // Returns null
	 */
	static extractSiglaUF(iso3166Code) {
		if (!iso3166Code || typeof iso3166Code !== 'string') {
			return null;
		}

		// Extract the state code after "BR-" prefix
		const match = iso3166Code.match(/^BR-([A-Z]{2})$/);
		return match ? match[1] : null;
	}

	/**
	 * Standardizes the address data into Brazilian format.
	 * 
	 * Maps fields from the raw geocoding response to standardized Brazilian
	 * address components with proper fallback handling for missing data.
	 * 
	 * Supports both Nominatim API format (road, house_number, etc.) and 
	 * standard OSM address tags (addr:street, addr:housenumber, etc.).
	 * 
	 * @private
	 * @since 0.8.3-alpha
	 */
	padronizaEndereco() {
		if (!this.data || !this.data.address) {
			return;
		}

		const address = this.data.address;

		// Map street/road information
		// Supports: Nominatim format (road, street, pedestrian) and OSM tags (addr:street)
		this.enderecoPadronizado.logradouro = address['addr:street'] || address.road || address.street || address.pedestrian || null;

		// Map house number
		// Supports: Nominatim format (house_number) and OSM tags (addr:housenumber)
		this.enderecoPadronizado.numero = address['addr:housenumber'] || address.house_number || null;

		// Map neighborhood/suburb information
		// Supports: Nominatim format (neighbourhood, suburb, quarter) and OSM tags (addr:neighbourhood)
		this.enderecoPadronizado.bairro = address['addr:neighbourhood'] || address.neighbourhood || address.suburb || address.quarter || null;

		// Map municipality/city information
		// Supports: Nominatim format (city, town, municipality, village) and OSM tags (addr:city)
		// Note: hamlet is NOT included here - hamlets are subdivisions within municipalities, not municipalities themselves
		this.enderecoPadronizado.municipio = address['addr:city'] || address.city || address.town || address.municipality || address.village || null;

		// Map state information
		// uf property: Contains ONLY full state names from addr:state or state fields
		// Priority: OSM tag (addr:state) > Nominatim state field
		// Rule: uf must contain only full state names (e.g., "São Paulo", "Rio de Janeiro")
		this.enderecoPadronizado.uf = address['addr:state'] || address.state || null;

		// siglaUF property: Contains ONLY two-letter state abbreviations
		// Priority: state_code > extracted from ISO3166-2-lvl4 > derived from uf if it's already a 2-letter code
		// Rule: siglaUF must contain only two-letter state abbreviations (e.g., "SP", "RJ")
		this.enderecoPadronizado.siglaUF = address.state_code || AddressExtractor.extractSiglaUF(address['ISO3166-2-lvl4']) || null;

		// If uf contains a two-letter code (edge case for backward compatibility), use it for siglaUF
		if (this.enderecoPadronizado.uf && /^[A-Z]{2}$/.test(this.enderecoPadronizado.uf)) {
			this.enderecoPadronizado.siglaUF = this.enderecoPadronizado.uf;
		}

		// Map postal code
		// Supports: Nominatim format (postcode) and OSM tags (addr:postcode)
		this.enderecoPadronizado.cep = address['addr:postcode'] || address.postcode || null;

		// Map country (default to Brasil for Brazilian addresses)
		this.enderecoPadronizado.pais = address.country === 'Brasil' || address.country === 'Brazil' ? 'Brasil' : (address.country || 'Brasil');

		this.enderecoPadronizado.referencePlace = new ReferencePlace(this.data);
	}

	/**
	 * Returns a string representation of this extractor.
	 * 
	 * @returns {string} String representation
	 * @since 0.8.3-alpha
	 */
	toString() {
		return `${this.constructor.name}: ${this.enderecoPadronizado.enderecoCompleto()}`;
	}
}

export default AddressExtractor;
/**
 * Module exports for address extraction.
 * @exports AddressExtractor - Extracts and standardizes Brazilian addresses from geocoding data
 */
export { AddressExtractor };
