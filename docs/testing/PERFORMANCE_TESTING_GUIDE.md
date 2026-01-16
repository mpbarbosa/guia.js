# Performance Testing Guide

Comprehensive guide for performance testing and optimization in Guia.js.

## Table of Contents

- [Overview](#overview)
- [Performance Metrics](#performance-metrics)
- [Testing Tools](#testing-tools)
- [Performance Test Scenarios](#performance-test-scenarios)
- [Benchmarking](#benchmarking)
- [Optimization Strategies](#optimization-strategies)
- [Monitoring](#monitoring)

## Overview

Performance testing ensures Guia Turístico provides a responsive user experience across different devices and network conditions. This guide covers manual testing, automated benchmarks, and optimization techniques.

**Key Performance Goals**:
- Initial load: < 500ms
- Geolocation response: < 2 seconds
- Address processing: < 100ms
- UI updates: < 16ms (60 FPS)
- Memory usage: < 50MB

## Performance Metrics

### Core Web Vitals

Track these essential metrics for user experience:

#### 1. Largest Contentful Paint (LCP)
**Target**: < 2.5 seconds  
**Measures**: Loading performance

```javascript
// Monitor LCP
new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        console.log('LCP:', entry.renderTime || entry.loadTime);
    }
}).observe({ entryTypes: ['largest-contentful-paint'] });
```

#### 2. First Input Delay (FID)
**Target**: < 100ms  
**Measures**: Interactivity

```javascript
// Monitor FID
new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        console.log('FID:', entry.processingStart - entry.startTime);
    }
}).observe({ entryTypes: ['first-input'] });
```

#### 3. Cumulative Layout Shift (CLS)
**Target**: < 0.1  
**Measures**: Visual stability

```javascript
// Monitor CLS
let clsScore = 0;
new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
            clsScore += entry.value;
            console.log('CLS:', clsScore);
        }
    }
}).observe({ entryTypes: ['layout-shift'] });
```

### Custom Application Metrics

#### Geolocation Timing

```javascript
class PerformanceMonitor {
    static measureGeolocation() {
        const start = performance.now();
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const duration = performance.now() - start;
                console.log(`Geolocation: ${duration.toFixed(2)}ms`);
                
                // Target: < 2000ms
                if (duration > 2000) {
                    console.warn('Geolocation slow!');
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
            }
        );
    }
}
```

#### Address Processing Timing

```javascript
class AddressPerformance {
    static async measureGeocode(lat, lon) {
        const start = performance.now();
        
        const address = await reverseGeocoder.geocode(lat, lon);
        const duration = performance.now() - start;
        
        console.log(`Geocoding: ${duration.toFixed(2)}ms`);
        
        // Target: < 1000ms (network dependent)
        return { address, duration };
    }
    
    static measureExtraction(nominatimData) {
        const start = performance.now();
        
        const address = addressExtractor.extract(nominatimData);
        const duration = performance.now() - start;
        
        console.log(`Extraction: ${duration.toFixed(2)}ms`);
        
        // Target: < 100ms
        if (duration > 100) {
            console.warn('Extraction slow!');
        }
        
        return { address, duration };
    }
}
```

#### UI Render Performance

```javascript
class UIPerformance {
    static measureRender(callback) {
        const start = performance.now();
        
        requestAnimationFrame(() => {
            callback();
            
            requestAnimationFrame(() => {
                const duration = performance.now() - start;
                console.log(`UI Render: ${duration.toFixed(2)}ms`);
                
                // Target: < 16ms (60 FPS)
                if (duration > 16) {
                    console.warn('Frame drop detected!');
                }
            });
        });
    }
}
```

### Memory Usage

```javascript
class MemoryMonitor {
    static checkMemory() {
        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize / 1048576;
            const total = performance.memory.totalJSHeapSize / 1048576;
            
            console.log(`Memory: ${used.toFixed(2)}MB / ${total.toFixed(2)}MB`);
            
            // Target: < 50MB
            if (used > 50) {
                console.warn('High memory usage!');
            }
            
            return { used, total };
        }
        return null;
    }
    
    static detectLeaks(testFunction, iterations = 100) {
        const initial = this.checkMemory();
        
        for (let i = 0; i < iterations; i++) {
            testFunction();
        }
        
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }
        
        const final = this.checkMemory();
        const growth = final.used - initial.used;
        
        console.log(`Memory growth: ${growth.toFixed(2)}MB over ${iterations} iterations`);
        
        // Alert if memory grows significantly
        if (growth > 5) {
            console.warn('Possible memory leak detected!');
        }
    }
}
```

## Testing Tools

### Browser DevTools

#### Performance Tab
```
1. Open Chrome DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Perform actions (get location, update address, etc.)
5. Stop recording
6. Analyze timeline for bottlenecks
```

**Look for**:
- Long tasks (> 50ms)
- Excessive layout recalculations
- JavaScript execution time
- Network requests

#### Network Tab
```
1. Open Network tab
2. Set throttling (Fast 3G, Slow 3G)
3. Test application under poor network conditions
4. Verify:
   - Request timing
   - Resource sizes
   - Waterfall chart
```

#### Memory Tab
```
1. Take heap snapshot before action
2. Perform action (e.g., get location 10 times)
3. Take another heap snapshot
4. Compare snapshots
5. Look for retained objects
```

### Lighthouse

Run Lighthouse audits for comprehensive performance analysis:

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse http://localhost:9000/test.html \
  --view \
  --output html \
  --output-path ./lighthouse-report.html

# Programmatic usage
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {
    logLevel: 'info',
    output: 'html',
    port: chrome.port
  };
  
  const runnerResult = await lighthouse(url, options);
  
  console.log('Performance score:', runnerResult.lhr.categories.performance.score * 100);
  
  await chrome.kill();
}
```

### Custom Performance Test Script

Create `performance-test.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Guia.js Performance Test</title>
</head>
<body>
    <h1>Performance Metrics</h1>
    <div id="metrics"></div>
    <button id="run-test">Run Performance Test</button>

    <script type="module">
        import { GeoPosition } from './src/core/GeoPosition.js';
        import { PositionManager } from './src/core/PositionManager.js';
        
        const metrics = {
            geoPositionCreation: [],
            distanceCalculation: [],
            managerOperations: []
        };
        
        function benchmark(name, fn, iterations = 1000) {
            const times = [];
            
            for (let i = 0; i < iterations; i++) {
                const start = performance.now();
                fn();
                const duration = performance.now() - start;
                times.push(duration);
            }
            
            const avg = times.reduce((a, b) => a + b) / times.length;
            const min = Math.min(...times);
            const max = Math.max(...times);
            
            return { name, avg, min, max, iterations };
        }
        
        document.getElementById('run-test').addEventListener('click', () => {
            console.log('Running performance tests...');
            
            // Test 1: GeoPosition creation
            const result1 = benchmark('GeoPosition Creation', () => {
                new GeoPosition({
                    coords: {
                        latitude: -23.5505,
                        longitude: -46.6333,
                        accuracy: 10
                    },
                    timestamp: Date.now()
                });
            });
            
            console.log(`${result1.name}: avg=${result1.avg.toFixed(3)}ms, min=${result1.min.toFixed(3)}ms, max=${result1.max.toFixed(3)}ms`);
            
            // Test 2: Distance calculation
            const pos = new GeoPosition({
                coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 10 },
                timestamp: Date.now()
            });
            
            const result2 = benchmark('Distance Calculation', () => {
                pos.distanceTo(-22.9068, -43.1729);
            }, 10000);
            
            console.log(`${result2.name}: avg=${result2.avg.toFixed(3)}ms`);
            
            // Display results
            document.getElementById('metrics').innerHTML = `
                <h2>Results</h2>
                <p><strong>${result1.name}</strong>: ${result1.avg.toFixed(3)}ms average</p>
                <p><strong>${result2.name}</strong>: ${result2.avg.toFixed(3)}ms average</p>
            `;
        });
    </script>
</body>
</html>
```

## Performance Test Scenarios

### Scenario 1: Initial Page Load

**Test**: Measure time to interactive

```javascript
// Add to test.html
window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`Page Load: ${loadTime}ms`);
    
    // Target: < 500ms
    if (loadTime > 500) {
        console.warn('Slow page load!');
    }
});
```

### Scenario 2: Rapid Position Updates

**Test**: Handle 10 position updates in quick succession

```javascript
async function testRapidUpdates() {
    const positions = Array.from({ length: 10 }, (_, i) => ({
        coords: {
            latitude: -23.5505 + (i * 0.001),
            longitude: -46.6333 + (i * 0.001),
            accuracy: 10
        },
        timestamp: Date.now() + (i * 100)
    }));
    
    const start = performance.now();
    
    for (const pos of positions) {
        await manager.handlePositionUpdate(pos);
    }
    
    const duration = performance.now() - start;
    console.log(`10 updates: ${duration.toFixed(2)}ms`);
    
    // Target: < 1000ms total
}
```

### Scenario 3: Memory Stress Test

**Test**: Create/destroy 100 GeoPosition instances

```javascript
function memoryStressTest() {
    console.log('Memory before:', performance.memory.usedJSHeapSize / 1048576, 'MB');
    
    for (let i = 0; i < 100; i++) {
        const pos = new GeoPosition({
            coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 10 },
            timestamp: Date.now()
        });
        
        // Use position
        pos.distanceTo(-22.9068, -43.1729);
    }
    
    // Force GC if available
    if (global.gc) global.gc();
    
    console.log('Memory after:', performance.memory.usedJSHeapSize / 1048576, 'MB');
}
```

### Scenario 4: Network Degradation

**Test**: Performance under slow network (3G)

```
1. Open Chrome DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Test geolocation and geocoding
4. Verify:
   - Reasonable timeout handling
   - Loading indicators displayed
   - Graceful degradation
```

## Benchmarking

### Automated Benchmark Suite

Create `benchmark.js`:

```javascript
import Benchmark from 'benchmark';
import { GeoPosition } from './src/core/GeoPosition.js';
import { calculateDistance } from './src/utils/distance.js';

const suite = new Benchmark.Suite('Guia.js Performance');

// Benchmark: GeoPosition creation
suite.add('GeoPosition#constructor', function() {
    new GeoPosition({
        coords: {
            latitude: -23.5505,
            longitude: -46.6333,
            accuracy: 10
        },
        timestamp: Date.now()
    });
});

// Benchmark: Distance calculation
const pos = new GeoPosition({
    coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 10 },
    timestamp: Date.now()
});

suite.add('calculateDistance', function() {
    calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729);
});

suite.add('GeoPosition#distanceTo', function() {
    pos.distanceTo(-22.9068, -43.1729);
});

// Run benchmarks
suite
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run({ 'async': true });
```

Run with:
```bash
npm install benchmark
node benchmark.js
```

## Optimization Strategies

### 1. Minimize DOM Manipulation

```javascript
// ❌ Bad: Multiple DOM updates
function updateAddress(address) {
    document.getElementById('municipality').textContent = address.municipality;
    document.getElementById('neighborhood').textContent = address.neighborhood;
    document.getElementById('street').textContent = address.street;
}

// ✅ Good: Batch DOM updates
function updateAddress(address) {
    const fragment = document.createDocumentFragment();
    // Build complete structure
    // ...
    container.appendChild(fragment); // Single reflow
}
```

### 2. Debounce Expensive Operations

```javascript
function debounce(fn, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Debounce geocoding requests
const debouncedGeocode = debounce(async (lat, lon) => {
    return await reverseGeocoder.geocode(lat, lon);
}, 500);
```

### 3. Lazy Load Components

```javascript
// Load speech synthesis only when needed
let speechManager;

async function enableSpeech() {
    if (!speechManager) {
        const { SpeechSynthesisManager } = await import('./src/speech/SpeechSynthesisManager.js');
        speechManager = new SpeechSynthesisManager();
    }
    return speechManager;
}
```

### 4. Cache API Responses

```javascript
const addressCache = new Map();

async function getCachedAddress(lat, lon) {
    const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    
    if (addressCache.has(key)) {
        return addressCache.get(key);
    }
    
    const address = await reverseGeocoder.geocode(lat, lon);
    addressCache.set(key, address);
    
    return address;
}
```

### 5. Use Web Workers for Heavy Processing

```javascript
// distance-worker.js
self.onmessage = function(e) {
    const { lat1, lon1, lat2, lon2 } = e.data;
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    self.postMessage(distance);
};

// Main thread
const worker = new Worker('distance-worker.js');
worker.postMessage({ lat1: -23.5505, lon1: -46.6333, lat2: -22.9068, lon2: -43.1729 });
worker.onmessage = (e) => console.log('Distance:', e.data);
```

## Monitoring

### Production Monitoring

```javascript
class PerformanceReporter {
    static report(metric, value) {
        // Send to analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'performance_metric', {
                metric_name: metric,
                metric_value: value,
                page_path: window.location.pathname
            });
        }
        
        // Log locally
        console.log(`[Performance] ${metric}: ${value}`);
    }
    
    static reportGeolocationTime(duration) {
        this.report('geolocation_time', duration);
    }
    
    static reportGeocodingTime(duration) {
        this.report('geocoding_time', duration);
    }
}
```

### Performance Budget

Set performance budgets and alert on violations:

```javascript
const PERFORMANCE_BUDGET = {
    geolocation: 2000,  // ms
    geocoding: 1000,    // ms
    extraction: 100,    // ms
    render: 16          // ms
};

function checkBudget(metric, value) {
    if (value > PERFORMANCE_BUDGET[metric]) {
        console.warn(`⚠️ Performance budget exceeded: ${metric} took ${value}ms (budget: ${PERFORMANCE_BUDGET[metric]}ms)`);
        
        // Report violation
        PerformanceReporter.report(`budget_violation_${metric}`, value);
    }
}
```

## Related Documentation

- [E2E Testing Guide](./E2E_TESTING_GUIDE.md) - End-to-end testing
- [Browser Compatibility Guide](./BROWSER_COMPATIBILITY_GUIDE.md) - Cross-browser testing
- [Testing README](../__tests__/README.md) - Test organization

---

**Version**: 0.6.0-alpha  
**Last Updated**: 2026-01-01  
**Performance Targets**: LCP < 2.5s, FID < 100ms, CLS < 0.1
