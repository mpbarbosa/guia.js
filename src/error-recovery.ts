/**
 * Error Recovery and Global Error Handler
 * Provides centralized error handling and recovery mechanisms
 */

interface ErrorHistoryEntry {
  type: string;
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: string;
}

const activeTimeouts: Set<ReturnType<typeof setTimeout>> = new Set();
const errorHistory: ErrorHistoryEntry[] = [];
const MAX_ERROR_HISTORY = 20;

function log(...args: unknown[]): void {
  console.log('[ErrorRecovery]', ...args);
}

function logError(...args: unknown[]): void {
  console.error('[ErrorRecovery]', ...args);
}

window.addEventListener('error', (event: ErrorEvent) => {
  logError('Global error caught:', event.error);

  const errorInfo: ErrorHistoryEntry = {
    type: 'Error',
    message: (event.error as Error)?.message || event.message || 'Unknown error',
    stack: (event.error as Error)?.stack || 'No stack trace available',
    filename: event.filename || 'Unknown file',
    lineno: event.lineno || 0,
    colno: event.colno || 0,
    timestamp: new Date().toISOString(),
  };

  displayError('Ocorreu um erro inesperado', errorInfo.message, errorInfo);
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  logError('Unhandled promise rejection:', event.reason);

  const reason = event.reason as { message?: string; stack?: string } | undefined;
  const errorInfo: ErrorHistoryEntry = {
    type: 'Promise Rejection',
    message: reason?.message || String(event.reason) || 'Promise rejected',
    stack: reason?.stack || 'No stack trace available',
    timestamp: new Date().toISOString(),
  };

  displayError('Erro na operação assíncrona', errorInfo.message, errorInfo);
  event.preventDefault();
});

function addToErrorHistory(errorInfo: ErrorHistoryEntry): void {
  errorHistory.unshift(errorInfo);
  if (errorHistory.length > MAX_ERROR_HISTORY) errorHistory.pop();
  updateFabBadge();
}

function displayError(title: string, message: string, errorInfo?: ErrorHistoryEntry): void {
  if (errorInfo) {
    addToErrorHistory({ ...errorInfo, type: title, message });
    updateErrorPanel();
  }

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

  const detailsBtn = toast.querySelector('.toast-details-btn');
  if (detailsBtn && errorInfo) {
    detailsBtn.addEventListener('click', () => showErrorPanel());
  }

  const t1 = setTimeout(() => {
    toast.classList.add('toast-exit');
    const t2 = setTimeout(() => {
      toast.remove();
      activeTimeouts.delete(t2);
    }, 300);
    activeTimeouts.add(t2);
    activeTimeouts.delete(t1);
  }, 5000);
  activeTimeouts.add(t1);
}

function getOrCreateToastContainer(): HTMLElement {
  let container = document.querySelector('.toast-container') as HTMLElement | null;
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

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showErrorPanel(): void {
  let panel = document.getElementById('error-panel');
  if (!panel) panel = createErrorPanel();
  panel.classList.add('error-panel-visible');
  updateErrorPanel();
}

function hideErrorPanel(): void {
  document.getElementById('error-panel')?.classList.remove('error-panel-visible');
}

function toggleErrorPanel(): void {
  const panel = document.getElementById('error-panel');
  if (panel?.classList.contains('error-panel-visible')) {
    hideErrorPanel();
  } else {
    showErrorPanel();
  }
}

function createErrorPanel(): HTMLElement {
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

  panel.querySelector('.error-panel-close')?.addEventListener('click', hideErrorPanel);
  panel.querySelector('.error-panel-clear')?.addEventListener('click', () => {
    errorHistory.length = 0;
    updateErrorPanel();
  });

  return panel;
}

function createFloatingButton(): HTMLElement {
  const button = document.createElement('button');
  button.id = 'error-fab';
  button.className = 'error-fab';
  button.setAttribute('aria-label', 'Abrir painel de erros');
  button.setAttribute('title', 'Ver erros');
  button.innerHTML = '🐛';

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

function updateFabBadge(): void {
  const badge = document.getElementById('error-fab-badge');
  if (!badge) return;
  const count = errorHistory.length;
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function updateErrorPanel(): void {
  const content = document.getElementById('error-panel-content');
  if (!content) return;

  if (errorHistory.length === 0) {
    content.innerHTML = '<p class="error-panel-empty">Nenhum erro registrado.</p>';
    updateFabBadge();
    return;
  }

  const html = errorHistory.map((entry) => `
    <div class="error-item">
      <div class="error-item-header">
        <span class="error-item-type">${escapeHtml(entry.type)}</span>
        <span class="error-item-time">${formatTime(entry.timestamp)}</span>
      </div>
      <div class="error-item-message">${escapeHtml(entry.message)}</div>
      ${entry.filename ? `<div class="error-item-location">${escapeHtml(entry.filename)}:${entry.lineno}:${entry.colno}</div>` : ''}
      <details class="error-item-stack">
        <summary>Stack Trace</summary>
        <pre>${escapeHtml(entry.stack ?? '')}</pre>
      </details>
    </div>
  `).join('');

  content.innerHTML = html;
  updateFabBadge();
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('pt-BR');
}

interface GeolocationErrorLike {
  code: number;
  message?: string;
}

interface ApiResponse {
  status: number;
}

const recoveryStrategies = {
  NetworkError(): void {
    displayError('Erro de Conexão', 'Verifique sua conexão com a internet e tente novamente.');
  },

  GeolocationError(geoError: GeolocationErrorLike): void {
    let message = 'Não foi possível obter sua localização.';
    if (geoError.code === 1) {
      message = 'Permissão de localização negada. Por favor, habilite nas configurações do navegador.';
    } else if (geoError.code === 2) {
      message = 'Posição indisponível. Verifique se o GPS está ativado.';
    } else if (geoError.code === 3) {
      message = 'Tempo esgotado ao obter localização. Tente novamente.';
    }
    displayError('Erro de Geolocalização', message);
  },

  APIError(response: ApiResponse): void {
    const message = response.status === 429
      ? 'Muitas requisições. Aguarde alguns segundos e tente novamente.'
      : 'Erro ao comunicar com o servidor. Tente novamente mais tarde.';
    displayError('Erro de API', message);
  },
};

function destroy(): void {
  activeTimeouts.forEach(id => clearTimeout(id));
  activeTimeouts.clear();

  document.querySelector('.toast-container')?.remove();
  document.getElementById('error-panel')?.remove();
  document.getElementById('error-fab')?.remove();
  errorHistory.length = 0;
}

function initializeUI(): void {
  createFloatingButton();

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
      event.preventDefault();
      toggleErrorPanel();
    }
  });
}

export { displayError, showErrorPanel, hideErrorPanel, toggleErrorPanel, destroy, recoveryStrategies };

// Window export for legacy compatibility
window.ErrorRecovery = {
  init: initializeUI,
  displayError,
  strategies: recoveryStrategies as Record<string, (...args: unknown[]) => void>,
  showErrorPanel,
  hideErrorPanel,
  toggleErrorPanel,
  getErrorHistory: () => [...errorHistory],
  clearErrorHistory: () => {
    errorHistory.length = 0;
    updateErrorPanel();
  },
  destroy,
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUI);
} else {
  initializeUI();
}

log('Error Recovery system initialized');
log('Press Ctrl+E (or Cmd+E on Mac) to toggle error panel');
log('Or tap the 🐛 button on mobile devices');
