/**
 * Unit tests for AddressFieldConfirmationBuffer
 *
 * Tests the 8 scenarios defined in the FRS (AC-01 through AC-08 mapping):
 *  1. First observation — not confirmed (AC-01)
 *  2. Same value twice, below threshold — not confirmed (AC-01)
 *  3. Same value N times (= threshold) — confirmed on Nth call (AC-02)
 *  4. Candidate changes before threshold — count resets, new candidate starts (AC-03)
 *  5. Confirmed value observed again — returns false, no redundant change (AC-02)
 *  6. null value handling
 *  7. Custom threshold constructor argument
 *  8. reset() clears all state
 *
 * @since 0.12.10-alpha
 */

import AddressFieldConfirmationBuffer from '../../src/data/AddressFieldConfirmationBuffer.js';

describe('AddressFieldConfirmationBuffer', () => {
	describe('Scenario 1: first observation — not confirmed', () => {
		it('returns false on the very first observe() call', () => {
			const buf = new AddressFieldConfirmationBuffer(3);
			expect(buf.observe('Rua A')).toBe(false);
		});

		it('sets the pending candidate after first observation', () => {
			const buf = new AddressFieldConfirmationBuffer(3);
			buf.observe('Rua A');
			expect(buf.pending).toBe('Rua A');
			expect(buf.pendingConfirmationCount).toBe(1);
			expect(buf.confirmed).toBeNull();
		});
	});

	describe('Scenario 2: repeated observations below threshold — not confirmed', () => {
		it('returns false for every call below the threshold', () => {
			const buf = new AddressFieldConfirmationBuffer(3);
			expect(buf.observe('Rua A')).toBe(false); // count=1
			expect(buf.observe('Rua A')).toBe(false); // count=2
		});

		it('increments pendingConfirmationCount correctly', () => {
			const buf = new AddressFieldConfirmationBuffer(3);
			buf.observe('Rua A');
			buf.observe('Rua A');
			expect(buf.pendingConfirmationCount).toBe(2);
			expect(buf.confirmed).toBeNull();
		});
	});

	describe('Scenario 3: threshold reached — confirmed on Nth call', () => {
		it('returns true on exactly the Nth consecutive call', () => {
			const buf = new AddressFieldConfirmationBuffer(3);
			expect(buf.observe('Rua A')).toBe(false); // count=1
			expect(buf.observe('Rua A')).toBe(false); // count=2
			expect(buf.observe('Rua A')).toBe(true);  // count=3 → confirmed
		});

		it('sets confirmed and clears pending after threshold', () => {
			const buf = new AddressFieldConfirmationBuffer(3);
			buf.observe('Rua A');
			buf.observe('Rua A');
			buf.observe('Rua A');
			expect(buf.confirmed).toBe('Rua A');
			expect(buf.pending).toBeNull();
			expect(buf.pendingConfirmationCount).toBe(0);
		});
	});

	describe('Scenario 4: candidate changes before threshold — count resets', () => {
		it('resets pending count when a different candidate arrives', () => {
			const buf = new AddressFieldConfirmationBuffer(3);
			buf.observe('Rua A'); // count=1
			buf.observe('Rua A'); // count=2
			buf.observe('Rua B'); // new candidate — resets
			expect(buf.pending).toBe('Rua B');
			expect(buf.pendingConfirmationCount).toBe(1);
			expect(buf.confirmed).toBeNull();
		});

		it('does not confirm the previous candidate after a switch', () => {
			const buf = new AddressFieldConfirmationBuffer(3);
			buf.observe('Rua A');
			buf.observe('Rua A');
			const result = buf.observe('Rua B'); // switch
			expect(result).toBe(false);
		});

		it('can confirm the new candidate after it reaches threshold', () => {
			const buf = new AddressFieldConfirmationBuffer(3);
			buf.observe('Rua A');
			buf.observe('Rua B'); // switch
			buf.observe('Rua B');
			const result = buf.observe('Rua B'); // 3rd consecutive 'Rua B'
			expect(result).toBe(true);
			expect(buf.confirmed).toBe('Rua B');
		});
	});

	describe('Scenario 5: confirmed value observed again — no redundant change', () => {
		it('returns false when the already-confirmed value is observed again', () => {
			const buf = new AddressFieldConfirmationBuffer(3);
			buf.observe('Rua A');
			buf.observe('Rua A');
			buf.observe('Rua A'); // confirmed
			expect(buf.observe('Rua A')).toBe(false); // already confirmed
		});

		it('clears any pending candidate when confirmed value is re-observed', () => {
			const buf = new AddressFieldConfirmationBuffer(3);
			buf.observe('Rua A');
			buf.observe('Rua A');
			buf.observe('Rua A'); // confirmed
			buf.observe('Rua B'); // pending
			buf.observe('Rua A'); // back to confirmed — clears pending
			expect(buf.pending).toBeNull();
			expect(buf.pendingConfirmationCount).toBe(0);
			expect(buf.confirmed).toBe('Rua A');
		});
	});

	describe('Scenario 6: null value handling', () => {
		it('handles null without throwing', () => {
			const buf = new AddressFieldConfirmationBuffer(3);
			expect(() => buf.observe(null)).not.toThrow();
		});

		it('treats null as a valid pending candidate', () => {
			const buf = new AddressFieldConfirmationBuffer(3);
			buf.observe(null);
			// pending is null-as-value (not "no pending") — hasPending is true
			expect(buf.pendingConfirmationCount).toBe(1);
		});

		it('can confirm null after threshold', () => {
			const buf = new AddressFieldConfirmationBuffer(2);
			expect(buf.observe(null)).toBe(false); // count=1
			expect(buf.observe(null)).toBe(true);  // count=2 → confirmed
			expect(buf.confirmed).toBeNull();
		});

		it('returns false for null when null is already confirmed', () => {
			const buf = new AddressFieldConfirmationBuffer(2);
			buf.observe(null);
			buf.observe(null); // confirmed null
			expect(buf.observe(null)).toBe(false);
		});
	});

	describe('Scenario 7: custom threshold constructor argument', () => {
		it('honours a threshold of 1 (confirms on first observation)', () => {
			const buf = new AddressFieldConfirmationBuffer(1);
			expect(buf.observe('Rua A')).toBe(true);
			expect(buf.confirmed).toBe('Rua A');
		});

		it('honours a threshold of 5', () => {
			const buf = new AddressFieldConfirmationBuffer(5);
			for (let i = 0; i < 4; i++) {
				expect(buf.observe('Rua A')).toBe(false);
			}
			expect(buf.observe('Rua A')).toBe(true);
		});

		it('exposes the threshold via getter', () => {
			const buf = new AddressFieldConfirmationBuffer(7);
			expect(buf.threshold).toBe(7);
		});
	});

	describe('Scenario 8: reset() clears all state', () => {
		it('clears confirmed, pending, and count', () => {
			const buf = new AddressFieldConfirmationBuffer(3);
			buf.observe('Rua A');
			buf.observe('Rua A');
			buf.observe('Rua A'); // confirmed
			buf.observe('Rua B'); // pending
			buf.reset();
			expect(buf.confirmed).toBeNull();
			expect(buf.pending).toBeNull();
			expect(buf.pendingConfirmationCount).toBe(0);
		});

		it('allows new confirmations after reset', () => {
			const buf = new AddressFieldConfirmationBuffer(2);
			buf.observe('Rua A');
			buf.observe('Rua A'); // confirmed
			buf.reset();
			expect(buf.observe('Rua B')).toBe(false);
			expect(buf.observe('Rua B')).toBe(true);
		});
	});

	describe('GPS jitter simulation (AC-01, AC-03)', () => {
		it('does not confirm a brief wrong-street reading (1 event)', () => {
			const buf = new AddressFieldConfirmationBuffer(3);
			// First establish 'Rua Correta' as confirmed
			buf.observe('Rua Correta');
			buf.observe('Rua Correta');
			buf.observe('Rua Correta');
			// Single wrong-street event
			const wrongStreetFired = buf.observe('Rua Errada');
			expect(wrongStreetFired).toBe(false);
			expect(buf.confirmed).toBe('Rua Correta');
		});

		it('does not confirm alternating jitter (street A / street B)', () => {
			const buf = new AddressFieldConfirmationBuffer(3);
			buf.observe('Rua A'); // pending count=1
			buf.observe('Rua B'); // resets to Rua B count=1
			buf.observe('Rua A'); // resets to Rua A count=1
			buf.observe('Rua B'); // resets to Rua B count=1
			expect(buf.confirmed).toBeNull();
		});

		it('confirms a genuine street change after 3 consecutive readings', () => {
			const buf = new AddressFieldConfirmationBuffer(3);
			buf.observe('Rua Velha');
			buf.observe('Rua Velha');
			buf.observe('Rua Velha'); // confirmed
			buf.observe('Rua Nova'); // count=1
			buf.observe('Rua Nova'); // count=2
			const confirmed = buf.observe('Rua Nova'); // count=3 → confirmed
			expect(confirmed).toBe(true);
			expect(buf.confirmed).toBe('Rua Nova');
		});
	});
});
