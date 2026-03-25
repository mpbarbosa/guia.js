import { jest, describe, test, expect } from '@jest/globals';

jest.mock('../../src/utils/distance.js');

import * as distanceModule from '../../src/utils/distance.js';

describe('mock test', () => {
  test('check if mock works in __tests__', () => {
    const dist = distanceModule.calculateDistance;
    console.error('isMock in __tests__:', jest.isMockFunction(dist));
    expect(jest.isMockFunction(dist)).toBe(true);
  });
});
