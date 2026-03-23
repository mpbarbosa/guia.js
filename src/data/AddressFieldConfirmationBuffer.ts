/**
 * Generic address-field confirmation buffer that requires a new value to be
 * observed N consecutive times before it is considered confirmed.
 *
 * **Purpose**: Mitigates GPS intersection jitter.  When driving near street
 * intersections, the browser's Geolocation API can report coordinates that fall
 * on an adjacent street/neighbourhood/municipality due to a ~50 m GPS error
 * margin.  A single geocoding result should not immediately flip the displayed
 * address — this buffer demands N consecutive identical results first.
 *
 * **Algorithm**:
 * ```
 * Pending candidate = null, count = 0
 *
 * observe(value):
 *   if value == confirmed  → reset pending, return false
 *   if value == pending    → count++
 *                            if count >= threshold → confirm, return true
 *                            else return false
 *   else (new candidate)   → pending = value, count = 1, return false
 * ```
 *
 * **Configuration**: Pass the threshold to the constructor, or rely on the
 * default imported from `src/config/defaults.ts`
 * (`LOGRADOURO_CONFIRMATION_COUNT`, `BAIRRO_CONFIRMATION_COUNT`,
 * `MUNICIPIO_CONFIRMATION_COUNT`).
 *
 * @module data/AddressFieldConfirmationBuffer
 * @since 0.12.8-alpha
 * @author Marcelo Pereira Barbosa
 *
 * @example
 * import AddressFieldConfirmationBuffer from './AddressFieldConfirmationBuffer.js';
 *
 * const buffer = new AddressFieldConfirmationBuffer(3);
 *
 * buffer.observe('Rua A');   // false — 1st occurrence
 * buffer.observe('Rua A');   // false — 2nd occurrence
 * buffer.observe('Rua A');   // true  — 3rd consecutive → confirmed!
 *
 * buffer.observe('Rua A');   // false — already confirmed, no new change
 *
 * buffer.observe('Rua B');   // false — new candidate (count reset to 1)
 * buffer.observe('Rua A');   // false — candidate changed back, resets again
 */

import { LOGRADOURO_CONFIRMATION_COUNT } from '../config/defaults.js';

// Sentinel used internally to distinguish "never confirmed" from "confirmed null".
// null is a valid address field value (e.g. no street name in rural areas).
const UNCONFIRMED = Symbol('UNCONFIRMED');

class AddressFieldConfirmationBuffer {
	private _confirmed: string | null | typeof UNCONFIRMED;
	private _pending: string | null | typeof UNCONFIRMED;
	private _pendingCount: number;
	private readonly _threshold: number;

	/**
	 * @param {number} [threshold] - Number of consecutive identical observations
	 *   required before a new value is confirmed.  Defaults to
	 *   `LOGRADOURO_CONFIRMATION_COUNT` (3).
	 */
	constructor(threshold: number = LOGRADOURO_CONFIRMATION_COUNT) {
		this._threshold = threshold;
		this._confirmed = UNCONFIRMED;
		this._pending   = UNCONFIRMED;
		this._pendingCount = 0;
	}

	// ─── Public API ────────────────────────────────────────────────────────────

	/**
	 * Observe a new address-field value.
	 *
	 * Returns `true` exactly once per confirmed change — on the call where the
	 * pending candidate reaches the required consecutive count.
	 *
	 * @param {string | null} newValue - The latest value from the geocoding result.
	 * @returns {boolean} `true` if the value has just been confirmed; `false` otherwise.
	 *
	 * @example
	 * // Jitter scenario: wrong street for 1 event, then back to original
	 * buffer.observe('Rua Correta');  // confirmed = 'Rua Correta'
	 * buffer.observe('Rua Errada');   // false — pending, count=1
	 * buffer.observe('Rua Correta');  // false — candidate reset, confirmed stays
	 *
	 * @example
	 * // Legitimate turn scenario (threshold = 3):
	 * buffer.observe('Nova Rua');  // false — count=1
	 * buffer.observe('Nova Rua');  // false — count=2
	 * buffer.observe('Nova Rua');  // true  — confirmed!
	 */
	observe(newValue: string | null): boolean {
		// Observation of the already-confirmed value → keep confirmed, clear pending
		if (newValue === this._confirmed) {
			this._resetPending();
			return false;
		}

		// Continuation of an existing pending candidate
		if (this._pending !== UNCONFIRMED && newValue === this._pending) {
			this._pendingCount++;

			if (this._pendingCount >= this._threshold) {
				// Threshold reached → confirm
				this._confirmed = this._pending;
				this._resetPending();
				return true;
			}

			return false;
		}

		// New candidate (different from both confirmed and current pending).
		// Handle threshold=1: confirm immediately on first observation.
		this._pending      = newValue;
		this._pendingCount = 1;

		if (this._pendingCount >= this._threshold) {
			this._confirmed = this._pending;
			this._resetPending();
			return true;
		}

		return false;
	}

	/**
	 * Resets all state: confirmed value, pending candidate, and count.
	 * Useful when the position changes dramatically (e.g. app restart, large jump).
	 */
	reset(): void {
		this._confirmed    = UNCONFIRMED;
		this._pending      = UNCONFIRMED;
		this._pendingCount = 0;
	}

	// ─── Getters ───────────────────────────────────────────────────────────────

	/** True if at least one value has been confirmed (includes confirmed null). */
	get isConfirmed(): boolean {
		return this._confirmed !== UNCONFIRMED;
	}

	/** The last confirmed address field value, or `null` if none confirmed yet. */
	get confirmed(): string | null {
		return this._confirmed === UNCONFIRMED ? null : (this._confirmed as string | null);
	}

	/** The current pending candidate value, or `null` if no candidate is pending. */
	get pending(): string | null {
		return this._pending === UNCONFIRMED ? null : (this._pending as string | null);
	}

	/** True if there is currently an unconfirmed pending candidate (including null). */
	get hasPending(): boolean {
		return this._pending !== UNCONFIRMED;
	}

	/** How many consecutive times the pending candidate has been observed so far. */
	get pendingConfirmationCount(): number {
		return this._pendingCount;
	}

	/** The confirmation threshold this buffer was configured with. */
	get threshold(): number {
		return this._threshold;
	}

	// ─── Private helpers ───────────────────────────────────────────────────────

	private _resetPending(): void {
		this._pending      = UNCONFIRMED;
		this._pendingCount = 0;
	}
}

// Export for ES6 modules
export default AddressFieldConfirmationBuffer;

// CommonJS compatibility (Node.js)
if (typeof module !== 'undefined' && module.exports) {
	module.exports = AddressFieldConfirmationBuffer;
}
