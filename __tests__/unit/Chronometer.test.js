/**
 * @jest-environment node
 */

/**
 * Unit tests for Chronometer class - Phase 5 Class Extraction Initiative
 * 
 * This test suite validates the timing functionality, observer pattern integration,
 * and DOM interaction capabilities of the extracted Chronometer class. The tests
 * ensure the class maintains compatibility with PositionManager observer pattern
 * while providing accurate time tracking and display formatting.
 * 
 * @author Marcelo Pereira Barbosa
 * @since Phase 5 - Chronometer Extraction
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import Chronometer from '../../src/timing/Chronometer.js';
import PositionManager from '../../src/core/PositionManager.js';

describe('Chronometer', () => {
    let chronometer;
    let mockElement;

    beforeEach(() => {
        // Create mock DOM element
        mockElement = {
            textContent: '',
            id: 'test-chronometer'
        };
        
        // Create chronometer instance
        chronometer = new Chronometer(mockElement);
        
        // Clear all timers
        jest.clearAllTimers();
        jest.useFakeTimers();
    });

    afterEach(() => {
        // Clean up chronometer resources (prevent timer leaks)
        if (chronometer) {
            chronometer.destroy();
            chronometer = null;
        }
        
        // Clean up jest timers
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    describe('Constructor', () => {
        test('should initialize with correct default state', () => {
            expect(chronometer.element).toBe(mockElement);
            expect(chronometer.startTime).toBeNull();
            expect(chronometer.isRunning).toBe(false);
            expect(chronometer.intervalId).toBeNull();
        });

        // Test removed: Constructor doesn't log initialization message
        // The Chronometer is initialized silently to avoid console noise

        test('should handle null element gracefully', () => {
            expect(() => new Chronometer(null)).not.toThrow();
            const nullChronometer = new Chronometer(null);
            expect(nullChronometer.element).toBeNull();
        });
    });

    describe('Start functionality', () => {
        test('should start chronometer from stopped state', () => {
            const startTime = Date.now();
            jest.spyOn(Date, 'now').mockReturnValue(startTime);

            chronometer.start();

            expect(chronometer.isRunning).toBe(true);
            expect(chronometer.startTime).toBe(startTime);
            expect(chronometer.intervalId).not.toBeNull();
        });

        test('should update display immediately on start', () => {
            chronometer.start();
            expect(mockElement.textContent).toBe('00:00:00');
        });

        test('should set up interval for display updates', () => {
            chronometer.start();
            
            // Fast-forward 1 second
            jest.advanceTimersByTime(1000);
            
            expect(mockElement.textContent).toBe('00:00:01');
        });

        test('should not restart if already running', () => {
            const startTime1 = 1000;
            const startTime2 = 2000;
            
            jest.spyOn(Date, 'now').mockReturnValueOnce(startTime1);
            chronometer.start();
            const originalIntervalId = chronometer.intervalId;

            jest.spyOn(Date, 'now').mockReturnValueOnce(startTime2);
            chronometer.start();

            expect(chronometer.startTime).toBe(startTime1);
            expect(chronometer.intervalId).toBe(originalIntervalId);
        });

        test('should handle missing element gracefully during start', () => {
            const nullChronometer = new Chronometer(null);
            expect(() => nullChronometer.start()).not.toThrow();
            expect(nullChronometer.isRunning).toBe(true);
        });
    });

    describe('Stop functionality', () => {
        test('should stop running chronometer', () => {
            chronometer.start();
            chronometer.stop();

            expect(chronometer.isRunning).toBe(false);
            expect(chronometer.intervalId).toBeNull();
        });

        test('should not throw if stopping already stopped chronometer', () => {
            expect(() => chronometer.stop()).not.toThrow();
            expect(chronometer.isRunning).toBe(false);
        });

        test('should clear interval when stopping', () => {
            chronometer.start();
            const intervalId = chronometer.intervalId;

            chronometer.stop();

            // TimerManager now returns string IDs
            expect(intervalId).toBe('chronometer-display');
            expect(chronometer.intervalId).toBeNull();
        });

        test('should preserve start time when stopped', () => {
            const startTime = 1000;
            jest.spyOn(Date, 'now').mockReturnValue(startTime);
            
            chronometer.start();
            chronometer.stop();

            expect(chronometer.startTime).toBe(startTime);
        });
    });

    describe('Reset functionality', () => {
        test('should reset chronometer to initial state', () => {
            chronometer.start();
            jest.advanceTimersByTime(5000);
            
            chronometer.reset();

            expect(chronometer.isRunning).toBe(false);
            expect(chronometer.startTime).toBeNull();
            expect(chronometer.intervalId).toBeNull();
            expect(mockElement.textContent).toBe('00:00:00');
        });

        test('should handle reset with null element', () => {
            const nullChronometer = new Chronometer(null);
            nullChronometer.start();
            
            expect(() => nullChronometer.reset()).not.toThrow();
            expect(nullChronometer.startTime).toBeNull();
        });

        test('should reset from any state', () => {
            // Test reset from stopped state
            chronometer.reset();
            expect(mockElement.textContent).toBe('00:00:00');

            // Test reset from running state
            chronometer.start();
            chronometer.reset();
            expect(chronometer.isRunning).toBe(false);
        });
    });

    describe('Elapsed time calculation', () => {
        test('should return 0 when never started', () => {
            expect(chronometer.getElapsedTime()).toBe(0);
        });

        test('should calculate elapsed time correctly', () => {
            jest.useRealTimers(); // Use real timers for this test
            
            const startTime = Date.now();
            chronometer.start();
            
            // Simulate a small delay
            const elapsed = chronometer.getElapsedTime();
            
            expect(elapsed).toBeGreaterThanOrEqual(0);
            expect(elapsed).toBeLessThan(100); // Should be less than 100ms for this test
            
            jest.useFakeTimers(); // Return to fake timers
        });

        test('should continue calculating elapsed time when stopped', () => {
            jest.useRealTimers(); // Use real timers for this test
            
            const startTime = Date.now();
            chronometer.start();
            
            // Stop after minimal time
            chronometer.stop();
            
            const elapsed = chronometer.getElapsedTime();
            expect(elapsed).toBeGreaterThanOrEqual(0);
            expect(typeof elapsed).toBe('number');
            
            jest.useFakeTimers(); // Return to fake timers
        });
    });

    describe('Time formatting', () => {
        test('should format zero time correctly', () => {
            expect(chronometer.formatTime(0)).toBe('00:00:00');
        });

        test('should format seconds correctly', () => {
            expect(chronometer.formatTime(5000)).toBe('00:00:05');
            expect(chronometer.formatTime(59000)).toBe('00:00:59');
        });

        test('should format minutes correctly', () => {
            expect(chronometer.formatTime(60000)).toBe('00:01:00');
            expect(chronometer.formatTime(125000)).toBe('00:02:05');
            expect(chronometer.formatTime(3599000)).toBe('00:59:59');
        });

        test('should format hours correctly', () => {
            expect(chronometer.formatTime(3600000)).toBe('01:00:00');
            expect(chronometer.formatTime(3661000)).toBe('01:01:01');
            expect(chronometer.formatTime(7323000)).toBe('02:02:03');
        });

        test('should handle large time values', () => {
            expect(chronometer.formatTime(86400000)).toBe('24:00:00'); // 24 hours
            expect(chronometer.formatTime(359999000)).toBe('99:59:59'); // 99+ hours
        });

        test('should handle millisecond precision', () => {
            expect(chronometer.formatTime(1500)).toBe('00:00:01'); // 1.5 seconds rounds down
            expect(chronometer.formatTime(999)).toBe('00:00:00'); // Less than 1 second
        });
    });

    describe('Display updates', () => {
        test('should update display with current elapsed time', () => {
            chronometer.start();
            chronometer.updateDisplay();

            // Should display time in HH:MM:SS format
            expect(mockElement.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        });

        test('should handle display update with null element', () => {
            const nullChronometer = new Chronometer(null);
            expect(() => nullChronometer.updateDisplay()).not.toThrow();
        });

        test('should update display automatically while running', () => {
            const startTime = 1000;
            jest.spyOn(Date, 'now').mockReturnValue(startTime);
            
            chronometer.start();
            
            // Simulate time progression
            jest.spyOn(Date, 'now').mockReturnValue(startTime + 1000);
            jest.advanceTimersByTime(1000);
            
            expect(mockElement.textContent).toBe('00:00:01');
            
            jest.spyOn(Date, 'now').mockReturnValue(startTime + 2000);
            jest.advanceTimersByTime(1000);
            
            expect(mockElement.textContent).toBe('00:00:02');
        });
    });

    describe('Event configuration injection', () => {
        test('should use default event configuration when none provided', () => {
            const chronometer = new Chronometer(null);
            
            expect(chronometer.eventConfig.positionUpdate).toBe('PositionManager updated');
            expect(chronometer.eventConfig.immediateAddressUpdate).toBe('Immediate address update');
            expect(chronometer.eventConfig.positionNotUpdate).toBe('PositionManager not updated');
        });

        test('should use custom event configuration when provided', () => {
            const customConfig = {
                positionUpdate: 'location.updated',
                immediateAddressUpdate: 'address.immediate',
                positionNotUpdate: 'location.rejected'
            };
            const chronometer = new Chronometer(null, customConfig);
            
            expect(chronometer.eventConfig.positionUpdate).toBe('location.updated');
            expect(chronometer.eventConfig.immediateAddressUpdate).toBe('address.immediate');
            expect(chronometer.eventConfig.positionNotUpdate).toBe('location.rejected');
        });

        test('should use partial custom configuration with defaults for missing values', () => {
            const partialConfig = {
                positionUpdate: 'custom.position.update'
            };
            const chronometer = new Chronometer(null, partialConfig);
            
            expect(chronometer.eventConfig.positionUpdate).toBe('custom.position.update');
            expect(chronometer.eventConfig.immediateAddressUpdate).toBe('Immediate address update');
            expect(chronometer.eventConfig.positionNotUpdate).toBe('PositionManager not updated');
        });

        test('should respond to custom event names in update method', () => {
            const customConfig = {
                positionUpdate: 'custom.update',
                positionNotUpdate: 'custom.no.update'
            };
            const chronometer = new Chronometer(null, customConfig);
            const resetSpy = jest.spyOn(chronometer, 'reset');
            const startSpy = jest.spyOn(chronometer, 'start');
            const mockPositionManager = PositionManager.getInstance();

            // Should respond to custom event name  
            chronometer.update(mockPositionManager, 'custom.update', false, null);
            expect(resetSpy).toHaveBeenCalled();
            expect(startSpy).toHaveBeenCalled();

            // Should NOT respond to default event name
            resetSpy.mockClear();
            startSpy.mockClear();
            chronometer.update(mockPositionManager, 'PositionManager updated', false, null);
            expect(resetSpy).not.toHaveBeenCalled();
        });
    });

    describe('Observer pattern integration', () => {
        let mockPositionManager;

        beforeEach(() => {
            mockPositionManager = PositionManager.getInstance();
        });

        test('should restart on successful position update', () => {
            const resetSpy = jest.spyOn(chronometer, 'reset');
            const startSpy = jest.spyOn(chronometer, 'start');

            chronometer.update(mockPositionManager, 'PositionManager updated', false, null);

            expect(resetSpy).toHaveBeenCalled();
            expect(startSpy).toHaveBeenCalled();
        });

        test('should restart on immediate address update', () => {
            const resetSpy = jest.spyOn(chronometer, 'reset');
            const startSpy = jest.spyOn(chronometer, 'start');

            chronometer.update(mockPositionManager, 'Immediate address update', false, null);

            expect(resetSpy).toHaveBeenCalled();
            expect(startSpy).toHaveBeenCalled();
        });

        test('should start if not running on position not update', () => {
            const startSpy = jest.spyOn(chronometer, 'start');

            chronometer.update(mockPositionManager, 'PositionManager not updated', false, null);

            expect(startSpy).toHaveBeenCalled();
        });

        test('should not restart if already running on position not update', () => {
            chronometer.start();
            const startSpy = jest.spyOn(chronometer, 'start');

            chronometer.update(mockPositionManager, 'PositionManager not updated', false, null);

            expect(startSpy).toHaveBeenCalledTimes(0);
        });

        test('should ignore error states and keep running', () => {
            chronometer.start();
            const error = { message: 'Test error' };

            chronometer.update(mockPositionManager, 'ANY_EVENT', false, error);

            // Chronometer should continue running despite position errors
            expect(chronometer.isRunning).toBe(true);
            // Display should still show time, not "Error"
            expect(mockElement.textContent).not.toBe('Error');
        });

        test('should ignore loading states and keep running', () => {
            chronometer.start();
            chronometer.update(mockPositionManager, 'ANY_EVENT', true, null);

            // Chronometer should continue running during position loading
            expect(chronometer.isRunning).toBe(true);
            // Display should still show time, not "Loading..."
            expect(mockElement.textContent).not.toBe('Loading...');
        });

        test('should handle null position manager', () => {
            expect(() => chronometer.update(null, 'POSITION_UPDATE', false, null)).not.toThrow();
        });

        test('should ignore loading with null element', () => {
            const nullChronometer = new Chronometer(null);
            nullChronometer.start();
            expect(() => nullChronometer.update(mockPositionManager, 'ANY_EVENT', true, null)).not.toThrow();
            // Should still be running despite loading state
            expect(nullChronometer.isRunning).toBe(true);
        });

        test('should ignore error with null element', () => {
            const nullChronometer = new Chronometer(null);
            nullChronometer.start();
            const error = { message: 'Test error' };
            expect(() => nullChronometer.update(mockPositionManager, 'ANY_EVENT', false, error)).not.toThrow();
            // Should still be running despite error state
            expect(nullChronometer.isRunning).toBe(true);
        });
    });

    describe('toString method', () => {
        test('should return correct string when stopped', () => {
            const result = chronometer.toString();
            expect(result).toBe('Chronometer: stopped, elapsed: 00:00:00');
        });

        test('should return correct string when running', () => {
            chronometer.start();
            const result = chronometer.toString();
            
            expect(result).toMatch(/^Chronometer: running, elapsed: \d{2}:\d{2}:\d{2}$/);
        });

        test('should update string representation as time progresses', () => {
            chronometer.start();
            const result = chronometer.toString();
            
            expect(result).toMatch(/^Chronometer: running, elapsed: \d{2}:\d{2}:\d{2}$/);
        });
    });

    describe('Integration with PositionManager', () => {
        test('should be compatible with PositionManager observer pattern', () => {
            // Verify chronometer has required update method
            expect(typeof chronometer.update).toBe('function');
            expect(chronometer.update.length).toBe(4); // positionManager, posEvent, loading, error
        });

        test('should handle real PositionManager event constants', () => {
            // This test verifies compatibility with actual PositionManager constants
            const positionManager = PositionManager.getInstance();
            
            expect(() => {
                chronometer.update(positionManager, 'PositionManager updated', false, null);
                chronometer.update(positionManager, 'Immediate address update', false, null);
                chronometer.update(positionManager, 'PositionManager not updated', false, null);
            }).not.toThrow();
        });
    });

    describe('Memory management', () => {
        test('should clear interval on destruction', () => {
            chronometer.start();
            const intervalId = chronometer.intervalId;
            
            chronometer.stop();

            // TimerManager now returns string IDs
            expect(intervalId).toBe('chronometer-display');
            expect(chronometer.intervalId).toBeNull();
        });

        test('should not leave hanging intervals after reset', () => {
            chronometer.start();
            const intervalId = chronometer.intervalId;
            
            chronometer.reset();

            // TimerManager now returns string IDs
            expect(intervalId).toBe('chronometer-display');
            expect(chronometer.intervalId).toBeNull();
        });
    });

    describe('Edge cases', () => {
        test('should handle rapid start/stop cycles', () => {
            for (let i = 0; i < 10; i++) {
                chronometer.start();
                chronometer.stop();
            }
            
            expect(chronometer.isRunning).toBe(false);
            expect(chronometer.intervalId).toBeNull();
        });

        test('should handle multiple resets', () => {
            chronometer.start();
            chronometer.reset();
            chronometer.reset();
            chronometer.reset();

            expect(chronometer.startTime).toBeNull();
            expect(mockElement.textContent).toBe('00:00:00');
        });

        test('should handle time formatting edge cases', () => {
            // Test boundary values - negative time results in negative numbers
            expect(chronometer.formatTime(-1)).toMatch(/^-?\d+:-?\d+:-?\d+$/); // Negative time (behavior varies)
            expect(chronometer.formatTime(0.5)).toBe('00:00:00'); // Fractional time
            expect(chronometer.formatTime(Number.MAX_SAFE_INTEGER)).toMatch(/^\d{2,}:\d{2}:\d{2}$/); // Very large time
        });

        test('should handle concurrent timer operations', () => {
            chronometer.start();
            
            // Simulate rapid operations
            chronometer.updateDisplay();
            chronometer.stop();
            chronometer.start();
            chronometer.updateDisplay();
            chronometer.reset();

            expect(chronometer.isRunning).toBe(false);
            expect(mockElement.textContent).toBe('00:00:00');
        });
    });
});