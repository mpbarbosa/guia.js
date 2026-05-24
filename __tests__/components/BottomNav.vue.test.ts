/**
 * @jest-environment jsdom
 */
import { mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import BottomNav from '../../src/components/BottomNav.vue';

async function mountWithRoute(currentPath: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/converter', component: { template: '<div>Converter</div>' } },
      { path: '/map', component: { template: '<div>Map</div>' } },
      { path: '/monitor', component: { template: '<div>Monitor</div>' } },
      { path: '/stats', component: { template: '<div>Stats</div>' } },
      { path: '/history', component: { template: '<div>History</div>' } },
      { path: '/unknown', component: { template: '<div>Unknown</div>' } },
    ],
  });

  await router.push(currentPath);
  await router.isReady();

  return mount(BottomNav, {
    global: {
      plugins: [router],
    },
  });
}

describe('BottomNav.vue', () => {
  test('renders the navigation container and all tab labels', async () => {
    const wrapper = await mountWithRoute('/');
    const labels = wrapper.findAll('a').map((link) => link.attributes('aria-label'));

    expect(wrapper.get('nav').attributes('aria-label')).toBe('Navegação principal');
    expect(labels).toEqual(['Home', 'Routes', 'Maps', 'Monitor', 'Stats', 'History']);
  });

  test('marks the active route with aria-current and active styling', async () => {
    const wrapper = await mountWithRoute('/map');
    const links = wrapper.findAll('a');
    const activeLink = links[2];

    expect(activeLink.attributes('aria-current')).toBe('page');
    expect(activeLink.classes()).toContain('bg-primary/5');
    expect(activeLink.get('i').classes()).toContain('bi-map-fill');
    expect(activeLink.findAll('span').some((span) => span.classes().includes('absolute'))).toBe(true);
  });

  test('leaves all tabs inactive for an unknown route', async () => {
    const wrapper = await mountWithRoute('/unknown');

    for (const link of wrapper.findAll('a')) {
      expect(link.attributes('aria-current')).toBeUndefined();
      expect(link.classes()).not.toContain('bg-primary/5');
    }
  });
});
