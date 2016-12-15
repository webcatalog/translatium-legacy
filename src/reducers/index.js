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
});

export default rootReducer;
