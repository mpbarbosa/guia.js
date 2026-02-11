/**
 * Mock implementation of toast.js for testing
 */
import { jest } from '@jest/globals';

export const showError = jest.fn();
export const showInfo = jest.fn();
export const showWarning = jest.fn();
export const showSuccess = jest.fn();
export const showToast = jest.fn();
