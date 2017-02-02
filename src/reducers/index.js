import { combineReducers } from 'redux';

import { routerReducer } from 'react-router-redux';

import screen from './screen';
import home from './home';
import settings from './settings';
import textToSpeech from './textToSpeech';
import handwriting from './handwriting';
import speech from './speech';
import history from './history';
import phrasebook from './phrasebook';
import alert from './alert';
import ocr from './ocr';
import snackbar from './snackbar';

const rootReducer = combineReducers({
  screen,
  home,
  settings,
  textToSpeech,
  handwriting,
  speech,
  history,
  phrasebook,
  alert,
  routing: routerReducer,
  ocr,
  snackbar,
});

export default rootReducer;
