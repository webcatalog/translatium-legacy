/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { START_TEXT_TO_SPEECH, END_TEXT_TO_SPEECH } from '../../../../constants/actions';

const initialState = {
  textToSpeechLang: null,
  textToSpeechText: null,
  textToSpeechPlaying: false,
};

const textToSpeech = (state = initialState, action) => {
  switch (action.type) {
    case START_TEXT_TO_SPEECH:
      return {
        ...state,
        textToSpeechLang: action.textToSpeechLang,
        textToSpeechText: action.textToSpeechText,
        textToSpeechPlaying: true,
      };
    case END_TEXT_TO_SPEECH:
      return {
        ...state,
        textToSpeechLang: null,
        textToSpeechText: null,
        textToSpeechPlaying: false,
      };
    default:
      return state;
  }
};

export default textToSpeech;
