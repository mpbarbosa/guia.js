// test/types/paraty-geoservices.d.test.ts

import type {
  GeoPosition,
  GeoPositionError,
  GeoPositionOptions,
  GetCurrentPositionOutput,
  GeolocationProvider,
  BrowserGeolocationProvider,
  MockGeolocationProvider,
  MockGeolocationProviderConfig,
  GetCurrentPositionUseCase,
  WatchPositionUseCase,
} from '../../src/types/paraty-geoservices.d';

describe('paraty-geoservices type declarations', () => {
  describe('GeoPosition', () => {
    it('should allow valid GeoPosition objects', () => {
      const pos: GeoPosition = {
        coords: {
          latitude: 10,
          longitude: 20,
          accuracy: 5,
          altitude: 100,
          altitudeAccuracy: 1,
          heading: 90,
          speed: 2,
        },
        timestamp: Date.now(),
      };
      expect(pos.coords.latitude).toBe(10);
      expect(typeof pos.timestamp).toBe('number');
    });

    it('should allow null for altitude, altitudeAccuracy, heading, speed', () => {
      const pos: GeoPosition = {
        coords: {
          latitude: 0,
          longitude: 0,
          accuracy: 0,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: 0,
      };
      expect(pos.coords.altitude).toBeNull();
      expect(pos.coords.heading).toBeNull();
    });
  });

  describe('GeoPositionError', () => {
    it('should allow valid error codes and messages', () => {
      const err: GeoPositionError = { code: 1, message: 'Permission denied' };
      expect([1, 2, 3]).toContain(err.code);
      expect(typeof err.message).toBe('string');
    });
  });

  describe('GeoPositionOptions', () => {
    it('should allow all options to be undefined', () => {
      const opts: GeoPositionOptions = {};
      expect(opts).toEqual({});
    });

    it('should allow valid option values', () => {
      const opts: GeoPositionOptions = {
        enableHighAccuracy: true,
        timeout: 1000,
        maximumAge: 500,
      };
      expect(opts.enableHighAccuracy).toBe(true);
      expect(opts.timeout).toBe(1000);
      expect(opts.maximumAge).toBe(500);
    });
  });

  describe('GetCurrentPositionOutput', () => {
    it('should require a position property of type GeoPosition', () => {
      const pos: GeoPosition = {
        coords: {
          latitude: 1,
          longitude: 2,
          accuracy: 3,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: 123,
      };
      const output: GetCurrentPositionOutput = { position: pos };
      expect(output.position.coords.latitude).toBe(1);
    });
  });

  describe('GeolocationProvider abstract class', () => {
    class TestProvider extends (class {} as typeof GeolocationProvider) {
      getCurrentPosition(
        success: (pos: GeoPosition) => void,
        error: (err: GeoPositionError) => void,
        options?: GeoPositionOptions
      ): void {
        success({
          coords: {
            latitude: 1,
            longitude: 2,
            accuracy: 3,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: 123,
        });
      }
      watchPosition(
        success: (pos: GeoPosition) => void,
        error: (err: GeoPositionError) => void,
        options?: GeoPositionOptions
      ): number | null {
        return 1;
      }
      clearWatch(watchId: number): void {}
      isSupported(): boolean {
        return true;
      }
    }

    it('should allow subclassing and method implementation', () => {
      const provider = new TestProvider();
      let called = false;
      provider.getCurrentPosition(
        () => { called = true; },
        () => {}
      );
      expect(called).toBe(true);
      expect(provider.isSupported()).toBe(true);
      expect(provider.watchPosition(() => {}, () => {})).toBe(1);
    });
  });

  describe('MockGeolocationProvider', () => {
    let MockProvider: typeof MockGeolocationProvider;
    beforeAll(() => {
      // @ts-ignore: This is a type-only import, so we fake a class for runtime
      MockProvider = class extends (class {} as typeof MockGeolocationProvider) {
        private _supported = true;
        private _position: GeoPosition | null = null;
        private _error: GeoPositionError | null = null;
        isSupported() { return this._supported; }
        setPosition(pos: GeoPosition) { this._position = pos; }
        setError(err: GeoPositionError) { this._error = err; }
        getCurrentPosition(
          success: (pos: GeoPosition) => void,
          error: (err: GeoPositionError) => void
        ) {
          if (this._error) error(this._error);
          else if (this._position) success(this._position);
        }
        watchPosition(
          success: (pos: GeoPosition) => void,
          error: (err: GeoPositionError) => void
        ) { return 1; }
        clearWatch() {}
        isPermissionsAPISupported() { return true; }
        triggerWatchUpdate() {}
        triggerWatchError() {}
        destroy() {}
      };
    });

    it('should allow instantiation with config', () => {
      const provider = new MockProvider({ supported: false });
      expect(provider.isSupported()).toBe(false);
    });

    it('should call success callback with set position', () => {
      const provider = new MockProvider();
      const pos: GeoPosition = {
        coords: {
          latitude: 5,
          longitude: 6,
          accuracy: 1,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: 42,
      };
      provider.setPosition(pos);
      let result: GeoPosition | null = null;
      provider.getCurrentPosition(
        p => { result = p; },
        () => {}
      );
      expect(result).toEqual(pos);
    });

    it('should call error callback with set error', () => {
      const provider = new MockProvider();
      const err: GeoPositionError = { code: 2, message: 'Position unavailable' };
      provider.setError(err);
      let error: GeoPositionError | null = null;
      provider.getCurrentPosition(
        () => {},
        e => { error = e; }
      );
      expect(error).toEqual(err);
    });
  });

  describe('GetCurrentPositionUseCase', () => {
    class DummyProvider extends (class {} as typeof GeolocationProvider) {
      getCurrentPosition(
        success: (pos: GeoPosition) => void,
        error: (err: GeoPositionError) => void
      ) {
        success({
          coords: {
            latitude: 1,
            longitude: 2,
            accuracy: 3,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: 123,
        });
      }
      watchPosition() { return null; }
      clearWatch() {}
      isSupported() { return true; }
    }

    it('should resolve with position on success', async () => {
      // @ts-ignore: type-only import
      const useCase = new (GetCurrentPositionUseCase as any)(new DummyProvider());
      const result = await useCase.execute();
      expect(result.position.coords.latitude).toBe(1);
    });

    it('should reject with error on failure', async () => {
      class FailingProvider extends DummyProvider {
        getCurrentPosition(
          success: (pos: GeoPosition) => void,
          error: (err: GeoPositionError) => void
        ) {
          error({ code: 3, message: 'Timeout' });
        }
      }
      // @ts-ignore: type-only import
      const useCase = new (GetCurrentPositionUseCase as any)(new FailingProvider());
      await expect(useCase.execute()).rejects.toMatchObject({ code: 3, message: 'Timeout' });
    });
  });

  describe('WatchPositionUseCase', () => {
    class WatchProvider extends (class {} as typeof GeolocationProvider) {
      private _success: ((pos: GeoPosition) => void) | null = null;
      private _error: ((err: GeoPositionError) => void) | null = null;
      getCurrentPosition() {}
      watchPosition(
        success: (pos: GeoPosition) => void,
        error: (err: GeoPositionError) => void
      ) {
        this._success = success;
        this._error = error;
        return 1;
      }
      clearWatch() {}
      isSupported() { return true; }
      triggerUpdate(pos: GeoPosition) { this._success && this._success(pos); }
      triggerError(err: GeoPositionError) { this._error && this._error(err); }
    }

    it('should call onUpdate when position changes', () => {
      const provider = new WatchProvider();
      // @ts-ignore: type-only import
      const useCase = new (WatchPositionUseCase as any)(provider);
      let called = false;
      useCase.start(() => { called = true; }, () => {});
      provider.triggerUpdate({
        coords: {
          latitude: 7,
          longitude: 8,
          accuracy: 1,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: 99,
      });
      expect(called).toBe(true);
      expect(useCase.isWatching).toBe(true);
      useCase.stop();
      expect(useCase.isWatching).toBe(false);
    });

    it('should call onError when error occurs', () => {
      const provider = new WatchProvider();
      // @ts-ignore: type-only import
      const useCase = new (WatchPositionUseCase as any)(provider);
      let error: GeoPositionError | null = null;
      useCase.start(() => {}, e => { error = e; });
      provider.triggerError({ code: 1, message: 'Permission denied' });
      expect(error).toEqual({ code: 1, message: 'Permission denied' });
    });
  });
});
