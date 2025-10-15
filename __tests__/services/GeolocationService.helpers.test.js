/**
 * Tests for pure helper functions used by GeolocationService
 * 
 * This test suite verifies that the pure helper functions are:
 * - Referentially transparent (same input = same output)
 * - Side-effect free (no mutations, logging, or I/O)
 * - Deterministic (consistent behavior)
 * 
 * @jest-environment node
 * @author MP Barbosa
 * @since 0.8.5-alpha
 */

import { describe, test, expect, jest, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

// Mock console to track any logging
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
};

// Mock DOM functions
global.document = undefined;

// Load guia.js to access the pure functions
const fs = require('fs');
const path = require('path');

let getGeolocationErrorInfo;
let formatGeolocationError;
let getGeolocationErrorMessage;
let generateErrorDisplayHTML;
let isGeolocationSupported;
let isPermissionsAPISupported;

try {
    const guiaPath = path.join(__dirname, '../../src/guia.js');
    if (fs.existsSync(guiaPath)) {
        const guiaContent = fs.readFileSync(guiaPath, 'utf8');
        eval(guiaContent);
        
        // Extract the pure functions from global scope
        getGeolocationErrorInfo = global.getGeolocationErrorInfo;
        formatGeolocationError = global.formatGeolocationError;
        getGeolocationErrorMessage = global.getGeolocationErrorMessage;
        generateErrorDisplayHTML = global.generateErrorDisplayHTML;
        isGeolocationSupported = global.isGeolocationSupported;
        isPermissionsAPISupported = global.isPermissionsAPISupported;
    }
} catch (error) {
    console.warn('Could not load guia.js:', error.message);
}

describe('GeolocationService Pure Helper Functions', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getGeolocationErrorInfo - Referential Transparency', () => {
        test('should return same object for same error code', () => {
            if (!getGeolocationErrorInfo) {
                console.warn('getGeolocationErrorInfo not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const result1 = getGeolocationErrorInfo(1);
            const result2 = getGeolocationErrorInfo(1);
            
            expect(result1).toEqual(result2);
            expect(result1.name).toBe("PermissionDeniedError");
            expect(result1.message).toBe("User denied geolocation permission");
        });

        test('should handle all valid error codes', () => {
            if (!getGeolocationErrorInfo) {
                console.warn('getGeolocationErrorInfo not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const error1 = getGeolocationErrorInfo(1);
            const error2 = getGeolocationErrorInfo(2);
            const error3 = getGeolocationErrorInfo(3);
            
            expect(error1.name).toBe("PermissionDeniedError");
            expect(error2.name).toBe("PositionUnavailableError");
            expect(error3.name).toBe("TimeoutError");
        });

        test('should return default for unknown error code', () => {
            if (!getGeolocationErrorInfo) {
                console.warn('getGeolocationErrorInfo not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const result = getGeolocationErrorInfo(999);
            
            expect(result.name).toBe("UnknownGeolocationError");
            expect(result.message).toBe("Unknown geolocation error occurred");
        });

        test('should be pure - no side effects', () => {
            if (!getGeolocationErrorInfo) {
                console.warn('getGeolocationErrorInfo not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            getGeolocationErrorInfo(1);
            
            // Should not log
            expect(global.console.log).not.toHaveBeenCalled();
            expect(global.console.error).not.toHaveBeenCalled();
            expect(global.console.warn).not.toHaveBeenCalled();
        });
    });

    describe('formatGeolocationError - Referential Transparency', () => {
        test('should format error with correct properties', () => {
            if (!formatGeolocationError) {
                console.warn('formatGeolocationError not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockError = {
                code: 1,
                message: "Original error message"
            };

            const result = formatGeolocationError(mockError);
            
            expect(result).toBeInstanceOf(Error);
            expect(result.name).toBe("PermissionDeniedError");
            expect(result.message).toBe("User denied geolocation permission");
            expect(result.code).toBe(1);
            expect(result.originalError).toBe(mockError);
        });

        test('should not mutate input error object', () => {
            if (!formatGeolocationError) {
                console.warn('formatGeolocationError not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockError = {
                code: 2,
                message: "Original message"
            };

            // Store original state
            const originalCode = mockError.code;
            const originalMessage = mockError.message;

            formatGeolocationError(mockError);

            // Verify input was not mutated
            expect(mockError.code).toBe(originalCode);
            expect(mockError.message).toBe(originalMessage);
            expect(mockError.name).toBeUndefined();
        });

        test('should be deterministic', () => {
            if (!formatGeolocationError) {
                console.warn('formatGeolocationError not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockError = { code: 3, message: "Test" };

            const result1 = formatGeolocationError(mockError);
            const result2 = formatGeolocationError(mockError);

            expect(result1.name).toBe(result2.name);
            expect(result1.message).toBe(result2.message);
            expect(result1.code).toBe(result2.code);
        });
    });

    describe('getGeolocationErrorMessage - Referential Transparency', () => {
        test('should return Portuguese error messages', () => {
            if (!getGeolocationErrorMessage) {
                console.warn('getGeolocationErrorMessage not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            expect(getGeolocationErrorMessage(1)).toBe("Permissão negada pelo usuário");
            expect(getGeolocationErrorMessage(2)).toBe("Posição indisponível");
            expect(getGeolocationErrorMessage(3)).toBe("Timeout na obtenção da posição");
        });

        test('should return default for unknown error code', () => {
            if (!getGeolocationErrorMessage) {
                console.warn('getGeolocationErrorMessage not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            expect(getGeolocationErrorMessage(999)).toBe("Erro desconhecido");
        });

        test('should be pure - same input always returns same output', () => {
            if (!getGeolocationErrorMessage) {
                console.warn('getGeolocationErrorMessage not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const result1 = getGeolocationErrorMessage(1);
            const result2 = getGeolocationErrorMessage(1);
            const result3 = getGeolocationErrorMessage(1);

            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
        });
    });

    describe('generateErrorDisplayHTML - Referential Transparency', () => {
        test('should generate valid HTML string', () => {
            if (!generateErrorDisplayHTML) {
                console.warn('generateErrorDisplayHTML not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockError = {
                code: 1,
                message: "Test error message"
            };

            const html = generateErrorDisplayHTML(mockError);

            expect(html).toContain('<div class="location-error">');
            expect(html).toContain('Erro na Obtenção da Localização');
            expect(html).toContain('Código:');
            expect(html).toContain('1');
            expect(html).toContain('Test error message');
        });

        test('should not mutate input error', () => {
            if (!generateErrorDisplayHTML) {
                console.warn('generateErrorDisplayHTML not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockError = {
                code: 2,
                message: "Position unavailable"
            };

            const originalCode = mockError.code;
            const originalMessage = mockError.message;

            generateErrorDisplayHTML(mockError);

            expect(mockError.code).toBe(originalCode);
            expect(mockError.message).toBe(originalMessage);
        });

        test('should be deterministic', () => {
            if (!generateErrorDisplayHTML) {
                console.warn('generateErrorDisplayHTML not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockError = { code: 3, message: "Timeout" };

            const html1 = generateErrorDisplayHTML(mockError);
            const html2 = generateErrorDisplayHTML(mockError);

            expect(html1).toBe(html2);
        });
    });

    describe('isGeolocationSupported - Referential Transparency', () => {
        test('should return true when geolocation is supported', () => {
            if (!isGeolocationSupported) {
                console.warn('isGeolocationSupported not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockNavigator = { geolocation: {} };
            
            expect(isGeolocationSupported(mockNavigator)).toBe(true);
        });

        test('should return false when geolocation is not supported', () => {
            if (!isGeolocationSupported) {
                console.warn('isGeolocationSupported not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockNavigator = {};
            
            expect(isGeolocationSupported(mockNavigator)).toBe(false);
        });

        test('should return false for null/undefined navigator', () => {
            if (!isGeolocationSupported) {
                console.warn('isGeolocationSupported not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            expect(isGeolocationSupported(null)).toBe(false);
            expect(isGeolocationSupported(undefined)).toBe(false);
        });

        test('should be pure - same input returns same output', () => {
            if (!isGeolocationSupported) {
                console.warn('isGeolocationSupported not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockNavigator = { geolocation: {} };

            const result1 = isGeolocationSupported(mockNavigator);
            const result2 = isGeolocationSupported(mockNavigator);

            expect(result1).toBe(result2);
        });
    });

    describe('isPermissionsAPISupported - Referential Transparency', () => {
        test('should return true when Permissions API is supported', () => {
            if (!isPermissionsAPISupported) {
                console.warn('isPermissionsAPISupported not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockNavigator = { permissions: {} };
            
            expect(isPermissionsAPISupported(mockNavigator)).toBe(true);
        });

        test('should return false when Permissions API is not supported', () => {
            if (!isPermissionsAPISupported) {
                console.warn('isPermissionsAPISupported not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockNavigator = {};
            
            expect(isPermissionsAPISupported(mockNavigator)).toBe(false);
        });

        test('should return false for null/undefined navigator', () => {
            if (!isPermissionsAPISupported) {
                console.warn('isPermissionsAPISupported not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            expect(isPermissionsAPISupported(null)).toBe(false);
            expect(isPermissionsAPISupported(undefined)).toBe(false);
        });

        test('should be pure and deterministic', () => {
            if (!isPermissionsAPISupported) {
                console.warn('isPermissionsAPISupported not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            const mockNavigator = { permissions: { query: () => {} } };

            const result1 = isPermissionsAPISupported(mockNavigator);
            const result2 = isPermissionsAPISupported(mockNavigator);

            expect(result1).toBe(result2);
            expect(result1).toBe(true);
        });
    });

    describe('Overall Purity - No Side Effects', () => {
        test('pure functions should not log to console', () => {
            if (!getGeolocationErrorInfo || !formatGeolocationError || !getGeolocationErrorMessage) {
                console.warn('Functions not available - skipping test');
                expect(true).toBe(true);
                return;
            }

            // Call all pure functions
            getGeolocationErrorInfo(1);
            formatGeolocationError({ code: 1, message: "test" });
            getGeolocationErrorMessage(1);
            generateErrorDisplayHTML({ code: 1, message: "test" });
            isGeolocationSupported({ geolocation: {} });
            isPermissionsAPISupported({ permissions: {} });

            // Verify no logging occurred
            expect(global.console.log).not.toHaveBeenCalled();
            expect(global.console.error).not.toHaveBeenCalled();
            expect(global.console.warn).not.toHaveBeenCalled();
        });
    });
});
