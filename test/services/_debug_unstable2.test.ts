
const logMock = { log: jest.fn() as any, warn: jest.fn() as any };
const distanceMock = { calculateDistance: jest.fn().mockReturnValue(123) as any };

jest.unstable_mockModule('../../src/utils/logger', () => logMock);
jest.unstable_mockModule('../../src/utils/distance', () => distanceMock);

describe('test', () => {
  let findNearby: any;
  
  beforeAll(async () => {
    const mod = await import('../../src/services/OverpassService');
    findNearby = mod.findNearby;
    global.fetch = jest.fn();
  });
  
  test('mock works', async () => {
    process.stderr.write('log isMock: ' + jest.isMockFunction(logMock.log) + '\n');
    process.stderr.write('calc isMock: ' + jest.isMockFunction(distanceMock.calculateDistance) + '\n');
    expect(jest.isMockFunction(logMock.log)).toBe(true);
    expect(jest.isMockFunction(distanceMock.calculateDistance)).toBe(true);
  });
});
