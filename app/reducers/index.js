import { combineReducers } from 'redux';

import { routerReducer } from 'react-router-redux';

import screen from './screen';
import settings from './settings';
import home from './home';
import textToSpeech from './textToSpeech';
import phrasebook from './phrasebook';


const rootReducer = combineReducers({
  screen, settings, home, textToSpeech, phrasebook,
  routing: routerReducer,
});

export default rootReducer;
