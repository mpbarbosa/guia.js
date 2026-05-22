<script setup lang="ts">
import { ref, computed } from 'vue';
import StatCard from '../StatCard.vue';
import { useIBGECityStats } from '../../composables/useIBGECityStats.js';

defineOptions({ name: 'StatsView' });

const activeCategory = ref('Todos');
const categories = ['Todos', 'População', 'Território'];

const { stats, loading, error } = useIBGECityStats();

const populationFormatted = computed(() => {
  const pop = stats.value?.population;
  if (pop == null) return '—';
  return pop.toLocaleString('pt-BR');
});

const areaFormatted = computed(() => {
  const area = stats.value?.areaKm2;
  if (area == null) return '—';
  return area.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
});

const densityFormatted = computed(() => {
  const pop = stats.value?.population;
  const area = stats.value?.areaKm2;
  if (!pop || !area) return '—';
  return (pop / area).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
});

const cityLabel = computed(() => {
  if (!stats.value) return 'Aguardando localização...';
  return `${stats.value.name} — ${stats.value.uf}`;
});

const populationYear = computed(() => stats.value?.populationYear ?? '');

const visibleCategories = computed(() => {
  const cat = activeCategory.value;
  return {
    population: cat === 'Todos' || cat === 'População',
    territory: cat === 'Todos' || cat === 'Território',
  };
});
</script>

<template>
  <div class="p-6 space-y-8 bg-surface min-h-full">
    <!-- Header -->
    <header>
      <h2 class="text-3xl font-bold text-indigo-950 tracking-tight">Dados da Cidade</h2>
      <p class="text-on-surface-variant font-medium mt-2 leading-relaxed">
        Estatísticas IBGE e indicadores municipais para crescimento urbano sustentável.
      </p>
    </header>

    <!-- Error state -->
    <div
      v-if="error"
      class="bg-red-50 border border-red-200 text-red-700 rounded-3xl p-6 text-sm font-medium"
    >
      <i class="bi bi-exclamation-triangle me-2" aria-hidden="true"></i>
      {{ error }}
    </div>

    <!-- Category filter pills -->
    <div class="flex gap-2 overflow-x-auto no-scrollbar">
      <button
        v-for="cat in categories"
        :key="cat"
        class="whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all"
        :class="activeCategory === cat
          ? 'bg-primary text-white shadow-lg'
          : 'bg-surface-variant text-on-surface-variant'"
        @click="activeCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- City label -->
    <p class="text-sm font-semibold text-outline -mt-4">{{ cityLabel }}</p>

    <!-- Stat cards -->
    <div class="space-y-4">
      <!-- Population card -->
      <StatCard
        v-if="visibleCategories.population"
        icon="bi-people"
        category="População"
        title="Estimativa Populacional"
        :loading="loading"
        footnote="Fonte: IBGE SIDRA — Estimativas da população residente nos municípios brasileiros."
      >
        <template #badge>
          <span
            v-if="populationYear"
            class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current/10 text-primary bg-indigo-50"
          >
            {{ populationYear }}
          </span>
        </template>
        <template #value>
          <div class="flex items-baseline gap-3">
            <p class="text-3xl font-black text-indigo-900">{{ populationFormatted }}</p>
            <span class="text-xs font-bold text-outline uppercase">habitantes</span>
          </div>
        </template>
      </StatCard>

      <!-- Territory card -->
      <StatCard
        v-if="visibleCategories.territory"
        icon="bi-map"
        category="Território"
        title="Área e Densidade"
        :loading="loading"
        footnote="Fonte: IBGE Malhas Municipais — área territorial e densidade demográfica estimada."
      >
        <template #value>
          <div class="space-y-1">
            <div class="flex items-baseline gap-3">
              <p class="text-3xl font-black text-indigo-900">{{ areaFormatted }}</p>
              <span class="text-xs font-bold text-outline uppercase">km²</span>
            </div>
            <p class="text-sm text-on-surface-variant font-medium">
              Densidade: <strong class="text-indigo-900">{{ densityFormatted }}</strong> hab/km²
            </p>
          </div>
        </template>
      </StatCard>
    </div>

    <!-- IBGE reference card -->
    <div class="bg-indigo-950 rounded-3xl p-6 text-white space-y-4 shadow-2xl">
      <div class="flex items-start gap-4">
        <div class="p-3 bg-white/10 rounded-2xl shrink-0">
          <i class="bi bi-bar-chart-line text-2xl leading-none" aria-hidden="true"></i>
        </div>
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Fonte de Dados</span>
          <h3 class="text-xl font-bold leading-tight">IBGE — Cidades</h3>
        </div>
      </div>
      <p class="text-sm opacity-80 leading-relaxed font-medium">
        Dados demográficos e territoriais obtidos diretamente das APIs do Instituto Brasileiro de
        Geografia e Estatística (Localidades e SIDRA).
      </p>
    </div>
  </div>
</template>
