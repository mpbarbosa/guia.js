/**
 * HTMLHeaderDisplayer
 *
 * Watches the live location DOM elements (`#municipio-value`, `#bairro-value`)
 * via MutationObserver and mirrors their text into `#header-location-text`
 * inside the hero header.
 *
 * Follows the existing Displayer conventions (frozen instance, log/warn,
 * toString, static factory method).
 *
 * @since 0.12.10-alpha
 */

import { log, warn } from '../utils/logger.js';

export class HTMLHeaderDisplayer {
	readonly _headerTextEl: Element | null;
	readonly _municipioEl: Element | null;
	readonly _bairroEl: Element | null;
	readonly _observer: MutationObserver | null;

	constructor(document: Document) {
		this._headerTextEl = document.getElementById('header-location-text');
		this._municipioEl  = document.getElementById('municipio-value');
		this._bairroEl     = document.getElementById('bairro-value');

		if (!this._headerTextEl) {
			warn('(HTMLHeaderDisplayer) #header-location-text not found — header will not update');
			this._observer = null;
			Object.freeze(this);
			return;
		}

		// Render once with whatever is already in the DOM
		this._render();

		// Watch for text changes in both source elements
		this._observer = new MutationObserver(() => this._render());

		const observerOptions: MutationObserverInit = {
			childList: true,
			characterData: true,
			subtree: true,
		};

		if (this._municipioEl) {
			this._observer.observe(this._municipioEl, observerOptions);
		}
		if (this._bairroEl) {
			this._observer.observe(this._bairroEl, observerOptions);
		}

		log('(HTMLHeaderDisplayer) Initialized — observing municipio + bairro');
		Object.freeze(this);
	}

	/** Update the hero subtitle from current DOM values. */
	_render(): void {
		if (!this._headerTextEl) return;

		const municipio = this._municipioEl?.textContent?.trim() || '—';
		const bairro    = this._bairroEl?.textContent?.trim()    || '—';
		const pending   = municipio === '—' && bairro === '—';

		this._headerTextEl.textContent = `${municipio} · ${bairro}`;
		this._headerTextEl.setAttribute('data-pending', pending ? 'true' : 'false');

		log(`(HTMLHeaderDisplayer) Updated: "${municipio} · ${bairro}"`);
	}

	/** Disconnect the observer (call on app teardown). */
	disconnect(): void {
		this._observer?.disconnect();
		log('(HTMLHeaderDisplayer) Observer disconnected');
	}

	toString(): string {
		return 'HTMLHeaderDisplayer';
	}

	/** Factory method — create and return a frozen instance. */
	static create(document: Document): HTMLHeaderDisplayer {
		return new HTMLHeaderDisplayer(document);
	}
}

export default HTMLHeaderDisplayer;
