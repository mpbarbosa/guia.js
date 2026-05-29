/**
 * NominatimGeocoderPort — Nominatim reverse-geocoding adapter that correctly maps
 * the OpenStreetMap `address.county` field to the `metropolitanRegion` GeoAddress
 * property.
 *
 * **Why this exists**:
 * `paraty_geoservices@v1.6.x`'s built-in Nominatim geocoder maps `address.region`
 * to `metropolitanRegion`.  However, the real Nominatim API stores the Brazilian
 * metropolitan region (e.g. "Região Metropolitana de São Paulo") in `address.county`,
 * not `address.region`.  Injecting this adapter as the `nominatimGeocoder` port in
 * `createReverseGeocoderService()` corrects the mapping without modifying the
 * upstream library.
 *
 * @module services/NominatimGeocoderPort
 * @since 0.27.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import type {
	GeoAddress,
	ReverseGeocoder,
} from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geoservices@v1.6.5/dist/esm/index.js';
import { NOMINATIM_API_BASE } from '../config/defaults.js';
import { debug, warn } from '../utils/logger.js';

/** Subset of fields returned inside the `address` object of a Nominatim response. */
interface NominatimAddressObject {
	house_number?: string;
	road?: string;
	pedestrian?: string;
	suburb?: string;
	neighbourhood?: string;
	quarter?: string;
	county?: string;   // ← metropolitan region in Brazil (e.g. "Região Metropolitana de São Paulo")
	city?: string;
	town?: string;
	village?: string;
	municipality?: string;
	state?: string;
	postcode?: string;
	country?: string;
	country_code?: string;
	'ISO3166-2-lvl4'?: string;
	[key: string]: string | undefined;
}

/** Full response envelope from the Nominatim reverse endpoint. */
interface NominatimResponse {
	place_id?: number;
	display_name?: string;
	address?: NominatimAddressObject;
	error?: string;
}

/** Maps a Brazilian state full name to its two-letter UF abbreviation. */
const STATE_SIGLAS = new Map<string, string>([
	['Acre', 'AC'], ['Alagoas', 'AL'], ['Amapá', 'AP'], ['Amazonas', 'AM'],
	['Bahia', 'BA'], ['Ceará', 'CE'], ['Distrito Federal', 'DF'],
	['Espírito Santo', 'ES'], ['Goiás', 'GO'], ['Maranhão', 'MA'],
	['Mato Grosso', 'MT'], ['Mato Grosso do Sul', 'MS'], ['Minas Gerais', 'MG'],
	['Pará', 'PA'], ['Paraíba', 'PB'], ['Paraná', 'PR'], ['Pernambuco', 'PE'],
	['Piauí', 'PI'], ['Rio de Janeiro', 'RJ'], ['Rio Grande do Norte', 'RN'],
	['Rio Grande do Sul', 'RS'], ['Rondônia', 'RO'], ['Roraima', 'RR'],
	['Santa Catarina', 'SC'], ['São Paulo', 'SP'], ['Sergipe', 'SE'],
	['Tocantins', 'TO'],
]);

function extractStateCode(iso3166: string | undefined): string | null {
	if (!iso3166) return null;
	const m = iso3166.match(/^BR-([A-Z]{2})$/);
	return m ? m[1] : null;
}

function mapNominatimAddressToGeoAddress(addr: NominatimAddressObject): GeoAddress {
	const neighborhood =
		addr.neighbourhood || addr.suburb || addr.quarter || null;

	const city =
		addr.city || addr.town || addr.municipality || addr.village || null;

	// KEY FIX: use `county` (metropolitan region in Brazil), not `region`.
	const metropolitanRegion =
		typeof addr.county === 'string' ? addr.county : null;

	const stateCode =
		addr['ISO3166-2-lvl4']
			? extractStateCode(addr['ISO3166-2-lvl4'])
			: addr.state
				? (STATE_SIGLAS.get(addr.state) ?? null)
				: null;

	return {
		street:             addr.road || addr.pedestrian || null,
		streetNumber:       addr.house_number || null,
		complement:         null,
		neighborhood,
		city,
		metropolitanRegion,
		state:              addr.state || null,
		stateCode,
		postalCode:         addr.postcode || null,
		country:            addr.country || 'Brasil',
	};
}

/**
 * Reverse-geocoding port backed by the Nominatim OpenStreetMap API.
 *
 * Correctly maps `address.county` → `metropolitanRegion` (unlike the built-in
 * paraty_geoservices Nominatim geocoder which uses the nonexistent `address.region`).
 *
 * @implements {ReverseGeocoder}
 */
class NominatimGeocoderPort implements ReverseGeocoder {
	private readonly _baseUrl: string;

	constructor(baseUrl = NOMINATIM_API_BASE) {
		this._baseUrl = baseUrl.replace(/\/$/, '');
	}

	async reverseGeocode(latitude: number, longitude: number): Promise<GeoAddress> {
		const url = `${this._baseUrl}/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
		debug(`(NominatimGeocoderPort) Fetching: ${url}`);

		let response: Response;
		try {
			response = await fetch(url, {
				headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' },
			});
		} catch (err) {
			warn(`(NominatimGeocoderPort) Network error: ${(err as Error).message}`);
			throw err;
		}

		if (!response.ok) {
			const msg = `Nominatim returned HTTP ${response.status}`;
			warn(`(NominatimGeocoderPort) ${msg}`);
			throw new Error(msg);
		}

		const data = await response.json() as NominatimResponse;

		if (data.error) {
			warn(`(NominatimGeocoderPort) API error: ${data.error}`);
			throw new Error(data.error);
		}

		if (!data.address) {
			warn('(NominatimGeocoderPort) Response has no address object');
			return {
				street: null, streetNumber: null, complement: null,
				neighborhood: null, city: null, metropolitanRegion: null,
				state: null, stateCode: null, postalCode: null, country: 'Brasil',
			};
		}

		const geoAddress = mapNominatimAddressToGeoAddress(data.address);
		debug('(NominatimGeocoderPort) Resolved:', geoAddress);
		return geoAddress;
	}
}

export default NominatimGeocoderPort;
export { NominatimGeocoderPort };
