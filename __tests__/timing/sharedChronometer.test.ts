/**
 * @jest-environment jsdom
 */
import {
  getSharedChronometer,
  attachSharedChronometerElement,
  detachSharedChronometerElement,
  stopSharedChronometer,
} from '../../src/timing/sharedChronometer.js';

import Chronometer from '../../src/timing/Chronometer.js';
import PositionManager from '../../src/core/PositionManager.js';

jest.mock('../../src/timing/Chronometer.js');
jest.mock('../../src/core/PositionManager.js');

type ChronometerMockType = jest.Mocked<InstanceType<typeof Chronometer>>;
type PositionManagerMockType = jest.Mocked<InstanceType<typeof PositionManager>>;

describe('sharedChronometer module', () => {
  let chronometerInstance: ChronometerMockType;
  let positionManagerInstance: PositionManagerMockType;

  beforeEach(() => {
    // Reset module state
    jest.resetModules();

    // Mock Chronometer instance
    (Chronometer as unknown as jest.Mock).mockImplementation(() => {
      return {
        setElement: jest.fn(),
        stop: jest.fn(),
      } as unknown as ChronometerMockType;
    });

    // Mock PositionManager singleton
    positionManagerInstance = {
      subscribe: jest.fn(),
    } as unknown as PositionManagerMockType;
    (PositionManager.getInstance as jest.Mock).mockReturnValue(positionManagerInstance);

    // Re-import to reset internal state
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const shared = require('../../src/timing/sharedChronometer.js');
    chronometerInstance = shared.getSharedChronometer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSharedChronometer', () => {
    it('returns the same Chronometer instance on multiple calls', () => {
      const c1 = getSharedChronometer();
      const c2 = getSharedChronometer();
      expect(c1).toBe(c2);
    });

    it('subscribes to PositionManager only once', () => {
      getSharedChronometer();
      getSharedChronometer();
      expect(positionManagerInstance.subscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('attachSharedChronometerElement', () => {
    it('sets the element on the shared Chronometer', () => {
      const element = document.createElement('div');
      attachSharedChronometerElement(element);
      expect(chronometerInstance.setElement).toHaveBeenCalledWith(element);
    });

    it('returns the shared Chronometer instance', () => {
      const element = document.createElement('span');
      const result = attachSharedChronometerElement(element);
      expect(result).toBe(chronometerInstance);
    });

    it('handles null element', () => {
      attachSharedChronometerElement(null);
      expect(chronometerInstance.setElement).toHaveBeenCalledWith(null);
    });
  });

  describe('detachSharedChronometerElement', () => {
    it('sets the element to null on the shared Chronometer', () => {
      detachSharedChronometerElement();
      expect(chronometerInstance.setElement).toHaveBeenCalledWith(null);
    });
  });

  describe('stopSharedChronometer', () => {
    it('calls stop on the shared Chronometer', () => {
      stopSharedChronometer();
      expect(chronometerInstance.stop).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('does not subscribe again if already subscribed', () => {
      getSharedChronometer();
      getSharedChronometer();
      getSharedChronometer();
      expect(positionManagerInstance.subscribe).toHaveBeenCalledTimes(1);
    });

    it('works if attach/detach/stop are called in any order', () => {
      const el = document.createElement('div');
      attachSharedChronometerElement(el);
      detachSharedChronometerElement();
      stopSharedChronometer();
      attachSharedChronometerElement(null);
      expect(chronometerInstance.setElement).toHaveBeenCalledWith(el);
      expect(chronometerInstance.setElement).toHaveBeenCalledWith(null);
      expect(chronometerInstance.stop).toHaveBeenCalled();
    });
  });
});
