# Guia.js - Geolocation Web Application

Guia.js is a JavaScript-based geolocation web application (version 0.6.0-alpha) that provides geolocation services, address geocoding, and mapping integration for Brazilian addresses. The application includes DOM manipulation, OpenStreetMap/Nominatim API integration, and speech synthesis capabilities.

**CRITICAL: Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Run the Application
- **Node.js Testing**: `node src/guia.js` - takes <1 second. Validates basic functionality and logs version.
- **Syntax Validation**: `node -c src/guia.js && node -c src/guia_ibge.js` - takes <1 second each. ALWAYS run before commits.
- **Web Server**: `python3 -m http.server 9000` - starts in 3 seconds. NEVER CANCEL - keeps running until stopped.
- **Access Application**: Navigate to `http://localhost:9000/test.html` for full functionality testing.

### Build and Test Process
- **NEVER CANCEL any long-running server processes** - they run indefinitely by design
- **Install Dependencies**: `npm install` - takes 20 seconds. Downloads 299 packages including Jest testing framework.
- **Syntax Check**: Always run `node -c src/guia.js` (timeout: 10 seconds) before making changes
- **Basic Test**: Run `node src/guia.js` (timeout: 10 seconds) to verify core functionality
- **Automated Tests**: `npm test` - takes 2 seconds. Runs 1224 tests in 57 suites. NEVER CANCEL.
- **Test Coverage**: `npm run test:coverage` - takes 2.2 seconds. Shows ~70% coverage. NEVER CANCEL.
- **Full Validation**: `npm run test:all` - takes 4 seconds. Combines syntax + tests. NEVER CANCEL.
- **Web Test**: Start web server with `python3 -m http.server 9000` (timeout: 10 seconds to start, runs indefinitely)

### Development Workflow
- Always validate JavaScript syntax with `node -c` before committing changes
- Test core functionality with `node src/guia.js` to see version output and basic initialization
- Run automated tests with `npm run test:all` before commits to ensure 1224+ tests pass
- For DOM/web features, use the web server and test.html for manual validation
- **Follow immutability principles** - see `.github/CONTRIBUTING.md` for guidelines
- **TIMING**: Syntax checks <1 second, tests ~3 seconds, web server startup 3 seconds

## Validation Scenarios

### Manual Testing Requirements
After making any changes, ALWAYS run through these validation scenarios:

1. **Basic Node.js Execution**:
   ```bash
   node src/guia.js
   # Should output: [timestamp] Guia.js version: 0.6.0-alpha
   ```

2. **Automated Test Suite**:
   ```bash
   npm run test:all
   # Should show: ✅ 1224+ tests passing, ✅ 57 suites, ~3 seconds execution
   ```

3. **Web Application Functionality**:
   - Start web server: `python3 -m http.server 9000`
   - Open `http://localhost:9000/test.html` 
   - Click "Obter Localização" button
   - Verify geolocation prompts appear (if supported)
   - Check console log output in browser developer tools
   - Test "Encontrar Restaurantes" and "Estatísticas da Cidade" buttons

4. **Code Integration Test**:
   - Verify no JavaScript errors in browser console
   - Confirm all classes initialize properly
   - Test DOM element binding (buttons, text areas, etc.)

### Required User Scenarios
- **Geolocation Flow**: User grants location permission → coordinates display → address lookup occurs
- **Restaurant Search**: User clicks restaurant button → coordinates are passed to search function
- **Address Display**: Geographic data gets processed and formatted for Brazilian addresses
- **Logging**: All actions appear in the bottom textarea log area

## Repository Structure

### Key Files
- `src/guia.js` (468 lines) - Main application entry point and exports (modularized from 2288 lines into 29 files)
- `guia_ibge.js` (10 lines) - IBGE (Brazilian statistics) integration utilities
- `test.html` (133 lines) - Test page for manual validation
- `package.json` - Node.js configuration with Jest testing framework
- `__tests__/` - 60 test files with 1224+ total tests
- `.github/CONTRIBUTING.md` - Contribution guidelines including immutability principles
- `.github/scripts/test-workflow-locally.sh` - Pre-push validation script (simulates CI/CD)
- `cdn-delivery.sh` - CDN URL generator for jsDelivr distribution

### Important Classes and Components

#### Core Architecture (src/core/, src/services/, src/coordination/)
- `PositionManager` (src/core/PositionManager.js) - Singleton for current geolocation state
- `GeoPosition` (src/core/GeoPosition.js) - Immutable position value object
- `SingletonStatusManager` (src/status/SingletonStatusManager.js) - Status management across components
- `ReverseGeocoder` (src/services/ReverseGeocoder.js) - OpenStreetMap/Nominatim integration
- `GeolocationService` (src/services/GeolocationService.js) - Browser geolocation API wrapper
- `WebGeocodingManager` (src/coordination/WebGeocodingManager.js) - Main coordination class

#### Data Processing (src/data/)
- `BrazilianStandardAddress` (src/data/BrazilianStandardAddress.js) - Brazilian address standardization
- `AddressExtractor` (src/data/AddressExtractor.js) - Address data extraction
- `AddressCache` (src/data/AddressCache.js) - Address caching functionality
- `AddressDataExtractor` (src/data/AddressDataExtractor.js) - Complete address data extraction and caching
- `ReferencePlace` (src/data/ReferencePlace.js) - Reference location handling

#### UI and Display (src/html/)
- `HTMLPositionDisplayer` (src/html/HTMLPositionDisplayer.js) - Coordinate display and Google Maps integration
- `HTMLAddressDisplayer` (src/html/HTMLAddressDisplayer.js) - Address formatting and presentation
- `DisplayerFactory` (src/html/DisplayerFactory.js) - Factory for display components
- `HtmlText` (src/html/HtmlText.js) - Text display utilities

#### Speech Synthesis (src/speech/)
- `SpeechSynthesisManager` (src/speech/SpeechSynthesisManager.js) - Text-to-speech functionality
- `SpeechQueue` (src/speech/SpeechQueue.js) - Speech queue management
- `SpeechItem` (src/speech/SpeechItem.js) - Individual speech items

### API Integrations
- **OpenStreetMap Nominatim**: `https://nominatim.openstreetmap.org/reverse` for geocoding
- **IBGE API**: `https://servicodados.ibge.gov.br/api/v1/localidades/estados/` for Brazilian location data
- **Google Maps**: Links for map viewing and Street View integration

## Testing Infrastructure

### Automated Test Coverage
- **1224+ tests** across 57 test suites running in ~3 seconds
- **~70% code coverage** overall (69.82% actual)
- **100% coverage** of guia_ibge.js (full coverage)
- **Test Categories**: Core utilities, Singleton patterns, Position management, IBGE integration, Immutability patterns

### Test Execution Commands
```bash
# Run all tests (2 seconds)
npm test

# Run tests with coverage report (2.2 seconds)  
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch

# Syntax validation only (<1 second)
npm run validate

# Full validation: syntax + tests (4 seconds total)
npm run test:all
```

### Expected Test Results
- ✅ 1224+ tests passing
- ✅ 57 suites of test files
- ✅ ~70% code coverage overall
- ✅ 100% code coverage on guia_ibge.js
- ✅ 14 immutability pattern tests

## Common Development Tasks

### Adding New Geolocation Features
- Always extend appropriate base classes (APIFetcher for API calls, etc.)
- Follow the MVC pattern: Extractor → Validator → Formatter → Displayer
- Update both Node.js compatibility and DOM functionality
- Write tests for new functionality in `__tests__/` directory
- **Follow immutability principles**: Use spread operator, filter, map instead of push, splice, sort
- See `.github/CONTRIBUTING.md` for comprehensive immutability guidelines

### Debugging Geolocation Issues
- Check browser console for JavaScript errors
- Verify geolocation permissions in browser
- Test API endpoints manually: `curl "https://nominatim.openstreetmap.org/reverse?format=json&lat=-23.550520&lon=-46.633309"`
- Monitor network requests in browser developer tools
- Check the bottom textarea log area for application-specific logs

### Working with Brazilian Address Data
- Use `BrazilianStandardAddress` class for address standardization
- Reference `AddressDataExtractor` for data processing patterns
- Test with Brazilian coordinate examples: São Paulo (-23.550520, -46.633309)
- IBGE integration available through `renderUrlUFNome()` function

## Limitations and Known Issues

### Browser Dependencies
- Full functionality requires modern browser with geolocation API support
- Some features (speech synthesis, DOM manipulation) only work in web environment
- Location permissions must be granted by user for geolocation features

### Known Limitations
- `findNearbyRestaurants()` function exists as placeholder with alert notification - requires external service integration
- `fetchCityStatistics()` function exists as placeholder with alert notification - requires backend implementation
- Error handling for API failures could be enhanced

### Development Environment
- No formal linting configuration - use `node -c` for syntax validation
- No build process - files are used directly
- Manual testing required for DOM/browser features

## CI/CD Integration

### GitHub Actions Workflow
The repository includes `.github/workflows/copilot-coding-agent.yml` with automated validation:
- **JavaScript Syntax Validation**: `node -c` on all JS files
- **Basic Functionality Test**: `node src/guia.js` execution 
- **Web Server Test**: Python HTTP server startup and connectivity
- **Security Checks**: Basic credential and eval() usage scanning
- **Code Style Checks**: Basic formatting validation

### Pre-commit Validation Commands
Always run before committing changes:
```bash
# Essential validation (5 seconds total)
npm run test:all

# Additional checks
curl -s http://localhost:9000/test.html | grep "Guia.js"  # If web server running
```

### Local Workflow Testing Script
The repository includes `.github/scripts/test-workflow-locally.sh` for pre-push validation:

**Purpose**: Simulate GitHub Actions workflow locally to catch issues before pushing

**Usage**:
```bash
# From project root
./.github/scripts/test-workflow-locally.sh
```

**What it validates**:
- ✅ JavaScript syntax validation (npm run validate)
- ✅ Test suite execution (npm test)
- ✅ Test coverage generation
- ✅ Documentation format checks
- ✅ Change detection (only runs relevant tests)

**Prerequisites**:
- Node.js v18+ and npm installed
- npm dependencies installed (`npm install`)
- git repository initialized
- Standard Unix tools: grep, find, wc

**Common Exit Scenarios**:
- **Exit 0**: All checks passed, safe to push
- **Exit 1**: Some checks failed, fix issues before pushing

See `docs/WORKFLOW_SETUP.md` for detailed usage guide.

### CDN Delivery Script
The repository includes `cdn-delivery.sh` for generating CDN URLs:

**Purpose**: Generate jsDelivr CDN URLs for the current version

**Usage**:
```bash
# From project root
./cdn-delivery.sh
# Output saved to cdn-urls.txt
```

**When to run**:
- After version bumps in package.json
- Before releases to generate distribution URLs
- After creating git tags
- Manually anytime you need CDN URLs

**Prerequisites**:
- Node.js v18+ (for package.json parsing)
- git (for commit hash extraction)
- curl (optional, for CDN availability testing)

**Integration Example**:
```bash
npm version minor
./cdn-delivery.sh
git add cdn-urls.txt
git commit -m "chore: update CDN URLs for v0.7.0"
git tag v0.7.0
git push origin v0.7.0
```

**Environment Variables** (optional):
```bash
# Override defaults if needed
export GITHUB_USER="your-username"
export GITHUB_REPO="your-repo"
./cdn-delivery.sh
```

See README.md CDN Delivery section for troubleshooting guide.

## Quick Reference Commands

### Daily Development
```bash
# Install dependencies (20 seconds, run once)
npm install

# Syntax check (always run first)
node -c src/guia.js && node -c src/guia_ibge.js

# Basic functionality test  
node src/guia.js

# Full test suite
npm run test:all

# Start web server for full testing
python3 -m http.server 9000

# Test web functionality
curl -s http://localhost:9000/test.html | head -5
```

### Performance Expectations
- **Syntax validation**: <1 second each file
- **Basic Node.js test**: <1 second  
- **Jest test suite**: ~2 seconds for 1224 tests
- **Jest with coverage**: ~2.2 seconds
- **Web server startup**: ~3 seconds, then runs indefinitely
- **npm install**: ~20 seconds (299 packages)

### Validation Checklist
- [ ] Node.js syntax validation passes (`node -c src/guia.js`)
- [ ] Basic Node.js execution shows version output
- [ ] All 55 automated tests pass (`npm test`)
- [ ] Web server starts successfully (`python3 -m http.server 9000`)
- [ ] Test page loads without JavaScript errors
- [ ] Geolocation button triggers proper API calls
- [ ] Address formatting works for Brazilian coordinates
- [ ] Console logging appears in both Node.js and browser

## Troubleshooting

### Common Issues
1. **Tests fail with DOM dependencies**: Ensure `global.document = undefined` in test files
2. **Web server port conflicts**: Change port with `python3 -m http.server 8000`
3. **API connectivity issues**: External APIs may be blocked; use local testing scenarios
4. **Geolocation not working**: Requires HTTPS or localhost, user permission required
5. **Module not found errors**: Ensure Node.js modules are exported properly

### Environment Requirements
- **Node.js**: v18+ (tested with v20.19.5)
- **Python**: 3.11+ for web server
- **npm**: 10+ for package management
- **Browser**: Modern browser with geolocation API support
- **Network**: Internet access for OpenStreetMap and IBGE APIs

### Debug Commands
```bash
# Check Node.js and npm versions
node --version && npm --version

# Validate all source files
node -c src/guia.js && node -c src/guia_ibge.js

# Clear npm cache if issues
npm cache clean --force

# Debug Jest tests
npx jest --verbose --detectOpenHandles

# Check web server logs
python3 -m http.server 9000 --bind 127.0.0.1

# Test API connectivity (if network allows)
curl -I "https://nominatim.openstreetmap.org/reverse"
```

### Known Limitations
- External API calls may fail in restricted network environments
- Geolocation requires HTTPS in production (localhost works for development)  
- Speech synthesis availability varies by browser
- Some tests generate verbose console output (this is expected behavior)

### Required User Scenarios
- **Geolocation Flow**: User grants location permission → coordinates display → address lookup occurs
- **Restaurant Search**: User clicks restaurant button → coordinates are passed to search function
- **Address Display**: Geographic data gets processed and formatted for Brazilian addresses
- **Logging**: All actions appear in the bottom textarea log area

## Repository Structure

### Key Files
- `guia.js` (2082 lines) - Main application with 25 classes for geolocation functionality
- `guia_ibge.js` (4 lines) - IBGE (Brazilian statistics) integration utilities
- `test.html` - Test page for manual validation (created during development)

### Important Classes and Components

#### Core Architecture (src/core/, src/services/, src/coordination/)
- `PositionManager` (src/core/PositionManager.js) - Singleton for current geolocation state
- `GeoPosition` (src/core/GeoPosition.js) - Immutable position value object
- `SingletonStatusManager` (src/status/SingletonStatusManager.js) - Status management across components
- `ReverseGeocoder` (src/services/ReverseGeocoder.js) - OpenStreetMap/Nominatim integration
- `GeolocationService` (src/services/GeolocationService.js) - Browser geolocation API wrapper
- `WebGeocodingManager` (src/coordination/WebGeocodingManager.js) - Main coordination class

#### Data Processing (src/data/)
- `BrazilianStandardAddress` (src/data/BrazilianStandardAddress.js) - Brazilian address standardization
- `AddressExtractor` (src/data/AddressExtractor.js) - Address data extraction
- `AddressCache` (src/data/AddressCache.js) - Address caching functionality
- `AddressDataExtractor` (src/data/AddressDataExtractor.js) - Complete address data extraction and caching
- `ReferencePlace` (src/data/ReferencePlace.js) - Reference location handling

#### UI and Display (src/html/)
- `HTMLPositionDisplayer` (src/html/HTMLPositionDisplayer.js) - Coordinate display and Google Maps integration
- `HTMLAddressDisplayer` (src/html/HTMLAddressDisplayer.js) - Address formatting and presentation
- `DisplayerFactory` (src/html/DisplayerFactory.js) - Factory for display components
- `HtmlText` (src/html/HtmlText.js) - Text display utilities

#### Speech Synthesis (src/speech/)
- `SpeechSynthesisManager` (src/speech/SpeechSynthesisManager.js) - Text-to-speech functionality
- `SpeechQueue` (src/speech/SpeechQueue.js) - Speech queue management
- `SpeechItem` (src/speech/SpeechItem.js) - Individual speech items

### API Integrations
- **OpenStreetMap Nominatim**: `https://nominatim.openstreetmap.org/reverse` for geocoding
- **IBGE API**: `https://servicodados.ibge.gov.br/api/v1/localidades/estados/` for Brazilian location data
- **Google Maps**: Links for map viewing and Street View integration

## Common Development Tasks

### Adding New Geolocation Features
- Always extend appropriate base classes (APIFetcher for API calls, etc.)
- Follow the MVC pattern: Extractor → Validator → Formatter → Displayer
- Update both Node.js compatibility and DOM functionality

### Debugging Geolocation Issues
- Check browser console for JavaScript errors
- Verify geolocation permissions in browser
- Test API endpoints manually: `curl "https://nominatim.openstreetmap.org/reverse?format=json&lat=-23.550520&lon=-46.633309"`
- Monitor network requests in browser developer tools

### Working with Brazilian Address Data
- Use `BrazilianStandardAddress` class for address standardization
- Reference `AddressDataExtractor` for data processing patterns
- Test with Brazilian coordinate examples: São Paulo (-23.550520, -46.633309)

## Limitations and Known Issues

### Browser Dependencies
- Full functionality requires modern browser with geolocation API support
- Some features (speech synthesis, DOM manipulation) only work in web environment
- Location permissions must be granted by user for geolocation features

### Known Limitations
- `findNearbyRestaurants()` function exists as placeholder with alert notification - requires external service integration
- `fetchCityStatistics()` function exists as placeholder with alert notification - requires backend implementation
- Error handling for API failures could be enhanced

### Development Environment
- No formal linting configuration - use `node -c` for syntax validation
- No automated test suite - relies on manual browser testing
- No build process - files are used directly

## File Contents Reference

### Repository Root Structure
```
guia_js/
├── guia.js (60KB, main application)
├── guia_ibge.js (146 bytes, IBGE utilities)  
├── test.html (test page for manual validation)
└── .github/
    └── copilot-instructions.md (this file)
```

### guia.js Overview
- **Lines 1-61**: Version info, utility functions (calculateDistance, log, warn)
- **Lines 62-666**: Core classes (CurrentPosition, APIFetcher, GeolocationService, WebGeocodingManager)  
- **Lines 667-999**: Chronometer and helper functions
- **Lines 1000-1530**: Display classes (HTMLPositionDisplayer, AddressDataExtractor, HTMLAddressDisplayer)
- **Lines 1531-2082**: Speech synthesis and text utilities

### Key Function Signatures
```javascript
// Utility functions
calculateDistance(lat1, lon1, lat2, lon2) // Returns distance in meters
log(message, ...params) // Console and DOM logging
warn(message, ...params) // Warning logging

// Main classes
new WebGeocodingManager(document, elementId) // Main controller
new ReverseGeocoder(latitude, longitude) // Geocoding API
new BrazilianStandardAddress() // Address standardization
```

## Quick Reference Commands

### Daily Development
```bash
# Syntax check (always run first)
node -c guia.js && node -c guia_ibge.js

# Basic functionality test  
node src/guia.js

# Start web server for full testing
python3 -m http.server 9000

# Test web functionality
curl -s http://localhost:9000/test.html | head -5
```

### Validation Checklist
- [ ] Node.js syntax validation passes
- [ ] Basic Node.js execution shows version output
- [ ] Web server starts successfully
- [ ] Test page loads without JavaScript errors
- [ ] Geolocation button triggers proper API calls
- [ ] Address formatting works for Brazilian coordinates
- [ ] Console logging appears in both Node.js and browser