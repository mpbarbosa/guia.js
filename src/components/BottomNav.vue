<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();

const tabs = [
  { name: 'home',      path: '/',          icon: 'bi-house',        activeIcon: 'bi-house-fill',        label: 'Início'   },
  { name: 'converter', path: '/converter', icon: 'bi-arrow-left-right', activeIcon: 'bi-arrow-left-right', label: 'Rotas'    },
  { name: 'map',       path: '/map',       icon: 'bi-map',          activeIcon: 'bi-map-fill',          label: 'Mapa'     },
  { name: 'stats',     path: '/stats',     icon: 'bi-bar-chart',    activeIcon: 'bi-bar-chart-fill',    label: 'Stats'    },
  { name: 'history',   path: '/history',   icon: 'bi-clock-history',activeIcon: 'bi-clock-history',     label: 'Histórico'},
] as const;
</script>

<template>
  <nav
    class="bg-white border-t border-outline-variant flex items-stretch shrink-0"
    role="navigation"
    aria-label="Navegação principal"
  >
    <a
      v-for="tab in tabs"
      :key="tab.name"
      :href="`#${tab.path}`"
      class="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium min-h-14 transition-all duration-300 no-underline"
      :class="route.path === tab.path
        ? 'bg-primary-container text-white'
        : 'text-on-surface-variant hover:text-on-surface'"
      :aria-current="route.path === tab.path ? 'page' : undefined"
      :aria-label="tab.label"
    >
      <i
        class="bi text-xl leading-none"
        :class="route.path === tab.path ? tab.activeIcon : tab.icon"
        aria-hidden="true"
      ></i>
      <span class="leading-tight">{{ tab.label }}</span>
    </a>
  </nav>
</template>
