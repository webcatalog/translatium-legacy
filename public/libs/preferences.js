const { app, nativeTheme, ipcMain } = require('electron');
const settings = require('electron-settings');

const sendToAllWindows = require('./send-to-all-windows');

const getDefaultRegistered = () => {
  if (!app.isPackaged) return true;

  // only check for license in non Mac App Store distribution or Linux
  if (process.platform === 'darwin' && !process.mas) {
    return false;
  }

  if (process.platform === 'linux') {
    return false;
  }

  // Mac App Store & Windows Store distributions use provided licensing systems
  return true;
};

// scope
const v = '2019';

const defaultPreferences = {
  alwaysOnTop: false,
  attachToMenubar: false,
  clearInputShortcut: 'mod+shift+d',
  inputLang: 'en',
  openOnMenubarShortcut: 'alt+shift+t',
  outputLang: 'zh-CN',
  recentLanguages: ['en', 'zh-CN'],
  registered: getDefaultRegistered(),
  showTransliteration: true,
  themeSource: 'system',
  translateClipboardOnShortcut: false,
  translateWhenPressingEnter: true,
  useHardwareAcceleration: true,
};

let cachedPreferences = null;

const initCachedPreferences = () => {
  // upgrade from v12 from v13
  if (settings.get('preferenceVersion', 0) < 13) {
    settings.delete(`preferences.${v}.inputLang`);
    settings.delete(`preferences.${v}.outputLang`);
    settings.delete(`preferences.${v}.recentLanguages`);
    settings.set('preferenceVersion', 13);
  }

  cachedPreferences = { ...defaultPreferences, ...settings.get(`preferences.${v}`) };
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
