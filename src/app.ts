'use strict';

/**
 * Main Application Entry Point
 * SPA Router and Application Initialization
 * @version 0.17.0-alpha
 */

import HomeViewController from './views/home.js';
import HTMLHeaderDisplayer from './html/HTMLHeaderDisplayer.js';
import { log, warn, error } from './utils/logger.js';
import { VERSION_STRING } from './config/version.js';
import { env } from './config/environment.js';
import {
  getConverterViewTemplate,
  getNotFoundViewTemplate,
  getLoadingTemplate,
  getErrorTemplate,
} from './config/routes.js';
import { createDefaultErrorBoundary, setupGlobalErrorHandler } from './utils/ErrorBoundary.js';
import { showErrorToast } from './utils/error-notifications.js';
import { findNearby } from './services/OverpassService.js';
import { fetchStats } from './services/IBGECityStatsService.js';
import HTMLNearbyPlacesPanel from './html/HTMLNearbyPlacesPanel.js';
import HTMLCityStatsPanel from './html/HTMLCityStatsPanel.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './bootstrap-overrides.css';
import { Collapse } from 'bootstrap';

interface AppStateType {
  currentRoute: string | null;
  homeController: InstanceType<typeof HomeViewController> | null;
  errorBoundaries: Record<string, ReturnType<typeof createDefaultErrorBoundary>>;
}

const AppState: AppStateType = {
  currentRoute: null,
  homeController: null,
  errorBoundaries: {},
};

/**
 * Initialize the Guia Turístico single-page application.
 */
async function init(): Promise<void> {
  console.log('[GT] init() called');
  log(`Initializing ${VERSION_STRING}...`);

  setupGlobalErrorHandler((err: Error) => {
    showErrorToast('Erro Inesperado', err.message || 'Ocorreu um erro na aplicação');
  });

  const appLoading = document.getElementById('app-loading');
  console.log('[GT] app-loading element:', appLoading ? 'found' : 'NOT found');
  if (appLoading) {
    appLoading.classList.add('hidden');
    setTimeout(() => appLoading.remove(), 300);
  }

  console.log('[GT] window.dependenciesLoading:', window.dependenciesLoading, '| IbiraAPIFetchManager:', typeof window.IbiraAPIFetchManager);
  if (window.dependenciesLoading) {
    log('⏳ Waiting for dependencies to load...');
    try {
      await Promise.race([
        new Promise<void>(resolve =>
          window.addEventListener('dependencies-ready', () => resolve(), { once: true })
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Dependency timeout')), 5000)
        ),
      ]);
      log('✓ Dependencies ready');
    } catch (err) {
      warn('⚠️ Dependency loading timeout - continuing with fallback:', (err as Error).message);
    }
  }

  console.log('[GT] calling initRouter/initNavigation/handleRoute');
  initRouter();
  initNavigation();

  HTMLHeaderDisplayer.create(document);

  handleRoute();

  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('popstate', handleRoute);

  console.log('[GT] init() complete');
  log('✓ Application initialized successfully');
}

function initRouter(): void {
  document.addEventListener('click', (event: MouseEvent) => {
    const link = (event.target as Element).closest('a[href^="#"]');
    if (link) {
      event.preventDefault();
      const href = link.getAttribute('href');
      if (href) navigateTo(href);
    }
  });
}

function initNavigation(): void {
  updateActiveNavLink();
}

async function handleRoute(): Promise<void> {
  const hash = window.location.hash || '#/';
  const route = hash.substring(1);

  console.log('[GT] handleRoute() called, route:', route);
  log('Routing to:', route);

  updateActiveNavLink();

  try {
    if (route === '/' || route === '') {
      await initializeHomeView();
    } else {
      showLoading();
      if (route === '/converter') {
        await loadConverterView();
      } else {
        await loadNotFoundView();
      }
    }

    AppState.currentRoute = route;
    manageFocusAfterRouteChange();
  } catch (err) {
    error('Route loading error:', err);
    showError(err instanceof Error ? err : new Error(String(err)));
  }
}

function manageFocusAfterRouteChange(): void {
  requestAnimationFrame(() => {
    const mainContent = document.getElementById('app-content');
    if (!mainContent) {
      warn('Main content element not found for focus management');
      return;
    }

    const heading = mainContent.querySelector('h1') as HTMLElement | null;
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
      heading.setAttribute('aria-live', 'polite');
      setTimeout(() => heading.removeAttribute('aria-live'), 1000);
      log('Focus moved to h1 heading:', heading.textContent);
    } else {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      log('Focus moved to main content (no h1 heading found)');
    }
  });
}

function navigateTo(path: string): void {
  window.location.hash = path;
}

function updateActiveNavLink(): void {
  const hash = window.location.hash || '#/';

  document.querySelectorAll('.app-navigation a, .app-footer a, .navbar-nav .nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === hash) {
      link.setAttribute('aria-current', 'page');
      link.classList.add('active');
    } else {
      link.removeAttribute('aria-current');
      link.classList.remove('active');
    }
  });

  // Close the mobile hamburger menu after navigation
  const navCollapse = document.getElementById('main-nav');
  if (navCollapse && navCollapse.classList.contains('show')) {
    Collapse.getInstance(navCollapse)?.hide();
  }
}

function showLoading(): void {
  const content = document.getElementById('app-content');
  if (content) content.innerHTML = getLoadingTemplate();
}

function showError(err: Error): void {
  const content = document.getElementById('app-content');
  if (content) content.innerHTML = getErrorTemplate(err);
}

async function initializeHomeView(): Promise<void> {
  console.log('[GT] initializeHomeView() called, homeController exists:', !!AppState.homeController);

  if (!AppState.homeController) {
    if (!AppState.errorBoundaries.home) {
      AppState.errorBoundaries.home = createDefaultErrorBoundary('Home View');
    }

    const boundary = AppState.errorBoundaries.home;
    const container = document.getElementById('app-content');
    console.log('[GT] app-content container:', container ? 'found' : 'NOT found');

    const safeInit = boundary.wrap(async () => {
      console.log('[GT] creating HomeViewController...');
      AppState.homeController = new HomeViewController(document, {
        locationResult: 'locationResult',
        elementIds: {
          positionDisplay: 'lat-long-display',
          referencePlaceDisplay: 'reference-place-display',
          enderecoPadronizadoDisplay: 'endereco-padronizado-display',
          speechSynthesis: {
            languageSelectId: 'language',
            voiceSelectId: 'voice-select',
            textInputId: 'text-input',
            speakBtnId: 'speak-btn',
            pauseBtnId: 'pause-btn',
            resumeBtnId: 'resume-btn',
            stopBtnId: 'stop-btn',
            rateInputId: 'rate',
            rateValueId: 'rate-value',
            pitchInputId: 'pitch',
            pitchValueId: 'pitch-value',
          },
          sidraDisplay: 'dadosSidra',
        },
        autoStartTracking: true,
      });

      console.log('[GT] HomeViewController created, calling init()...');
      await AppState.homeController!.init();
      console.log('[GT] HomeViewController.init() resolved');
      log('Home view initialized successfully');
    }, container ?? undefined);

    try {
      await safeInit();
    } catch (err) {
      console.error('[GT] Error initializing home view:', err);
      error('Error initializing home view:', err);
      showErrorToast('Erro', 'Falha ao inicializar página inicial');
    }
  }
}

async function loadConverterView(): Promise<void> {
  const content = document.getElementById('app-content');
  if (content) {
    content.innerHTML = getConverterViewTemplate();
    initializeConverterFeatures();
  }
}

function initializeConverterFeatures(): void {
  const form = document.getElementById('coords-to-address-form');
  const resultDiv = document.getElementById('address-result');

  if (form && resultDiv) {
    form.addEventListener('submit', async (event: Event) => {
      event.preventDefault();

      const latInput = document.getElementById('latitude') as HTMLInputElement | null;
      const lonInput = document.getElementById('longitude') as HTMLInputElement | null;
      const lat = parseFloat(latInput?.value ?? '');
      const lon = parseFloat(lonInput?.value ?? '');

      resultDiv.innerHTML = '<p class="loading">⏳ Convertendo coordenadas...</p>';

      try {
        const response = await fetch(
          `${env.nominatimApiUrl}/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
        );

        if (!response.ok) throw new Error('Erro ao buscar endereço');

        const data = await response.json() as {
          display_name: string;
          address?: Record<string, string>;
        };

        resultDiv.innerHTML = `
          <div class="md3-card-elevated">
            <h3>✅ Endereço Encontrado</h3>
            <p><strong>Endereço:</strong> ${data.display_name}</p>
            ${data.address ? `
              <hr class="section-divider" />
              <p><strong>Detalhes:</strong></p>
              <ul style="text-align: left;">
                ${data.address.road ? `<li>Rua: ${data.address.road}</li>` : ''}
                ${data.address.suburb ? `<li>Bairro: ${data.address.suburb}</li>` : ''}
                ${data.address.city || data.address.town || data.address.village
                  ? `<li>Cidade: ${data.address.city || data.address.town || data.address.village}</li>`
                  : ''}
                ${data.address.state ? `<li>Estado: ${data.address.state}</li>` : ''}
                ${data.address.postcode ? `<li>CEP: ${data.address.postcode}</li>` : ''}
              </ul>
            ` : ''}
          </div>
        `;
      } catch (err) {
        error('Conversion error:', err);
        resultDiv.innerHTML = `
          <div class="md3-card text-error">
            <h3>❌ Erro na Conversão</h3>
            <p>${(err as Error).message}</p>
          </div>
        `;
      }
    });
  }
}

async function loadNotFoundView(): Promise<void> {
  const content = document.getElementById('app-content');
  if (content) content.innerHTML = getNotFoundViewTemplate();
}

// Initialize app when DOM is ready (browser-only)
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
} else {
  log('Running in Node.js - skipping browser initialization');
}

if (typeof window !== 'undefined') {
  window.GuiaApp = {
    navigateTo,
    getState: () => AppState,
    switchProvider: (provider: string) => {
      const manager = (AppState as unknown as { homeViewController?: { manager?: { switchProvider?(p: string): boolean } } }).homeViewController?.manager;
      if (!manager?.switchProvider) return false;
      return manager.switchProvider(provider);
    },
  };

  window.addEventListener('geocoder-provider-used', (event: Event) => {
    const indicator = document.getElementById('lbs-provider-indicator');
    const nameEl = document.getElementById('lbs-provider-name');
    if (!indicator || !nameEl) return;

    const { provider } = (event as CustomEvent<{ provider: string }>).detail;
    indicator.dataset.provider = provider;
    nameEl.textContent = provider === 'aws' ? 'AWS Location Service' : 'OpenStreetMap Nominatim';
  });

  window.addEventListener('geocoder-provider-used', () => {
    const btn = document.getElementById('provider-switch-btn');
    if (!btn) return;
    const manager = (AppState as unknown as { homeViewController?: { manager?: { reverseGeocoder?: { hasAwsProvider(): boolean } } } }).homeViewController?.manager;
    if (manager?.reverseGeocoder?.hasAwsProvider()) btn.hidden = false;
  });

  document.addEventListener('click', (e: MouseEvent) => {
    if ((e.target as Element)?.id !== 'provider-switch-btn') return;
    const manager = (AppState as unknown as { homeViewController?: { manager?: { getPrimaryProvider?(): string; switchProvider?(p: string): boolean } } }).homeViewController?.manager;
    if (!manager?.getPrimaryProvider || !manager?.switchProvider) return;
    const current = manager.getPrimaryProvider();
    const next = current === 'aws' ? 'nominatim' : 'aws';
    manager.switchProvider(next);
  });

  window.addEventListener('geocoder-provider-changed', (event: Event) => {
    const nameEl = document.getElementById('lbs-provider-name');
    if (!nameEl) return;
    const { provider } = (event as CustomEvent<{ provider: string }>).detail;
    nameEl.textContent = provider === 'aws'
      ? 'AWS Location Service (próxima geocodificação)'
      : 'OpenStreetMap Nominatim (próxima geocodificação)';
  });

  // --- Nearby Places ---
  const nearbyPanel = new HTMLNearbyPlacesPanel();
  window.findNearbyRestaurants = async (lat: number, lon: number) => {
    nearbyPanel.showLoading('restaurant');
    const btn = document.getElementById('findRestaurantsBtn') as HTMLButtonElement | null;
    if (btn) btn.disabled = true;
    try {
      const places = await findNearby(lat, lon, 500, 'restaurant');
      nearbyPanel.render(places, 'restaurant');
    } catch (err) {
      warn('(app) findNearbyRestaurants failed:', err);
      nearbyPanel.showError('Não foi possível buscar restaurantes próximos.');
    } finally {
      if (btn) btn.disabled = false;
    }
  };

  // --- City Statistics ---
  const cityStatsPanel = new HTMLCityStatsPanel();
  window.fetchCityStatistics = async (_lat: number, _lon: number) => {
    cityStatsPanel.showLoading();
    const btn = document.getElementById('cityStatsBtn') as HTMLButtonElement | null;
    if (btn) btn.disabled = true;
    try {
      const controller = AppState.homeController;
      const manager = (controller as unknown as { manager?: { getBrazilianStandardAddress?(): { municipio?: string | null; siglaUF?: string | null } | null } }).manager;
      const address = manager?.getBrazilianStandardAddress?.();
      const municipio = address?.municipio ?? null;
      const uf = address?.siglaUF ?? null;
      if (!municipio || !uf) {
        cityStatsPanel.showError('Aguardando localização para obter dados do município.');
        return;
      }
      const stats = await fetchStats(municipio, uf);
      if (!stats) {
        cityStatsPanel.showError(`Município "${municipio}" não encontrado no IBGE.`);
        return;
      }
      cityStatsPanel.render(stats);
    } catch (err) {
      warn('(app) fetchCityStatistics failed:', err);
      cityStatsPanel.showError('Não foi possível carregar estatísticas da cidade.');
    } finally {
      if (btn) btn.disabled = false;
    }
  };
}
