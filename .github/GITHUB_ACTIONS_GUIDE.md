# GitHub Actions Workflow Guide

## Overview

This guide explains the automated workflows in the Guia.js project that help maintain code quality and documentation consistency.

## Automated File Modification Workflow

The project includes a comprehensive GitHub Actions workflow that automatically:

1. **Detects changes** to source files, tests, and documentation
2. **Runs appropriate tests** based on which files changed
3. **Updates documentation** automatically with timestamps and statistics
4. **Validates** markdown files and checks for broken links
5. **Reports results** in an easy-to-read summary

## What Happens When You Push Changes?

### JavaScript Source Files (`src/*.js`)

When you modify JavaScript source files:

1. ✅ **Syntax validation** runs on all JS files
2. ✅ **All tests execute** to ensure nothing broke
3. ✅ **Coverage report** is generated
4. ✅ **Test statistics** are collected
5. ℹ️ Results appear in GitHub Actions tab

### Test Files (`__tests__/*.test.js`)

When you modify or add test files:

1. ✅ **All tests run** including your new tests
2. ✅ **TESTING.md is updated** with current timestamp
3. ✅ **Test count** is automatically updated
4. ✅ **Changes are committed** back to your branch
5. ℹ️ You see auto-commit from `github-actions[bot]`

### Documentation Files (`*.md`)

When you modify documentation:

1. ✅ **Markdown syntax** is validated
2. ✅ **Internal links** are checked
3. ✅ **docs/INDEX.md is updated** with file counts
4. ✅ **Timestamp** is added automatically
5. ℹ️ Broken links are reported (if found)

## Workflow Jobs Explained

### 1. detect-changes

**What it does**: Analyzes which files changed in your commit/PR

**Output**:
- JavaScript files changed: true/false
- Test files changed: true/false
- Documentation files changed: true/false
- Source files changed: true/false

**Why it matters**: Determines which jobs should run, saving time by skipping unnecessary steps.

### 2. run-affected-tests

**Triggers**: When JavaScript or test files change

**Steps**:
1. Sets up Node.js v18
2. Installs dependencies with `npm ci`
3. Runs all tests with `npm test`
4. Generates coverage with `npm run test:coverage`
5. Validates syntax with `npm run validate`

**Duration**: Usually 1-2 minutes

**What to check**: Look for test failures in the job output

### 3. update-test-documentation

**Triggers**: When test files change

**Steps**:
1. Counts total test suites
2. Updates TESTING.md with current date/time
3. Commits changes as `github-actions[bot]`

**Auto-commit message**: `docs: auto-update TESTING.md [skip ci]`

**Note**: Uses `[skip ci]` to prevent infinite loops

### 4. validate-documentation

**Triggers**: When markdown files change

**Steps**:
1. Lists all changed documentation files
2. Checks for Windows line endings
3. Validates internal links exist
4. Reports potential issues

**What it catches**:
- Broken relative links
- Missing referenced files
- Format inconsistencies

### 5. update-coverage-badge

**Triggers**: When source or test files change

**Steps**:
1. Runs full test suite with coverage
2. Extracts coverage percentages
3. Prepares coverage report

**Future enhancement**: Will post coverage as PR comment

### 6. summary

**Always runs**: Even if other jobs fail

**Purpose**: Generates a clean summary showing:
- What changed
- Which jobs ran
- Overall status

**Where to find it**: Click on workflow run → Summary tab

## Custom Actions

### detect-affected-tests

**Purpose**: Smart test detection based on changed files

**How it works**:
```
src/guia.js → Runs: CurrentPosition.test.js
                    utils.test.js
                    SingletonStatusManager.test.js

src/guia_ibge.js → Runs: guia_ibge.test.js

package.json → Runs: ALL TESTS
```

**Why it's smart**: Saves time by only running affected tests (when safe to do so)

### update-test-docs

**Purpose**: Keep TESTING.md current

**What it updates**:
- Adds timestamp: "_Last updated automatically by GitHub Actions: 2025-01-08 12:34:56 UTC_"
- Counts test suites
- Only commits if changes exist

**Location**: Bottom of TESTING.md file

### update-doc-index

**Purpose**: Keep docs/INDEX.md current with file counts

**What it updates**:
- Timestamp
- Total markdown files
- Files by location (root, docs/, .github/)

**Example output**:
```
_Index automatically updated by GitHub Actions: 2025-01-08 12:34:56 UTC_
_Total documentation files: 3 root, 10 in docs/, 8 in .github/_
```

## Viewing Workflow Results

### In Pull Requests

1. Open your PR
2. Scroll to "Checks" section
3. Click on "Modified Files - Test and Documentation Updates"
4. Expand jobs to see details

### In Actions Tab

1. Go to repository → Actions tab
2. Select "Modified Files - Test and Documentation Updates"
3. Click on specific workflow run
4. View job outputs and logs

### Reading the Summary

Each workflow run creates a summary:

```
## File Modification Workflow Summary

### Changes Detected:
- JavaScript files: true
- Test files: true
- Documentation files: false
- Source files: true

### Jobs Status:
- Tests: success ✅
- Documentation validation: skipped
```

## Troubleshooting

### Tests Failing in CI but Not Locally

**Possible causes**:
1. Different Node.js version
2. Missing dependencies in package.json
3. Environment-specific issues

**Solutions**:
```bash
# Use exact Node version from CI
nvm use 18

# Install exactly like CI does
rm -rf node_modules package-lock.json
npm install
npm ci

# Run same commands as CI
npm run validate
npm test
npm run test:coverage
```

### Auto-commits Not Appearing

**Check**:
1. Workflow has `contents: write` permission ✅ (it does)
2. Branch is not protected against bot commits
3. Workflow completed successfully
4. Check Actions tab for errors

**Expected behavior**:
- Commit author: `github-actions[bot]`
- Commit message: Includes `[skip ci]`
- Shows in git history after workflow completes

### Documentation Not Updating

**Common issues**:

1. **File doesn't exist**: Check TESTING.md and docs/INDEX.md exist
2. **No actual changes**: If timestamp hasn't changed, no update needed
3. **Workflow failed**: Check Actions tab for errors
4. **Wrong branch**: Workflow only runs on `main` and `develop`

**Manual check**:
```bash
# Check if files exist
ls -la TESTING.md docs/INDEX.md

# Check for existing automation notices
grep "Last updated automatically" TESTING.md
grep "automatically updated" docs/INDEX.md
```

### Broken Link Warnings

**What they mean**: Documentation references a file that doesn't exist

**Example warning**:
```
⚠️ Potential broken link: ../missing-file.md
```

**How to fix**:
1. Check if file exists at that path
2. Update the link in your documentation
3. Or create the missing file

**Note**: Some warnings are false positives for external links or anchors

## Best Practices

### When Writing Tests

1. ✅ **Run tests locally first**: `npm test`
2. ✅ **Check syntax**: `npm run validate`
3. ✅ **Run full suite**: `npm run test:all`
4. ℹ️ Push when all tests pass locally

### When Updating Documentation

1. ✅ **Use relative links**: `[link](../file.md)` not absolute paths
2. ✅ **Check links work**: Click them in GitHub preview
3. ✅ **Keep formatting consistent**: Follow existing style
4. ℹ️ Automation will add timestamps, don't add them manually

### When Making Breaking Changes

1. ✅ **Update tests first**: Make sure they cover new behavior
2. ✅ **Update docs**: Explain what changed and why
3. ✅ **Run full validation**: `npm run test:all`
4. ✅ **Check workflow**: Wait for all jobs to pass

### Skipping CI

To prevent workflow from running (use sparingly):

```bash
git commit -m "docs: minor typo fix [skip ci]"
```

**When to use**:
- Trivial documentation typos
- README formatting
- Non-functional changes

**When NOT to use**:
- Code changes
- Test changes
- Anything that affects functionality

## Performance Tips

### Workflow is Slow

**Current optimizations**:
- Uses `npm ci` instead of `npm install` (faster, more reliable)
- Caches npm dependencies with `cache: 'npm'`
- Runs jobs in parallel when possible
- Uses `continue-on-error` for non-critical steps

**If still slow**:
- Consider reducing test suite size
- Split tests into unit/integration
- Use test filtering for specific changes

### Too Many Auto-commits

**Solutions**:
1. Combine related changes in one commit
2. Use `[skip ci]` for doc-only changes
3. Update docs before pushing (so workflow has nothing to update)

## Advanced Usage

### Testing Actions Locally

You can test the custom actions locally:

```bash
# Test detect-affected-tests
cd .github/actions/detect-affected-tests
# (requires Act or similar local runner)

# Test update-test-docs
cd .github/actions/update-test-docs
# Run the bash commands manually

# Test update-doc-index
cd .github/actions/update-doc-index
# Run the bash commands manually
```

### Customizing Test Detection

Edit `.github/actions/detect-affected-tests/action.yml`:

```yaml
# Add new mapping
case "$file" in
  src/your-new-file.js)
    AFFECTED_TESTS="$AFFECTED_TESTS __tests__/YourNew.test.js"
    ;;
esac
```

### Adding New Documentation Auto-updates

1. Create new action in `.github/actions/your-action/`
2. Add job to `.github/workflows/modified-files.yml`
3. Use existing actions as templates
4. Test thoroughly before merging

## Integration with Existing Workflows

### copilot-coding-agent.yml

**Relationship**: Complementary workflows

**copilot-coding-agent.yml** focuses on:
- Basic validation
- Syntax checking
- Security scanning

**modified-files.yml** focuses on:
- Test execution
- Documentation updates
- Coverage reporting

**Both run on**: Push to main/develop, PRs to main

**Tip**: Check both workflow results before merging

## FAQ

**Q: Will this slow down my development?**
A: No! Workflows run on GitHub servers, not your machine. You can keep working while they run.

**Q: What if I don't want auto-commits?**
A: You can skip them with `[skip ci]` in your commit message, but they're designed to be helpful.

**Q: Can I disable specific jobs?**
A: Yes, but requires editing the workflow file. Better to use `[skip ci]` for one-off cases.

**Q: What happens if tests fail?**
A: The workflow reports failure, but doesn't block your commit. It's informational.

**Q: Are auto-commits safe?**
A: Yes! They only update documentation timestamps and statistics, never code.

**Q: How do I see what changed in an auto-commit?**
A: Click on the commit in GitHub, or use `git show <commit-hash>` locally.

**Q: Can I customize the timestamp format?**
A: Yes, edit the actions files. Current format: `2025-01-08 12:34:56 UTC`

## Getting Help

**Workflow issues**:
1. Check Actions tab for detailed logs
2. Look for error messages in job outputs
3. Review this guide for common solutions

**Test issues**:
1. Run tests locally first
2. Check TESTING.md for test documentation
3. Review test output for specific failures

**Documentation issues**:
1. Validate markdown syntax
2. Check file paths and links
3. Review docs/INDEX.md for structure

## Related Documentation

- [Workflows README](.github/workflows/README.md) - Technical workflow details
- [TESTING.md](../TESTING.md) - Test suite documentation
- [CONTRIBUTING.md](../.github/CONTRIBUTING.md) - Contribution guidelines
- [GitHub Actions Documentation](https://docs.github.com/en/actions) - Official GitHub docs

---

_This guide helps you understand and work with the automated workflows in Guia.js._
