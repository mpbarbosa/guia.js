import { jest } from '@jest/globals';

jest.mock('../../src/utils/logger.js');

import * as loggerMod from '../../src/utils/logger.js';

test('check auto-mock', () => {
  process.stderr.write('isMock: ' + jest.isMockFunction(loggerMod.log) + '\n');
  expect(jest.isMockFunction(loggerMod.log)).toBe(true);
});
