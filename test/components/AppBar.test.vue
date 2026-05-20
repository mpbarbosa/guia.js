<script lang="ts">
import { describe, it, expect } from '@jest/globals';
import { mount, VueWrapper } from '@vue/test-utils';
import AppBar from '../../src/components/AppBar.vue';

describe('AppBar.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = mount(AppBar);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders the header with correct role and classes', () => {
    const header = wrapper.get('header');
    expect(header.attributes('role')).toBe('banner');
    expect(header.classes()).toContain('sticky');
    expect(header.classes()).toContain('top-0');
  });

  it('displays the app title', () => {
    expect(wrapper.text()).toContain('Guia JS');
    const h1 = wrapper.get('h1');
    expect(h1.text()).toBe('Guia JS');
    expect(h1.classes()).toContain('text-primary');
  });

  it('renders the compass icon with correct classes and aria-hidden', () => {
    const icon = wrapper.get('.bi-compass-fill');
    expect(icon.classes()).toContain('text-white');
    expect(icon.attributes('aria-hidden')).toBe('true');
  });

  it('renders the notification button with correct aria-label', () => {
    const button = wrapper.get('button[aria-label="Notificações"]');
    expect(button.exists()).toBe(true);
    const bellIcon = button.get('.bi-bell');
    expect(bellIcon.exists()).toBe(true);
    expect(bellIcon.classes()).toContain('text-on-surface-variant');
  });

  it('renders the user avatar image with correct src and alt', () => {
    const img = wrapper.get('img[alt="Usuário"]');
    expect(img.attributes('src')).toContain('unsplash.com/photo-1472099645785-5658abf4ff4e');
    expect(img.classes()).toContain('object-cover');
  });

  it('avatar container has correct classes and border', () => {
    const avatarDiv = wrapper.get('div.w-9.h-9.rounded-full');
    expect(avatarDiv.classes()).toContain('border-2');
    expect(avatarDiv.classes()).toContain('border-primary-container');
    expect(avatarDiv.classes()).toContain('overflow-hidden');
  });

  it('renders all main layout elements', () => {
    expect(wrapper.find('header').exists()).toBe(true);
    expect(wrapper.find('h1').exists()).toBe(true);
    expect(wrapper.find('button[aria-label="Notificações"]').exists()).toBe(true);
    expect(wrapper.find('img[alt="Usuário"]').exists()).toBe(true);
  });

  it('does not render unexpected elements', () => {
    expect(wrapper.find('nav').exists()).toBe(false);
    expect(wrapper.find('footer').exists()).toBe(false);
    expect(wrapper.find('input').exists()).toBe(false);
  });

  it('renders with no runtime errors (edge case)', () => {
    expect(() => mount(AppBar)).not.toThrow();
  });
});
</script>
