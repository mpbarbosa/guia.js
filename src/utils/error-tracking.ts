import { error as logError, log } from './logger.js';
import { env } from '../config/environment.js';

/**
 * Error tracking service configuration.
 */
let errorTrackingConfig = {
  enabled: false,
  service: null, // 'sentry', 'rollbar', etc.
  dsn: null,
  environment: env.isProduction() ? 'production' : 'development',
  release: null,
  sampleRate: 1.0,
  beforeSend: null
};

/**
 * Initialize error tracking service.
 * 
 * @param {Object} config - Configuration options
 * @param {string} config.service - Service name ('sentry', 'rollbar', etc.)
 * @param {string} config.dsn - Data Source Name (API endpoint)
 * @param {string} [config.environment] - Environment name
 * @param {string} [config.release] - Release version
 * @param {number} [config.sampleRate] - Error sampling rate (0.0-1.0)
 * @param {Function} [config.beforeSend] - Filter/modify errors before sending
 * 
 * @example
 * // Initialize Sentry
 * initErrorTracking({
 *   service: 'sentry',
 *   dsn: 'https://your-sentry-dsn@sentry.io/project-id',
 *   environment: 'production',
 *   release: '0.11.0-alpha',
 *   sampleRate: 0.5 // Sample 50% of errors
 * });
 */
export function initErrorTracking(config: Record<string, unknown>): void {
  errorTrackingConfig = {
    ...errorTrackingConfig,
    ...config,
    enabled: true
  };
  
  log('Error tracking initialized:', config.service);
  
  // Initialize Sentry if available
  if (config.service === 'sentry' && typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      release: config.release,
      sampleRate: config.sampleRate,
      beforeSend: config.beforeSend,
      integrations: [
        new window.Sentry.BrowserTracing({
          tracingOrigins: ['localhost', /^\//]
        })
      ],
      tracesSampleRate: 0.1
    });
    
    log('Sentry initialized successfully');
  }
}

/**
 * Report error to tracking service.
 * 
 * @param {Error|string} error - Error object or message
 * @param {Object} [context] - Additional context information
 * @param {string} [context.component] - Component name where error occurred
 * @param {string} [context.action] - Action being performed
 * @param {Object} [context.extra] - Additional metadata
 * 
 * @example
 * try {
 *   await fetchData();
 * } catch (error) {
 *   reportError(error, {
 *     component: 'DataFetcher',
 *     action: 'fetchUserData',
 *     extra: { userId: 123 }
 *   });
 * }
 */
export function reportError(error: Error | string, context: Record<string, unknown> = {}): void {
  // Always log to console
  logError('Error reported:', error, context);
  
  // Don't send to tracking service if disabled
  if (!errorTrackingConfig.enabled) {
    return;
  }
  
  // Apply sampling rate
  if (Math.random() > errorTrackingConfig.sampleRate) {
    return;
  }
  
  // Call beforeSend filter if provided
  if (errorTrackingConfig.beforeSend) {
    const filteredError = errorTrackingConfig.beforeSend(error, context);
    if (filteredError === null) {
      return; // Error filtered out
    }
  }
  
  // Send to appropriate service
  switch (errorTrackingConfig.service) {
    case 'sentry':
      reportToSentry(error, context);
      break;
    case 'rollbar':
      reportToRollbar(error, context);
      break;
    default:
      // Fallback: just log to console
      logError('Error tracking service not configured:', error);
  }
}

/**
 * Report error to Sentry.
 * @private
 */
function reportToSentry(error, context) {
  if (typeof window === 'undefined' || !window.Sentry) {
    return;
  }
  
  window.Sentry.withScope((scope) => {
    // Add context
    if (context.component) {
      scope.setTag('component', context.component);
    }
    if (context.action) {
      scope.setTag('action', context.action);
    }
    if (context.extra) {
      scope.setContext('extra', context.extra);
    }
    
    // Capture exception
    if (error instanceof Error) {
      window.Sentry.captureException(error);
    } else {
      window.Sentry.captureMessage(String(error));
    }
  });
}

/**
 * Report error to Rollbar.
 * @private
 */
function reportToRollbar(error, context) {
  if (typeof window === 'undefined' || !window.Rollbar) {
    return;
  }
  
  window.Rollbar.error(error, context);
}

/**
 * Set user context for error tracking.
 * 
 * @param {Object} user - User information
 * @param {string} [user.id] - User ID
 * @param {string} [user.email] - User email
 * @param {string} [user.username] - Username
 * 
 * @example
 * setUserContext({
 *   id: '12345',
 *   email: 'user@example.com',
 *   username: 'jdoe'
 * });
 */
export function setUserContext(user: Record<string, string>): void {
  if (!errorTrackingConfig.enabled) return;
  
  if (errorTrackingConfig.service === 'sentry' && typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.setUser(user);
  }
  
  if (errorTrackingConfig.service === 'rollbar' && typeof window !== 'undefined' && window.Rollbar) {
    window.Rollbar.configure({ payload: { person: user } });
  }
}

/**
 * Add breadcrumb for error context.
 * 
 * @param {string} message - Breadcrumb message
 * @param {string} [category] - Breadcrumb category
 * @param {Object} [data] - Additional data
 * 
 * @example
 * addBreadcrumb('User clicked button', 'ui', { buttonId: 'submit' });
 */
export function addBreadcrumb(message: string, category: string = 'default', data: Record<string, unknown> = {}): void {
  if (!errorTrackingConfig.enabled) return;
  
  if (errorTrackingConfig.service === 'sentry' && typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info'
    });
  }
}

/**
 * Check if error tracking is enabled.
 * 
 * @returns {boolean} True if enabled
 */
export function isErrorTrackingEnabled(): boolean {
  return errorTrackingConfig.enabled;
}

/**
 * Get current error tracking configuration.
 * 
 * @returns {Object} Current configuration
 */
export function getErrorTrackingConfig(): Record<string, unknown> {
  return { ...errorTrackingConfig };
}
