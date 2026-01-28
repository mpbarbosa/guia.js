# Enhanced Reference Checker

A context-aware tool for validating file references in documentation with intelligent false positive filtering.

## Overview

This reference checker scans markdown files for file path references and validates they exist, while automatically excluding common false positive patterns like:
- JavaScript regex patterns (e.g., `/pattern/g`)
- Code comment placeholders (e.g., `/* ... */`)
- Path descriptions (e.g., "/src for library organization")
- JSDoc tags (e.g., `/@param`)
- URL patterns (e.g., `https://`)

## Files

- **`check-references.py`** - Python version (recommended)
- **`check-references.sh`** - Bash version (alternative)
- **`reference-checker.config`** - Shared configuration file

## Usage

### Python Version (Recommended)

```bash
# From repository root
python3 .github/scripts/check-references.py

# Or make executable and run directly
chmod +x .github/scripts/check-references.py
./.github/scripts/check-references.py
```

### Bash Version

```bash
# From repository root
bash .github/scripts/check-references.sh

# Or make executable and run directly
chmod +x .github/scripts/check-references.sh
./.github/scripts/check-references.sh
```

## Output

The checker provides:
- **Total references found**: Count of all potential file references
- **Valid references**: References to existing files
- **Excluded patterns**: False positives filtered out
- **Broken references**: Actual broken file references (requires fixing)

Example output:
```
==========================================
Enhanced Reference Checker
==========================================

🔍 Scanning for potential file references...

Found 312 markdown files to scan

==========================================
Results Summary
==========================================

Files scanned: 312
Total references found: 3010
Valid references: 2826
Excluded patterns: 69
Broken references: 115

Excluded Patterns (False Positives):
  docs/CODE_PATTERN_DOCUMENTATION_GUIDE.md:50: /AddressDataExtractor\./g (excluded pattern)
  docs/issue-189/CREATE_ISSUES_GUIDE.md:572: /* ... */ (excluded pattern)
  ...

❌ Broken References Found:
  ✗ docs/api-integration/NOMINATIM_INTEGRATION.md:738: ../architecture/BRAZILIAN_ADDRESS.md (NOT FOUND)
  ...
```

## Exclusion Patterns

### Automatically Excluded

1. **JavaScript Regex Patterns**
   - `/pattern/g`, `/pattern/gi`, `/pattern/gm`
   - `.replace(/pattern/`, `.match(/pattern/`, `.test(/pattern/`

2. **Code Comment Placeholders**
   - `/* ... */` - Code omitted for brevity
   - `// ...` - Line comment ellipsis
   - `/** ... */` - JSDoc comment placeholders

3. **Path Descriptions**
   - `/src for library organization`
   - `/docs in repository`
   - `/tests contains unit tests`

4. **JSDoc and Code Patterns**
   - `/@param`, `/@returns`, `/@throws`, `/@type`
   - `/throw new Error`
   - `/function`, `/async function`
   - `/const`, `/let`, `/var`

5. **URL Patterns**
   - `http://`, `https://`, `ftp://`, `file://`

6. **Special Patterns**
   - `#anchor-links`
   - `mailto:email@example.com`
   - `tel:+1234567890`

### Code Block Detection

The checker automatically skips references within markdown code blocks:
\`\`\`javascript
// This reference won't be checked: ./fake-file.js
\`\`\`

## Configuration

Edit `reference-checker.config` to customize exclusion patterns:

```bash
# JavaScript Regex Patterns (in code examples)
EXCLUDE_REGEX_PATTERNS=(
    "\/.*\/g"           # JavaScript global regex: /pattern/g
    "\/.*\/gi"          # Case-insensitive regex: /pattern/gi
    ...
)

# Add more patterns as needed
```

## Exit Codes

- **0**: All references valid (or only false positives found)
- **1**: Broken references detected (requires fixing)

## Integration

### Pre-commit Hook

Add to `.husky/pre-commit`:
```bash
#!/bin/bash
python3 .github/scripts/check-references.py || exit 1
```

### GitHub Actions

Add to `.github/workflows/*.yml`:
```yaml
- name: Check Documentation References
  run: python3 .github/scripts/check-references.py
```

### Manual Validation

Run before commits:
```bash
# Quick check
python3 .github/scripts/check-references.py

# Save output to file
python3 .github/scripts/check-references.py > reference-check-report.txt 2>&1
```

## Troubleshooting

### False Positives Not Excluded

If legitimate references are incorrectly excluded:
1. Check the context (is it in a code block?)
2. Review exclusion patterns in `reference-checker.config`
3. Adjust patterns or add exceptions

### Legitimate References Marked as Broken

If valid references show as broken:
1. Verify the file actually exists at that path
2. Check for typos in the reference
3. Ensure relative path is correct from source file location

### High Number of Broken References

If many broken references found:
1. Review first 10-20 to identify patterns
2. Check if files were moved/renamed
3. Consider batch fixing with search/replace
4. Update references to new locations

## Best Practices

1. **Run regularly**: Check references before commits
2. **Fix promptly**: Address broken references when found
3. **Document moves**: Update references when moving files
4. **Use relative paths**: Prefer `./` and `../` over absolute paths
5. **Review exclusions**: Periodically audit excluded patterns

## Performance

- **Python version**: ~15 seconds for 312 files, 3000+ references
- **Bash version**: ~20-25 seconds for same workload
- **Memory**: < 50MB typical usage

## Limitations

1. **Markdown only**: Currently scans `.md` files only
2. **Local files**: Cannot validate external URLs
3. **Pattern-based**: May miss complex reference formats
4. **No anchor validation**: Doesn't check if `#anchors` exist

## Future Enhancements

Potential improvements:
- [ ] Validate anchor links within files
- [ ] Check external URL availability (optional)
- [ ] Support additional file formats (JSDoc, TypeScript)
- [ ] JSON/YAML output format for CI/CD
- [ ] Interactive mode to fix references
- [ ] Batch reference updating tool

## Related Documentation

- [REFERENCE_CHECK_FALSE_POSITIVES_2026-01-28.md](../docs/reports/REFERENCE_CHECK_FALSE_POSITIVES_2026-01-28.md) - Analysis of false positive patterns
- [check-links.py](./check-links.py) - Markdown link checker
- [validate-cross-references.sh](./validate-cross-references.sh) - Cross-reference validator

## Version History

- **v1.0.0** (2026-01-28) - Initial release with intelligent filtering
  - Context-aware pattern detection
  - Automatic code block exclusion
  - Comprehensive false positive filtering
  - Python and Bash implementations

## License

Same as parent project (ISC)
