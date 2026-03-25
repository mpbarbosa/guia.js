import { jest } from '@jest/globals';

jest.mock('../../src/utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
}));

import { log } from '../../src/utils/logger.js';

test('mock works in __tests__', () => {
  console.error('log isMock:', jest.isMockFunction(log));
  expect(jest.isMockFunction(log)).toBe(true);
});
