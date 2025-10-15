/**
 * @jest-environment node
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { ObserverSubject } from '../../src/guia.js';

// Mock DOM functions for testing
global.document = undefined;

describe('ObserverSubject Class', () => {
  let observerSubject;

  beforeEach(() => {
    observerSubject = new ObserverSubject();
  });

  describe('Initialization', () => {
    test('should initialize with empty observer arrays', () => {
      expect(observerSubject.observers).toEqual([]);
      expect(observerSubject.functionObservers).toEqual([]);
      expect(observerSubject.getObserverCount()).toBe(0);
      expect(observerSubject.getFunctionObserverCount()).toBe(0);
    });
  });

  describe('Object Observer Management', () => {
    test('should subscribe object observers', () => {
      const observer = { update: jest.fn() };
      observerSubject.subscribe(observer);
      
      expect(observerSubject.observers).toContain(observer);
      expect(observerSubject.getObserverCount()).toBe(1);
    });

    test('should handle null observer subscription gracefully', () => {
      observerSubject.subscribe(null);
      expect(observerSubject.getObserverCount()).toBe(0);
    });

    test('should handle undefined observer subscription gracefully', () => {
      observerSubject.subscribe(undefined);
      expect(observerSubject.getObserverCount()).toBe(0);
    });

    test('should subscribe multiple observers', () => {
      const observer1 = { update: jest.fn() };
      const observer2 = { update: jest.fn() };
      const observer3 = { update: jest.fn() };

      observerSubject.subscribe(observer1);
      observerSubject.subscribe(observer2);
      observerSubject.subscribe(observer3);

      expect(observerSubject.getObserverCount()).toBe(3);
      expect(observerSubject.observers).toContain(observer1);
      expect(observerSubject.observers).toContain(observer2);
      expect(observerSubject.observers).toContain(observer3);
    });

    test('should unsubscribe observers', () => {
      const observer1 = { update: jest.fn() };
      const observer2 = { update: jest.fn() };
      
      observerSubject.subscribe(observer1);
      observerSubject.subscribe(observer2);
      expect(observerSubject.getObserverCount()).toBe(2);
      
      observerSubject.unsubscribe(observer1);
      expect(observerSubject.getObserverCount()).toBe(1);
      expect(observerSubject.observers).toContain(observer2);
      expect(observerSubject.observers).not.toContain(observer1);
    });

    test('should handle unsubscribing non-existent observer', () => {
      const observer1 = { update: jest.fn() };
      const observer2 = { update: jest.fn() };
      
      observerSubject.subscribe(observer1);
      observerSubject.unsubscribe(observer2);
      
      expect(observerSubject.getObserverCount()).toBe(1);
      expect(observerSubject.observers).toContain(observer1);
    });
  });

  describe('Function Observer Management', () => {
    test('should subscribe function observers', () => {
      const observerFunc = jest.fn();
      observerSubject.subscribeFunction(observerFunc);
      
      expect(observerSubject.functionObservers).toContain(observerFunc);
      expect(observerSubject.getFunctionObserverCount()).toBe(1);
    });

    test('should handle null function observer subscription gracefully', () => {
      observerSubject.subscribeFunction(null);
      expect(observerSubject.getFunctionObserverCount()).toBe(0);
    });

    test('should handle undefined function observer subscription gracefully', () => {
      observerSubject.subscribeFunction(undefined);
      expect(observerSubject.getFunctionObserverCount()).toBe(0);
    });

    test('should subscribe multiple function observers', () => {
      const func1 = jest.fn();
      const func2 = jest.fn();
      const func3 = jest.fn();

      observerSubject.subscribeFunction(func1);
      observerSubject.subscribeFunction(func2);
      observerSubject.subscribeFunction(func3);

      expect(observerSubject.getFunctionObserverCount()).toBe(3);
    });

    test('should unsubscribe function observers', () => {
      const func1 = jest.fn();
      const func2 = jest.fn();
      
      observerSubject.subscribeFunction(func1);
      observerSubject.subscribeFunction(func2);
      expect(observerSubject.getFunctionObserverCount()).toBe(2);
      
      observerSubject.unsubscribeFunction(func1);
      expect(observerSubject.getFunctionObserverCount()).toBe(1);
      expect(observerSubject.functionObservers).toContain(func2);
      expect(observerSubject.functionObservers).not.toContain(func1);
    });
  });

  describe('Object Observer Notification', () => {
    test('should notify all subscribed object observers', () => {
      const observer1 = { update: jest.fn() };
      const observer2 = { update: jest.fn() };
      
      observerSubject.subscribe(observer1);
      observerSubject.subscribe(observer2);
      
      observerSubject.notifyObservers('arg1', 'arg2', 'arg3');
      
      expect(observer1.update).toHaveBeenCalledTimes(1);
      expect(observer1.update).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
      expect(observer2.update).toHaveBeenCalledTimes(1);
      expect(observer2.update).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    test('should handle notification with no arguments', () => {
      const observer = { update: jest.fn() };
      observerSubject.subscribe(observer);
      
      observerSubject.notifyObservers();
      
      expect(observer.update).toHaveBeenCalledTimes(1);
      expect(observer.update).toHaveBeenCalledWith();
    });

    test('should handle notification when no observers subscribed', () => {
      expect(() => {
        observerSubject.notifyObservers('data');
      }).not.toThrow();
    });

    test('should skip observers without update method', () => {
      const validObserver = { update: jest.fn() };
      const invalidObserver = { noUpdate: jest.fn() };
      
      observerSubject.subscribe(validObserver);
      observerSubject.subscribe(invalidObserver);
      
      observerSubject.notifyObservers('data');
      
      expect(validObserver.update).toHaveBeenCalledWith('data');
      expect(invalidObserver.noUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Function Observer Notification', () => {
    test('should notify all subscribed function observers', () => {
      const func1 = jest.fn();
      const func2 = jest.fn();
      
      observerSubject.subscribeFunction(func1);
      observerSubject.subscribeFunction(func2);
      
      observerSubject.notifyFunctionObservers('arg1', 'arg2');
      
      expect(func1).toHaveBeenCalledTimes(1);
      expect(func1).toHaveBeenCalledWith('arg1', 'arg2');
      expect(func2).toHaveBeenCalledTimes(1);
      expect(func2).toHaveBeenCalledWith('arg1', 'arg2');
    });

    test('should handle notification with no function observers', () => {
      expect(() => {
        observerSubject.notifyFunctionObservers('data');
      }).not.toThrow();
    });
  });

  describe('Mixed Observer Types', () => {
    test('should handle both object and function observers independently', () => {
      const observer = { update: jest.fn() };
      const observerFunc = jest.fn();
      
      observerSubject.subscribe(observer);
      observerSubject.subscribeFunction(observerFunc);
      
      expect(observerSubject.getObserverCount()).toBe(1);
      expect(observerSubject.getFunctionObserverCount()).toBe(1);
      
      observerSubject.notifyObservers('object-data');
      expect(observer.update).toHaveBeenCalledWith('object-data');
      expect(observerFunc).not.toHaveBeenCalled();
      
      observerSubject.notifyFunctionObservers('function-data');
      expect(observerFunc).toHaveBeenCalledWith('function-data');
      expect(observer.update).toHaveBeenCalledTimes(1); // Still only called once
    });
  });

  describe('Clear Observers', () => {
    test('should clear all observers', () => {
      const observer1 = { update: jest.fn() };
      const observer2 = { update: jest.fn() };
      const func1 = jest.fn();
      const func2 = jest.fn();
      
      observerSubject.subscribe(observer1);
      observerSubject.subscribe(observer2);
      observerSubject.subscribeFunction(func1);
      observerSubject.subscribeFunction(func2);
      
      expect(observerSubject.getObserverCount()).toBe(2);
      expect(observerSubject.getFunctionObserverCount()).toBe(2);
      
      observerSubject.clearAllObservers();
      
      expect(observerSubject.getObserverCount()).toBe(0);
      expect(observerSubject.getFunctionObserverCount()).toBe(0);
      expect(observerSubject.observers).toEqual([]);
      expect(observerSubject.functionObservers).toEqual([]);
    });
  });
});
