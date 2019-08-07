const settings = require('electron-settings');

const sendToAllWindows = require('./send-to-all-windows');

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
};

const getPreferences = () => Object.assign({}, defaultPreferences, settings.get(`preferences.${v}`));

const getPreference = name => settings.get(`preferences.${v}.${name}`) || defaultPreferences[name];

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
