/**
 * @jest-environment jsdom
 */
import { mount, VueWrapper } from '@vue/test-utils';
import AdvancedControlsPanel from '../../src/components/AdvancedControlsPanel.vue';

describe('AdvancedControlsPanel.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = mount(AdvancedControlsPanel);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('does not render the removed advanced controls disclosure', () => {
    expect(wrapper.find('#advanced-controls').exists()).toBe(false);
  });

  it('renders the navigation log output with correct ARIA attributes', () => {
    const output = wrapper.get('#navigation-log');
    expect(output.exists()).toBe(true);
    expect(output.attributes('role')).toBe('log');
    expect(output.attributes('aria-live')).toBe('polite');
    expect(output.attributes('aria-atomic')).toBe('false');
    expect(output.classes()).toContain('navigation-log');
  });

  it('renders the hidden bottom-scroll textarea for accessibility', () => {
    const hiddenTextarea = wrapper.get('#bottom-scroll-textarea');
    expect(hiddenTextarea.exists()).toBe(true);
    expect(hiddenTextarea.classes()).toContain('hidden');
    expect(hiddenTextarea.attributes('aria-hidden')).toBe('true');
  });

  it('renders all required labels for accessibility', () => {
    const navLogLabel = wrapper.get('label[for="navigation-log"]');
    expect(navLogLabel.exists()).toBe(true);
    expect(navLogLabel.text()).toBe('Histórico de navegação');
  });

  it('renders all main sections even if DOM is manipulated', async () => {
    wrapper.element.querySelector('#navigation-log')?.remove();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('#bottom-scroll-textarea').exists()).toBe(true);
  });
});
