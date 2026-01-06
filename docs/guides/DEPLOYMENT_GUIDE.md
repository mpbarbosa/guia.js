# Guia.js Deployment and Distribution Guide

**Version**: 0.6.0-alpha  
**Last Updated**: 2026-01-06

---

## ⚠️ IMPORTANT: Read This First

**Guia.js is a JavaScript library, NOT a website.**

- ❌ Do NOT deploy to GitHub Pages
- ❌ Do NOT create index.html for deployment
- ❌ Do NOT use static site hosting
- ✅ DO use CDN distribution (already configured)

**Full explanation**: [docs/PROJECT_PURPOSE_AND_ARCHITECTURE.md](docs/PROJECT_PURPOSE_AND_ARCHITECTURE.md)

---

## Current Distribution Method (Correct ✅)

### CDN Distribution via jsDelivr

**This is the correct and recommended distribution method.**

```bash
# 1. Make code changes and commit
git add .
git commit -m "feat: new feature"
git push

# 2. Bump version (creates git tag)
npm version patch  # or minor, major

# 3. Generate CDN URLs for new version
./cdn-delivery.sh

# 4. Commit updated URLs
git add cdn-urls.txt package.json package-lock.json
git commit -m "chore: bump version to v0.X.Y"

# 5. Push tag to trigger CDN sync
git push origin main
git push origin vX.Y.Z

# 6. Wait 5-10 minutes for jsDelivr to sync

# 7. Library is now available at:
# https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@X.Y.Z/src/guia.js
```

**That's it!** No deployment, no hosting, no GitHub Pages needed.

---

## How Developers Use Guia.js

### Integration Example

```html
<!-- Developer's application -->
<!DOCTYPE html>
<html>
<head>
    <title>My Geolocation App</title>
</head>
<body>
    <div id="map-container"></div>
    
    <!-- Import Guia.js from CDN -->
    <script src="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.6.0-alpha/src/guia.js"></script>
    
    <script>
        // Use Guia.js APIs
        const manager = new WebGeocodingManager(document, 'map-container');
        manager.startGeolocation();
    </script>
</body>
</html>
```

**Key point**: Developers import Guia.js into THEIR applications. Guia.js itself is not deployed.

---

## What About test.html?

**`test.html` is a development tool**, not a deployment target.

**Purpose**:
- Manual testing during development
- Validates library works in browser
- Local testing on `http://localhost:9000`

**NOT for**:
- Production deployment
- End-user access
- GitHub Pages hosting

**Usage**:
```bash
# Start local test server
python3 -m http.server 9000

# Open in browser
# http://localhost:9000/test.html

# Test library features manually
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Deploying to GitHub Pages

**Wrong thinking**: "This has HTML files, so it should be on GitHub Pages"

**Reality**: `test.html` is for development testing only. Guia.js is a library that other sites import, not a website itself.

**Analogy**: jQuery has test files too, but jQuery doesn't deploy to GitHub Pages.

### ❌ Mistake 2: Creating index.html

**Wrong thinking**: "We need index.html for GitHub Pages"

**Reality**: Libraries don't have landing pages. Developers import the code; they don't visit a website.

**Correct**: Main file is `src/guia.js` (JavaScript module to import)

### ❌ Mistake 3: Building for Web Deployment

**Wrong thinking**: "Let's bundle and deploy as a website"

**Reality**: CDN already handles distribution. Building for deployment would duplicate functionality.

**Correct**: Version tag → CDN auto-sync → developers import

---

## Future Distribution Options

### Option 1: npm Package (Appropriate ✅)

**When**: Ready to publish to npm registry

**How**:
```bash
# Publish to npm
npm publish

# Developers install
npm install guia_js

# Import in their code
import { WebGeocodingManager } from 'guia_js';
```

**Why appropriate**: Standard distribution for JavaScript libraries

### Option 2: Documentation Website (Appropriate ✅ - Separate Project)

**When**: Want a dedicated documentation site

**How**:
```bash
# Create NEW repository
guia_js-docs/
├── index.html (documentation website)
├── docs/ (rendered from guia_js/docs/*.md)
└── examples/ (interactive examples)

# Deploy THAT to GitHub Pages
# Keep guia_js repository as library code only
```

**Why appropriate**: Separates documentation (website) from library (code)

### Option 3: Interactive Playground (Appropriate ✅ - Separate Project)

**When**: Want developers to try APIs in browser

**How**:
```bash
# Create NEW repository
guia_js-playground/
├── index.html (playground UI)
├── Import guia.js from CDN
└── Interactive code examples

# Deploy to GitHub Pages or Vercel
```

**Why appropriate**: Separate project with clear purpose (demos library)

---

## Decision Matrix

| Option | Appropriate? | Why/Why Not |
|--------|-------------|-------------|
| CDN Distribution (current) | ✅ YES | Correct distribution for libraries |
| GitHub Pages for guia_js | ❌ NO | Not a website, no content to serve |
| npm Package | ✅ YES | Standard library distribution |
| Separate docs website | ✅ YES | If as separate repository |
| Separate playground | ✅ YES | If as separate repository |
| Deploy test.html | ❌ NO | Development tool, not production |

---

## Quick Checklist

Before making deployment decisions, verify:

- [ ] Read [PROJECT_PURPOSE_AND_ARCHITECTURE.md](docs/PROJECT_PURPOSE_AND_ARCHITECTURE.md)
- [ ] Understand Guia.js is a library, not a website
- [ ] Confirm CDN distribution is working
- [ ] Verify proposed change doesn't duplicate CDN functionality
- [ ] Check if jQuery (similar library) would do the same thing

If all checks pass, proceed. Otherwise, reconsider.

---

## Getting Help

**Questions about distribution**:
- Read: [docs/PROJECT_PURPOSE_AND_ARCHITECTURE.md](docs/PROJECT_PURPOSE_AND_ARCHITECTURE.md)
- Check: [ARCHITECTURE_DECISION_RECORD.md](ARCHITECTURE_DECISION_RECORD.md)

**Questions about CDN**:
- Script: `./cdn-delivery.sh`
- Output: `cdn-urls.txt`
- Docs: [README.md](README.md) - CDN Delivery section

**Questions about integration**:
- Examples: `/examples` directory
- Tests: `test.html` (local development)
- Docs: [docs/](docs/)

---

**Last Updated**: 2026-01-06  
**Maintainer**: Architecture Team

**Remember**: Guia.js is distributed via CDN, not deployed as a website. If you're thinking about GitHub Pages, you're probably on the wrong track. 🎯
