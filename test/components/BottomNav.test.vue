<script lang="ts">
import { describe, it, expect, beforeEach, afterEach, vi } from '@jest/globals';
import { mount, VueWrapper } from '@vue/test-utils';
import BottomNav from '../../src/components/BottomNav.vue';

// Mock vue-router's useRoute composable
vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
}));

import { useRoute } from 'vue-router';

type RouteMock = { path: string };

describe('BottomNav.vue', () => {
  let wrapper: VueWrapper<any>;
  const getRouteMock = (path: string): RouteMock => ({ path });

  beforeEach(() => {
    // Reset and set default route before each test
    (useRoute as jest.Mock).mockReturnValue(getRouteMock('/'));
    wrapper = mount(BottomNav);
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  it('renders navigation with correct role and aria-label', () => {
    const nav = wrapper.get('nav');
    expect(nav.attributes('role')).toBe('navigation');
    expect(nav.attributes('aria-label')).toBe('Navegação principal');
  });

  it('renders all five tabs with correct labels and hrefs', () => {
    const tabs = [
      { name: 'home', path: '/', label: 'Início' },
      { name: 'converter', path: '/converter', label: 'Rotas' },
      { name: 'map', path: '/map', label: 'Mapa' },
      { name: 'stats', path: '/stats', label: 'Stats' },
      { name: 'history', path: '/history', label: 'Histórico' },
    ] as const;

    const links = wrapper.findAll('a');
    expect(links).toHaveLength(5);

    tabs.forEach((tab, idx) => {
      const link = links[idx];
      expect(link.attributes('href')).toBe(`#${tab.path}`);
      expect(link.attributes('aria-label')).toBe(tab.label);
      expect(link.text()).toContain(tab.label);
    });
  });

  it('highlights the active tab and sets aria-current', async () => {
    (useRoute as jest.Mock).mockReturnValue({ path: '/map' });
    wrapper = mount(BottomNav);

    const links = wrapper.findAll('a');
    const activeLink = links[2]; // '/map'
    expect(activeLink.attributes('aria-current')).toBe('page');
    expect(activeLink.classes()).toContain('bg-primary/5');
    // Inactive tabs should not have aria-current
    links.forEach((link, idx) => {
      if (idx !== 2) {
        expect(link.attributes('aria-current')).toBeUndefined();
      }
    });
  });

  it('shows the active indicator dot only on the active tab', async () => {
    (useRoute as jest.Mock).mockReturnValue({ path: '/stats' });
    wrapper = mount(BottomNav);

    const links = wrapper.findAll('a');
    links.forEach((link, idx) => {
      const hasDot = !!link.find('span.absolute').exists();
      if (idx === 3) {
        expect(hasDot).toBe(true);
      } else {
        expect(hasDot).toBe(false);
      }
    });
  });

  it('renders the correct icon for active and inactive tabs', async () => {
    (useRoute as jest.Mock).mockReturnValue({ path: '/history' });
    wrapper = mount(BottomNav);

    const links = wrapper.findAll('a');
    links.forEach((link, idx) => {
      const icon = link.find('i.bi');
      expect(icon.exists()).toBe(true);
      if (idx === 4) {
        expect(icon.classes()).toContain('bi-clock-history');
      }
    });
  });

  it('applies correct text color to active and inactive tab labels', async () => {
    (useRoute as jest.Mock).mockReturnValue({ path: '/converter' });
    wrapper = mount(BottomNav);

    const links = wrapper.findAll('a');
    links.forEach((link, idx) => {
      const label = link.find('span.text-[11px]');
      if (idx === 1) {
        expect(label.classes()).toContain('text-primary');
      } else {
        expect(label.classes()).toContain('text-on-surface-variant');
        expect(label.classes()).toContain('opacity-60');
      }
    });
  });

  it('renders with no runtime errors (edge case)', () => {
    expect(() => mount(BottomNav)).not.toThrow();
  });

  it('does not render unexpected elements', () => {
    expect(wrapper.find('ul').exists()).toBe(false);
    expect(wrapper.find('footer').exists()).toBe(false);
    expect(wrapper.find('input').exists()).toBe(false);
  });

  it('handles unknown route gracefully (error scenario)', () => {
    (useRoute as jest.Mock).mockReturnValue({ path: '/unknown' });
    wrapper = mount(BottomNav);

    const links = wrapper.findAll('a');
    links.forEach((link) => {
      expect(link.attributes('aria-current')).toBeUndefined();
      expect(link.classes()).not.toContain('bg-primary/5');
    });
    // No active indicator dot should be present
    expect(wrapper.find('span.absolute').exists()).toBe(false);
  });
});
</script>
