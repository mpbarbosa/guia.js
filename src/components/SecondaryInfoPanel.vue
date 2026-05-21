<script setup lang="ts">
defineOptions({ name: 'SecondaryInfoPanel' });
</script>

<template>
  <details id="secondary-info" class="secondary-info-collapse" open>
    <summary class="secondary-info-summary">
      <span class="summary-icon" aria-hidden="true">ℹ️</span>
      <span class="summary-text">Informações Adicionais</span>
      <span class="summary-arrow" aria-hidden="true">▼</span>
    </summary>

    <div class="secondary-info-content">
      <section id="standardized-address" aria-labelledby="address-heading">
        <h2 id="address-heading" class="sr-only">Endereço Padronizado</h2>
        <p><strong>Endereço:</strong> <span id="endereco-padronizado-display">Aguardando localização...</span></p>
      </section>

      <section id="coordinates" aria-labelledby="coordinates-heading">
        <h2 id="coordinates-heading" class="sr-only">Coordenadas</h2>
        <p><strong>Coordenadas:</strong> <span id="lat-long-display">Aguardando localização...</span></p>
        <p id="altitude-container" class="hidden"><strong>Altitude:</strong> <span id="altitude-display"></span></p>
      </section>

      <section id="reference-place" aria-labelledby="reference-place-heading">
        <h2 id="reference-place-heading" class="sr-only">Local de Referência</h2>
        <p><strong>Referências próximas:</strong> <span id="reference-place-display">Aguardando localização...</span></p>
      </section>

      <section class="section" aria-labelledby="location-info-heading">
        <h2 id="location-info-heading" class="sr-only">Dados IBGE</h2>
        <p><strong>Dados IBGE:</strong> <span id="dadosSidra">Aguardando localização...</span></p>
      </section>

      <section id="locationResult" aria-label="Resultado da localização"></section>

      <div id="map-section">
        <button
          id="map-toggle-btn"
          class="md3-button-outlined"
          aria-label="Mostrar mapa da localização atual"
          aria-expanded="false"
        >
          <span class="button-icon" aria-hidden="true">🗺️</span>
          <span class="button-text">Ver no Mapa</span>
        </button>
        <div
          id="maplibre-map"
          class="maplibre-map-container"
          aria-label="Mapa da localização atual"
          role="img"
          hidden
        ></div>
      </div>

      <div id="nearby-places-section">
        <button
          id="findRestaurantsBtn"
          class="md3-button-outlined"
          disabled
          aria-label="Buscar restaurantes próximos à localização atual"
        >
          <span class="button-icon" aria-hidden="true">🍽️</span>
          <span class="button-text">Lugares Próximos</span>
        </button>
        <ul id="nearby-places-panel" class="nearby-places-panel" aria-label="Lugares próximos" hidden>
          <li class="nearby-panel-heading" aria-hidden="true"></li>
          <li id="nearby-places-list"></li>
        </ul>
      </div>

      <div id="city-stats-section">
        <button
          id="cityStatsBtn"
          class="md3-button-outlined"
          disabled
          aria-label="Ver estatísticas da cidade atual"
        >
          <span class="button-icon" aria-hidden="true">📊</span>
          <span class="button-text">Estatísticas da Cidade</span>
        </button>
        <div id="city-stats-panel" class="city-stats-panel" aria-label="Estatísticas do município" hidden></div>
      </div>

      <div id="route-planner-section">
        <div class="route-planner-card">
          <h2>🧭 Planejar rota</h2>
          <p class="route-planner-helper">Deixe a origem em branco para usar sua localização atual.</p>

          <form id="route-planner-form" class="route-planner-form">
            <div class="route-planner-field">
              <label for="route-origin-input">Origem</label>
              <input
                id="route-origin-input"
                name="route-origin"
                type="text"
                autocomplete="street-address"
                placeholder="Ex.: Rua da Aurora, Recife - PE"
              />
              <p id="route-origin-current" class="route-planner-helper">
                Origem atual: aguardando localização...
              </p>
            </div>

            <div class="route-planner-field">
              <label for="route-destination-input">Destino</label>
              <input
                id="route-destination-input"
                name="route-destination"
                type="text"
                autocomplete="street-address"
                placeholder="Ex.: Marco Zero, Recife - PE"
                required
              />
            </div>

            <button
              id="planRouteBtn"
              type="submit"
              class="md3-button-outlined"
              disabled
              aria-label="Calcular rota até o destino informado"
            >
              <span class="button-icon" aria-hidden="true">🧭</span>
              <span class="button-text">Calcular rota</span>
            </button>
          </form>

          <div id="route-planner-panel" class="route-planner-panel" aria-live="polite" hidden></div>
        </div>
      </div>
    </div>
  </details>
</template>

<style>
/* Progressive disclosure for secondary info panel */
.secondary-info-collapse {
  margin: 24px 0;
  border: 1px solid var(--color-border-dark, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
}

.secondary-info-summary {
  padding: 16px 20px;
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, var(--color-surface-variant, #f9fafb) 0%, var(--color-border-light, #f3f4f6) 100%);
  transition: background 0.2s;
  user-select: none;
  font-weight: 600;
  color: var(--color-text-primary, #1f2937);
}

.secondary-info-summary::-webkit-details-marker {
  display: none;
}

.secondary-info-summary:hover {
  background: linear-gradient(135deg, var(--color-border-light, #f3f4f6) 0%, var(--color-border-dark, #e5e7eb) 100%);
}

.secondary-info-summary:focus {
  outline: 2px solid var(--color-primary, #2563eb);
  outline-offset: -2px;
}

.summary-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.summary-text {
  flex: 1;
  font-size: 1rem;
}

.summary-arrow {
  font-size: 0.875rem;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.secondary-info-collapse[open] .summary-arrow {
  transform: rotate(180deg);
}

.secondary-info-content {
  padding: 20px;
  border-top: 1px solid var(--color-border-dark, #e5e7eb);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .location-highlights {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #ffffff;
    padding: 16px;
    margin: 0 -24px 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .location-highlights .highlight-card {
    min-width: 0;
    flex: 1;
    padding: 16px 12px;
    max-width: none;
  }

  .highlight-card-label  { font-size: 0.75rem; }
  .highlight-card-value  { font-size: 1rem; min-height: 40px; }
  .metropolitan-region-value { font-size: 0.75rem; margin-top: 4px; margin-bottom: 8px; }

  .secondary-info-collapse { margin: 16px 0; }
  .secondary-info-content  { padding: 16px; }
  .secondary-info-content section { margin-bottom: 16px; }
  .secondary-info-content section:last-child { margin-bottom: 0; }
}

@media (min-width: 769px) {
  .secondary-info-summary { display: none; }
  .secondary-info-collapse { border: none; background: transparent; }
  .secondary-info-content  { padding: 0; border: none; }
}

@media (prefers-reduced-motion: reduce) {
  .summary-arrow,
  .secondary-info-content { animation: none; transition: none; }
}
</style>
