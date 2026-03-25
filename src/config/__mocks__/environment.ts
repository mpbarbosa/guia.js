// Manual mock for src/config/environment.ts
export const env = {
  isProduction: jest.fn(() => false),
  isDevelopment: jest.fn(() => true),
};
export const getEnvVar = jest.fn((_key: string) => undefined);
