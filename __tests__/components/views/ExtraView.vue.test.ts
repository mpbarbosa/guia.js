import { mount, VueWrapper } from '@vue/test-utils';
import ExtraView from '../../../src/components/views/ExtraView.vue';

jest.mock('../../../src/components/LocationSnapshotCard.vue', () => ({
  __esModule: true,
  default: {
    name: 'LocationSnapshotCard',
    template: '<div class="mock-location-snapshot-card">Mock Card</div>',
  },
}));

describe('ExtraView.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = mount(ExtraView);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders the section with correct classes', () => {
    const section = wrapper.get('section');
    expect(section.classes()).toContain('p-6');
    expect(section.classes()).toContain('bg-surface');
    expect(section.classes()).toContain('min-h-full');
    expect(section.classes()).toContain('space-y-6');
  });

  it('renders the header with correct text', () => {
    const header = wrapper.get('header');
    expect(header.text()).toContain('Extra');
    expect(header.text()).toContain('Resumo salvo da sua localização e informações complementares.');
    const h2 = header.get('h2');
    expect(h2.text()).toBe('Extra');
    expect(h2.classes()).toContain('text-3xl');
    expect(h2.classes()).toContain('font-bold');
    expect(h2.classes()).toContain('text-indigo-950');
    expect(h2.classes()).toContain('tracking-tight');
    const p = header.get('p');
    expect(p.text()).toBe('Resumo salvo da sua localização e informações complementares.');
    expect(p.classes()).toContain('text-on-surface-variant');
    expect(p.classes()).toContain('font-medium');
  });

  it('renders the LocationSnapshotCard component', () => {
    expect(wrapper.findComponent({ name: 'LocationSnapshotCard' }).exists()).toBe(true);
    expect(wrapper.html()).toContain('mock-location-snapshot-card');
  });

  it('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
});
