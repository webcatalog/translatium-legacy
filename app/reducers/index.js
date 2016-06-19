import { combineReducers } from 'redux';

import { routerReducer } from 'react-router-redux';

import screen from './screen';
import settings from './settings';
import home from './home';

const rootReducer = combineReducers({
  screen, settings, home,
  routing: routerReducer,
});

export default rootReducer;
