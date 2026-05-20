/**
 * Vue Router configuration for Guia Turístico
 *
 * Uses hash mode to mirror the existing custom hash-router in app.js.
 * Routes match the paths defined in src/config/routes.js.
 *
 * @since 0.12.12-alpha
 */
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('./components/HomeView.vue'),
    meta: { title: 'Início' },
  },
  {
    path: '/converter',
    name: 'converter',
    component: () => import('./components/ConverterView.vue'),
    meta: { title: 'Conversor de Coordenadas' },
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('./components/views/MapView.vue'),
    meta: { title: 'Mapa' },
  },
  {
    path: '/stats',
    name: 'stats',
    component: () => import('./components/views/StatsView.vue'),
    meta: { title: 'Estatísticas' },
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('./components/views/HistoryView.vue'),
    meta: { title: 'Histórico' },
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
