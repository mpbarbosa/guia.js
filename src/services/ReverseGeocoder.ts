/**
 * Re-exports ReverseGeocoderService as ReverseGeocoder from the paraty_geoservices dependency.
 * The underlying class is exported as ReverseGeocoderService from the CDN; it is aliased here
 * so existing callers that import ReverseGeocoder continue to work unchanged.
 *
 * @module services/ReverseGeocoder
 * @see https://github.com/mpbarbosa/paraty_geoservices
 */
export {
	ReverseGeocoderService as ReverseGeocoder,
	ReverseGeocoderService as default,
	createReverseGeocoderService,
} from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geoservices@v1.6.3/dist/esm/index.js';
export type {
	ReverseGeocoderConfig,
	CreateReverseGeocoderServiceConfig,
	LegacyFetchManager,
} from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geoservices@v1.6.3/dist/esm/index.js';
