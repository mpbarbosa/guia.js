/**
 * @jest-environment node
 */

import { beforeAll, describe, expect, jest, test } from '@jest/globals';
import { readFile } from 'fs/promises';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceWorkerPath = path.resolve(__dirname, '../../public/service-worker.js');

let serviceWorkerSource = '';

function loadServiceWorker({ caches, fetchImpl }) {
  const listeners = new Map();
  const context = {
    caches,
    fetch: fetchImpl,
    console: {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    },
    Promise,
    Request,
    Response,
    URL,
    setTimeout,
    clearTimeout,
    self: {
      location: { origin: 'https://example.com' },
      clients: { claim: jest.fn(() => Promise.resolve()) },
      skipWaiting: jest.fn(() => Promise.resolve()),
      addEventListener: jest.fn((eventName, handler) => {
        listeners.set(eventName, handler);
      }),
    },
  };

  vm.runInNewContext(serviceWorkerSource, context, { filename: serviceWorkerPath });

  return { context, listeners };
}

describe('service-worker cache writes', () => {
  beforeAll(async () => {
    serviceWorkerSource = await readFile(serviceWorkerPath, 'utf8');
  });

  test('networkFirstStrategy returns the network response before cache writes finish', async () => {
    let resolveCacheWrite;
    const cacheWritePromise = new Promise((resolve) => {
      resolveCacheWrite = resolve;
    });
    const event = {
      waitUntil: jest.fn(),
    };
    const request = new Request('https://example.com/api/places');
    const response = new Response('ok', { status: 200 });
    const caches = {
      open: jest.fn(() =>
        Promise.resolve({
          put: jest.fn(() => cacheWritePromise),
        })
      ),
      match: jest.fn(() => Promise.resolve(undefined)),
    };
    const { context } = loadServiceWorker({
      caches,
      fetchImpl: jest.fn(() => Promise.resolve(response)),
    });

    const timeoutMarker = Symbol('timeout');
    const responsePromise = context.networkFirstStrategy(request, event);
    const resolvedResponse = await Promise.race([
      responsePromise,
      new Promise((resolve) => {
        setTimeout(() => resolve(timeoutMarker), 0);
      }),
    ]);

    expect(resolvedResponse).toBe(response);
    expect(event.waitUntil).toHaveBeenCalledTimes(1);

    resolveCacheWrite();
    await responsePromise;
    await event.waitUntil.mock.calls[0][0];
  });

  test('cacheFirstStrategy does not fail a successful fetch when cache.put rejects', async () => {
    const cacheError = new Error('cache write failed');
    const event = {
      waitUntil: jest.fn(),
    };
    const request = new Request('https://example.com/app.js');
    const response = new Response('bundle', { status: 200 });
    const caches = {
      open: jest.fn(() =>
        Promise.resolve({
          put: jest.fn(() => Promise.reject(cacheError)),
        })
      ),
      match: jest.fn(() => Promise.resolve(undefined)),
    };
    const { context } = loadServiceWorker({
      caches,
      fetchImpl: jest.fn(() => Promise.resolve(response)),
    });

    await expect(context.cacheFirstStrategy(request, event)).resolves.toBe(response);
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
    await expect(event.waitUntil.mock.calls[0][0]).resolves.toBeUndefined();
    expect(context.console.warn).toHaveBeenCalledWith(
      '[SW] Failed to update cache:',
      request.url,
      cacheError
    );
  });
});
