/**
 * @jest-environment jsdom
 */
import { mount } from '@vue/test-utils';
import HistoryView from '../../../src/components/views/HistoryView.vue';

describe('HistoryView.vue', () => {
  test('renders the preferences and history sections', () => {
    const wrapper = mount(HistoryView);

    expect(wrapper.text()).toContain('Preferências do App');
    expect(wrapper.text()).toContain('Histórico de Navegação');
    expect(wrapper.text()).toContain('Praça da Sé');
    expect(wrapper.text()).toContain('Parque Ibirapuera');
  });

  test('toggles both preference buttons and updates aria labels', async () => {
    const wrapper = mount(HistoryView);
    const buttons = wrapper.findAll('button');

    expect(buttons[0].attributes('aria-label')).toBe('Desativar síntese de voz');
    expect(buttons[1].attributes('aria-label')).toBe('Ativar rastreamento de tempo');

    await buttons[0].trigger('click');
    await buttons[1].trigger('click');

    expect(buttons[0].attributes('aria-label')).toBe('Ativar síntese de voz');
    expect(buttons[0].classes()).toContain('bg-outline-variant');
    expect(buttons[1].attributes('aria-label')).toBe('Desativar rastreamento de tempo');
    expect(buttons[1].classes()).toContain('bg-primary');
  });
});
