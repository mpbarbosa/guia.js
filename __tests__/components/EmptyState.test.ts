/**
 * @jest-environment jsdom
 */

/**
 * @file EmptyState.test.js
 * @description Tests for src/components/EmptyState.js — createEmptyState() and EMPTY_STATES.
 */

import { jest } from '@jest/globals';

import { createEmptyState, EMPTY_STATES } from '../../src/components/EmptyState.js';

describe('EmptyState', () => {

  // ── createEmptyState ─────────────────────────────────────────────────────────

  describe('createEmptyState()', () => {

    test('returns an HTMLElement', () => {
      const el = createEmptyState({ icon: '📍', title: 'Title', description: 'Desc' });
      expect(el).toBeInstanceOf(HTMLElement);
    });

    test('root element has class "empty-state"', () => {
      const el = createEmptyState({ icon: '📍', title: 'Title', description: 'Desc' });
      expect(el.className).toBe('empty-state');
    });

    test('root element has role="status"', () => {
      const el = createEmptyState({ icon: '📍', title: 'Title', description: 'Desc' });
      expect(el.getAttribute('role')).toBe('status');
    });

    test('root element has aria-live="polite"', () => {
      const el = createEmptyState({ icon: '📍', title: 'Title', description: 'Desc' });
      expect(el.getAttribute('aria-live')).toBe('polite');
    });

    test('icon element has class "empty-state-icon" and aria-hidden', () => {
      const el = createEmptyState({ icon: '🗺️', title: 'T', description: 'D' });
      const iconEl = el.querySelector('.empty-state-icon');
      expect(iconEl).not.toBeNull();
      expect(iconEl.textContent).toBe('🗺️');
      expect(iconEl.getAttribute('aria-hidden')).toBe('true');
    });

    test('title element is an h3 with correct text', () => {
      const el = createEmptyState({ icon: '⏳', title: 'My Title', description: 'D' });
      const titleEl = el.querySelector('.empty-state-title');
      expect(titleEl).not.toBeNull();
      expect(titleEl.tagName).toBe('H3');
      expect(titleEl.textContent).toBe('My Title');
    });

    test('description element is a p with correct text', () => {
      const el = createEmptyState({ icon: '⚠️', title: 'T', description: 'My description' });
      const descEl = el.querySelector('.empty-state-description');
      expect(descEl).not.toBeNull();
      expect(descEl.tagName).toBe('P');
      expect(descEl.textContent).toBe('My description');
    });

    test('no action button when action/onAction not provided', () => {
      const el = createEmptyState({ icon: '📍', title: 'T', description: 'D' });
      expect(el.querySelector('.empty-state-action')).toBeNull();
    });

    test('action button rendered when action and onAction are provided', () => {
      const onAction = jest.fn();
      const el = createEmptyState({
        icon: '📍', title: 'T', description: 'D',
        action: 'Tentar novamente', onAction,
      });
      const btn = el.querySelector('.empty-state-action');
      expect(btn).not.toBeNull();
      expect(btn.textContent).toBe('Tentar novamente');
    });

    test('action button calls onAction when clicked', () => {
      const onAction = jest.fn();
      const el = createEmptyState({
        icon: '📍', title: 'T', description: 'D',
        action: 'Click me', onAction,
      });
      const btn = el.querySelector('.empty-state-action');
      btn.click();
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    test('no action button when only action is provided (no onAction)', () => {
      const el = createEmptyState({ icon: '📍', title: 'T', description: 'D', action: 'X' });
      expect(el.querySelector('.empty-state-action')).toBeNull();
    });

    test('no action button when only onAction is provided (no action text)', () => {
      const el = createEmptyState({ icon: '📍', title: 'T', description: 'D', onAction: jest.fn() });
      expect(el.querySelector('.empty-state-action')).toBeNull();
    });
  });

  // ── EMPTY_STATES catalog ─────────────────────────────────────────────────────

  describe('EMPTY_STATES', () => {
    const requiredKeys = ['NO_LOCATION', 'NO_ADDRESS', 'NO_MUNICIPIO', 'NO_BAIRRO', 'LOADING', 'ERROR'];

    test.each(requiredKeys)('has key %s', (key) => {
      expect(EMPTY_STATES).toHaveProperty(key);
    });

    test.each(requiredKeys)('%s has icon, title, and description', (key) => {
      const entry = EMPTY_STATES[key];
      expect(typeof entry.icon).toBe('string');
      expect(entry.icon.length).toBeGreaterThan(0);
      expect(typeof entry.title).toBe('string');
      expect(entry.title.length).toBeGreaterThan(0);
      expect(typeof entry.description).toBe('string');
      expect(entry.description.length).toBeGreaterThan(0);
    });

    test('EMPTY_STATES entries can be passed directly to createEmptyState()', () => {
      for (const [, config] of Object.entries(EMPTY_STATES)) {
        expect(() => createEmptyState(config)).not.toThrow();
      }
    });
  });
});
