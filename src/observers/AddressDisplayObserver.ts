import { log, warn } from '../utils/logger.js';
import { escapeHtml } from '../utils/html-sanitizer.js';
import { ADDRESS_FETCHED_EVENT } from '../config/defaults.js';

/**
 * Observer that updates a DOM element when address data changes.
 *
 * Implements the GoF object-observer contract (`update()`) consumed by
 * `DualObserverSubject.notifyObservers()`. It is used as an internal component
 * of `HTMLAddressDisplayer`, which acts as the registered subject observer and
 * delegates its `update()` call here.
 *
 * Dependencies are injected via constructor, making this class independently
 * testable without a full `HTMLAddressDisplayer` instance.
 *
 * @class AddressDisplayObserver
 * @since 0.11.9-alpha
 * @author Marcelo Pereira Barbosa
 */
export class AddressDisplayObserver {
	element: any;
	displayer: any;

	constructor(element: any, displayer: any) {
		if (displayer == null) {
			throw new TypeError("displayer parameter cannot be null or undefined");
		}

		this.element = element;
		this.displayer = displayer;

		// NOTE: This instance is frozen because element and displayer are set once
		// at construction and never mutated across update() calls
		Object.freeze(this);
	}

	/**
	 * Handles address data updates from the observer subject.
	 *
	 * Responds to loading, error, and successful address states and writes
	 * the appropriate HTML into the target element via `displayer.renderAddressHtml()`.
	 *
	 * @param {any} addressData - Raw address data from geocoding API
	 * @param {any} enderecoPadronizado - Standardized Brazilian address
	 * @param {string} posEvent - The position event type
	 * @param {unknown} loading - Truthy when address is still loading
	 * @param {{ message: string } | null | false} error - Error object, or null/false when none
	 */
	update(addressData: any, enderecoPadronizado: any, posEvent: string, loading: unknown, error: { message: string } | null | false): void {
		log(`(AddressDisplayObserver) update() called with posEvent: ${posEvent}`);

		if (!this.element) {
			warn('(AddressDisplayObserver) No element provided, skipping update');
			return;
		}

		if (loading) {
			this.element.innerHTML = '<p class="loading">Carregando endereço...</p>';
			return;
		}

		if (error) {
			this.element.innerHTML = `<p class="error">Erro ao carregar endereço: ${escapeHtml(error.message)}</p>`;
			return;
		}

		if (posEvent === ADDRESS_FETCHED_EVENT && (addressData || enderecoPadronizado)) {
			const html = this.displayer.renderAddressHtml(addressData, enderecoPadronizado);
			this.element.innerHTML = html;
		}
	}

	toString(): string {
		return this.constructor.name;
	}
}

export default AddressDisplayObserver;
