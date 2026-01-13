/**
 * Chrome geolocation test using Puppeteer (Fixed version)
 * Using page.setGeolocation() instead of CDP commands
 */

import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const TEST_LATITUDE = -18.4696091;
const TEST_LONGITUDE = -43.4953982;
const HTTP_PORT = 9999;

function startHttpServer(rootDir) {
    const server = http.createServer((req, res) => {
        let filePath = path.join(rootDir, req.url === '/' ? 'index.html' : req.url);
        
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
            
            const ext = path.extname(filePath);
            const contentTypes = {
                '.html': 'text/html',
                '.js': 'application/javascript',
                '.css': 'text/css'
            };
            
            res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
            res.end(data);
        });
    });
    
    server.listen(HTTP_PORT);
    return server;
}

async function test() {
    console.log('🚀 Starting Puppeteer geolocation test...');
    
    let browser, server;
    let passed = true;
    
    try {
        const srcDir = path.join(__dirname, '..', '..', 'src');
        server = startHttpServer(srcDir);
        console.log(`✅ HTTP server on port ${HTTP_PORT}`);
        await sleep(1000);
        
        browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        console.log('✅ Browser launched');
        
        const page = await browser.newPage();
        page.on('console', msg => console.log('PAGE:', msg.text()));
        
        // IMPORTANT: Set geolocation BEFORE navigating
        await page.setGeolocation({
            latitude: TEST_LATITUDE,
            longitude: TEST_LONGITUDE,
            accuracy: 100
        });
        console.log(`✅ Geolocation set: ${TEST_LATITUDE}, ${TEST_LONGITUDE}`);
        
        // Grant permission
        const context = browser.defaultBrowserContext();
        await context.overridePermissions(`http://localhost:${HTTP_PORT}`, ['geolocation']);
        
        await page.goto(`http://localhost:${HTTP_PORT}/index.html`, { waitUntil: 'networkidle0' });
        console.log('✅ Page loaded');
        
        await sleep(3000);
        
        // Test geolocation
        const geo = await page.evaluate(() => {
            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(
                    pos => resolve({ success: true, lat: pos.coords.latitude, lon: pos.coords.longitude }),
                    err => resolve({ success: false, error: err.message }),
                    { timeout: 5000 }
                );
            });
        });
        
        console.log('📍 Geolocation test:', JSON.stringify(geo, null, 2));
        
        if (geo.success) {
            console.log('✅ Geolocation working!');
            
            // Enable tracking
            await page.evaluate(() => {
                const toggle = document.getElementById('continuous-tracking-toggle');
                if (toggle && !toggle.checked) {
                    toggle.checked = true;
                    toggle.dispatchEvent(new Event('change'));
                }
            });
            
            await sleep(8000);
            
            const result = await page.evaluate(() => {
                const elem = document.getElementById('locationResult');
                const text = elem ? elem.textContent : '';
                const latMatch = text.match(/Latitude[:\s]+([-\d.]+)/i);
                const lonMatch = text.match(/Longitude[:\s]+([-\d.]+)/i);
                
                return latMatch && lonMatch ? {
                    found: true,
                    lat: parseFloat(latMatch[1]),
                    lon: parseFloat(lonMatch[1])
                } : { found: false, text: text.substring(0, 200) };
            });
            
            console.log('\n📊 Results:', JSON.stringify(result, null, 2));
            
            if (result.found) {
                const latDiff = Math.abs(result.lat - TEST_LATITUDE);
                const lonDiff = Math.abs(result.lon - TEST_LONGITUDE);
                
                if (latDiff < 0.00001 && lonDiff < 0.00001) {
                    console.log('✅ TEST PASSED');
                    passed = true;
                } else {
                    console.log(`❌ Coordinate mismatch`);
                    passed = false;
                }
            } else {
                console.log('❌ Coordinates not in DOM');
                passed = false;
            }
        } else {
            console.log('❌ Geolocation failed:', geo.error);
            passed = false;
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        passed = false;
    } finally {
        if (browser) await browser.close();
        if (server) server.close();
    }
    
    process.exit(passed ? 0 : 1);
}

test();
