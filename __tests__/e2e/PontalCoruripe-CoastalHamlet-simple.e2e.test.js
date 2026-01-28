'use strict';

/**
 * E2E Test: Pontal do Coruripe - Hamlet with Dynamic Location Card
 * 
 * Tests handling of hamlet (povoado) addresses using the dynamic location-type card.
 * The card label switches between "Distrito" and "Bairro" based on location type.
 * 
 * Real-world location: Rua da Praia, Pontal do Coruripe, Coruripe, Alagoas, Brasil
 * Coordinates: -10.1594479, -36.1354556 (coastal hamlet in Alagoas state)
 * 
 * Geographic Hierarchy:
 * - Coruripe = Município (municipality) - MISSING FROM NOMINATIM DATA
 * - Pontal do Coruripe = Hamlet/Povoado within Coruripe (distrito-level subdivision)
 * - No bairro (neighborhood) subdivision exists
 * 
 * Expected Display Behavior:
 * - Município card: "—" (municipality data missing)
 * - Location-type card:
 *   - Label: "Distrito" (dynamically set based on location type)
 *   - Value: "Pontal do Coruripe" (hamlet extracted by address-parser.js)
 * 
 * Key characteristics tested:
 * - Dynamic card label changes from "Bairro" to "Distrito"
 * - Hamlet displays in distrito card when município is missing
 * - Portuguese character handling: "Pontal do Coruripe"
 * - Comparison with complete city data (Arapiraca with bairro)
 * 
 * @module __tests__/e2e/PontalCoruripe-CoastalHamlet-simple.e2e.test
 * @since 0.8.8-alpha
 * @author Marcelo Pereira Barbosa
 */

import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test coordinates: Pontal do Coruripe, AL, Brazil (coastal hamlet)
const PONTAL_COORD = { lat: -10.1594479, lon: -36.1354556 };

// Real Nominatim response for Pontal do Coruripe (hamlet with no bairro)
const PONTAL_MOCK_API = {
    place_id: 13731911,
    licence: "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
    osm_type: "way",
    osm_id: 169377494,
    lat: "-10.1594479",
    lon: "-36.1354556",
    class: "highway",
    type: "residential",
    place_rank: 26,
    importance: 0.05338622034027615,
    addresstype: "road",
    name: "Rua da Praia",
    display_name: "Rua da Praia, Pontal do Coruripe, Alagoas, Região Nordeste, Brasil",
    address: {
        road: "Rua da Praia",
        hamlet: "Pontal do Coruripe",
        state: "Alagoas",
        "ISO3166-2-lvl4": "BR-AL",
        region: "Região Nordeste",
        country: "Brasil",
        country_code: "br"
    },
    boundingbox: [
        "-10.1597767",
        "-10.1578791",
        "-36.1364781",
        "-36.1353974"
    ]
};

describe('E2E: Pontal do Coruripe - Hamlet in Distrito Card', () => {
    let browser, page, server;
    const PORT = 9882;

    beforeAll(async () => {
        // Start HTTP server
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

    test('should display "Pontal do Coruripe" in distrito card', async () => {
        page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => console.log('PAGE:', msg.text()));
        page.on('pageerror', error => console.log('ERROR:', error.message));
        
        // Grant geolocation permission
        const context = browser.defaultBrowserContext();
        await context.overridePermissions(`http://localhost:${PORT}`, ['geolocation']);
        
        // Set geolocation for Pontal do Coruripe
        await page.setGeolocation({
            latitude: PONTAL_COORD.lat,
            longitude: PONTAL_COORD.lon,
            accuracy: 10
        });
        
        // Intercept Nominatim API
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (request.url().includes('nominatim.openstreetmap.org/reverse')) {
                console.log('Intercepting Nominatim for Pontal do Coruripe');
                request.respond({
                    status: 200,
                    contentType: 'application/json',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(PONTAL_MOCK_API)
                });
            } else {
                request.continue();
            }
        });
        
        // Navigate to application
        await page.goto(`http://localhost:${PORT}/src/index.html`, {
            waitUntil: 'domcontentloaded',
            timeout: 10000
        });
        
        // Log all elements with IDs containing location/municipio/bairro
        await page.evaluate(() => {
            const els = Array.from(document.querySelectorAll('[id]'))
                .filter(el => el.id.includes('location') || el.id.includes('municipio') || el.id.includes('bairro'))
                .map(el => ({ id: el.id, text: el.textContent.trim().substring(0, 30) }));
            console.log('Available elements:', JSON.stringify(els));
        });
        
        // Wait for location-type card to update with distrito
        await page.waitForFunction(
            () => {
                const el = document.getElementById('location-type-value');
                const text = el ? el.textContent.trim() : '';
                console.log('location-type-value:', text);
                if (!el) console.log('location-type-value element not found!');
                return text && text !== '—' && text.includes('Pontal');
            },
            { timeout: 15000, polling: 500 }
        );

        // Get final values from all cards
        const municipio = await page.$eval('#municipio-value', el => el.textContent.trim());
        const distritoLabel = await page.$eval('#location-type-label', el => el.textContent.trim());
        const distrito = await page.$eval('#location-type-value', el => el.textContent.trim());

        console.log('Final values - Municipio:', municipio, 'Label:', distritoLabel, 'Distrito:', distrito);

        // Município is missing from incomplete data
        expect(municipio).toBe('—');
        
        // Distrito card label changes to "Distrito"
        expect(distritoLabel).toBe('Distrito');
        
        // Hamlet "Pontal do Coruripe" displays in distrito card
        expect(distrito).toBe('Pontal do Coruripe');

        await page.close();
    }, 45000);

    test('should display hamlet with Portuguese characters in distrito card', async () => {
        page = await browser.newPage();
        
        page.on('console', msg => console.log('PAGE:', msg.text()));
        
        const context = browser.defaultBrowserContext();
        await context.overridePermissions(`http://localhost:${PORT}`, ['geolocation']);
        
        await page.setGeolocation({
            latitude: PONTAL_COORD.lat,
            longitude: PONTAL_COORD.lon,
            accuracy: 10
        });
        
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (request.url().includes('nominatim.openstreetmap.org/reverse')) {
                request.respond({
                    status: 200,
                    contentType: 'application/json',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(PONTAL_MOCK_API)
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
                const el = document.getElementById('location-type-value');
                return el && el.textContent.includes('Pontal');
            },
            { timeout: 15000, polling: 500 }
        );

        const distrito = await page.$eval('#location-type-value', el => el.textContent.trim());

        // Verify Portuguese characters preserved in hamlet name
        expect(distrito).toBe('Pontal do Coruripe');
        expect(distrito).not.toContain('&');
        expect(distrito).not.toContain('&#');

        await page.close();
    }, 45000);

    test('should show distrito card with hamlet when municipality is incomplete', async () => {
        page = await browser.newPage();
        
        const context = browser.defaultBrowserContext();
        await context.overridePermissions(`http://localhost:${PORT}`, ['geolocation']);
        
        await page.setGeolocation({
            latitude: PONTAL_COORD.lat,
            longitude: PONTAL_COORD.lon,
            accuracy: 10
        });
        
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (request.url().includes('nominatim.openstreetmap.org/reverse')) {
                request.respond({
                    status: 200,
                    contentType: 'application/json',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(PONTAL_MOCK_API)
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
                const el = document.getElementById('location-type-value');
                return el && el.textContent.includes('Pontal');
            },
            { timeout: 15000, polling: 500 }
        );

        const municipio = await page.$eval('#municipio-value', el => el.textContent.trim());
        const distritoLabel = await page.$eval('#location-type-label', el => el.textContent.trim());
        const distrito = await page.$eval('#location-type-value', el => el.textContent.trim());

        // Incomplete data: município shows "—", but distrito shows hamlet
        expect(municipio).toBe('—');
        expect(distritoLabel).toBe('Distrito');
        expect(distrito).toBe('Pontal do Coruripe');

        await page.close();
    }, 45000);

    test('should differentiate incomplete hamlet data from complete city data', async () => {
        // Test 1: Pontal (hamlet with incomplete data - município missing)
        page = await browser.newPage();
        
        const context = browser.defaultBrowserContext();
        await context.overridePermissions(`http://localhost:${PORT}`, ['geolocation']);
        
        await page.setGeolocation({
            latitude: PONTAL_COORD.lat,
            longitude: PONTAL_COORD.lon,
            accuracy: 10
        });
        
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (request.url().includes('nominatim.openstreetmap.org/reverse')) {
                request.respond({
                    status: 200,
                    contentType: 'application/json',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(PONTAL_MOCK_API)
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
                const el = document.getElementById('location-type-value');
                return el && el.textContent.includes('Pontal');
            },
            { timeout: 15000, polling: 500 }
        );

        const hamletMunicipio = await page.$eval('#municipio-value', el => el.textContent.trim());
        const hamletLabel = await page.$eval('#location-type-label', el => el.textContent.trim());
        const hamletDistrito = await page.$eval('#location-type-value', el => el.textContent.trim());
        
        // Incomplete data: município "—", but distrito shows hamlet
        expect(hamletMunicipio).toBe('—');
        expect(hamletLabel).toBe('Distrito');
        expect(hamletDistrito).toBe('Pontal do Coruripe');

        await page.close();

        // Test 2: Regular city (Arapiraca with complete data)
        const page2 = await browser.newPage();
        
        await context.overridePermissions(`http://localhost:${PORT}`, ['geolocation']);
        
        await page2.setGeolocation({
            latitude: -9.747887,
            longitude: -36.664797,
            accuracy: 10
        });
        
        await page2.setRequestInterception(true);
        page2.on('request', (request) => {
            if (request.url().includes('nominatim.openstreetmap.org/reverse')) {
                request.respond({
                    status: 200,
                    contentType: 'application/json',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        display_name: "Centro, Arapiraca, AL, Brasil",
                        address: {
                            suburb: "Centro",
                            city: "Arapiraca",
                            state: "Alagoas",
                            "ISO3166-2-lvl4": "BR-AL"
                        }
                    })
                });
            } else {
                request.continue();
            }
        });
        
        await page2.goto(`http://localhost:${PORT}/src/index.html`, {
            waitUntil: 'domcontentloaded',
            timeout: 10000
        });
        
        await page2.waitForFunction(
            () => {
                const el = document.getElementById('location-type-value');
                const text = el ? el.textContent.trim() : '';
                return text && text !== '—' && text.includes('Centro');
            },
            { timeout: 15000, polling: 500 }
        );

        const cityMunicipio = await page2.$eval('#municipio-value', el => el.textContent.trim());
        const cityLabel = await page2.$eval('#location-type-label', el => el.textContent.trim());
        const cityBairro = await page2.$eval('#location-type-value', el => el.textContent.trim());
        
        // Complete data: município with state, card labeled as "Bairro" with actual bairro name
        expect(cityMunicipio).toBe('Arapiraca, AL');
        expect(cityLabel).toBe('Bairro');
        expect(cityBairro).toBe('Centro');

        await page2.close();
    }, 60000);
});
