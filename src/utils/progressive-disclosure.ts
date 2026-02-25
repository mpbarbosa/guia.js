/**
 * Progressive Disclosure Manager
 * Handles collapsible sections and state persistence
 * @since 0.11.0-alpha
 */

/**
 * Manages progressive disclosure state for mobile UX
 */
class ProgressiveDisclosureManager {
  STORAGE_KEY: string;
  detailsElement: HTMLElement | null;

  constructor() {
    this.STORAGE_KEY = 'guia-turistico-secondary-info-state';
    this.detailsElement = null;
  }

  /**
   * Initialize the progressive disclosure manager
   */
  init() {
    this.detailsElement = document.getElementById('secondary-info');
    
    if (!this.detailsElement) {
      console.warn('Progressive disclosure: secondary-info element not found');
      return;
    }

    // Restore saved state (only on mobile)
    if (this.isMobile()) {
      this.restoreState();
    }

    // Listen for toggle events
    this.detailsElement.addEventListener('toggle', () => {
      this.saveState();
      this.announceState();
    });

    console.log('Progressive disclosure initialized');
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
      console.log(`Progressive disclosure: Saved state - ${isOpen ? 'open' : 'closed'}`);
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
        console.log(`Progressive disclosure: Restored state - ${open ? 'open' : 'closed'}`);
      } else {
        // Default: closed on mobile for first-time users
        this.detailsElement.open = false;
        console.log('Progressive disclosure: Default state - closed (first visit)');
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
      console.log('Progressive disclosure: State cleared');
    } catch (error) {
      console.warn('Progressive disclosure: Failed to clear state', error);
    }
  }
}

// Export singleton instance
const progressiveDisclosureManager = new ProgressiveDisclosureManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => progressiveDisclosureManager.init());
} else {
  progressiveDisclosureManager.init();
}

// ES6 module export
export default progressiveDisclosureManager;

// Export for Node.js (CommonJS compatibility)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = progressiveDisclosureManager;
}
