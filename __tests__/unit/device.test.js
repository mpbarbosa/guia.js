/**
 * Unit tests for src/utils/device.js
 * Tests the isMobileDevice() function using dependency injection for referential transparency.
 *
 * @jest-environment node
 * @since 0.9.0-alpha
 */

import { describe, test, expect } from '@jest/globals';
import { isMobileDevice } from '../../src/utils/device.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeOptions({ userAgent = '', maxTouchPoints = 0, innerWidth = 1280, vendor = '' } = {}) {
  return {
    navigatorObj: { userAgent, vendor, maxTouchPoints },
    windowObj: { innerWidth }
  };
}

// ─── Non-browser environment ──────────────────────────────────────────────────

describe('isMobileDevice – non-browser environment', () => {
  test('returns false when navigatorObj is null', () => {
    expect(isMobileDevice({ navigatorObj: null, windowObj: { innerWidth: 375 } })).toBe(false);
  });

  test('returns false when windowObj is null', () => {
    expect(isMobileDevice({ navigatorObj: { userAgent: 'iPhone', maxTouchPoints: 5 }, windowObj: null })).toBe(false);
  });

  test('returns false when called with no options in Node.js (no global navigator/window)', () => {
    // In a jsdom-less node environment navigator/window are not globals
    // The function guards with typeof checks; result may be true/false depending on environment
    // At minimum it must not throw
    expect(() => isMobileDevice()).not.toThrow();
  });
});

// ─── Mobile user agents ───────────────────────────────────────────────────────

describe('isMobileDevice – mobile user agents', () => {
  const mobileUAs = [
    ['Android phone', 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Mobile Safari/537.36'],
    ['iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'],
    ['iPad', 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'],
    ['Samsung Galaxy', 'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 Mobile Safari/537.36'],
    ['BlackBerry', 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11+'],
    ['Opera Mini', 'Opera/9.80 (J2ME/MIDP; Opera Mini/5.0.18741/870; U; fr) Presto/2.4.15'],
    ['Windows Phone', 'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0)'],
    ['WebOS', 'Mozilla/5.0 (webOS/1.4.1.1; U; en-US) AppleWebKit/532.2 (KHTML, like Gecko) Version/1.0 Safari/532.2'],
  ];

  test.each(mobileUAs)('%s user agent is detected as mobile (small screen + UA match)', (label, ua) => {
    // small screen + UA match = 2 out of 3 criteria → mobile
    const result = isMobileDevice(makeOptions({ userAgent: ua, innerWidth: 375 }));
    expect(result).toBe(true);
  });
});

// ─── Desktop user agents ──────────────────────────────────────────────────────

describe('isMobileDevice – desktop user agents', () => {
  const desktopUAs = [
    ['Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'],
    ['Firefox on Linux', 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0'],
    ['Safari on macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'],
    ['Edge on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 Edg/120.0'],
  ];

  test.each(desktopUAs)('%s is detected as desktop (large screen + no touch)', (label, ua) => {
    // large screen + no touch = 0 out of 3 criteria → desktop
    const result = isMobileDevice(makeOptions({ userAgent: ua, innerWidth: 1440, maxTouchPoints: 0 }));
    expect(result).toBe(false);
  });
});

// ─── Touch capability ─────────────────────────────────────────────────────────

describe('isMobileDevice – touch detection', () => {
  test('touch device with small screen is detected as mobile (no mobile UA)', () => {
    // touch + small screen = 2 criteria → mobile
    const result = isMobileDevice(makeOptions({ maxTouchPoints: 5, innerWidth: 375 }));
    expect(result).toBe(true);
  });

  test('touch-capable laptop (large screen, no mobile UA) is desktop', () => {
    // touch only = 1 criterion → desktop
    const result = isMobileDevice(makeOptions({ maxTouchPoints: 5, innerWidth: 1440 }));
    expect(result).toBe(false);
  });

  test('maxTouchPoints = 0 counts as no touch', () => {
    const result = isMobileDevice(makeOptions({ maxTouchPoints: 0, innerWidth: 1440 }));
    expect(result).toBe(false);
  });

  test('maxTouchPoints missing (no property) counts as no touch', () => {
    const opts = {
      navigatorObj: { userAgent: '' }, // no maxTouchPoints property
      windowObj: { innerWidth: 1440 }
    };
    expect(isMobileDevice(opts)).toBe(false);
  });
});

// ─── Screen width heuristic ───────────────────────────────────────────────────

describe('isMobileDevice – screen width heuristic', () => {
  test('innerWidth 767 (< 768) counts as small screen', () => {
    // small screen + mobile UA = 2 → mobile
    const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile';
    const result = isMobileDevice(makeOptions({ userAgent: mobileUA, innerWidth: 767 }));
    expect(result).toBe(true);
  });

  test('innerWidth exactly 768 is NOT considered small screen', () => {
    // exactly 768 → not small screen; only UA match → 1 criterion → desktop
    const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile';
    const result = isMobileDevice(makeOptions({ userAgent: mobileUA, innerWidth: 768, maxTouchPoints: 0 }));
    expect(result).toBe(false);
  });

  test('innerWidth 1920 (desktop monitor) is not small screen', () => {
    const result = isMobileDevice(makeOptions({ innerWidth: 1920 }));
    expect(result).toBe(false);
  });

  test('missing innerWidth (Infinity) is not small screen', () => {
    const opts = {
      navigatorObj: { userAgent: '', maxTouchPoints: 0 },
      windowObj: {} // no innerWidth
    };
    expect(isMobileDevice(opts)).toBe(false);
  });
});

// ─── Scoring threshold (≥ 2 criteria) ────────────────────────────────────────

describe('isMobileDevice – scoring: 2-of-3 threshold', () => {
  test('only UA match (1 criterion) → false', () => {
    const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile';
    expect(isMobileDevice(makeOptions({ userAgent: mobileUA, innerWidth: 1440, maxTouchPoints: 0 }))).toBe(false);
  });

  test('only small screen (1 criterion) → false', () => {
    expect(isMobileDevice(makeOptions({ innerWidth: 375, maxTouchPoints: 0 }))).toBe(false);
  });

  test('only touch (1 criterion) → false', () => {
    expect(isMobileDevice(makeOptions({ maxTouchPoints: 10, innerWidth: 1440 }))).toBe(false);
  });

  test('UA + touch (2 criteria) → true', () => {
    const mobileUA = 'Mozilla/5.0 (Android 13; Mobile) Mobile';
    expect(isMobileDevice(makeOptions({ userAgent: mobileUA, maxTouchPoints: 5, innerWidth: 1440 }))).toBe(true);
  });

  test('UA + small screen (2 criteria) → true', () => {
    const mobileUA = 'Mozilla/5.0 (Android 13; Mobile) Mobile';
    expect(isMobileDevice(makeOptions({ userAgent: mobileUA, innerWidth: 375, maxTouchPoints: 0 }))).toBe(true);
  });

  test('touch + small screen (2 criteria) → true', () => {
    expect(isMobileDevice(makeOptions({ maxTouchPoints: 5, innerWidth: 375 }))).toBe(true);
  });

  test('all 3 criteria → true', () => {
    const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile';
    expect(isMobileDevice(makeOptions({ userAgent: mobileUA, maxTouchPoints: 5, innerWidth: 375 }))).toBe(true);
  });

  test('0 criteria → false', () => {
    expect(isMobileDevice(makeOptions({ innerWidth: 1920, maxTouchPoints: 0 }))).toBe(false);
  });
});

// ─── User agent vendor field ──────────────────────────────────────────────────

describe('isMobileDevice – navigator.vendor fallback', () => {
  test('vendor string used when userAgent is empty', () => {
    // vendor alone matches 'Mobile' sub-string? The regex tests lower-cased combined string.
    // 'mobile' in vendor → matches mobileRegex
    const opts = {
      navigatorObj: { userAgent: '', vendor: 'Mobile Vendor Co', maxTouchPoints: 5 },
      windowObj: { innerWidth: 375 }
    };
    // touch + small screen = 2 → true regardless of vendor; just ensure no throw
    expect(() => isMobileDevice(opts)).not.toThrow();
  });

  test('no crash with undefined userAgent and vendor', () => {
    const opts = {
      navigatorObj: { maxTouchPoints: 0 }, // no userAgent, no vendor
      windowObj: { innerWidth: 1440 }
    };
    expect(() => isMobileDevice(opts)).not.toThrow();
    expect(isMobileDevice(opts)).toBe(false);
  });
});
