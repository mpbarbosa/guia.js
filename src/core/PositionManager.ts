/**
 * PositionManager - Re-exports from paraty_geocore.js
 *
 * The canonical implementation now lives in paraty_geocore.js.
 * This file maintains the original module path for all local callers.
 *
 * @see https://github.com/mpbarbosa/paraty_geocore.js — src/core/PositionManager.ts
 * @module core/PositionManager
 * @since 0.6.0-alpha (moved to paraty_geocore in 0.12.11-alpha)
 */
export {
	PositionManager as default,
	createPositionManagerConfig,
	initializeConfig,
} from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.12.11-alpha/dist/esm/index.js';
export type { PositionManagerConfig } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.12.11-alpha/dist/esm/index.js';
