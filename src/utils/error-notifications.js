'use strict';

/**
 * Error notification utilities.
 * 
 * Provides consistent error toast notifications for user-facing errors.
 * 
 * @module utils/error-notifications
 * @since 0.11.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import { log } from './logger.js';

/**
 * Show error toast notification.
 * 
 * @param {string} title - Error title
 * @param {string} message - Error message
 * @param {number} [duration=5000] - Auto-dismiss duration in milliseconds (0 = no auto-dismiss)
 * @returns {HTMLElement} Toast element
 * 
 * @example
 * showErrorToast('Erro de Conexão', 'Não foi possível conectar ao servidor');
 */
export function showErrorToast(title, message, duration = 5000) {
  // Remove existing toast if present
  const existing = document.querySelector('.error-toast');
  if (existing) {
    dismissToast(existing);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'error-toast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  
  toast.innerHTML = `
    <div class="error-toast-icon" aria-hidden="true">⚠️</div>
    <div class="error-toast-content">
      <div class="error-toast-title">${escapeHTML(title)}</div>
      <div class="error-toast-message">${escapeHTML(message)}</div>
    </div>
    <button class="error-toast-close" aria-label="Fechar notificação">×</button>
  `;
  
  // Add to document
  document.body.appendChild(toast);
  
  // Close button handler
  const closeBtn = toast.querySelector('.error-toast-close');
  closeBtn.addEventListener('click', () => dismissToast(toast));
  
  // Auto-dismiss if duration specified
  if (duration > 0) {
    setTimeout(() => dismissToast(toast), duration);
  }
  
  log('Error toast shown:', title);
  
  return toast;
}

/**
 * Dismiss error toast with animation.
 * 
 * @param {HTMLElement} toast - Toast element to dismiss
 */
function dismissToast(toast) {
  if (!toast || !toast.parentNode) return;
  
  toast.classList.add('dismissing');
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300); // Match animation duration
}

/**
 * Show success toast notification.
 * 
 * @param {string} title - Success title
 * @param {string} message - Success message
 * @param {number} [duration=3000] - Auto-dismiss duration
 * @returns {HTMLElement} Toast element
 */
export function showSuccessToast(title, message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'success-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  
  toast.innerHTML = `
    <div class="success-toast-icon" aria-hidden="true">✓</div>
    <div class="success-toast-content">
      <div class="success-toast-title">${escapeHTML(title)}</div>
      <div class="success-toast-message">${escapeHTML(message)}</div>
    </div>
    <button class="success-toast-close" aria-label="Fechar notificação">×</button>
  `;
  
  document.body.appendChild(toast);
  
  const closeBtn = toast.querySelector('.success-toast-close');
  closeBtn.addEventListener('click', () => dismissToast(toast));
  
  if (duration > 0) {
    setTimeout(() => dismissToast(toast), duration);
  }
  
  return toast;
}

/**
 * Escape HTML to prevent XSS.
 * @private
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Show generic error message for API failures.
 * 
 * @param {Error} error - Error object
 */
export function showAPIError(error) {
  const message = error.message || 'Erro desconhecido ao comunicar com o servidor';
  showErrorToast('Erro de API', message);
}

/**
 * Show network error message.
 */
export function showNetworkError() {
  showErrorToast(
    'Erro de Conexão',
    'Verifique sua conexão com a internet e tente novamente',
    0 // Don't auto-dismiss network errors
  );
}

/**
 * Show geolocation error message.
 * 
 * @param {number} errorCode - Geolocation error code
 */
export function showGeolocationError(errorCode) {
  const messages = {
    1: 'Permissão de localização negada pelo usuário',
    2: 'Posição indisponível no momento',
    3: 'Tempo limite excedido ao obter localização'
  };
  
  const message = messages[errorCode] || 'Erro desconhecido de geolocalização';
  showErrorToast('Erro de Localização', message);
}
