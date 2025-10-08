# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automating various tasks in the Guia.js project.

## Workflows

### 1. Copilot Coding Agent (`copilot-coding-agent.yml`)

**Purpose**: Validates code quality and runs basic functionality tests.

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` branch

**Jobs**:
- **validate**: Validates JavaScript syntax and tests basic Node.js functionality
- **lint-and-format**: Performs basic code style checks
- **security-check**: Runs basic security scans

### 2. Modified Files Workflow (`modified-files.yml`)

**Purpose**: Automatically detects file changes and updates tests and documentation accordingly.

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs**:

#### detect-changes
Detects which types of files have been modified:
- JavaScript source files
- Test files
- Documentation files

#### run-affected-tests
Runs tests when JavaScript or test files are modified:
- Executes all tests with `npm test`
- Generates coverage report with `npm run test:coverage`
- Validates JavaScript syntax with `npm run validate`

#### update-test-documentation
Updates test documentation when test files are modified:
- Counts test suites and generates statistics
- Updates `TESTING.md` with automatic timestamp
- Commits changes back to the repository

#### validate-documentation
Validates documentation when markdown files are modified:
- Checks markdown syntax
- Validates internal links
- Verifies documentation index is up-to-date

#### update-coverage-badge
Updates test coverage statistics:
- Generates coverage report
- Extracts coverage percentages
- Can post coverage report on pull requests

#### summary
Generates a workflow summary showing:
- Types of changes detected
- Jobs status
- Overall workflow results

## Custom Actions

The workflows use custom composite actions located in `.github/actions/`:

### detect-affected-tests
**Location**: `.github/actions/detect-affected-tests/`

Analyzes changed files and determines which test files need to be run.

**Inputs**:
- `changed-files`: Comma-separated list of changed files

**Outputs**:
- `test-files`: Test files that should be run
- `should-run-all`: Whether all tests should be run

**Logic**:
- If core files (`guia.js`, `guia_ibge.js`) change → run all tests
- Maps specific source files to their corresponding test files
- Returns list of affected test files

### update-test-docs
**Location**: `.github/actions/update-test-docs/`

Updates test documentation with current statistics.

**Inputs**:
- `test-results-file`: Path to test results JSON file (optional)

**Outputs**:
- `updated`: Whether documentation was updated

**Actions**:
- Counts test suites and test files
- Adds/updates automation timestamp in `TESTING.md`
- Only commits if changes were made

### update-doc-index
**Location**: `.github/actions/update-doc-index/`

Updates documentation index with current file structure.

**Outputs**:
- `updated`: Whether index was updated

**Actions**:
- Scans all markdown files in repository
- Counts documentation by location (root, docs/, .github/)
- Updates `docs/INDEX.md` with timestamp and statistics
- Only commits if changes were made

### validate-js
**Location**: `.github/actions/validate-js/`

Validates JavaScript syntax for specified files.

**Inputs**:
- `files`: Space-separated list of JavaScript files to validate

**Actions**:
- Uses Node.js `-c` flag to check syntax
- Reports validation status for each file

### security-check
**Location**: `.github/actions/security-check/`

Performs basic security checks on JavaScript files.

**Inputs**:
- `files`: Pattern for files to check (e.g., "*.js")

**Checks**:
- Hardcoded credentials (passwords, tokens, secrets)
- Usage of `eval()` function
- Non-HTTPS external URLs

## Workflow Permissions

The `modified-files.yml` workflow requires these permissions:
- `contents: write` - To commit documentation updates
- `pull-requests: write` - To post comments on PRs

## Usage Examples

### Triggering the Modified Files Workflow

The workflow automatically runs when:

1. **You modify JavaScript source files** (`src/*.js`):
   - Tests are run automatically
   - Coverage is updated
   - Results are reported

2. **You modify test files** (`__tests__/*.test.js`):
   - Tests are run
   - `TESTING.md` is updated with timestamp
   - Changes are committed automatically

3. **You modify documentation** (`*.md`):
   - Markdown syntax is validated
   - Internal links are checked
   - `docs/INDEX.md` is updated

### Manual Testing

To test the workflow locally before pushing:

```bash
# Validate JavaScript syntax
npm run validate

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run full test suite
npm run test:all
```

### Viewing Workflow Results

1. Go to your repository on GitHub
2. Click on the "Actions" tab
3. Select the workflow run you want to view
4. Check the job outputs and summary

## Configuration

### Customizing Test Detection

Edit `.github/actions/detect-affected-tests/action.yml` to customize which tests run for specific file changes.

Example mapping:
```yaml
src/guia.js → __tests__/CurrentPosition.test.js
             __tests__/utils.test.js
             __tests__/SingletonStatusManager.test.js

src/guia_ibge.js → __tests__/guia_ibge.test.js
```

### Skipping Automated Commits

To prevent the workflow from creating commits, add `[skip ci]` to your commit message:

```bash
git commit -m "Update documentation [skip ci]"
```

## Troubleshooting

### Workflow Not Triggering

**Issue**: Workflow doesn't run after pushing changes.

**Solutions**:
1. Check that changes are in the correct branches (`main` or `develop`)
2. Verify workflow file syntax is valid YAML
3. Check repository Actions settings are enabled

### Documentation Not Updating

**Issue**: `TESTING.md` or `docs/INDEX.md` not updating automatically.

**Solutions**:
1. Check workflow logs for errors
2. Verify files exist in repository
3. Ensure workflow has `contents: write` permission
4. Check if `[skip ci]` was used in commit message

### Tests Failing

**Issue**: Tests fail in CI but pass locally.

**Solutions**:
1. Run `npm ci` instead of `npm install` locally
2. Check Node.js version matches CI (v18)
3. Review test logs in Actions tab
4. Ensure all dependencies are in `package.json`

## Best Practices

1. **Keep workflows fast**: Use caching for npm dependencies
2. **Fail gracefully**: Use `continue-on-error` for non-critical jobs
3. **Clear outputs**: Provide informative messages in workflow steps
4. **Test locally first**: Run tests and validation before pushing
5. **Review auto-commits**: Check automated documentation updates are correct

## Contributing

When modifying workflows:

1. Test changes in a fork or feature branch first
2. Use descriptive commit messages
3. Document new jobs or actions
4. Update this README with significant changes
5. Follow existing naming conventions

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Composite Actions](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)
- [Jest Documentation](https://jestjs.io/)

## Version History

- **v1.0.0** (Initial release)
  - Created `modified-files.yml` workflow
  - Added three custom composite actions
  - Automated test and documentation updates
  - Integrated with existing `copilot-coding-agent.yml`
