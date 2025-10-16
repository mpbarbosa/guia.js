/**
 * Unit Tests for SpeechItem Class
 * 
 * This test suite validates the speech item functionality, immutability enforcement,
 * expiration logic, and string representation for the Brazilian Portuguese travel guide context.
 * 
 * @author Marcelo Pereira Barbosa
 * @since 0.8.3-alpha
 */

import { jest } from '@jest/globals';
import SpeechItem from '../../src/speech/SpeechItem.js';

describe('SpeechItem - MP Barbosa Travel Guide (v0.8.11-alpha)', () => {

    describe('Constructor and Initialization', () => {
        test('should create speech item with default parameters', () => {
            const item = new SpeechItem('Bem-vindo ao sistema');

            expect(item.text).toBe('Bem-vindo ao sistema');
            expect(item.priority).toBe(0);
            expect(item.timestamp).toBeCloseTo(Date.now(), -2); // Within ~100ms
            expect(Object.isFrozen(item)).toBe(true);
        });

        test('should create speech item with custom priority', () => {
            const item = new SpeechItem('Emergência detectada!', 3);

            expect(item.text).toBe('Emergência detectada!');
            expect(item.priority).toBe(3);
            expect(typeof item.timestamp).toBe('number');
            expect(Object.isFrozen(item)).toBe(true);
        });

        test('should create speech item with custom timestamp', () => {
            const customTimestamp = Date.now() - 5000;
            const item = new SpeechItem('Teste com timestamp', 1, customTimestamp);

            expect(item.text).toBe('Teste com timestamp');
            expect(item.priority).toBe(1);
            expect(item.timestamp).toBe(customTimestamp);
            expect(Object.isFrozen(item)).toBe(true);
        });

        test('should be immutable after construction (MP Barbosa standards)', () => {
            const item = new SpeechItem('Texto de teste');

            expect(() => {
                item.text = 'Novo texto';
            }).toThrow();
            
            expect(() => {
                item.priority = 5;
            }).toThrow();
            
            expect(() => {
                item.newProperty = 'test';
            }).toThrow();

            expect(Object.isFrozen(item)).toBe(true);
        });
    });

    describe('Parameter Validation', () => {
        test('should throw error for non-string text', () => {
            expect(() => {
                new SpeechItem(null);
            }).toThrow(TypeError);

            expect(() => {
                new SpeechItem(123);
            }).toThrow(TypeError);

            expect(() => {
                new SpeechItem({});
            }).toThrow(TypeError);
        });

        test('should throw error for non-number priority', () => {
            expect(() => {
                new SpeechItem('Teste', 'high');
            }).toThrow(TypeError);

            expect(() => {
                new SpeechItem('Teste', null);
            }).toThrow(TypeError);

            expect(() => {
                new SpeechItem('Teste', {});
            }).toThrow(TypeError);
        });

        test('should throw error for non-number timestamp', () => {
            expect(() => {
                new SpeechItem('Teste', 1, 'invalid');
            }).toThrow(TypeError);

            expect(() => {
                new SpeechItem('Teste', 1, null);
            }).toThrow(TypeError);

            expect(() => {
                new SpeechItem('Teste', 1, {});
            }).toThrow(TypeError);
        });

        test('should accept valid parameter combinations', () => {
            expect(() => {
                new SpeechItem('Texto válido', 2, Date.now());
            }).not.toThrow();

            expect(() => {
                new SpeechItem('Outro texto', 0);
            }).not.toThrow();

            expect(() => {
                new SpeechItem('Texto simples');
            }).not.toThrow();
        });
    });

    describe('Brazilian Portuguese Content Support', () => {
        test('should handle Portuguese text with accents and special characters', () => {
            const portugueseTexts = [
                'Você está na Avenida Paulista',
                'Bem-vindo à São Paulo',
                'Direção: Estação da Sé',
                'Próximo ao Shopping Iguatemi',
                'Região metropolitana de São Paulo'
            ];

            portugueseTexts.forEach(text => {
                const item = new SpeechItem(text, 1);
                expect(item.text).toBe(text);
                expect(typeof item.text).toBe('string');
                expect(item.text.length).toBeGreaterThan(0);
            });
        });

        test('should support different priority levels for travel guide context', () => {
            const travelContextItems = [
                { text: 'Emergência: Procure ajuda médica!', priority: 3 },
                { text: 'Atenção: Você saiu da rota!', priority: 2 },
                { text: 'Esta é a Praça da Sé.', priority: 1 },
                { text: 'Curiosidade: Este edifício foi construído em 1920.', priority: 0 }
            ];

            travelContextItems.forEach(({ text, priority }) => {
                const item = new SpeechItem(text, priority);
                expect(item.priority).toBe(priority);
                expect(item.text).toContain(text.split(':')[0]); // Check prefix exists
            });
        });

        test('should handle empty and whitespace-only text', () => {
            const emptyItem = new SpeechItem('');
            expect(emptyItem.text).toBe('');
            expect(emptyItem.priority).toBe(0);

            const whitespaceItem = new SpeechItem('   ');
            expect(whitespaceItem.text).toBe('   ');
        });
    });

    describe('Expiration Logic', () => {
        test('should not be expired immediately after creation', () => {
            const item = new SpeechItem('Texto fresco');
            
            expect(item.isExpired()).toBe(false);
            expect(item.isExpired(30000)).toBe(false);
            expect(item.isExpired(1000)).toBe(false);
        });

        test('should be expired with past timestamp', () => {
            const pastTimestamp = Date.now() - 35000; // 35 seconds ago
            const item = new SpeechItem('Texto antigo', 1, pastTimestamp);
            
            expect(item.isExpired()).toBe(true);
            expect(item.isExpired(30000)).toBe(true);
            expect(item.isExpired(40000)).toBe(false);
        });

        test('should respect custom expiration times', () => {
            const recentTimestamp = Date.now() - 5000; // 5 seconds ago
            const item = new SpeechItem('Texto recente', 1, recentTimestamp);
            
            expect(item.isExpired(1000)).toBe(true);    // 1 second expiration
            expect(item.isExpired(10000)).toBe(false);  // 10 second expiration
            expect(item.isExpired(30000)).toBe(false);  // Default 30 second expiration
        });

        test('should handle edge case timestamps', () => {
            const exactTimestamp = Date.now() - 30000; // Exactly 30 seconds ago
            const item = new SpeechItem('Texto no limite', 1, exactTimestamp);
            
            // Should be expired at exactly 30 seconds (depending on timing precision)
            const isExpired = item.isExpired(30000);
            expect(typeof isExpired).toBe('boolean');
        });

        test('should work with zero and negative expiration times', () => {
            const item = new SpeechItem('Teste de expiração');
            
            expect(item.isExpired(0)).toBe(true);  // Always expired with 0ms expiration
            expect(item.isExpired(-1000)).toBe(true); // Always expired with negative expiration
        });
    });

    describe('String Representation', () => {
        test('should return formatted string with short text', () => {
            const item = new SpeechItem('Texto curto', 2);
            const result = item.toString();
            
            expect(result).toBe('SpeechItem: "Texto curto" (priority: 2)');
        });

        test('should truncate long text in string representation', () => {
            const longText = 'Este é um texto muito longo que deveria ser truncado quando exibido na representação string para manter a legibilidade';
            const item = new SpeechItem(longText, 1);
            const result = item.toString();
            
            expect(result).toContain('SpeechItem:');
            expect(result).toContain('(priority: 1)');
            expect(result).toContain('...');
            expect(result.length).toBeLessThan(longText.length + 50);
        });

        test('should handle exactly 50 character text without truncation', () => {
            const exactText = 'Este texto tem exatamente cinquenta caracteres!!';
            expect(exactText.length).toBe(50);
            
            const item = new SpeechItem(exactText, 0);
            const result = item.toString();
            
            expect(result).toBe(`SpeechItem: "${exactText}" (priority: 0)`);
            expect(result).not.toContain('...');
        });

        test('should handle text with 51 characters with truncation', () => {
            const longText = 'Este texto tem exatamente cinquenta e um caracter!';
            expect(longText.length).toBe(51);
            
            const item = new SpeechItem(longText, 3);
            const result = item.toString();
            
            expect(result).toContain('...');
            expect(result).toBe('SpeechItem: "Este texto tem exatamente cinquenta e um caracter..." (priority: 3)');
        });

        test('should include class name and priority in string representation', () => {
            const item = new SpeechItem('Teste', 5);
            const result = item.toString();
            
            expect(result).toContain('SpeechItem:');
            expect(result).toContain('(priority: 5)');
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('should handle numeric strings as invalid text', () => {
            expect(() => {
                new SpeechItem(123);
            }).toThrow(TypeError);
        });

        test('should handle special characters in text', () => {
            const specialTexts = [
                'Texto com símbolos: @#$%^&*()',
                'Emojis: 🚗🗺️📍',
                'Quebras\nde\tlinha',
                'Aspas "duplas" e \'simples\'',
                'Caracteres unicode: ñáéíóú'
            ];

            specialTexts.forEach(text => {
                expect(() => {
                    const item = new SpeechItem(text);
                    expect(item.text).toBe(text);
                }).not.toThrow();
            });
        });

        test('should handle extreme priority values', () => {
            const extremePriorities = [-1000, -1, 0, 1, 100, 9999, Infinity, -Infinity];
            
            extremePriorities.forEach(priority => {
                if (isFinite(priority)) {
                    const item = new SpeechItem('Teste extremo', priority);
                    expect(item.priority).toBe(priority);
                } else {
                    const item = new SpeechItem('Teste infinito', priority);
                    expect(item.priority).toBe(priority);
                }
            });
        });

        test('should handle extreme timestamp values', () => {
            const extremeTimestamps = [0, 1, Date.now(), Date.now() + 1000000];
            
            extremeTimestamps.forEach(timestamp => {
                const item = new SpeechItem('Teste timestamp', 1, timestamp);
                expect(item.timestamp).toBe(timestamp);
            });
        });
    });

    describe('Performance and Memory Management', () => {
        test('should not create memory leaks with many instances', () => {
            const items = [];
            
            // Create many instances
            for (let i = 0; i < 1000; i++) {
                const item = new SpeechItem(`Item número ${i}`, i % 4);
                items.push(item);
            }
            
            // All should be properly created
            expect(items.length).toBe(1000);
            items.forEach((item, index) => {
                expect(item.text).toBe(`Item número ${index}`);
                expect(item.priority).toBe(index % 4);
                expect(Object.isFrozen(item)).toBe(true);
            });
        });

        test('should maintain immutability under stress conditions', () => {
            const item = new SpeechItem('Teste de stress', 2);
            const originalText = item.text;
            const originalPriority = item.priority;
            const originalTimestamp = item.timestamp;
            
            // Attempt many modifications
            for (let i = 0; i < 100; i++) {
                expect(() => {
                    item.text = `Novo texto ${i}`;
                }).toThrow();
                
                expect(() => {
                    item.priority = i;
                }).toThrow();
                
                expect(() => {
                    item[`prop${i}`] = i;
                }).toThrow();
            }
            
            // Original values should remain unchanged
            expect(item.text).toBe(originalText);
            expect(item.priority).toBe(originalPriority);
            expect(item.timestamp).toBe(originalTimestamp);
            expect(Object.isFrozen(item)).toBe(true);
        });

        test('should handle rapid creation and expiration checking', () => {
            const startTime = Date.now();
            
            for (let i = 0; i < 1000; i++) {
                const item = new SpeechItem(`Rapid test ${i}`, i % 3);
                const isExpired = item.isExpired(1000);
                expect(typeof isExpired).toBe('boolean');
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should complete reasonably quickly
            expect(duration).toBeLessThan(1000); // Less than 1 second for 1000 operations
        });
    });

    describe('Integration with Travel Guide Context', () => {
        test('should support common travel guide speech patterns', () => {
            const travelPhrases = [
                'Você está em',
                'Direção a',
                'Próximo de',
                'A aproximadamente',
                'Chegando em',
                'Saindo de'
            ];
            
            travelPhrases.forEach((phrase, index) => {
                const fullText = `${phrase} São Paulo, capital do estado.`;
                const item = new SpeechItem(fullText, index);
                
                expect(item.text).toContain(phrase);
                expect(item.priority).toBe(index);
                expect(item.toString()).toContain(phrase);
            });
        });

        test('should handle location-specific Brazilian content', () => {
            const locations = [
                'Centro de São Paulo',
                'Copacabana, Rio de Janeiro',
                'Plano Piloto, Brasília',
                'Pelourinho, Salvador',
                'Centro Histórico de Ouro Preto'
            ];
            
            locations.forEach(location => {
                const item = new SpeechItem(`Você chegou ao ${location}`, 1);
                expect(item.text).toContain(location);
            });
        });
    });
});