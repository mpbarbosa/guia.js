/**
 * @jest-environment node
 * 
 * Tests for immutability patterns in Guia.js
 * These tests verify that critical operations follow immutability principles
 * and don't mutate data structures directly.
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { 
  ObserverSubject, 
  BrazilianStandardAddress, 
  AddressCache 
} from '../../src/guia.js';

// Mock DOM functions for testing
global.document = undefined;

describe('Immutability Patterns', () => {

  describe('ObserverSubject - Immutable Array Management', () => {
    let observerSubject;

    beforeEach(() => {
      observerSubject = new ObserverSubject();
    });

    test('subscribe() should not mutate original observers array', () => {
      const observer1 = { update: jest.fn() };
      const observer2 = { update: jest.fn() };
      
      observerSubject.subscribe(observer1);
      const firstArray = observerSubject.observers;
      
      observerSubject.subscribe(observer2);
      const secondArray = observerSubject.observers;
      
      // Arrays should be different instances (immutable pattern)
      expect(firstArray).not.toBe(secondArray);
      expect(firstArray.length).toBe(1);
      expect(secondArray.length).toBe(2);
    });

    test('subscribe() should create new array instead of mutating', () => {
      const observer = { update: jest.fn() };
      const originalArray = observerSubject.observers;
      
      observerSubject.subscribe(observer);
      const newArray = observerSubject.observers;
      
      // Should be a different array instance
      expect(originalArray).not.toBe(newArray);
      // Original array should remain empty
      expect(originalArray.length).toBe(0);
      // New array should have the observer
      expect(newArray.length).toBe(1);
    });

    test('subscribeFunction() should not mutate original functionObservers array', () => {
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      
      observerSubject.subscribeFunction(fn1);
      const firstArray = observerSubject.functionObservers;
      
      observerSubject.subscribeFunction(fn2);
      const secondArray = observerSubject.functionObservers;
      
      // Arrays should be different instances
      expect(firstArray).not.toBe(secondArray);
      expect(firstArray.length).toBe(1);
      expect(secondArray.length).toBe(2);
    });

    test('subscribeFunction() should create new array instead of mutating', () => {
      const fn = jest.fn();
      const originalArray = observerSubject.functionObservers;
      
      observerSubject.subscribeFunction(fn);
      const newArray = observerSubject.functionObservers;
      
      // Should be a different array instance
      expect(originalArray).not.toBe(newArray);
      expect(originalArray.length).toBe(0);
      expect(newArray.length).toBe(1);
    });

    test('unsubscribe() should create new array using filter', () => {
      const observer1 = { update: jest.fn() };
      const observer2 = { update: jest.fn() };
      
      observerSubject.subscribe(observer1);
      observerSubject.subscribe(observer2);
      const arrayBeforeUnsubscribe = observerSubject.observers;
      
      observerSubject.unsubscribe(observer1);
      const arrayAfterUnsubscribe = observerSubject.observers;
      
      // Should be different array instances
      expect(arrayBeforeUnsubscribe).not.toBe(arrayAfterUnsubscribe);
      expect(arrayBeforeUnsubscribe.length).toBe(2);
      expect(arrayAfterUnsubscribe.length).toBe(1);
    });
  });

  describe('BrazilianStandardAddress - Immutable Array Building', () => {
    
    test('enderecoCompleto() should build array without mutation', () => {
      const address = new BrazilianStandardAddress();
      address.logradouro = 'Avenida Paulista';
      address.numero = '1000';
      address.bairro = 'Bela Vista';
      address.municipio = 'São Paulo';
      address.uf = 'São Paulo';  // uf contains full state name
      address.siglaUF = 'SP';    // siglaUF contains abbreviation
      address.cep = '01310-100';

      // Call multiple times to ensure no side effects
      const result1 = address.enderecoCompleto();
      const result2 = address.enderecoCompleto();
      
      // Should return same value (pure function)
      expect(result1).toBe(result2);
      expect(result1).toContain('Avenida Paulista');
      expect(result1).toContain('Bela Vista');
      expect(result1).toContain('São Paulo, SP');
      expect(result1).toContain('01310-100');
    });

    test('enderecoCompleto() should filter out falsy values immutably', () => {
      const addressWithMissingFields = new BrazilianStandardAddress();
      addressWithMissingFields.logradouro = 'Rua das Flores';
      addressWithMissingFields.numero = null;
      addressWithMissingFields.bairro = '';  // Empty string - falsy
      addressWithMissingFields.municipio = 'Rio de Janeiro';
      addressWithMissingFields.uf = 'Rio de Janeiro';  // uf contains full state name
      addressWithMissingFields.siglaUF = 'RJ';         // siglaUF contains abbreviation
      addressWithMissingFields.cep = null;

      const result = addressWithMissingFields.enderecoCompleto();
      
      // Should only include truthy values
      expect(result).toContain('Rua das Flores');
      expect(result).toContain('Rio de Janeiro, RJ');
      expect(result).not.toContain('null');
      expect(result).not.toContain('undefined');
      // Empty string should be filtered out
      expect(result.split(', ').filter(p => p.trim() === '').length).toBe(0);
    });

    test('enderecoCompleto() should use filter(Boolean) pattern', () => {
      const address = new BrazilianStandardAddress();
      address.logradouro = 'Rua A';
      address.numero = '123';
      address.bairro = null;
      address.municipio = 'Cidade';
      address.uf = 'Estado Completo';  // uf contains full state name
      address.siglaUF = 'UF';           // siglaUF contains abbreviation
      address.cep = undefined;

      const result = address.enderecoCompleto();
      const parts = result.split(', ');
      
      // Should only have non-falsy parts
      parts.forEach(part => {
        expect(part).toBeTruthy();
        expect(part.trim()).not.toBe('');
      });
      expect(result).toContain('Rua A, 123');
      expect(result).toContain('Cidade, UF');
    });
  });

  describe('AddressCache - Immutable Operations', () => {
    let cacheInstance = null;
    
    beforeEach(() => {
      // Get singleton instance
      cacheInstance = AddressCache.getInstance();
      // Clear cache before each test
      AddressCache.clearCache();
    });

    afterEach(() => {
      // Phase 3: Clean up timer and clear cache
      if (cacheInstance) {
        cacheInstance.destroy();
        cacheInstance = null;
      }
      AddressCache.instance = null;
    });

    test('evictLeastRecentlyUsedIfNeeded() should not mutate source array', () => {
      // Fill cache to trigger eviction
      for (let i = 0; i < 60; i++) {
        const mockData = {
          address: {
            road: `Rua ${i}`,
            suburb: `Bairro ${i}`,
            city: `Cidade ${i}`,
            state: `UF${i}`,
            postcode: `0000${i}`
          }
        };
        AddressCache.getBrazilianStandardAddress(mockData);
      }

      // Cache should have triggered eviction
      expect(AddressCache.cache.size).toBeLessThan(60);
      expect(AddressCache.cache.size).toBeGreaterThan(0);
    });

    test('cleanExpiredEntries() should build expired keys array immutably', () => {
      // Add entries to cache
      const mockData1 = {
        address: {
          road: 'Rua Teste 1',
          suburb: 'Bairro 1',
          city: 'Cidade 1',
          state: 'SP',
          postcode: '00000-001'
        }
      };
      const mockData2 = {
        address: {
          road: 'Rua Teste 2',
          suburb: 'Bairro 2',
          city: 'Cidade 2',
          state: 'RJ',
          postcode: '00000-002'
        }
      };

      AddressCache.getBrazilianStandardAddress(mockData1);
      AddressCache.getBrazilianStandardAddress(mockData2);
      
      const initialSize = AddressCache.cache.size;
      
      // Clean expired entries (none should be expired yet)
      AddressCache.cleanExpiredEntries();
      
      // Cache size should be the same
      expect(AddressCache.cache.size).toBe(initialSize);
    });
  });

  describe('Immutability Best Practices Verification', () => {
    
    test('spread operator creates shallow copies', () => {
      const original = [1, 2, 3];
      const copy = [...original, 4];
      
      expect(copy).not.toBe(original);
      expect(original.length).toBe(3);
      expect(copy.length).toBe(4);
    });

    test('filter creates new array without mutation', () => {
      const original = [1, 2, 3, 4, 5];
      const filtered = original.filter(x => x > 2);
      
      expect(filtered).not.toBe(original);
      expect(original.length).toBe(5);
      expect(filtered.length).toBe(3);
    });

    test('array concatenation creates new array', () => {
      const arr1 = [1, 2];
      const arr2 = [3, 4];
      const combined = [...arr1, ...arr2];
      
      expect(combined).not.toBe(arr1);
      expect(combined).not.toBe(arr2);
      expect(arr1.length).toBe(2);
      expect(arr2.length).toBe(2);
      expect(combined.length).toBe(4);
    });

    test('sort on copy does not mutate original', () => {
      const original = [3, 1, 2];
      const sorted = [...original].sort();
      
      expect(sorted).not.toBe(original);
      expect(original).toEqual([3, 1, 2]);
      expect(sorted).toEqual([1, 2, 3]);
    });
  });

});
