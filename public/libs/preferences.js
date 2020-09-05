const { app, nativeTheme, ipcMain } = require('electron');
const settings = require('electron-settings');

const sendToAllWindows = require('./send-to-all-windows');
const displayLanguages = require('./locales/languages');

const shouldSkipLicenseCheck = () => {
  if (!app.isPackaged) return true;

  // skip license check if it is Mac App Store/Microsoft Store distribution
  return (process.windowsStore || process.mas);
};

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

const initCachedPreferences = () => {
  // upgrade from v12 from v13
  if (settings.get('preferenceVersion', 0) < 13) {
    settings.delete(`preferences.${v}.inputLang`);
    settings.delete(`preferences.${v}.outputLang`);
    settings.delete(`preferences.${v}.recentLanguages`);
    settings.set('preferenceVersion', 13);
  }

  const defaultPreferences = {
    alwaysOnTop: false,
    attachToMenubar: false,
    clearInputShortcut: 'mod+shift+d',
    displayLanguage: getDefaultDisplayLanguage(),
    inputLang: 'en',
    openOnMenubarShortcut: 'alt+shift+t',
    outputLang: 'zh-CN',
    ratingCardLastClicked: 0,
    ratingCardDidRate: false,
    recentLanguages: ['en', 'zh-CN'],
    registered: false,
    showTransliteration: true,
    themeSource: 'system',
    translateClipboardOnShortcut: false,
    translateWhenPressingEnter: true,
    useHardwareAcceleration: true,
  };
  cachedPreferences = { ...defaultPreferences, ...settings.get(`preferences.${v}`) };
  // backward compatibility
  // es-ES is renamed to es
  if (cachedPreferences.displayLanguage === 'es-ES') {
    cachedPreferences.displayLanguage = 'es';
  }
  if (shouldSkipLicenseCheck()) {
    cachedPreferences.registered = true;
  }
};

const getPreferences = () => {
  // store in memory to boost performance
  if (cachedPreferences == null) {
    initCachedPreferences();
  }
  return cachedPreferences;
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
  Promise.resolve().then(() => settings.set(`preferences.${v}.${name}`, value));

  if (name === 'openOnMenubarShortcut') {
    ipcMain.emit('unset-show-menubar-shortcut', null, getPreference(name));
    ipcMain.emit('set-show-menubar-shortcut', null, value);
  }

  if (name === 'themeSource') {
    nativeTheme.themeSource = value;
  }
};

const resetPreferences = () => {
  cachedPreferences = null;
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
