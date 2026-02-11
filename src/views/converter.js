/**
 * @fileoverview Converter View - Address and Coordinate Converter
 * Converts between geographic coordinates and human-readable addresses
 * 
 * This view provides a utility to convert latitude/longitude to addresses
 * and vice versa using geocoding services.
 * 
 * @module views/converter
 */

import { log, warn, error } from '../utils/logger.js';
import { escapeHtml } from '../utils/html-sanitizer.js';
import { extractDistrito, extractBairro, determineLocationType, formatLocationValue } from '../address-parser.js';

/**
 * Converter view configuration object
 * @type {Object}
 * @property {string} title - Page title for document.title
 * @property {Array<string>} styles - CSS files to load (empty - uses inline styles)
 * @property {Function} render - Returns HTML string for view content
 */
export default {
  title: 'Conversor de Coordenadas',
  
  styles: [],
  
  /**
   * Render converter view HTML
   * @returns {string} HTML string for converter view with Material Design 3 styling
   */
  render() {
    return `
      <style>
        /* Material Design 3 Color System */
        :root {
          --md-sys-color-primary: #1976d2;
          --md-sys-color-on-primary: #ffffff;
          --md-sys-color-secondary: #4caf50;
          --md-sys-color-on-secondary: #ffffff;
          --md-sys-color-surface: #ffffff;
          --md-sys-color-on-surface: #1c1b1f;
          --md-sys-color-surface-variant: #f9f9f9;
          --md-sys-color-error: #ba1a1a;
          --md-sys-elevation-level1: 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
          --md-sys-elevation-level2: 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15);
        }

        .converter-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .converter-container h1 {
          color: var(--md-sys-color-primary);
          text-align: center;
        }
        
        .container {
          background-color: var(--md-sys-color-surface-variant);
          border-radius: 12px;
          padding: 20px;
          box-shadow: var(--md-sys-elevation-level1);
        }
        
        .input-group {
          margin-bottom: 15px;
        }
        
        .input-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        .input-group input[type="number"] {
          width: 100%;
          min-height: 48px;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-sizing: border-box;
          font-size: 16px;
        }
        
        .input-group input[type="number"]:focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 2px;
        }
        
        .converter-container button {
          min-width: 48px;
          min-height: 48px;
          background-color: var(--md-sys-color-secondary);
          color: var(--md-sys-color-on-secondary);
          border: none;
          padding: 12px 24px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: background 0.2s, box-shadow 0.2s;
        }
        
        .converter-container button:hover {
          background-color: #45a049;
          box-shadow: var(--md-sys-elevation-level1);
        }
        
        .converter-container button:focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 2px;
        }
        
        #results {
          margin-top: 20px;
          padding: 16px;
          border-radius: 12px;
          background-color: var(--md-sys-color-surface);
          box-shadow: var(--md-sys-elevation-level1);
          min-height: 100px;
        }
        
        .error-message {
          color: var(--md-sys-color-error);
          font-size: 0.875rem;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .error-message::before {
          content: "⚠";
          font-size: 1em;
        }
        
        input:invalid,
        input[aria-invalid="true"] {
          border-color: var(--md-sys-color-error);
          border-width: 2px;
        }
        
        .example {
          font-size: 0.9em;
          color: #7f8c8d;
          margin-top: 5px;
        }
        
        .location-highlights {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin: 1.5rem 0;
        }
        
        @media (min-width: 600px) {
          .location-highlights {
            grid-template-columns: 2fr 1fr;
          }
        }

        .highlight-card {
          padding: 1rem;
          background: linear-gradient(135deg, var(--md-sys-color-primary) 0%, #1565c0 100%);
          color: var(--md-sys-color-on-primary);
          border-radius: 12px;
          box-shadow: var(--md-sys-elevation-level1);
          transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
          text-align: center;
        }

        .highlight-card:hover {
          box-shadow: 0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px 0 rgba(0, 0, 0, 0.3);
          transform: translateY(-2px);
        }

        .highlight-card:first-child {
          background: linear-gradient(135deg, var(--md-sys-color-primary) 0%, #1565c0 100%);
          box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15);
        }

        .highlight-card:last-child {
          background: linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%);
          opacity: 0.95;
        }

        .highlight-card-label {
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.9;
          margin-bottom: 0.5rem;
        }

        .highlight-card:first-child .highlight-card-label {
          font-size: 1rem;
          font-weight: 600;
        }

        .highlight-card-value {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.2;
        }

        .highlight-card:first-child .highlight-card-value {
          font-size: 1.75rem;
          font-weight: 700;
        }

        .highlight-card:last-child .highlight-card-value {
          font-size: 1.25rem;
        }
      </style>

      <div class="converter-container">
        <header>
          <h1>Conversor de Latitude/Longitude para Endereço</h1>
          <p>
            <abbr title="Dados salvos localmente para acesso rápido" aria-label="Cache: dados salvos localmente">Cache</abbr>: 
            <span id="tam-cache" aria-live="polite">0</span> itens
          </p>
        </header>

        <!-- Location Highlight Cards -->
        <section class="location-highlights" aria-label="Destaques de localização">
          <div class="highlight-card" role="region" aria-labelledby="municipio-label">
            <div id="municipio-label" class="highlight-card-label">Município</div>
            <div id="converter-municipio-value" class="highlight-card-value" aria-live="polite">—</div>
          </div>
          <div id="location-type-card" class="highlight-card" role="region" aria-labelledby="location-type-label">
            <div id="location-type-label" class="highlight-card-label">Bairro</div>
            <div id="converter-location-type-value" class="highlight-card-value" aria-live="polite">—</div>
          </div>
        </section>

        <div class="container">
          <form novalidate>
            <div class="input-group">
              <label for="latitude">Latitude:</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                required
                step="any"
                min="-90"
                max="90"
                placeholder="Digite a latitude (ex: -23.5505)"
                aria-describedby="latitude-example latitude-error"
                aria-required="true"
                aria-invalid="false"
              />
              <div id="latitude-example" class="example">Exemplo: -23.5505 (São Paulo). Válido: -90 a 90</div>
              <div id="latitude-error" class="error-message" role="alert" aria-live="polite" hidden></div>
            </div>

            <div class="input-group">
              <label for="longitude">Longitude:</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                required
                step="any"
                min="-180"
                max="180"
                placeholder="Digite a longitude (ex: -46.6333)"
                aria-describedby="longitude-example longitude-error"
                aria-required="true"
                aria-invalid="false"
              />
              <div id="longitude-example" class="example">Exemplo: -46.6333 (São Paulo). Válido: -180 a 180</div>
              <div id="longitude-error" class="error-message" role="alert" aria-live="polite" hidden></div>
            </div>

            <button id="fetchButton" type="submit" aria-label="Obter endereço a partir das coordenadas">Obter Endereço</button>
          </form>

          <section id="results" role="region" aria-live="polite" aria-label="Resultados da conversão">
            <p>
              Digite as coordenadas e clique em "Obter Endereço" para ver as informações de localização.
            </p>
          </section>
        </div>
      </div>
    `;
  },
  
  async mount(container) {
    log("(converter-view) Mounting converter view...");
    
    // Initialize the converter
    const form = container.querySelector('form');
    const latitudeInput = container.querySelector('#latitude');
    const longitudeInput = container.querySelector('#longitude');
    
    if (form && latitudeInput && longitudeInput) {
      this._initConverter(form, latitudeInput, longitudeInput);
    }
  },
  
  cleanup() {
    log("(converter-view) Cleaning up converter view...");
    // No specific cleanup needed for converter
  },
  
  _initConverter(form, latitudeInput, longitudeInput) {
    // Setup form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const latValid = this._validateInput(latitudeInput, "latitude");
      const lonValid = this._validateInput(longitudeInput, "longitude");
      
      if (latValid && lonValid) {
        this._fetchAddress(latitudeInput.value, longitudeInput.value);
      }
    });
    
    // Real-time validation
    latitudeInput.addEventListener("blur", () => this._validateInput(latitudeInput, "latitude"));
    longitudeInput.addEventListener("blur", () => this._validateInput(longitudeInput, "longitude"));
    
    // Clear errors on input
    latitudeInput.addEventListener("input", () => this._clearError(latitudeInput));
    longitudeInput.addEventListener("input", () => this._clearError(longitudeInput));
  },
  
  _validateInput(input, type) {
    const value = input.value.trim();
    const errorDiv = document.getElementById(`${type}-error`);
    
    if (!value) {
      this._showInputError(input, errorDiv, `Por favor, insira ${type === "latitude" ? "a latitude" : "a longitude"}.`);
      return false;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      this._showInputError(input, errorDiv, "Deve ser um número válido.");
      return false;
    }
    
    if (type === "latitude" && (numValue < -90 || numValue > 90)) {
      this._showInputError(input, errorDiv, "Latitude deve estar entre -90 e 90.");
      return false;
    }
    
    if (type === "longitude" && (numValue < -180 || numValue > 180)) {
      this._showInputError(input, errorDiv, "Longitude deve estar entre -180 e 180.");
      return false;
    }
    
    this._clearError(input);
    return true;
  },
  
  _showInputError(input, errorDiv, message) {
    input.setAttribute("aria-invalid", "true");
    errorDiv.textContent = message;
    errorDiv.hidden = false;
  },
  
  _clearError(input) {
    const type = input.id;
    const errorDiv = document.getElementById(`${type}-error`);
    input.setAttribute("aria-invalid", "false");
    if (errorDiv) {
      errorDiv.textContent = "";
      errorDiv.hidden = true;
    }
  },
  
  async _fetchAddress(latitude, longitude) {
    const results = document.getElementById("results");
    results.innerHTML = '<p class="loading" role="status">Buscando endereço...</p>';
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'GuiaTuristico/0.3.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Update highlight cards
      this._updateHighlightCards(data);
      
      // Display full results
      results.innerHTML = `
        <h3>Endereço Encontrado</h3>
        <p><strong>Endereço completo:</strong> ${escapeHtml(data.display_name)}</p>
        ${data.address ? this._formatAddress(data.address) : ''}
        <p class="map-link">
          <a href="https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=16" 
             target="_blank" 
             rel="noopener noreferrer"
             aria-label="Ver localização no OpenStreetMap">
            Ver no OpenStreetMap ↗
          </a>
        </p>
      `;
      
    } catch (err) {
      error("(converter-view) Error fetching address:", err);
      results.innerHTML = `
        <div class="error" role="alert">
          <p><strong>Erro ao buscar endereço</strong></p>
          <p>${escapeHtml(err.message)}</p>
        </div>
      `;
    }
  },
  
  _formatAddress(address) {
    const fields = [
      { key: 'road', label: 'Rua' },
      { key: 'house_number', label: 'Número' },
      { key: 'suburb', label: 'Bairro' },
      { key: 'city', label: 'Cidade' },
      { key: 'state', label: 'Estado' },
      { key: 'postcode', label: 'CEP' },
      { key: 'country', label: 'País' }
    ];
    
    let html = '<dl>';
    fields.forEach(({ key, label }) => {
      if (address[key]) {
        html += `<dt><strong>${label}:</strong></dt><dd>${address[key]}</dd>`;
      }
    });
    html += '</dl>';
    
    return html;
  },
  
  /**
   * Update highlight cards with municipality and location type
   * @param {Object} data - Nominatim response data
   * @private
   */
  _updateHighlightCards(data) {
    // Update municipality card
    const municipioValue = document.getElementById("municipio-value");
    if (municipioValue) {
      municipioValue.textContent = data.address?.city || data.address?.town || data.address?.village || '—';
    }
    
    // Update location type card (distrito or bairro)
    if (data) {
      this._updateLocationTypeCard(data);
    }
  },
  
  /**
   * Update location type card (Distrito or Bairro) dynamically
   * @param {Object} data - Nominatim response data
   * @private
   * 
   * Note: Uses address-parser.js module for consistent address parsing logic.
   * The module is imported as ES6 module and shared between views and tests.
   */
  _updateLocationTypeCard(data) {
    const address = data.address || data;
    
    // Determine location type
    const locationType = this._determineLocationType(address);
    
    // Update card label
    const label = locationType.type === 'distrito' ? 'Distrito' : 'Bairro';
    const labelElement = document.getElementById("location-type-label");
    if (labelElement) {
      labelElement.textContent = label;
    }
    
    // Update card value
    const value = this._formatLocationValue(locationType.value);
    const valueElement = document.getElementById("location-type-value");
    if (valueElement) {
      valueElement.textContent = value;
    }
    
    // Update ARIA label for accessibility
    const card = document.getElementById("location-type-card");
    if (card) {
      card.setAttribute('aria-labelledby', 'location-type-label');
    }
  },
  
  /**
   * Determine location type from address
   * @param {Object} address - Nominatim address object
   * @returns {{type: 'distrito'|'bairro', value: string|null}} Location type and value
   * @private
   */
  _determineLocationType(address) {
    return determineLocationType(address);
  },
  
  /**
   * Format location value for display
   * @param {string|null} value - Location value
   * @returns {string} Formatted value
   * @private
   */
  _formatLocationValue(value) {
    return formatLocationValue(value);
  }
};