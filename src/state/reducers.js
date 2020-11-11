/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import thunkMiddleware from 'redux-thunk';
import {
  combineReducers,
  createStore,
  applyMiddleware,
} from 'redux';

import alert from './root/alert/reducers';
import dialogAbout from './root/dialog-about/reducers';
import general from './root/general/reducers';
import preferences from './root/preferences/reducers';
import router from './root/router/reducers';
import screen from './root/screen/reducers';
import snackbar from './root/snackbar/reducers';
import systemPreferences from './root/system-preferences/reducers';

import pages from './pages/reducers';

import loadListeners from '../listeners';

const rootReducer = combineReducers({
  alert,
  dialogAbout,
  general,
  pages,
  preferences,
  router,
  screen,
  snackbar,
  systemPreferences,
});

const configureStore = (initialState) => {
  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(
      thunkMiddleware,
    ),
  );

  return store;
};

// init store
const store = configureStore();

loadListeners(store);

export default store;
