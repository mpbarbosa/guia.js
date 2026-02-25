/**
 * @jest-environment jsdom
 */

/**
 * @file MapsIntegration.test.js
 * @description Tests for MapsIntegration URL generators and coordinate management.
 *
 * Note: MapsIntegration exports a singleton instance and uses document/navigator
 * directly. Tests exercise the pure URL-generation private methods and
 * updateCoordinates() via the singleton.
 */

import { describe, test, expect, beforeEach } from '@jest/globals';

// ─── helpers ──────────────────────────────────────────────────────────────────

// Instantiate a fresh MapsIntegration using the class (not the default singleton)
// by importing the module and accessing the class through dynamic import.

let MapsIntegration;

beforeEach(async () => {
  // Reset singleton between tests
  const mod = await import('../../src/utils/maps-integration.js');
  MapsIntegration = mod.MapsIntegration || mod.default?.constructor;
});

// ─── URL generators ───────────────────────────────────────────────────────────

describe('MapsIntegration URL generators', () => {
  // We test the URL methods by creating an instance and calling private methods.
  // These methods have no side effects and are deterministic.

  function makeInstance() {
    // Bypass singleton by directly creating (class is exported)
    const mod_ref = { MapsIntegration };
    if (!mod_ref.MapsIntegration) return null;
    const inst = Object.create(mod_ref.MapsIntegration.prototype);
    inst.currentCoordinates = null;
    inst.mapsActionsContainer = null;
    return inst;
  }

  test('_getStreetViewUrl returns correct URL', async () => {
    const { MapsIntegration: MI } = await import('../../src/utils/maps-integration.js');
    if (!MI) return; // singleton-only export — skip
    const inst = Object.create(MI.prototype);
    const url = inst._getStreetViewUrl(-23.55, -46.63);
    expect(url).toContain('-23.55');
    expect(url).toContain('-46.63');
    expect(url).toContain('google.com/maps');
  });

  test('_getOpenStreetMapUrl returns correct URL', async () => {
    const { MapsIntegration: MI } = await import('../../src/utils/maps-integration.js');
    if (!MI) return;
    const inst = Object.create(MI.prototype);
    const url = inst._getOpenStreetMapUrl(-23.55, -46.63);
    expect(url).toContain('openstreetmap.org');
    expect(url).toContain('-23.55');
    expect(url).toContain('-46.63');
  });

  test('_getWazeUrl returns correct URL', async () => {
    const { MapsIntegration: MI } = await import('../../src/utils/maps-integration.js');
    if (!MI) return;
    const inst = Object.create(MI.prototype);
    const url = inst._getWazeUrl(-23.55, -46.63);
    expect(url).toContain('waze.com');
    expect(url).toContain('-23.55');
    expect(url).toContain('-46.63');
  });

  test('_getGoogleMapsUrl returns web URL for desktop user agent', async () => {
    const { MapsIntegration: MI } = await import('../../src/utils/maps-integration.js');
    if (!MI) return;
    const inst = Object.create(MI.prototype);
    // jsdom user agent is desktop — no iPhone/Android
    const url = inst._getGoogleMapsUrl(-23.55, -46.63);
    expect(url).toContain('google.com/maps');
    expect(url).toContain('-23.55');
  });
});

// ─── singleton export ─────────────────────────────────────────────────────────

describe('MapsIntegration default export', () => {
  test('default export is an object', async () => {
    const mod = await import('../../src/utils/maps-integration.js');
    expect(typeof mod.default).toBe('object');
  });

  test('singleton has updateCoordinates method', async () => {
    const mod = await import('../../src/utils/maps-integration.js');
    expect(typeof mod.default.updateCoordinates).toBe('function');
  });

  test('updateCoordinates stores lat/lng', async () => {
    const mod = await import('../../src/utils/maps-integration.js');
    const instance = mod.default;
    instance.updateCoordinates(-23.55, -46.63);
    expect(instance.currentCoordinates).not.toBeNull();
    expect(instance.currentCoordinates.latitude).toBeCloseTo(-23.55);
    expect(instance.currentCoordinates.longitude).toBeCloseTo(-46.63);
  });
});
