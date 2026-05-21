<script setup lang="ts">
defineOptions({ name: 'AppBar' });
</script>

<template>
  <header
    class="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50 shrink-0"
    role="banner"
  >
    <div class="flex items-center gap-3">
      <div class="p-2 bg-primary rounded-xl">
        <i class="bi bi-compass-fill text-white text-[1.1rem] leading-none" aria-hidden="true"></i>
      </div>
      <span class="text-xl font-bold text-primary tracking-tight">Guia JS</span>
    </div>
    <div class="flex items-center gap-2">
      <button class="p-2 rounded-full hover:bg-surface-variant transition-colors" aria-label="Notificações">
        <i class="bi bi-bell text-on-surface-variant text-xl leading-none" aria-hidden="true"></i>
      </button>
      <div class="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-container shrink-0">
        <img
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop"
          alt="Usuário"
          class="w-full h-full object-cover"
        />
      </div>
    </div>
  </header>
</template>
