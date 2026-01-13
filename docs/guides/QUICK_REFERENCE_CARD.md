# Guia.js Quick Reference Card

## 🚀 Quick Start

```bash
# Install dependencies (first time only)
npm install

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Full validation (syntax + tests)
npm run test:all

# Start web server
python3 -m http.server 9000
# Then open: http://localhost:9000/test.html
```

## 📊 Current Project Status

- **Version**: 0.6.0-alpha
- **Tests**: 1224 passing in 57 suites (60 test files)
- **Coverage**: ~70% (69.82%)
- **Architecture**: 29 modular source files
- **Main Entry**: src/guia.js (468 lines)

## 🔧 Essential Commands

### Testing
```bash
npm test                    # Run all tests (~7 seconds)
npm run test:coverage       # Tests with coverage (~7 seconds)
npm run test:watch          # Watch mode for development
npm run test:all            # Syntax + tests (~8 seconds)
npm run validate            # Syntax check only (<1 second)
```

### Development
```bash
node src/guia.js            # Basic functionality test
node -c src/guia.js         # Syntax validation
python3 -m http.server 9000 # Start web server
```

### Pre-Push Validation
```bash
./.github/scripts/test-workflow-locally.sh
```
Simulates GitHub Actions workflow locally. Validates:
- JavaScript syntax
- Test suite execution
- Coverage generation
- Documentation format

### CDN URL Generation
```bash
./cdn-delivery.sh
```
Generates jsDelivr CDN URLs for current version. Output saved to `cdn-urls.txt`.

## 📁 Key Directories

```
guia_js/
├── src/                    # Source code (29 modular files)
│   ├── core/              # Singletons & managers
│   ├── services/          # API integrations
│   ├── coordination/      # Main coordinators
│   ├── data/              # Data processing
│   ├── html/              # UI components
│   └── speech/            # Speech synthesis
├── __tests__/             # Test files (60 files)
├── docs/                  # Documentation
├── examples/              # Usage examples (4 files)
└── .github/               # CI/CD and contribution guides
```

## 🧪 Testing Structure

- **Unit Tests**: Individual class/function tests
- **Integration Tests**: Component interaction tests
- **Feature Tests**: End-to-end functionality tests
- **External Tests**: API integration tests
- **Managers Tests**: Manager class tests

## 📚 Documentation Quick Links

### Core Guides
- [README.md](README.md) - Main project documentation
- [CONTRIBUTING.md](.github/CONTRIBUTING.md) - Contribution guidelines
- [WORKFLOW_SETUP.md](docs/WORKFLOW_SETUP.md) - CI/CD setup

### Architecture
- [POSITION_MANAGER.md](docs/architecture/POSITION_MANAGER.md)
- [WEB_GEOCODING_MANAGER.md](docs/architecture/WEB_GEOCODING_MANAGER.md)
- [GEOLOCATION_SERVICE_REFACTORING.md](docs/architecture/GEOLOCATION_SERVICE_REFACTORING.md)

### Testing Guides
- [TDD_GUIDE.md](.github/TDD_GUIDE.md)
- [UNIT_TEST_GUIDE.md](.github/UNIT_TEST_GUIDE.md)
- [JEST_COMMONJS_ES6_GUIDE.md](.github/JEST_COMMONJS_ES6_GUIDE.md)

### API Integration
- [NOMINATIM_INTEGRATION.md](docs/api-integration/NOMINATIM_INTEGRATION.md)
- [IBIRA_INTEGRATION.md](docs/IBIRA_INTEGRATION.md)

## 🐛 Troubleshooting

### Tests Failing?
```bash
npm test                    # Run to see specific failures
node -c src/guia.js         # Check syntax errors
```

### Syntax Errors?
```bash
npm run validate            # Validate all JS files
node -c src/filename.js     # Check specific file
```

### Web Server Issues?
```bash
# Change port if 9000 is in use
python3 -m http.server 8000

# Check if server is running
curl -I http://localhost:9000/test.html
```

### CDN Script Errors?
```bash
# Verify prerequisites
node --version              # Should be v18+
git --version              # Required
ls package.json            # Must be in project root

# Run from project root
cd /path/to/guia_js
./cdn-delivery.sh
```

## 🎯 Common Workflows

### Making Changes
1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes to code
3. Run validation: `npm run test:all`
4. Test in browser: Start server and test manually
5. Run pre-push check: `./.github/scripts/test-workflow-locally.sh`
6. Commit: `git commit -m "feat: description"`
7. Push: `git push origin feature/my-feature`

### Releasing New Version
1. Update version: `npm version minor` (or major/patch)
2. Generate CDN URLs: `./cdn-delivery.sh`
3. Commit changes: `git add . && git commit -m "chore: bump version"`
4. Create tag: `git tag v0.X.Y-alpha`
5. Push: `git push origin main --tags`
6. Wait 5-10 minutes for CDN sync

### Adding New Tests
1. Create test file in `__tests__/` following structure
2. Import module: `import { MyClass } from '../src/path/to/MyClass.js';`
3. Write tests using Jest
4. Run: `npm test` to verify
5. Check coverage: `npm run test:coverage`

## 🔐 Prerequisites

- **Node.js**: v18+ (v20.19.5 tested)
- **npm**: v10+
- **Python**: 3.11+ (for web server)
- **Git**: Any recent version
- **Modern Browser**: Chrome, Firefox, Safari, Edge

## 📞 Getting Help

1. Check [README.md](README.md) first
2. Review [CONTRIBUTING.md](.github/CONTRIBUTING.md)
3. Search [docs/](docs/) directory
4. Run `./.github/scripts/test-workflow-locally.sh` for validation
5. Check test output for specific errors

## 🎓 Key Concepts

### Immutability
- Use spread operator instead of push/splice
- Use map/filter instead of direct array manipulation
- See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for patterns

### Functional Programming
- Pure functions preferred
- Avoid side effects
- Referential transparency

### Testing Philosophy
- Test-driven development (TDD)
- Unit tests for individual components
- Integration tests for workflows
- See [TDD_GUIDE.md](.github/TDD_GUIDE.md)

---

**Last Updated**: 2026-01-01  
**Version**: 0.6.0-alpha  
**Status**: Active Development
