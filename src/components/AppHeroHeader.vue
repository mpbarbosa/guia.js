<script setup lang="ts">
defineOptions({ name: 'AppHeroHeader' });
</script>

<template>
  <div class="bg-gradient-to-br from-primary to-indigo-800 rounded-3xl p-6 text-white shadow-xl shrink-0">
    <h1 class="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Onde estou?</h1>
    <div class="flex items-center gap-3 mt-4">
      <i class="bi bi-navigation-fill text-3xl shrink-0" aria-hidden="true"></i>
      <h2
        id="header-location-text"
        class="text-2xl font-bold leading-tight"
        aria-live="polite"
        data-pending="true"
      >— · —</h2>
    </div>
  </div>
</template>
