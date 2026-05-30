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
    <main id="app-content">
      <a id="background-link" href="#main">Background</a>
    </main>
    <footer>
      <span class="app-version" tabindex="0"></span>
      <div id="lbs-provider-indicator">Provider</div>
      <div class="version-modal-overlay" style="display:none" aria-hidden="true">
        <div class="version-modal" id="version-modal-dialog" tabindex="-1">
          <a href="#changelog" class="version-changelog-link">Changelog</a>
          <button class="version-modal-close">×</button>
          <span id="modal-version"></span>
          <span id="modal-build-date"></span>
          <span id="modal-browser"></span>
          <span id="modal-user-agent"></span>
        </div>
      </div>
    </footer>
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

  test('openModal hides background content from assistive tech', async () => {
    const { default: vdm } = await import('../../src/utils/version-display-manager.js');
    vdm.openModal();

    expect(document.getElementById('app-content')?.getAttribute('aria-hidden')).toBe('true');
    expect(document.getElementById('app-content')?.hasAttribute('inert')).toBe(true);
    expect(document.getElementById('lbs-provider-indicator')?.getAttribute('aria-hidden')).toBe('true');
    expect(document.querySelector('.app-version')?.getAttribute('aria-hidden')).toBe('true');
    expect(document.querySelector('.version-modal-overlay')?.getAttribute('aria-hidden')).toBe('false');
  });

  test('closeModal restores background accessibility state', async () => {
    const { default: vdm } = await import('../../src/utils/version-display-manager.js');
    vdm.openModal();
    vdm.closeModal();

    expect(document.getElementById('app-content')?.hasAttribute('inert')).toBe(false);
    expect(document.getElementById('app-content')?.hasAttribute('aria-hidden')).toBe(false);
    expect(document.querySelector('.version-modal-overlay')?.getAttribute('aria-hidden')).toBe('true');
  });

  test('traps focus within the modal when tabbing forward', async () => {
    const { default: vdm } = await import('../../src/utils/version-display-manager.js');
    vdm.openModal();

    const closeButton = document.querySelector('.version-modal-close');
    const link = document.querySelector('.version-changelog-link');
    closeButton.focus();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));

    expect(document.activeElement).toBe(link);
  });

  test('traps focus within the modal when tabbing backward', async () => {
    const { default: vdm } = await import('../../src/utils/version-display-manager.js');
    vdm.openModal();

    const closeButton = document.querySelector('.version-modal-close');
    const link = document.querySelector('.version-changelog-link');
    link.focus();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));

    expect(document.activeElement).toBe(closeButton);
  });
});
