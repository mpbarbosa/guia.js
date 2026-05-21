/**
 * @jest-environment jsdom
 */
import { mount } from '@vue/test-utils';
import AppBar from '../../src/components/AppBar.vue';

describe('AppBar.vue', () => {
  test('renders the banner title and actions', () => {
    const wrapper = mount(AppBar);

    expect(wrapper.get('header').attributes('role')).toBe('banner');
    expect(wrapper.get('span.text-xl').text()).toBe('Guia JS');
    expect(wrapper.get('button[aria-label="Notificações"]').exists()).toBe(true);
  });

  test('renders the compass icon and user avatar', () => {
    const wrapper = mount(AppBar);
    const avatar = wrapper.get('img[alt="Usuário"]');

    expect(wrapper.get('.bi-compass-fill').attributes('aria-hidden')).toBe('true');
    expect(avatar.attributes('src')).toContain('unsplash.com/photo-1472099645785-5658abf4ff4e');
    expect(avatar.classes()).toContain('object-cover');
  });
});
