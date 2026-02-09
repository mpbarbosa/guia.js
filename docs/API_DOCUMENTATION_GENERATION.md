# API Documentation Generation

---
Last Updated: 2026-02-09
Status: Active
Category: Guide
---

## Overview

This project uses JSDoc to generate API documentation from inline code comments. The generated documentation provides a navigable HTML reference for all classes, functions, and modules.

## Quick Start

### Generate Documentation

```bash
npm run docs:generate
```

This will:
- Parse JSDoc comments in `src/` directory
- Generate HTML documentation to `docs/api-generated/`
- Include source code links and type information

### View Documentation Locally

```bash
npm run docs:serve
```

Then open: `http://localhost:8080`

## Configuration

JSDoc configuration is defined in `jsdoc.json`:

- **Source**: `src/` directory (recursive)
- **Output**: `docs/api-generated/` (gitignored)
- **Excludes**: `node_modules`, `__tests__`, `coverage`, `legacy-tests`

## What Gets Documented

### Fully Documented Modules

According to `docs/JSDOC_COVERAGE_REPORT.md`, these have 100% JSDoc coverage:

- **Core**: `PositionManager`, `GeoPosition`
- **Services**: `GeolocationService`, `ReverseGeocoder`
- **Data**: `BrazilianStandardAddress`, `AddressExtractor`, `AddressCache`
- **HTML Displayers**: `HTMLPositionDisplayer`, `HTMLAddressDisplayer`, etc.
- **Speech**: Full speech synthesis module
- **Utilities**: `TimerManager`, configuration, constants

## Generated Documentation Structure

```
docs/api-generated/
├── index.html              # Entry point
├── global.html             # Global functions/constants
├── PositionManager.html    # Class documentation
├── GeolocationService.html
├── ...                     # One file per class/module
└── styles/                 # CSS for documentation
```

## Integration with Main Documentation

The generated API docs complement the existing documentation:

- **Manual Docs** (`docs/`): Architecture, guides, testing strategy
- **API Docs** (`docs/api-generated/`): Technical reference from code

## Updating Documentation

### When to Regenerate

Run `npm run docs:generate` after:
- Adding new classes or functions
- Updating JSDoc comments
- Making API changes
- Before releases

### Automated Generation

Consider adding to CI/CD:

```yaml
- name: Generate API Documentation
  run: npm run docs:generate
  
- name: Validate JSDoc
  run: npm run docs:generate 2>&1 | tee jsdoc.log && ! grep -i "error" jsdoc.log
```

## GitHub Pages Publishing (Optional)

To publish API docs to GitHub Pages:

1. **Create gh-pages branch**:
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   npm run docs:generate
   git add docs/api-generated/
   git commit -m "docs: initial API documentation"
   git push origin gh-pages
   ```

2. **Configure GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: `gh-pages` branch
   - Directory: `/docs/api-generated/`
   - URL: `https://mpbarbosa.github.io/guia_turistico/api/`

3. **Automated Updates** (GitHub Actions):
   ```yaml
   - name: Deploy API Docs
     uses: peaceiris/actions-gh-pages@v3
     with:
       github_token: ${{ secrets.GITHUB_TOKEN }}
       publish_dir: ./docs/api-generated
   ```

## Customization

### Custom Template

To use a custom JSDoc template:

```bash
npm install --save-dev docdash
```

Update `jsdoc.json`:
```json
{
  "opts": {
    "template": "node_modules/docdash"
  }
}
```

Popular templates:
- `docdash` - Clean, modern theme
- `minami` - Minimalist design
- `better-docs` - Enhanced features

### Custom Plugins

Add plugins to `jsdoc.json`:
```json
{
  "plugins": [
    "plugins/markdown",
    "node_modules/jsdoc-mermaid"
  ]
}
```

## Troubleshooting

### No Output Generated

Check:
- JSDoc comments exist in source files
- `src/` directory has `.js` files
- No syntax errors in JSDoc comments

### Missing Classes

Ensure classes are properly exported:
```javascript
export class MyClass { }  // ✅ Will be documented
class MyClass { }          // ❌ Won't appear
```

### Broken Links

Run validation:
```bash
npm run docs:generate 2>&1 | grep -i "error"
```

## Best Practices

1. **Keep Comments Current**: Update JSDoc when modifying code
2. **Use Type Annotations**: Specify `@param {Type}` and `@returns {Type}`
3. **Add Examples**: Use `@example` for complex functions
4. **Link Related Classes**: Use `{@link ClassName}` for cross-references
5. **Regenerate Before Releases**: Ensure docs match code

## Related Documentation

- [JSDoc Coverage Report](../JSDOC_COVERAGE_REPORT.md) - Current coverage status
- [Code Quality Plan](../CODE_QUALITY_ACTION_PLAN.md) - Quality improvements
- [Testing Strategy](../testing/TEST_STRATEGY.md) - Test documentation

## npm Scripts Reference

```bash
# Generate API documentation
npm run docs:generate

# Serve documentation locally on http://localhost:8080
npm run docs:serve

# Check JSDoc coverage (if tool exists)
npm run jsdoc:validate
```

## Notes

- **Output is gitignored**: `docs/api-generated/` not committed to repository
- **100% JSDoc coverage**: All source files have complete documentation
- **Local-first**: Generate on-demand, not required for builds
- **Optional feature**: Not required for development workflow
