/**
 * main.ts — Vue 3 application entry point
 *
 * Creates the Vue app with vue-router and mounts it on #app.
 * The existing app.js + index.html pipeline remains fully functional;
 * this file is the new entry point for the migrated Vue build.
 *
 * @since 0.12.5-alpha
 */
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);

// Only mount if the target element exists
const mountEl = document.getElementById('app');
if (mountEl) {
  app.mount(mountEl);
}

export { app, router };
