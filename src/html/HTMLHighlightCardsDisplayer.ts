import { ADDRESS_FETCHED_EVENT } from '../config/defaults.js';
import { log, warn } from '../utils/logger.js';
import type BrazilianStandardAddress from '../data/BrazilianStandardAddress.js';
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
 * Module-level WeakMap used to store per-instance mutable state for the
 * frozen HTMLHighlightCardsDisplayer instances.  Keyed by the displayer
 * instance; the value is the previously-displayed logradouro string (or
 * `null` before the first update).
 */
const _previousLogradouro = new WeakMap<HTMLHighlightCardsDisplayer, string | null>();
const _hasRenderedAddress = new WeakMap<HTMLHighlightCardsDisplayer, boolean>();

const CONFIRMED_FIELD_CHANGE_EVENTS = new Set([
    'MunicipioChanged',
    'BairroChanged',
    'LogradouroChanged'
] as const);

/**
 * Displayer for municipio, bairro, and logradouro highlight cards
 * 
 * @class
 */
class HTMLHighlightCardsDisplayer {
	_document: Document;
	_municipioElement: HTMLElement | null;
	_regiaoMetropolitanaElement: HTMLElement | null;
	_bairroElement: HTMLElement | null;
	_logradouroElement: HTMLElement | null;
	_municipioCard: HTMLElement | null;
	_bairroCard: HTMLElement | null;
	_logradouroCard: HTMLElement | null;
    /**
     * Creates a new HTMLHighlightCardsDisplayer instance
     * 
     * @param {Document} document - Document object for DOM queries
     */
    constructor(document: Document) {
        if (!document) {
            throw new TypeError('HTMLHighlightCardsDisplayer: document is required');
        }
        
        this._document = document;
        this._municipioElement = document.getElementById('municipio-value');
        this._regiaoMetropolitanaElement = document.getElementById('regiao-metropolitana-value');
        this._bairroElement = document.getElementById('bairro-value');
        this._logradouroElement = document.getElementById('logradouro-value');
        
        // Get parent cards for aria-busy management
        // Use closest() only if available (browser environment)
        this._municipioCard = this._municipioElement?.closest ? this._municipioElement.closest('.highlight-card') : null;
        this._bairroCard = this._bairroElement?.closest ? this._bairroElement.closest('.highlight-card') : null;
        this._logradouroCard = this._logradouroElement?.closest ? this._logradouroElement.closest('.highlight-card') : null;
        
        // Initialise mutable state before freezing
        _previousLogradouro.set(this, null);
        _hasRenderedAddress.set(this, false);
        
        Object.freeze(this);
    }
    
    /**
     * Briefly applies the `card-blink` CSS animation to the logradouro card
     * to signal that the street name has changed.
     * The class is removed automatically when the animation ends.
     * 
     * @private
     */
    _blinkLogradouroCard(): void {
        const card = this._logradouroCard;
        if (!card || !card.classList) return;

        card.classList.add('card-blink');
        card.addEventListener('animationend', function onEnd() {
            card.classList.remove('card-blink');
        }, { once: true });
    }
    
    /**
     * Sets loading state with ARIA attributes for screen readers
     * 
     * @param {boolean} isLoading - Whether content is loading
     * @private
     */
    _setLoadingState(isLoading: boolean): void {
        const cards = [this._municipioCard, this._bairroCard, this._logradouroCard];
        
        cards.forEach(card => {
            if (card) {
                if (isLoading) {
                    card.setAttribute('aria-busy', 'true');
                    card.classList.add('skeleton-loading');
                } else {
                    card.removeAttribute('aria-busy');
                    card.classList.remove('skeleton-loading');
                }
            }
        });
        
        log(`(HTMLHighlightCardsDisplayer) Loading state: ${isLoading ? 'started' : 'completed'}`);
    }
    
    /**
     * Shows loading state (call before geocoding starts)
     */
    showLoading(): void {
        this._setLoadingState(true);
    }
    
    /**
     * Hides loading state (automatically called by update)
     */
    hideLoading(): void {
        this._setLoadingState(false);
    }

    private _resolveAddressForUpdate(
        currentAddressOrRawData: Record<string, unknown> | BrazilianStandardAddress | null,
        enderecoPadronizadoOrEvent: BrazilianStandardAddress | string | null,
        posEvent?: string | null,
        changeDetails?: { currentAddress?: BrazilianStandardAddress | null }
    ): BrazilianStandardAddress | null {
        if (
            typeof enderecoPadronizadoOrEvent === 'string' &&
            CONFIRMED_FIELD_CHANGE_EVENTS.has(enderecoPadronizadoOrEvent as 'MunicipioChanged' | 'BairroChanged' | 'LogradouroChanged')
        ) {
            return changeDetails?.currentAddress ?? (
                currentAddressOrRawData instanceof Object
                    ? currentAddressOrRawData as BrazilianStandardAddress
                    : null
            );
        }

        if (typeof enderecoPadronizadoOrEvent === 'string') {
            return null;
        }

        if (posEvent === ADDRESS_FETCHED_EVENT && _hasRenderedAddress.get(this)) {
            return null;
        }

        return enderecoPadronizadoOrEvent;
    }
    
    /**
     * Updates highlight cards when address data changes
     * 
     * @param {Object} addressData - Address data from geocoding
     * @param {Object} enderecoPadronizado - Standardized Brazilian address
     */
    update(
        addressData: Record<string, unknown> | BrazilianStandardAddress | null,
        enderecoPadronizado: BrazilianStandardAddress | string | null,
        _posEvent?: string | null,
        changeDetails?: { currentAddress?: BrazilianStandardAddress | null }
    ): void {
        const resolvedAddress = this._resolveAddressForUpdate(
            addressData,
            enderecoPadronizado,
            _posEvent,
            changeDetails
        );

        log('(HTMLHighlightCardsDisplayer) update called with:', {
            hasAddressData: !!addressData,
            hasEnderecoPadronizado: !!resolvedAddress,
            municipio: resolvedAddress?.municipio,
            regiaoMetropolitana: resolvedAddress?.regiaoMetropolitana,
            bairro: resolvedAddress?.bairro
        });
        
        if (!resolvedAddress) {
            warn('(HTMLHighlightCardsDisplayer) No enderecoPadronizado provided, skipping update');
            return;
        }
        
        // Clear loading state before updating content
        this._setLoadingState(false);
        _hasRenderedAddress.set(this, true);
        
        // Update metropolitan region (displayed between label and municipality)
        if (this._regiaoMetropolitanaElement) {
            const regiaoMetropolitana = resolvedAddress.regiaoMetropolitanaFormatada();
            this._regiaoMetropolitanaElement.textContent = regiaoMetropolitana;
            log('(HTMLHighlightCardsDisplayer) Updated regiao-metropolitana-value to:', regiaoMetropolitana || '(empty)');
        } else {
            warn('(HTMLHighlightCardsDisplayer) regiaoMetropolitanaElement not found');
        }
        
        // Update municipio with state abbreviation
        if (this._municipioElement) {
            const municipio = resolvedAddress.municipioCompleto() || '—';
            this._municipioElement.textContent = municipio;
            log('(HTMLHighlightCardsDisplayer) Updated municipio-value to:', municipio);
        } else {
            warn('(HTMLHighlightCardsDisplayer) municipioElement not found');
        }
        
        // Update bairro
        if (this._bairroElement) {
            const bairro = resolvedAddress.bairro || '—';
            this._bairroElement.textContent = bairro;
            log('(HTMLHighlightCardsDisplayer) Updated bairro-value to:', bairro);
        } else {
            warn('(HTMLHighlightCardsDisplayer) bairroElement not found');
        }
        
        // Update logradouro
        if (this._logradouroElement) {
            const logradouro = resolvedAddress.logradouro || '—';
            const previous = _previousLogradouro.get(this);
            if (previous !== null && logradouro !== previous) {
                this._blinkLogradouroCard();
            }
            _previousLogradouro.set(this, logradouro);
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
