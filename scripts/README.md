# Scripts Directory

**Purpose**: Utility scripts for project maintenance and automation

---

## Available Scripts

### 1. fix-console-logging.sh
**Purpose**: Automatically fixes direct console.* usage to use centralized logger  
**Usage**: `./scripts/fix-console-logging.sh`  
**Status**: ✅ **Portable** - works across all environments  
**Documentation**: ✅ **COMPLETE**

**What it does**:
- Scans `src/` directory for direct `console.log`, `console.warn`, `console.error` usage
- Replaces with imports from `utils/logger.js`
- Helps maintain centralized logging standards
- Uses portable path resolution (works on any system)

**Fixed Issues** (v0.9.0+):
- ✅ Removed hardcoded absolute path
- ✅ Added portable `SCRIPT_DIR` resolution
- ✅ Works in any environment (local, CI/CD, Docker)

---

### 2. update-doc-dates.sh
**Purpose**: Updates "Last Updated" dates in documentation files  
**Usage**: `./scripts/update-doc-dates.sh [options]`  
**npm script**: `npm run update:dates`  
**Documentation**: `docs/AUTOMATION_IMPLEMENTATION_SUMMARY.md`

**Options**:
- `--help` - Show usage information
- `--all` - Update all documentation files
- `--dry-run` - Preview changes without applying

**What it does**:
- Finds markdown files with "Last Updated" fields
- Updates dates to current date (YYYY-MM-DD format)
- Maintains documentation freshness automatically

---

### 3. update-test-counts.sh
**Purpose**: Updates test count statistics in documentation  
**Usage**: `./scripts/update-test-counts.sh`  
**npm script**: `npm run update:tests`  
**Documentation**: `docs/AUTOMATION_IMPLEMENTATION_SUMMARY.md`

**What it does**:
- Runs `npm test` to get current test counts
- Extracts passing/failing/total test numbers
- Updates test count references in:
  - README.md
  - .github/copilot-instructions.md
  - docs/QUICK_START.md
  - docs/architecture/SYSTEM_OVERVIEW.md

**Output**: Ensures documentation shows accurate test statistics

---

### 4. build_and_deploy.sh
**Purpose**: Build production bundle and deploy to staging environment  
**Usage**: `./scripts/build_and_deploy.sh [OPTIONS]`  
**Status**: ⚠️ **External dependency** - requires mpbarbosa_site repository  
**Documentation**: ✅ **COMPLETE**  
**--help flag**: ✅ **YES**

**What it does**:
1. Changes to parent directory (`cd ..`)
2. Displays current working directory (`pwd`)
3. Runs production build (`npm run build`)
4. Navigates to sibling project: `../mpbarbosa_site`
5. Displays mpbarbosa_site directory (`pwd`)
6. Triggers staging deployment: `./shell_scripts/sync_to_staging.sh --step1`

**Prerequisites**:
- ✅ `mpbarbosa_site` repository cloned at `../mpbarbosa_site`
- ✅ Valid staging environment configuration in mpbarbosa_site
- ✅ Sync script exists: `mpbarbosa_site/shell_scripts/sync_to_staging.sh`
- ✅ Production build completes successfully (`npm run build`)
- ✅ Write permissions for deployment

**Directory Structure Required**:
```
parent-directory/
├── guia_turistico/           # This project
│   ├── scripts/
│   │   └── build_and_deploy.sh
│   └── dist/                 # Created by npm run build
└── mpbarbosa_site/           # Sibling project
    └── shell_scripts/
        └── sync_to_staging.sh
```

**Known Issues**:
- ❌ No error handling for missing directories
- ❌ No validation that build succeeded before deploying
- ❌ No rollback mechanism if deployment fails
- ❌ Requires specific directory structure (fragile)
- ❌ External project dependency not documented in main README

**Recommendations**:
```bash
# Enhanced version with error handling (proposed)
#!/bin/bash
set -e  # Exit on error

# Validate prerequisites
if [ ! -d "../mpbarbosa_site" ]; then
    echo "Error: mpbarbosa_site not found at ../mpbarbosa_site"
    exit 1
fi

# Build production bundle
echo "Building production bundle..."
npm run build || {
    echo "Error: Build failed"
    exit 1
}

# Deploy to staging
echo "Deploying to staging..."
cd ../mpbarbosa_site
./shell_scripts/sync_to_staging.sh --step1 || {
    echo "Error: Deployment failed"
    exit 1
}

echo "✓ Deployment complete"
```

**Usage Notes**:
- ⚠️ Run only when ready to deploy to staging
- ⚠️ Ensure all tests pass before running
- ⚠️ Coordinate with mpbarbosa_site repository owner
- ⚠️ Not intended for production deployment (staging only)

**Alternative (CI/CD)**:
Consider migrating to GitHub Actions workflow for automated deployment:
```yaml
# .github/workflows/deploy-staging.yml (proposed)
name: Deploy to Staging
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: npm run build
      - name: Deploy
        run: # rsync or deployment command
```

---

## Running Scripts

### Direct Execution
```bash
# From project root
./scripts/update-doc-dates.sh
./scripts/update-test-counts.sh
./scripts/fix-console-logging.sh
./scripts/build_and_deploy.sh     # Staging deployment (requires mpbarbosa_site)
```

### Via npm Scripts
```bash
npm run update:dates      # Update documentation dates
npm run update:tests      # Update test counts
# Note: build_and_deploy.sh has no npm script (manual deployment only)
```

---

## Script Maintenance

### Adding New Scripts
1. Place script in this directory
2. Make executable: `chmod +x scripts/your-script.sh`
3. Add entry to this README
4. Add npm script alias in `package.json` (if applicable)
5. Document in `docs/AUTOMATION_TOOLS.md`

### Best Practices
- Use relative paths, not absolute
- Include `#!/bin/bash` shebang
- Add `set -e` for fail-fast behavior
- Include `--help` option
- Add error handling for missing dependencies
- Test in clean environment before committing

---

## Related Documentation
- `.github/scripts/` - CI/CD automation scripts
- `docs/AUTOMATION_TOOLS.md` - Complete automation guide
- `docs/AUTOMATION_IMPLEMENTATION_SUMMARY.md` - Implementation details

---

**Last Updated**: 2026-02-11  
**Maintainer**: Project automation team
