<script setup lang="ts">
defineOptions({ name: 'ToggleSwitch' });

defineProps<{ modelValue: boolean }>();
defineEmits<{ 'update:modelValue': [value: boolean] }>();
</script>

<template>
  <button
    type="button"
    class="w-12 h-6 rounded-full p-1 transition-colors shrink-0"
    :class="modelValue ? 'bg-primary' : 'bg-outline-variant'"
    :aria-pressed="modelValue"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <div
      class="w-4 h-4 bg-white rounded-full transition-transform"
      :class="modelValue ? 'translate-x-6' : 'translate-x-0'"
    ></div>
  </button>
</template>
