import { jest, describe, test, expect } from '@jest/globals';

// Try without extension (no mapper needed)
jest.mock('../../src/utils/distance');

import * as distanceModule from '../../src/utils/distance.js';

describe('mock test', () => {
  test('auto-mock works with no-extension path', () => {
    const dist = distanceModule.calculateDistance;
    console.error('isMock:', jest.isMockFunction(dist));
    expect(jest.isMockFunction(dist)).toBe(true);
  });
});
