/**
 * @jest-environment jsdom
 */
import { mount } from '@vue/test-utils';
import EmptyState from '../../src/components/EmptyState.vue';

describe('EmptyState.vue', () => {
  const baseProps = { icon: '📍', title: 'No location', description: 'Click to start' };

  test('renders icon, title, and description', () => {
    const wrapper = mount(EmptyState, { props: baseProps });
    expect(wrapper.text()).toContain('📍');
    expect(wrapper.text()).toContain('No location');
    expect(wrapper.text()).toContain('Click to start');
  });

  test('root element has role=status and aria-live=polite', () => {
    const wrapper = mount(EmptyState, { props: baseProps });
    expect(wrapper.attributes('role')).toBe('status');
    expect(wrapper.attributes('aria-live')).toBe('polite');
  });

  test('icon has class empty-state-icon and aria-hidden', () => {
    const wrapper = mount(EmptyState, { props: baseProps });
    const icon = wrapper.find('.empty-state-icon');
    expect(icon.exists()).toBe(true);
    expect(icon.attributes('aria-hidden')).toBe('true');
  });

  test('title is an h3', () => {
    const wrapper = mount(EmptyState, { props: baseProps });
    expect(wrapper.find('h3.empty-state-title').text()).toBe('No location');
  });

  test('description is a p', () => {
    const wrapper = mount(EmptyState, { props: baseProps });
    expect(wrapper.find('p.empty-state-description').text()).toBe('Click to start');
  });

  test('no action button when action prop is absent', () => {
    const wrapper = mount(EmptyState, { props: baseProps });
    expect(wrapper.find('.empty-state-action').exists()).toBe(false);
  });

  test('renders action button when action prop is provided', () => {
    const wrapper = mount(EmptyState, { props: { ...baseProps, action: 'Tentar novamente' } });
    const btn = wrapper.find('.empty-state-action');
    expect(btn.exists()).toBe(true);
    expect(btn.text()).toBe('Tentar novamente');
  });

  test('emits action event when button is clicked', async () => {
    const wrapper = mount(EmptyState, { props: { ...baseProps, action: 'Click me' } });
    await wrapper.find('.empty-state-action').trigger('click');
    expect(wrapper.emitted('action')).toHaveLength(1);
  });
});
