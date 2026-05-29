# Quick Start Guide

**Version:** 0.27.3-alpha
**Get up and running in under 10 minutes**

## Prerequisites

- **Node.js** v20.19.0 or higher
- **npm** v10.0.0 or higher
- Modern web browser with geolocation support

## 5-Minute Setup

### Step 1: Clone and Install (2 minutes)

```bash
# Clone repository
git clone https://github.com/mpbarbosa/guia.js.git
cd guia_js

# Install dependencies
npm install
```

**Expected output:**

```
added 299 packages in 20s
```

### Step 2: Validate Installation (30 seconds)

```bash
# Run syntax validation
npm run validate

# Run basic tests
npm test
```

**Expected output:**

```
✅ Syntax validation passed
✅ 4,000+ tests passing (~190 suites)
```

### Step 3: Start Development Server (30 seconds)

```bash
# Start Vite dev server with HMR
npm run dev
```

**Expected output:**

```
  VITE v5.x.x  ready in ~3s

  ➜  Local:   http://localhost:9000/
  ➜  Network: use --host to expose
```

### Step 4: Open Application (10 seconds)

Open your browser and navigate to:

```
http://localhost:9000/
```

### Step 5: Test Geolocation (1 minute)

1. Click the **"Obter Localização"** button
2. Grant location permissions when prompted
3. View your coordinates and address
4. See highlight cards for municipality and neighborhood

**Congratulations!** You're now running Guia Turístico locally.

---

## Your First Code Change

### Modify the Welcome Message

**File:** `src/views/home.ts` (search for `inicializado`)

```typescript
// Change this:
this.log('Guia Turístico v0.27.3-alpha inicializado');

// To this:
this.log('My Custom Tourist Guide v0.27.3-alpha inicializado');
```

**Reload the page** and you'll see your custom message in the log area.

---

## Common Tasks

### Run Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- __tests__/unit/core/PositionManager.test.ts

# Run tests with coverage
npm run test:coverage

# Watch mode (auto-rerun on changes)
npm run test:watch
```

### Build for Production

```bash
# Compile TypeScript + bundle with Vite
npm run build

# Preview the production bundle locally
npm run preview
```

### Validate Code Quality

```bash
# Full validation (syntax + tests)
npm run test:all

# Lint TypeScript/JavaScript
npm run lint

# Fix lint issues automatically
npm run lint:fix
```

### Check Documentation

```bash
# Check version consistency
npm run check:version

# Check for broken references
npm run check:references

# Check terminology consistency
npm run check:terminology
```

---

## Project Structure Overview

```
guia_js/
├── src/
│   ├── app.ts              # Vue entry point + router (#/, #/converter)
│   ├── main.ts             # Vue app bootstrap
│   ├── index.html          # Main HTML page
│   ├── core/               # Singletons (PositionManager, GeoPosition)
│   ├── services/           # External APIs (Geolocation, Geocoding, IBGE)
│   ├── data/               # Value objects + processing (Address, Cache)
│   ├── html/               # UI displayers
│   ├── speech/             # Speech synthesis
│   ├── coordination/       # Service orchestration
│   ├── components/         # Vue SFCs (HomeView, AppHeroHeader, etc.)
│   └── utils/              # Utilities (TimerManager, button-status)
├── __tests__/              # Unit + integration test suites
├── tests/e2e/              # Playwright E2E tests
├── docs/                   # Documentation
└── package.json            # Project configuration
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/app.ts` | Vue entry point + SPA router |
| `src/index.html` | Main application page |
| `src/core/PositionManager.ts` | Central geolocation state (Singleton) |
| `src/services/GeolocationService.ts` | Browser geolocation wrapper |
| `src/data/BrazilianStandardAddress.ts` | Address value object |
| `src/config/defaults.js` | Configuration constants |
| `src/components/HomeView.vue` | Main view component |

---

## Essential Commands Cheat Sheet

```bash
# Development
npm install                  # Install dependencies
npm run dev                  # Vite dev server (port 9000, HMR)
npm run build                # Production bundle to dist/
npm run preview              # Preview production build (port 9001)

# Testing
npm test                     # All tests (~4,000+)
npm run test:unit            # Unit tests only
npm run test:e2e             # Puppeteer E2E tests
npm run test:playwright      # Playwright E2E tests
npm run test:coverage        # Coverage report
npm run test:watch           # Watch mode

# Code Quality
npm run validate             # JS syntax validation
npm run lint                 # Lint TypeScript/JavaScript
npm run lint:fix             # Auto-fix lint issues
npm run test:all             # Syntax + tests

# Utilities
npm run check:version        # Version consistency
npm run cdn:generate         # Generate CDN URLs
npm run docs:generate        # Generate JSDoc
```

---

## Troubleshooting

### Issue: `npm install` fails

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Tests fail with DOM errors

**Solution:** Ensure you're using the correct Node.js version:

```bash
node --version  # Should be v20.19.0+
```

### Issue: Geolocation not working

**Solutions:**

1. Use `https://` or `localhost` (required for geolocation API)
2. Grant location permissions in browser
3. Check browser console for error messages

### Issue: Dev server port already in use

**Solution:** Use a different port:

```bash
npm run dev -- --port 8000
# Then open: http://localhost:8000/
```

---

## Next Steps

### 1. Read Core Documentation

- [API Reference](../api/API_REFERENCE.md) - Complete API documentation
- [API Examples](../api/API_EXAMPLES.md) - Code examples
- [Architecture Overview](../architecture/SYSTEM_OVERVIEW.md) - System design

### 2. Explore Test Examples

```bash
# Read test files for usage examples
cat __tests__/unit/core/PositionManager.test.ts
cat __tests__/integration/address/AddressCache.test.ts
```

### 3. Try Modifying Components

Start with simple changes:

- Modify speech synthesis messages
- Change display formatting
- Add new address fields
- Adjust timing thresholds

### 4. Run E2E Tests

```bash
# Puppeteer end-to-end tests
npm run test:e2e

# Playwright end-to-end tests
npm run test:playwright
```

### 5. Contribute

Read the [Contributing Guide](../../.github/CONTRIBUTING.md) to learn about:

- Code style conventions
- Immutability principles
- Pull request process
- Testing requirements

---

## Learning Path

### Beginner (Week 1)

- Complete this Quick Start
- Read API Reference basics
- Run and understand existing tests
- Make your first code change

### Intermediate (Week 2-3)

- Understand architecture patterns
- Implement a new display component
- Add a new field to BrazilianStandardAddress
- Write your first test

### Advanced (Week 4+)

- Implement a new service integration
- Optimize performance bottlenecks
- Debug complex E2E test scenarios
- Contribute to the project

---

## Getting Help

### Documentation Resources

1. **In-Project Documentation:** `docs/` directory
2. **API Reference:** [docs/api/API_REFERENCE.md](../api/API_REFERENCE.md)
3. **Examples:** [docs/api/API_EXAMPLES.md](../api/API_EXAMPLES.md)
4. **Architecture:** [docs/architecture/SYSTEM_OVERVIEW.md](../architecture/SYSTEM_OVERVIEW.md)

### Code References

```bash
# Search codebase for examples
grep -r "PositionManager" src/
grep -r "ReverseGeocoder" __tests__/
```

### Test as Documentation

Tests serve as living documentation:

```bash
# Find usage examples in tests
cat __tests__/unit/core/PositionManager.test.ts
cat __tests__/integration/services/GeolocationService.test.ts
```

---

## Development Workflow

### Daily Development Cycle

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make changes
# ... edit files ...

# 4. Validate
npm run test:all

# 5. Commit
git add .
git commit -m "feat: add my feature"

# 6. Push
git push origin feature/my-feature

# 7. Create pull request
```

### Pre-Commit Validation

Git hooks automatically run:

- **pre-commit:** Syntax validation + unit tests
- **pre-push:** Full test suite

To bypass (not recommended):

```bash
git commit --no-verify
```

---

## Performance Expectations

| Operation | Time | Notes |
|-----------|------|-------|
| npm install | ~20s | First time only |
| npm run dev | ~3s | Vite dev server with HMR |
| npm run build | ~5s | Production bundle to dist/ |
| npm test | ~65s | 4,000+ tests |
| npm run validate | <1s | Syntax check |
| npm run test:unit | ~10s | Unit tests only |
| Page load | <2s | Local network |

---

## Configuration Files

### package.json

- Dependencies and scripts
- Jest configuration
- Node.js engine requirements

### vite.config.ts

- Vite build configuration
- CDN URL resolution plugin
- Module aliases

### eslint.config.js

- TypeScript/JavaScript linting rules
- Code style enforcement

### .husky/

- Git hooks (pre-commit, pre-push)
- Automated validation

---

## Browser Compatibility

### Supported Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features

- Geolocation API
- Web Speech API (optional, for speech synthesis)
- ES Modules
- Promises/Async-Await

---

## Production Deployment

For production deployment, see [DEPLOYMENT.md](../infrastructure/DEPLOYMENT.md).

Quick checklist:

- [ ] Run full test suite
- [ ] Build for production (`npm run build`)
- [ ] Configure HTTPS
- [ ] Set up error monitoring
- [ ] Enable caching
- [ ] Configure CSP headers

---

## Quick Reference: Important Patterns

### Singleton Pattern

```typescript
const manager = PositionManager.getInstance();
```

### Observer Pattern

```typescript
manager.addObserver({
  update(data) {
    console.log('Updated:', data);
  }
});
```

### Factory Pattern

```typescript
const factory = new DisplayerFactory();
const displayer = factory.createPositionDisplayer(document, 'container');
```

### TimerManager (required for all timers)

```typescript
import timerManager from '../utils/TimerManager.js';
timerManager.setInterval(callback, delay, 'my-timer-id');
```

---

## Success Criteria

You've completed the Quick Start when you can:

- Install dependencies successfully
- Run tests and see 4,000+ passing
- Start the dev server with `npm run dev`
- View the application in browser
- Trigger geolocation and see coordinates
- View address information
- Make a simple code change
- Run validation before committing

---

## What's Next

Choose your path:

### Frontend Developer

→ Explore `src/components/` Vue SFCs
→ Read [USER_GUIDE.md](../user/USER_GUIDE.md)
→ Modify CSS in `src/*.css`

### Backend Developer

→ Explore `src/services/` API integrations
→ Read [SYSTEM_OVERVIEW.md](../architecture/SYSTEM_OVERVIEW.md)
→ Implement new service providers

### QA Engineer

→ Explore `__tests__/` test suites
→ Read [UNIT_TEST_GUIDE.md](./UNIT_TEST_GUIDE.md)
→ Write new test scenarios

### Technical Writer

→ Explore `docs/` documentation
→ Read existing guides
→ Improve documentation clarity

---

**Ready to dive deeper?** Continue with [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for comprehensive development practices.

---

**Version:** 0.27.3-alpha
**Last Updated:** 2026-05-28
**Status:** Production Ready
