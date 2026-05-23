<script setup lang="ts">
defineOptions({ name: 'LocationHighlightCards' });
</script>

<template>
  <section class="location-highlights space-y-4" aria-label="Destaques de localização">
    <div
      class="highlight-card bg-white border border-outline-variant p-6 rounded-2xl shadow-sm"
      role="region"
      aria-labelledby="municipio-label"
    >
      <span id="municipio-label" class="text-[10px] font-black text-outline uppercase tracking-widest">Município</span>
      <div id="regiao-metropolitana-value" class="text-xs text-outline font-medium mt-0.5"></div>
      <p id="municipio-value" class="text-xl font-bold text-indigo-950 mt-1 uppercase" aria-live="polite">—</p>
    </div>

    <div
      class="highlight-card bg-white border border-outline-variant p-6 rounded-2xl shadow-sm"
      role="region"
      aria-labelledby="bairro-label"
    >
      <span id="bairro-label" class="text-[10px] font-black text-outline uppercase tracking-widest">Bairro</span>
      <p id="bairro-value" class="text-xl font-bold text-indigo-950 mt-1 uppercase" aria-live="polite">—</p>
    </div>

    <div
      class="highlight-card bg-white border border-outline-variant p-6 rounded-2xl shadow-sm"
      role="region"
      aria-labelledby="logradouro-label"
    >
      <span id="logradouro-label" class="text-[10px] font-black text-outline uppercase tracking-widest">Logradouro</span>
      <p id="logradouro-value" class="text-xl font-bold text-indigo-950 mt-1 uppercase" aria-live="polite">—</p>
    </div>
  </section>
</template>
