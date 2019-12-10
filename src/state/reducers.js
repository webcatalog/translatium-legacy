import thunkMiddleware from 'redux-thunk';
import {
  combineReducers,
  createStore,
  applyMiddleware,
} from 'redux';

import alert from './root/alert/reducers';
import dialogLicenseRegistration from './root/dialog-license-registration/reducers';
import general from './root/general/reducers';
import preferences from './root/preferences/reducers';
import screen from './root/screen/reducers';
import snackbar from './root/snackbar/reducers';
import locale from './root/locale/reducers';
import router from './root/router/reducers';

import pages from './pages/reducers';

import loadListeners from '../listeners';

const rootReducer = combineReducers({
  alert,
  dialogLicenseRegistration,
  general,
  locale,
  pages,
  preferences,
  router,
  screen,
  snackbar,
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
