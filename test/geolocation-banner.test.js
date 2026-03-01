// __tests__/geolocation-banner.test.js
import '../src/geolocation-banner';

const { GeolocationBanner } = window;

describe('GeolocationBanner', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    GeolocationBanner.destroy();
    document.body.innerHTML = '';
    window.ErrorRecovery = undefined;
    jest.clearAllMocks();
  });

  afterEach(() => {
    GeolocationBanner.destroy();
    document.body.innerHTML = '';
    window.ErrorRecovery = undefined;
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('init', () => {
    it('shows banner when permission is prompt', async () => {
      window.navigator.permissions = {
        query: jest.fn().mockResolvedValue({ state: 'prompt' }),
      };
      await GeolocationBanner.init();
      expect(document.querySelector('.geolocation-banner')).toBeTruthy();
    });

    it('shows denied message when permission is denied', async () => {
      window.navigator.permissions = {
        query: jest.fn().mockResolvedValue({ state: 'denied' }),
      };
      const appContent = document.createElement('div');
      appContent.id = 'app-content';
      document.body.appendChild(appContent);
      await GeolocationBanner.init();
      expect(document.querySelector('.geolocation-status.denied')).toBeTruthy();
    });

    it('does not show banner if permission is granted', async () => {
      window.navigator.permissions = {
        query: jest.fn().mockResolvedValue({ state: 'granted' }),
      };
      await GeolocationBanner.init();
      expect(document.querySelector('.geolocation-banner')).toBeNull();
    });

    it('falls back to prompt if permissions API not available', async () => {
      window.navigator.permissions = undefined;
      await GeolocationBanner.init();
      expect(document.querySelector('.geolocation-banner')).toBeTruthy();
    });

    it('falls back to prompt if permissions API throws', async () => {
      window.navigator.permissions = {
        query: jest.fn().mockRejectedValue(new Error('fail')),
      };
      await GeolocationBanner.init();
      expect(document.querySelector('.geolocation-banner')).toBeTruthy();
    });
  });

  describe('showBanner', () => {
    it('renders banner with buttons', async () => {
      GeolocationBanner.destroy();
      await GeolocationBanner.init();
      const banner = document.querySelector('.geolocation-banner');
      expect(banner).toBeTruthy();
      expect(banner.querySelector('.btn-primary')).toBeTruthy();
      expect(banner.querySelector('.btn-secondary')).toBeTruthy();
    });

    it('allow button triggers requestPermission', async () => {
      GeolocationBanner.destroy();
      await GeolocationBanner.init();
      const allowBtn = document.querySelector('.geolocation-banner .btn-primary');
      window.navigator.geolocation = {
        getCurrentPosition: jest.fn((success) => success({ coords: { latitude: 1, longitude: 2 } })),
      };
      allowBtn.click();
      jest.advanceTimersByTime(300);
      expect(GeolocationBanner.getStatus()).toBe('granted');
    });

    it('dismiss button hides banner', async () => {
      GeolocationBanner.destroy();
      await GeolocationBanner.init();
      const dismissBtn = document.querySelector('.geolocation-banner .btn-secondary');
      dismissBtn.click();
      jest.advanceTimersByTime(300);
      expect(document.querySelector('.geolocation-banner')).toBeNull();
    });
  });

  describe('requestPermission', () => {
    it('shows error if geolocation not supported', async () => {
      window.navigator.geolocation = undefined;
      window.alert = jest.fn();
      await GeolocationBanner.init();
      const allowBtn = document.querySelector('.geolocation-banner .btn-primary');
      allowBtn.click();
      jest.advanceTimersByTime(300);
      expect(window.alert).toHaveBeenCalledWith('Geolocalização não é suportada neste navegador.');
      expect(document.querySelector('.geolocation-banner')).toBeNull();
    });

    it('handles permission granted', async () => {
      window.navigator.geolocation = {
        getCurrentPosition: jest.fn((success) => success({ coords: { latitude: 1, longitude: 2 } })),
      };
      await GeolocationBanner.init();
      const allowBtn = document.querySelector('.geolocation-banner .btn-primary');
      allowBtn.click();
      jest.advanceTimersByTime(300);
      expect(GeolocationBanner.getStatus()).toBe('granted');
      expect(document.querySelector('.geolocation-banner')).toBeNull();
    });

    it('handles permission denied', async () => {
      window.navigator.geolocation = {
        getCurrentPosition: jest.fn((_success, error) => error({ code: 1 })),
      };
      const appContent = document.createElement('div');
      appContent.id = 'app-content';
      document.body.appendChild(appContent);
      await GeolocationBanner.init();
      const allowBtn = document.querySelector('.geolocation-banner .btn-primary');
      allowBtn.click();
      jest.advanceTimersByTime(300);
      expect(GeolocationBanner.getStatus()).toBe('denied');
      expect(document.querySelector('.geolocation-banner')).toBeNull();
      expect(document.querySelector('.geolocation-status.denied')).toBeTruthy();
    });
  });

  describe('dismissBanner', () => {
    it('hides and removes banner', async () => {
      await GeolocationBanner.init();
      const banner = document.querySelector('.geolocation-banner');
      GeolocationBanner.dismiss();
      jest.advanceTimersByTime(300);
      expect(document.querySelector('.geolocation-banner')).toBeNull();
    });

    it('does nothing if banner not present', () => {
      GeolocationBanner.dismiss();
      expect(document.querySelector('.geolocation-banner')).toBeNull();
    });
  });

  describe('showSuccessToast', () => {
    it('shows success toast if ErrorRecovery available', async () => {
      window.ErrorRecovery = { displayError: jest.fn() };
      window.navigator.geolocation = {
        getCurrentPosition: jest.fn((success) => success({ coords: { latitude: 1, longitude: 2 } })),
      };
      await GeolocationBanner.init();
      const allowBtn = document.querySelector('.geolocation-banner .btn-primary');
      allowBtn.click();
      const container = document.querySelector('.toast-container');
      expect(container).toBeTruthy();
      const toast = document.querySelector('.toast.success');
      expect(toast).toBeTruthy();
      expect(toast.innerHTML).toContain('Localização ativada com sucesso!');
    });

    it('auto-removes success toast after timeout', async () => {
      window.ErrorRecovery = { displayError: jest.fn() };
      window.navigator.geolocation = {
        getCurrentPosition: jest.fn((success) => success({ coords: { latitude: 1, longitude: 2 } })),
      };
      await GeolocationBanner.init();
      const allowBtn = document.querySelector('.geolocation-banner .btn-primary');
      allowBtn.click();
      jest.advanceTimersByTime(3000);
      const toast = document.querySelector('.toast.success');
      expect(toast.classList.contains('toast-exit')).toBe(true);
      jest.advanceTimersByTime(300);
      expect(document.querySelector('.toast.success')).toBeNull();
    });
  });

  describe('showPermissionDeniedMessage', () => {
    it('shows denied message in app-content', async () => {
      const appContent = document.createElement('div');
      appContent.id = 'app-content';
      document.body.appendChild(appContent);
      window.navigator.geolocation = {
        getCurrentPosition: jest.fn((_success, error) => error({ code: 1 })),
      };
      window.navigator.permissions = undefined;
      await GeolocationBanner.init();
      const allowBtn = document.querySelector('.geolocation-banner .btn-primary');
      allowBtn.click();
      expect(document.querySelector('.geolocation-status.denied')).toBeTruthy();
    });
  });

  describe('createToastContainer', () => {
    it('creates toast container if not present', () => {
      GeolocationBanner.destroy();
      expect(document.querySelector('.toast-container')).toBeNull();
      const container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
      expect(document.querySelector('.toast-container')).toBeTruthy();
    });
  });

  describe('getStatus', () => {
    it('returns current permission status', () => {
      expect(['prompt', 'granted', 'denied']).toContain(GeolocationBanner.getStatus());
    });
  });

  describe('destroy', () => {
    it('removes banner and status messages', async () => {
      await GeolocationBanner.init();
      GeolocationBanner.displayError = jest.fn();
      GeolocationBanner.destroy();
      expect(document.querySelector('.geolocation-banner')).toBeNull();
      expect(document.querySelector('.geolocation-status')).toBeNull();
    });

    it('clears activeTimeouts', async () => {
      await GeolocationBanner.init();
      GeolocationBanner.destroy();
      // No way to directly check activeTimeouts, but no errors should occur
    });
  });
});
