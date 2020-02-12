const { app, ipcMain } = require('electron');
const settings = require('electron-settings');

const sendToAllWindows = require('./send-to-all-windows');
const displayLanguages = require('./display-languages');

// Legacy code
// https://github.com/quanglam2807/translatium/blob/v8.6.1/src/helpers/get-default-lang-id.js
// strip country code from langId
// en-US => en / vi-vn => vi
const getLanguageCode = (langId) => {
  const parts = langId.toLowerCase().replace('_', '-').split('-');

  return parts[0];
};

const getDefaultLangId = () => {
  const userLanguages = [app.getLocale()];

  let defaultLangId = 'en';

  userLanguages.some((userLang) => {
    let isMatch = false;

    Object.keys(displayLanguages).some((appLang) => {
      isMatch = getLanguageCode(appLang) === getLanguageCode(userLang);

      if (isMatch) {
        defaultLangId = appLang;
      }

      return isMatch;
    });

    return isMatch;
  });

  return defaultLangId;
};

const getRegistered = () => {
  if (!app.isPackaged) return true;
  if (process.env.SNAP == null && !process.mas && !process.windowsStore) {
    if (process.platform === 'linux') {
      return true; // The app is free on Linux
    }
    return false;
  }
  // Always True for store distributions
  return true;
};

// scope
const v = '2019';

const defaultPreferences = {
  registered: getRegistered(),
  alwaysOnTop: false,
  attachToMenubar: false,
  clearInputShortcut: 'mod+shift+d',
  inputLang: 'en',
  langId: getDefaultLangId(),
  openOnMenubarShortcut: null,
  outputLang: 'zh',
  realtime: true,
  recentLanguages: ['en', 'zh'],
  theme: process.platform === 'darwin' ? 'systemDefault' : 'light',
  translateClipboardOnShortcut: false,
  translateWhenPressingEnter: true,
};

const getPreferences = () => ({ ...defaultPreferences, ...settings.get(`preferences.${v}`) });

const getPreference = (name) => {
  if (settings.has(`preferences.${v}.${name}`)) {
    return settings.get(`preferences.${v}.${name}`);
  }
  return defaultPreferences[name];
};

const setPreference = (name, value) => {
  if (name === 'openOnMenubarShortcut') {
    ipcMain.emit('unset-show-menubar-shortcut', null, getPreference(name));
    ipcMain.emit('set-show-menubar-shortcut', null, value);
  }

  settings.set(`preferences.${v}.${name}`, value);
  sendToAllWindows('set-preference', name, value);
};

const resetPreferences = () => {
  settings.deleteAll();

  const preferences = getPreferences();
  Object.keys(preferences).forEach((name) => {
    sendToAllWindows('set-preference', name, preferences[name]);
  });
};

module.exports = {
  getPreference,
  getPreferences,
  resetPreferences,
  setPreference,
};
