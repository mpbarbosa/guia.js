/**
 * TypeScript ambient type declarations for catas_altas_speech.
 *
 * catas_altas_speech is consumed via importmap alias / jsDelivr CDN (it has no
 * npm package in node_modules), so its types cannot be resolved automatically —
 * they are declared here. pt-BR Web Speech engine extracted from this project's
 * src/speech feature.
 *
 * @see https://github.com/mpbarbosa/catas_altas_speech
 */
declare module 'catas_altas_speech' {
  export const SPEECH_PRIORITY: {
    readonly PERIODIC: 0;
    readonly LOGRADOURO: 1;
    readonly BAIRRO: 2;
    readonly FIRST_ADDRESS: 2.5;
    readonly MUNICIPIO: 3;
  };

  export const SPEECH_CONFIG: {
    maxVoiceRetryAttempts: number;
    voiceRetryInterval: number;
    independentQueueTimerInterval: number;
    minRate: number;
    maxRate: number;
    minPitch: number;
    maxPitch: number;
    defaultRate: number;
    defaultPitch: number;
    primaryLanguage: string;
    fallbackLanguagePrefix: string;
  };

  export class SpeechSynthesisManager {
    constructor(enableLogging?: boolean);
    get isLoggingEnabled(): boolean;
    enableLogs(): void;
    disableLogs(): void;
    toggleLogs(): boolean;
    setVoice(voice: SpeechSynthesisVoice | null): void;
    setRate(rate: number): void;
    setPitch(pitch: number): void;
    getAvailableVoices(): SpeechSynthesisVoice[];
    getCurrentVoice(): SpeechSynthesisVoice;
    speak(text: string, priority?: number): void;
    pause(): void;
    resume(): void;
    stop(): void;
    getQueueSize(): number;
    isSpeaking(): boolean;
    getStatus(): {
      voice: { name: string; lang: string };
      rate: number;
      pitch: number;
      isSpeaking: boolean;
      queueSize: number;
      queueTimerActive: boolean;
      voiceRetryAttempts: number;
      voiceRetryActive: boolean;
    };
    toString(): string;
    destroy(): void;
  }

  export default SpeechSynthesisManager;

  export class SpeechQueue {}
  export class VoiceLoader {}
  export class VoiceSelector {}
  export class SpeechConfiguration {}
}
