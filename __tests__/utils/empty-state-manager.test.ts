/**
 * @file empty-state-manager.test.js
 * @description Tests for empty-state-manager.js utility functions.
 * @since 0.11.0-alpha
 */

import { jest } from '@jest/globals';

jest.mock('../../src/utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

import {
  showEmptyState,
  clearEmptyState,
  hasEmptyState,
  showLocationResultsEmptyState,
  showCoordinatesEmptyState,
  showReferencePlaceEmptyState,
  showAddressEmptyState,
  showSidraEmptyState,
  initializeEmptyStates,
  clearAllEmptyStates,
} from '../../src/utils/empty-state-manager.js';

describe('empty-state-manager', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // ─── showEmptyState ───────────────────────────────────────────────────────

  describe('showEmptyState()', () => {
    test('returns null when element is null', () => {
      expect(showEmptyState(null, { icon: '📍', title: 'T', description: 'D' })).toBeNull();
    });

    test('clears existing content before showing new empty state', () => {
      container.innerHTML = '<div class="old-content">Old</div>';
      showEmptyState(container, { icon: '📍', title: 'T', description: 'D' });
      expect(container.querySelector('.old-content')).toBeNull();
    });

    test('returns the created empty state element', () => {
      const el = showEmptyState(container, { icon: '📍', title: 'T', description: 'D' });
      expect(el).toBeInstanceOf(HTMLElement);
      expect(el.className).toContain('empty-state');
    });

    test('appends element to container', () => {
      showEmptyState(container, { icon: '📍', title: 'T', description: 'D' });
      expect(container.querySelector('.empty-state')).not.toBeNull();
    });

    test('renders title text', () => {
      showEmptyState(container, { icon: '📍', title: 'Test Title', description: 'Desc' });
      expect(container.querySelector('.empty-state-title').textContent).toBe('Test Title');
    });

    test('renders description text', () => {
      showEmptyState(container, { icon: '📍', title: 'T', description: 'My Description' });
      expect(container.querySelector('.empty-state-description').textContent).toBe('My Description');
    });

    test('renders action button when action and onAction provided', () => {
      const onAction = jest.fn();
      showEmptyState(container, { icon: '📍', title: 'T', description: 'D', action: 'Clique aqui', onAction });
      const btn = container.querySelector('.empty-state-action');
      expect(btn).not.toBeNull();
      expect(btn.textContent).toBe('Clique aqui');
    });

    test('action button calls onAction when clicked', () => {
      const onAction = jest.fn();
      showEmptyState(container, { icon: '📍', title: 'T', description: 'D', action: 'Clique', onAction });
      container.querySelector('.empty-state-action').click();
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  // ─── clearEmptyState ──────────────────────────────────────────────────────

  describe('clearEmptyState()', () => {
    test('removes .empty-state child from element', () => {
      showEmptyState(container, { icon: '📍', title: 'T', description: 'D' });
      expect(container.querySelector('.empty-state')).not.toBeNull();
      clearEmptyState(container);
      expect(container.querySelector('.empty-state')).toBeNull();
    });

    test('does nothing when element has no empty state', () => {
      expect(() => clearEmptyState(container)).not.toThrow();
    });

    test('does nothing when element is null', () => {
      expect(() => clearEmptyState(null)).not.toThrow();
    });
  });

  // ─── hasEmptyState ────────────────────────────────────────────────────────

  describe('hasEmptyState()', () => {
    test('returns true when empty state is present', () => {
      showEmptyState(container, { icon: '📍', title: 'T', description: 'D' });
      expect(hasEmptyState(container)).toBe(true);
    });

    test('returns false when no empty state', () => {
      expect(hasEmptyState(container)).toBe(false);
    });

    test('returns false for null element', () => {
      expect(hasEmptyState(null)).toBe(false);
    });
  });

  // ─── DOM-dependent helpers ────────────────────────────────────────────────

  describe('showLocationResultsEmptyState()', () => {
    test('does nothing when #locationResult is absent', () => {
      expect(() => showLocationResultsEmptyState()).not.toThrow();
    });

    test('shows empty state in #locationResult when present', () => {
      const el = document.createElement('div');
      el.id = 'locationResult';
      document.body.appendChild(el);
      showLocationResultsEmptyState();
      expect(el.querySelector('.empty-state')).not.toBeNull();
    });
  });

  describe('showCoordinatesEmptyState()', () => {
    test('does nothing when #lat-long-display is absent', () => {
      expect(() => showCoordinatesEmptyState()).not.toThrow();
    });

    test('sets waiting text in #lat-long-display', () => {
      const el = document.createElement('div');
      el.id = 'lat-long-display';
      document.body.appendChild(el);
      showCoordinatesEmptyState();
      expect(el.innerHTML).toContain('Aguardando');
    });
  });

  describe('showReferencePlaceEmptyState()', () => {
    test('does nothing when #reference-place-display is absent', () => {
      expect(() => showReferencePlaceEmptyState()).not.toThrow();
    });

    test('sets waiting text in #reference-place-display', () => {
      const el = document.createElement('div');
      el.id = 'reference-place-display';
      document.body.appendChild(el);
      showReferencePlaceEmptyState();
      expect(el.innerHTML).toContain('Aguardando');
    });
  });

  describe('showAddressEmptyState()', () => {
    test('does nothing when #endereco-padronizado-display is absent', () => {
      expect(() => showAddressEmptyState()).not.toThrow();
    });

    test('sets waiting text in #endereco-padronizado-display', () => {
      const el = document.createElement('div');
      el.id = 'endereco-padronizado-display';
      document.body.appendChild(el);
      showAddressEmptyState();
      expect(el.innerHTML).toContain('Aguardando');
    });
  });

  describe('showSidraEmptyState()', () => {
    test('does nothing when #dadosSidra is absent', () => {
      expect(() => showSidraEmptyState()).not.toThrow();
    });

    test('sets waiting text in #dadosSidra', () => {
      const el = document.createElement('div');
      el.id = 'dadosSidra';
      document.body.appendChild(el);
      showSidraEmptyState();
      expect(el.innerHTML).toContain('Aguardando');
    });
  });

  // ─── initializeEmptyStates / clearAllEmptyStates ──────────────────────────

  describe('initializeEmptyStates()', () => {
    test('does not throw when DOM elements are absent', () => {
      expect(() => initializeEmptyStates()).not.toThrow();
    });

    test('shows empty state in #locationResult when present', () => {
      const el = document.createElement('div');
      el.id = 'locationResult';
      document.body.appendChild(el);
      initializeEmptyStates();
      expect(el.querySelector('.empty-state')).not.toBeNull();
    });
  });

  describe('clearAllEmptyStates()', () => {
    test('does not throw when #locationResult is absent', () => {
      expect(() => clearAllEmptyStates()).not.toThrow();
    });

    test('clears empty state from #locationResult', () => {
      const el = document.createElement('div');
      el.id = 'locationResult';
      document.body.appendChild(el);
      showEmptyState(el, { icon: '📍', title: 'T', description: 'D' });
      clearAllEmptyStates();
      expect(el.querySelector('.empty-state')).toBeNull();
    });
  });
});
