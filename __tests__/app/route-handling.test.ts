/**
 * @jest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

async function loadAppModule(homeInitPromise: Promise<void>) {
  jest.resetModules();

  const mockHomeController = {
    init: jest.fn(() => homeInitPromise),
    destroy: jest.fn(),
  };
  const mockCreateHeader = jest.fn();
  const mockLog = jest.fn();
  const mockWarn = jest.fn();
  const mockError = jest.fn();
  const mockShowErrorToast = jest.fn();
  const mockGetConverterViewTemplate = jest.fn(() => '<div>Converter View</div>');
  const mockGetNotFoundViewTemplate = jest.fn(() => '<div>Not Found</div>');
  const mockGetLoadingTemplate = jest.fn(() => '<div>Loading...</div>');
  const mockGetErrorTemplate = jest.fn(() => '<div>Error</div>');

  jest.unstable_mockModule('../../src/views/home.js', () => ({
    default: jest.fn(() => mockHomeController),
  }));
  jest.unstable_mockModule('../../src/html/HTMLHeaderDisplayer.js', () => ({
    default: { create: mockCreateHeader },
  }));
  jest.unstable_mockModule('../../src/utils/logger.js', () => ({
    debug: jest.fn(),
    log: mockLog,
    warn: mockWarn,
    error: mockError,
  }));
  jest.unstable_mockModule('../../src/config/version.js', () => ({
    VERSION_STRING: 'v0.24.9-alpha',
  }));
  jest.unstable_mockModule('../../src/config/environment.js', () => ({
    env: { nominatimApiUrl: 'https://api.nominatim.org' },
  }));
  jest.unstable_mockModule('../../src/config/routes.js', () => ({
    getConverterViewTemplate: mockGetConverterViewTemplate,
    getNotFoundViewTemplate: mockGetNotFoundViewTemplate,
    getLoadingTemplate: mockGetLoadingTemplate,
    getErrorTemplate: mockGetErrorTemplate,
  }));
  jest.unstable_mockModule('../../src/utils/ErrorBoundary.js', () => ({
    createDefaultErrorBoundary: jest.fn(() => ({
      wrap: (fn: () => Promise<void>) => fn,
    })),
    setupGlobalErrorHandler: jest.fn(),
  }));
  jest.unstable_mockModule('../../src/utils/error-notifications.js', () => ({
    showErrorToast: mockShowErrorToast,
  }));
  jest.unstable_mockModule('../../src/services/OverpassService.js', () => ({
    findNearby: jest.fn(),
  }));
  jest.unstable_mockModule('../../src/services/IBGECityStatsService.js', () => ({
    fetchStats: jest.fn(),
  }));
  jest.unstable_mockModule('../../src/html/HTMLNearbyPlacesPanel.js', () => ({
    default: class HTMLNearbyPlacesPanel {
      showLoading(): void {}
      render(): void {}
      showError(): void {}
    },
  }));
  jest.unstable_mockModule('../../src/html/HTMLCityStatsPanel.js', () => ({
    default: class HTMLCityStatsPanel {
      showLoading(): void {}
      render(): void {}
      showError(): void {}
    },
  }));
  jest.unstable_mockModule('../../src/html/HTMLConfirmationThresholdSlider.js', () => ({
    default: class HTMLConfirmationThresholdSlider {
      destroy(): void {}
    },
  }));

  const module = await import('../../src/app.ts');

  return {
    module,
    mockCreateHeader,
    mockError,
    mockGetConverterViewTemplate,
    mockHomeController,
    mockLog,
    mockShowErrorToast,
    mockWarn,
  };
}

describe('app route handling', () => {
  const originalReadyState = document.readyState;

  beforeEach(() => {
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
      <div id="lbs-provider-indicator"></div>
      <div id="lbs-provider-name"></div>
      <button id="provider-switch-btn"></button>
      <button id="findRestaurantsBtn"></button>
      <button id="cityStatsBtn"></button>
    `;

    Object.defineProperty(document, 'readyState', {
      configurable: true,
      value: 'loading',
    });

    window.location.hash = '#/';
  });

  afterEach(() => {
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      value: originalReadyState,
    });
  });

  test('applies the latest route after a slow home initialization', async () => {
    const homeInit = createDeferred<void>();
    const { module, mockHomeController } = await loadAppModule(homeInit.promise);

    const firstRoute = module.handleRoute();
    await flushMicrotasks();

    window.location.hash = '#/converter';
    const secondRoute = module.handleRoute();
    await flushMicrotasks();

    expect(mockHomeController.init).toHaveBeenCalledTimes(1);
    expect(mockHomeController.destroy).not.toHaveBeenCalled();

    homeInit.resolve();
    await Promise.all([firstRoute, secondRoute]);

    expect(mockHomeController.destroy).toHaveBeenCalledTimes(1);
    expect(document.getElementById('app-content')?.innerHTML).toContain('Converter View');
    expect((window as Window & { GuiaApp?: { getState?: () => { currentRoute: string | null } } }).GuiaApp?.getState?.().currentRoute)
      .toBe('/converter');
  });
});
