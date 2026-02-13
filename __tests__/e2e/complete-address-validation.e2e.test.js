/**
 * E2E Test: Comprehensive Address Display Validation
 * 
 * Tests ALL address display elements to ensure they are properly updating:
 * - id="locationResult" - Raw address data
 * - id="endereco-padronizado-display" - Standardized address
 * - id="reference-place-display" - Reference place
 * - id="municipio-value" - Municipality highlight card
 * - id="bairro-value" - Neighborhood highlight card
 */

import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test coordinates: São Paulo, Brazil (Av. Paulista)
const TEST_LOCATION = {
  name: 'Av. Paulista, São Paulo',
  lat: -23.561414,
  lon: -46.656712,
  state: 'São Paulo',
  city: 'São Paulo',
  suburb: 'Bela Vista'
};

describe.skip('E2E: Complete Address Display Validation', () => {
  let browser, page, server;
  const PORT = 9881;

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

  test('ALL address elements should display current location data', async () => {
    page = await browser.newPage();
    
    // Console logging
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Address') || text.includes('ServiceCoordinator') || 
          text.includes('HTMLAddressDisplayer') || text.includes('update')) {
        console.log('PAGE:', text);
      }
    });
    
    page.on('pageerror', error => console.error('PAGE ERROR:', error.message));

    // Grant geolocation permission
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(`http://localhost:${PORT}`, ['geolocation']);
    
    // Mock geolocation
    await page.evaluateOnNewDocument((coords) => {
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
        console.log(`[MOCK] getCurrentPosition called for ${coords.name}`);
        success(mockPosition);
      };
      
      navigator.geolocation.watchPosition = (success) => {
        console.log(`[MOCK] watchPosition called for ${coords.name}`);
        success(mockPosition);
        return 1;
      };
    }, TEST_LOCATION);

    // Mock Nominatim API
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
          body: JSON.stringify({
            place_id: 987654321,
            licence: "Data © OpenStreetMap contributors",
            display_name: "Avenida Paulista, Bela Vista, São Paulo, Brasil",
            class: "building",
            type: "yes",
            name: "Edifício Paulista",
            address: {
              road: "Avenida Paulista",
              suburb: "Bela Vista",
              city: "São Paulo",
              state: "São Paulo",
              postcode: "01310-100",
              "ISO3166-2-lvl4": "BR-SP",
              country: "Brasil",
              country_code: "br"
            },
            boundingbox: ["-23.57", "-23.55", "-46.67", "-46.64"]
          })
        });
      } else {
        request.continue();
      }
    });

    // Navigate
    console.log('\n=== LOADING APPLICATION ===');
    await page.goto(`http://localhost:${PORT}/src/index.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n=== CHECKING ALL ADDRESS ELEMENTS ===');

    // Wait for address data to load
    await page.waitForFunction(
      () => {
        const locationResult = document.getElementById('locationResult');
        const hasAddressData = locationResult?.innerHTML.includes('Endereço') ||
                              locationResult?.innerHTML.includes('address-details');
        return hasAddressData;
      },
      { timeout: 15000, polling: 500 }
    );

    // Get all address-related elements
    const addressElements = await page.evaluate(() => {
      return {
        locationResult: {
          exists: !!document.getElementById('locationResult'),
          innerHTML: document.getElementById('locationResult')?.innerHTML.substring(0, 500),
          textContent: document.getElementById('locationResult')?.textContent.substring(0, 200),
          hasAddressDetails: document.getElementById('locationResult')?.innerHTML.includes('address-details'),
          hasEnderecoAtual: document.getElementById('locationResult')?.innerHTML.includes('Endereço Atual')
        },
        enderecoPadronizado: {
          exists: !!document.getElementById('endereco-padronizado-display'),
          textContent: document.getElementById('endereco-padronizado-display')?.textContent.trim(),
          isNotEmpty: document.getElementById('endereco-padronizado-display')?.textContent.trim().length > 0,
          isNotPlaceholder: !document.getElementById('endereco-padronizado-display')?.textContent.includes('Aguardando')
        },
        referencePlace: {
          exists: !!document.getElementById('reference-place-display'),
          textContent: document.getElementById('reference-place-display')?.textContent.trim(),
          isNotEmpty: document.getElementById('reference-place-display')?.textContent.trim().length > 0,
          isNotPlaceholder: !document.getElementById('reference-place-display')?.textContent.includes('Aguardando')
        },
        municipio: {
          exists: !!document.getElementById('municipio-value'),
          textContent: document.getElementById('municipio-value')?.textContent.trim(),
          isNotPlaceholder: document.getElementById('municipio-value')?.textContent.trim() !== '—'
        },
        bairro: {
          exists: !!document.getElementById('bairro-value'),
          textContent: document.getElementById('bairro-value')?.textContent.trim(),
          isNotPlaceholder: document.getElementById('bairro-value')?.textContent.trim() !== '—'
        },
        latLongDisplay: {
          exists: !!document.getElementById('lat-long-display'),
          textContent: document.getElementById('lat-long-display')?.textContent.trim(),
          isNotPlaceholder: !document.getElementById('lat-long-display')?.textContent.includes('Aguardando')
        }
      };
    });

    console.log('\n=== ELEMENT STATUS ===');
    console.log(JSON.stringify(addressElements, null, 2));

    // Validate locationResult (raw address data)
    console.log('\n=== locationResult Validation ===');
    expect(addressElements.locationResult.exists).toBe(true);
    expect(addressElements.locationResult.hasAddressDetails).toBe(true);
    expect(addressElements.locationResult.hasEnderecoAtual).toBe(true);
    console.log('✅ locationResult: Contains address details');

    // Validate endereco-padronizado-display (standardized address)
    console.log('\n=== endereco-padronizado-display Validation ===');
    console.log('Content:', addressElements.enderecoPadronizado.textContent);
    expect(addressElements.enderecoPadronizado.exists).toBe(true);
    expect(addressElements.enderecoPadronizado.isNotEmpty).toBe(true);
    expect(addressElements.enderecoPadronizado.isNotPlaceholder).toBe(true);
    console.log('✅ endereco-padronizado-display: Has standardized address');

    // Validate reference-place-display
    console.log('\n=== reference-place-display Validation ===');
    console.log('Content:', addressElements.referencePlace.textContent);
    expect(addressElements.referencePlace.exists).toBe(true);
    expect(addressElements.referencePlace.isNotEmpty).toBe(true);
    expect(addressElements.referencePlace.isNotPlaceholder).toBe(true);
    console.log('✅ reference-place-display: Has reference place');

    // Validate highlight cards
    console.log('\n=== Highlight Cards Validation ===');
    console.log('Município:', addressElements.municipio.textContent);
    console.log('Bairro:', addressElements.bairro.textContent);
    expect(addressElements.municipio.exists).toBe(true);
    expect(addressElements.municipio.textContent).toBe('São Paulo, SP');
    expect(addressElements.bairro.exists).toBe(true);
    expect(addressElements.bairro.textContent).toBe('Bela Vista');
    console.log('✅ Highlight cards: Both populated');

    // Validate lat-long-display (coordinates)
    console.log('\n=== lat-long-display Validation ===');
    console.log('Content:', addressElements.latLongDisplay.textContent);
    expect(addressElements.latLongDisplay.exists).toBe(true);
    expect(addressElements.latLongDisplay.isNotPlaceholder).toBe(true);
    console.log('✅ lat-long-display: Has coordinates');

    console.log('\n✅ ALL ADDRESS ELEMENTS ARE DISPLAYING CORRECTLY!');

    await page.close();
  }, 20000);
});
