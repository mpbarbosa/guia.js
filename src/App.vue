<script setup lang="ts">
/**
 * App Vue Component — Root of the Vue 3 application
 *
 * Hosts the router-view and provides the global layout shell.
 * The full template (nav, header, footer) will be migrated from
 * index.html in subsequent phases.
 *
 * @since 0.12.4-alpha
 */
import { RouterView } from 'vue-router';
</script>

<template>
  <div id="vue-app-root">
    <RouterView />
  </div>
</template>
