'use strict';

/**
 * Voice selector with Brazilian Portuguese prioritization strategy.
 * 
 * Implements intelligent voice selection for speech synthesis, prioritizing
 * Brazilian Portuguese (pt-BR) voices while providing graceful fallbacks to
 * other Portuguese variants and default voices. Includes voice quality scoring
 * to select the best available voice when multiple options exist.
 * 
 * **Key Features**:
 * - pt-BR exact match prioritization
 * - pt-* fallback strategy (pt-PT, pt, etc.)
 * - Voice quality scoring (prefers local voices)
 * - Default voice handling
 * - Language filtering utilities
 * 
 * **Architecture**: Single Responsibility - Voice Selection Only
 * - Does NOT load voices (see VoiceLoader)
 * - Does NOT manage speech synthesis (see SpeechSynthesisManager)
 * - Focused solely on selecting the best voice from available options
 * 
 * **Selection Strategy**:
 * 1. Try exact language match (e.g., pt-BR)
 * 2. Try language prefix match (e.g., pt-*)
 * 3. Use first available voice as fallback
 * 4. Return null if no voices available
 * 
 * @class VoiceSelector
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * // Basic usage
 * const selector = new VoiceSelector();
 * const voices = speechSynthesis.getVoices();
 * const selectedVoice = selector.selectVoice(voices);
 * 
 * @example
 * // Custom configuration
 * const selector = new VoiceSelector({
 *   primaryLang: 'en-us',
 *   fallbackLangPrefix: 'en'
 * });
 * const voice = selector.selectVoice(voices);
 * 
 * @example
 * // Filter voices by language
 * const selector = new VoiceSelector();
 * const ptBRVoices = selector.filterByLanguage(voices, 'pt-BR');
 * console.log(`Found ${ptBRVoices.length} pt-BR voices`);
 */
class VoiceSelector {
    /**
     * Creates a new VoiceSelector instance.
     * 
     * @param {Object} config - Configuration options
     * @param {string} [config.primaryLang='pt-br'] - Primary target language (lowercase)
     * @param {string} [config.fallbackLangPrefix='pt'] - Fallback language prefix (lowercase)
     * 
     * @example
     * const selector = new VoiceSelector();
     * 
     * @example
     * const selector = new VoiceSelector({
     *   primaryLang: 'en-us',
     *   fallbackLangPrefix: 'en'
     * });
     */
    constructor(config = {}) {
        /**
         * Primary target language (lowercase).
         * @type {string}
         * @private
         */
        this.primaryLang = (config.primaryLang || 'pt-br').toLowerCase();
        
        /**
         * Fallback language prefix for broader matching (lowercase).
         * @type {string}
         * @private
         */
        this.fallbackLangPrefix = (config.fallbackLangPrefix || 'pt').toLowerCase();
    }
    
    /**
     * Selects the best voice from available voices using prioritization strategy.
     * 
     * **Selection Priority**:
     * 1. Exact primary language match (e.g., pt-BR) with highest quality score
     * 2. Language prefix match (e.g., pt-*) with highest quality score
     * 3. First available voice (ultimate fallback)
     * 4. null if no voices available
     * 
     * **Quality Scoring**:
     * - Local voices preferred over remote voices
     * - Exact language match scores higher
     * 
     * @param {SpeechSynthesisVoice[]} voices - Available voices to select from
     * @returns {SpeechSynthesisVoice|null} Selected voice or null if no voices available
     * 
     * @example
     * const selector = new VoiceSelector();
     * const voices = speechSynthesis.getVoices();
     * const selectedVoice = selector.selectVoice(voices);
     * 
     * if (selectedVoice) {
     *   console.log(`Selected: ${selectedVoice.name} (${selectedVoice.lang})`);
     * }
     */
    selectVoice(voices) {
        // Handle empty voice array
        if (!voices || voices.length === 0) {
            return null;
        }
        
        // PRIORITY 1: Try exact primary language match
        const primaryVoices = this.filterByLanguage(voices, this.primaryLang);
        if (primaryVoices.length > 0) {
            return this._selectBestVoice(primaryVoices);
        }
        
        // PRIORITY 2: Try fallback language prefix match
        const fallbackVoices = this.filterByLanguagePrefix(voices, this.fallbackLangPrefix);
        if (fallbackVoices.length > 0) {
            return this._selectBestVoice(fallbackVoices);
        }
        
        // PRIORITY 3: Use first available voice as ultimate fallback
        return voices[0] || null;
    }
    
    /**
     * Filters voices by exact language match (case-insensitive).
     * 
     * @param {SpeechSynthesisVoice[]} voices - Voices to filter
     * @param {string} langCode - Language code (e.g., 'pt-BR', 'en-US')
     * @returns {SpeechSynthesisVoice[]} Matching voices
     * 
     * @example
     * const selector = new VoiceSelector();
     * const ptBRVoices = selector.filterByLanguage(voices, 'pt-BR');
     */
    filterByLanguage(voices, langCode) {
        const targetLang = langCode.toLowerCase();
        return voices.filter(voice => 
            voice.lang && voice.lang.toLowerCase() === targetLang
        );
    }
    
    /**
     * Filters voices by language prefix match (case-insensitive).
     * 
     * Useful for finding all variants of a language (e.g., 'pt' matches 'pt-BR', 'pt-PT').
     * 
     * @param {SpeechSynthesisVoice[]} voices - Voices to filter
     * @param {string} langPrefix - Language prefix (e.g., 'pt', 'en')
     * @returns {SpeechSynthesisVoice[]} Matching voices
     * 
     * @example
     * const selector = new VoiceSelector();
     * const allPortugueseVoices = selector.filterByLanguagePrefix(voices, 'pt');
     * // Returns voices with lang: 'pt-BR', 'pt-PT', 'pt', etc.
     */
    filterByLanguagePrefix(voices, langPrefix) {
        const targetPrefix = langPrefix.toLowerCase();
        return voices.filter(voice =>
            voice.lang && voice.lang.toLowerCase().startsWith(targetPrefix)
        );
    }
    
    /**
     * Scores a voice for quality ranking.
     * 
     * **Scoring Criteria**:
     * - Local voices: +10 points (faster, more reliable)
     * - Exact primary language match: +20 points
     * - Base score: 0 points
     * 
     * Higher scores indicate better voices for selection.
     * 
     * @param {SpeechSynthesisVoice} voice - Voice to score
     * @returns {number} Quality score (higher is better)
     * 
     * @example
     * const selector = new VoiceSelector();
     * const score = selector.scoreVoice(voice);
     * console.log(`Voice quality score: ${score}`);
     */
    scoreVoice(voice) {
        let score = 0;
        
        // Prefer local voices (faster, more reliable)
        if (voice.localService) {
            score += 10;
        }
        
        // Prefer exact primary language match
        if (voice.lang && voice.lang.toLowerCase() === this.primaryLang) {
            score += 20;
        }
        
        return score;
    }
    
    /**
     * Selects the best voice from candidates using quality scoring.
     * 
     * @private
     * @param {SpeechSynthesisVoice[]} voices - Candidate voices
     * @returns {SpeechSynthesisVoice|null} Best voice or null
     */
    _selectBestVoice(voices) {
        if (voices.length === 0) {
            return null;
        }
        
        if (voices.length === 1) {
            return voices[0];
        }
        
        // Score all voices and select highest score
        let bestVoice = voices[0];
        let bestScore = this.scoreVoice(bestVoice);
        
        for (let i = 1; i < voices.length; i++) {
            const score = this.scoreVoice(voices[i]);
            if (score > bestScore) {
                bestScore = score;
                bestVoice = voices[i];
            }
        }
        
        return bestVoice;
    }
    
    /**
     * Gets information about the selected voice.
     * 
     * Provides metadata about a voice selection including its type
     * (primary match, fallback, or default).
     * 
     * @param {SpeechSynthesisVoice|null} voice - Voice to get info about
     * @returns {{type: string, name: string, lang: string, isLocal: boolean}|null}
     * 
     * @example
     * const selector = new VoiceSelector();
     * const selectedVoice = selector.selectVoice(voices);
     * const info = selector.getVoiceInfo(selectedVoice);
     * console.log(`Type: ${info.type}, Name: ${info.name}`);
     */
    getVoiceInfo(voice) {
        if (!voice) {
            return null;
        }
        
        const lang = voice.lang ? voice.lang.toLowerCase() : '';
        
        // Determine voice type
        let type;
        if (lang === this.primaryLang) {
            type = 'primary';
        } else if (lang.startsWith(this.fallbackLangPrefix)) {
            type = 'fallback';
        } else {
            type = 'default';
        }
        
        return {
            type,
            name: voice.name || 'Unknown',
            lang: voice.lang || 'Unknown',
            isLocal: voice.localService || false
        };
    }
    
    /**
     * Gets the current configuration.
     * 
     * @returns {{primaryLang: string, fallbackLangPrefix: string}}
     * 
     * @example
     * const selector = new VoiceSelector();
     * const config = selector.getConfig();
     * console.log(`Primary: ${config.primaryLang}`);
     */
    getConfig() {
        return {
            primaryLang: this.primaryLang,
            fallbackLangPrefix: this.fallbackLangPrefix
        };
    }
}

export default VoiceSelector;
