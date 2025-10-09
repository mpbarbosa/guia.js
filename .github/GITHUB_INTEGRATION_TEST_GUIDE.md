# GitHub Integration Testing Guide for Guia.js

## Table of Contents

- [What is Integration Testing?](#what-is-integration-testing)
- [Why Integration Testing Matters](#why-integration-testing-matters)
- [Integration Testing Principles](#integration-testing-principles)
- [GitHub Actions Integration Testing](#github-actions-integration-testing)
- [Setting Up Integration Tests](#setting-up-integration-tests)
- [Writing Effective Integration Tests](#writing-effective-integration-tests)
- [Testing GitHub Workflows](#testing-github-workflows)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Examples](#examples)
- [Testing CI/CD Pipeline](#testing-cicd-pipeline)
- [Workflow Testing Strategies](#workflow-testing-strategies)
- [Debugging Integration Tests](#debugging-integration-tests)
- [Integration with Jest](#integration-with-jest)
- [Resources](#resources)

## What is Integration Testing?

**Integration testing** verifies that multiple components, modules, or services work correctly together. Unlike unit tests that isolate individual functions, integration tests validate the interactions and data flow between different parts of the system.

### Key Characteristics of Integration Tests

1. **Multi-component**: Tests multiple modules working together
2. **Realistic**: Uses real or near-real dependencies
3. **End-to-end flows**: Tests complete user scenarios
4. **Environment-aware**: May require specific configurations
5. **Slower execution**: Takes longer than unit tests (seconds vs milliseconds)

### Integration Tests vs Other Testing Types

| Type | Scope | Speed | Isolation | Example |
|------|-------|-------|-----------|---------|
| **Unit** | Single function/class | Fast (ms) | Complete | Test `formatAddress()` |
| **Integration** | Multiple components | Moderate (sec) | Partial | Test geocoding API + cache + parser |
| **E2E** | Full system | Slow (min) | None | Test user clicks through UI |

### Integration Testing in GitHub Context

In the context of GitHub and CI/CD:

- **Workflow Integration**: Testing GitHub Actions workflows
- **API Integration**: Testing GitHub API interactions
- **Service Integration**: Testing with external services (Nominatim, IBGE)
- **Environment Integration**: Testing across different environments (dev, staging, prod)
- **Tool Integration**: Testing build tools, linters, test runners together

## Why Integration Testing Matters

### 1. **Catches Interface Issues**

Integration tests catch problems at module boundaries:

```javascript
// Unit test passes: Cache works in isolation
test('cache stores value', () => {
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
});

// Integration test catches the real issue
test('geocoding with cache integration', async () => {
    const result1 = await geocodeWithCache('São Paulo');
    const result2 = await geocodeWithCache('São Paulo');
    
    // Integration test reveals cache key mismatch!
    expect(apiCallCount).toBe(1); // FAIL: Called API twice!
});
```

### 2. **Validates GitHub Actions Workflows**

Integration tests ensure CI/CD pipelines work correctly:

```javascript
// Test that workflow runs tests on PR
test('should run tests when PR is created', async () => {
    const workflow = await triggerWorkflow('pull_request');
    
    expect(workflow.jobs).toContain('run-affected-tests');
    expect(workflow.status).toBe('success');
});
```

### 3. **Tests Real Dependencies**

Integration tests use actual services and APIs:

```javascript
// Unit test with mock
test('fetchAddress mocked', async () => {
    fetch.mockResolvedValue({ json: () => mockData });
    const result = await fetchAddress('01310-200');
    expect(result.city).toBe('São Paulo');
});

// Integration test with real API
test('fetchAddress from real Nominatim API', async () => {
    const result = await fetchAddress('01310-200');
    expect(result.city).toContain('São Paulo');
    expect(result.lat).toBeCloseTo(-23.5, 0);
});
```

### 4. **Validates Complete User Flows**

Integration tests verify end-to-end scenarios:

```javascript
test('complete address lookup flow', async () => {
    // 1. Get user location
    const position = await getCurrentPosition();
    
    // 2. Geocode to address
    const address = await reverseGeocode(position);
    
    // 3. Cache result
    await cacheAddress(address);
    
    // 4. Display to user
    const display = formatAddressForDisplay(address);
    
    expect(display).toContain(address.city);
    expect(display).toContain(address.state);
});
```

### 5. **Environment Verification**

Integration tests ensure deployment environments work:

```javascript
test('should have required environment variables', () => {
    expect(process.env.NODE_ENV).toBeDefined();
    expect(process.env.API_BASE_URL).toBeDefined();
});

test('should connect to correct API endpoint', async () => {
    const endpoint = getApiEndpoint();
    expect(endpoint).toMatch(/^https:/);
    
    const response = await fetch(endpoint);
    expect(response.ok).toBe(true);
});
```

## Integration Testing Principles

### 1. Test Realistic Scenarios

Focus on actual user workflows and system interactions:

✅ **Good:**
```javascript
describe('Address Lookup Integration', () => {
    test('should geocode Brazilian address and cache result', async () => {
        // Real scenario: User searches for an address
        const query = 'Avenida Paulista, 1578, São Paulo';
        
        // First call hits API
        const result1 = await geocodeAndCache(query);
        expect(result1.source).toBe('api');
        
        // Second call uses cache
        const result2 = await geocodeAndCache(query);
        expect(result2.source).toBe('cache');
        expect(result2.lat).toBe(result1.lat);
    });
});
```

❌ **Avoid:**
```javascript
test('test everything', async () => {
    // Too broad and unclear what's being tested
    const result = await doEverything();
    expect(result).toBeTruthy();
});
```

### 2. Use Realistic Test Data

Use data that reflects actual usage:

✅ **Good:**
```javascript
const testAddresses = [
    'Avenida Paulista, 1578, São Paulo, SP',
    'Rua Oscar Freire, 379, Jardins, São Paulo',
    'Praça da Sé, Centro, São Paulo'
];
```

❌ **Avoid:**
```javascript
const testAddresses = ['test', '123', 'foo bar'];
```

### 3. Test Integration Points

Focus on where components connect:

```javascript
describe('GitHub Actions + Test Runner Integration', () => {
    test('workflow should detect changed test files', async () => {
        const changedFiles = await getChangedFiles();
        const shouldRunTests = detectTestChanges(changedFiles);
        
        expect(shouldRunTests).toBe(true);
    });
    
    test('workflow should update documentation after test changes', async () => {
        await modifyTestFile('__tests__/utils.test.js');
        const updated = await checkDocumentationUpdated();
        
        expect(updated).toBe(true);
    });
});
```

### 4. Handle External Dependencies

Manage external services appropriately:

```javascript
describe('Nominatim API Integration', () => {
    // Use real API sparingly
    test('should geocode with real Nominatim API', async () => {
        // Rate-limit friendly test
        const result = await geocode('São Paulo, Brasil');
        expect(result).toBeDefined();
    }, 10000); // Longer timeout for real API
    
    // Use mocks when rate limits are a concern
    test('should handle API rate limits gracefully', async () => {
        mockNominatimRateLimit();
        const result = await geocode('São Paulo');
        expect(result.error).toContain('rate limit');
    });
});
```

### 5. Tests Should Be Isolated

Each integration test should set up and tear down properly:

```javascript
describe('Address Cache Integration', () => {
    beforeEach(async () => {
        await cache.clear();
        await database.reset();
    });
    
    afterEach(async () => {
        await cache.clear();
        await database.reset();
    });
    
    test('should store and retrieve address', async () => {
        const address = await geocode('São Paulo');
        await cache.store(address);
        
        const retrieved = await cache.retrieve('São Paulo');
        expect(retrieved).toEqual(address);
    });
});
```

## GitHub Actions Integration Testing

### Testing Workflow Files

#### 1. Syntax Validation

```javascript
describe('GitHub Actions Workflow Syntax', () => {
    test('modified-files.yml should be valid YAML', () => {
        const fs = require('fs');
        const yaml = require('js-yaml');
        
        const workflowPath = '.github/workflows/modified-files.yml';
        const content = fs.readFileSync(workflowPath, 'utf8');
        
        expect(() => yaml.load(content)).not.toThrow();
    });
    
    test('workflow should have required fields', () => {
        const workflow = loadWorkflow('modified-files.yml');
        
        expect(workflow).toHaveProperty('name');
        expect(workflow).toHaveProperty('on');
        expect(workflow).toHaveProperty('jobs');
    });
});
```

#### 2. Job Dependencies

```javascript
describe('Workflow Job Dependencies', () => {
    test('update-test-documentation should depend on run-affected-tests', () => {
        const workflow = loadWorkflow('modified-files.yml');
        const updateJob = workflow.jobs['update-test-documentation'];
        
        expect(updateJob.needs).toContain('run-affected-tests');
    });
    
    test('jobs should run in correct order', () => {
        const workflow = loadWorkflow('modified-files.yml');
        const jobOrder = getJobExecutionOrder(workflow);
        
        expect(jobOrder.indexOf('detect-changes')).toBeLessThan(
            jobOrder.indexOf('run-affected-tests')
        );
    });
});
```

#### 3. Trigger Conditions

```javascript
describe('Workflow Triggers', () => {
    test('should trigger on push to main branch', () => {
        const workflow = loadWorkflow('modified-files.yml');
        
        expect(workflow.on.push.branches).toContain('main');
    });
    
    test('should trigger on pull request to main', () => {
        const workflow = loadWorkflow('modified-files.yml');
        
        expect(workflow.on.pull_request.branches).toContain('main');
    });
});
```

### Testing Custom Actions

```javascript
describe('Custom GitHub Action: detect-affected-tests', () => {
    test('should detect tests for changed source files', async () => {
        const changedFiles = ['src/guia.js'];
        const affectedTests = await detectAffectedTests(changedFiles);
        
        expect(affectedTests).toContain('__tests__/CurrentPosition.test.js');
        expect(affectedTests).toContain('__tests__/utils.test.js');
    });
    
    test('should run all tests when package.json changes', async () => {
        const changedFiles = ['package.json'];
        const affectedTests = await detectAffectedTests(changedFiles);
        
        expect(affectedTests).toBe('all');
    });
});
```

### Testing Auto-commit Functionality

```javascript
describe('Auto-commit Integration', () => {
    test('should update TESTING.md timestamp', async () => {
        const before = fs.readFileSync('TESTING.md', 'utf8');
        
        await updateTestDocumentation();
        
        const after = fs.readFileSync('TESTING.md', 'utf8');
        expect(after).not.toBe(before);
        expect(after).toMatch(/Last updated automatically by GitHub Actions/);
    });
    
    test('should commit with [skip ci] flag', async () => {
        await updateTestDocumentation();
        
        const lastCommit = await getLastCommitMessage();
        expect(lastCommit).toContain('[skip ci]');
    });
});
```

## Setting Up Integration Tests

### Project Structure

```
guia_js/
├── src/
│   ├── guia.js
│   └── guia_ibge.js
├── __tests__/
│   ├── unit/                    # Unit tests
│   │   ├── utils.test.js
│   │   └── validators.test.js
│   ├── integration/             # Integration tests
│   │   ├── geocoding.integration.test.js
│   │   ├── cache.integration.test.js
│   │   └── workflow.integration.test.js
│   └── e2e/                     # End-to-end tests
│       └── user-flow.e2e.test.js
├── .github/
│   ├── workflows/
│   │   └── modified-files.yml
│   └── actions/
│       └── detect-affected-tests/
└── package.json
```

### Jest Configuration for Integration Tests

```json
{
  "jest": {
    "testEnvironment": "node",
    "projects": [
      {
        "displayName": "unit",
        "testMatch": ["**/__tests__/unit/**/*.test.js"],
        "testEnvironment": "node"
      },
      {
        "displayName": "integration",
        "testMatch": ["**/__tests__/integration/**/*.test.js"],
        "testEnvironment": "node",
        "testTimeout": 30000
      }
    ],
    "collectCoverageFrom": [
      "src/*.js",
      ".github/actions/**/*.js",
      "!node_modules/**"
    ]
  }
}
```

### Running Integration Tests

```bash
# Run only integration tests
npm test -- --selectProjects=integration

# Run all tests
npm test

# Run integration tests with coverage
npm test -- --selectProjects=integration --coverage

# Run specific integration test
npm test geocoding.integration.test.js

# Run integration tests in watch mode
npm test -- --selectProjects=integration --watch
```

### Environment Setup

```javascript
// __tests__/integration/setup.js
beforeAll(async () => {
    // Set up test environment
    process.env.NODE_ENV = 'test';
    process.env.API_TIMEOUT = '10000';
    
    // Clear caches
    await clearAllCaches();
    
    // Initialize test database
    await initTestDatabase();
});

afterAll(async () => {
    // Clean up
    await clearAllCaches();
    await closeDatabase();
});
```

## Writing Effective Integration Tests

### Test Naming Convention

Use descriptive names that explain the integration scenario:

✅ **Good:**
```javascript
test('should geocode address using Nominatim API and cache result', async () => {});
test('workflow should run tests when JavaScript files change', async () => {});
test('should update documentation after test file changes', async () => {});
test('should handle API rate limit and use cached data', async () => {});
```

❌ **Avoid:**
```javascript
test('geocoding', async () => {});
test('test workflow', async () => {});
test('test1', async () => {});
```

### Test Organization

Group related integration tests:

```javascript
describe('Address Geocoding Integration', () => {
    describe('API + Cache Integration', () => {
        test('should cache API response', async () => {});
        test('should use cache on subsequent requests', async () => {});
        test('should refresh cache after expiration', async () => {});
    });
    
    describe('API Error Handling', () => {
        test('should handle network errors gracefully', async () => {});
        test('should retry failed requests', async () => {});
        test('should fallback to cache on API failure', async () => {});
    });
});
```

### Testing Async Flows

```javascript
describe('Async Integration Flows', () => {
    test('should complete full address lookup flow', async () => {
        // Start async operation
        const promise = geocodeAndCache('São Paulo');
        
        // Verify intermediate state
        expect(isLoading()).toBe(true);
        
        // Wait for completion
        const result = await promise;
        
        // Verify final state
        expect(isLoading()).toBe(false);
        expect(result).toBeDefined();
        expect(result.city).toBe('São Paulo');
    });
    
    test('should handle parallel requests correctly', async () => {
        const queries = [
            'São Paulo, SP',
            'Rio de Janeiro, RJ',
            'Brasília, DF'
        ];
        
        const results = await Promise.all(
            queries.map(q => geocodeAndCache(q))
        );
        
        expect(results).toHaveLength(3);
        results.forEach(result => {
            expect(result).toHaveProperty('lat');
            expect(result).toHaveProperty('lon');
        });
    });
});
```

## Testing GitHub Workflows

### Workflow File Testing

```javascript
// __tests__/integration/workflow.integration.test.js
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

describe('GitHub Workflows Integration', () => {
    let workflow;
    
    beforeAll(() => {
        const workflowPath = path.join(__dirname, '../../.github/workflows/modified-files.yml');
        const content = fs.readFileSync(workflowPath, 'utf8');
        workflow = yaml.load(content);
    });
    
    describe('Workflow Structure', () => {
        test('should have valid workflow name', () => {
            expect(workflow.name).toBe('Modified Files - Test and Documentation Updates');
        });
        
        test('should have required permissions', () => {
            expect(workflow.permissions).toHaveProperty('contents', 'write');
            expect(workflow.permissions).toHaveProperty('pull-requests', 'write');
        });
        
        test('should trigger on push and pull_request', () => {
            expect(workflow.on).toHaveProperty('push');
            expect(workflow.on).toHaveProperty('pull_request');
        });
    });
    
    describe('Job Configuration', () => {
        test('should have all required jobs', () => {
            const expectedJobs = [
                'detect-changes',
                'run-affected-tests',
                'update-test-documentation',
                'validate-documentation',
                'summary'
            ];
            
            expectedJobs.forEach(job => {
                expect(workflow.jobs).toHaveProperty(job);
            });
        });
        
        test('detect-changes job should have correct outputs', () => {
            const job = workflow.jobs['detect-changes'];
            
            expect(job.outputs).toHaveProperty('js_files');
            expect(job.outputs).toHaveProperty('test_files');
            expect(job.outputs).toHaveProperty('doc_files');
        });
        
        test('run-affected-tests should depend on detect-changes', () => {
            const job = workflow.jobs['run-affected-tests'];
            
            expect(job.needs).toBe('detect-changes');
        });
    });
    
    describe('Job Steps Validation', () => {
        test('run-affected-tests should install dependencies', () => {
            const job = workflow.jobs['run-affected-tests'];
            const installStep = job.steps.find(step => 
                step.name === 'Install dependencies'
            );
            
            expect(installStep).toBeDefined();
            expect(installStep.run).toContain('npm ci');
        });
        
        test('should run tests with coverage', () => {
            const job = workflow.jobs['run-affected-tests'];
            const coverageStep = job.steps.find(step =>
                step.run && step.run.includes('test:coverage')
            );
            
            expect(coverageStep).toBeDefined();
        });
    });
});
```

### Testing Workflow Triggers

```javascript
describe('Workflow Trigger Integration', () => {
    test('should trigger on JavaScript file changes', async () => {
        const changedFiles = ['src/guia.js'];
        const shouldTrigger = checkWorkflowTrigger('modified-files.yml', changedFiles);
        
        expect(shouldTrigger).toBe(true);
    });
    
    test('should trigger on test file changes', async () => {
        const changedFiles = ['__tests__/utils.test.js'];
        const shouldTrigger = checkWorkflowTrigger('modified-files.yml', changedFiles);
        
        expect(shouldTrigger).toBe(true);
    });
    
    test('should trigger on documentation changes', async () => {
        const changedFiles = ['TESTING.md', 'docs/API.md'];
        const shouldTrigger = checkWorkflowTrigger('modified-files.yml', changedFiles);
        
        expect(shouldTrigger).toBe(true);
    });
});
```

## Best Practices

### 1. Test Real Integrations Selectively

Balance between real and mocked dependencies:

✅ **Good:**
```javascript
describe('Geocoding Service Integration', () => {
    // Use real API for critical paths
    test('should geocode with real Nominatim API', async () => {
        const result = await geocode('São Paulo, Brasil');
        expect(result.lat).toBeCloseTo(-23.5, 0);
    }, 30000); // Allow time for real API
    
    // Use mocks for error scenarios
    test('should handle API errors', async () => {
        mockNominatimError();
        await expect(geocode('invalid')).rejects.toThrow();
    });
});
```

### 2. Use Test Fixtures

Create reusable test data:

```javascript
// __tests__/fixtures/addresses.js
module.exports = {
    saoPaulo: {
        address: 'Avenida Paulista, 1578, São Paulo, SP',
        expected: {
            street: 'Avenida Paulista',
            number: '1578',
            city: 'São Paulo',
            state: 'SP',
            lat: -23.5613,
            lon: -46.6565
        }
    },
    rioDeJaneiro: {
        address: 'Avenida Atlântica, Copacabana, Rio de Janeiro',
        expected: {
            neighborhood: 'Copacabana',
            city: 'Rio de Janeiro',
            state: 'RJ',
            lat: -22.9707,
            lon: -43.1823
        }
    }
};

// Usage in tests
const fixtures = require('./fixtures/addresses');

test('should geocode São Paulo address', async () => {
    const result = await geocode(fixtures.saoPaulo.address);
    expect(result.city).toBe(fixtures.saoPaulo.expected.city);
});
```

### 3. Handle Timing Issues

Integration tests may have timing sensitivities:

```javascript
describe('Async Integration with Timing', () => {
    test('should wait for cache to update', async () => {
        await geocodeAndCache('São Paulo');
        
        // Wait for async cache update
        await waitFor(() => cache.has('São Paulo'), { timeout: 5000 });
        
        const cached = await cache.get('São Paulo');
        expect(cached).toBeDefined();
    });
    
    test('should handle debounced operations', async () => {
        const mockCallback = jest.fn();
        const debounced = debounce(mockCallback, 500);
        
        // Trigger multiple times
        debounced('call1');
        debounced('call2');
        debounced('call3');
        
        // Wait for debounce period
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Only last call should execute
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith('call3');
    });
});
```

### 4. Clean Up After Tests

Ensure tests don't leave artifacts:

```javascript
describe('Integration Test Cleanup', () => {
    let tempFiles = [];
    
    afterEach(async () => {
        // Clean up temporary files
        for (const file of tempFiles) {
            await fs.unlink(file);
        }
        tempFiles = [];
        
        // Clear caches
        await cache.clear();
        
        // Reset mocks
        jest.clearAllMocks();
    });
    
    test('should create temporary test file', async () => {
        const tempFile = await createTempFile('test content');
        tempFiles.push(tempFile);
        
        expect(await fileExists(tempFile)).toBe(true);
    });
});
```

### 5. Test Error Recovery

Integration tests should verify error handling:

```javascript
describe('Error Recovery Integration', () => {
    test('should recover from API failure using cache', async () => {
        // First call succeeds and caches
        const result1 = await geocodeWithCache('São Paulo');
        expect(result1.source).toBe('api');
        
        // Simulate API failure
        mockNominatimError();
        
        // Should fallback to cache
        const result2 = await geocodeWithCache('São Paulo');
        expect(result2.source).toBe('cache');
        expect(result2.lat).toBe(result1.lat);
    });
    
    test('should retry on transient failures', async () => {
        let attempts = 0;
        mockNominatimWithRetry(() => {
            attempts++;
            return attempts < 3 ? 'error' : 'success';
        });
        
        const result = await geocodeWithRetry('São Paulo', { maxRetries: 3 });
        
        expect(attempts).toBe(3);
        expect(result).toBeDefined();
    });
});
```

## Common Patterns

### Pattern 1: Testing API Integration

```javascript
describe('Nominatim API Integration', () => {
    test('should geocode Brazilian address', async () => {
        const result = await nominatimGeocode('Avenida Paulista, São Paulo');
        
        expect(result).toHaveProperty('lat');
        expect(result).toHaveProperty('lon');
        expect(result).toHaveProperty('display_name');
        expect(result.display_name).toContain('São Paulo');
    }, 30000);
    
    test('should handle API rate limiting', async () => {
        // Make multiple rapid requests
        const promises = Array(5).fill().map((_, i) =>
            nominatimGeocode(`Address ${i}, São Paulo`)
        );
        
        const results = await Promise.allSettled(promises);
        
        // Some should succeed, some may be rate limited
        const succeeded = results.filter(r => r.status === 'fulfilled');
        expect(succeeded.length).toBeGreaterThan(0);
    }, 60000);
});
```

### Pattern 2: Testing Cache Integration

```javascript
describe('Cache + API Integration', () => {
    beforeEach(async () => {
        await cache.clear();
    });
    
    test('should cache API results', async () => {
        const query = 'São Paulo, Brasil';
        
        // First call hits API
        const start1 = Date.now();
        const result1 = await geocodeWithCache(query);
        const duration1 = Date.now() - start1;
        
        // Second call uses cache (much faster)
        const start2 = Date.now();
        const result2 = await geocodeWithCache(query);
        const duration2 = Date.now() - start2;
        
        expect(result1).toEqual(result2);
        expect(duration2).toBeLessThan(duration1 / 10); // Cache is 10x faster
    });
    
    test('should invalidate expired cache entries', async () => {
        const query = 'Rio de Janeiro';
        
        // Cache with short TTL
        await geocodeWithCache(query, { ttl: 100 });
        
        // Wait for expiration
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Should hit API again
        const apiCallsBefore = getApiCallCount();
        await geocodeWithCache(query);
        const apiCallsAfter = getApiCallCount();
        
        expect(apiCallsAfter).toBe(apiCallsBefore + 1);
    });
});
```

### Pattern 3: Testing Workflow Actions

```javascript
describe('GitHub Actions Integration', () => {
    test('should detect affected tests based on changed files', () => {
        const changedFiles = [
            'src/guia.js',
            'src/utils.js'
        ];
        
        const affectedTests = detectAffectedTests(changedFiles);
        
        expect(affectedTests).toContain('__tests__/CurrentPosition.test.js');
        expect(affectedTests).toContain('__tests__/utils.test.js');
    });
    
    test('should update documentation timestamp', async () => {
        const before = await readFile('TESTING.md');
        
        await updateTestingDocumentation();
        
        const after = await readFile('TESTING.md');
        expect(after).toMatch(/Last updated automatically.*\d{4}-\d{2}-\d{2}/);
        expect(after).not.toBe(before);
    });
});
```

### Pattern 4: Testing Multiple Component Integration

```javascript
describe('Multi-Component Integration', () => {
    test('complete address lookup flow', async () => {
        // 1. Get geolocation
        const position = await getCurrentPosition();
        expect(position).toHaveProperty('lat');
        expect(position).toHaveProperty('lon');
        
        // 2. Reverse geocode
        const address = await reverseGeocode(position);
        expect(address).toHaveProperty('city');
        
        // 3. Format for display
        const formatted = formatAddress(address);
        expect(formatted).toContain(address.city);
        
        // 4. Cache result
        await cacheAddress(position, address);
        
        // 5. Verify cached
        const cached = await getCachedAddress(position);
        expect(cached).toEqual(address);
    });
});
```

## Examples

### Example 1: Geocoding Service Integration

```javascript
// __tests__/integration/geocoding.integration.test.js
describe('Geocoding Service Integration', () => {
    describe('Nominatim API Integration', () => {
        test('should geocode Brazilian capital cities', async () => {
            const cities = ['São Paulo', 'Rio de Janeiro', 'Brasília'];
            
            for (const city of cities) {
                const result = await geocode(`${city}, Brasil`);
                
                expect(result).toBeDefined();
                expect(result.display_name).toContain(city);
                expect(result.lat).toBeDefined();
                expect(result.lon).toBeDefined();
                
                // Respect API rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }, 30000);
        
        test('should handle special characters in Brazilian addresses', async () => {
            const addresses = [
                'Avenida Paulista, São Paulo',
                'Praia de Copacabana, Rio de Janeiro',
                'Estação da Luz, São Paulo'
            ];
            
            for (const address of addresses) {
                const result = await geocode(address);
                expect(result).toBeDefined();
                expect(result.display_name).toBeTruthy();
                
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }, 30000);
    });
    
    describe('Cache Integration', () => {
        beforeEach(async () => {
            await AddressCache.getInstance().clearCache();
        });
        
        test('should use cache for repeated queries', async () => {
            const query = 'Avenida Paulista, São Paulo';
            
            // First call
            const result1 = await geocodeWithCache(query);
            const cacheSize1 = AddressCache.getInstance().cacheSize;
            
            // Second call (should use cache)
            const result2 = await geocodeWithCache(query);
            const cacheSize2 = AddressCache.getInstance().cacheSize;
            
            expect(result1).toEqual(result2);
            expect(cacheSize2).toBe(cacheSize1); // Cache not grown
        });
    });
});
```

### Example 2: GitHub Workflow Integration

```javascript
// __tests__/integration/workflow.integration.test.js
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

describe('GitHub Workflow Integration', () => {
    let workflows;
    
    beforeAll(() => {
        const workflowsDir = path.join(__dirname, '../../.github/workflows');
        const files = fs.readdirSync(workflowsDir)
            .filter(f => f.endsWith('.yml'));
        
        workflows = {};
        files.forEach(file => {
            const content = fs.readFileSync(
                path.join(workflowsDir, file),
                'utf8'
            );
            workflows[file] = yaml.load(content);
        });
    });
    
    describe('Workflow Files Validation', () => {
        test('all workflow files should be valid YAML', () => {
            expect(Object.keys(workflows).length).toBeGreaterThan(0);
            
            Object.entries(workflows).forEach(([name, workflow]) => {
                expect(workflow).toBeDefined();
                expect(workflow.name).toBeTruthy();
            });
        });
        
        test('modified-files.yml should have correct structure', () => {
            const workflow = workflows['modified-files.yml'];
            
            expect(workflow.name).toBe('Modified Files - Test and Documentation Updates');
            expect(workflow.on).toHaveProperty('push');
            expect(workflow.on).toHaveProperty('pull_request');
            expect(workflow.permissions.contents).toBe('write');
        });
    });
    
    describe('Job Dependencies', () => {
        test('jobs should have correct dependency chain', () => {
            const workflow = workflows['modified-files.yml'];
            
            // run-affected-tests depends on detect-changes
            expect(workflow.jobs['run-affected-tests'].needs).toBe('detect-changes');
            
            // update-test-documentation depends on both
            const updateJob = workflow.jobs['update-test-documentation'];
            expect(updateJob.needs).toContain('detect-changes');
            expect(updateJob.needs).toContain('run-affected-tests');
        });
    });
    
    describe('Custom Actions Integration', () => {
        test('detect-affected-tests action should exist', () => {
            const actionPath = path.join(
                __dirname,
                '../../.github/actions/detect-affected-tests/action.yml'
            );
            
            expect(fs.existsSync(actionPath)).toBe(true);
        });
        
        test('custom actions should be used in workflow', () => {
            const workflow = workflows['modified-files.yml'];
            const workflowContent = fs.readFileSync(
                path.join(__dirname, '../../.github/workflows/modified-files.yml'),
                'utf8'
            );
            
            expect(workflowContent).toContain('detect-affected-tests');
        });
    });
});
```

### Example 3: End-to-End Workflow Test

```javascript
// __tests__/integration/e2e-workflow.integration.test.js
describe('End-to-End Workflow Integration', () => {
    test('complete CI/CD pipeline simulation', async () => {
        // 1. Simulate file change
        const changedFiles = ['src/guia.js', '__tests__/utils.test.js'];
        
        // 2. Detect changes
        const changes = await detectFileChanges(changedFiles);
        expect(changes.js_files).toBe(true);
        expect(changes.test_files).toBe(true);
        
        // 3. Run affected tests
        const testResults = await runAffectedTests(changes);
        expect(testResults.passed).toBe(true);
        expect(testResults.testCount).toBeGreaterThan(0);
        
        // 4. Update documentation
        const docUpdated = await updateDocumentation(changes);
        expect(docUpdated).toBe(true);
        
        // 5. Validate documentation
        const validationResults = await validateDocumentation();
        expect(validationResults.valid).toBe(true);
        
        // 6. Generate summary
        const summary = await generateSummary({
            changes,
            testResults,
            docUpdated,
            validationResults
        });
        
        expect(summary).toContain('Changes Detected');
        expect(summary).toContain('Tests: success');
    });
});
```

## Testing CI/CD Pipeline

### Testing Workflow Execution

```javascript
describe('CI/CD Pipeline Integration', () => {
    test('should execute complete pipeline for source changes', async () => {
        // Simulate push event
        const event = {
            type: 'push',
            branch: 'main',
            files: ['src/guia.js']
        };
        
        // Execute pipeline
        const result = await executePipeline(event);
        
        // Verify all steps ran
        expect(result.steps).toContain('detect-changes');
        expect(result.steps).toContain('run-tests');
        expect(result.steps).toContain('validate-code');
        
        // Verify success
        expect(result.status).toBe('success');
    });
    
    test('should skip unnecessary jobs', async () => {
        const event = {
            type: 'push',
            branch: 'main',
            files: ['README.md']
        };
        
        const result = await executePipeline(event);
        
        // Tests should be skipped for doc-only changes
        expect(result.skippedJobs).toContain('run-tests');
    });
});
```

### Testing Auto-commit Integration

```javascript
describe('Auto-commit Integration', () => {
    test('should auto-commit documentation updates', async () => {
        // Modify test file
        await modifyFile('__tests__/utils.test.js');
        
        // Run workflow
        await runWorkflow('modified-files');
        
        // Check for auto-commit
        const commits = await getRecentCommits(1);
        expect(commits[0].message).toContain('auto-update TESTING.md');
        expect(commits[0].author).toBe('github-actions[bot]');
        expect(commits[0].message).toContain('[skip ci]');
    });
});
```

## Workflow Testing Strategies

### Strategy 1: Local Workflow Testing

```bash
# Use act to run workflows locally
act push -j detect-changes

# Test specific job
act -j run-affected-tests

# Test with specific event
act push -e test-event.json
```

### Strategy 2: Branch-based Testing

```javascript
describe('Branch-specific Workflow Behavior', () => {
    test('should run on push to main branch', async () => {
        const shouldRun = checkWorkflowTrigger({
            event: 'push',
            branch: 'main'
        });
        
        expect(shouldRun).toBe(true);
    });
    
    test('should run on PR to main branch', async () => {
        const shouldRun = checkWorkflowTrigger({
            event: 'pull_request',
            targetBranch: 'main'
        });
        
        expect(shouldRun).toBe(true);
    });
    
    test('should not run on push to feature branch', async () => {
        const shouldRun = checkWorkflowTrigger({
            event: 'push',
            branch: 'feature/new-feature'
        });
        
        expect(shouldRun).toBe(false);
    });
});
```

### Strategy 3: Conditional Job Testing

```javascript
describe('Conditional Job Execution', () => {
    test('run-affected-tests should run when JS files change', () => {
        const workflow = loadWorkflow('modified-files.yml');
        const condition = workflow.jobs['run-affected-tests'].if;
        
        const context = {
            needs: {
                'detect-changes': {
                    outputs: {
                        js_files: 'true'
                    }
                }
            }
        };
        
        const shouldRun = evaluateCondition(condition, context);
        expect(shouldRun).toBe(true);
    });
});
```

## Debugging Integration Tests

### Debugging Techniques

```javascript
describe('Debugging Integration Tests', () => {
    test('should provide detailed error information', async () => {
        try {
            await geocode('invalid address');
            fail('Should have thrown an error');
        } catch (error) {
            // Log detailed error information
            console.log('Error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response,
                statusCode: error.statusCode
            });
            
            expect(error.message).toContain('geocoding failed');
        }
    });
    
    test('should log API requests for debugging', async () => {
        const logger = createTestLogger();
        
        await geocodeWithLogging('São Paulo', { logger });
        
        expect(logger.logs).toContainEqual(
            expect.objectContaining({
                level: 'info',
                message: expect.stringContaining('API request')
            })
        );
    });
});
```

### Performance Monitoring

```javascript
describe('Integration Test Performance', () => {
    test('should complete within acceptable time', async () => {
        const start = Date.now();
        
        await geocodeWithCache('São Paulo');
        
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(5000); // 5 seconds max
    });
    
    test('should track API call count', async () => {
        const tracker = createApiTracker();
        
        await geocode('São Paulo', { tracker });
        await geocode('Rio de Janeiro', { tracker });
        
        expect(tracker.getCallCount()).toBe(2);
    });
});
```

## Integration with Jest

### Jest Configuration for Integration Tests

```javascript
// jest.config.integration.js
module.exports = {
    displayName: 'integration',
    testMatch: ['**/__tests__/integration/**/*.test.js'],
    testEnvironment: 'node',
    testTimeout: 30000, // 30 seconds for integration tests
    setupFilesAfterEnv: ['<rootDir>/__tests__/integration/setup.js'],
    globalSetup: '<rootDir>/__tests__/integration/globalSetup.js',
    globalTeardown: '<rootDir>/__tests__/integration/globalTeardown.js',
    coverageDirectory: 'coverage/integration',
    collectCoverageFrom: [
        'src/**/*.js',
        '.github/actions/**/*.js',
        '!**/*.test.js',
        '!**/node_modules/**'
    ]
};
```

### Global Setup and Teardown

```javascript
// __tests__/integration/globalSetup.js
module.exports = async () => {
    console.log('Setting up integration test environment...');
    
    // Set environment variables
    process.env.NODE_ENV = 'test';
    process.env.API_BASE_URL = 'https://nominatim.openstreetmap.org';
    
    // Initialize services
    await initializeTestServices();
    
    console.log('Integration test environment ready');
};

// __tests__/integration/globalTeardown.js
module.exports = async () => {
    console.log('Cleaning up integration test environment...');
    
    // Clean up resources
    await cleanupTestServices();
    
    console.log('Integration test environment cleaned up');
};
```

## Resources

### Internal Documentation

- **[TESTING.md](../TESTING.md)** - Overall testing guide and setup
- **[UNIT_TEST_GUIDE.md](./UNIT_TEST_GUIDE.md)** - Unit testing best practices
- **[TDD_GUIDE.md](./TDD_GUIDE.md)** - Test-driven development approach
- **[docs/github/GITHUB_ACTIONS_GUIDE.md](../docs/github/GITHUB_ACTIONS_GUIDE.md)** - Workflow documentation
- **[WORKFLOW_SETUP.md](../WORKFLOW_SETUP.md)** - Workflow implementation details
- **[CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md)** - Review checklist for tests
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines

### GitHub Actions Documentation

- **[GitHub Actions Documentation](https://docs.github.com/en/actions)** - Official documentation
- **[Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)** - Complete workflow syntax reference
- **[Creating Actions](https://docs.github.com/en/actions/creating-actions)** - How to create custom actions
- **[Events that Trigger Workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)** - All available triggers

### Testing Resources

- **[Jest Documentation](https://jestjs.io/)** - Official Jest documentation
- **[Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)** - Comprehensive guide
- **[Integration Testing Patterns](https://martinfowler.com/articles/practical-test-pyramid.html)** - Martin Fowler's test pyramid

### Tools

- **[act](https://github.com/nektos/act)** - Run GitHub Actions locally
- **[yaml-lint](https://www.yamllint.com/)** - Validate YAML syntax
- **[actionlint](https://github.com/rhysd/actionlint)** - GitHub Actions workflow linter

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-15  
**Status**: ✅ Ready for use  
**Maintained by**: Guia.js Team

---

## Quick Reference Card

### Integration Test Commands
```bash
npm test                              # Run all tests
npm test -- --selectProjects=integration  # Run only integration tests
npm test geocoding.integration.test.js    # Run specific integration test
npm test -- --coverage                # Integration tests with coverage
```

### Integration Test Structure
```javascript
describe('Component Integration', () => {
    beforeAll(async () => {
        // Global setup for all tests in suite
    });
    
    beforeEach(async () => {
        // Setup before each test
        await clearCache();
    });
    
    afterEach(async () => {
        // Cleanup after each test
    });
    
    afterAll(async () => {
        // Global cleanup
    });
    
    test('should integrate components A and B', async () => {
        // Arrange: Set up test scenario
        const input = createTestData();
        
        // Act: Execute integration
        const result = await integrateComponents(input);
        
        // Assert: Verify integration
        expect(result).toBeDefined();
    });
});
```

### Integration Testing Principles
- ✅ Test realistic scenarios and workflows
- ✅ Use real dependencies selectively
- ✅ Test component interactions
- ✅ Verify data flow between modules
- ✅ Handle external services appropriately
- ✅ Clean up after tests
- ✅ Test error recovery
- ✅ Monitor performance

### GitHub Workflow Testing
- ✅ Validate workflow YAML syntax
- ✅ Test job dependencies
- ✅ Verify trigger conditions
- ✅ Test custom actions
- ✅ Validate auto-commit behavior
- ✅ Test conditional job execution
- ✅ Verify permissions and secrets

### When to Use Integration Tests
- ✅ Testing API + cache integration
- ✅ Testing GitHub Actions workflows
- ✅ Testing multi-component flows
- ✅ Validating CI/CD pipelines
- ✅ Testing external service integration
- ✅ Verifying end-to-end scenarios
