/**
 * maps-integration.test.ts — Tests for MapsIntegration utility (src/utils/maps-integration.ts)
 */

import MapsIntegration from './maps-integration';

describe('MapsIntegration', () => {
  let instance: typeof MapsIntegration;
  let originalWindow: any;

  beforeEach(() => {
    // Reset singleton
    (MapsIntegration.constructor as any).instance = null;
    instance = new (MapsIntegration.constructor as any)();
    originalWindow = { ...window };
    // Setup DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    window.showToast = undefined;
    window.open = originalWindow.open;
    jest.restoreAllMocks();
  });

  describe('Singleton behavior', () => {
    it('should always return the same instance', () => {
      const inst1 = new (MapsIntegration.constructor as any)();
      const inst2 = new (MapsIntegration.constructor as any)();
      expect(inst1).toBe(inst2);
    });
  });

  describe('init', () => {
    it('should setup maps actions container and coordinates observer (happy path)', () => {
      const coordinatesSection = document.createElement('div');
      coordinatesSection.id = 'coordinates';
      document.body.appendChild(coordinatesSection);

      const latLongDisplay = document.createElement('div');
      latLongDisplay.id = 'lat-long-display';
      document.body.appendChild(latLongDisplay);

      const setupMapsActionsSpy = jest.spyOn(instance, '_setupMapsActionsContainer');
      const setupCoordinatesSpy = jest.spyOn(instance, '_setupCoordinatesObserver');

      instance.init();

      expect(setupMapsActionsSpy).toHaveBeenCalled();
      expect(setupCoordinatesSpy).toHaveBeenCalled();
    });

    it('should warn if coordinates section is missing (edge case)', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      document.body.innerHTML = '';
      instance.init();
      expect(warnSpy).toHaveBeenCalledWith('⚠️ Coordinates section not found');
      warnSpy.mockRestore();
    });

    it('should warn if lat-long display is missing (edge case)', () => {
      const coordinatesSection = document.createElement('div');
      coordinatesSection.id = 'coordinates';
      document.body.appendChild(coordinatesSection);

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      instance.init();
      expect(warnSpy).toHaveBeenCalledWith('⚠️ Coordinate display not found');
      warnSpy.mockRestore();
    });
  });

  describe('_handleCoordinatesUpdate', () => {
    beforeEach(() => {
      const coordinatesSection = document.createElement('div');
      coordinatesSection.id = 'coordinates';
      document.body.appendChild(coordinatesSection);

      const latLongDisplay = document.createElement('div');
      latLongDisplay.id = 'lat-long-display';
      document.body.appendChild(latLongDisplay);

      instance._setupMapsActionsContainer();
      instance.mapsActionsContainer.style.display = 'flex';
    });

    it('should update coordinates and show actions for valid input (happy path)', () => {
      const latLongDisplay = document.getElementById('lat-long-display');
      latLongDisplay.textContent = '12.34, 56.78';
      const updateSpy = jest.spyOn(instance, 'updateCoordinates');
      instance._handleCoordinatesUpdate();
      expect(updateSpy).toHaveBeenCalledWith(12.34, 56.78);
      expect(instance.mapsActionsContainer.style.display).toBe('flex');
    });

    it('should hide actions for "Aguardando localização..." (edge case)', () => {
      const latLongDisplay = document.getElementById('lat-long-display');
      latLongDisplay.textContent = 'Aguardando localização...';
      instance._handleCoordinatesUpdate();
      expect(instance.mapsActionsContainer.style.display).toBe('none');
    });

    it('should hide actions for "N/A, N/A" (edge case)', () => {
      const latLongDisplay = document.getElementById('lat-long-display');
      latLongDisplay.textContent = 'N/A, N/A';
      instance._handleCoordinatesUpdate();
      expect(instance.mapsActionsContainer.style.display).toBe('none');
    });

    it('should not update coordinates for invalid input (error scenario)', () => {
      const latLongDisplay = document.getElementById('lat-long-display');
      latLongDisplay.textContent = 'foo, bar';
      const updateSpy = jest.spyOn(instance, 'updateCoordinates');
      instance._handleCoordinatesUpdate();
      expect(updateSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateCoordinates', () => {
    beforeEach(() => {
      const coordinatesSection = document.createElement('div');
      coordinatesSection.id = 'coordinates';
      document.body.appendChild(coordinatesSection);

      const latLongDisplay = document.createElement('div');
      latLongDisplay.id = 'lat-long-display';
      document.body.appendChild(latLongDisplay);

      instance._setupMapsActionsContainer();
    });

    it('should update currentCoordinates and refresh actions (happy path)', () => {
      instance.updateCoordinates(10, 20);
      expect(instance.currentCoordinates).toEqual({ latitude: 10, longitude: 20 });
      expect(instance.mapsActionsContainer.innerHTML).toContain('Google Maps');
      expect(instance.mapsActionsContainer.style.display).toBe('flex');
    });

    it('should setup action listeners for buttons (happy path)', () => {
      instance.updateCoordinates(10, 20);
      const buttons = instance.mapsActionsContainer.querySelectorAll('[data-action]');
      buttons.forEach(btn => {
        expect(btn).toBeInstanceOf(HTMLElement);
        expect(btn.getAttribute('data-action')).toBeTruthy();
      });
    });
  });

  describe('_generateMapsActionsHtml', () => {
    it('should return placeholder if coords is null', () => {
      const html = instance._generateMapsActionsHtml(null);
      expect(html).toContain('Aguardando coordenadas...');
    });

    it('should return buttons if coords is provided', () => {
      const html = instance._generateMapsActionsHtml({ latitude: 1, longitude: 2 });
      expect(html).toContain('Google Maps');
      expect(html).toContain('Street View');
      expect(html).toContain('OpenStreetMap');
      expect(html).toContain('Waze');
    });
  });

  describe('_handleAction', () => {
    beforeEach(() => {
      instance.currentCoordinates = { latitude: 10, longitude: 20 };
      jest.spyOn(instance, '_openUrl').mockImplementation();
    });

    it('should call _getGoogleMapsUrl and _openUrl for google-maps', () => {
      const urlSpy = jest.spyOn(instance, '_getGoogleMapsUrl').mockReturnValue('google-url');
      instance._handleAction('google-maps');
      expect(urlSpy).toHaveBeenCalledWith(10, 20);
      expect(instance._openUrl).toHaveBeenCalledWith('google-url', 'google-maps');
    });

    it('should call _getStreetViewUrl and _openUrl for street-view', () => {
      const urlSpy = jest.spyOn(instance, '_getStreetViewUrl').mockReturnValue('street-url');
      instance._handleAction('street-view');
      expect(urlSpy).toHaveBeenCalledWith(10, 20);
      expect(instance._openUrl).toHaveBeenCalledWith('street-url', 'street-view');
    });

    it('should call _getOpenStreetMapUrl and _openUrl for openstreetmap', () => {
      const urlSpy = jest.spyOn(instance, '_getOpenStreetMapUrl').mockReturnValue('osm-url');
      instance._handleAction('openstreetmap');
      expect(urlSpy).toHaveBeenCalledWith(10, 20);
      expect(instance._openUrl).toHaveBeenCalledWith('osm-url', 'openstreetmap');
    });

    it('should call _getWazeUrl and _openUrl for waze', () => {
      const urlSpy = jest.spyOn(instance, '_getWazeUrl').mockReturnValue('waze-url');
      instance._handleAction('waze');
      expect(urlSpy).toHaveBeenCalledWith(10, 20);
      expect(instance._openUrl).toHaveBeenCalledWith('waze-url', 'waze');
    });

    it('should warn for unknown action (edge case)', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      instance._handleAction('unknown-action');
      expect(warnSpy).toHaveBeenCalledWith('Unknown action: ');
      warnSpy.mockRestore();
    });

    it('should warn if no coordinates available (error scenario)', () => {
      instance.currentCoordinates = null;
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      instance._handleAction('google-maps');
      expect(warnSpy).toHaveBeenCalledWith('⚠️ No coordinates available');
      warnSpy.mockRestore();
    });
  });

  describe('_openUrl', () => {
    beforeEach(() => {
      window.open = jest.fn().mockReturnValue({ closed: false });
      window.showToast = jest.fn();
    });

    it('should open url in new tab and show success toast (happy path)', () => {
      instance._showSuccessToast = jest.fn();
      instance._openUrl('http://test.com', 'google-maps');
      expect(window.open).toHaveBeenCalledWith('http://test.com', '_blank', 'noopener,noreferrer');
      expect(instance._showSuccessToast).toHaveBeenCalledWith('google-maps');
    });

    it('should show popup blocked message if window.open fails (edge case)', () => {
      window.open = jest.fn().mockReturnValue(null);
      instance._showPopupBlockedMessage = jest.fn();
      instance._openUrl('http://test.com', 'waze');
      expect(instance._showPopupBlockedMessage).toHaveBeenCalledWith('http://test.com', 'waze');
    });
  });

  describe('_showPopupBlockedMessage', () => {
    it('should call window.showToast if available', () => {
      window.showToast = jest.fn();
      instance._showPopupBlockedMessage('http://test.com', 'google-maps');
      expect(window.showToast).toHaveBeenCalled();
    });

    it('should fallback to alert and log if showToast not available', () => {
      window.showToast = undefined;
      window.alert = jest.fn();
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      instance._showPopupBlockedMessage('http://test.com', 'openstreetmap');
      expect(window.alert).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith('Blocked URL: ');
      logSpy.mockRestore();
    });
  });

  describe('_showSuccessToast', () => {
    it('should call window.showToast if available', () => {
      window.showToast = jest.fn();
      instance._showSuccessToast('waze');
      expect(window.showToast).toHaveBeenCalledWith(expect.stringContaining('Waze'), 'success', 3000);
    });

    it('should do nothing if showToast not available', () => {
      window.showToast = undefined;
      expect(() => instance._showSuccessToast('street-view')).not.toThrow();
    });
  });

  describe('URL generation methods', () => {
    beforeEach(() => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true,
      });
    });

    it('should generate Google Maps web URL for desktop', () => {
      const url = instance._getGoogleMapsUrl(1, 2);
      expect(url).toContain('https://www.google.com/maps/search/?api=1&query=');
    });

    it('should generate Google Maps deep link for mobile', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Android',
        configurable: true,
      });
      const url = instance._getGoogleMapsUrl(1, 2);
      expect(url).toContain('geo:,?q=,');
    });

    it('should generate Street View URL', () => {
      const url = instance._getStreetViewUrl(1, 2);
      expect(url).toContain('https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=');
    });

    it('should generate OpenStreetMap URL', () => {
      const url = instance._getOpenStreetMapUrl(1, 2);
      expect(url).toContain('https://www.openstreetmap.org/?mlat=&mlon=#map=16//');
    });

    it('should generate Waze URL', () => {
      const url = instance._getWazeUrl(1, 2);
      expect(url).toContain('https://www.waze.com/ul?ll=,&navigate=yes');
    });
  });
});
