<script setup lang="ts">
defineOptions({ name: 'AdvancedControlsPanel' });
</script>

<template>
  <label for="navigation-log" class="sr-only">Histórico de navegação</label>
  <output
    id="navigation-log"
    role="log"
    aria-live="polite"
    aria-atomic="false"
    class="navigation-log"
  ></output>
  <textarea id="bottom-scroll-textarea" class="hidden" aria-hidden="true"></textarea>
</template>

<style>
</style>
