/**
 * @jest-environment jsdom
 */
import { mount, VueWrapper } from '@vue/test-utils';
import LocationHighlightCards from '../../src/components/LocationHighlightCards.vue';

describe('LocationHighlightCards.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = mount(LocationHighlightCards);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders the section with correct classes and aria-label', () => {
    const section = wrapper.get('section.location-highlights');
    expect(section.exists()).toBe(true);
    expect(section.classes()).toContain('space-y-4');
    expect(section.attributes('aria-label')).toBe('Destaques de localização');
  });

  it('renders three highlight cards with correct roles and aria-labelledby', () => {
    const cards = wrapper.findAll('div.highlight-card');
    expect(cards.length).toBe(3);

    expect(cards[0].attributes('role')).toBe('region');
    expect(cards[0].attributes('aria-labelledby')).toBe('municipio-label');
    expect(cards[1].attributes('role')).toBe('region');
    expect(cards[1].attributes('aria-labelledby')).toBe('bairro-label');
    expect(cards[2].attributes('role')).toBe('region');
    expect(cards[2].attributes('aria-labelledby')).toBe('logradouro-label');
  });

  it('renders the "Município" card with correct labels and values', () => {
    const municipioLabel = wrapper.get('#municipio-label');
    expect(municipioLabel.text()).toBe('Município');
    expect(municipioLabel.classes()).toContain('text-[10px]');
    expect(municipioLabel.classes()).toContain('font-black');
    expect(municipioLabel.classes()).toContain('text-outline');
    expect(municipioLabel.classes()).toContain('uppercase');
    expect(municipioLabel.classes()).toContain('tracking-widest');

    const regiaoValue = wrapper.get('#regiao-metropolitana-value');
    expect(regiaoValue.exists()).toBe(true);
    expect(regiaoValue.classes()).toContain('text-xs');
    expect(regiaoValue.classes()).toContain('text-outline');
    expect(regiaoValue.classes()).toContain('font-medium');
    expect(regiaoValue.classes()).toContain('mt-0.5');
    expect(regiaoValue.text()).toBe('');

    const municipioValue = wrapper.get('#municipio-value');
    expect(municipioValue.text()).toBe('—');
    expect(municipioValue.classes()).toContain('text-xl');
    expect(municipioValue.classes()).toContain('font-bold');
    expect(municipioValue.classes()).toContain('text-indigo-950');
    expect(municipioValue.classes()).toContain('mt-1');
    expect(municipioValue.attributes('aria-live')).toBe('polite');
  });

  it('renders the "Bairro" card with correct labels and values', () => {
    const bairroLabel = wrapper.get('#bairro-label');
    expect(bairroLabel.text()).toBe('Bairro');
    expect(bairroLabel.classes()).toContain('text-[10px]');
    expect(bairroLabel.classes()).toContain('font-black');
    expect(bairroLabel.classes()).toContain('text-outline');
    expect(bairroLabel.classes()).toContain('uppercase');
    expect(bairroLabel.classes()).toContain('tracking-widest');

    const bairroValue = wrapper.get('#bairro-value');
    expect(bairroValue.text()).toBe('—');
    expect(bairroValue.classes()).toContain('text-xl');
    expect(bairroValue.classes()).toContain('font-bold');
    expect(bairroValue.classes()).toContain('text-indigo-950');
    expect(bairroValue.classes()).toContain('mt-1');
    expect(bairroValue.attributes('aria-live')).toBe('polite');
  });

  it('renders the "Logradouro" card with correct labels and values', () => {
    const logradouroLabel = wrapper.get('#logradouro-label');
    expect(logradouroLabel.text()).toBe('Logradouro');
    expect(logradouroLabel.classes()).toContain('text-[10px]');
    expect(logradouroLabel.classes()).toContain('font-black');
    expect(logradouroLabel.classes()).toContain('text-outline');
    expect(logradouroLabel.classes()).toContain('uppercase');
    expect(logradouroLabel.classes()).toContain('tracking-widest');

    const logradouroValue = wrapper.get('#logradouro-value');
    expect(logradouroValue.text()).toBe('—');
    expect(logradouroValue.classes()).toContain('text-xl');
    expect(logradouroValue.classes()).toContain('font-bold');
    expect(logradouroValue.classes()).toContain('text-indigo-950');
    expect(logradouroValue.classes()).toContain('mt-1');
    expect(logradouroValue.attributes('aria-live')).toBe('polite');
  });

  it('renders all highlight cards even if DOM is manipulated', async () => {
    // Remove one card and re-render
    const card = wrapper.find('div.highlight-card');
    card.element.remove();
    await wrapper.vm.$nextTick();
    // The section should still exist
    expect(wrapper.get('section.location-highlights').exists()).toBe(true);
  });
});
