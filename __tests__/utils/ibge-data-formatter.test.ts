/**
 * @file ibge-data-formatter.test.js
 * @description Tests for IBGEDataFormatter — population formatting, city
 * classification, HTML generation, and technical-output parsing.
 * @since 0.11.0-alpha
 */

import { jest } from '@jest/globals';
// IBGEDataFormatter is a singleton; reset between tests by clearing the instance.
import ibgeFormatter from '../../src/utils/ibge-data-formatter.js';

describe('IBGEDataFormatter', () => {

  // ─── formatPopulation ─────────────────────────────────────────────────────

  describe('formatPopulation()', () => {
    test('formats a large number with Brazilian locale', () => {
      const result = ibgeFormatter.formatPopulation(12325232);
      // Brazilian locale uses period as thousands separator
      expect(result).toMatch(/12/);
      expect(result).toMatch(/325/);
    });

    test('returns "N/A" for null', () => {
      expect(ibgeFormatter.formatPopulation(null)).toBe('N/A');
    });

    test('returns "N/A" for undefined', () => {
      expect(ibgeFormatter.formatPopulation(undefined)).toBe('N/A');
    });

    test('returns "N/A" for NaN', () => {
      expect(ibgeFormatter.formatPopulation(NaN)).toBe('N/A');
    });

    test('formats small population', () => {
      const result = ibgeFormatter.formatPopulation(500);
      expect(result).toContain('500');
    });
  });

  // ─── formatPopulationNaturalLanguage ──────────────────────────────────────

  describe('formatPopulationNaturalLanguage()', () => {
    test('returns "não disponível" for null', () => {
      expect(ibgeFormatter.formatPopulationNaturalLanguage(null))
        .toBe('População não disponível');
    });

    test('returns "não disponível" for undefined', () => {
      expect(ibgeFormatter.formatPopulationNaturalLanguage(undefined))
        .toBe('População não disponível');
    });

    test('formats millions correctly — 1 milhão', () => {
      const result = ibgeFormatter.formatPopulationNaturalLanguage(1000000);
      expect(result).toContain('milhão');
    });

    test('formats millions correctly — plural milhões', () => {
      const result = ibgeFormatter.formatPopulationNaturalLanguage(5000000);
      expect(result).toContain('milhões');
    });

    test('formats thousands correctly', () => {
      const result = ibgeFormatter.formatPopulationNaturalLanguage(50000);
      expect(result).toContain('mil');
    });

    test('formats small numbers without suffix', () => {
      const result = ibgeFormatter.formatPopulationNaturalLanguage(500);
      expect(result).not.toContain('mil');
      expect(result).not.toContain('milhão');
    });
  });

  // ─── classifyCity ─────────────────────────────────────────────────────────

  describe('classifyCity()', () => {
    test('≥ 1 000 000 → Metrópole', () => {
      const c = ibgeFormatter.classifyCity(12000000);
      expect(c.label).toBe('Metrópole');
    });

    test('≥ 500 000 → Cidade Grande', () => {
      const c = ibgeFormatter.classifyCity(600000);
      expect(c.label).toBe('Cidade Grande');
    });

    test('≥ 100 000 → Cidade Média-Grande', () => {
      const c = ibgeFormatter.classifyCity(150000);
      expect(c.label).toBe('Cidade Média-Grande');
    });

    test('≥ 50 000 → Cidade Média', () => {
      const c = ibgeFormatter.classifyCity(60000);
      expect(c.label).toBe('Cidade Média');
    });

    test('≥ 20 000 → Cidade Pequena-Média', () => {
      const c = ibgeFormatter.classifyCity(25000);
      expect(c.label).toBe('Cidade Pequena-Média');
    });

    test('< 20 000 → Cidade Pequena', () => {
      const c = ibgeFormatter.classifyCity(5000);
      expect(c.label).toBe('Cidade Pequena');
    });

    test('returns object with icon and description', () => {
      const c = ibgeFormatter.classifyCity(2000000);
      expect(typeof c.icon).toBe('string');
      expect(typeof c.description).toBe('string');
    });
  });

  // ─── generateFormattedHTML ────────────────────────────────────────────────

  describe('generateFormattedHTML()', () => {
    test('returns HTML string with no-data message when data is null', () => {
      const html = ibgeFormatter.generateFormattedHTML(null);
      expect(html).toContain('ibge-data-formatted');
      expect(html).toContain('Dados demográficos não disponíveis');
    });

    test('returns HTML string with no-data message when population is missing', () => {
      const html = ibgeFormatter.generateFormattedHTML({ municipio: 'X', uf: 'SP' });
      expect(html).toContain('Dados demográficos não disponíveis');
    });

    test('contains natural-language population for valid data', () => {
      const html = ibgeFormatter.generateFormattedHTML({
        population: 12000000,
        municipio: 'São Paulo',
        uf: 'SP',
      });
      expect(html).toContain('milhões');
    });

    test('contains municipality name', () => {
      const html = ibgeFormatter.generateFormattedHTML({
        population: 50000,
        municipio: 'Ouro Preto',
        uf: 'MG',
      });
      expect(html).toContain('Ouro Preto');
    });

    test('contains state abbreviation', () => {
      const html = ibgeFormatter.generateFormattedHTML({
        population: 50000,
        municipio: 'Ouro Preto',
        uf: 'MG',
      });
      expect(html).toContain('MG');
    });

    test('contains classification label', () => {
      const html = ibgeFormatter.generateFormattedHTML({
        population: 50000,
        municipio: 'Campina Verde',
        uf: 'MG',
      });
      expect(html).toMatch(/Cidade/);
    });

    test('defaults year to 2024 when not provided', () => {
      const html = ibgeFormatter.generateFormattedHTML({
        population: 100000,
        municipio: 'X',
        uf: 'SP',
      });
      expect(html).toContain('2024');
    });

    test('uses provided year', () => {
      const html = ibgeFormatter.generateFormattedHTML({
        population: 100000,
        municipio: 'X',
        uf: 'SP',
        year: '2023',
      });
      expect(html).toContain('2023');
    });

    test('includes IBGE source link', () => {
      const html = ibgeFormatter.generateFormattedHTML({
        population: 100000,
        municipio: 'X',
        uf: 'SP',
      });
      expect(html).toContain('ibge.gov.br');
    });
  });

  // ─── parseTechnicalOutput ─────────────────────────────────────────────────

  describe('parseTechnicalOutput()', () => {
    test('returns null for null input', () => {
      expect(ibgeFormatter.parseTechnicalOutput(null)).toBeNull();
    });

    test('returns null for empty string', () => {
      expect(ibgeFormatter.parseTechnicalOutput('')).toBeNull();
    });

    test('extracts population from "População: 12345678"', () => {
      const result = ibgeFormatter.parseTechnicalOutput('População: 12345678');
      expect(result).not.toBeNull();
      expect(result.population).toBe(12345678);
    });

    test('extracts population from "12345678 habitantes"', () => {
      const result = ibgeFormatter.parseTechnicalOutput('Total: 12345678 habitantes');
      expect(result).not.toBeNull();
      expect(result.population).toBe(12345678);
    });

    test('extracts a standalone large number as population', () => {
      const result = ibgeFormatter.parseTechnicalOutput('Estimativa: 50000');
      expect(result).not.toBeNull();
      expect(result.population).toBe(50000);
    });

    test('ignores standalone number outside 1000–20 000 000 range', () => {
      // Number too small (< 1000) falls through all patterns
      const result = ibgeFormatter.parseTechnicalOutput('count: 42');
      expect(result).toBeNull();
    });

    test('handles comma-separated number in "habitantes" pattern', () => {
      const result = ibgeFormatter.parseTechnicalOutput('1.234.567 habitantes');
      expect(result).not.toBeNull();
    });
  });

  // ─── singleton behaviour ──────────────────────────────────────────────────

  describe('singleton', () => {
    test('CITY_CLASSIFICATIONS contains all expected keys', () => {
      const keys = Object.keys(ibgeFormatter.CITY_CLASSIFICATIONS);
      expect(keys).toContain('METROPOLIS');
      expect(keys).toContain('LARGE');
      expect(keys).toContain('SMALL');
    });

    test('instance has formatPopulation method', () => {
      expect(typeof ibgeFormatter.formatPopulation).toBe('function');
    });

    test('second new IBGEDataFormatter() returns same singleton', async () => {
      const { IBGEDataFormatter } = await import('../../src/utils/ibge-data-formatter.js');
      if (!IBGEDataFormatter) return; // named export not available
      const second = new IBGEDataFormatter();
      expect(second).toBe(ibgeFormatter);
    });
  });

  // ─── interceptAndFormat ───────────────────────────────────────────────────

  describe('interceptAndFormat()', () => {
    test('returns early when element is null', async () => {
      await expect(ibgeFormatter.interceptAndFormat(null, 'PopEst', {}))
        .resolves.toBeUndefined();
    });

    test('handles fetch error gracefully (catch branch)', async () => {
      // Simulate fetch throwing (no network in Node)
      const el = { innerHTML: '' };
      // fetch is not available in node, so this will throw → catch branch covered
      await expect(ibgeFormatter.interceptAndFormat(el, 'PopEst', {
        municipio: 'TestCity', siglaUf: 'SP'
      })).resolves.toBeUndefined();
      // element should contain an error or loading state
      expect(el.innerHTML).not.toBe('');
    });

    test('shows unavailable when fetch returns ok:false and no displaySidraDadosParams', async () => {
      const origFetch = global.fetch;
      global.fetch = jest.fn(() =>
        Promise.resolve({ ok: false, json: jest.fn() })
      );
      if (typeof global.window !== 'undefined') {
        delete global.window.displaySidraDadosParams;
      }

      const el = { innerHTML: '' };
      await ibgeFormatter.interceptAndFormat(el, 'PopEst', {
        municipio: 'TestCity', siglaUf: 'SP'
      });

      // Should show the "not available" message
      expect(el.innerHTML).toContain('IBGE');

      global.fetch = origFetch;
    });

    test('uses local data when fetch succeeds with matching municipality', async () => {
      const localData = [
        { municipio: 'São Paulo', uf: 'SP', populacao: '12325232', ano: '2023' }
      ];
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: jest.fn(() => Promise.resolve(localData))
        })
      );

      const el = { innerHTML: '' };
      await ibgeFormatter.interceptAndFormat(el, 'PopEst', {
        municipio: 'São Paulo', siglaUf: 'SP'
      });

      expect(el.innerHTML).toContain('12');

      delete global.fetch;
    });
  });
});
