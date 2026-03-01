/**
 * version-display-manager.test.ts — Tests for VersionDisplayManager (src/utils/version-display-manager.ts)
 */

import VersionDisplayManager from './version-display-manager';

jest.mock('../config/version.js', () => ({
  VERSION: '1.2.3',
  BUILD_DATE: '2026-02-28',
  VERSION_WITH_DATE: '1.2.3 (2026-02-28)'
}));

describe('VersionDisplayManager', () => {
  let instance: typeof VersionDisplayManager;
  let originalUserAgent: string;

  beforeEach(() => {
    // Reset singleton
    (VersionDisplayManager.constructor as any).instance = null;
    instance = new (VersionDisplayManager.constructor as any)();
    document.body.innerHTML = '';
    originalUserAgent = window.navigator.userAgent;
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      configurable: true
    });
  });

  afterEach(() => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true
    });
    jest.restoreAllMocks();
  });

  describe('Singleton behavior', () => {
    it('should always return the same instance', () => {
      const inst1 = new (VersionDisplayManager.constructor as any)();
      const inst2 = new (VersionDisplayManager.constructor as any)();
      expect(inst1).toBe(inst2);
    });
  });

  describe('init', () => {
    beforeEach(() => {
      const badge = document.createElement('div');
      badge.className = 'app-version';
      document.body.appendChild(badge);

      const overlay = document.createElement('div');
      overlay.className = 'version-modal-overlay';
      document.body.appendChild(overlay);

      const closeBtn = document.createElement('button');
      closeBtn.className = 'version-modal-close';
      document.body.appendChild(closeBtn);
    });

    it('should update version badge, setup listeners, and log version (happy path)', () => {
      const updateSpy = jest.spyOn(instance, '_updateVersionBadge');
      const setupSpy = jest.spyOn(instance, '_setupEventListeners');
      const logSpy = jest.spyOn(instance, '_logVersionToConsole');
      instance.init();
      expect(updateSpy).toHaveBeenCalled();
      expect(setupSpy).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalled();
    });

    it('should warn if elements are missing (edge case)', () => {
      document.body.innerHTML = '';
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      instance.init();
      expect(warnSpy).toHaveBeenCalledWith('⚠️ Version display elements not found');
      warnSpy.mockRestore();
    });
  });

  describe('_updateVersionBadge', () => {
    it('should set version badge text to VERSION_WITH_DATE (happy path)', () => {
      const badge = document.createElement('div');
      badge.className = 'app-version';
      document.body.appendChild(badge);
      instance._updateVersionBadge();
      expect(badge.textContent).toBe('1.2.3 (2026-02-28)');
    });

    it('should do nothing if badge not found (edge case)', () => {
      expect(() => instance._updateVersionBadge()).not.toThrow();
    });
  });

  describe('_setupEventListeners', () => {
    let badge: HTMLElement, overlay: HTMLElement, closeBtn: HTMLElement;

    beforeEach(() => {
      badge = document.createElement('div');
      badge.className = 'app-version';
      document.body.appendChild(badge);

      overlay = document.createElement('div');
      overlay.className = 'version-modal-overlay';
      document.body.appendChild(overlay);

      closeBtn = document.createElement('button');
      closeBtn.className = 'version-modal-close';
      document.body.appendChild(closeBtn);

      instance._updateVersionBadge();
      instance._setupEventListeners();
    });

    it('should open modal on badge click (happy path)', () => {
      const openSpy = jest.spyOn(instance, 'openModal');
      badge.click();
      expect(openSpy).toHaveBeenCalled();
    });

    it('should open modal on badge Enter/Space keydown (keyboard accessibility)', () => {
      const openSpy = jest.spyOn(instance, 'openModal');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      badge.dispatchEvent(enterEvent);
      expect(openSpy).toHaveBeenCalled();

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      badge.dispatchEvent(spaceEvent);
      expect(openSpy).toHaveBeenCalled();
    });

    it('should close modal on close button click', () => {
      const closeSpy = jest.spyOn(instance, 'closeModal');
      closeBtn.click();
      expect(closeSpy).toHaveBeenCalled();
    });

    it('should close modal on overlay click (outside modal)', () => {
      const closeSpy = jest.spyOn(instance, 'closeModal');
      overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(closeSpy).toHaveBeenCalled();
    });

    it('should close modal on Escape keydown when modal is open', () => {
      instance.isModalOpen = true;
      const closeSpy = jest.spyOn(instance, 'closeModal');
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escEvent);
      expect(closeSpy).toHaveBeenCalled();
    });

    it('should warn if any element is missing (error scenario)', () => {
      document.body.innerHTML = '';
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      instance._setupEventListeners();
      expect(warnSpy).toHaveBeenCalledWith('⚠️ Version display elements not found');
      warnSpy.mockRestore();
    });
  });

  describe('openModal', () => {
    let overlay: HTMLElement, closeBtn: HTMLElement, badge: HTMLElement;

    beforeEach(() => {
      overlay = document.createElement('div');
      overlay.className = 'version-modal-overlay';
      document.body.appendChild(overlay);

      closeBtn = document.createElement('button');
      closeBtn.className = 'version-modal-close';
      document.body.appendChild(closeBtn);

      badge = document.createElement('div');
      badge.className = 'app-version';
      document.body.appendChild(badge);

      instance.modalOverlay = overlay;
      instance.modalCloseBtn = closeBtn;
      instance.versionBadge = badge;
    });

    it('should populate modal, show overlay, set isModalOpen, and focus close button (happy path)', () => {
      jest.useFakeTimers();
      const populateSpy = jest.spyOn(instance, '_populateModalData');
      const announceSpy = jest.spyOn(instance, '_announceToScreenReader');
      instance.openModal();
      expect(populateSpy).toHaveBeenCalled();
      expect(overlay.classList.contains('visible')).toBe(true);
      expect(instance.isModalOpen).toBe(true);
      jest.runAllTimers();
      expect(document.activeElement).toBe(closeBtn);
      expect(document.body.style.overflow).toBe('hidden');
      expect(announceSpy).toHaveBeenCalledWith('Modal de informações da versão aberto');
      jest.useRealTimers();
    });

    it('should do nothing if modalOverlay is null (edge case)', () => {
      instance.modalOverlay = null;
      expect(() => instance.openModal()).not.toThrow();
    });
  });

  describe('closeModal', () => {
    let overlay: HTMLElement, closeBtn: HTMLElement, badge: HTMLElement;

    beforeEach(() => {
      overlay = document.createElement('div');
      overlay.className = 'version-modal-overlay visible';
      document.body.appendChild(overlay);

      closeBtn = document.createElement('button');
      closeBtn.className = 'version-modal-close';
      document.body.appendChild(closeBtn);

      badge = document.createElement('div');
      badge.className = 'app-version';
      document.body.appendChild(badge);

      instance.modalOverlay = overlay;
      instance.modalCloseBtn = closeBtn;
      instance.versionBadge = badge;
      instance.isModalOpen = true;
    });

    it('should hide overlay, set isModalOpen false, restore scroll, focus badge, and announce close (happy path)', () => {
      const announceSpy = jest.spyOn(instance, '_announceToScreenReader');
      instance.closeModal();
      expect(overlay.classList.contains('visible')).toBe(false);
      expect(instance.isModalOpen).toBe(false);
      expect(document.body.style.overflow).toBe('');
      expect(document.activeElement).toBe(badge);
      expect(announceSpy).toHaveBeenCalledWith('Modal de informações da versão fechado');
    });

    it('should do nothing if modalOverlay is null (edge case)', () => {
      instance.modalOverlay = null;
      expect(() => instance.closeModal()).not.toThrow();
    });
  });

  describe('_populateModalData', () => {
    beforeEach(() => {
      const versionEl = document.createElement('div');
      versionEl.id = 'modal-version';
      document.body.appendChild(versionEl);

      const buildDateEl = document.createElement('div');
      buildDateEl.id = 'modal-build-date';
      document.body.appendChild(buildDateEl);

      const browserEl = document.createElement('div');
      browserEl.id = 'modal-browser';
      document.body.appendChild(browserEl);

      const userAgentEl = document.createElement('div');
      userAgentEl.id = 'modal-user-agent';
      document.body.appendChild(userAgentEl);
    });

    it('should populate modal fields with version, build date, browser info, and user agent (happy path)', () => {
      instance._populateModalData();
      expect(document.getElementById('modal-version').textContent).toBe('1.2.3');
      expect(document.getElementById('modal-build-date').textContent).toBe('2026-02-28');
      expect(document.getElementById('modal-browser').textContent).toContain('Chrome');
      expect(document.getElementById('modal-user-agent').textContent).toBe(window.navigator.userAgent);
    });

    it('should not throw if any modal field is missing (edge case)', () => {
      document.getElementById('modal-version').remove();
      expect(() => instance._populateModalData()).not.toThrow();
    });
  });

  describe('_getBrowserInfo', () => {
    it('should detect Chrome browser', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 Chrome/120.0.0.0',
        configurable: true
      });
      expect(instance._getBrowserInfo()).toContain('Chrome');
    });

    it('should detect Edge browser', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 Edg/120.0.0.0',
        configurable: true
      });
      expect(instance._getBrowserInfo()).toContain('Edge');
    });

    it('should detect Firefox browser', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 Firefox/120.0',
        configurable: true
      });
      expect(instance._getBrowserInfo()).toContain('Firefox');
    });

    it('should detect Safari browser', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 Version/16.0 Safari/605.1.15',
        configurable: true
      });
      expect(instance._getBrowserInfo()).toContain('Safari');
    });

    it('should return Unknown for unknown browser', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0',
        configurable: true
      });
      expect(instance._getBrowserInfo()).toContain('Unknown');
    });
  });

  describe('_logVersionToConsole', () => {
    it('should log version info to console (happy path)', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      instance._logVersionToConsole();
      expect(logSpy).toHaveBeenCalled();
      logSpy.mockRestore();
    });
  });

  describe('_announceToScreenReader', () => {
    it('should add and remove announcement div (happy path)', () => {
      jest.useFakeTimers();
      instance._announceToScreenReader('Test announcement');
      const announcement = document.querySelector('[role="status"]');
      expect(announcement).toBeTruthy();
      jest.runAllTimers();
      expect(document.querySelector('[role="status"]')).toBeNull();
      jest.useRealTimers();
    });
  });
});
