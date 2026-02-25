/**
 * Integration test for extracted core modules
 * 
 * Verifies that GeoPosition, ObserverSubject, and PositionManager
 * work correctly when imported as separate modules
 * 
 * @jest-environment node
 */

import { describe, test, expect, jest } from '@jest/globals';

// Mock globals before importing
global.document = undefined;
global.window = { log: jest.fn(), warn: jest.fn() };
global.console.warn = jest.fn();

describe('Core Modules Integration', () => {
    test('should import GeoPosition from core module', async () => {
        const { default: GeoPosition } = await import('../../src/core/GeoPosition.js');
        expect(GeoPosition).toBeDefined();
        expect(typeof GeoPosition).toBe('function');
    });

    test('should import ObserverSubject from core module', async () => {
        const { default: ObserverSubject } = await import('../../src/core/ObserverSubject.js');
        expect(ObserverSubject).toBeDefined();
        expect(typeof ObserverSubject).toBe('function');
    });

    test('should import PositionManager from core module', async () => {
        const { default: PositionManager } = await import('../../src/core/PositionManager.js');
        expect(PositionManager).toBeDefined();
        expect(typeof PositionManager).toBe('function');
    });

    test('should create immutable GeoPosition', async () => {
        const { default: GeoPosition } = await import('../../src/core/GeoPosition.js');
        
        const mockPosition = {
            coords: {
                latitude: -23.5505,
                longitude: -46.6333,
                accuracy: 20,
                altitude: 760,
                altitudeAccuracy: 10,
                heading: 0,
                speed: 0
            },
            timestamp: Date.now()
        };

        const geoPosition = new GeoPosition(mockPosition);
        
        expect(geoPosition.latitude).toBe(-23.5505);
        expect(geoPosition.longitude).toBe(-46.6333);
        expect(geoPosition.accuracy).toBe(20);
        expect(geoPosition.accuracyQuality).toBe('good');
        
        // Verify object is frozen
        expect(Object.isFrozen(geoPosition)).toBe(true);
    });

    test('should create and use ObserverSubject', async () => {
        const { default: ObserverSubject } = await import('../../src/core/ObserverSubject.js');
        
        const subject = new ObserverSubject();
        let notified = false;
        
        const observer = {
            update: () => { notified = true; }
        };
        
        subject.subscribe(observer);
        expect(subject.getObserverCount()).toBe(1);
        
        subject.notifyObservers();
        expect(notified).toBe(true);
        
        subject.unsubscribe(observer);
        expect(subject.getObserverCount()).toBe(0);
    });

    test('should create PositionManager singleton', async () => {
        const { default: PositionManager } = await import('../../src/core/PositionManager.js');
        
        const manager1 = PositionManager.getInstance();
        const manager2 = PositionManager.getInstance();
        
        // Same instance
        expect(manager1).toBe(manager2);
        expect(PositionManager.strCurrPosUpdate).toBe('PositionManager updated');
    });

    test('should export classes from guia.js', async () => {
        const guia = await import('../../src/guia.js');
        
        expect(guia.GeoPosition).toBeDefined();
        expect(guia.ObserverSubject).toBeDefined();
        expect(guia.PositionManager).toBeDefined();
    });

    test('core classes should work together', async () => {
        const { default: GeoPosition } = await import('../../src/core/GeoPosition.js');
        const { default: ObserverSubject } = await import('../../src/core/ObserverSubject.js');
        
        const subject = new ObserverSubject();
        let lastPosition = null;
        
        const observer = {
            update: (pos) => { lastPosition = pos; }
        };
        
        subject.subscribe(observer);
        
        const mockPosition = {
            coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 15 },
            timestamp: Date.now()
        };
        
        const geoPosition = new GeoPosition(mockPosition);
        subject.notifyObservers(geoPosition);
        
        expect(lastPosition).toBe(geoPosition);
        expect(lastPosition.latitude).toBe(-23.5505);
    });
});
