/**
 * GeocodingState - Manages current position and coordinates state.
 *
 * Created locally because GeocodingState was not included in
 * paraty_geocore.js@0.9.9-alpha CDN exports.
 *
 * @module core/GeocodingState
 * @since 0.11.8-alpha
 */

export default class GeocodingState {
	constructor() {
		this._position = null;
	}

	/**
	 * Returns the current GeoPosition object.
	 * @returns {Object|null}
	 */
	getCurrentPosition() {
		return this._position;
	}

	/**
	 * Returns the current coordinates from the stored position.
	 * @returns {Object|null}
	 */
	getCurrentCoordinates() {
		return this._position?.coords ?? null;
	}

	/**
	 * Sets the current position.
	 * @param {Object} position - A GeoPosition or compatible position object
	 */
	setPosition(position) {
		this._position = position;
	}

	/**
	 * Cleans up state references.
	 */
	destroy() {
		this._position = null;
	}
}
