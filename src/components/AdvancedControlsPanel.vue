<script setup lang="ts">
defineOptions({ name: 'AdvancedControlsPanel' });
</script>

<template>
  <details id="advanced-controls" class="advanced-controls">
    <summary class="advanced-controls-summary">
      <span class="summary-icon" aria-hidden="true">⚙️</span>
      <span class="summary-text">Opções Avançadas</span>
    </summary>
    <div class="advanced-controls-content">
      <div id="tracking-controls">
        <button
          id="insertPositionButton"
          class="md3-button-outlined"
          aria-label="Inserir posição de teste"
        >
          Inserir posição de teste
        </button>
      </div>

      <div class="advanced-control-group chronometer-group">
        <label for="chronometer" class="chronometer-label">
          <span class="label-text">Tempo de rastreamento</span>
          <span class="label-hint" aria-label="Tempo desde que iniciou o rastreamento contínuo">ℹ️</span>
        </label>
        <div class="chronometer-display">
          <span id="chronometer" class="chronometer-value" role="timer" aria-live="off">00:00:00</span>
          <small class="chronometer-description">Tempo desde que iniciou o rastreamento contínuo</small>
        </div>
      </div>

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
  </details>

  <label for="navigation-log" class="sr-only">Histórico de navegação</label>
  <output
    id="navigation-log"
    role="log"
    aria-live="polite"
    aria-atomic="false"
    class="navigation-log"
  ></output>
  <textarea id="bottom-scroll-textarea" class="hidden" aria-hidden="true"></textarea>
</template>

<style>
.chronometer-group {
  margin: 24px 0;
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

.chronometer-group.hidden { display: none; }

@media (max-width: 640px) {
  .chronometer-value { font-size: 1.25rem; }
}
</style>
