/**
 * Jest Configuration for E2E Tests (Puppeteer)
 * 
 * This configuration runs E2E tests that use Puppeteer for browser automation.
 * These tests MUST run in Node.js environment (not jsdom) because Puppeteer
 * requires native WebSocket support.
 * 
 * Usage:
 *   npm run test:e2e
 * 
 * @since 0.11.0-alpha
 */

export default {
  // CRITICAL: Use Node environment for Puppeteer (not jsdom)
  testEnvironment: 'node',
  
  // Don't use jest.setup.js - it has jsdom-specific mocks
  setupFilesAfterEnv: [],
  
  // ES Modules support
  transform: {},
  transformIgnorePatterns: [],
  
  // Performance
  maxWorkers: 1,
  cacheDirectory: '.jest-cache',
  
  // Puppeteer tests need more time
  testTimeout: 60000,  // 60 seconds (increased from 30s)
  
  // Only run E2E tests
  testMatch: [
    '**/__tests__/e2e/**/*.test.js',
    '**/__tests__/e2e/**/*.e2e.test.js'
  ],
  
  // Ignore helpers and non-E2E tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__mocks__/',
    '/__tests__/helpers/',
    '/__tests__/unit/',
    '/__tests__/integration/',
    '/__tests__/managers/',
    '/__tests__/coordination/',
    '/__tests__/services/',
    '/__tests__/data/',
    '/__tests__/html/',
    '/__tests__/speech/',
    '/__tests__/timing/',
    '/__tests__/utils/',
    '/__tests__/ui/',
    '/__tests__/config/',
    '/__tests__/core/',
    '/__tests__/features/',
    '/__tests__/external/',
    '/__tests__/observers/'
  ],
  
  // No coverage for E2E tests
  collectCoverage: false,
  
  // Verbose output for debugging Puppeteer issues
  verbose: true,
  
  // Detect open handles (Puppeteer connections)
  detectOpenHandles: false,  // Set to true for debugging
  
  // Force exit after tests (Puppeteer may leave connections)
  forceExit: true
};
