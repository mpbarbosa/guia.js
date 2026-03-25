// Manual mock for src/utils/logger.ts
export const log = jest.fn();
export const warn = jest.fn();
export const error = jest.fn();
export const debug = jest.fn();
export const getLogConfig = jest.fn(() => ({ level: 'log', levelName: 'log', enabled: true }));
export const setLogLevel = jest.fn();
export const resetLogLevel = jest.fn();
