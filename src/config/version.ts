/**
 * Application Version Configuration
 * Single source of truth for version information
 * 
 * @module config/version
 * @since 0.9.0-alpha
 */

/**
 * Current application version (semantic versioning)
 * @constant {string}
 */
export const VERSION = '0.16.0-alpha';

/**
 * Build/release date
 * @constant {string}
 */
export const BUILD_DATE = '2026-04-25';

/**
 * Full version string for display
 * @constant {string}
 */
export const VERSION_STRING = `Guia Turístico v${VERSION}`;

/**
 * Version with date for footer display
 * @constant {string}
 */
export const VERSION_WITH_DATE = `${VERSION_STRING} | ${BUILD_DATE}`;

/**
 * Get version metadata object
 * @returns {Object} Version metadata
 */
export function getVersionInfo(): { version: string; buildDate: string; versionString: string; versionWithDate: string } {
  return {
    version: VERSION,
    buildDate: BUILD_DATE,
    versionString: VERSION_STRING,
    versionWithDate: VERSION_WITH_DATE
  };
}
