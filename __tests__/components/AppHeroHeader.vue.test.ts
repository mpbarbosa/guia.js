/**
 * @jest-environment jsdom
 */
import { mount, VueWrapper } from '@vue/test-utils';
import AppHeroHeader from '../../src/components/AppHeroHeader.vue';

describe('AppHeroHeader.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = mount(AppHeroHeader);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders the main container with correct classes', () => {
    const container = wrapper.get('div.bg-gradient-to-br');
    expect(container.exists()).toBe(true);
    expect(container.classes()).toContain('rounded-3xl');
    expect(container.classes()).toContain('p-6');
    expect(container.classes()).toContain('text-white');
    expect(container.classes()).toContain('shadow-xl');
    expect(container.classes()).toContain('shrink-0');
  });

  it('renders the main heading with correct text', () => {
    const h1 = wrapper.get('h1');
    expect(h1.exists()).toBe(true);
    expect(h1.text()).toBe('Onde estou?');
    expect(h1.classes()).toContain('text-xs');
    expect(h1.classes()).toContain('font-bold');
    expect(h1.classes()).toContain('uppercase');
    expect(h1.classes()).toContain('tracking-[0.2em]');
    expect(h1.classes()).toContain('opacity-80');
  });

  it('renders the navigation icon with correct classes and aria-hidden', () => {
    const icon = wrapper.get('i.bi-navigation-fill');
    expect(icon.exists()).toBe(true);
    expect(icon.classes()).toContain('bi');
    expect(icon.classes()).toContain('bi-navigation-fill');
    expect(icon.classes()).toContain('text-3xl');
    expect(icon.classes()).toContain('shrink-0');
    expect(icon.attributes('aria-hidden')).toBe('true');
  });

  it('renders the location text h2 with correct attributes and content', () => {
    const h2 = wrapper.get('#header-location-text');
    expect(h2.exists()).toBe(true);
    expect(h2.text()).toBe('— · —');
    expect(h2.classes()).toContain('text-xl');
    expect(h2.classes()).toContain('font-bold');
    expect(h2.classes()).toContain('leading-tight');
    expect(h2.attributes('aria-live')).toBe('polite');
    expect(h2.attributes('data-pending')).toBe('true');
  });

  it('renders the flex container for icon and location text', () => {
    const flexDiv = wrapper.get('div.flex.items-center.gap-3.mt-4');
    expect(flexDiv.exists()).toBe(true);
    expect(flexDiv.find('i.bi-navigation-fill').exists()).toBe(true);
    expect(flexDiv.find('#header-location-text').exists()).toBe(true);
  });

  it('does not throw if DOM is manipulated (robustness check)', async () => {
    // Remove the h2 and re-render
    const h2 = wrapper.get('#header-location-text');
    h2.element.remove();
    await wrapper.vm.$nextTick();
    // The main container should still exist
    expect(wrapper.get('div.bg-gradient-to-br').exists()).toBe(true);
  });
});
