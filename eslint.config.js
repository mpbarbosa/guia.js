/**
 * ESLint Configuration for Guia Turístico
 * 
 * This configuration enforces code quality and consistency for object-oriented
 * JavaScript using ES6+ classes and modern patterns. Updated 2026-01-09 to
 * align with actual OOP architecture used throughout the codebase.
 * 
 * @since 2025-12-15
 * @updated 2026-01-09 - Removed anti-OOP rules to match codebase architecture
 */

export default [
  {
    // Configuration for all JavaScript files
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Jest globals
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    },
    rules: {
      // Code quality rules
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-console': 'off', // Allow console for logging in this project
      'prefer-const': 'warn',
      
      // OOP-friendly rules (added 2026-01-09)
      'no-useless-constructor': 'warn',
      'no-dupe-class-members': 'error',
      'constructor-super': 'error',
      'no-class-assign': 'error',
      'no-this-before-super': 'error'
    }
  },
  {
    // Specific rules for test files
    files: ['**/__tests__/**/*.js', '**/*.test.js', '**/tests/**/*.js'],
    rules: {
      // Tests can be more lenient with certain rules
      'no-unused-vars': 'off'  // Test files often import for side effects
    }
  }
];
