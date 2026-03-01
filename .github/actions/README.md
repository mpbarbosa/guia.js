# GitHub Composite Actions

This directory contains reusable [composite actions](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action) used across CI/CD workflows.

## Actions

| Directory | Action | Description |
|-----------|--------|-------------|
| `detect-affected-tests/` | Detect Affected Tests | Detects which test files need to run based on changed source files |
| `security-check/` | Security Check | Performs basic security checks on JavaScript files |
| `update-doc-index/` | Update Documentation Index | Updates `docs/INDEX.md` with current documentation structure |
| `update-test-docs/` | Update Test Documentation | Updates test documentation files with current test statistics |
| `validate-js/` | Validate JavaScript | Syntax validation for JavaScript source files |

## Usage

Reference any action from a workflow file:

```yaml
- uses: ./.github/actions/security-check
  with:
    files: 'src/**/*.js'
```
