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

async function loadAppModule(
  homeInitPromise: Promise<void>,
  options: { setupGlobalErrorHandlerImpl?: () => void } = {}
) {
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
    setupGlobalErrorHandler: jest.fn(() => {
      options.setupGlobalErrorHandlerImpl?.();
    }),
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

  test('prevents overlapping converter submissions while a request is in flight', async () => {
    document.body.innerHTML = `
      <form id="coords-to-address-form">
        <input id="latitude" value="-23.55" />
        <input id="longitude" value="-46.63" />
        <button type="submit">Converter</button>
      </form>
      <div id="address-result"></div>
    `;

    const response = createDeferred<Response>();
    global.fetch = jest.fn(() => response.promise) as typeof fetch;

    const { module } = await loadAppModule(Promise.resolve());
    module.initializeConverterFeatures();

    const form = document.getElementById('coords-to-address-form') as HTMLFormElement;
    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushMicrotasks();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(submitButton.disabled).toBe(true);

    response.resolve(
      new Response(
        JSON.stringify({
          display_name: 'Rua ABC, São Paulo',
          address: { road: 'Rua ABC', city: 'São Paulo' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    await flushMicrotasks();
    await flushMicrotasks();

    expect(submitButton.disabled).toBe(false);
  });

  test('startApp surfaces initialization failures locally', async () => {
    const startupError = new Error('startup exploded');
    const { module, mockError, mockShowErrorToast } = await loadAppModule(Promise.resolve(), {
      setupGlobalErrorHandlerImpl: () => {
        throw startupError;
      },
    });

    await module.startApp();

    expect(mockError).toHaveBeenCalledWith('Application startup failed:', startupError);
    expect(mockShowErrorToast).toHaveBeenCalledWith('Erro Inesperado', 'startup exploded');
  });
});
