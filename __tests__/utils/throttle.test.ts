/**
 * @fileoverview Unit tests for the throttle utility.
 * @module __tests__/utils/throttle
 */

import { throttle } from '../../src/utils/throttle.js';

describe('throttle', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	// ─── argument validation ──────────────────────────────────────────────────

	it('throws TypeError when first argument is not a function', () => {
		expect(() => throttle(42 as unknown as () => void, 100)).toThrow(TypeError);
		expect(() => throttle(null as unknown as () => void, 100)).toThrow(TypeError);
	});

	it('throws TypeError when wait is negative', () => {
		expect(() => throttle(() => {}, -1)).toThrow(TypeError);
	});

	it('throws TypeError when wait is NaN', () => {
		expect(() => throttle(() => {}, NaN)).toThrow(TypeError);
	});

	it('throws TypeError when wait is Infinity', () => {
		expect(() => throttle(() => {}, Infinity)).toThrow(TypeError);
	});

	it('accepts wait = 0', () => {
		const fn = jest.fn();
		expect(() => throttle(fn, 0)).not.toThrow();
	});

	// ─── leading-edge behaviour ───────────────────────────────────────────────

	it('calls fn immediately on first invocation', () => {
		const fn = jest.fn().mockReturnValue('result');
		const throttled = throttle(fn, 1000);
		const result = throttled();
		expect(fn).toHaveBeenCalledTimes(1);
		expect(result).toBe('result');
	});

	it('drops calls within the cooldown window (returns undefined)', () => {
		const fn = jest.fn().mockReturnValue('result');
		const throttled = throttle(fn, 1000);
		throttled(); // fires
		const dropped = throttled(); // within window
		expect(dropped).toBeUndefined();
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('passes arguments through to the wrapped function', () => {
		const fn = jest.fn();
		const throttled = throttle(fn, 1000);
		throttled(1, 'a', true);
		expect(fn).toHaveBeenCalledWith(1, 'a', true);
	});

	// ─── cooldown window ─────────────────────────────────────────────────────

	it('allows a second call after the wait period elapses', () => {
		const fn = jest.fn();
		const throttled = throttle(fn, 1000);
		throttled();
		jest.advanceTimersByTime(1000);
		throttled();
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('still drops calls just before the wait period ends', () => {
		const fn = jest.fn();
		const throttled = throttle(fn, 1000);
		throttled();
		jest.advanceTimersByTime(999);
		throttled();
		expect(fn).toHaveBeenCalledTimes(1);
	});

	// ─── flush ────────────────────────────────────────────────────────────────

	it('has a flush() method', () => {
		const throttled = throttle(() => {}, 1000);
		expect(typeof throttled.flush).toBe('function');
	});

	it('flush() resets cooldown so next call fires immediately', () => {
		const fn = jest.fn();
		const throttled = throttle(fn, 1000);
		throttled(); // fires
		throttled(); // dropped
		throttled.flush();
		throttled(); // should fire again
		expect(fn).toHaveBeenCalledTimes(2);
	});

	// ─── wait = 0 ────────────────────────────────────────────────────────────

	it('with wait = 0 fires on every call', () => {
		const fn = jest.fn();
		const throttled = throttle(fn, 0);
		throttled();
		throttled();
		throttled();
		expect(fn).toHaveBeenCalledTimes(3);
	});

	// ─── return value ────────────────────────────────────────────────────────

	it('returns undefined for dropped calls', () => {
		const fn = jest.fn().mockReturnValue(42);
		const throttled = throttle(fn, 1000);
		throttled();
		expect(throttled()).toBeUndefined();
	});

	it('returns the function result for non-dropped calls', () => {
		const fn = jest.fn().mockReturnValue(42);
		const throttled = throttle(fn, 1000);
		expect(throttled()).toBe(42);
	});
});
