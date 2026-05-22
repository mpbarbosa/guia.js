<script setup lang="ts">
/**
 * ConverterView Vue Component
 *
 * Full Composition API port of the converter view from src/views/converter.js.
 * Converts latitude/longitude coordinates to a human-readable address using
 * the Nominatim reverse-geocoding API.
 *
 * @since 0.12.12-alpha
 */
import { ref, computed } from 'vue';
import { escapeHtml } from '../utils/html-sanitizer.js';
import { determineLocationType, formatLocationValue } from '../address-parser.js';
import { env } from '../config/environment.js';

// ── Form state ────────────────────────────────────────────────────────────────
const latitude = ref<string>('');
const longitude = ref<string>('');
const latError = ref<string>('');
const lonError = ref<string>('');
const latInvalid = ref(false);
const lonInvalid = ref(false);

// ── Result state ──────────────────────────────────────────────────────────────
const loading = ref(false);
const resultHtml = ref<string>(
  'Digite as coordenadas e clique em "Obter Endereço" para ver as informações de localização.'
);
const resultIsError = ref(false);

// ── Highlight cards state ─────────────────────────────────────────────────────
const municipioValue = ref('—');
const locationTypeLabel = ref('Bairro');
const locationTypeValue = ref('—');
const cacheSize = ref(0);

// ── Validation ────────────────────────────────────────────────────────────────
function validateLatitude(): boolean {
  const v = latitude.value.trim();
  if (!v) {
    latError.value = 'Por favor, insira a latitude.';
    latInvalid.value = true;
    return false;
  }
  const n = parseFloat(v);
  if (isNaN(n)) {
    latError.value = 'Deve ser um número válido.';
    latInvalid.value = true;
    return false;
  }
  if (n < -90 || n > 90) {
    latError.value = 'Latitude deve estar entre -90 e 90.';
    latInvalid.value = true;
    return false;
  }
  latError.value = '';
  latInvalid.value = false;
  return true;
}

function validateLongitude(): boolean {
  const v = longitude.value.trim();
  if (!v) {
    lonError.value = 'Por favor, insira a longitude.';
    lonInvalid.value = true;
    return false;
  }
  const n = parseFloat(v);
  if (isNaN(n)) {
    lonError.value = 'Deve ser um número válido.';
    lonInvalid.value = true;
    return false;
  }
  if (n < -180 || n > 180) {
    lonError.value = 'Longitude deve estar entre -180 e 180.';
    lonInvalid.value = true;
    return false;
  }
  lonError.value = '';
  lonInvalid.value = false;
  return true;
}

function clearLatError(): void { latError.value = ''; latInvalid.value = false; }
function clearLonError(): void { lonError.value = ''; lonInvalid.value = false; }

// ── Nominatim fetch ───────────────────────────────────────────────────────────
interface NominatimAddress {
  road?: string;
  house_number?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  postcode?: string;
  country?: string;
  [key: string]: string | undefined;
}

interface NominatimResult {
  display_name: string;
  address?: NominatimAddress;
  error?: string;
}

function formatAddress(address: NominatimAddress): string {
  const fields: { key: keyof NominatimAddress; label: string }[] = [
    { key: 'road', label: 'Rua' },
    { key: 'house_number', label: 'Número' },
    { key: 'suburb', label: 'Bairro' },
    { key: 'city', label: 'Cidade' },
    { key: 'state', label: 'Estado' },
    { key: 'postcode', label: 'CEP' },
    { key: 'country', label: 'País' },
  ];
  let html = '<dl>';
  for (const { key, label } of fields) {
    if (address[key]) html += `<dt><strong>${label}:</strong></dt><dd>${address[key]}</dd>`;
  }
  return html + '</dl>';
}

function updateHighlightCards(data: NominatimResult): void {
  const addr = data.address || ({} as NominatimAddress);
  municipioValue.value = addr.city || addr.town || addr.village || '—';

  const locationType = determineLocationType(addr);
  locationTypeLabel.value = locationType.type === 'distrito' ? 'Distrito' : 'Bairro';
  locationTypeValue.value = formatLocationValue(locationType.value);
}

async function fetchAddress(): Promise<void> {
  const latOk = validateLatitude();
  const lonOk = validateLongitude();
  if (!latOk || !lonOk) return;

  loading.value = true;
  resultIsError.value = false;
  resultHtml.value = '';

  const lat = latitude.value.trim();
  const lon = longitude.value.trim();

  try {
    const res = await fetch(
      `${env.nominatimApiUrl}/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      { headers: { 'User-Agent': env.nominatimUserAgent } },
    );
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data: NominatimResult = await res.json();
    if (data.error) throw new Error(data.error);

    updateHighlightCards(data);

    resultHtml.value = `
      <h3>Endereço Encontrado</h3>
      <p><strong>Endereço completo:</strong> ${escapeHtml(data.display_name)}</p>
      ${data.address ? formatAddress(data.address) : ''}
      <p class="map-link">
        <a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=16"
           target="_blank" rel="noopener noreferrer"
           aria-label="Ver localização no OpenStreetMap">
          Ver no OpenStreetMap ↗
        </a>
      </p>
    `;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    resultIsError.value = true;
    resultHtml.value = `<p><strong>Erro ao buscar endereço</strong></p><p>${escapeHtml(message)}</p>`;
  } finally {
    loading.value = false;
  }
}

/** Expose for parent components and tests */
defineExpose({
  latitude, longitude, latError, lonError, latInvalid, lonInvalid,
  loading, resultHtml, resultIsError,
  municipioValue, locationTypeLabel, locationTypeValue, cacheSize,
  validateLatitude, validateLongitude, fetchAddress,
});
</script>

<template>
  <div class="min-h-full bg-surface-variant/30 relative">
    <!-- Map-style header -->
    <div class="h-48 bg-surface-variant overflow-hidden relative shrink-0">
      <img
        src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=600&auto=format&fit=crop"
        alt="Mapa"
        class="w-full h-full object-cover grayscale opacity-50"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-transparent to-surface"></div>
    </div>

    <!-- Bottom sheet -->
    <div class="bg-white rounded-3xl -mt-10 p-8 space-y-8 min-h-[calc(100%-8rem)] shadow-sm border border-outline-variant">
      <div class="w-12 h-1.5 bg-outline-variant rounded-full mx-auto"></div>

      <header>
        <h2 class="text-3xl font-bold text-indigo-950 tracking-tight">Conversor de Rotas</h2>
        <p class="text-on-surface-variant font-medium mt-1">Converta coordenadas em endereços reais.</p>
      </header>

      <!-- Result highlight cards -->
      <div v-if="municipioValue !== '—'" class="grid grid-cols-2 gap-3">
        <div class="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm">
          <span class="text-[10px] font-black text-outline uppercase tracking-widest">Município</span>
          <p class="text-base font-bold text-indigo-950 mt-1" aria-live="polite">{{ municipioValue }}</p>
        </div>
        <div class="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm">
          <span class="text-[10px] font-black text-outline uppercase tracking-widest">{{ locationTypeLabel }}</span>
          <p class="text-base font-bold text-indigo-950 mt-1" aria-live="polite">{{ locationTypeValue }}</p>
        </div>
      </div>

      <!-- Coordinate form -->
      <form novalidate class="space-y-4" @submit.prevent="fetchAddress">
        <!-- Latitude -->
        <div class="relative">
          <div class="absolute left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-outline shrink-0"></div>
          <input
            id="latitude"
            v-model="latitude"
            type="number"
            name="latitude"
            required
            step="any"
            min="-90"
            max="90"
            placeholder="Latitude (ex: -23.5505)"
            class="w-full pl-14 pr-6 py-5 bg-surface border rounded-2xl font-bold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
            :class="latInvalid ? 'border-error' : 'border-outline-variant'"
            aria-describedby="latitude-error"
            aria-required="true"
            :aria-invalid="latInvalid ? 'true' : 'false'"
            @blur="validateLatitude"
            @input="clearLatError"
          />
          <div
            v-if="latError"
            id="latitude-error"
            class="mt-1 px-4 text-xs text-error font-medium"
            role="alert"
            aria-live="polite"
          >{{ latError }}</div>
        </div>

        <!-- Longitude -->
        <div class="relative">
          <div class="absolute left-6 top-1/2 -translate-y-1/2 shrink-0">
            <i class="bi bi-geo-alt-fill text-primary text-lg leading-none" aria-hidden="true"></i>
          </div>
          <input
            id="longitude"
            v-model="longitude"
            type="number"
            name="longitude"
            required
            step="any"
            min="-180"
            max="180"
            placeholder="Longitude (ex: -46.6333)"
            class="w-full pl-14 pr-6 py-5 bg-surface border rounded-2xl font-bold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
            :class="lonInvalid ? 'border-error' : 'border-outline-variant'"
            aria-describedby="longitude-error"
            aria-required="true"
            :aria-invalid="lonInvalid ? 'true' : 'false'"
            @blur="validateLongitude"
            @input="clearLonError"
          />
          <div
            v-if="lonError"
            id="longitude-error"
            class="mt-1 px-4 text-xs text-error font-medium"
            role="alert"
            aria-live="polite"
          >{{ lonError }}</div>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary text-white py-4 rounded-2xl font-bold text-xl shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Obter endereço a partir das coordenadas"
        >
          <span v-if="loading" class="flex items-center gap-3">
            <i class="bi bi-arrow-repeat animate-spin text-xl" aria-hidden="true"></i>
            Buscando...
          </span>
          <span v-else class="flex items-center gap-3">
            Obter Endereço
            <i class="bi bi-geo-fill text-xl" aria-hidden="true"></i>
          </span>
        </button>
      </form>

      <!-- Results card -->
      <div
        v-if="resultHtml || loading"
        class="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm space-y-3"
        role="region"
        aria-live="polite"
        aria-label="Resultados da conversão"
      >
        <div v-if="loading" class="flex items-center gap-2 text-primary">
          <i class="bi bi-arrow-repeat animate-spin text-lg" aria-hidden="true"></i>
          <span class="text-xs font-black uppercase tracking-widest">Buscando endereço...</span>
        </div>
        <template v-else>
          <div class="flex items-center gap-2" :class="resultIsError ? 'text-error' : 'text-primary'">
            <i class="bi text-lg" :class="resultIsError ? 'bi-exclamation-circle' : 'bi-pin-map'" aria-hidden="true"></i>
            <span class="text-xs font-black uppercase tracking-widest">{{ resultIsError ? 'Erro' : 'Resultado' }}</span>
          </div>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="text-sm text-on-surface-variant leading-relaxed font-medium result-content" v-html="resultHtml" />
          <div v-if="!resultIsError" class="pt-2">
            <span class="bg-indigo-200 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Encontrado</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
