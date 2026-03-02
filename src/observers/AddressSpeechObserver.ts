import { log } from "../utils/logger.js";
import { ADDRESS_FETCHED_EVENT } from "../config/defaults.js";
import SpeechSynthesisManager, {
  SPEECH_PRIORITY,
} from "../speech/SpeechSynthesisManager.js"; // eslint-disable-line no-unused-vars
import { SpeechTextBuilder } from "../speech/SpeechTextBuilder.js"; // eslint-disable-line no-unused-vars
import PositionManager from "../core/PositionManager.js";

export class AddressSpeechObserver {
  speechManager: any;
  textBuilder: any;
  textInput: any;
  _firstAddressAnnounced: boolean;

  constructor(speechManager: any, textBuilder: any, textInput: any) {
    if (speechManager == null) {
      throw new TypeError(
        "SpeechManager parameter cannot be null or undefined",
      );
    }

    if (textBuilder == null) {
      throw new TypeError("TextBuilder parameter cannot be null or undefined");
    }

    this.speechManager = speechManager;
    this.textBuilder = textBuilder;
    this.textInput = textInput || null;
    this._firstAddressAnnounced = false;

    // NOTE: We do not freeze this instance because _firstAddressAnnounced needs
    // to be mutable to track state across update() calls
  }

  update(
    currentAddress: any,
    enderecoPadronizadoOrEvent: any,
    posEvent: string,
    loadingOrChangeDetails: any,
    _error: unknown,
  ): void {
    // Logging is now handled by HtmlSpeechSynthesisDisplayer facade for backward compatibility
    // if (typeof console !== 'undefined' && console.log) {
    // log("+++ (301) AddressSpeechObserver.update called +++");
    // log("+++ (302) currentAddress: ", currentAddress);
    // log("+++ (303) enderecoPadronizadoOrEvent: ", enderecoPadronizadoOrEvent);
    // log("+++ (304) posEvent: ", posEvent);
    // }

    if (!currentAddress) {
      return;
    }

    let textToBeSpoken = "";
    let priority: any = SPEECH_PRIORITY.PERIODIC;

    if (posEvent === ADDRESS_FETCHED_EVENT && !this._firstAddressAnnounced) {
      if (typeof console !== "undefined" && console.log) {
        log("+++ (305) (AddressSpeechObserver) First address - announcing");
      }
      textToBeSpoken = this.textBuilder.buildTextToSpeech(
        enderecoPadronizadoOrEvent,
      );
      priority = SPEECH_PRIORITY.FIRST_ADDRESS;
      this._firstAddressAnnounced = true;
      if (textToBeSpoken) {
        this.speechManager.speak(textToBeSpoken, priority);
        if (this.textInput) {
          this.textInput.value = textToBeSpoken;
        }
      }
    } else if (
      ["MunicipioChanged", "BairroChanged", "LogradouroChanged"].includes(
        enderecoPadronizadoOrEvent,
      )
    ) {
      if (typeof console !== "undefined" && console.log) {
        log("+++ (310) (AddressSpeechObserver) Changed");
      }

      const fullAddress =
        loadingOrChangeDetails?.currentAddress || currentAddress;

      if (enderecoPadronizadoOrEvent === "MunicipioChanged") {
        textToBeSpoken = this.textBuilder.buildTextToSpeechMunicipio(
          fullAddress,
          loadingOrChangeDetails,
        );
        priority = SPEECH_PRIORITY.MUNICIPIO;
      } else if (enderecoPadronizadoOrEvent === "BairroChanged") {
        textToBeSpoken = this.textBuilder.buildTextToSpeechBairro(fullAddress);
        priority = SPEECH_PRIORITY.BAIRRO;
      } else if (enderecoPadronizadoOrEvent === "LogradouroChanged") {
        textToBeSpoken =
          this.textBuilder.buildTextToSpeechLogradouro(fullAddress);
        priority = SPEECH_PRIORITY.LOGRADOURO;
      }

      if (textToBeSpoken) {
        this.speechManager.speak(textToBeSpoken, priority);
        if (this.textInput) {
          this.textInput.value = textToBeSpoken;
        }
      }
    } else if (posEvent === PositionManager.strCurrPosUpdate) {
      textToBeSpoken = this.textBuilder.buildTextToSpeech(
        enderecoPadronizadoOrEvent,
      );
      priority = SPEECH_PRIORITY.PERIODIC;
      if (this.textInput) {
        this.textInput.value = textToBeSpoken;
      }

      this.speechManager.speak(textToBeSpoken, priority);
    }
  }

  resetFirstAddressFlag(): void {
    this._firstAddressAnnounced = false;
  }

  hasAnnouncedFirstAddress(): boolean {
    return this._firstAddressAnnounced;
  }

  toString(): string {
    return this.constructor.name;
  }
}

export default AddressSpeechObserver;
