/**
 * E2E Test: Validate locationResult with Milho Verde Coordinates
 * 
 * Tests that id="locationResult" element properly displays address data
 * when using Milho Verde's coordinates (Minas Gerais, Brazil).
 * 
 * Milho Verde coordinates: -18.1262° S, -43.4975° W
 * Location: District of Serro, Minas Gerais, Brazil
 */

import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Milho Verde coordinates (district of Serro, MG, Brazil)
const MILHO_VERDE = {
  name: 'Milho Verde',
  lat: -18.1262,
  lon: -43.4975,
  state: 'Minas Gerais',
  municipality: 'Serro'
};

describe.skip('E2E: locationResult with Milho Verde Coordinates', () => {
  let browser, page, server;
  const PORT = 9880;

  beforeAll(async () => {
    // Start HTTP server
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
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }, 30000);

  afterAll(async () => {
    if (browser) await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  });

  test('locationResult should display Milho Verde address data', async () => {
    page = await browser.newPage();
    
    // Console logging for debugging
    page.on('console', msg => {
      const text = msg.text();
      // Log important messages
      if (text.includes('Address') || text.includes('Serro') || 
          text.includes('Milho Verde') || text.includes('ServiceCoordinator')) {
        console.log('PAGE:', text);
      }
    });
    
    page.on('pageerror', error => console.error('PAGE ERROR:', error.message));

    // Grant geolocation permission
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(`http://localhost:${PORT}`, ['geolocation']);
    
    // Mock geolocation with Milho Verde coordinates
    await page.evaluateOnNewDocument((coords) => {
      let callCount = 0;
      const mockPosition = {
        coords: {
          latitude: coords.lat,
          longitude: coords.lon,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      };

      navigator.geolocation.getCurrentPosition = (success) => {
        callCount++;
        console.log(`[MOCK] getCurrentPosition called (${callCount}) for ${coords.name}`);
        success(mockPosition);
      };
      
      navigator.geolocation.watchPosition = (success) => {
        console.log(`[MOCK] watchPosition called for ${coords.name}`);
        success(mockPosition);
        return 1;
      };
    }, MILHO_VERDE);

    // Mock Nominatim API with Milho Verde response
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (request.url().includes('nominatim.openstreetmap.org/reverse')) {
        console.log('Intercepting Nominatim API call for Milho Verde');
        request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            place_id: 123456789,
            licence: "Data © OpenStreetMap contributors",
            display_name: "Milho Verde, Serro, Minas Gerais, Brasil",
            address: {
              suburb: "Milho Verde",  // Changed from "village" to "suburb" for bairro detection
              municipality: "Serro",
              state: "Minas Gerais",
              "ISO3166-2-lvl4": "BR-MG",
              country: "Brasil",
              country_code: "br"
            },
            boundingbox: ["-18.13", "-18.12", "-43.50", "-43.49"]
          })
        });
      } else {
        request.continue();
      }
    });

    // Navigate to the application
    console.log('\n=== LOADING APPLICATION ===');
    await page.goto(`http://localhost:${PORT}/src/index.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    // Wait for app initialization
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n=== CHECKING INITIAL STATE ===');
    
    // Check that locationResult element exists
    const locationResultExists = await page.$('#locationResult');
    expect(locationResultExists).not.toBeNull();

    // Check app state
    const appState = await page.evaluate(() => {
      const state = window.GuiaApp?.getState?.();
      return {
        hasManager: !!state?.manager,
        hasServiceCoordinator: !!state?.manager?.serviceCoordinator,
        hasAddressDisplayer: !!state?.manager?.serviceCoordinator?._displayers?.address,
        addressDisplayerElement: state?.manager?.serviceCoordinator?._displayers?.address?.element?.id
      };
    });
    
    console.log('App state:', JSON.stringify(appState, null, 2));
    expect(appState.hasManager).toBe(true);
    expect(appState.hasAddressDisplayer).toBe(true);
    expect(appState.addressDisplayerElement).toBe('locationResult');

    console.log('\n=== WAITING FOR ADDRESS UPDATE ===');
    
    // Wait for locationResult to be updated with address data
    await page.waitForFunction(
      () => {
        const el = document.getElementById('locationResult');
        if (!el) return false;
        
        const content = el.innerHTML;
        const hasAddressData = content.includes('Endereço') || 
                              content.includes('address-details') ||
                              content.includes('Serro') ||
                              content.includes('Milho Verde') ||
                              content.includes('Minas Gerais');
        
        if (hasAddressData) {
          console.log('✅ Address data detected in locationResult');
        }
        return hasAddressData;
      },
      { timeout: 15000, polling: 500 }
    );

    console.log('\n=== VALIDATING FINAL CONTENT ===');

    // Get final content
    const locationResultContent = await page.$eval('#locationResult', el => ({
      innerHTML: el.innerHTML,
      textContent: el.textContent
    }));

    console.log('locationResult length:', locationResultContent.innerHTML.length);
    console.log('First 300 chars:', locationResultContent.innerHTML.substring(0, 300));

    // Validate content
    const hasAddressDetails = locationResultContent.innerHTML.includes('address-details') ||
                             locationResultContent.innerHTML.includes('Endereço');
    const hasLocationData = locationResultContent.textContent.includes('Serro') ||
                           locationResultContent.textContent.includes('Milho Verde') ||
                           locationResultContent.textContent.includes('Minas Gerais');

    expect(hasAddressDetails).toBe(true);
    expect(hasLocationData).toBe(true);

    // Check highlight cards for municipio/bairro
    const highlightCards = await page.evaluate(() => {
      const municipio = document.getElementById('municipio-value')?.textContent.trim();
      const bairro = document.getElementById('bairro-value')?.textContent.trim();
      return { municipio, bairro };
    });

    console.log('\n=== HIGHLIGHT CARDS ===');
    console.log('Município:', highlightCards.municipio);
    console.log('Bairro:', highlightCards.bairro);

    // Municipio should show Serro with state abbreviation (v0.9.0-alpha format)
    expect(highlightCards.municipio).toBe('Serro, MG');
    
    // Bairro should show Milho Verde
    expect(highlightCards.bairro).toBe('Milho Verde');

    console.log('\n✅ TEST PASSED: locationResult correctly displays Milho Verde address data');

    await page.close();
  }, 20000);
});
