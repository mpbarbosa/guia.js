# E2E Test Patterns and Best Practices

**Date**: 2026-01-15  
**Purpose**: Document proven patterns for Puppeteer E2E tests  
**Scope**: Browser-based end-to-end testing with Puppeteer

---

## 🎯 **E2E Test Architecture**

### **Test Infrastructure**
```
__tests__/e2e/               # Jest + Puppeteer E2E tests
├── municipio-bairro-*.js    # Municipio/Bairro display tests
├── AddressChangeAndSpeech.js # Address updates + speech
├── CompleteGeolocationWorkflow.js # Full workflow
└── helpers/
    └── setupPageWithMocks.js # Shared mock setup (if extracted)

tests/e2e/                   # Python + Playwright E2E tests
├── test_*.py                # Python-based browser tests
└── README.md                # Python E2E documentation
```

**Dual Toolchain Rationale**:
- **Jest + Puppeteer**: Fast, integrated with unit tests, Node.js ecosystem
- **Python + Playwright**: Better cross-browser support, Python toolchain

---

## 🔧 **Critical Mock Setup Patterns**

### **Pattern #1: Geolocation Mock Timing (CRITICAL)**

❌ **WRONG** (will fail silently):
```javascript
test('should get location', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:9000/src/index.html');
    
    // ❌ TOO LATE - page already loaded
    await page.setGeolocation({ latitude: -23.55, longitude: -46.63 });
    await page.overridePermissions('http://localhost:9000', ['geolocation']);
});
```

✅ **CORRECT** (MUST be before navigation):
```javascript
test('should get location', async () => {
    const page = await browser.newPage();
    
    // ✅ Set permissions BEFORE navigation
    await page.overridePermissions('http://localhost:9000', ['geolocation']);
    await page.setGeolocation({ latitude: -23.55, longitude: -46.63 });
    
    // Now navigate
    await page.goto('http://localhost:9000/src/index.html');
});
```

**Why**: Puppeteer browser permissions are checked at page load time. Setting after navigation is too late.

---

### **Pattern #2: API Request Interception**

✅ **Complete API Mock Template**:
```javascript
async function setupPageWithMocks(browser, coords) {
    const page = await browser.newPage();
    
    // 1. Enable request interception
    await page.setRequestInterception(true);
    
    // 2. Mock API responses
    page.on('request', (request) => {
        const url = request.url();
        
        if (url.includes('nominatim.openstreetmap.org/reverse')) {
            // ✅ MUST include CORS headers
            request.respond({
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    address: {
                        suburb: 'Jardim Paulista',
                        city: 'São Paulo',
                        state: 'São Paulo'
                    }
                })
            });
        } else if (url.includes('servicodados.ibge.gov.br')) {
            request.respond({
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([{ nome: 'São Paulo' }])
            });
        } else {
            request.continue(); // Allow other requests
        }
    });
    
    // 3. Set geolocation (BEFORE goto)
    await page.overridePermissions('http://localhost:9000', ['geolocation']);
    await page.setGeolocation({ 
        latitude: coords.lat, 
        longitude: coords.lng 
    });
    
    // 4. Navigate
    await page.goto('http://localhost:9000/src/index.html', {
        waitUntil: 'networkidle2'
    });
    
    return page;
}
```

**Critical Details**:
- ✅ `setRequestInterception(true)` MUST come first
- ✅ CORS headers required or fetch fails silently
- ✅ `Content-Type` header prevents parse errors
- ✅ `request.continue()` for non-mocked requests

---

### **Pattern #3: Async Element Waiting**

❌ **WRONG** (race condition):
```javascript
await page.click('#location-button');
const text = await page.$eval('#location-display', el => el.textContent);
// ❌ May read before update completes
```

✅ **CORRECT** (wait for condition):
```javascript
await page.click('#location-button');

// Wait for element to appear/update
await page.waitForSelector('#location-display', { visible: true });

// Or wait for specific content
await page.waitForFunction(
    () => document.querySelector('#bairro-display')?.textContent.includes('Jardim'),
    { timeout: 5000 }
);

// Then read
const text = await page.$eval('#bairro-display', el => el.textContent);
```

**Alternatives**:
```javascript
// Option 1: waitForFunction with predicate
await page.waitForFunction(
    selector => document.querySelector(selector)?.textContent !== '',
    {}, '#municipio-display'
);

// Option 2: waitForSelector + custom attribute
await page.waitForSelector('[data-loaded="true"]');

// Option 3: waitForNetworkIdle (less reliable)
await page.waitForNetworkIdle({ idleTime: 500 });
```

---

## 🚀 **Complete Test Template**

```javascript
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

describe('E2E: Feature Name', () => {
    let browser;
    let server;
    const PORT = 9000;
    
    beforeAll(async () => {
        // 1. Start HTTP server
        server = http.createServer((req, res) => {
            const filePath = path.join(process.cwd(), req.url);
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Not Found');
                } else {
                    res.writeHead(200);
                    res.end(data);
                }
            });
        });
        
        await new Promise((resolve) => {
            server.listen(PORT, () => resolve());
        });
        
        // 2. Launch browser
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    });
    
    afterAll(async () => {
        // 3. Cleanup (CRITICAL for preventing worker hangs)
        if (browser) await browser.close();
        if (server) {
            await new Promise(resolve => server.close(resolve));
        }
    });
    
    test('should do something', async () => {
        const page = await browser.newPage();
        
        try {
            // Setup mocks BEFORE navigation
            await page.overridePermissions(`http://localhost:${PORT}`, ['geolocation']);
            await page.setGeolocation({ latitude: -23.55, longitude: -46.63 });
            
            await page.setRequestInterception(true);
            page.on('request', request => {
                // Mock API calls
                if (request.url().includes('nominatim')) {
                    request.respond({
                        status: 200,
                        headers: { 
                            'Access-Control-Allow-Origin': '*',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ /* data */ })
                    });
                } else {
                    request.continue();
                }
            });
            
            // Navigate
            await page.goto(`http://localhost:${PORT}/src/index.html`, {
                waitUntil: 'networkidle2',
                timeout: 5000
            });
            
            // Interact with page
            await page.click('#button-id');
            
            // Wait for results
            await page.waitForFunction(
                () => document.querySelector('#result')?.textContent !== '',
                { timeout: 3000 }
            );
            
            // Assert
            const result = await page.$eval('#result', el => el.textContent);
            expect(result).toContain('Expected Text');
            
        } finally {
            // Always close page
            await page.close();
        }
    });
});
```

---

## ⚠️ **Common Pitfalls**

### **1. Missing CORS Headers**
```javascript
// ❌ WRONG - will fail silently
request.respond({
    status: 200,
    body: JSON.stringify(data)
});

// ✅ CORRECT
request.respond({
    status: 200,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
});
```

### **2. Race Conditions**
```javascript
// ❌ WRONG
await page.click('#button');
const text = await page.$eval('#result', el => el.textContent);

// ✅ CORRECT
await page.click('#button');
await page.waitForFunction(() => 
    document.querySelector('#result')?.textContent !== ''
);
const text = await page.$eval('#result', el => el.textContent);
```

### **3. Resource Leaks**
```javascript
// ❌ WRONG - will cause worker timeout
afterAll(async () => {
    await browser.close();
    // ❌ Forgot to close server
});

// ✅ CORRECT
afterAll(async () => {
    if (browser) await browser.close();
    if (server) {
        await new Promise(resolve => server.close(resolve));
    }
});
```

### **4. ESM Compatibility**
```javascript
// ❌ WRONG (CommonJS in ESM project)
const puppeteer = require('puppeteer');
jest.setTimeout(30000);

// ✅ CORRECT (ESM syntax)
import puppeteer from 'puppeteer';
// Use beforeAll/afterAll for timeouts, not jest.setTimeout()
```

---

## 🔍 **Debugging E2E Tests**

### **Enable Verbose Logging**
```javascript
beforeAll(async () => {
    browser = await puppeteer.launch({
        headless: false,  // See browser
        devtools: true,   // Open DevTools
        slowMo: 250       // Slow down actions
    });
});
```

### **Screenshot on Failure**
```javascript
test('should work', async () => {
    try {
        // test code
    } catch (error) {
        await page.screenshot({ path: 'failure.png', fullPage: true });
        throw error;
    }
});
```

### **Console Output**
```javascript
page.on('console', msg => {
    console.log('PAGE LOG:', msg.text());
});

page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
});
```

### **Network Monitoring**
```javascript
page.on('request', req => {
    console.log('→', req.method(), req.url());
});

page.on('response', res => {
    console.log('←', res.status(), res.url());
});
```

---

## 📋 **Pre-Test Checklist**

Before writing E2E tests:

- [ ] Is HTTP server running? (`python3 -m http.server 9000`)
- [ ] Are mocks set BEFORE `page.goto()`?
- [ ] Do mock responses include CORS headers?
- [ ] Are async operations awaited with proper timeouts?
- [ ] Is cleanup implemented in `afterAll()`?
- [ ] Are browser/server instances closed properly?
- [ ] Does test work in both headless and headed modes?

---

## 🎓 **Lessons Learned**

### **From municipio-bairro E2E Tests**
1. ✅ Puppeteer permissions MUST be set before navigation
2. ✅ API mocks MUST include CORS headers
3. ✅ Use `waitForFunction()` for dynamic content
4. ✅ ESM syntax required (`import`, not `require`)
5. ⚠️ Some tests revealed production bugs (HTMLAddressDisplayer wiring)

### **From Coverage Campaign**
6. ✅ E2E tests catch integration issues unit tests miss
7. ✅ Mock timing is critical (race conditions are common)
8. ✅ Proper cleanup prevents worker timeout warnings
9. ⚠️ E2E tests are 10-100x slower than unit tests

---

## 📝 **Related Documentation**

- `docs/testing/COVERAGE_IMPROVEMENT_COMPLETE.md` - Coverage campaign summary
- `tests/e2e/README.md` - Python/Playwright E2E tests
- `.github/copilot-instructions.md` - E2E infrastructure overview

---

**Status**: ✅ **Patterns Documented**  
**Next**: Apply patterns to remaining E2E tests

