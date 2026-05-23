/**
 * @jest-environment jsdom
 */
import { mount, VueWrapper } from '@vue/test-utils';
import SecondaryInfoPanel from '../../src/components/SecondaryInfoPanel.vue';

describe('SecondaryInfoPanel.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = mount(SecondaryInfoPanel);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders the details panel open by default with correct classes', () => {
    const details = wrapper.get('details#secondary-info');
    expect(details.exists()).toBe(true);
    expect(details.classes()).toContain('secondary-info-collapse');
    expect(details.element.hasAttribute('open')).toBe(false);
  });

  it('renders the summary with correct text and icons', () => {
    const summary = wrapper.get('.secondary-info-summary');
    expect(summary.exists()).toBe(true);
    expect(summary.find('.summary-icon').text()).toBe('ℹ️');
    expect(summary.find('.summary-text').text()).toBe('Informações Adicionais');
    expect(summary.find('.summary-arrow').text()).toBe('▼');
  });

  it('renders standardized address section with correct heading and default value', () => {
    const section = wrapper.get('#standardized-address');
    expect(section.exists()).toBe(true);
    const heading = section.get('#address-heading');
    expect(heading.text()).toBe('Endereço Padronizado');
    expect(heading.classes()).toContain('sr-only');
    const display = section.get('#endereco-padronizado-display');
    expect(display.text()).toBe('Aguardando localização...');
  });

  it('renders coordinates section with correct heading and default values', () => {
    const section = wrapper.get('#coordinates');
    expect(section.exists()).toBe(true);
    const heading = section.get('#coordinates-heading');
    expect(heading.text()).toBe('Coordenadas');
    expect(heading.classes()).toContain('sr-only');
    const display = section.get('#lat-long-display');
    expect(display.text()).toBe('Aguardando localização...');
    const altitudeContainer = section.get('#altitude-container');
    expect(altitudeContainer.classes()).toContain('hidden');
    const altitudeDisplay = section.get('#altitude-display');
    expect(altitudeDisplay.text()).toBe('');
  });

  it('renders reference place section with correct heading and default value', () => {
    const section = wrapper.get('#reference-place');
    expect(section.exists()).toBe(true);
    const heading = section.get('#reference-place-heading');
    expect(heading.text()).toBe('Local de Referência');
    expect(heading.classes()).toContain('sr-only');
    const display = section.get('#reference-place-display');
    expect(display.text()).toBe('Aguardando localização...');
  });

  it('renders IBGE data section with correct heading and default value', () => {
    const section = wrapper.get('section.section');
    expect(section.exists()).toBe(true);
    const heading = section.get('#location-info-heading');
    expect(heading.text()).toBe('Dados IBGE');
    expect(heading.classes()).toContain('sr-only');
    const display = section.get('#dadosSidra');
    expect(display.text()).toBe('Aguardando localização...');
  });

  it('renders empty location result section with correct aria-label', () => {
    const locationResult = wrapper.get('#locationResult');
    expect(locationResult.exists()).toBe(true);
    expect(locationResult.attributes('aria-label')).toBe('Resultado da localização');
  });

  it('renders map section with button and hidden map container', () => {
    const mapSection = wrapper.get('#map-section');
    expect(mapSection.exists()).toBe(true);
    const mapBtn = mapSection.get('#map-toggle-btn');
    expect(mapBtn.exists()).toBe(true);
    expect(mapBtn.classes()).toContain('md3-button-outlined');
    expect(mapBtn.attributes('aria-label')).toBe('Mostrar mapa da localização atual');
    expect(mapBtn.attributes('aria-expanded')).toBe('false');
    expect(mapBtn.find('.button-icon').text()).toBe('🗺️');
    expect(mapBtn.find('.button-text').text()).toBe('Ver no Mapa');
    const mapDiv = mapSection.get('#maplibre-map');
    expect(mapDiv.exists()).toBe(true);
    expect(mapDiv.classes()).toContain('maplibre-map-container');
    expect(mapDiv.attributes('aria-label')).toBe('Mapa da localização atual');
    expect(mapDiv.attributes('role')).toBe('img');
    expect(mapDiv.attributes('hidden')).toBeDefined();
  });

  it('renders nearby places section with disabled button and hidden panel', () => {
    const nearbySection = wrapper.get('#nearby-places-section');
    expect(nearbySection.exists()).toBe(true);
    const btn = nearbySection.get('#findRestaurantsBtn');
    expect(btn.exists()).toBe(true);
    expect(btn.classes()).toContain('md3-button-outlined');
    expect(btn.attributes('disabled')).toBeDefined();
    expect(btn.attributes('aria-label')).toBe('Buscar restaurantes próximos à localização atual');
    expect(btn.find('.button-icon').text()).toBe('🍽️');
    expect(btn.find('.button-text').text()).toBe('Lugares Próximos');
    const panel = nearbySection.get('#nearby-places-panel');
    expect(panel.exists()).toBe(true);
    expect(panel.classes()).toContain('nearby-places-panel');
    expect(panel.attributes('aria-label')).toBe('Lugares próximos');
    expect(panel.attributes('hidden')).toBeDefined();
    expect(panel.find('.nearby-panel-heading').exists()).toBe(true);
    expect(panel.find('#nearby-places-list').exists()).toBe(true);
  });

  it('renders city stats section with disabled button and hidden panel', () => {
    const cityStatsSection = wrapper.get('#city-stats-section');
    expect(cityStatsSection.exists()).toBe(true);
    const btn = cityStatsSection.get('#cityStatsBtn');
    expect(btn.exists()).toBe(true);
    expect(btn.classes()).toContain('md3-button-outlined');
    expect(btn.attributes('disabled')).toBeDefined();
    expect(btn.attributes('aria-label')).toBe('Ver estatísticas da cidade atual');
    expect(btn.find('.button-icon').text()).toBe('📊');
    expect(btn.find('.button-text').text()).toBe('Estatísticas da Cidade');
    const panel = cityStatsSection.get('#city-stats-panel');
    expect(panel.exists()).toBe(true);
    expect(panel.classes()).toContain('city-stats-panel');
    expect(panel.attributes('aria-label')).toBe('Estatísticas do município');
    expect(panel.attributes('hidden')).toBeDefined();
  });

  it('renders route planner section with form and disabled submit button', () => {
    const routeSection = wrapper.get('#route-planner-section');
    expect(routeSection.exists()).toBe(true);
    const card = routeSection.get('.route-planner-card');
    expect(card.exists()).toBe(true);
    expect(card.find('h2').text()).toContain('🧭 Planejar rota');
    expect(card.find('.route-planner-helper').text()).toContain('origem em branco');
    const form = card.get('#route-planner-form');
    expect(form.exists()).toBe(true);

    const originField = form.get('#route-origin-input');
    expect(originField.exists()).toBe(true);
    expect(originField.attributes('placeholder')).toBe('Ex.: Rua da Aurora, Recife - PE');
    expect(form.get('#route-origin-current').text()).toContain('Origem atual: aguardando localização...');

    const destField = form.get('#route-destination-input');
    expect(destField.exists()).toBe(true);
    expect(destField.attributes('placeholder')).toBe('Ex.: Marco Zero, Recife - PE');
    expect(destField.attributes('required')).toBeDefined();

    const submitBtn = form.get('#planRouteBtn');
    expect(submitBtn.exists()).toBe(true);
    expect(submitBtn.classes()).toContain('md3-button-outlined');
    expect(submitBtn.attributes('type')).toBe('submit');
    expect(submitBtn.attributes('disabled')).toBeDefined();
    expect(submitBtn.attributes('aria-label')).toBe('Calcular rota até o destino informado');
    expect(submitBtn.find('.button-icon').text()).toBe('🧭');
    expect(submitBtn.find('.button-text').text()).toBe('Calcular rota');

    const plannerPanel = card.get('#route-planner-panel');
    expect(plannerPanel.exists()).toBe(true);
    expect(plannerPanel.classes()).toContain('route-planner-panel');
    expect(plannerPanel.attributes('aria-live')).toBe('polite');
    expect(plannerPanel.attributes('hidden')).toBeDefined();
  });

  it('expands and collapses the details panel when clicked', async () => {
    const details = wrapper.get('details#secondary-info');
    expect(details.element.hasAttribute('open')).toBe(false);

    // Simulate click to open
    details.element.setAttribute('open', '');
    await wrapper.vm.$nextTick();
    expect(details.element.hasAttribute('open')).toBe(true);

    // Simulate click to close
    details.element.removeAttribute('open');
    await wrapper.vm.$nextTick();
    expect(details.element.hasAttribute('open')).toBe(false);

    // Simulate click to open
    details.element.setAttribute('open', '');
    await wrapper.vm.$nextTick();
    expect(details.element.hasAttribute('open')).toBe(true);
  });

  it('does not throw if DOM is manipulated (robustness check)', async () => {
    // Remove a section and re-render
    const section = wrapper.find('#standardized-address');
    section.element.remove();
    await wrapper.vm.$nextTick();
    expect(wrapper.get('details#secondary-info').exists()).toBe(true);
  });
});
