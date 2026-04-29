/**
 * HTMLNearbyPlacesPanel — render Overpass API results in the main SPA.
 *
 * Manages a collapsible panel that shows nearby OSM places found by
 * {@link module:services/OverpassService}.
 *
 * @module html/HTMLNearbyPlacesPanel
 * @since 0.17.2-alpha
 * @author Marcelo Pereira Barbosa
 */

import { log } from '../utils/logger.js';
import { escapeHtml } from '../utils/html-sanitizer.js';
import type { OsmPlace, PlaceCategory } from '../services/OverpassService.js';

const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  restaurant:   'Restaurantes',
  pharmacy:     'Farmácias',
  hospital:     'Hospitais',
  tourist_info: 'Pontos Turísticos',
  cafe:         'Cafés',
  supermarket:  'Supermercados',
};

const CATEGORY_ICONS: Record<PlaceCategory, string> = {
  restaurant:   '🍽️',
  pharmacy:     '💊',
  hospital:     '🏥',
  tourist_info: '🏛️',
  cafe:         '☕',
  supermarket:  '🛒',
};

export class HTMLNearbyPlacesPanel {
  private readonly _panelId: string;
  private readonly _listId: string;

  constructor(panelId = 'nearby-places-panel', listId = 'nearby-places-list') {
    this._panelId = panelId;
    this._listId  = listId;
  }

  /** Show a loading spinner while the Overpass request is in flight. */
  showLoading(category: PlaceCategory = 'restaurant'): void {
    const panel = this._panel();
    if (!panel) return;
    panel.hidden = false;
    panel.setAttribute('aria-busy', 'true');

    const list = this._list();
    if (list) {
      list.innerHTML = `<li class="nearby-loading">
        <span class="nearby-spinner" aria-hidden="true">⏳</span>
        Procurando ${CATEGORY_LABELS[category] ?? category}…
      </li>`;
    }
    log('(HTMLNearbyPlacesPanel) Showing loading state');
  }

  /** Render a list of places returned by OverpassService. */
  render(places: OsmPlace[], category: PlaceCategory = 'restaurant'): void {
    const panel = this._panel();
    if (!panel) return;
    panel.hidden = false;
    panel.removeAttribute('aria-busy');

    const heading = panel.querySelector('.nearby-panel-heading');
    const icon = CATEGORY_ICONS[category] ?? '📍';
    const label = CATEGORY_LABELS[category] ?? category;
    if (heading) heading.textContent = `${icon} ${label} próximos`;

    const list = this._list();
    if (!list) return;

    if (places.length === 0) {
      list.innerHTML = `<li class="nearby-empty">Nenhum resultado encontrado nas proximidades.</li>`;
      return;
    }

    list.innerHTML = places
      .map(p => `
        <li class="nearby-item">
          <span class="nearby-name">${escapeHtml(p.name)}</span>
          <span class="nearby-distance">${p.distance} m</span>
          ${p.tags.cuisine ? `<span class="nearby-meta">${escapeHtml(p.tags.cuisine)}</span>` : ''}
          ${p.tags['addr:street'] ? `<span class="nearby-meta">${escapeHtml(p.tags['addr:street'])}</span>` : ''}
          <a class="nearby-osm-link" href="${escapeHtml(p.osmLink)}" target="_blank" rel="noopener noreferrer" aria-label="Ver ${escapeHtml(p.name)} no OpenStreetMap">
            Ver no OSM
          </a>
        </li>`)
      .join('');

    log(`(HTMLNearbyPlacesPanel) Rendered ${places.length} places`);
  }

  /** Show an error message inside the panel. */
  showError(message: string): void {
    const panel = this._panel();
    if (!panel) return;
    panel.hidden = false;
    panel.removeAttribute('aria-busy');

    const list = this._list();
    if (list) list.innerHTML = `<li class="nearby-error">⚠️ ${escapeHtml(message)}</li>`;
  }

  /** Hide the panel. */
  hide(): void {
    const panel = this._panel();
    if (panel) panel.hidden = true;
  }

  private _panel(): HTMLElement | null {
    return document.getElementById(this._panelId);
  }

  private _list(): HTMLElement | null {
    return document.getElementById(this._listId);
  }
}

export default HTMLNearbyPlacesPanel;
