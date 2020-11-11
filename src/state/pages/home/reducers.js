/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { combineReducers } from 'redux';

import {
  TOGGLE_FULLSCREEN_INPUT_BOX,
  UPDATE_INPUT_TEXT,
  UPDATE_OUTPUT,
} from '../../../constants/actions';

import history from './history/reducers';
import textToSpeech from './text-to-speech/reducers';

const fullscreenInputBox = (state = false, action) => {
  switch (action.type) {
    case TOGGLE_FULLSCREEN_INPUT_BOX: return !state;
    default: return state;
  }
};

const output = (state = null, action) => {
  switch (action.type) {
    case UPDATE_OUTPUT: return action.output;
    default: return state;
  }
};

const inputText = (state = '', action) => {
  switch (action.type) {
    case UPDATE_INPUT_TEXT: return action.inputText;
    default: return state;
  }
};

const selectionStart = (state = 0, action) => {
  switch (action.type) {
    case UPDATE_INPUT_TEXT: return action.selectionStart || null;
    default: return state;
  }
};

const selectionEnd = (state = 0, action) => {
  switch (action.type) {
    case UPDATE_INPUT_TEXT: return action.selectionEnd || null;
    default: return state;
  }
};

export default combineReducers({
  fullscreenInputBox,
  history,
  inputText,
  output,
  selectionEnd,
  selectionStart,
  textToSpeech,
});
