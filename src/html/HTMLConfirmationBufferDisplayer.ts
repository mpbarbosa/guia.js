import timerManager from '../utils/TimerManager.js';
import AddressCache from '../data/AddressCache.js';
import type { ConfirmationBufferState, FieldBufferState } from '../data/AddressCache.js';

const TIMER_ID = 'confirmation-buffer-card';

/**
 * Debug panel that live-polls all three AddressFieldConfirmationBuffer instances
 * (logradouro, bairro, municipio) from AddressCache and renders their state inside
 * a Bootstrap card.  Refreshes every second via TimerManager.
 *
 * @since 0.17.2-alpha
 */
class HTMLConfirmationBufferDisplayer {
	private readonly _element: HTMLElement;

	constructor(element: HTMLElement) {
		this._element = element;
		this._render();
		timerManager.setInterval(() => this._render(), 1000, TIMER_ID);
	}

	private _render(): void {
		const state = AddressCache.getInstance().getConfirmationBufferState();
		this._element.innerHTML = this._buildHtml(state);
	}

	private _buildHtml(state: ConfirmationBufferState): string {
		return `
<table class="buf-table">
  <caption class="buf-caption">
    Diagnóstico interno. "Último estabilizado" é o valor confirmado pelo buffer após
    <em>N</em> leituras consecutivas idênticas — pode diferir do card visível durante
    a primeira hidratação da sessão.
  </caption>
  <thead>
    <tr>
      <th>Campo</th>
      <th>Último estabilizado</th>
      <th>Candidato atual</th>
      <th class="buf-col-count">Qtd / Limiar</th>
    </tr>
  </thead>
  <tbody>
    ${this._buildRow('Logradouro', state.logradouro)}
    ${this._buildRow('Bairro',     state.bairro)}
    ${this._buildRow('Município',  state.municipio)}
  </tbody>
</table>`;
	}

	private _buildRow(label: string, fieldState?: Partial<FieldBufferState>): string {
		const thresholdText = typeof fieldState?.threshold === 'number'
			? String(fieldState.threshold)
			: '—';
		const confirmedText = fieldState?.isConfirmed
			? (fieldState.confirmed !== null && fieldState.confirmed !== undefined ? fieldState.confirmed : '<em class="buf-muted">nulo</em>')
			: '<em class="buf-muted">—</em>';

		const pendingText = fieldState?.hasPending
			? (fieldState.pending !== null && fieldState.pending !== undefined ? fieldState.pending : '<em class="buf-muted">nulo</em>')
			: '<span class="buf-muted">—</span>';

		const countText = fieldState?.hasPending
			? `<span class="buf-badge buf-badge--warning">${fieldState.pendingCount ?? 0} / ${thresholdText}</span>`
			: `<span class="buf-muted">— / ${thresholdText}</span>`;

		const rowClass = fieldState?.hasPending ? 'buf-row--pending' : '';

		return `
    <tr class="${rowClass}">
      <td class="buf-field-name">${label}</td>
      <td>${confirmedText}</td>
      <td>${pendingText}</td>
      <td class="text-center">${countText}</td>
    </tr>`;
	}

	destroy(): void {
		timerManager.clearTimer(TIMER_ID);
	}
}

export default HTMLConfirmationBufferDisplayer;
