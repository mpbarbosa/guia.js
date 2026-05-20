<script setup lang="ts">
/**
 * HomeView Vue Component
 *
 * Wraps HomeViewController using Vue 3 Composition API lifecycle hooks.
 * The controller handles all the heavy DOM coordination; this SFC manages
 * its lifecycle and exposes reactive tracking state.
 *
 * Full template migration (from index.html) happens in Phase 4.
 *
 * @since 0.12.12-alpha
 */
import { ref, onMounted, onUnmounted } from 'vue';
import HomeViewController from '../views/home.js';

interface Props {
  locationResult?: string;
}

const props = withDefaults(defineProps<Props>(), {
  locationResult: 'locationResult',
});

const isTracking = ref(false);
const isInitialized = ref(false);

let controller: InstanceType<typeof HomeViewController> | null = null;

onMounted(async () => {
  try {
    controller = await HomeViewController.create(document, {
      locationResult: props.locationResult,
    });
    isInitialized.value = true;
    isTracking.value = controller.isTracking();

    // Mirror controller tracking state into reactive ref
    document.addEventListener('homeview:tracking:started', () => {
      isTracking.value = true;
    });
    document.addEventListener('homeview:tracking:stopped', () => {
      isTracking.value = false;
    });
  } catch (err) {
    console.error('[HomeView] Failed to initialize HomeViewController:', err);
  }
});

onUnmounted(() => {
  controller?.destroy();
  controller = null;
  isInitialized.value = false;
  isTracking.value = false;
});

/** Toggle tracking — exposed for use by parent or slot buttons */
function toggleTracking(): void {
  controller?.toggleTracking();
}

defineExpose({ isTracking, isInitialized, toggleTracking });
</script>

<template>
  <div class="p-6 space-y-6 flex flex-col min-h-full bg-surface">
    <!-- Hero gradient card -->
    <div class="bg-gradient-to-br from-primary to-indigo-800 rounded-3xl p-6 text-white shadow-xl shrink-0">
      <span class="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Onde estou?</span>
      <div class="flex items-center gap-3 mt-4">
        <i class="bi bi-navigation-fill text-3xl shrink-0" aria-hidden="true"></i>
        <h2
          id="header-location-text"
          class="text-xl font-bold leading-tight"
          aria-live="polite"
          data-pending="true"
        >— · —</h2>
      </div>
    </div>

    <!-- Address highlight cards -->
    <div class="space-y-4">
      <div
        class="highlight-card bg-white border border-outline-variant p-6 rounded-2xl shadow-sm"
        role="region"
        aria-labelledby="municipio-label"
      >
        <span id="municipio-label" class="text-[10px] font-black text-outline uppercase tracking-widest">Município</span>
        <div id="regiao-metropolitana-value" class="text-xs text-outline font-medium mt-0.5"></div>
        <p id="municipio-value" class="text-xl font-bold text-indigo-950 mt-1" aria-live="polite">—</p>
      </div>

      <div
        class="highlight-card bg-white border border-outline-variant p-6 rounded-2xl shadow-sm"
        role="region"
        aria-labelledby="bairro-label"
      >
        <span id="bairro-label" class="text-[10px] font-black text-outline uppercase tracking-widest">Bairro</span>
        <p id="bairro-value" class="text-xl font-bold text-indigo-950 mt-1" aria-live="polite">—</p>
      </div>

      <div
        class="highlight-card bg-white border border-outline-variant p-6 rounded-2xl shadow-sm"
        role="region"
        aria-labelledby="logradouro-label"
      >
        <span id="logradouro-label" class="text-[10px] font-black text-outline uppercase tracking-widest">Logradouro</span>
        <p id="logradouro-value" class="text-xl font-bold text-indigo-950 mt-1" aria-live="polite">—</p>
      </div>
    </div>

    <div class="flex-1"></div>

    <!-- Activate location CTA -->
    <button
      id="enable-location-btn"
      class="w-full bg-primary text-white py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg uppercase tracking-widest transition-transform active:scale-[0.98] shrink-0"
      aria-label="Ativar localização"
    >
      <div class="p-2 bg-white/20 rounded-full">
        <i class="bi bi-compass text-xl leading-none" aria-hidden="true"></i>
      </div>
      Ativar Localização
    </button>

    <!-- Coordinates display -->
    <div class="text-center py-2 shrink-0">
      <p class="text-[10px] text-outline font-medium tracking-widest uppercase">Latitude · Longitude</p>
      <p id="lat-long-display" class="text-xs text-on-surface-variant font-mono mt-1" aria-live="polite">—</p>
    </div>
  </div>
</template>
