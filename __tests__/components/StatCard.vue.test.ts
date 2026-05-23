/**
 * @jest-environment jsdom
 */
import { mount, VueWrapper } from '@vue/test-utils';
import StatCard from '../../src/components/StatCard.vue';

describe('StatCard.vue', () => {
  const baseProps = {
    icon: 'bi-graph-up',
    category: 'População',
    title: 'População Total',
  };

  it('renders icon, category, and title', () => {
    const wrapper: VueWrapper = mount(StatCard, { props: baseProps });
    const icon = wrapper.get('i');
    expect(icon.classes()).toContain('bi');
    expect(icon.classes()).toContain('bi-graph-up');
    expect(icon.classes()).toContain('text-xl');
    expect(wrapper.text()).toContain('População');
    expect(wrapper.text()).toContain('População Total');
  });

  it('renders badge slot content', () => {
    const wrapper: VueWrapper = mount(StatCard, {
      props: baseProps,
      slots: { badge: '<span class="badge-slot">B</span>' },
    });
    expect(wrapper.find('.badge-slot').exists()).toBe(true);
    expect(wrapper.find('.badge-slot').text()).toBe('B');
  });

  it('renders loading skeleton when loading=true', () => {
    const wrapper: VueWrapper = mount(StatCard, {
      props: { ...baseProps, loading: true },
    });
    expect(wrapper.findAll('.animate-pulse').length).toBe(2);
    expect(wrapper.find('div.mt-2.space-y-2').exists()).toBe(true);
    // Value slot should not be rendered
    expect(wrapper.find('div.mt-2 > *[slot="value"]').exists()).toBe(false);
  });

  it('renders value slot when not loading', () => {
    const wrapper: VueWrapper = mount(StatCard, {
      props: { ...baseProps, loading: false },
      slots: { value: '<span class="value-slot">42</span>' },
    });
    expect(wrapper.find('.value-slot').exists()).toBe(true);
    expect(wrapper.find('.value-slot').text()).toBe('42');
  });

  it('renders chart slot content', () => {
    const wrapper: VueWrapper = mount(StatCard, {
      props: baseProps,
      slots: { chart: '<div class="chart-slot">Chart!</div>' },
    });
    expect(wrapper.find('.chart-slot').exists()).toBe(true);
    expect(wrapper.find('.chart-slot').text()).toBe('Chart!');
  });

  it('renders footnote when provided', () => {
    const wrapper: VueWrapper = mount(StatCard, {
      props: { ...baseProps, footnote: 'Fonte: IBGE' },
    });
    const footnote = wrapper.find('[data-testid="statcard-footnote"]');
    expect(footnote.exists()).toBe(true);
    expect(footnote.text()).toBe('Fonte: IBGE');
  });

  it('does not render footnote when not provided', () => {
    const wrapper: VueWrapper = mount(StatCard, { props: baseProps });
    expect(wrapper.find('[data-testid="statcard-footnote"]').exists()).toBe(false);
  });

  it('renders correctly with all optional props and slots', () => {
    const wrapper: VueWrapper = mount(StatCard, {
      props: { ...baseProps, loading: false, footnote: 'Obs.' },
      slots: {
        badge: '<span class="badge-slot">VIP</span>',
        value: '<span class="value-slot">1000</span>',
        chart: '<div class="chart-slot">C</div>',
      },
    });
    expect(wrapper.find('.badge-slot').text()).toBe('VIP');
    expect(wrapper.find('.value-slot').text()).toBe('1000');
    expect(wrapper.find('.chart-slot').text()).toBe('C');
    expect(wrapper.find('[data-testid="statcard-footnote"]').text()).toBe('Obs.');
  });

  it('applies correct classes to root and header elements', () => {
    const wrapper: VueWrapper = mount(StatCard, { props: baseProps });
    const root = wrapper.get('div.bg-white');
    expect(root.classes()).toContain('rounded-3xl');
    expect(root.classes()).toContain('shadow-sm');
    const header = wrapper.get('.flex.items-center.justify-between.mb-4');
    expect(header.exists()).toBe(true);
  });

  it('handles missing optional props gracefully', () => {
    const wrapper: VueWrapper = mount(StatCard, {
      props: { icon: 'bi-star', category: 'Cat', title: 'T' },
    });
    expect(wrapper.find('[data-testid="statcard-footnote"]').exists()).toBe(false);
    expect(wrapper.findAll('.animate-pulse').length).toBe(0);
  });
});
