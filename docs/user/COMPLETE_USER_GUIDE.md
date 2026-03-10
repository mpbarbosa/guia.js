# Complete User Guide - Guia Turístico

---

Last Updated: 2026-03-02
Status: Active
Category: User Guide
Version: 0.12.2-alpha
---

**Navigation**: [🏠 Home](../../README.md) > [📚 Documentation](../INDEX.md) > 👤 Complete User Guide

---

## Overview

Welcome to Guia Turístico - your personal tourist guide application! This comprehensive guide will help you understand and use all features of the application, from basic location tracking to advanced features like speech synthesis and statistical data.

**What is Guia Turístico?**

Guia Turístico is a web application that tracks your location in real-time and provides you with:

- 📍 **Current coordinates** with precision information
- 🗺️ **Address information** in Brazilian Portuguese
- 🏘️ **Neighborhood and city** context
- 📊 **Population statistics** from IBGE
- 🔊 **Voice announcements** of location changes
- 🧭 **Reference places** near your location

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Features](#basic-features)
3. [Advanced Features](#advanced-features)
4. [Mobile Usage](#mobile-usage)
5. [Accessibility Features](#accessibility-features)
6. [Privacy & Permissions](#privacy--permissions)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## Getting Started

### First Time Setup

#### 1. Open the Application

Navigate to the application in your web browser:

- **Local Development**: `http://localhost:9000/src/index.html`
- **CDN Version**: Use the jsDelivr CDN links (see README.md)
- **Integrated Website**: Access through mpbarbosa.com

#### 2. Grant Location Permissions

When you first visit the application, your browser will ask for permission to access your location:

```
┌─────────────────────────────────────────┐
│ guia_turistico wants to:               │
│ Know your location                     │
│                                         │
│ [Block]  [Allow]                       │
└─────────────────────────────────────────┘
```

**Click "Allow"** to enable location tracking.

> **Note**: Without location permission, the application cannot function. If you accidentally clicked "Block", see [Resetting Permissions](#resetting-permissions).

#### 3. Verify Initial Display

After granting permission, you should see:

- ✅ Your current coordinates
- ✅ Position accuracy (e.g., "12 meters")
- ✅ Address information
- ✅ City and neighborhood cards
- ✅ "Tracking Active" indicator

---

## Basic Features

### 🎯 Single Position Capture

Get your current location with one click:

**How to Use**:

1. Look for the **"Obter Localização"** (Get Location) button
2. Click the button once
3. Wait for the location update (usually 1-3 seconds)
4. See your coordinates and address update

**What You'll See**:

```
┌──────────────────────────────┐
│ 📍 Localização Atual         │
├──────────────────────────────┤
│ Latitude: -23.550520         │
│ Longitude: -46.633309        │
│ Precisão: 12 metros          │
│ Qualidade: excellent         │
└──────────────────────────────┘
```

**Status Messages**:

- Before use: "Aguardando localização para habilitar" (Waiting for location)
- After success: "Pronto para usar" (Ready to use)

---

### 🔄 Continuous Tracking

Track your location as you move:

**How to Enable**:

1. Click **"Iniciar Rastreamento"** (Start Tracking)
2. The button changes to **"Parar Rastreamento"** (Stop Tracking)
3. A green indicator shows "Tracking Active"
4. Your location updates automatically as you move

**Update Conditions**:
Your location updates when **either** condition is met:

- 📏 **Movement**: You moved at least **20 meters**
- ⏱️ **Time**: At least **30 seconds** passed since last update

**Status Indicators**:

- 🟢 **Green dot**: Tracking active
- 🔴 **Red dot**: Tracking stopped
- ⚪ **Gray dot**: No location available

**How to Stop**:

1. Click **"Parar Rastreamento"** (Stop Tracking)
2. Updates stop immediately
3. Last known location remains displayed

---

### 🏠 Address Display

See your current address in Brazilian format:

**What You'll See**:

```
┌─────────────────────────────────────┐
│ 📮 Endereço                          │
├─────────────────────────────────────┤
│ Logradouro: Avenida Paulista        │
│ Bairro: Bela Vista                  │
│ Município: São Paulo, SP            │
│ CEP: 01310-100                      │
└─────────────────────────────────────┘
```

**Address Components**:

- **Logradouro**: Street name (e.g., "Avenida Paulista")
- **Número**: Street number (if available)
- **Bairro**: Neighborhood (e.g., "Bela Vista")
- **Município**: City with state (e.g., "São Paulo, SP")
- **Estado**: Full state name (e.g., "São Paulo")
- **CEP**: Postal code (if available)
- **País**: Country (always "Brasil")

---

### 🏘️ Highlight Cards (v0.9.0+)

See important location context at a glance:

#### Municipality Card

```
┌─────────────────────────────────────┐
│ 🏛️ Município                         │
├─────────────────────────────────────┤
│ São Paulo, SP                       │
│                                     │
│ Região Metropolitana de São Paulo  │
└─────────────────────────────────────┘
```

**Shows**:

- Municipality name with state abbreviation
- Metropolitan region (if applicable)

**9 Metropolitan Regions Supported**:

- São Paulo, Rio de Janeiro, Belo Horizonte
- Recife, Salvador, Fortaleza
- Curitiba, Porto Alegre, Brasília

#### Neighborhood Card

```
┌─────────────────────────────────────┐
│ 🏘️ Bairro                            │
├─────────────────────────────────────┤
│ Bela Vista                          │
└─────────────────────────────────────┘
```

**Shows**:

- Current neighborhood name
- Updates automatically as you move

---

### 📊 Population Statistics (v0.9.0+)

See IBGE population data for your current city:

```
┌─────────────────────────────────────┐
│ 📊 Dados IBGE - São Paulo, SP       │
├─────────────────────────────────────┤
│ População estimada (2023)           │
│ 11.451.999 habitantes               │
└─────────────────────────────────────┘
```

**Data Source**:

- IBGE SIDRA API (official Brazilian statistics)
- Offline fallback data included
- Updates automatically when city changes

**Number Formatting**:

- Brazilian Portuguese format
- Thousands separated with dots (e.g., "11.451.999")
- Localized text

---

### 🧭 Reference Places

Discover notable places near your location:

```
┌─────────────────────────────────────┐
│ 📍 Ponto de Referência              │
├─────────────────────────────────────┤
│ Categoria: Shopping                 │
│ Nome: Pátio Paulista                │
└─────────────────────────────────────┘
```

**Supported Categories**:

- 🏪 **Shop**: Stores, markets, shops
- 🏢 **Amenity**: Banks, restaurants, services
- 🏛️ **Place**: Landmarks, public spaces
- 🚉 **Railway**: Train/metro stations
- 🏗️ **Building**: Notable buildings

---

## Advanced Features

### 🔊 Voice Announcements

Hear location changes announced in Portuguese:

**Automatic Announcements**:
The app speaks when you move to a new:

1. **Municipality** (highest priority)
2. **Neighborhood**
3. **Street**

**Priority System**:

- **Priority 3** (Municipality): "Você está em São Paulo, São Paulo"
- **Priority 2** (Bairro): "Você está no bairro Bela Vista"
- **Priority 1** (Logradouro): "Você está na Avenida Paulista"
- **Priority 0** (Periodic): Regular updates

**Voice Selection**:

- Automatically selects Brazilian Portuguese voice
- Falls back to Portuguese if pt-BR unavailable
- Prefers local (device) voices over network voices

**Adjusting Speech**:

```javascript
// Advanced users can adjust speech in console:
speechManager.setRate(1.2);  // Speak 20% faster
speechManager.setPitch(0.9); // Lower pitch slightly
```

---

### 🔗 Maps Integration

Quick access to external mapping services:

**Google Maps Link**:

- Click coordinates to open in Google Maps
- Shows exact location on map
- Supports directions and Street View

**Example Link**:

```
https://www.google.com/maps?q=-23.550520,-46.633309
```

---

### ⏱️ Elapsed Time Tracking

See how long you've been at your current location:

```
┌─────────────────────────────────────┐
│ ⏱️ Tempo no Local                    │
├─────────────────────────────────────┤
│ 00:05:32                            │
│ (5 minutos e 32 segundos)          │
└─────────────────────────────────────┘
```

**Format**: HH:MM:SS
**Updates**: Every second while tracking active

---

### 🎨 Coordinate Converter

Convert between coordinate formats:

**Access**: Click **"Conversor de Coordenadas"** link in footer

**Supported Formats**:

- **Decimal Degrees** (DD): -23.550520, -46.633309
- **Degrees, Minutes, Seconds** (DMS): 23°33'01.9"S 46°38'00.0"W
- **Degrees, Decimal Minutes** (DDM): 23°33.032'S 46°38.000'W

**How to Use**:

1. Enter coordinates in any format
2. Click **"Converter"** (Convert)
3. See results in all formats
4. Copy result or get address

---

## Mobile Usage

### 📱 Mobile-Optimized Features

**Responsive Design**:

- Touch-friendly buttons (minimum 44×44 pixels)
- Simplified layout for small screens
- Progressive disclosure of information
- Optimized font sizes

**Mobile-Specific Behaviors**:

- ✅ Stricter GPS accuracy filtering on mobile
- ✅ Rejects "medium" accuracy or worse
- ✅ Preserves battery with smart updates
- ✅ Prevents excessive API calls

**Touch Gestures**:

- **Tap**: Activate buttons
- **Scroll**: View full information
- **Pinch**: Zoom (browser default)

---

### 🔋 Battery Optimization

The app minimizes battery drain:

**Smart Update Strategy**:

- Only updates on significant movement (≥20m)
- Or after minimum time (≥30s)
- Stops unnecessary GPS polling
- Caches address data

**Tips for Battery Life**:

1. Stop tracking when stationary
2. Don't leave app running in background
3. Use single position capture instead of continuous tracking
4. Close app when not needed

---

## Accessibility Features

### ♿ WCAG 2.1 AA Compliant

**Screen Reader Support**:

- ✅ ARIA labels on all interactive elements
- ✅ Live regions for dynamic updates
- ✅ Semantic HTML structure
- ✅ Descriptive button text

**Keyboard Navigation**:

- ✅ Full keyboard support
- ✅ Logical tab order
- ✅ Skip links for main content
- ✅ Focus indicators visible

**Visual Accessibility**:

- ✅ High contrast colors (4.5:1 minimum)
- ✅ Large touch targets (44×44 pixels)
- ✅ Clear font sizes (16px minimum)
- ✅ Color not sole information carrier

**Motion Sensitivity**:

- ✅ Respects `prefers-reduced-motion`
- ✅ No autoplay animations
- ✅ Optional animation disabling

---

### 🔊 Screen Reader Examples

**VoiceOver (iOS/Mac)**:

```
"Get Location button. Awaiting location to enable."
[After click]
"Location updated. Latitude: -23.550520"
```

**NVDA/JAWS (Windows)**:

```
"Start Tracking button"
[After click]
"Tracking Active. Status indicator."
```

---

## Privacy & Permissions

### 🔒 Your Privacy

**What We Collect**:

- ✅ Your geographic coordinates (temporarily)
- ✅ Address data from OpenStreetMap
- ✅ No personal identification
- ✅ No tracking across sites

**What We Don't Collect**:

- ❌ No personal data storage
- ❌ No server-side logging
- ❌ No third-party analytics
- ❌ No cookies or local storage

**Data Usage**:

- Location data stays in your browser
- Only used to fetch address information
- Cleared when you close the tab
- Not shared with third parties

---

### 🔐 Resetting Permissions

If you accidentally denied location access:

#### Chrome/Edge

1. Click the **🔒 lock icon** in address bar
2. Find "Location" permission
3. Change to "Allow"
4. Refresh the page

#### Firefox

1. Click the **ⓘ info icon** in address bar
2. Click "Permissions"
3. Find "Access Your Location"
4. Change to "Allow"
5. Refresh the page

#### Safari

1. Safari menu → **Preferences**
2. Go to **Websites** tab
3. Select **Location**
4. Find the website
5. Change to "Allow"
6. Refresh the page

---

## Troubleshooting

### Common Issues

#### ❌ "Location Permission Denied"

**Problem**: You clicked "Block" on the permission request

**Solution**:

1. Follow [Resetting Permissions](#resetting-permissions) above
2. Refresh the page
3. Grant permission when asked

---

#### ❌ "Location Not Available"

**Possible Causes**:

- GPS disabled on device
- Weak GPS signal indoors
- Browser doesn't support geolocation
- VPN/proxy interference

**Solutions**:

1. **Enable Location Services**:
   - Android: Settings → Location → On
   - iOS: Settings → Privacy → Location Services → On
2. **Move to better location**:
   - Go near a window
   - Step outside briefly
   - Move away from thick walls
3. **Check browser support**:
   - Use modern browser (Chrome, Firefox, Safari, Edge)
   - Update to latest version
4. **Disable VPN temporarily**:
   - Some VPNs block geolocation
   - Try without VPN

---

#### ❌ "Low Accuracy" Warning

**Problem**: GPS accuracy is poor (>100 meters)

**Why It Happens**:

- Indoors or surrounded by buildings
- Weak GPS signal
- Device GPS limitations

**Solutions**:

1. Wait for accuracy to improve
2. Move outdoors or near window
3. App automatically rejects very poor accuracy
4. Try "Get Location" button again

---

#### ❌ Address Not Showing

**Possible Causes**:

- No internet connection
- OpenStreetMap API unavailable
- Location too remote (no address data)

**Solutions**:

1. **Check internet connection**:
   - Verify you're online
   - Try refreshing the page
2. **Wait and retry**:
   - API may be temporarily slow
   - Click "Get Location" again after 10 seconds
3. **Check coordinates**:
   - Coordinates should still display
   - Address may be unavailable for remote areas

---

#### 🔇 No Voice Announcements

**Possible Causes**:

- Device volume muted
- Browser speech synthesis not available
- No Portuguese voice installed

**Solutions**:

1. **Check volume**:
   - Unmute device
   - Increase volume
2. **Check browser support**:
   - Chrome/Edge: Full support
   - Firefox: Full support
   - Safari: Partial support
3. **Install Portuguese voice** (Windows):
   - Settings → Time & Language → Speech
   - Add Portuguese voice pack
4. **Test in console**:

   ```javascript
   speechSynthesis.speak(new SpeechSynthesisUtterance('teste'));
   ```

---

### Performance Issues

#### Slow Updates

**Symptoms**:

- Location updates taking >5 seconds
- Address loading slowly
- UI feels unresponsive

**Solutions**:

1. **Check internet speed**:
   - Slow connection affects address lookups
   - Consider stopping tracking if connection is poor
2. **Reduce background apps**:
   - Close unnecessary browser tabs
   - Free up device memory
3. **Restart browser**:
   - Clear cache if problems persist

---

#### Battery Draining Fast

**Solutions**:

1. **Stop continuous tracking**:
   - Use single position capture instead
   - Only track when actively moving
2. **Disable speech synthesis**:
   - Mute device if voice not needed
3. **Close when not in use**:
   - Don't leave app running in background

---

## FAQ

### General Questions

**Q: Do I need an internet connection?**
A: Yes, internet is required for:

- Address lookups (OpenStreetMap API)
- IBGE population data
- Coordinate conversion

The app will still show coordinates offline, but addresses won't update.

---

**Q: Does this work on my device?**
A: The app works on:

- ✅ Modern smartphones (Android/iOS)
- ✅ Tablets
- ✅ Desktop computers with GPS
- ✅ Laptops with location services

Requirements:

- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Location services enabled

---

**Q: Is my location data secure?**
A: Yes! Your location:

- Stays in your browser (not stored on servers)
- Only used to fetch address information
- Not shared with third parties
- Cleared when you close the tab

See [Privacy & Permissions](#privacy--permissions) for details.

---

**Q: Can I use this while driving?**
A: Yes, but:

- ⚠️ Don't interact with the app while driving
- ✅ Enable voice announcements for hands-free
- ✅ Use a phone mount for visibility
- ✅ Let a passenger operate the app

**Safety First**: Always prioritize safe driving over app usage.

---

**Q: Why does it say "Bairro: undefined"?**
A: Some locations don't have neighborhood data:

- Rural areas
- Small towns
- Newly developed areas
- Data gaps in OpenStreetMap

This is normal and doesn't indicate an error.

---

**Q: Can I see my location history?**
A: No, the app doesn't store location history. This is intentional for:

- Privacy protection
- Simpler implementation
- Reduced data storage

If you need history tracking, consider using dedicated tracking apps.

---

### Technical Questions

**Q: What coordinate system does this use?**
A: The app uses:

- **WGS 84** (World Geodetic System 1984)
- **Decimal degrees** format
- Same system as GPS, Google Maps, etc.

---

**Q: How accurate is the location?**
A: Accuracy depends on:

- Device GPS quality
- Environmental conditions
- Indoors vs outdoors

Typical accuracy:

- **Outdoors**: 5-20 meters (excellent to good)
- **Indoors**: 30-100+ meters (medium to bad)
- **Poor conditions**: 100-200+ meters (rejected by app)

---

**Q: What's the difference between the two position buttons?**
A:

- **"Obter Localização"** (Get Location): One-time update
- **"Iniciar Rastreamento"** (Start Tracking): Continuous updates

Use single capture when stationary, tracking when moving.

---

**Q: Why are updates not instant?**
A: Updates require:

- GPS signal acquisition (1-5 seconds)
- API address lookup (1-3 seconds)
- Processing and rendering (<1 second)

Total: 2-9 seconds per update is normal.

Smart filtering also prevents updates unless you moved ≥20m or 30s passed.

---

**Q: Can I customize the app?**
A: For developers:

- ✅ Fork the GitHub repository
- ✅ Modify source code
- ✅ Adjust update thresholds
- ✅ Customize UI appearance

See [Developer Guide](../developer/DEVELOPER_GUIDE.md) for details.

---

## Next Steps

**Learn More**:

- 📖 [API Reference](../api/COMPLETE_API_REFERENCE.md) - Technical details
- 🏗️ [Architecture Guide](../architecture/CLASS_DIAGRAM.md) - System design
- 💻 [Developer Guide](../developer/DEVELOPER_GUIDE.md) - Contribute to project
- 🧪 [Testing Guide](../testing/TESTING.md) - Quality assurance

**Get Help**:

- 🐛 [Report a Bug](https://github.com/mpbarbosa/guia_turistico/issues)
- 💡 [Request a Feature](https://github.com/mpbarbosa/guia_turistico/issues)
- 📧 Contact the developer via GitHub

---

## Appendix

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Navigate between elements |
| Enter | Activate focused button |
| Space | Toggle checkboxes/buttons |
| Esc | Close modals (if any) |

### Browser Compatibility

| Browser | Version | Support Level |
|---------|---------|---------------|
| Chrome | 94+ | ✅ Full |
| Firefox | 93+ | ✅ Full |
| Safari | 15+ | ✅ Full |
| Edge | 94+ | ✅ Full |
| Opera | 80+ | ✅ Full |
| Mobile Safari | iOS 15+ | ✅ Full |
| Chrome Mobile | Android 8+ | ✅ Full |

### System Requirements

**Minimum**:

- Modern browser (see compatibility table)
- JavaScript enabled
- Internet connection
- Location services enabled

**Recommended**:

- Fast internet (3G or better)
- Recent device (2-3 years old or newer)
- Updated browser
- Good GPS signal

---

**Last Updated**: 2026-02-16
**Version**: 0.11.0-alpha
**License**: ISC

---

*This guide covers version 0.11.0-alpha. Features and UI may change in future versions.*
