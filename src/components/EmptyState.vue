<script setup lang="ts">
/**
 * EmptyState Vue Component
 *
 * Declarative wrapper for the empty-state UI pattern.
 * Mirrors the props of createEmptyState() from EmptyState.js.
 *
 * @since 0.12.0-alpha
 */

interface Props {
  icon: string;
  title: string;
  description: string;
  action?: string;
}

interface Emits {
  (e: 'action'): void;
}

const props = withDefaults(defineProps<Props>(), {
  action: undefined,
});

const emit = defineEmits<Emits>();
</script>

<template>
  <div class="empty-state" role="status" aria-live="polite">
    <div class="empty-state-icon" aria-hidden="true">{{ props.icon }}</div>
    <h3 class="empty-state-title">{{ props.title }}</h3>
    <p class="empty-state-description">{{ props.description }}</p>
    <button
      v-if="props.action"
      class="empty-state-action md3-button-outlined"
      type="button"
      @click="emit('action')"
    >
      {{ props.action }}
    </button>
  </div>
</template>
