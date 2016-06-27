import { combineReducers } from 'redux';

import { routerReducer } from 'react-router-redux';

import screen from './screen';
import settings from './settings';
import home from './home';
import textToSpeech from './textToSpeech';
import phrasebook from './phrasebook';
import handwriting from './handwriting';
import speechRecognition from './speechRecognition';
import ocr from './ocr';

const rootReducer = combineReducers({
  screen, settings, home,
  textToSpeech, phrasebook, handwriting,
  speechRecognition, ocr,
  routing: routerReducer,
});

export default rootReducer;
