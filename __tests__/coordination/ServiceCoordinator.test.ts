/**
 * @fileoverview Unit tests for ServiceCoordinator class
 * @description Comprehensive test suite for service coordination, lifecycle management,
 * displayer creation, observer wiring, and position tracking
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
global.error = jest.fn();

// Import class under test
let ServiceCoordinator, PositionManager;
try {
    const serviceModule = await import('../../src/coordination/ServiceCoordinator.js');
    const positionManagerModule = await import('../../src/core/PositionManager.js');
    
    ServiceCoordinator = serviceModule.default;
    PositionManager = positionManagerModule.default;
} catch (error) {
    console.warn('Could not load modules:', error.message);
}

/**
 * Helper to create mock GeolocationService
 */
function createMockGeolocationService() {
    return {
        getSingleLocationUpdate: jest.fn(),
        watchCurrentLocation: jest.fn(() => 12345), // Return mock watch ID
        stopTracking: jest.fn(),
        getCurrentPosition: jest.fn()
    };
}

/**
 * Helper to create mock ReverseGeocoder
 */
function createMockReverseGeocoder() {
    return {
        latitude: null,
        longitude: null,
        currentAddress: null,
        enderecoPadronizado: null,
        update: jest.fn(),
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
        fetchAddress: jest.fn().mockResolvedValue()
    };
}

/**
 * Helper to create mock ChangeDetectionCoordinator
 */
function createMockChangeDetectionCoordinator() {
    return {
        setCurrentPosition: jest.fn(),
        setupChangeDetection: jest.fn(),
        setupLogradouroChangeDetection: jest.fn(),
        setupBairroChangeDetection: jest.fn(),
        setupMunicipioChangeDetection: jest.fn()
    };
}

/**
 * Helper to create mock ObserverSubject
 */
function createMockObserverSubject() {
    return {
        observers: [],
        functionObservers: [],
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
        notify: jest.fn(),
        notifyObservers: jest.fn()
    };
}

/**
 * Helper to create mock DisplayerFactory
 */
function createMockDisplayerFactory() {
    return {
        createPositionDisplayer: jest.fn(() => ({
            update: jest.fn(),
            type: 'position'
        })),
        createAddressDisplayer: jest.fn(() => ({
            update: jest.fn(),
            type: 'address'
        })),
        createReferencePlaceDisplayer: jest.fn(() => ({
            update: jest.fn(),
            type: 'referencePlace'
        }))
    };
}

/**
 * Helper to create valid params object
 */
function createValidParams() {
    return {
        geolocationService: createMockGeolocationService(),
        reverseGeocoder: createMockReverseGeocoder(),
        changeDetectionCoordinator: createMockChangeDetectionCoordinator(),
        observerSubject: createMockObserverSubject(),
        displayerFactory: createMockDisplayerFactory()
    };
}

describe('ServiceCoordinator', () => {
    let params;
    let positionManagerInstance;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create fresh params
        params = createValidParams();

        // Get PositionManager singleton and clear its subscribers
        positionManagerInstance = PositionManager.getInstance();
        // Clear any existing subscribers from previous tests
        if (positionManagerInstance._observers) {
            positionManagerInstance._observers = [];
        }
    });

    afterEach(() => {
        // Cleanup PositionManager subscribers
        if (positionManagerInstance && positionManagerInstance._observers) {
            positionManagerInstance._observers = [];
        }
    });

    describe('Constructor', () => {
        test('should create instance with valid parameters', () => {
            const coordinator = new ServiceCoordinator(params);

            expect(coordinator).toBeInstanceOf(ServiceCoordinator);
        });

        test('should throw TypeError if params is null', () => {
            expect(() => {
                new ServiceCoordinator(null);
            }).toThrow(TypeError);
            expect(() => {
                new ServiceCoordinator(null);
            }).toThrow('params object is required');
        });

        test('should throw TypeError if params is undefined', () => {
            expect(() => {
                new ServiceCoordinator(undefined);
            }).toThrow(TypeError);
        });

        test('should throw TypeError if geolocationService is missing', () => {
            delete params.geolocationService;

            expect(() => {
                new ServiceCoordinator(params);
            }).toThrow(TypeError);
            expect(() => {
                new ServiceCoordinator(params);
            }).toThrow('geolocationService is required');
        });

        test('should throw TypeError if reverseGeocoder is missing', () => {
            delete params.reverseGeocoder;

            expect(() => {
                new ServiceCoordinator(params);
            }).toThrow(TypeError);
            expect(() => {
                new ServiceCoordinator(params);
            }).toThrow('reverseGeocoder is required');
        });

        test('should throw TypeError if changeDetectionCoordinator is missing', () => {
            delete params.changeDetectionCoordinator;

            expect(() => {
                new ServiceCoordinator(params);
            }).toThrow(TypeError);
            expect(() => {
                new ServiceCoordinator(params);
            }).toThrow('changeDetectionCoordinator is required');
        });

        test('should throw TypeError if observerSubject is missing', () => {
            delete params.observerSubject;

            expect(() => {
                new ServiceCoordinator(params);
            }).toThrow(TypeError);
            expect(() => {
                new ServiceCoordinator(params);
            }).toThrow('observerSubject is required');
        });

        test('should initialize with null displayers', () => {
            const coordinator = new ServiceCoordinator(params);

            expect(coordinator.getDisplayers()).toBeNull();
        });

        test('should initialize as not initialized', () => {
            const coordinator = new ServiceCoordinator(params);

            expect(coordinator.isInitialized()).toBe(false);
        });

        test('should initialize as not tracking', () => {
            const coordinator = new ServiceCoordinator(params);

            expect(coordinator.isTracking()).toBe(false);
        });

        test('should store all provided services', () => {
            const coordinator = new ServiceCoordinator(params);

            expect(coordinator.getGeolocationService()).toBe(params.geolocationService);
            expect(coordinator.getReverseGeocoder()).toBe(params.reverseGeocoder);
            expect(coordinator.getChangeDetectionCoordinator()).toBe(params.changeDetectionCoordinator);
        });
    });

    describe('createDisplayers()', () => {
        test('should create all three displayers', () => {
            const coordinator = new ServiceCoordinator(params);

            coordinator.createDisplayers('pos-display', 'loc-result', 'addr-display', 'ref-display');
            const displayers = coordinator.getDisplayers();

            expect(displayers).toBeDefined();
            expect(displayers.position).toBeDefined();
            expect(displayers.address).toBeDefined();
            expect(displayers.referencePlace).toBeDefined();
        });

        test('should call factory methods with correct arguments', () => {
            const coordinator = new ServiceCoordinator(params);

            coordinator.createDisplayers('pos-display', 'loc-result', 'addr-display', 'ref-display');

            expect(params.displayerFactory.createPositionDisplayer).toHaveBeenCalledWith('pos-display');
            expect(params.displayerFactory.createAddressDisplayer).toHaveBeenCalledWith('loc-result', 'addr-display');
            expect(params.displayerFactory.createReferencePlaceDisplayer).toHaveBeenCalledWith('ref-display');
        });

        test('should return this for chaining', () => {
            const coordinator = new ServiceCoordinator(params);

            const result = coordinator.createDisplayers('pos-display', 'loc-result', 'addr-display', 'ref-display');

            expect(result).toBe(coordinator);
        });

        test('should store displayers internally', () => {
            const coordinator = new ServiceCoordinator(params);

            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            const stored = coordinator.getDisplayers();

            expect(stored).not.toBeNull();
            expect(stored.position).toBeDefined();
        });

        test('should throw Error if displayerFactory is not configured', () => {
            delete params.displayerFactory;
            const coordinator = new ServiceCoordinator(params);

            expect(() => {
                coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            }).toThrow('displayerFactory not configured');
        });

        test('should handle null element references gracefully', () => {
            const coordinator = new ServiceCoordinator(params);

            expect(() => {
                coordinator.createDisplayers(null, null, null);
            }).not.toThrow();
        });
    });

    describe('wireObservers()', () => {
        test('should wire position displayer to PositionManager', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');

            const subscribeSpy = jest.spyOn(positionManagerInstance, 'subscribe');
            coordinator.wireObservers();

            expect(subscribeSpy).toHaveBeenCalled();
        });

        test('should wire reverse geocoder to PositionManager', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');

            const subscribeSpy = jest.spyOn(positionManagerInstance, 'subscribe');
            coordinator.wireObservers();

            expect(subscribeSpy).toHaveBeenCalledWith(params.reverseGeocoder);
        });

        test('should mark as initialized after wiring', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');

            coordinator.wireObservers();

            expect(coordinator.isInitialized()).toBe(true);
        });

        test('should return this for chaining', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');

            const result = coordinator.wireObservers();

            expect(result).toBe(coordinator);
        });

        test('should throw Error if displayers not created yet', () => {
            const coordinator = new ServiceCoordinator(params);

            expect(() => {
                coordinator.wireObservers();
            }).toThrow('Displayers must be created before wiring observers');
        });

        test('should handle null position displayer gracefully', () => {
            params.displayerFactory.createPositionDisplayer.mockReturnValue(null);
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');

            expect(() => {
                coordinator.wireObservers();
            }).not.toThrow();
        });
    });

    describe('getSingleLocationUpdate()', () => {
        test('should call geolocationService.getSingleLocationUpdate', () => {
            const coordinator = new ServiceCoordinator(params);
            const mockPosition = {
                coords: { latitude: -23.550520, longitude: -46.633309 }
            };
            params.geolocationService.getSingleLocationUpdate.mockResolvedValue(mockPosition);

            coordinator.getSingleLocationUpdate();

            expect(params.geolocationService.getSingleLocationUpdate).toHaveBeenCalled();
        });

        test('should return Promise', () => {
            const coordinator = new ServiceCoordinator(params);
            params.geolocationService.getSingleLocationUpdate.mockResolvedValue({});

            const result = coordinator.getSingleLocationUpdate();

            expect(result).toBeInstanceOf(Promise);
        });

        test('should update changeDetectionCoordinator on success', async () => {
            const coordinator = new ServiceCoordinator(params);
            const mockPosition = {
                coords: { latitude: -23.550520, longitude: -46.633309 }
            };
            params.geolocationService.getSingleLocationUpdate.mockResolvedValue(mockPosition);

            await coordinator.getSingleLocationUpdate();

            expect(params.changeDetectionCoordinator.setCurrentPosition).toHaveBeenCalledWith(mockPosition);
        });

        test('should update reverseGeocoder coordinates on success', async () => {
            const coordinator = new ServiceCoordinator(params);
            const mockPosition = {
                coords: { latitude: -23.550520, longitude: -46.633309 }
            };
            params.geolocationService.getSingleLocationUpdate.mockResolvedValue(mockPosition);

            await coordinator.getSingleLocationUpdate();

            expect(params.reverseGeocoder.latitude).toBe(-23.550520);
            expect(params.reverseGeocoder.longitude).toBe(-46.633309);
        });

        test('should resolve with position on success', async () => {
            const coordinator = new ServiceCoordinator(params);
            const mockPosition = {
                coords: { latitude: -23.550520, longitude: -46.633309 }
            };
            params.geolocationService.getSingleLocationUpdate.mockResolvedValue(mockPosition);

            const result = await coordinator.getSingleLocationUpdate();

            expect(result).toBe(mockPosition);
        });

        test('should reject on geolocation error', async () => {
            const coordinator = new ServiceCoordinator(params);
            const mockError = new Error('Geolocation failed');
            params.geolocationService.getSingleLocationUpdate.mockRejectedValue(mockError);

            await expect(coordinator.getSingleLocationUpdate()).rejects.toThrow('Geolocation failed');
        });

        test('should handle position without coords gracefully', async () => {
            const coordinator = new ServiceCoordinator(params);
            const mockPosition = {}; // Missing coords
            params.geolocationService.getSingleLocationUpdate.mockResolvedValue(mockPosition);

            await expect(coordinator.getSingleLocationUpdate()).resolves.toBe(mockPosition);
        });

        test('should reject if geolocationService is null', async () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator._geolocationService = null;

            await expect(coordinator.getSingleLocationUpdate()).rejects.toThrow('GeolocationService not initialized');
        });
    });

    describe('startTracking()', () => {
        test('should call geolocationService.watchCurrentLocation', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();

            coordinator.startTracking();

            expect(params.geolocationService.watchCurrentLocation).toHaveBeenCalled();
        });

        test('should call changeDetectionCoordinator.setupChangeDetection', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();

            coordinator.startTracking();

            expect(params.changeDetectionCoordinator.setupChangeDetection).toHaveBeenCalled();
        });

        test('should mark as tracking', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();

            coordinator.startTracking();

            expect(coordinator.isTracking()).toBe(true);
        });

        test('should return this for chaining', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();

            const result = coordinator.startTracking();

            expect(result).toBe(coordinator);
        });

        test('should throw Error if geolocationService is null', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();
            coordinator._geolocationService = null;

            expect(() => {
                coordinator.startTracking();
            }).toThrow('GeolocationService not initialized');
        });

        test('should throw Error if observers not wired yet', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');

            expect(() => {
                coordinator.startTracking();
            }).toThrow('Must wire observers before starting tracking');
        });

        test('should store watch ID from geolocation service', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();

            coordinator.startTracking();

            expect(coordinator._watchId).toBe(12345);
        });
    });

    describe('stopTracking()', () => {
        test('should call geolocationService.stopTracking', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();
            coordinator.startTracking();

            coordinator.stopTracking();

            expect(params.geolocationService.stopTracking).toHaveBeenCalled();
        });

        test('should clear watch ID', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();
            coordinator.startTracking();

            coordinator.stopTracking();

            expect(coordinator.isTracking()).toBe(false);
        });

        test('should return this for chaining', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();
            coordinator.startTracking();

            const result = coordinator.stopTracking();

            expect(result).toBe(coordinator);
        });

        test('should be safe to call without tracking active', () => {
            const coordinator = new ServiceCoordinator(params);

            expect(() => {
                coordinator.stopTracking();
            }).not.toThrow();
        });

        test('should handle geolocationService without stopTracking method', () => {
            delete params.geolocationService.stopTracking;
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();
            coordinator.startTracking();

            expect(() => {
                coordinator.stopTracking();
            }).not.toThrow();
        });
    });

    describe('isInitialized()', () => {
        test('should return false initially', () => {
            const coordinator = new ServiceCoordinator(params);

            expect(coordinator.isInitialized()).toBe(false);
        });

        test('should return true after wiring observers', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();

            expect(coordinator.isInitialized()).toBe(true);
        });

        test('should return false after destroy', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();

            coordinator.destroy();

            expect(coordinator.isInitialized()).toBe(false);
        });
    });

    describe('isTracking()', () => {
        test('should return false initially', () => {
            const coordinator = new ServiceCoordinator(params);

            expect(coordinator.isTracking()).toBe(false);
        });

        test('should return true after starting tracking', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();
            coordinator.startTracking();

            expect(coordinator.isTracking()).toBe(true);
        });

        test('should return false after stopping tracking', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();
            coordinator.startTracking();
            coordinator.stopTracking();

            expect(coordinator.isTracking()).toBe(false);
        });
    });

    describe('Getter Methods', () => {
        test('getGeolocationService should return geolocation service', () => {
            const coordinator = new ServiceCoordinator(params);

            expect(coordinator.getGeolocationService()).toBe(params.geolocationService);
        });

        test('getReverseGeocoder should return reverse geocoder', () => {
            const coordinator = new ServiceCoordinator(params);

            expect(coordinator.getReverseGeocoder()).toBe(params.reverseGeocoder);
        });

        test('getChangeDetectionCoordinator should return change detection coordinator', () => {
            const coordinator = new ServiceCoordinator(params);

            expect(coordinator.getChangeDetectionCoordinator()).toBe(params.changeDetectionCoordinator);
        });

        test('getDisplayers should return null initially', () => {
            const coordinator = new ServiceCoordinator(params);

            expect(coordinator.getDisplayers()).toBeNull();
        });

        test('getDisplayers should return created displayers', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');

            const displayers = coordinator.getDisplayers();

            expect(displayers).not.toBeNull();
            expect(displayers.position).toBeDefined();
        });
    });

    describe('destroy()', () => {
        test('should stop tracking if active', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();
            coordinator.startTracking();

            coordinator.destroy();

            expect(params.geolocationService.stopTracking).toHaveBeenCalled();
        });

        test('should release all service references', () => {
            const coordinator = new ServiceCoordinator(params);

            coordinator.destroy();

            expect(coordinator.getGeolocationService()).toBeNull();
            expect(coordinator.getReverseGeocoder()).toBeNull();
            expect(coordinator.getChangeDetectionCoordinator()).toBeNull();
        });

        test('should clear displayers', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');

            coordinator.destroy();

            expect(coordinator.getDisplayers()).toBeNull();
        });

        test('should mark as not initialized', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();

            coordinator.destroy();

            expect(coordinator.isInitialized()).toBe(false);
        });

        test('should be safe to call multiple times', () => {
            const coordinator = new ServiceCoordinator(params);

            expect(() => {
                coordinator.destroy();
                coordinator.destroy();
            }).not.toThrow();
        });
    });

    describe('toString()', () => {
        test('should show not initialized state initially', () => {
            const coordinator = new ServiceCoordinator(params);

            const result = coordinator.toString();

            expect(result).toContain('ServiceCoordinator');
            expect(result).toContain('not initialized');
            expect(result).toContain('not tracking');
            expect(result).toContain('0 displayers');
        });

        test('should show initialized state after wiring', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();

            const result = coordinator.toString();

            expect(result).toContain('initialized');
            expect(result).toContain('5 displayers');  // Updated: now includes SIDRA displayer
        });

        test('should show tracking state with watch ID', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();
            coordinator.startTracking();

            const result = coordinator.toString();

            expect(result).toContain('tracking');
            expect(result).toContain('watchId: 12345');
        });

        test('should reflect state after destroy', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();
            coordinator.destroy();

            const result = coordinator.toString();

            expect(result).toContain('not initialized');
            expect(result).toContain('0 displayers');
        });
    });

    describe('Integration Scenarios', () => {
        test('should support complete initialization workflow', () => {
            const coordinator = new ServiceCoordinator(params);

            // Create displayers
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            const displayers = coordinator.getDisplayers();
            expect(displayers).toBeDefined();
            expect(coordinator.getDisplayers()).not.toBeNull();

            // Wire observers
            coordinator.wireObservers();
            expect(coordinator.isInitialized()).toBe(true);

            // Start tracking
            coordinator.startTracking();
            expect(coordinator.isTracking()).toBe(true);

            // Stop tracking
            coordinator.stopTracking();
            expect(coordinator.isTracking()).toBe(false);

            // Destroy
            coordinator.destroy();
            expect(coordinator.isInitialized()).toBe(false);
        });

        test('should support single location update workflow', async () => {
            const coordinator = new ServiceCoordinator(params);
            const mockPosition = {
                coords: { latitude: -23.550520, longitude: -46.633309 }
            };
            params.geolocationService.getSingleLocationUpdate.mockResolvedValue(mockPosition);

            const position = await coordinator.getSingleLocationUpdate();

            expect(position).toBe(mockPosition);
            expect(params.changeDetectionCoordinator.setCurrentPosition).toHaveBeenCalledWith(mockPosition);
            expect(params.reverseGeocoder.latitude).toBe(-23.550520);
            expect(params.reverseGeocoder.longitude).toBe(-46.633309);
        });

        test('should maintain proper lifecycle: create → wire → track → stop → destroy', () => {
            const coordinator = new ServiceCoordinator(params);

            // Phase 1: Create
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            expect(coordinator.getDisplayers()).not.toBeNull();
            expect(coordinator.isInitialized()).toBe(false);

            // Phase 2: Wire
            coordinator.wireObservers();
            expect(coordinator.isInitialized()).toBe(true);
            expect(coordinator.isTracking()).toBe(false);

            // Phase 3: Track
            coordinator.startTracking();
            expect(coordinator.isTracking()).toBe(true);

            // Phase 4: Stop
            coordinator.stopTracking();
            expect(coordinator.isTracking()).toBe(false);
            expect(coordinator.isInitialized()).toBe(true);

            // Phase 5: Destroy
            coordinator.destroy();
            expect(coordinator.isInitialized()).toBe(false);
            expect(coordinator.getDisplayers()).toBeNull();
        });

        test('should handle restart after stop', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();

            // First tracking session
            coordinator.startTracking();
            expect(coordinator.isTracking()).toBe(true);
            coordinator.stopTracking();
            expect(coordinator.isTracking()).toBe(false);

            // Second tracking session
            coordinator.startTracking();
            expect(coordinator.isTracking()).toBe(true);
            expect(params.geolocationService.watchCurrentLocation).toHaveBeenCalledTimes(2);
        });

        test('should handle multiple single location updates', async () => {
            const coordinator = new ServiceCoordinator(params);
            const pos1 = { coords: { latitude: -23.550520, longitude: -46.633309 } };
            const pos2 = { coords: { latitude: 40.7128, longitude: -74.0060 } };

            params.geolocationService.getSingleLocationUpdate
                .mockResolvedValueOnce(pos1)
                .mockResolvedValueOnce(pos2);

            const result1 = await coordinator.getSingleLocationUpdate();
            expect(result1).toBe(pos1);
            expect(params.reverseGeocoder.latitude).toBe(-23.550520);

            const result2 = await coordinator.getSingleLocationUpdate();
            expect(result2).toBe(pos2);
            expect(params.reverseGeocoder.latitude).toBe(40.7128);
        });

        test('should support method chaining', () => {
            const coordinator = new ServiceCoordinator(params);

            coordinator
                .createDisplayers('loc-result', 'addr-display', 'ref-display')
                .wireObservers()
                .startTracking()
                .stopTracking();

            // Verify all operations completed
            expect(coordinator.getDisplayers()).not.toBeNull();
            expect(coordinator.isInitialized()).toBe(true);
            expect(coordinator.isTracking()).toBe(false);
        });
    });

    describe('Error Handling', () => {
        test('should handle geolocation errors gracefully', async () => {
            const coordinator = new ServiceCoordinator(params);
            const mockError = new Error('Permission denied');
            params.geolocationService.getSingleLocationUpdate.mockRejectedValue(mockError);

            await expect(coordinator.getSingleLocationUpdate()).rejects.toThrow('Permission denied');
        });

        test('should prevent tracking before initialization', () => {
            const coordinator = new ServiceCoordinator(params);

            expect(() => {
                coordinator.startTracking();
            }).toThrow('Must wire observers before starting tracking');
        });

        test('should prevent wiring before displayer creation', () => {
            const coordinator = new ServiceCoordinator(params);

            expect(() => {
                coordinator.wireObservers();
            }).toThrow('Displayers must be created before wiring observers');
        });

        test('should handle null geolocationService in getSingleLocationUpdate', async () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator._geolocationService = null;

            await expect(coordinator.getSingleLocationUpdate()).rejects.toThrow();
        });

        test('should handle null geolocationService in startTracking', () => {
            const coordinator = new ServiceCoordinator(params);
            coordinator.createDisplayers('loc-result', 'addr-display', 'ref-display');
            coordinator.wireObservers();
            coordinator._geolocationService = null;

            expect(() => {
                coordinator.startTracking();
            }).toThrow('GeolocationService not initialized');
        });
    });
});
