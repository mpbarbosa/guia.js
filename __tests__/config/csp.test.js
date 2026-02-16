/**
 * @jest-environment jsdom
 */

'use strict';

import { getCSPMetaContent, getAllSecurityHeaders, productionCSP, developmentCSP } from '../../src/config/csp.js';

describe('Content Security Policy (CSP)', () => {
  describe('CSP Meta Content Generation', () => {
    test('should generate production CSP meta content', () => {
      const csp = getCSPMetaContent(true);
      
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src");
      expect(csp).toContain("style-src");
      expect(csp).toContain("frame-ancestors 'none'");
    });

    test('should generate development CSP meta content', () => {
      const csp = getCSPMetaContent(false);
      
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("unsafe-eval"); // Development allows eval
    });

    test('should include required API endpoints in connect-src', () => {
      const csp = getCSPMetaContent(true);
      
      expect(csp).toContain('nominatim.openstreetmap.org');
      expect(csp).toContain('servicodados.ibge.gov.br');
    });

    test('should include CDN in script-src', () => {
      const csp = getCSPMetaContent(true);
      
      expect(csp).toContain('cdn.jsdelivr.net');
    });
  });

  describe('Security Headers', () => {
    test('should include all security headers', () => {
      const headers = getAllSecurityHeaders(true);
      
      expect(headers).toHaveProperty('Content-Security-Policy');
      expect(headers).toHaveProperty('X-Content-Type-Options');
      expect(headers).toHaveProperty('X-Frame-Options');
      expect(headers).toHaveProperty('X-XSS-Protection');
      expect(headers).toHaveProperty('Referrer-Policy');
      expect(headers).toHaveProperty('Permissions-Policy');
    });

    test('should set X-Frame-Options to DENY', () => {
      const headers = getAllSecurityHeaders(true);
      
      expect(headers['X-Frame-Options']).toBe('DENY');
    });

    test('should set X-Content-Type-Options to nosniff', () => {
      const headers = getAllSecurityHeaders(true);
      
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
    });

    test('should restrict geolocation permissions', () => {
      const headers = getAllSecurityHeaders(true);
      
      expect(headers['Permissions-Policy']).toContain('geolocation=(self)');
    });
  });

  describe('CSP Directives', () => {
    test('production CSP should not allow unsafe-eval', () => {
      const scriptSrc = productionCSP['script-src'];
      
      expect(scriptSrc).not.toContain("'unsafe-eval'");
    });

    test('development CSP should allow unsafe-eval', () => {
      const scriptSrc = developmentCSP['script-src'];
      
      expect(scriptSrc).toContain("'unsafe-eval'");
    });

    test('should prevent framing from all origins', () => {
      expect(productionCSP['frame-ancestors']).toEqual(["'none'"]);
      expect(developmentCSP['frame-ancestors']).toEqual(["'none'"]);
    });

    test('should allow inline styles (required for Material Design)', () => {
      expect(productionCSP['style-src']).toContain("'unsafe-inline'");
      expect(developmentCSP['style-src']).toContain("'unsafe-inline'");
    });
  });

  describe('Browser Integration', () => {
    beforeEach(() => {
      document.head.innerHTML = '';
    });

    test('should inject CSP meta tag into document', () => {
      const cspContent = getCSPMetaContent(true);
      
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = cspContent;
      document.head.appendChild(meta);
      
      const injectedMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      expect(injectedMeta).toBeTruthy();
      expect(injectedMeta.content).toContain("default-src 'self'");
    });

    test('CSP should not block same-origin scripts', () => {
      const csp = getCSPMetaContent(true);
      
      expect(csp).toContain("script-src 'self'");
    });

    test('CSP should not block data URIs for images', () => {
      const csp = getCSPMetaContent(true);
      
      expect(csp).toContain('img-src');
      expect(csp).toContain('data:');
    });
  });

  describe('API Compatibility', () => {
    test('should allow fetch to Nominatim API', () => {
      const csp = getCSPMetaContent(true);
      
      // Check that connect-src includes Nominatim
      expect(csp).toContain('connect-src');
      expect(csp).toContain('nominatim.openstreetmap.org');
    });

    test('should allow fetch to IBGE API', () => {
      const csp = getCSPMetaContent(true);
      
      // Check that connect-src includes IBGE
      expect(csp).toContain('servicodados.ibge.gov.br');
    });

    test('should allow loading ibira.js from CDN', () => {
      const csp = getCSPMetaContent(true);
      
      expect(csp).toContain('script-src');
      expect(csp).toContain('cdn.jsdelivr.net');
    });
  });
});
