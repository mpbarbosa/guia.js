/**
 * Empty State Manager
 * Manages empty state displays across the application
 * @since 0.8.7-alpha - UX Quick Win #2
 * @module utils/empty-state-manager
 */

import { createEmptyState, EMPTY_STATES } from '../components/EmptyState.js';
import { log } from './logger.js';

/**
 * Show empty state in an element
 * 
 * @param {HTMLElement} element - Target element
 * @param {Object} config - Empty state configuration
 * @param {string} config.icon - Emoji icon
 * @param {string} config.title - Title text
 * @param {string} config.description - Description text
 * @param {string} [config.action] - Optional action button text
 * @param {Function} [config.onAction] - Optional action callback
 * @returns {HTMLElement} The created empty state element
 */
export function showEmptyState(element, config) {
  if (!element) {
    console.warn('showEmptyState: No element provided');
    return null;
  }

  // Clear existing content
  element.innerHTML = '';
  
  // Create and append empty state
  const emptyState = createEmptyState(config);
  element.appendChild(emptyState);
  
  log('(EmptyStateManager) Showing empty state:', config.title);
  
  return emptyState;
}

/**
 * Clear empty state from an element
 * 
 * @param {HTMLElement} element - Target element
 */
export function clearEmptyState(element) {
  if (!element) return;
  
  const emptyState = element.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
    log('(EmptyStateManager) Cleared empty state from element');
  }
}

/**
 * Check if element currently shows an empty state
 * 
 * @param {HTMLElement} element - Target element
 * @returns {boolean} True if element has empty state
 */
export function hasEmptyState(element) {
  if (!element) return false;
  return element.querySelector('.empty-state') !== null;
}

/**
 * Show location results empty state (initial load)
 */
export function showLocationResultsEmptyState() {
  const locationResult = document.getElementById('locationResult');
  if (!locationResult) return;
  
  showEmptyState(locationResult, {
    icon: '📍',
    title: 'Aguardando localização',
    description: 'Clique no botão "Obter Localização" acima para começar a rastrear sua posição.',
  });
}

/**
 * Show coordinates empty state
 */
export function showCoordinatesEmptyState() {
  const latLongDisplay = document.getElementById('lat-long-display');
  if (!latLongDisplay) return;
  
  latLongDisplay.innerHTML = '<span class="empty-text">Aguardando localização...</span>';
}

/**
 * Show reference place empty state
 */
export function showReferencePlaceEmptyState() {
  const referencePlaceDisplay = document.getElementById('reference-place-display');
  if (!referencePlaceDisplay) return;
  
  referencePlaceDisplay.innerHTML = '<span class="empty-text">Aguardando localização...</span>';
}

/**
 * Show address empty state
 */
export function showAddressEmptyState() {
  const addressDisplay = document.getElementById('endereco-padronizado-display');
  if (!addressDisplay) return;
  
  addressDisplay.innerHTML = '<span class="empty-text">Aguardando localização...</span>';
}

/**
 * Show SIDRA data empty state
 */
export function showSidraEmptyState() {
  const sidraDisplay = document.getElementById('dadosSidra');
  if (!sidraDisplay) return;
  
  sidraDisplay.innerHTML = '<span class="empty-text">Aguardando localização...</span>';
}

/**
 * Initialize all empty states on page load
 * Call this when the app initializes
 */
export function initializeEmptyStates() {
  log('(EmptyStateManager) Initializing empty states...');
  
  // Main location result area
  showLocationResultsEmptyState();
  
  // Other sections already have "Aguardando localização..." in HTML
  // We'll keep those for now as they're less prominent
  
  log('(EmptyStateManager) Empty states initialized');
}

/**
 * Clear all empty states (when data loads)
 */
export function clearAllEmptyStates() {
  const locationResult = document.getElementById('locationResult');
  if (locationResult) {
    clearEmptyState(locationResult);
  }
  
  log('(EmptyStateManager) All empty states cleared');
}

export default {
  showEmptyState,
  clearEmptyState,
  hasEmptyState,
  showLocationResultsEmptyState,
  showCoordinatesEmptyState,
  showReferencePlaceEmptyState,
  showAddressEmptyState,
  showSidraEmptyState,
  initializeEmptyStates,
  clearAllEmptyStates,
  EMPTY_STATES
};
