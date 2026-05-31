<script setup lang="ts">
import { useLocationSnapshot } from '../composables/useLocationSnapshot.js';

defineOptions({ name: 'LocationSnapshotCard' });

const { coordinates, enderecoPadronizado, sidraLabel } = useLocationSnapshot();
</script>

<template>
  <section
    class="bg-white border border-outline-variant rounded-2xl shadow-sm p-4 space-y-2 text-sm text-on-surface-variant"
    aria-label="Informações de localização"
  >
    <div class="flex gap-1.5 items-start">
      <span class="font-semibold shrink-0">Endereço:</span>
      <span id="endereco-padronizado-display" aria-live="polite">{{ enderecoPadronizado }}</span>
    </div>

    <div class="flex gap-1.5 items-start">
      <span class="font-semibold shrink-0">Coordenadas:</span>
      <span id="lat-long-display" aria-live="polite">{{ coordinates }}</span>
    </div>

    <span id="reference-place-display" class="sr-only" aria-live="polite"></span>

    <div class="flex gap-1.5 items-start">
      <span class="font-semibold shrink-0">Dados IBGE:</span>
      <span id="dadosSidra" aria-live="polite">{{ sidraLabel }}</span>
    </div>
  </section>
</template>

