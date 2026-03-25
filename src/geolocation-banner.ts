/**
 * Geolocation Permission Banner
 * Handles geolocation permission requests with user-friendly UI
 */

type PermissionState = 'prompt' | 'granted' | 'denied';

let permissionStatus: PermissionState = 'prompt';
const activeTimeouts: Set<ReturnType<typeof setTimeout>> = new Set();

function log(...args: unknown[]): void {
  console.log('[GeolocationBanner]', ...args);
}

function warn(...args: unknown[]): void {
  console.warn('[GeolocationBanner]', ...args);
}

function logError(...args: unknown[]): void {
  console.error('[GeolocationBanner]', ...args);
}

function showLocalError(message: string): void {
  if (window.ErrorRecovery?.displayError) {
    window.ErrorRecovery.displayError('Erro', message);
  } else {
    alert(message);
  }
}

async function checkGeolocationPermission(): Promise<PermissionState> {
  if (!navigator.permissions) return 'prompt';

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state as PermissionState;
  } catch (err) {
    warn('Could not query geolocation permission:', err);
    return 'prompt';
  }
}

function showBanner(): void {
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
      <button class="btn-primary">Permitir</button>
      <button class="btn-secondary">Agora Não</button>
    </div>
  `;

  document.body.appendChild(banner);

  const allowBtn = banner.querySelector('.btn-primary');
  const dismissBtn = banner.querySelector('.btn-secondary');

  allowBtn?.addEventListener('click', requestPermission);
  dismissBtn?.addEventListener('click', dismissBanner);
}

function requestPermission(): void {
  if (!navigator.geolocation) {
    showLocalError('Geolocalização não é suportada neste navegador.');
    dismissBanner();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      log('Geolocation permission granted:', position);
      permissionStatus = 'granted';
      dismissBanner();
      showSuccessToast();
      window.dispatchEvent(new CustomEvent('geolocation-granted', { detail: { position } }));
    },
    (err) => {
      logError('Geolocation permission denied:', err);
      permissionStatus = 'denied';
      dismissBanner();
      showPermissionDeniedMessage();
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function dismissBanner(): void {
  const banner = document.querySelector('.geolocation-banner');
  if (banner) {
    banner.classList.add('hidden');
    const t = setTimeout(() => {
      banner.remove();
      activeTimeouts.delete(t);
    }, 300);
    activeTimeouts.add(t);
  }
}

function createToastContainer(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'toast-container';
  container.setAttribute('role', 'region');
  container.setAttribute('aria-label', 'Notificações');
  document.body.appendChild(container);
  return container;
}

function showSuccessToast(): void {
  const container = (document.querySelector('.toast-container') as HTMLElement | null) || createToastContainer();

  const toast = document.createElement('div');
  toast.className = 'toast success';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `<span aria-hidden="true">✅</span><span>Localização ativada com sucesso!</span>`;

  container.appendChild(toast);

  const t1 = setTimeout(() => {
    toast.classList.add('toast-exit');
    const t2 = setTimeout(() => {
      toast.remove();
      activeTimeouts.delete(t2);
    }, 300);
    activeTimeouts.add(t2);
    activeTimeouts.delete(t1);
  }, 3000);
  activeTimeouts.add(t1);
}

function showPermissionDeniedMessage(): void {
  const statusDiv = document.createElement('div');
  statusDiv.className = 'geolocation-status denied';
  statusDiv.setAttribute('role', 'status');
  statusDiv.innerHTML = `
    <span class="geolocation-status-icon" aria-hidden="true">⚠️</span>
    <span>Localização desativada. Habilite nas configurações do navegador.</span>
  `;

  const mainContent = document.getElementById('app-content');
  if (mainContent) mainContent.insertBefore(statusDiv, mainContent.firstChild);
}

async function init(): Promise<void> {
  const status = await checkGeolocationPermission();
  permissionStatus = status;

  if (status === 'prompt') {
    showBanner();
  } else if (status === 'denied') {
    showPermissionDeniedMessage();
  }
}

function destroy(): void {
  activeTimeouts.forEach(id => clearTimeout(id));
  activeTimeouts.clear();

  document.querySelector('.geolocation-banner')?.remove();
  document.querySelector('.geolocation-status')?.remove();
}

function getStatus(): PermissionState {
  return permissionStatus;
}

export { init, requestPermission, dismissBanner as dismiss, getStatus, destroy };
// Internal exports for testing (not part of the public API)
export { checkGeolocationPermission, showBanner, showSuccessToast, createToastContainer, showPermissionDeniedMessage };

// Window export for legacy compatibility
if (typeof window !== 'undefined') {
  (window as Window & { GeolocationBanner?: unknown }).GeolocationBanner = {
    init, requestPermission, dismiss: dismissBanner, getStatus, destroy,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  log('Geolocation Banner initialized');
}
