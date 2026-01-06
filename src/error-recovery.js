/**
 * Error Recovery and Global Error Handler
 * Provides centralized error handling and recovery mechanisms
 */

(function() {
  'use strict';

  // Global error handler
  window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    displayError('Ocorreu um erro inesperado', event.error.message);
    
    // Prevent default browser error handling
    event.preventDefault();
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    displayError('Erro na operação assíncrona', event.reason);
    
    // Prevent default browser error handling
    event.preventDefault();
  });

  /**
   * Display error message to user
   * @param {string} title - Error title
   * @param {string} message - Error message
   */
  function displayError(title, message) {
    const container = getOrCreateToastContainer();
    
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    
    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">❌</span>
      <div class="toast-content">
        <strong>${escapeHtml(title)}</strong>
        <p style="margin: 4px 0 0 0; font-size: 13px;">${escapeHtml(message)}</p>
      </div>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  /**
   * Get or create toast container
   * @returns {HTMLElement}
   */
  function getOrCreateToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('role', 'region');
      container.setAttribute('aria-label', 'Notificações');
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text
   * @returns {string}
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Recovery strategies for common errors
   */
  const recoveryStrategies = {
    NetworkError: function() {
      displayError(
        'Erro de Conexão',
        'Verifique sua conexão com a internet e tente novamente.'
      );
    },
    
    GeolocationError: function(error) {
      let message = 'Não foi possível obter sua localização.';
      
      if (error.code === 1) {
        message = 'Permissão de localização negada. Por favor, habilite nas configurações do navegador.';
      } else if (error.code === 2) {
        message = 'Posição indisponível. Verifique se o GPS está ativado.';
      } else if (error.code === 3) {
        message = 'Tempo esgotado ao obter localização. Tente novamente.';
      }
      
      displayError('Erro de Geolocalização', message);
    },
    
    APIError: function(response) {
      const message = response.status === 429 
        ? 'Muitas requisições. Aguarde alguns segundos e tente novamente.'
        : 'Erro ao comunicar com o servidor. Tente novamente mais tarde.';
      
      displayError('Erro de API', message);
    }
  };

  // Export recovery utilities
  window.ErrorRecovery = {
    displayError: displayError,
    strategies: recoveryStrategies
  };

  console.log('Error Recovery system initialized');
})();
