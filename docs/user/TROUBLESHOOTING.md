# Guia Turístico - Troubleshooting Guide

**Version**: 0.9.0-alpha  
**Last Updated**: 2026-02-11  
**Status**: Complete

---

## Table of Contents

- [Quick Fixes](#quick-fixes)
- [Permission Issues](#permission-issues)
- [Network and API Issues](#network-and-api-issues)
- [GPS and Location Issues](#gps-and-location-issues)
- [Display and UI Issues](#display-and-ui-issues)
- [Performance Issues](#performance-issues)
- [Browser Compatibility Issues](#browser-compatibility-issues)
- [Speech Synthesis Issues](#speech-synthesis-issues)
- [Mobile-Specific Issues](#mobile-specific-issues)
- [Error Messages Explained](#error-messages-explained)

---

## Quick Fixes

Try these first before detailed troubleshooting:

### The "Turn It Off and On Again" Fix

1. **Refresh the page** (F5 or Ctrl+R / Cmd+R)
2. **Clear browser cache**:
   - Chrome: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
   - Select "Cached images and files"
   - Click "Clear data"
3. **Restart the browser** completely
4. **Check internet connection** - Try loading other websites
5. **Try incognito/private mode** - Rules out extensions

### Common Quick Fixes

| Problem | Quick Fix | Time |
|---------|-----------|------|
| Button disabled | Wait 5 seconds, check status message | 5s |
| No location | Move outdoors, wait for GPS | 30-60s |
| Slow updates | Check 30s/20m thresholds met | varies |
| No address | Refresh page, try again | 5s |
| Speech not working | Try different browser | 1min |

---

## Permission Issues

### "Location permission denied"

**Symptoms**:
- Button remains disabled
- Status message: "Aguardando permissão de localização"
- No coordinates displayed
- Browser shows blocked location icon

**Causes**:
1. User clicked "Block" on permission prompt
2. Site blocked in browser settings
3. System-wide location disabled
4. Using HTTP instead of HTTPS (production)

**Solutions**:

#### Method 1: Reset Site Permissions (Chrome/Edge)
```
1. Click lock icon in address bar
2. Click "Site settings"
3. Find "Location" permission
4. Change to "Ask" or "Allow"
5. Refresh the page
6. Grant permission when prompted
```

#### Method 2: Browser Settings (Chrome)
```
1. Chrome menu (⋮) > Settings
2. Privacy and security > Site settings
3. Location
4. Check if site is in "Block" list
5. Remove from block list
6. Add to "Allow" list if needed
```

#### Method 3: Firefox Settings
```
1. Click lock icon
2. "Connection secure" or similar
3. Select "Clear permissions"
4. Refresh page
5. Grant permission when asked
```

#### Method 4: System Settings (if all else fails)

**Windows**:
```
Settings > Privacy > Location
- Turn on "Location services"
- Allow "Desktop apps to access your location"
```

**macOS**:
```
System Preferences > Security & Privacy > Privacy
- Select "Location Services"
- Enable for your browser
```

**Android**:
```
Settings > Apps > [Browser] > Permissions > Location
- Select "Allow all the time" or "Allow only while using the app"
```

**iOS**:
```
Settings > Privacy > Location Services
- Enable Location Services
- Find [Browser] > select "While Using the App"
```

### "Permission prompt not appearing"

**Symptoms**:
- Click button, nothing happens
- No permission dialog shown
- Console shows no errors

**Causes**:
1. Permission already denied previously
2. Browser auto-denied due to security
3. Third-party extension blocking
4. Corporate firewall/policy

**Solutions**:
1. **Check current permission**: Look for blocked icon in address bar
2. **Reset permissions**: See "Method 1" above
3. **Disable extensions**: Try incognito mode (extensions disabled)
4. **Contact IT**: Corporate networks may block geolocation

---

## Network and API Issues

### "Fetching address information timed out"

**Symptoms**:
- Coordinates displayed successfully
- Address section shows error
- Timeout after 10-15 seconds
- Network error in console

**Causes**:
1. OpenStreetMap/Nominatim API down
2. Slow internet connection
3. Firewall blocking API requests
4. Rate limiting (too many requests)

**Solutions**:

#### Step 1: Verify Internet Connection
```bash
# Check if OpenStreetMap is accessible
Visit: https://nominatim.openstreetmap.org/status

# Should show: {"status":0,"message":"OK"}
```

#### Step 2: Check Browser Console
```
1. Press F12 (Developer Tools)
2. Go to "Network" tab
3. Click "Obter Localização" again
4. Look for failed requests (red)
5. Check error messages
```

Common errors:
- `ERR_NAME_NOT_RESOLVED` - DNS issue (check internet)
- `ERR_CONNECTION_TIMED_OUT` - Slow connection (wait longer)
- `429 Too Many Requests` - Rate limited (wait 5 minutes)
- `CORS error` - API configuration issue (report bug)

#### Step 3: Try Alternative Network
```
1. Switch from WiFi to mobile data (or vice versa)
2. Try different WiFi network
3. Use VPN if corporate network blocks APIs
4. Disable VPN if it's causing slowdowns
```

#### Step 4: Wait and Retry
```
If rate limited:
1. Wait 5 minutes
2. Close other tabs using the app
3. Don't rapid-click the button
4. Use single-position mode, not continuous
```

### "IBGE statistics not loading"

**Symptoms**:
- Address displayed successfully
- Population section missing or showing error
- "Carregando estatísticas..." stays indefinitely

**Causes**:
1. IBGE SIDRA API down
2. Municipality not in database
3. Offline fallback failed
4. Network request blocked

**Solutions**:

1. **Check IBGE API status**:
   ```
   Visit: https://servicodados.ibge.gov.br/api/v3/agregados/6579
   Should return JSON data
   ```

2. **Verify municipality is Brazilian**:
   - IBGE data only available for Brazilian municipalities
   - Non-Brazilian locations won't have statistics

3. **Check offline fallback**:
   ```javascript
   // In browser console:
   fetch('/libs/sidra/tab6579_municipios.json')
     .then(r => r.json())
     .then(console.log);
   
   // Should show JSON with municipality data
   ```

4. **Report if persistent**:
   - This may indicate a bug in HTMLSidraDisplayer.js
   - Check browser console for errors
   - Report with municipality name and coordinates

---

## GPS and Location Issues

### "GPS signal not available"

**Symptoms**:
- "Obtendo localização..." stays indefinitely
- No coordinates displayed
- Timeout after 30-60 seconds
- Error: "User denied geolocation"

**Causes**:
1. Indoor location (GPS needs sky view)
2. Device GPS disabled
3. No GPS hardware (desktop computers)
4. GPS not yet acquired (first fix)

**Solutions**:

#### For Mobile Devices:
```
1. Move outdoors or near window
2. Wait 30-60 seconds for GPS fix
3. Check GPS is enabled in device settings
4. Ensure "High Accuracy" mode is enabled
5. Restart device if GPS not working
```

#### For Desktop/Laptop:
```
1. Desktop computers don't have GPS
2. Location uses WiFi-based approximation
3. Enable WiFi (even if not connected to network)
4. WiFi triangulation requires multiple visible networks
5. Accuracy will be lower (50-500m instead of 5-10m)
```

#### Improving GPS Accuracy:
```
✅ Outdoors, clear sky view
✅ Wait for initial GPS acquisition
✅ Keep device still during fix
✅ High accuracy mode enabled
✅ Recent A-GPS data (requires internet)

❌ Indoors, no windows
❌ Moving during acquisition
❌ Battery saver mode (reduces GPS accuracy)
❌ Older device (slower GPS)
```

### "Location updates too slow"

**Symptoms**:
- Continuous mode enabled
- Not updating as you move
- Updates only every few minutes
- Walking but display not changing

**Causes**:
1. Update thresholds not met (30s time, 20m distance)
2. GPS accuracy too low (position change not detected)
3. Timer not running (bug)
4. Moving too slowly

**Solutions**:

#### Verify Update Thresholds:
```
Location updates ONLY when:
- ⏱️ 30 seconds since last update, OR
- 📏 20 meters from last position

This is by design to prevent excessive API calls.
```

#### Check Current Status:
```
In browser console:
1. Press F12
2. Go to "Console" tab
3. Look for log messages:
   - "(PositionManager) Position updated"
   - "(PositionManager) Distance: XXm"
   - "(PositionManager) Time: XXs"
```

#### Improve Update Frequency:
```
1. Walk faster or farther (trigger 20m threshold)
2. Wait longer (trigger 30s threshold)
3. Stop and restart tracking
4. Check GPS accuracy is < 50m
5. Ensure continuous mode checkbox is checked
```

### "Wrong location displayed"

**Symptoms**:
- Coordinates shown are incorrect
- Address is for wrong city/country
- Location is far from actual position

**Causes**:
1. Low GPS accuracy (WiFi-based location)
2. Outdated cached position
3. VPN or proxy location
4. Mock location enabled (developer mode)

**Solutions**:

1. **Check accuracy indicator**:
   - Good: < 20m
   - Acceptable: 20-50m
   - Poor: > 50m

2. **Improve accuracy**:
   - Move outdoors
   - Wait for GPS fix
   - Disable VPN
   - Check mock location is off (developer settings)

3. **Force fresh location**:
   - Refresh page
   - Clear browser cache
   - Restart browser

---

## Display and UI Issues

### "Buttons are disabled"

**Symptoms**:
- "Obter Localização" button is grayed out
- Button shows status message
- Can't click to get location

**Causes**:
1. Waiting for prerequisites (by design)
2. Previous operation still in progress
3. Permission not granted
4. JavaScript error

**Solutions**:

#### Check Status Message (v0.9.0-alpha):
```
Button shows reason:
- "Aguardando localização para habilitar"
  → Location data not yet available
  → Wait a few seconds or check permissions

- "Pronto para usar"
  → Button should be enabled
  → If not, report bug
```

#### Troubleshoot:
```
1. Read the status message (tells you why)
2. Wait 5-10 seconds
3. Check browser console for errors
4. Refresh page and try again
```

### "Information not displaying"

**Symptoms**:
- Coordinates show but no address
- Address shows but no municipality card
- Some sections empty or missing

**Causes**:
1. API returned incomplete data
2. Display component failed to render
3. Network timeout
4. Data not available for location

**Solutions**:

1. **Check what's missing**:
   - **No address**: API timeout, try again
   - **No municipality card**: Data extraction failed
   - **No reference place**: None nearby (normal)
   - **No statistics**: Non-Brazilian location or API down

2. **View browser console**:
   ```
   F12 > Console tab
   Look for errors in red
   ```

3. **Check network tab**:
   ```
   F12 > Network tab
   Look for failed requests (red)
   Check response data
   ```

---

## Performance Issues

### "Application is slow"

**Symptoms**:
- Buttons take long to respond
- Updates lag
- Interface feels sluggish

**Causes**:
1. Slow internet connection
2. Low-powered device
3. Many browser tabs open
4. Memory leak (rare)

**Solutions**:

1. **Close other tabs** (free up memory)
2. **Disable browser extensions** temporarily
3. **Clear browser cache** (Settings > Privacy > Clear data)
4. **Restart browser** to free memory
5. **Use faster internet connection**
6. **Try on more powerful device**

### "High memory usage"

**Symptoms**:
- Browser uses lots of RAM
- Computer slows down
- Fan runs loudly

**Causes**:
1. Continuous mode running for hours
2. Timer leak (bug - should be fixed)
3. Many browser tabs
4. Memory-intensive speech synthesis

**Solutions**:

```
1. Stop continuous tracking when not needed
2. Refresh page periodically (clears memory)
3. Close unused tabs
4. Monitor with browser task manager:
   - Chrome: Shift+Esc
   - Check memory usage of each tab
```

---

## Browser Compatibility Issues

### "Application doesn't work in my browser"

**Symptoms**:
- Blank page
- JavaScript errors
- Features missing
- Console shows syntax errors

**Causes**:
1. Outdated browser
2. JavaScript disabled
3. ES6 modules not supported
4. Geolocation API missing

**Solutions**:

#### Check Browser Version:
```
Minimum required:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

How to check:
- Chrome: chrome://version
- Firefox: about:support
- Safari: Safari > About Safari
- Edge: edge://version
```

#### Update Browser:
```
Chrome/Edge:
- Menu (⋮) > Help > About Chrome/Edge
- Auto-updates to latest version

Firefox:
- Menu (☰) > Help > About Firefox
- Click "Check for updates"

Safari:
- Updates with macOS
- Check: System Preferences > Software Update
```

#### Enable JavaScript:
```
Chrome:
1. Settings > Privacy and security
2. Site settings > JavaScript
3. Ensure "Allowed" is selected

Firefox:
1. about:config in address bar
2. Search: javascript.enabled
3. Should be "true"

Safari:
1. Preferences > Security
2. Check "Enable JavaScript"
```

---

## Speech Synthesis Issues

### "No voice announcements"

**Symptoms**:
- Address changes but no speech
- Silent when neighborhood changes
- No audio output

**Causes**:
1. Browser doesn't support speech synthesis
2. No Brazilian Portuguese voice installed
3. System audio muted
4. Speech synthesis disabled in code

**Solutions**:

#### Check Browser Support:
```javascript
// In browser console:
'speechSynthesis' in window

// Should return: true
// If false: Browser doesn't support speech
```

#### Check Available Voices:
```javascript
// In browser console:
speechSynthesis.getVoices().filter(v => v.lang.startsWith('pt'))

// Should show Portuguese voices
// If empty: No Portuguese voices installed
```

#### Install Portuguese Voice:

**Windows**:
```
1. Settings > Time & Language > Language
2. Add "Portuguese (Brazil)" if not present
3. Click language > Options
4. Download speech pack
5. Restart browser
```

**macOS**:
```
1. System Preferences > Accessibility
2. Spoken Content
3. System Voice > Customize
4. Download "Luciana" (Brazilian Portuguese)
```

**Android/iOS**:
- System voices usually pre-installed
- Check Settings > Language for voice packs

### "Speech is too fast/slow"

**Symptoms**:
- Voice speaks too quickly
- Voice speaks too slowly
- Hard to understand

**Solutions**:

Currently not user-configurable. Default settings:
- Rate: 1.0 (normal speed)
- Pitch: 1.0 (normal pitch)

Future versions may add user controls.

---

## Mobile-Specific Issues

### "Not working on mobile"

**Symptoms**:
- Features don't work on phone
- Buttons not responsive
- Layout broken

**Solutions**:

1. **Check mobile browser version**:
   - Android Chrome 90+
   - iOS Safari 14+

2. **Try landscape orientation** if layout looks broken

3. **Clear mobile browser cache**:
   - Android Chrome: Settings > Privacy > Clear browsing data
   - iOS Safari: Settings > Safari > Clear History and Website Data

4. **Check mobile data connection** is stable

### "GPS not working on phone"

**Solutions**:
- Enable "High Accuracy" location mode
- Grant "While Using App" permission, not "Always"
- Disable battery optimization for browser
- Restart phone if GPS consistently fails

---

## Error Messages Explained

### User-Facing Errors

| Error Message | Meaning | Solution |
|--------------|---------|----------|
| "Permissão de localização negada" | Permission denied | Grant location permission |
| "Erro ao obter localização" | Geolocation failed | Check GPS/network |
| "Erro ao buscar endereço" | API timeout/error | Check internet, try again |
| "Aguardando localização" | Waiting for GPS | Wait or move outdoors |
| "Localização indisponível" | No location data | Check permissions, GPS |

### Developer Console Errors

| Console Error | Cause | Fix |
|--------------|-------|-----|
| `GeolocationPositionError` | GPS/permission issue | Check device settings |
| `NetworkError` | API unreachable | Check internet |
| `TypeError: Cannot read property` | Data structure issue | Report bug |
| `TimeoutError: Waiting failed` | E2E test timeout | Normal in tests |
| `CORS error` | Cross-origin blocked | Server configuration |

---

## Still Having Issues?

### Before Reporting a Bug

1. ✅ Try all relevant troubleshooting steps above
2. ✅ Test in incognito/private mode
3. ✅ Try different browser
4. ✅ Check browser console for errors (F12)
5. ✅ Note exact steps to reproduce

### Information to Include

When reporting bugs, provide:
- **Browser and version** (e.g., Chrome 120.0.6099.199)
- **Operating system** (e.g., Windows 11, macOS 14.2)
- **Device type** (desktop, mobile)
- **Error messages** from console (F12)
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** if applicable

### Contact and Resources

- 📘 **[User Guide](USER_GUIDE.md)** - Full documentation
- 🏗️ **[System Overview](../architecture/SYSTEM_OVERVIEW.md)** - Architecture details
- 🔧 **[Developer Guide](../developer/DEVELOPER_GUIDE.md)** - For contributors
- 📚 **[API Reference](../API_COMPLETE_REFERENCE.md)** - Technical docs

---

**Version**: 0.9.0-alpha  
**Last Updated**: 2026-02-11  
**Maintainer**: GitHub Copilot CLI  
**Status**: ✅ Complete
