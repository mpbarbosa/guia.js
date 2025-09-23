# Guia.js - Geolocation Web Application

Guia.js is a JavaScript-based geolocation web application (version 0.5.0-alpha) that provides geolocation services, address geocoding, and mapping integration for Brazilian addresses. The application includes DOM manipulation, OpenStreetMap/Nominatim API integration, and speech synthesis capabilities.

**CRITICAL: Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Run the Application
- **Node.js Testing**: `node guia.js` - takes <1 second. Validates basic functionality and logs version.
- **Syntax Validation**: `node -c guia.js && node -c guia_ibge.js` - takes <1 second each. ALWAYS run before commits.
- **Web Server**: `python3 -m http.server 9000` - starts immediately. NEVER CANCEL - keeps running until stopped.
- **Access Application**: Navigate to `http://localhost:9000/test.html` for full functionality testing.

### Build and Test Process
- **NEVER CANCEL any long-running server processes** - they run indefinitely by design
- **Syntax Check**: Always run `node -c guia.js` (timeout: 10 seconds) before making changes
- **Basic Test**: Run `node guia.js` (timeout: 10 seconds) to verify core functionality
- **Web Test**: Start web server with `python3 -m http.server 9000` (timeout: 30 seconds to start, runs indefinitely)
- **No formal test suite exists** - validation is manual through web browser testing

### Development Workflow
- Always validate JavaScript syntax with `node -c` before committing changes
- Test core functionality with `node guia.js` to see version output and basic initialization
- For DOM/web features, use the web server and test.html for manual validation
- **TIMING**: All commands complete in under 1 second except web server startup (2-3 seconds)

## Validation Scenarios

### Manual Testing Requirements
After making any changes, ALWAYS run through these validation scenarios:

1. **Basic Node.js Execution**:
   ```bash
   node guia.js
   # Should output: [timestamp] Guia.js version: 0.5.0-alpha
   ```

2. **Web Application Functionality**:
   - Start web server: `python3 -m http.server 9000`
   - Open `http://localhost:9000/test.html` 
   - Click "Obter Localização" button
   - Verify geolocation prompts appear (if supported)
   - Check console log output in browser developer tools
   - Test "Encontrar Restaurantes" and "Estatísticas da Cidade" buttons

3. **Code Integration Test**:
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
- `guia.js` (2082 lines) - Main application with 25 classes for geolocation functionality
- `guia_ibge.js` (4 lines) - IBGE (Brazilian statistics) integration utilities
- `test.html` - Test page for manual validation (created during development)

### Important Classes and Components

#### Core Architecture (lines 62-666)
- `CurrentPosition` - Singleton for current geolocation state
- `SingletonStatusManager` - Status management across components  
- `APIFetcher` - Base class for API communications
- `ReverseGeocoder` - OpenStreetMap/Nominatim integration
- `GeolocationService` - Browser geolocation API wrapper
- `WebGeocodingManager` - Main coordination class

#### Data Processing (lines 1117-1530)
- `BrazilianStandardAddress` - Brazilian address standardization
- `GeoDataParser/Extractor/Validator` - Geographic data processing pipeline
- `ReferencePlaceExtractor/Validator` - Reference location handling
- `AddressDataExtractor` - Address data extraction and caching

#### UI and Display (lines 1000-2082)
- `HTMLPositionDisplayer` - Coordinate display and Google Maps integration
- `HTMLAddressDisplayer` - Address formatting and presentation
- `SpeechSynthesisManager` - Text-to-speech functionality
- `HtmlText` - Text display utilities

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

### Missing Implementations
- `findNearbyRestaurants()` function is referenced but not implemented
- City statistics functionality is stubbed but not fully implemented
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
node guia.js

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