const { app } = require('electron');
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

// scope
const v = '2019';

const defaultPreferences = {
  attachToMenubar: false,
  theme: process.platform === 'darwin' ? 'automatic' : 'light',
  inputLang: 'en',
  outputLang: 'zh',
  primaryColorId: 'green',
  realtime: true,
  recentLanguages: ['en', 'zh'],
  translateWhenPressingEnter: true,
  openInputLangListShortcut: 'mod+shift+i',
  openOutputLangListShortcut: 'mod+shift+o',
  swapLanguagesShortcut: 'mod+shift+s',
  clearInputShortcut: 'mod+shift+d',
  openImageFileShortcut: 'mod+o',
  saveToPhrasebookShortcut: 'mod+s',
  langId: getDefaultLangId(),
};

const getPreferences = () => ({ ...defaultPreferences, ...settings.get(`preferences.${v}`) });

const getPreference = (name) => settings.get(`preferences.${v}.${name}`) || defaultPreferences[name];

const setPreference = (name, value) => {
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
