'use strict';
import { log, warn, error } from '../utils/logger.js';

/**
 * HTMLHighlightCardsDisplayer - Updates highlight cards for municipio, bairro, and logradouro
 * 
 * @fileoverview Simple displayer that updates the municipio, bairro, and logradouro highlight cards
 * when address data changes.
 * 
 * @module html/HTMLHighlightCardsDisplayer
 * @since 0.9.0-alpha
 * @author Marcelo Pereira Barbosa
 */

/**
 * Displayer for municipio, bairro, and logradouro highlight cards
 * 
 * @class
 */
class HTMLHighlightCardsDisplayer {
    /**
     * Creates a new HTMLHighlightCardsDisplayer instance
     * 
     * @param {Document} document - Document object for DOM queries
     */
    constructor(document) {
        if (!document) {
            throw new TypeError('HTMLHighlightCardsDisplayer: document is required');
        }
        
        this._document = document;
        this._municipioElement = document.getElementById('municipio-value');
        this._regiaoMetropolitanaElement = document.getElementById('regiao-metropolitana-value');
        this._bairroElement = document.getElementById('bairro-value');
        this._logradouroElement = document.getElementById('logradouro-value');
        
        Object.freeze(this);
    }
    
    /**
     * Updates highlight cards when address data changes
     * 
     * @param {Object} addressData - Address data from geocoding
     * @param {Object} enderecoPadronizado - Standardized Brazilian address
     */
    update(addressData, enderecoPadronizado) {
        log('(HTMLHighlightCardsDisplayer) update called with:', {
            hasAddressData: !!addressData,
            hasEnderecoPadronizado: !!enderecoPadronizado,
            municipio: enderecoPadronizado?.municipio,
            regiaoMetropolitana: enderecoPadronizado?.regiaoMetropolitana,
            bairro: enderecoPadronizado?.bairro
        });
        
        if (!enderecoPadronizado) {
            warn('(HTMLHighlightCardsDisplayer) No enderecoPadronizado provided, skipping update');
            return;
        }
        
        // Update metropolitan region (displayed between label and municipality)
        if (this._regiaoMetropolitanaElement) {
            const regiaoMetropolitana = enderecoPadronizado.regiaoMetropolitanaFormatada();
            this._regiaoMetropolitanaElement.textContent = regiaoMetropolitana;
            log('(HTMLHighlightCardsDisplayer) Updated regiao-metropolitana-value to:', regiaoMetropolitana || '(empty)');
        } else {
            warn('(HTMLHighlightCardsDisplayer) regiaoMetropolitanaElement not found');
        }
        
        // Update municipio with state abbreviation
        if (this._municipioElement) {
            const municipio = enderecoPadronizado.municipioCompleto() || '—';
            this._municipioElement.textContent = municipio;
            log('(HTMLHighlightCardsDisplayer) Updated municipio-value to:', municipio);
        } else {
            warn('(HTMLHighlightCardsDisplayer) municipioElement not found');
        }
        
        // Update bairro
        if (this._bairroElement) {
            const bairro = enderecoPadronizado.bairro || '—';
            this._bairroElement.textContent = bairro;
            log('(HTMLHighlightCardsDisplayer) Updated bairro-value to:', bairro);
        } else {
            warn('(HTMLHighlightCardsDisplayer) bairroElement not found');
        }
        
        // Update logradouro
        if (this._logradouroElement) {
            const logradouro = enderecoPadronizado.logradouro || '—';
            this._logradouroElement.textContent = logradouro;
            log('(HTMLHighlightCardsDisplayer) Updated logradouro-value to:', logradouro);
        } else {
            warn('(HTMLHighlightCardsDisplayer) logradouroElement not found');
        }
    }
}

// ES6 module export
export default HTMLHighlightCardsDisplayer;

// Export for Node.js and browser (CommonJS compatibility)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HTMLHighlightCardsDisplayer;
}
