
const logMock = { log: jest.fn(), warn: jest.fn() };
const distanceMock = { calculateDistance: jest.fn().mockReturnValue(123) };

jest.unstable_mockModule('../../src/utils/logger.js', () => logMock);
jest.unstable_mockModule('../../src/utils/distance.js', () => distanceMock);

describe('OverpassService using unstable_mockModule', () => {
  let findNearby;
  
  beforeAll(async () => {
    const mod = await import('../../src/services/OverpassService');
    findNearby = mod.findNearby;
  });
  
  test('distance mock works', () => {
    expect(jest.isMockFunction(distanceMock.calculateDistance)).toBe(true);
    expect(jest.isMockFunction(logMock.log)).toBe(true);
  });
});
