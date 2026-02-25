/**
 * Address extractor for AWS Location Based Service responses.
 *
 * Reads AWS-native field names directly into a `BrazilianStandardAddress`
 * without any cross-provider field mapping.
 *
 * AWS response shape (with neighborhood):
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
 * AWS response shape (street address with addressNumber, no neighborhood):
 * ```json
 * {
 *   "address": {
 *     "label": "Rua Eloi Cerqueira 72, Belém, São Paulo, 03062-010, BRA",
 *     "addressNumber": "72",
 *     "municipality": "São Paulo",
 *     "region": "São Paulo",
 *     "country": "BRA",
 *     "postalCode": "03062-010",
 *     "interpolated": false
 *   }
 * }
 * ```
 *
 * @module data/AwsAddressExtractor
 * @since 0.11.1-alpha
 * @author Marcelo Pereira Barbosa
 */

import { AddressExtractor } from './AddressExtractor.js';
import ReferencePlace from './ReferencePlace.js';

/** ISO 3166-1 alpha-3 country codes for Brazil */
const BRAZIL_CODES = new Set(['BRA', 'BR', 'Brasil', 'Brazil']);

/**
 * Maps Brazilian state full names to their two-letter UF abbreviations.
 * AWS Location Service returns the full state name in the `region` field.
 *
 * @type {Map<string, string>}
 */
const BRAZIL_STATE_SIGLAS = new Map([
	['Acre', 'AC'],
	['Alagoas', 'AL'],
	['Amapá', 'AP'],
	['Amazonas', 'AM'],
	['Bahia', 'BA'],
	['Ceará', 'CE'],
	['Distrito Federal', 'DF'],
	['Espírito Santo', 'ES'],
	['Goiás', 'GO'],
	['Maranhão', 'MA'],
	['Mato Grosso', 'MT'],
	['Mato Grosso do Sul', 'MS'],
	['Minas Gerais', 'MG'],
	['Pará', 'PA'],
	['Paraíba', 'PB'],
	['Paraná', 'PR'],
	['Pernambuco', 'PE'],
	['Piauí', 'PI'],
	['Rio de Janeiro', 'RJ'],
	['Rio Grande do Norte', 'RN'],
	['Rio Grande do Sul', 'RS'],
	['Rondônia', 'RO'],
	['Roraima', 'RR'],
	['Santa Catarina', 'SC'],
	['São Paulo', 'SP'],
	['Sergipe', 'SE'],
	['Tocantins', 'TO'],
]);

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
	padronizaEndereco(): void {
		if (!this.data || !this.data.address) return;

		const address = this.data.address;

		// addressNumber → numero (explicit field takes priority)
		this.enderecoPadronizado.numero = address.addressNumber || null;

		// Extract logradouro and bairro from label as best-effort fallback.
		// Label format: "<Street> <Number>, <Bairro>, <Municipio>, <CEP>, <Country>"
		const { logradouro, bairro: labelBairro } = AwsAddressExtractor._parseLabel(
			address.label,
			address.addressNumber,
			address.municipality,
		);
		this.enderecoPadronizado.logradouro = logradouro;

		// neighborhood → bairro (explicit field takes priority over label)
		this.enderecoPadronizado.bairro = address.neighborhood || labelBairro || null;

		// municipality → municipio
		this.enderecoPadronizado.municipio = address.municipality || null;

		// AWS does not provide a metropolitan region field
		this.enderecoPadronizado.regiaoMetropolitana = null;

		// region → uf (full state name) and siglaUF (two-letter abbreviation via lookup)
		this.enderecoPadronizado.uf = address.region || null;
		this.enderecoPadronizado.siglaUF = AwsAddressExtractor._resolveStateSigla(address.region);

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

	/**
	 * Parses `logradouro` and `bairro` from an AWS label string.
	 *
	 * AWS label format: "<Street> <Number>, <Bairro>, <Municipio>, <CEP>, <Country>"
	 *
	 * @param {string|undefined} label - The label string from the AWS address
	 * @param {string|undefined} addressNumber - The address number (used to strip from street)
	 * @param {string|undefined} municipality - Municipality name (to avoid misidentifying it as bairro)
	 * @returns {{ logradouro: string|null, bairro: string|null }}
	 * @private
	 */
	static _parseLabel(label, addressNumber, municipality) {
		if (!label || typeof label !== 'string') return { logradouro: null, bairro: null };

		const parts = label.split(', ');

		// First segment: "<Street> <Number>" or just a place name
		let logradouro = parts[0] || null;
		if (logradouro && addressNumber) {
			// Strip trailing " <addressNumber>" to isolate the street name
			const suffix = ` ${addressNumber}`;
			if (logradouro.endsWith(suffix)) {
				logradouro = logradouro.slice(0, -suffix.length).trim() || null;
			}
		}

		// Second segment: candidate bairro — skip if it matches municipality or looks like a postal code
		let bairro = null;
		if (parts.length >= 2) {
			const candidate = parts[1];
			const isPostalCode = /^\d{5}-?\d{3}$/.test(candidate);
			const isMunicipality = municipality && candidate === municipality;
			if (!isPostalCode && !isMunicipality) {
				bairro = candidate;
			}
		}

		return { logradouro, bairro };
	}
	/**
	 * Resolves a two-letter UF sigla from a Brazilian state full name.
	 *
	 * @param {string|undefined} region - Full state name from AWS `region` field (e.g. "São Paulo")
	 * @returns {string|null} Two-letter sigla (e.g. "SP"), or null if not recognized
	 * @private
	 */
	static _resolveStateSigla(region) {
		if (!region || typeof region !== 'string') return null;
		return BRAZIL_STATE_SIGLAS.get(region) || null;
	}
}

export default AwsAddressExtractor;
export { AwsAddressExtractor };
