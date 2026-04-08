import { jest, test, expect } from '@jest/globals';

// In ESM mode (--experimental-vm-modules), jest.mock() hoisting is unreliable.
// jest.unstable_mockModule() + dynamic import is the correct ESM pattern.
jest.unstable_mockModule('../../src/utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  formatTimestamp: jest.fn(() => '2025-01-01T00:00:00.000Z'),
  getLogLevel: jest.fn(() => ({ level: 3, levelName: 'log', enabled: true })),
  setLogLevel: jest.fn(),
}));

const loggerMod = await import('../../src/utils/logger.js');

test('check auto-mock', () => {
  process.stderr.write('isMock: ' + jest.isMockFunction(loggerMod.log) + '\n');
  expect(jest.isMockFunction(loggerMod.log)).toBe(true);
});
