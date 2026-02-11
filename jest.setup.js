/**
 * Jest setup file
 * Configures global polyfills for test environment
 */

import { TextEncoder, TextDecoder } from 'util';
import { jest } from '@jest/globals';

// Polyfill TextEncoder/TextDecoder for jsdom environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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
