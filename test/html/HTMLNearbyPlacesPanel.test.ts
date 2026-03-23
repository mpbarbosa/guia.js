import { HTMLNearbyPlacesPanel } from '../../src/html/HTMLNearbyPlacesPanel';
import type { OsmPlace, PlaceCategory } from '../../src/services/OverpassService';

// Mock dependencies
jest.mock('../../src/utils/logger.js', () => ({
  log: jest.fn(),
}));
jest.mock('../../src/utils/html-sanitizer.js', () => ({
  escapeHtml: (s: string) => `[escaped:${s}]`,
}));

const { log } = require('../../src/utils/logger.js');
const { escapeHtml } = require('../../src/utils/html-sanitizer.js');

describe('HTMLNearbyPlacesPanel', () => {
  let panelElem: HTMLElement;
  let listElem: HTMLElement;
  let panel: HTMLNearbyPlacesPanel;

  beforeEach(() => {
    document.body.innerHTML = '';
    panelElem = document.createElement('div');
    panelElem.id = 'nearby-places-panel';
    document.body.appendChild(panelElem);

    listElem = document.createElement('ul');
    listElem.id = 'nearby-places-list';
    panelElem.appendChild(listElem);

    panel = new HTMLNearbyPlacesPanel();
    jest.clearAllMocks();
  });

  describe('showLoading', () => {
    it('shows loading spinner and sets aria-busy for default category', () => {
      panelElem.hidden = true;
      panelElem.removeAttribute('aria-busy');
      listElem.innerHTML = '';
      panel.showLoading();
      expect(panelElem.hidden).toBe(false);
      expect(panelElem.getAttribute('aria-busy')).toBe('true');
      expect(listElem.innerHTML).toContain('Procurando Restaurantes');
      expect(listElem.innerHTML).toContain('⏳');
      expect(log).toHaveBeenCalledWith('(HTMLNearbyPlacesPanel) Showing loading state');
    });

    it('shows loading spinner for a specific category', () => {
      panel.showLoading('pharmacy');
      expect(listElem.innerHTML).toContain('Procurando Farmácias');
    });

    it('shows loading spinner for unknown category', () => {
      // @ts-expect-error: testing unknown category
      panel.showLoading('unknown');
      expect(listElem.innerHTML).toContain('Procurando unknown');
    });

    it('does nothing if panel is missing', () => {
      document.body.removeChild(panelElem);
      expect(() => panel.showLoading()).not.toThrow();
      expect(log).not.toHaveBeenCalled();
    });

    it('does not throw if list is missing', () => {
      panelElem.removeChild(listElem);
      expect(() => panel.showLoading()).not.toThrow();
      expect(log).toHaveBeenCalled();
    });
  });

  describe('render', () => {
    const basePlace: OsmPlace = {
      name: 'Padaria Central',
      distance: 120,
      osmLink: 'https://osm.org/123',
      tags: { cuisine: 'bakery', 'addr:street': 'Rua das Flores' },
    };

    it('renders a list of places with all fields', () => {
      panel.render([basePlace], 'cafe');
      expect(panelElem.hidden).toBe(false);
      expect(panelElem.hasAttribute('aria-busy')).toBe(false);
      expect(listElem.innerHTML).toContain('[escaped:Padaria Central]');
      expect(listElem.innerHTML).toContain('120 m');
      expect(listElem.innerHTML).toContain('[escaped:bakery]');
      expect(listElem.innerHTML).toContain('[escaped:Rua das Flores]');
      expect(listElem.innerHTML).toContain('https://osm.org/123');
      expect(listElem.innerHTML).toContain('Ver no OSM');
      expect(log).toHaveBeenCalledWith('(HTMLNearbyPlacesPanel) Rendered 1 places');
    });

    it('renders with missing optional tags', () => {
      const place: OsmPlace = {
        name: 'Farmácia Boa Saúde',
        distance: 300,
        osmLink: 'https://osm.org/456',
        tags: {},
      };
      panel.render([place], 'pharmacy');
      expect(listElem.innerHTML).toContain('[escaped:Farmácia Boa Saúde]');
      expect(listElem.innerHTML).not.toContain('nearby-meta');
    });

    it('renders empty state when no places', () => {
      panel.render([], 'restaurant');
      expect(listElem.innerHTML).toContain('Nenhum resultado encontrado nas proximidades');
      expect(log).not.toHaveBeenCalledWith(expect.stringContaining('Rendered'));
    });

    it('updates heading with icon and label', () => {
      const heading = document.createElement('h3');
      heading.className = 'nearby-panel-heading';
      panelElem.appendChild(heading);
      panel.render([basePlace], 'supermarket');
      expect(heading.textContent).toContain('🛒 Supermercados próximos');
    });

    it('uses fallback icon/label for unknown category', () => {
      const heading = document.createElement('h3');
      heading.className = 'nearby-panel-heading';
      panelElem.appendChild(heading);
      // @ts-expect-error: testing unknown category
      panel.render([basePlace], 'unknown');
      expect(heading.textContent).toContain('📍 unknown próximos');
    });

    it('escapes all fields', () => {
      const place: OsmPlace = {
        name: '<b>Nome</b>',
        distance: 1,
        osmLink: '<a>',
        tags: { cuisine: '<cuisine>', 'addr:street': '<street>' },
      };
      panel.render([place], 'cafe');
      expect(listElem.innerHTML).toContain('[escaped:&lt;b&gt;Nome&lt;/b&gt;]');
      expect(listElem.innerHTML).toContain('[escaped:&lt;a&gt;]');
      expect(listElem.innerHTML).toContain('[escaped:&lt;cuisine&gt;]');
      expect(listElem.innerHTML).toContain('[escaped:&lt;street&gt;]');
    });

    it('does nothing if panel is missing', () => {
      document.body.removeChild(panelElem);
      expect(() => panel.render([basePlace], 'cafe')).not.toThrow();
      expect(log).not.toHaveBeenCalled();
    });

    it('does nothing if list is missing', () => {
      panelElem.removeChild(listElem);
      expect(() => panel.render([basePlace], 'cafe')).not.toThrow();
      expect(log).not.toHaveBeenCalledWith(expect.stringContaining('Rendered'));
    });
  });

  describe('showError', () => {
    it('shows error message and removes aria-busy', () => {
      panelElem.setAttribute('aria-busy', 'true');
      panelElem.hidden = true;
      listElem.innerHTML = '';
      panel.showError('Falha ao buscar!');
      expect(panelElem.hidden).toBe(false);
      expect(panelElem.hasAttribute('aria-busy')).toBe(false);
      expect(listElem.innerHTML).toContain('⚠️ [escaped:Falha ao buscar!]');
    });

    it('escapes error message', () => {
      panel.showError('<b>Erro!</b>');
      expect(listElem.innerHTML).toContain('[escaped:&lt;b&gt;Erro!&lt;/b&gt;]');
    });

    it('does nothing if panel is missing', () => {
      document.body.removeChild(panelElem);
      expect(() => panel.showError('fail')).not.toThrow();
    });

    it('does not throw if list is missing', () => {
      panelElem.removeChild(listElem);
      expect(() => panel.showError('fail')).not.toThrow();
    });
  });

  describe('hide', () => {
    it('hides the panel', () => {
      panelElem.hidden = false;
      panel.hide();
      expect(panelElem.hidden).toBe(true);
    });

    it('does nothing if panel is missing', () => {
      document.body.removeChild(panelElem);
      expect(() => panel.hide()).not.toThrow();
    });
  });

  describe('custom panelId and listId', () => {
    it('operates on custom panel and list ids', () => {
      const customPanel = document.createElement('div');
      customPanel.id = 'custom-panel';
      document.body.appendChild(customPanel);

      const customList = document.createElement('ul');
      customList.id = 'custom-list';
      customPanel.appendChild(customList);

      const custom = new HTMLNearbyPlacesPanel('custom-panel', 'custom-list');
      custom.showLoading('cafe');
      expect(customList.innerHTML).toContain('Procurando Cafés');
    });
  });
});
