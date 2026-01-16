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

    test('should display municipio and bairro after geolocation', async () => {
        page = await browser.newPage();
        
        // Enable console logging for debugging
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        
        // Grant geolocation permission BEFORE navigation
        const context = browser.defaultBrowserContext();
        await context.overridePermissions(`http://localhost:${PORT}`, ['geolocation']);
        
        // Set geolocation BEFORE navigation
        await page.setGeolocation({
            latitude: TEST_COORD.lat,
            longitude: TEST_COORD.lon,
            accuracy: 10
        });
        
        // Intercept Nominatim API calls BEFORE navigation
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (request.url().includes('nominatim.openstreetmap.org/reverse')) {
                console.log('Intercepting Nominatim API call');
                request.respond({
                    status: 200,
                    contentType: 'application/json',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(MOCK_API)
                });
            } else {
                request.continue();
            }
        });
        
        // NOW navigate - use domcontentloaded which is faster and more reliable
        await page.goto(`http://localhost:${PORT}/src/index.html`, {
            waitUntil: 'domcontentloaded',
            timeout: 10000
        });
        
        // Wait for municipio to update (geolocation should trigger automatically)
        await page.waitForFunction(
            () => {
                const el = document.getElementById('municipio-value');
                const text = el ? el.textContent.trim() : '';
                console.log('municipio-value:', text);
                return text && text !== '—' && text.length > 0;
            },
            { timeout: 15000, polling: 500 }
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
