import { combineReducers } from 'redux';

import { routerReducer } from 'react-router-redux';

import screen from './screen';
import home from './home';
import settings from './settings';
import textToSpeech from './textToSpeech';
import handwriting from './handwriting';

const rootReducer = combineReducers({
  screen,
  home,
  settings,
  textToSpeech,
  handwriting,
  routing: routerReducer,
});

export default rootReducer;
