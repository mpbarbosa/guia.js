/**
 * Accessibility Utilities
 * 
 * Provides utilities to improve accessibility across the application.
 * Part of UX Quick Win #5 - ensures screen reader friendly emoji usage.
 * 
 * @module utils/accessibility
 */

/**
 * Wraps an emoji in a screen-reader friendly span
 * 
 * @param {string} emoji - The emoji character(s)
 * @param {string} label - Screen reader description
 * @returns {string} HTML string with accessible emoji
 * 
 * @example
 * accessibleEmoji('📍', 'Location pin')
 * // Returns: '<span role="img" aria-label="Location pin">📍</span>'
 */
export function accessibleEmoji(emoji: string, label: string): string {
  return `<span role="img" aria-label="${label}">${emoji}</span>`;
}

/**
 * Creates an accessible emoji DOM element
 * 
 * @param {string} emoji - The emoji character(s)
 * @param {string} label - Screen reader description
 * @returns {HTMLElement} Span element with emoji
 */
export function createAccessibleEmoji(emoji: string, label: string): HTMLElement {
  const span = document.createElement('span');
  span.setAttribute('role', 'img');
  span.setAttribute('aria-label', label);
  span.textContent = emoji;
  return span;
}

/**
 * Common emoji mappings with their accessibility labels
 */
export const ACCESSIBLE_EMOJIS = {
  // Location and navigation
  LOCATION_PIN: { emoji: '📍', label: 'Marcador de localização' },
  MAP: { emoji: '🗺️', label: 'Mapa' },
  COMPASS: { emoji: '🧭', label: 'Bússola' },
  GLOBE: { emoji: '🌍', label: 'Globo' },
  
  // Places
  CITY: { emoji: '🏙️', label: 'Cidade' },
  NEIGHBORHOOD: { emoji: '🏘️', label: 'Bairro' },
  BUILDING: { emoji: '🏢', label: 'Edifício' },
  HOME: { emoji: '🏠', label: 'Casa' },
  
  // Status indicators
  SUCCESS: { emoji: '✓', label: 'Sucesso' },
  ERROR: { emoji: '✕', label: 'Erro' },
  WARNING: { emoji: '⚠️', label: 'Aviso' },
  INFO: { emoji: 'ℹ', label: 'Informação' },
  LOADING: { emoji: '⏳', label: 'Carregando' },
  
  // Actions
  SEARCH: { emoji: '🔍', label: 'Buscar' },
  RESTAURANT: { emoji: '🍽️', label: 'Restaurante' },
  STATISTICS: { emoji: '📊', label: 'Estatísticas' },
  SETTINGS: { emoji: '⚙️', label: 'Configurações' },
  
  // Misc
  EMPTY_STATE: { emoji: '🚫', label: 'Sem dados' },
  CLOCK: { emoji: '🕐', label: 'Horário' },
  DISTANCE: { emoji: '📏', label: 'Distância' },
};

/**
 * Replace all emojis in a string with accessible versions
 * 
 * @param {string} text - Text containing emojis
 * @param {Object} emojiMap - Map of emoji to label
 * @returns {string} Text with accessible emojis
 * 
 * @example
 * replaceEmojisWithAccessible('📍 São Paulo', { '📍': 'Location pin' })
 * // Returns: '<span role="img" aria-label="Location pin">📍</span> São Paulo'
 */
export function replaceEmojisWithAccessible(text: string, emojiMap: Record<string, string>): string {
  let result = text;
  
  Object.entries(emojiMap).forEach(([emoji, label]) => {
    const regex = new RegExp(emoji, 'g');
    result = result.replace(regex, accessibleEmoji(emoji, label));
  });
  
  return result;
}

/**
 * Update existing DOM elements to make emojis accessible
 * 
 * @param {HTMLElement} container - Container to search within
 */
export function makeEmojisAccessible(container: HTMLElement = document.body): void {
  // Find all emoji candidates (basic emoji regex)
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  const nodesToUpdate = [];
  let node;
  
  while (node = walker.nextNode()) {
    if (emojiRegex.test(node.textContent)) {
      nodesToUpdate.push(node);
    }
    emojiRegex.lastIndex = 0; // Reset regex state
  }
  
  nodesToUpdate.forEach(textNode => {
    const parent = textNode.parentNode;
    if (!parent || parent.hasAttribute('role')) return; // Skip if already accessible
    
    const matches = textNode.textContent.match(emojiRegex);
    if (!matches) return;
    
    matches.forEach(emoji => {
      // Try to find a matching accessible emoji
      const accessible = Object.values(ACCESSIBLE_EMOJIS).find(e => e.emoji === emoji);
      if (!accessible) return;
      
      // Create accessible version
      const span = createAccessibleEmoji(emoji, accessible.label);
      const parts = textNode.textContent.split(emoji);
      
      if (parts.length === 2) {
        const before = document.createTextNode(parts[0]);
        const after = document.createTextNode(parts[1]);
        
        parent.insertBefore(before, textNode);
        parent.insertBefore(span, textNode);
        parent.insertBefore(after, textNode);
        parent.removeChild(textNode);
      }
    });
  });
}

// Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    accessibleEmoji,
    createAccessibleEmoji,
    replaceEmojisWithAccessible,
    makeEmojisAccessible,
    ACCESSIBLE_EMOJIS,
  };
}
