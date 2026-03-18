<script setup lang="ts">
/**
 * ConverterView Vue Component
 *
 * Full Composition API port of the converter view from src/views/converter.js.
 * Converts latitude/longitude coordinates to a human-readable address using
 * the Nominatim reverse-geocoding API.
 *
 * @since 0.12.4-alpha
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
  <div class="converter-container">
    <header>
      <h1>Conversor de Latitude/Longitude para Endereço</h1>
      <p>
        <abbr
          title="Dados salvos localmente para acesso rápido"
          aria-label="Cache: dados salvos localmente"
        >Cache</abbr>:
        <span id="tam-cache" aria-live="polite">{{ cacheSize }}</span> itens
      </p>
    </header>

    <!-- Location highlight cards -->
    <section class="location-highlights" aria-label="Destaques de localização">
      <div class="highlight-card" role="region" aria-labelledby="municipio-label">
        <div id="municipio-label" class="highlight-card-label">Município</div>
        <div class="highlight-card-value" aria-live="polite">{{ municipioValue }}</div>
      </div>
      <div class="highlight-card" role="region" :aria-labelledby="'location-type-label'">
        <div id="location-type-label" class="highlight-card-label">{{ locationTypeLabel }}</div>
        <div class="highlight-card-value" aria-live="polite">{{ locationTypeValue }}</div>
      </div>
    </section>

    <div class="container">
      <form novalidate @submit.prevent="fetchAddress">
        <!-- Latitude -->
        <div class="input-group">
          <label for="latitude">Latitude:</label>
          <input
            id="latitude"
            v-model="latitude"
            type="number"
            name="latitude"
            required
            step="any"
            min="-90"
            max="90"
            placeholder="Digite a latitude (ex: -23.5505)"
            aria-describedby="latitude-example latitude-error"
            aria-required="true"
            :aria-invalid="latInvalid ? 'true' : 'false'"
            @blur="validateLatitude"
            @input="clearLatError"
          />
          <div id="latitude-example" class="example">
            Exemplo: -23.5505 (São Paulo). Válido: -90 a 90
          </div>
          <div
            id="latitude-error"
            class="error-message"
            role="alert"
            aria-live="polite"
            :hidden="!latError"
          >{{ latError }}</div>
        </div>

        <!-- Longitude -->
        <div class="input-group">
          <label for="longitude">Longitude:</label>
          <input
            id="longitude"
            v-model="longitude"
            type="number"
            name="longitude"
            required
            step="any"
            min="-180"
            max="180"
            placeholder="Digite a longitude (ex: -46.6333)"
            aria-describedby="longitude-example longitude-error"
            aria-required="true"
            :aria-invalid="lonInvalid ? 'true' : 'false'"
            @blur="validateLongitude"
            @input="clearLonError"
          />
          <div id="longitude-example" class="example">
            Exemplo: -46.6333 (São Paulo). Válido: -180 a 180
          </div>
          <div
            id="longitude-error"
            class="error-message"
            role="alert"
            aria-live="polite"
            :hidden="!lonError"
          >{{ lonError }}</div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          aria-label="Obter endereço a partir das coordenadas"
        >
          {{ loading ? 'Buscando...' : 'Obter Endereço' }}
        </button>
      </form>

      <!-- Results -->
      <section
        role="region"
        aria-live="polite"
        aria-label="Resultados da conversão"
      >
        <p v-if="loading" class="loading" role="status">Buscando endereço...</p>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div
          v-else-if="resultIsError"
          class="error"
          role="alert"
          v-html="resultHtml"
        />
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-else v-html="resultHtml" />
      </section>
    </div>
  </div>
</template>
