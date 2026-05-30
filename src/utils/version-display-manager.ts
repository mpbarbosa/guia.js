/**
 * Version Display Manager
 * Handles version badge display, modal interactions, and console logging
 * 
 * @module utils/version-display-manager
 * @since 0.11.0-alpha
 */

import { VERSION, BUILD_DATE, VERSION_WITH_DATE } from '../config/version.js';

/**
 * VersionDisplayManager
 * Singleton class to manage version display and interactions
 */
class VersionDisplayManager {
  versionBadge: HTMLElement | null = null;
  modalOverlay: HTMLElement | null = null;
  modalDialog: HTMLElement | null = null;
  modalCloseBtn: HTMLElement | null = null;
  previousFocusedElement: HTMLElement | null = null;
  isModalOpen: boolean = false;
  static instance: VersionDisplayManager | null = null;

  constructor() {
    if (VersionDisplayManager.instance) {
      return VersionDisplayManager.instance;
    }

    this.versionBadge = null;
    this.modalOverlay = null;
    this.modalDialog = null;
    this.modalCloseBtn = null;
    this.previousFocusedElement = null;
    this.isModalOpen = false;

    VersionDisplayManager.instance = this;
  }

  /**
   * Initialize the version display manager
   * Sets up event listeners and logs version to console
   */
  init(): void {
    this._updateVersionBadge();
    this._setupEventListeners();
    this._logVersionToConsole();
  }

  /**
   * Update the version badge text content
   * @private
   */
  _updateVersionBadge() {
    this.versionBadge = document.querySelector('.app-version');
    if (this.versionBadge) {
      this.versionBadge.textContent = VERSION_WITH_DATE;
    }
  }

  /**
   * Setup event listeners for version badge and modal
   * @private
   */
  _setupEventListeners() {
    this.modalOverlay = document.querySelector('.version-modal-overlay');
    this.modalDialog = document.querySelector('.version-modal');
    this.modalCloseBtn = document.querySelector('.version-modal-close');

    if (!this.versionBadge || !this.modalOverlay || !this.modalDialog || !this.modalCloseBtn) {
      console.warn('⚠️ Version display elements not found');
      return;
    }

    this.modalOverlay.setAttribute('aria-hidden', 'true');
    this.versionBadge.setAttribute('aria-expanded', 'false');

    // Click on version badge opens modal
    this.versionBadge.addEventListener('click', () => this.openModal());

    // Enter/Space on version badge opens modal (keyboard accessibility)
    this.versionBadge.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openModal();
      }
    });

    // Close button closes modal
    this.modalCloseBtn.addEventListener('click', () => this.closeModal());

    // Click outside modal closes it
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) {
        this.closeModal();
      }
    });

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
      if (!this.isModalOpen) {
        return;
      }

      if (e.key === 'Tab') {
        this._trapFocus(e);
        return;
      }

      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  /**
   * Open the version info modal
   */
  openModal(): void {
    if (!this.modalOverlay || !this.modalDialog) return;

    this.previousFocusedElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    this._populateModalData();
    this.modalOverlay.setAttribute('aria-hidden', 'false');
    this.modalOverlay.classList.add('visible');
    this.isModalOpen = true;
    this.versionBadge?.setAttribute('aria-expanded', 'true');

    this._setBackgroundInert(true);
    this.modalCloseBtn?.focus();

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Announce modal open to screen readers
    this._announceToScreenReader('Modal de informações da versão aberto');
  }

  /**
   * Close the version info modal
   */
  closeModal(): void {
    if (!this.modalOverlay) return;

    this.modalOverlay.classList.remove('visible');
    this.modalOverlay.setAttribute('aria-hidden', 'true');
    this.isModalOpen = false;
    this.versionBadge?.setAttribute('aria-expanded', 'false');

    // Restore body scroll
    document.body.style.overflow = '';
    this._setBackgroundInert(false);

    // Return focus to version badge
    this.previousFocusedElement?.focus();
    this.previousFocusedElement = null;

    // Announce modal close to screen readers
    this._announceToScreenReader('Modal de informações da versão fechado');
  }

  _getFocusableElements(): HTMLElement[] {
    if (!this.modalDialog) {
      return [];
    }

    return Array.from(
      this.modalDialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true');
  }

  _trapFocus(event: KeyboardEvent): void {
    if (!this.modalDialog) {
      return;
    }

    const focusableElements = this._getFocusableElements();
    if (focusableElements.length === 0) {
      event.preventDefault();
      this.modalDialog.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (!activeElement || activeElement === firstElement || !this.modalDialog.contains(activeElement)) {
        event.preventDefault();
        lastElement.focus();
      }
      return;
    }

    if (!activeElement || activeElement === lastElement || !this.modalDialog.contains(activeElement)) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  _setBackgroundInert(isInert: boolean): void {
    const backgroundElements = [
      document.getElementById('app-content'),
      this.versionBadge,
      document.getElementById('lbs-provider-indicator'),
    ].filter((element): element is HTMLElement => element instanceof HTMLElement);

    for (const element of backgroundElements) {
      if (isInert) {
        element.setAttribute('inert', '');
        element.setAttribute('aria-hidden', 'true');
        continue;
      }

      element.removeAttribute('inert');
      element.removeAttribute('aria-hidden');
    }
  }

  /**
   * Populate modal with version and browser information
   * @private
   */
  _populateModalData() {
    // Version
    const versionEl = document.getElementById('modal-version');
    if (versionEl) {
      versionEl.textContent = VERSION;
    }

    // Build date
    const buildDateEl = document.getElementById('modal-build-date');
    if (buildDateEl) {
      buildDateEl.textContent = BUILD_DATE;
    }

    // Browser info
    const browserEl = document.getElementById('modal-browser');
    if (browserEl) {
      browserEl.textContent = this._getBrowserInfo();
    }

    // User agent
    const userAgentEl = document.getElementById('modal-user-agent');
    if (userAgentEl) {
      userAgentEl.textContent = navigator.userAgent;
    }
  }

  /**
   * Get browser name and version
   * @returns {string} Browser info string
   * @private
   */
  _getBrowserInfo(): string {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';

    // Chrome
    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      browserName = 'Chrome';
      const match = ua.match(/Chrome\/(\d+\.\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    }
    // Edge
    else if (ua.includes('Edg')) {
      browserName = 'Edge';
      const match = ua.match(/Edg\/(\d+\.\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    }
    // Firefox
    else if (ua.includes('Firefox')) {
      browserName = 'Firefox';
      const match = ua.match(/Firefox\/(\d+\.\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    }
    // Safari
    else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browserName = 'Safari';
      const match = ua.match(/Version\/(\d+\.\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    }

    return `${browserName} ${browserVersion}`;
  }

  /**
   * Log version information to browser console
   * Useful for developers and bug reports
   * @private
   */
  _logVersionToConsole() {
    console.log('%c🗺️ Guia Turístico', 'font-size: 20px; font-weight: bold; color: #6750a4;');
    console.log(`%cVersion: ${VERSION}`, 'font-size: 14px; font-weight: bold;');
    console.log(`%cBuild Date: ${BUILD_DATE}`, 'font-size: 12px;');
    console.log(`%cBrowser: ${this._getBrowserInfo()}`, 'font-size: 12px;');
    console.log(`%cUser Agent: ${navigator.userAgent}`, 'font-size: 11px; color: #666;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #6750a4;');
    console.log('%cPara reportar bugs, inclua as informações acima.', 'font-size: 12px; font-style: italic;');
    console.log('%cGitHub: https://github.com/mpbarbosa/guia.js', 'font-size: 11px; color: #0969da;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #6750a4;');
  }

  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   * @private
   */
  _announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

// Export singleton instance
export default new VersionDisplayManager();
