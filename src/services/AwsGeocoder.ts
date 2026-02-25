/**
 * Reverse geocoder for the AWS Location Based Service.
 *
 * Sends a POST request to the AWS /api/geocode/reverse endpoint and
 * returns both the raw API response and the standardized Brazilian address
 * produced by `AwsAddressExtractor`.
 *
 * @module services/AwsGeocoder
 * @since 0.11.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import { log } from '../utils/logger.js';
import { env } from '../config/environment.js';
import AwsAddressExtractor from '../data/AwsAddressExtractor.js';

/**
 * Reverse geocoder that calls the AWS Location Based Service API.
 *
 * @class
 */
class AwsGeocoder {
	baseUrl: string;
	endpoint: string;

	/**
	 * @param {string} [baseUrl] - AWS API base URL (defaults to env.awsLbsBaseUrl)
	 */
	constructor(baseUrl?: string) {
		this.baseUrl = baseUrl || env.awsLbsBaseUrl;
		this.endpoint = `${this.baseUrl}/api/geocode/reverse`;
	}

	/**
	 * Performs reverse geocoding via the AWS Location Based Service.
	 *
	 * @param {number} latitude
	 * @param {number} longitude
	 * @returns {Promise<{rawData: Object, enderecoPadronizado: BrazilianStandardAddress}>}
	 * @throws {Error} On network failure or non-OK HTTP status
	 */
	async reverseGeocode(latitude: number, longitude: number): Promise<{rawData: object, enderecoPadronizado: object}> {
		if (!latitude || !longitude) {
			throw new Error('(AwsGeocoder) Invalid coordinates');
		}

		log(`(AwsGeocoder) POST ${this.endpoint} lat=${latitude} lon=${longitude}`);

		const response = await fetch(this.endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ latitude, longitude }),
		});

		if (!response.ok) {
			throw new Error(`(AwsGeocoder) HTTP ${response.status}: ${response.statusText}`);
		}

		const rawData = await response.json();
		log('(AwsGeocoder) Response:', rawData);

		const extractor = new AwsAddressExtractor(rawData);
		return {
			rawData,
			enderecoPadronizado: extractor.enderecoPadronizado,
		};
	}
}

export default AwsGeocoder;
export { AwsGeocoder };
