// src/core/__tests__/GeocodingState.test.js

import GeocodingState from '../GeocodingState';

describe('GeocodingState', () => {
  let state;

  beforeEach(() => {
    state = new GeocodingState();
  });

  describe('constructor', () => {
    it('initializes with null position', () => {
      expect(state._position).toBeNull();
    });
  });

  describe('getCurrentPosition', () => {
    it('returns null when no position is set', () => {
      expect(state.getCurrentPosition()).toBeNull();
    });

    it('returns the current position when set', () => {
      const pos = { coords: { latitude: 1, longitude: 2 } };
      state.setPosition(pos);
      expect(state.getCurrentPosition()).toBe(pos);
    });
  });

  describe('getCurrentCoordinates', () => {
    it('returns null when no position is set', () => {
      expect(state.getCurrentCoordinates()).toBeNull();
    });

    it('returns null when position is set but has no coords', () => {
      state.setPosition({ foo: 'bar' });
      expect(state.getCurrentCoordinates()).toBeNull();
    });

    it('returns coords when position has coords', () => {
      const coords = { latitude: 10, longitude: 20 };
      state.setPosition({ coords });
      expect(state.getCurrentCoordinates()).toBe(coords);
    });

    it('returns coords when position has coords as null', () => {
      state.setPosition({ coords: null });
      expect(state.getCurrentCoordinates()).toBeNull();
    });
  });

  describe('setPosition', () => {
    it('sets the position to a given object', () => {
      const pos = { coords: { latitude: 5, longitude: 6 } };
      state.setPosition(pos);
      expect(state._position).toBe(pos);
    });

    it('sets the position to null', () => {
      state.setPosition(null);
      expect(state._position).toBeNull();
    });

    it('sets the position to an object without coords', () => {
      const pos = { foo: 'bar' };
      state.setPosition(pos);
      expect(state._position).toBe(pos);
    });
  });

  describe('destroy', () => {
    it('resets position to null', () => {
      state.setPosition({ coords: { latitude: 1, longitude: 2 } });
      state.destroy();
      expect(state._position).toBeNull();
    });

    it('does not throw if called when position is already null', () => {
      expect(() => state.destroy()).not.toThrow();
      expect(state._position).toBeNull();
    });
  });

  describe('integration scenarios', () => {
    it('setPosition, getCurrentPosition, getCurrentCoordinates, destroy sequence', () => {
      const coords = { latitude: 42, longitude: 24 };
      const pos = { coords };
      state.setPosition(pos);
      expect(state.getCurrentPosition()).toBe(pos);
      expect(state.getCurrentCoordinates()).toBe(coords);
      state.destroy();
      expect(state.getCurrentPosition()).toBeNull();
      expect(state.getCurrentCoordinates()).toBeNull();
    });

    it('handles edge case: setPosition with undefined', () => {
      state.setPosition(undefined);
      expect(state.getCurrentPosition()).toBeUndefined();
      expect(state.getCurrentCoordinates()).toBeNull();
    });
  });
});
