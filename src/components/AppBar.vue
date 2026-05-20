<script setup lang="ts">
defineOptions({ name: 'AppBar' });
</script>

<template>
  <header
    class="bg-white/80 backdrop-blur-md border-b border-outline-variant sticky top-0 z-30 px-4 h-14 flex items-center gap-3 shrink-0"
    role="banner"
  >
    <div class="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0">
      <i class="bi bi-geo-alt-fill text-white" aria-hidden="true"></i>
    </div>
    <span class="text-primary font-bold text-xl tracking-tight">Guia Turístico</span>
  </header>
</template>
