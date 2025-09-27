/**
 * @jest-environment node
 */

// Mock DOM functions for testing
global.document = undefined;

// Import the guia.js functions
const { SpeechQueue } = require('../src/guia.js');

describe('SpeechQueue Class', () => {
  let speechQueue;

  beforeEach(() => {
    speechQueue = new SpeechQueue();
  });

  describe('Basic Queue Operations', () => {
    test('should create empty queue', () => {
      expect(speechQueue.isEmpty()).toBe(true);
      expect(speechQueue.size()).toBe(0);
    });

    test('should enqueue text with default priority', () => {
      speechQueue.enqueue('Test message');
      expect(speechQueue.isEmpty()).toBe(false);
      expect(speechQueue.size()).toBe(1);
    });

    test('should enqueue text with specific priority', () => {
      speechQueue.enqueue('Low priority', 0);
      speechQueue.enqueue('High priority', 1);
      expect(speechQueue.size()).toBe(2);
    });

    test('should dequeue items', () => {
      speechQueue.enqueue('Test message');
      const item = speechQueue.dequeue();
      expect(item).toBeDefined();
      expect(item.text).toBe('Test message');
      expect(item.priority).toBe(0);
      expect(speechQueue.isEmpty()).toBe(true);
    });

    test('should return null when dequeuing empty queue', () => {
      const item = speechQueue.dequeue();
      expect(item).toBeNull();
    });
  });

  describe('Priority Handling', () => {
    test('should dequeue higher priority items first', () => {
      speechQueue.enqueue('Low priority', 0);
      speechQueue.enqueue('High priority', 1);
      speechQueue.enqueue('Medium priority', 0);
      
      const first = speechQueue.dequeue();
      expect(first.text).toBe('High priority');
      expect(first.priority).toBe(1);
      
      const second = speechQueue.dequeue();
      expect(second.text).toBe('Low priority');
      expect(second.priority).toBe(0);
    });

    test('should maintain order for same priority items', () => {
      speechQueue.enqueue('First', 0);
      speechQueue.enqueue('Second', 0);
      speechQueue.enqueue('Third', 0);
      
      expect(speechQueue.dequeue().text).toBe('First');
      expect(speechQueue.dequeue().text).toBe('Second');
      expect(speechQueue.dequeue().text).toBe('Third');
    });
  });

  describe('Timeout Mechanism', () => {
    test('should filter out expired items', async () => {
      // Mock timeout to be very short for testing
      speechQueue.timeoutDuration = 50; // 50ms
      
      speechQueue.enqueue('Should expire');
      expect(speechQueue.size()).toBe(1);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 60));
      
      expect(speechQueue.size()).toBe(0);
      expect(speechQueue.isEmpty()).toBe(true);
    });

    test('should not return expired items when dequeuing', async () => {
      speechQueue.timeoutDuration = 50; // 50ms
      
      speechQueue.enqueue('Should expire');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 60));
      
      const item = speechQueue.dequeue();
      expect(item).toBeNull();
    });
  });

  describe('Queue Management', () => {
    test('should clear all items', () => {
      speechQueue.enqueue('Message 1');
      speechQueue.enqueue('Message 2');
      expect(speechQueue.size()).toBe(2);
      
      speechQueue.clear();
      expect(speechQueue.size()).toBe(0);
      expect(speechQueue.isEmpty()).toBe(true);
    });
  });
});