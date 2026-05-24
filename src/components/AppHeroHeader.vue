<script setup lang="ts">
defineOptions({ name: 'AppHeroHeader' });
</script>

<template>
  <div class="bg-gradient-to-br from-primary to-indigo-800 rounded-3xl p-6 text-white shadow-xl shrink-0">
    <h1 class="!text-xs !font-bold !m-0 uppercase tracking-[0.2em] opacity-80">Onde estou?</h1>
    <p id="hero-regiao-metropolitana" class="!text-xs !m-0 !mt-1 opacity-70" aria-live="polite"></p>
    <div class="flex items-center gap-3 mt-4">
      <i class="bi bi-cursor-fill text-[2rem] shrink-0" aria-hidden="true"></i>
      <h2
        id="header-location-text"
        class="!text-2xl !font-bold !m-0"
        aria-live="polite"
        data-pending="true"
      >— · —</h2>
    </div>
  </div>
</template>

<style scoped>
#hero-regiao-metropolitana:empty {
  display: none;
}
</style>
