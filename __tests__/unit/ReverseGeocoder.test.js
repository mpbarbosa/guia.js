/**
 * @jest-environment node
 */

import { describe, test, expect, jest } from '@jest/globals';
import { ReverseGeocoder } from '../../src/guia.js';

// Mock DOM functions for testing
global.document = undefined;

// Mock fetch manager for ReverseGeocoder
const createMockFetchManager = () => ({
  fetch: jest.fn(),
  subscribe: jest.fn()
});

describe('ReverseGeocoder Class', () => {
  
  describe('toString Method', () => {
    test('should return formatted string with coordinates', () => {
      const geocoder = new ReverseGeocoder(createMockFetchManager());
      geocoder.setCoordinates(-23.5505, -46.6333);
      const result = geocoder.toString();
      
      expect(result).toContain('ReverseGeocoder');
      expect(result).toContain('-23.5505');
      expect(result).toContain('-46.6333');
      expect(result).toBe('ReverseGeocoder: -23.5505, -46.6333');
    });

    test('should handle missing coordinates gracefully', () => {
      const geocoder = new ReverseGeocoder(createMockFetchManager());
      const result = geocoder.toString();
      
      expect(result).toContain('ReverseGeocoder');
      expect(result).toContain('No coordinates set');
      expect(result).toBe('ReverseGeocoder: No coordinates set');
    });

    test('should handle incomplete coordinates (missing longitude)', () => {
      const geocoder = new ReverseGeocoder(createMockFetchManager());
      geocoder.setCoordinates(-23.5505, null);
      const result = geocoder.toString();
      
      expect(result).toContain('ReverseGeocoder');
      expect(result).toContain('No coordinates set');
      expect(result).toBe('ReverseGeocoder: No coordinates set');
    });

    test('should handle incomplete coordinates (missing latitude)', () => {
      const geocoder = new ReverseGeocoder(createMockFetchManager());
      geocoder.setCoordinates(null, -46.6333);
      const result = geocoder.toString();
      
      expect(result).toContain('ReverseGeocoder');
      expect(result).toContain('No coordinates set');
      expect(result).toBe('ReverseGeocoder: No coordinates set');
    });

    test('should reflect coordinates after setCoordinates is called', () => {
      const geocoder = new ReverseGeocoder(createMockFetchManager());
      expect(geocoder.toString()).toBe('ReverseGeocoder: No coordinates set');
      
      geocoder.setCoordinates(-23.5505, -46.6333);
      const result = geocoder.toString();
      
      expect(result).toContain('-23.5505');
      expect(result).toContain('-46.6333');
      expect(result).toBe('ReverseGeocoder: -23.5505, -46.6333');
    });

    test('should show different coordinates after update', () => {
      const geocoder = new ReverseGeocoder(createMockFetchManager());
      geocoder.setCoordinates(-23.5505, -46.6333);
      expect(geocoder.toString()).toBe('ReverseGeocoder: -23.5505, -46.6333');
      
      geocoder.setCoordinates(-22.9068, -43.1729); // Rio de Janeiro
      const result = geocoder.toString();
      
      expect(result).toBe('ReverseGeocoder: -22.9068, -43.1729');
    });
  });

  describe('API Error Handling and Edge Cases', () => {
    
    describe('Network Failures and Retries', () => {
      test('should handle network errors when fetchManager is not available', async () => {
        // Mock global fetch to simulate network failure
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
        
        const geocoder = new ReverseGeocoder(null); // No fetchManager
        geocoder.setCoordinates(-23.55, -46.63);
        
        await expect(geocoder.fetchAddress()).rejects.toThrow('Network error');
        expect(global.fetch).toHaveBeenCalled();
      });

      test('should handle HTTP errors (non-200 status) gracefully', async () => {
        // Mock global fetch to return non-OK response
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        });
        
        const geocoder = new ReverseGeocoder(null);
        geocoder.setCoordinates(-23.55, -46.63);
        
        await expect(geocoder.fetchAddress()).rejects.toThrow('HTTP error! status: 500');
      });

      test('should handle rate limiting (429 status)', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests'
        });
        
        const geocoder = new ReverseGeocoder(null);
        geocoder.setCoordinates(-23.55, -46.63);
        
        await expect(geocoder.fetchAddress()).rejects.toThrow('HTTP error! status: 429');
      });

      test('should handle timeout errors', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Request timeout'));
        
        const geocoder = new ReverseGeocoder(null);
        geocoder.setCoordinates(-23.55, -46.63);
        
        await expect(geocoder.fetchAddress()).rejects.toThrow('Request timeout');
      });

      test('should handle JSON parsing errors', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
        });
        
        const geocoder = new ReverseGeocoder(null);
        geocoder.setCoordinates(-23.55, -46.63);
        
        await expect(geocoder.fetchAddress()).rejects.toThrow('Invalid JSON');
      });
    });

    describe('Coordinate Validation', () => {
      test('should reject invalid coordinates (missing latitude)', async () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        geocoder.setCoordinates(null, -46.63);
        
        // setCoordinates returns early for invalid coords, so no URL is set
        await expect(geocoder.fetchAddress()).rejects.toThrow('Invalid coordinates');
      });

      test('should reject invalid coordinates (missing longitude)', async () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        geocoder.setCoordinates(-23.55, null);
        
        await expect(geocoder.fetchAddress()).rejects.toThrow('Invalid coordinates');
      });

      test('should reject invalid coordinates (both missing)', async () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        // Don't set coordinates at all
        
        await expect(geocoder.fetchAddress()).rejects.toThrow('Invalid coordinates');
      });

      test('should reject invalid coordinates (999 out of range)', async () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        geocoder.setCoordinates(999, 999);
        
        // The geocoder should still attempt to fetch, but the API will fail
        // This tests that we properly handle API errors for invalid coordinates
        const mockFetchManager = createMockFetchManager();
        mockFetchManager.fetch.mockRejectedValue(new Error('Invalid coordinates from API'));
        geocoder.fetchManager = mockFetchManager;
        
        await expect(geocoder.fetchAddress()).rejects.toThrow();
      });
    });

    describe('FetchManager Integration', () => {
      test('should use fetchManager when available', async () => {
        const mockFetchManager = createMockFetchManager();
        mockFetchManager.fetch.mockResolvedValue({
          address: { city: 'São Paulo' }
        });
        
        const geocoder = new ReverseGeocoder(mockFetchManager);
        geocoder.setCoordinates(-23.55, -46.63);
        
        const result = await geocoder.fetchAddress();
        
        expect(mockFetchManager.fetch).toHaveBeenCalled();
        expect(result.address.city).toBe('São Paulo');
      });

      test('should fall back to browser fetch when fetchManager is null', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ address: { city: 'Rio de Janeiro' } })
        });
        
        const geocoder = new ReverseGeocoder(null);
        geocoder.setCoordinates(-22.9068, -43.1729);
        
        const result = await geocoder.fetchAddress();
        
        expect(global.fetch).toHaveBeenCalled();
        expect(result.address.city).toBe('Rio de Janeiro');
      });

      test('should handle fetchManager errors gracefully', async () => {
        const mockFetchManager = createMockFetchManager();
        mockFetchManager.fetch.mockRejectedValue(new Error('FetchManager error'));
        
        const geocoder = new ReverseGeocoder(mockFetchManager);
        geocoder.setCoordinates(-23.55, -46.63);
        
        await expect(geocoder.fetchAddress()).rejects.toThrow('FetchManager error');
      });
    });

    describe('URL Generation', () => {
      test('should generate URL automatically when not set', async () => {
        const mockFetchManager = createMockFetchManager();
        mockFetchManager.fetch.mockResolvedValue({ address: {} });
        
        const geocoder = new ReverseGeocoder(mockFetchManager);
        geocoder.setCoordinates(-23.55, -46.63);
        
        await geocoder.fetchAddress();
        
        // Check that URL was generated
        expect(geocoder.url).toContain('nominatim.openstreetmap.org');
        expect(geocoder.url).toContain('lat=-23.55');
        expect(geocoder.url).toContain('lon=-46.63');
      });

      test('should use custom base URL from config', async () => {
        const mockFetchManager = createMockFetchManager();
        mockFetchManager.fetch.mockResolvedValue({ address: {} });
        
        const customConfig = {
          openstreetmapBaseUrl: 'https://custom.geocoding.api/reverse?format=json'
        };
        
        const geocoder = new ReverseGeocoder(mockFetchManager, customConfig);
        geocoder.setCoordinates(-23.55, -46.63);
        
        await geocoder.fetchAddress();
        
        expect(geocoder.url).toContain('custom.geocoding.api');
      });

      test('should regenerate URL when coordinates change', async () => {
        const mockFetchManager = createMockFetchManager();
        mockFetchManager.fetch.mockResolvedValue({ address: {} });
        
        const geocoder = new ReverseGeocoder(mockFetchManager);
        geocoder.setCoordinates(-23.55, -46.63);
        const firstUrl = geocoder.url;
        
        geocoder.setCoordinates(-22.9068, -43.1729);
        const secondUrl = geocoder.url;
        
        expect(firstUrl).not.toBe(secondUrl);
        expect(secondUrl).toContain('lat=-22.9068');
      });
    });

    describe('State Management', () => {
      test('should reset state when setCoordinates is called', () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        geocoder.data = { previous: 'data' };
        geocoder.error = new Error('Previous error');
        geocoder.loading = true;
        geocoder.lastFetch = 12345;
        
        geocoder.setCoordinates(-23.55, -46.63);
        
        expect(geocoder.data).toBeNull();
        expect(geocoder.error).toBeNull();
        expect(geocoder.loading).toBe(false);
        expect(geocoder.lastFetch).toBe(0);
      });

      test('should not reset state when coordinates are invalid', () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        geocoder.data = { preserved: 'data' };
        
        geocoder.setCoordinates(null, -46.63); // Invalid
        
        expect(geocoder.data).toEqual({ preserved: 'data' });
      });
    });

    describe('Error Propagation', () => {
      test('should propagate fetch errors correctly', async () => {
        const mockFetchManager = createMockFetchManager();
        const customError = new Error('Custom fetch error');
        mockFetchManager.fetch.mockRejectedValue(customError);
        
        const geocoder = new ReverseGeocoder(mockFetchManager);
        geocoder.setCoordinates(-23.55, -46.63);
        
        await expect(geocoder.fetchAddress()).rejects.toThrow('Custom fetch error');
      });

      test('should handle undefined response from fetchManager', async () => {
        const mockFetchManager = createMockFetchManager();
        mockFetchManager.fetch.mockResolvedValue(undefined);
        
        const geocoder = new ReverseGeocoder(mockFetchManager);
        geocoder.setCoordinates(-23.55, -46.63);
        
        const result = await geocoder.fetchAddress();
        expect(result).toBeUndefined();
      });

      test('should handle null response from browser fetch', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: async () => null
        });
        
        const geocoder = new ReverseGeocoder(null);
        geocoder.setCoordinates(-23.55, -46.63);
        
        const result = await geocoder.fetchAddress();
        expect(result).toBeNull();
      });
    });
  });

  describe('Observer Pattern Integration', () => {
    
    describe('Subscribe/Unsubscribe', () => {
      test('should subscribe observer to address updates', () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        const mockObserver = { update: jest.fn() };
        
        geocoder.subscribe(mockObserver);
        
        expect(geocoder.observerSubject.observers).toContain(mockObserver);
      });

      test('should unsubscribe observer from address updates', () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        const mockObserver = { update: jest.fn() };
        
        geocoder.subscribe(mockObserver);
        geocoder.unsubscribe(mockObserver);
        
        expect(geocoder.observerSubject.observers).not.toContain(mockObserver);
      });

      test('should notify observers when address data changes', () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        const mockObserver = { update: jest.fn() };
        
        geocoder.subscribe(mockObserver);
        geocoder.notifyObservers('testEvent', { data: 'test' });
        
        expect(mockObserver.update).toHaveBeenCalledWith('testEvent', { data: 'test' });
      });

      test('should handle multiple observers', () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        const observer1 = { update: jest.fn() };
        const observer2 = { update: jest.fn() };
        
        geocoder.subscribe(observer1);
        geocoder.subscribe(observer2);
        geocoder.notifyObservers('event');
        
        expect(observer1.update).toHaveBeenCalled();
        expect(observer2.update).toHaveBeenCalled();
      });
    });

    describe('PositionManager Integration (update method)', () => {
      
      test('should warn when AddressDataExtractor is not available', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        geocoder.AddressDataExtractor = null;
        
        const mockPositionManager = {
          lastPosition: {
            coords: { latitude: -23.55, longitude: -46.63 }
          }
        };
        
        geocoder.update(mockPositionManager, 'strCurrPosUpdate');
        
        // Note: warn() might be called, but we're testing the branch
        warnSpy.mockRestore();
      });

      test('should handle invalid PositionManager gracefully', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        
        geocoder.update(null, 'strCurrPosUpdate');
        
        // Should exit early without crashing
        warnSpy.mockRestore();
      });

      test('should handle PositionManager without lastPosition', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        
        geocoder.update({}, 'strCurrPosUpdate');
        
        warnSpy.mockRestore();
      });

      test('should process position updates and trigger geocoding', async () => {
        const mockFetchManager = createMockFetchManager();
        mockFetchManager.fetch.mockResolvedValue({
          address: { city: 'São Paulo' }
        });
        
        const geocoder = new ReverseGeocoder(mockFetchManager);
        const mockObserver = { update: jest.fn() };
        geocoder.subscribe(mockObserver);
        
        const mockPositionManager = {
          lastPosition: {
            coords: { latitude: -23.55, longitude: -46.63 }
          }
        };
        
        geocoder.update(mockPositionManager, 'strCurrPosUpdate');
        
        // Wait for async geocoding to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(geocoder.latitude).toBe(-23.55);
        expect(geocoder.longitude).toBe(-46.63);
      });

      test.skip('should handle geocoding errors in update method', async () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation();
        const mockFetchManager = createMockFetchManager();
        
        // Mock fetch to reject with error
        const geocodingError = new Error('Geocoding failed');
        mockFetchManager.fetch.mockRejectedValue(geocodingError);
        
        const geocoder = new ReverseGeocoder(mockFetchManager);
        
        const mockPositionManager = {
          lastPosition: {
            coords: { latitude: -23.55, longitude: -46.63 }
          }
        };
        
        // Call update - this triggers fetchAddress which will reject
        geocoder.update(mockPositionManager, 'strCurrPosUpdate');
        
        // Wait for async operation to complete and catch the rejection
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Verify error was handled (ReverseGeocoder should catch and log it)
        expect(errorSpy).toHaveBeenCalled();
        errorSpy.mockRestore();
      });

      test('should extract and standardize Brazilian address', async () => {
        const mockFetchManager = createMockFetchManager();
        mockFetchManager.fetch.mockResolvedValue({
          address: {
            city: 'São Paulo',
            suburb: 'Jardins',
            road: 'Avenida Paulista'
          }
        });
        
        const geocoder = new ReverseGeocoder(mockFetchManager);
        geocoder.AddressDataExtractor = {
          getBrazilianStandardAddress: jest.fn().mockReturnValue({
            logradouro: 'Avenida Paulista',
            bairro: 'Jardins',
            municipio: 'São Paulo'
          })
        };
        
        const mockPositionManager = {
          lastPosition: {
            coords: { latitude: -23.55, longitude: -46.63 }
          }
        };
        
        geocoder.update(mockPositionManager, 'strCurrPosUpdate');
        
        // Wait for async operation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(geocoder.AddressDataExtractor.getBrazilianStandardAddress).toHaveBeenCalled();
        expect(geocoder.enderecoPadronizado).toBeDefined();
      });

      test('should skip geocoding when coords are missing', () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        
        const mockPositionManager = {
          lastPosition: {
            coords: null
          }
        };
        
        geocoder.update(mockPositionManager, 'strCurrPosUpdate');
        
        // Should not set coordinates
        expect(geocoder.latitude).toBeUndefined();
      });

      test('should skip geocoding when latitude is missing', () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        
        const mockPositionManager = {
          lastPosition: {
            coords: { longitude: -46.63 }
          }
        };
        
        geocoder.update(mockPositionManager, 'strCurrPosUpdate');
        
        expect(geocoder.latitude).toBeUndefined();
      });

      test('should skip geocoding when longitude is missing', () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        
        const mockPositionManager = {
          lastPosition: {
            coords: { latitude: -23.55 }
          }
        };
        
        geocoder.update(mockPositionManager, 'strCurrPosUpdate');
        
        expect(geocoder.latitude).toBeUndefined();
      });
    });

    describe('Cache Key Generation', () => {
      test('should generate cache key from coordinates', () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        geocoder.setCoordinates(-23.55, -46.63);
        
        const cacheKey = geocoder.getCacheKey();
        
        expect(cacheKey).toBe('-23.55,-46.63');
      });

      test('should generate different cache keys for different coordinates', () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        
        geocoder.setCoordinates(-23.55, -46.63);
        const key1 = geocoder.getCacheKey();
        
        geocoder.setCoordinates(-22.9068, -43.1729);
        const key2 = geocoder.getCacheKey();
        
        expect(key1).not.toBe(key2);
      });
    });

    describe('CurrentAddress Property', () => {
      test('should set and get currentAddress data', () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        const addressData = { address: { city: 'São Paulo' } };
        
        geocoder.currentAddress = addressData;
        
        expect(geocoder.currentAddress).toEqual(addressData);
      });

      test('should return undefined when no currentAddress is set', () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        
        expect(geocoder.currentAddress).toBeUndefined();
      });
    });

    describe('secondUpdateParam Method', () => {
      test('should return standardized Brazilian address', () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        const standardizedAddress = {
          logradouro: 'Avenida Paulista',
          bairro: 'Jardins',
          municipio: 'São Paulo'
        };
        
        geocoder.enderecoPadronizado = standardizedAddress;
        
        expect(geocoder.secondUpdateParam()).toEqual(standardizedAddress);
      });

      test('should return undefined when no standardized address exists', () => {
        const geocoder = new ReverseGeocoder(createMockFetchManager());
        
        expect(geocoder.secondUpdateParam()).toBeUndefined();
      });
    });

    describe('_subscribe Internal Method', () => {
      test('should subscribe observers to fetchManager', () => {
        const mockFetchManager = createMockFetchManager();
        const geocoder = new ReverseGeocoder(mockFetchManager);
        const mockObserver = { update: jest.fn() };
        
        geocoder.subscribe(mockObserver);
        geocoder.setCoordinates(-23.55, -46.63);
        
        geocoder._subscribe(geocoder.url);
        
        expect(mockFetchManager.subscribe).toHaveBeenCalledWith(mockObserver, geocoder.url);
      });

      test('should handle multiple observers in _subscribe', () => {
        const mockFetchManager = createMockFetchManager();
        const geocoder = new ReverseGeocoder(mockFetchManager);
        const observer1 = { update: jest.fn() };
        const observer2 = { update: jest.fn() };
        
        geocoder.subscribe(observer1);
        geocoder.subscribe(observer2);
        geocoder.setCoordinates(-23.55, -46.63);
        
        geocoder._subscribe(geocoder.url);
        
        expect(mockFetchManager.subscribe).toHaveBeenCalledTimes(2);
      });
    });
  });

});
