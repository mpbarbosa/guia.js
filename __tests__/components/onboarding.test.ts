/**
 * @jest-environment jsdom
 */

/**
 * @file onboarding.test.js
 * @description Tests for the OnboardingManager component.
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Build the minimal DOM structure required by OnboardingManager
function buildDom(extraHtml = '') {
  document.body.innerHTML = `
    <div id="onboarding-card" class="onboarding-card">
      <button id="enable-location-btn">Enable</button>
      <div class="onboarding-error-recovery" style="display:none">
        <p class="error-message"></p>
      </div>
    </div>
    <button id="getLocationBtn">Get Location</button>
    ${extraHtml}
  `;
}

let manager;

beforeEach(async () => {
  buildDom();
  // Re-import fresh each test (module is cached as singleton — access via default)
  const mod = await import('../../src/components/onboarding.js');
  manager = mod.default;
  // Reset state between tests
  manager.isLocationGranted = false;
  manager.onboardingCard = document.getElementById('onboarding-card');
  manager.enableLocationBtn = document.getElementById('enable-location-btn');
});

// ─── init ─────────────────────────────────────────────────────────────────────

describe('OnboardingManager.init', () => {
  test('does not throw when elements are present', () => {
    expect(() => manager.init()).not.toThrow();
  });

  test('warns and returns early when elements are missing', () => {
    document.body.innerHTML = ''; // No elements
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    manager.init();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
    warnSpy.mockRestore();
  });
});

// ─── showOnboarding / hideOnboarding ─────────────────────────────────────────

describe('OnboardingManager show/hide', () => {
  test('showOnboarding removes hidden class', () => {
    manager.onboardingCard.classList.add('hidden');
    manager.showOnboarding();
    expect(manager.onboardingCard.classList.contains('hidden')).toBe(false);
  });

  test('hideOnboarding adds hidden class', () => {
    manager.hideOnboarding();
    expect(manager.onboardingCard.classList.contains('hidden')).toBe(true);
  });
});

// ─── checkLocationPermission ──────────────────────────────────────────────────

describe('OnboardingManager.checkLocationPermission', () => {
  test('calls showOnboarding when Permissions API is absent', async () => {
    const origPerms = navigator.permissions;
    Object.defineProperty(navigator, 'permissions', {
      value: undefined,
      configurable: true,
    });
    const showSpy = jest.spyOn(manager, 'showOnboarding');
    await manager.checkLocationPermission();
    expect(showSpy).toHaveBeenCalled();
    Object.defineProperty(navigator, 'permissions', {
      value: origPerms,
      configurable: true,
    });
  });

  test('calls hideOnboarding when permission is granted', async () => {
    Object.defineProperty(navigator, 'permissions', {
      value: {
        query: jest.fn().mockResolvedValue({
          state: 'granted',
          addEventListener: jest.fn(),
        }),
      },
      configurable: true,
    });
    const hideSpy = jest.spyOn(manager, 'hideOnboarding');
    await manager.checkLocationPermission();
    expect(hideSpy).toHaveBeenCalled();
    expect(manager.isLocationGranted).toBe(true);
  });

  test('calls showOnboarding when permission is prompt/denied', async () => {
    Object.defineProperty(navigator, 'permissions', {
      value: {
        query: jest.fn().mockResolvedValue({
          state: 'prompt',
          addEventListener: jest.fn(),
        }),
      },
      configurable: true,
    });
    const showSpy = jest.spyOn(manager, 'showOnboarding');
    await manager.checkLocationPermission();
    expect(showSpy).toHaveBeenCalled();
  });

  test('calls showOnboarding on permissions query error', async () => {
    Object.defineProperty(navigator, 'permissions', {
      value: {
        query: jest.fn().mockRejectedValue(new Error('fail')),
      },
      configurable: true,
    });
    const showSpy = jest.spyOn(manager, 'showOnboarding');
    await manager.checkLocationPermission();
    expect(showSpy).toHaveBeenCalled();
  });
});

// ─── geolocation event listeners ──────────────────────────────────────────────

describe('OnboardingManager geolocation event listeners', () => {
  beforeEach(() => {
    manager.setupGeolocationListeners();
  });

  test('geolocation:success hides onboarding', () => {
    const hideSpy = jest.spyOn(manager, 'hideOnboarding');
    document.dispatchEvent(new Event('geolocation:success'));
    expect(hideSpy).toHaveBeenCalled();
    expect(manager.isLocationGranted).toBe(true);
  });

  test('geolocation:permission-denied shows onboarding', () => {
    const showSpy = jest.spyOn(manager, 'showOnboarding');
    document.dispatchEvent(new Event('geolocation:permission-denied'));
    expect(showSpy).toHaveBeenCalled();
  });
});
