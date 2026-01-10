/**
 * @fileoverview Unit tests for UICoordinator class
 * @description Comprehensive test suite for UI element management and DOM operations
 * Tests cover element initialization, caching, updates, and error handling
 * 
 * @jest-environment node
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock console to suppress logging during tests
const originalConsole = global.console;
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
};

// Mock global utility functions
global.log = jest.fn();
global.warn = jest.fn();

// Import class under test
let UICoordinator;
try {
    const module = await import('../../src/coordination/UICoordinator.js');
    UICoordinator = module.default;
} catch (error) {
    console.warn('Could not load UICoordinator:', error.message);
}

/**
 * Helper function to create a mock document with getElementById
 */
function createMockDocument(elements = {}) {
    return {
        getElementById: jest.fn((id) => elements[id] || null)
    };
}

/**
 * Helper function to create a mock HTML element
 */
function createMockElement(id, type = 'div') {
    return {
        id,
        tagName: type.toUpperCase(),
        textContent: '',
        disabled: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    };
}

describe('UICoordinator', () => {
    let mockDocument;
    let elementIds;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Create fresh element IDs configuration
        elementIds = {
            chronometer: 'chronometer',
            findRestaurantsBtn: 'find-restaurants-btn',
            cityStatsBtn: 'city-stats-btn',
            timestampDisplay: 'tsPosCapture'
        };
    });

    describe('Constructor', () => {
        test('should create instance with valid document and elementIds', () => {
            mockDocument = createMockDocument();
            const coordinator = new UICoordinator(mockDocument, elementIds);

            expect(coordinator).toBeInstanceOf(UICoordinator);
        });

        test('should throw TypeError if document is not provided', () => {
            expect(() => {
                new UICoordinator(null, elementIds);
            }).toThrow(TypeError);

            expect(() => {
                new UICoordinator(undefined, elementIds);
            }).toThrow(TypeError);
        });

        test('should throw TypeError if elementIds is not an object', () => {
            mockDocument = createMockDocument();

            expect(() => {
                new UICoordinator(mockDocument, null);
            }).toThrow(TypeError);

            expect(() => {
                new UICoordinator(mockDocument, 'invalid');
            }).toThrow(TypeError);

            expect(() => {
                new UICoordinator(mockDocument, 123);
            }).toThrow(TypeError);
        });

        test('should accept empty elementIds object', () => {
            mockDocument = createMockDocument();

            expect(() => {
                new UICoordinator(mockDocument, {});
            }).not.toThrow();
        });

        test('should freeze elementIds configuration', () => {
            mockDocument = createMockDocument();
            const coordinator = new UICoordinator(mockDocument, elementIds);
            const config = coordinator.getElementIds();

            expect(Object.isFrozen(config)).toBe(true);
        });

        test('should not allow modification of elementIds after construction', () => {
            mockDocument = createMockDocument();
            const coordinator = new UICoordinator(mockDocument, elementIds);
            const config = coordinator.getElementIds();

            expect(() => {
                config.newKey = 'newValue';
            }).toThrow();
        });

        test('should initialize with empty elements cache', () => {
            mockDocument = createMockDocument();
            const coordinator = new UICoordinator(mockDocument, elementIds);

            expect(coordinator.getElement('chronometer')).toBeNull();
            expect(coordinator.hasElement('chronometer')).toBe(false);
        });
    });

    describe('initializeElements()', () => {
        test('should find and cache all configured elements', () => {
            const elements = {
                'chronometer': createMockElement('chronometer'),
                'find-restaurants-btn': createMockElement('find-restaurants-btn', 'button'),
                'city-stats-btn': createMockElement('city-stats-btn', 'button'),
                'tsPosCapture': createMockElement('tsPosCapture', 'span')
            };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            const result = coordinator.initializeElements();

            expect(result.chronometer).toBe(elements['chronometer']);
            expect(result.findRestaurantsBtn).toBe(elements['find-restaurants-btn']);
            expect(result.cityStatsBtn).toBe(elements['city-stats-btn']);
            expect(result.timestampDisplay).toBe(elements['tsPosCapture']);
        });

        test('should return frozen object of elements', () => {
            mockDocument = createMockDocument();
            const coordinator = new UICoordinator(mockDocument, elementIds);

            const result = coordinator.initializeElements();

            expect(Object.isFrozen(result)).toBe(true);
        });

        test('should handle missing elements gracefully', () => {
            const elements = {
                'chronometer': createMockElement('chronometer')
                // Other elements missing
            };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            expect(() => {
                coordinator.initializeElements();
            }).not.toThrow();

            expect(coordinator.getElement('chronometer')).not.toBeNull();
            expect(coordinator.getElement('findRestaurantsBtn')).toBeNull();
        });

        test('should log warning for missing elements', () => {
            mockDocument = createMockDocument({});
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();

            // Logger uses console.warn
            expect(global.console.warn).toHaveBeenCalled();
        });

        test('should query document for each element ID', () => {
            const elements = {
                'chronometer': createMockElement('chronometer')
            };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();

            expect(mockDocument.getElementById).toHaveBeenCalledWith('chronometer');
            expect(mockDocument.getElementById).toHaveBeenCalledWith('find-restaurants-btn');
            expect(mockDocument.getElementById).toHaveBeenCalledWith('city-stats-btn');
            expect(mockDocument.getElementById).toHaveBeenCalledWith('tsPosCapture');
        });

        test('should allow reinitialization after clearElements', () => {
            const elements = {
                'chronometer': createMockElement('chronometer')
            };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            expect(coordinator.hasElement('chronometer')).toBe(true);

            coordinator.clearElements();
            expect(coordinator.hasElement('chronometer')).toBe(false);

            coordinator.initializeElements();
            expect(coordinator.hasElement('chronometer')).toBe(true);
        });
    });

    describe('getElement()', () => {
        test('should return cached element by name', () => {
            const chronometerElement = createMockElement('chronometer');
            const elements = { 'chronometer': chronometerElement };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            const result = coordinator.getElement('chronometer');

            expect(result).toBe(chronometerElement);
        });

        test('should return null for non-existent element', () => {
            mockDocument = createMockDocument({});
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            const result = coordinator.getElement('nonExistent');

            expect(result).toBeNull();
        });

        test('should return null before initialization', () => {
            mockDocument = createMockDocument();
            const coordinator = new UICoordinator(mockDocument, elementIds);

            const result = coordinator.getElement('chronometer');

            expect(result).toBeNull();
        });

        test('should return same element on multiple calls', () => {
            const chronometerElement = createMockElement('chronometer');
            const elements = { 'chronometer': chronometerElement };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            const result1 = coordinator.getElement('chronometer');
            const result2 = coordinator.getElement('chronometer');

            expect(result1).toBe(result2);
        });
    });

    describe('hasElement()', () => {
        test('should return true for existing element', () => {
            const chronometerElement = createMockElement('chronometer');
            const elements = { 'chronometer': chronometerElement };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();

            expect(coordinator.hasElement('chronometer')).toBe(true);
        });

        test('should return false for missing element', () => {
            mockDocument = createMockDocument({});
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();

            expect(coordinator.hasElement('chronometer')).toBe(false);
        });

        test('should return false before initialization', () => {
            mockDocument = createMockDocument();
            const coordinator = new UICoordinator(mockDocument, elementIds);

            expect(coordinator.hasElement('chronometer')).toBe(false);
        });

        test('should return false for null element', () => {
            mockDocument = createMockDocument({});
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();

            expect(coordinator.hasElement('findRestaurantsBtn')).toBe(false);
        });
    });

    describe('getAllElements()', () => {
        test('should return all cached elements', () => {
            const elements = {
                'chronometer': createMockElement('chronometer'),
                'find-restaurants-btn': createMockElement('find-restaurants-btn', 'button')
            };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            const result = coordinator.getAllElements();

            expect(result.chronometer).toBe(elements['chronometer']);
            expect(result.findRestaurantsBtn).toBe(elements['find-restaurants-btn']);
        });

        test('should return frozen object', () => {
            mockDocument = createMockDocument();
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            const result = coordinator.getAllElements();

            expect(Object.isFrozen(result)).toBe(true);
        });

        test('should return empty object before initialization', () => {
            mockDocument = createMockDocument();
            const coordinator = new UICoordinator(mockDocument, elementIds);

            const result = coordinator.getAllElements();

            expect(Object.keys(result).length).toBe(0);
        });

        test('should return defensive copy', () => {
            mockDocument = createMockDocument();
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            const result1 = coordinator.getAllElements();
            const result2 = coordinator.getAllElements();

            expect(result1).toEqual(result2);
            expect(result1).not.toBe(result2);
        });
    });

    describe('updateTimestamp()', () => {
        test('should update timestamp display with formatted date', () => {
            const timestampElement = createMockElement('tsPosCapture', 'span');
            const elements = { 'tsPosCapture': timestampElement };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            const timestamp = new Date('2026-01-10T15:30:45.000Z').getTime();
            coordinator.updateTimestamp(timestamp);

            expect(timestampElement.textContent).toBeTruthy();
            expect(timestampElement.textContent).toContain('2026');
        });

        test('should handle missing timestamp element gracefully', () => {
            mockDocument = createMockDocument({});
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();

            expect(() => {
                coordinator.updateTimestamp(Date.now());
            }).not.toThrow();
        });

        test('should log warning if element not available', () => {
            mockDocument = createMockDocument({});
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            coordinator.updateTimestamp(Date.now());

            // Logger uses console.warn
            expect(global.console.warn).toHaveBeenCalled();
        });

        test('should format timestamp in Brazilian Portuguese', () => {
            const timestampElement = createMockElement('tsPosCapture', 'span');
            const elements = { 'tsPosCapture': timestampElement };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            const timestamp = new Date('2026-01-10T15:30:45.000Z').getTime();
            coordinator.updateTimestamp(timestamp);

            // Check that text was set (exact format depends on locale)
            expect(timestampElement.textContent).not.toBe('');
        });
    });

    describe('updateChronometer()', () => {
        test('should update chronometer text content', () => {
            const chronometerElement = createMockElement('chronometer');
            const elements = { 'chronometer': chronometerElement };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            coordinator.updateChronometer('00:05:23');

            expect(chronometerElement.textContent).toBe('00:05:23');
        });

        test('should handle missing chronometer element gracefully', () => {
            mockDocument = createMockDocument({});
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();

            expect(() => {
                coordinator.updateChronometer('00:00:00');
            }).not.toThrow();
        });

        test('should accept any string value', () => {
            const chronometerElement = createMockElement('chronometer');
            const elements = { 'chronometer': chronometerElement };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            coordinator.updateChronometer('Custom text');

            expect(chronometerElement.textContent).toBe('Custom text');
        });
    });

    describe('setButtonEnabled()', () => {
        test('should enable button when enabled=true', () => {
            const buttonElement = createMockElement('find-restaurants-btn', 'button');
            buttonElement.disabled = true;
            const elements = { 'find-restaurants-btn': buttonElement };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            coordinator.setButtonEnabled('findRestaurantsBtn', true);

            expect(buttonElement.disabled).toBe(false);
        });

        test('should disable button when enabled=false', () => {
            const buttonElement = createMockElement('find-restaurants-btn', 'button');
            buttonElement.disabled = false;
            const elements = { 'find-restaurants-btn': buttonElement };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            coordinator.setButtonEnabled('findRestaurantsBtn', false);

            expect(buttonElement.disabled).toBe(true);
        });

        test('should handle missing element gracefully', () => {
            mockDocument = createMockDocument({});
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();

            expect(() => {
                coordinator.setButtonEnabled('findRestaurantsBtn', true);
            }).not.toThrow();
        });

        test('should handle non-button elements gracefully', () => {
            const divElement = createMockElement('chronometer', 'div');
            delete divElement.disabled; // divs don't have disabled property
            const elements = { 'chronometer': divElement };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();

            expect(() => {
                coordinator.setButtonEnabled('chronometer', false);
            }).not.toThrow();
        });
    });

    describe('clearElements()', () => {
        test('should clear all cached elements', () => {
            const elements = {
                'chronometer': createMockElement('chronometer')
            };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            expect(coordinator.hasElement('chronometer')).toBe(true);

            coordinator.clearElements();
            expect(coordinator.hasElement('chronometer')).toBe(false);
        });

        test('should allow reinitialization after clear', () => {
            const elements = {
                'chronometer': createMockElement('chronometer')
            };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            coordinator.clearElements();
            coordinator.initializeElements();

            expect(coordinator.hasElement('chronometer')).toBe(true);
        });

        test('should not throw if called before initialization', () => {
            mockDocument = createMockDocument();
            const coordinator = new UICoordinator(mockDocument, elementIds);

            expect(() => {
                coordinator.clearElements();
            }).not.toThrow();
        });
    });

    describe('getElementIds()', () => {
        test('should return element IDs configuration', () => {
            mockDocument = createMockDocument();
            const coordinator = new UICoordinator(mockDocument, elementIds);

            const result = coordinator.getElementIds();

            expect(result).toEqual(elementIds);
        });

        test('should return frozen object', () => {
            mockDocument = createMockDocument();
            const coordinator = new UICoordinator(mockDocument, elementIds);

            const result = coordinator.getElementIds();

            expect(Object.isFrozen(result)).toBe(true);
        });

        test('should not allow modification', () => {
            mockDocument = createMockDocument();
            const coordinator = new UICoordinator(mockDocument, elementIds);

            const result = coordinator.getElementIds();

            expect(() => {
                result.newKey = 'newValue';
            }).toThrow();
        });
    });

    describe('toString()', () => {
        test('should return string with element counts', () => {
            const elements = {
                'chronometer': createMockElement('chronometer'),
                'find-restaurants-btn': createMockElement('find-restaurants-btn', 'button')
            };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            const result = coordinator.toString();

            expect(result).toContain('UICoordinator');
            expect(result).toContain('4'); // Total elements
            expect(result).toContain('2'); // Found elements
            expect(result).toContain('2'); // Missing elements
        });

        test('should show 0 elements before initialization', () => {
            mockDocument = createMockDocument();
            const coordinator = new UICoordinator(mockDocument, elementIds);

            const result = coordinator.toString();

            expect(result).toContain('0 elements');
        });

        test('should show all found when all elements present', () => {
            const elements = {
                'chronometer': createMockElement('chronometer'),
                'find-restaurants-btn': createMockElement('find-restaurants-btn', 'button'),
                'city-stats-btn': createMockElement('city-stats-btn', 'button'),
                'tsPosCapture': createMockElement('tsPosCapture', 'span')
            };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();
            const result = coordinator.toString();

            expect(result).toContain('4 found');
            expect(result).toContain('0 missing');
        });
    });

    describe('Integration Scenarios', () => {
        test('should support complete initialization workflow', () => {
            const elements = {
                'chronometer': createMockElement('chronometer'),
                'find-restaurants-btn': createMockElement('find-restaurants-btn', 'button'),
                'city-stats-btn': createMockElement('city-stats-btn', 'button'),
                'tsPosCapture': createMockElement('tsPosCapture', 'span')
            };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            // Initialize
            const result = coordinator.initializeElements();
            expect(Object.keys(result).length).toBe(4);

            // Access elements
            expect(coordinator.getElement('chronometer')).not.toBeNull();
            expect(coordinator.hasElement('findRestaurantsBtn')).toBe(true);

            // Update UI
            coordinator.updateTimestamp(Date.now());
            coordinator.updateChronometer('00:00:00');
            coordinator.setButtonEnabled('findRestaurantsBtn', false);

            // Verify state
            expect(coordinator.toString()).toContain('4 found');
        });

        test('should handle partial element availability', () => {
            const elements = {
                'chronometer': createMockElement('chronometer')
                // Other elements missing
            };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();

            // Should work with available elements
            coordinator.updateChronometer('Test');
            expect(coordinator.getElement('chronometer').textContent).toBe('Test');

            // Should handle missing elements gracefully
            expect(() => {
                coordinator.updateTimestamp(Date.now());
                coordinator.setButtonEnabled('findRestaurantsBtn', false);
            }).not.toThrow();
        });

        test('should support reinitialization workflow', () => {
            const elements = {
                'chronometer': createMockElement('chronometer')
            };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            // First initialization
            coordinator.initializeElements();
            expect(coordinator.hasElement('chronometer')).toBe(true);

            // Clear and reinitialize
            coordinator.clearElements();
            expect(coordinator.hasElement('chronometer')).toBe(false);

            coordinator.initializeElements();
            expect(coordinator.hasElement('chronometer')).toBe(true);
        });

        test('should maintain element references across multiple accesses', () => {
            const chronometerElement = createMockElement('chronometer');
            const elements = { 'chronometer': chronometerElement };
            mockDocument = createMockDocument(elements);
            const coordinator = new UICoordinator(mockDocument, elementIds);

            coordinator.initializeElements();

            const ref1 = coordinator.getElement('chronometer');
            const ref2 = coordinator.getElement('chronometer');
            const allElements = coordinator.getAllElements();

            expect(ref1).toBe(ref2);
            expect(ref1).toBe(allElements.chronometer);
            expect(ref1).toBe(chronometerElement);
        });
    });
});
