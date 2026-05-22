<script setup lang="ts">
import { useMapDisplayer } from '../../composables/useMapDisplayer.js';

defineOptions({ name: 'MapView' });

const { street, neighborhood, city } = useMapDisplayer();
</script>

<template>
  <div class="h-full relative overflow-hidden bg-surface-variant">
    <!-- MapLibre GL JS map container -->
    <div id="maplibre-map" class="absolute inset-0 w-full h-full"></div>

    <!-- Floating UI overlay -->
    <div class="relative z-10 p-6 flex flex-col h-full pointer-events-none">
      <!-- Location card -->
      <div class="bg-white border border-outline-variant p-4 rounded-3xl shadow-2xl flex items-center justify-between pointer-events-auto">
        <div class="min-w-0 flex-1 mr-4">
          <span class="text-[10px] font-black text-outline uppercase tracking-widest">Localização Atual</span>
          <h2 class="text-xl font-bold text-indigo-950 mt-0.5 truncate">{{ street }}</h2>
          <div class="flex items-center gap-1.5 text-on-surface-variant text-sm font-medium mt-0.5">
            <span class="truncate">{{ neighborhood }}</span>
            <span class="w-1 h-1 bg-outline rounded-full shrink-0"></span>
            <span class="truncate">{{ city }}</span>
          </div>
        </div>
        <div class="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
          <i class="bi bi-navigation-fill text-2xl" aria-hidden="true"></i>
        </div>
      </div>

      <div class="flex-1"></div>

      <div class="space-y-4 pointer-events-auto">
        <!-- Recenter button -->
        <div class="flex justify-end">
          <button
            class="w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center text-primary border border-outline-variant active:scale-90 transition-transform"
            aria-label="Centrar no mapa"
          >
            <i class="bi bi-crosshair text-xl text-primary" aria-hidden="true"></i>
          </button>
        </div>

        <!-- Category chips -->
        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            v-for="chip in ['Restaurantes', 'Postos', 'Hospitais', 'Estacionamento']"
            :key="chip"
            class="whitespace-nowrap px-6 py-4 bg-white border border-outline-variant rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-primary-container hover:text-white transition-colors"
          >
            {{ chip }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
