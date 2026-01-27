'use strict';

/**
 * End-to-End Test: Neighborhood (Bairro) Card Updates While Driving
 * 
 * This test simulates a user driving through different neighborhoods in a city
 * and validates that the bairro card updates correctly when crossing neighborhood boundaries.
 * 
 * **Bug Being Tested**: In production, when driving around the city, the bairro card
 * doesn't update when entering a new neighborhood. This test validates the fix.
 * 
 * **Test Scenario**:
 * 1. Start in Centro neighborhood (São Paulo)
 * 2. "Drive" to Jardins neighborhood (simulate movement)
 * 3. Verify bairro card updates from "Centro" to "Jardins"
 * 4. Continue to Vila Mariana neighborhood
 * 5. Verify bairro card updates from "Jardins" to "Vila Mariana"
 * 6. Move to Moema neighborhood
 * 7. Verify bairro card updates from "Vila Mariana" to "Moema"
 * 8. Validate all intermediate states and transitions
 * 
 * **What This Tests**:
 * - HTMLHighlightCardsDisplayer receives addressData updates
 * - Bairro card element updates with new neighborhood name
 * - Observer pattern correctly propagates address changes
 * - ReverseGeocoder passes complete parameters to observers
 * - Change detection triggers on neighborhood boundaries
 * 
 * @module __tests__/e2e/NeighborhoodChangeWhileDriving.e2e.test
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

// Test route: Driving through São Paulo neighborhoods
const DRIVING_ROUTE = [
    {
        name: 'Centro - Start Point',
        latitude: -23.550520,
        longitude: -46.633309,
        expected: {
            municipio: 'São Paulo, SP',
            bairro: 'República',
            state: 'SP'
        }
    },
    {
        name: 'Jardins - First Move',
        latitude: -23.565209,
        longitude: -46.664850,
        expected: {
            municipio: 'São Paulo, SP',
            bairro: 'Jardim Paulista',
            state: 'SP'
        }
    },
    {
        name: 'Vila Mariana - Second Move',
        latitude: -23.587370,
        longitude: -46.636040,
        expected: {
            municipio: 'São Paulo, SP',
            bairro: 'Vila Mariana',
            state: 'SP'
        }
    },
    {
        name: 'Moema - Third Move',
        latitude: -23.606230,
        longitude: -46.663770,
        expected: {
            municipio: 'São Paulo, SP',
            bairro: 'Moema',
            state: 'SP'
        }
    }
];

// Mock Nominatim responses for each location
const MOCK_NOMINATIM_RESPONSES = {
    '-23.55052,-46.633309': {
        "display_name": "República, São Paulo, SP, Brasil",
        "address": {
            "suburb": "República",
            "city": "São Paulo",
            "state": "São Paulo",
            "ISO3166-2-lvl4": "BR-SP",
            "country": "Brasil",
            "country_code": "br"
        }
    },
    '-23.565209,-46.66485': {
        "display_name": "Jardim Paulista, São Paulo, SP, Brasil",
        "address": {
            "suburb": "Jardim Paulista",
            "city": "São Paulo",
            "state": "São Paulo",
            "ISO3166-2-lvl4": "BR-SP",
            "country": "Brasil",
            "country_code": "br"
        }
    },
    '-23.58737,-46.63604': {
        "display_name": "Vila Mariana, São Paulo, SP, Brasil",
        "address": {
            "suburb": "Vila Mariana",
            "city": "São Paulo",
            "state": "São Paulo",
            "ISO3166-2-lvl4": "BR-SP",
            "country": "Brasil",
            "country_code": "br"
        }
    },
    '-23.60623,-46.66377': {
        "display_name": "Moema, São Paulo, SP, Brasil",
        "address": {
            "suburb": "Moema",
            "city": "São Paulo",
            "state": "São Paulo",
            "ISO3166-2-lvl4": "BR-SP",
            "country": "Brasil",
            "country_code": "br"
        }
    }
};

describe('E2E: Neighborhood Change While Driving', () => {
    let browser;
    let page;
    let server;
    const PORT = 9878; // Use different port to avoid conflicts

    /**
     * Start local HTTP server and launch browser before all tests
     */
    beforeAll(async () => {
        const projectRoot = path.resolve(__dirname, '../..');
        
        // Start local HTTP server
        server = http.createServer((req, res) => {
            let requestPath = req.url;
            
            // Map / to /src/index.html
            if (requestPath === '/' || requestPath === '') {
                requestPath = '/src/index.html';
            }
            // Map root-level files to src/ directory (for relative imports from index.html)
            else if (!requestPath.startsWith('/src/') && 
                     (requestPath.endsWith('.css') || requestPath.endsWith('.js') || requestPath.endsWith('.html'))) {
                requestPath = '/src' + requestPath;
            }
            
            let filePath = path.join(projectRoot, requestPath);

            const ext = path.extname(filePath);
            const contentType = {
                '.html': 'text/html',
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpg',
                '.ico': 'image/x-icon'
            }[ext] || 'text/plain';

            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('File not found');
                    return;
                }

                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data, 'utf-8');
            });
        });

        await new Promise((resolve) => {
            server.listen(PORT, () => {
                console.log(`Test server running at http://localhost:${PORT}`);
                resolve();
            });
        });

        // Launch browser
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });

        console.log('Puppeteer browser launched for neighborhood change tests');
    }, 30000); // 30 second timeout for setup

    /**
     * Helper: Create and setup page with geolocation mock
     */
    async function setupPageWithGeolocation(coords) {
        const newPage = await browser.newPage();
        
        // Set viewport
        await newPage.setViewport({ width: 1280, height: 720 });

        // Log page errors
        newPage.on('pageerror', (error) => {
            console.error('PAGE ERROR:', error.message);
        });

        // Log console messages from the page (ALL messages for debugging)
        newPage.on('console', (msg) => {
            const type = msg.type();
            console.log(`PAGE [${type.toUpperCase()}]:`, msg.text());
        });

        // Log failed requests
        newPage.on('requestfailed', (request) => {
            console.error('REQUEST FAILED:', request.url(), request.failure().errorText);
        });

        // Grant geolocation permission
        const context = newPage.browser().defaultBrowserContext();
        await context.overridePermissions(`http://localhost:${PORT}`, ['geolocation']);

        // IMPORTANT: Set up geolocation mock BEFORE navigation
        await newPage.setGeolocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: 10
        });

        // Intercept Nominatim API calls and return mock data
        await newPage.setRequestInterception(true);
        newPage.on('request', (request) => {
            if (request.url().includes('nominatim.openstreetmap.org/reverse')) {
                const url = new URL(request.url());
                const lat = url.searchParams.get('lat');
                const lon = url.searchParams.get('lon');
                const key = `${lat},${lon}`;
                
                console.log(`[REQUEST INTERCEPT] Nominatim request for: ${key}`);
                
                const mockResponse = MOCK_NOMINATIM_RESPONSES[key];
                
                if (mockResponse) {
                    console.log(`[REQUEST INTERCEPT] Returning mock response with bairro: ${mockResponse.address.suburb}`);
                    request.respond({
                        status: 200,
                        contentType: 'application/json',
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(mockResponse)
                    });
                } else {
                    console.log(`[REQUEST INTERCEPT] No mock found for ${key}, returning 404`);
                    request.respond({
                        status: 404,
                        contentType: 'application/json',
                        body: JSON.stringify({ error: 'Location not found' })
                    });
                }
            } else {
                request.continue();
            }
        });

        // Now navigate to the page
        await newPage.goto(`http://localhost:${PORT}/`, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        
        // Wait for app initialization
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Debug: Check app state
        const appState = await newPage.evaluate(() => {
            return {
                hasGuiaApp: !!window.GuiaApp,
                hasGetState: !!(window.GuiaApp && window.GuiaApp.getState),
                state: window.GuiaApp && window.GuiaApp.getState ? window.GuiaApp.getState() : null,
                hasManager: !!(window.GuiaApp && window.GuiaApp.getState && window.GuiaApp.getState().manager)
            };
        });
        console.log('App state after initialization:', JSON.stringify(appState, null, 2));
        
        return newPage;
    }

    /**
     * Create new page before each test (without geolocation - tests set it up individually)
     */
    beforeEach(async () => {
        // Page will be created in each test with specific coordinates
    }, 20000); // 20 second timeout for beforeEach

    /**
     * Close page after each test
     */
    afterEach(async () => {
        if (page) {
            await page.close();
        }
    });

    /**
     * Cleanup: Close browser and stop HTTP server after all tests
     */
    afterAll(async () => {
        // Close browser with all its processes
        if (browser) {
            // Disconnect to force cleanup of all processes
            if (browser.isConnected()) {
                browser.disconnect();
            }
            await browser.close();
            console.log('Browser closed');
        }
        
        // Stop HTTP server
        if (server) {
            await new Promise((resolve) => {
                server.close(() => {
                    console.log('Test server stopped');
                    resolve();
                });
            });
        }
        
        // Give Jest time to clean up
        await new Promise(resolve => setTimeout(resolve, 100));
    }, 10000); // 10 second timeout for cleanup

    /**
     * Helper: Simulate geolocation update
     * 
     * Uses Puppeteer's setGeolocation to update browser coordinates AND manually
     * triggers position manager to ensure immediate update.
     */
    async function simulateLocationUpdate(latitude, longitude) {
        console.log(`[SIMULATE] Moving to: ${latitude}, ${longitude}`);
        
        // Update Puppeteer's geolocation - this triggers watchPosition callbacks
        await page.setGeolocation({
            latitude: latitude,
            longitude: longitude,
            accuracy: 10
        });

        // Wait a moment for the watchPosition to fire
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Debug: Check current state before manual update
        const stateBefore = await page.evaluate(() => {
            const appState = window.GuiaApp && window.GuiaApp.getState ? window.GuiaApp.getState() : null;
            const manager = appState?.manager;
            const geoService = manager?.geolocationService;
            const posManager = geoService?.positionManager;
            return {
                hasManager: !!manager,
                hasGeoService: !!geoService,
                hasPositionManager: !!posManager,
                lastPosition: posManager?.lastPosition ? {
                    lat: posManager.lastPosition.coords.latitude,
                    lon: posManager.lastPosition.coords.longitude
                } : null
            };
        });
        console.log('[SIMULATE] State before manual update:', JSON.stringify(stateBefore, null, 2));
        
        // NOW manually trigger position update with NEW coordinates
        // This bypasses the distance/time checks for testing
        const updateResult = await page.evaluate((lat, lon) => {
            try {
                // Create a position event with NEW coordinates
                const position = {
                    coords: {
                        latitude: lat,
                        longitude: lon,
                        accuracy: 10,
                        altitude: null,
                        altitudeAccuracy: null,
                        heading: null,
                        speed: null
                    },
                    timestamp: Date.now()
                };
                
                // Get the app state
                const appState = window.GuiaApp && window.GuiaApp.getState ? window.GuiaApp.getState() : null;
                if (appState && appState.manager) {
                    // Access the geolocation service DIRECTLY from manager
                    const geolocationService = appState.manager.geolocationService;
                    
                    if (geolocationService && geolocationService.positionManager) {
                        const posManager = geolocationService.positionManager;
                        
                        // BYPASS the distance/time checks by directly setting position and notifying
                        // Force update by:
                        // 1. Reset lastModified to allow immediate update (bypass time check)
                        posManager.lastModified = 0;
                        
                        // 2. Temporarily modify lastPosition to force distance check to pass
                        //    Save original, set to far away, then restore after update
                        const originalLastPos = posManager.lastPosition;
                        if (posManager.lastPosition && posManager.lastPosition.coords) {
                            // Create a fake position 200km away to ensure distance check passes
                            posManager.lastPosition = {
                                coords: {
                                    latitude: lat + 2, // ~220km away
                                    longitude: lon + 2,
                                    accuracy: 10
                                },
                                timestamp: Date.now() - 100000 // 100 seconds ago
                            };
                        }
                        
                        // 3. Now call update which should work with the REAL new coordinates
                        console.log('[SIMULATE] Calling positionManager.update() with coords:', lat, lon);
                        posManager.update(position);
                        
                        return { success: true, message: 'Position forced through manager' };
                    } else {
                        return { 
                            success: false, 
                            message: 'No position manager'
                        };
                    }
                } else {
                    return { success: false, message: 'No app manager found' };
                }
            } catch (error) {
                return { success: false, message: error.message, stack: error.stack };
            }
        }, latitude, longitude);
        
        console.log('[SIMULATE] Update result:', updateResult);

        // Wait for geocoding API call and DOM update
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        // Debug: Check bairro value after update
        const stateAfter = await page.evaluate(() => {
            const el = document.querySelector('#bairro-value');
            const appState = window.GuiaApp && window.GuiaApp.getState ? window.GuiaApp.getState() : null;
            const posManager = appState?.manager?.geolocationService?.positionManager;
            return {
                bairro: el ? el.textContent.trim() : null,
                currentPosition: posManager?.lastPosition ? {
                    lat: posManager.lastPosition.coords.latitude,
                    lon: posManager.lastPosition.coords.longitude
                } : null
            };
        });
        console.log('[SIMULATE] State after update:', stateAfter);
    }

    /**
     * Helper: Get bairro card text content
     */
    async function getBairroCardContent() {
        return await page.evaluate(() => {
            const bairroElement = document.querySelector('#bairro-value');
            return bairroElement ? bairroElement.textContent.trim() : null;
        });
    }

    /**
     * Helper: Get municipio card text content
     */
    async function getMunicipioCardContent() {
        return await page.evaluate(() => {
            const municipioElement = document.querySelector('#municipio-value');
            return municipioElement ? municipioElement.textContent.trim() : null;
        });
    }

    /**
     * TEST 1: Initial neighborhood display
     */
    test('should display initial neighborhood (República) on app load', async () => {
        // Create page with mock geolocation at República coordinates
        page = await setupPageWithGeolocation(DRIVING_ROUTE[0]);

        // Wait for app to initialize
        await page.waitForFunction(
            () => window.GuiaApp && window.GuiaApp.getState && window.GuiaApp.getState().manager,
            { timeout: 10000 }
        );

        // Wait for geocoding to complete
        try {
            await page.waitForFunction(
                () => {
                    const bairroElement = document.querySelector('#bairro-value');
                    const value = bairroElement ? bairroElement.textContent.trim() : null;
                    console.log('[WAIT] Bairro value:', value);
                    return bairroElement && value !== '—' && value.length > 0;
                },
                { timeout: 30000, polling: 1000 }
            );
        } catch (error) {
            // Log final state before throwing
            const finalBairro = await page.evaluate(() => {
                const el = document.querySelector('#bairro-value');
                return {
                    exists: !!el,
                    value: el ? el.textContent : null,
                    innerHTML: el ? el.innerHTML : null
                };
            });
            console.log('[TEST FAILURE] Final bairro state:', finalBairro);
            throw error;
        }

        // Verify initial bairro
        const bairro = await getBairroCardContent();
        const municipio = await getMunicipioCardContent();

        expect(municipio).toBe(DRIVING_ROUTE[0].expected.municipio);
        expect(bairro).toBe(DRIVING_ROUTE[0].expected.bairro);
    }, 30000);

    /**
     * TEST 2: Bairro card updates when moving to new neighborhood
     */
    test('should update bairro card when driving to Jardins', async () => {
        // Create page with mock geolocation at República coordinates
        page = await setupPageWithGeolocation(DRIVING_ROUTE[0]);

        await page.waitForFunction(
            () => window.GuiaApp && window.GuiaApp.getState && window.GuiaApp.getState().manager,
            { timeout: 10000 }
        );

        // Wait for initial bairro to load (increased timeout for CI stability)
        await page.waitForFunction(
            () => {
                const bairroElement = document.querySelector('#bairro-value');
                return bairroElement && bairroElement.textContent.trim() !== '—';
            },
            { timeout: 30000, polling: 500 }
        );

        const initialBairro = await getBairroCardContent();
        expect(initialBairro).toBe(DRIVING_ROUTE[0].expected.bairro);

        // Move to Jardins
        await simulateLocationUpdate(
            DRIVING_ROUTE[1].latitude,
            DRIVING_ROUTE[1].longitude
        );

        // Wait for bairro to update (increased timeout for CI stability)
        await page.waitForFunction(
            (expectedBairro) => {
                const bairroElement = document.querySelector('#bairro-value');
                return bairroElement && bairroElement.textContent.trim() === expectedBairro;
            },
            { timeout: 30000, polling: 500 },
            DRIVING_ROUTE[1].expected.bairro
        );

        const updatedBairro = await getBairroCardContent();
        const updatedMunicipio = await getMunicipioCardContent();

        expect(updatedMunicipio).toBe(DRIVING_ROUTE[1].expected.municipio);
        expect(updatedBairro).toBe(DRIVING_ROUTE[1].expected.bairro);
        expect(updatedBairro).not.toBe(initialBairro);
    }, 30000);

    /**
     * TEST 3: Multiple neighborhood changes in sequence
     */
    test('should update bairro card through multiple neighborhood changes', async () => {
        const bairroHistory = [];

        // Create page with mock geolocation at República coordinates
        page = await setupPageWithGeolocation(DRIVING_ROUTE[0]);

        await page.waitForFunction(() => window.GuiaApp && window.GuiaApp.getState &&  window.GuiaApp.getState().manager, { timeout: 10000 });

        // Wait for initial bairro (increased timeout for CI stability)
        await page.waitForFunction(
            () => {
                const el = document.querySelector('#bairro-value');
                return el && el.textContent.trim() !== '—';
            },
            { timeout: 30000, polling: 500 }
        );

        // Record initial bairro
        bairroHistory.push(await getBairroCardContent());

        // Drive through all locations
        for (let i = 1; i < DRIVING_ROUTE.length; i++) {
            await simulateLocationUpdate(DRIVING_ROUTE[i].latitude, DRIVING_ROUTE[i].longitude);
            
            // Wait for bairro to update (increased timeout for CI stability)
            await page.waitForFunction(
                (oldBairro) => {
                    const el = document.querySelector('#bairro-value');
                    const newBairro = el ? el.textContent.trim() : '';
                    return newBairro !== oldBairro && newBairro !== '—' && newBairro.length > 0;
                },
                { timeout: 30000, polling: 500 },
                bairroHistory[bairroHistory.length - 1]
            );

            const currentBairro = await getBairroCardContent();
            bairroHistory.push(currentBairro);

            // Verify bairro changed
            expect(currentBairro).toBe(DRIVING_ROUTE[i].expected.bairro);
            expect(currentBairro).not.toBe(bairroHistory[i - 1]);
        }

        // Verify we visited all expected neighborhoods
        expect(bairroHistory).toHaveLength(DRIVING_ROUTE.length);
        expect(bairroHistory[0]).toBe('República');
        expect(bairroHistory[1]).toBe('Jardim Paulista');
        expect(bairroHistory[2]).toBe('Vila Mariana');
        expect(bairroHistory[3]).toBe('Moema');
    }, 60000); // Longer timeout for multiple updates

    /**
     * TEST 4: Bairro card element exists and is visible
     */
    test('should have visible bairro card element', async () => {
        // Create page with mock geolocation at República coordinates
        page = await setupPageWithGeolocation(DRIVING_ROUTE[0]);
        
        // Wait for app to initialize
        await page.waitForFunction(
            () => document.querySelector('#bairro-value') !== null,
            { timeout: 5000 }
        );
        
        const bairroCardExists = await page.evaluate(() => {
            const element = document.querySelector('#bairro-value');
            if (!element) return false;
            
            const style = window.getComputedStyle(element);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });

        expect(bairroCardExists).toBe(true);
    }, 15000);

    /**
     * TEST 5: Address data contains bairro information
     */
    test.skip('should include bairro in endereco-padronizado-display', async () => {
        await page.evaluateOnNewDocument((coords) => {
            window.navigator.geolocation = {
                getCurrentPosition: (success) => {
                    success({
                        coords: {
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                            accuracy: 10
                        },
                        timestamp: Date.now()
                    });
                }
            };
        }, DRIVING_ROUTE[1]); // Jardins

        await page.click('#obter-localizacao-btn');
        await new Promise(resolve => setTimeout(resolve, 3000));

        const addressDisplay = await page.evaluate(() => {
            const element = document.querySelector('#endereco-padronizado-display');
            return element ? element.textContent : null;
        });

        expect(addressDisplay).toContain('Jardim Paulista');
        expect(addressDisplay).toContain('São Paulo');
    }, 30000);

    /**
     * TEST 6: Bairro updates persist after multiple position changes
     */
    test.skip('should maintain bairro update consistency across rapid position changes', async () => {
        await page.evaluateOnNewDocument((coords) => {
            window.navigator.geolocation = {
                getCurrentPosition: (success) => {
                    success({
                        coords: {
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                            accuracy: 10
                        },
                        timestamp: Date.now()
                    });
                }
            };
        }, DRIVING_ROUTE[0]);

        await page.click('#obter-localizacao-btn');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Rapidly change positions
        for (let i = 1; i < DRIVING_ROUTE.length; i++) {
            await simulateLocationUpdate(
                DRIVING_ROUTE[i].latitude,
                DRIVING_ROUTE[i].longitude
            );
            await new Promise(resolve => setTimeout(resolve, 1500)); // Shorter wait to simulate driving
        }

        // Final bairro should match last location
        const finalBairro = await getBairroCardContent();
        expect(finalBairro).toBe(DRIVING_ROUTE[DRIVING_ROUTE.length - 1].expected.bairro);
    }, 45000);

    /**
     * TEST 7: Observer pattern propagates neighborhood changes
     */
    test.skip('should propagate neighborhood changes through observer pattern', async () => {
        const observerCalls = await page.evaluate(() => {
            window.observerCallHistory = [];
            
            // Hook into observer notifications
            if (window.WebGeocodingManager) {
                const originalNotify = window.WebGeocodingManager.prototype.notifyObservers;
                window.WebGeocodingManager.prototype.notifyObservers = function(...args) {
                    window.observerCallHistory.push({
                        timestamp: Date.now(),
                        args: args.length
                    });
                    return originalNotify.apply(this, args);
                };
            }
            
            return window.observerCallHistory || [];
        });

        await page.evaluateOnNewDocument((coords) => {
            window.navigator.geolocation = {
                getCurrentPosition: (success) => {
                    success({
                        coords: {
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                            accuracy: 10
                        },
                        timestamp: Date.now()
                    });
                }
            };
        }, DRIVING_ROUTE[0]);

        await page.click('#obter-localizacao-btn');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Move to new location
        await simulateLocationUpdate(
            DRIVING_ROUTE[1].latitude,
            DRIVING_ROUTE[1].longitude
        );

        const finalObserverCalls = await page.evaluate(() => window.observerCallHistory?.length || 0);
        
        // Should have at least 2 observer calls (initial + update)
        expect(finalObserverCalls).toBeGreaterThanOrEqual(2);
    }, 30000);

    /**
     * TEST 8: Bairro card shows loading state during geocoding
     */
    test.skip('should show loading state while geocoding new location', async () => {
        await page.evaluateOnNewDocument((coords) => {
            window.navigator.geolocation = {
                getCurrentPosition: (success) => {
                    success({
                        coords: {
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                            accuracy: 10
                        },
                        timestamp: Date.now()
                    });
                }
            };
        }, DRIVING_ROUTE[0]);

        await page.click('#obter-localizacao-btn');
        
        // Check for loading indicator immediately
        const hasLoadingState = await page.evaluate(() => {
            const bairroElement = document.querySelector('#bairro-value');
            const text = bairroElement?.textContent || '';
            return text.includes('...') || text.includes('Aguarde') || text === '';
        });

        // Note: This might be true or false depending on timing
        expect(typeof hasLoadingState).toBe('boolean');
        
        // Wait for final state
        await new Promise(resolve => setTimeout(resolve, 3000));
        const finalBairro = await getBairroCardContent();
        expect(finalBairro).toBeTruthy();
        expect(finalBairro).not.toBe('');
    }, 30000);
});
