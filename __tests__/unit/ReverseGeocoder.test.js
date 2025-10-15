/**
 * @jest-environment node
 */

import { describe, test, expect } from '@jest/globals';
import { ReverseGeocoder } from '../../src/guia.js';

// Mock DOM functions for testing
global.document = undefined;

describe('ReverseGeocoder Class', () => {
  
  describe('toString Method', () => {
    test('should return formatted string with coordinates', () => {
      const geocoder = new ReverseGeocoder(-23.5505, -46.6333);
      const result = geocoder.toString();
      
      expect(result).toContain('ReverseGeocoder');
      expect(result).toContain('-23.5505');
      expect(result).toContain('-46.6333');
      expect(result).toBe('ReverseGeocoder: -23.5505, -46.6333');
    });

    test('should handle missing coordinates gracefully', () => {
      const geocoder = new ReverseGeocoder();
      const result = geocoder.toString();
      
      expect(result).toContain('ReverseGeocoder');
      expect(result).toContain('No coordinates set');
      expect(result).toBe('ReverseGeocoder: No coordinates set');
    });

    test('should handle incomplete coordinates (missing longitude)', () => {
      const geocoder = new ReverseGeocoder(-23.5505, null);
      const result = geocoder.toString();
      
      expect(result).toContain('ReverseGeocoder');
      expect(result).toContain('No coordinates set');
      expect(result).toBe('ReverseGeocoder: No coordinates set');
    });

    test('should handle incomplete coordinates (missing latitude)', () => {
      const geocoder = new ReverseGeocoder(null, -46.6333);
      const result = geocoder.toString();
      
      expect(result).toContain('ReverseGeocoder');
      expect(result).toContain('No coordinates set');
      expect(result).toBe('ReverseGeocoder: No coordinates set');
    });

    test('should reflect coordinates after setCoordinates is called', () => {
      const geocoder = new ReverseGeocoder();
      expect(geocoder.toString()).toBe('ReverseGeocoder: No coordinates set');
      
      geocoder.setCoordinates(-23.5505, -46.6333);
      const result = geocoder.toString();
      
      expect(result).toContain('-23.5505');
      expect(result).toContain('-46.6333');
      expect(result).toBe('ReverseGeocoder: -23.5505, -46.6333');
    });

    test('should show different coordinates after update', () => {
      const geocoder = new ReverseGeocoder(-23.5505, -46.6333);
      expect(geocoder.toString()).toBe('ReverseGeocoder: -23.5505, -46.6333');
      
      geocoder.setCoordinates(-22.9068, -43.1729); // Rio de Janeiro
      const result = geocoder.toString();
      
      expect(result).toBe('ReverseGeocoder: -22.9068, -43.1729');
    });
  });

});
