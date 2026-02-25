import { SpeechConfiguration } from '../../src/speech/SpeechConfiguration.js';

describe('SpeechConfiguration', () => {
    let config;

    beforeEach(() => {
        config = new SpeechConfiguration();
    });

    describe('constructor', () => {
        test('should initialize with default values', () => {
            expect(config.getRate()).toBe(1.0);
            expect(config.getPitch()).toBe(1.0);
            expect(config.enableLogging).toBe(false);
        });

        test('should accept logging parameter', () => {
            const configWithLogging = new SpeechConfiguration(true);
            expect(configWithLogging.enableLogging).toBe(true);
        });
    });

    describe('setRate', () => {
        test('should set valid rate', () => {
            const result = config.setRate(1.5);
            expect(config.getRate()).toBe(1.5);
            expect(result).toBe(1.5);
        });

        test('should clamp rate below minimum', () => {
            const result = config.setRate(0.05);
            expect(config.getRate()).toBe(0.1);
            expect(result).toBe(0.1);
        });

        test('should clamp rate above maximum', () => {
            const result = config.setRate(15);
            expect(config.getRate()).toBe(10.0);
            expect(result).toBe(10.0);
        });

        test('should throw TypeError for non-number', () => {
            expect(() => config.setRate('1.5')).toThrow(TypeError);
            expect(() => config.setRate('1.5')).toThrow('Rate must be a valid number');
        });

        test('should throw TypeError for NaN', () => {
            expect(() => config.setRate(NaN)).toThrow(TypeError);
        });

        test('should accept minimum valid rate', () => {
            config.setRate(0.1);
            expect(config.getRate()).toBe(0.1);
        });

        test('should accept maximum valid rate', () => {
            config.setRate(10.0);
            expect(config.getRate()).toBe(10.0);
        });
    });

    describe('setPitch', () => {
        test('should set valid pitch', () => {
            const result = config.setPitch(1.2);
            expect(config.getPitch()).toBe(1.2);
            expect(result).toBe(1.2);
        });

        test('should clamp pitch below minimum', () => {
            const result = config.setPitch(-0.5);
            expect(config.getPitch()).toBe(0.0);
            expect(result).toBe(0.0);
        });

        test('should clamp pitch above maximum', () => {
            const result = config.setPitch(5.0);
            expect(config.getPitch()).toBe(2.0);
            expect(result).toBe(2.0);
        });

        test('should throw TypeError for non-number', () => {
            expect(() => config.setPitch('1.5')).toThrow(TypeError);
            expect(() => config.setPitch('1.5')).toThrow('Pitch must be a valid number');
        });

        test('should throw TypeError for NaN', () => {
            expect(() => config.setPitch(NaN)).toThrow(TypeError);
        });

        test('should accept minimum valid pitch', () => {
            config.setPitch(0.0);
            expect(config.getPitch()).toBe(0.0);
        });

        test('should accept maximum valid pitch', () => {
            config.setPitch(2.0);
            expect(config.getPitch()).toBe(2.0);
        });
    });

    describe('getConfiguration', () => {
        test('should return current configuration', () => {
            config.setRate(1.5);
            config.setPitch(1.2);

            const result = config.getConfiguration();

            expect(result).toEqual({
                rate: 1.5,
                pitch: 1.2
            });
        });

        test('should return default configuration initially', () => {
            const result = config.getConfiguration();

            expect(result).toEqual({
                rate: 1.0,
                pitch: 1.0
            });
        });
    });

    describe('reset', () => {
        test('should reset to default values', () => {
            config.setRate(2.0);
            config.setPitch(1.5);

            config.reset();

            expect(config.getRate()).toBe(1.0);
            expect(config.getPitch()).toBe(1.0);
        });
    });

    describe('logging', () => {
        test('should enable logs', () => {
            config.enableLogs();
            expect(config.enableLogging).toBe(true);
        });

        test('should disable logs', () => {
            config.enableLogs();
            config.disableLogs();
            expect(config.enableLogging).toBe(false);
        });
    });

    describe('static range methods', () => {
        test('should return rate range', () => {
            const range = SpeechConfiguration.getRateRange();

            expect(range).toEqual({
                min: 0.1,
                max: 10.0,
                default: 1.0
            });
        });

        test('should return pitch range', () => {
            const range = SpeechConfiguration.getPitchRange();

            expect(range).toEqual({
                min: 0.0,
                max: 2.0,
                default: 1.0
            });
        });
    });

    describe('edge cases', () => {
        test('should handle multiple rate changes', () => {
            config.setRate(0.5);
            config.setRate(2.0);
            config.setRate(1.5);

            expect(config.getRate()).toBe(1.5);
        });

        test('should handle multiple pitch changes', () => {
            config.setPitch(0.8);
            config.setPitch(1.5);
            config.setPitch(1.2);

            expect(config.getPitch()).toBe(1.2);
        });

        test('should maintain independence of rate and pitch', () => {
            config.setRate(2.0);
            config.setPitch(0.5);

            expect(config.getRate()).toBe(2.0);
            expect(config.getPitch()).toBe(0.5);
        });
    });
});
