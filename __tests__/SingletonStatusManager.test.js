/**
 * @jest-environment node
 */

// Mock DOM functions for testing
global.document = undefined;

// Import the guia.js functions
const { SingletonStatusManager } = require('../src/guia.js');

describe('SingletonStatusManager Class', () => {
  
  beforeEach(() => {
    // Reset singleton instance before each test
    SingletonStatusManager.instance = null;
  });

  describe('Singleton Pattern', () => {
    test('should create single instance', () => {
      const instance1 = new SingletonStatusManager();
      const instance2 = new SingletonStatusManager();
      
      expect(instance1).toBe(instance2);
    });

    test('should return same instance via getInstance', () => {
      const instance1 = SingletonStatusManager.getInstance();
      const instance2 = SingletonStatusManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    test('should return same instance when mixing constructor and getInstance', () => {
      const instance1 = new SingletonStatusManager();
      const instance2 = SingletonStatusManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Location Status Management', () => {
    let manager;

    beforeEach(() => {
      manager = new SingletonStatusManager();
    });

    test('should initialize with gettingLocation as false', () => {
      expect(manager.isGettingLocation()).toBe(false);
    });

    test('should set gettingLocation status to true', () => {
      manager.setGettingLocation(true);
      expect(manager.isGettingLocation()).toBe(true);
    });

    test('should set gettingLocation status to false', () => {
      manager.setGettingLocation(true);
      expect(manager.isGettingLocation()).toBe(true);
      
      manager.setGettingLocation(false);
      expect(manager.isGettingLocation()).toBe(false);
    });

    test('should handle boolean values correctly', () => {
      manager.setGettingLocation(true);
      expect(manager.gettingLocation).toBe(true);
      
      manager.setGettingLocation(false);
      expect(manager.gettingLocation).toBe(false);
    });

    test('should handle truthy/falsy values', () => {
      manager.setGettingLocation(1);
      expect(manager.gettingLocation).toBe(1);
      expect(manager.isGettingLocation()).toBe(1);
      
      manager.setGettingLocation(0);
      expect(manager.gettingLocation).toBe(0);
      expect(manager.isGettingLocation()).toBe(0);
      
      manager.setGettingLocation('');
      expect(manager.gettingLocation).toBe('');
      expect(manager.isGettingLocation()).toBe('');
    });
  });

  describe('State Persistence', () => {
    test('should maintain state across different instance references', () => {
      const manager1 = new SingletonStatusManager();
      manager1.setGettingLocation(true);
      
      const manager2 = new SingletonStatusManager();
      expect(manager2.isGettingLocation()).toBe(true);
      
      const manager3 = SingletonStatusManager.getInstance();
      expect(manager3.isGettingLocation()).toBe(true);
    });

    test('should update state from any instance reference', () => {
      const manager1 = new SingletonStatusManager();
      const manager2 = SingletonStatusManager.getInstance();
      
      manager1.setGettingLocation(true);
      expect(manager2.isGettingLocation()).toBe(true);
      
      manager2.setGettingLocation(false);
      expect(manager1.isGettingLocation()).toBe(false);
    });
  });

});