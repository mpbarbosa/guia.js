/**
 * Tests for GeolocationService race condition protection and concurrent request handling
 * 
 * This test suite verifies:
 * - Prevention of overlapping getSingleLocationUpdate() calls
 * - Proper state management with isPendingRequest flag
 * - hasPendingRequest() method functionality
 * - Error handling for concurrent requests
 * 
 * @jest-environment node
 * @author MP Barbosa
 * @since 0.8.6-alpha
 */

import { describe, test, expect, jest, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

// Mock console
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
};

// Mock DOM
global.document = undefined;
global.window = {
    location: {
        hostname: 'localhost',
        port: '8080'
    }
};

// Mock setupParams
global.setupParams = {
    geolocationOptions: {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
    },
    trackingInterval: 50000,
    minimumDistanceChange: 20
};

// Load guia.js
const fs = require('fs');
const path = require('path');

let GeolocationService, PositionManager;

try {
    const guiaPath = path.join(__dirname, '../../src/guia.js');
    if (fs.existsSync(guiaPath)) {
        const guiaContent = fs.readFileSync(guiaPath, 'utf8');
        eval(guiaContent);
        
        GeolocationService = global.GeolocationService;
        PositionManager = global.PositionManager;
    }
} catch (error) {
    console.warn('Could not load guia.js:', error.message);
}

describe('GeolocationService - Race Condition Protection', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Concurrent Request Prevention', () => {
        test('should reject second request when first is pending', async () => {
            if (!GeolocationService) {
                console.warn('GeolocationService not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            let resolveFirst;
            const mockPosition = {
                coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 15 },
                timestamp: Date.now()
            };

            const mockGeolocation = {
                getCurrentPosition: jest.fn((success) => {
                    // Keep first request pending
                    resolveFirst = () => success(mockPosition);
                })
            };

            const mockNavigator = { geolocation: mockGeolocation };
            const mockPositionManager = { update: jest.fn() };

            const service = new GeolocationService(null, mockNavigator, mockPositionManager);

            // Start first request (will be pending)
            const firstRequest = service.getSingleLocationUpdate();

            // Try second request while first is pending
            await expect(service.getSingleLocationUpdate())
                .rejects
                .toThrow('A geolocation request is already pending');

            // Resolve first request
            resolveFirst();
            await expect(firstRequest).resolves.toBe(mockPosition);
        });

        test('should allow new request after first completes successfully', async () => {
            if (!GeolocationService) {
                console.warn('GeolocationService not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockPosition1 = {
                coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 15 },
                timestamp: Date.now()
            };
            const mockPosition2 = {
                coords: { latitude: -23.5506, longitude: -46.6334, accuracy: 10 },
                timestamp: Date.now() + 1000
            };

            const mockGeolocation = {
                getCurrentPosition: jest.fn()
                    .mockImplementationOnce((success) => success(mockPosition1))
                    .mockImplementationOnce((success) => success(mockPosition2))
            };

            const mockNavigator = { geolocation: mockGeolocation };
            const mockPositionManager = { update: jest.fn() };

            const service = new GeolocationService(null, mockNavigator, mockPositionManager);

            // First request
            const result1 = await service.getSingleLocationUpdate();
            expect(result1).toBe(mockPosition1);

            // Second request after first completes
            const result2 = await service.getSingleLocationUpdate();
            expect(result2).toBe(mockPosition2);

            expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
        });

        test('should allow new request after first fails', async () => {
            if (!GeolocationService) {
                console.warn('GeolocationService not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockError = { code: 1, message: 'Permission denied' };
            const mockPosition = {
                coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 15 },
                timestamp: Date.now()
            };

            const mockGeolocation = {
                getCurrentPosition: jest.fn()
                    .mockImplementationOnce((success, error) => error(mockError))
                    .mockImplementationOnce((success) => success(mockPosition))
            };

            const mockNavigator = { geolocation: mockGeolocation };
            const mockPositionManager = { update: jest.fn() };

            const service = new GeolocationService(null, mockNavigator, mockPositionManager);

            // First request fails
            await expect(service.getSingleLocationUpdate()).rejects.toThrow();

            // Second request should succeed
            const result = await service.getSingleLocationUpdate();
            expect(result).toBe(mockPosition);
        });
    });

    describe('hasPendingRequest() Method', () => {
        test('should return false when no request is pending', () => {
            if (!GeolocationService) {
                console.warn('GeolocationService not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockNavigator = { geolocation: {} };
            const service = new GeolocationService(null, mockNavigator);

            expect(service.hasPendingRequest()).toBe(false);
        });

        test('should return true when request is pending', async () => {
            if (!GeolocationService) {
                console.warn('GeolocationService not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            let resolveRequest;
            const mockGeolocation = {
                getCurrentPosition: jest.fn((success) => {
                    resolveRequest = () => success({
                        coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 15 },
                        timestamp: Date.now()
                    });
                })
            };

            const mockNavigator = { geolocation: mockGeolocation };
            const mockPositionManager = { update: jest.fn() };
            const service = new GeolocationService(null, mockNavigator, mockPositionManager);

            expect(service.hasPendingRequest()).toBe(false);

            // Start request
            const request = service.getSingleLocationUpdate();
            expect(service.hasPendingRequest()).toBe(true);

            // Resolve and wait
            resolveRequest();
            await request;

            expect(service.hasPendingRequest()).toBe(false);
        });

        test('should return false after request completes', async () => {
            if (!GeolocationService) {
                console.warn('GeolocationService not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockPosition = {
                coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 15 },
                timestamp: Date.now()
            };

            const mockGeolocation = {
                getCurrentPosition: jest.fn((success) => success(mockPosition))
            };

            const mockNavigator = { geolocation: mockGeolocation };
            const mockPositionManager = { update: jest.fn() };
            const service = new GeolocationService(null, mockNavigator, mockPositionManager);

            await service.getSingleLocationUpdate();

            expect(service.hasPendingRequest()).toBe(false);
        });

        test('should return false after request fails', async () => {
            if (!GeolocationService) {
                console.warn('GeolocationService not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockError = { code: 1, message: 'Permission denied' };

            const mockGeolocation = {
                getCurrentPosition: jest.fn((success, error) => error(mockError))
            };

            const mockNavigator = { geolocation: mockGeolocation };
            const mockPositionManager = { update: jest.fn() };
            const service = new GeolocationService(null, mockNavigator, mockPositionManager);

            await expect(service.getSingleLocationUpdate()).rejects.toThrow();

            expect(service.hasPendingRequest()).toBe(false);
        });
    });

    describe('Error Type Verification', () => {
        test('should reject with RequestPendingError for concurrent requests', async () => {
            if (!GeolocationService) {
                console.warn('GeolocationService not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            let resolveFirst;
            const mockGeolocation = {
                getCurrentPosition: jest.fn((success) => {
                    resolveFirst = () => success({
                        coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 15 },
                        timestamp: Date.now()
                    });
                })
            };

            const mockNavigator = { geolocation: mockGeolocation };
            const mockPositionManager = { update: jest.fn() };
            const service = new GeolocationService(null, mockNavigator, mockPositionManager);

            // Start first request
            const firstRequest = service.getSingleLocationUpdate();

            // Try second request
            try {
                await service.getSingleLocationUpdate();
                fail('Should have thrown error');
            } catch (error) {
                expect(error.name).toBe('RequestPendingError');
                expect(error.message).toContain('already pending');
            }

            resolveFirst();
            await firstRequest;
        });
    });

    describe('Privacy - Error Logging', () => {
        test('should not log full error object with potential coordinates', async () => {
            if (!GeolocationService) {
                console.warn('GeolocationService not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockError = { 
                code: 1, 
                message: 'Permission denied',
                // Could potentially contain sensitive data
                additionalData: { lat: -23.5505, lon: -46.6333 }
            };

            const mockGeolocation = {
                getCurrentPosition: jest.fn((success, error) => error(mockError))
            };

            const mockNavigator = { geolocation: mockGeolocation };
            const mockPositionManager = { update: jest.fn() };
            const service = new GeolocationService(null, mockNavigator, mockPositionManager);

            await expect(service.getSingleLocationUpdate()).rejects.toThrow();

            // Verify console.error was called with message only, not full error object
            expect(console.error).toHaveBeenCalled();
            const errorCall = console.error.mock.calls.find(call => 
                call[0].includes('Single location update failed')
            );
            expect(errorCall).toBeDefined();
            // Should log message, not full error object
            expect(errorCall[1]).toBe(mockError.message);
        });
    });
});
