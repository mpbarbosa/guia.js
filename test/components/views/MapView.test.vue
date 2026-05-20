<script lang="ts">
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mount, VueWrapper } from '@vue/test-utils';
import MapView from '../../../src/components/views/MapView.vue';

describe('MapView.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = mount(MapView);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders the map background image with correct src and alt', () => {
    const img = wrapper.get('img[alt="Mapa"]');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toContain('unsplash.com/photo-1524661135-423995f22d0b');
    expect(img.classes()).toContain('object-cover');
    expect(img.classes()).toContain('opacity-80');
  });

  it('renders the location card with default address and city placeholders', () => {
    const address = wrapper.get('#map-address-display');
    expect(address.text()).toBe('Aguardando...');
    const neighborhood = wrapper.get('#map-neighborhood-display');
    expect(neighborhood.text()).toBe('—');
    const city = wrapper.get('#map-city-display');
    expect(city.text()).toBe('—');
  });

  it('renders the navigation icon in the location card', () => {
    const navIcon = wrapper.find('.bi-navigation-fill');
    expect(navIcon.exists()).toBe(true);
    expect(navIcon.classes()).toContain('text-2xl');
  });

  it('renders the recenter button with correct aria-label and icon', () => {
    const button = wrapper.get('button[aria-label="Centrar no mapa"]');
    expect(button.exists()).toBe(true);
    const icon = button.get('.bi-crosshair');
    expect(icon.exists()).toBe(true);
    expect(icon.classes()).toContain('text-primary');
  });

  it('renders all category chips with correct labels', () => {
    const chipLabels = ['Restaurantes', 'Postos', 'Hospitais', 'Estacionamento'];
    const chips = wrapper.findAll('div.flex.gap-2 button');
    expect(chips.length).toBe(4);
    chips.forEach((chip, idx) => {
      expect(chip.text()).toBe(chipLabels[idx]);
      expect(chip.classes()).toContain('rounded-full');
      expect(chip.classes()).toContain('uppercase');
    });
  });

  it('renders the gradient overlay above the map image', () => {
    const gradient = wrapper.find('div.bg-gradient-to-t');
    expect(gradient.exists()).toBe(true);
    expect(gradient.classes()).toContain('from-surface');
    expect(gradient.classes()).toContain('to-transparent');
  });

  it('renders with no runtime errors (edge case)', () => {
    expect(() => mount(MapView)).not.toThrow();
  });

  it('does not render unexpected elements', () => {
    expect(wrapper.find('form').exists()).toBe(false);
    expect(wrapper.find('input').exists()).toBe(false);
    expect(wrapper.find('footer').exists()).toBe(false);
  });

  it('location card and recenter button are pointer-events enabled', () => {
    const card = wrapper.find('.pointer-events-auto');
    expect(card.exists()).toBe(true);
    const recenterBtn = wrapper.find('button[aria-label="Centrar no mapa"]');
    expect(recenterBtn.exists()).toBe(true);
  });
});
</script>
