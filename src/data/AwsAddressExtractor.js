'use strict';

/**
 * Address extractor for AWS Location Based Service responses.
 *
 * Reads AWS-native field names directly into a `BrazilianStandardAddress`
 * without any cross-provider field mapping.
 *
 * AWS response shape:
 * ```json
 * {
 *   "address": {
 *     "label": "Movelstore, Sé, São Paulo, 01016-000, BRA",
 *     "neighborhood": "Sé",
 *     "municipality": "São Paulo",
 *     "region": "São Paulo",
 *     "country": "BRA",
 *     "postalCode": "01016-000"
 *   }
 * }
 * ```
 *
 * @module data/AwsAddressExtractor
 * @since 0.11.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import { AddressExtractor } from './AddressExtractor.js';
import ReferencePlace from './ReferencePlace.js';

/** ISO 3166-1 alpha-3 country codes for Brazil */
const BRAZIL_CODES = new Set(['BRA', 'BR', 'Brasil', 'Brazil']);

/**
 * Extracts and standardizes address data from AWS Location Based Service responses.
 *
 * @class
 * @extends AddressExtractor
 * @immutable Instances are frozen after construction
 */
class AwsAddressExtractor extends AddressExtractor {
	/**
	 * Maps AWS Location Service fields into the standardized Brazilian address.
	 *
	 * @override
	 */
	padronizaEndereco() {
		if (!this.data || !this.data.address) return;

		const address = this.data.address;

		// AWS does not provide street-level (logradouro) or house number fields.
		// Extract from the label as a best-effort fallback.
		this.enderecoPadronizado.logradouro = null;
		this.enderecoPadronizado.numero = null;

		// neighborhood → bairro
		this.enderecoPadronizado.bairro = address.neighborhood || null;

		// municipality → municipio
		this.enderecoPadronizado.municipio = address.municipality || null;

		// AWS does not provide a metropolitan region field
		this.enderecoPadronizado.regiaoMetropolitana = null;

		// region → uf (full state name)
		this.enderecoPadronizado.uf = address.region || null;

		// AWS provides only the full state name, not an ISO state code
		this.enderecoPadronizado.siglaUF = null;

		// postalCode → cep
		this.enderecoPadronizado.cep = address.postalCode || null;

		// country: AWS uses ISO 3166-1 alpha-3 ("BRA") → normalize to "Brasil"
		this.enderecoPadronizado.pais = BRAZIL_CODES.has(address.country) ? 'Brasil' : (address.country || 'Brasil');

		// Use label as display_name equivalent for logging / toString
		if (this.data.address.label) {
			this.data = { ...this.data, display_name: this.data.address.label };
		}

		this.enderecoPadronizado.referencePlace = new ReferencePlace(this.data);
	}
}

export default AwsAddressExtractor;
export { AwsAddressExtractor };
