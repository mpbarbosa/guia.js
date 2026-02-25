/**
 * @jest-environment jsdom
 */
import { mount } from '@vue/test-utils';
import Onboarding from '../../src/components/Onboarding.vue';

describe('Onboarding.vue', () => {
  test('renders when visible=true (default)', () => {
    const wrapper = mount(Onboarding);
    expect(wrapper.find('.onboarding-card').exists()).toBe(true);
  });

  test('is hidden when visible=false', () => {
    const wrapper = mount(Onboarding, { props: { visible: false } });
    expect(wrapper.find('.onboarding-card').exists()).toBe(false);
  });

  test('shows default title in normal state', () => {
    const wrapper = mount(Onboarding);
    expect(wrapper.find('.onboarding-title').text()).toBe('Bem-vindo ao Guia Turístico');
  });

  test('shows errorTitle in error state', () => {
    const wrapper = mount(Onboarding, {
      props: { hasError: true, errorTitle: 'Permissão Negada' },
    });
    expect(wrapper.find('.onboarding-title').text()).toBe('Permissão Negada');
  });

  test('shows description paragraph in normal state', () => {
    const wrapper = mount(Onboarding);
    expect(wrapper.find('p.onboarding-description').exists()).toBe(true);
  });

  test('shows errorHtml div in error state', () => {
    const wrapper = mount(Onboarding, {
      props: { hasError: true, errorHtml: '<p>Error details</p>' },
    });
    expect(wrapper.find('div.onboarding-description').exists()).toBe(true);
    expect(wrapper.find('div.onboarding-description').html()).toContain('Error details');
  });

  test('button text is "Ativar Localização" in normal state', () => {
    const wrapper = mount(Onboarding);
    expect(wrapper.find('.button-text').text()).toContain('Ativar Localização');
  });

  test('button text is "Tentar Novamente" in error state', () => {
    const wrapper = mount(Onboarding, { props: { hasError: true } });
    expect(wrapper.find('.button-text').text()).toContain('Tentar Novamente');
  });

  test('emits enable-location when button clicked', async () => {
    const wrapper = mount(Onboarding);
    await wrapper.find('.onboarding-cta').trigger('click');
    expect(wrapper.emitted('enable-location')).toHaveLength(1);
  });

  test('has role=region and aria-labelledby on the card', () => {
    const wrapper = mount(Onboarding);
    const card = wrapper.find('.onboarding-card');
    expect(card.attributes('role')).toBe('region');
    expect(card.attributes('aria-labelledby')).toBe('onboarding-title');
  });
});
