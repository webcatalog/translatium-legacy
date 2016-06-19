import { combineReducers } from 'redux';

import { routerReducer } from 'react-router-redux';

import screen from './screen';
import settings from './settings';
import home from './home';
import textToSpeech from './textToSpeech';

const rootReducer = combineReducers({
  screen, settings, home, textToSpeech,
  routing: routerReducer,
});

export default rootReducer;
