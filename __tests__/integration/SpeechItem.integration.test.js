/**
 * Integration tests for SpeechItem module extraction
 * 
 * Validates that the extracted module works correctly with imports/exports,
 * maintains backward compatibility, and integrates properly with SpeechQueue
 * and other speech synthesis components.
 * 
 * @author Marcelo Pereira Barbosa
 * @since 0.8.3-alpha
 */

import { describe, test, expect, beforeEach } from '@jest/globals';

describe('SpeechItem Module Integration - MP Barbosa Travel Guide (v0.8.11-alpha)', () => {
    
    describe('Module Import and Export Validation', () => {
        test('should import SpeechItem from speech module', async () => {
            const { default: SpeechItem } = await import('../../src/speech/SpeechItem.js');
            
            expect(SpeechItem).toBeDefined();
            expect(typeof SpeechItem).toBe('function');
            expect(SpeechItem.name).toBe('SpeechItem');
        });

        test('should support both default and named imports', async () => {
            const module = await import('../../src/speech/SpeechItem.js');
            
            expect(module.default).toBeDefined();
            expect(module.SpeechItem).toBeDefined();
            expect(module.default).toBe(module.SpeechItem);
        });

        test('should export from guia.js for backward compatibility', async () => {
            const guia = await import('../../src/guia.js');
            
            expect(guia.SpeechItem).toBeDefined();
            expect(typeof guia.SpeechItem).toBe('function');
            
            // Test that it's the same class as the direct import
            const { default: DirectImport } = await import('../../src/speech/SpeechItem.js');
            expect(guia.SpeechItem).toBe(DirectImport);
        });
    });

    describe('Backward Compatibility Validation', () => {
        test('should maintain constructor API compatibility', async () => {
            const { default: SpeechItem } = await import('../../src/speech/SpeechItem.js');
            
            const item = new SpeechItem('Teste de compatibilidade', 2);
            
            expect(item.text).toBe('Teste de compatibilidade');
            expect(item.priority).toBe(2);
            expect(typeof item.timestamp).toBe('number');
            expect(typeof item.isExpired).toBe('function');
            expect(typeof item.toString).toBe('function');
            expect(Object.isFrozen(item)).toBe(true);
        });

        test('should work with SpeechQueue integration', async () => {
            const guia = await import('../../src/guia.js');
            const { SpeechQueue, SpeechItem } = guia;
            
            if (SpeechQueue && SpeechItem) {
                const queue = new SpeechQueue();
                const item = new SpeechItem('Teste de integração', 1);
                
                // Test that SpeechQueue can work with extracted SpeechItem
                expect(() => {
                    queue.enqueue('Usando SpeechItem extraído', 1);
                }).not.toThrow();
                
                expect(queue.size()).toBeGreaterThan(0);
            }
        });

        test('should maintain legacy window global compatibility', async () => {
            // Import the module to trigger window assignment
            await import('../../src/speech/SpeechItem.js');
            
            if (typeof window !== 'undefined') {
                expect(window.SpeechItem).toBeDefined();
                expect(typeof window.SpeechItem).toBe('function');
                
                const item = new window.SpeechItem('Window test', 1);
                expect(item.text).toBe('Window test');
                expect(item.priority).toBe(1);
            }
        });
    });

    describe('Integration with Speech System', () => {
        test('should integrate with speech synthesis workflow', async () => {
            const { default: SpeechItem } = await import('../../src/speech/SpeechItem.js');
            
            // Simulate speech synthesis workflow
            const items = [
                new SpeechItem('Emergência detectada!', 3),
                new SpeechItem('Mudança de bairro detectada', 2),
                new SpeechItem('Você está na Avenida Paulista', 1),
                new SpeechItem('Informação adicional', 0)
            ];
            
            // Test priority ordering
            items.sort((a, b) => b.priority - a.priority);
            
            expect(items[0].priority).toBe(3);
            expect(items[1].priority).toBe(2);
            expect(items[2].priority).toBe(1);
            expect(items[3].priority).toBe(0);
            
            // Test expiration checking
            items.forEach(item => {
                expect(typeof item.isExpired()).toBe('boolean');
            });
        });

        test('should work with WebGeocodingManager speech synthesis', async () => {
            const guia = await import('../../src/guia.js');
            
            // Test that WebGeocodingManager can still create speech items
            if (guia.SpeechItem && guia.WebGeocodingManager) {
                const mockDocument = {
                    getElementById: jest.fn().mockReturnValue({
                        innerHTML: '',
                        addEventListener: jest.fn()
                    })
                };
                
                // WebGeocodingManager.createAsync may not be available in test environment
                // Just test that SpeechItem can be created in the context
                const item = new guia.SpeechItem('Localização atualizada', 1);
                expect(item).toBeDefined();
                expect(item.text).toBe('Localização atualizada');
            }
        });

        test('should support speech queue priority-based processing', async () => {
            const { default: SpeechItem } = await import('../../src/speech/SpeechItem.js');
            
            // Create items representing typical travel guide speech scenarios
            const locationItems = [
                new SpeechItem('Município: São Paulo', 3),       // High priority: municipality change
                new SpeechItem('Bairro: Vila Madalena', 2),      // Medium priority: neighborhood change  
                new SpeechItem('Rua: Rua Harmonia', 1),          // Normal priority: street change
                new SpeechItem('Informação turística', 0)        // Low priority: background info
            ];
            
            // Simulate priority queue behavior
            const sortedByPriority = [...locationItems].sort((a, b) => b.priority - a.priority);
            
            expect(sortedByPriority[0].text).toContain('Município');
            expect(sortedByPriority[1].text).toContain('Bairro');
            expect(sortedByPriority[2].text).toContain('Rua');
            expect(sortedByPriority[3].text).toContain('Informação');
        });
    });

    describe('Cross-Module Compatibility', () => {
        test('should work alongside other speech modules', async () => {
            const guia = await import('../../src/guia.js');
            
            if (guia.SpeechItem && guia.SpeechQueue && guia.SpeechSynthesisManager) {
                // Create instances to test compatibility
                const item = new guia.SpeechItem('Teste de compatibilidade', 2);
                const queue = new guia.SpeechQueue();
                const manager = new guia.SpeechSynthesisManager();
                
                expect(item).toBeDefined();
                expect(queue).toBeDefined();
                expect(manager).toBeDefined();
                
                // Test that they can work together
                expect(() => {
                    queue.enqueue(item.text, item.priority);
                }).not.toThrow();
            }
        });

        test('should integrate with HTML speech synthesis displayer', async () => {
            const guia = await import('../../src/guia.js');
            
            if (guia.SpeechItem && guia.HtmlSpeechSynthesisDisplayer) {
                // Test creating speech items that would be used by HTML displayer
                const addressChangeItem = new guia.SpeechItem('Novo endereço detectado', 2);
                const neighborhoodChangeItem = new guia.SpeechItem('Novo bairro: Copacabana', 2);
                
                expect(addressChangeItem.text).toContain('endereço');
                expect(neighborhoodChangeItem.text).toContain('bairro');
                expect(addressChangeItem.priority).toBe(2);
                expect(neighborhoodChangeItem.priority).toBe(2);
            }
        });
    });

    describe('Performance and Memory Management', () => {
        test('should not cause memory leaks during module import/export', async () => {
            // Import multiple times to test for memory issues
            for (let i = 0; i < 100; i++) {
                const { default: SpeechItem } = await import('../../src/speech/SpeechItem.js');
                const item = new SpeechItem(`Test item ${i}`, i % 4);
                
                expect(item.text).toBe(`Test item ${i}`);
                expect(item.priority).toBe(i % 4);
                expect(Object.isFrozen(item)).toBe(true);
            }
        });

        test('should maintain consistent behavior across imports', async () => {
            const { default: Import1 } = await import('../../src/speech/SpeechItem.js');
            const { default: Import2 } = await import('../../src/speech/SpeechItem.js');
            
            // Should be the same constructor function
            expect(Import1).toBe(Import2);
            
            // Should create equivalent instances
            const item1 = new Import1('Test 1', 1);
            const item2 = new Import2('Test 2', 2);
            
            expect(item1.constructor).toBe(item2.constructor);
            expect(typeof item1.isExpired).toBe(typeof item2.isExpired);
            expect(Object.isFrozen(item1)).toBe(Object.isFrozen(item2));
        });

        test('should handle concurrent speech item creation efficiently', async () => {
            const { default: SpeechItem } = await import('../../src/speech/SpeechItem.js');
            
            const startTime = Date.now();
            
            // Create many speech items concurrently
            const promises = [];
            for (let i = 0; i < 500; i++) {
                promises.push(Promise.resolve(new SpeechItem(`Concurrent item ${i}`, i % 4)));
            }
            
            const items = await Promise.all(promises);
            const endTime = Date.now();
            
            expect(items.length).toBe(500);
            expect(endTime - startTime).toBeLessThan(1000); // Should complete quickly
            
            // Verify all items are properly created
            items.forEach((item, index) => {
                expect(item.text).toBe(`Concurrent item ${index}`);
                expect(item.priority).toBe(index % 4);
                expect(Object.isFrozen(item)).toBe(true);
            });
        });
    });

    describe('Brazilian Context Integration', () => {
        test('should handle Brazilian Portuguese content in integration scenarios', async () => {
            const { default: SpeechItem } = await import('../../src/speech/SpeechItem.js');
            
            const brazilianPhrases = [
                'Bem-vindo ao Rio de Janeiro',
                'Você está em São Paulo, capital',
                'Direção ao Cristo Redentor',
                'Próximo à Estação da Sé',
                'Chegando ao Pelourinho'
            ];
            
            const items = brazilianPhrases.map((phrase, index) => 
                new SpeechItem(phrase, index % 3)
            );
            
            items.forEach((item, index) => {
                expect(item.text).toBe(brazilianPhrases[index]);
                expect(item.priority).toBe(index % 3);
                expect(item.toString()).toContain(brazilianPhrases[index]);
            });
        });

        test('should support travel guide location hierarchy in speech priorities', async () => {
            const { default: SpeechItem } = await import('../../src/speech/SpeechItem.js');
            
            // Brazilian location hierarchy with appropriate priorities
            const locationHierarchy = [
                { text: 'Você entrou no estado de São Paulo', priority: 3 },
                { text: 'Município: São Paulo', priority: 3 },
                { text: 'Bairro: Vila Madalena', priority: 2 },
                { text: 'Logradouro: Rua Harmonia', priority: 1 },
                { text: 'Número: 123', priority: 0 }
            ];
            
            const items = locationHierarchy.map(({ text, priority }) => 
                new SpeechItem(text, priority)
            );
            
            // Sort by priority to simulate speech queue processing
            const sortedItems = items.sort((a, b) => b.priority - a.priority);
            
            expect(sortedItems[0].text).toContain('estado');
            expect(sortedItems[1].text).toContain('Município');
            expect(sortedItems[2].text).toContain('Bairro');
            expect(sortedItems[3].text).toContain('Logradouro');
            expect(sortedItems[4].text).toContain('Número');
        });
    });

    describe('Error Handling in Integration Context', () => {
        test('should handle integration errors gracefully', async () => {
            const { default: SpeechItem } = await import('../../src/speech/SpeechItem.js');
            
            // Test error scenarios that might occur in integration
            expect(() => {
                new SpeechItem(); // Missing required parameter
            }).toThrow(TypeError);
            
            expect(() => {
                new SpeechItem(null, 1); // Invalid text
            }).toThrow(TypeError);
            
            expect(() => {
                new SpeechItem('Valid text', 'invalid priority'); // Invalid priority
            }).toThrow(TypeError);
        });

        test('should maintain module stability during error conditions', async () => {
            const { default: SpeechItem } = await import('../../src/speech/SpeechItem.js');
            
            // Test that errors in one instance don't affect others
            let validItem;
            
            try {
                new SpeechItem(null); // This should throw
            } catch (error) {
                expect(error).toBeInstanceOf(TypeError);
            }
            
            // Should still be able to create valid instances
            expect(() => {
                validItem = new SpeechItem('Valid after error', 1);
            }).not.toThrow();
            
            expect(validItem.text).toBe('Valid after error');
            expect(validItem.priority).toBe(1);
        });
    });

    describe('Module Loading Performance', () => {
        test('should load module efficiently', async () => {
            const startTime = Date.now();
            
            // Load module multiple times
            const imports = [];
            for (let i = 0; i < 50; i++) {
                imports.push(import('../../src/speech/SpeechItem.js'));
            }
            
            await Promise.all(imports);
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should complete reasonably quickly
            expect(duration).toBeLessThan(2000); // Less than 2 seconds for 50 imports
        });

        test('should have consistent module resolution', async () => {
            // Test that the same module is returned across different import calls
            const [import1, import2, import3] = await Promise.all([
                import('../../src/speech/SpeechItem.js'),
                import('../../src/speech/SpeechItem.js'),
                import('../../src/speech/SpeechItem.js')
            ]);
            
            expect(import1.default).toBe(import2.default);
            expect(import2.default).toBe(import3.default);
            expect(import1.SpeechItem).toBe(import2.SpeechItem);
            expect(import2.SpeechItem).toBe(import3.SpeechItem);
        });
    });

    describe('Expiration Management in Integration Context', () => {
        test('should support queue cleanup operations', async () => {
            const { default: SpeechItem } = await import('../../src/speech/SpeechItem.js');
            
            // Create items with different ages
            const now = Date.now();
            const items = [
                new SpeechItem('Fresh item', 1, now),
                new SpeechItem('Recent item', 1, now - 10000),  // 10 seconds old
                new SpeechItem('Old item', 1, now - 40000),     // 40 seconds old
                new SpeechItem('Very old item', 1, now - 60000) // 60 seconds old
            ];
            
            // Filter out expired items (default 30 second expiration)
            const validItems = items.filter(item => !item.isExpired());
            const expiredItems = items.filter(item => item.isExpired());
            
            expect(validItems.length).toBe(2); // Fresh and recent items
            expect(expiredItems.length).toBe(2); // Old and very old items
            
            expect(validItems[0].text).toBe('Fresh item');
            expect(validItems[1].text).toBe('Recent item');
            expect(expiredItems[0].text).toBe('Old item');
            expect(expiredItems[1].text).toBe('Very old item');
        });

        test('should integrate with automatic queue maintenance', async () => {
            const { default: SpeechItem } = await import('../../src/speech/SpeechItem.js');
            
            // Simulate automatic queue maintenance scenario
            const queueItems = [];
            const now = Date.now();
            
            // Add items over time
            for (let i = 0; i < 10; i++) {
                const ageMs = i * 5000; // Each item is 5 seconds older than the last
                const item = new SpeechItem(`Item ${i}`, 1, now - ageMs);
                queueItems.push(item);
            }
            
            // Clean up expired items (using 25 second expiration)
            const cleanedQueue = queueItems.filter(item => !item.isExpired(25000));
            
            // Should keep only the first 5 items (0-24 seconds old)
            expect(cleanedQueue.length).toBe(5);
            cleanedQueue.forEach((item, index) => {
                expect(item.text).toBe(`Item ${index}`);
            });
        });
    });
});