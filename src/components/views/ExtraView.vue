<script setup lang="ts">
import LocationSnapshotCard from '../LocationSnapshotCard.vue';

defineOptions({ name: 'ExtraView' });
</script>

<template>
  <section class="p-6 bg-surface min-h-full space-y-6">
    <header class="space-y-2">
      <h2 class="text-3xl font-bold text-indigo-950 tracking-tight">Extra</h2>
      <p class="text-on-surface-variant font-medium">
        Resumo salvo da sua localização e informações complementares.
      </p>
    </header>

    <LocationSnapshotCard />
  </section>
</template>
