'use strict';

/**
 * E2E Test: Version Label Validation
 *
 * Starts a local HTTP server, loads the application page in a headless browser,
 * and validates that the version badge displayed at the page bottom matches
 * the semver configured in src/config/version.js.
 *
 * @module __tests__/e2e/version-label.e2e.test
 * @since 0.11.2-alpha
 */

import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { VERSION, VERSION_WITH_DATE } from '../../src/config/version.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 9878;
const ROOT = path.join(__dirname, '../..');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

describe('E2E: Version Label Validation', () => {
  let browser, page, server;

  beforeAll(async () => {
    // Start HTTP server serving the repo root
    server = http.createServer((req, res) => {
      const urlPath = req.url === '/' ? '/src/index.html' : req.url;
      const filePath = path.join(ROOT, urlPath);
      const ext = path.extname(filePath);

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
        } else {
          res.writeHead(200, {
            'Content-Type': MIME_TYPES[ext] || 'text/plain',
          });
          res.end(data);
        }
      });
    });

    await new Promise((resolve) => server.listen(PORT, resolve));

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }, 30000);

  afterAll(async () => {
    if (browser) await browser.close();
    if (server) await new Promise((resolve) => server.close(resolve));
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    if (page) await page.close();
  });

  test('version badge element exists on the page', async () => {
    await page.goto(`http://localhost:${PORT}/src/index.html`, { waitUntil: 'networkidle0', timeout: 30000 });

    const badge = await page.$('.app-version');
    expect(badge).not.toBeNull();
  });

  test('version badge contains the configured semver from src/config/version.js', async () => {
    await page.goto(`http://localhost:${PORT}/src/index.html`, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for versionDisplayManager to update the badge text
    await page.waitForFunction(
      (expectedVersion) =>
        document.querySelector('.app-version')?.textContent?.includes(expectedVersion),
      { timeout: 10000 },
      VERSION
    );

    const badgeText = await page.$eval('.app-version', (el) => el.textContent.trim());

    expect(badgeText).toContain(VERSION);
  });

  test('version badge displays the full VERSION_WITH_DATE string', async () => {
    await page.goto(`http://localhost:${PORT}/src/index.html`, { waitUntil: 'networkidle0', timeout: 30000 });

    await page.waitForFunction(
      (expected) =>
        document.querySelector('.app-version')?.textContent?.includes(expected),
      { timeout: 10000 },
      VERSION
    );

    const badgeText = await page.$eval('.app-version', (el) => el.textContent.trim());

    expect(badgeText).toBe(VERSION_WITH_DATE);
  });
});
