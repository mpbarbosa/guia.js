
/**
 * Re-exports PositionManager and related utilities from the paraty_geocore.js library.
 *
 * PositionManager implements the singleton and observer patterns to provide a single
 * source of truth for the current device position.
 *
 * @module core/PositionManager
 * @see {@link https://github.com/mpbarbosa/paraty_geocore.js}
 */

export {
	PositionManager as default,
	initializeConfig,
	createPositionManagerConfig,
} from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.11.3/dist/esm/index.js';

export type { PositionManagerConfig } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.11.3/dist/esm/index.js';
