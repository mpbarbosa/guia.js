/**
 * Toast Component
 * 
 * Provides lightweight notification toasts for user feedback.
 * Part of UX Quick Win #4 - improves user feedback and confirmation.
 * 
 * @module components/Toast
 */

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastConfig {
  icon: string;
  className: string;
}

interface ToastShowOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  id?: string;
}

interface ToastConvenienceOptions {
  duration?: number;
  id?: string;
}

const TOAST_TYPES: Record<ToastType, ToastConfig> = {
  success: { icon: '✓', className: 'toast-success' },
  error: { icon: '✕', className: 'toast-error' },
  info: { icon: 'ℹ', className: 'toast-info' },
  warning: { icon: '⚠', className: 'toast-warning' },
};

/**
 * Toast manager singleton.
 */
class ToastManager {
  private container: HTMLElement | null = null;
  private toasts: Map<string, HTMLElement> = new Map();
  private defaultDuration: number = 4000;

  private _ensureContainer(): void {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.setAttribute('role', 'region');
      this.container.setAttribute('aria-label', 'Notificações');
      this.container.setAttribute('aria-live', 'polite');
      document.body.appendChild(this.container);
    }
  }

  /**
   * Show a toast notification.
   *
   * @param options - Toast options
   * @returns Toast ID
   */
  show({ message, type = 'info', duration = this.defaultDuration, id }: ToastShowOptions): string {
    this._ensureContainer();

    const toastId = id || `toast-${Date.now()}-${Math.random()}`;

    if (id && this.toasts.has(id)) {
      return id;
    }

    const config = TOAST_TYPES[type] || TOAST_TYPES.info;
    const toast = this._createToast(message, config, toastId);

    this.toasts.set(toastId, toast);
    this.container!.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    if (duration > 0) {
      setTimeout(() => this.dismiss(toastId), duration);
    }

    return toastId;
  }

  private _createToast(message: string, config: ToastConfig, toastId: string): HTMLElement {
    const toast = document.createElement('div');
    toast.className = `toast ${config.className}`;
    
    const toastRole = config.className === 'toast-error' ? 'alert' : 'status';
    const ariaLive = config.className === 'toast-error' ? 'assertive' : 'polite';
    
    toast.setAttribute('role', toastRole);
    toast.setAttribute('aria-live', ariaLive);
    toast.setAttribute('aria-atomic', 'true');
    toast.setAttribute('data-toast-id', toastId);

    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = config.icon;

    const text = document.createElement('span');
    text.className = 'toast-message';
    text.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Fechar notificação');
    closeBtn.setAttribute('type', 'button');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this.dismiss(toastId));

    toast.appendChild(icon);
    toast.appendChild(text);
    toast.appendChild(closeBtn);

    return toast;
  }

  /**
   * Dismiss a toast by ID.
   *
   * @param toastId - Toast ID to dismiss
   */
  dismiss(toastId: string): void {
    const toast = this.toasts.get(toastId);
    if (!toast) return;

    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts.delete(toastId);
    }, 300);
  }

  /** Dismiss all toasts. */
  dismissAll(): void {
    Array.from(this.toasts.keys()).forEach(id => this.dismiss(id));
  }

  success(message: string, options: ToastConvenienceOptions = {}): string {
    return this.show({ ...options, message, type: 'success' });
  }

  error(message: string, options: ToastConvenienceOptions = {}): string {
    return this.show({ ...options, message, type: 'error', duration: 0 });
  }

  info(message: string, options: ToastConvenienceOptions = {}): string {
    return this.show({ ...options, message, type: 'info' });
  }

  warning(message: string, options: ToastConvenienceOptions = {}): string {
    return this.show({ ...options, message, type: 'warning' });
  }
}

const toastManager = new ToastManager();

export default toastManager;
