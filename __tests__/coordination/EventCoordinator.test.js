/**
 * @fileoverview Unit tests for EventCoordinator class
 * @description Comprehensive test suite for event handling and user interactions
 * Tests cover event listener setup, cleanup, button handlers, and external delegation
 * 
 * @jest-environment node
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock console to suppress logging during tests
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
};

// Mock global utility functions
global.log = jest.fn();
global.warn = jest.fn();

// Mock global alert
global.alert = jest.fn();

// Import class under test
let EventCoordinator, UICoordinator, GeocodingState, GeoPosition;
try {
    const eventModule = await import('../../src/coordination/EventCoordinator.js');
    const uiModule = await import('../../src/coordination/UICoordinator.js');
    const stateModule = await import('../../src/core/GeocodingState.js');
    const positionModule = await import('../../src/core/GeoPosition.js');
    
    EventCoordinator = eventModule.default;
    UICoordinator = uiModule.default;
    GeocodingState = stateModule.default;
    GeoPosition = positionModule.default;
} catch (error) {
    console.warn('Could not load modules:', error.message);
}

/**
 * Helper to create mock position for GeoPosition
 */
function createMockPosition(lat, lon) {
    return {
        coords: {
            latitude: lat,
            longitude: lon,
            accuracy: 15,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
        },
        timestamp: Date.now()
    };
}

/**
 * Helper to create mock HTML element
 */
function createMockElement(id, type = 'button') {
    return {
        id,
        tagName: type.toUpperCase(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        click: jest.fn()
    };
}

/**
 * Helper to create mock document
 */
function createMockDocument(elements = {}) {
    return {
        getElementById: jest.fn((id) => elements[id] || null)
    };
}

describe('EventCoordinator', () => {
    let mockUICoordinator;
    let mockGeocodingState;
    let mockWindow;
    let findRestaurantsBtn;
    let cityStatsBtn;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        global.alert.mockClear();

        // Create mock buttons
        findRestaurantsBtn = createMockElement('find-restaurants-btn');
        cityStatsBtn = createMockElement('city-stats-btn');

        // Create mock UI coordinator
        const mockDocument = createMockDocument({
            'find-restaurants-btn': findRestaurantsBtn,
            'city-stats-btn': cityStatsBtn
        });
        const elementIds = {
            findRestaurantsBtn: 'find-restaurants-btn',
            cityStatsBtn: 'city-stats-btn'
        };
        mockUICoordinator = new UICoordinator(mockDocument, elementIds);
        mockUICoordinator.initializeElements();

        // Create mock geocoding state
        mockGeocodingState = new GeocodingState();

        // Reset window mock
        mockWindow = {
            findNearbyRestaurants: undefined,
            fetchCityStatistics: undefined
        };
        global.window = mockWindow;
    });

    afterEach(() => {
        // Cleanup
        delete global.window;
    });

    describe('Constructor', () => {
        test('should create instance with valid dependencies', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            expect(coordinator).toBeInstanceOf(EventCoordinator);
        });

        test('should throw TypeError if uiCoordinator is not provided', () => {
            expect(() => {
                new EventCoordinator(null, mockGeocodingState);
            }).toThrow(TypeError);

            expect(() => {
                new EventCoordinator(undefined, mockGeocodingState);
            }).toThrow(TypeError);
        });

        test('should throw TypeError if geocodingState is not provided', () => {
            expect(() => {
                new EventCoordinator(mockUICoordinator, null);
            }).toThrow(TypeError);

            expect(() => {
                new EventCoordinator(mockUICoordinator, undefined);
            }).toThrow(TypeError);
        });

        test('should initialize with zero handlers', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            expect(coordinator.getHandlerCount()).toBe(0);
        });

        test('should initialize as not initialized', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            expect(coordinator.isInitialized()).toBe(false);
        });
    });

    describe('initializeEventListeners()', () => {
        test('should attach event listeners to buttons', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            coordinator.initializeEventListeners();

            expect(findRestaurantsBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(cityStatsBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        test('should track attached handlers', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            coordinator.initializeEventListeners();

            expect(coordinator.getHandlerCount()).toBe(2);
        });

        test('should mark as initialized', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            coordinator.initializeEventListeners();

            expect(coordinator.isInitialized()).toBe(true);
        });

        test('should return this for chaining', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            const result = coordinator.initializeEventListeners();

            expect(result).toBe(coordinator);
        });

        test('should handle missing buttons gracefully', () => {
            // Create coordinator with no buttons
            const emptyDocument = createMockDocument({});
            const emptyUI = new UICoordinator(emptyDocument, {
                findRestaurantsBtn: 'missing-btn',
                cityStatsBtn: 'missing-btn2'
            });
            emptyUI.initializeElements();
            const coordinator = new EventCoordinator(emptyUI, mockGeocodingState);

            expect(() => {
                coordinator.initializeEventListeners();
            }).not.toThrow();

            expect(coordinator.getHandlerCount()).toBe(0);
        });

        test('should warn if called multiple times', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            coordinator.initializeEventListeners();
            coordinator.initializeEventListeners();

            expect(global.console.warn).toHaveBeenCalled();
        });

        test('should be idempotent', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            coordinator.initializeEventListeners();
            const count1 = coordinator.getHandlerCount();
            
            coordinator.initializeEventListeners();
            const count2 = coordinator.getHandlerCount();

            expect(count1).toBe(count2);
        });
    });

    describe('removeEventListeners()', () => {
        test('should remove all event listeners', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            coordinator.initializeEventListeners();
            coordinator.removeEventListeners();

            expect(findRestaurantsBtn.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(cityStatsBtn.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        test('should clear handler tracking', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            coordinator.initializeEventListeners();
            coordinator.removeEventListeners();

            expect(coordinator.getHandlerCount()).toBe(0);
        });

        test('should mark as not initialized', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            coordinator.initializeEventListeners();
            coordinator.removeEventListeners();

            expect(coordinator.isInitialized()).toBe(false);
        });

        test('should return this for chaining', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            coordinator.initializeEventListeners();
            const result = coordinator.removeEventListeners();

            expect(result).toBe(coordinator);
        });

        test('should be safe to call without initialization', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            expect(() => {
                coordinator.removeEventListeners();
            }).not.toThrow();
        });

        test('should be safe to call multiple times', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            coordinator.initializeEventListeners();
            coordinator.removeEventListeners();

            expect(() => {
                coordinator.removeEventListeners();
            }).not.toThrow();
        });
    });

    describe('Find Restaurants Handler', () => {
        test('should show alert when coordinates not available', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);
            coordinator.initializeEventListeners();

            // Get the click handler and call it
            const clickHandler = findRestaurantsBtn.addEventListener.mock.calls[0][1];
            clickHandler();

            expect(global.alert).toHaveBeenCalledWith('Current coordinates not available.');
        });

        test('should show alert with coordinates when available', () => {
            const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
            mockGeocodingState.setPosition(position);
            
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);
            coordinator.initializeEventListeners();

            const clickHandler = findRestaurantsBtn.addEventListener.mock.calls[0][1];
            clickHandler();

            expect(global.alert).toHaveBeenCalledWith(
                expect.stringContaining('Procurando restaurantes próximos a')
            );
            expect(global.alert).toHaveBeenCalledWith(
                expect.stringContaining('-23.5505')
            );
        });

        test('should delegate to window.findNearbyRestaurants if available', () => {
            const mockExternalHandler = jest.fn();
            global.window.findNearbyRestaurants = mockExternalHandler;
            
            const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
            mockGeocodingState.setPosition(position);
            
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);
            coordinator.initializeEventListeners();

            const clickHandler = findRestaurantsBtn.addEventListener.mock.calls[0][1];
            clickHandler();

            expect(mockExternalHandler).toHaveBeenCalledWith(-23.550520, -46.633309);
            expect(global.alert).not.toHaveBeenCalled();
        });

        test('should log warning when clicked without coordinates', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);
            coordinator.initializeEventListeners();

            const clickHandler = findRestaurantsBtn.addEventListener.mock.calls[0][1];
            clickHandler();

            expect(global.console.warn).toHaveBeenCalled();
        });
    });

    describe('City Stats Handler', () => {
        test('should show alert when coordinates not available', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);
            coordinator.initializeEventListeners();

            const clickHandler = cityStatsBtn.addEventListener.mock.calls[0][1];
            clickHandler();

            expect(global.alert).toHaveBeenCalledWith('Current coordinates not available.');
        });

        test('should show alert with coordinates when available', () => {
            const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
            mockGeocodingState.setPosition(position);
            
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);
            coordinator.initializeEventListeners();

            const clickHandler = cityStatsBtn.addEventListener.mock.calls[0][1];
            clickHandler();

            expect(global.alert).toHaveBeenCalledWith(
                expect.stringContaining('Obtendo estatísticas da cidade para')
            );
            expect(global.alert).toHaveBeenCalledWith(
                expect.stringContaining('-23.5505')
            );
        });

        test('should delegate to window.fetchCityStatistics if available', () => {
            const mockExternalHandler = jest.fn();
            global.window.fetchCityStatistics = mockExternalHandler;
            
            const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
            mockGeocodingState.setPosition(position);
            
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);
            coordinator.initializeEventListeners();

            const clickHandler = cityStatsBtn.addEventListener.mock.calls[0][1];
            clickHandler();

            expect(mockExternalHandler).toHaveBeenCalledWith(-23.550520, -46.633309);
            expect(global.alert).not.toHaveBeenCalled();
        });

        test('should log warning when clicked without coordinates', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);
            coordinator.initializeEventListeners();

            const clickHandler = cityStatsBtn.addEventListener.mock.calls[0][1];
            clickHandler();

            expect(global.console.warn).toHaveBeenCalled();
        });
    });

    describe('isInitialized()', () => {
        test('should return false before initialization', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            expect(coordinator.isInitialized()).toBe(false);
        });

        test('should return true after initialization', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            coordinator.initializeEventListeners();

            expect(coordinator.isInitialized()).toBe(true);
        });

        test('should return false after removal', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            coordinator.initializeEventListeners();
            coordinator.removeEventListeners();

            expect(coordinator.isInitialized()).toBe(false);
        });
    });

    describe('getHandlerCount()', () => {
        test('should return 0 initially', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            expect(coordinator.getHandlerCount()).toBe(0);
        });

        test('should return 2 after initialization with both buttons', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            coordinator.initializeEventListeners();

            expect(coordinator.getHandlerCount()).toBe(2);
        });

        test('should return 0 after removal', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            coordinator.initializeEventListeners();
            coordinator.removeEventListeners();

            expect(coordinator.getHandlerCount()).toBe(0);
        });

        test('should return partial count when some buttons missing', () => {
            const partialDocument = createMockDocument({
                'find-restaurants-btn': findRestaurantsBtn
                // cityStatsBtn missing
            });
            const partialUI = new UICoordinator(partialDocument, {
                findRestaurantsBtn: 'find-restaurants-btn',
                cityStatsBtn: 'city-stats-btn'
            });
            partialUI.initializeElements();
            
            const coordinator = new EventCoordinator(partialUI, mockGeocodingState);
            coordinator.initializeEventListeners();

            expect(coordinator.getHandlerCount()).toBe(1);
        });
    });

    describe('toString()', () => {
        test('should show not initialized state', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            const result = coordinator.toString();

            expect(result).toContain('EventCoordinator');
            expect(result).toContain('0 handlers');
            expect(result).toContain('not initialized');
        });

        test('should show initialized state with handler count', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            coordinator.initializeEventListeners();
            const result = coordinator.toString();

            expect(result).toContain('EventCoordinator');
            expect(result).toContain('2 handlers');
            expect(result).toContain('initialized');
        });

        test('should reflect current state after removal', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            coordinator.initializeEventListeners();
            coordinator.removeEventListeners();
            const result = coordinator.toString();

            expect(result).toContain('0 handlers');
            expect(result).toContain('not initialized');
        });
    });

    describe('Integration Scenarios', () => {
        test('should support complete initialization and cleanup workflow', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            // Initialize
            coordinator.initializeEventListeners();
            expect(coordinator.isInitialized()).toBe(true);
            expect(coordinator.getHandlerCount()).toBe(2);

            // Use handlers
            const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
            mockGeocodingState.setPosition(position);
            
            const clickHandler = findRestaurantsBtn.addEventListener.mock.calls[0][1];
            clickHandler();
            expect(global.alert).toHaveBeenCalled();

            // Cleanup
            coordinator.removeEventListeners();
            expect(coordinator.isInitialized()).toBe(false);
            expect(coordinator.getHandlerCount()).toBe(0);
        });

        test('should support reinitialization after cleanup', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);

            // First cycle
            coordinator.initializeEventListeners();
            coordinator.removeEventListeners();

            // Second cycle
            coordinator.initializeEventListeners();
            expect(coordinator.isInitialized()).toBe(true);
            expect(coordinator.getHandlerCount()).toBe(2);
        });

        test('should handle state changes during handler execution', () => {
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);
            coordinator.initializeEventListeners();

            // Initially no coordinates
            const clickHandler1 = findRestaurantsBtn.addEventListener.mock.calls[0][1];
            clickHandler1();
            expect(global.alert).toHaveBeenCalledWith('Current coordinates not available.');

            // Set coordinates
            const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
            mockGeocodingState.setPosition(position);

            // Now coordinates available
            global.alert.mockClear();
            clickHandler1();
            expect(global.alert).toHaveBeenCalledWith(
                expect.stringContaining('Procurando restaurantes')
            );
        });

        test('should handle multiple button clicks', () => {
            const position = new GeoPosition(createMockPosition(-23.550520, -46.633309));
            mockGeocodingState.setPosition(position);
            
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);
            coordinator.initializeEventListeners();

            const restaurantsHandler = findRestaurantsBtn.addEventListener.mock.calls[0][1];
            const statsHandler = cityStatsBtn.addEventListener.mock.calls[0][1];

            // Click both buttons
            restaurantsHandler();
            expect(global.alert).toHaveBeenCalledWith(
                expect.stringContaining('restaurantes')
            );

            global.alert.mockClear();
            
            statsHandler();
            expect(global.alert).toHaveBeenCalledWith(
                expect.stringContaining('estatísticas')
            );
        });

        test('should work with external window handlers', () => {
            const mockRestaurants = jest.fn();
            const mockStats = jest.fn();
            global.window.findNearbyRestaurants = mockRestaurants;
            global.window.fetchCityStatistics = mockStats;
            
            const position = new GeoPosition(createMockPosition(40.7128, -74.0060));
            mockGeocodingState.setPosition(position);
            
            const coordinator = new EventCoordinator(mockUICoordinator, mockGeocodingState);
            coordinator.initializeEventListeners();

            const restaurantsHandler = findRestaurantsBtn.addEventListener.mock.calls[0][1];
            const statsHandler = cityStatsBtn.addEventListener.mock.calls[0][1];

            // Click both buttons
            restaurantsHandler();
            expect(mockRestaurants).toHaveBeenCalledWith(40.7128, -74.0060);

            statsHandler();
            expect(mockStats).toHaveBeenCalledWith(40.7128, -74.0060);

            // Fallback alert should not be called
            expect(global.alert).not.toHaveBeenCalled();
        });
    });
});
