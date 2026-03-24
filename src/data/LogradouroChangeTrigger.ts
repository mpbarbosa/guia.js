/**
 * Encapsulates all logic that decides when a logradouro (street-name) change
 * should be announced and when `PositionManager`'s distance gate should be
 * bypassed to allow rapid confirmation reads.
 *
 * ## Motivation
 *
 * Historically this decision was spread across three layers:
 *
 * - `AddressCache` — inline `logradouroReallyChanged` derivation from three
 *   separate buffer-state snapshots.
 * - `ServiceCoordinator` — fast-throttle switch wired to
 *   `setPendingConfirmationCallback`.
 * - `PositionManager` — distance gate that inadvertently blocked confirmation
 *   reads at city driving speeds (see `setBypassDistanceRule`).
 *
 * This module is the single source of truth for that decision.
 *
 * ## Algorithm
 *
 * ```
 * observe(newValue):
 *   1. Feed newValue into an AddressFieldConfirmationBuffer (threshold N).
 *   2. If the buffer just confirmed a new value (confirmed === true)
 *      AND a previous confirmed value already existed
 *      AND the new value differs from that previous value
 *      → announce = true, bypassDistance = false (confirmation is done)
 *   3. If the buffer has a pending candidate (not yet confirmed)
 *      → bypassDistance = true  (let every GPS fix through so confirmation
 *                                 accumulates as fast as possible)
 *      → announce = false
 *   4. Otherwise → announce = false, bypassDistance = false
 * ```
 *
 * ## Usage
 *
 * ```ts
 * const trigger = new LogradouroChangeTrigger();
 *
 * // Feed each geocoding result:
 * const { announce, bypassDistance } = trigger.observe(newStreetName);
 *
 * if (announce) { speechManager.speak(...); }
 * positionManager.setBypassDistanceRule(bypassDistance);
 * ```
 *
 * @module data/LogradouroChangeTrigger
 * @since 0.12.9-alpha
 * @author Marcelo Pereira Barbosa
 */

import AddressFieldConfirmationBuffer from './AddressFieldConfirmationBuffer.js';
import { LOGRADOURO_CONFIRMATION_COUNT } from '../config/defaults.js';

/**
 * Result returned by {@link LogradouroChangeTrigger.observe}.
 */
export interface LogradouroObserveResult {
	/** True exactly once per confirmed logradouro change. */
	announce: boolean;
	/**
	 * True while a new candidate is pending confirmation.
	 * Callers should relay this to `PositionManager.setBypassDistanceRule()`
	 * so that every GPS fix is forwarded to the geocoder, allowing the
	 * confirmation buffer to fill up as quickly as possible.
	 */
	bypassDistance: boolean;
}

class LogradouroChangeTrigger {
	private readonly _buffer: AddressFieldConfirmationBuffer;

	/**
	 * @param threshold - Consecutive identical geocoding results required before
	 *   a logradouro change is confirmed.  Defaults to
	 *   `LOGRADOURO_CONFIRMATION_COUNT` (3).
	 */
	constructor(threshold: number = LOGRADOURO_CONFIRMATION_COUNT) {
		this._buffer = new AddressFieldConfirmationBuffer(threshold);
	}

	// ─── Public API ────────────────────────────────────────────────────────────

	/**
	 * Feed a new geocoding result into the trigger.
	 *
	 * @param newValue - Latest `logradouro` value from the geocoding response,
	 *   or `null` (e.g. rural area with no named street).
	 * @returns An object describing whether to announce and whether to bypass
	 *   the `PositionManager` distance gate.
	 */
	observe(newValue: string | null): LogradouroObserveResult {
		const wasPreviouslyConfirmed = this._buffer.isConfirmed;
		const prevConfirmed           = this._buffer.confirmed;

		const justConfirmed = this._buffer.observe(newValue);

		const announce =
			justConfirmed &&
			wasPreviouslyConfirmed &&
			newValue !== prevConfirmed;

		// After observe(), hasPending reflects whether a candidate is still
		// accumulating (not yet confirmed).  Drive the distance-bypass from this.
		const bypassDistance = this._buffer.hasPending;

		return { announce, bypassDistance };
	}

	/**
	 * Resets all internal buffer state.
	 * Call when the app restarts, the user teleports, or tracking is stopped.
	 */
	reset(): void {
		this._buffer.reset();
	}

	// ─── Delegated read-only getters (for tests / diagnostics) ─────────────────

	/** The current confirmed logradouro value, or `null` if none yet. */
	get confirmed(): string | null {
		return this._buffer.confirmed;
	}

	/** True if a confirmed value exists (including confirmed `null`). */
	get isConfirmed(): boolean {
		return this._buffer.isConfirmed;
	}

	/** True while a pending (unconfirmed) candidate is accumulating. */
	get hasPending(): boolean {
		return this._buffer.hasPending;
	}

	/** The current pending candidate, or `null` if none. */
	get pending(): string | null {
		return this._buffer.pending;
	}

	/** How many times the pending candidate has been observed so far. */
	get pendingCount(): number {
		return this._buffer.pendingConfirmationCount;
	}

	/** The confirmation threshold this trigger was configured with. */
	get threshold(): number {
		return this._buffer.threshold;
	}
}

export default LogradouroChangeTrigger;
export { LogradouroChangeTrigger };
