/**
 * Route configuration for the Guia Turístico SPA.
 * 
 * Centralizes all route definitions, handlers, and view content to separate
 * routing configuration from application logic. This improves maintainability
 * and makes it easier to add new routes.
 * 
 * @module config/routes
 * @since 0.11.0-alpha
 * @author Marcelo Pereira Barbosa
 */

/**
 * Route configuration object.
 * Maps route paths to their metadata and handlers.
 */
export const routes = {
  '/': {
    name: 'home',
    title: 'Início',
    requiresInit: true,
    loadingEnabled: false // Home view is already in DOM
  },
  '/converter': {
    name: 'converter',
    title: 'Conversor de Endereços',
    requiresInit: true,
    loadingEnabled: true
  }
};

/**
 * Get route configuration by path.
 * 
 * @param {string} path - Route path
 * @returns {Object|null} Route configuration or null if not found
 */
export function getRoute(path: string): object | null {
  return routes[path] || null;
}

/**
 * Check if a route exists.
 * 
 * @param {string} path - Route path
 * @returns {boolean} True if route exists
 */
export function hasRoute(path: string): boolean {
  return path in routes;
}

/**
 * Get all route paths.
 * 
 * @returns {string[]} Array of route paths
 */
export function getRoutePaths(): string[] {
  return Object.keys(routes);
}

/**
 * Converter view HTML template.
 * 
 * @returns {string} HTML string for converter view
 */
export function getConverterViewTemplate(): string {
  return `
    <div class="container">
      <header>
        <h1>Conversor de Endereços</h1>
        <p>Converta coordenadas em endereços e vice-versa</p>
      </header>
      
      <section class="converter-section">
        <div class="md3-card">
          <h2>Coordenadas → Endereço</h2>
          <form id="coords-to-address-form">
            <div style="margin-bottom: 1rem;">
              <label for="latitude">Latitude:</label>
              <input 
                type="number" 
                id="latitude" 
                step="any" 
                placeholder="-23.550520"
                style="width: 100%; padding: 8px; margin-top: 4px;"
                required
              />
            </div>
            <div style="margin-bottom: 1rem;">
              <label for="longitude">Longitude:</label>
              <input 
                type="number" 
                id="longitude" 
                step="any" 
                placeholder="-46.633309"
                style="width: 100%; padding: 8px; margin-top: 4px;"
                required
              />
            </div>
            <button type="submit" class="md3-button-filled">
              Converter para Endereço
            </button>
          </form>
          
          <div id="address-result" style="margin-top: 1rem;" aria-live="polite">
            <!-- Results will appear here -->
          </div>
        </div>
      </section>
    </div>
  `;
}

/**
 * 404 Not Found view HTML template.
 * 
 * @returns {string} HTML string for 404 view
 */
export function getNotFoundViewTemplate(): string {
  return `
    <div class="container text-center">
      <h1 style="font-size: 4rem; margin: 2rem 0;">404</h1>
      <h2>Página Não Encontrada</h2>
      <p>A página que você está procurando não existe.</p>
      <button class="md3-button-filled" onclick="window.location.hash='#/'">
        Voltar ao Início
      </button>
    </div>
  `;
}

/**
 * Loading state HTML template.
 * 
 * @returns {string} HTML string for loading state
 */
export function getLoadingTemplate(): string {
  return `
    <div class="route-loading" role="status" aria-live="polite">
      <div class="loading-spinner" aria-hidden="true">⏳</div>
      <p>Carregando página...</p>
    </div>
  `;
}

/**
 * Error state HTML template.
 * 
 * @param {Error} error - Error object to display
 * @returns {string} HTML string for error state
 */
export function getErrorTemplate(error: Error): string {
  return `
    <div class="route-error" role="alert">
      <h2>Erro ao Carregar Página</h2>
      <p>Ocorreu um erro ao carregar o conteúdo desta página.</p>
      <details>
        <summary>Detalhes do Erro</summary>
        <pre>${error.message}\n${error.stack || ''}</pre>
      </details>
      <div>
        <button class="md3-button-filled" onclick="location.reload()">
          Recarregar Página
        </button>
        <button class="md3-button-outlined" onclick="window.location.hash='#/'">
          Voltar ao Início
        </button>
      </div>
    </div>
  `;
}
