/**
 * @jest-environment jsdom
 *
 * Tests for utility functions exported from src/app.ts that are not
 * covered by route-handling.test.ts:
 *   updateActiveNavLink, navigateTo, showLoading, showError,
 *   manageFocusAfterRouteChange
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

// ── shared loadAppModule helper (mirrors route-handling.test.ts) ──────────────

async function loadAppModule() {
  jest.resetModules();

  const mockHomeController = { init: jest.fn(() => Promise.resolve()), destroy: jest.fn() };

  jest.unstable_mockModule('../../src/views/home.js', () => ({
    default: jest.fn(() => mockHomeController),
  }));
  jest.unstable_mockModule('../../src/html/HTMLHeaderDisplayer.js', () => ({
    default: { create: jest.fn() },
  }));
  jest.unstable_mockModule('../../src/utils/logger.js', () => ({
    debug: jest.fn(), log: jest.fn(), warn: jest.fn(), error: jest.fn(),
  }));
  jest.unstable_mockModule('../../src/config/version.js', () => ({
    VERSION_STRING: 'v-test',
  }));
  jest.unstable_mockModule('../../src/config/environment.js', () => ({
    env: { nominatimApiUrl: 'https://api.nominatim.org' },
  }));
  jest.unstable_mockModule('../../src/config/routes.js', () => ({
    getConverterViewTemplate: jest.fn(() => '<div>Converter</div>'),
    getNotFoundViewTemplate:  jest.fn(() => '<div>Not Found</div>'),
    getLoadingTemplate:       jest.fn(() => '<div class="loading-sentinel">Loading…</div>'),
    getErrorTemplate:         jest.fn((err: Error) => `<div class="error-sentinel">${err.message}</div>`),
  }));
  jest.unstable_mockModule('../../src/utils/ErrorBoundary.js', () => ({
    createDefaultErrorBoundary: jest.fn(() => ({ wrap: (fn: () => Promise<void>) => fn })),
    setupGlobalErrorHandler: jest.fn(),
  }));
  jest.unstable_mockModule('../../src/utils/error-notifications.js', () => ({
    showErrorToast: jest.fn(),
  }));
  jest.unstable_mockModule('../../src/services/OverpassService.js', () => ({
    findNearby: jest.fn(),
  }));
  jest.unstable_mockModule('../../src/services/IBGECityStatsService.js', () => ({
    fetchStats: jest.fn(),
  }));
  jest.unstable_mockModule('../../src/html/HTMLNearbyPlacesPanel.js', () => ({
    default: class { showLoading() {} render() {} showError() {} },
  }));
  jest.unstable_mockModule('../../src/html/HTMLCityStatsPanel.js', () => ({
    default: class { showLoading() {} render() {} showError() {} },
  }));
  jest.unstable_mockModule('../../src/html/HTMLConfirmationThresholdSlider.js', () => ({
    default: class { destroy() {} },
  }));

  return import('../../src/app.ts');
}

// ── DOM scaffold ──────────────────────────────────────────────────────────────

function buildDom() {
  document.body.innerHTML = `
    <div id="app-loading" class="hidden"></div>
    <div id="app-content"></div>
    <nav class="app-navigation">
      <a href="#/">Home</a>
      <a href="#/converter">Converter</a>
    </nav>
    <footer class="app-footer">
      <a href="#/">Footer Home</a>
    </footer>
    <div id="main-nav" hidden></div>
    <button id="nav-toggle" aria-expanded="false"></button>
    <div id="lbs-provider-indicator"></div>
    <div id="lbs-provider-name"></div>
    <button id="provider-switch-btn"></button>
    <button id="findRestaurantsBtn"></button>
    <button id="cityStatsBtn"></button>
  `;
  window.location.hash = '#/';
}

beforeEach(buildDom);
afterEach(() => { document.body.innerHTML = ''; });

// ── updateActiveNavLink ───────────────────────────────────────────────────────

describe('updateActiveNavLink', () => {
  test('marks the current hash link as active', async () => {
    window.location.hash = '#/';
    const { updateActiveNavLink } = await loadAppModule();
    updateActiveNavLink();

    const homeLink = document.querySelector('a[href="#/"]') as HTMLElement;
    expect(homeLink.classList.contains('active')).toBe(true);
    expect(homeLink.getAttribute('aria-current')).toBe('page');
  });

  test('removes active from non-current links', async () => {
    window.location.hash = '#/';
    const { updateActiveNavLink } = await loadAppModule();
    updateActiveNavLink();

    const converterLink = document.querySelector('a[href="#/converter"]') as HTMLElement;
    expect(converterLink.classList.contains('active')).toBe(false);
    expect(converterLink.getAttribute('aria-current')).toBeNull();
  });

  test('switches active link when hash changes', async () => {
    window.location.hash = '#/converter';
    const { updateActiveNavLink } = await loadAppModule();
    updateActiveNavLink();

    const homeLink      = document.querySelector('a[href="#/"]') as HTMLElement;
    const converterLink = document.querySelector('a[href="#/converter"]') as HTMLElement;

    expect(homeLink.classList.contains('active')).toBe(false);
    expect(converterLink.classList.contains('active')).toBe(true);
  });

  test('marks all matching links (nav + footer) as active', async () => {
    window.location.hash = '#/';
    const { updateActiveNavLink } = await loadAppModule();
    updateActiveNavLink();

    const homeLinks = document.querySelectorAll('a[href="#/"]');
    homeLinks.forEach(link => {
      expect(link.classList.contains('active')).toBe(true);
    });
  });

  test('does not throw when no nav links exist', async () => {
    document.body.innerHTML = '<div id="app-content"></div>';
    const { updateActiveNavLink } = await loadAppModule();
    expect(() => updateActiveNavLink()).not.toThrow();
  });
});

// ── navigateTo ────────────────────────────────────────────────────────────────

describe('navigateTo', () => {
  test('sets window.location.hash to the given path', async () => {
    const { navigateTo } = await loadAppModule();
    navigateTo('#/converter');
    expect(window.location.hash).toBe('#/converter');
  });

  test('navigates to root', async () => {
    window.location.hash = '#/converter';
    const { navigateTo } = await loadAppModule();
    navigateTo('#/');
    expect(window.location.hash).toBe('#/');
  });
});

// ── showLoading ───────────────────────────────────────────────────────────────

describe('showLoading', () => {
  test('renders the loading template into #app-content', async () => {
    const { showLoading } = await loadAppModule();
    showLoading();
    const content = document.getElementById('app-content');
    expect(content?.innerHTML).toContain('loading-sentinel');
  });

  test('does not throw when #app-content is absent', async () => {
    document.getElementById('app-content')?.remove();
    const { showLoading } = await loadAppModule();
    expect(() => showLoading()).not.toThrow();
  });
});

// ── showError ─────────────────────────────────────────────────────────────────

describe('showError', () => {
  test('renders error template into #app-content', async () => {
    const { showError } = await loadAppModule();
    showError(new Error('something broke'));
    const content = document.getElementById('app-content');
    expect(content?.innerHTML).toContain('error-sentinel');
    expect(content?.innerHTML).toContain('something broke');
  });

  test('does not throw when #app-content is absent', async () => {
    document.getElementById('app-content')?.remove();
    const { showError } = await loadAppModule();
    expect(() => showError(new Error('no container'))).not.toThrow();
  });
});

// ── manageFocusAfterRouteChange ───────────────────────────────────────────────

describe('manageFocusAfterRouteChange', () => {
  test('focuses on the h1 heading in #app-content when present', async () => {
    // requestAnimationFrame does not fire automatically in jsdom — replace it
    // with a synchronous implementation for this test.
    const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(
      (cb: FrameRequestCallback) => { cb(0); return 0; }
    );

    const content = document.getElementById('app-content') as HTMLElement;
    const h1 = document.createElement('h1');
    h1.textContent = 'Onde estou?';
    content.appendChild(h1);

    const focusSpy = jest.spyOn(h1, 'focus');

    const { manageFocusAfterRouteChange } = await loadAppModule();
    manageFocusAfterRouteChange();

    expect(focusSpy).toHaveBeenCalled();
    expect(h1.getAttribute('tabindex')).toBe('-1');

    rafSpy.mockRestore();
  });

  test('does not throw when no h1 or app-content exists', async () => {
    document.body.innerHTML = '';
    const { manageFocusAfterRouteChange } = await loadAppModule();
    expect(() => manageFocusAfterRouteChange()).not.toThrow();
  });
});
