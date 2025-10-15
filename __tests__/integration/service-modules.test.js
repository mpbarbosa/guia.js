/**
 * Integration test for extracted service layer modules
 * 
 * Verifies that ReverseGeocoder, GeolocationService, and ChangeDetectionCoordinator
 * work correctly when imported as separate modules
 * 
 * @jest-environment node
 */

import { describe, test, expect, jest } from '@jest/globals';

// Mock globals before importing
global.document = undefined;
global.window = { log: jest.fn(), warn: jest.fn() };
global.console.warn = jest.fn();

describe('Service Modules Integration', () => {
    test('should import ReverseGeocoder from services module', async () => {
        const { default: ReverseGeocoder } = await import('../../src/services/ReverseGeocoder.js');
        expect(ReverseGeocoder).toBeDefined();
        expect(typeof ReverseGeocoder).toBe('function');
    });

    test('should import GeolocationService from services module', async () => {
        const { default: GeolocationService } = await import('../../src/services/GeolocationService.js');
        expect(GeolocationService).toBeDefined();
        expect(typeof GeolocationService).toBe('function');
    });

    test('should import ChangeDetectionCoordinator from services module', async () => {
        const { default: ChangeDetectionCoordinator } = await import('../../src/services/ChangeDetectionCoordinator.js');
        expect(ChangeDetectionCoordinator).toBeDefined();
        expect(typeof ChangeDetectionCoordinator).toBe('function');
    });

    test('should create ReverseGeocoder with fetch manager', async () => {
        const { default: ReverseGeocoder } = await import('../../src/services/ReverseGeocoder.js');
        
        // Mock fetch manager
        const mockFetchManager = {
            fetch: jest.fn(),
            subscribe: jest.fn()
        };

        const geocoder = new ReverseGeocoder(mockFetchManager);
        
        expect(geocoder).toBeDefined();
        expect(geocoder.fetchManager).toBe(mockFetchManager);
        expect(geocoder.toString()).toBe('ReverseGeocoder: No coordinates set');
    });

    test('should set coordinates in ReverseGeocoder', async () => {
        const { default: ReverseGeocoder } = await import('../../src/services/ReverseGeocoder.js');
        
        const mockFetchManager = {
            fetch: jest.fn(),
            subscribe: jest.fn()
        };

        const geocoder = new ReverseGeocoder(mockFetchManager);
        geocoder.setCoordinates(-23.5505, -46.6333);
        
        expect(geocoder.latitude).toBe(-23.5505);
        expect(geocoder.longitude).toBe(-46.6333);
        expect(geocoder.toString()).toBe('ReverseGeocoder: -23.5505, -46.6333');
        expect(geocoder.getCacheKey()).toBe('-23.5505,-46.6333');
    });

    test('should create GeolocationService with navigator', async () => {
        const { default: GeolocationService } = await import('../../src/services/GeolocationService.js');
        const { default: PositionManager } = await import('../../src/core/PositionManager.js');
        
        // Mock navigator
        const mockNavigator = {
            geolocation: {
                getCurrentPosition: jest.fn(),
                watchPosition: jest.fn(),
                clearWatch: jest.fn()
            }
        };

        const service = new GeolocationService(null, mockNavigator, PositionManager.getInstance());
        
        expect(service).toBeDefined();
        expect(service.navigator).toBe(mockNavigator);
        expect(service.isCurrentlyWatching()).toBe(false);
        expect(service.hasPendingRequest()).toBe(false);
    });

    test('should create ChangeDetectionCoordinator', async () => {
        const { default: ChangeDetectionCoordinator } = await import('../../src/services/ChangeDetectionCoordinator.js');
        const { default: ObserverSubject } = await import('../../src/core/ObserverSubject.js');
        
        const mockReverseGeocoder = {
            currentAddress: null,
            enderecoPadronizado: null
        };

        const observerSubject = new ObserverSubject();
        
        const coordinator = new ChangeDetectionCoordinator({
            reverseGeocoder: mockReverseGeocoder,
            observerSubject: observerSubject
        });
        
        expect(coordinator).toBeDefined();
        expect(coordinator.reverseGeocoder).toBe(mockReverseGeocoder);
        expect(coordinator.observerSubject).toBe(observerSubject);
    });

    test('should export service classes from guia.js', async () => {
        const guia = await import('../../src/guia.js');
        
        expect(guia.ReverseGeocoder).toBeDefined();
        expect(guia.GeolocationService).toBeDefined();
        expect(guia.ChangeDetectionCoordinator).toBeDefined();
    });

    test('ReverseGeocoder should integrate with ObserverSubject', async () => {
        const { default: ReverseGeocoder } = await import('../../src/services/ReverseGeocoder.js');
        
        const mockFetchManager = {
            fetch: jest.fn(),
            subscribe: jest.fn()
        };

        const geocoder = new ReverseGeocoder(mockFetchManager);
        
        let notified = false;
        const observer = {
            update: () => { notified = true; }
        };
        
        geocoder.subscribe(observer);
        geocoder.notifyObservers();
        
        expect(notified).toBe(true);
    });

    test('GeolocationService should check permissions', async () => {
        const { default: GeolocationService } = await import('../../src/services/GeolocationService.js');
        const { default: PositionManager } = await import('../../src/core/PositionManager.js');
        
        // Mock navigator with Permissions API
        const mockNavigator = {
            geolocation: {},
            permissions: {
                query: jest.fn().mockResolvedValue({ state: 'granted' })
            }
        };

        const service = new GeolocationService(null, mockNavigator, PositionManager.getInstance());
        const permission = await service.checkPermissions();
        
        expect(permission).toBe('granted');
        expect(mockNavigator.permissions.query).toHaveBeenCalledWith({ name: 'geolocation' });
    });

    test('ChangeDetectionCoordinator should handle change notifications', async () => {
        const { default: ChangeDetectionCoordinator } = await import('../../src/services/ChangeDetectionCoordinator.js');
        const { default: ObserverSubject } = await import('../../src/core/ObserverSubject.js');
        
        const mockReverseGeocoder = {
            currentAddress: { display_name: 'Test Address' },
            enderecoPadronizado: { logradouro: 'Test Street' }
        };

        const observerSubject = new ObserverSubject();
        let changeReceived = false;
        
        observerSubject.subscribe({
            update: () => { changeReceived = true; }
        });
        
        const coordinator = new ChangeDetectionCoordinator({
            reverseGeocoder: mockReverseGeocoder,
            observerSubject: observerSubject
        });
        
        const changeDetails = {
            previous: { logradouro: 'Old Street' },
            current: { logradouro: 'New Street' },
            hasChanged: true
        };
        
        coordinator.notifyLogradouroChangeObservers(changeDetails);
        
        expect(changeReceived).toBe(true);
    });

    test('service modules should work together', async () => {
        const { default: ReverseGeocoder } = await import('../../src/services/ReverseGeocoder.js');
        const { default: GeolocationService } = await import('../../src/services/GeolocationService.js');
        const { default: ChangeDetectionCoordinator } = await import('../../src/services/ChangeDetectionCoordinator.js');
        const { default: ObserverSubject } = await import('../../src/core/ObserverSubject.js');
        const { default: PositionManager } = await import('../../src/core/PositionManager.js');
        
        // Create mock dependencies
        const mockFetchManager = {
            fetch: jest.fn(),
            subscribe: jest.fn()
        };

        const mockNavigator = {
            geolocation: {
                getCurrentPosition: jest.fn(),
                watchPosition: jest.fn(),
                clearWatch: jest.fn()
            }
        };
        
        // Create instances
        const geocoder = new ReverseGeocoder(mockFetchManager);
        const geoService = new GeolocationService(null, mockNavigator, PositionManager.getInstance());
        const observerSubject = new ObserverSubject();
        const coordinator = new ChangeDetectionCoordinator({
            reverseGeocoder: geocoder,
            observerSubject: observerSubject
        });
        
        // Verify all instances are created and connected
        expect(geocoder).toBeDefined();
        expect(geoService).toBeDefined();
        expect(coordinator).toBeDefined();
        expect(coordinator.reverseGeocoder).toBe(geocoder);
        expect(coordinator.observerSubject).toBe(observerSubject);
    });
});
