/* global electronSettings */
import { UPDATE_SETTING } from '../../../constants/actions';

import getDefaultLangId from '../../../helpers/get-default-lang-id';
import getPlaform from '../../../helpers/get-platform';

const shouldUseElectronSettings = (name) => {
  if (name === 'dockAndMenubar' && getPlaform() === 'darwin') return true;
  return false;
};

const defaultState = {
  biggerTextFontSize: 50,
  bigTextFontSize: 50,
  chinaMode: false,
  darkMode: false,
  dockAndMenubar: 'showOnBothDockAndMenubar',
  inputLang: 'en',
  langId: getDefaultLangId(),
  launchCount: 0,
  outputLang: 'zh',
  preventScreenLock: false,
  primaryColorId: 'green',
  realtime: true,
  recentLanguages: ['en', 'zh'],
  translateWhenPressingEnter: true,
};

const getInitialValue = (name) => {
  if (shouldUseElectronSettings(name)) {
    return electronSettings.get(name, defaultState[name]);
  }

  /* global localStorage */
  const localValue = localStorage.getItem(`mt-${name}`);
  if (localValue == null) {
    return defaultState[name];
  }

  return JSON.parse(localValue);
};

const initialState = {};
Object.keys(defaultState).forEach((key) => {
  initialState[key] = getInitialValue(key);
});

const settings = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_SETTING: {
      const { name, value } = action;
      const newState = {};
      newState[name] = action.value;

      if (shouldUseElectronSettings(name)) {
        electronSettings.set(name, value);
      } else {
        localStorage.setItem(`mt-${name}`, JSON.stringify(value));
      }

      return Object.assign({}, state, newState);
    }
    default:
      return state;
  }
};

export default settings;
