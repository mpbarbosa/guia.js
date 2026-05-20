<script lang="ts">
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mount, VueWrapper } from '@vue/test-utils';
import HistoryView from '../../../src/components/views/HistoryView.vue';

describe('HistoryView.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = mount(HistoryView);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders the header and description', () => {
    const header = wrapper.get('header');
    expect(header.text()).toContain('Config. & Histórico');
    expect(header.text()).toContain('Gerencie preferências e revise seus trajetos.');
  });

  it('renders app preferences section with correct headings', () => {
    expect(wrapper.text()).toContain('Preferências do App');
    expect(wrapper.text()).toContain('Síntese de Voz');
    expect(wrapper.text()).toContain('Narrar pontos de interesse automaticamente');
    expect(wrapper.text()).toContain('Tempo de Rastreamento');
    expect(wrapper.text()).toContain('Registrar duração de cada visita');
  });

  it('toggles voice synthesis preference on button click', async () => {
    const button = wrapper.findAll('button').at(0);
    expect(button).toBeDefined();
    if (button) {
      // Initially enabled (bg-primary)
      expect(button.classes()).toContain('bg-primary');
      await button.trigger('click');
      // After click, should be disabled (bg-outline-variant)
      expect(button.classes()).toContain('bg-outline-variant');
      expect(button.attributes('aria-label')).toBe('Ativar síntese de voz');
      await button.trigger('click');
      expect(button.classes()).toContain('bg-primary');
      expect(button.attributes('aria-label')).toBe('Desativar síntese de voz');
    }
  });

  it('toggles tracking time preference on button click', async () => {
    const button = wrapper.findAll('button').at(1);
    expect(button).toBeDefined();
    if (button) {
      // Initially disabled (bg-outline-variant)
      expect(button.classes()).toContain('bg-outline-variant');
      await button.trigger('click');
      // After click, should be enabled (bg-primary)
      expect(button.classes()).toContain('bg-primary');
      expect(button.attributes('aria-label')).toBe('Desativar rastreamento de tempo');
      await button.trigger('click');
      expect(button.classes()).toContain('bg-outline-variant');
      expect(button.attributes('aria-label')).toBe('Ativar rastreamento de tempo');
    }
  });

  it('renders navigation history section and items', () => {
    expect(wrapper.text()).toContain('Histórico de Navegação');
    // There are two history items in the source
    const items = wrapper.findAll('section').at(1)?.findAll('div.p-5.bg-white');
    expect(items && items.length).toBe(2);
    if (items) {
      expect(items[0].text()).toContain('Praça da Sé');
      expect(items[0].text()).toContain('Exploração de ponto histórico');
      expect(items[0].text()).toContain('2h atrás');
      expect(items[1].text()).toContain('Parque Ibirapuera');
      expect(items[1].text()).toContain('Caminhada e monumentos');
      expect(items[1].text()).toContain('Ontem');
    }
  });

  it('renders version and system info', () => {
    const info = wrapper.find('.pt-8.text-center');
    expect(info.text()).toContain('Guia JS — Informações do Sistema');
    expect(info.text()).toContain('Versão 0.17.2-alpha');
    expect(info.text()).toContain('Desenvolvido para Excelência Técnica');
  });

  it('renders all icons with correct classes', () => {
    // Voice synthesis icon
    expect(wrapper.find('.bi-volume-up-fill').exists()).toBe(true);
    // Tracking time icon
    expect(wrapper.find('.bi-clock-history').exists()).toBe(true);
    // History item icons
    expect(wrapper.find('.bi-map').exists()).toBe(true);
    expect(wrapper.find('.bi-compass').exists()).toBe(true);
  });

  it('renders completed status for each history item', () => {
    const items = wrapper.findAll('section').at(1)?.findAll('div.p-5.bg-white');
    if (items) {
      items.forEach((item) => {
        expect(item.text()).toContain('Concluído');
        expect(item.find('div.bg-primary.rounded-full').exists()).toBe(true);
      });
    }
  });

  it('renders with no runtime errors (edge case)', () => {
    expect(() => mount(HistoryView)).not.toThrow();
  });

  it('does not render unexpected elements', () => {
    expect(wrapper.find('form').exists()).toBe(false);
    expect(wrapper.find('input').exists()).toBe(false);
    expect(wrapper.find('footer').exists()).toBe(false);
  });
});
</script>
