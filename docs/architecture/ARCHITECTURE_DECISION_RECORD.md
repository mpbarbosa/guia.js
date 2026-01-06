# Architecture Decision Record (ADR)

**Project**: Guia.js  
**Version**: 0.6.0-alpha  
**Date**: 2026-01-06

---

## ⚠️ CRITICAL: Project Type Classification

### Decision: Guia.js is a JavaScript Library/SDK, NOT a Website

**Status**: ✅ Accepted and Documented

**Context**: 
This project has been identified as a JavaScript library for geolocation services, specifically designed to be:
- Imported by other applications
- Distributed via CDN (jsDelivr)
- Integrated as a dependency
- NOT deployed as a standalone website

**Decision**:
Guia.js SHALL be treated as a **JavaScript Library/SDK** with the following implications:

1. **Distribution Method**: CDN (jsDelivr) + optional npm package
2. **NOT GitHub Pages**: GitHub Pages is inappropriate for library code
3. **Test Files**: `test.html` is for development only, not production deployment
4. **Documentation**: Markdown in `/docs` for repository browsing, not a docs website

**Consequences**:

✅ **Allowed**:
- Distributing via jsDelivr CDN (current method)
- Publishing to npm registry (future enhancement)
- Creating separate documentation website (new repository)
- Developers importing Guia.js into their applications

❌ **Prohibited**:
- Deploying to GitHub Pages as a website
- Creating `index.html` landing page in repository
- Treating as standalone web application
- Building for website deployment

**Rationale**:
- Project structure analysis shows 100% library characteristics
- `package.json` configured as ES6 module library
- 1224+ tests validate library functionality
- CDN distribution already operational
- No user-facing website content exists
- Main file is `src/guia.js` (JavaScript module), not `index.html`

**References**:
- [PROJECT_PURPOSE_AND_ARCHITECTURE.md](docs/PROJECT_PURPOSE_AND_ARCHITECTURE.md) - Complete documentation
- [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) - Structure analysis
- [README.md](README.md) - Usage and integration guide

---

## Decision Making Framework

Before making architectural changes, ask:

1. **"Would jQuery do this?"** - If not, Guia.js probably shouldn't either
2. **"Does this treat Guia.js as a library or a website?"** - Must be library
3. **"Is CDN distribution already solving this?"** - If yes, don't add complexity
4. **"Would this confuse developers integrating Guia.js?"** - If yes, don't do it

---

## Quick Reference: Library vs. Website

| Aspect | Library (Guia.js) | Website |
|--------|-------------------|---------|
| **Entry Point** | `src/guia.js` (imported) | `index.html` (visited) |
| **Distribution** | CDN, npm | Web server, hosting |
| **Users** | Developers integrating code | End-users visiting pages |
| **Purpose** | Provide functionality | Provide content |
| **Testing** | `test.html` (development only) | Production pages |
| **Deployment** | Tag → CDN sync | Build → web server |

---

**Last Updated**: 2026-01-06  
**Maintainer**: Architecture Team  
**Review Frequency**: When considering deployment or distribution changes

**Critical Document**: This ADR prevents inappropriate architectural decisions. Read before making infrastructure changes.
