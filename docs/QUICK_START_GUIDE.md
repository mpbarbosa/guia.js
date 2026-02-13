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

**That's it!** You're ready to develop. See [detailed guide](#detailed-guide) below for more options.

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
│   ├── services/          # API services
│   ├── data/              # Data processing
│   ├── html/              # UI displayers
│   ├── speech/            # Speech synthesis
│   └── utils/             # Utilities
├── __tests__/             # Test suites (2,401 tests)
├── docs/                  # Documentation
└── dist/                  # Production build (generated)
```

### Key Files to Know
| File | Purpose |
|------|---------|
| `src/app.js` | Application entry point, routing |
| `src/views/home.js` | Main location tracking interface |
| `src/core/PositionManager.js` | Geolocation state management |
| `src/services/GeolocationService.js` | Browser geolocation API |
| `src/coordination/WebGeocodingManager.js` | Main coordinator |

### Architecture Overview
```
User Interface (Views)
    ↓
Coordination Layer (Coordinators)
    ↓
Service Layer (APIs)
    ↓
Data Layer (Models)
```

See [Architecture Overview](ARCHITECTURE_OVERVIEW.md) for details.

---

## Testing Your Changes

### Quick Test
```bash
npm run validate    # <1 second - syntax only
```

### Full Test Suite
```bash
npm test           # ~65 seconds - all 2,401 tests
```

### Test Specific Component
```bash
npm test -- PositionManager    # Test one class
npm test -- __tests__/core/    # Test one directory
```

### Watch Mode (TDD)
```bash
npm run test:watch    # Auto-run tests on changes
```

### E2E Tests
```bash
npm test -- __tests__/e2e/    # Run all E2E tests
```

---

## Common Tasks

### Add a New Feature
1. Create/modify files in `src/`
2. Run `npm run validate` (syntax check)
3. Add tests in `__tests__/`
4. Run `npm test` (verify tests pass)
5. Test in browser with `npm run dev`

### Fix a Bug
1. Write a failing test first (TDD)
2. Fix the code
3. Run `npm test` to verify
4. Run `npm run validate` for syntax
5. Test manually if UI-related

### Add Documentation
1. Create/update .md files in `docs/`
2. Follow [Documentation Standards](CODE_PATTERN_DOCUMENTATION_GUIDE.md)
3. Update [MASTER_INDEX.md](MASTER_INDEX.md) if needed
4. Add cross-references to related docs

---

## Troubleshooting

### Installation Issues

#### npm install fails
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Node version too old
```bash
# Install Node v18+ using nvm
nvm install 18
nvm use 18
```

### Development Server Issues

#### Port 9000 already in use
```bash
# Find and kill process
lsof -ti:9000 | xargs kill -9

# Or use different port
npm run dev -- --port 9001
```

#### Changes not reflecting
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Test Issues

#### Tests failing
```bash
# Run specific test for details
npm test -- --verbose PositionManager

# Check for open handles
npx jest --detectOpenHandles
```

#### Test timeout
```bash
# Increase timeout (in test file)
jest.setTimeout(30000);  // 30 seconds
```

### Browser Issues

#### Geolocation not working
- Requires HTTPS or localhost
- Grant permission when prompted
- Check browser console for errors

#### CORS errors
- Use dev server (npm run dev) not file://
- Or use legacy server with proper headers

---

## Next Steps

### For New Developers
1. Read [Developer Onboarding](developer/ONBOARDING.md)
2. Review [Architecture Overview](ARCHITECTURE_OVERVIEW.md)
3. Check [Contributing Guide](../.github/CONTRIBUTING.md)
4. Browse [API Reference](api/COMPLETE_API_REFERENCE.md)

### For Contributors
1. Read [Contributing Guide](../.github/CONTRIBUTING.md)
2. Check [Code Quality Guide](CODE_QUALITY_ACTION_PLAN.md)
3. Review [Testing Guide](developer/TESTING_GUIDE.md)
4. Follow [Git Best Practices](../.github/GIT_BEST_PRACTICES_GUIDE.md)

### For Users
1. Read [User Guide](user/USER_GUIDE.md)
2. Try [Location Tracking](user/features/location-tracking.md)
3. Check [FAQ](user/FAQ.md)
4. See [Troubleshooting](user/TROUBLESHOOTING.md)

---

## Resources

### Documentation
- **[Master Index](MASTER_INDEX.md)** - All documentation
- **[API Reference](api/COMPLETE_API_REFERENCE.md)** - Complete API docs
- **[Developer Guide](developer/DEVELOPER_GUIDE.md)** - Development workflows

### External Links
- **[guia.js Library](https://github.com/mpbarbosa/guia_js)** - Core dependency
- **[Vite Documentation](https://vitejs.dev)** - Build tool
- **[Jest Documentation](https://jestjs.io)** - Testing framework

### Get Help
- **[GitHub Issues](https://github.com/mpbarbosa/guia_turistico/issues)** - Report bugs
- **[Discussions](https://github.com/mpbarbosa/guia_turistico/discussions)** - Ask questions
- **[Contributing](../.github/CONTRIBUTING.md)** - Contribution guidelines

---

## Quick Reference Card

### Essential Commands
```bash
# Development
npm run dev           # Start dev server
npm run build         # Build production
npm run preview       # Preview build

# Testing
npm run validate      # Syntax check
npm test              # All tests
npm run test:watch    # Watch mode

# Utilities
npm run cdn:generate  # CDN URLs
npm run ci:test-local # Local CI test
```

### Essential Files
| File | Purpose |
|------|---------|
| `src/app.js` | Entry point |
| `src/index.html` | Main page |
| `package.json` | Dependencies |
| `vite.config.js` | Build config |
| `jest.config.json` | Test config |

### Essential Ports
- **9000** - Vite dev server
- **9001** - Vite preview server
- **9877** - E2E test server

---

**Navigation**: [← Back to Master Index](MASTER_INDEX.md) | [Developer Onboarding →](developer/ONBOARDING.md)

**Updated**: 2026-02-13 | **Status**: ✅ Active | **Version**: 0.9.0-alpha
