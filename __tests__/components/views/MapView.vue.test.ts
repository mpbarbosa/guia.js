/**
 * @jest-environment jsdom
 */
import { mount } from '@vue/test-utils';
import MapView from '../../../src/components/views/MapView.vue';

describe('MapView.vue', () => {
  test('renders the map container, placeholders, and recenter control', () => {
    const wrapper = mount(MapView);

    expect(wrapper.get('#maplibre-map').exists()).toBe(true);
    expect(wrapper.text()).toContain('Aguardando...');
    expect(wrapper.text()).toContain('—');
    expect(wrapper.get('button[aria-label="Centrar no mapa"]').exists()).toBe(true);
  });

  test('renders all category chips', () => {
    const wrapper = mount(MapView);
    const chipLabels = wrapper.findAll('button').slice(1).map((chip) => chip.text());

    expect(chipLabels).toEqual(['Restaurantes', 'Postos', 'Hospitais', 'Estacionamento']);
  });
});
