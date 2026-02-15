/**
 * @fileoverview Unit Tests for HomeViewController
 * Tests the home view controller with focus on initialization, lifecycle, and state management
 */

import { describe, test, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import HomeViewController from '../../src/views/home.js';

describe('HomeViewController', () => {
  let mockDocument;
  let controller;
  
  beforeEach(() => {
    // Create minimal document mock
    mockDocument = {
      getElementById: jest.fn(),
      dispatchEvent: jest.fn()
    };
  });
  
  afterEach(() => {
    if (controller && controller.initialized) {
      controller.destroy();
    }
    controller = null;
  });
  
  describe('Constructor', () => {
    it('should throw TypeError if document not provided', () => {
      expect(() => {
        new HomeViewController(null, { locationResult: 'test' });
      }).toThrow(TypeError);
      expect(() => {
        new HomeViewController(null, { locationResult: 'test' });
      }).toThrow('HomeViewController requires a document object');
    });
    
    it('should throw TypeError if params.locationResult not provided', () => {
      expect(() => {
        new HomeViewController(mockDocument, {});
      }).toThrow(TypeError);
      expect(() => {
        new HomeViewController(mockDocument, {});
      }).toThrow('HomeViewController requires params.locationResult');
    });
    
    it('should create instance with valid parameters', () => {
      controller = new HomeViewController(mockDocument, {
        locationResult: 'locationResult'
      });
      
      expect(controller).toBeInstanceOf(HomeViewController);
      expect(controller.initialized).toBe(false);
      expect(controller.tracking).toBe(false);
      expect(controller.document).toBe(mockDocument);
    });
    
    it('should store configuration parameters', () => {
      const params = {
        locationResult: 'locationResult',
        elementIds: { positionDisplay: 'lat-long-display' }
      };
      
      controller = new HomeViewController(mockDocument, params);
      
      expect(controller.params).toBe(params);
      expect(controller.params.elementIds.positionDisplay).toBe('lat-long-display');
    });
    
    it('should default autoStartTracking to true', () => {
      controller = new HomeViewController(mockDocument, {
        locationResult: 'locationResult'
      });
      
      expect(controller.autoStartTracking).toBe(true);
    });
    
    it('should respect autoStartTracking parameter', () => {
      controller = new HomeViewController(mockDocument, {
        locationResult: 'locationResult',
        autoStartTracking: false
      });
      
      expect(controller.autoStartTracking).toBe(false);
    });
    
    it('should accept dependency injection for manager', () => {
      const mockManager = { test: 'manager' };
      
      controller = new HomeViewController(mockDocument, {
        locationResult: 'locationResult',
        manager: mockManager
      });
      
      expect(controller.manager).toBe(mockManager);
    });
    
    it('should accept dependency injection for chronometer', () => {
      const mockChronometer = { test: 'chronometer' };
      
      controller = new HomeViewController(mockDocument, {
        locationResult: 'locationResult',
        chronometer: mockChronometer
      });
      
      expect(controller.chronometer).toBe(mockChronometer);
    });
  });
  
  describe('Initialization', () => {
    beforeEach(() => {
      controller = new HomeViewController(mockDocument, {
        locationResult: 'locationResult',
        autoStartTracking: false // Disable for these tests
      });
    });
    
    it('should initialize successfully', async () => {
      await controller.init();
      
      expect(controller.initialized).toBe(true);
    });
    
    it('should dispatch homeview:initialized event', async () => {
      await controller.init();
      
      expect(mockDocument.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'homeview:initialized'
        })
      );
    });
    
    it('should not re-initialize if already initialized', async () => {
      await controller.init();
      const firstInitState = controller.initialized;
      
      await controller.init(); // Second call
      
      expect(firstInitState).toBe(true);
      expect(controller.initialized).toBe(true);
    });
    
    it('should create WebGeocodingManager if not provided', async () => {
      await controller.init();
      
      expect(controller.manager).toBeDefined();
      expect(controller.manager).not.toBeNull();
    });
    
    it('should use provided manager via dependency injection', async () => {
      const mockManager = { test: 'manager' };
      const diController = new HomeViewController(mockDocument, {
        locationResult: 'locationResult',
        manager: mockManager,
        autoStartTracking: false
      });
      
      await diController.init();
      
      expect(diController.manager).toBe(mockManager);
    });
    
    it('should initialize chronometer if element exists', async () => {
      const mockChronometerElement = { id: 'chronometer' };
      mockDocument.getElementById.mockReturnValue(mockChronometerElement);
      
      await controller.init();
      
      expect(mockDocument.getElementById).toHaveBeenCalledWith('chronometer');
      // Chronometer should be created
      expect(controller.chronometer).toBeDefined();
    });
    
    it('should handle missing chronometer element gracefully', async () => {
      mockDocument.getElementById.mockReturnValue(null);
      
      await expect(controller.init()).resolves.not.toThrow();
      expect(controller.initialized).toBe(true);
    });
    
    it('should use provided chronometer via dependency injection', async () => {
      const mockChronometer = { test: 'chronometer' };
      const diController = new HomeViewController(mockDocument, {
        locationResult: 'locationResult',
        chronometer: mockChronometer,
        autoStartTracking: false
      });
      
      await diController.init();
      
      expect(diController.chronometer).toBe(mockChronometer);
    });
    
    it('should auto-start tracking if enabled', async () => {
      const mockManager = {
        startTracking: jest.fn()
      };
      const autoStartController = new HomeViewController(mockDocument, {
        locationResult: 'locationResult',
        manager: mockManager,
        autoStartTracking: true
      });
      
      await autoStartController.init();
      
      expect(mockManager.startTracking).toHaveBeenCalled();
      expect(autoStartController.tracking).toBe(true);
    });
    
    it('should not auto-start tracking if disabled', async () => {
      const mockManager = {
        startTracking: jest.fn()
      };
      const noAutoStartController = new HomeViewController(mockDocument, {
        locationResult: 'locationResult',
        manager: mockManager,
        autoStartTracking: false
      });
      
      await noAutoStartController.init();
      
      expect(mockManager.startTracking).not.toHaveBeenCalled();
      expect(noAutoStartController.tracking).toBe(false);
    });
  });
  
  describe('State Management', () => {
    beforeEach(async () => {
      controller = new HomeViewController(mockDocument, {
        locationResult: 'locationResult',
        autoStartTracking: false // Disable auto-start
      });
      await controller.init();
    });
    
    it('should track initialization state', () => {
      expect(controller.initialized).toBe(true);
    });
    
    it('should track tracking state', () => {
      expect(controller.tracking).toBe(false);
    });
    
    it('isTracking() should return current tracking state', () => {
      expect(controller.isTracking()).toBe(false);
    });
  });
  
  describe('Lifecycle Methods', () => {
    beforeEach(async () => {
      controller = new HomeViewController(mockDocument, {
        locationResult: 'locationResult',
        autoStartTracking: false // Disable auto-start
      });
      await controller.init();
    });
    
    it('should destroy cleanly', () => {
      controller.destroy();
      
      expect(controller.initialized).toBe(false);
      expect(controller.manager).toBeNull();
      expect(controller.chronometer).toBeNull();
    });
    
    it('toString() should return string representation', () => {
      const str = controller.toString();
      
      expect(str).toContain('HomeViewController');
      expect(str).toContain('initialized: true');
      expect(str).toContain('tracking: false');
    });
  });
  
  describe('Tracking Methods (Stubs)', () => {
    beforeEach(async () => {
      const mockManager = {
        startTracking: jest.fn(),
        stopTracking: jest.fn()
      };
      
      controller = new HomeViewController(mockDocument, {
        locationResult: 'locationResult',
        manager: mockManager,
        autoStartTracking: false // Disable auto-start
      });
      await controller.init();
    });
    
    it('getSingleLocationUpdate() should require initialization', async () => {
      const uninitializedController = new HomeViewController(mockDocument, {
        locationResult: 'locationResult'
      });
      
      await expect(uninitializedController.getSingleLocationUpdate())
        .rejects.toThrow('HomeViewController not initialized');
    });
    
    it('startTracking() should require initialization', () => {
      const uninitializedController = new HomeViewController(mockDocument, {
        locationResult: 'locationResult'
      });
      
      expect(() => uninitializedController.startTracking())
        .toThrow('HomeViewController not initialized');
    });
    
    it('stopTracking() should handle uninitialized state gracefully', () => {
      const uninitializedController = new HomeViewController(mockDocument, {
        locationResult: 'locationResult'
      });
      
      expect(() => uninitializedController.stopTracking()).not.toThrow();
    });
    
    it('toggleTracking() should require initialization', () => {
      const uninitializedController = new HomeViewController(mockDocument, {
        locationResult: 'locationResult'
      });
      
      expect(() => uninitializedController.toggleTracking())
        .toThrow('HomeViewController not initialized');
    });
  });
  
  describe('Static Factory Method', () => {
    it('should create and initialize in one step', async () => {
      const mockManager = { startTracking: jest.fn() };
      
      controller = await HomeViewController.create(mockDocument, {
        locationResult: 'locationResult',
        manager: mockManager,
        autoStartTracking: false
      });
      
      expect(controller).toBeInstanceOf(HomeViewController);
      expect(controller.initialized).toBe(true);
    });
  });
});
