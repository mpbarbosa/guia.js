<script setup lang="ts">
/**
 * Toast Vue Component
 *
 * Presentational component for a single toast notification.
 * The imperative ToastManager (Toast.js) remains for backward compatibility.
 *
 * @since 0.12.11-alpha
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Props {
  message: string;
  type?: ToastType;
  toastId: string;
}

interface Emits {
  (e: 'dismiss', id: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
});

const emit = defineEmits<Emits>();

const TOAST_CONFIG: Record<ToastType, { icon: string; className: string; role: string; ariaLive: string }> = {
  success: { icon: '✓', className: 'toast-success', role: 'status', ariaLive: 'polite' },
  error:   { icon: '✕', className: 'toast-error',   role: 'alert',  ariaLive: 'assertive' },
  info:    { icon: 'ℹ', className: 'toast-info',    role: 'status', ariaLive: 'polite' },
  warning: { icon: '⚠', className: 'toast-warning', role: 'status', ariaLive: 'polite' },
};

const config = TOAST_CONFIG[props.type] ?? TOAST_CONFIG.info;

function handleDismiss() {
  emit('dismiss', props.toastId);
}
</script>

<template>
  <div
    :class="['toast', config.className]"
    :role="config.role"
    :aria-live="config.ariaLive"
    aria-atomic="true"
    :data-toast-id="props.toastId"
  >
    <span class="toast-icon" aria-hidden="true">{{ config.icon }}</span>
    <span class="toast-message">{{ props.message }}</span>
    <button
      class="toast-close"
      type="button"
      aria-label="Fechar notificação"
      @click="handleDismiss"
    >
      ×
    </button>
  </div>
</template>
