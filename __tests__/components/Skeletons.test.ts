/**
 * @file Skeletons.test.js
 * @description Tests for skeleton loading state components.
 * @since 0.11.0-alpha
 */

import { jest } from '@jest/globals';

import {
  createSkeleton,
  createHighlightCardSkeleton,
  createAddressSkeleton,
  createCoordinatesSkeleton,
  showSkeletons,
  hideSkeletons,
  SKELETON_PRESETS,
} from '../../src/components/Skeletons.js';

describe('Skeletons', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // ─── createSkeleton ───────────────────────────────────────────────────────

  describe('createSkeleton()', () => {
    test('returns a div element', () => {
      expect(createSkeleton().tagName).toBe('DIV');
    });

    test('default type is text', () => {
      const el = createSkeleton();
      expect(el.className).toContain('skeleton-text');
    });

    test('has aria-busy=true', () => {
      expect(createSkeleton().getAttribute('aria-busy')).toBe('true');
    });

    test('applies custom width', () => {
      const el = createSkeleton({ width: '200px' });
      expect(el.style.width).toBe('200px');
    });

    test('applies custom height', () => {
      const el = createSkeleton({ height: '50px' });
      expect(el.style.height).toBe('50px');
    });

    test('type=heading applies correct class', () => {
      const el = createSkeleton({ type: 'heading' });
      expect(el.className).toContain('skeleton-heading');
    });

    test('type=circle applies correct class', () => {
      const el = createSkeleton({ type: 'circle' });
      expect(el.className).toContain('skeleton-circle');
    });

    test('type=rect applies correct class', () => {
      const el = createSkeleton({ type: 'rect' });
      expect(el.className).toContain('skeleton-rect');
    });

    test('text with lines > 1 creates multiline skeleton', () => {
      const el = createSkeleton({ type: 'text', lines: 3 });
      expect(el.className).toContain('skeleton-multiline');
      expect(el.querySelectorAll('.skeleton-line').length).toBe(3);
    });

    test('last line of multiline is 60% wide', () => {
      const el = createSkeleton({ type: 'text', lines: 3 });
      const lines = el.querySelectorAll('.skeleton-line');
      expect(lines[lines.length - 1].style.width).toBe('60%');
    });
  });

  // ─── createHighlightCardSkeleton ──────────────────────────────────────────

  describe('createHighlightCardSkeleton()', () => {
    test('returns a highlight-card element', () => {
      const el = createHighlightCardSkeleton();
      expect(el.className).toContain('highlight-card');
    });

    test('has aria-busy=true', () => {
      expect(createHighlightCardSkeleton().getAttribute('aria-busy')).toBe('true');
    });

    test('contains label and value skeleton children', () => {
      const el = createHighlightCardSkeleton();
      expect(el.querySelector('.skeleton-card-label')).not.toBeNull();
      expect(el.querySelector('.skeleton-card-value')).not.toBeNull();
    });
  });

  // ─── createAddressSkeleton ────────────────────────────────────────────────

  describe('createAddressSkeleton()', () => {
    test('returns element with skeleton-address class', () => {
      const el = createAddressSkeleton();
      expect(el.className).toContain('skeleton-address');
    });

    test('contains three skeleton lines', () => {
      const el = createAddressSkeleton();
      expect(el.querySelectorAll('.skeleton').length).toBe(3);
    });
  });

  // ─── createCoordinatesSkeleton ────────────────────────────────────────────

  describe('createCoordinatesSkeleton()', () => {
    test('returns element with skeleton-coordinates class', () => {
      const el = createCoordinatesSkeleton();
      expect(el.className).toContain('skeleton-coordinates');
    });

    test('contains one skeleton line', () => {
      const el = createCoordinatesSkeleton();
      expect(el.querySelectorAll('.skeleton').length).toBe(1);
    });
  });

  // ─── showSkeletons ────────────────────────────────────────────────────────

  describe('showSkeletons()', () => {
    test('clears existing content', () => {
      container.innerHTML = '<p class="old">Old</p>';
      showSkeletons(container, 'card', 1);
      expect(container.querySelector('.old')).toBeNull();
    });

    test('sets aria-busy=true on container', () => {
      showSkeletons(container, 'address', 1);
      expect(container.getAttribute('aria-busy')).toBe('true');
    });

    test('creates correct number of skeletons', () => {
      showSkeletons(container, 'card', 3);
      expect(container.querySelectorAll('.highlight-card').length).toBe(3);
    });

    test('warns on unknown type', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      showSkeletons(container, 'unknown-type');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    test('handles address type', () => {
      showSkeletons(container, 'address', 1);
      expect(container.querySelector('.skeleton-address')).not.toBeNull();
    });

    test('handles coordinates type', () => {
      showSkeletons(container, 'coordinates', 1);
      expect(container.querySelector('.skeleton-coordinates')).not.toBeNull();
    });
  });

  // ─── hideSkeletons ────────────────────────────────────────────────────────

  describe('hideSkeletons()', () => {
    test('sets aria-busy=false', () => {
      container.setAttribute('aria-busy', 'true');
      hideSkeletons(container, '');
      expect(container.getAttribute('aria-busy')).toBe('false');
    });

    test('sets innerHTML when content is a string', () => {
      hideSkeletons(container, '<p>Hello</p>');
      expect(container.querySelector('p')).not.toBeNull();
    });

    test('appends HTMLElement content', () => {
      const el = document.createElement('span');
      el.textContent = 'Done';
      hideSkeletons(container, el);
      expect(container.querySelector('span')).not.toBeNull();
    });
  });

  // ─── SKELETON_PRESETS ─────────────────────────────────────────────────────

  describe('SKELETON_PRESETS', () => {
    test('has LOCATION_HIGHLIGHTS preset', () => {
      expect(SKELETON_PRESETS.LOCATION_HIGHLIGHTS).toBeDefined();
      expect(SKELETON_PRESETS.LOCATION_HIGHLIGHTS.type).toBe('card');
    });

    test('has ADDRESS_BLOCK preset', () => {
      expect(SKELETON_PRESETS.ADDRESS_BLOCK.type).toBe('address');
    });

    test('has COORDINATES_LINE preset', () => {
      expect(SKELETON_PRESETS.COORDINATES_LINE.type).toBe('coordinates');
    });
  });
});
