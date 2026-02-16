'use strict';

/**
 * E2E Test Helpers
 * 
 * Provides robust utilities for E2E testing with Puppeteer, replacing fixed delays
 * with retry-based polling patterns for more reliable test execution.
 * 
 * @module __tests__/utils/e2e-helpers
 * @since 0.11.0-alpha
 * @author Marcelo Pereira Barbosa
 */

/**
 * Default configuration for waitFor helpers
 */
const DEFAULT_CONFIG = {
    timeout: 10000,        // 10 seconds
    pollInterval: 100,     // Check every 100ms
    throwOnTimeout: true   // Throw error if timeout reached
};

/**
 * Wait for an element to be present in the DOM
 * 
 * @param {Page} page - Puppeteer page instance
 * @param {string} selector - CSS selector for element
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Maximum wait time in ms (default: 10000)
 * @param {number} options.pollInterval - Check interval in ms (default: 100)
 * @param {boolean} options.throwOnTimeout - Throw on timeout (default: true)
 * @returns {Promise<ElementHandle|null>} Element handle or null if not found
 */
export async function waitForElement(page, selector, options = {}) {
    const config = { ...DEFAULT_CONFIG, ...options };
    const startTime = Date.now();
    
    while (Date.now() - startTime < config.timeout) {
        try {
            const element = await page.$(selector);
            if (element) {
                return element;
            }
        } catch (error) {
            // Ignore errors and continue polling
        }
        
        await new Promise(resolve => setTimeout(resolve, config.pollInterval));
    }
    
    if (config.throwOnTimeout) {
        throw new Error(`Timeout waiting for element: ${selector} (${config.timeout}ms)`);
    }
    
    return null;
}

/**
 * Wait for element text content to match expected value
 * 
 * Supports exact match, partial match (contains), or regex patterns.
 * 
 * @param {Page} page - Puppeteer page instance
 * @param {string} selector - CSS selector for element
 * @param {string|RegExp} expectedText - Expected text content (string or regex)
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Maximum wait time in ms (default: 10000)
 * @param {number} options.pollInterval - Check interval in ms (default: 100)
 * @param {boolean} options.exact - Require exact match (default: false)
 * @param {boolean} options.throwOnTimeout - Throw on timeout (default: true)
 * @returns {Promise<string|null>} Actual text content or null if timeout
 */
export async function waitForElementText(page, selector, expectedText, options = {}) {
    const config = { ...DEFAULT_CONFIG, exact: false, ...options };
    const startTime = Date.now();
    
    const isRegex = expectedText instanceof RegExp;
    
    while (Date.now() - startTime < config.timeout) {
        try {
            const element = await page.$(selector);
            if (element) {
                const text = await page.evaluate(el => el.textContent, element);
                
                if (text) {
                    const trimmedText = text.trim();
                    
                    // Check match based on type
                    if (isRegex) {
                        if (expectedText.test(trimmedText)) {
                            return trimmedText;
                        }
                    } else if (config.exact) {
                        if (trimmedText === expectedText) {
                            return trimmedText;
                        }
                    } else {
                        // Partial match (contains)
                        if (trimmedText.includes(expectedText)) {
                            return trimmedText;
                        }
                    }
                }
            }
        } catch (error) {
            // Ignore errors and continue polling
        }
        
        await new Promise(resolve => setTimeout(resolve, config.pollInterval));
    }
    
    if (config.throwOnTimeout) {
        const matchType = isRegex ? 'regex' : (config.exact ? 'exact' : 'contains');
        throw new Error(
            `Timeout waiting for element text: ${selector} to ${matchType} match "${expectedText}" (${config.timeout}ms)`
        );
    }
    
    return null;
}

/**
 * Wait for element to be visible (display !== 'none', opacity > 0)
 * 
 * @param {Page} page - Puppeteer page instance
 * @param {string} selector - CSS selector for element
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Maximum wait time in ms (default: 10000)
 * @param {number} options.pollInterval - Check interval in ms (default: 100)
 * @param {boolean} options.throwOnTimeout - Throw on timeout (default: true)
 * @returns {Promise<ElementHandle|null>} Element handle or null if not visible
 */
export async function waitForElementVisible(page, selector, options = {}) {
    const config = { ...DEFAULT_CONFIG, ...options };
    const startTime = Date.now();
    
    while (Date.now() - startTime < config.timeout) {
        try {
            const element = await page.$(selector);
            if (element) {
                const isVisible = await page.evaluate((el) => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && 
                           style.visibility !== 'hidden' && 
                           parseFloat(style.opacity) > 0;
                }, element);
                
                if (isVisible) {
                    return element;
                }
            }
        } catch (error) {
            // Ignore errors and continue polling
        }
        
        await new Promise(resolve => setTimeout(resolve, config.pollInterval));
    }
    
    if (config.throwOnTimeout) {
        throw new Error(`Timeout waiting for element to be visible: ${selector} (${config.timeout}ms)`);
    }
    
    return null;
}

/**
 * Wait for a condition function to return truthy value
 * 
 * Generic wait helper that polls a condition function until it returns true.
 * Useful for complex conditions that can't be checked with simple selectors.
 * 
 * @param {Function} conditionFn - Async function that returns truthy when condition met
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Maximum wait time in ms (default: 10000)
 * @param {number} options.pollInterval - Check interval in ms (default: 100)
 * @param {boolean} options.throwOnTimeout - Throw on timeout (default: true)
 * @param {string} options.timeoutMessage - Custom timeout error message
 * @returns {Promise<any>} Result from conditionFn or null if timeout
 */
export async function waitForCondition(conditionFn, options = {}) {
    const config = { 
        ...DEFAULT_CONFIG, 
        timeoutMessage: 'Timeout waiting for condition',
        ...options 
    };
    const startTime = Date.now();
    
    while (Date.now() - startTime < config.timeout) {
        try {
            const result = await conditionFn();
            if (result) {
                return result;
            }
        } catch (error) {
            // Ignore errors and continue polling
        }
        
        await new Promise(resolve => setTimeout(resolve, config.pollInterval));
    }
    
    if (config.throwOnTimeout) {
        throw new Error(`${config.timeoutMessage} (${config.timeout}ms)`);
    }
    
    return null;
}

/**
 * Wait for page to evaluate expression and return truthy value
 * 
 * Polls a page.evaluate() expression until it returns truthy.
 * Useful for waiting on application state or DOM conditions.
 * 
 * @param {Page} page - Puppeteer page instance
 * @param {Function|string} expression - Function or expression to evaluate
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Maximum wait time in ms (default: 10000)
 * @param {number} options.pollInterval - Check interval in ms (default: 100)
 * @param {boolean} options.throwOnTimeout - Throw on timeout (default: true)
 * @param {string} options.timeoutMessage - Custom timeout error message
 * @returns {Promise<any>} Evaluation result or null if timeout
 */
export async function waitForPageCondition(page, expression, options = {}) {
    const config = { 
        ...DEFAULT_CONFIG, 
        timeoutMessage: 'Timeout waiting for page condition',
        ...options 
    };
    
    return waitForCondition(async () => {
        try {
            return await page.evaluate(expression);
        } catch (error) {
            return false;
        }
    }, config);
}

/**
 * Wait for network to be idle (no pending requests)
 * 
 * Waits until there are no active network requests for a specified duration.
 * Useful for ensuring all API calls have completed.
 * 
 * @param {Page} page - Puppeteer page instance
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Maximum wait time in ms (default: 10000)
 * @param {number} options.idleTime - Duration of idle state required in ms (default: 500)
 * @param {boolean} options.throwOnTimeout - Throw on timeout (default: true)
 * @returns {Promise<boolean>} True if network idle, false if timeout
 */
export async function waitForNetworkIdle(page, options = {}) {
    const config = { 
        ...DEFAULT_CONFIG, 
        idleTime: 500,
        ...options 
    };
    
    let activeRequests = 0;
    let idleStartTime = null;
    const startTime = Date.now();
    
    const requestListener = () => { activeRequests++; idleStartTime = null; };
    const responseListener = () => { activeRequests--; };
    
    page.on('request', requestListener);
    page.on('requestfinished', responseListener);
    page.on('requestfailed', responseListener);
    
    try {
        while (Date.now() - startTime < config.timeout) {
            if (activeRequests === 0) {
                if (idleStartTime === null) {
                    idleStartTime = Date.now();
                } else if (Date.now() - idleStartTime >= config.idleTime) {
                    return true;
                }
            } else {
                idleStartTime = null;
            }
            
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        if (config.throwOnTimeout) {
            throw new Error(`Timeout waiting for network idle (${config.timeout}ms)`);
        }
        
        return false;
    } finally {
        page.off('request', requestListener);
        page.off('requestfinished', responseListener);
        page.off('requestfailed', responseListener);
    }
}

/**
 * Retry an async operation with exponential backoff
 * 
 * @param {Function} operation - Async function to retry
 * @param {Object} options - Configuration options
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 100)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 5000)
 * @param {number} options.backoffMultiplier - Delay multiplier (default: 2)
 * @returns {Promise<any>} Result from operation
 */
export async function retryWithBackoff(operation, options = {}) {
    const config = {
        maxRetries: 3,
        initialDelay: 100,
        maxDelay: 5000,
        backoffMultiplier: 2,
        ...options
    };
    
    let lastError;
    let delay = config.initialDelay;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            
            if (attempt < config.maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delay));
                delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
            }
        }
    }
    
    throw new Error(
        `Operation failed after ${config.maxRetries + 1} attempts. Last error: ${lastError.message}`
    );
}

/**
 * Wait for DOM mutations to stabilize
 * 
 * Waits until no DOM mutations occur for a specified duration.
 * Useful for dynamic content that updates multiple times.
 * 
 * @param {Page} page - Puppeteer page instance
 * @param {string} selector - CSS selector to observe (default: 'body')
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Maximum wait time in ms (default: 10000)
 * @param {number} options.stabilityTime - Duration of stability required in ms (default: 500)
 * @param {boolean} options.throwOnTimeout - Throw on timeout (default: true)
 * @returns {Promise<boolean>} True if stable, false if timeout
 */
export async function waitForDOMStable(page, selector = 'body', options = {}) {
    const config = { 
        ...DEFAULT_CONFIG, 
        stabilityTime: 500,
        ...options 
    };
    
    return await page.evaluate((sel, stableTime, maxWait) => {
        return new Promise((resolve, reject) => {
            const target = document.querySelector(sel);
            if (!target) {
                reject(new Error(`Target element not found: ${sel}`));
                return;
            }
            
            let lastMutationTime = Date.now();
            const startTime = Date.now();
            
            const observer = new MutationObserver(() => {
                lastMutationTime = Date.now();
            });
            
            observer.observe(target, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            });
            
            const checkStability = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const timeSinceLastMutation = Date.now() - lastMutationTime;
                
                if (timeSinceLastMutation >= stableTime) {
                    clearInterval(checkStability);
                    observer.disconnect();
                    resolve(true);
                } else if (elapsed >= maxWait) {
                    clearInterval(checkStability);
                    observer.disconnect();
                    reject(new Error(`DOM did not stabilize within ${maxWait}ms`));
                }
            }, 50);
        });
    }, selector, config.stabilityTime, config.timeout)
    .then(() => true)
    .catch((error) => {
        if (config.throwOnTimeout) {
            throw error;
        }
        return false;
    });
}

/**
 * Wait for element attribute to have expected value
 * 
 * @param {Page} page - Puppeteer page instance
 * @param {string} selector - CSS selector for element
 * @param {string} attribute - Attribute name
 * @param {string|RegExp} expectedValue - Expected attribute value
 * @param {Object} options - Configuration options
 * @returns {Promise<string|null>} Actual attribute value or null
 */
export async function waitForAttribute(page, selector, attribute, expectedValue, options = {}) {
    const config = { ...DEFAULT_CONFIG, ...options };
    const startTime = Date.now();
    const isRegex = expectedValue instanceof RegExp;
    
    while (Date.now() - startTime < config.timeout) {
        try {
            const element = await page.$(selector);
            if (element) {
                const attrValue = await page.evaluate(
                    (el, attr) => el.getAttribute(attr),
                    element,
                    attribute
                );
                
                if (attrValue !== null) {
                    if (isRegex) {
                        if (expectedValue.test(attrValue)) {
                            return attrValue;
                        }
                    } else if (attrValue === expectedValue) {
                        return attrValue;
                    }
                }
            }
        } catch (error) {
            // Ignore errors and continue polling
        }
        
        await new Promise(resolve => setTimeout(resolve, config.pollInterval));
    }
    
    if (config.throwOnTimeout) {
        throw new Error(
            `Timeout waiting for attribute ${attribute} on ${selector} to be "${expectedValue}" (${config.timeout}ms)`
        );
    }
    
    return null;
}

/**
 * Helper: Get current text content of element (non-polling)
 * 
 * @param {Page} page - Puppeteer page instance
 * @param {string} selector - CSS selector for element
 * @returns {Promise<string|null>} Text content or null if not found
 */
export async function getElementText(page, selector) {
    try {
        const element = await page.$(selector);
        if (element) {
            return await page.evaluate(el => el.textContent.trim(), element);
        }
    } catch (error) {
        // Ignore errors
    }
    return null;
}

/**
 * Helper: Check if element exists (non-polling)
 * 
 * @param {Page} page - Puppeteer page instance
 * @param {string} selector - CSS selector for element
 * @returns {Promise<boolean>} True if element exists
 */
export async function elementExists(page, selector) {
    try {
        const element = await page.$(selector);
        return element !== null;
    } catch (error) {
        return false;
    }
}
