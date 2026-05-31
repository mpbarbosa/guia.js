<script setup lang="ts">
import { usePositionDisplayer }       from '../composables/usePositionDisplayer.js';
import { useAddressDisplayer }         from '../composables/useAddressDisplayer.js';
import { useReferencePlaceDisplayer }  from '../composables/useReferencePlaceDisplayer.js';
import { useSidraDisplayer }           from '../composables/useSidraDisplayer.js';

defineOptions({ name: 'SecondaryInfo' });

const { coordinates }       = usePositionDisplayer();
const { enderecoPadronizado } = useAddressDisplayer();
const { referencePlaceName } = useReferencePlaceDisplayer();
const { sidraLabel }         = useSidraDisplayer();
</script>

<template>
  <section
    class="bg-white border border-outline-variant rounded-2xl shadow-sm p-4 space-y-2 text-sm text-on-surface-variant"
    aria-label="Informações de localização"
  >
    <!-- Endereço padronizado — id preserved for E2E tests -->
    <div class="flex gap-1.5 items-start">
      <span class="font-semibold shrink-0">Endereço:</span>
      <span id="endereco-padronizado-display" aria-live="polite">{{ enderecoPadronizado }}</span>
    </div>

    <!-- Coordenadas — id preserved for E2E tests -->
    <div class="flex gap-1.5 items-start">
      <span class="font-semibold shrink-0">Coordenadas:</span>
      <span id="lat-long-display" aria-live="polite">{{ coordinates }}</span>
    </div>

    <!-- Ponto de referência — id preserved for E2E tests -->
    <div v-if="referencePlaceName" class="flex gap-1.5 items-start">
      <span class="font-semibold shrink-0">Referência:</span>
      <span id="reference-place-display" aria-live="polite">{{ referencePlaceName }}</span>
    </div>
    <!-- Placeholder kept in DOM when empty so E2E selector always resolves -->
    <span v-else id="reference-place-display" class="sr-only" aria-live="polite"></span>

    <!-- IBGE/SIDRA — id preserved for E2E tests -->
    <div class="flex gap-1.5 items-start">
      <span class="font-semibold shrink-0">Dados IBGE:</span>
      <span id="dadosSidra" aria-live="polite">{{ sidraLabel }}</span>
    </div>
  </section>
</template>
