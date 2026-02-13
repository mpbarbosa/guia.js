'use strict';
import { log, warn, error } from './logger.js';

/**
 * Device detection utilities.
 * 
 * Pure functions for detecting device types (mobile vs desktop).
 * Functions use dependency injection for testability and referential transparency.
 * 
 * @module utils/device
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */

/**
 * Detects if the current device is a mobile or tablet device.
 * 
 * This function uses multiple detection methods to determine device type:
 * 1. User agent string matching for common mobile/tablet patterns
 * 2. Touch capability detection (maxTouchPoints > 0)
 * 3. Screen width heuristic (< 768px typically indicates mobile)
 * 
 * A device is classified as mobile if at least 2 out of 3 detection methods
 * indicate a mobile device. This scoring system provides more reliable detection
 * than any single method.
 * 
 * Mobile devices typically have GPS hardware providing more accurate
 * geolocation (< 20 meters), while desktop/laptop devices rely on
 * WiFi/IP-based location with lower accuracy (50-1000 meters).
 * 
 * @param {Object} [options] - Optional parameters for testing/dependency injection
 * @param {Object} [options.navigatorObj] - Navigator object to use (defaults to global navigator)
 * @param {Object} [options.windowObj] - Window object to use (defaults to global window)
 * @returns {boolean} True if device is mobile/tablet, false for desktop/laptop
 * 
 * @example
 * // Default usage (uses global navigator and window)
 * if (isMobileDevice()) {
 *   log('Mobile device detected - expecting high GPS accuracy');
 * } else {
 *   log('Desktop device detected - expecting lower accuracy');
 * }
 * 
 * @example
 * // Testing with custom navigator/window (referentially transparent)
 * const result = isMobileDevice({
 *   navigatorObj: { userAgent: 'iPhone', maxTouchPoints: 5 },
 *   windowObj: { innerWidth: 375 }
 * });
 * 
 * @note Edge Cases:
 * - Returns false for non-browser environments (Node.js)
 * - Handles missing navigator.userAgent, navigator.vendor gracefully
 * - Screen width of exactly 768px is considered desktop (not < 768)
 * - Missing maxTouchPoints property is treated as 0 (no touch)
 * - Empty or missing user agent strings default to empty string
 * 
 * @note Limitations:
 * - User agent strings can be spoofed
 * - Touch-capable laptops may be misdetected as mobile
 * - Tablets in landscape mode (width > 768) may be misdetected as desktop
 * - Detection happens once at module load; window resize not tracked
 * 
 * @test: isMobileDevice() should return true for mobile user agents
 * @test: isMobileDevice() should return false for desktop user agents
 * @test: isMobileDevice() should return true for touch-enabled devices
 * @test: isMobileDevice() should return false for non-touch devices
 * @test: isMobileDevice() should return true for small screen widths
 * @test: isMobileDevice() should return false for large screen widths
 *
 * @see (/__tests__/utils/DeviceDetection.test.js) Unit tests for device detection
 * @see {@link https://caniuse.com/mdn-api_navigator_maxtouchpoints} Browser compatibility for maxTouchPoints
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent} User Agent Detection
 * @see (DEVICE_DETECTION.md) - Additional documentation on device detection strategies
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */
export const isMobileDevice = (options = {}) => {
	// Allow dependency injection for testing (referential transparency)
	const navigatorObj = options.navigatorObj || (typeof navigator !== 'undefined' ? navigator : null);
	const windowObj = options.windowObj || (typeof window !== 'undefined' ? window : null);

	// Check if we're in a browser environment
	if (!navigatorObj || !windowObj) {
		return false; // Default to desktop for non-browser environments (e.g., Node.js)
	}

	// Method 1: User agent detection
	// Safely access user agent with fallbacks
	const userAgent = navigatorObj.userAgent || navigatorObj.vendor ||
		(windowObj.opera ? windowObj.opera : '') || '';
	const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
	const isMobileUA = mobileRegex.test(userAgent.toLowerCase());

	// Method 2: Touch capability detection
	// Defensive check for maxTouchPoints property existence
	const hasTouchScreen = 'maxTouchPoints' in navigatorObj && navigatorObj.maxTouchPoints > 0;

	// Method 3: Screen width heuristic (tablets and phones typically < 768px)
	// Defensive check for innerWidth property
	const screenWidth = typeof windowObj.innerWidth === 'number' ? windowObj.innerWidth : Infinity;
	const isSmallScreen = screenWidth < 768;

	// Consider it mobile if any two of these conditions are true
	const detectionScore = [isMobileUA, hasTouchScreen, isSmallScreen].filter(Boolean).length;

	return detectionScore >= 2;
};
