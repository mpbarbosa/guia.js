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
 * @since 0.12.7-alpha
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
  <!--
    Placeholder slot: the full home-view template (migrated from index.html)
    will replace this in Phase 4.
  -->
  <slot />
</template>
