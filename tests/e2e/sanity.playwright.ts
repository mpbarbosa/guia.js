/**
 * Playwright sanity suite for the Guia Turístico SPA.
 *
 * Covers: page load, critical DOM elements, version badge, onboarding card,
 * geolocation injection → address display, converter route, and accessibility
 * basics.  Runs against the compiled production bundle in dist/.
 *
 * Run:
 *   npx playwright test tests/e2e/sanity.playwright.ts
 *
 * @since 0.24.8-alpha
 */

import { test, expect, type BrowserContext, type Page } from '@playwright/test';

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_COORD = { lat: -23.5614, lon: -46.6558 };

const MOCK_NOMINATIM = {
  place_id: 999,
  display_name: 'Bela Vista, São Paulo, SP, Brasil',
  address: {
    road: 'Avenida Paulista',
    neighbourhood: 'Bela Vista',
    suburb: 'Bela Vista',
    city: 'São Paulo',
    state: 'São Paulo',
    'ISO3166-2-lvl4': 'BR-SP',
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const HOME = '/index.html';
const CONV = '/index.html#/converter';

/** Opens a fresh context with geolocation granted and Nominatim intercepted. */
async function makeGeoContext(
  browser: import('@playwright/test').Browser,
): Promise<{ ctx: BrowserContext; page: Page }> {
  const ctx = await browser.newContext({
    geolocation: { latitude: MOCK_COORD.lat, longitude: MOCK_COORD.lon, accuracy: 5 },
    permissions: ['geolocation'],
  });

  // Intercept Nominatim at the network layer before the page loads.
  await ctx.route(/nominatim\.openstreetmap\.org/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(MOCK_NOMINATIM),
    });
  });

  // allorigins.win CORS proxy sometimes used as a fallback.
  await ctx.route(/allorigins\.win.*nominatim/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ contents: JSON.stringify(MOCK_NOMINATIM) }),
    });
  });

  const page = await ctx.newPage();

  // Clear stored caches so previous test runs can't pollute results.
  await page.addInitScript(() => {
    try { indexedDB.deleteDatabase('guia-offline-cache'); } catch (_) {}
    try { localStorage.clear(); } catch (_) {}
    try { sessionStorage.clear(); } catch (_) {}
  });

  return { ctx, page };
}

// ── 1. Page load ─────────────────────────────────────────────────────────────

test.describe('1. Page load', () => {
  test('loads without a JavaScript error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(HOME, { waitUntil: 'networkidle' });

    expect(errors).toHaveLength(0);
  });

  test('page title contains "Guia Turístico"', async ({ page }) => {
    await page.goto(HOME, { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/Guia Tur[ií]stico/i);
  });

  test('main heading says "Onde estou?"', async ({ page }) => {
    await page.goto(HOME, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toHaveText('Onde estou?');
  });
});

// ── 2. Critical DOM elements ──────────────────────────────────────────────────

const CRITICAL_ELEMENTS: [string, string][] = [
  ['#enable-location-btn',          'onboarding CTA button'],
  ['#municipio-value',              'municipio highlight card'],
  ['#bairro-value',                 'bairro highlight card'],
  ['#logradouro-value',             'logradouro highlight card'],
  ['#endereco-padronizado-display', 'standardised address span'],
  ['#lat-long-display',             'coordinates span'],
  ['#reference-place-display',      'reference place span'],
  ['#dadosSidra',                   'SIDRA data span'],
  ['#navigation-log',               'navigation log output'],
  ['#chronometer',                  'chronometer element'],
  ['#insertPositionButton',         'insert-position test button'],
  ['.app-version',                  'version badge'],
];

test.describe('2. Critical DOM elements', () => {
  for (const [selector, label] of CRITICAL_ELEMENTS) {
    test(`${selector} (${label}) exists`, async ({ page }) => {
      await page.goto(HOME, { waitUntil: 'networkidle' });
      await expect(page.locator(selector).first()).toBeAttached();
    });
  }
});

// ── 3. Version badge ──────────────────────────────────────────────────────────

test.describe('3. Version badge', () => {
  test('meta[name="version"] contains a semver string', async ({ page }) => {
    await page.goto(HOME, { waitUntil: 'networkidle' });
    const content = await page.locator('meta[name="version"]').getAttribute('content');
    expect(content).toMatch(/^\d+\.\d+\.\d+/);
  });

  test('.app-version element is present', async ({ page }) => {
    await page.goto(HOME, { waitUntil: 'networkidle' });
    await expect(page.locator('.app-version').first()).toBeAttached();
  });
});

// ── 4. Onboarding card ────────────────────────────────────────────────────────

test.describe('4. Onboarding card', () => {
  test('onboarding card is visible before location is activated', async ({ page }) => {
    await page.goto(HOME, { waitUntil: 'networkidle' });
    await expect(page.locator('#onboarding-card')).toBeVisible();
  });

  test('"Ativar Localização" button is enabled', async ({ page }) => {
    await page.goto(HOME, { waitUntil: 'networkidle' });
    await expect(page.locator('#enable-location-btn')).toBeEnabled();
  });
});

// ── 5. Geolocation injection → address display ────────────────────────────────

test.describe('5. Geolocation injection → address display', () => {
  test('municipio-value updates to "São Paulo" after mocked geolocation', async ({ browser }) => {
    const { ctx, page } = await makeGeoContext(browser);
    try {
      await page.goto(HOME, { waitUntil: 'networkidle' });

      await page.waitForFunction(
        () => {
          const el = document.querySelector('#municipio-value');
          return el && el.textContent?.trim() !== '' && el.textContent?.trim() !== '—';
        },
        { timeout: 20_000 },
      );

      await expect(page.locator('#municipio-value')).toContainText(/São Paulo/i);
    } finally {
      await ctx.close();
    }
  });

  test('lat-long-display shows injected coordinates', async ({ browser }) => {
    const { ctx, page } = await makeGeoContext(browser);
    try {
      await page.goto(HOME, { waitUntil: 'networkidle' });

      await page.waitForFunction(
        () => {
          const el = document.querySelector('#lat-long-display');
          return el && el.textContent?.trim() !== 'Aguardando localização...';
        },
        { timeout: 20_000 },
      );

      const coords = await page.locator('#lat-long-display').textContent();
      expect(coords).toMatch(/-23\.\d+/);
      expect(coords).toMatch(/-46\.\d+/);
    } finally {
      await ctx.close();
    }
  });

  test('bairro-value updates to "Bela Vista" after confirmation buffer fills', async ({ browser }) => {
    const { ctx, page } = await makeGeoContext(browser);
    try {
      await page.goto(HOME, { waitUntil: 'networkidle' });

      // The confirmation buffer (BAIRRO_CONFIRMATION_COUNT=3) needs three
      // consecutive identical geocoding results.  Nudge the position twice
      // (>20 m apart, >1.5 s apart) to trigger the additional geocoding requests.
      for (const latOffset of [0.0003, 0.0006]) {
        await page.waitForTimeout(2000);
        await ctx.setGeolocation({
          latitude: MOCK_COORD.lat + latOffset,
          longitude: MOCK_COORD.lon,
          accuracy: 5,
        });
      }

      await page.waitForFunction(
        () => /Bela Vista/i.test(document.querySelector('#bairro-value')?.textContent ?? ''),
        { timeout: 12_000 },
      );

      await expect(page.locator('#bairro-value')).toContainText(/Bela Vista/i);
    } finally {
      await ctx.close();
    }
  });
});

// ── 6. Converter route ────────────────────────────────────────────────────────

test.describe('6. Converter route', () => {
  test('navigating to #/converter renders converter content', async ({ page }) => {
    await page.goto(CONV, { waitUntil: 'networkidle' });
    await expect(page.locator('body')).toContainText(/conversor|converter|coordenada/i);
  });

  test('converter footer link is present on the home page', async ({ page }) => {
    await page.goto(HOME, { waitUntil: 'networkidle' });
    await expect(page.locator('a[href="#/converter"]')).toBeAttached();
  });
});

// ── 7. Accessibility basics ───────────────────────────────────────────────────

test.describe('7. Accessibility basics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(HOME, { waitUntil: 'networkidle' });
  });

  test('html[lang] is "pt-BR"', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('pt-BR');
  });

  test('<main id="app-content"> is present', async ({ page }) => {
    await expect(page.locator('main#app-content')).toBeAttached();
  });

  test('skip-link is present', async ({ page }) => {
    await expect(page.locator('.skip-link')).toBeAttached();
  });

  test('#enable-location-btn has a non-empty aria-label', async ({ page }) => {
    const label = await page.locator('#enable-location-btn').getAttribute('aria-label');
    expect(label).toBeTruthy();
  });

  test('highlight card values have aria-live="polite"', async ({ page }) => {
    for (const id of ['municipio-value', 'bairro-value', 'logradouro-value']) {
      const val = await page.locator(`#${id}`).getAttribute('aria-live');
      expect(val).toBe('polite');
    }
  });
});

// ── 8. Service worker reachable ───────────────────────────────────────────────

test.describe('8. Service Worker', () => {
  test('service-worker.js responds HTTP 200', async ({ page }) => {
    const response = await page.goto('/service-worker.js');
    expect(response?.status()).toBe(200);
  });
});
