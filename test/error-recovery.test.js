// __tests__/error-recovery.test.js
import '../src/error-recovery';

const { ErrorRecovery } = window;

describe('ErrorRecovery', () => {
  beforeEach(() => {
    ErrorRecovery.destroy();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    ErrorRecovery.destroy();
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('displayError', () => {
    it('displays error toast with title and message', () => {
      ErrorRecovery.displayError('Test Title', 'Test Message', { stack: 'stack' });
      const toast = document.querySelector('.toast.error');
      expect(toast).toBeTruthy();
      expect(toast.innerHTML).toContain('Test Title');
      expect(toast.innerHTML).toContain('Test Message');
    });

    it('auto-removes toast after timeout', () => {
      jest.useFakeTimers();
      ErrorRecovery.displayError('Timeout Title', 'Timeout Message', {});
      const toast = document.querySelector('.toast.error');
      expect(toast).toBeTruthy();
      jest.advanceTimersByTime(5000);
      expect(toast.classList.contains('toast-exit')).toBe(true);
      jest.advanceTimersByTime(300);
      expect(document.querySelector('.toast.error')).toBeNull();
      jest.useRealTimers();
    });

    it('shows details panel on button click', () => {
      ErrorRecovery.displayError('Title', 'Message', {});
      const detailsBtn = document.querySelector('.toast-details-btn');
      expect(detailsBtn).toBeTruthy();
      detailsBtn.click();
      const panel = document.getElementById('error-panel');
      expect(panel).toBeTruthy();
      expect(panel.classList.contains('error-panel-visible')).toBe(true);
    });
  });

  describe('getOrCreateToastContainer', () => {
    it('creates toast container if not present', () => {
      ErrorRecovery.displayError('Title', 'Message', {});
      const container = document.querySelector('.toast-container');
      expect(container).toBeTruthy();
      expect(container.getAttribute('role')).toBe('region');
    });

    it('reuses existing toast container', () => {
      ErrorRecovery.displayError('Title', 'Message', {});
      const container1 = document.querySelector('.toast-container');
      ErrorRecovery.displayError('Title2', 'Message2', {});
      const container2 = document.querySelector('.toast-container');
      expect(container1).toBe(container2);
    });
  });

  describe('escapeHtml', () => {
    it('escapes HTML tags in message', () => {
      ErrorRecovery.displayError('Title', '<script>alert(1)</script>', {});
      const toast = document.querySelector('.toast.error');
      expect(toast.innerHTML).not.toContain('<script>');
      expect(toast.innerHTML).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    });
  });

  describe('error panel', () => {
    it('creates and shows error panel', () => {
      ErrorRecovery.showErrorPanel();
      const panel = document.getElementById('error-panel');
      expect(panel).toBeTruthy();
      expect(panel.classList.contains('error-panel-visible')).toBe(true);
    });

    it('hides error panel', () => {
      ErrorRecovery.showErrorPanel();
      ErrorRecovery.hideErrorPanel();
      const panel = document.getElementById('error-panel');
      expect(panel.classList.contains('error-panel-visible')).toBe(false);
    });

    it('toggles error panel visibility', () => {
      ErrorRecovery.showErrorPanel();
      ErrorRecovery.toggleErrorPanel();
      const panel = document.getElementById('error-panel');
      expect(panel.classList.contains('error-panel-visible')).toBe(false);
      ErrorRecovery.toggleErrorPanel();
      expect(panel.classList.contains('error-panel-visible')).toBe(true);
    });

    it('clears error history from panel', () => {
      ErrorRecovery.displayError('Title', 'Message', {});
      ErrorRecovery.showErrorPanel();
      const clearBtn = document.querySelector('.error-panel-clear');
      expect(clearBtn).toBeTruthy();
      clearBtn.click();
      expect(ErrorRecovery.getErrorHistory()).toEqual([]);
      const content = document.getElementById('error-panel-content');
      expect(content.innerHTML).toContain('Nenhum erro registrado.');
    });
  });

  describe('floating action button', () => {
    beforeEach(() => {
      ErrorRecovery.init();
    });

    it('creates FAB and badge', () => {
      ErrorRecovery.destroy();
      ErrorRecovery.init();
      const fab = document.getElementById('error-fab');
      const badge = document.getElementById('error-fab-badge');
      expect(fab).toBeTruthy();
      expect(badge).toBeTruthy();
    });

    it('updates badge count on error', () => {
      ErrorRecovery.displayError('Title', 'Message', {});
      const badge = document.getElementById('error-fab-badge');
      expect(badge.style.display).toBe('flex');
      expect(parseInt(badge.textContent)).toBeGreaterThan(0);
    });

    it('hides badge when no errors', () => {
      ErrorRecovery.clearErrorHistory();
      const badge = document.getElementById('error-fab-badge');
      expect(badge.style.display).toBe('none');
    });
  });

  describe('updateErrorPanel', () => {
    it('shows error history in panel', () => {
      ErrorRecovery.displayError('Title', 'Message', { stack: 'stack', filename: 'file.js', lineno: 1, colno: 2, type: 'Error', timestamp: new Date().toISOString() });
      ErrorRecovery.showErrorPanel();
      const content = document.getElementById('error-panel-content');
      expect(content.innerHTML).toContain('Title');
      expect(content.innerHTML).toContain('Message');
      expect(content.innerHTML).toContain('file.js');
      expect(content.innerHTML).toContain('Stack Trace');
    });

    it('shows empty message when no errors', () => {
      ErrorRecovery.clearErrorHistory();
      ErrorRecovery.showErrorPanel();
      const content = document.getElementById('error-panel-content');
      expect(content.innerHTML).toContain('Nenhum erro registrado.');
    });
  });

  describe('formatTime', () => {
    it('formats timestamp to pt-BR time', () => {
      ErrorRecovery.displayError('Title', 'Message', { timestamp: '2022-01-01T12:34:56.789Z' });
      ErrorRecovery.showErrorPanel();
      const content = document.getElementById('error-panel-content');
      expect(content.innerHTML).toMatch(/\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('recoveryStrategies', () => {
    it('NetworkError displays connection error', () => {
      ErrorRecovery.strategies.NetworkError();
      const toast = document.querySelector('.toast.error');
      expect(toast.innerHTML).toContain('Erro de Conexão');
    });

    it('GeolocationError displays permission denied', () => {
      ErrorRecovery.strategies.GeolocationError({ code: 1 });
      const toast = document.querySelector('.toast.error');
      expect(toast.innerHTML).toContain('Permissão de localização negada');
    });

    it('GeolocationError displays position unavailable', () => {
      ErrorRecovery.strategies.GeolocationError({ code: 2 });
      const toast = document.querySelector('.toast.error');
      expect(toast.innerHTML).toContain('Posição indisponível');
    });

    it('GeolocationError displays timeout', () => {
      ErrorRecovery.strategies.GeolocationError({ code: 3 });
      const toast = document.querySelector('.toast.error');
      expect(toast.innerHTML).toContain('Tempo esgotado');
    });

    it('APIError displays rate limit message', () => {
      ErrorRecovery.strategies.APIError({ status: 429 });
      const toast = document.querySelector('.toast.error');
      expect(toast.innerHTML).toContain('Muitas requisições');
    });

    it('APIError displays generic server error', () => {
      ErrorRecovery.strategies.APIError({ status: 500 });
      const toast = document.querySelector('.toast.error');
      expect(toast.innerHTML).toContain('Erro ao comunicar com o servidor');
    });
  });

  describe('destroy', () => {
    it('removes all UI elements and clears error history', () => {
      ErrorRecovery.displayError('Title', 'Message', {});
      ErrorRecovery.showErrorPanel();
      ErrorRecovery.destroy();
      expect(document.querySelector('.toast-container')).toBeNull();
      expect(document.getElementById('error-panel')).toBeNull();
      expect(document.getElementById('error-fab')).toBeNull();
      expect(ErrorRecovery.getErrorHistory()).toEqual([]);
    });
  });

  describe('global error handlers', () => {
    it('handles window error event', () => {
      const event = new window.Event('error');
      event.error = new Error('Global error');
      event.message = 'Global error message';
      event.filename = 'file.js';
      event.lineno = 10;
      event.colno = 20;
      window.dispatchEvent(event);
      expect(ErrorRecovery.getErrorHistory()[0].message).toBe('Global error');
    });

    it('handles unhandledrejection event', () => {
      const event = new window.Event('unhandledrejection');
      event.reason = new Error('Promise rejection');
      window.dispatchEvent(event);
      expect(ErrorRecovery.getErrorHistory()[0].message).toBe('Promise rejection');
    });
  });
});
