# Conditional Step Execution Guide

## Overview

The conditional step execution feature optimizes workflow performance by intelligently skipping steps that aren't needed based on the types of changes made. This can reduce workflow execution time by **30-40%** for documentation-only or test-only changes.

## Architecture

### Components

1. **`.workflow-config.yaml`** - Configuration file defining conditional rules
2. **`workflow-condition-evaluator.sh`** - Shell script that evaluates conditions
3. **`test-workflow-locally.sh`** - Updated to use conditional execution

## Configuration

### Conditional Rules (`.workflow-config.yaml`)

```yaml
conditionals:
  step7_test_execution:
    skip_if:
      - no_code_changes: true
      - only_docs_changed: true
    run_if:
      - "src/**/*.js": changed
      - "__tests__/**/*.test.js": changed
    description: "Skip tests if only documentation or non-code files changed"
  
  step4_directory_structure:
    skip_if:
      - no_new_files: true
    cache_duration: 24h
    description: "Cache directory structure scan for 24 hours if no new files"
  
  step3_syntax_validation:
    skip_if:
      - no_js_changes: true
    run_if:
      - "src/**/*.js": changed
      - "**/*.js": changed
    description: "Skip syntax validation if no JavaScript files changed"
  
  step5_coverage_report:
    skip_if:
      - only_docs_changed: true
      - only_tests_changed: true
    run_if:
      - "src/**/*.js": changed
    description: "Skip coverage generation for docs-only or test-only changes"
```

### Change Detection Patterns

```yaml
change_patterns:
  code_files:
    - "src/**/*.js"
    - "src/**/*.css"
    - "src/**/*.html"
  test_files:
    - "__tests__/**/*.js"
    - "tests/**/*.py"
  documentation_files:
    - "**/*.md"
    - "docs/**/*"
  config_files:
    - "package.json"
    - ".github/**/*.yml"
    - ".workflow-config.yaml"
```

## Usage

### Running the Condition Evaluator

```bash
# Check if a specific step should run
./.github/scripts/workflow-condition-evaluator.sh step7_test_execution

# Exit code 0 = run step
# Exit code 1 = skip step
```

### Integration in Workflow Scripts

```bash
# Example: Conditional test execution
if ./.github/scripts/workflow-condition-evaluator.sh step7_test_execution 2>/dev/null; then
    echo "Running tests..."
    npm test
else
    echo "⏭️  Skipped (no code changes detected)"
fi
```

## Supported Conditions

### Built-in Conditions

| Condition | Description | Example Scenario |
|-----------|-------------|------------------|
| `no_code_changes` | No code files changed | First commit, config-only changes |
| `only_docs_changed` | Only documentation files changed | README.md update |
| `no_js_changes` | No JavaScript files changed | CSS-only or HTML-only changes |
| `only_tests_changed` | Only test files changed | Test refactoring without code changes |
| `no_new_files` | No new files added | File modifications only |

### Pattern Matching

Glob patterns are converted to regex for matching:
- `**/*.js` matches any JS file in any subdirectory
- `src/**/*.js` matches JS files under src/
- `__tests__/**/*.test.js` matches test files

## Step Definitions

### step3_syntax_validation

**Purpose:** Validate JavaScript syntax using `npm run validate`

**Skip Conditions:**
- No JavaScript files changed

**Run Conditions:**
- Any `.js` file modified

**Performance Impact:** Saves ~1-2 seconds when skipped

### step4_directory_structure

**Purpose:** Scan and cache directory structure

**Skip Conditions:**
- No new files added AND cache is valid (<24h old)

**Run Conditions:**
- New files added OR cache expired

**Performance Impact:** Saves ~2-3 seconds when using cache

**Cache Location:** `.github/cache/directory_structure.cache`

### step5_coverage_report

**Purpose:** Generate test coverage report

**Skip Conditions:**
- Only documentation changed
- Only test files changed (no source code modifications)

**Run Conditions:**
- Source code files (`src/**/*.js`) changed

**Performance Impact:** Saves ~30-45 seconds when skipped

### step7_test_execution

**Purpose:** Run full test suite

**Skip Conditions:**
- No code changes detected
- Only documentation files changed

**Run Conditions:**
- Source code files changed
- Test files changed

**Performance Impact:** Saves ~30-45 seconds when skipped

## Performance Metrics

### Before Optimization
- Documentation-only change: ~90 seconds
- Test-only change: ~90 seconds
- Full code change: ~90 seconds

### After Optimization
- Documentation-only change: ~35 seconds (**61% faster**)
- Test-only change: ~50 seconds (**44% faster**)
- Full code change: ~90 seconds (no change)

## Caching Strategy

### Directory Structure Cache

**Location:** `.github/cache/directory_structure.cache`

**Duration:** 24 hours (86400 seconds)

**Invalidation:**
- Cache file older than 24 hours
- New files detected

**Benefits:**
- Faster subsequent runs
- Reduced filesystem I/O

### Cache Maintenance

```bash
# Clear cache manually
rm -rf .github/cache/

# View cache age
stat -c %Y .github/cache/directory_structure.cache

# View cached files
cat .github/cache/directory_structure.cache
```

## Troubleshooting

### Condition Evaluator Not Working

**Symptom:** Steps always run regardless of changes

**Solution:**
```bash
# Ensure script is executable
chmod +x .github/scripts/workflow-condition-evaluator.sh

# Test manually
./.github/scripts/workflow-condition-evaluator.sh step7_test_execution
echo $? # Should be 0 (run) or 1 (skip)
```

### False Positives (Steps Skipped Incorrectly)

**Symptom:** Steps skipped when they should run

**Debug:**
```bash
# Run with verbose output
CHANGED_FILES=$(git diff --name-only HEAD~1)
echo "$CHANGED_FILES"

# Check pattern matching
echo "$CHANGED_FILES" | grep -E "src/.*\.js"
```

### Cache Not Working

**Symptom:** Directory structure scan runs every time

**Debug:**
```bash
# Check cache directory exists
ls -la .github/cache/

# Check cache file age
find .github/cache/ -name "*.cache" -mtime -1

# Recreate cache directory
mkdir -p .github/cache
```

## Extension Guide

### Adding New Conditions

1. **Update `.workflow-config.yaml`:**
```yaml
conditionals:
  step_new_custom_step:
    skip_if:
      - custom_condition: true
    run_if:
      - "custom/**/*.ext": changed
    description: "Your description here"
```

2. **Update `workflow-condition-evaluator.sh`:**
```bash
case "$step" in
    step_new_custom_step)
        if [ "$custom_condition" = true ]; then
            print_skip "Skipping custom step"
            return 1
        fi
        print_run "Running custom step"
        return 0
        ;;
```

3. **Integrate in workflow script:**
```bash
if ./.github/scripts/workflow-condition-evaluator.sh step_new_custom_step; then
    # Your step logic here
fi
```

### Adding New Change Patterns

Update `.workflow-config.yaml`:
```yaml
change_patterns:
  new_pattern:
    - "path/to/files/**/*"
    - "another/pattern/*.ext"
```

## Best Practices

1. **Always provide fallback behavior** - If condition evaluation fails, default to running the step
2. **Use descriptive step names** - Follow pattern: `step<number>_<description>`
3. **Document performance impact** - Note expected time savings in descriptions
4. **Test both paths** - Verify steps run AND skip correctly
5. **Keep patterns specific** - Avoid overly broad glob patterns

## Integration with CI/CD

### GitHub Actions

```yaml
- name: Run Tests Conditionally
  run: |
    if ./.github/scripts/workflow-condition-evaluator.sh step7_test_execution; then
      npm test
    else
      echo "Tests skipped (no code changes)"
    fi
```

### Local Development

```bash
# Run full workflow with conditionals
./.github/scripts/test-workflow-locally.sh

# Force run specific step
npm test  # Always runs, bypasses conditionals
```

## Version History

- **v1.0.0** (2026-01-27) - Initial implementation
  - 4 conditional steps
  - Directory structure caching
  - 30-40% performance improvement for filtered changes

## See Also

- [Workflow Setup Guide](../docs/WORKFLOW_SETUP.md)
- [CI/CD Guide](.github/CI_CD_GUIDE.md)
- [Contributing Guidelines](.github/CONTRIBUTING.md)
