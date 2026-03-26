// test/core/GeocodingState.test.js
// Tests for GeocodingState imported from paraty_geocore.js CDN.

import { GeocodingState, GeoPosition } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.12.7-alpha/dist/esm/index.js';

const makeGeoPosition = (lat = -23.55, lon = -46.63) =>
	new GeoPosition({ coords: { latitude: lat, longitude: lon } });

describe('GeocodingState (CDN)', () => {
	let state;

	beforeEach(() => {
		state = new GeocodingState();
	});

	describe('constructor', () => {
		it('initializes with no position', () => {
			expect(state.getCurrentPosition()).toBeNull();
			expect(state.getCurrentCoordinates()).toBeNull();
			expect(state.hasPosition()).toBe(false);
		});
	});

	describe('setPosition / getCurrentPosition', () => {
		it('accepts a valid GeoPosition', () => {
			const pos = makeGeoPosition();
			state.setPosition(pos);
			expect(state.getCurrentPosition()).toBe(pos);
			expect(state.hasPosition()).toBe(true);
		});

		it('accepts null to clear the position', () => {
			state.setPosition(makeGeoPosition());
			state.setPosition(null);
			expect(state.getCurrentPosition()).toBeNull();
			expect(state.hasPosition()).toBe(false);
		});

		it('returns this for chaining', () => {
			const result = state.setPosition(makeGeoPosition());
			expect(result).toBe(state);
		});

		it('throws TypeError for a plain object', () => {
			expect(() => state.setPosition({ coords: { latitude: 1, longitude: 2 } }))
				.toThrow(TypeError);
		});

		it('throws TypeError for undefined', () => {
			expect(() => state.setPosition(undefined)).toThrow(TypeError);
		});
	});

	describe('getCurrentCoordinates', () => {
		it('returns null when no position is set', () => {
			expect(state.getCurrentCoordinates()).toBeNull();
		});

		it('returns {latitude, longitude} after setPosition', () => {
			state.setPosition(makeGeoPosition(-10, -50));
			const coords = state.getCurrentCoordinates();
			expect(coords).toEqual({ latitude: -10, longitude: -50 });
		});

		it('returns a defensive copy', () => {
			state.setPosition(makeGeoPosition());
			const a = state.getCurrentCoordinates();
			const b = state.getCurrentCoordinates();
			expect(a).not.toBe(b);
			expect(a).toEqual(b);
		});
	});

	describe('clear', () => {
		it('resets position and coordinates to null', () => {
			state.setPosition(makeGeoPosition());
			state.clear();
			expect(state.getCurrentPosition()).toBeNull();
			expect(state.getCurrentCoordinates()).toBeNull();
			expect(state.hasPosition()).toBe(false);
		});

		it('does not throw when already cleared', () => {
			expect(() => state.clear()).not.toThrow();
		});
	});

	describe('observer pattern', () => {
		it('notifies subscriber when position is set', () => {
			const snapshots = [];
			state.subscribe((snap) => snapshots.push(snap));
			const pos = makeGeoPosition();
			state.setPosition(pos);
			expect(snapshots).toHaveLength(1);
			expect(snapshots[0].position).toBe(pos);
			expect(snapshots[0].coordinates).toEqual({ latitude: -23.55, longitude: -46.63 });
		});

		it('does not notify when position is cleared with null', () => {
			state.setPosition(makeGeoPosition());
			const snapshots = [];
			state.subscribe((snap) => snapshots.push(snap));
			state.setPosition(null);
			expect(snapshots).toHaveLength(0);
			expect(state.hasPosition()).toBe(false);
		});

		it('unsubscribe stops notifications', () => {
			const calls = [];
			const unsub = state.subscribe((snap) => calls.push(snap));
			unsub();
			state.setPosition(makeGeoPosition());
			expect(calls).toHaveLength(0);
		});
	});
});

