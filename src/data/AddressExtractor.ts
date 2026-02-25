/**
 * Address data extractor and standardizer — base class.
 *
 * Provides shared logic (static helpers, constructor scaffold, freeze) for all
 * provider-specific address extractor subclasses.
 *
 * @module data/AddressExtractor
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import BrazilianStandardAddress from './BrazilianStandardAddress.js';
import ReferencePlace from './ReferencePlace.js';

/**
 * Base class for extracting geocoding API responses into a standardized
 * Brazilian address format.
 *
 * Subclasses must implement `padronizaEndereco()` to handle their own
 * provider's field names.
 *
 * @class
 * @abstract
 */
class AddressExtractor {
	data: object;
	enderecoPadronizado: BrazilianStandardAddress;

	/**
	 * @param {Object} data - Raw address data from a geocoding API
	 */
	constructor(data: object) {
		this.data = data;
		this.enderecoPadronizado = new BrazilianStandardAddress();
		this.padronizaEndereco();
		Object.freeze(this);
	}

	/**
	 * Maps raw provider data into `this.enderecoPadronizado`.
	 * Must be implemented by each subclass.
	 *
	 * @abstract
	 */
	padronizaEndereco(): void {
		// implemented by subclasses
	}

	/**
	 * Extracts the state abbreviation from an ISO 3166-2 level-4 code.
	 *
	 * @param {string} iso3166Code - e.g. "BR-SP"
	 * @returns {string|null} e.g. "SP", or null if invalid
	 */
	static extractSiglaUF(iso3166Code: string): string | null {
		if (!iso3166Code || typeof iso3166Code !== 'string') return null;
		const match = iso3166Code.match(/^BR-([A-Z]{2})$/);
		return match ? match[1] : null;
	}

	toString(): string {
		return `${this.constructor.name}: ${this.enderecoPadronizado.enderecoCompleto()}`;
	}
}

// ---------------------------------------------------------------------------
// NominatimAddressExtractor — parses OpenStreetMap Nominatim API responses
// ---------------------------------------------------------------------------

/**
 * Extracts and standardizes address data from OpenStreetMap Nominatim API responses.
 *
 * Supports both Nominatim API format (road, suburb, city, postcode, …) and
 * standard OSM address tags (addr:street, addr:housenumber, …).
 *
 * @class
 * @extends AddressExtractor
 * @immutable Instances are frozen after construction
 */
class NominatimAddressExtractor extends AddressExtractor {
	/**
	 * Maps Nominatim fields into the standardized Brazilian address.
	 *
	 * @override
	 */
	padronizaEndereco(): void {
		if (!this.data || !this.data.address) return;

		const address = this.data.address;

		this.enderecoPadronizado.logradouro =
			address['addr:street'] || address.road || address.street || address.pedestrian || null;

		this.enderecoPadronizado.numero =
			address['addr:housenumber'] || address.house_number || null;

		this.enderecoPadronizado.bairro =
			address['addr:neighbourhood'] || address.neighbourhood || address.suburb || address.quarter || null;

		this.enderecoPadronizado.municipio =
			address['addr:city'] || address.city || address.town || address.municipality || address.village || null;

		this.enderecoPadronizado.regiaoMetropolitana = address.county || null;

		this.enderecoPadronizado.uf =
			address['addr:state'] || address.state || null;

		this.enderecoPadronizado.siglaUF =
			address.state_code || AddressExtractor.extractSiglaUF(address['ISO3166-2-lvl4']) || null;

		// Edge case: uf contains a two-letter code already
		if (this.enderecoPadronizado.uf && /^[A-Z]{2}$/.test(this.enderecoPadronizado.uf)) {
			this.enderecoPadronizado.siglaUF = this.enderecoPadronizado.uf;
		}

		this.enderecoPadronizado.cep =
			address['addr:postcode'] || address.postcode || null;

		this.enderecoPadronizado.pais =
			address.country === 'Brasil' || address.country === 'Brazil'
				? 'Brasil'
				: (address.country || 'Brasil');

		this.enderecoPadronizado.referencePlace = new ReferencePlace(this.data);
	}
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

// Default export is NominatimAddressExtractor so all existing callers
// (AddressCache, AddressDataExtractor, guia.js) continue to work unchanged.
export default NominatimAddressExtractor;

export { AddressExtractor, NominatimAddressExtractor };

