// __tests__/global.d.test.ts

import '../src/types/global.d';

describe('window global augmentations', () => {
  afterEach(() => {
    // Clean up all augmented properties
    delete window.findNearbyRestaurants;
    delete window.fetchCityStatistics;
    delete window.GuiaApp;
    delete window.ibiraLoadingPromise;
    delete window.IbiraAPIFetchManager;
    delete window.ErrorRecovery;
  });

  describe('findNearbyRestaurants', () => {
    it('should call the registered function with correct arguments', () => {
      const mockFn = jest.fn();
      window.findNearbyRestaurants = mockFn;
      window.findNearbyRestaurants!(12.34, 56.78);
      expect(mockFn).toHaveBeenCalledWith(12.34, 56.78);
    });

    it('should be undefined if not registered', () => {
      expect(window.findNearbyRestaurants).toBeUndefined();
    });
  });

  describe('fetchCityStatistics', () => {
    it('should call the registered function with correct arguments', () => {
      const mockFn = jest.fn();
      window.fetchCityStatistics = mockFn;
      window.fetchCityStatistics!(90, -45);
      expect(mockFn).toHaveBeenCalledWith(90, -45);
    });

    it('should be undefined if not registered', () => {
      expect(window.fetchCityStatistics).toBeUndefined();
    });
  });

  describe('GuiaApp namespace', () => {
    it('should allow switchProvider to be called', () => {
      const mockSwitch = jest.fn();
      window.GuiaApp = { switchProvider: mockSwitch };
      window.GuiaApp.switchProvider?.('osm');
      expect(mockSwitch).toHaveBeenCalledWith('osm');
    });

    it('should allow geocoder to be set and accessed', () => {
      const mockGeocoder = { reverse: jest.fn() };
      window.GuiaApp = { geocoder: mockGeocoder as any };
      expect(window.GuiaApp.geocoder).toBe(mockGeocoder);
    });

    it('should allow arbitrary properties', () => {
      window.GuiaApp = { foo: 123, bar: 'baz' };
      expect(window.GuiaApp.foo).toBe(123);
      expect(window.GuiaApp.bar).toBe('baz');
    });

    it('should be undefined if not set', () => {
      expect(window.GuiaApp).toBeUndefined();
    });
  });

  describe('ibiraLoadingPromise', () => {
    it('should resolve when set to a resolved promise', async () => {
      window.ibiraLoadingPromise = Promise.resolve();
      await expect(window.ibiraLoadingPromise).resolves.toBeUndefined();
    });

    it('should reject when set to a rejected promise', async () => {
      window.ibiraLoadingPromise = Promise.reject(new Error('fail'));
      await expect(window.ibiraLoadingPromise).rejects.toThrow('fail');
    });

    it('should be undefined if not set', () => {
      expect(window.ibiraLoadingPromise).toBeUndefined();
    });
  });

  describe('IbiraAPIFetchManager', () => {
    it('should instantiate with config object', () => {
      class DummyManager {
        config: object;
        constructor(config: object) {
          this.config = config;
        }
      }
      window.IbiraAPIFetchManager = DummyManager as any;
      const instance = new window.IbiraAPIFetchManager!({ foo: 'bar' });
      expect(instance).toBeInstanceOf(DummyManager);
      expect((instance as any).config).toEqual({ foo: 'bar' });
    });

    it('should be undefined if not set', () => {
      expect(window.IbiraAPIFetchManager).toBeUndefined();
    });
  });

  describe('ErrorRecovery', () => {
    it('should call displayError with correct arguments', () => {
      const mockDisplay = jest.fn();
      window.ErrorRecovery = { displayError: mockDisplay };
      window.ErrorRecovery.displayError('Title', 'Message');
      expect(mockDisplay).toHaveBeenCalledWith('Title', 'Message');
    });

    it('should be undefined if not set', () => {
      expect(window.ErrorRecovery).toBeUndefined();
    });
  });
});
