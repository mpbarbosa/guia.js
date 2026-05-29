<script setup lang="ts">
import { VERSION } from '../config/version.js';

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
      <div class="flex flex-col gap-1">
        <span class="text-xl font-bold text-primary tracking-tight">Guia JS</span>
        <span
          class="inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-primary"
          aria-label="Versão do aplicativo"
        >
          v{{ VERSION }}
        </span>
      </div>
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
