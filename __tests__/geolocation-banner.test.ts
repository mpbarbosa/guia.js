/**
 * @jest-environment jsdom
 *
 * Tests for src/geolocation-banner.ts.
 *
 * Strategy: mock navigator.permissions / navigator.geolocation before the
 * module executes its init() side-effect, then call exported functions
 * directly and assert on DOM state.
 * Do NOT spy on module-level exports — ESM exports are read-only.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// ── navigator stubs ───────────────────────────────────────────────────────────

const mockPermissionsQuery = jest.fn<() => Promise<{ state: string }>>()
  .mockResolvedValue({ state: 'prompt' });

const mockGeolocationGetCurrentPosition = jest.fn();

Object.defineProperty(navigator, 'permissions', {
  configurable: true,
  writable: true,
  value: { query: mockPermissionsQuery },
});

Object.defineProperty(navigator, 'geolocation', {
  configurable: true,
  writable: true,
  value: { getCurrentPosition: mockGeolocationGetCurrentPosition },
});

// Import after stubs are in place so the module's own init() runs with them.
import {
  checkGeolocationPermission,
  showBanner,
  showSuccessToast,
  createToastContainer,
  showPermissionDeniedMessage,
  destroy,
  getStatus,
  requestPermission,
  dismiss,
} from '../src/geolocation-banner.js';

beforeEach(() => {
  document.body.innerHTML = '';
  mockPermissionsQuery.mockResolvedValue({ state: 'prompt' });
  mockGeolocationGetCurrentPosition.mockReset();
  destroy();
  jest.useFakeTimers();
});

afterEach(() => {
  destroy();
  jest.useRealTimers();
  document.body.innerHTML = '';
});

// ── checkGeolocationPermission ────────────────────────────────────────────────

describe('checkGeolocationPermission', () => {
  it('returns the state reported by navigator.permissions', async () => {
    mockPermissionsQuery.mockResolvedValueOnce({ state: 'granted' });
    const result = await checkGeolocationPermission();
    expect(result).toBe('granted');
  });

  it('returns "prompt" when navigator.permissions is unavailable', async () => {
    const saved = navigator.permissions;
    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    const result = await checkGeolocationPermission();
    expect(result).toBe('prompt');
    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      writable: true,
      value: saved,
    });
  });

  it('returns "prompt" when the permissions query throws', async () => {
    mockPermissionsQuery.mockRejectedValueOnce(new Error('not supported'));
    const result = await checkGeolocationPermission();
    expect(result).toBe('prompt');
  });

  it('returns "denied" when permission is denied', async () => {
    mockPermissionsQuery.mockResolvedValueOnce({ state: 'denied' });
    const result = await checkGeolocationPermission();
    expect(result).toBe('denied');
  });
});

// ── showBanner ────────────────────────────────────────────────────────────────

describe('showBanner', () => {
  it('creates a geolocation-banner element in document.body', () => {
    showBanner();
    expect(document.querySelector('.geolocation-banner')).not.toBeNull();
  });

  it('banner has role=dialog', () => {
    showBanner();
    expect(document.querySelector('.geolocation-banner')?.getAttribute('role')).toBe('dialog');
  });

  it('has an allow button and a dismiss button', () => {
    showBanner();
    expect(document.querySelector('.btn-primary')).not.toBeNull();
    expect(document.querySelector('.btn-secondary')).not.toBeNull();
  });

  it('dismiss button hides the banner', () => {
    showBanner();
    const dismissBtn = document.querySelector('.btn-secondary') as HTMLElement;
    dismissBtn.click();
    const banner = document.querySelector('.geolocation-banner');
    expect(banner?.classList.contains('hidden')).toBe(true);
  });
});

// ── dismiss ───────────────────────────────────────────────────────────────────

describe('dismiss', () => {
  it('adds hidden class to the banner', () => {
    showBanner();
    dismiss();
    const banner = document.querySelector('.geolocation-banner');
    expect(banner?.classList.contains('hidden')).toBe(true);
  });

  it('removes the banner from the DOM after the transition delay', () => {
    showBanner();
    dismiss();
    jest.advanceTimersByTime(400);
    expect(document.querySelector('.geolocation-banner')).toBeNull();
  });

  it('does not throw when no banner is present', () => {
    expect(() => dismiss()).not.toThrow();
  });
});

// ── requestPermission ─────────────────────────────────────────────────────────

describe('requestPermission', () => {
  it('calls navigator.geolocation.getCurrentPosition', () => {
    showBanner();
    requestPermission();
    expect(mockGeolocationGetCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('on success: dispatches geolocation-granted event', () => {
    showBanner();
    const mockPosition = { coords: { latitude: -23.5, longitude: -46.6 } };
    mockGeolocationGetCurrentPosition.mockImplementation(
      (onSuccess: (p: unknown) => void) => onSuccess(mockPosition)
    );

    const handler = jest.fn();
    window.addEventListener('geolocation-granted', handler, { once: true });

    requestPermission();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('shows error when geolocation is not supported', () => {
    const saved = navigator.geolocation;
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    showBanner();
    expect(() => requestPermission()).not.toThrow();
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      writable: true,
      value: saved,
    });
  });
});

// ── createToastContainer ──────────────────────────────────────────────────────

describe('createToastContainer', () => {
  it('creates a .toast-container element', () => {
    expect(document.querySelector('.toast-container')).toBeNull();
    const container = createToastContainer();
    expect(container.classList.contains('toast-container')).toBe(true);
    expect(document.querySelector('.toast-container')).not.toBeNull();
  });

  it('has role=region', () => {
    const container = createToastContainer();
    expect(container.getAttribute('role')).toBe('region');
  });
});

// ── showSuccessToast ──────────────────────────────────────────────────────────

describe('showSuccessToast', () => {
  it('creates a toast.success element', () => {
    showSuccessToast();
    expect(document.querySelector('.toast.success')).not.toBeNull();
  });

  it('auto-removes the toast after its timeout', () => {
    showSuccessToast();
    expect(document.querySelector('.toast.success')).not.toBeNull();
    jest.advanceTimersByTime(3400);
    expect(document.querySelector('.toast.success')).toBeNull();
  });

  it('reuses an existing toast-container', () => {
    createToastContainer();
    showSuccessToast();
    expect(document.querySelectorAll('.toast-container').length).toBe(1);
  });
});

// ── showPermissionDeniedMessage ───────────────────────────────────────────────

describe('showPermissionDeniedMessage', () => {
  it('inserts a status element when #app-content exists', () => {
    const appContent = document.createElement('div');
    appContent.id = 'app-content';
    document.body.appendChild(appContent);

    showPermissionDeniedMessage();

    expect(document.querySelector('.geolocation-status.denied')).not.toBeNull();
  });

  it('does not throw when #app-content is absent', () => {
    expect(() => showPermissionDeniedMessage()).not.toThrow();
  });

  it('status element has role=status', () => {
    const appContent = document.createElement('div');
    appContent.id = 'app-content';
    document.body.appendChild(appContent);

    showPermissionDeniedMessage();

    const status = document.querySelector('.geolocation-status.denied');
    expect(status?.getAttribute('role')).toBe('status');
  });
});

// ── getStatus ─────────────────────────────────────────────────────────────────

describe('getStatus', () => {
  it('returns a string', () => {
    const status = getStatus();
    expect(['prompt', 'granted', 'denied']).toContain(status);
  });
});

// ── destroy ───────────────────────────────────────────────────────────────────

describe('destroy', () => {
  it('removes the geolocation banner', () => {
    showBanner();
    expect(document.querySelector('.geolocation-banner')).not.toBeNull();
    destroy();
    expect(document.querySelector('.geolocation-banner')).toBeNull();
  });

  it('removes the geolocation status element', () => {
    const appContent = document.createElement('div');
    appContent.id = 'app-content';
    document.body.appendChild(appContent);
    showPermissionDeniedMessage();
    destroy();
    expect(document.querySelector('.geolocation-status')).toBeNull();
  });

  it('does not throw on a clean DOM', () => {
    expect(() => destroy()).not.toThrow();
  });
});
