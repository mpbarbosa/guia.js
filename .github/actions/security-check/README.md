# Security Check Action

Composite GitHub Action that performs basic security checks on JavaScript files (e.g., scanning for `eval()`, hardcoded credentials, and other security anti-patterns).

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `files` | Glob pattern for files to check | No | `*.js` |

## Usage

```yaml
- uses: ./.github/actions/security-check
  with:
    files: 'src/**/*.js'
```

## Checks Performed

- Detection of `eval()` usage
- Scan for hardcoded secrets/credentials
- Basic security anti-pattern detection
