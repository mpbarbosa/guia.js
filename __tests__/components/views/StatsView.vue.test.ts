/**
 * @jest-environment jsdom
 */
import { mount } from '@vue/test-utils';
import StatsView from '../../../src/components/views/StatsView.vue';

describe('StatsView.vue', () => {
  test('renders the headline, category pills, and stat cards', () => {
    const wrapper = mount(StatsView);
    const categoryLabels = wrapper.findAll('button').map((button) => button.text());

    expect(wrapper.get('header').text()).toContain('Dados da Cidade');
    expect(categoryLabels).toEqual(['Todos', 'População', 'Território']);
    expect(wrapper.text()).toContain('Estimativa Populacional');
    expect(wrapper.text()).toContain('Área e Densidade');
  });

  test('updates the active category pill when clicked', async () => {
    const wrapper = mount(StatsView);
    const pills = wrapper.findAll('button').slice(0, 3);

    expect(pills[0].classes()).toContain('bg-primary');

    await pills[2].trigger('click');

    expect(pills[2].classes()).toContain('bg-primary');
    expect(pills[2].classes()).toContain('text-white');
    expect(pills[0].classes()).not.toContain('bg-primary');
  });
});
