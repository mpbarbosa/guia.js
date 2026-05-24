<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import {
  attachSharedChronometerElement,
  detachSharedChronometerElement,
} from '../../timing/sharedChronometer.js';

defineOptions({ name: 'MonitorView' });

const chronometerElement = ref<HTMLElement | null>(null);

onMounted(() => {
  attachSharedChronometerElement(chronometerElement.value);
});

onUnmounted(() => {
  detachSharedChronometerElement();
});
</script>

<template>
  <section class="p-6 bg-surface min-h-full space-y-6">
    <header class="space-y-2">
      <h2 class="text-3xl font-bold text-indigo-950 tracking-tight">Monitor</h2>
      <p class="text-on-surface-variant font-medium">
        Acompanhe os indicadores de rastreamento em um painel dedicado.
      </p>
    </header>

    <div class="advanced-control-group chronometer-group">
      <label for="chronometer" class="chronometer-label">
        <span class="label-text">Tempo de rastreamento</span>
        <span class="label-hint" aria-label="Tempo desde que iniciou o rastreamento contínuo">ℹ️</span>
      </label>
      <div class="chronometer-display">
        <span
          id="chronometer"
          ref="chronometerElement"
          class="chronometer-value"
          role="timer"
          aria-live="off"
        >00:00:00</span>
        <small class="chronometer-description">Tempo desde que iniciou o rastreamento contínuo</small>
      </div>
    </div>

    <div class="advanced-controls-content">
      <div class="advanced-control-group">
        <label for="text-input">Síntese de Voz</label>
        <textarea
          id="text-input"
          placeholder="Digite o texto para falar..."
          aria-label="Texto para síntese de voz"
          class="speech-input-textarea"
        ></textarea>
      </div>
    </div>
  </section>
</template>

<style>
.chronometer-group {
  padding: 16px;
  background: var(--color-surface-variant, #f9fafb);
  border-radius: 8px;
  border: 1px solid var(--color-border-dark, #e5e7eb);
}

.chronometer-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--color-text-secondary, #374151);
  margin-bottom: 8px;
}

.label-hint {
  font-size: 1rem;
  cursor: help;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.label-hint:hover,
.label-hint:focus {
  opacity: 1;
}

.chronometer-display {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chronometer-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: var(--color-text-primary, #1f2937);
  letter-spacing: 0.05em;
}

.chronometer-description {
  font-size: 0.75rem;
  color: var(--color-text-muted, #6b7280);
  font-style: italic;
}

@media (max-width: 640px) {
  .chronometer-value { font-size: 1.25rem; }
}
</style>
