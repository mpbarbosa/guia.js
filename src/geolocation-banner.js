/**
 * Geolocation Permission Banner
 * Handles geolocation permission requests with user-friendly UI
 */

import { log, warn, error } from './utils/logger.js';

(function() {
  'use strict';

  let permissionStatus = 'prompt'; // 'prompt', 'granted', 'denied'
  
  // Track active timeouts for cleanup
  const activeTimeouts = new Set();

  /**
   * Initialize geolocation banner
   */
  function init() {
    checkGeolocationPermission().then(status => {
      permissionStatus = status;
      
      if (status === 'prompt') {
        showBanner();
      } else if (status === 'denied') {
        showPermissionDeniedMessage();
      }
    });
  }

  /**
   * Check current geolocation permission status
   * @returns {Promise<string>}
   */
  async function checkGeolocationPermission() {
    if (!navigator.permissions) {
      return 'prompt';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state; // 'granted', 'denied', or 'prompt'
    } catch (err) {
      warn('Could not query geolocation permission:', err);
      return 'prompt';
    }
  }

  /**
   * Show permission request banner
   */
  function showBanner() {
    const banner = document.createElement('div');
    banner.className = 'geolocation-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'geo-banner-title');
    banner.setAttribute('aria-describedby', 'geo-banner-message');
    
    banner.innerHTML = `
      <div class="geolocation-banner-content">
        <h3 id="geo-banner-title" class="geolocation-banner-title">
          📍 Permitir Acesso à Localização
        </h3>
        <p id="geo-banner-message" class="geolocation-banner-message">
          Este aplicativo precisa acessar sua localização para fornecer informações sobre lugares próximos.
        </p>
      </div>
      <div class="geolocation-banner-actions">
        <button class="btn-primary" onclick="window.GeolocationBanner.requestPermission()">
          Permitir
        </button>
        <button class="btn-secondary" onclick="window.GeolocationBanner.dismiss()">
          Agora Não
        </button>
      </div>
    `;
    
    document.body.appendChild(banner);
  }

  /**
   * Request geolocation permission
   */
  function requestPermission() {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada neste navegador.');
      dismissBanner();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function success(position) {
        log('Geolocation permission granted:', position);
        permissionStatus = 'granted';
        dismissBanner();
        showSuccessToast();
        
        // Dispatch event for app to handle
        window.dispatchEvent(new CustomEvent('geolocation-granted', {
          detail: { position }
        }));
      },
      function onError(err) {
        error('Geolocation permission denied:', err);
        permissionStatus = 'denied';
        dismissBanner();
        showPermissionDeniedMessage();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  /**
   * Dismiss the banner
   */
  function dismissBanner() {
    const banner = document.querySelector('.geolocation-banner');
    if (banner) {
      banner.classList.add('hidden');
      const timeout = setTimeout(() => {
        banner.remove();
        activeTimeouts.delete(timeout);
      }, 300);
      activeTimeouts.add(timeout);
    }
  }

  /**
   * Show success toast
   */
  function showSuccessToast() {
    if (window.ErrorRecovery && window.ErrorRecovery.displayError) {
      // Reuse toast system if available
      const container = document.querySelector('.toast-container') || createToastContainer();
      
      const toast = document.createElement('div');
      toast.className = 'toast success';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.innerHTML = `
        <span aria-hidden="true">✅</span>
        <span>Localização ativada com sucesso!</span>
      `;
      
      container.appendChild(toast);
      
      const timeout1 = setTimeout(() => {
        toast.classList.add('toast-exit');
        const timeout2 = setTimeout(() => {
          toast.remove();
          activeTimeouts.delete(timeout2);
        }, 300);
        activeTimeouts.add(timeout2);
        activeTimeouts.delete(timeout1);
      }, 3000);
      activeTimeouts.add(timeout1);
    }
  }

  /**
   * Show permission denied message
   */
  function showPermissionDeniedMessage() {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'geolocation-status denied';
    statusDiv.setAttribute('role', 'status');
    statusDiv.innerHTML = `
      <span class="geolocation-status-icon" aria-hidden="true">⚠️</span>
      <span>Localização desativada. Habilite nas configurações do navegador.</span>
    `;
    
    const mainContent = document.getElementById('app-content');
    if (mainContent) {
      mainContent.insertBefore(statusDiv, mainContent.firstChild);
    }
  }

  /**
   * Create toast container if it doesn't exist
   */
  function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Notificações');
    document.body.appendChild(container);
    return container;
  }

  /**
   * Get current permission status
   * @returns {string}
   */
  function getStatus() {
    return permissionStatus;
  }

  // Export public API
  window.GeolocationBanner = {
    init: init,
    requestPermission: requestPermission,
    dismiss: dismissBanner,
    getStatus: getStatus,
    
    /**
     * Cleanup function for timer leaks prevention.
     * Clears all pending timeouts (banner/toast animations).
     * Useful in test environments.
     * 
     * @since 0.8.7-alpha
     */
    destroy: function() {
      activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
      activeTimeouts.clear();
      
      // Remove banner if exists
      const banner = document.querySelector('.geolocation-banner');
      if (banner) {
        banner.remove();
      }
      
      // Remove status messages
      const status = document.querySelector('.geolocation-status');
      if (status) {
        status.remove();
      }
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  log('Geolocation Banner initialized');
})();
