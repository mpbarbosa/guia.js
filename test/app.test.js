// __tests__/app.test.js
import * as appModule from '../src/app';

describe('SPA Application Entry Point', () => {
  let originalWindow;
  let originalDocument;
  let appContent;
  let appLoading;
  let navLink;
  let footerLink;

  beforeEach(() => {
    // Mock global window and document
    originalWindow = global.window;
    originalDocument = global.document;
    global.window = Object.create(window);
    global.document = Object.create(document);

    // Mock DOM elements
    appContent = document.createElement('div');
    appContent.id = 'app-content';
    document.body.appendChild(appContent);

    appLoading = document.createElement('div');
    appLoading.id = 'app-loading';
    document.body.appendChild(appLoading);

    navLink = document.createElement('a');
    navLink.href = '#/';
    navLink.className = 'app-navigation';
    document.body.appendChild(navLink);

    footerLink = document.createElement('a');
    footerLink.href = '#/converter';
    footerLink.className = 'app-footer';
    document.body.appendChild(footerLink);

    // Mock location hash
    window.location.hash = '#/';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    global.window = originalWindow;
    global.document = originalDocument;
    jest.clearAllMocks();
  });

  describe('navigateTo', () => {
    it('updates window.location.hash to given path', () => {
      appModule.navigateTo('/converter');
      expect(window.location.hash).toBe('/converter');
    });
  });

  describe('updateActiveNavLink', () => {
    it('sets aria-current on matching navigation link', () => {
      window.location.hash = '#/';
      appModule.updateActiveNavLink();
      expect(navLink.getAttribute('aria-current')).toBe('page');
      expect(footerLink.getAttribute('aria-current')).toBeNull();
    });

    it('sets aria-current on matching footer link', () => {
      window.location.hash = '#/converter';
      appModule.updateActiveNavLink();
      expect(footerLink.getAttribute('aria-current')).toBe('page');
      expect(navLink.getAttribute('aria-current')).toBeNull();
    });

    it('removes aria-current from non-matching links', () => {
      window.location.hash = '#/unknown';
      appModule.updateActiveNavLink();
      expect(navLink.getAttribute('aria-current')).toBeNull();
      expect(footerLink.getAttribute('aria-current')).toBeNull();
    });
  });

  describe('showLoading', () => {
    it('renders loading template in app-content', () => {
      jest.spyOn(appModule, 'getLoadingTemplate').mockReturnValue('<div>Loading...</div>');
      appModule.showLoading();
      expect(appContent.innerHTML).toBe('<div>Loading...</div>');
    });

    it('does nothing if app-content is missing', () => {
      document.body.removeChild(appContent);
      expect(() => appModule.showLoading()).not.toThrow();
    });
  });

  describe('showError', () => {
    it('renders error template in app-content', () => {
      jest.spyOn(appModule, 'getErrorTemplate').mockImplementation((err) => `<div>${err.message}</div>`);
      const errorObj = new Error('Test error');
      appModule.showError(errorObj);
      expect(appContent.innerHTML).toBe('<div>Test error</div>');
    });

    it('does nothing if app-content is missing', () => {
      document.body.removeChild(appContent);
      expect(() => appModule.showError(new Error('Error'))).not.toThrow();
    });
  });

  describe('initRouter', () => {
    it('intercepts navigation link clicks and calls navigateTo', () => {
      const spy = jest.spyOn(appModule, 'navigateTo').mockImplementation(() => {});
      appModule.initRouter();
      const event = new MouseEvent('click', { bubbles: true });
      navLink.dispatchEvent(event);
      expect(spy).toHaveBeenCalledWith('#/');
    });

    it('does not intercept non-navigation clicks', () => {
      const spy = jest.spyOn(appModule, 'navigateTo').mockImplementation(() => {});
      appModule.initRouter();
      const div = document.createElement('div');
      document.body.appendChild(div);
      const event = new MouseEvent('click', { bubbles: true });
      div.dispatchEvent(event);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('initNavigation', () => {
    it('calls updateActiveNavLink', () => {
      const spy = jest.spyOn(appModule, 'updateActiveNavLink');
      appModule.initNavigation();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('handleRoute', () => {
    beforeEach(() => {
      jest.spyOn(appModule, 'updateActiveNavLink').mockImplementation(() => {});
      jest.spyOn(appModule, 'manageFocusAfterRouteChange').mockImplementation(() => {});
      jest.spyOn(appModule, 'initializeHomeView').mockResolvedValue();
      jest.spyOn(appModule, 'showLoading').mockImplementation(() => {});
      jest.spyOn(appModule, 'loadConverterView').mockResolvedValue();
      jest.spyOn(appModule, 'loadNotFoundView').mockResolvedValue();
      jest.spyOn(appModule, 'error').mockImplementation(() => {});
      jest.spyOn(appModule, 'showError').mockImplementation(() => {});
    });

    it('routes to home view for "/"', async () => {
      window.location.hash = '#/';
      await appModule.handleRoute();
      expect(appModule.initializeHomeView).toHaveBeenCalled();
    });

    it('routes to converter view for "/converter"', async () => {
      window.location.hash = '#/converter';
      await appModule.handleRoute();
      expect(appModule.showLoading).toHaveBeenCalled();
      expect(appModule.loadConverterView).toHaveBeenCalled();
    });

    it('routes to not found view for unknown route', async () => {
      window.location.hash = '#/unknown';
      await appModule.handleRoute();
      expect(appModule.showLoading).toHaveBeenCalled();
      expect(appModule.loadNotFoundView).toHaveBeenCalled();
    });

    it('handles route loading error', async () => {
      appModule.initializeHomeView.mockRejectedValueOnce(new Error('fail'));
      window.location.hash = '#/';
      await appModule.handleRoute();
      expect(appModule.error).toHaveBeenCalled();
      expect(appModule.showError).toHaveBeenCalled();
    });
  });

  describe('manageFocusAfterRouteChange', () => {
    it('focuses h1 heading if present', (done) => {
      const h1 = document.createElement('h1');
      h1.textContent = 'Main Heading';
      appContent.appendChild(h1);
      jest.spyOn(h1, 'focus').mockImplementation(() => {});
      appModule.manageFocusAfterRouteChange();
      setTimeout(() => {
        expect(h1.getAttribute('tabindex')).toBe('-1');
        expect(h1.focus).toHaveBeenCalled();
        expect(h1.getAttribute('aria-live')).toBe('polite');
        done();
      }, 10);
    });

    it('focuses main content if no h1 found', (done) => {
      jest.spyOn(appContent, 'focus').mockImplementation(() => {});
      appModule.manageFocusAfterRouteChange();
      setTimeout(() => {
        expect(appContent.getAttribute('tabindex')).toBe('-1');
        expect(appContent.focus).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('warns if app-content is missing', () => {
      document.body.removeChild(appContent);
      const spy = jest.spyOn(appModule, 'warn').mockImplementation(() => {});
      appModule.manageFocusAfterRouteChange();
      expect(spy).toHaveBeenCalledWith('Main content element not found for focus management');
    });
  });

  describe('initializeHomeView', () => {
    it('creates HomeViewController and initializes it (happy path)', async () => {
      const mockController = { init: jest.fn().mockResolvedValue() };
      jest.spyOn(appModule, 'createDefaultErrorBoundary').mockReturnValue({
        wrap: (fn) => fn,
      });
      jest.spyOn(appModule, 'HomeViewController').mockImplementation(() => mockController);
      await appModule.initializeHomeView();
      expect(mockController.init).toHaveBeenCalled();
    });

    it('handles error during HomeViewController initialization', async () => {
      jest.spyOn(appModule, 'createDefaultErrorBoundary').mockReturnValue({
        wrap: () => { throw new Error('fail'); },
      });
      const spy = jest.spyOn(appModule, 'showErrorToast').mockImplementation(() => {});
      await appModule.initializeHomeView();
      expect(spy).toHaveBeenCalledWith('Erro', 'Falha ao inicializar página inicial');
    });
  });

  describe('loadConverterView', () => {
    it('renders converter view template and initializes features', async () => {
      jest.spyOn(appModule, 'getConverterViewTemplate').mockReturnValue('<div>Converter</div>');
      jest.spyOn(appModule, 'initializeConverterFeatures').mockImplementation(() => {});
      await appModule.loadConverterView();
      expect(appContent.innerHTML).toBe('<div>Converter</div>');
      expect(appModule.initializeConverterFeatures).toHaveBeenCalled();
    });
  });

  describe('initializeConverterFeatures', () => {
    it('sets up form submit handler and displays address on success', async () => {
      const form = document.createElement('form');
      form.id = 'coords-to-address-form';
      document.body.appendChild(form);

      const resultDiv = document.createElement('div');
      resultDiv.id = 'address-result';
      document.body.appendChild(resultDiv);

      const latInput = document.createElement('input');
      latInput.id = 'latitude';
      latInput.value = '10';
      document.body.appendChild(latInput);

      const lonInput = document.createElement('input');
      lonInput.id = 'longitude';
      lonInput.value = '20';
      document.body.appendChild(lonInput);

      appModule.env = { nominatimApiUrl: 'http://test' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          display_name: 'Test Address',
          address: { road: 'Test Road', city: 'Test City', state: 'Test State', postcode: '12345' },
        }),
      });

      appModule.initializeConverterFeatures();

      const submitEvent = new Event('submit');
      await form.dispatchEvent(submitEvent);

      expect(resultDiv.innerHTML).toContain('Test Address');
      expect(resultDiv.innerHTML).toContain('Test Road');
      expect(resultDiv.innerHTML).toContain('Test City');
      expect(resultDiv.innerHTML).toContain('Test State');
      expect(resultDiv.innerHTML).toContain('12345');
    });

    it('shows error message on fetch failure', async () => {
      const form = document.createElement('form');
      form.id = 'coords-to-address-form';
      document.body.appendChild(form);

      const resultDiv = document.createElement('div');
      resultDiv.id = 'address-result';
      document.body.appendChild(resultDiv);

      const latInput = document.createElement('input');
      latInput.id = 'latitude';
      latInput.value = '10';
      document.body.appendChild(latInput);

      const lonInput = document.createElement('input');
      lonInput.id = 'longitude';
      lonInput.value = '20';
      document.body.appendChild(lonInput);

      appModule.env = { nominatimApiUrl: 'http://test' };
      global.fetch = jest.fn().mockResolvedValue({ ok: false });

      appModule.initializeConverterFeatures();

      const submitEvent = new Event('submit');
      await form.dispatchEvent(submitEvent);

      expect(resultDiv.innerHTML).toContain('Erro na Conversão');
    });
  });

  describe('loadNotFoundView', () => {
    it('renders not found view template', async () => {
      jest.spyOn(appModule, 'getNotFoundViewTemplate').mockReturnValue('<div>404</div>');
      await appModule.loadNotFoundView();
      expect(appContent.innerHTML).toBe('<div>404</div>');
    });
  });
});
