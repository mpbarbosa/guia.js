import { jest } from '@jest/globals';

jest.mock('../../src/utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

import { log } from '../../src/utils/logger.js';

test('factory mock in __tests__ directory', () => {
  process.stderr.write('log isMock: ' + jest.isMockFunction(log) + '\n');
  log('test call');
  expect(jest.isMockFunction(log)).toBe(true);
  expect(log).toHaveBeenCalledWith('test call');
});
