# Code Pattern Documentation Guide

**Date**: 2026-01-11  
**Purpose**: Clarify valid code patterns that may be mistaken for broken references  
**Status**: Reference Document

---

## Overview

This document explains code patterns and examples in the documentation that may appear to be broken references but are actually **valid and intentional** code examples.

---

## Valid Code Patterns

### 1. Comment Placeholders: `/* ... */`

**Pattern**: `/* ... */`  
**Purpose**: Indicates omitted code for brevity in examples  
**Usage**: Standard JavaScript/documentation convention

**Examples**:
```javascript
// Valid code example showing placeholder
this.notifyObservers(/* ... */);
this.watchId = this.navigator.geolocation.watchPosition(/* ... */);
const errorMap = { /* ... */ };
```

**Files Using This Pattern**:
- `docs/issue-189/CREATE_ISSUES_GUIDE.md` (line 572)
- `docs/issue-189/ISSUE_189_NEXT_STEPS.md` (line 473)
- `docs/architecture/GEOLOCATION_SERVICE_REFACTORING.md` (lines 142, 159, 197)
- `docs/ESLINT_CONFIGURATION_ISSUE_ANALYSIS.md` (lines 87, 147, 270)

**Why Valid**: This is a standard documentation convention to indicate "implementation details omitted" without cluttering examples with unnecessary code.

---

### 2. Regex Patterns for String Replacement

**Pattern**: `/pattern/g` with escape sequences  
**Purpose**: JavaScript regex for find-and-replace operations  
**Usage**: Code transformation scripts

**Examples**:
```javascript
// Valid regex to replace class references
content = content.replace(/AddressDataExtractor\./g, 'AddressCache.getInstance().');
```

**Files Using This Pattern**:
- `docs/STATIC_WRAPPER_ELIMINATION.md` (line 590)

**Why Valid**: This is actual JavaScript code showing how to perform mass refactoring with regex replacements.

---

### 3. HTML Tag Detection Regex

**Pattern**: `/<\w+/g` and `/<\/\w+>/g`  
**Purpose**: Detect and count HTML opening/closing tags in tests  
**Usage**: Test validation for HTML generation

**Examples**:
```javascript
// Valid regex for HTML tag validation
const openingTags = (html.match(/<\w+/g) || []).length;
const closingTags = (html.match(/<\/\w+>/g) || []).length;
```

**Files Using This Pattern**:
- `docs/testing/HTML_GENERATION.md` (lines 134-135)

**Why Valid**: These are test assertions ensuring HTML output is well-formed with balanced tags.

---

### 4. Regex Pattern Whitelisting

**Pattern**: `/\/\*\s*\.\.\.\s*\*\//`  
**Purpose**: Regex to match and whitelist comment placeholders  
**Usage**: Automated validation tooling

**Example**:
```javascript
// Valid regex for pattern whitelisting
if (matches(/\/\*\s*\.\.\.\s*\*\//)) skip();
```

**Files Using This Pattern**:
- `docs/misc/PROJECT_CLARIFICATION.md`

**Why Valid**: This is documentation showing how to configure automated tools to ignore `/* ... */` patterns.

---

### 5. Directory Path References

**Pattern**: `/src`, `/docs`, `/tests`  
**Purpose**: Discuss directory structure and organization  
**Usage**: Architecture documentation

**Examples**:
```markdown
Directory structure explanation (/src for library organization)
Source Directory Details: Timing module (/src/timing/)
```

**Files Using This Pattern**:
- `docs/INDEX.md` (lines 82, 85)

**Why Valid**: These are descriptive references to directory structure, not hyperlinks or code paths.

---

## Automated Check Guidelines

### What NOT to Flag as Broken References

1. **Code blocks** (markdown fenced with ` ``` `) containing:
   - Comment placeholders: `/* ... */`
   - Regex patterns: `/pattern/g`, `/pattern/flags`
   - Path references in explanatory text

2. **Inline code** (markdown wrapped with `` ` ``) containing:
   - Regex patterns
   - File paths used as examples
   - Command-line patterns with wildcards (`**/*.js`)

3. **Descriptive text** containing:
   - Directory names in parenthetical explanations
   - Pattern examples showing what to match
   - Technical notation for glob patterns

### What TO Flag as Broken References

1. **Markdown links** with missing targets: `[text](missing-file.md)`
2. **HTTP/HTTPS URLs** returning 404 errors
3. **File references** outside code blocks that don't exist
4. **Image references** with missing image files
5. **Anchor links** to non-existent section headers

---

## Recommended Automated Check Patterns

### Exclude from Broken Reference Checks

```javascript
// Regex patterns to exclude from validation
const WHITELIST_PATTERNS = [
  /\/\*\s*\.\.\.\s*\*\//,           // Comment placeholders
  /\/[^\/\s]+\/[gimsuvy]*/,         // Regex patterns with flags
  /`[^`]*\/[^`]*`/,                 // Inline code with slashes
  /\(\/[a-z_-]+\s+for\s+/,          // Descriptive directory references
];

// Only check actual markdown links and URLs
const VALIDATE_PATTERNS = [
  /\[([^\]]+)\]\(([^)]+)\)/,        // Markdown links
  /https?:\/\/[^\s)]+/,             // HTTP/HTTPS URLs
];
```

---

## Summary

**Total Files Affected**: 8 documentation files  
**Total Valid Patterns**: 11+ occurrences  
**Action Required**: ❌ None - patterns are correct  

**Impact**:
- ✅ Code examples remain clear and accurate
- ✅ Documentation maintains standard conventions
- ✅ Automated checks can be improved to exclude these patterns

**Recommendation**:
- Update automated validation scripts to whitelist code patterns
- No changes needed to existing documentation
- This guide serves as reference for future validation improvements

---

## Related Documentation

- **Style Guide**: `docs/CONTRIBUTING.md` (code example conventions)
- **Testing Guide**: `docs/testing/HTML_GENERATION.md` (regex validation patterns)
- **Refactoring Guides**: `docs/STATIC_WRAPPER_ELIMINATION.md` (transformation scripts)

---

**Note**: If you encounter similar patterns in the future, verify they are in code blocks or inline code before flagging them as broken references.
