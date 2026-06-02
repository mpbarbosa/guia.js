/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';

const useIBGECityStatsMock = jest.fn();

await jest.unstable_mockModule('../../../src/composables/useIBGECityStats.js', () => ({
  useIBGECityStats: useIBGECityStatsMock,
}));

const { mount } = await import('@vue/test-utils');
const { ref } = await import('vue');
const { default: StatsView } = await import('../../../src/components/views/StatsView.vue');

describe('StatsView.vue', () => {
  beforeEach(() => {
    useIBGECityStatsMock.mockReturnValue({
      stats: ref(null),
      loading: ref(false),
      error: ref(null),
    });
  });

  test('renders the headline, category pills, and stat cards', () => {
    const wrapper = mount(StatsView);
    const categoryLabels = wrapper.findAll('button').map((button) => button.text());

    expect(wrapper.get('header').text()).toContain('Dados da Cidade');
    expect(categoryLabels).toEqual(['Todos', 'População', 'Território']);
    expect(wrapper.text()).toContain('Estimativa Populacional');
    expect(wrapper.text()).toContain('Área e Densidade');
    expect(wrapper.text()).toContain('IBGE — Cidades');
  });

  test('updates the active category pill when clicked', async () => {
    const wrapper = mount(StatsView);
    const pills = wrapper.findAll('button');

    expect(pills[0].classes()).toContain('bg-primary');

    await pills[2].trigger('click');

    expect(pills[2].classes()).toContain('bg-primary');
    expect(pills[2].classes()).toContain('text-white');
    expect(pills[0].classes()).not.toContain('bg-primary');
  });

  test('renders fresh SIDRA population and density when available', () => {
    useIBGECityStatsMock.mockReturnValue({
      stats: ref({
        name: 'Recife',
        uf: 'PE',
        ibgeCode: '2611606',
        areaKm2: 218.84,
        population: 1488920,
        populationYear: '2024',
        populationSource: 'sidra-fresh',
      }),
      loading: ref(false),
      error: ref(null),
    });

    const wrapper = mount(StatsView);

    expect(wrapper.text()).toContain('1.488.920');
    expect(wrapper.text()).toContain('habitantes');
    expect(wrapper.text()).toContain('Densidade:');
    expect(wrapper.text()).toContain('6.803,7');
    expect(wrapper.text()).toContain('2024');
  });

  test('shows population and density as unavailable without fresh SIDRA population', () => {
    useIBGECityStatsMock.mockReturnValue({
      stats: ref({
        name: 'Recife',
        uf: 'PE',
        ibgeCode: '2611606',
        areaKm2: 218.84,
        population: null,
        populationYear: null,
        populationSource: 'offline-cache',
      }),
      loading: ref(false),
      error: ref(null),
    });

    const wrapper = mount(StatsView);

    expect(wrapper.text()).toContain('Estimativa indisponível no momento');
    expect(wrapper.text()).toContain('não pôde ser confirmado pela API SIDRA');
    expect(wrapper.text()).toContain('Densidade: indisponível sem estimativa SIDRA atual');
    expect(wrapper.text()).toContain('218,8');
  });
});
