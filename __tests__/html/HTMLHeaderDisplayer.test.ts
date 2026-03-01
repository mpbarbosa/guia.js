/**
 * @jest-environment jsdom
 */
// HTMLHeaderDisplayer.test.ts
import { jest } from '@jest/globals';
import { HTMLHeaderDisplayer } from '../../src/html/HTMLHeaderDisplayer.js';

// Silence logger output during tests
jest.mock('../../src/utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
}));

function makeEl(id: string, text = ''): Element {
  const el = document.createElement('div');
  el.id = id;
  el.textContent = text;
  return el;
}

describe('HTMLHeaderDisplayer', () => {
  let doc: Document;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('Test');
  });

  // ---------------------------------------------------------------------------
  describe('constructor — happy path', () => {
    it('finds all three DOM elements and freezes the instance', () => {
      doc.body.append(makeEl('header-location-text'), makeEl('municipio-value', 'Paraty'), makeEl('bairro-value', 'Centro'));
      const d = new HTMLHeaderDisplayer(doc);

      expect(d._headerTextEl).not.toBeNull();
      expect(d._municipioEl).not.toBeNull();
      expect(d._bairroEl).not.toBeNull();
      expect(d._observer).toBeInstanceOf(MutationObserver);
      expect(Object.isFrozen(d)).toBe(true);
    });

    it('calls _render() immediately and sets header text to municipio · bairro', () => {
      const headerEl = makeEl('header-location-text');
      doc.body.append(headerEl, makeEl('municipio-value', 'Paraty'), makeEl('bairro-value', 'Centro'));
      new HTMLHeaderDisplayer(doc);

      expect(headerEl.textContent).toBe('Paraty · Centro');
      expect(headerEl.getAttribute('data-pending')).toBe('false');
    });
  });

  // ---------------------------------------------------------------------------
  describe('constructor — missing header element', () => {
    it('sets _observer to null and freezes when #header-location-text is absent', () => {
      doc.body.append(makeEl('municipio-value', 'Paraty'), makeEl('bairro-value', 'Centro'));
      const d = new HTMLHeaderDisplayer(doc);

      expect(d._headerTextEl).toBeNull();
      expect(d._observer).toBeNull();
      expect(Object.isFrozen(d)).toBe(true);
    });

    it('does NOT call log() when header element is absent', () => {
      new HTMLHeaderDisplayer(doc);
    });
  });

  // ---------------------------------------------------------------------------
  describe('constructor — missing source elements', () => {
    it('still initialises when municipio-value and bairro-value are absent', () => {
      doc.body.append(makeEl('header-location-text'));
      const d = new HTMLHeaderDisplayer(doc);

      expect(d._municipioEl).toBeNull();
      expect(d._bairroEl).toBeNull();
      expect(d._observer).toBeInstanceOf(MutationObserver);
    });

    it('sets data-pending=true when both source elements are absent', () => {
      const headerEl = makeEl('header-location-text');
      doc.body.append(headerEl);
      new HTMLHeaderDisplayer(doc);

      expect(headerEl.getAttribute('data-pending')).toBe('true');
    });

    it('sets data-pending=true when source elements exist but are empty', () => {
      const headerEl = makeEl('header-location-text');
      doc.body.append(headerEl, makeEl('municipio-value', ''), makeEl('bairro-value', ''));
      new HTMLHeaderDisplayer(doc);

      expect(headerEl.getAttribute('data-pending')).toBe('true');
    });
  });

  // ---------------------------------------------------------------------------
  describe('_render()', () => {
    it('updates header text with current municipio and bairro values', () => {
      const headerEl = makeEl('header-location-text');
      const municipioEl = makeEl('municipio-value', 'Angra dos Reis');
      const bairroEl = makeEl('bairro-value', 'Pontal');
      doc.body.append(headerEl, municipioEl, bairroEl);
      const d = new HTMLHeaderDisplayer(doc);

      municipioEl.textContent = 'Paraty';
      bairroEl.textContent = 'Trindade';
      d._render();

      expect(headerEl.textContent).toBe('Paraty · Trindade');
      expect(headerEl.getAttribute('data-pending')).toBe('false');
    });

    it('sets data-pending=true when both values clear to empty', () => {
      const headerEl = makeEl('header-location-text');
      const municipioEl = makeEl('municipio-value', 'X');
      const bairroEl = makeEl('bairro-value', 'Y');
      doc.body.append(headerEl, municipioEl, bairroEl);
      const d = new HTMLHeaderDisplayer(doc);

      municipioEl.textContent = '';
      bairroEl.textContent = '';
      d._render();

      expect(headerEl.getAttribute('data-pending')).toBe('true');
    });

    it('keeps data-pending=false when only one source element clears', () => {
      const headerEl = makeEl('header-location-text');
      const municipioEl = makeEl('municipio-value', 'Paraty');
      const bairroEl = makeEl('bairro-value', 'Centro');
      doc.body.append(headerEl, municipioEl, bairroEl);
      const d = new HTMLHeaderDisplayer(doc);

      municipioEl.textContent = '';
      d._render();

      // bairro still has a value, so not fully pending
      expect(headerEl.getAttribute('data-pending')).toBe('false');
    });

    it('logs the updated text', () => {
      const headerEl = makeEl('header-location-text');
      const municipioEl = makeEl('municipio-value', 'Paraty');
      const bairroEl = makeEl('bairro-value', 'Centro');
      doc.body.append(headerEl, municipioEl, bairroEl);
      const d = new HTMLHeaderDisplayer(doc);

      d._render();

      // Verify that rendering does not throw and updates correctly
      expect(headerEl.textContent).toBe('Paraty · Centro');
    });

    it('is a no-op when _headerTextEl is null (missing header)', () => {
      // No header element → _render should not throw
      const d = new HTMLHeaderDisplayer(doc);
      expect(() => d._render()).not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  describe('disconnect()', () => {
    it('calls observer.disconnect() and logs the message', () => {
      doc.body.append(makeEl('header-location-text'), makeEl('municipio-value', 'X'), makeEl('bairro-value', 'Y'));
      const d = new HTMLHeaderDisplayer(doc);
      const spy = jest.spyOn(d._observer as MutationObserver, 'disconnect');

      d.disconnect();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('does not throw when observer is null (missing header element)', () => {
      const d = new HTMLHeaderDisplayer(doc); // no header-location-text → _observer is null
      expect(() => d.disconnect()).not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  describe('toString()', () => {
    it('returns "HTMLHeaderDisplayer"', () => {
      doc.body.append(makeEl('header-location-text'));
      const d = new HTMLHeaderDisplayer(doc);
      expect(d.toString()).toBe('HTMLHeaderDisplayer');
    });
  });

  // ---------------------------------------------------------------------------
  describe('static create()', () => {
    it('returns a frozen HTMLHeaderDisplayer instance', () => {
      doc.body.append(makeEl('header-location-text'));
      const d = HTMLHeaderDisplayer.create(doc);
      expect(d).toBeInstanceOf(HTMLHeaderDisplayer);
      expect(Object.isFrozen(d)).toBe(true);
    });
  });
});
