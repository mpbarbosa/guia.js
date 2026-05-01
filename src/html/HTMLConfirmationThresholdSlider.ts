import AddressCache from '../data/AddressCache.js';
import {
	MAX_ADDRESS_CONFIRMATION_BUFFER_THRESHOLD,
	MIN_ADDRESS_CONFIRMATION_BUFFER_THRESHOLD,
	getCurrentAddressConfirmationBufferThreshold,
	setCurrentAddressConfirmationBufferThreshold,
	subscribeAddressConfirmationThreshold
} from '../config/addressConfirmation.js';

const SLIDER_ID = 'address-confirmation-threshold-slider';
const HELP_ID = 'address-confirmation-threshold-help';
const LABEL_ID = 'address-confirmation-threshold-label';
const VALUE_ID = 'address-confirmation-threshold-value';

class HTMLConfirmationThresholdSlider {
	private readonly _element: HTMLElement;
	private _input: HTMLInputElement | null;
	private _value: HTMLOutputElement | null;
	private _unsubscribe: (() => void) | null;

	constructor(element: HTMLElement) {
		this._element = element;
		this._input = null;
		this._value = null;
		this._unsubscribe = null;

		this._render();
		this._bindElements();
		this._applyValue(getCurrentAddressConfirmationBufferThreshold());
		AddressCache.configure({
			addressConfirmationBufferThreshold: getCurrentAddressConfirmationBufferThreshold()
		});
		this._unsubscribe = subscribeAddressConfirmationThreshold((threshold) => {
			this._applyValue(threshold);
		});
	}

	private _render(): void {
		this._element.innerHTML = `
<section class="confirmation-threshold-control" aria-labelledby="${LABEL_ID}">
  <div class="confirmation-threshold-header">
    <div class="confirmation-threshold-copy">
      <label id="${LABEL_ID}" class="form-label small fw-semibold mb-1" for="${SLIDER_ID}">
        Sensibilidade do buffer de confirmação
      </label>
      <p id="${HELP_ID}" class="confirmation-threshold-help mb-0">
        Ajusta quantas leituras consecutivas iguais confirmam logradouro, bairro e municipio.
      </p>
    </div>
    <output
      id="${VALUE_ID}"
      class="badge text-bg-primary confirmation-threshold-value"
      for="${SLIDER_ID}"
      aria-live="polite"
    ></output>
  </div>

  <input
    id="${SLIDER_ID}"
    class="form-range confirmation-threshold-range"
    type="range"
    min="${MIN_ADDRESS_CONFIRMATION_BUFFER_THRESHOLD}"
    max="${MAX_ADDRESS_CONFIRMATION_BUFFER_THRESHOLD}"
    step="1"
    aria-label="Ajustar limiar do buffer de confirmação de endereço"
    aria-describedby="${HELP_ID}"
    aria-controls="confirmation-buffer-card"
  />

  <div class="confirmation-threshold-scale" aria-hidden="true">
    <span>${MIN_ADDRESS_CONFIRMATION_BUFFER_THRESHOLD}</span>
    <span>${MAX_ADDRESS_CONFIRMATION_BUFFER_THRESHOLD}</span>
  </div>
</section>`;
	}

	private _bindElements(): void {
		this._input = this._element.querySelector(`#${SLIDER_ID}`);
		this._value = this._element.querySelector(`#${VALUE_ID}`);

		if (!this._input || !this._value) {
			throw new Error('HTMLConfirmationThresholdSlider requires slider and output elements');
		}

		this._input.addEventListener('input', this._handleInput);
		this._input.addEventListener('change', this._handleInput);
	}

	private readonly _handleInput = (event: Event): void => {
		const input = event.currentTarget;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		const nextThreshold = setCurrentAddressConfirmationBufferThreshold(Number(input.value));
		this._applyValue(nextThreshold);
		AddressCache.configure({
			addressConfirmationBufferThreshold: nextThreshold
		});
	};

	private _applyValue(threshold: number): void {
		if (!this._input || !this._value) {
			return;
		}

		this._input.value = String(threshold);
		this._value.value = this._formatThresholdText(threshold);
		this._value.textContent = this._formatThresholdText(threshold);
	}

	private _formatThresholdText(threshold: number): string {
		return threshold === 1 ? '1 leitura' : `${threshold} leituras`;
	}

	destroy(): void {
		if (this._input) {
			this._input.removeEventListener('input', this._handleInput);
			this._input.removeEventListener('change', this._handleInput);
		}

		if (this._unsubscribe) {
			this._unsubscribe();
			this._unsubscribe = null;
		}
	}
}

export default HTMLConfirmationThresholdSlider;
