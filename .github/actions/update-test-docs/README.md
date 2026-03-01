# Update Test Documentation Action

Composite GitHub Action that updates test documentation files with current test statistics from a Jest results file.

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `test-results-file` | Path to the Jest results JSON file | No | `test-results.json` |

## Outputs

| Output | Description |
|--------|-------------|
| `updated` | `true` if documentation was updated, `false` otherwise |

## Usage

```yaml
- uses: ./.github/actions/update-test-docs
  with:
    test-results-file: test-results.json
```

## Purpose

Automatically keeps test count badges and documentation in sync after every CI run.
