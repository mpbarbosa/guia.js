import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { SpeechQueueProcessor } from '../../src/speech/SpeechQueueProcessor.js';

describe('SpeechQueueProcessor', () => {
    let processor;
    let mockCallback;

    beforeEach(() => {
        mockCallback = jest.fn();
        processor = new SpeechQueueProcessor(mockCallback);
    });

    afterEach(() => {
        processor?.destroy();
    });

    describe('constructor', () => {
        test('should initialize with default values', () => {
            expect(processor.getInterval()).toBe(100);
            expect(processor.isActive()).toBe(false);
            expect(processor.enableLogging).toBe(false);
        });

        test('should accept custom interval', () => {
            const customProcessor = new SpeechQueueProcessor(mockCallback, 200);
            expect(customProcessor.getInterval()).toBe(200);
            customProcessor.destroy();
        });

        test('should accept logging parameter', () => {
            const logProcessor = new SpeechQueueProcessor(mockCallback, 100, true);
            expect(logProcessor.enableLogging).toBe(true);
            logProcessor.destroy();
        });

        test('should throw TypeError for non-function callback', () => {
            expect(() => new SpeechQueueProcessor('not a function')).toThrow(TypeError);
            expect(() => new SpeechQueueProcessor('not a function')).toThrow('processCallback must be a function');
        });

        test('should throw RangeError for invalid interval', () => {
            expect(() => new SpeechQueueProcessor(mockCallback, 5)).toThrow(RangeError);
            expect(() => new SpeechQueueProcessor(mockCallback, 10000)).toThrow(RangeError);
        });
    });

    describe('start', () => {
        test('should start processing timer', () => {
            processor.start();
            
            expect(processor.isActive()).toBe(true);
        });

        test('should not start duplicate timers', () => {
            processor.start();
            const firstTimer = processor.timer;
            processor.start();
            const secondTimer = processor.timer;
            
            expect(firstTimer).toBe(secondTimer);
        });

        test('should handle callback errors gracefully', (done) => {
            const errorCallback = jest.fn(() => {
                throw new Error('Test error');
            });
            const errorProcessor = new SpeechQueueProcessor(errorCallback, 50);

            errorProcessor.start();
            
            setTimeout(() => {
                // Should not crash despite error
                expect(errorCallback).toHaveBeenCalled();
                errorProcessor.destroy();
                done();
            }, 150);
        });
    });

    describe('stop', () => {
        test('should stop running timer', () => {
            processor.start();
            processor.stop();

            expect(processor.isActive()).toBe(false);
        });

        test('should prevent callbacks after stop', (done) => {
            const testCallback = jest.fn();
            const testProcessor = new SpeechQueueProcessor(testCallback, 50);
            
            testProcessor.start();
            
            setTimeout(() => {
                testProcessor.stop();
                const callCountAtStop = testCallback.mock.calls.length;
                
                setTimeout(() => {
                    expect(testCallback.mock.calls.length).toBe(callCountAtStop);
                    testProcessor.destroy();
                    done();
                }, 150);
            }, 100);
        });

        test('should be safe to call multiple times', () => {
            processor.start();
            processor.stop();
            processor.stop();
            processor.stop();

            expect(processor.isActive()).toBe(false);
        });

        test('should be safe to call without starting', () => {
            expect(() => processor.stop()).not.toThrow();
        });
    });

    describe('restart', () => {
        test('should restart timer with same interval', () => {
            processor.start();
            
            processor.restart();
            
            expect(processor.isActive()).toBe(true);
        });

        test('should restart with new interval', () => {
            processor.start();
            processor.restart(200);
            
            expect(processor.getInterval()).toBe(200);
            expect(processor.isActive()).toBe(true);
        });

        test('should throw RangeError for invalid interval', () => {
            processor.start();
            expect(() => processor.restart(5)).toThrow(RangeError);
            expect(() => processor.restart(10000)).toThrow(RangeError);
        });

        test('should not start if not previously running', () => {
            processor.restart(200);
            expect(processor.isActive()).toBe(false);
            expect(processor.getInterval()).toBe(200);
        });
    });

    describe('interval management', () => {
        test('should get current interval', () => {
            expect(processor.getInterval()).toBe(100);
        });

        test('should set new interval', () => {
            processor.setInterval(250);
            expect(processor.getInterval()).toBe(250);
        });

        test('should throw RangeError for invalid setInterval', () => {
            expect(() => processor.setInterval(5)).toThrow(RangeError);
            expect(() => processor.setInterval(10000)).toThrow(RangeError);
            expect(() => processor.setInterval('100')).toThrow(RangeError);
        });

        test('should not affect running timer until restart', () => {
            processor.start();
            const originalTimer = processor.timer;
            processor.setInterval(200);

            expect(processor.timer).toBe(originalTimer);
            expect(processor.getInterval()).toBe(200);
        });
    });

    describe('state management', () => {
        test('should report inactive state initially', () => {
            expect(processor.isActive()).toBe(false);
        });

        test('should report active state when running', () => {
            processor.start();
            expect(processor.isActive()).toBe(true);
        });

        test('should report inactive state after stop', () => {
            processor.start();
            processor.stop();
            expect(processor.isActive()).toBe(false);
        });
    });

    describe('logging', () => {
        test('should enable logs', () => {
            processor.enableLogs();
            expect(processor.enableLogging).toBe(true);
        });

        test('should disable logs', () => {
            processor.enableLogs();
            processor.disableLogs();
            expect(processor.enableLogging).toBe(false);
        });
    });

    describe('destroy', () => {
        test('should stop timer', () => {
            processor.start();
            processor.destroy();

            expect(processor.isActive()).toBe(false);
        });

        test('should clear callback reference', () => {
            processor.destroy();
            expect(processor.processCallback).toBeNull();
        });

        test('should be safe to call multiple times', () => {
            processor.start();
            processor.destroy();
            expect(() => processor.destroy()).not.toThrow();
        });
    });

    describe('static methods', () => {
        test('should return interval range', () => {
            const range = SpeechQueueProcessor.getIntervalRange();

            expect(range).toEqual({
                min: 10,
                max: 5000,
                default: 100
            });
        });
    });

    describe('edge cases', () => {
        test('should handle rapid start/stop cycles', () => {
            for (let i = 0; i < 10; i++) {
                processor.start();
                processor.stop();
            }

            expect(processor.isActive()).toBe(false);
        });

        test('should handle callback modification', (done) => {
            const testProcessor = new SpeechQueueProcessor(mockCallback, 50);
            testProcessor.start();
            
            const newCallback = jest.fn();
            testProcessor.processCallback = newCallback;

            setTimeout(() => {
                expect(newCallback.mock.calls.length).toBeGreaterThan(0);
                testProcessor.destroy();
                done();
            }, 150);
        });

        test('should maintain state across multiple restarts', () => {
            processor.start();
            processor.restart(150);
            processor.restart(200);
            processor.restart(250);

            expect(processor.getInterval()).toBe(250);
            expect(processor.isActive()).toBe(true);
        });
    });
});
