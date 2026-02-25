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
      const locationBtn = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      };
      
      mockDocument.getElementById.mockImplementation((id) => {
        if (id === 'chronometer') return mockChronometerElement;
        if (id === 'enable-location-btn') return locationBtn;
        if (id === 'locationResult') return { innerHTML: '' };
        return null;
      });
      
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
      const mockServiceCoordinator = {
        getSingleLocationUpdate: jest.fn().mockResolvedValue({
          coords: { latitude: -8.05, longitude: -35.0 }
        }),
        startTracking: jest.fn()
      };
      const mockChangeDetectionCoordinator = {
        setCurrentPosition: jest.fn(),
        setupChangeDetection: jest.fn()
      };
      const mockSpeechCoordinator = {
        initializeSpeechSynthesis: jest.fn()
      };
      const mockManager = {
        serviceCoordinator: mockServiceCoordinator,
        changeDetectionCoordinator: mockChangeDetectionCoordinator,
        speechCoordinator: mockSpeechCoordinator,
        notifyFunctionObservers: jest.fn()
      };
      
      const autoStartController = new HomeViewController(mockDocument, {
        locationResult: 'locationResult',
        manager: mockManager,
        autoStartTracking: true
      });
      
      await autoStartController.init();
      
      expect(mockServiceCoordinator.startTracking).toHaveBeenCalled();
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
  
  describe('Tracking Methods (Full Implementation)', () => {
    let mockServiceCoordinator;
    let mockChangeDetectionCoordinator;
    let mockSpeechCoordinator;
    let mockManager;
    
    beforeEach(async () => {
      mockServiceCoordinator = {
        getSingleLocationUpdate: jest.fn().mockResolvedValue({
          coords: { 
            latitude: -8.05428, 
            longitude: -35.0000,
            accuracy: 10
          }
        }),
        startTracking: jest.fn(),
        stopTracking: jest.fn()
      };
      
      mockChangeDetectionCoordinator = {
        setCurrentPosition: jest.fn(),
        setupChangeDetection: jest.fn()
      };
      
      mockSpeechCoordinator = {
        initializeSpeechSynthesis: jest.fn()
      };
      
      mockManager = {
        serviceCoordinator: mockServiceCoordinator,
        changeDetectionCoordinator: mockChangeDetectionCoordinator,
        speechCoordinator: mockSpeechCoordinator,
        notifyFunctionObservers: jest.fn(),
        _displayError: jest.fn()
      };
      
      controller = new HomeViewController(mockDocument, {
        locationResult: 'locationResult',
        manager: mockManager,
        autoStartTracking: false
      });
      
      await controller.init();
    });
    
    describe('getSingleLocationUpdate()', () => {
      it('should get single location update successfully', async () => {
        const position = await controller.getSingleLocationUpdate();
        
        expect(position).toBeDefined();
        expect(position.coords).toBeDefined();
        expect(mockServiceCoordinator.getSingleLocationUpdate).toHaveBeenCalled();
      });
      
      it('should wrap position in GeoPosition instance', async () => {
        await controller.getSingleLocationUpdate();
        
        expect(mockManager.currentPosition).toBeDefined();
        expect(mockManager.currentCoords).toBeDefined();
      });
      
      it('should update change detection coordinator', async () => {
        await controller.getSingleLocationUpdate();
        
        expect(mockChangeDetectionCoordinator.setCurrentPosition).toHaveBeenCalled();
      });
      
      it('should notify function observers', async () => {
        await controller.getSingleLocationUpdate();
        
        expect(mockManager.notifyFunctionObservers).toHaveBeenCalled();
      });
      
      it('should handle ServiceCoordinator errors', async () => {
        const mockError = new Error('Geolocation failed');
        mockServiceCoordinator.getSingleLocationUpdate.mockRejectedValue(mockError);
        
        await expect(controller.getSingleLocationUpdate()).rejects.toThrow('Geolocation failed');
        expect(mockManager._displayError).toHaveBeenCalledWith(mockError);
      });
      
      it('should throw if ServiceCoordinator not available', async () => {
        controller.manager.serviceCoordinator = null;
        
        await expect(controller.getSingleLocationUpdate()).rejects.toThrow('ServiceCoordinator not available');
      });
    });
    
    describe('startTracking()', () => {
      it('should start tracking successfully', () => {
        controller.startTracking();
        
        expect(controller.tracking).toBe(true);
        expect(mockServiceCoordinator.startTracking).toHaveBeenCalled();
      });
      
      it('should initialize speech synthesis', () => {
        controller.startTracking();
        
        expect(mockSpeechCoordinator.initializeSpeechSynthesis).toHaveBeenCalled();
      });
      
      it('should get initial location update', () => {
        controller.startTracking();
        
        expect(mockServiceCoordinator.getSingleLocationUpdate).toHaveBeenCalled();
      });
      
      it('should set up change detection', () => {
        controller.startTracking();
        
        expect(mockChangeDetectionCoordinator.setupChangeDetection).toHaveBeenCalled();
      });
      
      it('should dispatch tracking:started event', () => {
        controller.startTracking();
        
        expect(mockDocument.dispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'homeview:tracking:started'
          })
        );
      });
      
      it('should not start if already tracking', () => {
        controller.startTracking();
        mockServiceCoordinator.startTracking.mockClear();
        
        controller.startTracking(); // Second call
        
        expect(mockServiceCoordinator.startTracking).not.toHaveBeenCalled();
      });
    });
    
    describe('stopTracking()', () => {
      beforeEach(() => {
        controller.startTracking();
        mockDocument.dispatchEvent.mockClear();
      });
      
      it('should stop tracking successfully', () => {
        controller.stopTracking();
        
        expect(controller.tracking).toBe(false);
        expect(mockServiceCoordinator.stopTracking).toHaveBeenCalled();
      });
      
      it('should dispatch tracking:stopped event', () => {
        controller.stopTracking();
        
        expect(mockDocument.dispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'homeview:tracking:stopped'
          })
        );
      });
      
      it('should not stop if not tracking', () => {
        controller.stopTracking(); // First stop
        mockServiceCoordinator.stopTracking.mockClear();
        
        controller.stopTracking(); // Second stop
        
        expect(mockServiceCoordinator.stopTracking).not.toHaveBeenCalled();
      });
      
      it('should handle ServiceCoordinator errors gracefully', () => {
        mockServiceCoordinator.stopTracking.mockImplementation(() => {
          throw new Error('Stop failed');
        });
        
        expect(() => controller.stopTracking()).not.toThrow();
        expect(controller.tracking).toBe(false);
      });
    });
    
    describe('toggleTracking()', () => {
      it('should start tracking if not tracking', () => {
        controller.toggleTracking();
        
        expect(controller.tracking).toBe(true);
      });
      
      it('should stop tracking if tracking', () => {
        controller.startTracking();
        
        controller.toggleTracking();
        
        expect(controller.tracking).toBe(false);
      });
    });
  });
});

// ===== Event Listeners and UI Tests =====

describe('HomeViewController - Event Listeners', () => {
  let document, controller, mockManager;
  
  beforeEach(() => {
    // Create mock document with buttons
    const locationBtn = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      querySelector: jest.fn(),
      setAttribute: jest.fn(),
      id: 'enable-location-btn'
    };
    
    const testBtn = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      id: 'insertPositionButton'
    };
    
    document = {
      getElementById: jest.fn((id) => {
        if (id === 'enable-location-btn') return locationBtn;
        if (id === 'insertPositionButton') return testBtn;
        if (id === 'chronometer') return null;
        if (id === 'locationResult') return { innerHTML: '' };
        return null;
      }),
      dispatchEvent: jest.fn()
    };
    
    // Create mock manager
    mockManager = {
      serviceCoordinator: {
        getSingleLocationUpdate: jest.fn().mockResolvedValue({
          coords: { latitude: 10, longitude: 20 }
        }),
        startTracking: jest.fn(),
        stopTracking: jest.fn()
      },
      changeDetectionCoordinator: {
        setCurrentPosition: jest.fn(),
        setupChangeDetection: jest.fn()
      },
      speechCoordinator: {
        initializeSpeechSynthesis: jest.fn()
      },
      notifyFunctionObservers: jest.fn(),
      _displayError: jest.fn()
    };
    
    controller = new HomeViewController(document, {
      locationResult: 'locationResult',
      manager: mockManager,
      autoStartTracking: false
    });
  });
  
  describe('_setupEventListeners()', () => {
    test('should add click listener to enable-location-btn', async () => {
      await controller.init();
      
      const locationBtn = document.getElementById('enable-location-btn');
      expect(locationBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
    
    test('should add click listener to insertPositionButton', async () => {
      await controller.init();
      
      const testBtn = document.getElementById('insertPositionButton');
      expect(testBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
    
    test('should store bound handlers for cleanup', async () => {
      await controller.init();
      
      expect(controller._boundHandlers.locationClick).toBeInstanceOf(Function);
      expect(controller._boundHandlers.testPositionClick).toBeInstanceOf(Function);
    });
    
    test('should handle missing enable-location-btn gracefully', async () => {
      document.getElementById = jest.fn((id) => {
        if (id === 'insertPositionButton') return { addEventListener: jest.fn() };
        return null;
      });
      
      await controller.init(); // Should not throw
      
      expect(controller._boundHandlers.locationClick).toBeUndefined();
    });
    
    test('should handle missing insertPositionButton gracefully', async () => {
      document.getElementById = jest.fn((id) => {
        if (id === 'enable-location-btn') return { addEventListener: jest.fn() };
        return null;
      });
      
      await controller.init(); // Should not throw
      
      expect(controller._boundHandlers.testPositionClick).toBeUndefined();
    });
  });
  
  describe('_removeEventListeners()', () => {
    test('should remove location button listener on destroy', async () => {
      await controller.init();
      const locationBtn = document.getElementById('enable-location-btn');
      const boundHandler = controller._boundHandlers.locationClick;
      
      controller.destroy();
      
      expect(locationBtn.removeEventListener).toHaveBeenCalledWith('click', boundHandler);
    });
    
    test('should remove test button listener on destroy', async () => {
      await controller.init();
      const testBtn = document.getElementById('insertPositionButton');
      
      controller.destroy();
      
      expect(testBtn.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
    
    test('should clear bound handlers on destroy', async () => {
      await controller.init();
      
      controller.destroy();
      
      expect(controller._boundHandlers).toEqual({});
    });
    
    test('should handle missing button gracefully during cleanup', async () => {
      await controller.init();
      
      // Replace getElementById to return null
      document.getElementById = jest.fn(() => null);
      
      expect(() => controller.destroy()).not.toThrow();
    });
  });
  
  describe('_updateTrackingUI()', () => {
    let locationBtn, textSpan, iconSpan;
    
    beforeEach(async () => {
      textSpan = { textContent: 'Ativar Localização' };
      iconSpan = { textContent: '📍' };
      
      locationBtn = {
        querySelector: jest.fn((selector) => {
          if (selector === '.button-text') return textSpan;
          if (selector === '.button-icon') return iconSpan;
          return null;
        }),
        setAttribute: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      };
      
      document.getElementById = jest.fn((id) => {
        if (id === 'enable-location-btn') return locationBtn;
        if (id === 'locationResult') return { innerHTML: '' };
        return null;
      });
      
      controller = new HomeViewController(document, {
        locationResult: 'locationResult',
        manager: mockManager,
        autoStartTracking: false
      });
      
      await controller.init();
    });
    
    test('should update button text when tracking starts', () => {
      controller._updateTrackingUI(true);
      
      expect(textSpan.textContent).toBe('Parar Rastreamento');
    });
    
    test('should update button text when tracking stops', () => {
      controller._updateTrackingUI(false);
      
      expect(textSpan.textContent).toBe('Ativar Localização');
    });
    
    test('should update button icon when tracking starts', () => {
      controller._updateTrackingUI(true);
      
      expect(iconSpan.textContent).toBe('⏹️');
    });
    
    test('should update button icon when tracking stops', () => {
      controller._updateTrackingUI(false);
      
      expect(iconSpan.textContent).toBe('📍');
    });
    
    test('should update ARIA label when tracking starts', () => {
      controller._updateTrackingUI(true);
      
      expect(locationBtn.setAttribute).toHaveBeenCalledWith('aria-label', 'Parar rastreamento de localização');
    });
    
    test('should update ARIA label when tracking stops', () => {
      controller._updateTrackingUI(false);
      
      expect(locationBtn.setAttribute).toHaveBeenCalledWith('aria-label', 'Ativar localização');
    });
    
    test('should handle missing button-text span', () => {
      locationBtn.querySelector = jest.fn(() => null);
      locationBtn.textContent = 'Ativar Localização';
      
      controller._updateTrackingUI(true);
      
      expect(locationBtn.textContent).toBe('Parar Rastreamento');
    });
    
    test('should handle missing button-icon span', () => {
      locationBtn.querySelector = jest.fn((selector) => {
        if (selector === '.button-text') return textSpan;
        return null;
      });
      
      expect(() => controller._updateTrackingUI(true)).not.toThrow();
    });
    
    test('should handle missing button gracefully', () => {
      document.getElementById = jest.fn(() => null);
      
      expect(() => controller._updateTrackingUI(true)).not.toThrow();
    });
  });
  
  describe('Button Click Integration', () => {
    test('should call toggleTracking when location button is clicked', async () => {
      await controller.init();
      
      const locationBtn = document.getElementById('enable-location-btn');
      const clickHandler = locationBtn.addEventListener.mock.calls[0][1];
      
      controller.toggleTracking = jest.fn().mockResolvedValue();
      
      await clickHandler();
      
      expect(controller.toggleTracking).toHaveBeenCalled();
    });
    
    test('should call getSingleLocationUpdate when test button is clicked', async () => {
      await controller.init();
      
      const testBtn = document.getElementById('insertPositionButton');
      const clickHandler = testBtn.addEventListener.mock.calls[0][1];
      
      controller.getSingleLocationUpdate = jest.fn().mockResolvedValue();
      
      await clickHandler();
      
      expect(controller.getSingleLocationUpdate).toHaveBeenCalled();
    });
    
    test('should handle errors in location button click', async () => {
      await controller.init();
      
      const locationBtn = document.getElementById('enable-location-btn');
      const clickHandler = locationBtn.addEventListener.mock.calls[0][1];
      
      controller.toggleTracking = jest.fn().mockRejectedValue(new Error('Test error'));
      
      await clickHandler(); // Should not throw
    });
    
    test('should handle errors in test button click', async () => {
      await controller.init();
      
      const testBtn = document.getElementById('insertPositionButton');
      const clickHandler = testBtn.addEventListener.mock.calls[0][1];
      
      controller.getSingleLocationUpdate = jest.fn().mockRejectedValue(new Error('Test error'));
      
      await clickHandler(); // Should not throw
    });
  });
  
  describe('UI Updates During Tracking', () => {
    test('should update UI when startTracking is called', async () => {
      await controller.init();
      
      controller.startTracking();
      
      const locationBtn = document.getElementById('enable-location-btn');
      expect(locationBtn.setAttribute).toHaveBeenCalledWith('aria-label', 'Parar rastreamento de localização');
    });
    
    test('should update UI when stopTracking is called', async () => {
      await controller.init();
      
      controller.startTracking();
      controller.stopTracking();
      
      const locationBtn = document.getElementById('enable-location-btn');
      const calls = locationBtn.setAttribute.mock.calls;
      const lastCall = calls[calls.length - 1];
      
      expect(lastCall).toEqual(['aria-label', 'Ativar localização']);
    });
  });
});
