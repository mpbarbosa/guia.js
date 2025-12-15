/**
 * ESLint Configuration for Guia.js
 * 
 * This configuration enforces functional programming patterns by disallowing
 * the use of the 'this' keyword to promote immutability and pure functions.
 * 
 * @since 2025-12-15
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
      // Disallow the use of 'this' keyword - enforce functional programming
      'no-invalid-this': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ThisExpression',
          message: 'Use of "this" keyword is not allowed. Use functional programming patterns instead (pure functions, closures, factory functions).'
        }
      ],
      // Additional recommended rules
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-console': 'off', // Allow console for logging in this project
      'prefer-const': 'warn'
    }
  },
  {
    // Specific rules for test files - might need different rules
    files: ['**/__tests__/**/*.js', '**/*.test.js', '**/tests/**/*.js'],
    rules: {
      // Tests might need to check 'this' in mocks, so we can be more lenient
      // But still warn about it
      'no-invalid-this': 'off',
      'no-restricted-syntax': [
        'warn', // Changed from 'error' to 'warn' for tests
        {
          selector: 'ThisExpression',
          message: 'Use of "this" keyword is discouraged. Consider using functional patterns.'
        }
      ]
    }
  }
];
