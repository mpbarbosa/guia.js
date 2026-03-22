/**
 * IBGE Data Formatter
 * Transforms technical IBGE/SIDRA data into user-friendly, contextualized displays
 * 
 * @module utils/ibge-data-formatter
 * @since 0.11.0-alpha
 */

/**
 * IBGEDataFormatter
 * Formats population statistics and demographic data for human-readable display
 */
class IBGEDataFormatter {
  CITY_CLASSIFICATIONS: Record<string, { min: number; label: string; icon: string; description: string }> = {};
  static instance: IBGEDataFormatter | null;

  constructor() {
    if (IBGEDataFormatter.instance) {
      return IBGEDataFormatter.instance;
    }

    // City size classifications (based on Brazilian demographics)
    this.CITY_CLASSIFICATIONS = {
      METROPOLIS: { min: 1000000, label: 'Metrópole', icon: '🏙️', description: 'Grande Centro Urbano' },
      LARGE: { min: 500000, label: 'Cidade Grande', icon: '🌆', description: 'Centro Regional' },
      MEDIUM_LARGE: { min: 100000, label: 'Cidade Média-Grande', icon: '🏘️', description: 'Polo Regional' },
      MEDIUM: { min: 50000, label: 'Cidade Média', icon: '🏡', description: 'Centro Local' },
      SMALL_MEDIUM: { min: 20000, label: 'Cidade Pequena-Média', icon: '🏠', description: 'Município Médio' },
      SMALL: { min: 0, label: 'Cidade Pequena', icon: '🌾', description: 'Pequeno Município' }
    };

    IBGEDataFormatter.instance = this;
  }

  /**
   * Format population number with Brazilian locale
   * @param {number} population - Population count
   * @returns {string} Formatted population (e.g., "12.325.232")
   */
  formatPopulation(population: number): string {
    if (!population || isNaN(population)) {
      return 'N/A';
    }

    return population.toLocaleString('pt-BR');
  }

  /**
   * Format population in natural language
   * @param {number} population - Population count
   * @returns {string} Natural language description (e.g., "12.3 milhões")
   */
  formatPopulationNaturalLanguage(population: number): string {
    if (!population || isNaN(population)) {
      return 'População não disponível';
    }

    if (population >= 1000000) {
      const millions = (population / 1000000).toFixed(1);
      return `${millions} ${parseFloat(millions) === 1.0 ? 'milhão' : 'milhões'}`;
    } else if (population >= 1000) {
      const thousands = (population / 1000).toFixed(1);
      return `${thousands} mil`;
    } else {
      return population.toLocaleString('pt-BR');
    }
  }

  /**
   * Classify city size based on population
   * @param {number} population - Population count
   * @returns {Object} Classification object with label, icon, description
   */
  classifyCity(population: number): { min: number; label: string; icon: string; description: string } {
    for (const [_key, classification] of Object.entries(this.CITY_CLASSIFICATIONS)) {
      if (population >= classification.min) {
        return classification;
      }
    }
    return this.CITY_CLASSIFICATIONS.SMALL;
  }

  /**
   * Generate user-friendly IBGE data HTML
   * @param {Object} data - IBGE data object
   * @param {number} data.population - Population count
   * @param {string} data.municipio - Municipality name
   * @param {string} data.uf - State abbreviation
   * @param {string} [data.year] - Year of data (e.g., "2024")
   * @returns {string} Formatted HTML
   */
  generateFormattedHTML(data: { population?: number; municipio?: string; uf?: string; year?: string } | null): string {
    if (!data || !data.population) {
      return `
        <div class="ibge-data-formatted">
          <p class="ibge-no-data">
            <span class="icon" aria-hidden="true">📊</span>
            <span>Dados demográficos não disponíveis</span>
          </p>
        </div>
      `;
    }

    const population = data.population ?? 0;
    const classification = this.classifyCity(population);
    const formattedPop = this.formatPopulation(population);
    const naturalPop = this.formatPopulationNaturalLanguage(population);
    const year = data.year || '2024';

    return `
      <div class="ibge-data-formatted">
        <!-- Primary Display: Natural Language -->
        <div class="ibge-primary">
          <span class="ibge-icon" aria-hidden="true">👥</span>
          <span class="ibge-primary-text">
            <strong>População:</strong> ${naturalPop} de habitantes
          </span>
        </div>

        <!-- City Classification Badge -->
        <div class="ibge-classification">
          <span class="classification-icon" aria-hidden="true">${classification.icon}</span>
          <span class="classification-label">${classification.label}</span>
          <span class="classification-description">${classification.description}</span>
        </div>

        <!-- Detailed Information (Progressive Disclosure) -->
        <details class="ibge-details" closed>
          <summary class="ibge-summary">
            <span class="summary-icon" aria-hidden="true">📊</span>
            <span class="summary-text">Mais Informações</span>
          </summary>
          <div class="ibge-details-content">
            <div class="ibge-detail-row">
              <span class="detail-label">População Exata:</span>
              <span class="detail-value">${formattedPop} habitantes</span>
            </div>
            <div class="ibge-detail-row">
              <span class="detail-label">Município:</span>
              <span class="detail-value">${data.municipio || 'N/A'}</span>
            </div>
            <div class="ibge-detail-row">
              <span class="detail-label">Estado:</span>
              <span class="detail-value">${data.uf || 'N/A'}</span>
            </div>
            <div class="ibge-detail-row">
              <span class="detail-label">Ano de Referência:</span>
              <span class="detail-value">${year}</span>
            </div>
            <div class="ibge-detail-row">
              <span class="detail-label">Classificação:</span>
              <span class="detail-value">${classification.label} (${classification.description})</span>
            </div>
            <div class="ibge-source">
              <small>
                Fonte: 
                <a href="https://www.ibge.gov.br/" target="_blank" rel="noopener noreferrer">
                  IBGE - Instituto Brasileiro de Geografia e Estatística
                </a>
              </small>
            </div>
          </div>
        </details>
      </div>
    `;
  }

  /**
   * Parse technical IBGE output and extract population
   * Handles various formats from SIDRA library
   * @param {string} technicalOutput - Raw HTML/text from SIDRA
   * @returns {Object|null} Parsed data object or null
   */
  parseTechnicalOutput(technicalOutput: string | null): { population: number } | null {
    if (!technicalOutput) return null;

    // Try to extract population from common patterns
    // Pattern 1: "População: 12345678" or "População 12345678"
    let match = technicalOutput.match(/população[:\s]+(\d+[\.,]?\d*)/i);
    if (match) {
      const population = parseInt(match[1].replace(/[.,]/g, ''), 10);
      return { population };
    }

    // Pattern 2: Number followed by "habitantes"
    match = technicalOutput.match(/(\d+[\.,]?\d*)\s*habitantes/i);
    if (match) {
      const population = parseInt(match[1].replace(/[.,]/g, ''), 10);
      return { population };
    }

    // Pattern 3: Just a large number (likely population)
    match = technicalOutput.match(/\b(\d{4,})\b/);
    if (match) {
      const population = parseInt(match[1], 10);
      // Only accept if it's a reasonable population (1000 - 20 million)
      if (population >= 1000 && population <= 20000000) {
        return { population };
      }
    }

    return null;
  }

  /**
   * Intercept and enhance SIDRA display
   * Wraps the global displaySidraDadosParams function to format output
   * @param {HTMLElement} element - Target element
   * @param {string} dataType - Data type (e.g., 'PopEst')
   * @param {Object} params - Parameters (municipio, siglaUf)
   */
  async interceptAndFormat(element: HTMLElement, dataType: string, params: { municipio: string; siglaUf: string }): Promise<void> {
    if (!element) return;

    // Show loading state
    element.innerHTML = `
      <div class="ibge-data-formatted">
        <p class="ibge-loading">
          <span class="icon" aria-hidden="true">⏳</span>
          <span>Carregando dados do IBGE...</span>
        </p>
      </div>
    `;

    try {
      // Try to fetch population from local data first (libs/sidra/tab6579_municipios.json)
      const localData = await this._fetchLocalPopulationData(params.municipio, params.siglaUf);

      if (localData) {
        // Use local data
        const data = {
          population: localData.populacao,
          municipio: params.municipio,
          uf: params.siglaUf,
          year: localData.ano || '2024'
        };
        element.innerHTML = this.generateFormattedHTML(data);
      } else {
        // Fall back to original SIDRA library if available
        if (typeof window.displaySidraDadosParams === 'function') {
          // Create temporary element to capture output
          const tempDiv = document.createElement('div');
          window.displaySidraDadosParams(tempDiv, dataType, params);

          // Wait a bit for async SIDRA loading
          await new Promise(resolve => setTimeout(resolve, 500));

          // Try to parse the technical output
          const parsedData = this.parseTechnicalOutput(tempDiv.textContent || tempDiv.innerHTML);

          if (parsedData) {
            const data = {
              ...parsedData,
              municipio: params.municipio,
              uf: params.siglaUf
            };
            element.innerHTML = this.generateFormattedHTML(data);
          } else {
            // Show original output if parsing fails
            element.innerHTML = tempDiv.innerHTML;
          }
        } else {
          // No data source available
          element.innerHTML = `
            <div class="ibge-data-formatted">
              <p class="ibge-unavailable">
                <span class="icon" aria-hidden="true">⚠️</span>
                <span>Dados do IBGE não disponíveis</span>
              </p>
            </div>
          `;
        }
      }
    } catch (error) {
      console.error('Error formatting IBGE data:', error);
      element.innerHTML = `
        <div class="ibge-data-formatted">
          <p class="ibge-error">
            <span class="icon" aria-hidden="true">❌</span>
            <span>Erro ao carregar dados do IBGE</span>
          </p>
        </div>
      `;
    }
  }

  /**
   * Fetch population data from local JSON file
   * @param {string} municipio - Municipality name
   * @param {string} uf - State abbreviation
   * @returns {Promise<Object|null>} Population data or null
   * @private
   */
  async _fetchLocalPopulationData(municipio: string, uf: string): Promise<{ populacao: number; ano: string } | null> {
    try {
      // Try to fetch from local cached data
      // Note: The dist/libs/ folder must be deployed to production
      const response = await fetch('./libs/sidra/tab6579_municipios.json');
      if (!response.ok) return null;

      const data = await response.json();

      // JSON must be an array of {municipio, uf, populacao, ano} objects
      if (!Array.isArray(data)) return null;

      // Search for municipality (case-insensitive, normalized)
      const municipioNormalized = municipio.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      for (const entry of data) {
        const entryMunicipio = (entry.municipio || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const entryUF = (entry.uf || '').toUpperCase();

        if (entryMunicipio === municipioNormalized && entryUF === uf.toUpperCase()) {
          return {
            populacao: parseInt(entry.populacao, 10),
            ano: entry.ano || '2024'
          };
        }
      }

      return null;
    } catch (error) {
      console.warn('Could not fetch local population data:', error);
      return null;
    }
  }
}

// Export singleton instance
export default new IBGEDataFormatter();
