// __tests__/SpeechSynthesisManager.facade-wip.test.js
import SpeechSynthesisManager from '../src/speech/SpeechSynthesisManager.facade-wip.js';

describe('SpeechSynthesisManager (Facade Pattern)', () => {
  let origWindow;
  let synthMock, voiceManagerMock, configMock, queueMock, queueProcessorMock, controllerMock;

  beforeEach(() => {
    origWindow = global.window;
    synthMock = {};
    voiceManagerMock = {
      loadVoices: jest.fn(),
      getCurrentVoice: jest.fn().mockReturnValue({ name: 'TestVoice' }),
      getAvailableVoices: jest.fn().mockReturnValue([{ name: 'TestVoice' }]),
      setVoice: jest.fn().mockReturnValue(true),
      startVoiceRetryTimer: jest.fn(),
      stopVoiceRetryTimer: jest.fn(),
      enableLogs: jest.fn(),
      disableLogs: jest.fn(),
      destroy: jest.fn(),
      maxVoiceRetryAttempts: 3,
    };
    configMock = {
      getRate: jest.fn().mockReturnValue(1.0),
      setRate: jest.fn(),
      getPitch: jest.fn().mockReturnValue(1.0),
      setPitch: jest.fn(),
      enableLogs: jest.fn(),
      disableLogs: jest.fn(),
      destroy: jest.fn(),
    };
    queueMock = {
      enqueue: jest.fn(),
      dequeue: jest.fn(),
      isEmpty: jest.fn().mockReturnValue(true),
      size: jest.fn().mockReturnValue(0),
      clear: jest.fn(),
    };
    queueProcessorMock = {
      start: jest.fn(),
      stop: jest.fn(),
      enableLogs: jest.fn(),
      disableLogs: jest.fn(),
      destroy: jest.fn(),
      timer: null,
      interval: 100,
    };
    controllerMock = {
      speak: jest.fn(),
      pause: jest.fn().mockReturnValue(true),
      resume: jest.fn().mockReturnValue(true),
      stop: jest.fn(),
      isPaused: jest.fn().mockReturnValue(false),
      enableLogs: jest.fn(),
      disableLogs: jest.fn(),
      destroy: jest.fn(),
    };

    global.window = {
      speechSynthesis: synthMock,
    };

    jest.spyOn(SpeechSynthesisManager.prototype, '_initializeComponents').mockImplementation(function () {
      this.voiceManager = voiceManagerMock;
      this.config = configMock;
      this.speechQueue = queueMock;
      this.queueProcessor = queueProcessorMock;
      this.controller = controllerMock;
    });
  });

  afterEach(() => {
    global.window = origWindow;
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('initializes with logging disabled by default', () => {
      const mgr = new SpeechSynthesisManager();
      expect(mgr.enableLogging).toBe(false);
      expect(mgr.synth).toBe(synthMock);
      expect(voiceManagerMock.loadVoices).toHaveBeenCalled();
    });

    it('throws if enableLogging is not boolean', () => {
      expect(() => new SpeechSynthesisManager('yes')).toThrow(/enableLogging must be a boolean/);
    });

    it('throws if Web Speech API is not available', () => {
      global.window = {};
      expect(() => new SpeechSynthesisManager()).toThrow(/Web Speech API not available/);
    });

    it('initializes with logging enabled', () => {
      const mgr = new SpeechSynthesisManager(true);
      expect(mgr.enableLogging).toBe(true);
    });
  });

  describe('logging methods', () => {
    it('enables and disables logs', () => {
      const mgr = new SpeechSynthesisManager();
      mgr.enableLogs();
      expect(mgr.enableLogging).toBe(true);
      expect(voiceManagerMock.enableLogs).toHaveBeenCalled();
      expect(configMock.enableLogs).toHaveBeenCalled();
      expect(queueProcessorMock.enableLogs).toHaveBeenCalled();
      expect(controllerMock.enableLogs).toHaveBeenCalled();

      mgr.disableLogs();
      expect(mgr.enableLogging).toBe(false);
      expect(voiceManagerMock.disableLogs).toHaveBeenCalled();
      expect(configMock.disableLogs).toHaveBeenCalled();
      expect(queueProcessorMock.disableLogs).toHaveBeenCalled();
      expect(controllerMock.disableLogs).toHaveBeenCalled();
    });

    it('toggles logs', () => {
      const mgr = new SpeechSynthesisManager();
      mgr.toggleLogs();
      expect(mgr.enableLogging).toBe(true);
      mgr.toggleLogs();
      expect(mgr.enableLogging).toBe(false);
    });
  });

  describe('property accessors', () => {
    it('gets and sets rate', () => {
      const mgr = new SpeechSynthesisManager();
      expect(mgr.rate).toBe(1.0);
      mgr.rate = 1.5;
      expect(configMock.setRate).toHaveBeenCalledWith(1.5);
    });

    it('gets and sets pitch', () => {
      const mgr = new SpeechSynthesisManager();
      expect(mgr.pitch).toBe(1.0);
      mgr.pitch = 1.2;
      expect(configMock.setPitch).toHaveBeenCalledWith(1.2);
    });

    it('gets and sets queueTimer', () => {
      const mgr = new SpeechSynthesisManager();
      mgr.queueTimer = 123;
      expect(queueProcessorMock.timer).toBe(123);
      queueProcessorMock.timer = 456;
      expect(mgr.queueTimer).toBe(456);
    });

    it('gets and sets maxVoiceRetryAttempts', () => {
      const mgr = new SpeechSynthesisManager();
      mgr.maxVoiceRetryAttempts = 7;
      expect(voiceManagerMock.maxVoiceRetryAttempts).toBe(7);
      voiceManagerMock.maxVoiceRetryAttempts = 9;
      expect(mgr.maxVoiceRetryAttempts).toBe(9);
    });

    it('gets and sets independentQueueTimerInterval', () => {
      const mgr = new SpeechSynthesisManager();
      mgr.independentQueueTimerInterval = 222;
      expect(queueProcessorMock.interval).toBe(222);
      queueProcessorMock.interval = 333;
      expect(mgr.independentQueueTimerInterval).toBe(333);
    });

    it('gets voice and voices', () => {
      const mgr = new SpeechSynthesisManager();
      expect(mgr.voice).toEqual({ name: 'TestVoice' });
      expect(mgr.voices).toEqual([{ name: 'TestVoice' }]);
    });
  });

  describe('voice management', () => {
    it('loads voices', () => {
      const mgr = new SpeechSynthesisManager();
      mgr.loadVoices();
      expect(voiceManagerMock.loadVoices).toHaveBeenCalled();
    });

    it('sets voice', () => {
      const mgr = new SpeechSynthesisManager();
      const result = mgr.setVoice({ name: 'OtherVoice' });
      expect(voiceManagerMock.setVoice).toHaveBeenCalledWith({ name: 'OtherVoice' });
      expect(result).toBe(true);
    });

    it('gets available voices and current voice', () => {
      const mgr = new SpeechSynthesisManager();
      expect(mgr.getAvailableVoices()).toEqual([{ name: 'TestVoice' }]);
      expect(mgr.getCurrentVoice()).toEqual({ name: 'TestVoice' });
    });
  });

  describe('configuration', () => {
    it('sets rate and pitch', () => {
      const mgr = new SpeechSynthesisManager();
      mgr.setRate(2.0);
      expect(configMock.setRate).toHaveBeenCalledWith(2.0);
      mgr.setPitch(1.5);
      expect(configMock.setPitch).toHaveBeenCalledWith(1.5);
    });
  });

  describe('queue and speech', () => {
    it('speak adds text to queue and starts processing (happy path)', () => {
      queueMock.isEmpty.mockReturnValue(true);
      const mgr = new SpeechSynthesisManager();
      mgr.isCurrentlySpeaking = false;
      mgr.speak('Hello world', 1);
      expect(queueMock.enqueue).toHaveBeenCalledWith('Hello world', 1);
      expect(queueMock.size).toHaveBeenCalled();
    });

    it('throws if text is not a string', () => {
      const mgr = new SpeechSynthesisManager();
      expect(() => mgr.speak(123)).toThrow(/Text must be a string/);
    });

    it('throws if text is empty or whitespace', () => {
      const mgr = new SpeechSynthesisManager();
      expect(() => mgr.speak('')).toThrow(/Text cannot be empty/);
      expect(() => mgr.speak('   ')).toThrow(/Text cannot be empty/);
    });

    it('throws if priority is not a number', () => {
      const mgr = new SpeechSynthesisManager();
      expect(() => mgr.speak('Hello', 'high')).toThrow(/Priority must be a number/);
    });

    it('processQueue calls _processNextItem', () => {
      const mgr = new SpeechSynthesisManager();
      const spy = jest.spyOn(mgr, '_processNextItem');
      mgr.processQueue();
      expect(spy).toHaveBeenCalled();
    });

    it('startQueueTimer and stopQueueTimer', () => {
      const mgr = new SpeechSynthesisManager();
      mgr.startQueueTimer();
      expect(queueProcessorMock.start).toHaveBeenCalled();
      mgr.stopQueueTimer();
      expect(queueProcessorMock.stop).toHaveBeenCalled();
    });

    it('pause and resume speech', () => {
      const mgr = new SpeechSynthesisManager();
      mgr.pause();
      expect(controllerMock.pause).toHaveBeenCalled();
      mgr.resume();
      expect(controllerMock.resume).toHaveBeenCalled();
    });

    it('stop clears queue and resets state', () => {
      queueMock.size.mockReturnValue(2);
      const mgr = new SpeechSynthesisManager();
      mgr.stop();
      expect(controllerMock.stop).toHaveBeenCalled();
      expect(queueMock.clear).toHaveBeenCalled();
      expect(mgr.isCurrentlySpeaking).toBe(false);
      expect(queueProcessorMock.stop).toHaveBeenCalled();
      expect(voiceManagerMock.stopVoiceRetryTimer).toHaveBeenCalled();
    });

    it('getQueueSize returns queue size', () => {
      queueMock.size.mockReturnValue(5);
      const mgr = new SpeechSynthesisManager();
      expect(mgr.getQueueSize()).toBe(5);
    });

    it('isSpeaking returns speaking state', () => {
      const mgr = new SpeechSynthesisManager();
      mgr.isCurrentlySpeaking = true;
      expect(mgr.isSpeaking()).toBe(true);
      mgr.isCurrentlySpeaking = false;
      expect(mgr.isSpeaking()).toBe(false);
    });
  });

  describe('status and toString', () => {
    it('getStatus returns status object', () => {
      voiceManagerMock.getAvailableVoices.mockReturnValue([{ name: 'TestVoice' }]);
      queueMock.size.mockReturnValue(2);
      controllerMock.isPaused.mockReturnValue(true);
      const mgr = new SpeechSynthesisManager();
      mgr.isCurrentlySpeaking = true;
      const status = mgr.getStatus();
      expect(status).toEqual({
        isSpeaking: true,
        isPaused: true,
        queueSize: 2,
        voice: 'TestVoice',
        rate: 1.0,
        pitch: 1.0,
        voicesAvailable: 1,
      });
    });

    it('toString returns string representation', () => {
      queueMock.size.mockReturnValue(3);
      configMock.getRate.mockReturnValue(1.2);
      configMock.getPitch.mockReturnValue(0.8);
      voiceManagerMock.getCurrentVoice.mockReturnValue({ name: 'TestVoice' });
      const mgr = new SpeechSynthesisManager();
      mgr.isCurrentlySpeaking = true;
      const str = mgr.toString();
      expect(str).toContain('SpeechSynthesisManager');
      expect(str).toContain('voice=TestVoice');
      expect(str).toContain('rate=1.2');
      expect(str).toContain('pitch=0.8');
      expect(str).toContain('isSpeaking=true');
      expect(str).toContain('queueSize=3');
    });
  });

  describe('destroy', () => {
    it('destroys all components and clears references', () => {
      const mgr = new SpeechSynthesisManager();
      mgr.destroy();
      expect(controllerMock.destroy).toHaveBeenCalled();
      expect(voiceManagerMock.destroy).toHaveBeenCalled();
      expect(queueProcessorMock.destroy).toHaveBeenCalled();
      expect(mgr.synth).toBeNull();
      expect(mgr.voiceManager).toBeNull();
      expect(mgr.config).toBeNull();
      expect(mgr.speechQueue).toBeNull();
      expect(mgr.queueProcessor).toBeNull();
      expect(mgr.controller).toBeNull();
    });
  });
});
