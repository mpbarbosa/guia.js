/**
 * Error boundary for view components.
 * 
 * Provides React-style error boundary functionality for vanilla JavaScript views,
 * catching and handling errors during view initialization and lifecycle.
 * 
 * @module utils/ErrorBoundary
 * @since 0.11.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import { error as logError, warn } from './logger.js';
import { reportError } from './error-tracking.js';

/**
 * Error boundary that wraps view components to catch and handle errors gracefully.
 */
class ErrorBoundary {
  fallbackUI: (error: Error, componentName?: string) => string;
  onError: ((error: Error, componentName: string) => void | Promise<void>) | undefined;
  componentName: string;
  trackErrors: boolean;
  hasError: boolean;
  lastError: Error | null;

  /**
   * Create a new error boundary.
   * 
   * @param {Object} options - Configuration options
   * @param {Function} options.fallbackUI - Function that returns fallback HTML string
   * @param {Function} [options.onError] - Custom error handler function
   * @param {string} [options.componentName] - Name of wrapped component for logging
   * @param {boolean} [options.trackErrors] - Send errors to tracking service (default: true)
   */
  constructor({ fallbackUI, onError, componentName = 'Component', trackErrors = true }: { fallbackUI: (error: Error, componentName?: string) => string; onError?: (error: Error, componentName: string) => void | Promise<void>; componentName?: string; trackErrors?: boolean }) {
    this.fallbackUI = fallbackUI;
    this.onError = onError;
    this.componentName = componentName;
    this.trackErrors = trackErrors;
    this.hasError = false;
    this.lastError = null;
  }

  /**
   * Wrap an async function with error boundary protection.
   * 
   * @param {Function} fn - Async function to wrap
   * @param {HTMLElement} [container] - Container element for fallback UI
   * @returns {Function} Wrapped function with error handling
   * 
   * @example
   * const boundary = new ErrorBoundary({
   *   fallbackUI: (error) => `<div>Error: ${error.message}</div>`,
   *   componentName: 'HomeView'
   * });
   * 
   * const safeInit = boundary.wrap(async () => {
   *   await initializeHomeView();
   * }, document.getElementById('app-content'));
   * 
   * await safeInit();
   */
  wrap(fn: (...args: unknown[]) => Promise<unknown>, container: HTMLElement | null = null): (...args: unknown[]) => Promise<unknown> {
    return async (...args) => {
      try {
        // Reset error state on each call
        this.hasError = false;
        this.lastError = null;
        
        // Execute wrapped function
        return await fn(...args);
        
      } catch (error) {
        this.hasError = true;
        this.lastError = error;
        
        // Always display in browser console regardless of log level or container
        console.error(`[ErrorBoundary] Error in ${this.componentName}:`, error);
        logError(`Error in ${this.componentName}:`, error);
        
        // Track error in monitoring service
        if (this.trackErrors) {
          reportError(error, {
            component: this.componentName,
            context: 'ErrorBoundary'
          });
        }
        
        // Call custom error handler if provided
        if (this.onError) {
          try {
            await this.onError(error, this.componentName);
          } catch (handlerError) {
            console.error('[ErrorBoundary] Error in custom error handler:', handlerError);
            logError('Error in custom error handler:', handlerError);
          }
        }
        
        // Render fallback UI if container provided
        if (container) {
          this.renderFallback(container, error);
        }
        
        // Always re-throw so the exception is never silently swallowed
        throw error;
      }
    };
  }

  /**
   * Render fallback UI in container.
   * 
   * @private
   * @param {HTMLElement} container - Container element
   * @param {Error} error - Error that occurred
   */
  renderFallback(container: HTMLElement, error: Error): void {
    if (!container) {
      warn('No container provided for fallback UI');
      return;
    }
    
    try {
      const fallbackHTML = this.fallbackUI(error, this.componentName);
      container.innerHTML = fallbackHTML;
      
      // Announce error to screen readers
      const errorMessage = container.querySelector('[role="alert"]');
      if (errorMessage) {
        errorMessage.setAttribute('aria-live', 'assertive');
      }
      
    } catch (renderError) {
      logError('Error rendering fallback UI:', renderError);
      
      // Last resort: simple error message
      container.innerHTML = `
        <div role="alert" class="error-boundary-fallback">
          <h2>Erro na Aplicação</h2>
          <p>Ocorreu um erro inesperado. Por favor, recarregue a página.</p>
          <button onclick="location.reload()" class="md3-button-filled">
            Recarregar Página
          </button>
        </div>
      `;
    }
  }

  /**
   * Reset error state.
   * Call this to clear error and allow retrying the operation.
   */
  reset(): void {
    this.hasError = false;
    this.lastError = null;
  }

  /**
   * Check if error boundary has caught an error.
   * 
   * @returns {boolean} True if error was caught
   */
  getHasError(): boolean {
    return this.hasError;
  }

  /**
   * Get the last caught error.
   * 
   * @returns {Error|null} Last error or null
   */
  getLastError(): Error | null {
    return this.lastError;
  }
}

/**
 * Create error boundary with default fallback UI.
 * 
 * @param {string} componentName - Name of component being wrapped
 * @param {Object} [options] - Additional options
 * @returns {ErrorBoundary} Configured error boundary
 */
export function createDefaultErrorBoundary(componentName: string, options: Record<string, unknown> = {}): ErrorBoundary {
  return new ErrorBoundary({
    componentName,
    fallbackUI: (error) => `
      <div role="alert" class="error-boundary-fallback">
        <div class="error-icon" aria-hidden="true">⚠️</div>
        <h2>Erro ao Carregar ${componentName}</h2>
        <p>Ocorreu um erro ao inicializar este componente.</p>
        <details>
          <summary>Detalhes Técnicos</summary>
          <pre>${error.message}\n${error.stack || ''}</pre>
        </details>
        <div class="error-actions">
          <button onclick="location.reload()" class="md3-button-filled">
            Recarregar Página
          </button>
          <button onclick="history.back()" class="md3-button-outlined">
            Voltar
          </button>
        </div>
      </div>
    `,
    ...options
  });
}

/**
 * Global error handler for uncaught errors.
 * 
 * @param {Function} errorHandler - Custom error handler
 */
export function setupGlobalErrorHandler(errorHandler: (error: Error) => void): void {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('error', (event) => {
    logError('Uncaught error:', event.error);
    
    reportError(event.error, {
      context: 'Global',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
    
    if (errorHandler) {
      errorHandler(event.error);
    }
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    logError('Unhandled promise rejection:', event.reason);
    
    reportError(event.reason, {
      context: 'UnhandledPromise'
    });
    
    if (errorHandler) {
      errorHandler(event.reason);
    }
  });
}

export default ErrorBoundary;
