# Browser Compatibility Testing Guide

Comprehensive guide for testing Guia.js across different browsers and devices.

## Table of Contents

- [Overview](#overview)
- [Supported Browsers](#supported-browsers)
- [Testing Matrix](#testing-matrix)
- [Browser-Specific Features](#browser-specific-features)
- [Testing Tools](#testing-tools)
- [Manual Testing](#manual-testing)
- [Automated Testing](#automated-testing)
- [Known Issues](#known-issues)

## Overview

Guia.js relies on modern browser APIs (Geolocation, ES6 modules, Speech Synthesis). This guide ensures compatibility across target browsers and provides fallback strategies.

**Primary Target**: Modern browsers released in last 2 years  
**Minimum Requirements**:
- ES6 module support
- Geolocation API
- Promises/async-await
- Modern DOM APIs

## Supported Browsers

### Desktop Browsers

| Browser | Minimum Version | Status | Notes |
|---------|----------------|--------|-------|
| Chrome | 90+ | ✅ Full Support | Primary development target |
| Firefox | 88+ | ✅ Full Support | ES6 modules, all APIs supported |
| Safari | 14+ | ✅ Full Support | Requires HTTPS for geolocation |
| Edge (Chromium) | 90+ | ✅ Full Support | Same as Chrome |
| Edge (Legacy) | Not Supported | ❌ No Support | Lacks ES6 module support |
| IE 11 | Not Supported | ❌ No Support | Lacks ES6 modules |

### Mobile Browsers

| Browser | Minimum Version | Status | Notes |
|---------|----------------|--------|-------|
| Chrome Android | 90+ | ✅ Full Support | Better GPS accuracy |
| Safari iOS | 14+ | ✅ Full Support | Requires user gesture for location |
| Firefox Android | 88+ | ✅ Full Support | Full feature parity |
| Samsung Internet | 14+ | ✅ Full Support | Based on Chromium |

### Feature Support Matrix

| Feature | Chrome | Firefox | Safari | Edge | Chrome Mobile | Safari iOS |
|---------|--------|---------|--------|------|---------------|------------|
| ES6 Modules | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Geolocation API | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Speech Synthesis | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ Limited |
| Dynamic Imports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Optional Chaining | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Nullish Coalescing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Testing Matrix

### Critical Test Scenarios

#### 1. Geolocation API

**Test Across**:
- ✅ Chrome Desktop (location services enabled)
- ✅ Firefox Desktop (location services enabled)
- ✅ Safari Desktop (HTTPS required)
- ✅ Chrome Mobile (higher accuracy)
- ✅ Safari iOS (permission prompt)

**Test Cases**:
```javascript
// Permission granted
navigator.geolocation.getCurrentPosition(
    (position) => console.log('Success:', position),
    (error) => console.error('Error:', error),
    { enableHighAccuracy: true, timeout: 5000 }
);

// Permission denied
// Expected: Error code 1 (PERMISSION_DENIED)

// Timeout
// Expected: Error code 3 (TIMEOUT) after 5 seconds

// Position unavailable
// Expected: Error code 2 (POSITION_UNAVAILABLE)
```

#### 2. ES6 Module Loading

**Test Script Tags**:
```html
<!-- Modern browsers -->
<script type="module" src="src/guia.js"></script>

<!-- Fallback for older browsers (not supported) -->
<script nomodule>
    alert('Your browser does not support ES6 modules. Please upgrade.');
</script>
```

**Test Dynamic Imports**:
```javascript
// Test in each browser
try {
    const module = await import('./src/core/GeoPosition.js');
    console.log('✅ Dynamic import works');
} catch (error) {
    console.error('❌ Dynamic import failed:', error);
}
```

#### 3. Speech Synthesis

**Browser Differences**:
```javascript
// Chrome: Excellent support, many voices
// Firefox: Good support, fewer voices
// Safari: Limited support, may require user interaction
// iOS Safari: Very limited, often doesn't work

function testSpeech() {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('São Paulo');
        
        // Get available voices
        const voices = speechSynthesis.getVoices();
        console.log(`Voices available: ${voices.length}`);
        
        // Test speech
        speechSynthesis.speak(utterance);
    } else {
        console.warn('Speech Synthesis not supported');
    }
}
```

## Browser-Specific Features

### Chrome-Specific Behavior

```javascript
// Chrome provides more detailed position data
navigator.geolocation.getCurrentPosition((position) => {
    console.log('Speed:', position.coords.speed); // Often null in desktop
    console.log('Heading:', position.coords.heading); // Often null
    console.log('Altitude:', position.coords.altitude); // GPS only
});

// Chrome DevTools can mock geolocation
// Open DevTools → Settings → Sensors → Geolocation
```

### Firefox-Specific Behavior

```javascript
// Firefox requires user permission once per session
// Permission persists until browser restart or manual revocation

// Firefox has stricter CORS policies for modules
// Ensure proper server configuration
```

### Safari-Specific Behavior

```javascript
// Safari REQUIRES HTTPS for geolocation
// Exception: localhost is allowed for development

// Safari may prompt for permission multiple times
// Each session may require new permission

// Safari has limited speech synthesis voices
const voices = speechSynthesis.getVoices();
const portugueseVoices = voices.filter(v => v.lang.startsWith('pt'));
console.log('Portuguese voices:', portugueseVoices.length);
// Safari: Often 1-2 voices
// Chrome: Often 5-10 voices
```

### Mobile-Specific Considerations

```javascript
// Mobile devices have better GPS accuracy
navigator.geolocation.getCurrentPosition((position) => {
    console.log('Accuracy:', position.coords.accuracy);
    // Desktop WiFi: 50-500 meters
    // Mobile GPS: 5-50 meters
});

// Mobile may enter low-power mode
// Use watchPosition with maximum age
navigator.geolocation.watchPosition(
    handlePosition,
    handleError,
    { 
        enableHighAccuracy: true,
        maximumAge: 60000 // Accept 1-minute-old position
    }
);
```

## Testing Tools

### 1. BrowserStack

Test on real devices and browsers:

```bash
# Sign up at browserstack.com
# Use Live testing for manual tests
# Use Automate for automated tests

# Prioritize testing:
# - Latest Chrome, Firefox, Safari
# - iPhone Safari (iOS 14+)
# - Chrome Android (latest)
```

### 2. Browser DevTools

#### Chrome DevTools Sensors

```
1. Open DevTools (F12)
2. Press Ctrl+Shift+P (Command+Shift+P on Mac)
3. Type "sensors"
4. Select "Show Sensors"
5. Set location:
   - São Paulo: -23.5505, -46.6333
   - Rio de Janeiro: -22.9068, -43.1729
   - Custom coordinates
```

#### Firefox about:config

```
1. Open about:config
2. Search "geo.enabled"
3. Ensure set to true
4. Test geolocation prompt behavior
```

#### Safari Develop Menu

```
1. Enable Develop menu: Safari → Preferences → Advanced → Show Develop menu
2. Develop → User Agent → Test different user agents
3. Develop → Geolocation → Custom Location
```

### 3. Mobile Testing

```bash
# Chrome Remote Debugging
1. Enable USB debugging on Android device
2. Connect device via USB
3. Open chrome://inspect in Chrome
4. Test on real device

# Safari iOS Testing  
1. Connect iPhone via USB
2. Enable Web Inspector on iPhone: Settings → Safari → Advanced
3. Open Safari on Mac → Develop → [Your iPhone]
4. Test on real device
```

### 4. Automated Cross-Browser Testing

**Playwright Example**:

```javascript
// install: npm install @playwright/test

import { test, expect } from '@playwright/test';

test.describe('Cross-browser tests', () => {
    test('should load geolocation in Chrome', async ({ page, context }) => {
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: -23.5505, longitude: -46.6333 });
        
        await page.goto('http://localhost:9000/test.html');
        await page.click('#get-location');
        
        await expect(page.locator('#coordinates')).toContainText('-23.55');
    });
});

// Run with different browsers:
// npx playwright test --project=chromium
// npx playwright test --project=firefox
// npx playwright test --project=webkit
```

## Manual Testing

### Test Checklist

Create `browser-test-checklist.md`:

```markdown
# Browser Compatibility Checklist

## Chrome Desktop (Latest)
- [ ] Page loads without errors
- [ ] ES6 modules load successfully
- [ ] Geolocation permission prompt appears
- [ ] Location acquired successfully
- [ ] Address displayed correctly
- [ ] Speech synthesis works (if enabled)
- [ ] No console errors

## Firefox Desktop (Latest)
- [ ] Page loads without errors
- [ ] ES6 modules load successfully
- [ ] Geolocation permission prompt appears
- [ ] Location acquired successfully
- [ ] Address displayed correctly
- [ ] Speech synthesis works (if enabled)
- [ ] No console errors

## Safari Desktop (Latest)
- [ ] HTTPS or localhost requirement met
- [ ] ES6 modules load successfully
- [ ] Geolocation permission prompt appears
- [ ] Location acquired successfully
- [ ] Address displayed correctly
- [ ] Speech synthesis limited but functional
- [ ] No console errors

## Chrome Mobile (Latest)
- [ ] Page loads on mobile
- [ ] Touch interactions work
- [ ] Geolocation more accurate
- [ ] Responsive layout
- [ ] Performance acceptable
- [ ] No mobile-specific errors

## Safari iOS (Latest)
- [ ] Page loads on iOS
- [ ] Touch interactions work
- [ ] Geolocation permission on user gesture
- [ ] Responsive layout
- [ ] Performance acceptable
- [ ] Handle limited speech support
```

### Test Procedure

```javascript
// Create browser-test.html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Browser Compatibility Test</title>
</head>
<body>
    <h1>Guia.js Browser Compatibility Test</h1>
    
    <div id="results">
        <h2>Feature Detection</h2>
        <ul id="features"></ul>
    </div>
    
    <button id="test-geolocation">Test Geolocation</button>
    <button id="test-speech">Test Speech</button>
    <button id="test-modules">Test Modules</button>
    
    <pre id="output"></pre>

    <script type="module">
        const output = document.getElementById('output');
        const features = document.getElementById('features');
        
        function log(message) {
            output.textContent += message + '\n';
            console.log(message);
        }
        
        function checkFeature(name, condition) {
            const li = document.createElement('li');
            li.textContent = `${name}: ${condition ? '✅' : '❌'}`;
            li.style.color = condition ? 'green' : 'red';
            features.appendChild(li);
        }
        
        // Feature detection
        checkFeature('ES6 Modules', typeof import !== 'undefined');
        checkFeature('Geolocation API', 'geolocation' in navigator);
        checkFeature('Speech Synthesis', 'speechSynthesis' in window);
        checkFeature('Promises', typeof Promise !== 'undefined');
        checkFeature('async/await', (async () => {})() instanceof Promise);
        checkFeature('Optional Chaining', true); // If this runs, it's supported
        checkFeature('Nullish Coalescing', true); // If this runs, it's supported
        
        // Test geolocation
        document.getElementById('test-geolocation').addEventListener('click', () => {
            log('Testing geolocation...');
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    log(`✅ Success: ${position.coords.latitude}, ${position.coords.longitude}`);
                    log(`   Accuracy: ${position.coords.accuracy}m`);
                },
                (error) => {
                    log(`❌ Error: ${error.message} (Code: ${error.code})`);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
        
        // Test speech
        document.getElementById('test-speech').addEventListener('click', () => {
            log('Testing speech synthesis...');
            
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance('São Paulo');
                const voices = speechSynthesis.getVoices();
                log(`✅ ${voices.length} voices available`);
                
                utterance.onend = () => log('✅ Speech completed');
                utterance.onerror = (e) => log(`❌ Speech error: ${e.error}`);
                
                speechSynthesis.speak(utterance);
            } else {
                log('❌ Speech Synthesis not supported');
            }
        });
        
        // Test module import
        document.getElementById('test-modules').addEventListener('click', async () => {
            log('Testing dynamic import...');
            
            try {
                const module = await import('./src/guia.js');
                log('✅ Dynamic import successful');
                log(`   Exported: ${Object.keys(module).join(', ')}`);
            } catch (error) {
                log(`❌ Dynamic import failed: ${error.message}`);
            }
        });
        
        log('Browser: ' + navigator.userAgent);
        log('Ready for testing');
    </script>
</body>
</html>
```

## Automated Testing

### Playwright Configuration

Create `playwright.config.js`:

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './__tests__/browser',
    
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
    ],
    
    webServer: {
        command: 'python3 -m http.server 9000',
        port: 9000,
        timeout: 120000,
    },
});
```

### Run Cross-Browser Tests

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

# Run all browsers
npx playwright test

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run with UI
npx playwright test --ui

# Generate report
npx playwright show-report
```

## Known Issues

### Safari iOS Speech Synthesis

**Issue**: Limited voice support, may not work reliably  
**Workaround**: Provide visual-only fallback

```javascript
if (isSafariIOS()) {
    console.warn('Speech synthesis may be limited on iOS Safari');
    // Show visual notifications instead
}

function isSafariIOS() {
    const ua = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua);
}
```

### Firefox Module Loading Timing

**Issue**: Occasionally slow to load large modules  
**Workaround**: Show loading indicator

```javascript
const loadingIndicator = document.getElementById('loading');
loadingIndicator.style.display = 'block';

import('./src/guia.js')
    .then(module => {
        loadingIndicator.style.display = 'none';
        // Use module
    });
```

### Chrome Android Geolocation Accuracy

**Issue**: First position may have low accuracy  
**Workaround**: Wait for improved accuracy or use watchPosition

```javascript
let attempts = 0;
const MAX_ATTEMPTS = 3;

function getAccuratePosition() {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            if (position.coords.accuracy < 100 || attempts >= MAX_ATTEMPTS) {
                // Accept position
                handlePosition(position);
            } else {
                attempts++;
                setTimeout(getAccuratePosition, 1000);
            }
        },
        handleError
    );
}
```

## Related Documentation

- [E2E Testing Guide](./E2E_TESTING_GUIDE.md) - End-to-end testing
- [Performance Testing Guide](./PERFORMANCE_TESTING_GUIDE.md) - Performance testing
- [Test Organization](../__tests__/README.md) - Test structure

---

**Version**: 0.9.0-alpha  
**Last Updated**: 2026-01-01  
**Supported Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
