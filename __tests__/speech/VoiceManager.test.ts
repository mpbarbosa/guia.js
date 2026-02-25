/**
 * @jest-environment node
 */

/**
 * @file VoiceManager.test.js
 * @description Unit tests for the VoiceManager class.
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { VoiceManager } from '../../src/speech/VoiceManager.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

const makeSynth = (voices = []) => ({
  getVoices: jest.fn(() => voices),
  cancel: jest.fn(),
  speak: jest.fn(),
});

const ptBRVoice = { name: 'Brazilian', lang: 'pt-BR', localService: true };
const ptPTVoice = { name: 'Portuguese', lang: 'pt-PT', localService: false };
const enVoice   = { name: 'English', lang: 'en-US', localService: true };

// ─── constructor ──────────────────────────────────────────────────────────────

describe('VoiceManager constructor', () => {
  test('throws TypeError when synth has no getVoices', () => {
    expect(() => new VoiceManager({})).toThrow(TypeError);
    expect(() => new VoiceManager(null)).toThrow(TypeError);
  });

  test('accepts valid synth and initialises state', () => {
    const vm = new VoiceManager(makeSynth());
    expect(vm.getCurrentVoice()).toBeNull();
    expect(vm.getAvailableVoices()).toHaveLength(0);
  });
});

// ─── loadVoices – voice selection priority ────────────────────────────────────

describe('VoiceManager.loadVoices – priority', () => {
  test('selects pt-BR voice (priority 1)', () => {
    const vm = new VoiceManager(makeSynth([ptPTVoice, ptBRVoice, enVoice]));
    vm.loadVoices();
    expect(vm.getCurrentVoice()).toBe(ptBRVoice);
  });

  test('falls back to pt-PT when no pt-BR', () => {
    const vm = new VoiceManager(makeSynth([enVoice, ptPTVoice]));
    vm.loadVoices();
    expect(vm.getCurrentVoice()).toBe(ptPTVoice);
  });

  test('falls back to first voice when no Portuguese', () => {
    const vm = new VoiceManager(makeSynth([enVoice]));
    vm.loadVoices();
    expect(vm.getCurrentVoice()).toBe(enVoice);
  });

  test('returns null when no voices available', () => {
    const vm = new VoiceManager(makeSynth([]));
    vm.loadVoices();
    expect(vm.getCurrentVoice()).toBeNull();
  });
});

// ─── setVoice / getCurrentVoice ───────────────────────────────────────────────

describe('VoiceManager.setVoice', () => {
  test('sets voice and getAvailableVoices after loadVoices', () => {
    const vm = new VoiceManager(makeSynth([enVoice]));
    vm.loadVoices();
    vm.setVoice(enVoice);
    expect(vm.getCurrentVoice()).toBe(enVoice);
    expect(vm.getAvailableVoices()).toContain(enVoice);
  });
});

// ─── hasBrazilianVoice ────────────────────────────────────────────────────────

describe('VoiceManager.hasBrazilianVoice', () => {
  test('returns true when pt-BR voice is selected', () => {
    const vm = new VoiceManager(makeSynth([ptBRVoice]));
    vm.loadVoices();
    expect(vm.hasBrazilianVoice()).toBe(true);
  });

  test('returns false when only non-pt-BR voices available', () => {
    const vm = new VoiceManager(makeSynth([enVoice]));
    vm.loadVoices();
    expect(vm.hasBrazilianVoice()).toBe(false);
  });

  test('returns false when no voice selected', () => {
    const vm = new VoiceManager(makeSynth([]));
    expect(vm.hasBrazilianVoice()).toBe(false);
  });
});

// ─── enableLogs / disableLogs ─────────────────────────────────────────────────

describe('VoiceManager logging', () => {
  test('enableLogs sets enableLogging to true', () => {
    const vm = new VoiceManager(makeSynth());
    vm.enableLogs();
    expect(vm.enableLogging).toBe(true);
  });

  test('disableLogs sets enableLogging to false', () => {
    const vm = new VoiceManager(makeSynth());
    vm.enableLogs();
    vm.disableLogs();
    expect(vm.enableLogging).toBe(false);
  });
});

// ─── destroy ─────────────────────────────────────────────────────────────────

describe('VoiceManager.destroy', () => {
  test('clears voice and voices array', () => {
    const vm = new VoiceManager(makeSynth([enVoice]));
    vm.loadVoices();
    vm.destroy();
    expect(vm.getCurrentVoice()).toBeNull();
    expect(vm.getAvailableVoices()).toHaveLength(0);
  });
});
