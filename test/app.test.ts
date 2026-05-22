import '@testing-library/jest-dom';

const mockHomeInit = jest.fn();
const mockHomeDestroy = jest.fn();
const mockHomeGetBrazilianStandardAddress = jest.fn();
const mockHomeGetPrimaryProvider = jest.fn(() => 'aws');
const mockHomeSwitchProvider = jest.fn(() => true);
const mockHasAwsProvider = jest.fn(() => true);

jest.mock('../src/views/home.js', () => {
  return jest.fn().mockImplementation(() => ({
    init: mockHomeInit,
    destroy: mockHomeDestroy,
    manager: {
      getBrazilianStandardAddress: mockHomeGetBrazilianStandardAddress,
      getPrimaryProvider: mockHomeGetPrimaryProvider,
      switchProvider: mockHomeSwitchProvider,
      reverseGeocoder: {
        hasAwsProvider: mockHasAwsProvider,
      },
    },
  }));
});

const mockHeaderCreate = jest.fn();
jest.mock('../src/html/HTMLHeaderDisplayer.js', () => ({
  __esModule: true,
  default: { create: mockHeaderCreate },
}));

const mockDebug = jest.fn();
const mockLog = jest.fn();
const mockWarn = jest.fn();
const mockError = jest.fn();
jest.mock('../src/utils/logger.js', () => ({
  debug: (...args: unknown[]) => mockDebug(...args),
  log: (...args: unknown[]) => mockLog(...args),
  warn: (...args: unknown[]) => mockWarn(...args),
  error: (...args: unknown[]) => mockError(...args),
}));

jest.mock('../src/config/version.js', () => ({
  VERSION_STRING: 'v0.9.0-alpha',
}));

jest.mock('../src/config/environment.js', () => ({
  env: { nominatimApiUrl: 'https://api.nominatim.org' },
}));

const mockGetConverterViewTemplate = jest.fn(
  () => '<form id="coords-to-address-form"><input id="latitude" value="-23.5" /><input id="longitude" value="-46.6" /><div id="address-result"></div></form>'
);
const mockGetNotFoundViewTemplate = jest.fn(() => '<h1>Not Found</h1>');
const mockGetLoadingTemplate = jest.fn(() => '<h1>Loading</h1>');
const mockGetErrorTemplate = jest.fn((err: Error) => `<div class="error">${err.message}</div>`);
jest.mock('../src/config/routes.js', () => ({
  getConverterViewTemplate: () => mockGetConverterViewTemplate(),
  getNotFoundViewTemplate: () => mockGetNotFoundViewTemplate(),
  getLoadingTemplate: () => mockGetLoadingTemplate(),
  getErrorTemplate: (err: Error) => mockGetErrorTemplate(err),
}));

const mockWrap = jest.fn((fn: () => Promise<void>) => fn);
const mockCreateDefaultErrorBoundary = jest.fn(() => ({
  wrap: mockWrap,
}));
const mockSetupGlobalErrorHandler = jest.fn();
jest.mock('../src/utils/ErrorBoundary.js', () => ({
  createDefaultErrorBoundary: (...args: unknown[]) => mockCreateDefaultErrorBoundary(...args),
  setupGlobalErrorHandler: (...args: unknown[]) => mockSetupGlobalErrorHandler(...args),
}));

const mockShowErrorToast = jest.fn();
jest.mock('../src/utils/error-notifications.js', () => ({
  showErrorToast: (...args: unknown[]) => mockShowErrorToast(...args),
}));

const mockFindNearby = jest.fn();
jest.mock('../src/services/OverpassService.js', () => ({
  findNearby: (...args: unknown[]) => mockFindNearby(...args),
}));

const mockFetchStats = jest.fn();
jest.mock('../src/services/IBGECityStatsService.js', () => ({
  fetchStats: (...args: unknown[]) => mockFetchStats(...args),
}));

const mockNearbyShowLoading = jest.fn();
const mockNearbyRender = jest.fn();
const mockNearbyShowError = jest.fn();
jest.mock('../src/html/HTMLNearbyPlacesPanel.js', () => {
  return jest.fn().mockImplementation(() => ({
    showLoading: mockNearbyShowLoading,
    render: mockNearbyRender,
    showError: mockNearbyShowError,
  }));
});

const mockCityShowLoading = jest.fn();
const mockCityRender = jest.fn();
const mockCityShowError = jest.fn();
jest.mock('../src/html/HTMLCityStatsPanel.js', () => {
  return jest.fn().mockImplementation(() => ({
    showLoading: mockCityShowLoading,
    render: mockCityRender,
    showError: mockCityShowError,
  }));
});

const mockSliderDestroy = jest.fn();
jest.mock('../src/html/HTMLConfirmationThresholdSlider.js', () => {
  return jest.fn().mockImplementation(() => ({
    destroy: mockSliderDestroy,
  }));
});

jest.mock('bootstrap-icons/font/bootstrap-icons.css', () => ({}));

import * as appModule from '../src/app';

describe('src/app.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    document.body.innerHTML = `
      <div id="app-loading"></div>
      <div id="app-content"></div>
      <div id="address-confirmation-threshold-control"></div>
      <nav class="app-navigation">
        <a href="#/">Home</a>
        <a href="#/converter">Converter</a>
      </nav>
      <footer class="app-footer">
        <a href="#/">Footer Home</a>
      </footer>
      <div id="main-nav"></div>
      <button id="nav-toggle"></button>
      <div id="lbs-provider-indicator"></div>
      <div id="lbs-provider-name"></div>
      <button id="provider-switch-btn"></button>
      <button id="findRestaurantsBtn"></button>
      <button id="cityStatsBtn"></button>
    `;

    window.location.hash = '#/';
    (window as Window & { dependenciesLoading?: boolean }).dependenciesLoading = false;
    (global as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('updates hash in navigateTo', () => {
    appModule.navigateTo('#/converter');
    expect(window.location.hash).toBe('#/converter');
  });

  it('marks the active nav link', () => {
    window.location.hash = '#/converter';
    appModule.updateActiveNavLink();

    const link = document.querySelector('.app-navigation a[href="#/converter"]');
    expect(link?.getAttribute('aria-current')).toBe('page');
    expect(link?.classList.contains('active')).toBe(true);
  });

  it('renders loading state', () => {
    appModule.showLoading();
    expect(document.getElementById('app-content')?.innerHTML).toContain('Loading');
  });

  it('renders error state', () => {
    appModule.showError(new Error('boom'));
    expect(document.getElementById('app-content')?.innerHTML).toContain('boom');
  });

  it('focuses h1 after route change when heading exists', () => {
    const content = document.getElementById('app-content')!;
    content.innerHTML = '<h1>Heading</h1>';

    appModule.manageFocusAfterRouteChange();

    expect(document.activeElement).toBe(content.querySelector('h1'));
  });

  it('focuses main content when no heading exists', () => {
    const content = document.getElementById('app-content')!;
    content.innerHTML = '<div>No heading</div>';

    appModule.manageFocusAfterRouteChange();

    expect(document.activeElement).toBe(content);
  });

  it('warns when main content is missing during focus management', () => {
    document.getElementById('app-content')?.remove();

    appModule.manageFocusAfterRouteChange();

    expect(mockWarn).toHaveBeenCalledWith('Main content element not found for focus management');
  });

  it('initializes app and wires browser listeners', async () => {
    await appModule.init();

    expect(mockSetupGlobalErrorHandler).toHaveBeenCalledWith(expect.any(Function));
    expect(mockHeaderCreate).toHaveBeenCalledWith(document);
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Initializing'));
  });

  it('waits for dependencies-ready when dependencies are loading', async () => {
    (window as Window & { dependenciesLoading?: boolean }).dependenciesLoading = true;

    const promise = appModule.init();
    window.dispatchEvent(new Event('dependencies-ready'));
    await promise;

    expect(mockLog).toHaveBeenCalledWith('✓ Dependencies ready');
  });

  it('handles dependency timeout fallback', async () => {
    (window as Window & { dependenciesLoading?: boolean }).dependenciesLoading = true;

    const promise = appModule.init();
    jest.advanceTimersByTime(5000);
    await promise;

    expect(mockWarn).toHaveBeenCalledWith(
      '⚠️ Dependency loading timeout - continuing with fallback:',
      'Dependency timeout'
    );
  });

  it('loads converter route', async () => {
    window.location.hash = '#/converter';
    await appModule.handleRoute();

    expect(mockGetConverterViewTemplate).toHaveBeenCalled();
    expect(document.getElementById('app-content')?.innerHTML).toContain('coords-to-address-form');
  });

  it('loads not-found route for unknown paths', async () => {
    window.location.hash = '#/does-not-exist';
    await appModule.handleRoute();

    expect(mockGetNotFoundViewTemplate).toHaveBeenCalled();
    expect(document.getElementById('app-content')?.innerHTML).toContain('Not Found');
  });

  it('clears content for vue-only routes', async () => {
    const content = document.getElementById('app-content')!;
    content.innerHTML = '<p>existing</p>';

    window.location.hash = '#/map';
    await appModule.handleRoute();

    expect(content.innerHTML).toBe('');
  });

  it('initializes home view on root route', async () => {
    window.location.hash = '#/';
    await appModule.handleRoute();

    expect(mockHomeInit).toHaveBeenCalled();
  });

  it('submits converter form and renders fetched address', async () => {
    (global as typeof globalThis & { fetch: jest.Mock }).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        display_name: 'Avenida Paulista, São Paulo',
        address: { road: 'Avenida Paulista', city: 'São Paulo', state: 'SP' },
      }),
    });

    await appModule.loadConverterView();

    const form = document.getElementById('coords-to-address-form')!;
    form.dispatchEvent(new Event('submit'));

    await Promise.resolve();
    await Promise.resolve();

    expect((global as typeof globalThis & { fetch: jest.Mock }).fetch).toHaveBeenCalled();
    expect(document.getElementById('address-result')?.innerHTML).toContain('Endereço Encontrado');
  });

  it('renders converter error when fetch fails', async () => {
    (global as typeof globalThis & { fetch: jest.Mock }).fetch.mockResolvedValue({
      ok: false,
    });

    await appModule.loadConverterView();

    const form = document.getElementById('coords-to-address-form')!;
    form.dispatchEvent(new Event('submit'));

    await Promise.resolve();
    await Promise.resolve();

    expect(document.getElementById('address-result')?.innerHTML).toContain('Erro na Conversão');
  });

  it('updates provider indicator on geocoder-provider-used', async () => {
    await appModule.init();
    window.dispatchEvent(new CustomEvent('geocoder-provider-used', { detail: { provider: 'aws' } }));

    expect(document.getElementById('lbs-provider-name')?.textContent).toContain('AWS');
    expect(document.getElementById('provider-switch-btn')?.hidden).toBe(false);
  });

  it('updates provider label on geocoder-provider-changed', async () => {
    await appModule.init();
    window.dispatchEvent(new CustomEvent('geocoder-provider-changed', { detail: { provider: 'nominatim' } }));

    expect(document.getElementById('lbs-provider-name')?.textContent).toContain('OpenStreetMap Nominatim');
  });

  it('switches provider when provider switch button is clicked', async () => {
    await appModule.init();

    const btn = document.getElementById('provider-switch-btn') as HTMLButtonElement;
    btn.click();

    expect(mockHomeSwitchProvider).toHaveBeenCalledWith('nominatim');
  });

  it('findNearbyRestaurants renders nearby places', async () => {
    mockFindNearby.mockResolvedValue([{ id: 1, name: 'Restaurante A' }]);

    await appModule.init();
    await (window as Window & { findNearbyRestaurants(lat: number, lon: number): Promise<void> }).findNearbyRestaurants(1, 2);

    expect(mockNearbyShowLoading).toHaveBeenCalledWith('restaurant');
    expect(mockNearbyRender).toHaveBeenCalled();
  });

  it('findNearbyRestaurants shows error on failure', async () => {
    mockFindNearby.mockRejectedValue(new Error('boom'));

    await appModule.init();
    await (window as Window & { findNearbyRestaurants(lat: number, lon: number): Promise<void> }).findNearbyRestaurants(1, 2);

    expect(mockNearbyShowError).toHaveBeenCalledWith('Não foi possível buscar restaurantes próximos.');
  });

  it('fetchCityStatistics shows error when municipality is unavailable', async () => {
    mockHomeGetBrazilianStandardAddress.mockReturnValue(null);

    await appModule.init();
    await (window as Window & { fetchCityStatistics(lat: number, lon: number): Promise<void> }).fetchCityStatistics(1, 2);

    expect(mockCityShowError).toHaveBeenCalledWith(
      'Aguardando localização para obter dados do município.'
    );
  });

  it('fetchCityStatistics renders stats when address and stats are available', async () => {
    mockHomeGetBrazilianStandardAddress.mockReturnValue({ municipio: 'São Paulo', siglaUF: 'SP' });
    mockFetchStats.mockResolvedValue({ populacao: 1000 });

    await appModule.init();
    await (window as Window & { fetchCityStatistics(lat: number, lon: number): Promise<void> }).fetchCityStatistics(1, 2);

    expect(mockFetchStats).toHaveBeenCalledWith('São Paulo', 'SP');
    expect(mockCityRender).toHaveBeenCalledWith({ populacao: 1000 });
  });

  it('fetchCityStatistics shows not-found error when stats are null', async () => {
    mockHomeGetBrazilianStandardAddress.mockReturnValue({ municipio: 'São Paulo', siglaUF: 'SP' });
    mockFetchStats.mockResolvedValue(null);

    await appModule.init();
    await (window as Window & { fetchCityStatistics(lat: number, lon: number): Promise<void> }).fetchCityStatistics(1, 2);

    expect(mockCityShowError).toHaveBeenCalledWith('Município "São Paulo" não encontrado no IBGE.');
  });

  it('fetchCityStatistics shows generic error on fetch failure', async () => {
    mockHomeGetBrazilianStandardAddress.mockReturnValue({ municipio: 'São Paulo', siglaUF: 'SP' });
    mockFetchStats.mockRejectedValue(new Error('boom'));

    await appModule.init();
    await (window as Window & { fetchCityStatistics(lat: number, lon: number): Promise<void> }).fetchCityStatistics(1, 2);

    expect(mockCityShowError).toHaveBeenCalledWith('Não foi possível carregar estatísticas da cidade.');
  });
});
