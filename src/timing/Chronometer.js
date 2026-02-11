'use strict';
import { log, warn, error } from '../utils/logger.js';
import { TimerManager } from '../utils/TimerManager.js';

const timerManager = TimerManager.getInstance();

/**
 * Displays and manages elapsed time information in HTML format.
 * 
 * This class tracks and displays timing information related to position updates,
 * showing how much time has elapsed since the last position change. It implements
 * the observer pattern to automatically update when new position data becomes available.
 * 
 * **Key Features**:
 * - Start/stop/reset timer functionality
 * - HH:MM:SS time formatting
 * - Automatic display updates (1-second interval)
 * - Observer pattern integration with position management systems
 * - Error and loading state handling
 * 
 * **Usage**:
 * ```javascript
 * const chronometerElement = document.getElementById('chronometer');
 * const chronometer = new Chronometer(chronometerElement);
 * 
 * // Subscribe to position updates (example with PositionManager)
 * PositionManager.getInstance().subscribe(chronometer);
 * 
 * // Manual control
 * chronometer.start();
 * chronometer.stop();
 * chronometer.reset();
 * ```
 * 
 * @class Chronometer
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class Chronometer {
	/**
	 * Creates a new Chronometer instance.
	 * 
	 * Initializes the chronometer with a DOM element for display and sets up
	 * the internal timing state. The chronometer starts in a stopped state
	 * and must be explicitly started via the start() method or through
	 * observer notifications.
	 * 
	 * @param {HTMLElement} element - DOM element where chronometer will be displayed
	 * @param {Object} [eventConfig] - Configuration object for position events
	 * @param {string} [eventConfig.positionUpdate='strCurrPosUpdate'] - Event name for successful position updates
	 * @param {string} [eventConfig.immediateAddressUpdate='strImmediateAddressUpdate'] - Event name for immediate address updates  
	 * @param {string} [eventConfig.positionNotUpdate='strCurrPosNotUpdate'] - Event name for rejected position updates
	 * 
	 * @example
	 * // Basic usage with default PositionManager events
	 * const element = document.getElementById('timer-display');
	 * const chronometer = new Chronometer(element);
	 * 
	 * @example
	 * // Custom event configuration for different observer systems
	 * const chronometer = new Chronometer(element, {
	 *   positionUpdate: 'location.updated',
	 *   immediateAddressUpdate: 'address.immediate',
	 *   positionNotUpdate: 'location.rejected'
	 * });
	 */
	constructor(element, eventConfig = {}) {
		log("Initializing Chronometer...");
		this.element = element;
		this.startTime = null;
		this.lastUpdateTime = null;
		this.isRunning = false;
		this.intervalId = null;
		
		// Configure event names with defaults matching PositionManager constants
		this.eventConfig = {
			positionUpdate: eventConfig.positionUpdate || 'PositionManager updated',
			immediateAddressUpdate: eventConfig.immediateAddressUpdate || 'Immediate address update',
			positionNotUpdate: eventConfig.positionNotUpdate || 'PositionManager not updated'
		};
	}

	/**
	 * Starts the chronometer timing.
	 * 
	 * Records the current timestamp as the start time and begins the display
	 * update interval. If the chronometer is already running, this method
	 * has no effect. The display is updated immediately upon start and then
	 * every second thereafter.
	 * 
	 * @returns {void}
	 * @since 0.8.3-alpha
	 * 
	 * @example
	 * chronometer.start();
	 * // Display immediately shows "00:00:00" and updates every second
	 */
	start() {
		if (!this.isRunning) {
			this.startTime = Date.now();
			this.lastUpdateTime = this.startTime;
			this.isRunning = true;

			// Update display immediately
			this.updateDisplay();

			// Start interval to update display every second
			this.intervalId = timerManager.setInterval(() => {
				this.updateDisplay();
			}, 1000, 'chronometer-display');
		}
	}

	/**
	 * Stops the chronometer timing.
	 * 
	 * Halts the timing process and clears the display update interval.
	 * The elapsed time is preserved and can be retrieved via getElapsedTime().
	 * The chronometer can be restarted from where it left off using start().
	 * 
	 * @returns {void}
	 * @since 0.8.3-alpha
	 * 
	 * @example
	 * chronometer.stop();
	 * const elapsed = chronometer.getElapsedTime(); // Get time when stopped
	 */
	stop() {
		if (this.isRunning) {
			this.isRunning = false;
			if (this.intervalId) {
				timerManager.clearTimer(this.intervalId);
				this.intervalId = null;
			}
		}
	}

	/**
	 * Resets the chronometer to initial state.
	 * 
	 * Stops the chronometer, clears all timing data, and resets the display
	 * to "00:00:00". This is a complete reset that cannot be undone.
	 * 
	 * @returns {void}
	 * @since 0.8.3-alpha
	 * 
	 * @example
	 * chronometer.reset();
	 * // Display shows "00:00:00" and chronometer is stopped
	 */
	reset() {
		this.stop();
		this.startTime = null;
		this.lastUpdateTime = null;
		if (this.element) {
			this.element.textContent = "00:00:00";
		}
	}

	/**
	 * Gets the current elapsed time in milliseconds.
	 * 
	 * Returns the total elapsed time since the chronometer was started.
	 * If the chronometer has never been started, returns 0. The time
	 * continues to increment while running and is frozen when stopped.
	 * 
	 * @returns {number} Elapsed time in milliseconds
	 * @since 0.8.3-alpha
	 * 
	 * @example
	 * chronometer.start();
	 * setTimeout(() => {
	 *   const elapsed = chronometer.getElapsedTime();
	 *   log(`Elapsed: ${elapsed}ms`);
	 * }, 5000);
	 */
	getElapsedTime() {
		if (!this.startTime) {
			return 0;
		}
		return Date.now() - this.startTime;
	}

	/**
	 * Formats elapsed time in milliseconds to HH:MM:SS format.
	 * 
	 * Converts a millisecond duration into a human-readable time format
	 * with hours, minutes, and seconds. Each component is zero-padded
	 * to ensure consistent display formatting.
	 * 
	 * @param {number} milliseconds - Time duration in milliseconds
	 * @returns {string} Formatted time string in HH:MM:SS format
	 * @since 0.8.3-alpha
	 * 
	 * @example
	 * const formatted = chronometer.formatTime(125000); // 2 minutes 5 seconds
	 * log(formatted); // "00:02:05"
	 * 
	 * @example
	 * const formatted = chronometer.formatTime(3661000); // 1 hour 1 minute 1 second
	 * log(formatted); // "01:01:01"
	 */
	formatTime(milliseconds) {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		return [hours, minutes, seconds]
			.map(unit => unit.toString().padStart(2, '0'))
			.join(':');
	}

	/**
	 * Updates the chronometer display with current elapsed time.
	 * 
	 * Calculates the current elapsed time and updates the DOM element
	 * with the formatted time string. This method is called automatically
	 * every second while the chronometer is running, but can also be
	 * called manually if needed.
	 * 
	 * @private
	 * @returns {void}
	 * @since 0.8.3-alpha
	 */
	updateDisplay() {
		if (this.element) {
			const elapsed = this.getElapsedTime();
			const formattedTime = this.formatTime(elapsed);
			this.element.textContent = formattedTime;
		}
	}

	/**
	 * Updates the chronometer based on position manager notifications.
	 * 
	 * Observer pattern update method that gets called when a position management
	 * system has new position data available. The chronometer responds to different
	 * position events by starting, stopping, or displaying status messages.
	 * 
 * **Event Handling**:
 * - Position update events: Position successfully updated - restart chronometer
 * - Immediate address events: Immediate address update - restart chronometer  
 * - Position not update events: Position update rejected - continue if not running
 * - Error states: Stop chronometer and display "Error"
 * - Loading states: Display "Loading..." message
 * 
 * Event names are configurable via constructor eventConfig parameter.
	 * 
	 * @param {Object} positionManager - The position manager instance
	 * @param {string} posEvent - The position event type
	 * @param {Object} loading - Loading state information  
	 * @param {Object} error - Error information if any
	 * @returns {void}
	 * @since 0.8.3-alpha
	 * 
	 * @example
	 * // Typically called automatically via observer pattern
	 * positionManager.subscribe(chronometer);
	 */
	update(positionManager, posEvent, loading, error) {
		// Handle different position events using injected configuration
		if (posEvent === this.eventConfig.positionUpdate || 
		    posEvent === this.eventConfig.immediateAddressUpdate) {
			// Position successfully updated - restart chronometer
			this.reset();
			this.start();
		} else if (posEvent === this.eventConfig.positionNotUpdate) {
			// Position update was rejected - continue running if already started
			if (!this.isRunning && this.element) {
				this.start();
			}
		}

		// Handle error states
		if (error) {
			this.stop();
			if (this.element) {
				this.element.textContent = "Error";
			}
		}

		// Handle loading states
		if (loading) {
			if (this.element) {
				this.element.textContent = "Loading...";
			}
		}
	}

	/**
	 * Returns a string representation of the chronometer instance.
	 * 
	 * Provides a human-readable representation showing the class name,
	 * current state (running/stopped), and elapsed time. Useful for
	 * debugging and logging purposes.
	 * 
	 * @returns {string} String representation with state and elapsed time
	 * @since 0.8.3-alpha
	 * 
	 * @example
	 * log(chronometer.toString());
	 * // Output: "Chronometer: running, elapsed: 00:01:23"
	 */
	toString() {
		const state = this.isRunning ? 'running' : 'stopped';
		const elapsed = this.formatTime(this.getElapsedTime());
		return `${this.constructor.name}: ${state}, elapsed: ${elapsed}`;
	}

	/**
	 * Destroys the chronometer and cleans up all resources.
	 * 
	 * Stops the timer, clears the interval, and releases references to prevent
	 * timer leaks. This method is critical for test environments where chronometer
	 * instances are created and destroyed frequently. Always call destroy() when
	 * the chronometer is no longer needed.
	 * 
	 * @returns {void}
	 * @since 0.8.6-alpha
	 * @author Marcelo Pereira Barbosa
	 * 
	 * @example
	 * const chronometer = new Chronometer(element);
	 * chronometer.start();
	 * // ... use chronometer
	 * chronometer.destroy(); // Clean up when done
	 * 
	 * @example
	 * // In tests
	 * describe('Chronometer', () => {
	 *   let chronometer;
	 *   
	 *   beforeEach(() => {
	 *     chronometer = new Chronometer(document.getElementById('test'));
	 *   });
	 *   
	 *   afterEach(() => {
	 *     if (chronometer) {
	 *       chronometer.destroy(); // Prevent timer leaks
	 *     }
	 *   });
	 * });
	 */
	destroy() {
		// Stop timer if running
		this.stop();
		
		// Clear interval reference to prevent leaks
		this.intervalId = null;
		
		// Release DOM reference
		this.element = null;
		
		// Clear timing data
		this.startTime = null;
		this.lastUpdateTime = null;
	}
}

export default Chronometer;