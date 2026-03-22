/**
 * Skeleton Components
 * 
 * Provides skeleton loading states for better perceived performance.
 * Part of UX Quick Win #6 - shows content placeholders while loading.
 * 
 * @module components/Skeletons
 */

interface SkeletonOptions {
  type?: 'text' | 'heading' | 'circle' | 'rect';
  width?: string;
  height?: string;
  lines?: number;
}

type SkeletonType = 'card' | 'address' | 'coordinates';

/**
 * Creates a skeleton element with optional custom width.
 *
 * @param options - Configuration options
 * @returns The skeleton element
 */
export function createSkeleton({ type = 'text', width, height, lines = 1 }: SkeletonOptions = {}): HTMLElement {
  const skeleton = document.createElement('div');
  skeleton.className = `skeleton skeleton-${type}`;
  skeleton.setAttribute('aria-busy', 'true');
  skeleton.setAttribute('aria-label', 'Carregando conteúdo');

  if (width) skeleton.style.width = width;
  if (height) skeleton.style.height = height;

  if (type === 'text' && lines > 1) {
    skeleton.classList.add('skeleton-multiline');
    for (let i = 0; i < lines; i++) {
      const line = document.createElement('div');
      line.className = 'skeleton-line';
      if (i === lines - 1) {
        line.style.width = '60%';
      }
      skeleton.appendChild(line);
    }
  }

  return skeleton;
}

/**
 * Creates a skeleton for a highlight card.
 *
 * @returns Skeleton card element
 */
export function createHighlightCardSkeleton(): HTMLElement {
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
 * Creates a skeleton for address display.
 *
 * @returns Skeleton address element
 */
export function createAddressSkeleton(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'skeleton-address';

  container.appendChild(createSkeleton({ type: 'text', width: '80%' }));
  container.appendChild(createSkeleton({ type: 'text', width: '60%' }));
  container.appendChild(createSkeleton({ type: 'text', width: '70%' }));

  return container;
}

/**
 * Creates a skeleton for coordinates display.
 *
 * @returns Skeleton coordinates element
 */
export function createCoordinatesSkeleton(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'skeleton-coordinates';
  container.appendChild(createSkeleton({ type: 'text', width: '200px' }));
  return container;
}

/**
 * Shows loading skeletons in a container.
 *
 * @param container - Container element
 * @param type - Skeleton type (card, address, coordinates)
 * @param count - Number of skeletons to show
 */
export function showSkeletons(container: HTMLElement, type: SkeletonType, count: number = 1): void {
  container.innerHTML = '';
  container.setAttribute('aria-busy', 'true');

  const creators: Record<SkeletonType, () => HTMLElement> = {
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
 * Hides loading skeletons and shows actual content.
 *
 * @param container - Container element
 * @param content - Content to show (HTML string or element)
 */
export function hideSkeletons(container: HTMLElement, content: string | HTMLElement): void {
  container.setAttribute('aria-busy', 'false');
  
  if (typeof content === 'string') {
    container.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    container.innerHTML = '';
    container.appendChild(content);
  }
}

/**
 * Skeleton presets for common scenarios.
 */
export const SKELETON_PRESETS: Record<string, { type: SkeletonType; count: number }> = {
  LOCATION_HIGHLIGHTS: { type: 'card', count: 2 },
  ADDRESS_BLOCK: { type: 'address', count: 1 },
  COORDINATES_LINE: { type: 'coordinates', count: 1 },
};
