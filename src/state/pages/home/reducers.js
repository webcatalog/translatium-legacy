import { combineReducers } from 'redux';

import {
  TOGGLE_FULLSCREEN_INPUT_BOX,
  UPDATE_IME_MODE,
  UPDATE_INPUT_TEXT,
  UPDATE_OUTPUT,
} from '../../../constants/actions';

import handwriting from './handwriting/reducers';
import history from './history/reducers';
import speech from './speech/reducers';
import textToSpeech from './text-to-speech/reducers';

const fullscreenInputBox = (state = false, action) => {
  switch (action.type) {
    case TOGGLE_FULLSCREEN_INPUT_BOX: return !state;
    default: return state;
  }
};

const imeMode = (state = null, action) => {
  switch (action.type) {
    case UPDATE_IME_MODE: return action.imeMode;
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
    case UPDATE_INPUT_TEXT: return action.selectionStart || state;
    default: return state;
  }
};

const selectionEnd = (state = 0, action) => {
  switch (action.type) {
    case UPDATE_INPUT_TEXT: return action.selectionEnd || state;
    default: return state;
  }
};

export default combineReducers({
  fullscreenInputBox,
  handwriting,
  history,
  imeMode,
  inputText,
  output,
  selectionEnd,
  selectionStart,
  speech,
  textToSpeech,
});
