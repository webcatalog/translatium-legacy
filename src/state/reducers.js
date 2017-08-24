import thunkMiddleware from 'redux-thunk';
import { hashHistory } from 'react-router';
import {
  combineReducers,
  createStore,
  applyMiddleware,
} from 'redux';
import {
  routerReducer,
  routerMiddleware,
} from 'react-router-redux';

import alert from './root/alert/reducers';
import screen from './root/screen/reducers';
import settings from './root/settings/reducers';
import snackbar from './root/snackbar/reducers';
import strings from './root/strings/reducers';

import pages from './pages/reducers';

const rootReducer = combineReducers({
  alert,
  pages,
  routing: routerReducer,
  screen,
  settings,
  snackbar,
  strings,
});

const configureStore = (initialState) => {
  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(
      thunkMiddleware,
      routerMiddleware(hashHistory),
    ),
  );

  return store;
};

// init store
const store = configureStore();

export default store;
