/**
 * TypeScript interfaces for OpenStreetMap Nominatim API responses.
 *
 * Used by NominatimAddressExtractor and address-parser to type-safely
 * access the geocoding response fields.
 *
 * @module types/nominatim
 * @since 0.12.11-alpha
 */

/**
 * Address sub-object returned inside a Nominatim reverse-geocoding response.
 * Field presence varies — all properties are optional.
 */
export interface NominatimAddress {
  // Brazilian / generic road-level fields
  road?: string;
  street?: string;
  pedestrian?: string;
  house_number?: string;

  // Neighbourhood / district
  neighbourhood?: string;
  suburb?: string;
  quarter?: string;
  village?: string;
  district?: string;
  hamlet?: string;
  town?: string;

  // Municipal / state
  city?: string;
  municipality?: string;
  county?: string;
  state?: string;
  state_code?: string;

  // Postal / country
  postcode?: string;
  country?: string;
  country_code?: string;

  // OSM addr: tags (may override the above)
  'addr:street'?: string;
  'addr:housenumber'?: string;
  'addr:neighbourhood'?: string;
  'addr:city'?: string;
  'addr:state'?: string;
  'addr:postcode'?: string;

  // ISO 3166-2 level 4 (used for siglaUF extraction)
  'ISO3166-2-lvl4'?: string;

  // Allow additional unknown Nominatim fields
  [key: string]: string | undefined;
}

/**
 * Full response object from a Nominatim reverse-geocoding request.
 */
export interface NominatimResponse {
  address?: NominatimAddress;
  display_name?: string;
  place_id?: number;
  osm_type?: string;
  osm_id?: number;
  lat?: string;
  lon?: string;
  type?: string;
  /** OSM feature class (e.g. 'shop', 'amenity', 'place', 'railway', 'building') */
  class?: string;
  name?: string;
  /** Allow additional Nominatim top-level fields */
  [key: string]: unknown;
}

/**
 * Minimal OSM element shape used by ReferencePlace to identify points of interest.
 */
export interface OsmElement {
  class?: string;
  type?: string;
  name?: string;
  [key: string]: unknown;
}

/**
 * Address sub-object returned inside an AWS Location Service response.
 */
export interface AwsAddress {
  label?: string;
  addressNumber?: string;
  street?: string;
  neighborhood?: string;
  municipality?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  [key: string]: string | undefined;
}
