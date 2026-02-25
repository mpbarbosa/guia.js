/**
 * @file routes.test.js
 * @description Tests for the routes configuration module.
 * Covers getRoute, hasRoute, getRoutePaths, and template functions.
 */

import {
  routes,
  getRoute,
  hasRoute,
  getRoutePaths,
  getConverterViewTemplate,
  getNotFoundViewTemplate,
  getLoadingTemplate,
  getErrorTemplate,
} from '../../src/config/routes.js';

describe('routes config', () => {

  // ─── routes object ────────────────────────────────────────────────────────

  test('routes has "/" entry', () => {
    expect(routes['/']).toBeDefined();
    expect(routes['/'].name).toBe('home');
  });

  test('routes has "/converter" entry', () => {
    expect(routes['/converter']).toBeDefined();
    expect(routes['/converter'].name).toBe('converter');
  });

  // ─── getRoute ─────────────────────────────────────────────────────────────

  test('getRoute("/") returns home route', () => {
    const r = getRoute('/');
    expect(r).not.toBeNull();
    expect(r.name).toBe('home');
  });

  test('getRoute("/unknown") returns null', () => {
    expect(getRoute('/unknown')).toBeNull();
  });

  // ─── hasRoute ─────────────────────────────────────────────────────────────

  test('hasRoute("/") returns true', () => {
    expect(hasRoute('/')).toBe(true);
  });

  test('hasRoute("/unknown") returns false', () => {
    expect(hasRoute('/unknown')).toBe(false);
  });

  // ─── getRoutePaths ────────────────────────────────────────────────────────

  test('getRoutePaths returns array with "/" and "/converter"', () => {
    const paths = getRoutePaths();
    expect(paths).toContain('/');
    expect(paths).toContain('/converter');
  });

  // ─── templates ────────────────────────────────────────────────────────────

  test('getConverterViewTemplate returns string with form', () => {
    const html = getConverterViewTemplate();
    expect(typeof html).toBe('string');
    expect(html).toContain('latitude');
  });

  test('getNotFoundViewTemplate returns string with 404', () => {
    const html = getNotFoundViewTemplate();
    expect(html).toContain('404');
  });

  test('getLoadingTemplate returns string with loading', () => {
    const html = getLoadingTemplate();
    expect(html).toContain('loading');
  });

  test('getErrorTemplate returns string with error message', () => {
    const err = new Error('test error message');
    const html = getErrorTemplate(err);
    expect(html).toContain('test error message');
  });
});
