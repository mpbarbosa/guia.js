/**
 * Mock implementation of logger.js for testing
 */
import { jest } from '@jest/globals';

export const log = jest.fn();
export const warn = jest.fn();
export const error = jest.fn();
