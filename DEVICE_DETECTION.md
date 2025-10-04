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
npm test -- __tests__/DeviceDetection.test.js
```

The test suite includes 11 tests covering:
- Mobile device detection from user agent
- Desktop device detection
- Tablet device detection
- Multi-method detection scoring
- Configuration initialization
- Integration with accuracy quality classification

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

### `isMobileDevice()`

Detects if the current device is a mobile or tablet device.

**Returns**: `boolean` - `true` if mobile/tablet, `false` if desktop/laptop

**Example**:
```javascript
if (isMobileDevice()) {
    console.log('Mobile device - expecting GPS accuracy');
} else {
    console.log('Desktop device - expecting WiFi/IP accuracy');
}
```

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

**Solution**: The detection uses a scoring system. Check the detection details:
```javascript
console.log('User Agent:', navigator.userAgent);
console.log('Touch Points:', navigator.maxTouchPoints);
console.log('Screen Width:', window.innerWidth);
```

If needed, manually override:
```javascript
setupParams.notAcceptedAccuracy = setupParams.desktopNotAcceptedAccuracy;
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

- **v0.8.4-alpha**: Added device detection and device-specific accuracy adjustment
- Device detection uses multi-method scoring approach
- Automatic configuration based on device capabilities
- Comprehensive test coverage with 11 automated tests

## Related Documentation

- [Main README](README.md)
- [Testing Guide](TESTING.md)
- [Geolocation API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
