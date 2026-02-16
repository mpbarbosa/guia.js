/**
 * Jest Configuration for Unit/Integration Tests (Non-E2E)
 * 
 * This configuration runs all tests EXCEPT E2E tests with Puppeteer.
 * Uses jsdom environment for DOM testing without browser automation.
 * 
 * Usage:
 *   npm run test:unit
 * 
 * @since 0.11.0-alpha
 */

export default {
  // Use jsdom for DOM testing
  testEnvironment: 'jsdom',
  
  // Setup file with jsdom mocks
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  
  // ES Modules support
  transform: {},
  transformIgnorePatterns: [],
  
  // Performance
  maxWorkers: 1,
  cacheDirectory: '.jest-cache',
  
  // Standard timeout
  testTimeout: 30000,
  
  // All tests EXCEPT E2E
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js'
  ],
  
  // Ignore E2E tests and helpers
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__mocks__/',
    '/__tests__/helpers/',
    '/__tests__/e2e/'  // EXCLUDE E2E tests
  ],
  
  // Coverage collection
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!node_modules/**',
    '!coverage/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 65,
      branches: 69,
      functions: 55,
      lines: 65
    },
    './src/services/**/*.js': {
      branches: 20,
      functions: 18
    }
  }
};
