/**
 * Unit tests for LogradouroChangeTrigger
 *
 * Verifies the full decision logic for logradouro change announcement and
 * PositionManager distance-gate bypass, covering:
 *
 *  1. No announcement on initial observations (pending phase)
 *  2. bypassDistance=true while a pending candidate exists
 *  3. announce=true exactly once when threshold is reached on a new street
 *  4. bypassDistance=false once candidate is confirmed (pending cleared)
 *  5. No announcement when the already-confirmed value is re-observed
 *  6. GPS jitter scenario: new candidate reverts before confirmation
 *  7. Threshold=1 (immediate confirmation)
 *  8. null handling (rural area with no street name)
 *  9. reset() clears all state
 * 10. pendingCount and threshold getters
 *
 * @since 0.12.9-alpha
 */

import LogradouroChangeTrigger from '../../src/data/LogradouroChangeTrigger.js';

describe('LogradouroChangeTrigger', () => {

	// ─── 1. Initial pending phase ──────────────────────────────────────────────

	describe('initial observations (pending phase)', () => {
		it('returns announce=false on the very first observation', () => {
			const trigger = new LogradouroChangeTrigger(3);
			const { announce } = trigger.observe('Rua A');
			expect(announce).toBe(false);
		});

		it('returns announce=false on the second observation (below threshold)', () => {
			const trigger = new LogradouroChangeTrigger(3);
			trigger.observe('Rua A');
			const { announce } = trigger.observe('Rua A');
			expect(announce).toBe(false);
		});
	});

	// ─── 2. bypassDistance while pending ──────────────────────────────────────

	describe('bypassDistance signal', () => {
		it('bypassDistance=true on first observation of a new candidate', () => {
			const trigger = new LogradouroChangeTrigger(3);
			// No prior confirmed value → first call sets pending
			const { bypassDistance } = trigger.observe('Rua A');
			expect(bypassDistance).toBe(true);
		});

		it('bypassDistance=true while candidate is still accumulating', () => {
			const trigger = new LogradouroChangeTrigger(3);
			trigger.observe('Rua A'); // count=1, pending
			const { bypassDistance } = trigger.observe('Rua A'); // count=2
			expect(bypassDistance).toBe(true);
		});

		it('bypassDistance=false once the initial candidate is confirmed (no prior confirmed)', () => {
			const trigger = new LogradouroChangeTrigger(3);
			trigger.observe('Rua A');
			trigger.observe('Rua A');
			const { bypassDistance } = trigger.observe('Rua A'); // threshold=3, confirmed
			expect(bypassDistance).toBe(false);
		});

		it('bypassDistance=false when the confirmed value is re-observed', () => {
			const trigger = new LogradouroChangeTrigger(3);
			trigger.observe('Rua A');
			trigger.observe('Rua A');
			trigger.observe('Rua A'); // confirmed
			const { bypassDistance } = trigger.observe('Rua A'); // already confirmed
			expect(bypassDistance).toBe(false);
		});

		it('bypassDistance=true when a new candidate starts after an established confirmed value', () => {
			const trigger = new LogradouroChangeTrigger(3);
			// Establish confirmed 'Rua A'
			trigger.observe('Rua A');
			trigger.observe('Rua A');
			trigger.observe('Rua A'); // confirmed
			// New candidate
			const { bypassDistance } = trigger.observe('Rua B');
			expect(bypassDistance).toBe(true);
		});
	});

	// ─── 3 & 4. Legitimate street change ──────────────────────────────────────

	describe('legitimate street change (threshold=3)', () => {
		it('announces exactly once when a new street is confirmed after prior confirmed street', () => {
			const trigger = new LogradouroChangeTrigger(3);
			// Establish first confirmed street (no announce — no prior confirmed)
			trigger.observe('Rua A');
			trigger.observe('Rua A');
			trigger.observe('Rua A');
			expect(trigger.isConfirmed).toBe(true);
			expect(trigger.confirmed).toBe('Rua A');

			// Now change to Rua B
			expect(trigger.observe('Rua B').announce).toBe(false); // count=1
			expect(trigger.observe('Rua B').announce).toBe(false); // count=2
			const result = trigger.observe('Rua B');               // count=3 → confirmed
			expect(result.announce).toBe(true);
		});

		it('bypassDistance=false at the moment announce fires', () => {
			const trigger = new LogradouroChangeTrigger(3);
			trigger.observe('Rua A'); trigger.observe('Rua A'); trigger.observe('Rua A');
			trigger.observe('Rua B'); trigger.observe('Rua B');
			const { announce, bypassDistance } = trigger.observe('Rua B');
			expect(announce).toBe(true);
			expect(bypassDistance).toBe(false);
		});

		it('does NOT announce again when the confirmed street is re-observed', () => {
			const trigger = new LogradouroChangeTrigger(3);
			trigger.observe('Rua A'); trigger.observe('Rua A'); trigger.observe('Rua A');
			trigger.observe('Rua B'); trigger.observe('Rua B'); trigger.observe('Rua B');
			// Re-observe confirmed Rua B
			expect(trigger.observe('Rua B').announce).toBe(false);
			expect(trigger.observe('Rua B').announce).toBe(false);
		});
	});

	// ─── 5. No announce when already confirmed value is re-observed ────────────

	describe('no announce on already-confirmed value', () => {
		it('announce=false for confirmed value observed again after first confirmation', () => {
			const trigger = new LogradouroChangeTrigger(3);
			trigger.observe('Rua A'); trigger.observe('Rua A'); trigger.observe('Rua A');
			const { announce } = trigger.observe('Rua A');
			expect(announce).toBe(false);
		});
	});

	// ─── 6. GPS jitter scenario ────────────────────────────────────────────────

	describe('GPS jitter (candidate reverts before confirmation)', () => {
		it('no announce and no confirmed change when jitter resets the candidate', () => {
			const trigger = new LogradouroChangeTrigger(3);
			// Establish 'Rua Correta'
			trigger.observe('Rua Correta'); trigger.observe('Rua Correta'); trigger.observe('Rua Correta');

			// Jitter: wrong street appears for 1 reading, then reverts
			expect(trigger.observe('Rua Errada').announce).toBe(false); // new candidate, count=1
			expect(trigger.observe('Rua Correta').announce).toBe(false); // candidate reset, no announce
			expect(trigger.confirmed).toBe('Rua Correta');
		});

		it('bypassDistance=true during jitter candidate, false after it reverts', () => {
			const trigger = new LogradouroChangeTrigger(3);
			trigger.observe('Rua Correta'); trigger.observe('Rua Correta'); trigger.observe('Rua Correta');

			expect(trigger.observe('Rua Errada').bypassDistance).toBe(true);
			expect(trigger.observe('Rua Correta').bypassDistance).toBe(false);
		});
	});

	// ─── 7. threshold=1 ────────────────────────────────────────────────────────

	describe('threshold=1 (immediate confirmation)', () => {
		it('confirms on first observation', () => {
			const trigger = new LogradouroChangeTrigger(1);
			trigger.observe('Rua A'); // first confirmed, no prior
			const { announce } = trigger.observe('Rua B');
			expect(announce).toBe(true);
		});

		it('bypassDistance=false immediately after confirmation with threshold=1', () => {
			const trigger = new LogradouroChangeTrigger(1);
			const { bypassDistance } = trigger.observe('Rua A');
			expect(bypassDistance).toBe(false);
		});
	});

	// ─── 8. null handling ──────────────────────────────────────────────────────

	describe('null value (rural area, no street name)', () => {
		it('handles null as a valid pending candidate', () => {
			const trigger = new LogradouroChangeTrigger(3);
			trigger.observe('Rua A'); trigger.observe('Rua A'); trigger.observe('Rua A');
			// Switch to rural (null)
			trigger.observe(null); trigger.observe(null);
			const { announce } = trigger.observe(null);
			expect(announce).toBe(true);
		});

		it('bypassDistance=true while null is pending', () => {
			const trigger = new LogradouroChangeTrigger(3);
			trigger.observe('Rua A'); trigger.observe('Rua A'); trigger.observe('Rua A');
			const { bypassDistance } = trigger.observe(null);
			expect(bypassDistance).toBe(true);
		});
	});

	// ─── 9. reset() ────────────────────────────────────────────────────────────

	describe('reset()', () => {
		it('clears confirmed value, pending candidate, and count', () => {
			const trigger = new LogradouroChangeTrigger(3);
			trigger.observe('Rua A'); trigger.observe('Rua A'); trigger.observe('Rua A');
			trigger.observe('Rua B'); // pending

			trigger.reset();

			expect(trigger.isConfirmed).toBe(false);
			expect(trigger.confirmed).toBe(null);
			expect(trigger.hasPending).toBe(false);
			expect(trigger.pendingCount).toBe(0);
		});

		it('does not announce after reset even if same street is re-observed N times', () => {
			const trigger = new LogradouroChangeTrigger(3);
			trigger.observe('Rua A'); trigger.observe('Rua A'); trigger.observe('Rua A');
			trigger.reset();
			// After reset, first N observations confirm but announce=false (no prior confirmed)
			trigger.observe('Rua A'); trigger.observe('Rua A');
			const { announce } = trigger.observe('Rua A');
			expect(announce).toBe(false);
		});
	});

	// ─── 10. Getters ───────────────────────────────────────────────────────────

	describe('read-only getters', () => {
		it('threshold returns the constructor argument', () => {
			expect(new LogradouroChangeTrigger(5).threshold).toBe(5);
			expect(new LogradouroChangeTrigger(1).threshold).toBe(1);
		});

		it('pendingCount tracks accumulation correctly', () => {
			const trigger = new LogradouroChangeTrigger(3);
			trigger.observe('Rua A'); trigger.observe('Rua A'); trigger.observe('Rua A'); // confirmed
			trigger.observe('Rua B');
			expect(trigger.pendingCount).toBe(1);
			trigger.observe('Rua B');
			expect(trigger.pendingCount).toBe(2);
		});

		it('pending returns current candidate or null', () => {
			const trigger = new LogradouroChangeTrigger(3);
			expect(trigger.pending).toBe(null);
			trigger.observe('Rua A');
			expect(trigger.pending).toBe('Rua A');
		});
	});
});
