<script setup lang="ts">
import { ref } from 'vue';

const activeCategory = ref('Todos');
const categories = ['Todos', 'População', 'Economia', 'Educação'];

const chartBars = [
  { value: 43, active: false },
  { value: 64, active: false },
  { value: 54, active: false },
  { value: 89, active: true },
  { value: 79, active: true },
  { value: 100, active: true },
  { value: 71, active: true },
];
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

    <!-- Stat cards -->
    <div class="space-y-4">
      <!-- Education card -->
      <div class="bg-white border border-outline-variant p-6 rounded-3xl shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-indigo-50 text-primary rounded-xl">
              <i class="bi bi-mortarboard text-xl leading-none" aria-hidden="true"></i>
            </div>
            <span class="text-xs font-black uppercase tracking-widest text-outline">Educação</span>
          </div>
          <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current/10 text-green-600 bg-green-50">
            ● Ótimo
          </span>
        </div>
        <h4 class="text-2xl font-bold text-indigo-950">Taxa de Escolarização</h4>
        <div class="flex items-baseline gap-3 mt-1">
          <p class="text-3xl font-black text-indigo-900">98,2%</p>
          <span class="text-xs font-bold text-outline uppercase">crianças 6–14 anos</span>
        </div>
        <div class="w-full h-1.5 bg-surface-variant rounded-full mt-4 overflow-hidden">
          <div class="h-full bg-green-500 rounded-full" style="width: 98.2%"></div>
        </div>
        <p class="text-[11px] text-outline mt-4 font-medium leading-relaxed">
          Fonte: Censo Municipal IBGE 2023. Investimentos consistentes em infraestrutura de ensino fundamental.
        </p>
      </div>

      <!-- Economy card -->
      <div class="bg-white border border-outline-variant p-6 rounded-3xl shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-indigo-50 text-primary rounded-xl">
              <i class="bi bi-graph-up text-xl leading-none" aria-hidden="true"></i>
            </div>
            <span class="text-xs font-black uppercase tracking-widest text-outline">Economia</span>
          </div>
          <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current/10 text-primary bg-indigo-50">
            ● Estável
          </span>
        </div>
        <h4 class="text-2xl font-bold text-indigo-950">Salário Médio</h4>
        <div class="flex items-baseline gap-3 mt-1">
          <p class="text-3xl font-black text-indigo-900">3,4 SM</p>
          <span class="text-xs font-bold text-outline uppercase">Média Mensal</span>
        </div>
        <!-- Mini bar chart -->
        <div class="h-16 mt-4 flex items-end gap-1">
          <div
            v-for="(bar, i) in chartBars"
            :key="i"
            class="flex-1 rounded-t-sm transition-all"
            :class="bar.active ? 'bg-primary' : 'bg-outline-variant'"
            :style="{ height: `${bar.value}%` }"
          ></div>
        </div>
        <p class="text-[11px] text-outline mt-4 font-medium leading-relaxed">
          Desempenho em todos os setores de emprego formal no perímetro municipal.
        </p>
      </div>
    </div>

    <!-- Reference document card -->
    <div class="bg-indigo-950 rounded-3xl p-6 text-white space-y-6 shadow-2xl">
      <div class="flex items-start gap-4">
        <div class="p-3 bg-white/10 rounded-2xl shrink-0">
          <i class="bi bi-bar-chart-line text-2xl leading-none" aria-hidden="true"></i>
        </div>
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Documento de Referência</span>
          <h3 class="text-xl font-bold leading-tight">Análise Técnica Municipal</h3>
        </div>
      </div>
      <p class="text-sm opacity-80 leading-relaxed font-medium">
        Detalhamento completo de indicadores municipais e projeções socioeconômicas de longo prazo baseadas em dados IBGE.
      </p>
      <button class="w-full bg-primary-container text-white py-4 rounded-2xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-primary transition-colors">
        <i class="bi bi-download" aria-hidden="true"></i>
        Baixar Relatório PDF
      </button>
    </div>
  </div>
</template>
