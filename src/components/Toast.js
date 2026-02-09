/**
 * Toast Component
 * 
 * Provides lightweight notification toasts for user feedback.
 * Part of UX Quick Win #4 - improves user feedback and confirmation.
 * 
 * @module components/Toast
 */

/**
 * Toast types with associated icons and colors
 */
const TOAST_TYPES = {
  success: { icon: '✓', className: 'toast-success' },
  error: { icon: '✕', className: 'toast-error' },
  info: { icon: 'ℹ', className: 'toast-info' },
  warning: { icon: '⚠', className: 'toast-warning' },
};

/**
 * Toast manager singleton
 */
class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.defaultDuration = 4000;
  }

  /**
   * Initialize the toast container
   * @private
   */
  _ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.setAttribute('role', 'region');
      this.container.setAttribute('aria-label', 'Notificações');
      this.container.setAttribute('aria-live', 'polite');
      document.body.appendChild(this.container);
    }
  }

  /**
   * Show a toast notification
   * 
   * @param {Object} options - Toast options
   * @param {string} options.message - Toast message text
   * @param {string} [options.type='info'] - Toast type (success, error, info, warning)
   * @param {number} [options.duration=4000] - Duration in ms (0 = persistent)
   * @param {string} [options.id] - Optional unique ID to prevent duplicates
   * @returns {string} Toast ID
   */
  show({ message, type = 'info', duration = this.defaultDuration, id }) {
    this._ensureContainer();

    const toastId = id || `toast-${Date.now()}-${Math.random()}`;

    // Prevent duplicate toasts with same ID
    if (id && this.toasts.has(id)) {
      return id;
    }

    const config = TOAST_TYPES[type] || TOAST_TYPES.info;
    const toast = this._createToast(message, config, toastId);

    this.toasts.set(toastId, toast);
    this.container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(toastId), duration);
    }

    return toastId;
  }

  /**
   * Create toast element
   * @private
   */
  _createToast(message, config, toastId) {
    const toast = document.createElement('div');
    toast.className = `toast ${config.className}`;
    
    // Enhanced ARIA attributes for accessibility
    const toastRole = config.className === 'toast-error' ? 'alert' : 'status';
    const ariaLive = config.className === 'toast-error' ? 'assertive' : 'polite';
    
    toast.setAttribute('role', toastRole);
    toast.setAttribute('aria-live', ariaLive);
    toast.setAttribute('aria-atomic', 'true');
    toast.setAttribute('data-toast-id', toastId);

    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = config.icon;

    const text = document.createElement('span');
    text.className = 'toast-message';
    text.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Fechar notificação');
    closeBtn.setAttribute('type', 'button');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this.dismiss(toastId));

    toast.appendChild(icon);
    toast.appendChild(text);
    toast.appendChild(closeBtn);

    return toast;
  }

  /**
   * Dismiss a toast by ID
   * 
   * @param {string} toastId - Toast ID to dismiss
   */
  dismiss(toastId) {
    const toast = this.toasts.get(toastId);
    if (!toast) return;

    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts.delete(toastId);
    }, 300);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    Array.from(this.toasts.keys()).forEach(id => this.dismiss(id));
  }

  /**
   * Convenience methods
   */
  success(message, options = {}) {
    return this.show({ ...options, message, type: 'success' });
  }

  error(message, options = {}) {
    // Error toasts should persist until manually dismissed
    return this.show({ ...options, message, type: 'error', duration: 0 });
  }

  info(message, options = {}) {
    return this.show({ ...options, message, type: 'info' });
  }

  warning(message, options = {}) {
    return this.show({ ...options, message, type: 'warning' });
  }
}

// Create singleton instance
const toastManager = new ToastManager();

// Export for ES modules
export default toastManager;

// Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = toastManager;
}
