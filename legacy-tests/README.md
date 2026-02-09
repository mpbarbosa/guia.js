# Legacy Test Files

**Status**: Deprecated  
**Purpose**: Historical reference for specific bug fixes and feature development  
**Replacement**: Use `src/index.html` for main application testing  
**Date Archived**: 2026-02-09

---

## Overview

This directory contains historical test files that were created during specific bug investigations and feature implementations. These files remain for historical reference but are no longer part of the active test suite.

**For current testing**, see:
- **Main application**: `src/index.html`
- **Automated tests**: `__tests__/` directory (Jest + Puppeteer)
- **E2E tests**: `tests/e2e/` directory (Python + Playwright)

---

## Files

### `test-fix.html`
**Purpose**: General bug fix testing and verification  
**Historical Context**: Used during early development to test DOM manipulation and event handling fixes  
**Created**: ~2025-2026 development cycle  
**Status**: Superseded by automated unit tests in `__tests__/unit/`

### `test-innerHTML-fix.html`
**Purpose**: Testing innerHTML security and XSS prevention fixes  
**Historical Context**: Created to verify proper HTML escaping and sanitization  
**Related Issue**: Security vulnerability in dynamic content rendering  
**Status**: Security tests now covered in `__tests__/unit/` and E2E suites

### `test-geoposition-bug-fix.html`
**Purpose**: Debugging geolocation API integration issues  
**Historical Context**: Manual testing for GeoPosition class and coordinate handling  
**Related Classes**: `GeoPosition`, `PositionManager`  
**Status**: Geolocation testing now automated in `__tests__/core/GeoPosition.test.js`

### `test-municipio-value-browser.html`
**Purpose**: Browser-based testing for municipio (municipality) display  
**Historical Context**: Manual verification of Brazilian address formatting  
**Feature**: Municipality display with state abbreviation  
**Status**: Covered by `__tests__/e2e/municipio-bairro-display.e2e.test.js`

### `test-bairro-card-manual.html`
**Purpose**: Manual testing for bairro (neighborhood) highlight card updates  
**Historical Context**: Testing HTMLHighlightCardsDisplayer functionality  
**Feature**: Real-time neighborhood tracking while navigating  
**Status**: Automated in `__tests__/e2e/NeighborhoodChangeWhileDriving.e2e.test.js`

### `demo-issue-218.js`
**Purpose**: Reproduction case for GitHub issue #218  
**Historical Context**: Specific bug demonstration for issue tracking  
**Issue**: [Link to issue #218 if available]  
**Status**: Issue resolved, demo kept for historical reference

---

## Why Deprecated?

These files were valuable during their time but have been replaced by:

1. **Automated Test Suite**: 2,380 tests (2,214 passing) with comprehensive coverage
2. **E2E Browser Testing**: Puppeteer and Playwright for realistic user scenarios
3. **Modern Development Workflow**: Test-driven development with fast feedback loops
4. **Better Documentation**: Feature-specific test documentation in `__tests__/e2e/`

### Benefits of Modern Test Suite

- ✅ **Automated**: No manual intervention required
- ✅ **Fast**: ~45 seconds for full test suite
- ✅ **Comprehensive**: 85% code coverage
- ✅ **Reliable**: Consistent execution in CI/CD
- ✅ **Documented**: Clear test descriptions and expectations

---

## Accessing Historical Context

If you need to understand the context behind these files:

1. **Git History**: `git log --follow legacy-tests/[filename]`
2. **Commit Messages**: Review commits that reference these files
3. **Issue Tracker**: Search for related GitHub issues
4. **Documentation**: Check `docs/reports/bugfixes/` for detailed investigations

---

## Archival Policy

These files are preserved for:
- Historical reference during code reviews
- Understanding design decisions
- Debugging similar issues in the future
- Educational purposes for new team members

**Do not use these files for active development or testing.**

---

## Related Documentation

- [Testing Overview](../docs/TESTING.md) - Current test infrastructure
- [E2E Test Documentation](../__tests__/e2e/) - Browser automation tests
- [Contributing Guidelines](../.github/CONTRIBUTING.md) - Development workflow

---

**Last Updated**: 2026-02-09  
**Maintained By**: Development Team  
**Review Cycle**: Annual (consider removal after 2 years without reference)
