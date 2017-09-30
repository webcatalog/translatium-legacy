/* global electronSettings ipcRenderer */
import { UPDATE_SETTING } from '../../../constants/actions';

import getDefaultLangId from '../../../helpers/get-default-lang-id';
import getPlaform from '../../../helpers/get-platform';

const shouldUseElectronSettings = (name) => {
  if (name === 'dockAndMenubar' && getPlaform() === 'electron') return true;
  return false;
};

export const defaultState = {
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

  openInputLangListShortcut: 'mod+shift+i',
  openOutputLangListShortcut: 'mod+shift+o',
  swapLanguagesShortcut: 'mod+shift+s',
  clearInputShortcut: 'mod+shift+d',
  speakShorcut: 'mod+shift+m',
  listenShortcut: 'mod+shift+l',
  drawShortcut: 'mod+shift+w',
  cameraShortcut: 'mod+shift+c',
  openImageFileShortcut: 'mod+o',
  saveToPhrasebookShortcut: 'mod+s',
  openOnMenubarShortcut: 'alt+shift+t',
};

const getInitialValue = (name) => {
  if (shouldUseElectronSettings(name)) {
    return electronSettings.get(`mt3-${name}`, defaultState[name]);
  }

  /* global localStorage */
  const localValue = localStorage.getItem(`mt3-${name}`);
  if (localValue == null) {
    return defaultState[name];
  }

  return JSON.parse(localValue) || defaultState[name];
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
        electronSettings.set(`mt3-${name}`, value);
        if (name === 'dockAndMenubar') {
          ipcRenderer.send('set-show-menubar-shortcut', value);
        }
      } else {
        localStorage.setItem(`mt3-${name}`, JSON.stringify(value));
      }

      return Object.assign({}, state, newState);
    }
    default:
      return state;
  }
};

export default settings;
