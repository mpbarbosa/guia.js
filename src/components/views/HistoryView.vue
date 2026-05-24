<script setup lang="ts">
import { ref } from 'vue';
import ToggleSwitch from '../ToggleSwitch.vue';
import { useNavigationHistory } from '../../composables/useNavigationHistory.js';

defineOptions({ name: 'HistoryView' });

const voiceSynthesis = ref(true);
const trackingTime = ref(false);

const { history, formatTime } = useNavigationHistory();
</script>

<template>
  <div class="p-6 space-y-8 bg-surface min-h-full">
    <!-- Header -->
    <header>
      <h2 class="text-3xl font-bold text-indigo-950 tracking-tight">Config. & Histórico</h2>
      <p class="text-on-surface-variant font-medium mt-2">Gerencie preferências e revise seus trajetos.</p>
    </header>

    <!-- App preferences -->
    <section class="space-y-4">
      <h3 class="text-[11px] font-black text-outline uppercase tracking-[0.2em]">Preferências do App</h3>
      <div class="bg-white border border-outline-variant rounded-2xl divide-y divide-outline-variant">
        <!-- Voice synthesis -->
        <div class="p-5 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="p-2.5 bg-surface-variant rounded-xl text-on-surface-variant">
              <i class="bi bi-volume-up-fill text-xl leading-none" aria-hidden="true"></i>
            </div>
            <div>
              <p class="font-bold text-indigo-950">Síntese de Voz</p>
              <p class="text-xs text-on-surface-variant font-medium">Narrar pontos de interesse automaticamente</p>
            </div>
          </div>
          <ToggleSwitch
            v-model="voiceSynthesis"
            :aria-label="voiceSynthesis ? 'Desativar síntese de voz' : 'Ativar síntese de voz'"
          />
        </div>
        <!-- Tracking time -->
        <div class="p-5 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="p-2.5 bg-surface-variant rounded-xl text-on-surface-variant">
              <i class="bi bi-clock-history text-xl leading-none" aria-hidden="true"></i>
            </div>
            <div>
              <p class="font-bold text-indigo-950">Tempo de Rastreamento</p>
              <p class="text-xs text-on-surface-variant font-medium">Registrar duração de cada visita</p>
            </div>
          </div>
          <ToggleSwitch
            v-model="trackingTime"
            :aria-label="trackingTime ? 'Desativar rastreamento de tempo' : 'Ativar rastreamento de tempo'"
          />
        </div>
      </div>
    </section>

    <!-- Navigation history -->
    <section class="space-y-4">
      <h3 class="text-[11px] font-black text-outline uppercase tracking-[0.2em]">Histórico de Navegação</h3>

      <p v-if="history.length === 0" class="text-sm text-on-surface-variant font-medium text-center py-8">
        Nenhum local visitado nesta sessão ainda.
      </p>

      <div v-else class="space-y-3">
        <div
          v-for="item in history"
          :key="`${item.title}-${item.timestamp}`"
          class="p-5 bg-white border border-outline-variant rounded-2xl flex items-start gap-4"
        >
          <div class="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
            <i class="bi text-xl leading-none" :class="item.icon" aria-hidden="true"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <p class="font-bold text-xl text-indigo-950 truncate">{{ item.title }}</p>
              <span class="text-[10px] uppercase font-black text-outline tracking-wider shrink-0">
                {{ formatTime(item.timestamp) }}
              </span>
            </div>
            <p class="text-sm text-on-surface-variant font-medium mt-1">{{ item.desc }}</p>
            <div class="flex items-center gap-1.5 mt-2">
              <div class="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <span class="text-[10px] font-black text-primary uppercase tracking-widest">Visitado</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Version info -->
    <div class="pt-8 text-center space-y-1">
      <p class="text-[10px] font-black text-outline uppercase tracking-widest">Guia JS — Informações do Sistema</p>
      <p class="text-xs text-on-surface-variant font-medium">Versão 0.27.2-alpha</p>
      <p class="text-[11px] text-outline font-medium">Desenvolvido para Excelência Técnica</p>
    </div>
  </div>
</template>
