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
  
  // Treat .ts and .vue as ESM (required for --experimental-vm-modules)
  extensionsToTreatAsEsm: ['.ts', '.vue'],
  
  // Setup file with jsdom mocks
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  
  // Force CJS builds of Vue packages in Jest (avoids ESM loader issues)
  moduleNameMapper: {
    '^vue$': '<rootDir>/node_modules/vue/index.js',
    '^vue-router$': '<rootDir>/node_modules/vue-router/dist/vue-router.cjs',
    '^@vue/runtime-dom$': '<rootDir>/node_modules/@vue/runtime-dom/index.js',
    '^@vue/runtime-core$': '<rootDir>/node_modules/@vue/runtime-core/index.js',
    '^@vue/reactivity$': '<rootDir>/node_modules/@vue/reactivity/index.js',
    '^@vue/shared$': '<rootDir>/node_modules/@vue/shared/index.js',
    '^@vue/compiler-dom$': '<rootDir>/node_modules/@vue/compiler-dom/index.js',
    '^@vue/compiler-core$': '<rootDir>/node_modules/@vue/compiler-core/index.js',
    '^@vue/server-renderer$': '<rootDir>/node_modules/@vue/server-renderer/index.js',
    '^@vue/compiler-sfc$': '<rootDir>/node_modules/@vue/compiler-sfc/index.js',
    '^@vue/test-utils$': '<rootDir>/node_modules/@vue/test-utils/dist/vue-test-utils.cjs.js',
    // Map paraty_geocore.js CDN URL to local TS source for Jest (Node.js cannot fetch https:// URLs)
    '^https://cdn\\.jsdelivr\\.net/gh/mpbarbosa/paraty_geocore\\.js@0\\.9\\.10-alpha/dist/esm/index\\.js$':
      '<rootDir>/../paraty_geocore.js/src/index',
    // Strip .js extension from relative imports so Jest resolves .ts before .js
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Try .ts before .js when resolving extensionless imports
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // ES Modules support (JS files stay untransformed; TS/Vue files use ts-jest)
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        allowJs: true,
        checkJs: false,
      },
    }],
    '^.+\\.vue$': '<rootDir>/jest.vue-transformer.cjs',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(vue)/)',
  ],
  
  // Performance
  maxWorkers: 1,
  cacheDirectory: '.jest-cache',
  
  // Standard timeout
  testTimeout: 30000,
  
  // All tests EXCEPT E2E (JS and TS)
  testMatch: [
    '**/__tests__/**/*.js',
    '**/__tests__/**/*.ts',
    '**/*.test.js',
    '**/*.test.ts',
  ],
  
  // Ignore E2E tests and helpers
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__mocks__/',
    '/__tests__/helpers/',
    '/__tests__/e2e/'  // EXCLUDE E2E tests
  ],
  
  // Coverage collection (JS and TS source files)
  collectCoverageFrom: [
    'src/**/*.js',
    'src/**/*.ts',
    'src/**/*.vue',
    '!src/**/*.test.js',
    '!src/**/*.test.ts',
    '!src/**/*.spec.js',
    '!src/**/*.spec.ts',
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
