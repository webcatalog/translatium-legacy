/* global electronSettings ipcRenderer */
import { UPDATE_SETTING } from '../../../constants/actions';

import getDefaultLangId from '../../../helpers/get-default-lang-id';
import getPlaform from '../../../helpers/get-platform';

export const defaultState = {
  biggerTextFontSize: 50,
  bigTextFontSize: 50,
  darkMode: false,
  dockAndMenubar: 'showOnBothDockAndMenubar',
  inputLang: 'en',
  langId: getDefaultLangId(),
  outputLang: 'zh',
  preventScreenLock: false,
  primaryColorId: 'green',
  realtime: true,
  recentLanguages: ['en', 'zh'],
  translateWhenPressingEnter: true,
  translateClipboardOnShortcut: false,

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

const shouldUseElectronSettings = (name) => {
  if (getPlaform() === 'electron') {
    if (name === 'dockAndMenubar' || name === 'translateClipboardOnShortcut') {
      return true;
    }
  }
  return false;
};

const getInitialValue = (name) => {
  if (shouldUseElectronSettings(name)) {
    return electronSettings.get(name, defaultState[name]);
  }

  /* global localStorage */
  const localValue = localStorage.getItem(`mt4-${name}`);
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

      if (name === 'openOnMenubarShortcut') {
        ipcRenderer.send('unset-show-menubar-shortcut', state.openOnMenubarShortcut);
        ipcRenderer.send('set-show-menubar-shortcut', value);
      }

      if (shouldUseElectronSettings(name)) {
        electronSettings.set(name, value);
      } else {
        localStorage.setItem(`mt4-${name}`, JSON.stringify(value));
      }

      return Object.assign({}, state, newState);
    }
    default:
      return state;
  }
};

export default settings;
