/**
 * Vue Router configuration for Guia Turístico
 *
 * Uses hash mode to mirror the existing custom hash-router in app.js.
 * Routes match the paths defined in src/config/routes.js.
 *
 * @since 0.12.3-alpha
 */
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import { defineAsyncComponent } from 'vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: defineAsyncComponent(
      () => import('./components/HomeView.vue'),
    ),
    meta: { title: 'Início' },
  },
  {
    path: '/converter',
    name: 'converter',
    component: defineAsyncComponent(
      () => import('./components/ConverterView.vue'),
    ),
    meta: { title: 'Conversor de Coordenadas' },
  },
  {
    // Catch-all: redirect unknown paths to home
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

/** Update document.title on each navigation */
router.afterEach((to) => {
  const baseTitle = 'Guia Turístico';
  const routeTitle = to.meta?.title as string | undefined;
  document.title = routeTitle ? `${routeTitle} — ${baseTitle}` : baseTitle;
});

export default router;
