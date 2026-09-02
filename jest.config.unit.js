import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// moduleNameMapper below points three bare specifiers at sibling checkouts:
// paraty_geocore.js, paraty_geoservices and bessa_patterns.ts. They are not
// optional — roughly a third of this suite imports them transitively.
//
// When a sibling is absent the failures are wildly misleading: the two
// integration suites report "Configuration error", while
// EventCoordinator.test.ts wraps its imports in a try/catch, swallows the
// resolution error, and surfaces it as "UICoordinator is not a constructor"
// because the assignments after the failed import never run. Dropping the
// mappings instead is worse still — 61 suites fail on unresolvable CDN URLs.
//
// So fail fast and say exactly what is missing.
const REQUIRED_SIBLINGS = ['paraty_geocore.js', 'paraty_geoservices', 'bessa_patterns.ts'];
const missing = REQUIRED_SIBLINGS.filter((pkg) => !existsSync(resolve(__dirname, '..', pkg, 'src')));

if (missing.length > 0) {
  throw new Error(
    `jest.config.unit.js: missing sibling checkout(s): ${missing.join(', ')}.\n` +
      `These are mapped to local source and are required by this suite.\n` +
      `Clone them next to this repository:\n` +
      missing.map((p) => `  git clone --depth 1 https://github.com/mpbarbosa/${p}.git ../${p}`).join('\n')
  );
}

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
     // Map paraty_geocore.js bare specifier to local TS source for Jest
     // (mirrors bessa_patterns.ts; production/Vite resolve it from node_modules)
     '^paraty_geocore\\.js$': '<rootDir>/../paraty_geocore.js/src/index',
     // Map paraty_geoservices CDN URLs to local TS source for Jest
     '^https://cdn\\.jsdelivr\\.net/gh/mpbarbosa/paraty_geoservices@v1\\.6\\.5/dist/index\\.js$':
       '<rootDir>/../paraty_geoservices/src/index',
     '^https://cdn\\.jsdelivr\\.net/gh/mpbarbosa/paraty_geoservices@v1\\.6\\.5/dist/esm/index\\.js$':
       '<rootDir>/../paraty_geoservices/src/index',
     '^https://cdn\\.jsdelivr\\.net/gh/mpbarbosa/paraty_geoservices@v1\\.6\\.5/dist/esm/application/services/ChangeDetectionCoordinator\\.js$':
       '<rootDir>/../paraty_geoservices/src/application/services/ChangeDetectionCoordinator',
     // Map bessa_patterns.ts bare specifier to local TS source for Jest
     '^bessa_patterns\\.ts$': '<rootDir>/../bessa_patterns.ts/src/index',
     // Strip .js extension from relative imports so Jest resolves .ts before .js
     // Uses ((?:\.{1,2}/)+) to handle any depth of ../ (e.g., ../../src/foo.js → ../../src/foo)
     '^((?:\\.{1,2}/)+.*)\\.js$': '$1',
     // Mock static assets (CSS, images, etc.) so imports don't fail
     '\\.(css|less|scss|sass|png|jpg|gif|svg|woff|woff2|ttf|eot)$': '<rootDir>/__mocks__/fileMock.js',
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
     '/__tests__/e2e/',  // EXCLUDE E2E tests
     '/dist/',  // Exclude compiled output (Vite copies test files to dist/)
     '/test/app.test.js',  // Functions not exported from src/app.js (uses window.GuiaApp instead)
     '/test/app.test.ts',  // Same as test/app.test.js: imports from './app' (no test/app.ts exists) and requires @testing-library/jest-dom which is not installed
     '/test/main.test.ts',  // jest.doMock ESM hoisting issue with App.vue
     '/test/utils/version-display-manager.test.ts',  // ESM jest.mock path resolution issue
     '/test/html/HTMLHeaderDisplayer.test.ts',  // ESM jest.mock path resolution issue
     '/test/speech/SpeechSynthesisManager.facade-wip.test.js',  // WIP file - .js extension stripping breaks resolution
     '/test/types/paraty-geocore.d.test.ts',  // Imports from CDN URL (not resolvable in Jest)
     '/test/types/paraty-geoservices.d.test.ts',  // Imports src/types/paraty-geoservices.d.ts — ambient module declaration files cannot be transpiled by ts-jest
     '/test/types/global.d.test.ts',  // Imports src/types/global.d.ts — TypeScript declaration files cannot be transpiled by ts-jest
     '/test/vite-env.d.test.ts',  // ScriptTransformer cannot handle this test file
     '/test/geolocation-banner.test',  // ESM read-only named exports — jest.spyOn not applicable
     '/test/error-recovery.test',  // ESM read-only named exports — jest.spyOn not applicable
     '/src/utils/logger.test',  // Tests logger.js [LOG] prefixes but moduleNameMapper resolves to logger.ts; covered by __tests__/utils/logger.test.ts
     // Debug/scaffolding tests: explore jest.mock() hoisting behaviour; not application tests
     '/test/services/_debug_factory.test',
     '/test/services/_debug_mock.test',
     '/test/services/_debug_modunder.test',
     '/test/services/_debug_unstable.test',
     '/test/services/_debug_unstable2.test',
     '/__tests__/debug/_mock_factory.test',
     '/__tests__/debug/_factory_test.test',
     '/__tests__/debug/_mock_test.test',
     '/__tests__/composables/useMapDisplayer.test.ts',  // ESM jest.mock path resolution issue with maplibre-gl; JS version at test/composables/useMapDisplayer.test.js provides equivalent coverage
     '/__tests__/composables/useNavigationHistory.test.ts',  // ESM jest.mock path resolution issue with AddressCache; JS version at test/composables/useNavigationHistory.test.js provides equivalent coverage
     '/__tests__/timing/sharedChronometer.test.ts',  // ESM jest.mock path resolution issue — jest.mock on Chronometer.js/PositionManager.js fails with --experimental-vm-modules
     '/__tests__/components/views/MonitorView.vue.test.ts',  // ESM jest.mock path resolution issue — jest.mock on sharedChronometer.js fails with --experimental-vm-modules
     '/__tests__/composables/useIBGECityStats.test.ts',  // ESM jest.mock path resolution issue with IBGECityStatsService; JS version at test/composables/useIBGECityStats.test.js provides equivalent coverage
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
   // Raised from 55/60/50/55 to match the values package.json's jest config
   // carried, so routing the coverage job through this config does not quietly
   // relax the gate. Actual coverage is 80.66/72.01/79.18/81.47, so these hold
   // with room to spare — the previously reported 0% was an artifact of the
   // default config matching only 9 .js suites that never touch the .ts source.
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
