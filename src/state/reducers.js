import thunkMiddleware from 'redux-thunk';
import {
  combineReducers,
  createStore,
  applyMiddleware,
} from 'redux';

import alert from './root/alert/reducers';
import dialogAbout from './root/dialog-about/reducers';
import dialogLicenseRegistration from './root/dialog-license-registration/reducers';
import general from './root/general/reducers';
import preferences from './root/preferences/reducers';
import screen from './root/screen/reducers';
import snackbar from './root/snackbar/reducers';
import router from './root/router/reducers';

import pages from './pages/reducers';

import loadListeners from '../listeners';

const rootReducer = combineReducers({
  alert,
  dialogAbout,
  dialogLicenseRegistration,
  general,
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
