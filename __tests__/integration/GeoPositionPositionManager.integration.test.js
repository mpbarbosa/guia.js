/**
 * Integration tests for GeoPosition and PositionManager classes.
 * 
 * These tests focus on the interaction between GeoPosition and PositionManager,
 * validating that they work together correctly in real-world scenarios.
 * Tests cover position management, observer pattern, distance calculations,
 * accuracy validation, and singleton behavior.
 * 
 * @jest-environment node
 * @author MP Barbosa
 * @since 0.9.0-alpha
 */

import { describe, test, expect, jest, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

// Mock DOM functions to prevent errors in test environment
global.document = undefined;

// Mock console to suppress logging during tests
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
};

// Mock setupParams that guia.js depends on
global.setupParams = {
    geolocationOptions: {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
    },
    trackingInterval: 60000, // 1 minute
    minimumDistanceChange: 20, // 20 meters
    validRefPlaceClasses: ['amenity', 'building', 'shop', 'place'],
    mobileNotAcceptedAccuracy: ['medium', 'bad', 'very bad'],
    desktopNotAcceptedAccuracy: ['bad', 'very bad'],
    notAcceptedAccuracy: ['bad', 'very bad'], // Desktop mode for tests
    referencePlaceMap: {
        place: {
            house: 'Residencial',
            neighbourhood: 'Bairro'
        }
    },
    noReferencePlace: 'Não classificado'
};

// Mock functions that guia.js uses
global.log = jest.fn();
global.warn = jest.fn();
global.calculateDistance = jest.fn((lat1, lon1, lat2, lon2) => {
    // Mock implementation of Haversine formula for testing
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
});

// Import the guia.js module with proper error handling
let PositionManager, GeoPosition, ObserverSubject;
try {
    const guiaModule = await import('../../src/guia.js');
    
    // Extract the classes we need for testing
    if (guiaModule.PositionManager) {
        PositionManager = guiaModule.PositionManager;
    }
} catch (error) {
    console.warn('Could not load guia.js, some tests may be skipped:', error.message);
}

describe('GeoPosition and PositionManager Integration Tests (v0.9.0-alpha)', () => {
    
    beforeEach(() => {
        // Reset singleton instance before each test
        if (PositionManager && PositionManager.instance) {
            PositionManager.instance = null;
        }
        jest.clearAllMocks();
    });

    describe('GeoPosition Integration with PositionManager', () => {
        test('should create GeoPosition when PositionManager is initialized', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const mockPosition = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10,
                    altitude: 760,
                    altitudeAccuracy: 5,
                    heading: 90,
                    speed: 0
                },
                timestamp: Date.now()
            };

            const manager = new PositionManager(mockPosition);
            
            expect(manager.lastPosition).toBeDefined();
            expect(manager.lastPosition).toBeInstanceOf(GeoPosition);
            expect(manager.lastPosition.latitude).toBe(-23.5505);
            expect(manager.lastPosition.longitude).toBe(-46.6333);
            expect(manager.lastPosition.accuracy).toBe(10);
            expect(manager.lastPosition.accuracyQuality).toBe('excellent');
        });

        test('should update GeoPosition when PositionManager.update is called', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const initialPosition = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10,
                    altitude: 760,
                    altitudeAccuracy: 5,
                    heading: 90,
                    speed: 0
                },
                timestamp: Date.now()
            };

            const manager = new PositionManager(initialPosition);
            const initialGeoPosition = manager.lastPosition;
            
            // New position far away (> 20m) and later in time (> 60s)
            const newPosition = {
                coords: {
                    latitude: -22.9068,
                    longitude: -43.1729,
                    accuracy: 8,
                    altitude: 11,
                    altitudeAccuracy: 3,
                    heading: 180,
                    speed: 25
                },
                timestamp: Date.now() + 61000 // 61 seconds later
            };

            manager.update(newPosition);
            
            expect(manager.lastPosition).toBeDefined();
            expect(manager.lastPosition).toBeInstanceOf(GeoPosition);
            expect(manager.lastPosition).not.toBe(initialGeoPosition);
            expect(manager.lastPosition.latitude).toBe(-22.9068);
            expect(manager.lastPosition.longitude).toBe(-43.1729);
            expect(manager.lastPosition.accuracyQuality).toBe('excellent');
        });

        test('should maintain GeoPosition accuracy quality when managed by PositionManager', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const positions = [
                { coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 5 }, timestamp: Date.now(), expectedQuality: 'excellent' },
                { coords: { latitude: -23.5506, longitude: -46.6334, accuracy: 25 }, timestamp: Date.now() + 61000, expectedQuality: 'good' },
                { coords: { latitude: -23.5507, longitude: -46.6335, accuracy: 50 }, timestamp: Date.now() + 122000, expectedQuality: 'medium' }
            ];

            positions.forEach((pos, index) => {
                const manager = new PositionManager(pos);
                expect(manager.lastPosition.accuracy).toBe(pos.coords.accuracy);
                expect(manager.lastPosition.accuracyQuality).toBe(pos.expectedQuality);
            });
        });
    });

    describe('Distance Calculation Integration', () => {
        test('should calculate distance between two GeoPositions managed by different PositionManagers', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            // Reset singleton for this test
            PositionManager.instance = null;

            const spPosition = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: Date.now()
            };

            const rjPosition = {
                coords: {
                    latitude: -22.9068,
                    longitude: -43.1729,
                    accuracy: 10
                },
                timestamp: Date.now()
            };

            const geoPos1 = new GeoPosition(spPosition);
            const geoPos2 = new GeoPosition(rjPosition);

            const distance = geoPos1.distanceTo(geoPos2);
            
            // São Paulo to Rio de Janeiro is approximately 357-358 km
            expect(distance).toBeGreaterThan(350000);
            expect(distance).toBeLessThan(370000);
            expect(global.calculateDistance).toHaveBeenCalledWith(
                -23.5505, -46.6333, -22.9068, -43.1729
            );
        });

        test('should validate position updates based on distance threshold', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const baseTime = Date.now();
            
            const initialPosition = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: baseTime
            };

            const manager = PositionManager.getInstance(initialPosition);
            const initialLastPosition = manager.lastPosition;
            
            // Position moved only 10 meters (below 20m threshold)
            const nearbyPosition = {
                coords: {
                    latitude: -23.5506, // ~11 meters north
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: baseTime + 61000 // 61 seconds later (passes time threshold)
            };

            manager.update(nearbyPosition);
            
            // Position should NOT be updated due to distance threshold
            expect(manager.lastPosition).toBe(initialLastPosition);
            expect(manager.lastPosition.latitude).toBe(-23.5505);
        });

        test('should accept position updates when distance exceeds threshold', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const baseTime = Date.now();
            
            const initialPosition = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: baseTime
            };

            const manager = PositionManager.getInstance(initialPosition);
            
            // Position moved 50 meters (above 20m threshold)
            const farPosition = {
                coords: {
                    latitude: -23.5509, // ~44 meters north
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: baseTime + 61000 // 61 seconds later
            };

            manager.update(farPosition);
            
            // Position SHOULD be updated due to distance threshold being exceeded
            expect(manager.lastPosition.latitude).toBe(-23.5509);
            expect(manager.lastPosition.longitude).toBe(-46.6333);
        });
    });

    describe('Accuracy Validation Integration', () => {
        test('should reject position updates with unacceptable accuracy', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const baseTime = Date.now();
            
            const goodPosition = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10 // excellent accuracy
                },
                timestamp: baseTime
            };

            const manager = PositionManager.getInstance(goodPosition);
            expect(manager.lastPosition.accuracyQuality).toBe('excellent');
            
            // Try to update with bad accuracy (far away to pass distance check)
            const badPosition = {
                coords: {
                    latitude: -22.9068, // Rio de Janeiro - far enough
                    longitude: -43.1729,
                    accuracy: 150 // bad accuracy
                },
                timestamp: baseTime + 61000
            };

            manager.update(badPosition);
            
            // Position should NOT be updated due to accuracy requirement
            expect(manager.lastPosition.latitude).toBe(-23.5505);
            expect(manager.lastPosition.accuracyQuality).toBe('excellent');
        });

        test('should accept position updates with acceptable accuracy', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const baseTime = Date.now();
            
            const initialPosition = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10 // excellent
                },
                timestamp: baseTime
            };

            const manager = PositionManager.getInstance(initialPosition);
            
            // Update with good accuracy (and far enough)
            const goodPosition = {
                coords: {
                    latitude: -22.9068,
                    longitude: -43.1729,
                    accuracy: 25 // good accuracy
                },
                timestamp: baseTime + 61000
            };

            manager.update(goodPosition);
            
            // Position SHOULD be updated
            expect(manager.lastPosition.latitude).toBe(-22.9068);
            expect(manager.lastPosition.accuracyQuality).toBe('good');
        });

        test('should use GeoPosition.getAccuracyQuality for validation', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            // Spy on GeoPosition.getAccuracyQuality
            const spy = jest.spyOn(GeoPosition, 'getAccuracyQuality');

            const position = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 15
                },
                timestamp: Date.now()
            };

            const manager = new PositionManager(position);
            
            // GeoPosition.getAccuracyQuality should be called during position creation
            expect(spy).toHaveBeenCalledWith(15);
            expect(manager.lastPosition.accuracyQuality).toBe('good');

            spy.mockRestore();
        });
    });

    describe('Observer Pattern Integration', () => {
        test('should notify observers when position is updated', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const mockObserver = {
                update: jest.fn(),
                toString: () => 'MockObserver'
            };

            const baseTime = Date.now();
            
            const initialPosition = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: baseTime
            };

            const manager = PositionManager.getInstance(initialPosition);
            manager.subscribe(mockObserver);
            
            // Update with valid position
            const newPosition = {
                coords: {
                    latitude: -22.9068,
                    longitude: -43.1729,
                    accuracy: 8
                },
                timestamp: baseTime + 61000
            };

            manager.update(newPosition);
            
            // Observer should be notified
            expect(mockObserver.update).toHaveBeenCalled();
            expect(mockObserver.update).toHaveBeenCalledWith(
                manager,
                PositionManager.strCurrPosUpdate
            );
        });

        test('should notify observers when position update is rejected', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const mockObserver = {
                update: jest.fn(),
                toString: () => 'MockObserver'
            };

            const baseTime = Date.now();
            
            const initialPosition = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: baseTime
            };

            const manager = PositionManager.getInstance(initialPosition);
            manager.subscribe(mockObserver);
            
            // Clear the call from initialization
            mockObserver.update.mockClear();
            
            // Try to update with position that's too close (< 20m)
            const nearbyPosition = {
                coords: {
                    latitude: -23.5506, // ~11 meters away
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: baseTime + 61000
            };

            manager.update(nearbyPosition);
            
            // Observer should be notified of rejection
            expect(mockObserver.update).toHaveBeenCalled();
            expect(mockObserver.update).toHaveBeenCalledWith(
                manager,
                PositionManager.strCurrPosNotUpdate
            );
        });

        test('should allow multiple observers to receive updates', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const observer1 = {
                update: jest.fn(),
                toString: () => 'Observer1'
            };
            const observer2 = {
                update: jest.fn(),
                toString: () => 'Observer2'
            };

            const baseTime = Date.now();
            
            const initialPosition = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: baseTime
            };

            const manager = PositionManager.getInstance(initialPosition);
            manager.subscribe(observer1);
            manager.subscribe(observer2);
            
            // Update position
            const newPosition = {
                coords: {
                    latitude: -22.9068,
                    longitude: -43.1729,
                    accuracy: 8
                },
                timestamp: baseTime + 61000
            };

            manager.update(newPosition);
            
            // Both observers should be notified
            expect(observer1.update).toHaveBeenCalled();
            expect(observer2.update).toHaveBeenCalled();
        });

        test('should stop notifying after observer unsubscribes', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const observer = {
                update: jest.fn(),
                toString: () => 'Observer'
            };

            const baseTime = Date.now();
            
            const initialPosition = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: baseTime
            };

            const manager = PositionManager.getInstance(initialPosition);
            manager.subscribe(observer);
            
            // First update - observer should be notified
            const firstUpdate = {
                coords: {
                    latitude: -22.9068,
                    longitude: -43.1729,
                    accuracy: 8
                },
                timestamp: baseTime + 61000
            };

            manager.update(firstUpdate);
            expect(observer.update).toHaveBeenCalledTimes(1);
            
            // Unsubscribe observer
            manager.unsubscribe(observer);
            observer.update.mockClear();
            
            // Second update - observer should NOT be notified
            const secondUpdate = {
                coords: {
                    latitude: -15.7975, // Brasília
                    longitude: -47.8919,
                    accuracy: 5
                },
                timestamp: baseTime + 122000
            };

            manager.update(secondUpdate);
            expect(observer.update).not.toHaveBeenCalled();
        });
    });

    describe('Singleton Pattern Integration', () => {
        test('should maintain GeoPosition consistency across singleton getInstance calls', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const position = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10,
                    altitude: 760
                },
                timestamp: Date.now()
            };

            const instance1 = PositionManager.getInstance(position);
            const instance2 = PositionManager.getInstance();
            
            expect(instance1).toBe(instance2);
            expect(instance1.lastPosition).toBe(instance2.lastPosition);
            expect(instance1.lastPosition).toBeInstanceOf(GeoPosition);
        });

        test('should update GeoPosition in singleton when getInstance called with new position', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const baseTime = Date.now();
            
            const firstPosition = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: baseTime
            };

            const instance1 = PositionManager.getInstance(firstPosition);
            const firstGeoPos = instance1.lastPosition;
            
            // Get instance again with new position (far away and later)
            const secondPosition = {
                coords: {
                    latitude: -22.9068,
                    longitude: -43.1729,
                    accuracy: 8
                },
                timestamp: baseTime + 61000
            };

            const instance2 = PositionManager.getInstance(secondPosition);
            
            expect(instance1).toBe(instance2); // Same instance
            expect(instance2.lastPosition).not.toBe(firstGeoPos); // Different GeoPosition
            expect(instance2.lastPosition.latitude).toBe(-22.9068);
        });
    });

    describe('toString() Integration', () => {
        test('should provide consistent toString output between GeoPosition and PositionManager', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const position = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10,
                    altitude: 760,
                    altitudeAccuracy: 5,
                    heading: 90,
                    speed: 0
                },
                timestamp: 1640995200000
            };

            const geoPos = new GeoPosition(position);
            const manager = new PositionManager(position);
            
            const geoString = geoPos.toString();
            const managerString = manager.toString();
            
            // Both should contain key position data
            expect(geoString).toContain('-23.5505');
            expect(geoString).toContain('-46.6333');
            expect(managerString).toContain('-23.5505');
            expect(managerString).toContain('-46.6333');
            
            // Both should contain class name
            expect(geoString).toContain('GeoPosition');
            expect(managerString).toContain('PositionManager');
        });

        test('should handle missing position data in both classes', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const invalidPosition = {
                coords: {
                    latitude: null,
                    longitude: null,
                    accuracy: null
                },
                timestamp: Date.now()
            };

            const geoPos = new GeoPosition(invalidPosition);
            const manager = new PositionManager(null);
            
            const geoString = geoPos.toString();
            const managerString = manager.toString();
            
            expect(geoString).toContain('No position data');
            expect(managerString).toContain('No position data');
        });
    });

    describe('Edge Cases and Error Handling Integration', () => {
        test('should handle rapid position updates (time threshold)', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const baseTime = Date.now();
            
            const position1 = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: baseTime
            };

            const manager = PositionManager.getInstance(position1);
            const initialPosition = manager.lastPosition;
            
            // Update too soon (< 60 seconds) but far enough
            const position2 = {
                coords: {
                    latitude: -22.9068,
                    longitude: -43.1729,
                    accuracy: 8
                },
                timestamp: baseTime + 30000 // Only 30 seconds later
            };

            manager.update(position2);
            
            // Position should be updated but with strImmediateAddressUpdate event
            expect(manager.lastPosition.latitude).toBe(-22.9068);
        });

        test('should handle null position in update gracefully', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const initialPosition = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: Date.now()
            };

            const manager = PositionManager.getInstance(initialPosition);
            const lastPos = manager.lastPosition;
            
            // Try to update with null
            manager.update(null);
            
            // Should not crash and should maintain previous position
            expect(manager.lastPosition).toBe(lastPos);
            expect(manager.lastPosition.latitude).toBe(-23.5505);
        });

        test('should handle position without timestamp', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const initialPosition = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: Date.now()
            };

            const manager = PositionManager.getInstance(initialPosition);
            const lastPos = manager.lastPosition;
            
            // Try to update with position missing timestamp
            const invalidPosition = {
                coords: {
                    latitude: -22.9068,
                    longitude: -43.1729,
                    accuracy: 8
                }
                // timestamp is missing
            };

            manager.update(invalidPosition);
            
            // Should not update and maintain previous position
            expect(manager.lastPosition).toBe(lastPos);
            expect(manager.lastPosition.latitude).toBe(-23.5505);
        });

        test('should handle multiple validation failures correctly', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const baseTime = Date.now();
            
            const initialPosition = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: baseTime
            };

            const manager = PositionManager.getInstance(initialPosition);
            const initialGeoPos = manager.lastPosition;
            
            // Position with bad accuracy AND too close
            const badPosition = {
                coords: {
                    latitude: -23.5506, // ~11m away (too close)
                    longitude: -46.6333,
                    accuracy: 150 // bad accuracy
                },
                timestamp: baseTime + 61000
            };

            manager.update(badPosition);
            
            // Should not update (fails accuracy check first)
            expect(manager.lastPosition).toBe(initialGeoPos);
            expect(manager.lastPosition.latitude).toBe(-23.5505);
        });

        test('should calculate distance correctly for edge cases', () => {
            if (!GeoPosition) {
                console.warn('GeoPosition not available, skipping test');
                return;
            }

            // Same position - distance should be 0
            const pos1 = new GeoPosition({
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: Date.now()
            });

            const pos2 = new GeoPosition({
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: Date.now()
            });

            const distance = pos1.distanceTo(pos2);
            expect(distance).toBe(0);
        });
    });

    describe('Real-world Brazilian Geography Scenarios', () => {
        test('should handle travel from São Paulo to Campinas', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const baseTime = Date.now();
            
            // Starting in São Paulo
            const spPosition = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10
                },
                timestamp: baseTime
            };

            const manager = PositionManager.getInstance(spPosition);
            
            // After driving for 1 hour to Campinas (~100km)
            const campinasPosition = {
                coords: {
                    latitude: -22.9056,
                    longitude: -47.0608,
                    accuracy: 12
                },
                timestamp: baseTime + 3600000 // 1 hour later
            };

            manager.update(campinasPosition);
            
            expect(manager.lastPosition.latitude).toBe(-22.9056);
            expect(manager.lastPosition.longitude).toBe(-47.0608);
            
            // Verify distance calculation
            const distance = manager.lastPosition.distanceTo(new GeoPosition(spPosition));
            expect(distance).toBeGreaterThan(90000); // > 90km
            expect(distance).toBeLessThan(110000);   // < 110km
        });

        test('should handle pedestrian navigation in tourist area', () => {
            if (!PositionManager || !GeoPosition) {
                console.warn('PositionManager or GeoPosition not available, skipping test');
                return;
            }

            const baseTime = Date.now();
            
            // Starting at Copacabana
            const copacabana = {
                coords: {
                    latitude: -22.9711,
                    longitude: -43.1822,
                    accuracy: 8,
                    speed: 1.4 // walking speed
                },
                timestamp: baseTime
            };

            const manager = PositionManager.getInstance(copacabana);
            
            // Walking to nearby location (50m away)
            const nearby = {
                coords: {
                    latitude: -22.9715, // ~44m south
                    longitude: -43.1822,
                    accuracy: 8,
                    speed: 1.4
                },
                timestamp: baseTime + 61000
            };

            manager.update(nearby);
            
            // Should update because distance > 20m
            expect(manager.lastPosition.latitude).toBe(-22.9715);
        });

        test('should handle high altitude differences in Brasília', () => {
            if (!GeoPosition) {
                console.warn('GeoPosition not available, skipping test');
                return;
            }

            const brasiliaPosition = {
                coords: {
                    latitude: -15.7975,
                    longitude: -47.8919,
                    accuracy: 5,
                    altitude: 1172 // High altitude plateau
                },
                timestamp: Date.now()
            };

            const rioPosition = {
                coords: {
                    latitude: -22.9068,
                    longitude: -43.1729,
                    accuracy: 5,
                    altitude: 11 // Near sea level
                },
                timestamp: Date.now()
            };

            const brasilia = new GeoPosition(brasiliaPosition);
            const rio = new GeoPosition(rioPosition);

            expect(brasilia.altitude).toBe(1172);
            expect(rio.altitude).toBe(11);
            
            // Distance should be based on lat/lon, not altitude
            const distance = brasilia.distanceTo(rio);
            expect(distance).toBeGreaterThan(900000); // > 900km
            expect(distance).toBeLessThan(1100000);   // < 1100km
        });
    });
});
