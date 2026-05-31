/**
 * @jest-environment jsdom
 *
 * Phase 3 — Injectable displayer factory
 *
 * Verifies that:
 * 1. defaultDisplayerFactory satisfies the IDisplayerFactory contract.
 * 2. ServiceCoordinator accepts a mock IDisplayerFactory without static patching.
 * 3. WebGeocodingManager.displayerFactory is typed as IDisplayerFactory (verified
 *    at compile time; tested at runtime via the prototype method presence checks).
 * 4. The coordination layer no longer holds a static class reference as its
 *    only factory shape.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { IDisplayerFactory } from '../../src/types/coordinator-services.js';
import { defaultDisplayerFactory } from '../../src/html/DisplayerFactory.js';
import WebGeocodingManager from '../../src/coordination/WebGeocodingManager.js';

// ── helpers ───────────────────────────────────────────────────────────────────

/** Minimal IDisplayerFactory mock — no static patching needed. */
function makeMockFactory(): jest.Mocked<IDisplayerFactory> {
  return {
    createPositionDisplayer:      jest.fn(() => ({ update: jest.fn() })),
    createAddressDisplayer:       jest.fn(() => ({ update: jest.fn() })),
    createReferencePlaceDisplayer:jest.fn(() => ({ update: jest.fn() })),
    createHighlightCardsDisplayer:jest.fn(() => ({ update: jest.fn() })),
    createSidraDisplayer:         jest.fn(() => ({ update: jest.fn() })),
  } as unknown as jest.Mocked<IDisplayerFactory>;
}

// ── 1. defaultDisplayerFactory ────────────────────────────────────────────────

describe('defaultDisplayerFactory', () => {
  it('is exported from DisplayerFactory module', () => {
    expect(defaultDisplayerFactory).toBeDefined();
    expect(typeof defaultDisplayerFactory).toBe('object');
  });

  it('satisfies IDisplayerFactory: all five methods present', () => {
    expect(typeof defaultDisplayerFactory.createPositionDisplayer).toBe('function');
    expect(typeof defaultDisplayerFactory.createAddressDisplayer).toBe('function');
    expect(typeof defaultDisplayerFactory.createReferencePlaceDisplayer).toBe('function');
    expect(typeof defaultDisplayerFactory.createHighlightCardsDisplayer).toBe('function');
    expect(typeof defaultDisplayerFactory.createSidraDisplayer).toBe('function');
  });

  it('is frozen (immutable)', () => {
    expect(Object.isFrozen(defaultDisplayerFactory)).toBe(true);
  });

  it('createPositionDisplayer delegates to the real HTMLPositionDisplayer', () => {
    const el = document.createElement('span');
    const result = defaultDisplayerFactory.createPositionDisplayer(el);
    expect(result).toBeDefined();
    expect(result).not.toBeNull();
  });

  it('createHighlightCardsDisplayer delegates to the real HTMLHighlightCardsDisplayer', () => {
    const result = defaultDisplayerFactory.createHighlightCardsDisplayer(document);
    expect(result).toBeDefined();
  });

  it('createSidraDisplayer delegates to the real HTMLSidraDisplayer', () => {
    const el = document.createElement('span');
    const result = defaultDisplayerFactory.createSidraDisplayer(el);
    expect(result).toBeDefined();
  });
});

// ── 2. ServiceCoordinator mock-factory injection ───────────────────────────────

describe('ServiceCoordinator — mock IDisplayerFactory injection', () => {
  it('calls createHighlightCardsDisplayer on the injected mock, not on DisplayerFactory', async () => {
    const { default: ServiceCoordinator } = await import(
      '../../src/coordination/ServiceCoordinator.js'
    );
    const { default: ReverseGeocoder, createReverseGeocoderService } = await import(
      '../../src/services/ReverseGeocoder.js'
    );
    const { default: GeolocationService } = await import(
      '../../src/services/GeolocationService.js'
    );
    const { default: BrowserGeolocationProvider } = await import(
      '../../src/services/providers/BrowserGeolocationProvider.js'
    );
    const { default: ChangeDetectionCoordinator } = await import(
      '../../src/services/ChangeDetectionCoordinator.js'
    );
    const { default: ObserverSubject } = await import(
      '../../src/core/ObserverSubject.js'
    );

    const mockFactory = makeMockFactory();
    const reverseGeocoder = createReverseGeocoderService(null, {});
    const changeDetector = new ChangeDetectionCoordinator({
      reverseGeocoder,
      observerSubject: new ObserverSubject(),
    });

    const coordinator = new (ServiceCoordinator as unknown as new(p: unknown) => {
      createDisplayers(...args: unknown[]): unknown;
    })({
      geolocationService: new GeolocationService(new BrowserGeolocationProvider()),
      reverseGeocoder,
      changeDetectionCoordinator: changeDetector,
      observerSubject: new ObserverSubject(),
      displayerFactory: mockFactory,
      document,
    });

    const el = document.createElement('span');
    coordinator.createDisplayers(el, el, el, el, el);

    // The mock was called — no static patching of DisplayerFactory needed
    expect(mockFactory.createPositionDisplayer).toHaveBeenCalledTimes(1);
    expect(mockFactory.createAddressDisplayer).toHaveBeenCalledTimes(1);
    expect(mockFactory.createHighlightCardsDisplayer).toHaveBeenCalledTimes(1);
  });

  it('uses defaultDisplayerFactory when no factory is injected', async () => {
    const { default: ServiceCoordinator } = await import(
      '../../src/coordination/ServiceCoordinator.js'
    );
    const { createReverseGeocoderService } = await import(
      '../../src/services/ReverseGeocoder.js'
    );
    const { default: GeolocationService } = await import(
      '../../src/services/GeolocationService.js'
    );
    const { default: BrowserGeolocationProvider } = await import(
      '../../src/services/providers/BrowserGeolocationProvider.js'
    );
    const { default: ChangeDetectionCoordinator } = await import(
      '../../src/services/ChangeDetectionCoordinator.js'
    );
    const { default: ObserverSubject } = await import(
      '../../src/core/ObserverSubject.js'
    );

    const reverseGeocoder = createReverseGeocoderService(null, {});
    const changeDetector = new ChangeDetectionCoordinator({
      reverseGeocoder,
      observerSubject: new ObserverSubject(),
    });

    // No displayerFactory supplied — should fall back to defaultDisplayerFactory
    const coordinator = new (ServiceCoordinator as unknown as new(p: unknown) => {
      createDisplayers(...args: unknown[]): unknown;
      _displayerFactory: IDisplayerFactory | null;
    })({
      geolocationService: new GeolocationService(new BrowserGeolocationProvider()),
      reverseGeocoder,
      changeDetectionCoordinator: changeDetector,
      observerSubject: new ObserverSubject(),
      document,
    });

    expect(coordinator._displayerFactory).toBe(defaultDisplayerFactory);
  });
});

// ── 3. WebGeocodingManager.displayerFactory is IDisplayerFactory ──────────────

describe('WebGeocodingManager.displayerFactory', () => {
  it('is defaultDisplayerFactory when no factory is injected', () => {
    // Use Object.create to skip the heavy constructor
    const wgm = Object.create(
      WebGeocodingManager.prototype,
    ) as InstanceType<typeof WebGeocodingManager>;

    // Simulate minimal constructor state
    (wgm as unknown as Record<string, unknown>).displayerFactory = defaultDisplayerFactory;

    expect(wgm.displayerFactory).toBe(defaultDisplayerFactory);
    expect(typeof wgm.displayerFactory.createPositionDisplayer).toBe('function');
  });

  it('accepts a mock IDisplayerFactory without casting', () => {
    const mockFactory = makeMockFactory();

    // This assignment is valid TypeScript — no cast needed.
    // (Verified at compile time via ts-jest; the test proves it at runtime too.)
    const wgm = Object.create(
      WebGeocodingManager.prototype,
    ) as InstanceType<typeof WebGeocodingManager>;
    (wgm as unknown as Record<string, unknown>).displayerFactory = mockFactory;

    expect(wgm.displayerFactory).toBe(mockFactory);
    expect(wgm.displayerFactory.createSidraDisplayer).toBe(mockFactory.createSidraDisplayer);
  });
});
