/**
 * @file version.test.js
 * @description Tests for the version configuration module.
 */

import {
  VERSION,
  BUILD_DATE,
  VERSION_STRING,
  VERSION_WITH_DATE,
  getVersionInfo,
} from '../../src/config/version.js';

describe('version config', () => {
  test('VERSION is a semantic version string', () => {
    expect(typeof VERSION).toBe('string');
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });

  test('BUILD_DATE is a date string', () => {
    expect(typeof BUILD_DATE).toBe('string');
    expect(BUILD_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('VERSION_STRING includes version', () => {
    expect(VERSION_STRING).toContain(VERSION);
    expect(VERSION_STRING).toContain('Guia');
  });

  test('VERSION_WITH_DATE includes VERSION_STRING and BUILD_DATE', () => {
    expect(VERSION_WITH_DATE).toContain(VERSION_STRING);
    expect(VERSION_WITH_DATE).toContain(BUILD_DATE);
  });

  test('getVersionInfo returns all version fields', () => {
    const info = getVersionInfo();
    expect(info.version).toBe(VERSION);
    expect(info.buildDate).toBe(BUILD_DATE);
    expect(info.versionString).toBe(VERSION_STRING);
    expect(info.versionWithDate).toBe(VERSION_WITH_DATE);
  });
});
