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
5. Brazilian location data via IBGE API
6. Real-time updates as user moves (20m or 30s threshold)
```

### Key Components

1. **PositionManager** (src/core/PositionManager.js)
   - Singleton managing current geolocation state
   - Updates on distance (20m) or time (30s) thresholds

2. **ReverseGeocoder** (src/services/ReverseGeocoder.js)
   - OpenStreetMap Nominatim integration
   - Converts coordinates to addresses

3. **WebGeocodingManager** (src/coordination/WebGeocodingManager.js)
   - Main coordination class
   - Orchestrates services and displayers

4. **SpeechSynthesisManager** (src/speech/SpeechSynthesisManager.js)
   - Brazilian Portuguese speech synthesis
   - Queue-based processing

---

## Common Development Scenarios

### Adding a New Feature

1. **Identify the component layer**:
   - Data processing? → `src/data/`
   - API integration? → `src/services/`
   - UI display? → `src/html/`
   - Coordination? → `src/coordination/`

2. **Follow immutability principles** (see `.github/CONTRIBUTING.md`):
   ```javascript
   // ❌ Bad: Mutates array
   array.push(newItem);
   
   // ✅ Good: Creates new array
   const newArray = [...array, newItem];
   ```

3. **Write tests first**:
   ```bash
   # Create test file in __tests__/
   touch __tests__/your-feature.test.js
   
   # Run tests in watch mode
   npm run test:watch
   ```

4. **Validate changes**:
   ```bash
   npm run test:all
   ```

### Debugging Geolocation Issues

```javascript
// Enable detailed logging in browser console
// Check src/config/defaults.js for debug settings

// Test with known coordinates:
const testCoords = {
  latitude: -23.550520,   // São Paulo
  longitude: -46.633309
};

// Monitor network requests in DevTools:
// - OpenStreetMap Nominatim API calls
// - IBGE API calls
```

### Working with Brazilian Addresses

```javascript
import { BrazilianStandardAddress } from './src/data/BrazilianStandardAddress.js';

// Create standardized address
const address = new BrazilianStandardAddress();
address.municipio = "Recife";
address.uf = "PE";
address.regiaoMetropolitana = "Região Metropolitana do Recife";

// Get formatted output
console.log(address.municipioCompleto());
// Output: "Recife, PE"

console.log(address.regiaoMetropolitanaFormatada());
// Output: "Região Metropolitana do Recife"
```

---

## API Integration Examples

### Basic Geolocation Usage

```javascript
import { GeolocationService } from './src/services/GeolocationService.js';
import { PositionManager } from './src/core/PositionManager.js';

// Get current position (one-time)
const service = new GeolocationService();
const position = await service.getCurrentPosition();
console.log(`Lat: ${position.latitude}, Lon: ${position.longitude}`);

// Continuous tracking
const positionManager = PositionManager.getInstance();
positionManager.attach({
  update: (geoPosition) => {
    console.log('Position updated:', geoPosition.toJSON());
  }
});

service.startWatching();
```

### Address Lookup

```javascript
import { ReverseGeocoder } from './src/services/ReverseGeocoder.js';

// Convert coordinates to address
const geocoder = new ReverseGeocoder(-23.550520, -46.633309);
const addressData = await geocoder.fetchAddress();

console.log('City:', addressData.city);
console.log('State:', addressData.state);
console.log('Country:', addressData.country);
```

---

## Troubleshooting

### Common Issues

**Issue**: `npm install` fails
```bash
# Solution: Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Port 9000 already in use
```bash
# Solution: Change port in vite.config.js or kill process
lsof -ti:9000 | xargs kill -9
# Or use a different port
npm run dev -- --port 8080
```

**Issue**: Geolocation not working
- Ensure you're using HTTPS or localhost
- Check browser location permissions
- Verify browser console for errors

**Issue**: Tests fail with `Cannot find module`
```bash
# Solution: Reinstall dependencies
npm ci
```

---

## Next Steps

1. **Read User Guide**: See [USER_GUIDE.md](./user/USER_GUIDE.md) for end-user features
2. **Explore API**: See [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) for API docs
3. **Deep Dive**: See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for architecture
4. **Contribute**: See [.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md) for guidelines

---

## Getting Help

- **Issues**: https://github.com/mpbarbosa/guia_turistico/issues
- **Discussions**: Check GitHub Discussions
- **Documentation**: Browse `docs/` directory
- **Examples**: See `examples/` directory

---

**Last Updated**: 2026-02-12  
**Version**: 0.9.0-alpha
