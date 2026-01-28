'use strict';

/**
 * E2E Test: Metropolitan Region Display Verification
 * 
 * Tests the display of "Região Metropolitana" information in the Municipality Card
 * when geolocation is in a metropolitan area.
 * 
 * Test Scenarios:
 * 1. Recife - Metropolitan area (Região Metropolitana do Recife)
 * 2. São Paulo - Metropolitan area (Região Metropolitana de São Paulo)
 * 3. Arapiraca - Non-metropolitan municipality (no region)
 * 4. Visual hierarchy verification
 * 
 * @module __tests__/e2e/metropolitan-region-display.e2e.test
 * @since 0.8.7-alpha
 * @author Marcelo Pereira Barbosa
 */

import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test coordinates and mock data
const TEST_SCENARIOS = {
    recife: {
        coord: { lat: -8.047562, lon: -34.877 },
        mock: {
            display_name: "Avenida Norte Miguel Arraes de Alencar, Santo Amaro, Recife, Região Metropolitana do Recife, Pernambuco, Região Nordeste, 50040-200, Brasil",
            address: {
                road: "Avenida Norte Miguel Arraes de Alencar",
                suburb: "Santo Amaro",
                city: "Recife",
                county: "Região Metropolitana do Recife",
                state: "Pernambuco",
                "ISO3166-2-lvl4": "BR-PE",
                region: "Região Nordeste",
                postcode: "50040-200",
                country: "Brasil",
                country_code: "br"
            }
        }
    },
    saoPaulo: {
        coord: { lat: -23.550520, lon: -46.633309 },
        mock: {
            display_name: "Rua Santa Teresa, Glicério, São Paulo, Região Metropolitana de São Paulo, São Paulo, Região Sudeste, 01016-020, Brasil",
            address: {
                road: "Rua Santa Teresa",
                suburb: "Glicério",
                city: "São Paulo",
                county: "Região Metropolitana de São Paulo",
                state: "São Paulo",
                "ISO3166-2-lvl4": "BR-SP",
                region: "Região Sudeste",
                postcode: "01016-020",
                country: "Brasil",
                country_code: "br"
            }
        }
    },
    arapiraca: {
        coord: { lat: -9.747887, lon: -36.664797 },
        mock: {
            display_name: "Centro, Arapiraca, Alagoas, Região Nordeste, Brasil",
            address: {
                suburb: "Centro",
                city: "Arapiraca",
                state: "Alagoas",
                "ISO3166-2-lvl4": "BR-AL",
                region: "Região Nordeste",
                country: "Brasil",
                country_code: "br"
                // No county field - non-metropolitan
            }
        }
    }
};

describe('E2E: Metropolitan Region Display', () => {
    let browser, server;
    const PORT = 9878;

    beforeAll(async () => {
        // Start simple HTTP server
        const root = path.join(__dirname, '../..');
        server = http.createServer((req, res) => {
            const file = path.join(root, req.url === '/' ? '/src/index.html' : req.url);
            const ext = path.extname(file);
            const types = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.json': 'application/json'
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

    test('should display Região Metropolitana do Recife', async () => {
        const page = await browser.newPage();
        
        try {
            // Enable console logging
            page.on('console', msg => console.log('PAGE LOG:', msg.text()));
            page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
            
            // Grant geolocation permission
            const context = browser.defaultBrowserContext();
            await context.overridePermissions(`http://localhost:${PORT}`, ['geolocation']);
            
            // Set geolocation
            await page.setGeolocation({
                latitude: TEST_SCENARIOS.recife.coord.lat,
                longitude: TEST_SCENARIOS.recife.coord.lon,
                accuracy: 10
            });
            
            // Intercept Nominatim API calls
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (request.url().includes('nominatim.openstreetmap.org/reverse')) {
                    console.log('Intercepting Nominatim API call for Recife');
                    request.respond({
                        status: 200,
                        contentType: 'application/json',
                        headers: { 'Access-Control-Allow-Origin': '*' },
                        body: JSON.stringify(TEST_SCENARIOS.recife.mock)
                    });
                } else {
                    request.continue();
                }
            });
            
            // Navigate to page - geolocation triggers automatically
            await page.goto(`http://localhost:${PORT}/src/index.html`, {
                waitUntil: 'domcontentloaded',
                timeout: 10000
            });
            
            // Wait for municipality card to update (geolocation triggers automatically)
            await page.waitForFunction(
                () => {
                    const el = document.getElementById('municipio-value');
                    const text = el ? el.textContent.trim() : '';
                    console.log('municipio-value:', text);
                    return text && text !== '—' && text.length > 0;
                },
                { timeout: 15000, polling: 500 }
            );
            
            // Verify metropolitan region is displayed
            const regionText = await page.$eval('#regiao-metropolitana-value', el => el.textContent);
            expect(regionText).toBe('Região Metropolitana do Recife');
            
            // Verify municipality is displayed
            const municipioText = await page.$eval('#municipio-value', el => el.textContent);
            expect(municipioText).toBe('Recife, PE');
            
            // Verify bairro is displayed
            const bairroText = await page.$eval('#bairro-value', el => el.textContent);
            expect(bairroText).toBe('Santo Amaro');
            
            console.log('✅ Recife metropolitan region displayed correctly');
        } finally {
            await page.close();
        }
    }, 30000);

    test('should display Região Metropolitana de São Paulo', async () => {
        const page = await browser.newPage();
        
        try {
            page.on('console', msg => console.log('PAGE LOG:', msg.text()));
            page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
            
            const context = browser.defaultBrowserContext();
            await context.overridePermissions(`http://localhost:${PORT}`, ['geolocation']);
            
            await page.setGeolocation({
                latitude: TEST_SCENARIOS.saoPaulo.coord.lat,
                longitude: TEST_SCENARIOS.saoPaulo.coord.lon,
                accuracy: 10
            });
            
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (request.url().includes('nominatim.openstreetmap.org/reverse')) {
                    console.log('Intercepting Nominatim API call for São Paulo');
                    request.respond({
                        status: 200,
                        contentType: 'application/json',
                        headers: { 'Access-Control-Allow-Origin': '*' },
                        body: JSON.stringify(TEST_SCENARIOS.saoPaulo.mock)
                    });
                } else {
                    request.continue();
                }
            });
            
            await page.goto(`http://localhost:${PORT}/src/index.html`, {
                waitUntil: 'domcontentloaded',
                timeout: 10000
            });
            
            await page.waitForFunction(
                () => {
                    const el = document.getElementById('municipio-value');
                    const text = el ? el.textContent.trim() : '';
                    return text && text !== '—' && text.length > 0;
                },
                { timeout: 15000, polling: 500 }
            );
            
            const regionText = await page.$eval('#regiao-metropolitana-value', el => el.textContent);
            expect(regionText).toBe('Região Metropolitana de São Paulo');
            
            const municipioText = await page.$eval('#municipio-value', el => el.textContent);
            expect(municipioText).toBe('São Paulo, SP');
            
            const bairroText = await page.$eval('#bairro-value', el => el.textContent);
            expect(bairroText).toBe('Glicério');
            
            console.log('✅ São Paulo metropolitan region displayed correctly');
        } finally {
            await page.close();
        }
    }, 30000);

    test('should NOT display region for non-metropolitan municipality', async () => {
        const page = await browser.newPage();
        
        try {
            page.on('console', msg => console.log('PAGE LOG:', msg.text()));
            page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
            
            const context = browser.defaultBrowserContext();
            await context.overridePermissions(`http://localhost:${PORT}`, ['geolocation']);
            
            await page.setGeolocation({
                latitude: TEST_SCENARIOS.arapiraca.coord.lat,
                longitude: TEST_SCENARIOS.arapiraca.coord.lon,
                accuracy: 10
            });
            
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (request.url().includes('nominatim.openstreetmap.org/reverse')) {
                    console.log('Intercepting Nominatim API call for Arapiraca');
                    request.respond({
                        status: 200,
                        contentType: 'application/json',
                        headers: { 'Access-Control-Allow-Origin': '*' },
                        body: JSON.stringify(TEST_SCENARIOS.arapiraca.mock)
                    });
                } else {
                    request.continue();
                }
            });
            
            await page.goto(`http://localhost:${PORT}/src/index.html`, {
                waitUntil: 'domcontentloaded',
                timeout: 10000
            });
            
            await page.waitForFunction(
                () => {
                    const el = document.getElementById('municipio-value');
                    const text = el ? el.textContent.trim() : '';
                    return text && text !== '—' && text.length > 0;
                },
                { timeout: 15000, polling: 500 }
            );
            
            // Verify NO metropolitan region is displayed
            const regionText = await page.$eval('#regiao-metropolitana-value', el => el.textContent);
            expect(regionText).toBe('');
            
            // Verify municipality is still displayed correctly
            const municipioText = await page.$eval('#municipio-value', el => el.textContent);
            expect(municipioText).toBe('Arapiraca, AL');
            
            const bairroText = await page.$eval('#bairro-value', el => el.textContent);
            expect(bairroText).toBe('Centro');
            
            console.log('✅ Non-metropolitan municipality displayed correctly (no region)');
        } finally {
            await page.close();
        }
    }, 30000);

    test('should have correct visual hierarchy and styling', async () => {
        const page = await browser.newPage();
        
        try {
            page.on('console', msg => console.log('PAGE LOG:', msg.text()));
            page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
            
            const context = browser.defaultBrowserContext();
            await context.overridePermissions(`http://localhost:${PORT}`, ['geolocation']);
            
            await page.setGeolocation({
                latitude: TEST_SCENARIOS.recife.coord.lat,
                longitude: TEST_SCENARIOS.recife.coord.lon,
                accuracy: 10
            });
            
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (request.url().includes('nominatim.openstreetmap.org/reverse')) {
                    request.respond({
                        status: 200,
                        contentType: 'application/json',
                        headers: { 'Access-Control-Allow-Origin': '*' },
                        body: JSON.stringify(TEST_SCENARIOS.recife.mock)
                    });
                } else {
                    request.continue();
                }
            });
            
            await page.goto(`http://localhost:${PORT}/src/index.html`, {
                waitUntil: 'domcontentloaded',
                timeout: 10000
            });
            
            await page.waitForFunction(
                () => {
                    const el = document.getElementById('municipio-value');
                    const text = el ? el.textContent.trim() : '';
                    return text && text !== '—' && text.length > 0;
                },
                { timeout: 15000, polling: 500 }
            );
            
            // Verify element order: label → region → municipality
            const cardHTML = await page.$eval('.highlight-card', card => {
                const children = Array.from(card.children);
                return children.map(child => ({
                    id: child.id,
                    class: child.className
                }));
            });
            
            const labelIndex = cardHTML.findIndex(el => el.id === 'municipio-label');
            const regionIndex = cardHTML.findIndex(el => el.id === 'regiao-metropolitana-value');
            const municipioIndex = cardHTML.findIndex(el => el.id === 'municipio-value');
            
            expect(regionIndex).toBeGreaterThan(labelIndex);
            expect(municipioIndex).toBeGreaterThan(regionIndex);
            
            // Verify region has correct CSS class
            const regionClass = await page.$eval('#regiao-metropolitana-value', el => el.className);
            expect(regionClass).toContain('metropolitan-region-value');
            
            // Verify font size (region smaller than municipality)
            const regionFontSize = await page.$eval('#regiao-metropolitana-value', el => {
                return window.getComputedStyle(el).fontSize;
            });
            const municipioFontSize = await page.$eval('#municipio-value', el => {
                return window.getComputedStyle(el).fontSize;
            });
            
            const regionSize = parseFloat(regionFontSize);
            const municipioSize = parseFloat(municipioFontSize);
            
            expect(regionSize).toBeLessThan(municipioSize);
            
            // Verify opacity (region lighter than municipality)
            const regionOpacity = await page.$eval('#regiao-metropolitana-value', el => {
                return window.getComputedStyle(el).opacity;
            });
            
            expect(parseFloat(regionOpacity)).toBeLessThanOrEqual(0.7);
            
            console.log('✅ Visual hierarchy verified:', {
                regionFontSize,
                municipioFontSize,
                regionOpacity,
                elementOrder: 'label < region < municipality'
            });
        } finally {
            await page.close();
        }
    }, 30000);
});
