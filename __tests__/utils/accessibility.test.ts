/**
 * @file accessibility.test.js
 * @description Tests for accessibility utility functions.
 * Covers accessibleEmoji, replaceEmojisWithAccessible, ACCESSIBLE_EMOJIS constant,
 * and createAccessibleEmoji DOM helper.
 * @since 0.11.0-alpha
 */

import {
  accessibleEmoji,
  replaceEmojisWithAccessible,
  ACCESSIBLE_EMOJIS,
  createAccessibleEmoji,
  makeEmojisAccessible,
} from '../../src/utils/accessibility.js';

describe('accessibility utilities', () => {

  // ─── accessibleEmoji ──────────────────────────────────────────────────────

  describe('accessibleEmoji()', () => {
    test('returns HTML string with role=img', () => {
      const html = accessibleEmoji('📍', 'Location pin');
      expect(html).toContain('role="img"');
    });

    test('returns HTML string with aria-label', () => {
      const html = accessibleEmoji('📍', 'Location pin');
      expect(html).toContain('aria-label="Location pin"');
    });

    test('contains the emoji character', () => {
      const html = accessibleEmoji('🗺️', 'Map');
      expect(html).toContain('🗺️');
    });

    test('wraps in span element', () => {
      const html = accessibleEmoji('🌍', 'Globe');
      expect(html).toMatch(/^<span/);
      expect(html).toMatch(/<\/span>$/);
    });
  });

  // ─── createAccessibleEmoji ────────────────────────────────────────────────

  describe('createAccessibleEmoji()', () => {
    test('returns a span element', () => {
      const el = createAccessibleEmoji('📍', 'Location');
      expect(el.tagName).toBe('SPAN');
    });

    test('has role=img', () => {
      const el = createAccessibleEmoji('📍', 'Location');
      expect(el.getAttribute('role')).toBe('img');
    });

    test('has correct aria-label', () => {
      const el = createAccessibleEmoji('🗺️', 'Map of Brazil');
      expect(el.getAttribute('aria-label')).toBe('Map of Brazil');
    });

    test('contains the emoji text', () => {
      const el = createAccessibleEmoji('🧭', 'Compass');
      expect(el.textContent).toBe('🧭');
    });
  });

  // ─── ACCESSIBLE_EMOJIS ────────────────────────────────────────────────────

  describe('ACCESSIBLE_EMOJIS constant', () => {
    test('has LOCATION_PIN entry', () => {
      expect(ACCESSIBLE_EMOJIS.LOCATION_PIN).toBeDefined();
      expect(ACCESSIBLE_EMOJIS.LOCATION_PIN.emoji).toBe('📍');
    });

    test('has MAP entry', () => {
      expect(ACCESSIBLE_EMOJIS.MAP).toBeDefined();
    });

    test('each entry has emoji and label properties', () => {
      for (const [key, val] of Object.entries(ACCESSIBLE_EMOJIS)) {
        expect(typeof val.emoji).toBe('string');
        expect(typeof val.label).toBe('string');
        expect(val.label.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── replaceEmojisWithAccessible ──────────────────────────────────────────

  describe('replaceEmojisWithAccessible()', () => {
    test('replaces emoji with accessible span', () => {
      const result = replaceEmojisWithAccessible('Hello 📍 world', { '📍': 'Location' });
      expect(result).toContain('role="img"');
      expect(result).toContain('aria-label="Location"');
    });

    test('replaces all occurrences of an emoji', () => {
      const result = replaceEmojisWithAccessible('📍 here and 📍 there', { '📍': 'Pin' });
      const count = (result.match(/role="img"/g) || []).length;
      expect(count).toBe(2);
    });

    test('leaves text without target emojis unchanged', () => {
      const result = replaceEmojisWithAccessible('No emojis here', { '📍': 'Pin' });
      expect(result).toBe('No emojis here');
    });

    test('handles multiple different emojis in map', () => {
      const result = replaceEmojisWithAccessible('📍 and 🗺️', {
        '📍': 'Pin',
        '🗺️': 'Map',
      });
      expect(result).toContain('aria-label="Pin"');
      expect(result).toContain('aria-label="Map"');
    });

    test('returns original text when emojiMap is empty', () => {
      const result = replaceEmojisWithAccessible('Hello 📍', {});
      expect(result).toBe('Hello 📍');
    });
  });

  // ─── makeEmojisAccessible ─────────────────────────────────────────────────

  describe('makeEmojisAccessible()', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    test('does not throw on empty container', () => {
      const div = document.createElement('div');
      expect(() => makeEmojisAccessible(div)).not.toThrow();
    });

    test('does not modify text without emojis', () => {
      const div = document.createElement('div');
      div.textContent = 'No emojis here';
      makeEmojisAccessible(div);
      expect(div.textContent).toBe('No emojis here');
    });

    test('skips elements already marked with role=img', () => {
      const div = document.createElement('div');
      const span = document.createElement('span');
      span.setAttribute('role', 'img');
      span.textContent = '📍';
      div.appendChild(span);
      makeEmojisAccessible(div);
      // Should remain as-is
      expect(div.querySelector('[role="img"]')).not.toBeNull();
    });

    test('wraps recognized emoji in accessible span', () => {
      const div = document.createElement('div');
      // Use an emoji present in ACCESSIBLE_EMOJIS
      const knownEmoji = Object.values(ACCESSIBLE_EMOJIS)[0].emoji;
      div.textContent = `${knownEmoji} some text`;
      document.body.appendChild(div);
      makeEmojisAccessible(div);
      // Should find an accessible span wrapping the emoji
      const spans = div.querySelectorAll('[role="img"]');
      expect(spans.length).toBeGreaterThanOrEqual(1);
    });
  });
});
