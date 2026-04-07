/**
 * Button Utilities
 * Standardized button state management and loading patterns
 * @since 0.9.0-alpha
 */

/**
 * Wrap an async function with loading state management
 * 
 * @param {HTMLButtonElement} button - Button element
 * @param {Function} asyncFn - Async function to execute
 * @param {Object} options - Configuration options
 * @param {string} options.loadingText - Text to show while loading
 * @param {boolean} options.disableOnLoad - Whether to disable button during execution
 * @returns {Promise<any>} Result of asyncFn
 * 
 * @example
 * await withLoading(button, async () => {
 *   return await fetchData();
 * });
 */
export async function withLoading(button, asyncFn, options = {}) {
  const {
    loadingText = null,
    disableOnLoad = true
  } = options;

  if (!button) {
    console.warn('withLoading: No button provided');
    return asyncFn();
  }

  // Store original state
  const originalText = button.textContent;
  const wasDisabled = button.disabled || button.getAttribute('aria-disabled') === 'true';

  try {
    // Apply loading state
    button.classList.add('loading');
    
    if (disableOnLoad) {
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
    }

    if (loadingText) {
      const textSpan = button.querySelector('.button-text');
      if (textSpan) {
        textSpan.textContent = loadingText;
      } else {
        button.textContent = loadingText;
      }
    }

    // Show loading indicator if present
    const loadingIndicator = button.querySelector('.button-loading');
    if (loadingIndicator) {
      loadingIndicator.removeAttribute('hidden');
      loadingIndicator.setAttribute('aria-hidden', 'false');
    }

    // Execute async function
    return await asyncFn();
  } finally {
    // Restore original state
    button.classList.remove('loading');

    if (disableOnLoad && !wasDisabled) {
      button.disabled = false;
      button.setAttribute('aria-disabled', 'false');
    }

    if (loadingText) {
      const textSpan = button.querySelector('.button-text');
      if (textSpan) {
        textSpan.textContent = originalText;
      } else {
        button.textContent = originalText;
      }
    }

    // Hide loading indicator
    const loadingIndicator = button.querySelector('.button-loading');
    if (loadingIndicator) {
      loadingIndicator.setAttribute('hidden', '');
      loadingIndicator.setAttribute('aria-hidden', 'true');
    }
  }
}

/**
 * Set button to disabled state with proper ARIA
 * 
 * @param {HTMLButtonElement} button - Button element
 * @param {boolean} disabled - Whether to disable
 * @param {string} reason - Optional reason for screen readers
 */
export function setButtonDisabled(button, disabled, reason = null) {
  if (!button) return;

  if (disabled) {
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
    if (reason) {
      button.setAttribute('aria-label', `${button.textContent} - ${reason}`);
    }
  } else {
    button.disabled = false;
    button.setAttribute('aria-disabled', 'false');
    if (reason) {
      button.removeAttribute('aria-label');
    }
  }
}

/**
 * Set button to loading state
 * 
 * @param {HTMLButtonElement} button - Button element
 * @param {boolean} loading - Whether button is loading
 */
export function setButtonLoading(button, loading) {
  if (!button) return;

  if (loading) {
    button.classList.add('loading');
    button.setAttribute('aria-busy', 'true');
  } else {
    button.classList.remove('loading');
    button.removeAttribute('aria-busy');
  }
}

/**
 * Create a standardized button with loading support
 * 
 * @param {Object} config - Button configuration
 * @param {string} config.text - Button text
 * @param {string} config.className - CSS class
 * @param {string} config.ariaLabel - ARIA label
 * @param {Function} config.onClick - Click handler
 * @returns {HTMLButtonElement} Button element
 */
export function createButton(config) {
  const {
    text,
    className = 'md3-button-filled',
    ariaLabel = null,
    onClick = null
  } = config;

  const button = document.createElement('button');
  button.className = className;
  button.setAttribute('type', 'button');
  button.setAttribute('aria-disabled', 'false');
  
  if (ariaLabel) {
    button.setAttribute('aria-label', ariaLabel);
  }

  // Button content structure
  const textSpan = document.createElement('span');
  textSpan.className = 'button-text';
  textSpan.textContent = text;

  const loadingSpan = document.createElement('span');
  loadingSpan.className = 'button-loading';
  loadingSpan.setAttribute('aria-hidden', 'true');
  loadingSpan.setAttribute('hidden', '');
  loadingSpan.textContent = '⏳';

  button.appendChild(textSpan);
  button.appendChild(loadingSpan);

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}

/**
 * Apply consistent button styles and states across the app
 * Call this once on DOMContentLoaded to standardize all buttons
 */
export function standardizeButtons() {
  const buttons = document.querySelectorAll('button:not([data-standardized])');
  
  buttons.forEach(button => {
    // Mark as standardized
    button.setAttribute('data-standardized', 'true');
    
    // Ensure type is set
    if (!button.hasAttribute('type')) {
      button.setAttribute('type', 'button');
    }
    
    // Ensure ARIA disabled state matches
    if (button.disabled && button.getAttribute('aria-disabled') !== 'true') {
      button.setAttribute('aria-disabled', 'true');
    }
    
    // Add focus-visible support for older browsers
    button.addEventListener('blur', () => {
      button.classList.remove('focus-visible');
    });
  });
}

// Auto-standardize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', standardizeButtons);
} else {
  standardizeButtons();
}

export default {
  withLoading,
  setButtonDisabled,
  setButtonLoading,
  createButton,
  standardizeButtons
};
