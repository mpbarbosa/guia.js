import {
  displayError,
  showErrorPanel,
  hideErrorPanel,
  toggleErrorPanel,
  destroy,
  recoveryStrategies,
} from '../src/error-recovery';
import * as errorRecoveryModule from '../src/error-recovery';

describe('error-recovery', () => {
  let originalConsoleLog: typeof console.log;
  let originalConsoleError: typeof console.error;
  let originalBodyInnerHTML: string;

  beforeAll(() => {
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
  });

  beforeEach(() => {
    // Clean up DOM and mocks before each test
    document.body.innerHTML = '';
    jest.useFakeTimers();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    originalBodyInnerHTML = document.body.innerHTML;
    destroy();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    (console.log as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
    destroy();
    document.body.innerHTML = originalBodyInnerHTML;
  });

  describe('displayError', () => {
    it('should display a toast with correct title and message', () => {
      displayError('Test Title', 'Test message');
      const toast = document.querySelector('.toast.error') as HTMLElement;
      expect(toast).toBeTruthy();
      expect(toast.innerHTML).toContain('Test Title');
      expect(toast.innerHTML).toContain('Test message');
    });

    it('should escape HTML in title and message', () => {
      displayError('<b>Title</b>', '<script>alert(1)</script>');
      const toast = document.querySelector('.toast.error') as HTMLElement;
      expect(toast.innerHTML).toContain('&lt;b&gt;Title&lt;/b&gt;');
      expect(toast.innerHTML).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('should add error to errorHistory and update error panel', () => {
      // Spy on updateErrorPanel
      const spy = jest.spyOn(
        // @ts-ignore: access private
        errorRecoveryModule,
        'updateErrorPanel'
      );
      displayError('ErrorTitle', 'ErrorMsg', {
        type: 'Error',
        message: 'ErrorMsg',
        timestamp: new Date().toISOString(),
      });
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should add and remove toast after timeout', () => {
      displayError('TimeoutTest', 'Toast should disappear');
      const toast = document.querySelector('.toast.error') as HTMLElement;
      expect(toast).toBeTruthy();
      jest.advanceTimersByTime(5000);
      expect(toast.classList.contains('toast-exit')).toBe(true);
      jest.advanceTimersByTime(300);
      expect(document.querySelector('.toast.error')).toBeNull();
    });

    it('should attach click handler to details button if errorInfo is provided', () => {
      displayError('WithDetails', 'msg', {
        type: 'Error',
        message: 'msg',
        timestamp: new Date().toISOString(),
      });
      const btn = document.querySelector('.toast-details-btn') as HTMLElement;
      expect(btn).toBeTruthy();
      const spy = jest.spyOn(
        // @ts-ignore: access private
        errorRecoveryModule,
        'showErrorPanel'
      );
      btn.click();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should not fail if details button is missing', () => {
      // Remove .toast-details-btn after creation
      displayError('NoDetails', 'msg');
      const btn = document.querySelector('.toast-details-btn');
      if (btn) btn.remove();
      expect(() => {
        jest.advanceTimersByTime(5000);
      }).not.toThrow();
    });

    it('should truncate long messages to 200 chars', () => {
      const longMsg = 'a'.repeat(300);
      displayError('LongMsg', longMsg);
      const toast = document.querySelector('.toast.error') as HTMLElement;
      expect(toast.innerHTML).toContain('a'.repeat(200));
      expect(toast.innerHTML).not.toContain('a'.repeat(201));
    });
  });

  describe('getOrCreateToastContainer', () => {
    it('should create toast container if not present', () => {
      expect(document.querySelector('.toast-container')).toBeNull();
      displayError('Test', 'msg');
      expect(document.querySelector('.toast-container')).toBeTruthy();
    });

    it('should reuse existing toast container', () => {
      displayError('First', 'msg');
      const container = document.querySelector('.toast-container');
      displayError('Second', 'msg');
      expect(document.querySelectorAll('.toast-container').length).toBe(1);
      expect(document.querySelector('.toast-container')).toBe(container);
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      // @ts-ignore: access private
      const { escapeHtml } = errorRecoveryModule;
      expect(escapeHtml('<div>"&</div>')).toBe('&lt;div&gt;&quot;&amp;&lt;/div&gt;');
    });
  });

  describe('showErrorPanel/hideErrorPanel/toggleErrorPanel', () => {
    it('should create and show error panel', () => {
      showErrorPanel();
      const panel = document.getElementById('error-panel');
      expect(panel).toBeTruthy();
      expect(panel?.classList.contains('error-panel-visible')).toBe(true);
    });

    it('should hide error panel', () => {
      showErrorPanel();
      hideErrorPanel();
      const panel = document.getElementById('error-panel');
      expect(panel?.classList.contains('error-panel-visible')).toBe(false);
    });

    it('should toggle error panel visibility', () => {
      showErrorPanel();
      toggleErrorPanel();
      let panel = document.getElementById('error-panel');
      expect(panel?.classList.contains('error-panel-visible')).toBe(false);
      toggleErrorPanel();
      panel = document.getElementById('error-panel');
      expect(panel?.classList.contains('error-panel-visible')).toBe(true);
    });

    it('should not fail if error panel does not exist', () => {
      expect(() => hideErrorPanel()).not.toThrow();
      expect(() => toggleErrorPanel()).not.toThrow();
    });
  });

  describe('createErrorPanel', () => {
    it('should create error panel with correct structure', () => {
      // @ts-ignore: access private
      const { createErrorPanel } = errorRecoveryModule;
      const panel = createErrorPanel();
      expect(panel.id).toBe('error-panel');
      expect(panel.querySelector('.error-panel-header')).toBeTruthy();
      expect(panel.querySelector('.error-panel-close')).toBeTruthy();
      expect(panel.querySelector('.error-panel-clear')).toBeTruthy();
      expect(document.getElementById('error-panel')).toBe(panel);
    });

    it('should clear error history when clear button is clicked', () => {
      // Add an error
      displayError('ToClear', 'msg', {
        type: 'Error',
        message: 'msg',
        timestamp: new Date().toISOString(),
      });
      showErrorPanel();
      const clearBtn = document.querySelector('.error-panel-clear') as HTMLElement;
      expect(clearBtn).toBeTruthy();
      clearBtn.click();
      // @ts-ignore: access private
      const { getErrorHistory } = window.ErrorRecovery;
      expect(getErrorHistory().length).toBe(0);
    });

    it('should close panel when close button is clicked', () => {
      showErrorPanel();
      const closeBtn = document.querySelector('.error-panel-close') as HTMLElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      const panel = document.getElementById('error-panel');
      expect(panel?.classList.contains('error-panel-visible')).toBe(false);
    });
  });

  describe('createFloatingButton', () => {
    it('should create floating button with badge', () => {
      // @ts-ignore: access private
      const { createFloatingButton } = errorRecoveryModule;
      const btn = createFloatingButton();
      expect(btn.id).toBe('error-fab');
      expect(btn.querySelector('#error-fab-badge')).toBeTruthy();
      expect(document.getElementById('error-fab')).toBe(btn);
    });

    it('should toggle error panel on click', () => {
      // @ts-ignore: access private
      const { createFloatingButton } = errorRecoveryModule;
      createFloatingButton();
      const btn = document.getElementById('error-fab') as HTMLElement;
      expect(btn).toBeTruthy();
      showErrorPanel();
      btn.click();
      const panel = document.getElementById('error-panel');
      expect(panel?.classList.contains('error-panel-visible')).toBe(false);
    });
  });

  describe('updateFabBadge', () => {
    it('should show badge with correct count', () => {
      // @ts-ignore: access private
      const { updateFabBadge } = errorRecoveryModule;
      // Add badge to DOM
      displayError('BadgeTest', 'msg', {
        type: 'Error',
        message: 'msg',
        timestamp: new Date().toISOString(),
      });
      const badge = document.getElementById('error-fab-badge') as HTMLElement;
      expect(badge.style.display).toBe('flex');
      expect(['1', '99+']).toContain(badge.textContent);
    });

    it('should hide badge when no errors', () => {
      // @ts-ignore: access private
      const { updateFabBadge } = errorRecoveryModule;
      displayError('BadgeTest', 'msg', {
        type: 'Error',
        message: 'msg',
        timestamp: new Date().toISOString(),
      });
      // Clear error history
      window.ErrorRecovery.clearErrorHistory();
      const badge = document.getElementById('error-fab-badge') as HTMLElement;
      expect(badge.style.display).toBe('none');
    });
  });

  describe('updateErrorPanel', () => {
    it('should show empty message when no errors', () => {
      showErrorPanel();
      // @ts-ignore: access private
      const { updateErrorPanel } = errorRecoveryModule;
      window.ErrorRecovery.clearErrorHistory();
      updateErrorPanel();
      const content = document.getElementById('error-panel-content') as HTMLElement;
      expect(content.innerHTML).toContain('Nenhum erro registrado');
    });

    it('should render error items when errors exist', () => {
      displayError('PanelTest', 'msg', {
        type: 'Error',
        message: 'msg',
        filename: 'file.js',
        lineno: 10,
        colno: 2,
        stack: 'stacktrace',
        timestamp: new Date().toISOString(),
      });
      showErrorPanel();
      const content = document.getElementById('error-panel-content') as HTMLElement;
      expect(content.innerHTML).toContain('PanelTest');
      expect(content.innerHTML).toContain('file.js:10:2');
      expect(content.innerHTML).toContain('stacktrace');
    });
  });

  describe('formatTime', () => {
    it('should format ISO timestamp to pt-BR time', () => {
      // @ts-ignore: access private
      const { formatTime } = errorRecoveryModule;
      const date = new Date('2023-01-01T12:34:56.000Z');
      const formatted = formatTime(date.toISOString());
      expect(typeof formatted).toBe('string');
    });
  });

  describe('recoveryStrategies', () => {
    it('should display network error', () => {
      recoveryStrategies.NetworkError();
      const toast = document.querySelector('.toast.error') as HTMLElement;
      expect(toast.innerHTML).toContain('Erro de Conexão');
    });

    it('should display geolocation error for code 1', () => {
      recoveryStrategies.GeolocationError({ code: 1 });
      const toast = document.querySelector('.toast.error') as HTMLElement;
      expect(toast.innerHTML).toContain('Permissão de localização negada');
    });

    it('should display geolocation error for code 2', () => {
      recoveryStrategies.GeolocationError({ code: 2 });
      const toast = document.querySelector('.toast.error') as HTMLElement;
      expect(toast.innerHTML).toContain('Posição indisponível');
    });

    it('should display geolocation error for code 3', () => {
      recoveryStrategies.GeolocationError({ code: 3 });
      const toast = document.querySelector('.toast.error') as HTMLElement;
      expect(toast.innerHTML).toContain('Tempo esgotado');
    });

    it('should display geolocation error for unknown code', () => {
      recoveryStrategies.GeolocationError({ code: 99 });
      const toast = document.querySelector('.toast.error') as HTMLElement;
      expect(toast.innerHTML).toContain('Não foi possível obter sua localização');
    });

    it('should display API error for status 429', () => {
      recoveryStrategies.APIError({ status: 429 });
      const toast = document.querySelector('.toast.error') as HTMLElement;
      expect(toast.innerHTML).toContain('Muitas requisições');
    });

    it('should display API error for other status', () => {
      recoveryStrategies.APIError({ status: 500 });
      const toast = document.querySelector('.toast.error') as HTMLElement;
      expect(toast.innerHTML).toContain('Erro ao comunicar com o servidor');
    });
  });

  describe('destroy', () => {
    it('should remove all UI elements and clear error history', () => {
      displayError('DestroyTest', 'msg');
      showErrorPanel();
      // Add floating button
      // @ts-ignore: access private
      const { createFloatingButton } = errorRecoveryModule;
      createFloatingButton();
      destroy();
      expect(document.querySelector('.toast-container')).toBeNull();
      expect(document.getElementById('error-panel')).toBeNull();
      expect(document.getElementById('error-fab')).toBeNull();
      // @ts-ignore: access private
      const { getErrorHistory } = window.ErrorRecovery;
      expect(getErrorHistory().length).toBe(0);
    });
  });

  describe('window.ErrorRecovery', () => {
    it('should expose expected API on window', () => {
      expect(window.ErrorRecovery).toBeDefined();
      expect(typeof window.ErrorRecovery.init).toBe('function');
      expect(typeof window.ErrorRecovery.displayError).toBe('function');
      expect(typeof window.ErrorRecovery.strategies).toBe('object');
      expect(typeof window.ErrorRecovery.showErrorPanel).toBe('function');
      expect(typeof window.ErrorRecovery.hideErrorPanel).toBe('function');
      expect(typeof window.ErrorRecovery.toggleErrorPanel).toBe('function');
      expect(typeof window.ErrorRecovery.getErrorHistory).toBe('function');
      expect(typeof window.ErrorRecovery.clearErrorHistory).toBe('function');
      expect(typeof window.ErrorRecovery.destroy).toBe('function');
    });

    it('should clear error history via window API', () => {
      displayError('WinAPI', 'msg', {
        type: 'Error',
        message: 'msg',
        timestamp: new Date().toISOString(),
      });
      expect(window.ErrorRecovery.getErrorHistory().length).toBeGreaterThan(0);
      window.ErrorRecovery.clearErrorHistory();
      expect(window.ErrorRecovery.getErrorHistory().length).toBe(0);
    });
  });

  describe('global error handlers', () => {
    it('should handle window error event', () => {
      const error = new Error('Global error');
      const event = new window.ErrorEvent('error', {
        error,
        message: error.message,
        filename: 'file.js',
        lineno: 1,
        colno: 2,
      });
      const preventDefault = jest.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);
      expect(document.querySelector('.toast.error')).toBeTruthy();
      expect(preventDefault).toHaveBeenCalled();
    });

    it('should handle unhandledrejection event', () => {
      const reason = { message: 'Promise failed', stack: 'stack' };
      const event = new window.PromiseRejectionEvent('unhandledrejection', {
        reason,
      });
      const preventDefault = jest.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);
      expect(document.querySelector('.toast.error')).toBeTruthy();
      expect(preventDefault).toHaveBeenCalled();
    });

    it('should handle unhandledrejection with string reason', () => {
      const event = new window.PromiseRejectionEvent('unhandledrejection', {
        reason: 'string reason',
      });
      window.dispatchEvent(event);
      expect(document.querySelector('.toast.error')).toBeTruthy();
    });
  });

  describe('errorHistory max length', () => {
    it('should keep only the last 20 errors', () => {
      for (let i = 0; i < 25; i++) {
        displayError('Err' + i, 'msg' + i, {
          type: 'Error',
          message: 'msg' + i,
          timestamp: new Date().toISOString(),
        });
      }
      // @ts-ignore: access private
      const { getErrorHistory } = window.ErrorRecovery;
      expect(getErrorHistory().length).toBe(20);
      expect(getErrorHistory()[0].message).toBe('msg24');
      expect(getErrorHistory()[19].message).toBe('msg5');
    });
  });

  describe('initializeUI', () => {
    it('should create floating button and add keydown listener', () => {
      // @ts-ignore: access private
      const { initializeUI } = errorRecoveryModule;
      initializeUI();
      expect(document.getElementById('error-fab')).toBeTruthy();
      // Simulate Ctrl+E
      showErrorPanel();
      const event = new window.KeyboardEvent('keydown', {
        key: 'e',
        ctrlKey: true,
      });
      document.dispatchEvent(event);
      const panel = document.getElementById('error-panel');
      expect(panel?.classList.contains('error-panel-visible')).toBe(false);
    });

    it('should toggle panel with Cmd+E (metaKey)', () => {
      // @ts-ignore: access private
      const { initializeUI } = errorRecoveryModule;
      initializeUI();
      showErrorPanel();
      const event = new window.KeyboardEvent('keydown', {
        key: 'e',
        metaKey: true,
      });
      document.dispatchEvent(event);
      const panel = document.getElementById('error-panel');
      expect(panel?.classList.contains('error-panel-visible')).toBe(false);
    });
  });
});
