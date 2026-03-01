# Detect Affected Tests Action

Composite GitHub Action that detects which test files need to be run based on changed source files.

## Inputs

| Input | Description | Required |
|-------|-------------|----------|
| `changed-files` | Comma-separated list of changed source files | Yes |

## Outputs

| Output | Description |
|--------|-------------|
| `test-files` | Test files that should be run |

## Usage

```yaml
- uses: ./.github/actions/detect-affected-tests
  with:
    changed-files: 'src/core/PositionManager.js,src/data/AddressCache.js'
```

## Purpose

Enables selective test execution in CI/CD, reducing pipeline time by only running tests affected by source changes.
