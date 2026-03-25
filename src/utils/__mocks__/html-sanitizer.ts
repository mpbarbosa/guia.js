// Manual mock for src/utils/html-sanitizer.ts
export const escapeHtml = jest.fn((s: string) => `[escaped:${s}]`);
export const sanitizeUrl = jest.fn((u: string) => u);
export const sanitizeHtml = jest.fn((h: string) => h);
