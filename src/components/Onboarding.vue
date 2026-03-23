<script setup lang="ts">
/**
 * Onboarding Vue Component
 *
 * First-time user experience card for requesting location permission.
 * Declarative replacement for OnboardingManager class in onboarding.js.
 *
 * @since 0.12.7-alpha
 */

interface Props {
  visible?: boolean;
  /** If true, shows the error-recovery variant */
  hasError?: boolean;
  errorTitle?: string;
  errorHtml?: string;
}

interface Emits {
  (e: 'enable-location'): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  hasError: false,
  errorTitle: 'Permissão de Localização Negada',
  errorHtml: '',
});

const emit = defineEmits<Emits>();

const defaultTitle = 'Bem-vindo ao Guia Turístico';
const defaultDescription =
  'Permita o acesso à sua localização para obter informações sobre o município e bairro onde você está.';
</script>

<template>
  <div
    v-if="props.visible"
    class="onboarding-card"
    role="region"
    aria-labelledby="onboarding-title"
  >
    <div class="onboarding-content">
      <div class="onboarding-icon" aria-hidden="true">📍</div>

      <h2 id="onboarding-title" class="onboarding-title">
        {{ props.hasError ? props.errorTitle : defaultTitle }}
      </h2>

      <!-- Normal state -->
      <p v-if="!props.hasError" class="onboarding-description">
        {{ defaultDescription }}
      </p>

      <!-- Error state -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-else class="onboarding-description" v-html="props.errorHtml" />

      <button
        class="md3-button-filled onboarding-cta"
        type="button"
        :aria-label="props.hasError ? 'Tentar novamente' : 'Ativar localização'"
        @click="emit('enable-location')"
      >
        <span class="button-text">
          {{ props.hasError ? '🔄 Tentar Novamente' : '📍 Ativar Localização' }}
        </span>
      </button>
    </div>
  </div>
</template>
