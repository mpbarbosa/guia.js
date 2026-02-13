# Device Detection and Accuracy Adjustment

## Overview

Guia.js now automatically detects the device type (mobile/tablet vs desktop/laptop) and adjusts geolocation accuracy requirements accordingly. This feature recognizes that mobile devices with GPS hardware provide more accurate location data than desktop devices that rely on WiFi/IP-based location services.

## How It Works

### Device Detection

The `isMobileDevice()` function uses a multi-method detection approach:

1. **User Agent String Matching**: Checks for mobile/tablet patterns (Android, iOS, etc.)
2. **Touch Capability Detection**: Examines `navigator.maxTouchPoints`
3. **Screen Width Heuristic**: Considers screens < 768px as mobile

A device is classified as mobile if **at least 2 out of 3** detection methods indicate a mobile device. This scoring system provides more reliable detection than any single method.

#### Edge Cases and Limitations

**Important Considerations:**

- **User Agent Spoofing**: User agent strings can be modified, leading to incorrect detection
- **Touch-Capable Laptops**: Windows laptops with touch screens may be misdetected as mobile if screen width is small
- **Tablets in Landscape**: Tablets in landscape mode with width ≥ 768px may be detected as desktop
- **Boundary Case**: A screen width of exactly 768px is considered desktop (condition is `< 768`, not `≤ 768`)
- **Missing Properties**: Handles missing `navigator.userAgent`, `navigator.vendor`, `navigator.maxTouchPoints` gracefully
- **Non-Browser Environments**: Returns `false` in Node.js or other non-browser contexts
- **Static Detection**: Detection happens once at module load; window resize is not tracked
- **Opera Browser**: Handles both `window.opera` and modern Opera user agents

**Safe Defaults:**

- Missing `userAgent`: defaults to empty string
- Missing `maxTouchPoints`: treated as 0 (no touch capability)
- Missing `innerWidth`: treated as Infinity (desktop)
- Missing `navigator` or `window`: returns `false` (desktop)

### Accuracy Thresholds

Different accuracy thresholds are applied based on device type:

#### Mobile Devices (GPS-enabled)
- **Rejected Accuracy Levels**: `medium`, `bad`, `very bad`
- **Accepted Accuracy Levels**: `excellent` (≤10m), `good` (11-20m)
- **Rationale**: Mobile devices have GPS hardware and should provide high accuracy

#### Desktop Devices (WiFi/IP location)
- **Rejected Accuracy Levels**: `bad`, `very bad`
- **Accepted Accuracy Levels**: `excellent` (≤10m), `good` (11-20m), `medium` (21-100m)
- **Rationale**: Desktop devices rely on WiFi/IP location, which typically provides 50-1000m accuracy

## Accuracy Quality Classifications

The system classifies GPS accuracy into five quality levels:

| Quality Level | Accuracy Range | Typical Source | Mobile | Desktop |
|--------------|----------------|----------------|--------|---------|
| Excellent | ≤ 10 meters | GPS with good signal | ✅ Accepted | ✅ Accepted |
| Good | 11-20 meters | GPS/Mobile GPS | ✅ Accepted | ✅ Accepted |
| Medium | 21-100 meters | WiFi location | ❌ Rejected | ✅ Accepted |
| Bad | 101-200 meters | Cell tower | ❌ Rejected | ❌ Rejected |
| Very Bad | > 200 meters | IP-based location | ❌ Rejected | ❌ Rejected |

## Usage

### Automatic Configuration

Device detection and accuracy adjustment happen automatically when the application loads:

```javascript
// No configuration needed - detection is automatic!
// The setupParams.notAcceptedAccuracy is set automatically
```

### Manual Override

You can manually override the accuracy settings if needed:

```javascript
// Force mobile (stricter) settings
setupParams.notAcceptedAccuracy = setupParams.mobileNotAcceptedAccuracy;

// Force desktop (relaxed) settings
setupParams.notAcceptedAccuracy = setupParams.desktopNotAcceptedAccuracy;

// Custom settings
setupParams.notAcceptedAccuracy = ['bad', 'very bad'];
```

### Check Device Type

```javascript
// Check if device is mobile
const isMobile = isMobileDevice();
console.log(`Device type: ${isMobile ? 'Mobile/Tablet' : 'Desktop/Laptop'}`);

// Check current accuracy configuration
console.log('Rejected accuracy levels:', setupParams.notAcceptedAccuracy);
```

### Advanced Usage: Dependency Injection (Referential Transparency)

For testing or advanced scenarios, you can inject custom navigator/window objects:

```javascript
// Test mobile device detection without mocking globals
const isMobile = isMobileDevice({
  navigatorObj: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    maxTouchPoints: 5
  },
  windowObj: {
    innerWidth: 375
  }
});

// Test desktop device detection
const isDesktop = isMobileDevice({
  navigatorObj: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    maxTouchPoints: 0
  },
  windowObj: {
    innerWidth: 1920
  }
});
```

This approach makes the function referentially transparent (same inputs always produce same outputs) and easier to test.

## Configuration Details

The configuration is stored in `setupParams`:

```javascript
const setupParams = {
    // Device-specific accuracy thresholds
    mobileNotAcceptedAccuracy: ["medium", "bad", "very bad"],
    desktopNotAcceptedAccuracy: ["bad", "very bad"],
    notAcceptedAccuracy: null, // Automatically set based on device type
    
    // ... other configuration options
};
```

## Testing

### Automated Tests

Run the device detection test suite:

```bash
npm test -- __tests__/utils/DeviceDetection.test.js
```

The test suite includes **20 comprehensive tests** covering:
- Mobile device detection from user agent
- Desktop device detection
- Tablet device detection
- Multi-method detection scoring
- Edge cases (768px boundary, missing properties)
- Defensive coding (missing userAgent, maxTouchPoints)
- Dependency injection for referential transparency
- Deterministic behavior with same inputs
- Configuration initialization
- Integration with accuracy quality classification

### Test Coverage

**Edge Case Tests:**
- Missing `navigator.userAgent` property
- Missing `navigator.maxTouchPoints` property
- `navigator.vendor` fallback handling
- `window.opera` defined scenarios
- Exact boundary: 768px screen width
- Just below boundary: 767px screen width
- Explicit `maxTouchPoints = 0`

**Referential Transparency Tests:**
- Dependency injection support
- Deterministic output for same inputs
- No side effects on input objects

### Manual Testing

Open the test page in a browser:

```bash
# Start the web server
python3 -m http.server 9000

# Open in browser
http://localhost:9000/device-detection-test.html
```

The test page displays:
- Detected device type
- Detection method details
- Active accuracy configuration
- Visual representation of accepted/rejected accuracy levels
- Technical details (user agent, touch points, screen width)

## Browser Compatibility

The device detection feature works in all modern browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (iOS and macOS)
- ✅ Mobile browsers (Android Chrome, iOS Safari, etc.)

For non-browser environments (e.g., Node.js testing), the system defaults to mobile (stricter) settings.

## Real-World Impact

### Mobile Device Scenario
- User opens app on iPhone with GPS
- System detects mobile device
- GPS provides 15-meter accuracy → **Accepted** (good quality)
- GPS degrades to 50-meter accuracy → **Rejected** (medium quality)
- User sees: "Accuracy not good enough, waiting for better signal..."

### Desktop Device Scenario
- User opens app on laptop with WiFi
- System detects desktop device
- WiFi provides 50-meter accuracy → **Accepted** (medium quality)
- User gets location even with moderate accuracy
- WiFi degrades to 150-meter accuracy → **Rejected** (bad quality)

## Benefits

1. **Better User Experience**: Users get location data appropriate for their device
2. **Automatic Adaptation**: No configuration needed by users or developers
3. **Realistic Expectations**: Desktop users aren't frustrated by rejected medium-accuracy readings
4. **Quality Control**: Mobile users still get high-quality GPS data
5. **Graceful Degradation**: System works even with less accurate location services

## API Reference

### `isMobileDevice(options)`

Detects if the current device is a mobile or tablet device.

**Parameters**:
- `options` (Object, optional): Configuration options for dependency injection
  - `options.navigatorObj` (Object, optional): Navigator object to use (defaults to global `navigator`)
  - `options.windowObj` (Object, optional): Window object to use (defaults to global `window`)

**Returns**: `boolean` - `true` if mobile/tablet, `false` if desktop/laptop

**Example (Default Usage)**:
```javascript
if (isMobileDevice()) {
    console.log('Mobile device - expecting GPS accuracy');
} else {
    console.log('Desktop device - expecting WiFi/IP accuracy');
}
```

**Example (Dependency Injection)**:
```javascript
// For testing or advanced use cases
const result = isMobileDevice({
  navigatorObj: { userAgent: 'iPhone', maxTouchPoints: 5 },
  windowObj: { innerWidth: 375 }
});
```

**Edge Cases**:
- Returns `false` for non-browser environments (Node.js)
- Handles missing `navigator.userAgent`, `navigator.vendor` gracefully
- Screen width of exactly 768px is considered desktop
- Missing `maxTouchPoints` property is treated as 0
- Empty or missing user agent strings default to empty string

**Limitations**:
- User agent strings can be spoofed
- Touch-capable laptops may be misdetected as mobile
- Tablets in landscape mode (width > 768) may be misdetected as desktop
- Detection happens once at module load; window resize not tracked

### `setupParams.mobileNotAcceptedAccuracy`

Array of accuracy quality levels rejected on mobile devices.

**Type**: `string[]`  
**Default**: `["medium", "bad", "very bad"]`

### `setupParams.desktopNotAcceptedAccuracy`

Array of accuracy quality levels rejected on desktop devices.

**Type**: `string[]`  
**Default**: `["bad", "very bad"]`

### `setupParams.notAcceptedAccuracy`

Currently active accuracy rejection list (automatically set based on device type).

**Type**: `string[]`  
**Auto-configured**: Set to either `mobileNotAcceptedAccuracy` or `desktopNotAcceptedAccuracy`

## Troubleshooting

### Issue: Desktop detected as mobile (or vice versa)

**Possible Causes:**
1. Touch-capable laptop detected as mobile
2. Tablet in landscape mode detected as desktop
3. Spoofed user agent

**Solution**: The detection uses a scoring system. Check the detection details:
```javascript
console.log('User Agent:', navigator.userAgent);
console.log('Touch Points:', navigator.maxTouchPoints);
console.log('Screen Width:', window.innerWidth);
```

Debug the scoring:
```javascript
const ua = navigator.userAgent.toLowerCase();
const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(ua);
const hasTouch = navigator.maxTouchPoints > 0;
const isSmall = window.innerWidth < 768;
console.log(`UA: ${isMobileUA}, Touch: ${hasTouch}, Small Screen: ${isSmall}`);
console.log(`Score: ${[isMobileUA, hasTouch, isSmall].filter(Boolean).length} out of 3`);
```

If needed, manually override:
```javascript
setupParams.notAcceptedAccuracy = setupParams.desktopNotAcceptedAccuracy;
```

### Issue: Touch-capable laptop detected as mobile

**Cause**: Windows laptops with touch screens and small windows may score 2/3 on mobile detection.

**Solution**: 
1. Maximize browser window (width > 768px) to reduce score to 1/3
2. Manually override accuracy settings if needed
3. Consider custom detection logic for your specific use case

### Issue: Function returns different results in tests

**Cause**: Tests may be accessing global `navigator`/`window` instead of mocked values.

**Solution**: Use dependency injection in tests:
```javascript
// ✅ Good: Referentially transparent testing
const result = isMobileDevice({
  navigatorObj: mockNavigator,
  windowObj: mockWindow
});

// ❌ Bad: Relies on global state
global.navigator = mockNavigator;
const result = isMobileDevice(); // May not use the mock
```

### Issue: Location always rejected on desktop

**Possible cause**: Location service providing accuracy > 200m  
**Solution**: This is expected behavior - the location is genuinely too inaccurate. The system correctly rejects "very bad" accuracy on both mobile and desktop.

### Issue: Want stricter accuracy on desktop

**Solution**: Manually configure stricter settings:
```javascript
setupParams.notAcceptedAccuracy = setupParams.mobileNotAcceptedAccuracy;
```

## Version History

- **v0.9.0-alpha**: Enhanced device detection with referential transparency
  - Added dependency injection support via optional `options` parameter
  - Improved defensive coding with graceful fallbacks
  - Added comprehensive edge case handling
  - Expanded test coverage to 20 tests
  - Updated documentation with edge cases and limitations
- **v0.9.0-alpha**: Added device detection and device-specific accuracy adjustment
  - Device detection uses multi-method scoring approach
  - Automatic configuration based on device capabilities
  - Initial test coverage with 11 automated tests

## Related Documentation

- [Main README](README.md)
- [Testing Guide](TESTING.md)
- [Referential Transparency Guide](.github/REFERENTIAL_TRANSPARENCY.md)
- [Geolocation API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)

## Design Principles

The `isMobileDevice()` function follows these design principles:

### Referential Transparency
- **Pure Function Core**: When given explicit parameters via dependency injection, the function is pure and referentially transparent
- **Deterministic**: Same inputs always produce same outputs
- **No Side Effects**: Does not modify any external state
- **Testable**: Easy to test without complex mocking

### Defensive Coding
- **Graceful Fallbacks**: Handles missing properties with safe defaults
- **Type Safety**: Validates property types before use
- **Boundary Conditions**: Carefully handles edge cases (768px, missing properties)
- **Non-Browser Safety**: Works correctly in Node.js environments

### Backward Compatibility
- **Optional Parameters**: Default behavior unchanged for existing code
- **Progressive Enhancement**: New features (dependency injection) are opt-in
- **No Breaking Changes**: All existing usage patterns continue to work
