/**
 * @jest-environment jsdom
 */
import { mount } from '@vue/test-utils';
import MapView from '../../../src/components/views/MapView.vue';

describe('MapView.vue', () => {
  test('renders the map placeholders and recenter control', () => {
    const wrapper = mount(MapView);

    expect(wrapper.get('img[alt="Mapa"]').attributes('src')).toContain('unsplash.com/photo-1524661135-423995f22d0b');
    expect(wrapper.get('#map-address-display').text()).toBe('Aguardando...');
    expect(wrapper.get('#map-neighborhood-display').text()).toBe('—');
    expect(wrapper.get('#map-city-display').text()).toBe('—');
    expect(wrapper.get('button[aria-label="Centrar no mapa"]').exists()).toBe(true);
  });

  test('renders all category chips', () => {
    const wrapper = mount(MapView);
    const chipLabels = wrapper.findAll('button').slice(1).map((chip) => chip.text());

    expect(chipLabels).toEqual(['Restaurantes', 'Postos', 'Hospitais', 'Estacionamento']);
  });
});
