/**
 * Tests for VoiceLoader class
 * 
 * @jest-environment jsdom
 */

import VoiceLoader from '../../src/speech/VoiceLoader.js';

describe('VoiceLoader', () => {
    let mockSpeechSynthesis;
    let mockVoices;

    beforeEach(() => {
        // Create mock voices
        mockVoices = [
            { name: 'Google português do Brasil', lang: 'pt-BR', localService: false },
            { name: 'Microsoft Maria', lang: 'pt-BR', localService: true },
            { name: 'Google US English', lang: 'en-US', localService: false }
        ];

        // Create mock speechSynthesis with plain JavaScript function
        mockSpeechSynthesis = {
            getVoices: () => []
        };
    });

    describe('Constructor', () => {
        test('should create instance with default config', () => {
            const loader = new VoiceLoader();
            
            const config = loader.getRetryConfig();
            expect(config.maxRetries).toBe(10);
            expect(config.initialDelay).toBe(100);
            expect(config.maxDelay).toBe(5000);
        });

        test('should accept custom config', () => {
            const loader = new VoiceLoader({
                maxRetries: 15,
                initialDelay: 50,
                maxDelay: 3000
            });
            
            const config = loader.getRetryConfig();
            expect(config.maxRetries).toBe(15);
            expect(config.initialDelay).toBe(50);
            expect(config.maxDelay).toBe(3000);
        });

        test('should initialize with empty cache', () => {
            const loader = new VoiceLoader({ speechSynthesis: mockSpeechSynthesis });
            
            expect(loader.hasVoices()).toBe(false);
            expect(loader.getVoices()).toEqual([]);
        });
    });

    describe('loadVoices() - Success Cases', () => {
        test('should load voices immediately if available', async () => {
            let callCount = 0;
            mockSpeechSynthesis.getVoices = () => {
                callCount++;
                return mockVoices;
            };
            const loader = new VoiceLoader({ speechSynthesis: mockSpeechSynthesis });
            
            const voices = await loader.loadVoices();
            
            expect(voices).toEqual(mockVoices);
            expect(callCount).toBe(1);
        });

        test('should cache loaded voices', async () => {
            mockSpeechSynthesis.getVoices = () => mockVoices;
            const loader = new VoiceLoader({ speechSynthesis: mockSpeechSynthesis });
            
            await loader.loadVoices();
            expect(loader.hasVoices()).toBe(true);
            expect(loader.getVoices()).toEqual(mockVoices);
        });

        test('should return cached voices on subsequent calls', async () => {
            let callCount = 0;
            mockSpeechSynthesis.getVoices = () => {
                callCount++;
                return mockVoices;
            };
            const loader = new VoiceLoader({ speechSynthesis: mockSpeechSynthesis });
            
            const voices1 = await loader.loadVoices();
            const voices2 = await loader.loadVoices();
            
            expect(voices1).toEqual(voices2);
            expect(callCount).toBe(1); // Only called once
        });
    });

    describe('loadVoices() - Retry Logic', () => {
        test('should retry with exponential backoff', async () => {
            let callCount = 0;
            mockSpeechSynthesis.getVoices = () => {
                callCount++;
                return callCount >= 3 ? mockVoices : [];
            };
            
            const loader = new VoiceLoader({
                speechSynthesis: mockSpeechSynthesis,
                initialDelay: 10,
                maxDelay: 100
            });
            
            const startTime = Date.now();
            const voices = await loader.loadVoices();
            const elapsed = Date.now() - startTime;
            
            expect(voices).toEqual(mockVoices);
            expect(callCount).toBe(3);
            // Should have delays: 10ms + 20ms = 30ms minimum
            expect(elapsed).toBeGreaterThanOrEqual(25);
        });

        test('should return empty array after max retries', async () => {
            let callCount = 0;
            mockSpeechSynthesis.getVoices = () => {
                callCount++;
                return [];
            };
            
            const loader = new VoiceLoader({
                speechSynthesis: mockSpeechSynthesis,
                maxRetries: 3,
                initialDelay: 10
            });
            
            const voices = await loader.loadVoices();
            
            expect(voices).toEqual([]);
            expect(callCount).toBe(3);
        });

        test('should cap delay at maxDelay', async () => {
            let callCount = 0;
            mockSpeechSynthesis.getVoices = () => {
                callCount++;
                return callCount >= 5 ? mockVoices : [];
            };
            
            const loader = new VoiceLoader({
                speechSynthesis: mockSpeechSynthesis,
                initialDelay: 10,
                maxDelay: 25 // Cap at 25ms
            });
            
            const voices = await loader.loadVoices();
            
            expect(voices).toEqual(mockVoices);
            // Delays: 10, 20, 25 (capped), 25 (capped)
        });
    });

    describe('loadVoices() - Error Handling', () => {
        test('should throw error if speechSynthesis not available', async () => {
            const loader = new VoiceLoader({ speechSynthesis: null });
            
            await expect(loader.loadVoices()).rejects.toThrow(
                'Speech synthesis not available'
            );
        });

        test('should handle concurrent load calls', async () => {
            let callCount = 0;
            mockSpeechSynthesis.getVoices = () => {
                callCount++;
                return callCount >= 2 ? mockVoices : [];
            };
            
            const loader = new VoiceLoader({
                speechSynthesis: mockSpeechSynthesis,
                initialDelay: 10
            });
            
            // Start multiple loads concurrently
            const [voices1, voices2, voices3] = await Promise.all([
                loader.loadVoices(),
                loader.loadVoices(),
                loader.loadVoices()
            ]);
            
            expect(voices1).toEqual(mockVoices);
            expect(voices2).toEqual(mockVoices);
            expect(voices3).toEqual(mockVoices);
            // Should only make actual API calls once
            expect(callCount).toBe(2);
        });
    });

    describe('Cache Management', () => {
        test('clearCache() should clear cached voices', async () => {
            mockSpeechSynthesis.getVoices = () => mockVoices;
            const loader = new VoiceLoader({ speechSynthesis: mockSpeechSynthesis });
            
            await loader.loadVoices();
            expect(loader.hasVoices()).toBe(true);
            
            loader.clearCache();
            expect(loader.hasVoices()).toBe(false);
            expect(loader.getVoices()).toEqual([]);
        });

        test('clearCache() should force reload on next loadVoices()', async () => {
            let callCount = 0;
            mockSpeechSynthesis.getVoices = () => {
                callCount++;
                return mockVoices;
            };
            const loader = new VoiceLoader({ speechSynthesis: mockSpeechSynthesis });
            
            await loader.loadVoices();
            loader.clearCache();
            await loader.loadVoices();
            
            expect(callCount).toBe(2);
        });
    });

    describe('getVoices()', () => {
        test('should return empty array before loading', () => {
            const loader = new VoiceLoader({ speechSynthesis: mockSpeechSynthesis });
            
            expect(loader.getVoices()).toEqual([]);
        });

        test('should return cached voices after loading', async () => {
            mockSpeechSynthesis.getVoices = () => mockVoices;
            const loader = new VoiceLoader({ speechSynthesis: mockSpeechSynthesis });
            
            await loader.loadVoices();
            expect(loader.getVoices()).toEqual(mockVoices);
        });
    });

    describe('hasVoices()', () => {
        test('should return false before loading', () => {
            const loader = new VoiceLoader({ speechSynthesis: mockSpeechSynthesis });
            
            expect(loader.hasVoices()).toBe(false);
        });

        test('should return true after loading voices', async () => {
            mockSpeechSynthesis.getVoices = () => mockVoices;
            const loader = new VoiceLoader({ speechSynthesis: mockSpeechSynthesis });
            
            await loader.loadVoices();
            expect(loader.hasVoices()).toBe(true);
        });

        test('should return false if no voices loaded after retries', async () => {
            mockSpeechSynthesis.getVoices = () => [];
            const loader = new VoiceLoader({
                speechSynthesis: mockSpeechSynthesis,
                maxRetries: 2,
                initialDelay: 10
            });
            
            await loader.loadVoices();
            expect(loader.hasVoices()).toBe(false);
        });
    });

    describe('getRetryConfig()', () => {
        test('should return current configuration', () => {
            const loader = new VoiceLoader({
                maxRetries: 20,
                initialDelay: 50,
                maxDelay: 2000
            });
            
            const config = loader.getRetryConfig();
            expect(config).toEqual({
                maxRetries: 20,
                initialDelay: 50,
                maxDelay: 2000
            });
        });
    });

    describe('Integration Scenarios', () => {
        test('should handle voices becoming available after delay', async () => {
            let callCount = 0;
            mockSpeechSynthesis.getVoices = () => {
                callCount++;
                // Simulate browser loading voices asynchronously
                return callCount >= 4 ? mockVoices : [];
            };
            
            const loader = new VoiceLoader({
                speechSynthesis: mockSpeechSynthesis,
                initialDelay: 10,
                maxDelay: 100
            });
            
            const voices = await loader.loadVoices();
            
            expect(voices).toEqual(mockVoices);
            expect(voices.length).toBe(3);
        });

        test('should work with single voice', async () => {
            const singleVoice = [{ name: 'Test Voice', lang: 'pt-BR', localService: true }];
            mockSpeechSynthesis.getVoices = () => singleVoice;
            
            const loader = new VoiceLoader({ speechSynthesis: mockSpeechSynthesis });
            const voices = await loader.loadVoices();
            
            expect(voices).toEqual(singleVoice);
        });
    });
});
