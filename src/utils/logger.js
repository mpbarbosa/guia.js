// Minimal logger for demonstration. Replace with your actual logger if needed.
export function log(...args) {
  // eslint-disable-next-line no-console
  console.log('[LOG]', ...args);
}
export function warn(...args) {
  // eslint-disable-next-line no-console
  console.warn('[WARN]', ...args);
}
export function error(...args) {
  // eslint-disable-next-line no-console
  console.error('[ERROR]', ...args);
}
