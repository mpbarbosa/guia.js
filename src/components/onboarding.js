/**
 * Onboarding Component
 * Manages first-time user experience and location permission flow
 * @since 0.8.7-alpha
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
        
        // Update message to show error recovery
        this.showErrorRecovery();
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
   * Show error recovery UI within onboarding
   */
  showErrorRecovery() {
    if (!this.onboardingCard) return;

    // Update title and description
    const title = this.onboardingCard.querySelector('.onboarding-title');
    const description = this.onboardingCard.querySelector('.onboarding-description');
    
    if (title) {
      title.textContent = 'Permissão de Localização Negada';
    }
    
    if (description) {
      description.innerHTML = `
        Você negou a permissão para acessar sua localização. 
        Para usar o Guia Turístico, você precisa permitir o acesso.
      `;
    }

    // Update button text
    if (this.enableLocationBtn) {
      const buttonText = this.enableLocationBtn.querySelector('.button-text');
      if (buttonText) {
        buttonText.textContent = 'Tentar Novamente';
      }
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
