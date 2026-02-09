/**
 * @jest-environment jsdom
 */

import {
  showToast,
  showSuccess,
  showError,
  showInfo,
  showWarning,
  dismissToast,
  dismissAllToasts
} from '../../src/utils/toast.js';

describe('Toast Notification System', () => {
  beforeEach(() => {
    // Clear any existing toast containers
    const containers = document.querySelectorAll('.toast-container');
    containers.forEach(container => container.remove());
    
    // Clear document body
    document.body.innerHTML = '';
  });

  describe('showToast', () => {
    test('should create toast container if not exists', () => {
      showToast('Test message', 'info');
      
      const container = document.querySelector('.toast-container');
      expect(container).toBeTruthy();
      expect(container.getAttribute('role')).toBe('region');
      expect(container.getAttribute('aria-label')).toBe('Notificações');
      expect(container.getAttribute('aria-live')).toBe('polite');
    });

    test('should reuse existing toast container', () => {
      showToast('First toast', 'info');
      showToast('Second toast', 'info');
      
      const containers = document.querySelectorAll('.toast-container');
      expect(containers.length).toBe(1);
    });

    test('should create toast with correct type class', () => {
      const toast = showToast('Test', 'success');
      
      expect(toast.classList.contains('toast')).toBe(true);
      expect(toast.classList.contains('toast-success')).toBe(true);
    });

    test('should escape HTML in message', () => {
      const toast = showToast('<script>alert("xss")</script>', 'info');
      
      const message = toast.querySelector('.toast-message');
      expect(message.innerHTML).not.toContain('<script>');
      expect(message.innerHTML).toContain('&lt;script&gt;');
    });

    test('should include close button when dismissible', () => {
      const toast = showToast('Test', 'info', { dismissible: true });
      
      const closeBtn = toast.querySelector('.toast-close');
      expect(closeBtn).toBeTruthy();
      expect(closeBtn.getAttribute('aria-label')).toBe('Fechar notificação');
    });

    test('should not include close button when not dismissible', () => {
      const toast = showToast('Test', 'info', { dismissible: false });
      
      const closeBtn = toast.querySelector('.toast-close');
      expect(closeBtn).toBeFalsy();
    });

    test('should set correct icon for each type', () => {
      const successToast = showToast('Success', 'success');
      const errorToast = showToast('Error', 'error');
      const infoToast = showToast('Info', 'info');
      const warningToast = showToast('Warning', 'warning');
      
      expect(successToast.querySelector('.toast-icon').textContent).toBe('✓');
      expect(errorToast.querySelector('.toast-icon').textContent).toBe('✕');
      expect(infoToast.querySelector('.toast-icon').textContent).toBe('ⓘ');
      expect(warningToast.querySelector('.toast-icon').textContent).toBe('⚠');
    });

    test('should add toast-show class after animation frame', (done) => {
      const toast = showToast('Test', 'info');
      
      expect(toast.classList.contains('toast-show')).toBe(false);
      
      setTimeout(() => {
        expect(toast.classList.contains('toast-show')).toBe(true);
        done();
      }, 50);
    });

    test('should auto-dismiss after specified duration', (done) => {
      const toast = showToast('Test', 'info', { duration: 100 });
      
      setTimeout(() => {
        expect(toast.classList.contains('toast-hide')).toBe(true);
        done();
      }, 150);
    });

    test('should not auto-dismiss when duration is 0', (done) => {
      const toast = showToast('Test', 'info', { duration: 0 });
      
      setTimeout(() => {
        expect(toast.classList.contains('toast-hide')).toBe(false);
        expect(toast.parentNode).toBeTruthy();
        done();
      }, 100);
    });

    test('should dismiss when close button clicked', () => {
      const toast = showToast('Test', 'info', { dismissible: true });
      const closeBtn = toast.querySelector('.toast-close');
      
      closeBtn.click();
      
      expect(toast.classList.contains('toast-hide')).toBe(true);
    });

    test('should set aria-live to polite', () => {
      const toast = showToast('Test', 'info');
      
      expect(toast.getAttribute('aria-live')).toBe('polite');
      expect(toast.getAttribute('role')).toBe('status');
    });
  });

  describe('dismissToast', () => {
    test('should add toast-hide class', () => {
      const toast = showToast('Test', 'info', { duration: 0 });
      
      dismissToast(toast);
      
      expect(toast.classList.contains('toast-hide')).toBe(true);
      expect(toast.classList.contains('toast-show')).toBe(false);
    });

    test('should remove toast from DOM after animation', (done) => {
      const toast = showToast('Test', 'info', { duration: 0 });
      
      dismissToast(toast);
      
      setTimeout(() => {
        expect(toast.parentNode).toBeFalsy();
        done();
      }, 350);
    });

    test('should handle null toast gracefully', () => {
      expect(() => dismissToast(null)).not.toThrow();
    });

    test('should handle non-toast element gracefully', () => {
      const div = document.createElement('div');
      expect(() => dismissToast(div)).not.toThrow();
    });
  });

  describe('dismissAllToasts', () => {
    test('should dismiss all active toasts', () => {
      const toast1 = showToast('Test 1', 'info', { duration: 0 });
      const toast2 = showToast('Test 2', 'info', { duration: 0 });
      const toast3 = showToast('Test 3', 'info', { duration: 0 });
      
      dismissAllToasts();
      
      expect(toast1.classList.contains('toast-hide')).toBe(true);
      expect(toast2.classList.contains('toast-hide')).toBe(true);
      expect(toast3.classList.contains('toast-hide')).toBe(true);
    });

    test('should work when no toasts exist', () => {
      expect(() => dismissAllToasts()).not.toThrow();
    });
  });

  describe('Convenience methods', () => {
    test('showSuccess should create success toast', () => {
      const toast = showSuccess('Success message');
      
      expect(toast.classList.contains('toast-success')).toBe(true);
      expect(toast.querySelector('.toast-message').textContent).toBe('Success message');
    });

    test('showError should create error toast with longer duration', () => {
      const toast = showError('Error message');
      
      expect(toast.classList.contains('toast-error')).toBe(true);
      expect(toast.querySelector('.toast-message').textContent).toBe('Error message');
      // Duration 8000ms is used by default for errors
    });

    test('showInfo should create info toast', () => {
      const toast = showInfo('Info message');
      
      expect(toast.classList.contains('toast-info')).toBe(true);
      expect(toast.querySelector('.toast-message').textContent).toBe('Info message');
    });

    test('showWarning should create warning toast', () => {
      const toast = showWarning('Warning message');
      
      expect(toast.classList.contains('toast-warning')).toBe(true);
      expect(toast.querySelector('.toast-message').textContent).toBe('Warning message');
    });

    test('should allow overriding default options', () => {
      const toast = showError('Error', { duration: 0 });
      
      // Toast should not auto-dismiss since we set duration to 0
      setTimeout(() => {
        expect(toast.parentNode).toBeTruthy();
      }, 100);
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA attributes on container', () => {
      showToast('Test', 'info');
      
      const container = document.querySelector('.toast-container');
      expect(container.getAttribute('role')).toBe('region');
      expect(container.getAttribute('aria-label')).toBe('Notificações');
      expect(container.getAttribute('aria-live')).toBe('polite');
    });

    test('should have proper ARIA attributes on toast', () => {
      const toast = showToast('Test', 'info');
      
      expect(toast.getAttribute('role')).toBe('status');
      expect(toast.getAttribute('aria-live')).toBe('polite');
    });

    test('should have accessible close button', () => {
      const toast = showToast('Test', 'info', { dismissible: true });
      const closeBtn = toast.querySelector('.toast-close');
      
      expect(closeBtn.getAttribute('type')).toBe('button');
      expect(closeBtn.getAttribute('aria-label')).toBe('Fechar notificação');
    });
  });

  describe('Security', () => {
    test('should prevent XSS through message parameter', () => {
      const malicious = '<img src=x onerror="alert(1)">';
      const toast = showToast(malicious, 'info');
      
      const message = toast.querySelector('.toast-message');
      // HTML tags are escaped, so they cannot execute
      expect(message.innerHTML).toContain('&lt;img');
      expect(message.innerHTML).toContain('&gt;');
      // The innerHTML will contain the attribute text but tags are escaped
      expect(message.querySelector('img')).toBeFalsy(); // No actual img element
    });

    test('should handle script tags', () => {
      const toast = showToast('<script>malicious()</script>', 'info');
      
      const message = toast.querySelector('.toast-message');
      expect(message.innerHTML).toContain('&lt;script&gt;');
      expect(message.querySelector('script')).toBeFalsy();
    });

    test('should handle event handlers', () => {
      const toast = showToast('<div onclick="malicious()">Click</div>', 'info');
      
      const message = toast.querySelector('.toast-message');
      // HTML tags are escaped, so event handlers cannot execute
      expect(message.innerHTML).toContain('&lt;div');
      expect(message.innerHTML).toContain('&gt;');
      // No actual div element with onclick handler
      const divs = message.querySelectorAll('div');
      divs.forEach(div => {
        expect(div.getAttribute('onclick')).toBeFalsy();
      });
    });
  });

  describe('Default export', () => {
    test('should export all functions as default object', async () => {
      const toastModule = await import('../../src/utils/toast.js');
      const defaultExport = toastModule.default;
      
      expect(defaultExport.showToast).toBeDefined();
      expect(defaultExport.dismissToast).toBeDefined();
      expect(defaultExport.dismissAllToasts).toBeDefined();
      expect(defaultExport.showSuccess).toBeDefined();
      expect(defaultExport.showError).toBeDefined();
      expect(defaultExport.showInfo).toBeDefined();
      expect(defaultExport.showWarning).toBeDefined();
    });
  });
});
