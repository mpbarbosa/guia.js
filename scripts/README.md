# Scripts Directory

**Purpose**: Utility scripts for project maintenance and automation

---

## Available Scripts

### 1. fix-console-logging.sh
**Purpose**: Automatically fixes direct console.* usage to use centralized logger  
**Usage**: `./scripts/fix-console-logging.sh`  
**Status**: ⚠️ **Contains hardcoded path** - needs update for portability  
**Documentation**: Currently undocumented  

**What it does**:
- Scans `src/` directory for direct `console.log`, `console.warn`, `console.error` usage
- Replaces with imports from `utils/logger.js`
- Helps maintain centralized logging standards

**Known Issues**:
- Line 4 has hardcoded path: `/home/mpb/Documents/GitHub/guia_turistico/src`
- Should use relative path: `cd "$(dirname "$0")/../src"`

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

## Running Scripts

### Direct Execution
```bash
# From project root
./scripts/update-doc-dates.sh
./scripts/update-test-counts.sh
./scripts/fix-console-logging.sh
```

### Via npm Scripts
```bash
npm run update:dates      # Update documentation dates
npm run update:tests      # Update test counts
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
