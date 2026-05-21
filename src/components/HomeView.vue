<script setup lang="ts">
/**
 * HomeView Vue Component
 *
 * Wraps HomeViewController using Vue 3 Composition API lifecycle hooks.
 * The controller handles all the heavy DOM coordination; this SFC manages
 * its lifecycle and exposes reactive tracking state.
 *
 * @since 0.12.12-alpha
 */
import { ref, onMounted, onUnmounted } from 'vue';
import HomeViewController from '../views/home.js';
import AppHeroHeader from './AppHeroHeader.vue';
import Onboarding from './Onboarding.vue';
import LocationHighlightCards from './LocationHighlightCards.vue';
import SecondaryInfoPanel from './SecondaryInfoPanel.vue';
import AdvancedControlsPanel from './AdvancedControlsPanel.vue';

interface Props {
  locationResult?: string;
}

const props = withDefaults(defineProps<Props>(), {
  locationResult: 'locationResult',
});

const isTracking = ref(false);
const isInitialized = ref(false);
const showOnboarding = ref(true);
const onboardingHasError = ref(false);
const onboardingErrorTitle = ref('Permissão de Localização Negada');
const onboardingErrorHtml = ref('');

let controller: InstanceType<typeof HomeViewController> | null = null;

function onTrackingStarted(): void {
  isTracking.value = true;
  showOnboarding.value = false;
  onboardingHasError.value = false;
}

function onTrackingStopped(): void {
  isTracking.value = false;
  showOnboarding.value = true;
}

function onGeoError(event: Event): void {
  const customEvent = event as CustomEvent<{ error?: GeolocationPositionError }>;
  const geoError = customEvent.detail?.error;
  showOnboarding.value = true;
  onboardingHasError.value = true;
  onboardingErrorTitle.value = _geoErrorTitle(geoError?.code);
  onboardingErrorHtml.value = _geoErrorHtml(geoError);
}

function _geoErrorTitle(code?: number): string {
  if (code === 2) return 'Localização Indisponível';
  if (code === 3) return 'Tempo Esgotado';
  return 'Permissão de Localização Negada';
}

function _geoErrorHtml(error?: GeolocationPositionError): string {
  if (!error) return '<p><strong>Você negou a permissão para acessar sua localização.</strong></p><p>Para usar o rastreamento automático, permita o acesso nas configurações do navegador.</p>';
  if (error.code === 1) {
    return `<p><strong>Você negou o acesso à sua localização.</strong></p>
<ul style="text-align:left;margin:16px 0;padding-left:24px">
  <li><strong>Chrome/Edge:</strong> clique em 🔒 na barra de endereço → Permissões → Localização → Permitir</li>
  <li><strong>Firefox:</strong> clique em 🔒 → Conexão segura → Mais informações → Permissões → Localização → Permitir</li>
  <li><strong>Safari:</strong> Safari → Configurações → Privacidade → Serviços de Localização → Ativar para este site</li>
</ul>`;
  }
  if (error.code === 2) return '<p><strong>Não foi possível determinar sua localização.</strong></p><p>Verifique se o GPS está ativado e tente em área aberta.</p>';
  if (error.code === 3) return '<p><strong>A busca pela sua localização demorou muito.</strong></p><p>Tente novamente.</p>';
  return '<p><strong>Erro ao acessar sua localização.</strong></p>';
}

onMounted(async () => {
  try {
    controller = await HomeViewController.create(document, {
      locationResult: props.locationResult,
    });
    isInitialized.value = true;
    isTracking.value = controller.isTracking();
    // Determine onboarding visibility from actual geo permission, not tracking state.
    // autoStartTracking sets tracking=true even before the user has granted permission,
    // so checking isTracking() alone would incorrectly hide the onboarding.
    if (navigator.permissions) {
      const perm = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      showOnboarding.value = perm.state !== 'granted';
      perm.addEventListener('change', () => {
        if (perm.state === 'granted') {
          showOnboarding.value = false;
        }
      });
    }

    document.addEventListener('homeview:tracking:started', onTrackingStarted);
    document.addEventListener('homeview:tracking:stopped', onTrackingStopped);
    document.addEventListener('geolocation:error', onGeoError);
  } catch (err) {
    console.error('[HomeView] Failed to initialize HomeViewController:', err);
  }
});

onUnmounted(() => {
  document.removeEventListener('homeview:tracking:started', onTrackingStarted);
  document.removeEventListener('homeview:tracking:stopped', onTrackingStopped);
  document.removeEventListener('geolocation:error', onGeoError);
  controller?.destroy();
  controller = null;
  isInitialized.value = false;
  isTracking.value = false;
});

function toggleTracking(): void {
  controller?.toggleTracking();
}

defineExpose({ isTracking, isInitialized, toggleTracking });
</script>

<template>
  <div class="p-6 space-y-6 flex flex-col min-h-full bg-surface">
    <AppHeroHeader />

    <Onboarding
      v-show="showOnboarding"
      :has-error="onboardingHasError"
      :error-title="onboardingErrorTitle"
      :error-html="onboardingErrorHtml"
    />

    <div id="geolocation-banner-container"></div>

    <LocationHighlightCards />

    <nav aria-label="Ações da página" class="secondary-actions"></nav>

    <SecondaryInfoPanel />

    <AdvancedControlsPanel />
  </div>
</template>
