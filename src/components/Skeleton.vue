<script setup lang="ts">
/**
 * Skeleton Vue Component
 *
 * Declarative skeleton loading placeholder.
 * Mirrors createSkeleton() from Skeletons.js.
 *
 * @since 0.12.2-alpha
 */

type SkeletonType = 'text' | 'heading' | 'circle' | 'rect';

interface Props {
  type?: SkeletonType;
  width?: string;
  height?: string;
  lines?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  width: undefined,
  height: undefined,
  lines: 1,
});

const isMultiline = props.type === 'text' && props.lines > 1;
const lineWidths = isMultiline
  ? Array.from({ length: props.lines }, (_, i) => (i === props.lines - 1 ? '60%' : '100%'))
  : [];
</script>

<template>
  <div
    :class="['skeleton', `skeleton-${props.type}`, { 'skeleton-multiline': isMultiline }]"
    :style="{ width: props.width, height: props.height }"
    aria-busy="true"
    aria-label="Carregando conteúdo"
  >
    <div
      v-for="(w, i) in lineWidths"
      :key="i"
      class="skeleton-line"
      :style="{ width: w }"
    />
  </div>
</template>
