# Guia Turístico - User Guide

**Version**: 0.8.7-alpha  
**Last Updated**: 2026-02-11  
**Status**: Complete

---

## Table of Contents

- [What is Guia Turístico?](#what-is-guia-turístico)
- [Getting Started](#getting-started)
- [Browser Requirements](#browser-requirements)
- [Main Features](#main-features)
- [Using Location Tracking](#using-location-tracking)
- [Using the Coordinate Converter](#using-the-coordinate-converter)
- [Understanding the Display](#understanding-the-display)
- [Privacy and Permissions](#privacy-and-permissions)
- [Troubleshooting](#troubleshooting)
- [Accessibility Features](#accessibility-features)

---

## What is Guia Turístico?

**Guia Turístico** (Tourist Guide) is a web application that helps you track your location in real-time and displays detailed information about where you are. It's particularly useful for:

- 🚶 **Navigating Brazilian cities** - Get detailed location information as you walk
- 📍 **Understanding your location** - See your neighborhood, municipality, and state
- 🗺️ **Converting coordinates** - Turn GPS coordinates into human-readable addresses
- 📊 **Learning about places** - View population statistics and demographic data
- 🔊 **Hearing location updates** - Optional speech synthesis for location changes

### Primary Use Case

The **main feature** is **real-time location tracking** while you're moving around a city. The secondary utility is the coordinate converter for looking up specific locations.

---

## Getting Started

### 1. Open the Application

Navigate to the application URL in your web browser (typically `http://localhost:9000/src/index.html` for local development).

### 2. Grant Location Permission

When you first click "**Obter Localização**" (Get Location), your browser will ask for permission to access your location.

**What you'll see**:
- Chrome/Edge: "Allow [site] to access your location?"
- Firefox: "[site] would like to know your location"
- Safari: "[site] Would Like to Use Your Current Location"

**Click**: "Allow" or "Permitir" to continue.

### 3. Wait for Location Data

The application will:
1. Obtain your GPS coordinates (usually takes 1-3 seconds)
2. Look up your address using OpenStreetMap
3. Display comprehensive location information
4. Show nearby reference places (if available)
5. Display population statistics for your municipality

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

**Default Mode**: Single Position Capture
- Click "**Obter Localização**" to get your current location once
- Perfect for: checking where you are right now

**Continuous Mode**: Loop Tracking
- Check the "**Ativar modo contínuo**" (Enable continuous mode) checkbox
- Click "**Obter Localização**" to start continuous tracking
- Location updates automatically as you move (every 30 seconds or 20 meters)
- Perfect for: walking tours, navigation, exploring new areas

**Stop Tracking**:
- Click "**Parar Rastreamento**" (Stop Tracking) button
- Location updates will cease immediately

### 2. Coordinate Converter

Access via the footer link: "**Conversor de Coordenadas**"

**What it does**:
- Convert latitude/longitude to addresses
- Look up addresses for specific coordinates
- View location details without enabling continuous tracking

**How to use**:
1. Enter latitude (e.g., `-8.05389`)
2. Enter longitude (e.g., `-34.8813`)
3. Click "**Converter para Endereço**" (Convert to Address)
4. View detailed location information

### 3. Location Information Display

When you get your location, you'll see:

#### 📍 Coordinates Section
- **Latitude** and **Longitude** (decimal degrees)
- **Google Maps** link (opens in new tab)
- **Street View** link (if available)

#### 🏠 Address Section
- **Complete Address**: Full formatted address
- **Street**: Road or avenue name
- **Neighborhood** (Bairro): Local area name
- **Municipality**: City or town
- **State**: Brazilian state with abbreviation (e.g., "PE" for Pernambuco)
- **Postal Code** (CEP): Brazilian postal code
- **Country**: Always "Brasil" for Brazilian locations

#### 🌆 Highlight Cards (v0.7.1+)
Two prominent cards showing:
1. **Município Card**: Municipality name with state (e.g., "Recife, PE")
   - Metropolitan region (if applicable): "Região Metropolitana do Recife"
2. **Bairro Card**: Neighborhood name (changes as you move)

#### 🏢 Reference Place (if available)
- Nearby points of interest
- Examples: Shopping centers, metro stations, parks, cafes
- Type and category information
- Portuguese descriptions

#### 📊 Population Statistics (v0.7.2+)
- **Municipal population**: Latest IBGE estimates
- **Data source**: IBGE SIDRA database
- **Format**: Brazilian Portuguese number formatting (e.g., "1.653.461 habitantes")

### 4. Speech Synthesis (Optional)

If enabled, the application will announce:
- Address changes (when you move to a new street)
- Neighborhood changes (when you enter a new bairro)
- Municipality changes (when you cross city boundaries)

**Configuration**:
- Speaks in **Brazilian Portuguese** (pt-BR)
- Adjustable rate and pitch (in settings, if available)
- Queue-based processing (won't interrupt ongoing announcements)

---

## Using Location Tracking

### Step-by-Step: Single Position

1. **Open the application** in your web browser
2. **Click** the "**Obter Localização**" button
3. **Grant permission** when browser asks
4. **Wait** 2-5 seconds for data to load
5. **View** your location information on screen

### Step-by-Step: Continuous Tracking

1. **Check** the "**Ativar modo contínuo**" checkbox
2. **Click** "**Obter Localização**" to start tracking
3. **Move around** - location updates automatically
4. **Watch** the display update as you walk
5. **Click** "**Parar Rastreamento**" when done

### Update Triggers

Location updates occur when **either** condition is met:
- ⏱️ **Time**: 30 seconds since last update
- 📏 **Distance**: 20 meters from last position

This prevents excessive API calls while ensuring timely updates.

### Button Status Messages (v0.8.7-alpha)

The "**Obter Localização**" button shows contextual status:
- 🔵 **"Aguardando localização para habilitar"** - Waiting for location data (disabled)
- 🟢 **"Pronto para usar"** - Ready to use (enabled)

These messages improve user experience by explaining why buttons are disabled.

---

## Using the Coordinate Converter

### Accessing the Converter

1. Scroll to the bottom of the page
2. Click "**Conversor de Coordenadas**" link in footer
3. Converter page loads

### Converting Coordinates

1. **Enter Latitude**:
   - Example: `-8.05389` (Recife)
   - Format: Decimal degrees (negative for South)

2. **Enter Longitude**:
   - Example: `-34.8813` (Recife)
   - Format: Decimal degrees (negative for West)

3. **Click** "**Converter para Endereço**"

4. **View Results**:
   - Complete address
   - Formatted location components
   - Links to OpenStreetMap

### Supported Coordinate Formats

✅ **Decimal Degrees** (DD): `-23.550520, -46.633309`
- Most common format
- Example: São Paulo coordinates

**Note**: DMS (Degrees, Minutes, Seconds) format is not currently supported. Convert DMS to DD first using online tools.

---

## Understanding the Display

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

## Privacy and Permissions

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

### Data Usage

Your location data is used **only** to:
1. Display your current position on screen
2. Look up address information via OpenStreetMap API
3. Show nearby reference places
4. Display municipal statistics

**All processing happens in your browser**. Location data is not sent to any third-party servers except:
- **OpenStreetMap/Nominatim** (for address lookup)
- **IBGE** (for population statistics)

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

---

## Troubleshooting

### "Location permission denied"

**Problem**: Browser won't share your location

**Solutions**:
1. Grant permission when browser asks
2. Check browser settings: Enable location for the site
3. Check device settings: Enable location services system-wide
4. Reload the page and try again

### "Fetching address information timed out"

**Problem**: Network request to OpenStreetMap failed

**Solutions**:
1. Check internet connection
2. Verify OpenStreetMap is accessible (visit openstreetmap.org)
3. Wait a moment and click "**Obter Localização**" again
4. Try a different network (mobile data vs WiFi)

### "GPS signal not available"

**Problem**: Device can't determine location

**Solutions**:
1. **Move outdoors** - GPS works poorly indoors
2. **Wait** 30-60 seconds for GPS to acquire satellites
3. **Check device GPS** is enabled (Settings > Location)
4. Try **WiFi-based location** (turn on WiFi even if not connected)

### "No address data available"

**Problem**: Coordinates found but no address returned

**Solutions**:
1. **Remote areas** may lack address data
2. **Ocean/water locations** won't have addresses
3. **Wait and try again** - temporary API issue
4. Use **Coordinate Converter** to verify coordinates

### Location updates are slow

**Problem**: Continuous tracking isn't updating frequently

**Solutions**:
1. Check update thresholds (30s time or 20m distance required)
2. **Walk farther** to trigger distance threshold
3. **Wait longer** to trigger time threshold
4. **Restart tracking** - Stop and start again

### Speech synthesis not working

**Problem**: No voice announcements

**Solutions**:
1. **Check browser support** - Some browsers don't support speech synthesis
2. **Enable system audio** - Ensure device isn't muted
3. **Check language** - Browser needs Brazilian Portuguese voice
4. **Try different browser** - Chrome has best speech support

---

## Accessibility Features

### Screen Reader Support

The application is fully accessible with:
- ✅ **ARIA landmarks** for navigation
- ✅ **ARIA live regions** for dynamic updates
- ✅ **Semantic HTML** for proper structure
- ✅ **Button labels** with clear descriptions
- ✅ **Status announcements** for state changes (v0.8.7-alpha)

**Tested with**:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS, iOS)

### Keyboard Navigation

All features accessible via keyboard:
- **Tab** - Move between interactive elements
- **Enter/Space** - Activate buttons
- **Escape** - Close modals/dialogs
- **Arrow keys** - Navigate within components

### Visual Accessibility

- ✅ **High contrast** text and UI elements
- ✅ **Focus indicators** for keyboard navigation
- ✅ **Color-blind friendly** design
- ✅ **Scalable text** (respects browser zoom)
- ✅ **Responsive design** (works on all screen sizes)

### WCAG 2.1 Compliance

The application meets **WCAG 2.1 Level AA** standards:
- ✅ **Perceivable**: Content is presented clearly
- ✅ **Operable**: All functions work with keyboard
- ✅ **Understandable**: Clear language and behavior
- ✅ **Robust**: Works with assistive technologies

---

## Need More Help?

### Documentation

- 📘 **[Quick Start Guide](../QUICK_START.md)** - Get started in 5 minutes
- 🏗️ **[Architecture Overview](../architecture/SYSTEM_OVERVIEW.md)** - How the app works
- 🔧 **[Developer Guide](../developer/DEVELOPER_GUIDE.md)** - For contributors
- 📚 **[API Reference](../API_COMPLETE_REFERENCE.md)** - Technical documentation

### Feature Guides

- 🔘 **[Button Status Messages](../FEATURE_BUTTON_STATUS_MESSAGES.md)** - v0.8.7 feature
- 🌆 **[Metropolitan Region Display](../FEATURE_METROPOLITAN_REGION_DISPLAY.md)** - v0.8.7 feature
- 🗺️ **[State Abbreviation Display](../FEATURE_MUNICIPIO_STATE_DISPLAY.md)** - v0.8.7 feature

### External Resources

- 🗺️ **[OpenStreetMap](https://www.openstreetmap.org/)** - Map data provider
- 📊 **[IBGE](https://www.ibge.gov.br/)** - Brazilian statistics source
- 🌐 **[guia.js Library](https://github.com/mpbarbosa/guia_js)** - Core geolocation library

---

**Version**: 0.8.7-alpha  
**Last Updated**: 2026-02-11  
**Maintainer**: GitHub Copilot CLI  
**Status**: ✅ Complete
