'use strict';

import timerManager from '../../src/utils/TimerManager.js';

describe('TimerManager', () => {
    afterEach(() => {
        // Clean up all timers after each test
        timerManager.clearAll();
    });
    
    describe('singleton pattern', () => {
        it('should return same instance across imports', async () => {
            const instance1 = timerManager;
            const { default: instance2 } = await import('../../src/utils/TimerManager.js');
            
            expect(instance1).toBe(instance2);
        });
        
        it('should share timer state across instances', async () => {
            timerManager.setInterval(() => {}, 1000, 'shared-timer');
            
            // Re-import should see same timers
            const { default: instance2 } = await import('../../src/utils/TimerManager.js');
            expect(instance2.getActiveCount()).toBe(1);
            expect(instance2.getTimerIds()).toContain('shared-timer');
        });
    });
    
    describe('setInterval', () => {
        it('should create tracked interval timer', (done) => {
            let callCount = 0;
            const callback = () => { callCount++; };
            const timerId = timerManager.setInterval(callback, 50, 'test-interval');
            
            expect(timerId).toBe('test-interval');
            expect(timerManager.getActiveCount()).toBe(1);
            expect(timerManager.getTimerIds()).toContain('test-interval');
            
            setTimeout(() => {
                expect(callCount).toBeGreaterThan(0);
                done();
            }, 120);
        });
        
        it('should replace timer with same ID', () => {
            timerManager.setInterval(() => {}, 1000, 'same-id');
            expect(timerManager.getActiveCount()).toBe(1);
            
            timerManager.setInterval(() => {}, 1000, 'same-id');
            expect(timerManager.getActiveCount()).toBe(1);
        });
        
        it('should handle multiple concurrent intervals', () => {
            timerManager.setInterval(() => {}, 1000, 'timer-1');
            timerManager.setInterval(() => {}, 2000, 'timer-2');
            timerManager.setInterval(() => {}, 500, 'timer-3');
            
            expect(timerManager.getActiveCount()).toBe(3);
            expect(timerManager.getTimerIds()).toEqual(
                expect.arrayContaining(['timer-1', 'timer-2', 'timer-3'])
            );
        });
    });
    
    describe('setTimeout', () => {
        it('should create tracked timeout timer', (done) => {
            let called = false;
            const callback = () => {
                expect(called).toBe(false);
                called = true;
                // Auto-cleanup after execution
                setTimeout(() => {
                    expect(timerManager.getActiveCount()).toBe(0);
                    done();
                }, 10);
            };
            
            const timerId = timerManager.setTimeout(callback, 50, 'test-timeout');
            
            expect(timerId).toBe('test-timeout');
            expect(timerManager.getActiveCount()).toBe(1);
        });
        
        it('should replace timeout with same ID', () => {
            timerManager.setTimeout(() => {}, 1000, 'same-id');
            expect(timerManager.getActiveCount()).toBe(1);
            
            timerManager.setTimeout(() => {}, 2000, 'same-id');
            expect(timerManager.getActiveCount()).toBe(1);
        });
        
        it('should handle multiple concurrent timeouts', () => {
            timerManager.setTimeout(() => {}, 1000, 'timeout-1');
            timerManager.setTimeout(() => {}, 2000, 'timeout-2');
            timerManager.setTimeout(() => {}, 500, 'timeout-3');
            
            expect(timerManager.getActiveCount()).toBe(3);
        });
    });
    
    describe('clearTimer', () => {
        it('should clear specific interval timer', (done) => {
            let called = false;
            const callback = () => { called = true; };
            timerManager.setInterval(callback, 50, 'to-clear');
            
            expect(timerManager.getActiveCount()).toBe(1);
            
            const result = timerManager.clearTimer('to-clear');
            expect(result).toBe(true);
            expect(timerManager.getActiveCount()).toBe(0);
            
            setTimeout(() => {
                expect(called).toBe(false);
                done();
            }, 100);
        });
        
        it('should clear specific timeout timer', () => {
            const callback = () => {};
            timerManager.setTimeout(callback, 1000, 'to-clear');
            
            expect(timerManager.getActiveCount()).toBe(1);
            
            const result = timerManager.clearTimer('to-clear');
            expect(result).toBe(true);
            expect(timerManager.getActiveCount()).toBe(0);
        });
        
        it('should return false for non-existent timer', () => {
            const result = timerManager.clearTimer('non-existent');
            expect(result).toBe(false);
            expect(timerManager.getActiveCount()).toBe(0);
        });
        
        it('should not affect other timers when clearing specific one', () => {
            timerManager.setInterval(() => {}, 1000, 'keep-1');
            timerManager.setInterval(() => {}, 1000, 'clear-this');
            timerManager.setInterval(() => {}, 1000, 'keep-2');
            
            expect(timerManager.getActiveCount()).toBe(3);
            
            timerManager.clearTimer('clear-this');
            expect(timerManager.getActiveCount()).toBe(2);
            expect(timerManager.getTimerIds()).toEqual(
                expect.arrayContaining(['keep-1', 'keep-2'])
            );
            expect(timerManager.getTimerIds()).not.toContain('clear-this');
        });
    });
    
    describe('clearAll', () => {
        it('should clear all interval timers', () => {
            timerManager.setInterval(() => {}, 1000, 'timer-1');
            timerManager.setInterval(() => {}, 2000, 'timer-2');
            
            expect(timerManager.getActiveCount()).toBe(2);
            
            timerManager.clearAll();
            expect(timerManager.getActiveCount()).toBe(0);
        });
        
        it('should clear all timeout timers', () => {
            timerManager.setTimeout(() => {}, 1000, 'timeout-1');
            timerManager.setTimeout(() => {}, 2000, 'timeout-2');
            
            expect(timerManager.getActiveCount()).toBe(2);
            
            timerManager.clearAll();
            expect(timerManager.getActiveCount()).toBe(0);
        });
        
        it('should clear mixed interval and timeout timers', () => {
            timerManager.setInterval(() => {}, 1000, 'interval-1');
            timerManager.setTimeout(() => {}, 2000, 'timeout-1');
            timerManager.setInterval(() => {}, 1500, 'interval-2');
            
            expect(timerManager.getActiveCount()).toBe(3);
            
            timerManager.clearAll();
            expect(timerManager.getActiveCount()).toBe(0);
        });
        
        it('should handle clearAll when no timers exist', () => {
            expect(timerManager.getActiveCount()).toBe(0);
            
            timerManager.clearAll();
            expect(timerManager.getActiveCount()).toBe(0);
        });
    });
    
    describe('getActiveCount', () => {
        it('should return 0 when no timers', () => {
            expect(timerManager.getActiveCount()).toBe(0);
        });
        
        it('should track timer count accurately', () => {
            expect(timerManager.getActiveCount()).toBe(0);
            
            timerManager.setInterval(() => {}, 1000, 'timer-1');
            expect(timerManager.getActiveCount()).toBe(1);
            
            timerManager.setInterval(() => {}, 1000, 'timer-2');
            expect(timerManager.getActiveCount()).toBe(2);
            
            timerManager.setTimeout(() => {}, 1000, 'timer-3');
            expect(timerManager.getActiveCount()).toBe(3);
            
            timerManager.clearTimer('timer-1');
            expect(timerManager.getActiveCount()).toBe(2);
            
            timerManager.clearAll();
            expect(timerManager.getActiveCount()).toBe(0);
        });
        
        it('should auto-decrement after timeout execution', (done) => {
            timerManager.setTimeout(() => {
                // After timeout executes, count should auto-decrement
                setTimeout(() => {
                    expect(timerManager.getActiveCount()).toBe(0);
                    done();
                }, 10);
            }, 50, 'auto-cleanup');
            
            expect(timerManager.getActiveCount()).toBe(1);
        });
    });
    
    describe('getTimerIds', () => {
        it('should return empty array when no timers', () => {
            const ids = timerManager.getTimerIds();
            expect(ids).toEqual([]);
            expect(Array.isArray(ids)).toBe(true);
        });
        
        it('should return all timer IDs', () => {
            timerManager.setInterval(() => {}, 1000, 'interval-1');
            timerManager.setTimeout(() => {}, 2000, 'timeout-1');
            timerManager.setInterval(() => {}, 1500, 'interval-2');
            
            const ids = timerManager.getTimerIds();
            expect(ids).toHaveLength(3);
            expect(ids).toContain('interval-1');
            expect(ids).toContain('timeout-1');
            expect(ids).toContain('interval-2');
        });
        
        it('should update after clearing timers', () => {
            timerManager.setInterval(() => {}, 1000, 'keep');
            timerManager.setInterval(() => {}, 1000, 'remove');
            
            let ids = timerManager.getTimerIds();
            expect(ids).toHaveLength(2);
            
            timerManager.clearTimer('remove');
            ids = timerManager.getTimerIds();
            expect(ids).toHaveLength(1);
            expect(ids).toContain('keep');
            expect(ids).not.toContain('remove');
        });
    });
    
    describe('edge cases', () => {
        it('should handle rapid timer creation and clearing', () => {
            for (let i = 0; i < 100; i++) {
                timerManager.setInterval(() => {}, 1000, `timer-${i}`);
            }
            expect(timerManager.getActiveCount()).toBe(100);
            
            for (let i = 0; i < 50; i++) {
                timerManager.clearTimer(`timer-${i}`);
            }
            expect(timerManager.getActiveCount()).toBe(50);
            
            timerManager.clearAll();
            expect(timerManager.getActiveCount()).toBe(0);
        });
    });
    
    describe('real-world usage patterns', () => {
        it('should handle cleanup pattern for cache expiration', (done) => {
            let cleanupCount = 0;
            const cleanupFn = () => { cleanupCount++; };
            
            // Simulate AddressCache cleanup pattern
            timerManager.setInterval(cleanupFn, 50, 'cache-cleanup');
            
            setTimeout(() => {
                expect(cleanupCount).toBeGreaterThan(0);
                
                // Simulate component destruction
                timerManager.clearTimer('cache-cleanup');
                
                const callCount = cleanupCount;
                setTimeout(() => {
                    // Should not have been called again
                    expect(cleanupCount).toBe(callCount);
                    done();
                }, 100);
            }, 120);
        });
        
        it('should handle chronometer pattern', (done) => {
            let updateCount = 0;
            const updateDisplayFn = () => { updateCount++; };
            
            // Simulate Chronometer start/stop
            const chronometerId = 'chronometer-12345';
            timerManager.setInterval(updateDisplayFn, 50, chronometerId);
            
            setTimeout(() => {
                expect(updateCount).toBeGreaterThan(0);
                
                // Stop chronometer
                timerManager.clearTimer(chronometerId);
                
                const callCount = updateCount;
                setTimeout(() => {
                    // Stopped - should not have more calls
                    expect(updateCount).toBe(callCount);
                    done();
                }, 100);
            }, 120);
        });
        
        it('should handle speech queue timeout pattern', (done) => {
            const timeoutFn = () => {
                // Auto-cleaned after execution
                setTimeout(() => {
                    expect(timerManager.getActiveCount()).toBe(0);
                    done();
                }, 10);
            };
            
            // Simulate SpeechQueue item expiration
            timerManager.setTimeout(timeoutFn, 50, 'speech-item-1');
            
            expect(timerManager.getActiveCount()).toBe(1);
        });
    });
});
