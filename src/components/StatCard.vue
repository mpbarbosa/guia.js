<script setup lang="ts">
defineOptions({ name: 'StatCard' });

defineProps<{
  icon: string;
  category: string;
  title: string;
  loading?: boolean;
  footnote?: string;
}>();
</script>

<template>
  <div class="bg-white border border-outline-variant p-6 rounded-3xl shadow-sm">
    <!-- Header row: category icon + label + optional badge -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-indigo-50 text-primary rounded-xl">
          <i :class="['bi', icon, 'text-xl leading-none']" aria-hidden="true"></i>
        </div>
        <span class="text-xs font-black uppercase tracking-widest text-outline">{{ category }}</span>
      </div>
      <slot name="badge" />
    </div>

    <h4 class="text-2xl font-bold text-indigo-950">{{ title }}</h4>

    <!-- Loading skeleton -->
    <div v-if="loading" class="mt-2 space-y-2">
      <div class="h-9 w-40 bg-surface-variant rounded-xl animate-pulse"></div>
      <div class="h-5 w-52 bg-surface-variant rounded-xl animate-pulse"></div>
    </div>

    <!-- Value slot (rendered only when not loading) -->
    <div v-else class="mt-2">
      <slot name="value" />
    </div>

    <!-- Optional chart slot -->
    <slot name="chart" />

    <p
      v-if="footnote"
      data-testid="statcard-footnote"
      class="text-[11px] text-outline mt-4 font-medium leading-relaxed"
    >
      {{ footnote }}
    </p>
  </div>
</template>
