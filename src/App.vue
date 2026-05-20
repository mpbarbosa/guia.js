<script setup lang="ts">
import { ref, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import AppBar from './components/AppBar.vue';
import BottomNav from './components/BottomNav.vue';

const mainEl = ref<HTMLElement | null>(null);
const route = useRoute();

watch(
  () => route.path,
  () => { if (mainEl.value) mainEl.value.scrollTop = 0; },
);
</script>

<template>
  <div class="flex flex-col h-screen max-w-md mx-auto bg-surface overflow-hidden shadow-2xl relative">
    <AppBar />
    <main ref="mainEl" class="flex-1 overflow-y-auto relative no-scrollbar">
      <RouterView />
    </main>
    <BottomNav />
  </div>
</template>
