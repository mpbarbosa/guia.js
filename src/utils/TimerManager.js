'use strict';
import { log, warn, error } from './logger.js';

/**
 * Centralized timer management to prevent memory leaks
 * Singleton pattern with automatic cleanup tracking
 * 
 * @class TimerManager
 * @example
 * import timerManager from './utils/TimerManager.js';
 * 
 * // Set timer with tracking
 * timerManager.setInterval(
 *     () => log('tick'),
 *     1000,
 *     'myTimer'
 * );
 * 
 * // Clear specific timer
 * timerManager.clearTimer('myTimer');
 * 
 * // Clear all timers
 * timerManager.clearAll();
 */
class TimerManager {
    constructor() {
        if (TimerManager.instance) {
            return TimerManager.instance;
        }
        
        this.timers = new Map();
        TimerManager.instance = this;
    }
    
    /**
     * Create tracked interval timer
     * @param {Function} callback - Function to execute
     * @param {number} delay - Delay in milliseconds
     * @param {string} id - Unique timer identifier
     * @returns {string} Timer ID for clearing
     */
    setInterval(callback, delay, id) {
        // Clear existing timer with same ID
        if (this.timers.has(id)) {
            this.clearTimer(id);
        }
        
        const timerId = setInterval(callback, delay);
        
        // Node.js: Prevent timer from keeping process alive
        if (typeof timerId === 'object' && typeof timerId.unref === 'function') {
            timerId.unref();
        }
        
        this.timers.set(id, { 
            timerId, 
            type: 'interval',
            created: Date.now()
        });
        
        return id;
    }
    
    /**
     * Create tracked timeout timer
     * @param {Function} callback - Function to execute
     * @param {number} delay - Delay in milliseconds
     * @param {string} id - Unique timer identifier
     * @returns {string} Timer ID for clearing
     */
    setTimeout(callback, delay, id) {
        if (this.timers.has(id)) {
            this.clearTimer(id);
        }
        
        const timerId = setTimeout(() => {
            callback();
            this.timers.delete(id); // Auto-cleanup after execution
        }, delay);
        
        if (typeof timerId === 'object' && typeof timerId.unref === 'function') {
            timerId.unref();
        }
        
        this.timers.set(id, { 
            timerId, 
            type: 'timeout',
            created: Date.now()
        });
        
        return id;
    }
    
    /**
     * Clear specific timer by ID
     * @param {string} id - Timer ID to clear
     * @returns {boolean} True if timer was found and cleared
     */
    clearTimer(id) {
        const timer = this.timers.get(id);
        if (!timer) {
            return false;
        }
        
        if (timer.type === 'interval') {
            clearInterval(timer.timerId);
        } else {
            clearTimeout(timer.timerId);
        }
        
        this.timers.delete(id);
        return true;
    }
    
    /**
     * Clear all tracked timers
     * Useful for cleanup in tests or component destruction
     */
    clearAll() {
        this.timers.forEach((timer) => {
            if (timer.type === 'interval') {
                clearInterval(timer.timerId);
            } else {
                clearTimeout(timer.timerId);
            }
        });
        this.timers.clear();
    }
    
    /**
     * Get count of active timers (for debugging)
     * @returns {number} Number of active timers
     */
    getActiveCount() {
        return this.timers.size;
    }
    
    /**
     * Get all timer IDs (for debugging)
     * @returns {string[]} Array of timer IDs
     */
    getTimerIds() {
        return Array.from(this.timers.keys());
    }
    
    /**
     * Get the singleton instance
     * @returns {TimerManager} The TimerManager instance
     */
    static getInstance() {
        if (!TimerManager.instance) {
            TimerManager.instance = new TimerManager();
        }
        return TimerManager.instance;
    }
}

// Export singleton instance and class
export { TimerManager };
export default new TimerManager();
