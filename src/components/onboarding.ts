/**
 * Onboarding Component
 * Manages first-time user experience and location permission flow
 * @since 0.9.0-alpha
 */

import { showError } from '../utils/toast.js';

class OnboardingManager {
  private onboardingCard: HTMLElement | null = null;
  private enableLocationBtn: HTMLElement | null = null;

  init(): void {
    this.onboardingCard = document.getElementById('onboarding-card');
    this.enableLocationBtn = document.getElementById('enable-location-btn');

    if (!this.onboardingCard || !this.enableLocationBtn) {
      console.warn('Onboarding elements not found');
      return;
    }

    this.enableLocationBtn.addEventListener('click', () => this.handleEnableLocation());
    this.checkLocationPermission();
    this.setupGeolocationListeners();
  }

  async checkLocationPermission(): Promise<void> {
    if (!navigator.permissions) {
      this.showOnboarding();
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });

      if (permission.state === 'granted') {
        this.hideOnboarding();
      } else {
        this.showOnboarding();
      }

      permission.addEventListener('change', () => {
        if (permission.state === 'granted') {
          this.hideOnboarding();
        } else {
          this.showOnboarding();
        }
      });
    } catch (err) {
      console.warn('Failed to check location permission:', err);
      this.showOnboarding();
    }
  }

  setupGeolocationListeners(): void {
    document.addEventListener('geolocation:success', () => {
      this.hideOnboarding();
    });

    document.addEventListener('geolocation:error', (event: Event) => {
      const customEvent = event as CustomEvent<{ error?: GeolocationPositionError }>;
      const geoError = customEvent.detail?.error;

      if (geoError && geoError.code === 1) {
        this.showOnboarding();
        this.showErrorRecovery(geoError);
      } else if (geoError) {
        this.showOnboarding();
        this.showErrorRecovery(geoError);
      }
    });

    document.addEventListener('geolocation:permission-denied', () => {
      this.showOnboarding();
      this.showErrorRecovery();
    });
  }

  async handleEnableLocation(): Promise<void> {
    const getLocationBtn = document.getElementById('getLocationBtn');
    if (getLocationBtn) {
      getLocationBtn.click();
    } else {
      this.requestLocation();
    }
  }

  requestLocation(): void {
    if (!navigator.geolocation) {
      showError('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        document.dispatchEvent(new CustomEvent('geolocation:success', { detail: { position } }));
      },
      (err) => {
        document.dispatchEvent(new CustomEvent('geolocation:error', { detail: { error: err } }));
      }
    );
  }

  showOnboarding(): void {
    this.onboardingCard?.classList.remove('hidden');
  }

  hideOnboarding(): void {
    this.onboardingCard?.classList.add('hidden');
  }

  showErrorRecovery(error?: GeolocationPositionError): void {
    if (!this.onboardingCard) return;

    const title = this.onboardingCard.querySelector('.onboarding-title');
    const description = this.onboardingCard.querySelector('.onboarding-description');

    let errorTitle = 'Permissão de Localização Negada';
    let errorDescription = '';

    if (error) {
      switch (error.code) {
        case 1:
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
        case 2:
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
        case 3:
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
      errorDescription = `
        <p><strong>Você negou a permissão para acessar sua localização.</strong></p>
        <p>Para usar o rastreamento automático, permita o acesso nas configurações do navegador.</p>
        <p><strong>Alternativa:</strong> Use o Conversor de Coordenadas para inserir manualmente.</p>
      `;
    }

    if (title) title.textContent = errorTitle;
    if (description) description.innerHTML = errorDescription;

    this._updateErrorButtons();
  }

  private _updateErrorButtons(): void {
    if (!this.enableLocationBtn || !this.onboardingCard) return;

    const buttonText = this.enableLocationBtn.querySelector('.button-text');
    if (buttonText) buttonText.textContent = '🔄 Tentar Novamente';

    const existingLink = this.onboardingCard.querySelector('.converter-fallback-link');
    if (!existingLink) {
      const converterLink = document.createElement('a');
      converterLink.href = '#/converter';
      converterLink.className = 'converter-fallback-link';
      converterLink.innerHTML = '📍 Usar Conversor de Coordenadas';
      converterLink.setAttribute('role', 'button');
      converterLink.setAttribute('aria-label', 'Abrir conversor de coordenadas para entrada manual');

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
        transition: 'all 0.2s ease',
      });

      this.enableLocationBtn.parentNode?.insertBefore(
        converterLink,
        this.enableLocationBtn.nextSibling
      );
    }
  }
}

const onboardingManager = new OnboardingManager();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => onboardingManager.init());
} else {
  onboardingManager.init();
}

export default onboardingManager;
