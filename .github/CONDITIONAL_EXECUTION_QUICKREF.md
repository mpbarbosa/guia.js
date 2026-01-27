# Conditional Execution Quick Reference

## 🎯 Quick Start

```bash
# Run workflow with conditional execution
./.github/scripts/test-workflow-locally.sh

# Test specific condition
./.github/scripts/workflow-condition-evaluator.sh <step_name>
```

## 📋 Available Steps

| Step | Skip When | Time Saved |
|------|-----------|------------|
| `step3_syntax_validation` | No JS changes | ~1-2s |
| `step4_directory_structure` | Cache valid + no new files | ~2-3s |
| `step5_coverage_report` | Docs-only or tests-only | ~30-45s |
| `step7_test_execution` | No code changes | ~30-45s |

## 🔍 Change Detection

### Automatically Detected
- **Code changes**: `src/**/*.js`, `src/**/*.css`, `src/**/*.html`
- **Test changes**: `__tests__/**/*.js`, `tests/**/*.py`
- **Doc changes**: `**/*.md`, `docs/**/*`
- **Config changes**: `package.json`, `.github/**/*.yml`

### Change Type Flags
- `no_code_changes` - No code files modified
- `only_docs_changed` - Only documentation modified
- `no_js_changes` - No JavaScript files modified
- `only_tests_changed` - Only test files modified
- `no_new_files` - No new files added

## 💾 Cache Management

```bash
# View cache
cat .github/cache/directory_structure.cache

# Clear cache
rm -rf .github/cache/

# Check cache age
stat -c %Y .github/cache/directory_structure.cache
```

**Cache Duration:** 24 hours (86400 seconds)

## ⚡ Performance Examples

### Documentation-only change
```bash
# Before: ~90s
# After: ~35s (61% faster)
```

### Test-only change
```bash
# Before: ~90s
# After: ~50s (44% faster)
```

### Full code change
```bash
# Before: ~90s
# After: ~90s (no change - runs all tests)
```

## 🛠️ Common Commands

```bash
# Check if step should run
./.github/scripts/workflow-condition-evaluator.sh step7_test_execution
echo $? # 0=run, 1=skip

# Force run (bypass conditions)
npm test  # Runs tests directly

# View conditional config
grep -A 10 "conditionals:" .workflow-config.yaml

# Validate scripts
bash -n .github/scripts/workflow-condition-evaluator.sh
bash -n .github/scripts/test-workflow-locally.sh
```

## 📝 Configuration Location

**Main config:** `.workflow-config.yaml`

```yaml
conditionals:
  step_name:
    skip_if:
      - condition: true
    run_if:
      - "pattern/**/*.ext": changed
```

## 🐛 Troubleshooting

### Steps always run
```bash
# Check script permissions
chmod +x .github/scripts/workflow-condition-evaluator.sh

# Test evaluator directly
./.github/scripts/workflow-condition-evaluator.sh step7_test_execution
```

### Steps always skip
```bash
# Check for changes
git diff --name-only HEAD~1

# Verify patterns match
echo "$CHANGED_FILES" | grep -E "src/.*\.js"
```

### Cache not working
```bash
# Recreate cache directory
mkdir -p .github/cache

# Test cache write
echo "test" > .github/cache/directory_structure.cache
```

## 📚 Documentation

- **Full Guide:** `.github/CONDITIONAL_EXECUTION_GUIDE.md`
- **Summary:** `.github/CONDITIONAL_EXECUTION_SUMMARY.md`
- **Workflow Setup:** `docs/WORKFLOW_SETUP.md`

## 🎨 Color Codes (Output)

- 🔵 Blue = Info message
- 🟡 Yellow = Skip notification
- 🟢 Green = Run notification
- 🔴 Red = Error

## 💡 Tips

1. **Always test locally first** - Use `test-workflow-locally.sh`
2. **Monitor cache effectiveness** - Check hit rates over time
3. **Update patterns as needed** - Extend for new file types
4. **Document custom conditions** - Keep `.workflow-config.yaml` annotated
5. **Fallback behavior** - Steps run if evaluation fails (safe default)

## 🔗 Quick Links

- [GitHub Repository](https://github.com/mpbarbosa/guia_turistico)
- [Configuration File](.workflow-config.yaml)
- [Evaluator Script](.github/scripts/workflow-condition-evaluator.sh)
- [Test Suite](.github/scripts/test-conditional-execution.sh)

---

**Version:** 1.0.0 | **Updated:** 2026-01-27
