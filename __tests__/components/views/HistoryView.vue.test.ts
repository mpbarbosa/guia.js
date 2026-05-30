/**
 * @jest-environment jsdom
 */
import { mount } from '@vue/test-utils';
import HistoryView from '../../../src/components/views/HistoryView.vue';
import { VERSION } from '../../../src/config/version.js';

describe('HistoryView.vue', () => {
  test('renders the preferences and empty history sections', () => {
    const wrapper = mount(HistoryView);

    expect(wrapper.text()).toContain('Preferências do App');
    expect(wrapper.text()).toContain('Histórico de Navegação');
    expect(wrapper.text()).toContain('Nenhum local visitado nesta sessão ainda');
  });

  test('renders both preference toggle buttons with correct initial state', () => {
    const wrapper = mount(HistoryView);
    const buttons = wrapper.findAll('button');

    expect(buttons[0].attributes('aria-label')).toBe('Desativar síntese de voz');
    expect(buttons[1].attributes('aria-label')).toBe('Ativar rastreamento de tempo');
  });

  test('toggles both preference buttons and updates aria labels', async () => {
    const wrapper = mount(HistoryView);
    const buttons = wrapper.findAll('button');

    await buttons[0].trigger('click');
    await buttons[1].trigger('click');

    expect(buttons[0].attributes('aria-label')).toBe('Ativar síntese de voz');
    expect(buttons[0].classes()).toContain('bg-outline-variant');
    expect(buttons[1].attributes('aria-label')).toBe('Desativar rastreamento de tempo');
    expect(buttons[1].classes()).toContain('bg-primary');
  });

  test('renders the current application version from config', () => {
    const wrapper = mount(HistoryView);

    expect(wrapper.text()).toContain(`Versão ${VERSION}`);
  });
});
