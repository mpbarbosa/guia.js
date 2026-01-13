/**
 * Chrome geolocation test using Puppeteer
 * 
 * Tests coordinate display for Milho Verde, Serro, MG
 * Coordinates: -18.4696091, -43.4953982
 */

import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function for delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test configuration
const TEST_LATITUDE = -18.4696091;
const TEST_LONGITUDE = -43.4953982;
const TEST_ACCURACY = 100;
const HTTP_PORT = 9999;

// Start a simple HTTP server
function startHttpServer(rootDir) {
    const server = http.createServer((req, res) => {
        let filePath = path.join(rootDir, req.url === '/' ? 'index.html' : req.url);
        
        // Security: prevent directory traversal
        if (!filePath.startsWith(rootDir)) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }
        
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            
            // Set content type based on extension
            const ext = path.extname(filePath);
            const contentTypes = {
                '.html': 'text/html',
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg'
            };
            
            res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
            res.end(data);
        });
    });
    
    server.listen(HTTP_PORT);
    return server;
}

async function testChromeGeolocation() {
    console.log('🚀 Starting Chrome geolocation test with Puppeteer...');
    
    let browser;
    let server;
    let passed = true;
    
    try {
        // Start HTTP server
        const testDir = __dirname;
        const repoRoot = path.join(testDir, '..', '..');
        const srcDir = path.join(repoRoot, 'src');
        
        server = startHttpServer(srcDir);
        console.log(`✅ HTTP server started on port ${HTTP_PORT}`);
        await sleep(1000); // Give server time to start
        
        // Launch browser
        browser = await puppeteer.launch({
            headless: false, // Set to true for CI/CD
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });
        
        console.log('✅ Browser launched');
        
        const page = await browser.newPage();
        
        // Capture console logs from the page
        page.on('console', msg => console.log('🖥️  PAGE:', msg.text()));
        page.on('pageerror', error => console.error('🚨 PAGE ERROR:', error.message));
        
        // Set viewport
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Grant geolocation permission
        const context = browser.defaultBrowserContext();
        await context.overridePermissions(`http://localhost:${HTTP_PORT}`, ['geolocation']);
        
        // Set geolocation coordinates using CDP
        const client = await page.target().createCDPSession();
        await client.send('Emulation.setGeolocationOverride', {
            latitude: TEST_LATITUDE,
            longitude: TEST_LONGITUDE,
            accuracy: TEST_ACCURACY
        });
        
        console.log(`✅ Geolocation override set: ${TEST_LATITUDE}, ${TEST_LONGITUDE}`);
        
        // Navigate to index.html via HTTP
        const indexUrl = `http://localhost:${HTTP_PORT}/index.html`;
        
        console.log(`📄 Loading: ${indexUrl}`);
        await page.goto(indexUrl, { waitUntil: 'networkidle0' });
        
        console.log('✅ Page loaded');
        
        // Wait for app initialization
        await sleep(3000);
        
        // Check if continuous tracking toggle exists
        const hasToggle = await page.evaluate(() => {
            return !!document.getElementById('continuous-tracking-toggle');
        });
        
        console.log(`Toggle present: ${hasToggle}`);
        
        // Enable continuous tracking if available
        if (hasToggle) {
            await page.evaluate(() => {
                const toggle = document.getElementById('continuous-tracking-toggle');
                if (toggle && !toggle.checked) {
                    console.log('[TEST] Enabling continuous tracking');
                    toggle.checked = true;
                    toggle.dispatchEvent(new Event('change'));
                }
            });
            console.log('✅ Continuous tracking enabled');
        }
        
        // Also manually trigger geolocation request with promise
        const geoResult = await page.evaluate(() => {
            return new Promise((resolve) => {
                console.log('[TEST] Manually calling navigator.geolocation.getCurrentPosition');
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        console.log('[TEST] Geolocation success:', position.coords.latitude, position.coords.longitude);
                        resolve({
                            success: true,
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        });
                    },
                    (error) => {
                        console.log('[TEST] Geolocation error:', error.message, error.code);
                        resolve({
                            success: false,
                            error: error.message,
                            code: error.code
                        });
                    },
                    { timeout: 5000 }
                );
            });
        });
        
        console.log('📍 Geolocation API result:', JSON.stringify(geoResult, null, 2));
        
        // Wait for geolocation to process
        console.log('⏳ Waiting for coordinates to appear...');
        await sleep(8000); // Increased wait time
        
        // Debug: Check what's in the page
        const debugInfo = await page.evaluate(() => {
            return {
                hasNavigator: typeof navigator !== 'undefined',
                hasGeolocation: !!navigator.geolocation,
                locationResultHTML: document.getElementById('locationResult')?.innerHTML || 'N/A',
                appState: typeof window.GuiaApp !== 'undefined' ? 'defined' : 'undefined',
                toggleChecked: document.getElementById('continuous-tracking-toggle')?.checked
            };
        });
        console.log('🔍 Debug info:', JSON.stringify(debugInfo, null, 2));
        
        // Extract coordinates from DOM
        const result = await page.evaluate(() => {
            const locationResult = document.getElementById('locationResult');
            if (!locationResult) {
                return { found: false, error: 'locationResult element not found' };
            }
            
            const text = locationResult.textContent;
            
            // Try to find coordinates in the text
            const latMatch = text.match(/Latitude[:\s]+([-\d.]+)/i);
            const lonMatch = text.match(/Longitude[:\s]+([-\d.]+)/i);
            
            if (latMatch && lonMatch) {
                return {
                    found: true,
                    latitude: parseFloat(latMatch[1]),
                    longitude: parseFloat(lonMatch[1]),
                    text: text.substring(0, 200)
                };
            }
            
            return {
                found: false,
                text: text.substring(0, 200),
                error: 'Coordinates not found in text'
            };
        });
        
        console.log('\n📊 Test Results:');
        console.log('================');
        
        if (result.found) {
            console.log(`✅ Coordinates found in DOM`);
            console.log(`   Latitude:  ${result.latitude} (expected: ${TEST_LATITUDE})`);
            console.log(`   Longitude: ${result.longitude} (expected: ${TEST_LONGITUDE})`);
            
            // Validate coordinates
            const latDiff = Math.abs(result.latitude - TEST_LATITUDE);
            const lonDiff = Math.abs(result.longitude - TEST_LONGITUDE);
            
            if (latDiff < 0.00001) {
                console.log(`✅ Latitude matches (diff: ${latDiff.toFixed(7)})`);
            } else {
                console.log(`❌ Latitude mismatch (diff: ${latDiff.toFixed(7)})`);
                passed = false;
            }
            
            if (lonDiff < 0.00001) {
                console.log(`✅ Longitude matches (diff: ${lonDiff.toFixed(7)})`);
            } else {
                console.log(`❌ Longitude mismatch (diff: ${lonDiff.toFixed(7)})`);
                passed = false;
            }
            
        } else {
            console.log(`❌ Coordinates not found in DOM`);
            console.log(`   Error: ${result.error}`);
            console.log(`   Text: ${result.text}`);
            passed = false;
        }
        
        // Take a screenshot for debugging
        const screenshotPath = path.join(testDir, 'test_reports', 'chrome_puppeteer_screenshot.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`\n📸 Screenshot saved: ${screenshotPath}`);
        
    } catch (error) {
        console.error('❌ Test failed with error:', error);
        passed = false;
    } finally {
        if (browser) {
            await browser.close();
            console.log('\n🔒 Browser closed');
        }
        if (server) {
            server.close();
            console.log('🔒 HTTP server stopped');
        }
    }
    
    console.log('\n' + '='.repeat(50));
    if (passed) {
        console.log('✅ TEST PASSED');
        process.exit(0);
    } else {
        console.log('❌ TEST FAILED');
        process.exit(1);
    }
}

// Run the test
testChromeGeolocation().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
