/**
 * HTMLCityStatsPanel — render IBGE city statistics in the main SPA.
 *
 * Manages a collapsible panel that shows municipality data fetched by
 * {@link module:services/IBGECityStatsService}.
 *
 * @module html/HTMLCityStatsPanel
 * @since 0.15.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import { log } from '../utils/logger.js';
import { escapeHtml } from '../utils/html-sanitizer.js';
import type { CityStats } from '../services/IBGECityStatsService.js';

export class HTMLCityStatsPanel {
  private readonly _panelId: string;

  constructor(panelId = 'city-stats-panel') {
    this._panelId = panelId;
  }

  /** Show a loading spinner while IBGE data is being fetched. */
  showLoading(): void {
    const panel = this._panel();
    if (!panel) return;
    panel.hidden = false;
    panel.setAttribute('aria-busy', 'true');
    panel.innerHTML = `<p class="stats-loading">
      <span aria-hidden="true">⏳</span> Carregando dados do IBGE…
    </p>`;
    log('(HTMLCityStatsPanel) Showing loading state');
  }

  /** Render city statistics returned by IBGECityStatsService. */
  render(stats: CityStats): void {
    const panel = this._panel();
    if (!panel) return;
    panel.hidden = false;
    panel.removeAttribute('aria-busy');

    const population = stats.population !== null
      ? stats.population.toLocaleString('pt-BR')
      : '–';
    const populationLabel = stats.populationYear
      ? `${population} <span class="stats-year">(estimativa ${escapeHtml(stats.populationYear)})</span>`
      : population;

    const area = stats.areaKm2 !== null
      ? stats.areaKm2.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' km²'
      : '–';

    panel.innerHTML = `
      <h3 class="stats-heading">
        <span aria-hidden="true">🏛️</span>
        ${escapeHtml(stats.name)}, ${escapeHtml(stats.uf)}
      </h3>
      <dl class="stats-grid">
        <div class="stats-item">
          <dt>👥 População</dt>
          <dd>${populationLabel}</dd>
        </div>
        <div class="stats-item">
          <dt>📐 Área</dt>
          <dd>${area}</dd>
        </div>
        <div class="stats-item">
          <dt>🔢 Código IBGE</dt>
          <dd>
            <a href="https://cidades.ibge.gov.br/brasil/municipio/${escapeHtml(stats.ibgeCode)}"
               target="_blank" rel="noopener noreferrer"
               aria-label="Ver ${escapeHtml(stats.name)} no IBGE Cidades">
              ${escapeHtml(stats.ibgeCode)}
            </a>
          </dd>
        </div>
      </dl>`;

    log(`(HTMLCityStatsPanel) Rendered stats for ${stats.name}/${stats.uf}`);
  }

  /** Show an error message inside the panel. */
  showError(message: string): void {
    const panel = this._panel();
    if (!panel) return;
    panel.hidden = false;
    panel.removeAttribute('aria-busy');
    panel.innerHTML = `<p class="stats-error">⚠️ ${escapeHtml(message)}</p>`;
  }

  /** Hide the panel. */
  hide(): void {
    const panel = this._panel();
    if (panel) panel.hidden = true;
  }

  private _panel(): HTMLElement | null {
    return document.getElementById(this._panelId);
  }
}

export default HTMLCityStatsPanel;
