/**
 * Jest setup file
 * Configures global polyfills and shared mocks for test environment.
 *
 * This file runs via setupFilesAfterEnv and centralizes global mocks
 * that would otherwise be duplicated across individual test files.
 */

import { TextEncoder, TextDecoder } from 'util';
import { jest } from '@jest/globals';

// Suppress console output during tests to keep test output clean.
// Individual test files may override specific methods with jest.spyOn if needed.
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
};

// Polyfill TextEncoder/TextDecoder for jsdom environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Make jest available as a global for ESM test files (required with --experimental-vm-modules)
globalThis.jest = jest;

// Mock Speech Synthesis API for jsdom environment
if (typeof window !== 'undefined') {
	// Mock alert function for jsdom environment
	window.alert = jest.fn();
	global.alert = window.alert; // Also expose as global.alert for tests
	
	// Mock SpeechSynthesisUtterance constructor
	window.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
		constructor(text) {
			this.text = text;
			this.voice = null;
			this.rate = 1;
			this.pitch = 1;
			this.volume = 1;
			this.onstart = null;
			this.onend = null;
			this.onerror = null;
			this.onpause = null;
			this.onresume = null;
			this.onmark = null;
			this.onboundary = null;
		}
	};
	
	window.speechSynthesis = {
		getVoices: () => [],
		speak: () => {},
		cancel: () => {},
		pause: () => {},
		resume: () => {},
		pending: false,
		speaking: false,
		paused: false
	};
	
	// Mock Geolocation API for jsdom environment
	if (!window.navigator) {
		window.navigator = {};
	}
	window.navigator.geolocation = {
		getCurrentPosition: () => {},
		watchPosition: () => 1,
		clearWatch: () => {}
	};
}
