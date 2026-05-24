/**
 * Progressive Disclosure Manager
 * Handles collapsible sections and state persistence
 * @since 0.11.0-alpha
 */

/**
 * Manages progressive disclosure state for mobile UX
 */
class ProgressiveDisclosureManager {
  constructor() {
    this.STORAGE_KEY = 'guia-turistico-secondary-info-state';
    this.detailsElement = null;
    this._boundToggleHandler = null;
  }

  /**
   * Initialize the progressive disclosure manager
   */
  init() {
    const detailsElement = document.getElementById('secondary-info');
    if (!detailsElement) {
      this.destroy();
      return;
    }

    if (this.detailsElement === detailsElement && this._boundToggleHandler) {
      return;
    }

    this.destroy();
    this.detailsElement = detailsElement;

    // Restore saved state (only on mobile)
    if (this.isMobile()) {
      this.restoreState();
    }

    // Listen for toggle events
    this._boundToggleHandler = () => {
      this.saveState();
      this.announceState();
    };
    this.detailsElement.addEventListener('toggle', this._boundToggleHandler);
  }

  /**
   * Check if viewport is mobile size
   * @returns {boolean}
   */
  isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  /**
   * Save collapse state to localStorage
   */
  saveState() {
    if (!this.detailsElement) return;

    const isOpen = this.detailsElement.open;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ open: isOpen }));
    } catch (error) {
      console.warn('Progressive disclosure: Failed to save state', error);
    }
  }

  /**
   * Restore collapse state from localStorage
   */
  restoreState() {
    if (!this.detailsElement) return;

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const { open } = JSON.parse(saved);
        this.detailsElement.open = open;
      } else {
        // Default: closed on mobile for first-time users
        this.detailsElement.open = false;
      }
    } catch (error) {
      console.warn('Progressive disclosure: Failed to restore state', error);
      // Default to closed on error
      this.detailsElement.open = false;
    }
  }

  /**
   * Announce state change to screen readers
   */
  announceState() {
    if (!this.detailsElement) return;

    const isOpen = this.detailsElement.open;
    const message = isOpen 
      ? 'Informações adicionais expandidas' 
      : 'Informações adicionais recolhidas';

    // Create temporary live region for announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      announcement.remove();
    }, 1000);
  }

  /**
   * Clear saved state (for testing/debugging)
   */
  clearState() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Progressive disclosure: Failed to clear state', error);
    }
  }

  /**
   * Remove listeners and release the current element reference.
   */
  destroy() {
    if (this.detailsElement && this._boundToggleHandler) {
      this.detailsElement.removeEventListener('toggle', this._boundToggleHandler);
    }

    this.detailsElement = null;
    this._boundToggleHandler = null;
  }
}

// Export singleton instance
const progressiveDisclosureManager = new ProgressiveDisclosureManager();

// ES6 module export
export default progressiveDisclosureManager;
