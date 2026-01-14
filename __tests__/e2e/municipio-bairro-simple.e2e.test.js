'use strict';

/**
 * Simple E2E Test: Municipio and Bairro Display Verification
 * 
 * Simplified test to verify the bug fix for municipio/bairro display.
 * Tests only the core scenario with reduced complexity.
 * 
 * @module __tests__/e2e/municipio-bairro-simple.e2e.test
 * @since 0.7.1-alpha
 * @author Marcelo Pereira Barbosa
 */

import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test coordinates: Arapiraca, AL, Brazil
const TEST_COORD = { lat: -9.747887, lon: -36.664797 };

// Mock API response
const MOCK_API = {
    display_name: "Centro, Arapiraca, AL, Brasil",
    address: {
        suburb: "Centro",
        city: "Arapiraca",
        state: "Alagoas",
        "ISO3166-2-lvl4": "BR-AL"
    }
};

describe('E2E: Municipio/Bairro Display (Simple)', () => {
    let browser, page, server;
    const PORT = 9877;

    beforeAll(async () => {
        // Start simple server
        const root = path.join(__dirname, '../..');
        server = http.createServer((req, res) => {
            const file = path.join(root, req.url === '/' ? '/src/index.html' : req.url);
            const ext = path.extname(file);
            const types = {
                '.html': 'text/html', '.js': 'text/javascript',
                '.css': 'text/css', '.json': 'application/json'
            };
            
            fs.readFile(file, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Not found');
                } else {
                    res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
                    res.end(data);
                }
            });
        });

        await new Promise(resolve => server.listen(PORT, resolve));
        
        // Launch browser
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }, 30000);

    afterAll(async () => {
        if (browser) await browser.close();
        if (server) await new Promise(resolve => server.close(resolve));
    });

    test.skip('should display municipio and bairro after geolocation', async () => {
        page = await browser.newPage();
        
        // Enable console logging for debugging
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        
        // Navigate - use domcontentloaded which is faster and more reliable
        await page.goto(`http://localhost:${PORT}/src/index.html`, {
            waitUntil: 'domcontentloaded',
            timeout: 10000
        });

        // Wait a bit for the page to settle
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock geolocation and Nominatim API
        await page.evaluate((coords, mockResp) => {
            // Mock geolocation
            window.navigator.geolocation = {
                getCurrentPosition: (success) => {
                    setTimeout(() => success({
                        coords: { latitude: coords.lat, longitude: coords.lon, accuracy: 10 },
                        timestamp: Date.now()
                    }), 100);
                },
                watchPosition: (success) => {
                    setTimeout(() => success({
                        coords: { latitude: coords.lat, longitude: coords.lon, accuracy: 10 },
                        timestamp: Date.now()
                    }), 100);
                    return 1;
                },
                clearWatch: () => {}
            };

            // Mock fetch
            const originalFetch = window.fetch;
            window.fetch = function(url, ...args) {
                if (url.includes('nominatim.openstreetmap.org')) {
                    console.log('Intercepting Nominatim API call');
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(mockResp)
                    });
                }
                return originalFetch ? originalFetch(url, ...args) : fetch(url, ...args);
            };
        }, TEST_COORD, MOCK_API);

        // Wait for app to load - check for DOM elements
        try {
            await page.waitForSelector('#municipio-value', { timeout: 10000 });
            await page.waitForSelector('#bairro-value', { timeout: 10000 });
        } catch (error) {
            // Debug: print page content
            const content = await page.content();
            console.log('Page HTML (first 500 chars):', content.substring(0, 500));
            throw error;
        }

        // Check if AppState exists and trigger geolocation
        const hasAppState = await page.evaluate(() => {
            return typeof window.AppState !== 'undefined' && window.AppState.manager;
        });

        if (!hasAppState) {
            console.log('AppState not found, app may use different initialization');
            // Try to trigger via button click instead
            const buttonExists = await page.$('#findRestaurantsBtn');
            if (buttonExists) {
                console.log('Trying alternative: clicking geolocation trigger button');
            }
        } else {
            // Trigger geolocation
            await page.evaluate(() => {
                if (window.AppState && window.AppState.manager) {
                    window.AppState.manager.startTracking();
                }
            });
        }

        // Wait for municipio to update (with longer timeout)
        await page.waitForFunction(
            () => {
                const el = document.getElementById('municipio-value');
                const text = el ? el.textContent.trim() : '';
                console.log('municipio-value:', text);
                return text && text !== '—' && text.length > 0;
            },
            { timeout: 20000, polling: 1000 }
        );

        // Get values
        const municipio = await page.$eval('#municipio-value', el => el.textContent.trim());
        const bairro = await page.$eval('#bairro-value', el => el.textContent.trim());

        console.log('Final values - Municipio:', municipio, 'Bairro:', bairro);

        // Verify
        expect(municipio).toBe('Arapiraca');
        expect(bairro).toBe('Centro');

        await page.close();
    }, 40000);
});
