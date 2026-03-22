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
  modalCloseBtn: HTMLElement | null = null;
  isModalOpen: boolean = false;
  static instance: VersionDisplayManager | null = null;

  constructor() {
    if (VersionDisplayManager.instance) {
      return VersionDisplayManager.instance;
    }

    this.versionBadge = null;
    this.modalOverlay = null;
    this.modalCloseBtn = null;
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
    this.modalCloseBtn = document.querySelector('.version-modal-close');

    if (!this.versionBadge || !this.modalOverlay || !this.modalCloseBtn) {
      console.warn('⚠️ Version display elements not found');
      return;
    }

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
      if (e.key === 'Escape' && this.isModalOpen) {
        this.closeModal();
      }
    });
  }

  /**
   * Open the version info modal
   */
  openModal(): void {
    if (!this.modalOverlay) return;

    this._populateModalData();
    this.modalOverlay.classList.add('visible');
    this.isModalOpen = true;

    // Focus close button for keyboard navigation
    setTimeout(() => {
      this.modalCloseBtn?.focus();
    }, 100);

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
    this.isModalOpen = false;

    // Restore body scroll
    document.body.style.overflow = '';

    // Return focus to version badge
    this.versionBadge?.focus();

    // Announce modal close to screen readers
    this._announceToScreenReader('Modal de informações da versão fechado');
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
    console.log('%cGitHub: https://github.com/mpbarbosa/guia_turistico', 'font-size: 11px; color: #0969da;');
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
