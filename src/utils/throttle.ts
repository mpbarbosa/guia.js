/**
 * @fileoverview Throttle higher-order function — limits how often a function can be called.
 * @module utils/throttle
 * @license MIT
 * @copyright 2026 Marcelo Pereira Barbosa
 *
 * Adapted from ibira.js/src/utils/throttle.ts (same interface and behaviour).
 * @see https://github.com/mpbarbosa/ibira.js/blob/main/src/utils/throttle.ts
 */

/**
 * A throttled function with an additional `flush()` method that resets the cooldown
 * so the next call executes immediately.
 *
 * @template TArgs - Tuple of argument types of the wrapped function
 * @template TReturn - Return type of the wrapped function
 */
export interface ThrottledFunction<TArgs extends unknown[], TReturn> {
	/**
	 * Calls the wrapped function if the cooldown has elapsed; returns `undefined` otherwise.
	 */
	(...args: TArgs): TReturn | undefined;
	/**
	 * Resets the internal timestamp so the next call executes immediately regardless of
	 * elapsed time since the last execution.
	 */
	flush(): void;
}

/**
 * Creates a throttled version of `fn` that executes at most once per `wait` milliseconds
 * (leading-edge strategy: the first call in each window fires immediately).
 *
 * Calls made while the cooldown is active are silently dropped and return `undefined`.
 * Use the returned `flush()` method to reset the cooldown on demand.
 *
 * @template TArgs - Tuple of argument types of the wrapped function
 * @template TReturn - Return type of the wrapped function
 *
 * @param {(...args: TArgs) => TReturn} fn - The function to throttle
 * @param {number} wait - Minimum milliseconds between executions (must be ≥ 0)
 * @returns {ThrottledFunction<TArgs, TReturn>} Throttled wrapper with a `flush()` escape hatch
 *
 * @throws {TypeError} When `fn` is not a function or `wait` is not a non-negative number
 *
 * @example
 * // Throttle a handler to at most once per 5 seconds
 * const throttledHandler = throttle((position: GeolocationPosition) => {
 *   processPosition(position);
 * }, 5000);
 *
 * navigator.geolocation.watchPosition(throttledHandler);
 *
 * @example
 * // Force the next call through regardless of the cooldown
 * throttledHandler.flush();
 *
 * @since 0.12.11-alpha
 */
export function throttle<TArgs extends unknown[], TReturn>(
	fn: (...args: TArgs) => TReturn,
	wait: number,
): ThrottledFunction<TArgs, TReturn> {
	if (typeof fn !== 'function') {
		throw new TypeError('throttle: first argument must be a function');
	}
	if (typeof wait !== 'number' || wait < 0 || !isFinite(wait)) {
		throw new TypeError('throttle: wait must be a non-negative finite number');
	}

	let lastCall = 0;

	const throttled = (...args: TArgs): TReturn | undefined => {
		const now = Date.now();
		if (now - lastCall >= wait) {
			lastCall = now;
			return fn(...args);
		}
		return undefined;
	};

	throttled.flush = (): void => {
		lastCall = 0;
	};

	return throttled;
}
