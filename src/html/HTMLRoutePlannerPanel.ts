/**
 * HTMLRoutePlannerPanel — render route planning results in the main SPA.
 *
 * @module html/HTMLRoutePlannerPanel
 * @since 0.18.0-alpha
 */

import { escapeHtml } from '../utils/html-sanitizer.js';
import type { PlannedRoute } from '../services/RouteNavigationService.js';

function formatDistance(distanceMeters: number): string {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
  }
  return `${distanceMeters.toLocaleString('pt-BR')} m`;
}

function formatDuration(durationSeconds: number): string {
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.round((durationSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }

  return `${Math.max(minutes, 1)} min`;
}

export class HTMLRoutePlannerPanel {
  private readonly _panelId: string;

  constructor(panelId = 'route-planner-panel') {
    this._panelId = panelId;
  }

  showLoading(): void {
    const panel = this._panel();
    if (!panel) return;

    panel.hidden = false;
    panel.setAttribute('aria-busy', 'true');
    panel.innerHTML = `
      <p class="route-panel-loading">
        <span aria-hidden="true">⏳</span> Calculando a melhor rota…
      </p>`;
  }

  render(route: PlannedRoute): void {
    const panel = this._panel();
    if (!panel) return;

    const previewSteps = route.steps.slice(0, 5);
    panel.hidden = false;
    panel.removeAttribute('aria-busy');
    panel.innerHTML = `
      <h3 class="route-panel-heading">
        <span aria-hidden="true">🧭</span>
        Rota calculada
      </h3>

      <p class="route-panel-summary">
        <strong>Origem:</strong> ${escapeHtml(route.origin.displayName)}<br />
        <strong>Destino:</strong> ${escapeHtml(route.destination.displayName)}
      </p>

      <dl class="route-panel-stats">
        <div class="route-panel-stat">
          <dt>📏 Distância</dt>
          <dd>${escapeHtml(formatDistance(route.distanceMeters))}</dd>
        </div>
        <div class="route-panel-stat">
          <dt>⏱️ Duração</dt>
          <dd>${escapeHtml(formatDuration(route.durationSeconds))}</dd>
        </div>
        <div class="route-panel-stat">
          <dt>🪜 Etapas</dt>
          <dd>${route.steps.length.toLocaleString('pt-BR')}</dd>
        </div>
      </dl>

      <div class="route-panel-actions">
        <a class="route-panel-link" href="${escapeHtml(route.googleMapsUrl)}" target="_blank" rel="noopener noreferrer">
          Abrir no Google Maps
        </a>
        <a class="route-panel-link" href="${escapeHtml(route.openStreetMapUrl)}" target="_blank" rel="noopener noreferrer">
          Abrir no OpenStreetMap
        </a>
      </div>

      ${previewSteps.length > 0 ? `
        <ol class="route-panel-steps">
          ${previewSteps.map(step => `
            <li class="route-panel-step">
              <span class="route-panel-step-text">${escapeHtml(step.instruction)}</span>
              <span class="route-panel-step-meta">${escapeHtml(formatDistance(step.distanceMeters))}</span>
            </li>`).join('')}
        </ol>` : ''}
    `;
  }

  showError(message: string): void {
    const panel = this._panel();
    if (!panel) return;

    panel.hidden = false;
    panel.removeAttribute('aria-busy');
    panel.innerHTML = `<p class="route-panel-error">⚠️ ${escapeHtml(message)}</p>`;
  }

  hide(): void {
    const panel = this._panel();
    if (panel) panel.hidden = true;
  }

  private _panel(): HTMLElement | null {
    return document.getElementById(this._panelId);
  }
}

export default HTMLRoutePlannerPanel;
