/**
 * Unit tests for SingletonStatusManager class.
 * 
 * This test suite provides comprehensive coverage for the SingletonStatusManager
 * class, testing singleton pattern enforcement, status tracking functionality,
 * thread safety, error handling, and edge cases.
 * 
 * Test Categories:
 * - Singleton pattern enforcement and instance management
 * - Status tracking methods and state transitions
 * - Error handling and input validation
 * - Thread safety and concurrent access scenarios
 * - toString representation and debugging features
 * - Memory management and instance lifecycle
 * - Cross-environment compatibility (browser/Node.js)
 * 
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import { jest } from '@jest/globals';

// Mock console for testing
global.console = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

// Import the class under test
const SingletonStatusManager = (await import('../../src/status/SingletonStatusManager.js')).default;

describe('SingletonStatusManager - MP Barbosa Travel Guide (v0.9.0-alpha)', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset singleton instance for each test
        SingletonStatusManager.resetInstance();
    });

    afterEach(() => {
        // Clean up singleton instance after each test
        SingletonStatusManager.resetInstance();
    });

    describe('Singleton Pattern Enforcement', () => {
        test('should create only one instance through constructor', () => {
            const instance1 = new SingletonStatusManager();
            const instance2 = new SingletonStatusManager();
            
            expect(instance1).toBe(instance2);
            expect(instance1 === instance2).toBe(true);
        });

        test('should create only one instance through getInstance', () => {
            const instance1 = SingletonStatusManager.getInstance();
            const instance2 = SingletonStatusManager.getInstance();
            
            expect(instance1).toBe(instance2);
            expect(instance1 === instance2).toBe(true);
        });

        test('should return same instance from constructor and getInstance', () => {
            const constructorInstance = new SingletonStatusManager();
            const getInstanceResult = SingletonStatusManager.getInstance();
            
            expect(constructorInstance).toBe(getInstanceResult);
        });

        test('should return same instance from getInstance and constructor', () => {
            const getInstanceResult = SingletonStatusManager.getInstance();
            const constructorInstance = new SingletonStatusManager();
            
            expect(getInstanceResult).toBe(constructorInstance);
        });

        test('should maintain singleton across multiple instantiation attempts', () => {
            const instances = [];
            for (let i = 0; i < 10; i++) {
                instances.push(new SingletonStatusManager());
            }
            
            // All instances should be the same reference
            for (let i = 1; i < instances.length; i++) {
                expect(instances[i]).toBe(instances[0]);
            }
        });

        test('should maintain singleton across mixed instantiation methods', () => {
            const instance1 = new SingletonStatusManager();
            const instance2 = SingletonStatusManager.getInstance();
            const instance3 = new SingletonStatusManager();
            const instance4 = SingletonStatusManager.getInstance();
            
            expect(instance1).toBe(instance2);
            expect(instance2).toBe(instance3);
            expect(instance3).toBe(instance4);
        });

        test('should have static instance property after first instantiation', () => {
            expect(SingletonStatusManager.instance).toBeNull();
            
            const instance = SingletonStatusManager.getInstance();
            
            expect(SingletonStatusManager.instance).toBeDefined();
            expect(SingletonStatusManager.instance).toBe(instance);
        });
    });

    describe('Initial State and Default Values', () => {
        test('should initialize with gettingLocation set to false', () => {
            const instance = new SingletonStatusManager();
            
            expect(instance.isGettingLocation()).toBe(false);
        });

        test('should initialize with default state through getInstance', () => {
            const instance = SingletonStatusManager.getInstance();
            
            expect(instance.isGettingLocation()).toBe(false);
        });

        test('should have consistent initial state across different access methods', () => {
            const constructorInstance = new SingletonStatusManager();
            const getInstanceResult = SingletonStatusManager.getInstance();
            
            expect(constructorInstance.isGettingLocation()).toBe(false);
            expect(getInstanceResult.isGettingLocation()).toBe(false);
            expect(constructorInstance.isGettingLocation()).toBe(getInstanceResult.isGettingLocation());
        });
    });

    describe('Status Tracking Functionality', () => {
        let statusManager;

        beforeEach(() => {
            statusManager = SingletonStatusManager.getInstance();
        });

        test('should correctly set gettingLocation to true', () => {
            statusManager.setGettingLocation(true);
            
            expect(statusManager.isGettingLocation()).toBe(true);
        });

        test('should correctly set gettingLocation to false', () => {
            statusManager.setGettingLocation(false);
            
            expect(statusManager.isGettingLocation()).toBe(false);
        });

        test('should handle multiple state transitions', () => {
            // Start with false (default)
            expect(statusManager.isGettingLocation()).toBe(false);
            
            // Set to true
            statusManager.setGettingLocation(true);
            expect(statusManager.isGettingLocation()).toBe(true);
            
            // Set back to false
            statusManager.setGettingLocation(false);
            expect(statusManager.isGettingLocation()).toBe(false);
            
            // Set to true again
            statusManager.setGettingLocation(true);
            expect(statusManager.isGettingLocation()).toBe(true);
        });

        test('should maintain state consistency when setting same value multiple times', () => {
            // Set to true multiple times
            statusManager.setGettingLocation(true);
            statusManager.setGettingLocation(true);
            statusManager.setGettingLocation(true);
            
            expect(statusManager.isGettingLocation()).toBe(true);
            
            // Set to false multiple times
            statusManager.setGettingLocation(false);
            statusManager.setGettingLocation(false);
            statusManager.setGettingLocation(false);
            
            expect(statusManager.isGettingLocation()).toBe(false);
        });

        test('should persist state across different instance references', () => {
            const instance1 = SingletonStatusManager.getInstance();
            const instance2 = SingletonStatusManager.getInstance();
            
            instance1.setGettingLocation(true);
            expect(instance2.isGettingLocation()).toBe(true);
            
            instance2.setGettingLocation(false);
            expect(instance1.isGettingLocation()).toBe(false);
        });
    });

    describe('Logging Behavior', () => {
        let statusManager;

        beforeEach(() => {
            statusManager = SingletonStatusManager.getInstance();
        });

        test('should log "Getting location..." when setting status to true', () => {
            statusManager.setGettingLocation(true);
            
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('['), 'Getting location...');
        });

        test('should log "Stopped getting location." when setting status to false', () => {
            statusManager.setGettingLocation(false);
            
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('['), 'Stopped getting location.');
        });

        test('should log appropriate messages for multiple state changes', () => {
            statusManager.setGettingLocation(true);
            statusManager.setGettingLocation(false);
            statusManager.setGettingLocation(true);
            
            expect(console.log).toHaveBeenCalledTimes(3);
            expect(console.log).toHaveBeenNthCalledWith(1, expect.stringContaining('['), 'Getting location...');
            expect(console.log).toHaveBeenNthCalledWith(2, expect.stringContaining('['), 'Stopped getting location.');
            expect(console.log).toHaveBeenNthCalledWith(3, expect.stringContaining('['), 'Getting location...');
        });

        test('should log even when setting same value multiple times', () => {
            statusManager.setGettingLocation(true);
            statusManager.setGettingLocation(true);
            
            expect(console.log).toHaveBeenCalledTimes(2);
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('['), 'Getting location...');
        });
    });

    describe('Error Handling and Input Validation', () => {
        let statusManager;

        beforeEach(() => {
            statusManager = SingletonStatusManager.getInstance();
        });

        test('should throw TypeError when setting status to string', () => {
            expect(() => {
                statusManager.setGettingLocation('true');
            }).toThrow(TypeError);
            
            expect(() => {
                statusManager.setGettingLocation('true');
            }).toThrow('Status must be a boolean, received: string');
        });

        test('should throw TypeError when setting status to number', () => {
            expect(() => {
                statusManager.setGettingLocation(1);
            }).toThrow(TypeError);
            
            expect(() => {
                statusManager.setGettingLocation(1);
            }).toThrow('Status must be a boolean, received: number');
        });

        test('should throw TypeError when setting status to null', () => {
            expect(() => {
                statusManager.setGettingLocation(null);
            }).toThrow(TypeError);
            
            expect(() => {
                statusManager.setGettingLocation(null);
            }).toThrow('Status must be a boolean, received: object');
        });

        test('should throw TypeError when setting status to undefined', () => {
            expect(() => {
                statusManager.setGettingLocation(undefined);
            }).toThrow(TypeError);
            
            expect(() => {
                statusManager.setGettingLocation(undefined);
            }).toThrow('Status must be a boolean, received: undefined');
        });

        test('should throw TypeError when setting status to object', () => {
            expect(() => {
                statusManager.setGettingLocation({});
            }).toThrow(TypeError);
            
            expect(() => {
                statusManager.setGettingLocation({});
            }).toThrow('Status must be a boolean, received: object');
        });

        test('should throw TypeError when setting status to array', () => {
            expect(() => {
                statusManager.setGettingLocation([]);
            }).toThrow(TypeError);
            
            expect(() => {
                statusManager.setGettingLocation([]);
            }).toThrow('Status must be a boolean, received: object');
        });

        test('should maintain previous state when error occurs', () => {
            statusManager.setGettingLocation(true);
            
            try {
                statusManager.setGettingLocation('false');
            } catch (error) {
                // Expected error
            }
            
            // State should remain unchanged
            expect(statusManager.isGettingLocation()).toBe(true);
        });

        test('should handle multiple invalid inputs without affecting state', () => {
            const initialState = statusManager.isGettingLocation();
            
            const invalidInputs = ['true', 1, null, undefined, {}, [], () => {}];
            
            invalidInputs.forEach(input => {
                try {
                    statusManager.setGettingLocation(input);
                } catch (error) {
                    // Expected errors
                }
            });
            
            expect(statusManager.isGettingLocation()).toBe(initialState);
        });
    });

    describe('toString Method', () => {
        let statusManager;

        beforeEach(() => {
            statusManager = SingletonStatusManager.getInstance();
        });

        test('should return correct string representation with default state', () => {
            const result = statusManager.toString();
            
            expect(result).toBe('SingletonStatusManager: gettingLocation=false');
        });

        test('should return correct string representation when status is true', () => {
            statusManager.setGettingLocation(true);
            const result = statusManager.toString();
            
            expect(result).toBe('SingletonStatusManager: gettingLocation=true');
        });

        test('should return correct string representation when status is false', () => {
            statusManager.setGettingLocation(false);
            const result = statusManager.toString();
            
            expect(result).toBe('SingletonStatusManager: gettingLocation=false');
        });

        test('should reflect state changes in toString output', () => {
            let result = statusManager.toString();
            expect(result).toBe('SingletonStatusManager: gettingLocation=false');
            
            statusManager.setGettingLocation(true);
            result = statusManager.toString();
            expect(result).toBe('SingletonStatusManager: gettingLocation=true');
            
            statusManager.setGettingLocation(false);
            result = statusManager.toString();
            expect(result).toBe('SingletonStatusManager: gettingLocation=false');
        });

        test('should include class name in string representation', () => {
            const result = statusManager.toString();
            
            expect(result).toContain('SingletonStatusManager');
        });

        test('should include current status value in string representation', () => {
            statusManager.setGettingLocation(true);
            const result = statusManager.toString();
            
            expect(result).toContain('gettingLocation=true');
        });
    });

    describe('Thread Safety and Concurrent Access', () => {
        test('should handle rapid successive getInstance calls', () => {
            const instances = [];
            
            // Simulate rapid concurrent access
            for (let i = 0; i < 100; i++) {
                instances.push(SingletonStatusManager.getInstance());
            }
            
            // All instances should be the same reference
            const firstInstance = instances[0];
            instances.forEach(instance => {
                expect(instance).toBe(firstInstance);
            });
        });

        test('should handle concurrent state changes safely', () => {
            const instance1 = SingletonStatusManager.getInstance();
            const instance2 = SingletonStatusManager.getInstance();
            
            // Simulate concurrent state changes
            instance1.setGettingLocation(true);
            expect(instance2.isGettingLocation()).toBe(true);
            
            instance2.setGettingLocation(false);
            expect(instance1.isGettingLocation()).toBe(false);
            
            // Final state should be consistent
            expect(instance1.isGettingLocation()).toBe(instance2.isGettingLocation());
        });

        test('should maintain singleton integrity under stress', () => {
            const instances = [];
            
            // Create instances and perform operations
            for (let i = 0; i < 50; i++) {
                const instance = SingletonStatusManager.getInstance();
                instance.setGettingLocation(i % 2 === 0);
                instances.push(instance);
            }
            
            // All instances should be the same
            const firstInstance = instances[0];
            instances.forEach(instance => {
                expect(instance).toBe(firstInstance);
                expect(instance.isGettingLocation()).toBe(firstInstance.isGettingLocation());
            });
        });
    });

    describe('Memory Management and Instance Lifecycle', () => {
        test('should properly reset instance for testing', () => {
            const instance1 = SingletonStatusManager.getInstance();
            instance1.setGettingLocation(true);
            
            SingletonStatusManager.resetInstance();
            
            const instance2 = SingletonStatusManager.getInstance();
            
            expect(instance2).not.toBe(instance1);
            expect(instance2.isGettingLocation()).toBe(false); // Default state
        });

        test('should create fresh instance after reset', () => {
            const instance1 = SingletonStatusManager.getInstance();
            instance1.setGettingLocation(true);
            
            expect(instance1.isGettingLocation()).toBe(true);
            
            SingletonStatusManager.resetInstance();
            
            const instance2 = SingletonStatusManager.getInstance();
            
            expect(instance2.isGettingLocation()).toBe(false);
            expect(instance2.toString()).toBe('SingletonStatusManager: gettingLocation=false');
        });

        test('should handle multiple resets correctly', () => {
            const instance1 = SingletonStatusManager.getInstance();
            SingletonStatusManager.resetInstance();
            
            const instance2 = SingletonStatusManager.getInstance();
            SingletonStatusManager.resetInstance();
            
            const instance3 = SingletonStatusManager.getInstance();
            
            expect(instance1).not.toBe(instance2);
            expect(instance2).not.toBe(instance3);
            expect(instance1).not.toBe(instance3);
        });
    });

    describe('Edge Cases and Robustness', () => {
        test('should handle rapid state toggling', () => {
            const statusManager = SingletonStatusManager.getInstance();
            
            // Rapidly toggle state
            for (let i = 0; i < 100; i++) {
                statusManager.setGettingLocation(i % 2 === 0);
            }
            
            // Final state should be false (100 is even, so last iteration sets false)
            expect(statusManager.isGettingLocation()).toBe(false);
        });

        test('should maintain consistency after errors', () => {
            const statusManager = SingletonStatusManager.getInstance();
            statusManager.setGettingLocation(true);
            
            // Try to set invalid value
            try {
                statusManager.setGettingLocation('invalid');
            } catch (error) {
                // Expected
            }
            
            // State should remain unchanged
            expect(statusManager.isGettingLocation()).toBe(true);
            
            // Should still work normally
            statusManager.setGettingLocation(false);
            expect(statusManager.isGettingLocation()).toBe(false);
        });

        test('should handle constructor called after getInstance', () => {
            const instance1 = SingletonStatusManager.getInstance();
            instance1.setGettingLocation(true);
            
            const instance2 = new SingletonStatusManager();
            
            expect(instance1).toBe(instance2);
            expect(instance2.isGettingLocation()).toBe(true);
        });

        test('should handle getInstance called after constructor', () => {
            const instance1 = new SingletonStatusManager();
            instance1.setGettingLocation(true);
            
            const instance2 = SingletonStatusManager.getInstance();
            
            expect(instance1).toBe(instance2);
            expect(instance2.isGettingLocation()).toBe(true);
        });
    });

    describe('Class Properties and Methods', () => {
        test('should have correct class name', () => {
            const instance = SingletonStatusManager.getInstance();
            
            expect(instance.constructor.name).toBe('SingletonStatusManager');
        });

        test('should be instance of SingletonStatusManager', () => {
            const instance = SingletonStatusManager.getInstance();
            
            expect(instance).toBeInstanceOf(SingletonStatusManager);
        });

        test('should have all required methods', () => {
            const instance = SingletonStatusManager.getInstance();
            
            expect(typeof instance.isGettingLocation).toBe('function');
            expect(typeof instance.setGettingLocation).toBe('function');
            expect(typeof instance.toString).toBe('function');
        });

        test('should have static getInstance method', () => {
            expect(typeof SingletonStatusManager.getInstance).toBe('function');
        });

        test('should have static resetInstance method', () => {
            expect(typeof SingletonStatusManager.resetInstance).toBe('function');
        });

        test('should have gettingLocation property', () => {
            const instance = SingletonStatusManager.getInstance();
            
            expect(instance.hasOwnProperty('gettingLocation')).toBe(true);
            expect(typeof instance.gettingLocation).toBe('boolean');
        });
    });
});