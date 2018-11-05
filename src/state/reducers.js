import thunkMiddleware from 'redux-thunk';
import {
  combineReducers,
  createStore,
  applyMiddleware,
} from 'redux';

import alert from './root/alert/reducers';
import screen from './root/screen/reducers';
import settings from './root/settings/reducers';
import snackbar from './root/snackbar/reducers';
import strings from './root/strings/reducers';
import router from './root/router/reducers';

import pages from './pages/reducers';

const rootReducer = combineReducers({
  alert,
  pages,
  screen,
  settings,
  snackbar,
  strings,
  router,
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

export default store;
