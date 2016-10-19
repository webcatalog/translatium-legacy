import { combineReducers } from 'redux';

import { routerReducer } from 'react-router-redux';

import screen from './screen';

const rootReducer = combineReducers({
  screen,
  routing: routerReducer,
});

export default rootReducer;
