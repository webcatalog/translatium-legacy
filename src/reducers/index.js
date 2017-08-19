import { combineReducers } from 'redux';

import { routerReducer } from 'react-router-redux';

import alert from './alert';
import handwriting from './handwriting';
import history from './history';
import home from './home';
import ocr from './ocr';
import phrasebook from './phrasebook';
import screen from './screen';
import settings from './settings';
import snackbar from './snackbar';
import speech from './speech';
import strings from './strings';
import textToSpeech from './text-to-speech';

const rootReducer = combineReducers({
  alert,
  handwriting,
  history,
  home,
  ocr,
  phrasebook,
  routing: routerReducer,
  screen,
  settings,
  snackbar,
  speech,
  strings,
  textToSpeech,
});

export default rootReducer;
