/**
 * Test Environment Detection Utilities
 * 
 * Provides helpers to detect the current test environment (Node.js, jsdom, browser)
 * and check for availability of specific browser APIs. Useful for conditional test
 * execution based on environment capabilities.
 * 
 * @module __tests__/utils/test-environment
 * @since 0.11.0-alpha
 * @author Marcelo Pereira Barbosa
 */

/**
 * Check if running in Node.js environment (no window object)
 * 
 * @returns {boolean} True if running in Node.js (not jsdom or browser)
 */
export function isNodeEnvironment() {
    return typeof window === 'undefined' && typeof global !== 'undefined';
}

/**
 * Check if running in browser or jsdom environment (has window object)
 * 
 * @returns {boolean} True if window object is available
 */
export function isBrowserEnvironment() {
    return typeof window !== 'undefined';
}

/**
 * Check if running in jsdom specifically (vs real browser)
 * 
 * @returns {boolean} True if running in jsdom test environment
 */
export function isJsdomEnvironment() {
    if (typeof window === 'undefined') return false;
    
    // jsdom has navigator.userAgent that includes "jsdom"
    return window.navigator && 
           window.navigator.userAgent && 
           window.navigator.userAgent.includes('jsdom');
}

/**
 * Check if Speech Synthesis API is available
 * 
 * @returns {boolean} True if window.speechSynthesis exists
 */
export function hasSpeechAPI() {
    return typeof window !== 'undefined' && 
           typeof window.speechSynthesis !== 'undefined';
}

/**
 * Check if Geolocation API is available
 * 
 * @returns {boolean} True if navigator.geolocation exists
 */
export function hasGeolocationAPI() {
    return typeof window !== 'undefined' && 
           window.navigator && 
           typeof window.navigator.geolocation !== 'undefined';
}

/**
 * Check if DOM is available (document object exists)
 * 
 * @returns {boolean} True if document object is available
 */
export function hasDOM() {
    return typeof document !== 'undefined';
}

/**
 * Check if Web Speech Recognition API is available
 * 
 * @returns {boolean} True if webkitSpeechRecognition or SpeechRecognition exists
 */
export function hasSpeechRecognitionAPI() {
    if (typeof window === 'undefined') return false;
    return typeof window.webkitSpeechRecognition !== 'undefined' ||
           typeof window.SpeechRecognition !== 'undefined';
}

/**
 * Check if running in CI/CD environment
 * 
 * @returns {boolean} True if CI environment variable is set
 */
export function isCIEnvironment() {
    return process.env.CI === 'true' || 
           process.env.CONTINUOUS_INTEGRATION === 'true';
}

/**
 * Get environment type as string
 * 
 * @returns {'node'|'jsdom'|'browser'|'unknown'} Environment type
 */
export function getEnvironmentType() {
    if (isNodeEnvironment()) return 'node';
    if (isJsdomEnvironment()) return 'jsdom';
    if (isBrowserEnvironment()) return 'browser';
    return 'unknown';
}

/**
 * Conditional describe block - only runs if condition is true
 * 
 * @param {boolean} condition - Whether to run the test suite
 * @param {string} name - Test suite name
 * @param {Function} fn - Test suite function
 * @param {string} [skipMessage] - Optional message explaining why skipped
 */
export function describeIf(condition, name, fn, skipMessage) {
    if (condition) {
        describe(name, fn);
    } else {
        const message = skipMessage ? ` (${skipMessage})` : '';
        describe.skip(`${name}${message}`, fn);
    }
}

/**
 * Conditional describe for browser-only tests
 * 
 * @param {string} name - Test suite name
 * @param {Function} fn - Test suite function
 */
export function describeIfBrowser(name, fn) {
    describeIf(
        isBrowserEnvironment(),
        name,
        fn,
        'requires browser environment'
    );
}

/**
 * Conditional describe for Node.js-only tests
 * 
 * @param {string} name - Test suite name
 * @param {Function} fn - Test suite function
 */
export function describeIfNode(name, fn) {
    describeIf(
        isNodeEnvironment(),
        name,
        fn,
        'requires Node.js environment'
    );
}

/**
 * Conditional describe for jsdom-only tests
 * 
 * @param {string} name - Test suite name
 * @param {Function} fn - Test suite function
 */
export function describeIfJsdom(name, fn) {
    describeIf(
        isJsdomEnvironment(),
        name,
        fn,
        'requires jsdom environment'
    );
}

/**
 * Conditional describe for tests requiring Speech API
 * 
 * @param {string} name - Test suite name
 * @param {Function} fn - Test suite function
 */
export function describeIfSpeech(name, fn) {
    describeIf(
        hasSpeechAPI(),
        name,
        fn,
        'requires Speech Synthesis API'
    );
}

/**
 * Conditional describe for tests requiring Geolocation API
 * 
 * @param {string} name - Test suite name
 * @param {Function} fn - Test suite function
 */
export function describeIfGeolocation(name, fn) {
    describeIf(
        hasGeolocationAPI(),
        name,
        fn,
        'requires Geolocation API'
    );
}

/**
 * Conditional describe for tests requiring DOM
 * 
 * @param {string} name - Test suite name
 * @param {Function} fn - Test suite function
 */
export function describeIfDOM(name, fn) {
    describeIf(
        hasDOM(),
        name,
        fn,
        'requires DOM'
    );
}

/**
 * Conditional test - only runs if condition is true
 * 
 * @param {boolean} condition - Whether to run the test
 * @param {string} name - Test name
 * @param {Function} fn - Test function
 * @param {string} [skipMessage] - Optional message explaining why skipped
 */
export function testIf(condition, name, fn, skipMessage) {
    if (condition) {
        test(name, fn);
    } else {
        const message = skipMessage ? ` (${skipMessage})` : '';
        test.skip(`${name}${message}`, fn);
    }
}

/**
 * Get environment capabilities summary
 * 
 * @returns {Object} Object with boolean flags for each capability
 */
export function getCapabilities() {
    return {
        environment: getEnvironmentType(),
        isNode: isNodeEnvironment(),
        isBrowser: isBrowserEnvironment(),
        isJsdom: isJsdomEnvironment(),
        hasDOM: hasDOM(),
        hasSpeech: hasSpeechAPI(),
        hasGeolocation: hasGeolocationAPI(),
        hasSpeechRecognition: hasSpeechRecognitionAPI(),
        isCI: isCIEnvironment()
    };
}

/**
 * Log environment capabilities to console (useful for debugging)
 */
export function logCapabilities() {
    const caps = getCapabilities();
    console.log('Test Environment Capabilities:');
    console.log(JSON.stringify(caps, null, 2));
}
