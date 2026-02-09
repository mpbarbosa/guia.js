/**
 * Toast Notification System
 * Non-blocking notifications with proper accessibility support
 * @since 0.8.7-alpha
 * @module utils/toast
 */

/**
 * Show a toast notification
 * 
 * @param {string} message - Message to display
 * @param {string} type - Type of toast: 'success', 'error', 'info', 'warning'
 * @param {Object} options - Configuration options
 * @param {number} options.duration - Display duration in ms (default: 5000)
 * @param {boolean} options.dismissible - Whether user can dismiss (default: true)
 * @returns {HTMLElement} Toast element
 * 
 * @example
 * showToast('Localização atualizada com sucesso!', 'success');
 * showToast('Erro ao obter localização', 'error', { duration: 8000 });
 */
export function showToast(message, type = 'info', options = {}) {
  const {
    duration = 5000,
    dismissible = true
  } = options;

  // Get or create toast container
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Notificações');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  // Icon map
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ⓘ',
    warning: '⚠'
  };

  // Toast structure
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-message">${escapeHtml(message)}</div>
    ${dismissible ? '<button class="toast-close" type="button" aria-label="Fechar notificação">×</button>' : ''}
  `;

  // Add to container
  container.appendChild(toast);

  // Trigger animation (after DOM insertion)
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });

  // Handle dismiss button
  if (dismissible) {
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      dismissToast(toast);
    });
  }

  // Auto-dismiss after duration
  if (duration > 0) {
    setTimeout(() => {
      dismissToast(toast);
    }, duration);
  }

  return toast;
}

/**
 * Dismiss a toast notification
 * 
 * @param {HTMLElement} toast - Toast element to dismiss
 */
export function dismissToast(toast) {
  if (!toast || !toast.classList.contains('toast')) {
    return;
  }

  // Add hide animation
  toast.classList.remove('toast-show');
  toast.classList.add('toast-hide');

  // Remove from DOM after animation
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300); // Match CSS transition duration
}

/**
 * Dismiss all active toasts
 */
export function dismissAllToasts() {
  const toasts = document.querySelectorAll('.toast');
  toasts.forEach(toast => dismissToast(toast));
}

/**
 * Escape HTML to prevent XSS (simple version for toast messages)
 * 
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 * @private
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show success toast (convenience method)
 * 
 * @param {string} message - Success message
 * @param {Object} options - Configuration options
 * @returns {HTMLElement} Toast element
 */
export function showSuccess(message, options = {}) {
  return showToast(message, 'success', options);
}

/**
 * Show error toast (convenience method)
 * 
 * @param {string} message - Error message
 * @param {Object} options - Configuration options
 * @returns {HTMLElement} Toast element
 */
export function showError(message, options = {}) {
  return showToast(message, 'error', { duration: 8000, ...options });
}

/**
 * Show info toast (convenience method)
 * 
 * @param {string} message - Info message
 * @param {Object} options - Configuration options
 * @returns {HTMLElement} Toast element
 */
export function showInfo(message, options = {}) {
  return showToast(message, 'info', options);
}

/**
 * Show warning toast (convenience method)
 * 
 * @param {string} message - Warning message
 * @param {Object} options - Configuration options
 * @returns {HTMLElement} Toast element
 */
export function showWarning(message, options = {}) {
  return showToast(message, 'warning', { duration: 7000, ...options });
}

// Export default object with all functions
export default {
  showToast,
  dismissToast,
  dismissAllToasts,
  showSuccess,
  showError,
  showInfo,
  showWarning
};
