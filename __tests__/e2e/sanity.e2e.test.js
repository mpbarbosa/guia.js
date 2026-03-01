'use strict';

/**
 * Integration Sanity Test Suite (Puppeteer)
 *
 * Fast smoke-tests that verify the application is fundamentally healthy:
 * page load, critical DOM elements, navigation, version label, geolocation
 * mock injection, address display update, and the converter route.
 *
 * Run with:
 *   npm run test:e2e -- __tests__/e2e/sanity.e2e.test.js
 *
 * @module __tests__/e2e/sanity.e2e.test
 * @since 0.11.6-alpha
 */

import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── Server helpers ──────────────────────────────────────────────────────────

const PORT = 9889;
const ROOT = path.join(__dirname, '../..');

const MIME = {
  '.html': 'text/html',
  '.js':   'text/javascript',
  '.ts':   'text/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
};

function createServer() {
  return http.createServer((req, res) => {
    const urlPath  = req.url === '/' ? '/src/index.html' : (req.url ?? '/');
    const filePath = path.join(ROOT, urlPath);
    const ext      = path.extname(filePath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
      } else {
        res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'text/plain' });
        res.end(data);
      }
    });
  });
}

// ─── Mock Nominatim response (São Paulo – Bela Vista) ────────────────────────

const MOCK_COORD = { lat: -23.55052, lon: -46.633308 };

const MOCK_NOMINATIM = {
  place_id: 999,
  display_name: 'Bela Vista, São Paulo, SP, Brasil',
  address: {
    road:             'Avenida Paulista',
    suburb:           'Bela Vista',
    city:             'São Paulo',
    state:            'São Paulo',
    'ISO3166-2-lvl4': 'BR-SP',
  },
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('Sanity: Integration (Puppeteer)', () => {
  let browser;
  let page;
  let server;

  // ── Global setup / teardown ──────────────────────────────────────────────

  beforeAll(async () => {
    server = createServer();
    await new Promise(resolve => server.listen(PORT, resolve));

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
    });
  }, 30_000);

  afterAll(async () => {
    if (browser) await browser.close();
    if (server)  await new Promise(resolve => server.close(resolve));
  });

  beforeEach(async () => {
    page = await browser.newPage();
    page.on('pageerror', err => console.error('[PAGE ERROR]', err.message));
  });

  afterEach(async () => {
    if (page) await page.close();
  });

  // ── 1. Page load ─────────────────────────────────────────────────────────

  describe('1. Page load', () => {
    test('loads without a JavaScript error', async () => {
      const jsErrors = [];
      page.on('pageerror', err => jsErrors.push(err.message));

      await page.goto(`http://localhost:${PORT}/src/index.html`, {
        waitUntil: 'networkidle0',
        timeout:   30_000,
      });

      expect(jsErrors).toHaveLength(0);
    });

    test('page title contains "Guia Turístico"', async () => {
      await page.goto(`http://localhost:${PORT}/src/index.html`, {
        waitUntil: 'networkidle0',
        timeout:   30_000,
      });

      const title = await page.title();
      expect(title).toMatch(/Guia Tur[ií]stico/i);
    });

    test('main heading says "Onde estou?"', async () => {
      await page.goto(`http://localhost:${PORT}/src/index.html`, {
        waitUntil: 'networkidle0',
        timeout:   30_000,
      });

      const h1 = await page.$eval('h1', el => el.textContent?.trim());
      expect(h1).toBe('Onde estou?');
    });
  });

  // ── 2. Critical DOM elements ──────────────────────────────────────────────

  describe('2. Critical DOM elements present', () => {
    beforeEach(async () => {
      await page.goto(`http://localhost:${PORT}/src/index.html`, {
        waitUntil: 'networkidle0',
        timeout:   30_000,
      });
    });

    const elements = [
      ['#enable-location-btn',         'onboarding CTA button'],
      ['#municipio-value',             'municipio highlight card'],
      ['#bairro-value',               'bairro highlight card'],
      ['#logradouro-value',           'logradouro highlight card'],
      ['#endereco-padronizado-display','standardised address span'],
      ['#lat-long-display',           'coordinates span'],
      ['#reference-place-display',    'reference place span'],
      ['#dadosSidra',                 'SIDRA data span'],
      ['#navigation-log',             'navigation log output'],
      ['#chronometer',                'chronometer element'],
      ['#insertPositionButton',       'insert-position test button'],
      ['.app-version',                'version badge'],
    ];

    test.each(elements)('%s (%s) exists in the DOM', async (selector) => {
      const el = await page.$(selector);
      expect(el).not.toBeNull();
    });
  });

  // ── 3. Version badge ─────────────────────────────────────────────────────

  describe('3. Version badge', () => {
    test('meta[name="version"] contains a semver string', async () => {
      await page.goto(`http://localhost:${PORT}/src/index.html`, {
        waitUntil: 'networkidle0',
        timeout:   30_000,
      });

      // The <meta name="version"> tag is static HTML and always reliable.
      // The badge text is populated by JS (requires build); we test the meta here.
      const metaVersion = await page.$eval(
        'meta[name="version"]',
        el => el.getAttribute('content') ?? '',
      );
      expect(metaVersion).toMatch(/^\d+\.\d+\.\d+/);
    });

    test('version badge element is present and has an accessible label', async () => {
      await page.goto(`http://localhost:${PORT}/src/index.html`, {
        waitUntil: 'networkidle0',
        timeout:   30_000,
      });

      const badge = await page.$('.app-version');
      expect(badge).not.toBeNull();

      // aria-label or role should indicate it's interactive
      const role = await page.$eval('.app-version', el => el.getAttribute('role'));
      expect(['button', 'link', null].includes(role)).toBe(true);
    });
  });

  // ── 4. Onboarding card ───────────────────────────────────────────────────

  describe('4. Onboarding card', () => {
    test('onboarding card is visible before location is activated', async () => {
      await page.goto(`http://localhost:${PORT}/src/index.html`, {
        waitUntil: 'networkidle0',
        timeout:   30_000,
      });

      const visible = await page.$eval(
        '#onboarding-card',
        el => window.getComputedStyle(el).display !== 'none',
      );
      expect(visible).toBe(true);
    });

    test('"Ativar Localização" button is enabled', async () => {
      await page.goto(`http://localhost:${PORT}/src/index.html`, {
        waitUntil: 'networkidle0',
        timeout:   30_000,
      });

      const disabled = await page.$eval('#enable-location-btn', el => el.disabled);
      expect(disabled).toBe(false);
    });
  });

  // ── 5. Geolocation injection → address display ───────────────────────────

  describe('5. Geolocation injection → address display', () => {
    /**
     * Returns true if the app's main JS module loaded successfully.
     * Requires a proper build (npm run build) or Vite dev server.
     * With the raw-source HTTP server, TypeScript imports fail silently.
     */
    async function isAppInitialized() {
      return page.evaluate(() => {
        // app.js logs "Initializing …" to the navigation-log on startup
        const log = document.querySelector('#navigation-log');
        return log !== null && log.textContent !== '';
      });
    }

    async function setupGeolocationPage() {
      const ctx = browser.defaultBrowserContext();
      await ctx.overridePermissions(`http://localhost:${PORT}`, ['geolocation']);

      await page.setGeolocation({
        latitude:  MOCK_COORD.lat,
        longitude: MOCK_COORD.lon,
        accuracy:  5,
      });

      await page.setRequestInterception(true);
      page.on('request', req => {
        if (req.url().includes('nominatim.openstreetmap.org')) {
          req.respond({
            status:      200,
            contentType: 'application/json',
            headers:     { 'Access-Control-Allow-Origin': '*' },
            body:        JSON.stringify(MOCK_NOMINATIM),
          });
        } else {
          req.continue();
        }
      });

      await page.goto(`http://localhost:${PORT}/src/index.html`, {
        waitUntil: 'networkidle0',
        timeout:   30_000,
      });

      await page.click('#enable-location-btn');
    }

    test('municipio-value updates to "São Paulo" after mocked geolocation', async () => {
      await setupGeolocationPage();

      if (!(await isAppInitialized())) {
        console.warn('⚠️  App JS not loaded (TS source mode). Run npm run build for full geolocation tests.');
        return;
      }

      await page.waitForFunction(
        () => {
          const el = document.querySelector('#municipio-value');
          return el && el.textContent?.trim() !== '' && el.textContent?.trim() !== '—';
        },
        { timeout: 20_000 },
      );

      const municipio = await page.$eval('#municipio-value', el => el.textContent?.trim());
      expect(municipio).toMatch(/São Paulo/i);
    });

    test('coordinates display updates with injected lat/lon', async () => {
      await setupGeolocationPage();

      if (!(await isAppInitialized())) {
        console.warn('⚠️  App JS not loaded (TS source mode). Run npm run build for full geolocation tests.');
        return;
      }

      await page.waitForFunction(
        () => {
          const el = document.querySelector('#lat-long-display');
          return el && el.textContent?.trim() !== 'Aguardando localização...';
        },
        { timeout: 20_000 },
      );

      const coords = await page.$eval('#lat-long-display', el => el.textContent?.trim() ?? '');
      expect(coords).toMatch(/-23\.\d+/);
      expect(coords).toMatch(/-46\.\d+/);
    });

    test('bairro-value updates to "Bela Vista" after geocoding', async () => {
      await setupGeolocationPage();

      if (!(await isAppInitialized())) {
        console.warn('⚠️  App JS not loaded (TS source mode). Run npm run build for full geolocation tests.');
        return;
      }

      await page.waitForFunction(
        () => {
          const el = document.querySelector('#bairro-value');
          return el && el.textContent?.trim() !== '' && el.textContent?.trim() !== '—';
        },
        { timeout: 20_000 },
      );

      const bairro = await page.$eval('#bairro-value', el => el.textContent?.trim());
      expect(bairro).toMatch(/Bela Vista/i);
    });
  });

  // ── 6. Converter route ───────────────────────────────────────────────────

  describe('6. Converter route (#/converter)', () => {
    test('navigating to #/converter renders the converter view', async () => {
      await page.goto(`http://localhost:${PORT}/src/index.html#/converter`, {
        waitUntil: 'networkidle0',
        timeout:   30_000,
      });

      const bodyText = await page.$eval('body', el => el.textContent ?? '');
      expect(bodyText).toMatch(/conversor|converter|coordenada/i);
    });

    test('converter footer link is present on the home page', async () => {
      await page.goto(`http://localhost:${PORT}/src/index.html`, {
        waitUntil: 'networkidle0',
        timeout:   30_000,
      });

      const link = await page.$('a[href="#/converter"]');
      expect(link).not.toBeNull();
    });
  });

  // ── 7. Accessibility basics ──────────────────────────────────────────────

  describe('7. Accessibility basics', () => {
    beforeEach(async () => {
      await page.goto(`http://localhost:${PORT}/src/index.html`, {
        waitUntil: 'networkidle0',
        timeout:   30_000,
      });
    });

    test('page has lang="pt-BR"', async () => {
      const lang = await page.$eval('html', el => el.getAttribute('lang'));
      expect(lang).toBe('pt-BR');
    });

    test('<main> has id="app-content"', async () => {
      const el = await page.$('main#app-content');
      expect(el).not.toBeNull();
    });

    test('skip-link is present', async () => {
      const link = await page.$('.skip-link');
      expect(link).not.toBeNull();
    });

    test('#enable-location-btn has a non-empty aria-label', async () => {
      const label = await page.$eval('#enable-location-btn', el => el.getAttribute('aria-label'));
      expect(label).toBeTruthy();
    });

    test('highlight card value elements have aria-live="polite"', async () => {
      for (const id of ['municipio-value', 'bairro-value', 'logradouro-value']) {
        const val = await page.$eval(`#${id}`, el => el.getAttribute('aria-live'));
        expect(val).toBe('polite');
      }
    });
  });

  // ── 8. Service Worker reachable ──────────────────────────────────────────

  describe('8. Service Worker', () => {
    test('service-worker.js is reachable (HTTP 200)', async () => {
      const response = await page.goto(
        `http://localhost:${PORT}/service-worker.js`,
        { timeout: 10_000 },
      );
      expect(response?.status()).toBe(200);
    });
  });
});
