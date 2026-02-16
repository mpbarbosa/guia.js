/**
 * Onboarding Component
 * Manages first-time user experience and location permission flow
 * @since 0.9.0-alpha
 */

import { showError } from '../utils/toast.js';

/**
 * OnboardingManager - Singleton for managing onboarding state
 */
class OnboardingManager {
  constructor() {
    this.onboardingCard = null;
    this.enableLocationBtn = null;
    this.isLocationGranted = false;
  }

  /**
   * Initialize the onboarding component
   */
  init() {
    this.onboardingCard = document.getElementById('onboarding-card');
    this.enableLocationBtn = document.getElementById('enable-location-btn');
    
    if (!this.onboardingCard || !this.enableLocationBtn) {
      console.warn('Onboarding elements not found');
      return;
    }

    // Bind event listeners
    this.enableLocationBtn.addEventListener('click', () => this.handleEnableLocation());
    
    // Check if location was previously granted
    this.checkLocationPermission();
    
    // Listen for geolocation events
    this.setupGeolocationListeners();
  }

  /**
   * Check current location permission status
   */
  async checkLocationPermission() {
    if (!navigator.permissions) {
      // Permissions API not supported, show onboarding by default
      this.showOnboarding();
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'granted') {
        this.hideOnboarding();
        this.isLocationGranted = true;
      } else {
        this.showOnboarding();
      }

      // Listen for permission changes
      permission.addEventListener('change', () => {
        if (permission.state === 'granted') {
          this.hideOnboarding();
          this.isLocationGranted = true;
        } else {
          this.showOnboarding();
          this.isLocationGranted = false;
        }
      });
    } catch (error) {
      console.warn('Failed to check location permission:', error);
      this.showOnboarding();
    }
  }

  /**
   * Setup listeners for geolocation events
   */
  setupGeolocationListeners() {
    // Listen for successful geolocation
    document.addEventListener('geolocation:success', () => {
      this.hideOnboarding();
      this.isLocationGranted = true;
    });

    // Listen for geolocation errors
    document.addEventListener('geolocation:error', (event) => {
      const { error } = event.detail || {};
      
      if (error && error.code === 1) { // PERMISSION_DENIED
        this.showOnboarding();
        this.isLocationGranted = false;
        
        // Update message to show error recovery with specific error
        this.showErrorRecovery(error);
      } else if (error) {
        // Other errors (POSITION_UNAVAILABLE, TIMEOUT)
        this.showOnboarding();
        this.showErrorRecovery(error);
      }
    });

    // Listen for geolocation permission denied specifically
    document.addEventListener('geolocation:permission-denied', () => {
      this.showOnboarding();
      this.showErrorRecovery();
    });
  }

  /**
   * Handle enable location button click
   */
  async handleEnableLocation() {
    // Trigger the main geolocation button
    const getLocationBtn = document.getElementById('getLocationBtn');
    if (getLocationBtn) {
      getLocationBtn.click();
    } else {
      // Fallback: try to get location directly
      this.requestLocation();
    }
  }

  /**
   * Request location directly
   */
  requestLocation() {
    if (!navigator.geolocation) {
      showError('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        document.dispatchEvent(new CustomEvent('geolocation:success', {
          detail: { position }
        }));
      },
      (error) => {
        document.dispatchEvent(new CustomEvent('geolocation:error', {
          detail: { error }
        }));
      }
    );
  }

  /**
   * Show onboarding card
   */
  showOnboarding() {
    if (this.onboardingCard) {
      this.onboardingCard.classList.remove('hidden');
    }
  }

  /**
   * Hide onboarding card
   */
  hideOnboarding() {
    if (this.onboardingCard) {
      this.onboardingCard.classList.add('hidden');
    }
  }

  /**
   * Show error recovery UI within onboarding with detailed guidance
   * @param {GeolocationPositionError} error - Optional error object for specific messaging
   */
  showErrorRecovery(error) {
    if (!this.onboardingCard) return;

    // Update title and description based on error type
    const title = this.onboardingCard.querySelector('.onboarding-title');
    const description = this.onboardingCard.querySelector('.onboarding-description');
    
    // Determine error type and messaging
    let errorTitle = 'Permissão de Localização Negada';
    let errorDescription = '';
    let showConverterLink = true;
    
    if (error) {
      switch (error.code) {
        case 1: // PERMISSION_DENIED
          errorTitle = 'Permissão de Localização Negada';
          errorDescription = `
            <p><strong>Você negou o acesso à sua localização.</strong></p>
            <p>Para usar o rastreamento automático, você precisa permitir o acesso nas configurações do navegador:</p>
            <ul style="text-align: left; margin: 16px 0; padding-left: 24px;">
              <li><strong>Chrome/Edge:</strong> Clique no ícone 🔒 na barra de endereço → Permissões do site → Localização → Permitir</li>
              <li><strong>Firefox:</strong> Clique no ícone 🔒 → Conexão segura → Mais informações → Permissões → Localização → Permitir</li>
              <li><strong>Safari:</strong> Safari → Configurações → Privacidade → Serviços de Localização → Ativar para este site</li>
            </ul>
            <p><strong>Alternativa:</strong> Use o Conversor de Coordenadas para inserir manualmente sua localização.</p>
          `;
          break;
        case 2: // POSITION_UNAVAILABLE
          errorTitle = 'Localização Indisponível';
          errorDescription = `
            <p><strong>Não foi possível determinar sua localização.</strong></p>
            <p>Possíveis causas:</p>
            <ul style="text-align: left; margin: 16px 0; padding-left: 24px;">
              <li>GPS desativado no dispositivo</li>
              <li>Sinal de GPS fraco (tente em área aberta)</li>
              <li>Serviços de localização do navegador inativos</li>
            </ul>
            <p><strong>Solução:</strong> Use o Conversor de Coordenadas para inserir coordenadas manualmente.</p>
          `;
          break;
        case 3: // TIMEOUT
          errorTitle = 'Tempo Esgotado';
          errorDescription = `
            <p><strong>A busca pela sua localização demorou muito.</strong></p>
            <p>Tente novamente ou use o Conversor de Coordenadas para entrada manual.</p>
          `;
          break;
        default:
          errorDescription = `
            <p><strong>Erro ao acessar sua localização.</strong></p>
            <p>Use o Conversor de Coordenadas como alternativa.</p>
          `;
      }
    } else {
      // Generic permission denied message
      errorDescription = `
        <p><strong>Você negou a permissão para acessar sua localização.</strong></p>
        <p>Para usar o rastreamento automático, permita o acesso nas configurações do navegador.</p>
        <p><strong>Alternativa:</strong> Use o Conversor de Coordenadas para inserir manualmente.</p>
      `;
    }
    
    if (title) {
      title.textContent = errorTitle;
    }
    
    if (description) {
      description.innerHTML = errorDescription;
    }

    // Update button to show "Try Again" + add converter link
    this._updateErrorButtons();
  }

  /**
   * Update buttons for error recovery state
   * @private
   */
  _updateErrorButtons() {
    if (!this.enableLocationBtn) return;

    // Update main button text
    const buttonText = this.enableLocationBtn.querySelector('.button-text');
    if (buttonText) {
      buttonText.textContent = '🔄 Tentar Novamente';
    }

    // Add converter fallback link if not already present
    const existingLink = this.onboardingCard.querySelector('.converter-fallback-link');
    if (!existingLink) {
      const converterLink = document.createElement('a');
      converterLink.href = '#/converter';
      converterLink.className = 'converter-fallback-link';
      converterLink.innerHTML = '📍 Usar Conversor de Coordenadas';
      converterLink.setAttribute('role', 'button');
      converterLink.setAttribute('aria-label', 'Abrir conversor de coordenadas para entrada manual');
      
      // Style inline for immediate visibility
      Object.assign(converterLink.style, {
        display: 'inline-block',
        marginTop: '16px',
        padding: '12px 24px',
        background: '#ffffff',
        color: '#667eea',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        border: '2px solid #667eea',
        transition: 'all 0.2s ease'
      });

      // Insert after the main button
      this.enableLocationBtn.parentNode.insertBefore(
        converterLink,
        this.enableLocationBtn.nextSibling
      );
    }
  }
}

// Export singleton instance
const onboardingManager = new OnboardingManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => onboardingManager.init());
} else {
  onboardingManager.init();
}

export default onboardingManager;
