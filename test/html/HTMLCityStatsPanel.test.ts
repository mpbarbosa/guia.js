import { HTMLCityStatsPanel } from '../../src/html/HTMLCityStatsPanel';
import type { CityStats } from '../../src/services/IBGECityStatsService';

// Mock dependencies
jest.mock('../../src/utils/logger.js', () => ({
  log: jest.fn(),
}));
jest.mock('../../src/utils/html-sanitizer.js', () => ({
  escapeHtml: (s: string) => `[escaped:${s}]`,
}));

const { log } = require('../../src/utils/logger.js');
const { escapeHtml } = require('../../src/utils/html-sanitizer.js');

describe('HTMLCityStatsPanel', () => {
  let panelElem: HTMLElement;
  let panel: HTMLCityStatsPanel;

  beforeEach(() => {
    document.body.innerHTML = '';
    panelElem = document.createElement('div');
    panelElem.id = 'city-stats-panel';
    document.body.appendChild(panelElem);
    panel = new HTMLCityStatsPanel();
    jest.clearAllMocks();
  });

  describe('showLoading', () => {
    it('shows loading spinner and sets aria-busy', () => {
      panelElem.hidden = true;
      panelElem.removeAttribute('aria-busy');
      panelElem.innerHTML = '';
      panel.showLoading();
      expect(panelElem.hidden).toBe(false);
      expect(panelElem.getAttribute('aria-busy')).toBe('true');
      expect(panelElem.innerHTML).toContain('Carregando dados do IBGE');
      expect(log).toHaveBeenCalledWith('(HTMLCityStatsPanel) Showing loading state');
    });

    it('does nothing if panel is missing', () => {
      document.body.removeChild(panelElem);
      expect(() => panel.showLoading()).not.toThrow();
      expect(log).not.toHaveBeenCalled();
    });
  });

  describe('render', () => {
    const baseStats: CityStats = {
      name: 'São Paulo',
      uf: 'SP',
      ibgeCode: '3550308',
      population: 12345678,
      populationYear: '2021',
      areaKm2: 1521.11,
    };

    it('renders all stats with valid data', () => {
      panel.render(baseStats);
      expect(panelElem.hidden).toBe(false);
      expect(panelElem.hasAttribute('aria-busy')).toBe(false);
      expect(panelElem.innerHTML).toContain('[escaped:São Paulo], [escaped:SP]');
      expect(panelElem.innerHTML).toContain('👥 População');
      expect(panelElem.innerHTML).toContain('12.345.678');
      expect(panelElem.innerHTML).toContain('(estimativa [escaped:2021])');
      expect(panelElem.innerHTML).toContain('1.521,11 km²');
      expect(panelElem.innerHTML).toContain('3550308');
      expect(panelElem.innerHTML).toContain('https://cidades.ibge.gov.br/brasil/municipio/[escaped:3550308]');
      expect(log).toHaveBeenCalledWith('(HTMLCityStatsPanel) Rendered stats for São Paulo/SP');
    });

    it('renders with null population and area', () => {
      panel.render({
        ...baseStats,
        population: null,
        populationYear: null,
        areaKm2: null,
      });
      expect(panelElem.innerHTML).toContain('–');
      expect(panelElem.innerHTML).not.toContain('estimativa');
    });

    it('escapes all fields', () => {
      const stats: CityStats = {
        name: '<script>bad</script>',
        uf: '<b>SP</b>',
        ibgeCode: '<img>',
        population: 1,
        populationYear: '<2022>',
        areaKm2: 1,
      };
      panel.render(stats);
      expect(panelElem.innerHTML).toContain('[escaped:&lt;script&gt;bad&lt;/script&gt;]');
      expect(panelElem.innerHTML).toContain('[escaped:&lt;b&gt;SP&lt;/b&gt;]');
      expect(panelElem.innerHTML).toContain('[escaped:&lt;img&gt;]');
      expect(panelElem.innerHTML).toContain('[escaped:&lt;2022&gt;]');
    });

    it('does nothing if panel is missing', () => {
      document.body.removeChild(panelElem);
      expect(() => panel.render(baseStats)).not.toThrow();
      expect(log).not.toHaveBeenCalled();
    });
  });

  describe('showError', () => {
    it('shows error message and removes aria-busy', () => {
      panelElem.setAttribute('aria-busy', 'true');
      panelElem.hidden = true;
      panel.showError('Erro ao buscar dados!');
      expect(panelElem.hidden).toBe(false);
      expect(panelElem.hasAttribute('aria-busy')).toBe(false);
      expect(panelElem.innerHTML).toContain('⚠️ [escaped:Erro ao buscar dados!]');
    });

    it('escapes error message', () => {
      panel.showError('<b>Erro!</b>');
      expect(panelElem.innerHTML).toContain('[escaped:&lt;b&gt;Erro!&lt;/b&gt;]');
    });

    it('does nothing if panel is missing', () => {
      document.body.removeChild(panelElem);
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

  describe('custom panelId', () => {
    it('operates on a custom panel id', () => {
      const customElem = document.createElement('div');
      customElem.id = 'custom-panel';
      document.body.appendChild(customElem);
      const customPanel = new HTMLCityStatsPanel('custom-panel');
      customPanel.showLoading();
      expect(customElem.innerHTML).toContain('Carregando dados do IBGE');
    });
  });
});
