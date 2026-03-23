/**
 * EmptyState Component
 * 
 * Provides user-friendly empty state messages for when data is not yet available.
 * Part of UX Quick Win #3 - improves first-time user experience.
 * 
 * @module components/EmptyState
 */

interface EmptyStateOptions {
  icon: string;
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}

/**
 * Creates an empty state message element.
 *
 * @param options - Configuration options
 * @returns The empty state element
 */
export function createEmptyState({ icon, title, description, action, onAction }: EmptyStateOptions): HTMLElement {
  const container = document.createElement('div');
  container.className = 'empty-state';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');

  const iconEl = document.createElement('div');
  iconEl.className = 'empty-state-icon';
  iconEl.setAttribute('aria-hidden', 'true');
  iconEl.textContent = icon;

  const titleEl = document.createElement('h3');
  titleEl.className = 'empty-state-title';
  titleEl.textContent = title;

  const descEl = document.createElement('p');
  descEl.className = 'empty-state-description';
  descEl.textContent = description;

  container.appendChild(iconEl);
  container.appendChild(titleEl);
  container.appendChild(descEl);

  if (action && onAction) {
    const actionBtn = document.createElement('button');
    actionBtn.className = 'empty-state-action md3-button-outlined';
    actionBtn.textContent = action;
    actionBtn.addEventListener('click', onAction);
    container.appendChild(actionBtn);
  }

  return container;
}

/**
 * Common empty state configurations.
 */
export const EMPTY_STATES: Record<string, EmptyStateOptions> = {
  NO_LOCATION: {
    icon: '📍',
    title: 'Aguardando localização',
    description: 'Clique em "Obter Localização" para começar a rastrear sua posição.',
  },
  NO_ADDRESS: {
    icon: '🗺️',
    title: 'Endereço indisponível',
    description: 'Não foi possível obter o endereço para esta localização.',
  },
  NO_MUNICIPIO: {
    icon: '🏙️',
    title: 'Município desconhecido',
    description: 'As informações do município ainda não foram carregadas.',
  },
  NO_BAIRRO: {
    icon: '🏘️',
    title: 'Bairro não identificado',
    description: 'Esta localização não possui informações de bairro disponíveis.',
  },
  LOADING: {
    icon: '⏳',
    title: 'Carregando...',
    description: 'Buscando informações de localização.',
  },
  ERROR: {
    icon: '⚠️',
    title: 'Erro ao carregar',
    description: 'Não foi possível carregar as informações. Tente novamente.',
  },
};
