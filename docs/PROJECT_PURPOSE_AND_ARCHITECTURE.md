# Guia.js - Project Purpose and Architecture Documentation

**Version**: 0.6.0-alpha  
**Document Date**: 2026-01-06  
**Purpose**: Define project boundaries and prevent inappropriate architectural decisions

---

## 🎯 Project Purpose and Identity

### What Guia.js IS

**Guia.js is a JavaScript library/SDK for geolocation-aware web applications**, specifically designed for Brazilian addresses with the following characteristics:

1. **JavaScript Library** - Distributable code that other developers integrate into their applications
2. **Geolocation Engine** - Provides GPS positioning, geocoding, and address standardization services
3. **Brazilian Address Specialist** - Deep integration with Brazilian geographic data (IBGE, state codes, address formats)
4. **Multi-Environment Runtime** - Runs in both Node.js (testing/CLI) and browser (production) environments
5. **CDN-Deliverable** - Available via jsDelivr CDN for easy integration without npm installation
6. **SDK/Framework Component** - Designed to be embedded in larger applications, not a standalone website

### What Guia.js IS NOT

**Guia.js is NOT a static website or documentation site**, and therefore:

❌ **NOT suitable for GitHub Pages deployment** - GitHub Pages is for static HTML/CSS/JS sites, not JavaScript SDKs  
❌ **NOT a standalone web application** - It's a library that powers web applications  
❌ **NOT a blog or content website** - No static content to serve  
❌ **NOT a single-page application (SPA)** - It's imported by SPAs, not an SPA itself  
❌ **NOT documentation hosting** - Docs are in `/docs` for developers, not end-users  

### Core Design Philosophy

Guia.js follows these architectural principles:

```
┌─────────────────────────────────────────────────────────────┐
│  Guia.js Architecture Philosophy                            │
├─────────────────────────────────────────────────────────────┤
│  1. LIBRARY, NOT APPLICATION                                │
│     → Consumed by applications, not deployed standalone     │
│                                                              │
│  2. FUNCTIONAL PROGRAMMING FIRST                            │
│     → Referential transparency, immutability, pure functions│
│                                                              │
│  3. MULTI-RUNTIME COMPATIBILITY                             │
│     → Browser (primary) + Node.js (testing/CLI)             │
│                                                              │
│  4. API INTEGRATION LAYER                                   │
│     → Nominatim, IBGE, Google Maps - not a website         │
│                                                              │
│  5. CDN-FIRST DISTRIBUTION                                  │
│     → jsDelivr delivery, not static hosting                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture Overview

### System Architecture Type: **JavaScript SDK/Library**

```
┌────────────────────────────────────────────────────────────────┐
│                    Guia.js Architecture                         │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  DISTRIBUTION LAYER (How developers get it)             │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  • jsDelivr CDN (production)                            │  │
│  │  • npm package (optional)                               │  │
│  │  • Direct file inclusion                                │  │
│  │  • ES Module imports                                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  PUBLIC API LAYER (What developers use)                 │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  • WebGeocodingManager (main coordinator)               │  │
│  │  • PositionManager (singleton state)                    │  │
│  │  • GeolocationService (GPS integration)                 │  │
│  │  • BrazilianStandardAddress (address handling)          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  BUSINESS LOGIC LAYER (Core functionality)              │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  • GeoPosition (immutable position object)              │  │
│  │  • AddressDataExtractor (data processing)               │  │
│  │  • ReferencePlace (location references)                 │  │
│  │  • AddressCache (caching)                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  INTEGRATION LAYER (External APIs)                      │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  • ReverseGeocoder → Nominatim API                      │  │
│  │  • IbiraAPIFetchManager → IBGE API                      │  │
│  │  • Browser Geolocation API                              │  │
│  │  • Speech Synthesis API                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  PRESENTATION LAYER (Optional UI helpers)               │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  • HTMLPositionDisplayer (coordinate display)           │  │
│  │  • HTMLAddressDisplayer (address formatting)            │  │
│  │  • SpeechSynthesisManager (text-to-speech)             │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Architecture Classification

| Aspect | Classification | Implication |
|--------|----------------|-------------|
| **Type** | JavaScript SDK/Library | Embedded in apps, not deployed standalone |
| **Pattern** | Layered Architecture | Clear separation of concerns |
| **Paradigm** | Functional Programming | Immutability, pure functions, referential transparency |
| **State Management** | Singleton + Observer Pattern | Centralized state with observers |
| **Distribution** | CDN + Module System | Not a website deployment |
| **Runtime** | Browser (primary) + Node.js (testing) | Not a server application |

---

## 🚫 Why GitHub Pages is Inappropriate

### Technical Reasons

1. **GitHub Pages Purpose**: Static HTML/CSS/JS websites for end-users
   - **Guia.js Purpose**: JavaScript library for developers to import
   - **Mismatch**: No static website to serve

2. **No Index.html Entry Point**
   - GitHub Pages requires `index.html` as entry point
   - Guia.js has `test.html` (developer testing only, not production)
   - Main file is `src/guia.js` (imported by other apps)

3. **CDN is Already the Distribution Method**
   - jsDelivr serves the library globally
   - GitHub Pages would duplicate this unnecessarily
   - jsDelivr is optimized for library distribution

4. **Documentation vs. Library Code**
   - GitHub Pages hosts documentation sites
   - Guia.js documentation is in `/docs` (for repository browsing)
   - Not designed for end-user documentation site

### Architectural Reasons

```
❌ WRONG APPROACH: Deploy to GitHub Pages
┌─────────────────────────────────────┐
│  GitHub Pages (Static Hosting)      │
│  ├── index.html (doesn't exist)     │
│  ├── guia.js (can't run standalone) │
│  └── Serves as website ← WRONG      │
└─────────────────────────────────────┘

✅ CORRECT APPROACH: CDN Distribution + Integration
┌─────────────────────────────────────┐
│  jsDelivr CDN                        │
│  ├── guia.js@0.6.0-alpha             │
│  └── Developer imports into app     │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Developer's Web Application         │
│  ├── index.html                      │
│  ├── <script src="CDN/guia.js">     │
│  └── Uses Guia.js APIs               │
└─────────────────────────────────────┘
```

### Conceptual Reasons

| Concept | GitHub Pages Expectation | Guia.js Reality |
|---------|-------------------------|----------------|
| **User** | Website visitors clicking around | Developers integrating library |
| **Entry Point** | index.html landing page | No landing page - imported code |
| **Navigation** | Pages, links, menus | No navigation - API calls |
| **Purpose** | Information delivery | Functionality delivery |
| **Deployment** | Push to gh-pages branch | Already on jsDelivr CDN |

---

## ✅ Correct Distribution Methods

### 1. CDN Distribution (Primary Method)

**Current and Recommended Approach**:

```bash
# Generate CDN URLs
./cdn-delivery.sh

# Developers use in their HTML
<script src="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.6.0-alpha/src/guia.js"></script>
```

**Why this works**:
- ✅ Designed for library distribution
- ✅ Global CDN with 750+ locations
- ✅ Version pinning and SemVer support
- ✅ Auto-minification and optimization
- ✅ No deployment needed - automatic sync from GitHub

### 2. NPM Package (Future Enhancement)

**Potential Future Addition**:

```bash
# Publish to npm registry
npm publish

# Developers install
npm install guia_js

# Import in their code
import { WebGeocodingManager } from 'guia_js';
```

**Why this works**:
- ✅ Standard JavaScript package distribution
- ✅ Version management through npm
- ✅ Dependency tracking
- ✅ Build tool integration

### 3. Direct GitHub Repository Cloning (Development)

**For contributors and advanced users**:

```bash
# Clone repository
git clone https://github.com/mpbarbosa/guia_js.git

# Use in local projects
<script src="./guia_js/src/guia.js"></script>
```

**Why this works**:
- ✅ Development and testing
- ✅ Contribution workflow
- ✅ Local customization

### 4. Documentation Site (Separate Project)

**If documentation site is needed**:

```bash
# Create separate documentation repository
guia_js-docs/
├── index.html (documentation website)
├── docs/ (markdown rendered to HTML)
└── examples/ (usage examples)

# Deploy THAT to GitHub Pages
# guia_js repository remains library code
```

**Why this works**:
- ✅ Separates library code from documentation site
- ✅ GitHub Pages for documentation (appropriate use)
- ✅ Library remains on CDN
- ✅ Clear separation of concerns

---

## 📊 Project Structure Analysis

### Current Directory Structure

```
guia_turistico/
├── src/                    # SOURCE CODE (library core)
│   ├── guia.js             # Main entry point (exported module)
│   ├── guia_ibge.js        # IBGE integration
│   ├── core/               # Core domain classes
│   ├── data/               # Data processing
│   ├── html/               # UI helpers (optional)
│   ├── services/           # API integrations
│   ├── speech/             # Speech synthesis
│   └── utils/              # Utility functions
│
├── __tests__/              # TEST SUITES (not deployed)
│   ├── unit/               # 1224+ tests
│   ├── integration/
│   └── features/
│
├── docs/                   # DEVELOPER DOCUMENTATION (repository browsing)
│   ├── INDEX.md            # Documentation index
│   ├── architecture/       # Architecture docs
│   └── api-integration/    # API guides
│
├── examples/               # CODE EXAMPLES (for developers)
│   ├── geoposition-immutability-demo.js
│   └── geolocation-service-demo.js
│
├── test.html               # DEVELOPER TEST PAGE (not production)
├── package.json            # NODE.JS METADATA
├── cdn-delivery.sh         # CDN URL GENERATOR
├── cdn-urls.txt            # GENERATED CDN URLS
└── .github/                # GITHUB CONFIGURATION
    ├── workflows/          # CI/CD automation
    └── CONTRIBUTING.md     # Contribution guide
```

### Structure Analysis: Library vs. Website

| Directory/File | Library Evidence | Website Evidence |
|----------------|------------------|------------------|
| `src/` | ✅ Modular JavaScript code | ❌ No HTML pages |
| `__tests__/` | ✅ Test suites for library | ❌ Not public-facing |
| `docs/` | ✅ Developer documentation | ⚠️ Markdown, not rendered HTML |
| `examples/` | ✅ Code examples for integration | ❌ JavaScript files, not HTML pages |
| `test.html` | ⚠️ Test harness only | ❌ Not production website |
| `package.json` | ✅ Library metadata | ❌ No website build config |
| `cdn-delivery.sh` | ✅ CDN distribution | ❌ Not website deployment |

**Conclusion**: 100% library structure, 0% website structure

---

## 🎯 Development and Testing Workflow

### Local Development (Correct Approach)

```bash
# 1. Clone repository
git clone https://github.com/mpbarbosa/guia_js.git
cd guia_js

# 2. Install dependencies
npm install

# 3. Run tests (library validation)
npm run test:all

# 4. Test in browser environment (development only)
python3 -m http.server 9000
# Open http://localhost:9000/test.html

# 5. Make changes to library code
vim src/guia.js

# 6. Validate changes
npm run validate
npm test

# 7. Commit and push
git add .
git commit -m "feat: add new geolocation feature"
git push
```

### Distribution Workflow (Correct Approach)

```bash
# 1. Bump version
npm version minor  # 0.6.0 → 0.7.0

# 2. Generate CDN URLs
./cdn-delivery.sh

# 3. Commit version bump
git add package.json cdn-urls.txt
git commit -m "chore: bump version to v0.7.0"

# 4. Create and push tag
git tag v0.7.0
git push origin main
git push origin v0.7.0

# 5. jsDelivr automatically syncs (5-10 minutes)
# Library is now available at:
# https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.7.0/src/guia.js
```

### What NOT to Do (Incorrect Approaches)

```bash
# ❌ WRONG: Try to deploy to GitHub Pages
git checkout gh-pages
# This makes no sense - there's no website to deploy

# ❌ WRONG: Build a static site from library code
npm run build  # No build script exists or needed
# This is a library, not a bundled application

# ❌ WRONG: Create index.html for GitHub Pages
echo "<html>...</html>" > index.html
# This creates confusion - the library has no landing page

# ❌ WRONG: Use GitHub Pages for CDN
# jsDelivr already provides optimized CDN delivery
```

---

## 📚 Integration Examples

### How Developers Should Use Guia.js

#### Example 1: Simple Web Application

```html
<!-- developer-app/index.html -->
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

#### Example 2: React Application

```jsx
// developer-app/src/components/GeoMap.jsx
import { WebGeocodingManager, PositionManager } from 'guia_js';

function GeoMap() {
  useEffect(() => {
    const manager = new WebGeocodingManager(document, 'map-root');
    manager.startGeolocation();
    
    return () => manager.cleanup();
  }, []);
  
  return <div id="map-root"></div>;
}
```

#### Example 3: Node.js CLI Tool

```javascript
// developer-cli/geocode.js
import { ReverseGeocoder, BrazilianStandardAddress } from 'guia_js';

async function geocode(lat, lon) {
  const geocoder = new ReverseGeocoder(lat, lon);
  const data = await geocoder.fetch();
  const address = new BrazilianStandardAddress(data);
  console.log(address.format());
}

geocode(-23.550520, -46.633309);
```

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Developer's Application (Hosted anywhere)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  index.html (developer's website)                           │
│  ├── <script src="CDN/guia.js"> ← IMPORTS Guia.js          │
│  ├── Uses WebGeocodingManager                               │
│  ├── Uses PositionManager                                   │
│  └── Renders geolocation features                           │
│                                                              │
│  Deployed to:                                               │
│  • Vercel, Netlify, AWS, Azure, etc.                        │
│  • Developer's own server                                   │
│  • GitHub Pages (if developer wants)                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                         ↑
                         │ (imports from CDN)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  Guia.js Library (CDN Distribution)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  jsDelivr CDN                                               │
│  ├── guia.js@0.6.0-alpha                                    │
│  ├── Provides APIs                                          │
│  └── Embedded in developer's app                            │
│                                                              │
│  Source Repository:                                         │
│  • GitHub: mpbarbosa/guia_js                                │
│  • Version tags trigger CDN sync                            │
│  • NOT deployed as website                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Comparison: Library vs. Website Project

### Project Type Indicators

| Indicator | Website Project | Guia.js Reality |
|-----------|-----------------|----------------|
| **Main file** | `index.html` | `src/guia.js` (JavaScript module) |
| **Purpose** | Users visit and interact | Developers import and integrate |
| **Navigation** | Links, pages, menus | API methods and classes |
| **Content** | HTML pages | JavaScript code |
| **Assets** | Images, CSS, fonts | None (code only) |
| **Deployment** | Web server or static host | CDN + npm package |
| **Entry point** | URL in browser | `import` or `<script>` tag |
| **Testing** | Browser testing, E2E | Unit tests, integration tests |
| **Build process** | Bundle, minify, optimize | Already optimized (single file) |
| **Documentation** | User guides, tutorials | API docs, code examples |

### Telltale Signs This is a Library

1. ✅ **`package.json` with `"type": "module"`** - Node.js library configuration
2. ✅ **`src/` directory structure** - Source code organization for library
3. ✅ **`__tests__/` with 1224 tests** - Comprehensive test suite for library
4. ✅ **`examples/` directory** - Code examples for developers, not website pages
5. ✅ **`cdn-delivery.sh` script** - CDN distribution automation
6. ✅ **No `index.html` in root** - Not a website entry point
7. ✅ **`test.html` is test harness** - Development tool, not production page
8. ✅ **ES6 modules everywhere** - Modern JavaScript module system
9. ✅ **Exported classes and functions** - Public API for developers
10. ✅ **No build configuration** - Library is already in usable form

---

## 🛑 Common Misconceptions

### Misconception 1: "test.html means this should be on GitHub Pages"

**Reality**: `test.html` is a **developer test harness**, not a production website.

- **Purpose**: Manual testing of library features during development
- **Audience**: Contributors and maintainers, not end-users
- **Environment**: Local web server (`python3 -m http.server 9000`)
- **Not suitable for**: Public deployment or end-user access

**Correct mental model**:
```
test.html is like a Jest test, but manual
↓
Used during development
↓
Not deployed to production
```

### Misconception 2: "Having HTML means it's a website"

**Reality**: HTML is used for **testing the library in browser context**, not as website content.

- **Library use**: Testing DOM manipulation and browser APIs
- **Website use**: Serving content to users
- **Guia.js has**: Library use only

**Analogy**:
```
jQuery has test.html files too
→ But jQuery is a library, not a website
→ Test files validate library works in browser
→ Not deployed as website
```

### Misconception 3: "Documentation should be on GitHub Pages"

**Reality**: Documentation is in **Markdown for repository browsing**, not HTML for hosting.

- **Current state**: `/docs` directory with Markdown files
- **Audience**: Developers reading on GitHub
- **Format**: Markdown (rendered by GitHub automatically)
- **No need for**: Separate documentation website

**If documentation website is desired** (future enhancement):
```
Create separate repository: guia_js-docs
↓
Build documentation site with Docsify, VuePress, etc.
↓
Deploy THAT to GitHub Pages
↓
Keep guia_js repository as library code only
```

### Misconception 4: "GitHub Pages is for hosting code"

**Reality**: GitHub Pages is for **static websites**, CDN is for **library distribution**.

| GitHub Pages | jsDelivr CDN | Guia.js Needs |
|--------------|--------------|---------------|
| Static HTML/CSS/JS websites | JavaScript libraries | JavaScript library |
| User-facing pages | Developer imports | Developer imports ✅ |
| Navigation and content | API and modules | API and modules ✅ |
| Blog, portfolio, docs sites | jQuery, React, etc. | Like jQuery ✅ |

**Correct choice**: jsDelivr CDN (already implemented)

---

## 📋 Decision Making Guide

### When Evaluating Deployment Options

Ask these questions:

1. **Does this project have an `index.html` entry point?**
   - ❌ No → Not suitable for website hosting
   - ✅ Guia.js: No index.html (library, not website)

2. **Is there user-facing content to serve?**
   - ❌ No → Not suitable for GitHub Pages
   - ✅ Guia.js: Only developer APIs (not user content)

3. **Is the main file a JavaScript module?**
   - ✅ Yes → Library/SDK distribution via CDN/npm
   - ✅ Guia.js: src/guia.js is ES6 module

4. **Are there automated tests for the code?**
   - ✅ Yes (1224 tests) → Library validation
   - ✅ Guia.js: Comprehensive test suite

5. **Is CDN distribution already working?**
   - ✅ Yes → No need for additional hosting
   - ✅ Guia.js: jsDelivr CDN operational

6. **Do developers import this code?**
   - ✅ Yes → Library distribution pattern
   - ✅ Guia.js: Imported via CDN or modules

**Conclusion Matrix**:

| Question | Answer | Implication |
|----------|--------|-------------|
| Entry point? | JavaScript module | Library, not website |
| User content? | Developer APIs only | CDN, not hosting |
| Main file? | src/guia.js | Import target, not page |
| Tests? | 1224 automated tests | Library validation |
| CDN? | Already on jsDelivr | Distribution solved |
| Import pattern? | Yes | Correct approach |

**Final Decision**: ✅ **Continue CDN distribution, avoid GitHub Pages**

---

## 🎓 Educational Analogy

Think of Guia.js like jQuery:

```
jQuery:
├── jquery.js (library file)
├── Distributed via CDN (code.jquery.com)
├── Developers import into their websites
└── NOT deployed as a website itself

Guia.js:
├── guia.js (library file)
├── Distributed via CDN (cdn.jsdelivr.net)
├── Developers import into their websites
└── NOT deployed as a website itself
```

**Both are libraries, not websites**.

If jQuery tried to deploy to GitHub Pages, it would be equally inappropriate:
- ❌ No website to deploy
- ❌ Library code, not HTML pages
- ❌ CDN already handles distribution
- ❌ Developers import it, not visit it

**Same logic applies to Guia.js**.

---

## 🚀 Future Considerations

### Appropriate Enhancements

1. **NPM Package Distribution** ✅ Appropriate
   ```bash
   npm publish guia_js
   npm install guia_js
   ```
   - Adds another distribution method
   - Complements CDN delivery
   - Standard for JavaScript libraries

2. **Separate Documentation Website** ✅ Appropriate (as separate project)
   ```
   Create: guia_js-docs repository
   Deploy: THAT repository to GitHub Pages
   Result: Documentation site + library code separate
   ```
   - Clear separation of concerns
   - Documentation on Pages, library on CDN
   - Best of both worlds

3. **Interactive Playground** ✅ Appropriate (as separate project)
   ```
   Create: guia_js-playground repository
   Purpose: Try Guia.js APIs in browser
   Deploy: GitHub Pages or Vercel
   ```
   - Demonstrates library capabilities
   - Separate from library code
   - Clear purpose and audience

4. **npm Scripts Enhancement** ✅ Appropriate
   ```json
   "scripts": {
     "build": "Bundle library for npm distribution",
     "prepare": "Pre-publish validation"
   }
   ```
   - Prepares library for npm
   - Adds distribution option
   - Does not change core purpose

### Inappropriate Changes

1. **Deploy Library to GitHub Pages** ❌ Inappropriate
   - Library is not a website
   - CDN already handles distribution
   - Would cause confusion

2. **Create Landing Page in Repository** ❌ Inappropriate
   - index.html has no purpose here
   - Library is imported, not visited
   - Misleading to developers

3. **Build Process for Website** ❌ Inappropriate
   - Library is already in usable form
   - No website to build
   - Unnecessary complexity

4. **Website-style Navigation** ❌ Inappropriate
   - APIs are navigated via code, not links
   - No pages to navigate between
   - Fundamentally wrong approach

---

## 📝 Summary and Recommendations

### Key Takeaways

1. **Guia.js is a JavaScript library/SDK** - Not a website or web application
2. **Distribution via CDN is correct** - jsDelivr handles delivery optimally
3. **GitHub Pages is inappropriate** - No website to deploy
4. **test.html is for development** - Not a production entry point
5. **Current architecture is sound** - Library structure is proper

### Recommended Actions

✅ **CONTINUE**:
- CDN distribution via jsDelivr
- Repository-based documentation (Markdown in `/docs`)
- Test-driven development with comprehensive test suite
- Version tagging for CDN sync
- Functional programming principles

✅ **CONSIDER**:
- Publishing to npm registry (additional distribution)
- Creating separate documentation website (new repository)
- Interactive playground (separate project)
- Enhanced code examples in repository

❌ **AVOID**:
- Deploying to GitHub Pages (library, not website)
- Creating index.html in repository (misleading)
- Building for website deployment (wrong architecture)
- Treating library as standalone application (wrong paradigm)

### When in Doubt

Ask: **"Would jQuery do this?"**

If jQuery (a JavaScript library similar to Guia.js) wouldn't do it, Guia.js shouldn't either.

- ❌ jQuery doesn't deploy to GitHub Pages → Guia.js shouldn't
- ✅ jQuery uses CDN distribution → Guia.js should too
- ✅ jQuery has separate documentation site → Guia.js could (as separate project)
- ❌ jQuery doesn't have index.html → Guia.js shouldn't

---

## 🔗 References

### Internal Documentation
- [README.md](../README.md) - Project overview
- [Architecture Documentation](architecture/) - Technical architecture details
- [Contributing Guide](../.github/CONTRIBUTING.md) - Development guidelines
- [CDN Delivery Script](../cdn-delivery.sh) - Distribution automation

### External Resources
- [jsDelivr Documentation](https://www.jsdelivr.com/docs) - CDN service docs
- [GitHub Pages Documentation](https://docs.github.com/pages) - Why it's for websites, not libraries
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry) - Future enhancement reference

---

**Document Maintainer**: Project Architecture Team  
**Last Review**: 2026-01-06  
**Next Review**: When considering new distribution methods

**Purpose**: This document serves as the definitive reference for understanding Guia.js project identity and preventing architectural mistakes like inappropriate GitHub Pages migration.
