import { mount } from '@vue/test-utils';
import ExtraView from '../../../src/components/views/ExtraView.vue';

const mountExtraView = () =>
  mount(ExtraView, {
    global: {
      stubs: {
        LocationSnapshotCard: {
          name: 'LocationSnapshotCard',
          template: '<div data-testid="location-snapshot-card-stub" />',
        },
      },
    },
  });

describe('ExtraView.vue', () => {
  it('renders the section with the expected layout classes', () => {
    const wrapper = mountExtraView();
    const section = wrapper.get('section');

    expect(section.classes()).toEqual(expect.arrayContaining(['p-6', 'bg-surface', 'min-h-full', 'space-y-6']));
  });

  it('renders the header copy', () => {
    const wrapper = mountExtraView();
    const header = wrapper.get('header');

    expect(header.get('h2').text()).toBe('Extra');
    expect(header.get('p').text()).toBe('Resumo salvo da sua localização e informações complementares.');
  });

  it('renders the location snapshot card stub', () => {
    const wrapper = mountExtraView();

    expect(wrapper.findComponent({ name: 'LocationSnapshotCard' }).exists()).toBe(true);
    expect(wrapper.get('[data-testid="location-snapshot-card-stub"]').exists()).toBe(true);
  });
});
