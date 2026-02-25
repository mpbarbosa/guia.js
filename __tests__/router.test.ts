/**
 * @jest-environment jsdom
 */
import router from '../src/router';

describe('router.ts', () => {
  test('has / route named "home"', () => {
    const homeRoute = router.getRoutes().find(r => r.path === '/');
    expect(homeRoute).toBeDefined();
    expect(homeRoute?.name).toBe('home');
  });

  test('has /converter route named "converter"', () => {
    const converterRoute = router.getRoutes().find(r => r.path === '/converter');
    expect(converterRoute).toBeDefined();
    expect(converterRoute?.name).toBe('converter');
  });

  test('navigates to / and sets currentRoute', async () => {
    await router.push('/');
    await router.isReady();
    expect(router.currentRoute.value.path).toBe('/');
  });

  test('navigates to /converter', async () => {
    await router.push('/converter');
    await router.isReady();
    expect(router.currentRoute.value.path).toBe('/converter');
  });

  test('unknown path redirects to /', async () => {
    await router.push('/does-not-exist');
    await router.isReady();
    expect(router.currentRoute.value.path).toBe('/');
  });

  test('home route meta.title is "Início"', () => {
    const homeRoute = router.getRoutes().find(r => r.path === '/');
    expect(homeRoute?.meta?.title).toBe('Início');
  });

  test('converter route meta.title is set', () => {
    const route = router.getRoutes().find(r => r.path === '/converter');
    expect(typeof route?.meta?.title).toBe('string');
  });
});
