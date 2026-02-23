/**
 * @jest-environment jsdom
 */

/**
 * @file VersionDisplayManager.test.js
 * @description Tests for the VersionDisplayManager singleton.
 */

import { describe, test, expect, beforeEach } from '@jest/globals';

// ─── helpers ──────────────────────────────────────────────────────────────────

// Build minimal DOM that the singleton expects
function buildDom() {
  document.body.innerHTML = `
    <span class="app-version"></span>
    <div class="version-modal-overlay" style="display:none">
      <div class="version-modal">
        <button class="version-modal-close">×</button>
        <span class="version-modal-version"></span>
        <span class="version-modal-date"></span>
        <span class="version-modal-browser"></span>
        <span class="version-modal-os"></span>
      </div>
    </div>
  `;
}

// ─── singleton ────────────────────────────────────────────────────────────────

describe('VersionDisplayManager singleton', () => {
  test('default export is an object', async () => {
    const mod = await import('../../src/utils/version-display-manager.js');
    expect(typeof mod.default).toBe('object');
  });

  test('exposes init, openModal, closeModal methods', async () => {
    const mod = await import('../../src/utils/version-display-manager.js');
    const vdm = mod.default;
    expect(typeof vdm.init).toBe('function');
    expect(typeof vdm.openModal).toBe('function');
    expect(typeof vdm.closeModal).toBe('function');
  });
});

// ─── _getBrowserInfo ──────────────────────────────────────────────────────────

describe('VersionDisplayManager._getBrowserInfo', () => {
  let vdm;
  beforeEach(async () => {
    const mod = await import('../../src/utils/version-display-manager.js');
    vdm = mod.default;
  });

  test('returns a non-empty string', () => {
    const info = vdm._getBrowserInfo();
    expect(typeof info).toBe('string');
    expect(info.length).toBeGreaterThan(0);
  });

  test('falls back to Unknown when UA has no recognisable browser', () => {
    // jest-environment jsdom sets userAgent; we inject a custom one inline
    const origUA = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
      value: 'CustomUA/1.0',
      configurable: true,
    });
    const info = vdm._getBrowserInfo();
    expect(info).toContain('Unknown');
    Object.defineProperty(navigator, 'userAgent', {
      value: origUA,
      configurable: true,
    });
  });

  test('detects Firefox from user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
      configurable: true,
    });
    const info = vdm._getBrowserInfo();
    expect(info).toContain('Firefox');
  });

  test('detects Chrome from user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      configurable: true,
    });
    const info = vdm._getBrowserInfo();
    expect(info).toContain('Chrome');
  });
});

// ─── init populates DOM ───────────────────────────────────────────────────────

describe('VersionDisplayManager.init', () => {
  test('updates .app-version element content', async () => {
    buildDom();
    const mod = await import('../../src/utils/version-display-manager.js');
    mod.default.init();
    const el = document.querySelector('.app-version');
    // Should contain the version string
    expect(el.textContent).toBeTruthy();
  });
});

// ─── openModal / closeModal ───────────────────────────────────────────────────

describe('VersionDisplayManager modal', () => {
  beforeEach(async () => {
    buildDom();
    const mod = await import('../../src/utils/version-display-manager.js');
    mod.default.init();
  });

  test('openModal sets isModalOpen to true', async () => {
    const { default: vdm } = await import('../../src/utils/version-display-manager.js');
    vdm.openModal();
    expect(vdm.isModalOpen).toBe(true);
  });

  test('closeModal sets isModalOpen to false', async () => {
    const { default: vdm } = await import('../../src/utils/version-display-manager.js');
    vdm.openModal();
    vdm.closeModal();
    expect(vdm.isModalOpen).toBe(false);
  });
});
