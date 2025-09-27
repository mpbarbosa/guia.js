/**
 * @jest-environment node
 */

// Mock DOM functions for testing
global.document = undefined;
global.window = {
  speechSynthesis: {
    getVoices: () => [],
    cancel: jest.fn(),
    speak: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    speaking: false,
    paused: false
  }
};

// Import the guia.js functions
const { SpeechSynthesisManager } = require('../src/guia.js');

describe('SpeechSynthesisManager Timer', () => {
  let speechManager;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    if (speechManager && speechManager.queueTimer) {
      speechManager.stopQueueTimer();
    }
    jest.useRealTimers();
  });

  describe('Independent Timer', () => {
    test('should start timer on initialization', () => {
      speechManager = new SpeechSynthesisManager();
      
      expect(speechManager.queueTimer).toBeDefined();
      expect(speechManager.queueTimer).not.toBeNull();
    });
    
    test('should process queue every 10 seconds', () => {
      speechManager = new SpeechSynthesisManager();
      const processQueueSpy = jest.spyOn(speechManager, 'processQueue');
      
      // Initial call count
      expect(processQueueSpy).toHaveBeenCalledTimes(0);
      
      // Fast-forward 10 seconds
      jest.advanceTimersByTime(10000);
      expect(processQueueSpy).toHaveBeenCalledTimes(1);
      
      // Fast-forward another 10 seconds
      jest.advanceTimersByTime(10000);
      expect(processQueueSpy).toHaveBeenCalledTimes(2);
      
      // Fast-forward another 20 seconds (2 more cycles)
      jest.advanceTimersByTime(20000);
      expect(processQueueSpy).toHaveBeenCalledTimes(4);
    });

    test('should stop timer when stopQueueTimer is called', () => {
      speechManager = new SpeechSynthesisManager();
      const processQueueSpy = jest.spyOn(speechManager, 'processQueue');
      
      // Stop the timer
      speechManager.stopQueueTimer();
      expect(speechManager.queueTimer).toBeNull();
      
      // Fast-forward 10 seconds - processQueue should not be called
      jest.advanceTimersByTime(10000);
      expect(processQueueSpy).toHaveBeenCalledTimes(0);
    });

    test('should restart timer when stop() is called', () => {
      speechManager = new SpeechSynthesisManager();
      const processQueueSpy = jest.spyOn(speechManager, 'processQueue');
      
      // Call stop() which should restart the timer
      speechManager.stop();
      
      expect(speechManager.queueTimer).toBeDefined();
      expect(speechManager.queueTimer).not.toBeNull();
      
      // Fast-forward 10 seconds - processQueue should be called
      jest.advanceTimersByTime(10000);
      expect(processQueueSpy).toHaveBeenCalledTimes(1);
    });

    test('should process queue independently with items in queue', () => {
      speechManager = new SpeechSynthesisManager();
      const processQueueSpy = jest.spyOn(speechManager, 'processQueue');
      
      // Add an item to the queue
      speechManager.speechQueue.enqueue('Test message');
      expect(speechManager.speechQueue.size()).toBe(1);
      
      // Fast-forward 10 seconds
      jest.advanceTimersByTime(10000);
      expect(processQueueSpy).toHaveBeenCalledTimes(1);
    });
  });
});