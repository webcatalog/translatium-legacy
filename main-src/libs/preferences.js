/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
const { app, nativeTheme, ipcMain } = require('electron');
const settings = require('electron-settings');

const sendToAllWindows = require('./send-to-all-windows');
const displayLanguages = require('./locales/languages');

const getDefaultDisplayLanguage = () => {
  const appLocale = app.getLocale(); // vi-VN, en-US, etc
  // by default, strip away country code
  // strip away country code to get standardized language code
  // vi-VN -> vi
  const localeParts = appLocale.split('-');
  let langCode = localeParts[0];
  // if locale is 'zh-TW' (traditional chinese), keep it full
  if (appLocale === 'zh-TW') langCode = 'zh-TW';
  // use 'zh-CN' for other `zh` cases
  else if (appLocale.startsWith('zh')) langCode = 'zh-CN';

  // finally check if we have the locale supported
  // if not just use English
  if (Object.keys(displayLanguages).indexOf(langCode) > -1) {
    return langCode;
  }

  return 'en';
};

// scope
const v = '2019';

let cachedPreferences = null;

const defaultPreferences = {
  alwaysOnTop: false,
  attachToMenubar: false,
  clearInputShortcut: 'mod+shift+d',
  displayLanguage: getDefaultDisplayLanguage(),
  inputLang: 'en',
  openOnMenubarShortcut: 'alt+shift+t',
  outputLang: 'zh-CN',
  privacyConsentAsked: false,
  ratingCardDidRate: false,
  ratingCardLastClicked: 0,
  recentLanguages: ['en', 'zh-CN'],
  sentry: false,
  showTransliteration: true,
  telemetry: false,
  themeSource: 'system',
  translateClipboardOnShortcut: false,
  translateWhenPressingEnter: true,
  useHardwareAcceleration: true,
};

const initCachedPreferences = () => {
  // upgrade from v12 from v13
  if (settings.getSync('preferenceVersion', 0) < 13) {
    settings.unsetSync(`preferences.${v}.inputLang`);
    settings.unsetSync(`preferences.${v}.outputLang`);
    settings.unsetSync(`preferences.${v}.recentLanguages`);
    settings.setSync('preferenceVersion', 13);
  }

  cachedPreferences = { ...defaultPreferences, ...settings.getSync(`preferences.${v}`) };
  // backward compatibility
  // es-ES is renamed to es
  if (cachedPreferences.displayLanguage === 'es-ES') {
    cachedPreferences.displayLanguage = 'es';
  }
};

const getPreferences = () => {
  // trigger electron-settings before app ready might fails
  // so catch with default pref as fallback
  // https://github.com/nathanbuchar/electron-settings/issues/111
  try {
    // store in memory to boost performance
    if (cachedPreferences == null) {
      initCachedPreferences();
    }
    return cachedPreferences;
  } catch (_) {
    return defaultPreferences;
  }
};

const getPreference = (name) => {
  // store in memory to boost performance
  if (cachedPreferences == null) {
    initCachedPreferences();
  }
  return cachedPreferences[name];
};

const setPreference = (name, value) => {
  sendToAllWindows('set-preference', name, value);
  cachedPreferences[name] = value;

  if (name === 'openOnMenubarShortcut') {
    ipcMain.emit('unset-show-menubar-shortcut', null, getPreference(name));
    ipcMain.emit('set-show-menubar-shortcut', null, value);
  }

  if (name === 'themeSource') {
    nativeTheme.themeSource = value;
  }

  Promise.resolve().then(() => settings.setSync(`preferences.${v}.${name}`, value));
};

const resetPreference = (name) => {
  const value = defaultPreferences[name];
  sendToAllWindows('set-preference', name, defaultPreferences[name]);
  cachedPreferences[name] = defaultPreferences[name];

  if (name === 'openOnMenubarShortcut') {
    ipcMain.emit('set-show-menubar-shortcut', null, value);
  }

  if (name === 'themeSource') {
    nativeTheme.themeSource = value;
  }

  Promise.resolve().then(() => settings.unsetSync(`preferences.${v}.${name}`));
};

const resetPreferences = () => {
  cachedPreferences = null;
  settings.unsetSync();

  const preferences = getPreferences();
  Object.keys(preferences).forEach((name) => {
    sendToAllWindows('set-preference', name, preferences[name]);
  });
};

module.exports = {
  getPreference,
  getPreferences,
  resetPreference,
  resetPreferences,
  setPreference,
};
