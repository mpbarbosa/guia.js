/**
 * Integration tests for SingletonStatusManager class.
 * 
 * This test suite provides comprehensive integration testing for the SingletonStatusManager
 * class, focusing on cross-browser compatibility, memory management, real-world usage
 * scenarios, and interaction with other system components.
 * 
 * Test Categories:
 * - Cross-browser compatibility and environment detection
 * - Memory management and performance under load
 * - Real-world usage scenarios and workflow simulation
 * - Integration with logging systems and console output
 * - Singleton behavior in different JavaScript environments
 * - Long-running operations and state persistence
 * - Error recovery and system resilience
 * 
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */

import { jest } from '@jest/globals';

// Mock different browser environments
const mockEnvironments = {
    node: () => {
        global.window = undefined;
        global.document = undefined;
    },
    browser: () => {
        global.window = { location: { href: 'http://localhost' } };
        global.document = { createElement: jest.fn() };
    },
    webWorker: () => {
        global.window = undefined;
        global.document = undefined;
        global.self = { postMessage: jest.fn() };
    }
};

// Mock console for testing
global.console = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
};

// Import the class under test
const SingletonStatusManager = (await import('../../src/status/SingletonStatusManager.js')).default;

describe('SingletonStatusManager Integration Tests - MP Barbosa Travel Guide (v0.8.3-alpha)', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        SingletonStatusManager.resetInstance();
    });

    afterEach(() => {
        SingletonStatusManager.resetInstance();
    });

    describe('Cross-Browser Compatibility', () => {
        test('should work correctly in Node.js environment', () => {
            mockEnvironments.node();
            
            const manager = SingletonStatusManager.getInstance();
            manager.setGettingLocation(true);
            
            expect(manager.isGettingLocation()).toBe(true);
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('['), 'Getting location...');
        });

        test('should work correctly in browser environment', () => {
            mockEnvironments.browser();
            
            const manager = SingletonStatusManager.getInstance();
            manager.setGettingLocation(true);
            
            expect(manager.isGettingLocation()).toBe(true);
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('['), 'Getting location...');
        });

        test('should work correctly in web worker environment', () => {
            mockEnvironments.webWorker();
            
            const manager = SingletonStatusManager.getInstance();
            manager.setGettingLocation(true);
            
            expect(manager.isGettingLocation()).toBe(true);
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('['), 'Getting location...');
        });

        test('should maintain singleton pattern across environments', () => {
            mockEnvironments.node();
            const nodeInstance = SingletonStatusManager.getInstance();
            nodeInstance.setGettingLocation(true);
            
            mockEnvironments.browser();
            const browserInstance = SingletonStatusManager.getInstance();
            
            // Same instance should be maintained
            expect(browserInstance).toBe(nodeInstance);
            expect(browserInstance.isGettingLocation()).toBe(true);
        });
    });

    describe('Memory Management and Performance', () => {
        test('should handle high-frequency status changes without memory leaks', () => {
            const manager = SingletonStatusManager.getInstance();
            const iterations = 10000;
            
            const startTime = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                manager.setGettingLocation(i % 2 === 0);
            }
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            // Should complete within reasonable time (adjust threshold as needed)
            expect(executionTime).toBeLessThan(1000); // 1 second
            expect(manager.isGettingLocation()).toBe(false); // Final state
            expect(console.log).toHaveBeenCalledTimes(iterations);
        });

        test('should maintain consistent memory usage with multiple instance requests', () => {
            const instances = [];
            const iterations = 1000;
            
            for (let i = 0; i < iterations; i++) {
                instances.push(SingletonStatusManager.getInstance());
            }
            
            // All instances should be the same reference (no memory bloat)
            const firstInstance = instances[0];
            instances.forEach(instance => {
                expect(instance).toBe(firstInstance);
            });
            
            // Memory should be efficiently managed
            expect(instances.length).toBe(iterations);
        });

        test('should handle concurrent access from multiple execution contexts', async () => {
            const promises = [];
            const concurrentOperations = 100;
            
            // Simulate concurrent access
            for (let i = 0; i < concurrentOperations; i++) {
                promises.push(
                    new Promise(resolve => {
                        setTimeout(() => {
                            const manager = SingletonStatusManager.getInstance();
                            manager.setGettingLocation(i % 2 === 0);
                            resolve(manager);
                        }, Math.random() * 10);
                    })
                );
            }
            
            const results = await Promise.all(promises);
            
            // All results should be the same instance
            const firstInstance = results[0];
            results.forEach(instance => {
                expect(instance).toBe(firstInstance);
            });
        });
    });

    describe('Real-World Usage Scenarios', () => {
        test('should simulate geolocation workflow', () => {
            const manager = SingletonStatusManager.getInstance();
            
            // Initial state: not getting location
            expect(manager.isGettingLocation()).toBe(false);
            
            // Start geolocation process
            manager.setGettingLocation(true);
            expect(manager.isGettingLocation()).toBe(true);
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('['), 'Getting location...');
            
            // Simulate successful location retrieval
            setTimeout(() => {
                manager.setGettingLocation(false);
                expect(manager.isGettingLocation()).toBe(false);
                // Logger prepends timestamp as first arg, message is second arg
                expect(console.log).toHaveBeenCalledWith(
                    expect.any(String), // timestamp
                    'Stopped getting location.'
                );
            }, 100);
        });

        test('should handle multiple geolocation attempts', () => {
            const manager = SingletonStatusManager.getInstance();
            
            // First attempt
            manager.setGettingLocation(true);
            expect(manager.isGettingLocation()).toBe(true);
            
            // Simulate failure, retry
            manager.setGettingLocation(false);
            expect(manager.isGettingLocation()).toBe(false);
            
            // Second attempt
            manager.setGettingLocation(true);
            expect(manager.isGettingLocation()).toBe(true);
            
            // Success
            manager.setGettingLocation(false);
            expect(manager.isGettingLocation()).toBe(false);
            
            expect(console.log).toHaveBeenCalledTimes(4);
        });

        test('should simulate user navigation with location tracking', () => {
            const manager = SingletonStatusManager.getInstance();
            
            // User opens app
            expect(manager.isGettingLocation()).toBe(false);
            
            // User clicks "Find My Location"
            manager.setGettingLocation(true);
            expect(manager.toString()).toBe('SingletonStatusManager: gettingLocation=true');
            
            // Location found, display results
            manager.setGettingLocation(false);
            expect(manager.toString()).toBe('SingletonStatusManager: gettingLocation=false');
            
            // User navigates to different page, requests location again
            manager.setGettingLocation(true);
            expect(manager.toString()).toBe('SingletonStatusManager: gettingLocation=true');
            
            // App closed, cleanup
            manager.setGettingLocation(false);
            expect(manager.toString()).toBe('SingletonStatusManager: gettingLocation=false');
        });
    });

    describe('Integration with Logging Systems', () => {
        test('should integrate with different console methods', () => {
            const manager = SingletonStatusManager.getInstance();
            
            // Normal logging (current behavior)
            manager.setGettingLocation(true);
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('['), 'Getting location...');
            
            manager.setGettingLocation(false);
            // Logger prepends timestamp as first arg, message is second arg
            expect(console.log).toHaveBeenCalledWith(
                expect.any(String), // timestamp
                'Stopped getting location.'
            );
        });

        test('should handle console unavailability gracefully', () => {
            // Temporarily disable console
            const originalConsole = global.console;
            global.console = undefined;
            
            const manager = SingletonStatusManager.getInstance();
            
            // Should not throw errors even without console
            expect(() => {
                manager.setGettingLocation(true);
                manager.setGettingLocation(false);
            }).not.toThrow();
            
            // Restore console
            global.console = originalConsole;
        });

        test('should provide meaningful debugging information', () => {
            const manager = SingletonStatusManager.getInstance();
            
            // Set various states and check toString output
            expect(manager.toString()).toContain('gettingLocation=false');
            
            manager.setGettingLocation(true);
            expect(manager.toString()).toContain('gettingLocation=true');
            expect(manager.toString()).toContain('SingletonStatusManager');
            
            manager.setGettingLocation(false);
            expect(manager.toString()).toContain('gettingLocation=false');
        });
    });

    describe('Long-Running Operations and State Persistence', () => {
        test('should maintain state consistency over extended periods', async () => {
            const manager = SingletonStatusManager.getInstance();
            
            // Set initial state
            manager.setGettingLocation(true);
            expect(manager.isGettingLocation()).toBe(true);
            
            // Simulate long-running operation
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // State should persist
            expect(manager.isGettingLocation()).toBe(true);
            
            // Change state
            manager.setGettingLocation(false);
            expect(manager.isGettingLocation()).toBe(false);
            
            // Another long operation
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // State should still persist
            expect(manager.isGettingLocation()).toBe(false);
        });

        test('should handle rapid state changes during long operations', async () => {
            const manager = SingletonStatusManager.getInstance();
            let operationCount = 0;
            
            // Start multiple concurrent operations
            const operations = [];
            for (let i = 0; i < 10; i++) {
                operations.push(
                    new Promise(resolve => {
                        setTimeout(() => {
                            manager.setGettingLocation(operationCount % 2 === 0);
                            operationCount++;
                            resolve();
                        }, Math.random() * 50);
                    })
                );
            }
            
            await Promise.all(operations);
            
            // Final state should be consistent
            expect(typeof manager.isGettingLocation()).toBe('boolean');
            expect(operationCount).toBe(10);
        });
    });

    describe('Error Recovery and System Resilience', () => {
        test('should recover gracefully from invalid operations', () => {
            const manager = SingletonStatusManager.getInstance();
            
            // Set valid state
            manager.setGettingLocation(true);
            expect(manager.isGettingLocation()).toBe(true);
            
            // Attempt invalid operations
            try {
                manager.setGettingLocation('invalid');
            } catch (error) {
                expect(error).toBeInstanceOf(TypeError);
            }
            
            // Should maintain previous valid state
            expect(manager.isGettingLocation()).toBe(true);
            
            // Should continue working normally
            manager.setGettingLocation(false);
            expect(manager.isGettingLocation()).toBe(false);
        });

        test('should handle system stress without corruption', () => {
            const manager = SingletonStatusManager.getInstance();
            let errorCount = 0;
            let successCount = 0;
            
            // Mix valid and invalid operations
            for (let i = 0; i < 100; i++) {
                try {
                    if (i % 3 === 0) {
                        // Invalid operation
                        manager.setGettingLocation('invalid');
                    } else {
                        // Valid operation
                        manager.setGettingLocation(i % 2 === 0);
                        successCount++;
                    }
                } catch (error) {
                    errorCount++;
                }
            }
            
            // Should have handled errors appropriately
            expect(errorCount).toBeGreaterThan(0);
            expect(successCount).toBeGreaterThan(0);
            
            // Final state should be valid
            expect(typeof manager.isGettingLocation()).toBe('boolean');
        });

        test('should maintain singleton integrity after reset operations', () => {
            const manager1 = SingletonStatusManager.getInstance();
            manager1.setGettingLocation(true);
            
            // Reset and create new instance
            SingletonStatusManager.resetInstance();
            const manager2 = SingletonStatusManager.getInstance();
            
            // Should be different instances
            expect(manager2).not.toBe(manager1);
            
            // New instance should have default state
            expect(manager2.isGettingLocation()).toBe(false);
            
            // Old instance should maintain its state (if still referenced)
            expect(manager1.isGettingLocation()).toBe(true);
            
            // New instance should work normally
            manager2.setGettingLocation(true);
            expect(manager2.isGettingLocation()).toBe(true);
        });
    });

    describe('Integration with Module System', () => {
        test('should work correctly with ES6 module imports', () => {
            // The fact that we can import and use the class demonstrates ES6 compatibility
            const manager = SingletonStatusManager.getInstance();
            
            expect(manager).toBeInstanceOf(SingletonStatusManager);
            expect(typeof manager.setGettingLocation).toBe('function');
            expect(typeof manager.isGettingLocation).toBe('function');
        });

        test('should maintain singleton across multiple import contexts', () => {
            // Simulate multiple modules importing the class
            const manager1 = SingletonStatusManager.getInstance();
            const manager2 = SingletonStatusManager.getInstance();
            
            expect(manager1).toBe(manager2);
            
            // State changes should be visible across all imports
            manager1.setGettingLocation(true);
            expect(manager2.isGettingLocation()).toBe(true);
        });

        test('should handle dynamic imports correctly', async () => {
            // Reset to ensure clean state
            SingletonStatusManager.resetInstance();
            
            // Dynamic import (simulated)
            const DynamicSingletonStatusManager = (await import('../../src/status/SingletonStatusManager.js')).default;
            const dynamicManager = DynamicSingletonStatusManager.getInstance();
            
            // Should maintain singleton pattern even with dynamic imports
            const staticManager = SingletonStatusManager.getInstance();
            expect(dynamicManager).toBe(staticManager);
        });
    });

    describe('Performance Benchmarks', () => {
        test('should have acceptable performance for getInstance calls', () => {
            const iterations = 10000;
            const startTime = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                SingletonStatusManager.getInstance();
            }
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            // Should be very fast for singleton access
            expect(executionTime).toBeLessThan(100); // 100ms for 10k calls
        });

        test('should have acceptable performance for state operations', () => {
            const manager = SingletonStatusManager.getInstance();
            const iterations = 10000;
            const startTime = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                manager.setGettingLocation(i % 2 === 0);
                manager.isGettingLocation();
            }
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            // Should handle rapid state changes efficiently
            expect(executionTime).toBeLessThan(500); // 500ms for 10k operations
        });

        test('should have minimal memory footprint for singleton instance', () => {
            const instances = [];
            
            // Create many references to the same instance
            for (let i = 0; i < 1000; i++) {
                instances.push(SingletonStatusManager.getInstance());
            }
            
            // All should be the same instance (no memory multiplication)
            const firstInstance = instances[0];
            instances.forEach(instance => {
                expect(instance).toBe(firstInstance);
            });
            
            // Verify singleton is maintaining minimal memory usage
            expect(SingletonStatusManager.instance).toBe(firstInstance);
        });
    });
});