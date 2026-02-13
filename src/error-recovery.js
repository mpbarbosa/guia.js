/**
 * Error Recovery and Global Error Handler
 * Provides centralized error handling and recovery mechanisms
 */

(function() {
  'use strict';

  // Logging utilities (inline implementation)
  function log(...args) {
    console.log('[ErrorRecovery]', ...args);
  }
  
  function warn(...args) {
    console.warn('[ErrorRecovery]', ...args);
  }
  
  function error(...args) {
    console.error('[ErrorRecovery]', ...args);
  }

  // Track active timeouts for cleanup
  const activeTimeouts = new Set();
  
  // Track error history
  const errorHistory = [];
  const MAX_ERROR_HISTORY = 20;

  // Global error handler
  window.addEventListener('error', function(event) {
    error('Global error caught:', event.error);
    
    const errorInfo = {
      type: 'Error',
      message: event.error?.message || event.message || 'Unknown error',
      stack: event.error?.stack || 'No stack trace available',
      filename: event.filename || 'Unknown file',
      lineno: event.lineno || 0,
      colno: event.colno || 0,
      timestamp: new Date().toISOString()
    };
    
    addToErrorHistory(errorInfo);
    displayError('Ocorreu um erro inesperado', errorInfo.message, errorInfo);
    updateErrorPanel();
    
    // Prevent default browser error handling
    event.preventDefault();
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', function(event) {
    error('Unhandled promise rejection:', event.reason);
    
    const errorInfo = {
      type: 'Promise Rejection',
      message: event.reason?.message || String(event.reason) || 'Promise rejected',
      stack: event.reason?.stack || 'No stack trace available',
      timestamp: new Date().toISOString()
    };
    
    addToErrorHistory(errorInfo);
    displayError('Erro na operação assíncrona', errorInfo.message, errorInfo);
    updateErrorPanel();
    
    // Prevent default browser error handling
    event.preventDefault();
  });

  /**
   * Add error to history
   * @param {Object} errorInfo - Error information object
   */
  function addToErrorHistory(errorInfo) {
    errorHistory.unshift(errorInfo);
    if (errorHistory.length > MAX_ERROR_HISTORY) {
      errorHistory.pop();
    }
    updateFabBadge();
  }

  /**
   * Display error message to user
   * @param {string} title - Error title
   * @param {string} message - Error message
   * @param {Object} errorInfo - Full error information
   */
  function displayError(title, message, errorInfo) {
    const container = getOrCreateToastContainer();
    
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    
    const safeMessage = escapeHtml(String(message).substring(0, 200));
    
    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">❌</span>
      <div class="toast-content">
        <strong>${escapeHtml(title)}</strong>
        <p style="margin: 4px 0 0 0; font-size: 13px;">${safeMessage}</p>
        <button class="toast-details-btn" aria-label="Ver detalhes do erro">Ver detalhes</button>
      </div>
    `;
    
    container.appendChild(toast);
    
    // Add click handler for details button
    const detailsBtn = toast.querySelector('.toast-details-btn');
    if (detailsBtn && errorInfo) {
      detailsBtn.addEventListener('click', () => {
        showErrorPanel();
      });
    }
    
    // Auto-remove after 5 seconds (track timeout for cleanup)
    const timeout1 = setTimeout(() => {
      toast.classList.add('toast-exit');
      const timeout2 = setTimeout(() => {
        toast.remove();
        activeTimeouts.delete(timeout2);
      }, 300);
      activeTimeouts.add(timeout2);
      activeTimeouts.delete(timeout1);
    }, 5000);
    activeTimeouts.add(timeout1);
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
   * Show error panel with full error history
   */
  function showErrorPanel() {
    let panel = document.getElementById('error-panel');
    if (!panel) {
      panel = createErrorPanel();
    }
    panel.classList.add('error-panel-visible');
    updateErrorPanel();
  }

  /**
   * Hide error panel
   */
  function hideErrorPanel() {
    const panel = document.getElementById('error-panel');
    if (panel) {
      panel.classList.remove('error-panel-visible');
    }
  }
  
  /**
   * Toggle error panel visibility
   */
  function toggleErrorPanel() {
    const panel = document.getElementById('error-panel');
    if (panel && panel.classList.contains('error-panel-visible')) {
      hideErrorPanel();
    } else {
      showErrorPanel();
    }
  }

  /**
   * Create error panel DOM element
   * @returns {HTMLElement}
   */
  function createErrorPanel() {
    const panel = document.createElement('div');
    panel.id = 'error-panel';
    panel.className = 'error-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'error-panel-title');
    
    panel.innerHTML = `
      <div class="error-panel-header">
        <h2 id="error-panel-title">🐛 Erros Capturados</h2>
        <div class="error-panel-actions">
          <button class="error-panel-clear" aria-label="Limpar erros">Limpar</button>
          <button class="error-panel-close" aria-label="Fechar painel">✕</button>
        </div>
      </div>
      <div class="error-panel-content" id="error-panel-content">
        <p class="error-panel-empty">Nenhum erro registrado.</p>
      </div>
      <div class="error-panel-footer">
        <small>Pressione <kbd>Ctrl+E</kbd> ou <kbd>Cmd+E</kbd> para alternar</small>
      </div>
    `;
    
    document.body.appendChild(panel);
    
    // Event listeners
    panel.querySelector('.error-panel-close').addEventListener('click', hideErrorPanel);
    panel.querySelector('.error-panel-clear').addEventListener('click', () => {
      errorHistory.length = 0;
      updateErrorPanel();
    });
    
    return panel;
  }

  /**
   * Create floating action button for mobile access
   * @returns {HTMLElement}
   */
  function createFloatingButton() {
    const button = document.createElement('button');
    button.id = 'error-fab';
    button.className = 'error-fab';
    button.setAttribute('aria-label', 'Abrir painel de erros');
    button.setAttribute('title', 'Ver erros');
    button.innerHTML = '🐛';
    
    // Badge for error count
    const badge = document.createElement('span');
    badge.id = 'error-fab-badge';
    badge.className = 'error-fab-badge';
    badge.style.display = 'none';
    badge.textContent = '0';
    button.appendChild(badge);
    
    document.body.appendChild(button);
    
    button.addEventListener('click', toggleErrorPanel);
    
    return button;
  }

  /**
   * Update FAB badge with error count
   */
  function updateFabBadge() {
    const badge = document.getElementById('error-fab-badge');
    if (badge) {
      const count = errorHistory.length;
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count.toString();
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  /**
   * Update error panel content
   */
  function updateErrorPanel() {
    const content = document.getElementById('error-panel-content');
    if (!content) return;
    
    if (errorHistory.length === 0) {
      content.innerHTML = '<p class="error-panel-empty">Nenhum erro registrado.</p>';
      updateFabBadge();
      return;
    }
    
    const html = errorHistory.map((error, index) => `
      <div class="error-item">
        <div class="error-item-header">
          <span class="error-item-type">${escapeHtml(error.type)}</span>
          <span class="error-item-time">${formatTime(error.timestamp)}</span>
        </div>
        <div class="error-item-message">${escapeHtml(error.message)}</div>
        ${error.filename ? `<div class="error-item-location">${escapeHtml(error.filename)}:${error.lineno}:${error.colno}</div>` : ''}
        <details class="error-item-stack">
          <summary>Stack Trace</summary>
          <pre>${escapeHtml(error.stack)}</pre>
        </details>
      </div>
    `).join('');
    
    content.innerHTML = html;
    updateFabBadge();
  }

  /**
   * Format timestamp for display
   * @param {string} timestamp
   * @returns {string}
   */
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR');
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
    strategies: recoveryStrategies,
    showErrorPanel: showErrorPanel,
    hideErrorPanel: hideErrorPanel,
    toggleErrorPanel: toggleErrorPanel,
    getErrorHistory: () => [...errorHistory],
    clearErrorHistory: () => {
      errorHistory.length = 0;
      updateErrorPanel();
    },
    
    /**
     * Cleanup function for timer leaks prevention.
     * Clears all pending toast timeouts.
     * Useful in test environments.
     * 
     * @since 0.9.0-alpha
     */
    destroy: function() {
      activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
      activeTimeouts.clear();
      
      // Remove toast container if exists
      const container = document.querySelector('.toast-container');
      if (container) {
        container.remove();
      }
      
      // Remove error panel if exists
      const panel = document.getElementById('error-panel');
      if (panel) {
        panel.remove();
      }
      
      // Remove FAB if exists
      const fab = document.getElementById('error-fab');
      if (fab) {
        fab.remove();
      }
      
      // Clear error history
      errorHistory.length = 0;
    }
  };
  
  // Initialize UI components when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI);
  } else {
    initializeUI();
  }
  
  function initializeUI() {
    // Create floating action button for mobile access
    createFloatingButton();
    
    // Keyboard shortcut: Ctrl+E or Cmd+E to toggle error panel
    document.addEventListener('keydown', function(event) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        toggleErrorPanel();
      }
    });
  }

  log('Error Recovery system initialized');
  log('Press Ctrl+E (or Cmd+E on Mac) to toggle error panel');
  log('Or tap the 🐛 button on mobile devices');
})();
