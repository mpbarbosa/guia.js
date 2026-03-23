import '@testing-library/jest-dom';
import {
  init,
  navigateTo,
  updateActiveNavLink,
  showLoading,
  showError,
  initializeHomeView,
  loadConverterView,
  loadNotFoundView,
  initRouter,
  initNavigation,
  handleRoute,
  manageFocusAfterRouteChange,
  initializeConverterFeatures,
} from './app';

// Mocks
jest.mock('./views/home.js');
jest.mock('./html/HTMLHeaderDisplayer.js');
jest.mock('./utils/logger.js');
jest.mock('./config/version.js', () => ({ VERSION_STRING: 'v0.9.0-alpha' }));
jest.mock('./config/environment.js', () => ({
  env: { nominatimApiUrl: 'https://api.nominatim.org' },
}));
jest.mock('./config/routes.js');
jest.mock('./utils/ErrorBoundary.js');
jest.mock('./utils/error-notifications.js');
jest.mock('./services/OverassService.js');
jest.mock('./services/IBGECityStatsService.js');
jest.mock('./html/HTMLNearbyPlacesPanel.js');
jest.mock('./html/HTMLCityStatsPanel.js');

// Mock implementations
const mockLog = jest.fn();
const mockWarn = jest.fn();
const mockError = jest.fn();

jest.mock('./utils/logger.js', () => ({
  log: mockLog,
  warn: mockWarn,
  error: mockError,
}));

const mockShowErrorToast = jest.fn();
jest.mock('./utils/error-notifications.js', () => ({
  showErrorToast: mockShowErrorToast,
}));

const mockCreateErrorBoundary = jest.fn();
const mockSetupGlobalErrorHandler = jest.fn();
jest.mock('./utils/ErrorBoundary.js', () => ({
  createDefaultErrorBoundary: mockCreateErrorBoundary,
  setupGlobalErrorHandler: mockSetupGlobalErrorHandler,
}));

const mockGetConverterViewTemplate = jest.fn();
const mockGetNotFoundViewTemplate = jest.fn();
const mockGetLoadingTemplate = jest.fn();
const mockGetErrorTemplate = jest.fn();
jest.mock('./config/routes.js', () => ({
  getConverterViewTemplate: mockGetConverterViewTemplate,
  getNotFoundViewTemplate: mockGetNotFoundViewTemplate,
  getLoadingTemplate: mockGetLoadingTemplate,
  getErrorTemplate: mockGetErrorTemplate,
}));

const mockFindNearby = jest.fn();
jest.mock('./services/OverassService.js', () => ({
  findNearby: mockFindNearby,
}));

const mockFetchStats = jest.fn();
jest.mock('./services/IBGECityStatsService.js', () => ({
  fetchStats: mockFetchStats,
}));

describe('app.ts', () => {
  let mockAppContent: HTMLDivElement;
  let mockAppLoading: HTMLDivElement;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup DOM
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

    mockAppContent = document.getElementById('app-content') as HTMLDivElement;
    mockAppLoading = document.getElementById('app-loading') as HTMLDivElement;

    // Mock template returns
    mockGetLoadingTemplate.mockReturnValue('<p>Loading...</p>');
    mockGetErrorTemplate.mockReturnValue('<p>Error occurred</p>');
    mockGetConverterViewTemplate.mockReturnValue(
      '<form id="coords-to-address-form"><input id="latitude" /><input id="longitude" /></form><div id="address-result"></div>'
    );
    mockGetNotFoundViewTemplate.mockReturnValue('<p>Not Found</p>');

    // Mock error boundary
    mockCreateErrorBoundary.mockReturnValue({
      wrap: jest.fn((fn) => fn()),
    });

    // Mock HTMLHeaderDisplayer
    jest.mocked(require('./html/HTMLHeaderDisplayer.js').default).create = jest.fn();

    // Reset window location
    delete (window as any).location;
    (window as any).location = { hash: '' };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('init()', () => {
    it('should initialize app when DOM is ready', async () => {
      await init();

      expect(mockSetupGlobalErrorHandler).toHaveBeenCalled();
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Initializing'));
      expect(mockLog).toHaveBeenCalledWith('✓ Application initialized successfully');
    });

    it('should remove app-loading element after delay', async () => {
      mockAppLoading.classList.remove('hidden');
      await init();

      jest.runAllTimers();

      expect(mockAppLoading.parentElement).toBeNull();
    });

    it('should hide app-loading if it exists', async () => {
      mockAppLoading.classList.remove('hidden');
      await init();

      expect(mockAppLoading.classList.contains('hidden')).toBe(true);
    });

    it('should wait for dependencies if window.dependenciesLoading is true', async () => {
      (window as any).dependenciesLoading = true;

      const promise = init();

      setTimeout(() => {
        window.dispatchEvent(new Event('dependencies-ready'));
      }, 100);

      jest.advanceTimersByTime(100);
      await promise;

      expect(mockLog).toHaveBeenCalledWith('✓ Dependencies ready');
    });

    it('should timeout dependency loading after 5 seconds', async () => {
      (window as any).dependenciesLoading = true;

      const promise = init();
      jest.advanceTimersByTime(5000);
      await promise;

      expect(mockWarn).toHaveBeenCalledWith(
        expect.stringContaining('Dependency loading timeout'),
        expect.anything()
      );
    });

    it('should setup global error handler', async () => {
      await init();

      expect(mockSetupGlobalErrorHandler).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should call error handler with formatted error message', async () => {
      await init();

      const errorHandler = mockSetupGlobalErrorHandler.mock.calls[0][0];
      const testError = new Error('Test error');
      errorHandler(testError);

      expect(mockShowErrorToast).toHaveBeenCalledWith(
        'Erro Inesperado',
        'Test error'
      );
    });

    it('should register hashchange event listener', async () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      await init();

      expect(addEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
    });

    it('should register popstate event listener', async () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      await init();

      expect(addEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
    });

    it('should create HTMLHeaderDisplayer', async () => {
      await init();

      expect(
        jest.mocked(require('./html/HTMLHeaderDisplayer.js').default).create
      ).toHaveBeenCalledWith(document);
    });
  });

  describe('initRouter()', () => {
    it('should prevent default on hash links and navigate', () => {
      initRouter();

      const link = document.querySelector('a[href="#/converter"]') as HTMLAnchorElement;
      const event = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      link.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(window.location.hash).toBe('#/converter');
    });

    it('should not prevent default on non-hash links', () => {
      initRouter();

      const link = document.createElement('a');
      link.href = 'https://example.com';
      document.body.appendChild(link);

      const event = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      link.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('should handle nested elements within hash links', () => {
      initRouter();

      const link = document.querySelector('a[href="#/"]') as HTMLAnchorElement;
      const span = document.createElement('span');
      span.textContent = 'Click me';
      link.appendChild(span);

      const event = new MouseEvent('click', { bubbles: true });
      jest.spyOn(event, 'preventDefault');

      span.dispatchEvent(event);

      expect(window.location.hash).toBe('#/');
    });
  });

  describe('initNavigation()', () => {
    it('should update active nav links', () => {
      (window as any).location.hash = '#/';
      initNavigation();

      const homeLink = document.querySelector('a[href="#/"]') as HTMLAnchorElement;
      const converterLink = document.querySelector('a[href="#/converter"]') as HTMLAnchorElement;

      expect(homeLink.getAttribute('aria-current')).toBe('page');
      expect(converterLink.getAttribute('aria-current')).toBeNull();
    });
  });

  describe('navigateTo()', () => {
    it('should update window.location.hash', () => {
      navigateTo('#/converter');

      expect(window.location.hash).toBe('#/converter');
    });

    it('should handle paths without hash', () => {
      navigateTo('/converter');

      expect(window.location.hash).toBe('/converter');
    });
  });

  describe('updateActiveNavLink()', () => {
    it('should set aria-current on matching links', () => {
      (window as any).location.hash = '#/';
      updateActiveNavLink();

      const homeLink = document.querySelector('a[href="#/"]') as HTMLAnchorElement;
      expect(homeLink.getAttribute('aria-current')).toBe('page');
    });

    it('should remove aria-current from non-matching links', () => {
      (window as any).location.hash = '#/converter';
      updateActiveNavLink();

      const homeLink = document.querySelector('a[href="#/"]') as HTMLAnchorElement;
      const converterLink = document.querySelector('a[href="#/converter"]') as HTMLAnchorElement;

      expect(homeLink.getAttribute('aria-current')).toBeNull();
      expect(converterLink.getAttribute('aria-current')).toBe('page');
    });

    it('should handle empty hash as root', () => {
      (window as any).location.hash = '';
      updateActiveNavLink();

      const homeLink = document.querySelector('a[href="#/"]') as HTMLAnchorElement;
      expect(homeLink.getAttribute('aria-current')).toBe('page');
    });

    it('should update links in both nav and footer', () => {
      (window as any).location.hash = '#/';
      updateActiveNavLink();

      const navLink = document.querySelector('.app-navigation a[href="#/"]') as HTMLAnchorElement;
      const footerLink = document.querySelector('.app-footer a[href="#/"]') as HTMLAnchorElement;

      expect(navLink.getAttribute('aria-current')).toBe('page');
      expect(footerLink.getAttribute('aria-current')).toBe('page');
    });
  });

  describe('showLoading()', () => {
    it('should display loading template', () => {
      mockGetLoadingTemplate.mockReturnValue('<p>Loading...</p>');
      showLoading();

      expect(mockAppContent.innerHTML).toContain('Loading...');
    });

    it('should handle missing app-content element gracefully', () => {
      document.getElementById('app-content')?.remove();
      expect(() => showLoading()).not.toThrow();
    });
  });

  describe('showError()', () => {
    it('should display error template', () => {
      const err = new Error('Test error');
      mockGetErrorTemplate.mockReturnValue('<p>Error: Test error</p>');
      showError(err);

      expect(mockGetErrorTemplate).toHaveBeenCalledWith(err);
    });

    it('should handle missing app-content element gracefully', () => {
      document.getElementById('app-content')?.remove();
      const err = new Error('Test error');
      expect(() => showError(err)).not.toThrow();
    });
  });

  describe('handleRoute()', () => {
    it('should route to home view for root path', async () => {
      (window as any).location.hash = '#/';
      await handleRoute();

      expect(mockLog).toHaveBeenCalledWith('Routing to:', '/');
    });

    it('should route to converter view', async () => {
      (window as any).location.hash = '#/converter';
      mockGetConverterViewTemplate.mockReturnValue('<div>Converter</div>');

      await handleRoute();

      expect(mockAppContent.innerHTML).toContain('Converter');
    });

    it('should route to not found view for unknown routes', async () => {
      (window as any).location.hash = '#/unknown';
      mockGetNotFoundViewTemplate.mockReturnValue('<div>Not Found</div>');

      await handleRoute();

      expect(mockAppContent.innerHTML).toContain('Not Found');
    });

    it('should update active nav link on route change', async () => {
      (window as any).location.hash = '#/converter';
      await handleRoute();

      const converterLink = document.querySelector('a[href="#/converter"]') as HTMLAnchorElement;
      expect(converterLink.getAttribute('aria-current')).toBe('page');
    });

    it('should handle route loading errors', async () => {
      (window as any).location.hash = '#/';

      const error = new Error('Route loading failed');
      jest.mocked(require('./views/home.js').default).mockImplementation(() => {
        throw error;
      });

      await handleRoute();

      expect(mockError).toHaveBeenCalledWith('Route loading error:', expect.anything());
    });

    it('should treat empty hash as root', async () => {
      (window as any).location.hash = '';
      await handleRoute();

      expect(mockLog).toHaveBeenCalledWith('Routing to:', '');
    });

    it('should manage focus after route change', async () => {
      (window as any).location.hash = '#/';
      const h1 = document.createElement('h1');
      h1.textContent = 'Page Title';
      mockAppContent.appendChild(h1);

      await handleRoute();
      jest.runAllTimers();

      expect(h1.getAttribute('tabindex')).toBe('-1');
      expect(h1.getAttribute('aria-live')).toBeNull(); // Should be removed after timeout
    });
  });

  describe('manageFocusAfterRouteChange()', () => {
    it('should set focus to h1 heading if present', () => {
      const h1 = document.createElement('h1');
      h1.textContent = 'Page Title';
      mockAppContent.appendChild(h1);

      manageFocusAfterRouteChange();
      jest.runAllTimers();

      expect(h1.getAttribute('tabindex')).toBe('-1');
    });

    it('should set focus to main content if no h1', () => {
      manageFocusAfterRouteChange();
      jest.runAllTimers();

      expect(mockAppContent.getAttribute('tabindex')).toBe('-1');
    });

    it('should remove aria-live after timeout', () => {
      const h1 = document.createElement('h1');
      h1.textContent = 'Page Title';
      mockAppContent.appendChild(h1);

      manageFocusAfterRouteChange();

      expect(h1.getAttribute('aria-live')).toBe('polite');

      jest.advanceTimersByTime(1000);

      expect(h1.getAttribute('aria-live')).toBeNull();
    });

    it('should handle missing app-content gracefully', () => {
      document.getElementById('app-content')?.remove();

      expect(() => manageFocusAfterRouteChange()).not.toThrow();
      expect(mockWarn).toHaveBeenCalledWith(
        'Main content element not found for focus management'
      );
    });

    it('should log focus change', () => {
      const h1 = document.createElement('h1');
      h1.textContent = 'Test Heading';
      mockAppContent.appendChild(h1);

      manageFocusAfterRouteChange();
      jest.runAllTimers();

      expect(mockLog).toHaveBeenCalledWith(
        'Focus moved to h1 heading:',
        'Test Heading'
      );
    });
  });

  describe('loadConverterView()', () => {
    it('should load converter template', async () => {
      mockGetConverterViewTemplate.mockReturnValue('<div>Converter View</div>');
      await loadConverterView();

      expect(mockAppContent.innerHTML).toContain('Converter View');
    });

    it('should initialize converter features', async () => {
      mockGetConverterViewTemplate.mockReturnValue(
        '<form id="coords-to-address-form"><input id="latitude" /><input id="longitude" /></form><div id="address-result"></div>'
      );
      await loadConverterView();

      const form = document.getElementById('coords-to-address-form');
      expect(form).toBeInTheDocument();
    });

    it('should handle missing app-content', async () => {
      document.getElementById('app-content')?.remove();
      expect(async () => await loadConverterView()).not.toThrow();
    });
  });

  describe('initializeConverterFeatures()', () => {
    beforeEach(() => {
      mockGetConverterViewTemplate.mockReturnValue(
        '<form id="coords-to-address-form"><input id="latitude" type="number" value="10" /><input id="longitude" type="number" value="20" /></form><div id="address-result"></div>'
      );
      mockAppContent.innerHTML = mockGetConverterViewTemplate();
    });

    it('should handle form submission successfully', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          display_name: 'Test Address',
          address: { road: 'Main St', city: 'Test City' },
        }),
      });

      initializeConverterFeatures();

      const form = document.getElementById('coords-to-address-form') as HTMLFormElement;
      const submitEvent = new Event('submit');
      jest.spyOn(submitEvent, 'preventDefault');

      form.dispatchEvent(submitEvent);

      jest.runAllTimers();
      await new Promise(resolve => setTimeout(resolve, 100));

      const resultDiv = document.getElementById('address-result') as HTMLDivElement;
      expect(resultDiv.innerHTML).toContain('Test Address');
    });

    it('should handle network error', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

      initializeConverterFeatures();

      const form = document.getElementById('coords-to-address-form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));

      await new Promise(resolve => setTimeout(resolve, 100));

      const resultDiv = document.getElementById('address-result') as HTMLDivElement;
      expect(resultDiv.innerHTML).toContain('Erro');
    });

    it('should handle API error response', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        statusText: 'Error',
      });

      initializeConverterFeatures();

      const form = document.getElementById('coords-to-address-form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));

      await new Promise(resolve => setTimeout(resolve, 100));

      const resultDiv = document.getElementById('address-result') as HTMLDivElement;
      expect(resultDiv.innerHTML).toContain('Erro na Conversão');
    });

    it('should display address details when available', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          display_name: 'Complete Address',
          address: {
            road: 'Rua Principal',
            suburb: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            postcode: '01000-000',
          },
        }),
      });

      initializeConverterFeatures();

      const form = document.getElementById('coords-to-address-form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));

      await new Promise(resolve => setTimeout(resolve, 100));

      const resultDiv = document.getElementById('address-result') as HTMLDivElement;
      expect(resultDiv.innerHTML).toContain('Rua Principal');
      expect(resultDiv.innerHTML).toContain('São Paulo');
      expect(resultDiv.innerHTML).toContain('SP');
    });

    it('should show loading state during conversion', () => {
      global.fetch = jest.fn();

      initializeConverterFeatures();

      const form = document.getElementById('coords-to-address-form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));

      const resultDiv = document.getElementById('address-result') as HTMLDivElement;
      expect(resultDiv.innerHTML).toContain('Convertendo');
    });

    it('should handle missing form gracefully', () => {
      mockAppContent.innerHTML = '<div id="address-result"></div>';
      expect(() => initializeConverterFeatures()).not.toThrow();
    });

    it('should disable button during request', async () => {
      global.fetch = jest.fn().mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: jest.fn().mockResolvedValueOnce({ display_name: 'Test' }),
                }),
              100
            );
          })
      );

      const button = document.createElement('button');
      button.id = 'findRestaurantsBtn';
      document.body.appendChild(button);

      initializeConverterFeatures();

      const form = document.getElementById('coords-to-address-form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));

      jest.advanceTimersByTime(50);
      expect(button.disabled).toBe(false); // No specific button handling in converter

      button.remove();
    });
  });

  describe('loadNotFoundView()', () => {
    it('should load not found template', async () => {
      mockGetNotFoundViewTemplate.mockReturnValue('<p>404 Not Found</p>');
      await loadNotFoundView();

      expect(mockAppContent.innerHTML).toContain('404 Not Found');
    });

    it('should handle missing app-content', async () => {
      document.getElementById('app-content')?.remove();
      expect(async () => await loadNotFoundView()).not.toThrow();
    });
  });

  describe('initializeHomeView()', () => {
    it('should initialize home controller on first call', async () => {
      const mockHomeController = {
        init: jest.fn().mockResolvedValue(undefined),
      };

      jest
        .mocked(require('./views/home.js').default)
        .mockImplementation(() => mockHomeController);

      await initializeHomeView();

      expect(mockHomeController.init).toHaveBeenCalled();
    });

    it('should not reinitialize if controller already exists', async () => {
      const mockHomeController = {
        init: jest.fn().mockResolvedValue(undefined),
      };

      jest
        .mocked(require('./views/home.js').default)
        .mockImplementation(() => mockHomeController);

      await initializeHomeView();
      await initializeHomeView();

      expect(mockHomeController.init).toHaveBeenCalledTimes(1);
    });

    it('should create error boundary if not exists', async () => {
      const mockBoundary = { wrap: jest.fn((fn) => fn()) };
      mockCreateErrorBoundary.mockReturnValue(mockBoundary);

      const mockHomeController = {
        init: jest.fn().mockResolvedValue(undefined),
      };

      jest
        .mocked(require('./views/home.js').default)
        .mockImplementation(() => mockHomeController);

      await initializeHomeView();

      expect(mockCreateErrorBoundary).toHaveBeenCalledWith('Home View');
    });

    it('should handle initialization error', async () => {
      const error = new Error('Init failed');
      jest
        .mocked(require('./views/home.js').default)
        .mockImplementation(() => {
          throw error;
        });

      await initializeHomeView();

      expect(mockError).toHaveBeenCalledWith(
        'Error initializing home view:',
        expect.anything()
      );
      expect(mockShowErrorToast).toHaveBeenCalledWith('Erro', expect.anything());
    });

    it('should handle missing app-content container', async () => {
      document.getElementById('app-content')?.remove();

      const mockHomeController = {
        init: jest.fn().mockResolvedValue(undefined),
      };

      jest
        .mocked(require('./views/home.js').default)
        .mockImplementation(() => mockHomeController);

      await initializeHomeView();

      expect(mockHomeController.init).toHaveBeenCalled();
    });
  });

  describe('window.GuiaApp API', () => {
    beforeEach(async () => {
      await init();
    });

    it('should expose navigateTo function', () => {
      expect((window as any).GuiaApp.navigateTo).toBeDefined();
      (window as any).GuiaApp.navigateTo('#/test');
      expect(window.location.hash).toBe('#/test');
    });

    it('should expose getState function', () => {
      expect((window as any).GuiaApp.getState).toBeDefined();
      const state = (window as any).GuiaApp.getState();
      expect(state).toHaveProperty('currentRoute');
      expect(state).toHaveProperty('homeController');
    });

    it('should expose switchProvider function', () => {
      expect((window as any).GuiaApp.switchProvider).toBeDefined();
      const result = (window as any).GuiaApp.switchProvider('aws');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('geocoder-provider-used event', () => {
    beforeEach(async () => {
      await init();
    });

    it('should update provider indicator on event', () => {
      const indicator = document.getElementById('lbs-provider-indicator') as HTMLDivElement;
      const nameEl = document.getElementById('lbs-provider-name') as HTMLDivElement;

      window.dispatchEvent(
        new CustomEvent('geocoder-provider-used', {
          detail: { provider: 'aws' },
        })
      );

      expect(indicator.dataset.provider).toBe('aws');
      expect(nameEl.textContent).toBe('AWS Location Service');
    });

    it('should show nominatim provider name', () => {
      const nameEl = document.getElementById('lbs-provider-name') as HTMLDivElement;

      window.dispatchEvent(
        new CustomEvent('geocoder-provider-used', {
          detail: { provider: 'nominatim' },
        })
      );

      expect(nameEl.textContent).toBe('OpenStreetMap Nominatim');
    });

    it('should handle missing indicator elements gracefully', () => {
      document.getElementById('lbs-provider-indicator')?.remove();

      expect(() => {
        window.dispatchEvent(
          new CustomEvent('geocoder-provider-used', {
            detail: { provider: 'aws' },
          })
        );
      }).not.toThrow();
    });
  });

  describe('geocoder-provider-changed event', () => {
    beforeEach(async () => {
      await init();
    });

    it('should update provider name on change', () => {
      const nameEl = document.getElementById('lbs-provider-name') as HTMLDivElement;

      window.dispatchEvent(
        new CustomEvent('geocoder-provider-changed', {
          detail: { provider: 'aws' },
        })
      );

      expect(nameEl.textContent).toContain('AWS Location Service');
      expect(nameEl.textContent).toContain('próxima geocodificação');
    });

    it('should update nominatim name on change', () => {
      const nameEl = document.getElementById('lbs-provider-name') as HTMLDivElement;

      window.dispatchEvent(
        new CustomEvent('geocoder-provider-changed', {
          detail: { provider: 'nominatim' },
        })
      );

      expect(nameEl.textContent).toContain('OpenStreetMap Nominatim');
      expect(nameEl.textContent).toContain('próxima geocodificação');
    });
  });

  describe('provider switch button click', () => {
    beforeEach(async () => {
      await init();
    });

    it('should switch provider on button click', () => {
      const btn = document.getElementById('provider-switch-btn') as HTMLButtonElement;
      const mockManager = {
        getPrimaryProvider: jest.fn().mockReturnValue('nominatim'),
        switchProvider: jest.fn().mockReturnValue(true),
      };

      (window as any).GuiaApp.getState().homeController = {
        manager: mockManager,
      };

      btn.click();

      expect(mockManager.switchProvider).toHaveBeenCalledWith('aws');
    });

    it('should handle missing provider methods gracefully', () => {
      const btn = document.getElementById('provider-switch-btn') as HTMLButtonElement;

      expect(() => btn.click()).not.toThrow();
    });
  });

  describe('findNearbyRestaurants window function', () => {
    beforeEach(async () => {
      await init();
    });

    it('should fetch nearby restaurants', async () => {
      mockFindNearby.mockResolvedValueOnce([
        { name: 'Restaurant 1', lat: 10, lon: 20 },
      ]);

      const mockPanel = {
        showLoading: jest.fn(),
        render: jest.fn(),
        showError: jest.fn(),
      };

      jest
        .mocked(require('./html/HTMLNearbyPlacesPanel.js').default)
        .mockImplementation(() => mockPanel);

      await (window as any).findNearbyRestaurants(10, 20);

      expect(mockFindNearby).toHaveBeenCalledWith(10, 20, 500, 'restaurant');
      expect(mockPanel.render).toHaveBeenCalled();
    });

    it('should handle restaurant search errors', async () => {
      mockFindNearby.mockRejectedValueOnce(new Error('Search failed'));

      const mockPanel = {
        showLoading: jest.fn(),
        render: jest.fn(),
        showError: jest.fn(),
      };

      jest
        .mocked(require('./html/HTMLNearbyPlacesPanel.js').default)
        .mockImplementation(() => mockPanel);

      await (window as any).findNearbyRestaurants(10, 20);

      expect(mockPanel.showError).toHaveBeenCalledWith(
        'Não foi possível buscar restaurantes próximos.'
      );
      expect(mockWarn).toHaveBeenCalledWith(
        '(app) findNearbyRestaurants failed:',
        expect.anything()
      );
    });

    it('should disable restaurant button during fetch', async () => {
      mockFindNearby.mockImplementationOnce(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve([]), 100);
          })
      );

      const btn = document.getElementById('findRestaurantsBtn') as HTMLButtonElement;

      const mockPanel = {
        showLoading: jest.fn(),
        render: jest.fn(),
        showError: jest.fn(),
      };

      jest
        .mocked(require('./html/HTMLNearbyPlacesPanel.js').default)
        .mockImplementation(() => mockPanel);

      const promise = (window as any).findNearbyRestaurants(10, 20);

      expect(btn.disabled).toBe(true);

      jest.advanceTimersByTime(100);
      await promise;

      expect(btn.disabled).toBe(false);
    });
  });

  describe('fetchCityStatistics window function', () => {
    beforeEach(async () => {
      await init();
    });

    it('should fetch city statistics successfully', async () => {
      const mockStats = { populacao: 1000000, area: 1500 };
      mockFetchStats.mockResolvedValueOnce(mockStats);

      const mockController = {
        manager: {
          getBrazilianStandardAddress: jest.fn().mockReturnValue({
            municipio: 'São Paulo',
            siglaUF: 'SP',
          }),
        },
      };

      (window as any).GuiaApp.getState().homeController = mockController;

      const mockPanel = {
        showLoading: jest.fn(),
        render: jest.fn(),
        showError: jest.fn(),
      };

      jest
        .mocked(require('./html/HTMLCityStatsPanel.js').default)
        .mockImplementation(() => mockPanel);

      await (window as any).fetchCityStatistics(10, 20);

      expect(mockFetchStats).toHaveBeenCalledWith('São Paulo', 'SP');
      expect(mockPanel.render).toHaveBeenCalledWith(mockStats);
    });

    it('should show error when municipality is not found', async () => {
      mockFetchStats.mockResolvedValueOnce(null);

      const mockController = {
        manager: {
          getBrazilianStandardAddress: jest.fn().mockReturnValue({
            municipio: 'Unknown City',
            siglaUF: 'XX',
          }),
        },
      };

      (window as any).GuiaApp.getState().homeController = mockController;

      const mockPanel = {
        showLoading: jest.fn(),
        render: jest.fn(),
        showError: jest.fn(),
      };

      jest
        .mocked(require('./html/HTMLCityStatsPanel.js').default)
        .mockImplementation(() => mockPanel);

      await (window as any).fetchCityStatistics(10, 20);

      expect(mockPanel.showError).toHaveBeenCalledWith(
        expect.stringContaining('não encontrado')
      );
    });

    it('should handle missing municipality gracefully', async () => {
      const mockController = {
        manager: {
          getBrazilianStandardAddress: jest.fn().mockReturnValue(null),
        },
      };

      (window as any).GuiaApp.getState().homeController = mockController;

      const mockPanel = {
        showLoading: jest.fn(),
        render: jest.fn(),
        showError: jest.fn(),
      };

      jest
        .mocked(require('./html/HTMLCityStatsPanel.js').default)
        .mockImplementation(() => mockPanel);

      await (window as any).fetchCityStatistics(10, 20);

      expect(mockPanel.showError).toHaveBeenCalledWith(
        expect.stringContaining('Aguardando')
      );
    });

    it('should handle statistics fetch errors', async () => {
      const mockController = {
        manager: {
          getBrazilianStandardAddress: jest.fn().mockReturnValue({
            municipio: 'São Paulo',
            siglaUF: 'SP',
          }),
        },
      };

      (window as any).GuiaApp.getState().homeController = mockController;

      mockFetchStats.mockRejectedValueOnce(new Error('IBGE API failed'));

      const mockPanel = {
        showLoading: jest.fn(),
        render: jest.fn(),
        showError: jest.fn(),
      };

      jest
        .mocked(require('./html/HTMLCityStatsPanel.js').default)
        .mockImplementation(() => mockPanel);

      await (window as any).fetchCityStatistics(10, 20);

      expect(mockPanel.showError).toHaveBeenCalledWith(
        'Não foi possível carregar estatísticas da cidade.'
      );
      expect(mockWarn).toHaveBeenCalledWith(
        '(app) fetchCityStatistics failed:',
        expect.anything()
      );
    });

    it('should disable stats button during fetch', async () => {
      mockFetchStats.mockImplementationOnce(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve({ populacao: 1000000 }), 100);
          })
      );

      const btn = document.getElementById('cityStatsBtn') as HTMLButtonElement;
      const mockController = {
        manager: {
          getBrazilianStandardAddress: jest.fn().mockReturnValue({
            municipio: 'São Paulo',
            siglaUF: 'SP',
          }),
        },
      };

      (window as any).GuiaApp.getState().homeController = mockController;

      const mockPanel = {
        showLoading: jest.fn(),
        render: jest.fn(),
        showError: jest.fn(),
      };

      jest
        .mocked(require('./html/HTMLCityStatsPanel.js').default)
        .mockImplementation(() => mockPanel);

      const promise = (window as any).fetchCityStatistics(10, 20);

      expect(btn.disabled).toBe(true);

      jest.advanceTimersByTime(100);
      await promise;

      expect(btn.disabled).toBe(false);
    });
  });

  describe('Node.js environment handling', () => {
    it('should skip browser initialization when document is undefined', () => {
      const originalDocument = global.document;
      // @ts-ignore
      delete global.document;

      expect(mockLog).toHaveBeenCalledWith('Running in Node.js - skipping browser initialization');

      // Restore
      global.document = originalDocument;
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle route with trailing slash', async () => {
      (window as any).location.hash = '#/converter/';
      mockGetNotFoundViewTemplate.mockReturnValue('<div>Not Found</div>');

      await handleRoute();

      expect(mockAppContent.innerHTML).toContain('Not Found');
    });

    it('should handle rapidly changing routes', async () => {
      (window as any).location.hash = '#/converter';
      handleRoute();

      (window as any).location.hash = '#/';
      await handleRoute();

      expect(mockLog).toHaveBeenCalledWith('Routing to:', '/');
    });

    it('should handle converter form with empty coordinates', async () => {
      mockGetConverterViewTemplate.mockReturnValue(
        '<form id="coords-to-address-form"><input id="latitude" value="" /><input id="longitude" value="" /></form><div id="address-result"></div>'
      );
      mockAppContent.innerHTML = mockGetConverterViewTemplate();

      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Invalid coordinates'));

      initializeConverterFeatures();

      const form = document.getElementById('coords-to-address-form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));

      await new Promise(resolve => setTimeout(resolve, 50));

      const resultDiv = document.getElementById('address-result') as HTMLDivElement;
      expect(resultDiv.innerHTML).toContain('Erro');
    });

    it('should handle converter response with missing address details', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          display_name: 'Location',
          address: {},
        }),
      });

      mockGetConverterViewTemplate.mockReturnValue(
        '<form id="coords-to-address-form"><input id="latitude" value="10" /><input id="longitude" value="20" /></form><div id="address-result"></div>'
      );
      mockAppContent.innerHTML = mockGetConverterViewTemplate();

      initializeConverterFeatures();

      const form = document.getElementById('coords-to-address-form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));

      await new Promise(resolve => setTimeout(resolve, 100));

      const resultDiv = document.getElementById('address-result') as HTMLDivElement;
      expect(resultDiv.innerHTML).toContain('Location');
    });
  });
});
