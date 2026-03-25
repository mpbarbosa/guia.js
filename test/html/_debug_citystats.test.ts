import { jest } from '@jest/globals';

// Mock logger BEFORE importing anything
jest.mock('../../src/utils/logger.js', () => ({
  log: jest.fn() as any,
}));

// Only import the module under test (NOT the mocked module directly)
import { HTMLCityStatsPanel } from '../../src/html/HTMLCityStatsPanel';

// Get mock reference via dynamic require AFTER mock is set up
// Actually we can't use require in ESM...
// But we CAN use jest.mocked or dynamic import
let logMock: jest.Mock;

beforeAll(async () => {
  // Dynamic import AFTER mock is registered
  const loggerMod = await import('../../src/utils/logger');
  logMock = loggerMod.log as jest.Mock;
  process.stderr.write('logMock isMock (dynamic): ' + jest.isMockFunction(logMock) + '\n');
});

test('check if module under test uses mocked logger', async () => {
  document.body.innerHTML = '<div id="city-stats-panel"></div>';
  const panel = new HTMLCityStatsPanel();
  panel.showLoading();
  
  // If mock works, logMock should have been called
  process.stderr.write('logMock called: ' + JSON.stringify(logMock?.mock?.calls?.length) + '\n');
  // Just check behavior, not mock calls
  const el = document.getElementById('city-stats-panel');
  expect(el?.getAttribute('aria-busy')).toBe('true');
});
