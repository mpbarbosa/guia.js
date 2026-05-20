<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppBar from './components/AppBar.vue';
import BottomNav from './components/BottomNav.vue';
</script>

<template>
  <div class="flex flex-col h-screen max-w-md mx-auto bg-surface overflow-hidden shadow-2xl">
    <AppBar />
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
    <BottomNav />
  </div>
</template>
