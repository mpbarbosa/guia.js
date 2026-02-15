'use strict';

import { log } from '../utils/logger.js';
import { ADDRESS_FETCHED_EVENT } from '../config/defaults.js';
import SpeechSynthesisManager from '../speech/SpeechSynthesisManager.js';
import { SpeechTextBuilder } from '../speech/SpeechTextBuilder.js';
import PositionManager from '../core/PositionManager.js';

export class AddressSpeechObserver {
constructor(speechManager, textBuilder, textInput) {
if (speechManager == null) {
throw new TypeError("SpeechManager parameter cannot be null or undefined");
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

update(currentAddress, enderecoPadronizadoOrEvent, posEvent, loadingOrChangeDetails, error) {
if (typeof console !== 'undefined' && console.log) {
log("+++ (301) AddressSpeechObserver.update called +++");
log("+++ (302) currentAddress: ", currentAddress);
log("+++ (303) enderecoPadronizadoOrEvent: ", enderecoPadronizadoOrEvent);
log("+++ (304) posEvent: ", posEvent);
}

if (!currentAddress) {
return;
}

let textToBeSpoken = "";
let priority = 0;

if (posEvent === ADDRESS_FETCHED_EVENT && !this._firstAddressAnnounced) {
if (typeof console !== 'undefined' && console.log) {
log("+++ (305) (AddressSpeechObserver) First address - announcing");
}
textToBeSpoken = this.textBuilder.buildTextToSpeech(enderecoPadronizadoOrEvent);
priority = 2.5;
this._firstAddressAnnounced = true;
}
else if (["MunicipioChanged", "BairroChanged", "LogradouroChanged"].includes(enderecoPadronizadoOrEvent)) {
if (typeof console !== 'undefined' && console.log) {
log("+++ (310) (AddressSpeechObserver) Changed");
}

const fullAddress = loadingOrChangeDetails?.currentAddress || currentAddress;

if (enderecoPadronizadoOrEvent === "MunicipioChanged") {
textToBeSpoken = this.textBuilder.buildTextToSpeechMunicipio(fullAddress, loadingOrChangeDetails);
priority = 3;
} else if (enderecoPadronizadoOrEvent === "BairroChanged") {
textToBeSpoken = this.textBuilder.buildTextToSpeechBairro(fullAddress);
priority = 2;
} else if (enderecoPadronizadoOrEvent === "LogradouroChanged") {
textToBeSpoken = this.textBuilder.buildTextToSpeechLogradouro(fullAddress);
priority = 1;
}
}
else if (posEvent === PositionManager.strCurrPosUpdate) {
textToBeSpoken = this.textBuilder.buildTextToSpeech(enderecoPadronizadoOrEvent);
priority = 0;
}

if (textToBeSpoken) {
if (this.textInput) {
this.textInput.value = textToBeSpoken;
}

this.speechManager.speak(textToBeSpoken, priority);
}
}

resetFirstAddressFlag() {
this._firstAddressAnnounced = false;
}

hasAnnouncedFirstAddress() {
return this._firstAddressAnnounced;
}

toString() {
return this.constructor.name;
}
}

export default AddressSpeechObserver;
