/**
 * @jest-environment jsdom
 */

/**
 * @file converter.test.js
 * @description Unit tests for the converter view object.
 * Tests render(), mount(), cleanup(), validation, and address display.
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import converterView from '../../src/views/converter.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

function buildConverterDOM() {
  document.body.innerHTML = `
    <div id="app">
      <form id="converter-form">
        <input id="latitude" type="number" value="" />
        <div id="latitude-error" hidden></div>
        <input id="longitude" type="number" value="" />
        <div id="longitude-error" hidden></div>
        <button type="submit">Converter</button>
      </form>
      <div id="results"></div>
      <div id="municipio-card"></div>
      <div id="bairro-card"></div>
    </div>
  `;
}

// ─── render ───────────────────────────────────────────────────────────────────

describe('converterView.render()', () => {
  test('returns a non-empty HTML string', () => {
    const html = converterView.render();
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(100);
  });

  test('HTML contains latitude and longitude inputs', () => {
    const html = converterView.render();
    expect(html).toContain('latitude');
    expect(html).toContain('longitude');
  });

  test('HTML contains a form element', () => {
    const html = converterView.render();
    expect(html).toContain('<form');
  });
});

// ─── title / styles ───────────────────────────────────────────────────────────

describe('converterView metadata', () => {
  test('has a title string', () => {
    expect(typeof converterView.title).toBe('string');
    expect(converterView.title.length).toBeGreaterThan(0);
  });

  test('styles is an array', () => {
    expect(Array.isArray(converterView.styles)).toBe(true);
  });
});

// ─── cleanup ──────────────────────────────────────────────────────────────────

describe('converterView.cleanup()', () => {
  test('does not throw', () => {
    expect(() => converterView.cleanup()).not.toThrow();
  });
});

// ─── mount ────────────────────────────────────────────────────────────────────

describe('converterView.mount()', () => {
  beforeEach(() => {
    document.body.innerHTML = converterView.render();
  });

  test('mounts without error when form is present', async () => {
    await expect(converterView.mount(document.body)).resolves.toBeUndefined();
  });

  test('mounts without error when form is absent', async () => {
    const emptyDiv = document.createElement('div');
    await expect(converterView.mount(emptyDiv)).resolves.toBeUndefined();
  });
});

// ─── _validateInput ───────────────────────────────────────────────────────────

describe('converterView._validateInput()', () => {
  beforeEach(buildConverterDOM);

  function getInput(id) {
    return document.getElementById(id);
  }

  test('returns false and shows error for empty latitude', () => {
    const input = getInput('latitude');
    input.value = '';
    const result = converterView._validateInput(input, 'latitude');
    expect(result).toBe(false);
    expect(document.getElementById('latitude-error').hidden).toBe(false);
  });

  test('returns false for non-numeric latitude', () => {
    const input = getInput('latitude');
    input.value = 'abc';
    const result = converterView._validateInput(input, 'latitude');
    expect(result).toBe(false);
  });

  test('returns false for latitude out of range (>90)', () => {
    const input = getInput('latitude');
    input.value = '91';
    expect(converterView._validateInput(input, 'latitude')).toBe(false);
  });

  test('returns false for latitude out of range (<-90)', () => {
    const input = getInput('latitude');
    input.value = '-91';
    expect(converterView._validateInput(input, 'latitude')).toBe(false);
  });

  test('returns true for valid latitude', () => {
    const input = getInput('latitude');
    input.value = '-23.55';
    expect(converterView._validateInput(input, 'latitude')).toBe(true);
  });

  test('returns false for longitude out of range (>180)', () => {
    const input = getInput('longitude');
    input.value = '181';
    expect(converterView._validateInput(input, 'longitude')).toBe(false);
  });

  test('returns true for valid longitude', () => {
    const input = getInput('longitude');
    input.value = '-46.63';
    expect(converterView._validateInput(input, 'longitude')).toBe(true);
  });
});

// ─── _clearError ──────────────────────────────────────────────────────────────

describe('converterView._clearError()', () => {
  beforeEach(buildConverterDOM);

  test('hides error div and clears text', () => {
    const input = document.getElementById('latitude');
    input.value = '';
    converterView._validateInput(input, 'latitude'); // show error first
    converterView._clearError(input);
    const errDiv = document.getElementById('latitude-error');
    expect(errDiv.hidden).toBe(true);
    expect(errDiv.textContent).toBe('');
  });
});

// ─── _fetchAddress ────────────────────────────────────────────────────────────

describe('converterView._fetchAddress()', () => {
  beforeEach(buildConverterDOM);

  test('shows loading state then renders address on success', async () => {
    const mockData = {
      display_name: 'Rua ABC, São Paulo',
      address: { road: 'Rua ABC', city: 'São Paulo', country: 'Brazil' },
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData),
    });

    await converterView._fetchAddress('-23.55', '-46.63');
    const results = document.getElementById('results');
    expect(results.innerHTML).toContain('Rua ABC');
  });

  test('shows error when fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network error'));
    await converterView._fetchAddress('-23.55', '-46.63');
    const results = document.getElementById('results');
    expect(results.innerHTML).toContain('Erro');
  });

  test('shows error when response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    await converterView._fetchAddress('-23.55', '-46.63');
    expect(document.getElementById('results').innerHTML).toContain('Erro');
  });

  test('shows error when data.error is set', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ error: 'Unable to geocode' }),
    });
    await converterView._fetchAddress('-23.55', '-46.63');
    expect(document.getElementById('results').innerHTML).toContain('Erro');
  });
});
