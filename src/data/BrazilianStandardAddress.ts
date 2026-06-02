/**
 * Standardized Brazilian address structure.
 * 
 * Provides a consistent data structure for representing Brazilian addresses
 * with formatting methods for displaying complete address information.
 * Follows immutable patterns for data manipulation.
 * 
 * @module data/BrazilianStandardAddress
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import type ReferencePlace from './ReferencePlace.js';

const BAIRRO_DISTRITO_CONFLICT_MESSAGE =
	'BrazilianStandardAddress cannot have both bairro and distrito';

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
	#bairro: string | null;
	#distrito: string | null;

	logradouro: string | null;
	numero: string | null;
	complemento: string | null;
	municipio: string | null;
	regiaoMetropolitana: string | null;
	uf: string | null;
	siglaUF: string | null;
	cep: string | null;
	pais: string;
	/** Point-of-interest data extracted from the geocoding response, if present. */
	referencePlace: ReferencePlace | null;

	get bairro(): string | null {
		return this.#bairro;
	}

	set bairro(value: string | null | undefined) {
		const normalized = BrazilianStandardAddress.normalizeNullableAddressField(value);
		if (normalized !== null && this.#distrito !== null) {
			throw new Error(BAIRRO_DISTRITO_CONFLICT_MESSAGE);
		}
		this.#bairro = normalized;
	}

	get distrito(): string | null {
		return this.#distrito;
	}

	set distrito(value: string | null | undefined) {
		const normalized = BrazilianStandardAddress.normalizeNullableAddressField(value);
		if (normalized !== null && this.#bairro !== null) {
			throw new Error(BAIRRO_DISTRITO_CONFLICT_MESSAGE);
		}
		this.#distrito = normalized;
	}

	/**
	 * Creates a new BrazilianStandardAddress instance.
	 * 
	 * Initializes all address components to null, creating an empty address
	 * that can be populated with standardized Brazilian address data.
	 */
	constructor() {
		this.#bairro = null;
		this.#distrito = null;
		this.logradouro = null;
		this.numero = null;
		this.complemento = null;
		this.bairro = null;
		this.distrito = null;
		this.municipio = null;
		this.regiaoMetropolitana = null;
		this.uf = null;
		this.siglaUF = null;
		this.cep = null;
		this.pais = "Brasil";
		this.referencePlace = null;
	}

	private static normalizeNullableAddressField(value: string | null | undefined): string | null {
		if (value == null) return null;
		return value.trim() === '' ? null : value;
	}

	/**
	 * Returns the complete formatted street address (logradouro + número).
	 * 
	 * @returns {string} Formatted street address or just street name
	 * @since 0.9.0-alpha
	 */
	logradouroCompleto(): string {
		if (!this.logradouro) return "";
		if (this.numero) {
			return `${this.logradouro}, ${this.numero}`;
		}
		return this.logradouro;
	}

	/**
	 * Returns the best available formatted sub-municipal locality information.
	 * 
	 * @returns {string} Formatted neighborhood or district name
	 * @since 0.9.0-alpha
	 */
	bairroCompleto(): string {
		return this.bairro || this.distrito || "";
	}

	/**
	 * Returns the complete formatted city and state information.
	 * 
	 * @returns {string} Formatted city and state
	 * @since 0.9.0-alpha
	 */
	municipioCompleto(): string {
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
	 * @since 0.9.0-alpha
	 * @example
	 * // Returns "Região Metropolitana do Recife"
	 * address.regiaoMetropolitana = "Região Metropolitana do Recife";
	 * address.regiaoMetropolitanaFormatada();
	 */
	regiaoMetropolitanaFormatada(): string {
		if (!this.regiaoMetropolitana) return "";
		// Nominatim sometimes returns Brazilian macroregions ("Região Sudeste",
		// "Região Nordeste", etc.) in the county field. These are not metropolitan
		// regions and must not be displayed as sub-text under the municipality.
		const MACROREGIONS = new Set(['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']);
		const match = /^Região (.+)$/.exec(this.regiaoMetropolitana);
		if (match && MACROREGIONS.has(match[1])) return "";
		return this.regiaoMetropolitana;
	}

	/**
	 * Returns a complete formatted address string.
	 * Uses immutable pattern to build address parts array.
	 * 
	 * @returns {string} Complete formatted address
	 * @since 0.9.0-alpha
	 */
	enderecoCompleto(): string {
		return [
			this.logradouroCompleto(),
			this.bairroCompleto(),
			this.municipioCompleto(),
			this.cep
		]
			.filter(Boolean)  // Remove falsy values
			.join(", ");
	}

	toString(): string {
		return `${this.constructor.name}: ${this.enderecoCompleto() || 'Empty address'}`;
	}
}

export default BrazilianStandardAddress;
/**
 * Module exports for Brazilian address standardization.
 * @exports BrazilianStandardAddress - Brazilian address data model with formatting
 */
export { BrazilianStandardAddress };
