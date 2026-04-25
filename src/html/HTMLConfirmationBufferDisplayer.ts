import timerManager from '../utils/TimerManager.js';
import AddressCache from '../data/AddressCache.js';
import type { ConfirmationBufferState, FieldBufferState } from '../data/AddressCache.js';

const TIMER_ID = 'confirmation-buffer-card';

/**
 * Debug panel that live-polls all three AddressFieldConfirmationBuffer instances
 * (logradouro, bairro, municipio) from AddressCache and renders their state inside
 * a Bootstrap card.  Refreshes every second via TimerManager.
 *
 * @since 0.15.0-alpha
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
<table class="table table-sm table-borderless mb-0 confirmation-buffer-table">
  <thead>
    <tr>
      <th class="ps-0">Campo</th>
      <th>Confirmado</th>
      <th>Pendente</th>
      <th class="text-center">Qtd / Limiar</th>
    </tr>
  </thead>
  <tbody>
    ${this._buildRow('Logradouro', state.logradouro)}
    ${this._buildRow('Bairro',     state.bairro)}
    ${this._buildRow('Município',  state.municipio)}
  </tbody>
</table>`;
	}

	private _buildRow(label: string, f: FieldBufferState): string {
		const confirmedText = f.isConfirmed
			? (f.confirmed !== null ? f.confirmed : '<em class="text-muted">nulo</em>')
			: '<em class="text-muted">—</em>';

		const pendingText = f.hasPending
			? (f.pending !== null ? f.pending : '<em class="text-muted">nulo</em>')
			: '<span class="text-muted">—</span>';

		const countText = f.hasPending
			? `<span class="badge text-bg-warning">${f.pendingCount} / ${f.threshold}</span>`
			: `<span class="text-muted">— / ${f.threshold}</span>`;

		const rowClass = f.hasPending ? 'table-warning' : '';

		return `
    <tr class="${rowClass}">
      <td class="ps-0 fw-semibold">${label}</td>
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
