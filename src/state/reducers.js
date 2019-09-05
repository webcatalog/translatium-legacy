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
import general from './root/general/reducers';
import preferences from './root/preferences/reducers';
import screen from './root/screen/reducers';
import snackbar from './root/snackbar/reducers';
import locale from './root/locale/reducers';

import pages from './pages/reducers';

import loadListeners from '../listeners';

const rootReducer = combineReducers({
  alert,
  general,
  pages,
  preferences,
  routing: routerReducer,
  screen,
  snackbar,
  locale,
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

loadListeners(store);

export default store;
