## GETTING_STARTED

# Getting Started with Guia Turístico

**Quick start guide for developers to set up and run the application in under 10 minutes.**

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** v18+ (tested with v20.19.5)
- **npm** v10+
- **Git** for cloning the repository
- A modern web browser (Chrome 94+, Firefox 93+, Safari 15+)
- Internet connection for API access

## 5-Minute Quick Start

### 1. Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/mpbarbosa/guia_turistico.git
cd guia_turistico

# Install dependencies (~20 seconds)
npm install
```

### 2. Validate Installation (30 seconds)

```bash
# Check syntax (< 1 second)
npm run validate

# Run basic test (< 1 second)
node src/app.js
# Expected output: "Initializing Guia Turístico SPA..."
```

### 3. Start Development Server (30 seconds)

```bash
# Start Vite dev server with HMR (~3 seconds)
npm run dev

# Server starts at: http://localhost:9000
```

### 4. Test the Application (1 minute)

1. Open http://localhost:9000 in your browser
2. Click **"Obter Localização"** button
3. Grant location permissions when prompted
4. Watch coordinates and address display in real-time

**🎉 Success!** You're now running Guia Turístico.

---

## Development Workflows

### Daily Development

```bash
# Start development server (recommended)
npm run dev
# → Hot Module Replacement (HMR) enabled
# → Changes auto-reload without page refresh

# Run tests before committing
npm run test:all
# → Syntax validation + full test suite
# → ~45 seconds, 2,235 tests should pass

# Build for production
npm run build
# → Output: dist/ folder (900 KB optimized bundle)
```

### Testing Workflows

```bash
# Quick syntax check only (< 1 second)
npm run validate

# Run full test suite (~45 seconds)
npm test

# Run tests with coverage (~45 seconds)
npm run test:coverage

# Run specific test file
npm test -- __tests__/path/to/test.test.js

# Watch mode (for active development)
npm run test:watch
```

### Production Workflows

```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
# → Starts at http://localhost:9001

# Generate CDN URLs
npm run cdn:generate
# → Output: cdn-urls.txt
```

---

## Project Structure Overview

```
guia_turistico/
├── src/                    # Source code
│   ├── app.js             # SPA entry point (543 lines)
│   ├── index.html         # Main HTML page
│   ├── core/              # Core architecture (Position, State)
│   ├── services/          # API services (Geocoding, Geolocation)
│   ├── coordination/      # Service coordinators
│   ├── data/              # Data models (Address, ReferencePlace)
│   ├── html/              # UI displayers
│   ├── speech/            # Speech synthesis
│   ├── utils/             # Utilities (TimerManager)
│   └── views/             # View controllers (home, converter)
├── __tests__/             # Test suites (101 suites, 2,401 tests)
├── docs/                  # Documentation
├── dist/                  # Production build output (generated)
├── package.json           # Dependencies and scripts
└── vite.config.js         # Vite build configuration
```

---

## Key Commands Reference

| Command | Purpose | Time |
|---------|---------|------|
| `npm install` | Install dependencies | 20s |
| `npm run validate` | Syntax check only | <1s |
| `npm run dev` | Start dev server | 3s |
| `npm run build` | Production build | 5s |
| `npm run preview` | Preview production | 3s |
| `npm test` | Run all tests | 65s |
| `npm run test:coverage` | Tests with coverage | 45s |
| `npm run test:all` | Syntax + tests | 45s |

---

## Understanding the Application

### Core Functionality

**Primary Feature**: Real-time location tracking while navigating the city

```javascript
// Application flow:
1. User clicks "Obter Localização"
2. Browser requests location permission
3. Coordinates displayed (latitude, longitude)
4. Address lookup via OpenStreetMap Nominatim
5. Brazilian locati

---

## QUICK_START_GUIDE

# Quick Start Guide - Guia Turístico

**Last Updated**: 2026-02-13
**Version**: 0.9.0-alpha
**Estimated Time**: 5-10 minutes

---

## TL;DR - Get Running in 5 Minutes

```bash
# Clone and setup
git clone https://github.com/mpbarbosa/guia_turistico.git
cd guia_turistico
npm install                    # 20 seconds

# Validate everything works
npm run validate               # <1 second - syntax check
npm test                       # ~65 seconds - 2,235 tests pass

# Start development
npm run dev                    # Vite dev server on port 9000
# → Open http://localhost:9000
```

**That's it!** You're ready to develop. See [Installation](#installation) below for more options.

---

## Prerequisites

### Required

- **Node.js** v18+ (tested with v20.19.5)
- **npm** v10+
- **Git** for version control

### Optional

- **Python** 3.11+ (for legacy HTTP server)
- **Chrome/Firefox** (for E2E tests)
- **VS Code** or similar editor

### Check Your Environment

```bash
node --version    # Should show v18.0.0 or higher
npm --version     # Should show 10.0.0 or higher
git --version     # Any recent version
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mpbarbosa/guia_turistico.git
cd guia_turistico
```

### 2. Install Dependencies

```bash
npm install
```

**What gets installed**:

- guia.js library (geolocation core)
- Vite 7.3.1 (build tool)
- Jest 30.1.3 (testing framework)
- jsdom 25.0.1 (DOM simulation)
- Puppeteer 24.35.0 (E2E testing)
- 299 packages total

**Expected time**: ~20 seconds on good connection

### 3. Verify Installation

```bash
# Quick syntax check (<1 second)
npm run validate

# Run test suite (~65 seconds)
npm test

# Expected: ✅ 2,235 tests passing (2,401 total)
```

---

## Development Modes

### Option 1: Modern Development (Recommended)

**Use Vite dev server with Hot Module Replacement (HMR)**

```bash
npm run dev
```

**Benefits**:

- ⚡ Instant hot reload on file changes
- 🚀 Fast refresh without page reload
- 🔧 Source maps for debugging
- 📦 Modern ES modules
- ✅ Starts in 3 seconds

**Access**: http://localhost:9000

### Option 2: Production Preview

**Test the production build locally**

```bash
npm run build      # Create optimized bundle
npm run preview    # Preview on port 9001
```

**Use when**: Testing production behavior before deployment

### Option 3: Legacy Mode

**Direct file serving without build step**

```bash
python3 -m http.server 9000
```

**Access**: http://localhost:9000/src/index.html
**Use when**: Debugging without build tools

---

## Your First Changes

### 1. Make a Simple Change

Edit `src/views/home.js`:

```javascript
// Find this line (around line 50)
console.log('Home view initialized');

// Change to:
console.log('Home view initialized - My First Change!');
```

### 2. See the Change

**With Vite** (npm run dev): Changes appear instantly!
**Without Vite**: Refresh browser manually

### 3. Validate Your Change

```bash
# Syntax check
npm run validate

# Run tests
npm test
```

---

## Common Commands

### Development

```bash
npm run dev           # Start dev server (HMR)
npm run build         # Build for production
npm run preview       # Preview production build
```

### Validation

```bash
npm run validate      # Syntax check only
npm test              # Run all tests
npm run test:coverage # Test with coverage
npm run test:watch    # Watch mode for TDD
npm run test:all      # Syntax + tests
```

### Utilities

```bash
npm run cdn:generate  # Generate CDN URLs
npm run ci:test-local # Test CI workflow locally
```

---

## Understanding the Codebase

### Project Structure

```
guia_turistico/
├── src/                    # Source code
│   ├── app.js             # SPA entry point
│   ├── index.html         # Main HTML
│   ├── views/             # View controllers
│   │   ├── home.js        # Location tracking view
│   │   └── converter.js   # Coordinate converter
│   ├── core/              # Core position management
│   ├── services/
