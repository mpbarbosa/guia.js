/**
 * @fileoverview Unit tests for SpeechController
 * @jest-environment node
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { SpeechController } from '../../src/speech/SpeechController.js';

// Mock SpeechSynthesisUtterance for Node environment
global.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
    constructor(text) {
        this.text = text;
        this.voice = null;
        this.rate = 1.0;
        this.pitch = 1.0;
        this.onstart = null;
        this.onend = null;
        this.onerror = null;
        this.onboundary = null;
    }
};

describe('SpeechController', () => {
    let mockSynth;
    let controller;

    beforeEach(() => {
        // Create mock speechSynthesis interface
        mockSynth = {
            speak: jest.fn(),
            cancel: jest.fn(),
            pause: jest.fn(),
            resume: jest.fn(),
            speaking: false,
            paused: false,
            pending: false,
            getVoices: jest.fn(() => [])
        };

        controller = new SpeechController(mockSynth, false);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        test('should create instance with valid synth', () => {
            expect(controller).toBeInstanceOf(SpeechController);
            expect(controller.synth).toBe(mockSynth);
            expect(controller.enableLogging).toBe(false);
            expect(controller.currentUtterance).toBeNull();
        });

        test('should enable logging when specified', () => {
            const logController = new SpeechController(mockSynth, true);
            expect(logController.enableLogging).toBe(true);
        });

        test('should throw error if synth is not provided', () => {
            expect(() => new SpeechController(null)).toThrow(TypeError);
            expect(() => new SpeechController(undefined)).toThrow(TypeError);
        });
    });

    describe('speak()', () => {
        test('should speak text with valid configuration', () => {
            const config = { voice: null, rate: 1.0, pitch: 1.0 };
            const result = controller.speak('Hello world', config);

            expect(result).toBe(true);
            expect(mockSynth.speak).toHaveBeenCalledTimes(1);
            expect(controller.currentUtterance).not.toBeNull();
        });

        test('should configure utterance with voice, rate, and pitch', () => {
            const mockVoice = { name: 'Test Voice', lang: 'pt-BR' };
            const config = { voice: mockVoice, rate: 1.5, pitch: 1.2 };
            
            controller.speak('Test', config);
            
            const utterance = mockSynth.speak.mock.calls[0][0];
            expect(utterance.voice).toBe(mockVoice);
            expect(utterance.rate).toBe(1.5);
            expect(utterance.pitch).toBe(1.2);
        });

        test('should attach onEnd callback', () => {
            const config = { voice: null, rate: 1.0, pitch: 1.0 };
            const onEndMock = jest.fn();
            
            controller.speak('Test', config, { onEnd: onEndMock });
            
            const utterance = mockSynth.speak.mock.calls[0][0];
            utterance.onend();
            
            expect(onEndMock).toHaveBeenCalledTimes(1);
            expect(controller.currentUtterance).toBeNull();
        });

        test('should attach onError callback', () => {
            const config = { voice: null, rate: 1.0, pitch: 1.0 };
            const onErrorMock = jest.fn();
            
            controller.speak('Test', config, { onError: onErrorMock });
            
            const utterance = mockSynth.speak.mock.calls[0][0];
            const errorEvent = { error: 'test-error' };
            utterance.onerror(errorEvent);
            
            expect(onErrorMock).toHaveBeenCalledWith(errorEvent);
            expect(controller.currentUtterance).toBeNull();
        });

        test('should attach onStart callback', () => {
            const config = { voice: null, rate: 1.0, pitch: 1.0 };
            const onStartMock = jest.fn();
            
            controller.speak('Test', config, { onStart: onStartMock });
            
            const utterance = mockSynth.speak.mock.calls[0][0];
            utterance.onstart();
            
            expect(onStartMock).toHaveBeenCalledTimes(1);
        });

        test('should attach onBoundary callback', () => {
            const config = { voice: null, rate: 1.0, pitch: 1.0 };
            const onBoundaryMock = jest.fn();
            
            controller.speak('Test', config, { onBoundary: onBoundaryMock });
            
            const utterance = mockSynth.speak.mock.calls[0][0];
            const boundaryEvent = { charIndex: 5 };
            utterance.onboundary(boundaryEvent);
            
            expect(onBoundaryMock).toHaveBeenCalledWith(boundaryEvent);
        });

        test('should throw error for non-string text', () => {
            const config = { voice: null, rate: 1.0, pitch: 1.0 };
            expect(() => controller.speak(123, config)).toThrow(TypeError);
            expect(() => controller.speak(null, config)).toThrow(TypeError);
        });

        test('should return false for empty text', () => {
            const config = { voice: null, rate: 1.0, pitch: 1.0 };
            expect(controller.speak('', config)).toBe(false);
            expect(controller.speak('   ', config)).toBe(false);
        });

        test('should throw error for invalid config', () => {
            expect(() => controller.speak('Test', null)).toThrow(TypeError);
            expect(() => controller.speak('Test', undefined)).toThrow(TypeError);
        });

        test('should handle synth.speak() errors gracefully', () => {
            mockSynth.speak.mockImplementation(() => {
                throw new Error('Speech synthesis error');
            });
            
            const config = { voice: null, rate: 1.0, pitch: 1.0 };
            const onErrorMock = jest.fn();
            const result = controller.speak('Test', config, { onError: onErrorMock });
            
            expect(result).toBe(false);
            expect(controller.currentUtterance).toBeNull();
            expect(onErrorMock).toHaveBeenCalled();
        });

        test('should clear currentUtterance on default onend', () => {
            const config = { voice: null, rate: 1.0, pitch: 1.0 };
            controller.speak('Test', config);
            
            const utterance = mockSynth.speak.mock.calls[0][0];
            utterance.onend();
            
            expect(controller.currentUtterance).toBeNull();
        });

        test('should clear currentUtterance on default onerror', () => {
            const config = { voice: null, rate: 1.0, pitch: 1.0 };
            controller.speak('Test', config);
            
            const utterance = mockSynth.speak.mock.calls[0][0];
            utterance.onerror({ error: 'test' });
            
            expect(controller.currentUtterance).toBeNull();
        });
    });

    describe('pause()', () => {
        test('should pause speaking utterance', () => {
            mockSynth.speaking = true;
            mockSynth.paused = false;
            
            const result = controller.pause();
            
            expect(result).toBe(true);
            expect(mockSynth.pause).toHaveBeenCalledTimes(1);
        });

        test('should return false if not speaking', () => {
            mockSynth.speaking = false;
            
            const result = controller.pause();
            
            expect(result).toBe(false);
            expect(mockSynth.pause).not.toHaveBeenCalled();
        });

        test('should return false if already paused', () => {
            mockSynth.speaking = true;
            mockSynth.paused = true;
            
            const result = controller.pause();
            
            expect(result).toBe(false);
            expect(mockSynth.pause).not.toHaveBeenCalled();
        });

        test('should handle pause errors gracefully', () => {
            mockSynth.speaking = true;
            mockSynth.paused = false;
            mockSynth.pause.mockImplementation(() => {
                throw new Error('Pause failed');
            });
            
            const result = controller.pause();
            
            expect(result).toBe(false);
        });
    });

    describe('resume()', () => {
        test('should resume paused speech', () => {
            mockSynth.paused = true;
            
            const result = controller.resume();
            
            expect(result).toBe(true);
            expect(mockSynth.resume).toHaveBeenCalledTimes(1);
        });

        test('should return false if not paused', () => {
            mockSynth.paused = false;
            
            const result = controller.resume();
            
            expect(result).toBe(false);
            expect(mockSynth.resume).not.toHaveBeenCalled();
        });

        test('should handle resume errors gracefully', () => {
            mockSynth.paused = true;
            mockSynth.resume.mockImplementation(() => {
                throw new Error('Resume failed');
            });
            
            const result = controller.resume();
            
            expect(result).toBe(false);
        });
    });

    describe('stop()', () => {
        test('should stop speaking utterance', () => {
            mockSynth.speaking = true;
            mockSynth.pending = false;
            
            const result = controller.stop();
            
            expect(result).toBe(true);
            expect(mockSynth.cancel).toHaveBeenCalledTimes(1);
            expect(controller.currentUtterance).toBeNull();
        });

        test('should stop pending utterances', () => {
            mockSynth.speaking = false;
            mockSynth.pending = true;
            
            const result = controller.stop();
            
            expect(result).toBe(true);
            expect(mockSynth.cancel).toHaveBeenCalledTimes(1);
        });

        test('should return false if nothing to stop', () => {
            mockSynth.speaking = false;
            mockSynth.pending = false;
            
            const result = controller.stop();
            
            expect(result).toBe(false);
            expect(mockSynth.cancel).not.toHaveBeenCalled();
        });

        test('should handle stop errors gracefully', () => {
            mockSynth.speaking = true;
            mockSynth.cancel.mockImplementation(() => {
                throw new Error('Stop failed');
            });
            
            const result = controller.stop();
            
            expect(result).toBe(false);
        });
    });

    describe('isSpeaking()', () => {
        test('should return true when speaking', () => {
            mockSynth.speaking = true;
            expect(controller.isSpeaking()).toBe(true);
        });

        test('should return false when not speaking', () => {
            mockSynth.speaking = false;
            expect(controller.isSpeaking()).toBe(false);
        });
    });

    describe('isPaused()', () => {
        test('should return true when paused', () => {
            mockSynth.paused = true;
            expect(controller.isPaused()).toBe(true);
        });

        test('should return false when not paused', () => {
            mockSynth.paused = false;
            expect(controller.isPaused()).toBe(false);
        });
    });

    describe('getCurrentUtterance()', () => {
        test('should return null initially', () => {
            expect(controller.getCurrentUtterance()).toBeNull();
        });

        test('should return current utterance when speaking', () => {
            const config = { voice: null, rate: 1.0, pitch: 1.0 };
            controller.speak('Test', config);
            
            expect(controller.getCurrentUtterance()).not.toBeNull();
        });
    });

    describe('enableLogs() / disableLogs()', () => {
        test('should enable logging', () => {
            controller.disableLogs();
            expect(controller.enableLogging).toBe(false);
            
            controller.enableLogs();
            expect(controller.enableLogging).toBe(true);
        });

        test('should disable logging', () => {
            controller.enableLogs();
            expect(controller.enableLogging).toBe(true);
            
            controller.disableLogs();
            expect(controller.enableLogging).toBe(false);
        });
    });

    describe('destroy()', () => {
        test('should stop speech and clear state', () => {
            mockSynth.speaking = true;
            controller.currentUtterance = { text: 'test' };
            
            controller.destroy();
            
            expect(mockSynth.cancel).toHaveBeenCalledTimes(1);
            expect(controller.currentUtterance).toBeNull();
        });

        test('should handle destroy when not speaking', () => {
            mockSynth.speaking = false;
            
            expect(() => controller.destroy()).not.toThrow();
        });
    });

    describe('Logging', () => {
        let consoleSpy;

        beforeEach(() => {
            consoleSpy = {
                log: jest.spyOn(console, 'log').mockImplementation(),
                warn: jest.spyOn(console, 'warn').mockImplementation()
            };
        });

        afterEach(() => {
            consoleSpy.log.mockRestore();
            consoleSpy.warn.mockRestore();
        });

        test('should not log when logging disabled', () => {
            controller.disableLogs();
            const config = { voice: null, rate: 1.0, pitch: 1.0 };
            
            controller.speak('Test', config);
            
            expect(consoleSpy.log).not.toHaveBeenCalled();
        });

        test('should log when logging enabled', () => {
            controller.enableLogs();
            const config = { voice: null, rate: 1.0, pitch: 1.0 };
            
            controller.speak('Test', config);
            
            expect(consoleSpy.log).toHaveBeenCalled();
        });

        test('should log warnings on errors', () => {
            controller.enableLogs();
            mockSynth.speak.mockImplementation(() => {
                throw new Error('Test error');
            });
            
            const config = { voice: null, rate: 1.0, pitch: 1.0 };
            controller.speak('Test', config);
            
            expect(consoleSpy.warn).toHaveBeenCalled();
        });
    });
});
