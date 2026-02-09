/**
 * @file SpeechConfiguration.test.js
 * @description Comprehensive tests for SpeechConfiguration class
 * 
 * Tests speech parameter configuration management including:
 * - Constructor initialization
 * - Rate setting with validation and clamping
 * - Pitch setting with validation and clamping
 * - Getters
 * - Reset functionality
 * - Logging controls
 * - Static range methods
 * - Error handling
 * 
 * @since 0.8.7-alpha
 */

import { SpeechConfiguration } from '../../src/speech/SpeechConfiguration.js';

describe('SpeechConfiguration', () => {
    describe('Constructor', () => {
        test('should create instance with default values (logging disabled)', () => {
            const config = new SpeechConfiguration();
            
            expect(config).toBeInstanceOf(SpeechConfiguration);
            expect(config.enableLogging).toBe(false);
            expect(config.getRate()).toBe(1.0);
            expect(config.getPitch()).toBe(1.0);
        });

        test('should create instance with logging enabled', () => {
            const config = new SpeechConfiguration(true);
            
            expect(config.enableLogging).toBe(true);
            expect(config.getRate()).toBe(1.0);
            expect(config.getPitch()).toBe(1.0);
        });

        test('should create instance with logging explicitly disabled', () => {
            const config = new SpeechConfiguration(false);
            
            expect(config.enableLogging).toBe(false);
        });
    });

    describe('setRate()', () => {
        let config;

        beforeEach(() => {
            config = new SpeechConfiguration(false);
        });

        test('should set valid rate within range', () => {
            const result = config.setRate(1.5);
            
            expect(result).toBe(1.5);
            expect(config.getRate()).toBe(1.5);
        });

        test('should set minimum rate (0.1)', () => {
            const result = config.setRate(0.1);
            
            expect(result).toBe(0.1);
            expect(config.getRate()).toBe(0.1);
        });

        test('should set maximum rate (10.0)', () => {
            const result = config.setRate(10.0);
            
            expect(result).toBe(10.0);
            expect(config.getRate()).toBe(10.0);
        });

        test('should clamp rate below minimum to 0.1', () => {
            const result = config.setRate(0.05);
            
            expect(result).toBe(0.1);
            expect(config.getRate()).toBe(0.1);
        });

        test('should clamp rate above maximum to 10.0', () => {
            const result = config.setRate(15.0);
            
            expect(result).toBe(10.0);
            expect(config.getRate()).toBe(10.0);
        });

        test('should clamp negative rate to minimum (0.1)', () => {
            const result = config.setRate(-1.0);
            
            expect(result).toBe(0.1);
            expect(config.getRate()).toBe(0.1);
        });

        test('should handle decimal values correctly', () => {
            const result = config.setRate(1.234567);
            
            expect(result).toBe(1.234567);
            expect(config.getRate()).toBe(1.234567);
        });

        test('should throw TypeError for non-number rate', () => {
            expect(() => config.setRate('1.0')).toThrow(TypeError);
            expect(() => config.setRate('1.0')).toThrow('Rate must be a valid number');
        });

        test('should throw TypeError for NaN rate', () => {
            expect(() => config.setRate(NaN)).toThrow(TypeError);
            expect(() => config.setRate(NaN)).toThrow('Rate must be a valid number');
        });

        test('should throw TypeError for null rate', () => {
            expect(() => config.setRate(null)).toThrow(TypeError);
        });

        test('should throw TypeError for undefined rate', () => {
            expect(() => config.setRate(undefined)).toThrow(TypeError);
        });
    });

    describe('setPitch()', () => {
        let config;

        beforeEach(() => {
            config = new SpeechConfiguration(false);
        });

        test('should set valid pitch within range', () => {
            const result = config.setPitch(1.5);
            
            expect(result).toBe(1.5);
            expect(config.getPitch()).toBe(1.5);
        });

        test('should set minimum pitch (0.0)', () => {
            const result = config.setPitch(0.0);
            
            expect(result).toBe(0.0);
            expect(config.getPitch()).toBe(0.0);
        });

        test('should set maximum pitch (2.0)', () => {
            const result = config.setPitch(2.0);
            
            expect(result).toBe(2.0);
            expect(config.getPitch()).toBe(2.0);
        });

        test('should clamp pitch below minimum to 0.0', () => {
            const result = config.setPitch(-0.5);
            
            expect(result).toBe(0.0);
            expect(config.getPitch()).toBe(0.0);
        });

        test('should clamp pitch above maximum to 2.0', () => {
            const result = config.setPitch(5.0);
            
            expect(result).toBe(2.0);
            expect(config.getPitch()).toBe(2.0);
        });

        test('should handle decimal values correctly', () => {
            const result = config.setPitch(1.234567);
            
            expect(result).toBe(1.234567);
            expect(config.getPitch()).toBe(1.234567);
        });

        test('should throw TypeError for non-number pitch', () => {
            expect(() => config.setPitch('1.0')).toThrow(TypeError);
            expect(() => config.setPitch('1.0')).toThrow('Pitch must be a valid number');
        });

        test('should throw TypeError for NaN pitch', () => {
            expect(() => config.setPitch(NaN)).toThrow(TypeError);
            expect(() => config.setPitch(NaN)).toThrow('Pitch must be a valid number');
        });

        test('should throw TypeError for null pitch', () => {
            expect(() => config.setPitch(null)).toThrow(TypeError);
        });

        test('should throw TypeError for undefined pitch', () => {
            expect(() => config.setPitch(undefined)).toThrow(TypeError);
        });
    });

    describe('getRate()', () => {
        test('should return default rate (1.0)', () => {
            const config = new SpeechConfiguration();
            
            expect(config.getRate()).toBe(1.0);
        });

        test('should return updated rate', () => {
            const config = new SpeechConfiguration();
            config.setRate(1.5);
            
            expect(config.getRate()).toBe(1.5);
        });
    });

    describe('getPitch()', () => {
        test('should return default pitch (1.0)', () => {
            const config = new SpeechConfiguration();
            
            expect(config.getPitch()).toBe(1.0);
        });

        test('should return updated pitch', () => {
            const config = new SpeechConfiguration();
            config.setPitch(1.5);
            
            expect(config.getPitch()).toBe(1.5);
        });
    });

    describe('getConfiguration()', () => {
        test('should return configuration object with defaults', () => {
            const config = new SpeechConfiguration();
            const result = config.getConfiguration();
            
            expect(result).toEqual({
                rate: 1.0,
                pitch: 1.0
            });
        });

        test('should return configuration object with custom values', () => {
            const config = new SpeechConfiguration();
            config.setRate(1.5);
            config.setPitch(1.2);
            const result = config.getConfiguration();
            
            expect(result).toEqual({
                rate: 1.5,
                pitch: 1.2
            });
        });

        test('should return new object (not reference)', () => {
            const config = new SpeechConfiguration();
            const result1 = config.getConfiguration();
            const result2 = config.getConfiguration();
            
            expect(result1).not.toBe(result2);
            expect(result1).toEqual(result2);
        });
    });

    describe('reset()', () => {
        test('should reset rate and pitch to defaults', () => {
            const config = new SpeechConfiguration();
            config.setRate(2.0);
            config.setPitch(1.5);
            
            config.reset();
            
            expect(config.getRate()).toBe(1.0);
            expect(config.getPitch()).toBe(1.0);
        });

        test('should reset even after clamping', () => {
            const config = new SpeechConfiguration();
            config.setRate(15.0); // Clamped to 10.0
            config.setPitch(5.0); // Clamped to 2.0
            
            config.reset();
            
            expect(config.getRate()).toBe(1.0);
            expect(config.getPitch()).toBe(1.0);
        });
    });

    describe('Logging Controls', () => {
        test('should enable logging', () => {
            const config = new SpeechConfiguration(false);
            expect(config.enableLogging).toBe(false);
            
            config.enableLogs();
            
            expect(config.enableLogging).toBe(true);
        });

        test('should disable logging', () => {
            const config = new SpeechConfiguration(true);
            expect(config.enableLogging).toBe(true);
            
            config.disableLogs();
            
            expect(config.enableLogging).toBe(false);
        });

        test('should toggle logging multiple times', () => {
            const config = new SpeechConfiguration();
            
            config.enableLogs();
            expect(config.enableLogging).toBe(true);
            
            config.disableLogs();
            expect(config.enableLogging).toBe(false);
            
            config.enableLogs();
            expect(config.enableLogging).toBe(true);
        });
    });

    describe('Static Range Methods', () => {
        test('getRateRange() should return valid rate range', () => {
            const range = SpeechConfiguration.getRateRange();
            
            expect(range).toEqual({
                min: 0.1,
                max: 10.0,
                default: 1.0
            });
        });

        test('getPitchRange() should return valid pitch range', () => {
            const range = SpeechConfiguration.getPitchRange();
            
            expect(range).toEqual({
                min: 0.0,
                max: 2.0,
                default: 1.0
            });
        });

        test('range methods should return immutable values', () => {
            const range1 = SpeechConfiguration.getRateRange();
            const range2 = SpeechConfiguration.getRateRange();
            
            expect(range1).not.toBe(range2);
            expect(range1).toEqual(range2);
        });
    });

    describe('Integration Scenarios', () => {
        test('should handle multiple parameter updates', () => {
            const config = new SpeechConfiguration();
            
            config.setRate(1.5);
            config.setPitch(1.2);
            config.setRate(2.0);
            config.setPitch(0.8);
            
            expect(config.getRate()).toBe(2.0);
            expect(config.getPitch()).toBe(0.8);
        });

        test('should maintain independence between rate and pitch', () => {
            const config = new SpeechConfiguration();
            
            config.setRate(2.0);
            expect(config.getRate()).toBe(2.0);
            expect(config.getPitch()).toBe(1.0); // Still default
            
            config.setPitch(1.5);
            expect(config.getRate()).toBe(2.0); // Unchanged
            expect(config.getPitch()).toBe(1.5);
        });

        test('should handle edge values correctly', () => {
            const config = new SpeechConfiguration();
            
            // Test all edge values
            config.setRate(0.1);
            config.setPitch(0.0);
            expect(config.getConfiguration()).toEqual({ rate: 0.1, pitch: 0.0 });
            
            config.setRate(10.0);
            config.setPitch(2.0);
            expect(config.getConfiguration()).toEqual({ rate: 10.0, pitch: 2.0 });
        });

        test('should work with logging enabled', () => {
            const config = new SpeechConfiguration(true);
            
            // These should not throw even with logging enabled
            expect(() => config.setRate(1.5)).not.toThrow();
            expect(() => config.setPitch(1.2)).not.toThrow();
            expect(() => config.reset()).not.toThrow();
        });

        test('should handle rapid successive updates', () => {
            const config = new SpeechConfiguration();
            
            for (let i = 0; i < 100; i++) {
                config.setRate(Math.random() * 10);
                config.setPitch(Math.random() * 2);
            }
            
            // Final values should be valid
            const finalConfig = config.getConfiguration();
            expect(finalConfig.rate).toBeGreaterThanOrEqual(0.1);
            expect(finalConfig.rate).toBeLessThanOrEqual(10.0);
            expect(finalConfig.pitch).toBeGreaterThanOrEqual(0.0);
            expect(finalConfig.pitch).toBeLessThanOrEqual(2.0);
        });
    });
});
