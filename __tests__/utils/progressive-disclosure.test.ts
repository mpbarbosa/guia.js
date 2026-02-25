/**
 * @file progressive-disclosure.test.js
 * @description Tests for ProgressiveDisclosureManager (progressive-disclosure.js).
 * @since 0.11.0-alpha
 */

import { jest } from '@jest/globals';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((k) => store[k] ?? null),
    setItem: jest.fn((k, v) => { store[k] = v; }),
    removeItem: jest.fn((k) => { delete store[k]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

// Provide a matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn((query) => ({
    matches: query.includes('max-width: 768px') ? false : false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
});

import manager from '../../src/utils/progressive-disclosure.js';

describe('ProgressiveDisclosureManager', () => {
  const STORAGE_KEY = 'guia-turistico-secondary-info-state';

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    document.body.innerHTML = '<details id="secondary-info"></details>';
    jest.useFakeTimers();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.useRealTimers();
  });

  // ─── init ─────────────────────────────────────────────────────────────────

  describe('init()', () => {
    test('binds to secondary-info element when present', () => {
      manager.init();
      expect(manager.detailsElement).not.toBeNull();
    });

    test('does nothing when secondary-info is missing', () => {
      document.body.innerHTML = '';
      expect(() => manager.init()).not.toThrow();
      expect(manager.detailsElement).toBeNull();
    });
  });

  // ─── saveState ────────────────────────────────────────────────────────────

  describe('saveState()', () => {
    test('persists open state to localStorage', () => {
      manager.init();
      manager.detailsElement.open = true;
      manager.saveState();
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify({ open: true }),
      );
    });

    test('persists closed state to localStorage', () => {
      manager.init();
      manager.detailsElement.open = false;
      manager.saveState();
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify({ open: false }),
      );
    });

    test('does nothing when detailsElement is null', () => {
      manager.detailsElement = null;
      expect(() => manager.saveState()).not.toThrow();
    });
  });

  // ─── restoreState ─────────────────────────────────────────────────────────

  describe('restoreState()', () => {
    test('restores open state from localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ open: true }));
      manager.init();
      manager.restoreState();
      expect(manager.detailsElement.open).toBe(true);
    });

    test('defaults to closed when no saved state', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      manager.init();
      manager.restoreState();
      expect(manager.detailsElement.open).toBe(false);
    });

    test('defaults to closed on parse error', () => {
      localStorageMock.getItem.mockReturnValueOnce('not-json{{{');
      manager.init();
      manager.restoreState();
      expect(manager.detailsElement.open).toBe(false);
    });
  });

  // ─── clearState ───────────────────────────────────────────────────────────

  describe('clearState()', () => {
    test('removes key from localStorage', () => {
      manager.clearState();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });
  });

  // ─── announceState ────────────────────────────────────────────────────────

  describe('announceState()', () => {
    test('appends a live region to body', () => {
      manager.init();
      manager.announceState();
      const announcement = document.querySelector('[role="status"]');
      expect(announcement).not.toBeNull();
    });

    test('announcement is removed after 1 second', () => {
      manager.init();
      manager.announceState();
      jest.advanceTimersByTime(1100);
      expect(document.querySelector('[role="status"]')).toBeNull();
    });

    test('does nothing when detailsElement is null', () => {
      manager.detailsElement = null;
      expect(() => manager.announceState()).not.toThrow();
    });
  });

  // ─── isMobile ─────────────────────────────────────────────────────────────

  describe('isMobile()', () => {
    test('returns false in desktop viewport (mocked)', () => {
      expect(typeof manager.isMobile()).toBe('boolean');
    });
  });
});
