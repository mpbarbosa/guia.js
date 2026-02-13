# Architecture Decision Record (ADR)

**Project**: Guia Turístico (Tourist Guide SPA)  
**Version**: 0.9.0-alpha  
**Date**: 2026-01-06

---

## ⚠️ CRITICAL: Project Type Classification

### Decision: Guia Turístico is a Single-Page Application (SPA), NOT a Library

**Status**: ✅ Accepted and Documented

**Context**:
This project is a tourist guide web application built on top of the Guia.js library (https://github.com/mpbarbosa/guia_js), specifically designed to be:

- Deployed as a standalone web application
- Used directly by end-users through a browser
- Integrated with geolocation services via the Guia.js library dependency
- A consumer/implementation of the Guia.js library

**Decision**:
Guia Turístico SHALL be treated as a **Single-Page Web Application** with the following implications:

1. **Distribution Method**: Deployed web application (GitHub Pages or web server)
2. **Application Type**: SPA with routing, DOM manipulation, and user interactions
3. **Entry Point**: `src/index.html` for end-users accessing the application
4. **Dependencies**: Consumes Guia.js library for geolocation functionality

**Consequences**:

✅ **Allowed**:

- Deploying to GitHub Pages or web hosting services
- Creating user-facing web interfaces (`src/index.html`, `src/app.js`)
- Treating as standalone web application
- Building and optimizing for website deployment
- Importing Guia.js library as a dependency

❌ **Prohibited**:

- Distributing Guia Turístico itself as a library/SDK
- Publishing the application to npm as a package
- Treating as a reusable component for other applications
- Using as a CDN-distributed library

**Rationale**:

- Project structure analysis shows 100% web application characteristics
- `src/index.html` is the main entry point for users
- `src/app.js` contains SPA routing and initialization logic
- 1,882 tests validate application functionality (1,739 passing)
- Uses Guia.js library (from https://github.com/mpbarbosa/guia_js) as a dependency
- Designed for end-user interaction, not developer integration

**References**:

- [PROJECT_PURPOSE_AND_ARCHITECTURE.md](docs/PROJECT_PURPOSE_AND_ARCHITECTURE.md) - Complete documentation
- [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) - Structure analysis
- [README.md](README.md) - Usage and integration guide

---

## Decision Making Framework

Before making architectural changes, ask:

1. **"Is this a user-facing feature?"** - If yes, it belongs in Guia Turístico
2. **"Does this treat Guia Turístico as a SPA or a library?"** - Must be SPA
3. **"Would end-users directly interact with this?"** - If yes, implement it
4. **"Does this require deploying to a web server?"** - If yes, that's appropriate

---

## Quick Reference: Library vs. Application

| Aspect | Library (Guia.js - dependency) | Application (Guia Turístico - this project) |
|--------|-------------------------------|---------------------------------------------|
| **Entry Point** | `src/guia.js` (imported) | `src/index.html` (visited) |
| **Distribution** | CDN, npm | Web server, GitHub Pages |
| **Users** | Developers integrating code | End-users visiting pages |
| **Purpose** | Provide geolocation functionality | Provide tourist guide experience |
| **Testing** | Unit tests, integration tests | SPA functionality, DOM interactions |
| **Deployment** | Tag → CDN sync | Build → web server deployment |

---

**Last Updated**: 2026-01-06  
**Maintainer**: Architecture Team  
**Review Frequency**: When considering deployment or distribution changes

**Critical Document**: This ADR prevents inappropriate architectural decisions. Read before making infrastructure changes.
