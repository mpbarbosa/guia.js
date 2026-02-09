/**
 * Button Status Helper
 * Adds helpful status messages below buttons (especially disabled ones)
 * @since 0.8.7-alpha - UX Quick Win #3
 * @module utils/button-status
 */

/**
 * Add a status message below a button
 * 
 * @param {HTMLButtonElement} button - Target button element
 * @param {string} message - Status message to display
 * @param {string} [type='info'] - Type: 'info', 'warning', 'success', 'error'
 * @returns {HTMLElement} The status element created
 */
export function addButtonStatus(button, message, type = 'info') {
  if (!button) {
    console.warn('addButtonStatus: No button provided');
    return null;
  }

  // Remove existing status if present
  removeButtonStatus(button);

  // Create status element
  const statusId = `${button.id || 'btn'}-status`;
  const status = document.createElement('div');
  status.id = statusId;
  status.className = `button-status button-status-${type}`;
  status.textContent = message;
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  // Insert after button
  button.parentNode.insertBefore(status, button.nextSibling);

  // Update button ARIA to reference status
  button.setAttribute('aria-describedby', statusId);

  return status;
}

/**
 * Remove status message from a button
 * 
 * @param {HTMLButtonElement} button - Target button
 */
export function removeButtonStatus(button) {
  if (!button) return;

  // Find and remove status element
  const statusId = `${button.id || 'btn'}-status`;
  const existingStatus = document.getElementById(statusId);
  if (existingStatus) {
    existingStatus.remove();
  }

  // Also check for sibling status element
  const nextElement = button.nextElementSibling;
  if (nextElement && nextElement.classList.contains('button-status')) {
    nextElement.remove();
  }

  // Remove ARIA reference
  button.removeAttribute('aria-describedby');
}

/**
 * Update button status message
 * 
 * @param {HTMLButtonElement} button - Target button
 * @param {string} message - New status message
 * @param {string} [type='info'] - Type: 'info', 'warning', 'success', 'error'
 */
export function updateButtonStatus(button, message, type = 'info') {
  if (!button) return;

  const statusId = `${button.id || 'btn'}-status`;
  const status = document.getElementById(statusId);

  if (status) {
    status.textContent = message;
    status.className = `button-status button-status-${type}`;
  } else {
    addButtonStatus(button, message, type);
  }
}

/**
 * Add disabled state with explanatory message
 * 
 * @param {HTMLButtonElement} button - Target button
 * @param {string} reason - Reason why button is disabled
 */
export function disableWithReason(button, reason) {
  if (!button) return;

  button.disabled = true;
  button.setAttribute('aria-disabled', 'true');
  addButtonStatus(button, reason, 'warning');
}

/**
 * Enable button and remove disabled message
 * 
 * @param {HTMLButtonElement} button - Target button
 * @param {string} [successMessage] - Optional success message to show
 */
export function enableWithMessage(button, successMessage) {
  if (!button) return;

  button.disabled = false;
  button.setAttribute('aria-disabled', 'false');

  if (successMessage) {
    addButtonStatus(button, successMessage, 'success');
  } else {
    removeButtonStatus(button);
  }
}

/**
 * Common status messages for buttons
 */
export const BUTTON_STATUS_MESSAGES = {
  WAITING_LOCATION: 'Aguardando localização para habilitar',
  READY: 'Pronto para usar',
  DISABLED: 'Função não disponível',
  LOADING: 'Carregando...',
  ERROR: 'Erro ao carregar',
  NOT_IMPLEMENTED: 'Funcionalidade em desenvolvimento',
};

export default {
  addButtonStatus,
  removeButtonStatus,
  updateButtonStatus,
  disableWithReason,
  enableWithMessage,
  BUTTON_STATUS_MESSAGES
};
