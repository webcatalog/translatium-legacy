const { app, nativeTheme, ipcMain } = require('electron');
const settings = require('electron-settings');

const sendToAllWindows = require('./send-to-all-windows');
const displayLanguages = require('./display-languages');

// Legacy code
// https://github.com/atomery/translatium/blob/v8.6.1/src/helpers/get-default-lang-id.js
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

const getDefaultRegistered = () => {
  if (!app.isPackaged) return true;

  if (process.platform === 'linux') {
    return true; // The app is always free on Linux
  }

  // avoid using process.windowsStore to check as it's buggy
  // see https://github.com/electron/electron/issues/18161
  // the app is only distributed on Windows Store so platform check if sufficient
  if (process.platform === 'win32') {
    return true; // no license check for Windows Store distribution
  }

  if (process.platform === 'darwin') {
    return Boolean(process.mas);
  }

  // Undetected cases
  return false;
};

// scope
const v = '2019';

const defaultPreferences = {
  alwaysOnTop: false,
  attachToMenubar: false,
  clearInputShortcut: 'mod+shift+d',
  inputLang: 'en',
  langId: getDefaultLangId(),
  openOnMenubarShortcut: null,
  outputLang: 'zh',
  realtime: true,
  recentLanguages: ['en', 'zh'],
  registered: getDefaultRegistered(),
  themeSource: 'system',
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

  if (name === 'themeSource') {
    nativeTheme.themeSource = value;
  }
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
