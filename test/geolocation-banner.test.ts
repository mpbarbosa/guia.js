import {
  init,
  requestPermission,
  dismiss as dismissBanner,
  getStatus,
  destroy,
} from '../src/geolocation-banner';
import * as geolocationBannerModule from '../src/geolocation-banner';

type PermissionState = 'prompt' | 'granted' | 'denied';

describe('geolocation-banner', () => {
  let originalConsoleLog: typeof console.log;
  let originalConsoleWarn: typeof console.warn;
  let originalConsoleError: typeof console.error;
  let originalAlert: typeof window.alert;
  let originalErrorRecovery: any;
  let originalNavigator: any;
  let originalBodyInnerHTML: string;

  beforeAll(() => {
    originalConsoleLog = console.log;
    originalConsoleWarn = console.warn;
    originalConsoleError = console.error;
    originalAlert = window.alert;
    originalErrorRecovery = window.ErrorRecovery;
    originalNavigator = { ...navigator };
  });

  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    window.alert = jest.fn();
    window.ErrorRecovery = undefined;
    Object.defineProperty(navigator, 'permissions', {
      writable: true,
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, 'geolocation', {
      writable: true,
      configurable: true,
      value: undefined,
    });
    originalBodyInnerHTML = document.body.innerHTML;
    destroy();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    (console.log as jest.Mock).mockRestore();
    (console.warn as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
    window.alert = originalAlert;
    window.ErrorRecovery = originalErrorRecovery;
    Object.defineProperty(navigator, 'permissions', {
      writable: true,
      configurable: true,
      value: originalNavigator.permissions,
    });
    Object.defineProperty(navigator, 'geolocation', {
      writable: true,
      configurable: true,
      value: originalNavigator.geolocation,
    });
    destroy();
    document.body.innerHTML = originalBodyInnerHTML;
  });

  describe('checkGeolocationPermission', () => {
    it('should return "prompt" if navigator.permissions is undefined', async () => {
      // @ts-ignore: access private
      const { checkGeolocationPermission } = geolocationBannerModule;
      Object.defineProperty(navigator, 'permissions', { value: undefined });
      await expect(checkGeolocationPermission()).resolves.toBe('prompt');
    });

    it('should return permission state from permissions.query', async () => {
      // @ts-ignore: access private
      const { checkGeolocationPermission } = geolocationBannerModule;
      Object.defineProperty(navigator, 'permissions', {
        value: {
          query: jest.fn().mockResolvedValue({ state: 'granted' }),
        },
      });
      await expect(checkGeolocationPermission()).resolves.toBe('granted');
    });

    it('should return "prompt" and warn if permissions.query throws', async () => {
      // @ts-ignore: access private
      const { checkGeolocationPermission } = geolocationBannerModule;
      Object.defineProperty(navigator, 'permissions', {
        value: {
          query: jest.fn().mockRejectedValue(new Error('fail')),
        },
      });
      const warnSpy = jest.spyOn(console, 'warn');
      await expect(checkGeolocationPermission()).resolves.toBe('prompt');
      expect(warnSpy).toHaveBeenCalledWith(
        '[GeolocationBanner]',
        'Could not query geolocation permission:',
        expect.any(Error)
      );
    });
  });

  describe('showBanner', () => {
    it('should create and append the geolocation banner', () => {
      // @ts-ignore: access private
      const { showBanner } = geolocationBannerModule;
      showBanner();
      const banner = document.querySelector('.geolocation-banner');
      expect(banner).toBeTruthy();
      expect(banner?.querySelector('.btn-primary')).toBeTruthy();
      expect(banner?.querySelector('.btn-secondary')).toBeTruthy();
    });

    it('should attach click handlers to buttons', () => {
      // @ts-ignore: access private
      const { showBanner } = geolocationBannerModule;
      showBanner();
      const allowBtn = document.querySelector('.btn-primary') as HTMLElement;
      const dismissBtn = document.querySelector('.btn-secondary') as HTMLElement;
      expect(allowBtn).toBeTruthy();
      expect(dismissBtn).toBeTruthy();
      // Spy on requestPermission and dismissBanner
      const reqSpy = jest.spyOn(geolocationBannerModule, 'requestPermission');
      const dismissSpy = jest.spyOn(geolocationBannerModule, 'dismiss');
      allowBtn.click();
      expect(reqSpy).toHaveBeenCalled();
      dismissBtn.click();
      expect(dismissSpy).toHaveBeenCalled();
      reqSpy.mockRestore();
      dismissSpy.mockRestore();
    });
  });

  describe('requestPermission', () => {
    it('should show error and dismiss if geolocation is not supported', () => {
      window.ErrorRecovery = undefined;
      Object.defineProperty(navigator, 'geolocation', { value: undefined });
      const dismissSpy = jest.spyOn(geolocationBannerModule, 'dismiss');
      requestPermission();
      expect(window.alert).toHaveBeenCalledWith('Geolocalização não é suportada neste navegador.');
      expect(dismissSpy).toHaveBeenCalled();
      dismissSpy.mockRestore();
    });

    it('should use ErrorRecovery.displayError if available', () => {
      window.ErrorRecovery = { displayError: jest.fn() };
      Object.defineProperty(navigator, 'geolocation', { value: undefined });
      const dismissSpy = jest.spyOn(geolocationBannerModule, 'dismiss');
      requestPermission();
      expect(window.ErrorRecovery.displayError).toHaveBeenCalledWith('Erro', 'Geolocalização não é suportada neste navegador.');
      expect(dismissSpy).toHaveBeenCalled();
      dismissSpy.mockRestore();
    });

    it('should handle permission granted', () => {
      const mockGetCurrentPosition = jest.fn((success, _error, _opts) => {
        success({ coords: { latitude: 1, longitude: 2 } });
      });
      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: mockGetCurrentPosition },
      });
      const dismissSpy = jest.spyOn(geolocationBannerModule, 'dismiss');
      const toastSpy = jest.spyOn(geolocationBannerModule, 'showSuccessToast');
      const eventSpy = jest.spyOn(window, 'dispatchEvent');
      requestPermission();
      expect(dismissSpy).toHaveBeenCalled();
      expect(toastSpy).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'geolocation-granted' })
      );
      dismissSpy.mockRestore();
      toastSpy.mockRestore();
      eventSpy.mockRestore();
    });

    it('should handle permission denied', () => {
      const mockGetCurrentPosition = jest.fn((_success, error, _opts) => {
        error({ code: 1, message: 'denied' });
      });
      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: mockGetCurrentPosition },
      });
      const dismissSpy = jest.spyOn(geolocationBannerModule, 'dismiss');
      const deniedSpy = jest.spyOn(geolocationBannerModule, 'showPermissionDeniedMessage');
      requestPermission();
      expect(dismissSpy).toHaveBeenCalled();
      expect(deniedSpy).toHaveBeenCalled();
      dismissSpy.mockRestore();
      deniedSpy.mockRestore();
    });
  });

  describe('dismissBanner', () => {
    it('should hide and remove the banner after timeout', () => {
      // @ts-ignore: access private
      const { showBanner } = geolocationBannerModule;
      showBanner();
      const banner = document.querySelector('.geolocation-banner') as HTMLElement;
      expect(banner).toBeTruthy();
      dismissBanner();
      expect(banner.classList.contains('hidden')).toBe(true);
      jest.advanceTimersByTime(300);
      expect(document.querySelector('.geolocation-banner')).toBeNull();
    });

    it('should not throw if banner does not exist', () => {
      expect(() => dismissBanner()).not.toThrow();
    });
  });

  describe('showSuccessToast', () => {
    it('should create a success toast and remove it after timeout', () => {
      // @ts-ignore: access private
      const { showSuccessToast } = geolocationBannerModule;
      showSuccessToast();
      const toast = document.querySelector('.toast.success') as HTMLElement;
      expect(toast).toBeTruthy();
      expect(toast.innerHTML).toContain('Localização ativada com sucesso');
      jest.advanceTimersByTime(3000);
      expect(toast.classList.contains('toast-exit')).toBe(true);
      jest.advanceTimersByTime(300);
      expect(document.querySelector('.toast.success')).toBeNull();
    });

    it('should reuse existing toast container', () => {
      // @ts-ignore: access private
      const { createToastContainer, showSuccessToast } = geolocationBannerModule;
      createToastContainer();
      showSuccessToast();
      expect(document.querySelectorAll('.toast-container').length).toBe(1);
    });
  });

  describe('showPermissionDeniedMessage', () => {
    it('should insert denied status message into #app-content', () => {
      const appContent = document.createElement('div');
      appContent.id = 'app-content';
      document.body.appendChild(appContent);
      // @ts-ignore: access private
      const { showPermissionDeniedMessage } = geolocationBannerModule;
      showPermissionDeniedMessage();
      const status = document.querySelector('.geolocation-status.denied');
      expect(status).toBeTruthy();
      expect(status?.innerHTML).toContain('Localização desativada');
    });

    it('should not throw if #app-content does not exist', () => {
      // @ts-ignore: access private
      const { showPermissionDeniedMessage } = geolocationBannerModule;
      expect(() => showPermissionDeniedMessage()).not.toThrow();
    });
  });

  describe('init', () => {
    it('should show banner if permission is prompt', async () => {
      // @ts-ignore: access private
      const { checkGeolocationPermission } = geolocationBannerModule;
      jest.spyOn(geolocationBannerModule, 'checkGeolocationPermission').mockResolvedValue('prompt');
      await init();
      expect(document.querySelector('.geolocation-banner')).toBeTruthy();
    });

    it('should show denied message if permission is denied', async () => {
      // @ts-ignore: access private
      const { checkGeolocationPermission } = geolocationBannerModule;
      jest.spyOn(geolocationBannerModule, 'checkGeolocationPermission').mockResolvedValue('denied');
      const deniedSpy = jest.spyOn(geolocationBannerModule, 'showPermissionDeniedMessage');
      await init();
      expect(deniedSpy).toHaveBeenCalled();
      deniedSpy.mockRestore();
    });

    it('should not show banner or denied message if permission is granted', async () => {
      // @ts-ignore: access private
      const { checkGeolocationPermission } = geolocationBannerModule;
      jest.spyOn(geolocationBannerModule, 'checkGeolocationPermission').mockResolvedValue('granted');
      const showBannerSpy = jest.spyOn(geolocationBannerModule, 'showBanner');
      const deniedSpy = jest.spyOn(geolocationBannerModule, 'showPermissionDeniedMessage');
      await init();
      expect(showBannerSpy).not.toHaveBeenCalled();
      expect(deniedSpy).not.toHaveBeenCalled();
      showBannerSpy.mockRestore();
      deniedSpy.mockRestore();
    });
  });

  describe('destroy', () => {
    it('should clear timeouts and remove UI elements', () => {
      // @ts-ignore: access private
      const { showBanner, showPermissionDeniedMessage } = geolocationBannerModule;
      showBanner();
      showPermissionDeniedMessage();
      destroy();
      expect(document.querySelector('.geolocation-banner')).toBeNull();
      expect(document.querySelector('.geolocation-status')).toBeNull();
    });
  });

  describe('getStatus', () => {
    it('should return the current permissionStatus', () => {
      // @ts-ignore: access private
      const { getStatus } = geolocationBannerModule;
      expect(['prompt', 'granted', 'denied']).toContain(getStatus());
    });
  });

  describe('window.GeolocationBanner', () => {
    it('should expose expected API on window', () => {
      expect(window.GeolocationBanner).toBeDefined();
      expect(typeof window.GeolocationBanner.init).toBe('function');
      expect(typeof window.GeolocationBanner.requestPermission).toBe('function');
      expect(typeof window.GeolocationBanner.dismiss).toBe('function');
      expect(typeof window.GeolocationBanner.getStatus).toBe('function');
      expect(typeof window.GeolocationBanner.destroy).toBe('function');
    });
  });
});
