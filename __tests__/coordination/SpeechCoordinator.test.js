/**
 * @file SpeechCoordinator Basic Tests
 * @description Unit tests for SpeechCoordinator class (constructor and getters only)
 * @since 0.8.6-alpha
 * 
 * **Note**: Full speech synthesis initialization tests require E2E environment
 * due to Web Speech API async voice loading. See docs/testing/SPEECHCOORDINATOR_TEST_NOTES.md
 * 
 * **Test Coverage**:
 * - Constructor validation (6 tests)
 * - Getter methods (5 tests)
 * - String representation (3 tests)
 * - Basic destroy behavior (2 tests)
 * 
 * **Coverage**: ~60% of SpeechCoordinator.js (core behavior without speech API)
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import SpeechCoordinator from '../../src/coordination/SpeechCoordinator.js';

/**
 * Creates mock dependencies for SpeechCoordinator
 * @returns {Object} Mock document, reverseGeocoder, observerSubject, elementIds
 */
function createMocks() {
    return {
        document: {
            getElementById: jest.fn(() => null)
        },
        reverseGeocoder: {
            subscribe: jest.fn(),
            unsubscribe: jest.fn()
        },
        observerSubject: {
            subscribe: jest.fn(),
            unsubscribe: jest.fn()
        },
        elementIds: {
            languageSelectId: 'languageSelect',
            voiceSelectId: 'voiceSelect',
            textInputId: 'textInput',
            speakBtnId: 'speakBtn',
            pauseBtnId: 'pauseBtn',
            resumeBtnId: 'resumeBtn',
            stopBtnId: 'stopBtn',
            rateInputId: 'rateInput',
            rateValueId: 'rateValue',
            pitchInputId: 'pitchInput',
            pitchValueId: 'pitchValue'
        }
    };
}

describe('SpeechCoordinator', () => {
    let mocks;
    let coordinator;
    
    beforeEach(() => {
        mocks = createMocks();
        jest.clearAllMocks();
    });
    
    afterEach(() => {
        if (coordinator && typeof coordinator.destroy === 'function') {
            coordinator.destroy();
        }
        coordinator = null;
    });
    
    describe('Constructor Validation', () => {
        test('should create instance with valid parameters', () => {
            // Act
            coordinator = new SpeechCoordinator(
                mocks.document,
                mocks.elementIds,
                mocks.reverseGeocoder,
                mocks.observerSubject
            );
            
            // Assert
            expect(coordinator).toBeDefined();
            expect(coordinator).toBeInstanceOf(SpeechCoordinator);
        });
        
        test('should throw TypeError when document is missing', () => {
            // Act & Assert
            expect(() => {
                new SpeechCoordinator(
                    null,
                    mocks.elementIds,
                    mocks.reverseGeocoder,
                    mocks.observerSubject
                );
            }).toThrow(TypeError);
            expect(() => {
                new SpeechCoordinator(
                    null,
                    mocks.elementIds,
                    mocks.reverseGeocoder,
                    mocks.observerSubject
                );
            }).toThrow('document is required');
        });
        
        test('should throw TypeError when elementIds is missing', () => {
            // Act & Assert
            expect(() => {
                new SpeechCoordinator(
                    mocks.document,
                    null,
                    mocks.reverseGeocoder,
                    mocks.observerSubject
                );
            }).toThrow(TypeError);
            expect(() => {
                new SpeechCoordinator(
                    mocks.document,
                    null,
                    mocks.reverseGeocoder,
                    mocks.observerSubject
                );
            }).toThrow('elementIds is required');
        });
        
        test('should throw TypeError when reverseGeocoder is missing', () => {
            // Act & Assert
            expect(() => {
                new SpeechCoordinator(
                    mocks.document,
                    mocks.elementIds,
                    null,
                    mocks.observerSubject
                );
            }).toThrow(TypeError);
            expect(() => {
                new SpeechCoordinator(
                    mocks.document,
                    mocks.elementIds,
                    null,
                    mocks.observerSubject
                );
            }).toThrow('reverseGeocoder is required');
        });
        
        test('should throw TypeError when observerSubject is missing', () => {
            // Act & Assert
            expect(() => {
                new SpeechCoordinator(
                    mocks.document,
                    mocks.elementIds,
                    mocks.reverseGeocoder,
                    null
                );
            }).toThrow(TypeError);
            expect(() => {
                new SpeechCoordinator(
                    mocks.document,
                    mocks.elementIds,
                    mocks.reverseGeocoder,
                    null
                );
            }).toThrow('observerSubject is required');
        });
        
        test('should initialize with not initialized state', () => {
            // Act
            coordinator = new SpeechCoordinator(
                mocks.document,
                mocks.elementIds,
                mocks.reverseGeocoder,
                mocks.observerSubject
            );
            
            // Assert
            expect(coordinator.isInitialized()).toBe(false);
            expect(coordinator.getSpeechDisplayer()).toBeNull();
        });
    });
    
    describe('Getter Methods', () => {
        beforeEach(() => {
            coordinator = new SpeechCoordinator(
                mocks.document,
                mocks.elementIds,
                mocks.reverseGeocoder,
                mocks.observerSubject
            );
        });
        
        test('should return elementIds via getter', () => {
            // Act
            const ids = coordinator.elementIds;
            
            // Assert
            expect(ids).toBe(mocks.elementIds);
            expect(ids.languageSelectId).toBe('languageSelect');
        });
        
        test('should return null for speech displayer before initialization', () => {
            // Act
            const displayer = coordinator.getSpeechDisplayer();
            
            // Assert
            expect(displayer).toBeNull();
        });
        
        test('should return false for isInitialized before initialization', () => {
            // Act
            const initialized = coordinator.isInitialized();
            
            // Assert
            expect(initialized).toBe(false);
        });
    });
    
    describe('String Representation', () => {
        beforeEach(() => {
            coordinator = new SpeechCoordinator(
                mocks.document,
                mocks.elementIds,
                mocks.reverseGeocoder,
                mocks.observerSubject
            );
        });
        
        test('should return "not initialized" string before initialization', () => {
            // Act
            const str = coordinator.toString();
            
            // Assert
            expect(str).toContain('SpeechCoordinator');
            expect(str).toContain('not initialized');
        });
        
        test('should include class name in string representation', () => {
            // Act
            const str = coordinator.toString();
            
            // Assert
            expect(str).toMatch(/^SpeechCoordinator:/);
        });
    });
    
    describe('Basic Destroy Behavior', () => {
        beforeEach(() => {
            coordinator = new SpeechCoordinator(
                mocks.document,
                mocks.elementIds,
                mocks.reverseGeocoder,
                mocks.observerSubject
            );
        });
        
        test('should handle destroy when not initialized', () => {
            // Act - should not throw
            expect(() => {
                coordinator.destroy();
            }).not.toThrow();
            
            // Assert
            expect(mocks.reverseGeocoder.unsubscribe).not.toHaveBeenCalled();
            expect(mocks.observerSubject.unsubscribe).not.toHaveBeenCalled();
        });
        
        test('should remain not initialized after destroy when never initialized', () => {
            // Act
            coordinator.destroy();
            
            // Assert
            expect(coordinator.isInitialized()).toBe(false);
            expect(coordinator.getSpeechDisplayer()).toBeNull();
        });
    });
});
