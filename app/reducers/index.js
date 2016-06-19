import { combineReducers } from 'redux';

import { routerReducer } from 'react-router-redux';

import screen from './screen';
import settings from './settings';

const rootReducer = combineReducers({
  screen, settings,
  routing: routerReducer,
});

export default rootReducer;
