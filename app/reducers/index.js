import { combineReducers } from 'redux';

import { routerReducer } from 'react-router-redux';

import screen from './screen';
import settings from './settings';
import home from './home';
import textToSpeech from './textToSpeech';
import phrasebook from './phrasebook';
import handwriting from './handwriting';

const rootReducer = combineReducers({
  screen, settings, home,
  textToSpeech, phrasebook, handwriting,
  routing: routerReducer,
});

export default rootReducer;
