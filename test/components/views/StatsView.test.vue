<script lang="ts">
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mount, VueWrapper } from '@vue/test-utils';
import StatsView from '../../../src/components/views/StatsView.vue';

describe('StatsView.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = mount(StatsView);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders the header and description', () => {
    const header = wrapper.get('header');
    expect(header.text()).toContain('Dados da Cidade');
    expect(header.text()).toContain('Estatísticas IBGE e indicadores municipais para crescimento urbano sustentável.');
  });

  it('renders all category filter pills with correct labels', () => {
    const categories = ['Todos', 'População', 'Economia', 'Educação'];
    const pills = wrapper.findAll('div.flex.gap-2 button');
    expect(pills.length).toBe(categories.length);
    pills.forEach((pill, idx) => {
      expect(pill.text()).toBe(categories[idx]);
      expect(pill.classes()).toContain('rounded-full');
    });
  });

  it('activates the correct category pill on click', async () => {
    const pills = wrapper.findAll('div.flex.gap-2 button');
    // Default active is 'Todos'
    expect(pills[0].classes()).toContain('bg-primary');
    expect(pills[0].classes()).toContain('text-white');
    // Click 'Economia'
    await pills[2].trigger('click');
    expect(pills[2].classes()).toContain('bg-primary');
    expect(pills[2].classes()).toContain('text-white');
    // Previous active should now be inactive
    expect(pills[0].classes()).not.toContain('bg-primary');
  });

  it('renders the education stat card with correct content', () => {
    const card = wrapper.findAll('.bg-white').at(0);
    expect(card?.text()).toContain('Educação');
    expect(card?.text()).toContain('Taxa de Escolarização');
    expect(card?.text()).toContain('98,2%');
    expect(card?.text()).toContain('crianças 6–14 anos');
    expect(card?.text()).toContain('Ótimo');
    expect(card?.find('.bi-mortarboard').exists()).toBe(true);
  });

  it('renders the economy stat card with correct content and mini bar chart', () => {
    const card = wrapper.findAll('.bg-white').at(1);
    expect(card?.text()).toContain('Economia');
    expect(card?.text()).toContain('Salário Médio');
    expect(card?.text()).toContain('3,4 SM');
    expect(card?.text()).toContain('Média Mensal');
    expect(card?.text()).toContain('Estável');
    expect(card?.find('.bi-graph-up').exists()).toBe(true);
    // Mini bar chart: 7 bars
    const bars = card?.findAll('div.h-16.mt-4.flex.items-end.gap-1 > div');
    expect(bars && bars.length).toBe(7);
    // Check for at least one active and one inactive bar
    const activeBars = bars?.filter(bar => bar.classes().includes('bg-primary')) ?? [];
    const inactiveBars = bars?.filter(bar => bar.classes().includes('bg-outline-variant')) ?? [];
    expect(activeBars.length).toBeGreaterThan(0);
    expect(inactiveBars.length).toBeGreaterThan(0);
  });

  it('renders the reference document card with correct content and download button', () => {
    const refCard = wrapper.get('.bg-indigo-950');
    expect(refCard.text()).toContain('Documento de Referência');
    expect(refCard.text()).toContain('Análise Técnica Municipal');
    expect(refCard.text()).toContain('Detalhamento completo de indicadores municipais');
    const btn = refCard.get('button');
    expect(btn.text()).toContain('Baixar Relatório PDF');
    expect(btn.find('.bi-download').exists()).toBe(true);
  });

  it('renders with no runtime errors (edge case)', () => {
    expect(() => mount(StatsView)).not.toThrow();
  });

  it('does not render unexpected elements', () => {
    expect(wrapper.find('form').exists()).toBe(false);
    expect(wrapper.find('input').exists()).toBe(false);
    expect(wrapper.find('footer').exists()).toBe(false);
  });
});
</script>
