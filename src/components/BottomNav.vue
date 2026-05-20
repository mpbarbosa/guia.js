<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();

const tabs = [
  { name: 'home',      path: '/',          icon: 'bi-house',         activeIcon: 'bi-house-fill',        label: 'Início'   },
  { name: 'converter', path: '/converter', icon: 'bi-arrow-left-right', activeIcon: 'bi-arrow-left-right', label: 'Rotas'    },
  { name: 'map',       path: '/map',       icon: 'bi-map',           activeIcon: 'bi-map-fill',          label: 'Mapa'     },
  { name: 'stats',     path: '/stats',     icon: 'bi-bar-chart',     activeIcon: 'bi-bar-chart-fill',    label: 'Stats'    },
  { name: 'history',   path: '/history',   icon: 'bi-clock-history', activeIcon: 'bi-clock-history',     label: 'Histórico'},
] as const;
</script>

<template>
  <nav
    class="bg-white border-t border-outline-variant px-4 py-3 flex items-center justify-around shrink-0"
    role="navigation"
    aria-label="Navegação principal"
  >
    <a
      v-for="tab in tabs"
      :key="tab.name"
      :href="`#${tab.path}`"
      class="flex flex-col items-center gap-1.5 transition-all duration-300 relative px-3 py-1.5 rounded-2xl no-underline"
      :class="route.path === tab.path ? 'bg-primary/5' : ''"
      :aria-current="route.path === tab.path ? 'page' : undefined"
      :aria-label="tab.label"
    >
      <!-- Active indicator dot -->
      <span
        v-if="route.path === tab.path"
        class="absolute -top-1 w-1.5 h-1.5 bg-primary rounded-full"
        aria-hidden="true"
      />
      <!-- Icon wrapper -->
      <div
        class="p-1.5 rounded-xl transition-all duration-300"
        :class="route.path === tab.path
          ? 'bg-primary-container text-white'
          : 'text-on-surface-variant'"
      >
        <i
          class="bi text-xl leading-none block"
          :class="route.path === tab.path ? tab.activeIcon : tab.icon"
          aria-hidden="true"
        ></i>
      </div>
      <!-- Label -->
      <span
        class="text-[11px] font-bold tracking-wide uppercase leading-tight"
        :class="route.path === tab.path
          ? 'text-primary'
          : 'text-on-surface-variant opacity-60'"
      >{{ tab.label }}</span>
    </a>
  </nav>
</template>
