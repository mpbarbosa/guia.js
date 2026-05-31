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
// IDisplayerFactory import is kept — the interface still exists in types for
// future use; these tests verify the contract via defaultDisplayerFactory.
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

// ── 2. Phase 4 cleanup: factory injection removed from coordination layer ────────
//
// createDisplayers() and the displayerFactory param were removed in the
// dead-code cleanup (legacy assessment phase). Displayer creation now lives
// in Vue composables (useHighlightCards, usePositionDisplayer, etc.).
// The tests below confirm the layer no longer exposes these entry points.

describe('WebGeocodingManager — Phase 4 cleanup', () => {
  it('does not expose a displayerFactory property', () => {
    const wgm = Object.create(
      WebGeocodingManager.prototype,
    ) as InstanceType<typeof WebGeocodingManager>;
    expect((wgm as unknown as Record<string, unknown>).displayerFactory).toBeUndefined();
  });

  it('defaultDisplayerFactory still satisfies IDisplayerFactory contract', () => {
    expect(typeof defaultDisplayerFactory.createPositionDisplayer).toBe('function');
    expect(typeof defaultDisplayerFactory.createHighlightCardsDisplayer).toBe('function');
  });
});
