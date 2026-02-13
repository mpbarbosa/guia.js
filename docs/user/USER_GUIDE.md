# User Guide - Guia Turístico

**Complete guide for using the Guia Turístico tourist guide application.**

**Version**: 0.9.0-alpha  
**Last Updated**: 2026-02-12  
**Status**: Complete

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Browser Requirements](#browser-requirements)
4. [Main Features](#main-features)
5. [Using Location Tracking](#using-location-tracking)
6. [Coordinate Converter](#coordinate-converter)
7. [Understanding the Display](#understanding-the-display)
8. [Accessibility Features](#accessibility-features)
9. [Troubleshooting](#troubleshooting)
10. [Privacy & Permissions](#privacy--permissions)
11. [Tips for Best Experience](#tips-for-best-experience)
12. [Frequently Asked Questions](#frequently-asked-questions)
13. [Getting Help](#getting-help)

---

## Introduction

Guia Turístico is a web-based tourist guide application that helps you explore Brazilian cities using real-time location tracking. The application shows your current location, nearby landmarks, and provides demographic information about your area.

### What Can You Do?

- 📍 **Track your location in real-time** as you walk or drive
- 🗺️ **View your address** automatically based on your coordinates
- 🏛️ **Discover nearby landmarks** and points of interest
- 📊 **See population statistics** for your current municipality
- 🔄 **Convert coordinates** to addresses manually
- 🔊 **Hear location updates** via speech synthesis (optional)

### Primary Use Case

The **main feature** is **real-time location tracking** while you're moving around a city. The secondary utility is the coordinate converter for looking up specific locations.

### System Requirements

- **Modern web browser**: Chrome 94+, Firefox 93+, Safari 15+
- **Location Services**: GPS or network-based positioning
- **Internet Connection**: Required for address lookup and maps
- **Device**: Desktop, laptop, tablet, or smartphone

---

## Getting Started

### Step 1: Access the Application

Open your web browser and navigate to:
```
https://[your-deployment-url]/
```

Or for local development:
```
http://localhost:9000/
```

### Step 2: Grant Location Permissions

When you first click **"Obter Localização"**, your browser will ask for permission to access your location.

**Important**: You must allow location access for the application to work.

#### Browser-Specific Instructions

**Chrome/Edge**:
1. Click the location icon in the address bar
2. Select "Always allow [site] to access your location"
3. Click "Done"

**Firefox**:
1. Click the location icon in the address bar
2. Select "Allow"
3. Optionally check "Remember this decision"

**Safari**:
1. Safari → Preferences → Websites → Location Services
2. Find the website in the list
3. Select "Allow"

### Step 3: Start Tracking

Click the **"Obter Localização"** button to begin tracking your position.

---

## Browser Requirements

### Supported Browsers

✅ **Recommended** (Full feature support):
- **Chrome** 90+ (Windows, macOS, Linux, Android)
- **Edge** 90+ (Windows, macOS)
- **Firefox** 88+ (Windows, macOS, Linux)
- **Safari** 14+ (macOS, iOS)

⚠️ **Limited Support**:
- Older browser versions may lack speech synthesis or geolocation
- Private/Incognito mode may have restricted permissions

### Required Features

Your browser must support:
- ✅ **JavaScript** (required - enable in browser settings)
- ✅ **Geolocation API** (required for location tracking)
- ✅ **ES6 Modules** (required for app functionality)
- 🔊 **Speech Synthesis** (optional - for voice announcements)
- 🌐 **Internet Connection** (required for map data and address lookup)

### Mobile Browsers

The application is **mobile-first** and works best on:
- Android Chrome 90+
- iOS Safari 14+
- Android Firefox 88+

**Note**: GPS accuracy is typically better on mobile devices than desktop computers.

---

## Main Features

### 1. Real-Time Location Tracking

**Primary feature of Guia Turístico**

The application continuously monitors your location as you move around the city.

#### How It Works

1. Click **"Obter Localização"** to start
2. Your coordinates appear immediately
3. Address lookup happens automatically
4. Updates occur when you move:
   - **20 meters** distance change, OR
   - **30 seconds** time elapsed

#### Visual Feedback

```
┌─────────────────────────────────────┐
│ Coordinates                          │
│ Latitude: -23.550520                │
│ Longitude: -46.633309               │
│ Accuracy: ±10 meters                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Address                              │
│ Avenida Paulista, 1578              │
│ Bela Vista                          │
│ São Paulo, SP                       │
│ Brazil                              │
└─────────────────────────────────────┘
```

#### Continuous vs. Single Position

**Single Position Mode** (default):
- Click once to get current location
- No automatic updates
- Lower battery usage

**Continuous Tracking Mode**:
- Toggle "Rastreamento Contínuo" button
- Automatic updates as you move
- Higher battery usage

### 2. Municipality & Neighborhood Display

**Enhanced geographic context with highlight cards**

```
┌─────────────────────────────────────┐
│ Município                            │
│ Região Metropolitana do Recife      │  ← Metropolitan region
│ Recife, PE                          │  ← City, State
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Bairro                               │
│ Boa Viagem                          │  ← Neighborhood
└─────────────────────────────────────┘
```

**Features**:
- Automatic municipality detection
- State abbreviation (all 26 Brazilian states + DF)
- Metropolitan region context (9 major regions)
- Neighborhood tracking as you move

### 3. Population Statistics

**IBGE SIDRA integration displays demographic data**

```
┌─────────────────────────────────────┐
│ População Estimada                   │
│ 1.653.461 habitantes (2021)         │
│ Fonte: IBGE SIDRA                   │
└─────────────────────────────────────┘
```

**Data Source**: Brazilian Institute of Geography and Statistics (IBGE)

### 4. Reference Places

**Nearby landmarks and points of interest**

The application automatically detects nearby:
- 🏛️ **Cultural sites**: Museums, theaters
- 🏪 **Shops**: Stores, shopping centers
- 🍽️ **Restaurants**: Cafés, restaurants
- 🚉 **Transit**: Bus stops, train stations
- 🏢 **Buildings**: Notable buildings

```
┌─────────────────────────────────────┐
│ Ponto de Referência                  │
│ 📍 Museu de Arte de São Paulo       │
│ Cultural institution                 │
└─────────────────────────────────────┘
```

### 5. Google Maps Integration

**Quick access to map views**

- **🗺️ View on Map**: Opens location in Google Maps
- **👁️ Street View**: Opens Google Street View at your location

---

## Using Location Tracking

### Starting Location Tracking

1. **Click "Obter Localização"** button
2. **Grant permission** when browser prompts
3. **Wait for coordinates** to appear (~1-3 seconds)
4. **View address** as it loads (~2-5 seconds)

### Understanding Updates

The application updates your location when:

| Condition | Threshold | Example |
|-----------|-----------|---------|
| Distance change | 20 meters | Walking/driving |
| Time elapsed | 30 seconds | Standing still |

**Battery Optimization**: Updates are throttled to preserve battery life.

### Stopping Tracking

- **Single position**: Automatic stop after one reading
- **Continuous mode**: Click "Parar Rastreamento" to stop

### Button Status Messages

The **"Obter Localização"** button shows contextual status:

**Before location obtained**:
```
🔵 "Aguardando localização para habilitar"
(Waiting for location to enable)
```

**After location obtained**:
```
🟢 "Pronto para usar"
(Ready to use)
```

**During processing**:
```
🟠 "Processando..."
(Processing...)
```

**Error state**:
```
🔴 "Erro ao obter localização"
(Error obtaining location)
```

---

## Coordinate Converter

**Secondary utility: Convert coordinates to addresses manually**

### Accessing the Converter

1. Scroll to the bottom of the page
2. Click **"Conversor de Coordenadas"** link in the footer
3. Or navigate to: `#/converter`

### Using the Converter

1. **Enter Latitude**: Example: `-23.550520`
2. **Enter Longitude**: Example: `-46.633309`
3. **Click "Converter"**
4. **View Results**: Address displays below

### Supported Formats

```javascript
// Decimal degrees (recommended)
Latitude: -23.550520
Longitude: -46.633309

// Also supported (auto-converted):
Latitude: 23° 33' 01.87" S
Longitude: 46° 38' 0.00" W
```

**Note**: DMS (Degrees, Minutes, Seconds) format may require conversion to decimal degrees first using online tools for best results.

---

## Understanding the Display

### Status Messages

The application provides contextual status messages to guide you.

#### Button Status Messages

See [Using Location Tracking](#button-status-messages) section for detailed button status information.

### Information Hierarchy

The display is organized by importance:

1. **Coordinates** (top): Most accurate data
2. **Address**: Human-readable location
3. **Municipality Card**: City and state context
4. **Neighborhood Card**: Local area name
5. **Reference Place**: Nearby landmark
6. **Population Stats**: Demographic information

### Color Coding

The application uses colors for visual clarity:
- 🟢 **Green**: Success states, active tracking
- 🔵 **Blue**: Information, default states
- 🟠 **Orange**: Warnings, attention needed
- 🔴 **Red**: Errors, stopped states

### Icons and Symbols

- **📍** - Location/coordinates
- **🏠** - Address information
- **🌆** - Municipality/city
- **🏘️** - Neighborhood (bairro)
- **🏢** - Reference places
- **📊** - Statistics
- **🔊** - Speech synthesis
- **↗** - External link (opens in new tab)

### Progress Indicators

- **Spinning loader**: Data is being fetched
- **Empty state messages**: Waiting for location permission
- **Status text**: Current operation status

---

## Accessibility Features

Guia Turístico is designed to be accessible to all users.

### WCAG 2.1 AA Compliance

- ✅ **Keyboard Navigation**: All features accessible via keyboard
- ✅ **Screen Reader Support**: ARIA labels and live regions
- ✅ **Color Contrast**: Minimum 4.5:1 contrast ratio
- ✅ **Focus Indicators**: Clear visual focus states
- ✅ **Text Alternatives**: Alt text for icons and images

The application meets **WCAG 2.1 Level AA** standards:
- ✅ **Perceivable**: Content is presented clearly
- ✅ **Operable**: All functions work with keyboard
- ✅ **Understandable**: Clear language and behavior
- ✅ **Robust**: Works with assistive technologies

### Screen Reader Support

The application is fully accessible with:
- ✅ **ARIA landmarks** for navigation
- ✅ **ARIA live regions** for dynamic updates
- ✅ **Semantic HTML** for proper structure
- ✅ **Button labels** with clear descriptions
- ✅ **Status announcements** for state changes

**Tested with**:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS, iOS)

### Speech Synthesis

**Optional voice announcements for location updates**

**Enable Speech**:
1. Look for speaker icon (🔊) near buttons
2. Click to enable/disable voice announcements
3. Voice announces: Address, municipality, neighborhood

**Voice Settings**:
- Automatically selects Brazilian Portuguese voice
- Adjustable rate and pitch (developer settings)
- Queue-based processing prevents overlapping speech

**Configuration**:
- Speaks in **Brazilian Portuguese** (pt-BR)
- Queue-based processing (won't interrupt ongoing announcements)

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate between buttons |
| `Enter` / `Space` | Activate button |
| `Escape` | Close modals/dialogs |

### Visual Accessibility

- ✅ **High contrast** text and UI elements
- ✅ **Focus indicators** for keyboard navigation
- ✅ **Color-blind friendly** design
- ✅ **Scalable text** (respects browser zoom)
- ✅ **Responsive design** (works on all screen sizes)

---

## Troubleshooting

### Location Not Working

**Problem**: "Unable to get location" error

**Solutions**:
1. **Check browser permissions**:
   - Click the location icon in address bar
   - Ensure location access is allowed

2. **Enable device location services**:
   - **Windows**: Settings → Privacy → Location
   - **macOS**: System Preferences → Security & Privacy → Location Services
   - **Android**: Settings → Location → Turn on
   - **iOS**: Settings → Privacy → Location Services

3. **Use HTTPS or localhost**:
   - Modern browsers require secure connections for geolocation
   - HTTP sites (except localhost) won't have access

4. **Try a different browser**:
   - Test in Chrome, Firefox, or Safari

### Address Not Loading

**Problem**: Coordinates show, but address stays blank

**Solutions**:
1. **Check internet connection**:
   - Address lookup requires network access
   - Test: Open google.com in another tab

2. **Wait longer**:
   - Address lookup can take 5-10 seconds
   - Watch for loading indicator

3. **Check for API rate limits**:
   - OpenStreetMap Nominatim has usage limits
   - Wait a few minutes and try again

4. **Verify coordinates are valid**:
   - Latitude: -90 to 90
   - Longitude: -180 to 180

### Map Links Not Opening

**Problem**: Google Maps button does nothing

**Solutions**:
1. **Allow pop-ups**: Browser may be blocking pop-ups
2. **Check coordinates**: Invalid coordinates won't generate links
3. **Try manual link**: Right-click → "Open in new tab"

### Slow Performance

**Problem**: Application feels sluggish

**Solutions**:
1. **Close other tabs**: Free up browser memory
2. **Disable continuous tracking**: Use single position mode
3. **Clear browser cache**: Settings → Clear browsing data
4. **Update browser**: Ensure you're on the latest version

### GPS Signal Not Available

**Problem**: Device can't determine location

**Solutions**:
1. **Move outdoors** - GPS works poorly indoors
2. **Wait** 30-60 seconds for GPS to acquire satellites
3. **Check device GPS** is enabled (Settings > Location)
4. **Try WiFi-based location** (turn on WiFi even if not connected)

### Speech Synthesis Not Working

**Problem**: No voice announcements

**Solutions**:
1. **Check browser support** - Some browsers don't support speech synthesis
2. **Enable system audio** - Ensure device isn't muted
3. **Check language** - Browser needs Brazilian Portuguese voice
4. **Try different browser** - Chrome has best speech support

---

## Privacy & Permissions

### What Data Is Collected?

**Guia Turístico respects your privacy:**

- ✅ **Location data is NOT stored** on servers
- ✅ **All processing happens in your browser**
- ✅ **No tracking cookies**
- ✅ **No user accounts required**

### What Data We Access

The application accesses:
- ✅ **Your GPS coordinates** (latitude, longitude)
- ✅ **Your approximate address** (via reverse geocoding)
- ✅ **Public map data** (from OpenStreetMap)
- ✅ **Public statistics** (from IBGE)

### What We DON'T Store

- ❌ No personal information is stored on servers
- ❌ No location history is maintained
- ❌ No user accounts or profiles
- ❌ No tracking cookies for advertising

### What Data Is Shared?

**With OpenStreetMap Nominatim**:
- Your coordinates (latitude, longitude)
- Used solely for address lookup
- Subject to OpenStreetMap's privacy policy

**With IBGE**:
- Municipality code (not your exact location)
- Used for population statistics
- Public data from Brazilian government

**With Google Maps** (optional):
- Coordinates when you click "View on Map"
- Only when you explicitly click map links
- Subject to Google's privacy policy

### Data Usage

Your location data is used **only** to:
1. Display your current position on screen
2. Look up address information via OpenStreetMap API
3. Show nearby reference places
4. Display municipal statistics

**All processing happens in your browser**. Location data is not sent to any third-party servers except those listed above.

### Revoking Permissions

To revoke location permission:

**Chrome/Edge**:
1. Click the lock icon in address bar
2. Select "Location"
3. Choose "Block"

**Firefox**:
1. Click the lock icon
2. Select "Clear permissions"
3. Refresh the page

**Safari**:
1. Safari menu > Preferences
2. Websites tab > Location
3. Change setting for the site

**To stop location tracking**:
1. Click browser's location icon in address bar
2. Select "Block" or "Remove permission"
3. Refresh the page

**To clear all data**:
1. Browser Settings → Privacy → Clear browsing data
2. Select "Cookies and site data"
3. Click "Clear data"

---

## Tips for Best Experience

### For Tourists

1. **Enable continuous tracking** when exploring
2. **Use Street View** to preview destinations
3. **Check population stats** to understand city size
4. **Note reference places** for navigation

### For Hikers/Walkers

1. **Use single position mode** to save battery
2. **Take periodic readings** at landmarks
3. **Screenshot coordinates** for record keeping

### For Drivers

1. **Use hands-free mode** with speech synthesis
2. **Enable voice announcements** for safe navigation
3. **Set phone in car holder** for easy viewing

### Battery Saving

1. **Use single position mode** when possible
2. **Disable speech synthesis** if not needed
3. **Close app when not in use**
4. **Reduce screen brightness**

---

## Frequently Asked Questions

### Q: Does this work offline?

**A**: Partially. Coordinates work offline if your device has GPS. Address lookup requires internet connection.

### Q: Can I use this outside Brazil?

**A**: Yes, but Brazilian-specific features (IBGE, municipalities) only work in Brazil.

### Q: Is this free?

**A**: Yes, Guia Turístico is free and open-source.

### Q: How accurate is the location?

**A**: Accuracy depends on your device:
- **GPS (outdoor)**: ±5-10 meters
- **Wi-Fi**: ±20-50 meters
- **Cell towers**: ±100-1000 meters

### Q: Why does it ask for location permission?

**A**: Browsers require explicit user permission to access location data for privacy reasons.

### Q: Can I embed this in my website?

**A**: See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for embedding instructions.

---

## Getting Help

**Found a bug?**
- Report at: https://github.com/mpbarbosa/guia_turistico/issues

**Have a question?**
- Check documentation: `docs/` directory
- Ask in GitHub Discussions

**Want to contribute?**
- See: [.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md)

### Documentation

- 📘 **[Quick Start Guide](../QUICK_START.md)** - Get started in 5 minutes
- 🏗️ **[Architecture Overview](../architecture/SYSTEM_OVERVIEW.md)** - How the app works
- 🔧 **[Developer Guide](../developer/DEVELOPER_GUIDE.md)** - For contributors
- 📚 **[API Reference](../API_COMPLETE_REFERENCE.md)** - Technical documentation

### Feature Guides

- 🔘 **[Button Status Messages](../FEATURE_BUTTON_STATUS_MESSAGES.md)** - Button state feature
- 🌆 **[Metropolitan Region Display](../FEATURE_METROPOLITAN_REGION_DISPLAY.md)** - Region feature
- 🗺️ **[State Abbreviation Display](../FEATURE_MUNICIPIO_STATE_DISPLAY.md)** - State display feature

### External Resources

- 🗺️ **[OpenStreetMap](https://www.openstreetmap.org/)** - Map data provider
- 📊 **[IBGE](https://www.ibge.gov.br/)** - Brazilian statistics source
- 🌐 **[guia.js Library](https://github.com/mpbarbosa/guia_js)** - Core geolocation library

---

**Version**: 0.9.0-alpha  
**Last Updated**: 2026-02-12  
**Status**: Complete
