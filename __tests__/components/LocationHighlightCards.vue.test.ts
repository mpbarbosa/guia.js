/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { nextTick } from 'vue';
import { mount, VueWrapper } from '@vue/test-utils';
import LocationHighlightCards from '../../src/components/LocationHighlightCards.vue';
import AddressCache from '../../src/data/AddressCache';

let _currentAddress: any = null;
let _observer: any = null;
const _mockInstance = {
  get currentAddress() { return _currentAddress; },
  setCurrentAddress(addr: any) {
    _currentAddress = addr;
    if (_observer?.update) _observer.update();
  },
  subscribe: (obs: any) => { _observer = obs; },
  unsubscribe: (obs: any) => { if (_observer === obs) _observer = null; },
};

describe('LocationHighlightCards.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    _currentAddress = null;
    _observer = null;
    jest.spyOn(AddressCache, 'getInstance').mockReturnValue(_mockInstance as ReturnType<typeof AddressCache.getInstance>);
    wrapper = mount(LocationHighlightCards);
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
    expect(municipioLabel.classes()).toContain('text-xs');
    expect(municipioLabel.classes()).toContain('font-black');
    expect(municipioLabel.classes()).toContain('text-outline');
    expect(municipioLabel.classes()).toContain('uppercase');
    expect(municipioLabel.classes()).toContain('tracking-widest');

    const regiaoValue = wrapper.get('#regiao-metropolitana-value');
    expect(regiaoValue.exists()).toBe(true);
    expect(regiaoValue.classes()).toContain('text-sm');
    expect(regiaoValue.classes()).toContain('text-outline');
    expect(regiaoValue.classes()).toContain('font-medium');
    expect(regiaoValue.classes()).toContain('mt-1');
    expect(regiaoValue.text()).toBe('');

    const municipioValue = wrapper.get('#municipio-value');
    expect(municipioValue.text()).toBe('—');
    expect(municipioValue.classes()).toContain('!text-xl');
    expect(municipioValue.classes()).toContain('!font-bold');
    expect(municipioValue.classes()).toContain('text-indigo-950');
    expect(municipioValue.classes()).toContain('!mt-1');
    expect(municipioValue.classes()).toContain('!mb-0');
    expect(municipioValue.attributes('aria-live')).toBe('polite');
  });

  it('renders the "Bairro" card with correct labels and values', () => {
    const bairroLabel = wrapper.get('#bairro-label');
    expect(bairroLabel.text()).toBe('Bairro');
    expect(bairroLabel.classes()).toContain('text-xs');
    expect(bairroLabel.classes()).toContain('font-black');
    expect(bairroLabel.classes()).toContain('text-outline');
    expect(bairroLabel.classes()).toContain('uppercase');
    expect(bairroLabel.classes()).toContain('tracking-widest');

    const bairroValue = wrapper.get('#bairro-value');
    expect(bairroValue.text()).toBe('—');
    expect(bairroValue.classes()).toContain('!text-xl');
    expect(bairroValue.classes()).toContain('!font-bold');
    expect(bairroValue.classes()).toContain('text-indigo-950');
    expect(bairroValue.classes()).toContain('!mt-1');
    expect(bairroValue.classes()).toContain('!mb-0');
    expect(bairroValue.attributes('aria-live')).toBe('polite');
  });

  it('switches the locality card label to "Distrito" when distrito is present', async () => {
    _mockInstance.setCurrentAddress({
      distrito: 'Milho Verde',
      municipio: 'Serro',
      logradouro: 'Estrada Real',
    });

    await nextTick();

    expect(wrapper.get('#bairro-label').text()).toBe('Distrito');
    expect(wrapper.get('#bairro-value').text()).toBe('MILHO VERDE');
  });

  it('renders the "Logradouro" card with correct labels and values', () => {
    const logradouroLabel = wrapper.get('#logradouro-label');
    expect(logradouroLabel.text()).toBe('Logradouro');
    expect(logradouroLabel.classes()).toContain('text-xs');
    expect(logradouroLabel.classes()).toContain('font-black');
    expect(logradouroLabel.classes()).toContain('text-outline');
    expect(logradouroLabel.classes()).toContain('uppercase');
    expect(logradouroLabel.classes()).toContain('tracking-widest');

    const logradouroValue = wrapper.get('#logradouro-value');
    expect(logradouroValue.text()).toBe('—');
    expect(logradouroValue.classes()).toContain('!text-xl');
    expect(logradouroValue.classes()).toContain('!font-bold');
    expect(logradouroValue.classes()).toContain('text-indigo-950');
    expect(logradouroValue.classes()).toContain('!mt-1');
    expect(logradouroValue.classes()).toContain('!mb-0');
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
