/**
 * Tests for VoiceSelector class
 * 
 * @jest-environment jsdom
 */

import VoiceSelector from '../../src/speech/VoiceSelector.js';

describe('VoiceSelector', () => {
    let mockVoices;

    beforeEach(() => {
        // Create comprehensive mock voice set
        mockVoices = [
            { name: 'Google português do Brasil', lang: 'pt-BR', localService: false },
            { name: 'Microsoft Maria', lang: 'pt-BR', localService: true },
            { name: 'Google português', lang: 'pt-PT', localService: false },
            { name: 'Luciana (pt-BR)', lang: 'pt-br', localService: true }, // lowercase variant
            { name: 'Google US English', lang: 'en-US', localService: false },
            { name: 'Alex', lang: 'en-US', localService: true },
            { name: 'Google español', lang: 'es-ES', localService: false }
        ];
    });

    describe('Constructor', () => {
        test('should create instance with default config', () => {
            const selector = new VoiceSelector();
            
            const config = selector.getConfig();
            expect(config.primaryLang).toBe('pt-br');
            expect(config.fallbackLangPrefix).toBe('pt');
        });

        test('should accept custom config', () => {
            const selector = new VoiceSelector({
                primaryLang: 'en-US',
                fallbackLangPrefix: 'en'
            });
            
            const config = selector.getConfig();
            expect(config.primaryLang).toBe('en-us'); // lowercase
            expect(config.fallbackLangPrefix).toBe('en');
        });

        test('should normalize config to lowercase', () => {
            const selector = new VoiceSelector({
                primaryLang: 'PT-BR',
                fallbackLangPrefix: 'PT'
            });
            
            const config = selector.getConfig();
            expect(config.primaryLang).toBe('pt-br');
            expect(config.fallbackLangPrefix).toBe('pt');
        });
    });

    describe('selectVoice() - Priority 1: Exact Match', () => {
        test('should select exact primary language match', () => {
            const selector = new VoiceSelector();
            const selectedVoice = selector.selectVoice(mockVoices);
            
            expect(selectedVoice).not.toBeNull();
            expect(selectedVoice.lang.toLowerCase()).toBe('pt-br');
        });

        test('should select local voice over remote when multiple exact matches', () => {
            const selector = new VoiceSelector();
            const selectedVoice = selector.selectVoice(mockVoices);
            
            // Should prefer local voices (Microsoft Maria or Luciana)
            expect(selectedVoice.localService).toBe(true);
        });

        test('should handle case-insensitive language matching', () => {
            const voices = [
                { name: 'Test 1', lang: 'PT-BR', localService: false },
                { name: 'Test 2', lang: 'pt-br', localService: true }
            ];
            
            const selector = new VoiceSelector();
            const selectedVoice = selector.selectVoice(voices);
            
            expect(selectedVoice.localService).toBe(true);
        });
    });

    describe('selectVoice() - Priority 2: Prefix Match', () => {
        test('should fallback to language prefix when no exact match', () => {
            const voicesNoBR = mockVoices.filter(v => 
                v.lang.toLowerCase() !== 'pt-br'
            );
            
            const selector = new VoiceSelector();
            const selectedVoice = selector.selectVoice(voicesNoBR);
            
            expect(selectedVoice.lang).toBe('pt-PT');
        });

        test('should prefer local fallback voices', () => {
            const voicesWithLocalPT = [
                { name: 'Remote PT', lang: 'pt-PT', localService: false },
                { name: 'Local PT', lang: 'pt-PT', localService: true },
                { name: 'English', lang: 'en-US', localService: true }
            ];
            
            const selector = new VoiceSelector();
            const selectedVoice = selector.selectVoice(voicesWithLocalPT);
            
            expect(selectedVoice.name).toBe('Local PT');
            expect(selectedVoice.localService).toBe(true);
        });
    });

    describe('selectVoice() - Priority 3: Default Fallback', () => {
        test('should use first voice when no language match', () => {
            const nonPortugueseVoices = mockVoices.filter(v =>
                !v.lang.toLowerCase().startsWith('pt')
            );
            
            const selector = new VoiceSelector();
            const selectedVoice = selector.selectVoice(nonPortugueseVoices);
            
            expect(selectedVoice).toBe(nonPortugueseVoices[0]);
        });

        test('should return null for empty voice array', () => {
            const selector = new VoiceSelector();
            const selectedVoice = selector.selectVoice([]);
            
            expect(selectedVoice).toBeNull();
        });

        test('should return null for null voices', () => {
            const selector = new VoiceSelector();
            const selectedVoice = selector.selectVoice(null);
            
            expect(selectedVoice).toBeNull();
        });
    });

    describe('filterByLanguage()', () => {
        test('should filter voices by exact language code', () => {
            const selector = new VoiceSelector();
            const ptBRVoices = selector.filterByLanguage(mockVoices, 'pt-BR');
            
            expect(ptBRVoices.length).toBe(3); // Google, Microsoft, Luciana
            ptBRVoices.forEach(voice => {
                expect(voice.lang.toLowerCase()).toBe('pt-br');
            });
        });

        test('should be case-insensitive', () => {
            const selector = new VoiceSelector();
            const voices1 = selector.filterByLanguage(mockVoices, 'PT-BR');
            const voices2 = selector.filterByLanguage(mockVoices, 'pt-br');
            
            expect(voices1.length).toBe(voices2.length);
        });

        test('should return empty array when no matches', () => {
            const selector = new VoiceSelector();
            const frenchVoices = selector.filterByLanguage(mockVoices, 'fr-FR');
            
            expect(frenchVoices).toEqual([]);
        });
    });

    describe('filterByLanguagePrefix()', () => {
        test('should filter voices by language prefix', () => {
            const selector = new VoiceSelector();
            const allPortuguese = selector.filterByLanguagePrefix(mockVoices, 'pt');
            
            expect(allPortuguese.length).toBe(4); // pt-BR, pt-BR, pt-br, pt-PT
        });

        test('should be case-insensitive', () => {
            const selector = new VoiceSelector();
            const voices1 = selector.filterByLanguagePrefix(mockVoices, 'PT');
            const voices2 = selector.filterByLanguagePrefix(mockVoices, 'pt');
            
            expect(voices1.length).toBe(voices2.length);
        });

        test('should return empty array when no matches', () => {
            const selector = new VoiceSelector();
            const frenchVoices = selector.filterByLanguagePrefix(mockVoices, 'fr');
            
            expect(frenchVoices).toEqual([]);
        });

        test('should find all English variants', () => {
            const selector = new VoiceSelector();
            const allEnglish = selector.filterByLanguagePrefix(mockVoices, 'en');
            
            expect(allEnglish.length).toBe(2); // en-US voices
        });
    });

    describe('scoreVoice()', () => {
        test('should give higher score to local voices', () => {
            const selector = new VoiceSelector();
            const localVoice = { name: 'Local', lang: 'en-US', localService: true };
            const remoteVoice = { name: 'Remote', lang: 'en-US', localService: false };
            
            const localScore = selector.scoreVoice(localVoice);
            const remoteScore = selector.scoreVoice(remoteVoice);
            
            expect(localScore).toBeGreaterThan(remoteScore);
        });

        test('should give higher score to primary language match', () => {
            const selector = new VoiceSelector();
            const primaryVoice = { name: 'Primary', lang: 'pt-BR', localService: false };
            const otherVoice = { name: 'Other', lang: 'en-US', localService: false };
            
            const primaryScore = selector.scoreVoice(primaryVoice);
            const otherScore = selector.scoreVoice(otherVoice);
            
            expect(primaryScore).toBeGreaterThan(otherScore);
        });

        test('should give highest score to local + primary language', () => {
            const selector = new VoiceSelector();
            const bestVoice = { name: 'Best', lang: 'pt-BR', localService: true };
            const goodVoice = { name: 'Good', lang: 'pt-BR', localService: false };
            const okVoice = { name: 'OK', lang: 'en-US', localService: true };
            
            const bestScore = selector.scoreVoice(bestVoice);
            const goodScore = selector.scoreVoice(goodVoice);
            const okScore = selector.scoreVoice(okVoice);
            
            expect(bestScore).toBeGreaterThan(goodScore);
            expect(bestScore).toBeGreaterThan(okScore);
        });

        test('should return 0 for non-local, non-primary voice', () => {
            const selector = new VoiceSelector();
            const voice = { name: 'Basic', lang: 'en-US', localService: false };
            
            const score = selector.scoreVoice(voice);
            
            expect(score).toBe(0);
        });
    });

    describe('getVoiceInfo()', () => {
        test('should identify primary voice type', () => {
            const selector = new VoiceSelector();
            const voice = { name: 'Test', lang: 'pt-BR', localService: true };
            
            const info = selector.getVoiceInfo(voice);
            
            expect(info.type).toBe('primary');
            expect(info.name).toBe('Test');
            expect(info.lang).toBe('pt-BR');
            expect(info.isLocal).toBe(true);
        });

        test('should identify fallback voice type', () => {
            const selector = new VoiceSelector();
            const voice = { name: 'Test', lang: 'pt-PT', localService: false };
            
            const info = selector.getVoiceInfo(voice);
            
            expect(info.type).toBe('fallback');
        });

        test('should identify default voice type', () => {
            const selector = new VoiceSelector();
            const voice = { name: 'Test', lang: 'en-US', localService: false };
            
            const info = selector.getVoiceInfo(voice);
            
            expect(info.type).toBe('default');
        });

        test('should return null for null voice', () => {
            const selector = new VoiceSelector();
            const info = selector.getVoiceInfo(null);
            
            expect(info).toBeNull();
        });

        test('should handle voice without lang property', () => {
            const selector = new VoiceSelector();
            const voice = { name: 'Test', localService: false };
            
            const info = selector.getVoiceInfo(voice);
            
            expect(info.type).toBe('default');
            expect(info.lang).toBe('Unknown');
        });
    });

    describe('Integration Scenarios', () => {
        test('should work with single voice', () => {
            const selector = new VoiceSelector();
            const singleVoice = [mockVoices[0]];
            
            const selected = selector.selectVoice(singleVoice);
            
            expect(selected).toBe(singleVoice[0]);
        });

        test('should handle voices with missing lang property', () => {
            const selector = new VoiceSelector();
            const voicesWithMissing = [
                { name: 'No Lang', localService: false },
                { name: 'Has Lang', lang: 'pt-BR', localService: true }
            ];
            
            const selected = selector.selectVoice(voicesWithMissing);
            
            expect(selected.name).toBe('Has Lang');
        });

        test('should work with custom language configuration', () => {
            const selector = new VoiceSelector({
                primaryLang: 'en-US',
                fallbackLangPrefix: 'en'
            });
            
            const selected = selector.selectVoice(mockVoices);
            
            expect(selected.lang).toBe('en-US');
        });
    });
});
