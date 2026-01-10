'use strict';

/**
 * Speech synthesis queue item for managing text-to-speech requests with priority support.
 * 
 * This class represents individual items in the speech synthesis queue, providing
 * priority-based ordering and automatic expiration to prevent stale speech requests
 * from being processed. Each item contains text content, priority level, and timestamp.
 * 
 * **Key Features**:
 * - Priority-based ordering for speech request management
 * - Automatic expiration to prevent stale content from being spoken
 * - Immutable design following MP Barbosa standards
 * - Portuguese text support for Brazilian travel guide context
 * - Timestamp tracking for expiration management
 * 
 * **Design Principles**:
 * - **Immutability**: Object is frozen after construction to prevent modification
 * - **Single Responsibility**: Focused solely on representing queue items
 * - **Value Object**: Contains data without behavior, suitable for queuing
 * - **Expiration Support**: Built-in expiration checking for queue cleanup
 * 
 * **Usage in Speech System**:
 * ```javascript
 * // Create speech items with different priorities
 * const emergencyItem = new SpeechItem('Emergência detectada!', 3);
 * const infoItem = new SpeechItem('Você está na Avenida Paulista', 1);
 * 
 * // Check if item has expired (default 30 seconds)
 * if (!item.isExpired()) {
 *     speechQueue.enqueue(item);
 * }
 * ```
 * 
 * @class SpeechItem
 * @since 0.8.3-alpha
 * @author Marcelo Pereira Barbosa
 */
class SpeechItem {
	/**
	 * Creates a new speech queue item with text content and priority.
	 * 
	 * Initializes a speech queue item with the provided text, priority level, and
	 * timestamp for expiration tracking. The item is automatically frozen after
	 * creation to prevent modifications, following MP Barbosa immutability standards.
	 * 
	 * **Priority Levels**:
	 * - 3: Emergency/Critical (municipality changes, alerts)
	 * - 2: High (neighborhood changes, important notifications)
	 * - 1: Normal (street changes, regular updates)
	 * - 0: Low (periodic announcements, background information)
	 * 
	 * **Text Content Guidelines**:
	 * - Should be in Brazilian Portuguese for travel guide context
	 * - Keep concise for better speech synthesis quality
	 * - Avoid special characters that may cause speech issues
	 * 
	 * @param {string} text - Text content to be spoken by speech synthesis
	 * @param {number} [priority=0] - Priority level (higher values = higher priority)
	 * @param {number} [timestamp=Date.now()] - Creation timestamp for expiration tracking
	 * 
	 * @throws {TypeError} If text is not a string
	 * @throws {TypeError} If priority is not a number
	 * @throws {TypeError} If timestamp is not a number
	 * 
	 * @example
	 * // Basic speech item with default priority
	 * const item = new SpeechItem('Bem-vindo ao sistema');
	 * 
	 * @example
	 * // High priority emergency message
	 * const emergency = new SpeechItem('Atenção: Área interditada!', 3);
	 * 
	 * @example
	 * // Custom timestamp for testing
	 * const testItem = new SpeechItem('Teste', 1, Date.now() - 5000);
	 * 
	 * @since 0.8.3-alpha
	 */
	constructor(text, priority = 0, timestamp = Date.now()) {
		// Validate input parameters
		if (typeof text !== 'string') {
			throw new TypeError('Text must be a string');
		}
		if (typeof priority !== 'number') {
			throw new TypeError('Priority must be a number');
		}
		if (typeof timestamp !== 'number') {
			throw new TypeError('Timestamp must be a number');
		}

		// Store properties
		this.text = text;
		this.priority = priority;
		this.timestamp = timestamp;
		
		// Prevent further modification following MP Barbosa standards
		Object.freeze(this);
	}

	/**
	 * Checks if this speech item has expired based on the configured expiration time.
	 * 
	 * Determines whether the speech item should be removed from the queue due to age.
	 * This prevents outdated location announcements or stale speech content from
	 * being spoken, ensuring users only hear current and relevant information.
	 * 
	 * **Expiration Logic**:
	 * - Compares current time with item's creation timestamp
	 * - Uses configurable expiration duration (default 30 seconds)
	 * - Helps maintain fresh content in speech queue
	 * - Prevents memory leaks from accumulating old items
	 * 
	 * **Use Cases**:
	 * - Queue cleanup operations to remove stale items
	 * - Validating items before speech synthesis
	 * - Memory management in long-running applications
	 * - Ensuring location announcements remain current
	 * 
	 * @param {number} [expirationMs=30000] - Expiration time in milliseconds (default 30 seconds)
	 * @returns {boolean} True if the item has expired and should be removed
	 * 
	 * @example
	 * // Check with default 30-second expiration
	 * if (item.isExpired()) {
	 *     console.log('Item has expired, removing from queue');
	 * }
	 * 
	 * @example
	 * // Check with custom 60-second expiration
	 * const stillValid = !item.isExpired(60000);
	 * 
	 * @example
	 * // Filter expired items from queue
	 * const validItems = queue.filter(item => !item.isExpired());
	 * 
	 * @since 0.8.3-alpha
	 */
	isExpired(expirationMs = 30000) { // 30 seconds default
		return Date.now() - this.timestamp > expirationMs;
	}

	/**
	 * Returns a string representation of the speech item.
	 * 
	 * Provides a human-readable representation showing the class name,
	 * text content (truncated if long), and priority level. Useful for
	 * debugging, logging, and queue inspection.
	 * 
	 * **Format**: `SpeechItem: "text content" (priority: N)`
	 * 
	 * **Text Truncation**:
	 * - Shows first 50 characters of text content
	 * - Adds "..." if text is longer than 50 characters
	 * - Preserves readability in log output
	 * 
	 * @returns {string} Formatted string representation of the item
	 * 
	 * @example
	 * const item = new SpeechItem('Você está na Avenida Paulista', 1);
	 * console.log(item.toString());
	 * // Output: 'SpeechItem: "Você está na Avenida Paulista" (priority: 1)'
	 * 
	 * @example
	 * // Long text truncation
	 * const longItem = new SpeechItem('Este é um texto muito longo que será truncado...', 2);
	 * console.log(longItem.toString());
	 * // Output: 'SpeechItem: "Este é um texto muito longo que será truncado..." (priority: 2)'
	 * 
	 * @since 0.8.3-alpha
	 */
	toString() {
		const displayText = this.text.length > 50 
			? this.text.substring(0, 50) + '...' 
			: this.text;
		return `${this.constructor.name}: "${displayText}" (priority: ${this.priority})`;
	}
}

// Export as both default and named export for flexibility
export default SpeechItem;
export { SpeechItem };

// Export to window for browser compatibility
if (typeof window !== 'undefined') {
	window.SpeechItem = SpeechItem;
}