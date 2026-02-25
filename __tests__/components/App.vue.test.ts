/**
 * @jest-environment jsdom
 */
import { mount } from '@vue/test-utils';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from '../../src/App.vue';

/** Minimal stub routes so we don't load real async components */
function makeTestRouter() {
  return createRouter({
    history: createWebHashHistory(),
    routes: [
      { path: '/', component: { template: '<div id="home-stub">Home</div>' } },
      { path: '/converter', component: { template: '<div id="converter-stub">Converter</div>' } },
    ],
  });
}

describe('App.vue', () => {
  test('renders without errors', async () => {
    const router = makeTestRouter();
    await router.push('/');
    await router.isReady();
    const wrapper = mount(App, { global: { plugins: [router] } });
    expect(wrapper.find('#vue-app-root').exists()).toBe(true);
  });

  test('renders RouterView content for / route', async () => {
    const router = makeTestRouter();
    await router.push('/');
    await router.isReady();
    const wrapper = mount(App, { global: { plugins: [router] } });
    expect(wrapper.text()).toContain('Home');
  });

  test('renders RouterView content for /converter route', async () => {
    const router = makeTestRouter();
    await router.push('/converter');
    await router.isReady();
    const wrapper = mount(App, { global: { plugins: [router] } });
    expect(wrapper.text()).toContain('Converter');
  });
});
