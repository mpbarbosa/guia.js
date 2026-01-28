'use strict';
import { log, warn, error } from '../utils/logger.js';

/**
 * Standardized Brazilian address structure.
 * 
 * Provides a consistent data structure for representing Brazilian addresses
 * with formatting methods for displaying complete address information.
 * Follows immutable patterns for data manipulation.
 * 
 * @module data/BrazilianStandardAddress
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */

/**
 * Represents a standardized Brazilian address with formatting capabilities.
 * 
 * This class provides a structured way to store and format Brazilian address data,
 * including street information (logradouro), neighborhood (bairro), city (municipio),
 * state (UF), postal code (CEP), and other address components.
 * 
 * The class follows immutable patterns using filter and join operations for
 * data manipulation, adhering to referential transparency principles.
 * 
 * @class
 */
class BrazilianStandardAddress {
	/**
	 * Creates a new BrazilianStandardAddress instance.
	 * 
	 * Initializes all address components to null, creating an empty address
	 * that can be populated with standardized Brazilian address data.
	 */
	constructor() {
		this.logradouro = null;
		this.numero = null;
		this.complemento = null;
		this.bairro = null;
		this.municipio = null;
		this.regiaoMetropolitana = null;
		this.uf = null;
		this.siglaUF = null;
		this.cep = null;
		this.pais = "Brasil";
	}

	/**
	 * Returns the complete formatted street address (logradouro + número).
	 * 
	 * @returns {string} Formatted street address or just street name
	 * @since 0.8.3-alpha
	 */
	logradouroCompleto() {
		if (!this.logradouro) return "";
		if (this.numero) {
			return `${this.logradouro}, ${this.numero}`;
		}
		return this.logradouro;
	}

	/**
	 * Returns the complete formatted neighborhood information.
	 * 
	 * @returns {string} Formatted neighborhood name
	 * @since 0.8.3-alpha
	 */
	bairroCompleto() {
		return this.bairro || "";
	}

	/**
	 * Returns the complete formatted city and state information.
	 * 
	 * @returns {string} Formatted city and state
	 * @since 0.8.3-alpha
	 */
	municipioCompleto() {
		if (!this.municipio) return "";
		if (this.siglaUF) {
			return `${this.municipio}, ${this.siglaUF}`;
		}
		return this.municipio;
	}

	/**
	 * Returns the formatted metropolitan region name.
	 * 
	 * @returns {string} Metropolitan region name or empty string
	 * @since 0.8.7-alpha
	 * @example
	 * // Returns "Região Metropolitana do Recife"
	 * address.regiaoMetropolitana = "Região Metropolitana do Recife";
	 * address.regiaoMetropolitanaFormatada();
	 */
	regiaoMetropolitanaFormatada() {
		return this.regiaoMetropolitana || "";
	}

	/**
	 * Returns a complete formatted address string.
	 * Uses immutable pattern to build address parts array.
	 * 
	 * @returns {string} Complete formatted address
	 * @since 0.8.3-alpha
	 */
	enderecoCompleto() {
		return [
			this.logradouroCompleto(),
			this.bairro,
			this.municipioCompleto(),
			this.cep
		]
			.filter(Boolean)  // Remove falsy values
			.join(", ");
	}

	toString() {
		return `${this.constructor.name}: ${this.enderecoCompleto() || 'Empty address'}`;
	}
}

export default BrazilianStandardAddress;
/**
 * Module exports for Brazilian address standardization.
 * @exports BrazilianStandardAddress - Brazilian address data model with formatting
 */
export { BrazilianStandardAddress };
