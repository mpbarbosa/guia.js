/**
 * Skeleton Components
 * 
 * Provides skeleton loading states for better perceived performance.
 * Part of UX Quick Win #6 - shows content placeholders while loading.
 * 
 * @module components/Skeletons
 */

/**
 * Creates a skeleton element with optional custom width
 * 
 * @param {Object} options - Configuration options
 * @param {string} [options.type='text'] - Skeleton type (text, heading, circle, rect)
 * @param {string} [options.width] - Custom width (e.g., '100%', '200px')
 * @param {string} [options.height] - Custom height (for rect type)
 * @param {number} [options.lines=1] - Number of lines (for text type)
 * @returns {HTMLElement} The skeleton element
 */
export function createSkeleton({ type = 'text', width, height, lines = 1 } = {}) {
  const skeleton = document.createElement('div');
  skeleton.className = `skeleton skeleton-${type}`;
  skeleton.setAttribute('aria-busy', 'true');
  skeleton.setAttribute('aria-label', 'Carregando conteúdo');

  if (width) skeleton.style.width = width;
  if (height) skeleton.style.height = height;

  // For text skeletons with multiple lines
  if (type === 'text' && lines > 1) {
    skeleton.classList.add('skeleton-multiline');
    for (let i = 0; i < lines; i++) {
      const line = document.createElement('div');
      line.className = 'skeleton-line';
      // Last line is shorter
      if (i === lines - 1) {
        line.style.width = '60%';
      }
      skeleton.appendChild(line);
    }
  }

  return skeleton;
}

/**
 * Creates a skeleton for a highlight card
 * 
 * @returns {HTMLElement} Skeleton card element
 */
export function createHighlightCardSkeleton() {
  const card = document.createElement('div');
  card.className = 'highlight-card skeleton-card';
  card.setAttribute('aria-busy', 'true');

  const label = createSkeleton({ type: 'text', width: '60px' });
  label.classList.add('skeleton-card-label');

  const value = createSkeleton({ type: 'heading', width: '120px' });
  value.classList.add('skeleton-card-value');

  card.appendChild(label);
  card.appendChild(value);

  return card;
}

/**
 * Creates a skeleton for address display
 * 
 * @returns {HTMLElement} Skeleton address element
 */
export function createAddressSkeleton() {
  const container = document.createElement('div');
  container.className = 'skeleton-address';

  const line1 = createSkeleton({ type: 'text', width: '80%' });
  const line2 = createSkeleton({ type: 'text', width: '60%' });
  const line3 = createSkeleton({ type: 'text', width: '70%' });

  container.appendChild(line1);
  container.appendChild(line2);
  container.appendChild(line3);

  return container;
}

/**
 * Creates a skeleton for coordinates display
 * 
 * @returns {HTMLElement} Skeleton coordinates element
 */
export function createCoordinatesSkeleton() {
  const container = document.createElement('div');
  container.className = 'skeleton-coordinates';

  const line = createSkeleton({ type: 'text', width: '200px' });
  container.appendChild(line);

  return container;
}

/**
 * Shows loading skeletons in a container
 * 
 * @param {HTMLElement} container - Container element
 * @param {string} type - Skeleton type (card, address, coordinates)
 * @param {number} [count=1] - Number of skeletons to show
 */
export function showSkeletons(container, type, count = 1) {
  // Clear existing content
  container.innerHTML = '';
  container.setAttribute('aria-busy', 'true');

  const creators = {
    card: createHighlightCardSkeleton,
    address: createAddressSkeleton,
    coordinates: createCoordinatesSkeleton,
  };

  const creator = creators[type];
  if (!creator) {
    console.warn(`Unknown skeleton type: ${type}`);
    return;
  }

  for (let i = 0; i < count; i++) {
    container.appendChild(creator());
  }
}

/**
 * Hides loading skeletons and shows actual content
 * 
 * @param {HTMLElement} container - Container element
 * @param {string|HTMLElement} content - Content to show (HTML string or element)
 */
export function hideSkeletons(container, content) {
  container.setAttribute('aria-busy', 'false');
  
  if (typeof content === 'string') {
    container.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    container.innerHTML = '';
    container.appendChild(content);
  }
}

/**
 * Skeleton presets for common scenarios
 */
export const SKELETON_PRESETS = {
  LOCATION_HIGHLIGHTS: { type: 'card', count: 2 },
  ADDRESS_BLOCK: { type: 'address', count: 1 },
  COORDINATES_LINE: { type: 'coordinates', count: 1 },
};

// Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createSkeleton,
    createHighlightCardSkeleton,
    createAddressSkeleton,
    createCoordinatesSkeleton,
    showSkeletons,
    hideSkeletons,
    SKELETON_PRESETS,
  };
}
