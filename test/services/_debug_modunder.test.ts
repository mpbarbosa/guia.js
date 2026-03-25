import { jest } from '@jest/globals';

jest.mock('../../src/utils/logger.js', () => ({
  log: jest.fn() as any,
}));

import { doSomething } from '../../src/services/OverpassService';
import * as loggerMod from '../../src/utils/logger.js';

test('does module under test use mocked logger?', () => {
  // If logger is mocked for OverpassService:
  // calling findNearby would make OverpassService's internal log calls
  // go to the mocked function
  // Let's just check if loggerMod.log is a mock
  process.stderr.write('loggerMod.log isMock: ' + jest.isMockFunction(loggerMod.log) + '\n');
  // Call the function (this will invoke logger internally in OverpassService)
  // But we can't easily test without fetch...
  // Just verify the logger mock status
});
