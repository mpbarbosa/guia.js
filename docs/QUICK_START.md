# Quick Start Guide

**Version:** 0.9.0-alpha  
**Get up and running in under 10 minutes**

## Prerequisites

- **Node.js** v20.19.0 or higher
- **npm** v10.0.0 or higher
- **Python** 3.11+ (for local web server)
- Modern web browser with geolocation support

## 5-Minute Setup

### Step 1: Clone and Install (2 minutes)

```bash
# Clone repository
git clone https://github.com/mpbarbosa/guia_turistico.git
cd guia_turistico

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
✅ 2,235 tests passing (2,401 total)
```

### Step 3: Start Development Server (30 seconds)

```bash
# Start local web server
python3 -m http.server 9000
```

**Expected output:**
```
Serving HTTP on 0.0.0.0 port 9000 (http://0.0.0.0:9000/) ...
```

### Step 4: Open Application (10 seconds)

Open your browser and navigate to:
```
http://localhost:9000/src/index.html
```

### Step 5: Test Geolocation (1 minute)

1. Click the **"Obter Localização"** button
2. Grant location permissions when prompted
3. View your coordinates and address
4. See highlight cards for municipality and neighborhood

**🎉 Congratulations!** You're now running Guia Turístico locally.

---

## Your First Code Change

### Modify the Welcome Message

**File:** `src/views/home.js` (line ~30)

```javascript
// Change this:
this.log('Guia Turístico v0.9.0-alpha inicializado');

// To this:
this.log('My Custom Tourist Guide v0.9.0-alpha inicializado');
```

**Reload the page** and you'll see your custom message in the log area.

---

## Common Tasks

### Run Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- __tests__/unit/core/PositionManager.test.js

# Run tests with coverage
npm run test:coverage

# Watch mode (auto-rerun on changes)
npm run test:watch
```

### Validate Code Quality

```bash
# Full validation (syntax + tests)
npm run test:all

# Lint JavaScript
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
guia_turistico/
├── src/
│   ├── app.js              # Main SPA entry point
│   ├── index.html          # Main HTML page
│   ├── core/               # Core classes (PositionManager, GeoPosition)
│   ├── services/           # Services (Geolocation, Geocoding)
│   ├── data/               # Data processing (Address, Cache)
│   ├── html/               # Display components
│   ├── speech/             # Speech synthesis
│   ├── coordination/       # Service coordinators
│   └── utils/              # Utilities
├── __tests__/              # Test suites
├── docs/                   # Documentation
└── package.json            # Project configuration
```

---

## Key Files to Know

| File | Purpose | Lines |
|------|---------|-------|
| `src/app.js` | SPA routing and initialization | 543 |
| `src/index.html` | Main application page | 379 |
| `src/core/PositionManager.js` | Central geolocation state | ~300 |
| `src/services/GeolocationService.js` | Browser geolocation wrapper | ~200 |
| `src/data/BrazilianStandardAddress.js` | Address standardization | ~300 |
| `src/config/defaults.js` | Configuration constants | 130+ |

---

## Essential Commands Cheat Sheet

```bash
# Development
npm install                  # Install dependencies
npm run validate            # Validate syntax
npm test                    # Run all tests
python3 -m http.server 9000 # Start web server

# Testing
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:coverage       # Coverage report
npm run test:watch          # Watch mode

# Code Quality
npm run lint                # Lint JavaScript
npm run lint:fix            # Auto-fix lint issues
npm run test:all            # Syntax + tests

# Utilities
npm run check:version       # Version consistency
npm run cdn:generate        # Generate CDN URLs
npm run docs:generate       # Generate JSDoc
```

---

## Basic API Usage

### Get Current Position

```javascript
import GeolocationService from './src/services/GeolocationService.js';

const service = new GeolocationService();

service.getCurrentPosition(
  (position) => {
    console.log('Lat:', position.coords.latitude);
    console.log('Lon:', position.coords.longitude);
  },
  (error) => {
    console.error('Error:', error.message);
  }
);
```

### Fetch Address

```javascript
import ReverseGeocoder from './src/services/ReverseGeocoder.js';
import BrazilianStandardAddress from './src/data/BrazilianStandardAddress.js';

async function getAddress(lat, lon) {
  const geocoder = new ReverseGeocoder(lat, lon);
  const data = await geocoder.fetchAddress();
  
  const address = new BrazilianStandardAddress();
  address.setFromNominatim(data);
  
  console.log(address.toString());
  return address;
}

// Usage
getAddress(-23.550520, -46.633309);
```

### Display on Map

```javascript
import HTMLPositionDisplayer from './src/html/HTMLPositionDisplayer.js';
import GeoPosition from './src/core/GeoPosition.js';

const displayer = new HTMLPositionDisplayer(document, 'position-container');
const position = new GeoPosition(-23.550520, -46.633309);

displayer.display(position);
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

### Issue: Web server port already in use

**Solution:** Use a different port:
```bash
python3 -m http.server 8000
# Then open: http://localhost:8000/src/index.html
```

---

## Next Steps

### 1. Read Core Documentation

- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [API Examples](./API_EXAMPLES.md) - Code examples
- [Architecture Overview](./ARCHITECTURE_OVERVIEW.md) - System design

### 2. Explore Test Examples

```bash
# Read test files for usage examples
cat __tests__/unit/core/PositionManager.test.js
cat __tests__/integration/address/AddressCache.test.js
```

### 3. Try Modifying Components

Start with simple changes:
- Modify speech synthesis messages
- Change display formatting
- Add new address fields
- Adjust timing thresholds

### 4. Run E2E Tests

```bash
# See real-world workflows
npm test -- __tests__/e2e/CompleteGeolocationWorkflow.e2e.test.js
```

### 5. Contribute

Read the [Contributing Guide](../.github/CONTRIBUTING.md) to learn about:
- Code style conventions
- Immutability principles
- Pull request process
- Testing requirements

---

## Learning Path

### Beginner (Week 1)
- ✅ Complete this Quick Start
- 📖 Read API Reference basics
- 🧪 Run and understand existing tests
- 💻 Make your first code change

### Intermediate (Week 2-3)
- 🏗️ Understand architecture patterns
- 🔧 Implement a new display component
- 🧩 Add a new field to BrazilianStandardAddress
- 📝 Write your first test

### Advanced (Week 4+)
- 🎯 Implement a new service integration
- ⚡ Optimize performance bottlenecks
- 🔍 Debug complex E2E test scenarios
- 🤝 Contribute to the project

---

## Getting Help

### Documentation Resources

1. **In-Project Documentation:** `docs/` directory (80+ guides)
2. **API Reference:** [API_REFERENCE.md](./API_REFERENCE.md)
3. **Examples:** [API_EXAMPLES.md](./API_EXAMPLES.md)
4. **Architecture:** [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)

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
cat __tests__/unit/core/PositionManager.test.js
cat __tests__/integration/services/GeolocationService.test.js
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
| npm test | ~65s | 2,401 tests |
| npm run validate | <1s | Syntax check |
| npm run test:unit | ~10s | Unit tests only |
| Server startup | ~3s | Python HTTP server |
| Page load | <2s | Local network |

---

## Configuration Files

### package.json
- Dependencies and scripts
- Jest configuration
- Node.js engine requirements

### jsdoc.json
- JSDoc generation settings
- API documentation config

### eslint.config.js
- JavaScript linting rules
- Code style enforcement

### .husky/
- Git hooks (pre-commit, pre-push)
- Automated validation

---

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Required Features
- Geolocation API
- Web Speech API (optional, for speech synthesis)
- ES6 Modules
- Promises/Async-Await

---

## Production Deployment

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md).

Quick checklist:
- [ ] Run full test suite
- [ ] Build for production
- [ ] Configure HTTPS
- [ ] Set up error monitoring
- [ ] Enable caching
- [ ] Configure CSP headers

---

## Updates and Versioning

Current version: **0.9.0-alpha**

Check for updates:
```bash
# Check outdated dependencies
npm run deps:check

# Update to latest minor versions
npm run deps:update-minor

# View changelog
cat CHANGELOG.md
```

---

## Quick Reference: Important Patterns

### Singleton Pattern
```javascript
const manager = PositionManager.getInstance();
```

### Observer Pattern
```javascript
manager.addObserver({
  update(data) {
    console.log('Updated:', data);
  }
});
```

### Factory Pattern
```javascript
const factory = new DisplayerFactory();
const displayer = factory.createPositionDisplayer(document, 'container');
```

### Composition Pattern
```javascript
// SpeechSynthesisManager uses composition
const manager = SpeechSynthesisManager.getInstance();
// Internally uses: VoiceLoader, VoiceSelector, SpeechConfiguration
```

---

## Success Criteria

You've completed the Quick Start when you can:

- ✅ Install dependencies successfully
- ✅ Run tests and see 2,235+ passing
- ✅ Start the web server
- ✅ View the application in browser
- ✅ Trigger geolocation and see coordinates
- ✅ View address information
- ✅ Make a simple code change
- ✅ Run validation before committing

---

## What's Next?

Choose your path:

### 🎨 Frontend Developer
→ Explore `src/html/` display components  
→ Read [USER_GUIDE.md](./user/USER_GUIDE.md)  
→ Modify CSS in `src/*.css`

### 🔧 Backend Developer
→ Explore `src/services/` API integrations  
→ Read [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)  
→ Implement new service providers

### 🧪 QA Engineer
→ Explore `__tests__/` test suites  
→ Read [TESTING_GUIDE.md](./TESTING_GUIDE.md)  
→ Write new test scenarios

### 📚 Technical Writer
→ Explore `docs/` documentation  
→ Read existing guides  
→ Improve documentation clarity

---

**Ready to dive deeper?** Continue with [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for comprehensive development practices.

---

**Version:** 0.9.0-alpha  
**Last Updated:** 2026-02-11  
**Status:** ✅ Production Ready
