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

  it('renders the hidden bottom-scroll textarea for accessibility', () => {
    const hiddenTextarea = wrapper.get('#bottom-scroll-textarea');
    expect(hiddenTextarea.exists()).toBe(true);
    expect(hiddenTextarea.classes()).toContain('hidden');
    expect(hiddenTextarea.attributes('aria-hidden')).toBe('true');
  });

});
